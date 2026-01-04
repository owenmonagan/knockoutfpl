# League Entry Schema Migration Plan

> **Goal:** Replace per-tournament league storage with shared league/entry model

## Overview

### Current Schema (Remove)
```
Entry ←── Participant ←── ParticipantLeague
              ↑
          Tournament
```

### Target Schema
```
Entry ←── LeagueEntry ←── League
  ↑
TournamentEntry
  ↑
Tournament
```

### Key Changes
1. `Participant` → `TournamentEntry` (slimmer, no team/manager names)
2. `ParticipantLeague` → `LeagueEntry` (shared across tournaments)
3. `League` gets refresh tracking fields
4. System leagues (id < 336) filtered at query time

---

## Phase 1: Schema Changes

### Task 1.1: Update League table
**File:** `dataconnect/schema/schema.gql`

Add refresh tracking to existing League table:
```gql
type League @table(name: "leagues", key: ["leagueId", "season"]) {
  leagueId: Int! @col(name: "league_id")
  season: String!
  name: String!

  # New fields
  entriesCount: Int @col(name: "entries_count")
  lastRefreshId: UUID @col(name: "last_refresh_id")
  lastRefreshAt: Timestamp @col(name: "last_refresh_at")

  # Existing
  created: Timestamp
  adminEntry: Int @col(name: "admin_entry")
  rawJson: String! @col(name: "raw_json")
  cachedAt: Timestamp! @col(name: "cached_at") @default(expr: "request.time")
}
```

### Task 1.2: Create LeagueEntry table
**File:** `dataconnect/schema/schema.gql`

```gql
# Entry's membership in a league (1 row per entry × league, shared across tournaments)
type LeagueEntry @table(name: "league_entries", key: ["leagueId", "entryId", "season"]) {
  leagueId: Int! @col(name: "league_id")
  entryId: Int! @col(name: "entry_id")
  season: String!

  # Refresh tracking
  refreshId: UUID! @col(name: "refresh_id")
  rank: Int

  # Relations
  entry: Entry!
}
```

### Task 1.3: Create TournamentEntry table
**File:** `dataconnect/schema/schema.gql`

```gql
# Entry's participation in a tournament (slim junction table)
type TournamentEntry @table(name: "tournament_entries", key: ["tournamentId", "entryId"]) {
  tournamentId: UUID! @col(name: "tournament_id")
  entryId: Int! @col(name: "entry_id")

  seed: Int!
  refreshId: UUID! @col(name: "refresh_id")  # Which league refresh seeded this

  # Tournament state
  status: String! @default(value: "active")
  eliminationRound: Int @col(name: "elimination_round")
  uid: String  # Firebase UID if user claimed this entry

  # Relations
  tournament: Tournament!
  entry: Entry!
  user: User
}
```

### Task 1.4: Mark old tables for removal
**File:** `dataconnect/schema/schema.gql`

Add deprecation comments (remove after migration complete):
```gql
# @deprecated - Use TournamentEntry instead. Remove after migration.
type Participant { ... }

# @deprecated - Use LeagueEntry instead. Remove after migration.
type ParticipantLeague { ... }
```

---

## Phase 2: DataConnect Queries & Mutations

### Task 2.1: League refresh queries
**File:** `dataconnect/connector/queries.gql`

```gql
# Check if league needs refresh
query GetLeagueRefreshStatus($leagueId: Int!, $season: String!) @auth(level: PUBLIC) {
  league(key: { leagueId: $leagueId, season: $season }) {
    leagueId
    name
    entriesCount
    lastRefreshId
    lastRefreshAt
  }
}

# Get all entries for a league
query GetLeagueEntries($leagueId: Int!, $season: String!) @auth(level: PUBLIC) {
  leagueEntries(
    where: { leagueId: { eq: $leagueId }, season: { eq: $season } }
    orderBy: [{ rank: ASC }]
  ) {
    entryId
    rank
    refreshId
    entry {
      name
      playerFirstName
      playerLastName
    }
  }
}
```

### Task 2.2: League refresh mutations
**File:** `dataconnect/connector/mutations.gql`

