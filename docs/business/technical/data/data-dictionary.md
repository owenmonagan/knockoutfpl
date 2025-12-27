# Data Dictionary

Definitive reference for all data structures. Code types must match this document.

> **Last Updated:** December 2025

**Naming Convention:** All fields use `snake_case` to match Firestore conventions.

---

## Design Principles

1. **Season as root** - All FPL data lives under a season (e.g., `seasons/2025`)
2. **Cache raw API responses** - Store FPL API responses as-is for entries and picks
3. **User is just identity** - No denormalized FPL data on user, just entry references
4. **Subcollections for scale** - Participants, matches as subcollections (supports 100k+ participants)
5. **Compute navigation** - Bracket navigation (next match, source matches) computed via utility functions, not stored

---

## Top-Level Structure

```
users/{uid}                           ← Firebase Auth accounts
seasons/{season_id}                   ← FPL season container (e.g., "2025")
  /entries/{entry_id}                 ← Cached FPL manager data
    /picks/{event}                    ← Cached event/gameweek picks
  /tournaments/{tournament_id}        ← Knockout tournaments
    /participants/{entry_id}          ← Tournament participants
    /matches/{match_id}               ← Individual matches
```

---

## `users` Collection

Firebase Auth user accounts. Minimal - just identity and entry references.

**Path:** `users/{uid}`

```typescript
interface User {
  email: string;

  // Entry references per season (nullable until connected)
  entry_id_2025: number | null;
  // entry_id_2026: number | null;  // future seasons

  created_at: Timestamp;
  updated_at: Timestamp;
}
```

| Field | Type | Description |
|-------|------|-------------|
| `email` | string | From Google Auth |
| `entry_id_2025` | number \| null | FPL entry ID for 2025 season, null until connected |
| `created_at` | Timestamp | First sign-in |
| `updated_at` | Timestamp | Last profile update |

**Why this structure:**
- User doc stays tiny (no FPL data duplication)
- Easy to add new seasons without migration
- Entry ID is the foreign key to all FPL data

---

## `seasons` Collection

Container for all FPL season data.

**Path:** `seasons/{season_id}`

```typescript
interface Season {
  season_id: string;        // e.g., "2025"
  fpl_season_name: string;  // e.g., "2024/25"
  start_date: Timestamp;
  end_date: Timestamp;
  current_event: number;    // Active event/gameweek (1-38)
  is_active: boolean;
}
```

| Field | Type | Description |
|-------|------|-------------|
| `season_id` | string | Year identifier (e.g., "2025") |
| `fpl_season_name` | string | FPL's name (e.g., "2024/25") |
| `current_event` | number | Active event (1-38) |
| `is_active` | boolean | Is this season in progress |

---

## `entries` Subcollection

Cached FPL manager/entry data. Raw API response from `/api/entry/{entry_id}/`.

**Path:** `seasons/{season_id}/entries/{entry_id}`

```typescript
interface Entry {
  // Raw FPL API response fields
  id: number;
  name: string;                    // Team name (e.g., "Smith's Soldiers")
  player_first_name: string;
  player_last_name: string;
  summary_overall_points: number;
  summary_overall_rank: number;
  summary_event_points: number;
  summary_event_rank: number;

  // Our metadata
  cached_at: Timestamp;
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | FPL entry ID |
| `name` | string | FPL team name |
| `player_first_name` | string | Manager's first name |
| `player_last_name` | string | Manager's last name |
| `summary_overall_points` | number | Total season points |
| `summary_overall_rank` | number | Overall rank |
| `cached_at` | Timestamp | When we fetched this |

**Note:** This is the raw FPL API response. We store it as-is and refresh periodically.

---

## `picks` Subcollection

Cached event picks. Raw API response from `/api/entry/{entry_id}/event/{event}/picks/`.

**Path:** `seasons/{season_id}/entries/{entry_id}/picks/{event}`

```typescript
interface Picks {
  // Raw FPL API response
  entry_history: {
    event: number;
    points: number;
    total_points: number;
    rank: number;
    overall_rank: number;
    event_transfers_cost: number;
  };
  picks: Array<{
    element: number;
    position: number;
    multiplier: number;
    is_captain: boolean;
    is_vice_captain: boolean;
  }>;
  active_chip: string | null;

