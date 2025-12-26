# Data Dictionary

> **Status:** DRAFT - needs verification against actual Firestore schema
> **Last Updated:** December 2025

---

## Collections Overview

| Collection | Description | Document ID |
|------------|-------------|-------------|
| `users` | User accounts and FPL connections | Firebase Auth UID |
| `tournaments` | Tournament structure and matches | Auto-generated |

---

## `users` Collection (DRAFT)

<!-- TODO: Verify against src/types/user.ts and Firestore -->

### Document Structure

```typescript
interface User {
  userId: string;              // Firebase Auth UID (document ID)
  email: string;               // User's email
  displayName: string;         // Display name

  // FPL Connection
  fplTeamId: number | null;    // FPL Team ID (e.g., 158256)
  fplTeamName: string | null;  // Cached from FPL API

  // Stats (DEPRECATED - from challenge system)
  wins: number;                // TODO: Remove
  losses: number;              // TODO: Remove

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | string | Yes | Firebase Auth UID, used as document ID |
| `email` | string | Yes | User's email address |
| `displayName` | string | Yes | User-chosen display name |
| `fplTeamId` | number | No | FPL Team ID, null until connected |
| `fplTeamName` | string | No | Cached team name from FPL API |
| `wins` | number | Yes | DEPRECATED: Legacy challenge wins |
| `losses` | number | Yes | DEPRECATED: Legacy challenge losses |
| `createdAt` | Timestamp | Yes | Account creation time |
| `updatedAt` | Timestamp | Yes | Last profile update |

### Indexes

<!-- TODO: Verify indexes in firestore.indexes.json -->

| Fields | Purpose |
|--------|---------|
| `fplTeamId` | Quick lookup for FPL team validation |

---

## `tournaments` Collection (DRAFT)

<!-- TODO: Verify against src/types/tournament.ts and implementation -->

### Document Structure

```typescript
interface Tournament {
  tournamentId: string;           // Document ID

  // League Info
  fplLeagueId: number;            // FPL mini-league ID
  fplLeagueName: string;          // Cached at creation

  // Creator
  creatorUserId: string;          // Firebase Auth UID
  creatorFplId: number;

  // Tournament State
  startGameweek: number;          // First round gameweek
  currentRound: number;           // Active round (1-indexed)
  status: 'pending' | 'active' | 'completed';

  // Structure
  participants: TournamentParticipant[];
  rounds: TournamentRound[];

  // Results
  winnerFplId: number | null;

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt: Timestamp | null;
}
```

### Embedded: TournamentParticipant

```typescript
interface TournamentParticipant {
  fplTeamId: number;
  fplTeamName: string;
  managerName: string;
  seed: number;                   // 1 = top seed
  initialLeagueRank: number;
}
```

### Embedded: TournamentRound

```typescript
interface TournamentRound {
  roundNumber: number;
  roundName: string;              // "Quarter-Finals", etc.
  gameweek: number;
  matches: TournamentMatch[];
  isComplete: boolean;
}
```

### Embedded: TournamentMatch

```typescript
interface TournamentMatch {
  matchId: string;

  // Participants
  participant1FplId: number | null;
  participant1Seed: number | null;
  participant1Score: number | null;

  participant2FplId: number | null;  // null = BYE
  participant2Seed: number | null;
  participant2Score: number | null;

  // Result
  winnerFplId: number | null;
  isBye: boolean;
  tiebreakReason: 'higher_rank' | 'random' | null;
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `tournamentId` | string | Yes | Auto-generated document ID |
| `fplLeagueId` | number | Yes | Source FPL mini-league |
| `fplLeagueName` | string | Yes | Cached league name |
| `creatorUserId` | string | Yes | User who created tournament |
| `startGameweek` | number | Yes | First round GW (1-38) |
| `currentRound` | number | Yes | Active round number |
| `status` | enum | Yes | pending/active/completed |
| `participants` | array | Yes | All tournament participants |
| `rounds` | array | Yes | All rounds and matches |
| `winnerFplId` | number | No | Champion's FPL ID |
| `createdAt` | Timestamp | Yes | Tournament creation time |
| `completedAt` | Timestamp | No | When champion determined |

### Indexes

<!-- TODO: Define needed indexes -->

| Fields | Purpose |
|--------|---------|
| `creatorUserId`, `status` | User's tournaments query |
| `status`, `currentRound` | Active tournaments query |
| <!-- TODO --> | <!-- TODO --> |

---

## What We Store vs. Fetch (DRAFT)

<!-- TODO: Verify caching strategy -->

| Data | Store | Fetch | Why |
|------|-------|-------|-----|
| Tournament structure | ✓ | | Core app state |
| Participants (snapshot) | ✓ | | Fixed at creation |
| Seeds | ✓ | | Fixed at creation |
| Match winners | ✓ | | Permanent record |
| Gameweek scores | | ✓ | Changes until GW ends |
| User's mini-leagues | | ✓ | Can change |
| Current gameweek | | ✓ | Real-time from FPL |

---

## Security Rules (DRAFT)

<!-- TODO: Verify against firestore.rules -->

### Users Collection

```
- User can read their own document
- User can create their own document (on signup)
- User can update their own document
- Users cannot read other users' documents
```

### Tournaments Collection

```
- Authenticated users can read any tournament (public)
- User can create tournament (if league member)
- Only Cloud Functions can update scores
- Only creator can delete (if pending status)
```

---

## Related

- [data-flow.md](./data-flow.md) - How data moves
- [../integrations/fpl-api.md](../integrations/fpl-api.md) - External data source
- [../../product/specs/functional-spec.md](../../product/specs/functional-spec.md) - Business rules