```gql
# Upsert league with refresh tracking
mutation UpsertLeague(
  $leagueId: Int!,
  $season: String!,
  $name: String!,
  $entriesCount: Int!,
  $refreshId: UUID!,
  $rawJson: String!
) @auth(level: PUBLIC) {
  league_upsert(data: {
    leagueId: $leagueId,
    season: $season,
    name: $name,
    entriesCount: $entriesCount,
    lastRefreshId: $refreshId,
    lastRefreshAt_expr: "request.time",
    rawJson: $rawJson,
    cachedAt_expr: "request.time"
  })
}

# Batch upsert league entries
mutation UpsertLeagueEntriesBatch($entries: [LeagueEntry_Data!]!) @auth(level: PUBLIC) {
  leagueEntry_upsertMany(data: $entries)
}

# Delete stale league entries (from old refresh)
mutation DeleteStaleLeagueEntries(
  $leagueId: Int!,
  $season: String!,
  $currentRefreshId: UUID!
) @auth(level: PUBLIC) {
  leagueEntry_deleteMany(
    where: {
      leagueId: { eq: $leagueId },
      season: { eq: $season },
      refreshId: { ne: $currentRefreshId }
    }
  )
}
```

### Task 2.3: TournamentEntry queries
**File:** `dataconnect/connector/queries.gql`

```gql
# Get tournament entries with entry details
query GetTournamentEntries($tournamentId: UUID!) @auth(level: PUBLIC) {
  tournamentEntries(
    where: { tournamentId: { eq: $tournamentId } }
    orderBy: [{ seed: ASC }]
  ) {
    entryId
    seed
    status
    eliminationRound
    uid
    entry {
      name
      playerFirstName
      playerLastName
      summaryOverallPoints
    }
  }
}

# Get tournament entry for specific user
query GetUserTournamentEntry($tournamentId: UUID!, $entryId: Int!) @auth(level: PUBLIC) {
  tournamentEntry(key: { tournamentId: $tournamentId, entryId: $entryId }) {
    entryId
    seed
    status
    eliminationRound
  }
}
```

### Task 2.4: Friends query (the payoff)
**File:** `dataconnect/connector/queries.gql`

```gql
# Find friends: entries sharing leagues with user (excluding tournament league and system leagues)
query GetFriendsInTournament(
  $tournamentId: UUID!,
  $userEntryId: Int!,
  $tournamentLeagueId: Int!,
  $season: String!
) @auth(level: PUBLIC) {
  # Get user's league memberships
  userLeagues: leagueEntries(
    where: {
      entryId: { eq: $userEntryId },
      season: { eq: $season },
      leagueId: { ge: 336 }  # Exclude system leagues
    }
  ) {
    leagueId
  }

  # Get tournament participants
  tournamentEntries(where: { tournamentId: { eq: $tournamentId } }) {
    entryId
    seed
    status
    entry {
      name
      playerFirstName
      playerLastName
    }
  }

  # Get all league entries for tournament participants (for cross-reference in app)
  # Filter: leagueId >= 336, exclude tournament league
  # App-side: match against userLeagues to find shared leagues
}
```

> **Note:** Complex aggregation (COUNT shared leagues) may need to happen in Cloud Function or app-side due to GraphQL limitations.

---

## Phase 3: Cloud Functions

### Task 3.1: Create league refresh service
**File:** `functions/src/leagueRefresh.ts`

```typescript
interface RefreshResult {
  refreshId: string;
  entriesCount: number;
  entriesUpdated: number;
}

/**
 * Refresh a league's entries.
 *
 * Logic:
 * 1. Fetch league standings from FPL API
 * 2. Generate new refreshId
 * 3. Upsert all entries with new refreshId
 * 4. Delete entries with old refreshId (left the league)
 * 5. Update league metadata
 */
export async function refreshLeague(
  leagueId: number,
  season: string
): Promise<RefreshResult> {
  // Implementation
}

/**
 * Check if league needs refresh.
 *
 * Rules:
 * - Not stored locally → needs refresh
 * - entriesCount changed → needs refresh
 * - Small league (≤50) checked on every app refresh
 * - Large league (>50) only checked on tournament creation
 */
export async function shouldRefreshLeague(
  leagueId: number,
  season: string,
  context: 'app_refresh' | 'tournament_creation'
): Promise<boolean> {
  // Implementation
}
```

### Task 3.2: Update tournament creation
**File:** `functions/src/createTournament.ts`

Replace participant creation with:
1. Refresh league if needed (using new refresh service)
2. Create TournamentEntry records from LeagueEntry data
3. Remove all Participant/ParticipantLeague logic

