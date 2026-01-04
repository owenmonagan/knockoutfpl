# Plan: Implement `processLeagueImport` Cloud Task

> **Status:** In Progress
> **Created:** 2026-01-03

## Goal

Create a background task for importing large league entries, similar to `processTournamentImport`. This decouples league data (shared) from tournament data (specific).

## Key Decisions

- **Large leagues (>48):** Spawn `processLeagueImport` task from `processTournamentImport`
- **UI status:** Show import progress on Leagues page and tournament creation

## Behavior Matrix

| League Size | On Entry Linking | On Tournament Creation |
|-------------|------------------|------------------------|
| ≤48 entries | Import synchronously via `refreshLeague()` | Reuse existing LeagueEntry |
| >48 entries | Skip (too expensive) | Spawn `processLeagueImport` task |

---

## Architecture

### Task Coordination Pattern

`processTournamentImport` spawns `processLeagueImport` and reschedules itself to poll:

```
processTournamentImport (phase: "importing")
    │
    ├─ Check League.lastRefreshAt < 1 hour?
    │   └─ Yes: Skip to "creating_tournament_entries"
    │
    ├─ Acquire lock on League (importLockId)
    ├─ Spawn processLeagueImport task
    └─ Reschedule self → phase: "awaiting_league_import"

processTournamentImport (phase: "awaiting_league_import")
    │
    ├─ Query League.importStatus
    │   ├─ "complete" → Proceed to "creating_tournament_entries"
    │   ├─ "importing" → Reschedule self (poll every 5s)
    │   └─ "failed" → Mark tournament as failed
```

### Race Condition Handling

Use optimistic locking with `importLockId`:
1. Before spawning task: Acquire lock (atomic UPDATE with stale check)
2. In `processLeagueImport`: Verify lockId before each batch
3. Stale lock detection: If `importStartedAt > 10 min ago`, force re-acquire

---

## Implementation Steps

### Step 1: Schema Changes ✅

**File:** `dataconnect/schema/schema.gql`

Add to `League` table:
```graphql
type League @table(...) {
  # Existing fields...

  # Import tracking (new)
  importStatus: String @col(name: "import_status")      # 'idle' | 'importing' | 'complete' | 'failed'
  importProgress: Int @col(name: "import_progress")     # 0-100
  importLockId: UUID @col(name: "import_lock_id")       # Optimistic lock
  importStartedAt: Timestamp @col(name: "import_started_at")
  importError: String @col(name: "import_error")
}
```

### Step 2: Create `processLeagueImport` Cloud Task ✅

**File:** `functions/src/processLeagueImport.ts` (new)

**Phases:**
| Phase | Progress | Description |
|-------|----------|-------------|
| `fetching_standings` | 0-80% | Fetch pages from FPL API (batched) |
| `cleaning_stale` | 80-100% | Delete old refreshId entries |
| `complete` | 100% | Set importStatus='complete' |

**Configuration:**
```typescript
const FPL_PAGES_PER_BATCH = 10;      // Fetch 10 pages per task invocation
const ENTRIES_PER_BATCH = 500;       // Upsert 500 entries per batch
const RESCHEDULE_DELAY_SECONDS = 2;
```

**Payload:**
```typescript
interface LeagueImportPayload {
  leagueId: number;
  season: string;
  lockId: string;           // For optimistic locking
  phase: LeagueImportPhase;
  cursor: number;           // Current page or offset
  totalCount: number;       // Total entries (known after fetching)
  refreshId: string;        // New refreshId for this import
}
```

### Step 3: Add Helper Functions ✅

**File:** `functions/src/leagueRefresh.ts`

Added:
- `isSmallLeague(leagueId)` - Quick check if ≤48 entries
- `getLeagueImportStatus(leagueId, season)` - Get import progress

### Step 4: Update `processTournamentImport`

**File:** `functions/src/processTournamentImport.ts`