  // Our metadata
  cached_at: Timestamp;
  is_final: boolean;  // True if event is finished
}
```

| Field | Type | Description |
|-------|------|-------------|
| `entry_history.points` | number | Final event points (what we use for scoring) |
| `picks` | array | Selected players |
| `active_chip` | string \| null | Chip used this event |
| `cached_at` | Timestamp | When we fetched this |
| `is_final` | boolean | True if event finished, scores are final |

---

## `tournaments` Subcollection

Knockout tournaments within a season.

**Path:** `seasons/{season_id}/tournaments/{tournament_id}`

```typescript
interface Tournament {
  // League info (snapshot at creation)
  fpl_league_id: number;
  fpl_league_name: string;

  // Creator
  creator_uid: string;        // Firebase Auth UID
  creator_entry_id: number;   // FPL entry ID

  // Seeding
  seeding_method: 'league_rank' | 'random' | 'manual';

  // Timing
  start_event: number;        // First round event (1-38)

  // State
  current_round: number;      // 1-indexed
  total_rounds: number;       // ceil(log2(participants))
  status: 'active' | 'completed';

  // Result
  winner_entry_id: number | null;

  // Timestamps
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

| Field | Type | Description |
|-------|------|-------------|
| `fpl_league_id` | number | Source FPL classic league |
| `fpl_league_name` | string | League name at creation |
| `creator_uid` | string | Firebase Auth UID |
| `creator_entry_id` | number | Creator's FPL entry ID |
| `seeding_method` | enum | How participants are seeded |
| `start_event` | number | First round event |
| `current_round` | number | Active round (1-indexed) |
| `total_rounds` | number | `ceil(log2(participants))` |
| `status` | enum | `'active'` or `'completed'` |
| `winner_entry_id` | number \| null | Champion's entry ID |

**Seeding Methods:**
- `league_rank` - Seed by FPL league standing at creation (rank 1 = seed 1)
- `random` - Random shuffle
- `manual` - Creator assigns seeds (future feature)

---

## `participants` Subcollection

Tournament participants. Snapshot at creation time.

**Path:** `seasons/{season_id}/tournaments/{tournament_id}/participants/{entry_id}`

```typescript
interface Participant {
  entry_id: number;

  // Snapshot from FPL at tournament creation
  team_name: string;
  manager_name: string;       // "First Last"
  seed: number;               // Assigned seed (1 = top)

  // Tournament state
  status: 'active' | 'eliminated' | 'champion';
  current_match_id: string | null;
  elimination_round: number | null;

  // Link to user account (if claimed)
  uid: string | null;
}
```

| Field | Type | Description |
|-------|------|-------------|
| `entry_id` | number | FPL entry ID (document ID) |
| `team_name` | string | FPL team name at creation |
| `manager_name` | string | Manager name at creation |
| `seed` | number | Assigned seed based on seeding_method |
| `status` | enum | Current tournament status |
| `current_match_id` | string \| null | Active match ID |
| `elimination_round` | number \| null | When eliminated |
| `uid` | string \| null | Firebase UID if user claimed this entry |

---

## `matches` Subcollection

Individual knockout matches.

**Path:** `seasons/{season_id}/tournaments/{tournament_id}/matches/{match_id}`

```typescript
interface MatchPlayer {
  entry_id: number;
  name: string;               // Denormalized team name
  seed: number;
  points: number | null;      // Final event points
}

interface Match {
  match_id: string;           // Auto-increment: "1", "2", "3"...
  round: number;              // 1, 2, 3...
  position_in_round: number;  // Position within round (for bracket layout)
  event: number;              // FPL event (1-38)
  status: 'pending' | 'active' | 'complete';

  players: MatchPlayer[];     // 2 for normal match, 1 for bye

  winner_entry_id: number | null;
  is_bye: boolean;

  created_at: Timestamp;
  completed_at: Timestamp | null;
}
```

| Field | Type | Description |
|-------|------|-------------|
| `match_id` | string | Auto-increment within tournament |
| `round` | number | Round number (1 = first round) |
| `position_in_round` | number | 1-16 in round 1, 1-8 in round 2, etc. |
| `event` | number | FPL event this match is played |
| `status` | enum | Match state |
| `players` | array | Match participants (1-2) |
| `winner_entry_id` | number \| null | Winner's entry ID |
| `is_bye` | boolean | True if auto-advance (1 player) |

**Match ID Numbering:**
Matches are numbered sequentially across rounds:
- Round 1: matches 1-16 (for 32-person bracket)
- Round 2: matches 17-24
- Round 3: matches 25-28
- Round 4: matches 29-30
- Final: match 31

---

## Bracket Navigation (Computed)

Navigation between matches is **computed, not stored**. Use utility functions:

```typescript
// Get next match position
function getNextPosition(position_in_round: number): number {
  return Math.ceil(position_in_round / 2);
}

// Get match ID from round and position
function getMatchId(
  round: number,
  position: number,
  total_rounds: number
): number {
  let offset = 0;
  let matchesInRound = Math.pow(2, total_rounds - 1);
  for (let r = 1; r < round; r++) {
    offset += matchesInRound;
    matchesInRound /= 2;
  }
  return offset + position;
}

// Get source matches (who feeds into this match)
function getSourceMatchIds(
  round: number,
  position: number,
  total_rounds: number
): [number, number] | null {
  if (round === 1) return null; // No source for round 1
  const prevRound = round - 1;
  const pos1 = (position - 1) * 2 + 1;
  const pos2 = (position - 1) * 2 + 2;
  return [
    getMatchId(prevRound, pos1, total_rounds),
    getMatchId(prevRound, pos2, total_rounds)
  ];
}
```

**Why computed:**
- Bracket structure is deterministic
- No need to store redundant data
- Easier to reason about

---

## Byes

When participant count isn't a power of 2:

- Create match with `players` array containing 1 entry
- Set `is_bye: true`
- Set `winner_entry_id` immediately to that player
- Byes go to top seeds (seed 1 gets bye if 6 byes needed)

Example: 10 participants in 16-slot bracket
- Seeds 1-6 get byes (6 matches with 1 player each)
- Seeds 7-10 play in round 1 (2 matches with 2 players each)

---

## User Inbox Pattern (Optional)

For fast "find my matches" queries without scanning all tournaments:

**Path:** `users/{uid}/match_refs/{match_id}`

```typescript
interface MatchRef {
  season_id: string;
  tournament_id: string;
  match_id: string;
  round: number;
  event: number;
  status: 'pending' | 'active' | 'complete';
  opponent_name: string;
  result: 'win' | 'loss' | 'pending';
}
```

**Why:** Query `users/{uid}/match_refs` where `status == 'active'` instead of scanning all tournaments.

---

## Match Resolution Rules

1. **Higher score wins** - `entry_history.points` from picks
2. **Tie broken by seed** - Higher seed (lower seed number) advances
3. **BYE auto-advances** - Single player wins immediately

---

## Read Patterns

| Query | Path | Reads |
|-------|------|-------|
| My current match | `users/{uid}/match_refs` where active | 1 query |
| Match details | `matches/{match_id}` | 1 read |
| Opponent's entry | `entries/{entry_id}` | 1 read |
| Their picks this event | `entries/{id}/picks/{event}` | 1 read |
| Navigate to next match | Compute `getMatchId()` → read | 1 read |

---

## Write Patterns

| Operation | Who Writes | Documents Updated |
|-----------|------------|-------------------|
| User signs up | Client | `users/{uid}` |
| Connect FPL | Client | `users/{uid}` (entry_id) |
| Cache entry | Backend | `entries/{entry_id}` |
| Cache picks | Backend | `entries/{id}/picks/{event}` |
| Create tournament | Backend | `tournaments/{id}`, `participants/*`, `matches/*` |
| Score matches | Backend | `matches/{id}`, `participants/{id}`, `match_refs/{id}` |

---

## FPL API → Our Fields

| FPL Endpoint | Our Collection |
|--------------|----------------|
| `/api/entry/{id}/` | `entries/{entry_id}` |
| `/api/entry/{id}/event/{event}/picks/` | `entries/{id}/picks/{event}` |
| `/api/leagues-classic/{id}/standings/` | Used at tournament creation → `participants` |

---

## Related

- [data-flow.md](./data-flow.md) - How data moves through the system
- [../integrations/fpl-api.md](../integrations/fpl-api.md) - FPL API endpoint details
- [../../product/features/](../../product/features/CLAUDE.md) - Feature specifications