Key changes:
```typescript
// OLD
await createParticipantsBatch(participants, authClaims);

// NEW
await createTournamentEntriesBatch(
  tournamentId,
  leagueId,
  season,
  refreshId,
  authClaims
);
```

### Task 3.3: Update background import
**File:** `functions/src/processTournamentImport.ts`

Update phases:
1. `importing` → Populates LeagueEntry (shared)
2. `creating_tournament_entries` → Creates TournamentEntry from LeagueEntry
3. Rest unchanged

### Task 3.4: Create friends service
**File:** `functions/src/friends.ts`

```typescript
interface FriendMatch {
  entryId: number;
  teamName: string;
  managerName: string;
  sharedLeagueCount: number;
  sharedLeagueNames: string[];
}

/**
 * Find friends in tournament.
 * Uses LeagueEntry to find shared leagues.
 */
export async function getFriendsInTournament(
  tournamentId: string,
  tournamentLeagueId: number,
  userEntryId: number,
  season: string
): Promise<FriendMatch[]> {
  // 1. Get user's leagues from LeagueEntry (where leagueId >= 336)
  // 2. Get tournament participants from TournamentEntry
  // 3. For each participant, check LeagueEntry for shared leagues
  // 4. Exclude tournament league from shared count
  // 5. Return sorted by sharedLeagueCount desc
}
```

---

## Phase 4: Frontend Updates

### Task 4.1: Update types
**File:** `src/types/tournament.ts`

```typescript
// OLD
export interface Participant {
  fplTeamId: number;
  fplTeamName: string;
  managerName: string;
  seed: number;
  // ...
}

// NEW
export interface TournamentEntry {
  entryId: number;
  seed: number;
  status: 'active' | 'eliminated';
  eliminationRound?: number;
  // Entry details fetched via relation
  entry: {
    name: string;
    playerFirstName: string;
    playerLastName: string;
  };
}
```

### Task 4.2: Update services
**Files:**
- `src/services/tournament.ts` - Use TournamentEntry queries
- `src/services/friends.ts` - Use new friends query/service

### Task 4.3: Update components
**Files:**
- `src/components/tournament/TournamentView.tsx`
- `src/components/tournament/tabs/ParticipantsTab.tsx`
- `src/components/tournament/FriendsActivity.tsx`
- Any component using `Participant` type

### Task 4.4: Update hooks
**File:** `src/hooks/useTournamentFriends.ts`

Update to use new friends service that queries LeagueEntry.

---

## Phase 5: Data Migration

### Task 5.1: Migration script
**File:** `functions/src/migrations/migrateToLeagueEntries.ts`

```typescript
/**
 * One-time migration:
 * 1. For each existing Tournament
 * 2. Fetch league entries from FPL API
 * 3. Populate LeagueEntry table
 * 4. Create TournamentEntry from Participant
 * 5. Verify data integrity
 */
export async function migrateToLeagueEntries() {
  // Implementation
}
```

### Task 5.2: Verification queries
Verify migration success:
- All tournaments have matching TournamentEntry count
- LeagueEntry populated for all tournament leagues
- Friends queries return expected results

---

## Phase 6: Cleanup

### Task 6.1: Remove deprecated tables
After migration verified:
1. Remove `Participant` table from schema
2. Remove `ParticipantLeague` table from schema
3. Remove old queries/mutations
4. Remove old service functions

### Task 6.2: Update tests
Update all tests referencing old types/tables.

---

## Implementation Order

```
Phase 1 (Schema)     ████████░░░░░░░░░░░░  Day 1
Phase 2 (Queries)    ░░░░████████░░░░░░░░  Day 1-2
Phase 3 (Functions)  ░░░░░░░░████████░░░░  Day 2-3
Phase 4 (Frontend)   ░░░░░░░░░░░░████████  Day 3-4
Phase 5 (Migration)  ░░░░░░░░░░░░░░░░████  Day 4
Phase 6 (Cleanup)    ░░░░░░░░░░░░░░░░░░██  Day 5
```

## Rollback Plan

If issues discovered:
1. Frontend can fall back to Participant queries (keep both during migration)
2. TournamentEntry and Participant can coexist temporarily
3. LeagueEntry is additive - doesn't break existing functionality

## Success Criteria

- [ ] Friends feature works using LeagueEntry
- [ ] No per-tournament league duplication
- [ ] League refresh logic works (small vs large leagues)
- [ ] System leagues (id < 336) properly excluded
- [ ] All existing tournaments still function
- [ ] Tests pass