1. Add new phase type:
```typescript
type ImportPhase =
  | 'pending'
  | 'importing'
  | 'awaiting_league_import'  // NEW
  | 'creating_tournament_entries'
  // ...rest
```

2. Modify `processImportingPhase()` to check for existing data or spawn league import

3. Add `processAwaitingLeagueImportPhase()` to poll for completion

### Step 5: Create Entry Linking Function

**File:** `functions/src/importUserLeagues.ts` (new)

```typescript
export const importUserLeagues = onCall(async (request) => {
  const { entryId } = request.data;
  const season = getCurrentSeason();

  const leagues = await fetchUserMiniLeagues(entryId);

  for (const league of leagues) {
    if (league.id < 336) continue; // Skip system leagues

    const status = await getLeagueRefreshStatus(league.id, season);
    if (status?.lastRefreshId) continue; // Already imported

    const small = await isSmallLeague(league.id);
    if (small) {
      await refreshLeague(league.id, season);
    }
    // Large leagues skipped - imported on tournament creation
  }
});
```

### Step 6: Frontend - League Import Status

**File:** `src/services/league.ts` (new)

```typescript
export interface LeagueImportStatus {
  leagueId: number;
  name: string;
  entriesCount: number | null;
  importStatus: 'idle' | 'importing' | 'complete' | 'failed' | null;
  importProgress: number | null;
  lastRefreshAt: Date | null;
}

export async function getLeagueImportStatus(leagueId: number): Promise<LeagueImportStatus | null>
```

**File:** `src/components/tournament/CreationProgressChecklist.tsx`

Add step:
```typescript
const LARGE_TOURNAMENT_STEPS = [
  { id: 'pending', label: 'Initializing import...' },
  { id: 'awaiting_league_import', label: 'Importing league data from FPL' },  // NEW
  { id: 'importing', label: 'Importing players from FPL' },
  // ...rest
];
```

### Step 7: Export Functions

**File:** `functions/src/index.ts`

```typescript
export { processLeagueImport } from './processLeagueImport';
export { importUserLeagues } from './importUserLeagues';
```

---

## Files Summary

| File | Action | Status |
|------|--------|--------|
| `dataconnect/schema/schema.gql` | Add League import tracking fields | ✅ Done |
| `functions/src/processLeagueImport.ts` | Create (new Cloud Task) | ✅ Done |
| `functions/src/leagueRefresh.ts` | Add `isSmallLeague()`, status helpers | ✅ Done |
| `functions/src/processTournamentImport.ts` | Add `awaiting_league_import` phase | Pending |
| `functions/src/importUserLeagues.ts` | Create (new callable) | Pending |
| `functions/src/index.ts` | Export new functions | Pending |
| `dataconnect/connector/queries.gql` | Add GetLeagueImportStatus query | Pending |
| `src/services/league.ts` | Create (new service) | Pending |
| `src/components/tournament/CreationProgressChecklist.tsx` | Add league import step | Pending |

---

## Sequence Diagram

```
Tournament Creation                processLeagueImport              League Table
        │                                   │                            │
        ├── Check League freshness ─────────────────────────────────────>│
        │<─ Stale/Missing ──────────────────────────────────────────────-│
        │                                   │                            │
        ├── Acquire Lock ───────────────────────────────────────────────>│
        ├── Spawn processLeagueImport ──────>│                           │
        ├── Reschedule (awaiting_league_import)                          │
        │                                   │                            │
        │                                   ├── Fetch FPL pages ────────>│
        │                                   ├── Update progress 20% ────>│
        ├── Poll: importStatus=importing    │                            │
        ├── Reschedule (poll again)         │                            │
        │                                   ├── Update progress 60% ────>│
        ├── Poll: importStatus=importing    │                            │
        ├── Reschedule (poll again)         │                            │
        │                                   ├── Complete ───────────────>│
        │                                   │                            │
        ├── Poll: importStatus=complete ────────────────────────────────>│
        ├── Proceed to creating_tournament_entries                       │
        │                                                                │
```
