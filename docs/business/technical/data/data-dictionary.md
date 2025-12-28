# Data Dictionary

Definitive reference for all data structures. Code types must match this document.

> **Last Updated:** December 2025

**Database:** Cloud SQL PostgreSQL via Firebase Data Connect

**Naming Convention:** All columns use `snake_case`. GraphQL fields use `camelCase` (mapped via `@col`).

---

## Design Principles

1. **PostgreSQL-first** - Use relational power: JOINs, indexes, bulk operations
2. **Cache raw API responses** - Store FPL API responses as-is for entries and picks
3. **User is just identity** - No denormalized FPL data on user, just entry references
4. **Compute navigation** - Bracket navigation computed via functions, not stored
5. **Bulk operations in SQL** - Round advancement, scoring in single queries
6. **Data Connect for app queries** - GraphQL for type-safe frontend access
7. **Cloud Functions for bulk ops** - Raw SQL for million-row updates
8. **Defer unused tables** - Only create tables when features need them

---

## Tables Summary

**10 tables total:**

| Layer | Tables | Purpose |
|-------|--------|---------|
| FPL Cache (2) | `events`, `leagues` | Cache FPL API data (can re-fetch) |
| FPL Records (2) | `entries`, `picks` | Authoritative records for result verification |
| User (1) | `users` | Firebase Auth accounts |
| Tournament (5) | `tournaments`, `rounds`, `participants`, `matches`, `match_picks` | Tournament structure |

**Cache vs Records:**
- **Cache** (`events`, `leagues`) - Performance optimization. Can delete and re-fetch from FPL API.
- **Records** (`entries`, `picks`) - Authoritative source of truth. Used to verify and audit tournament results. Must be retained even if FPL API changes or becomes unavailable.

**Deferred (add when needed):**
- `players` - Individual FPL player data (for "who scored" features)
- `teams` - Premier League team data (for team-based filtering)

---

## Schema Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  FPL CACHE  (can re-fetch)     │  FPL RECORDS  (authoritative)  │
│                                │                                │
│  ┌──────────┐  ┌──────────┐   │   ┌──────────┐   ┌──────────┐  │
│  │  events  │  │ leagues  │   │   │ entries  │──▶│  picks   │  │
│  └────┬─────┘  └──────────┘   │   └────┬─────┘   └────┬─────┘  │
│       │                        │        │              │        │
└───────┼────────────────────────┴────────┼──────────────┼────────┘
        │ event                           │ entry_id     │ (entry_id, event)
        │                                 │              │
┌───────┼─────────────────────────────────┼──────────────┼────────┐
│       │  USER LAYER                     │              │        │
│       │                                 │              │        │
│       │  ┌──────────┐  entry_id_2025   │              │        │
│       │  │  users   │──────────────────┘              │        │
│       │  └────┬─────┘                                 │        │
│       │       │ creator_uid                           │        │
└───────┼───────┼───────────────────────────────────────┼────────┘
        │       │                                       │
┌───────┼───────┼───────────────────────────────────────┼────────┐
│       │       │  TOURNAMENT LAYER                     │        │
│       │       │                                       │        │
│       │       ▼                                       │        │
│       │  ┌────────────┐     ┌──────────────┐         │        │
│       │  │tournaments │────▶│ participants │         │        │
│       │  └─────┬──────┘     └──────┬───────┘         │        │
│       │        │                   │ entry_id ───────┼────────│
│       │        │                   │                 │        │
│       │        ▼                   │                 │        │
│       │  ┌────────────┐            │                 │        │
│       └─▶│   rounds   │            │                 │        │
│          └─────┬──────┘            │                 │        │
│                │                   ▼                 │        │
│                ▼            ┌─────────────┐          │        │
│          ┌────────────┐◀────│ match_picks │──────────┘        │
│          │  matches   │     └─────────────┘                   │
│          │            │◀─┐   (gets score from picks           │
│          └────────────┘  │    via entry_id + round.event)     │
│                          │                                    │
│                qualifies_to (self-reference)                  │
└───────────────────────────────────────────────────────────────┘
```

  users.entry_id_2025           → entries.entry_id         (user's FPL team)
  tournaments.creator_uid       → users.uid                (who created it)
  participants.entry_id         → entries.entry_id         (participant's FPL team)
  rounds.tournament_id          → tournaments.id           (tournament's rounds)
  rounds.event                  → events.event             (which gameweek)
  matches.round                 → rounds.round_number      (which round)
  matches.qualifies_to          → matches.match_id         (winner advances to)
  matches.winner_entry_id       → entries.entry_id         (match winner)
  match_picks.match_id          → matches.match_id         (which match)
  match_picks.entry_id          → participants.entry_id    (which player)
  match_picks.(entry,round.event) → picks.(entry_id,event) (score for this match)

---

## `users` Table

Firebase Auth user accounts. Minimal - just identity and entry references.

```sql
CREATE TABLE users (
  uid TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  entry_id_2025 INT,
  -- entry_id_2026 INT,  -- future seasons
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_entry ON users(entry_id_2025) WHERE entry_id_2025 IS NOT NULL;
```

**GraphQL Schema:**

```graphql
type User @table {
  uid: String! @primary
  email: String!
  entryId2025: Int @col(name: "entry_id_2025")
  createdAt: DateTime! @default(expr: "now()")
  updatedAt: DateTime! @default(expr: "now()")
}
```

| Column | Type | Description |
|--------|------|-------------|
| `uid` | TEXT | Firebase Auth UID (primary key) |
| `email` | TEXT | From Firebase Auth |
| `entry_id_2025` | INT | FPL entry ID for 2025 season, null until connected |
| `created_at` | TIMESTAMPTZ | First sign-in |
| `updated_at` | TIMESTAMPTZ | Last profile update |

**Why this structure:**
- User row stays tiny (no FPL data duplication)
- Easy to add new seasons without migration
- Entry ID is the foreign key to all FPL data

---

## `entries` Table

Cached FPL manager/entry data. Stores raw API response from `/api/entry/{entry_id}/` plus extracted fields.

```sql
CREATE TABLE entries (
  entry_id INT PRIMARY KEY,
  season TEXT NOT NULL,

  -- Extracted fields (indexed, commonly queried)
  name TEXT NOT NULL,
  player_first_name TEXT,
  player_last_name TEXT,
  summary_overall_points INT,
  summary_overall_rank INT,
  summary_event_points INT,
  summary_event_rank INT,

  -- Raw API response (complete data, future-proof)
  raw_json JSONB NOT NULL,

  cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_entries_season ON entries(season);
CREATE INDEX idx_entries_rank ON entries(summary_overall_rank) WHERE summary_overall_rank IS NOT NULL;
```

**GraphQL Schema:**

```graphql
type Entry @table {
  entryId: Int! @col(name: "entry_id") @primary
  season: String!
  name: String!
  playerFirstName: String @col(name: "player_first_name")
  playerLastName: String @col(name: "player_last_name")
  summaryOverallPoints: Int @col(name: "summary_overall_points")
  summaryOverallRank: Int @col(name: "summary_overall_rank")
  rawJson: Any! @col(name: "raw_json")
  cachedAt: DateTime! @col(name: "cached_at") @default(expr: "now()")
}
```

| Column | Type | Description |
|--------|------|-------------|
| `entry_id` | INT | FPL entry ID (primary key) |
| `season` | TEXT | Season identifier (e.g., "2025") |
| `name` | TEXT | FPL team name |
| `player_first_name` | TEXT | Manager's first name |
| `player_last_name` | TEXT | Manager's last name |
| `summary_overall_points` | INT | Total season points |
| `summary_overall_rank` | INT | Overall rank |
| `raw_json` | JSONB | Complete FPL API response |
| `cached_at` | TIMESTAMPTZ | When we fetched this |

**Raw JSON Structure** (from `/api/entry/{id}/`):

```json
{
  "id": 123456,
  "joined_time": "2024-07-15T10:30:00Z",
  "started_event": 1,
  "favourite_team": 14,
  "player_first_name": "John",
  "player_last_name": "Smith",
  "player_region_id": 225,
  "player_region_name": "England",
  "player_region_iso_code_short": "EN",
  "player_region_iso_code_long": "ENG",
  "summary_overall_points": 1847,
  "summary_overall_rank": 125000,
  "summary_event_points": 67,
  "summary_event_rank": 2500000,
  "current_event": 18,
  "leagues": { ... },
  "name": "Smith's Soldiers",
  "name_change_blocked": false,
  "kit": { ... },
  "last_deadline_bank": 15,
  "last_deadline_value": 1002,
  "last_deadline_total_transfers": 12
}
```

**Querying JSONB:**

```sql
-- Get favourite team
SELECT raw_json->>'favourite_team' FROM entries WHERE entry_id = 123;

-- Find all entries from England
SELECT * FROM entries WHERE raw_json->>'player_region_name' = 'England';

-- Get bank value (in 0.1m units)
SELECT raw_json->'last_deadline_bank' as bank FROM entries WHERE entry_id = 123;
```

---

## `picks` Table

Cached event picks. Stores raw API response from `/api/entry/{entry_id}/event/{event}/picks/` plus extracted fields.

```sql
CREATE TABLE picks (
  entry_id INT NOT NULL REFERENCES entries(entry_id),
  event INT NOT NULL,

  -- Extracted fields (indexed, commonly queried)
  points INT NOT NULL,
  total_points INT,
  rank INT,
  overall_rank INT,
  event_transfers_cost INT DEFAULT 0,
  active_chip TEXT,

  -- Raw API response (complete data, future-proof)
  raw_json JSONB NOT NULL,

  is_final BOOLEAN NOT NULL DEFAULT FALSE,
  cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (entry_id, event)
);

CREATE INDEX idx_picks_event_final ON picks(event, is_final);
CREATE INDEX idx_picks_points ON picks(event, points) WHERE is_final = true;
```

**GraphQL Schema:**

```graphql
type Pick @table(name: "picks", key: ["entryId", "event"]) {
  entryId: Int! @col(name: "entry_id")
  event: Int!
  points: Int!
  totalPoints: Int @col(name: "total_points")
  rank: Int
  overallRank: Int @col(name: "overall_rank")
  activeChip: String @col(name: "active_chip")
  rawJson: Any! @col(name: "raw_json")
  isFinal: Boolean! @col(name: "is_final") @default(value: false)
  cachedAt: DateTime! @col(name: "cached_at") @default(expr: "now()")

  entry: Entry! @relation(fields: [entryId], references: [entryId])
}
```

| Column | Type | Description |
|--------|------|-------------|
| `entry_id` | INT | FPL entry ID (composite PK) |
| `event` | INT | Gameweek number 1-38 (composite PK) |
| `points` | INT | Final event points (what we use for scoring) |
| `total_points` | INT | Cumulative season points |
| `active_chip` | TEXT | Chip used this event (null if none) |
| `raw_json` | JSONB | Complete FPL API response |
| `is_final` | BOOLEAN | True if event finished, scores are final |
| `cached_at` | TIMESTAMPTZ | When we fetched this |

**Raw JSON Structure** (from `/api/entry/{id}/event/{event}/picks/`):

```json
{
  "active_chip": null,
  "automatic_subs": [
    { "entry": 123456, "element_in": 302, "element_out": 285, "event": 18 }
  ],
  "entry_history": {
    "event": 18,
    "points": 67,
    "total_points": 1847,
    "rank": 2500000,
    "rank_sort": 2500001,
    "overall_rank": 125000,
    "bank": 15,
    "value": 1002,
    "event_transfers": 1,
    "event_transfers_cost": 0,
    "points_on_bench": 12
  },
  "picks": [
    {
      "element": 355,
      "position": 1,
      "multiplier": 1,
      "is_captain": false,
      "is_vice_captain": false
    },
    {
      "element": 328,
      "position": 2,
      "multiplier": 2,
      "is_captain": true,
      "is_vice_captain": false
    }
    // ... 15 players total
  ]
}
```

**Querying JSONB:**

```sql
-- Get captain's element ID
SELECT p.element
FROM picks pk,
     jsonb_array_elements(pk.raw_json->'picks') as p
WHERE pk.entry_id = 123
  AND pk.event = 18
  AND (p->>'is_captain')::boolean = true;

-- Get points on bench
SELECT raw_json->'entry_history'->>'points_on_bench' as bench_points
FROM picks WHERE entry_id = 123 AND event = 18;

-- Find all Triple Captain uses in gameweek 18
SELECT entry_id
FROM picks
WHERE event = 18 AND raw_json->>'active_chip' = '3xc';

-- Get all player picks with their multipliers
SELECT
  entry_id,
  p->>'element' as player_id,
  p->>'multiplier' as multiplier,
  p->>'is_captain' as is_captain
FROM picks,
     jsonb_array_elements(raw_json->'picks') as p
WHERE event = 18 AND is_final = true;
```

---

## `leagues` Table

Cached FPL classic league data. Stores raw API response from `/api/leagues-classic/{id}/standings/`.

```sql
CREATE TABLE leagues (
  league_id INT NOT NULL,
  season TEXT NOT NULL,

  -- Extracted fields (commonly queried)
  name TEXT NOT NULL,
  created TIMESTAMPTZ,
  admin_entry INT,

  -- Raw API response (complete data, future-proof)
  raw_json JSONB NOT NULL,

  cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (league_id, season)
);

CREATE INDEX idx_leagues_name ON leagues(name);
```

**GraphQL Schema:**

```graphql
type League @table(key: ["leagueId", "season"]) {
  leagueId: Int! @col(name: "league_id")
  season: String!
  name: String!
  created: DateTime
  adminEntry: Int @col(name: "admin_entry")
  rawJson: Any! @col(name: "raw_json")
  cachedAt: DateTime! @col(name: "cached_at") @default(expr: "now()")
}
```

| Column | Type | Description |
|--------|------|-------------|
| `league_id` | INT | FPL classic league ID (composite PK) |
| `season` | TEXT | Season identifier (composite PK) |
| `name` | TEXT | League name |
| `created` | TIMESTAMPTZ | When league was created |
| `admin_entry` | INT | Entry ID of league admin |
| `raw_json` | JSONB | Complete FPL API response |
| `cached_at` | TIMESTAMPTZ | When we fetched this |

**Raw JSON Structure** (from `/api/leagues-classic/{id}/standings/`):

```json
{
  "league": {
    "id": 314,
    "name": "Overall",
    "created": "2024-06-15T10:00:00Z",
    "closed": false,
    "max_entries": null,
    "league_type": "x",
    "scoring": "c",
    "admin_entry": null,
    "start_event": 1,
    "code_privacy": "p",
    "has_cup": true,
    "cup_league": null,
    "rank": null
  },
  "new_entries": { "has_next": false, "page": 1, "results": [] },
  "standings": {
    "has_next": true,
    "page": 1,
    "results": [
      {
        "id": 123456,
        "event_total": 67,
        "player_name": "John Smith",
        "rank": 1,
        "last_rank": 2,
        "rank_sort": 1,
        "total": 1847,
        "entry": 789012,
        "entry_name": "Smith's Soldiers"
      }
      // ... more standings
    ]
  }
}
```

**Querying JSONB:**

```sql
-- Get all standings as rows
SELECT
  s->>'entry' as entry_id,
  s->>'entry_name' as team_name,
  s->>'player_name' as manager_name,
  (s->>'rank')::int as rank,
  (s->>'total')::int as total_points
FROM leagues,
     jsonb_array_elements(raw_json->'standings'->'results') as s
WHERE league_id = 314 AND season = '2025';

-- Check if league has more pages
SELECT raw_json->'standings'->>'has_next' as has_more
FROM leagues WHERE league_id = 314;
```

---

## `events` Table

Cached FPL event/gameweek data. Extracted from `/api/bootstrap-static/` events array.

```sql
CREATE TABLE events (
  event INT NOT NULL,
  season TEXT NOT NULL,

  -- Extracted fields (commonly queried)
  name TEXT NOT NULL,
  deadline_time TIMESTAMPTZ NOT NULL,
  finished BOOLEAN NOT NULL DEFAULT FALSE,
  is_current BOOLEAN NOT NULL DEFAULT FALSE,
  is_next BOOLEAN NOT NULL DEFAULT FALSE,

  -- Raw API response (complete data, future-proof)
  raw_json JSONB NOT NULL,

  cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (event, season)
);

CREATE INDEX idx_events_current ON events(season, is_current) WHERE is_current = true;
CREATE INDEX idx_events_deadline ON events(season, deadline_time);
```

**GraphQL Schema:**

```graphql
type Event @table(name: "events", key: ["event", "season"]) {
  event: Int!
  season: String!
  name: String!
  deadlineTime: DateTime! @col(name: "deadline_time")
  finished: Boolean! @default(value: false)
  isCurrent: Boolean! @col(name: "is_current") @default(value: false)
  isNext: Boolean! @col(name: "is_next") @default(value: false)
  rawJson: Any! @col(name: "raw_json")
  cachedAt: DateTime! @col(name: "cached_at") @default(expr: "now()")
}
```

| Column | Type | Description |
|--------|------|-------------|
| `event` | INT | Event/gameweek number 1-38 (composite PK) |
| `season` | TEXT | Season identifier (composite PK) |
| `name` | TEXT | Display name (e.g., "Gameweek 18") |
| `deadline_time` | TIMESTAMPTZ | Transfer deadline |
| `finished` | BOOLEAN | Has event completed |
| `is_current` | BOOLEAN | Is this the active event |
| `is_next` | BOOLEAN | Is this the next event |
| `raw_json` | JSONB | Complete event object from bootstrap |
| `cached_at` | TIMESTAMPTZ | When we fetched this |

**Raw JSON Structure** (from `/api/bootstrap-static/` events array):

```json
{
  "id": 18,
  "name": "Gameweek 18",
  "deadline_time": "2024-12-21T11:00:00Z",
  "average_entry_score": 52,
  "finished": true,
  "data_checked": true,
  "highest_scoring_entry": 12345,
  "deadline_time_epoch": 1734778800,
  "deadline_time_game_offset": 0,
  "highest_score": 142,
  "is_previous": false,
  "is_current": false,
  "is_next": false,
  "cup_leagues_created": true,
  "h2h_ko_matches_created": true,
  "chip_plays": [
    { "chip_name": "bboost", "num_played": 125000 },
    { "chip_name": "3xc", "num_played": 89000 }
  ],
  "most_selected": 328,
  "most_transferred_in": 401,
  "top_element": 328,
  "top_element_info": { "id": 328, "points": 23 },
  "transfers_made": 8500000,
  "most_captained": 328,
  "most_vice_captained": 355
}
```

**Querying JSONB:**

```sql
-- Get chip usage stats for an event
SELECT
  c->>'chip_name' as chip,
  (c->>'num_played')::int as usage_count
FROM events,
     jsonb_array_elements(raw_json->'chip_plays') as c
WHERE event = 18 AND season = '2025';

-- Get most captained player ID
SELECT raw_json->>'most_captained' as player_id
FROM events WHERE event = 18 AND season = '2025';

-- Get average score
SELECT raw_json->>'average_entry_score' as avg_score
FROM events WHERE event = 18 AND season = '2025';
```

---

## `tournaments` Table

Knockout tournaments.

```sql
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fpl_league_id INT NOT NULL,
  fpl_league_name TEXT NOT NULL,
  creator_uid TEXT NOT NULL REFERENCES users(uid),

  participant_count INT NOT NULL,
  total_rounds INT NOT NULL,
  current_round INT NOT NULL DEFAULT 1,
  start_event INT NOT NULL,

  seeding_method TEXT NOT NULL DEFAULT 'league_rank',
  status TEXT NOT NULL DEFAULT 'active',
  winner_entry_id INT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tournaments_creator ON tournaments(creator_uid);
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_league ON tournaments(fpl_league_id);
```

**GraphQL Schema:**

```graphql
type Tournament @table {
  id: UUID! @primary @default(expr: "uuidV4()")
  fplLeagueId: Int! @col(name: "fpl_league_id")
  fplLeagueName: String! @col(name: "fpl_league_name")
  creatorUid: String! @col(name: "creator_uid")

  participantCount: Int! @col(name: "participant_count")
  totalRounds: Int! @col(name: "total_rounds")
  currentRound: Int! @col(name: "current_round") @default(value: 1)
  startEvent: Int! @col(name: "start_event")

  seedingMethod: String! @col(name: "seeding_method") @default(value: "league_rank")
  status: String! @default(value: "active")
  winnerEntryId: Int @col(name: "winner_entry_id")

  createdAt: DateTime! @col(name: "created_at") @default(expr: "now()")
  updatedAt: DateTime! @col(name: "updated_at") @default(expr: "now()")

  creator: User! @relation(fields: [creatorUid], references: [uid])
  rounds: [Round!]! @relation
  participants: [Participant!]! @relation
  matches: [Match!]! @relation
}
```

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `fpl_league_id` | INT | Source FPL classic league |
| `fpl_league_name` | TEXT | League name at creation |
| `creator_uid` | TEXT | Firebase Auth UID |
| `participant_count` | INT | Number of participants |
| `total_rounds` | INT | `ceil(log2(participants))` |
| `current_round` | INT | Active round (1-indexed) |
| `start_event` | INT | First round gameweek |
| `seeding_method` | TEXT | How participants are seeded |
| `status` | TEXT | `'active'` or `'completed'` |
| `winner_entry_id` | INT | Champion's entry ID |

**Seeding Methods:**
- `league_rank` - Seed by FPL league standing (rank 1 = seed 1)
- `random` - Random shuffle
- `manual` - Creator assigns seeds (future)

**Status Values:**
- `creating` - Tournament being set up (for large tournaments)
- `active` - Tournament in progress
- `completed` - Tournament finished

---

## `rounds` Table

Tournament rounds. Each round has a specific FPL event (gameweek) and contains multiple matches.

```sql
CREATE TABLE rounds (
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  round_number INT NOT NULL,

  event INT NOT NULL,  -- FPL gameweek for this round
  status TEXT NOT NULL DEFAULT 'pending',

  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  PRIMARY KEY (tournament_id, round_number)
);

CREATE INDEX idx_rounds_event ON rounds(event, status);
CREATE INDEX idx_rounds_status ON rounds(tournament_id, status);
```

**GraphQL Schema:**

```graphql
type Round @table(name: "rounds", key: ["tournamentId", "roundNumber"]) {
  tournamentId: UUID! @col(name: "tournament_id")
  roundNumber: Int! @col(name: "round_number")

  event: Int!
  status: String! @default(value: "pending")

  startedAt: DateTime @col(name: "started_at")
  completedAt: DateTime @col(name: "completed_at")

  tournament: Tournament! @relation(fields: [tournamentId], references: [id])
  matches: [Match!]! @relation
}
```

| Column | Type | Description |
|--------|------|-------------|
| `tournament_id` | UUID | Tournament reference (composite PK) |
| `round_number` | INT | Round number 1, 2, 3... (composite PK) |
| `event` | INT | FPL event/gameweek for this round |
| `status` | TEXT | `'pending'`, `'active'`, or `'complete'` |
| `started_at` | TIMESTAMPTZ | When round became active |
| `completed_at` | TIMESTAMPTZ | When all matches completed |

**Status Values:**
- `pending` - Round not yet started (waiting for previous round)
- `active` - Round in progress, matches being played
- `complete` - All matches in round completed

**Round Naming Convention:**
- Round 1: First round (most matches)
- Round 2, 3...: Subsequent rounds
- Final round number = `ceil(log2(participants))`

---

## `participants` Table

Tournament participants. Snapshot at creation time from league standings.

```sql
CREATE TABLE participants (
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  entry_id INT NOT NULL,

  -- Extracted fields (commonly queried)
  team_name TEXT NOT NULL,
  manager_name TEXT NOT NULL,
  seed INT NOT NULL,
  league_rank INT,
  league_points INT,

  -- Raw league standings entry (complete data, future-proof)
  raw_json JSONB NOT NULL,

  -- Tournament state
  status TEXT NOT NULL DEFAULT 'active',
  elimination_round INT,
  uid TEXT REFERENCES users(uid),

  PRIMARY KEY (tournament_id, entry_id)
);

CREATE INDEX idx_participants_entry ON participants(entry_id);
CREATE INDEX idx_participants_status ON participants(tournament_id, status);
CREATE INDEX idx_participants_uid ON participants(uid) WHERE uid IS NOT NULL;
CREATE INDEX idx_participants_seed ON participants(tournament_id, seed);
```

**GraphQL Schema:**

```graphql
type Participant @table(key: ["tournamentId", "entryId"]) {
  tournamentId: UUID! @col(name: "tournament_id")
  entryId: Int! @col(name: "entry_id")

  teamName: String! @col(name: "team_name")
  managerName: String! @col(name: "manager_name")
  seed: Int!
  leagueRank: Int @col(name: "league_rank")
  leaguePoints: Int @col(name: "league_points")
  rawJson: Any! @col(name: "raw_json")

  status: String! @default(value: "active")
  eliminationRound: Int @col(name: "elimination_round")
  uid: String

  tournament: Tournament! @relation(fields: [tournamentId], references: [id])
  entry: Entry! @relation(fields: [entryId], references: [entryId])
  user: User @relation(fields: [uid], references: [uid])
}
```

| Column | Type | Description |
|--------|------|-------------|
| `tournament_id` | UUID | Tournament reference (composite PK) |
| `entry_id` | INT | FPL entry ID (composite PK) |
| `team_name` | TEXT | FPL team name at creation |
| `manager_name` | TEXT | Manager name at creation |
| `seed` | INT | Assigned seed (1 = top) |
| `league_rank` | INT | Rank in source league at creation |
| `league_points` | INT | Points in source league at creation |
| `raw_json` | JSONB | Complete standings entry from league API |
| `status` | TEXT | `'active'`, `'eliminated'`, or `'champion'` |
| `elimination_round` | INT | Round when eliminated (null if active) |
| `uid` | TEXT | Firebase UID if user claimed this entry |

**Raw JSON Structure** (from league standings results array):

```json
{
  "id": 123456,
  "event_total": 67,
  "player_name": "John Smith",
  "rank": 1,
  "last_rank": 2,
  "rank_sort": 1,
  "total": 1847,
  "entry": 789012,
  "entry_name": "Smith's Soldiers"
}
```

**Querying JSONB:**

```sql
-- Get original league rank at tournament creation
SELECT raw_json->>'rank' as original_rank
FROM participants WHERE tournament_id = $1 AND entry_id = $2;

-- Find participants who moved up in league before tournament
SELECT team_name,
  (raw_json->>'rank')::int as current_rank,
  (raw_json->>'last_rank')::int as previous_rank
FROM participants
WHERE tournament_id = $1
  AND (raw_json->>'rank')::int < (raw_json->>'last_rank')::int;
```

---

## `matches` Table

Individual knockout matches. Players are linked via `match_picks` junction table. Bracket navigation is explicit via `qualifies_to`. Event is inherited from the parent `round`.

```sql
CREATE TABLE matches (
  tournament_id UUID NOT NULL,
  match_id INT NOT NULL,

  -- Reference to round (provides event/gameweek)
  round_number INT NOT NULL,

  -- Position in bracket
  position_in_round INT NOT NULL,

  -- Match state
  status TEXT NOT NULL DEFAULT 'pending',
  winner_entry_id INT REFERENCES entries(entry_id),
  is_bye BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,

  -- Bracket navigation (explicit, not computed)
  qualifies_to_match_id INT,  -- FK to matches.match_id (self-reference)

  PRIMARY KEY (tournament_id, match_id),
  FOREIGN KEY (tournament_id, round_number)
    REFERENCES rounds(tournament_id, round_number) ON DELETE CASCADE,
  FOREIGN KEY (tournament_id, qualifies_to_match_id)
    REFERENCES matches(tournament_id, match_id)
);

CREATE INDEX idx_matches_round ON matches(tournament_id, round_number);
CREATE INDEX idx_matches_status ON matches(tournament_id, status);
CREATE INDEX idx_matches_winner ON matches(winner_entry_id) WHERE winner_entry_id IS NOT NULL;
CREATE INDEX idx_matches_qualifies ON matches(tournament_id, qualifies_to_match_id);
```

**GraphQL Schema:**

```graphql
type Match @table(key: ["tournamentId", "matchId"]) {
  tournamentId: UUID! @col(name: "tournament_id")
  matchId: Int! @col(name: "match_id")

  roundNumber: Int! @col(name: "round_number")
  positionInRound: Int! @col(name: "position_in_round")

  status: String! @default(value: "pending")
  winnerEntryId: Int @col(name: "winner_entry_id")
  isBye: Boolean! @col(name: "is_bye") @default(value: false)
  completedAt: DateTime @col(name: "completed_at")

  qualifiesToMatchId: Int @col(name: "qualifies_to_match_id")

  tournament: Tournament! @relation(fields: [tournamentId], references: [id])
  round: Round! @relation(fields: [tournamentId, roundNumber], references: [tournamentId, roundNumber])
  winner: Entry @relation(fields: [winnerEntryId], references: [entryId])
  qualifiesTo: Match @relation(fields: [tournamentId, qualifiesToMatchId], references: [tournamentId, matchId])
  matchPicks: [MatchPick!]! @relation
}
```

| Column | Type | Description |
|--------|------|-------------|
| `tournament_id` | UUID | Tournament reference (composite PK) |
| `match_id` | INT | Sequential within tournament (composite PK) |
| `round_number` | INT | FK to rounds - provides event |
| `position_in_round` | INT | Position within round (1, 2, 3...) |
| `status` | TEXT | `'pending'`, `'active'`, or `'complete'` |
| `winner_entry_id` | INT | Winner's entry ID (FK to entries) |
| `is_bye` | BOOLEAN | True if auto-advance (1 player) |
| `completed_at` | TIMESTAMPTZ | When match was resolved |
| `qualifies_to_match_id` | INT | Next match winner advances to (self-FK) |

**Getting the event for a match:**
```sql
SELECT r.event
FROM matches m
JOIN rounds r ON r.tournament_id = m.tournament_id AND r.round_number = m.round_number
WHERE m.tournament_id = $1 AND m.match_id = $2;
```

**Status Values:**
- `pending` - Waiting for players (from previous round)
- `active` - Both players assigned, event in progress or ready to score
- `complete` - Winner determined

---

## `match_picks` Table

Junction table linking matches to participants and their picks. Each row represents one player in a match.

```sql
CREATE TABLE match_picks (
  tournament_id UUID NOT NULL,
  match_id INT NOT NULL,
  entry_id INT NOT NULL,

  -- Denormalized for convenience (could be looked up via participants)
  slot INT NOT NULL CHECK (slot IN (1, 2)),  -- Player 1 or Player 2

  FOREIGN KEY (tournament_id, match_id) REFERENCES matches(tournament_id, match_id) ON DELETE CASCADE,
  FOREIGN KEY (tournament_id, entry_id) REFERENCES participants(tournament_id, entry_id),
  PRIMARY KEY (tournament_id, match_id, entry_id)
);

CREATE INDEX idx_match_picks_entry ON match_picks(entry_id);
CREATE INDEX idx_match_picks_match ON match_picks(tournament_id, match_id);
```

**GraphQL Schema:**

```graphql
type MatchPick @table(name: "match_picks", key: ["tournamentId", "matchId", "entryId"]) {
  tournamentId: UUID! @col(name: "tournament_id")
  matchId: Int! @col(name: "match_id")
  entryId: Int! @col(name: "entry_id")
  slot: Int!

  match: Match! @relation(fields: [tournamentId, matchId], references: [tournamentId, matchId])
  participant: Participant! @relation(fields: [tournamentId, entryId], references: [tournamentId, entryId])
  entry: Entry! @relation(fields: [entryId], references: [entryId])
}
```

| Column | Type | Description |
|--------|------|-------------|
| `tournament_id` | UUID | Tournament reference (composite PK) |
| `match_id` | INT | Match reference (composite PK) |
| `entry_id` | INT | Participant's entry ID (composite PK) |
| `slot` | INT | 1 or 2 (player position in match display) |

**Key Relationships:**
- Links to `participants` via `(tournament_id, entry_id)` for seed info
- Links to `picks` via `(entry_id, round.event)` for score in this match
- Links to `entries` via `entry_id` for player name
- Gets `event` from `match → round → event`

**Query: Get Match with Full Details via match_picks**

```sql
SELECT
  m.match_id,
  m.round_number,
  m.position_in_round,
  r.event,
  m.status,
  m.is_bye,
  m.winner_entry_id,
  m.qualifies_to_match_id,
  -- Player details from match_picks
  mp.slot,
  mp.entry_id,
  e.name as team_name,
  p.seed,
  pk.points
FROM matches m
JOIN rounds r ON r.tournament_id = m.tournament_id AND r.round_number = m.round_number
LEFT JOIN match_picks mp ON mp.tournament_id = m.tournament_id AND mp.match_id = m.match_id
LEFT JOIN entries e ON e.entry_id = mp.entry_id
LEFT JOIN participants p ON p.tournament_id = m.tournament_id AND p.entry_id = mp.entry_id
LEFT JOIN picks pk ON pk.entry_id = mp.entry_id AND pk.event = r.event
WHERE m.tournament_id = $1 AND m.match_id = $2
ORDER BY mp.slot;
```

**GraphQL Query:**

```graphql
query GetMatchDetails($tournamentId: UUID!, $matchId: Int!) {
  match(tournamentId: $tournamentId, matchId: $matchId) {
    matchId
    roundNumber
    positionInRound
    round {
      event
      status
    }
    status
    isBye
    winnerEntryId
    qualifiesTo {
      matchId
      positionInRound
    }
    matchPicks {
      slot
      entry {
        entryId
        name
        playerFirstName
        playerLastName
      }
      participant {
        seed
        leagueRank
      }
    }
  }
}
```

**Benefits of this structure:**
1. **Explicit navigation** - `qualifies_to` shows exactly where winners go
2. **Normalized players** - No `player1_entry_id`/`player2_entry_id` columns
3. **Direct picks access** - Query picks via `match_picks.entry_id` + `match.event`
4. **Flexible slots** - Easy to add 3rd-place playoffs or other match types

---

## Bracket Navigation (Stored)

Navigation between matches is **explicit via `qualifies_to_match_id`**. This is set during tournament creation.

**Finding feeder matches:**

```sql
-- Get matches that feed into this match
SELECT *
FROM matches
WHERE tournament_id = $1
  AND qualifies_to_match_id = $2;
```

**Following the bracket forward:**

```sql
-- Get winner's path to the final
WITH RECURSIVE path AS (
  -- Start from current match
  SELECT match_id, position, qualifies_to_match_id, 1 as depth
  FROM matches
  WHERE tournament_id = $1 AND match_id = $2

  UNION ALL

  -- Follow qualifies_to chain
  SELECT m.match_id, m.position, m.qualifies_to_match_id, p.depth + 1
  FROM matches m
  JOIN path p ON m.tournament_id = $1 AND m.match_id = p.qualifies_to_match_id
)
SELECT * FROM path ORDER BY depth;
```

**Slot assignment:**
When a winner advances, their slot in the next match is determined by their source position:
- Odd positions (1, 3, 5...) → slot 1
- Even positions (2, 4, 6...) → slot 2

```typescript
function getNextSlot(positionInRound: number): 1 | 2 {
  return positionInRound % 2 === 1 ? 1 : 2;
}
```

**Why stored (not computed):**
- **Explicit relationships** - Follow FKs, not functions
- **Queryable** - Find "who plays winner of X" with simple SQL
- **Flexible** - Supports non-standard brackets (byes, reseeding)
- **Auditable** - Bracket structure is visible in data

---

## Byes

When participant count isn't a power of 2:

1. Calculate bracket size: `2^ceil(log2(participants))`
2. Calculate byes: `bracketSize - participantCount`
3. Assign byes to top seeds (seed 1 gets bye first)
4. Create `match_picks` with only one player
5. Set `is_bye: true` and `winner_entry_id` immediately

**Example:** 10 participants in 16-slot bracket
- 6 byes needed (16 - 10)
- Seeds 1-6 get byes (6 matches with 1 player each)
- Seeds 7-10 vs 13-16 play in round 1 (2 matches)

```sql
-- Mark bye matches during tournament creation
WITH bye_matches AS (
  SELECT m.tournament_id, m.match_id, mp.entry_id
  FROM matches m
  JOIN match_picks mp ON mp.tournament_id = m.tournament_id AND mp.match_id = m.match_id
  WHERE m.tournament_id = $1
    AND m.round = 1
  GROUP BY m.tournament_id, m.match_id, mp.entry_id
  HAVING COUNT(*) = 1  -- Only one player = bye
)
UPDATE matches m
SET
  is_bye = TRUE,
  winner_entry_id = bm.entry_id,
  status = 'complete',
  completed_at = NOW()
FROM bye_matches bm
WHERE m.tournament_id = bm.tournament_id
  AND m.match_id = bm.match_id;

-- Advance bye winners to next round
INSERT INTO match_picks (tournament_id, match_id, entry_id, slot)
SELECT
  m.tournament_id,
  m.qualifies_to_match_id,
  m.winner_entry_id,
  CASE WHEN SPLIT_PART(m.position, '-', 2)::int % 2 = 1 THEN 1 ELSE 2 END
FROM matches m
WHERE m.tournament_id = $1
  AND m.is_bye = TRUE
  AND m.qualifies_to_match_id IS NOT NULL;
```

---

## Match Resolution Rules

1. **Higher score wins** - Compare points from `picks` table via `match_picks`
2. **Tie broken by seed** - Lower seed number (from `participants`) advances
3. **BYE auto-advances** - Single player in `match_picks` wins immediately

```sql
-- Winner determination (used in resolve round query)
-- Join match_picks to get both players, then compare
WITH players AS (
  SELECT
    mp.tournament_id,
    mp.match_id,
    mp.entry_id,
    mp.slot,
    pk.points,
    p.seed
  FROM match_picks mp
  JOIN matches m ON m.tournament_id = mp.tournament_id AND m.match_id = mp.match_id
  JOIN picks pk ON pk.entry_id = mp.entry_id AND pk.event = m.event
  JOIN participants p ON p.tournament_id = mp.tournament_id AND p.entry_id = mp.entry_id
  WHERE mp.tournament_id = $1 AND mp.match_id = $2
)
SELECT
  CASE
    WHEN p2.entry_id IS NULL THEN p1.entry_id  -- BYE
    WHEN p1.points > p2.points THEN p1.entry_id
    WHEN p2.points > p1.points THEN p2.entry_id
    WHEN p1.seed < p2.seed THEN p1.entry_id  -- Lower seed wins tie
    ELSE p2.entry_id
  END as winner_entry_id
FROM players p1
LEFT JOIN players p2 ON p2.tournament_id = p1.tournament_id
  AND p2.match_id = p1.match_id AND p2.slot = 2
WHERE p1.slot = 1;
```

---

## Common Queries

### Find My Current Match

```sql
SELECT m.*, t.fpl_league_name
FROM matches m
JOIN match_picks mp ON mp.tournament_id = m.tournament_id AND mp.match_id = m.match_id
JOIN tournaments t ON t.id = m.tournament_id
WHERE m.status = 'active'
  AND mp.entry_id = $1;
```

**Data Connect:**

```graphql
query GetMyCurrentMatch($entryId: Int!) @auth(level: USER) {
  matchPicks(where: { entryId: { eq: $entryId } }) {
    match(where: { status: { eq: "active" } }) {
      matchId
      roundNumber
      positionInRound
      round {
        event
        status
      }
      tournament { id fplLeagueName }
      matchPicks {
        slot
        entry { name }
        participant { seed }
      }
    }
  }
}
```

### Get Round Matches (Paginated)

```sql
SELECT
  m.match_id,
  m.round_number,
  m.position_in_round,
  r.event,
  m.status,
  m.is_bye,
  m.winner_entry_id,
  m.qualifies_to_match_id,
  -- Aggregate players as JSON array
  json_agg(
    json_build_object(
      'slot', mp.slot,
      'entry_id', mp.entry_id,
      'team_name', e.name,
      'seed', p.seed,
      'points', pk.points
    ) ORDER BY mp.slot
  ) as players
FROM matches m
JOIN rounds r ON r.tournament_id = m.tournament_id AND r.round_number = m.round_number
LEFT JOIN match_picks mp ON mp.tournament_id = m.tournament_id AND mp.match_id = m.match_id
LEFT JOIN entries e ON e.entry_id = mp.entry_id
LEFT JOIN participants p ON p.tournament_id = m.tournament_id AND p.entry_id = mp.entry_id
LEFT JOIN picks pk ON pk.entry_id = mp.entry_id AND pk.event = r.event
WHERE m.tournament_id = $1 AND m.round_number = $2
GROUP BY m.tournament_id, m.match_id, r.event
ORDER BY m.position_in_round
LIMIT $3 OFFSET $4;
```

### My Match History

```sql
SELECT
  m.*,
  t.fpl_league_name,
  CASE
    WHEN m.winner_entry_id = $1 THEN 'win'
    WHEN m.winner_entry_id IS NULL THEN 'pending'
    ELSE 'loss'
  END as result
FROM matches m
JOIN match_picks mp ON mp.tournament_id = m.tournament_id AND mp.match_id = m.match_id
JOIN tournaments t ON t.id = m.tournament_id
WHERE mp.entry_id = $1
ORDER BY t.created_at DESC, m.round DESC;
```

---

## Bulk Operations (Cloud Functions)

### Resolve Round

Determines winners for all matches in a round. Points come from `picks` via `match_picks` and `rounds.event`, seeds from `participants`.

```sql
WITH match_scores AS (
  -- Get each player's score for their match
  SELECT
    mp.tournament_id,
    mp.match_id,
    mp.entry_id,
    mp.slot,
    pk.points,
    p.seed
  FROM match_picks mp
  JOIN matches m ON m.tournament_id = mp.tournament_id AND m.match_id = mp.match_id
  JOIN rounds r ON r.tournament_id = m.tournament_id AND r.round_number = m.round_number
  JOIN picks pk ON pk.entry_id = mp.entry_id AND pk.event = r.event AND pk.is_final = true
  JOIN participants p ON p.tournament_id = mp.tournament_id AND p.entry_id = mp.entry_id
  WHERE mp.tournament_id = $1
    AND m.round_number = $2
    AND m.status = 'active'
),
match_results AS (
  -- Pivot to compare players and determine winner
  SELECT
    s1.tournament_id,
    s1.match_id,
    CASE
      WHEN s2.entry_id IS NULL THEN s1.entry_id  -- BYE
      WHEN s1.points > s2.points THEN s1.entry_id
      WHEN s2.points > s1.points THEN s2.entry_id
      WHEN s1.seed < s2.seed THEN s1.entry_id  -- Lower seed wins tie
      ELSE s2.entry_id
    END as winner_id
  FROM match_scores s1
  LEFT JOIN match_scores s2 ON s2.tournament_id = s1.tournament_id
    AND s2.match_id = s1.match_id
    AND s2.slot = 2
  WHERE s1.slot = 1
)
UPDATE matches m
SET
  winner_entry_id = r.winner_id,
  status = 'complete',
  completed_at = NOW()
FROM match_results r
WHERE m.tournament_id = r.tournament_id
  AND m.match_id = r.match_id;
```

### Advance Winners to Next Round

Inserts winners into `match_picks` for their next match using `qualifies_to_match_id`.

```sql
WITH completed_matches AS (
  SELECT
    m.tournament_id,
    m.match_id,
    m.position,
    m.winner_entry_id,
    m.qualifies_to_match_id
  FROM matches m
  WHERE m.tournament_id = $1
    AND m.round = $2
    AND m.status = 'complete'
    AND m.qualifies_to_match_id IS NOT NULL
)
INSERT INTO match_picks (tournament_id, match_id, entry_id, slot)
SELECT
  cm.tournament_id,
  cm.qualifies_to_match_id,
  cm.winner_entry_id,
  -- Odd positions → slot 1, even positions → slot 2
  CASE WHEN SPLIT_PART(cm.position, '-', 2)::int % 2 = 1 THEN 1 ELSE 2 END
FROM completed_matches cm
ON CONFLICT (tournament_id, match_id, entry_id) DO NOTHING;

-- Activate matches that now have both players
UPDATE matches m
SET status = 'active'
WHERE m.tournament_id = $1
  AND m.round = $2 + 1
  AND m.status = 'pending'
  AND (SELECT COUNT(*) FROM match_picks mp
       WHERE mp.tournament_id = m.tournament_id AND mp.match_id = m.match_id) = 2;
```

### Create Tournament Bracket

Creates rounds, matches with explicit `qualifies_to` links, and populates initial `match_picks`.

```sql
-- Step 1: Create all rounds
INSERT INTO rounds (tournament_id, round_number, event, status)
SELECT
  $1::uuid,
  r.round_number,
  $2 + r.round_number - 1,  -- start_event + round_number - 1
  CASE WHEN r.round_number = 1 THEN 'active' ELSE 'pending' END
FROM generate_series(1, $3) as r(round_number);  -- $3 = total_rounds

-- Step 2: Create all matches with qualifies_to links
WITH match_positions AS (
  SELECT
    r.round_number,
    p.pos as position_in_round,
    ROW_NUMBER() OVER (ORDER BY r.round_number, p.pos) as match_id
  FROM generate_series(1, $3) as r(round_number)
  CROSS JOIN LATERAL generate_series(1, POWER(2, $3 - r.round_number)::int) as p(pos)
)
INSERT INTO matches (tournament_id, match_id, round_number, position_in_round, status, qualifies_to_match_id)
SELECT
  $1::uuid,
  mp.match_id,
  mp.round_number,
  mp.position_in_round,
  'pending',
  -- Link to next round match
  (SELECT match_id FROM match_positions mp2
   WHERE mp2.round_number = mp.round_number + 1
     AND mp2.position_in_round = CEIL(mp.position_in_round / 2.0))
FROM match_positions mp;

-- Step 3: Populate round 1 match_picks from seeded participants
INSERT INTO match_picks (tournament_id, match_id, entry_id, slot)
SELECT
  $1::uuid,
  m.match_id,
  p.entry_id,
  CASE WHEN p.seed % 2 = 1 THEN 1 ELSE 2 END as slot
FROM participants p
JOIN matches m ON m.tournament_id = $1
  AND m.round_number = 1
  AND m.position_in_round = CEIL(p.seed / 2.0)
WHERE p.tournament_id = $1;

-- Step 4: Activate matches that have both players
UPDATE matches m
SET status = 'active'
WHERE m.tournament_id = $1
  AND m.round_number = 1
  AND (SELECT COUNT(*) FROM match_picks mp
       WHERE mp.tournament_id = m.tournament_id AND mp.match_id = m.match_id) = 2;
```

---

## Indexes Summary

**Core Tables:**

| Table | Index | Purpose |
|-------|-------|---------|
| `users` | `entry_id_2025` | Find user by FPL entry |
| `entries` | `season` | Filter by season |
| `entries` | `summary_overall_rank` | Leaderboard queries |
| `picks` | `event, is_final` | Find completed gameweeks |
| `picks` | `event, points` (partial) | Scoring queries on final picks |
| `tournaments` | `creator_uid` | User's tournaments |
| `tournaments` | `status` | Active tournaments |
| `rounds` | `event, status` | Find rounds by gameweek |
| `rounds` | `tournament_id, status` | Active rounds in tournament |
| `participants` | `entry_id` | Find user's participations |
| `participants` | `tournament_id, status` | Active participants |
| `participants` | `tournament_id, seed` | Seeding queries |
| `matches` | `tournament_id, round_number` | Browse bracket by round |
| `matches` | `tournament_id, status` | Find active matches |
| `matches` | `winner_entry_id` (partial) | Find completed matches by winner |
| `matches` | `tournament_id, qualifies_to` | Bracket navigation |
| `match_picks` | `entry_id` | Find user's matches |
| `match_picks` | `tournament_id, match_id` | Get players for a match |

**FPL Cache Tables:**

| Table | Index | Purpose |
|-------|-------|---------|
| `leagues` | `name` | Search leagues by name |
| `events` | `season, is_current` (partial) | Find current event |
| `events` | `season, deadline_time` | Deadline queries |

**JSONB Indexes (optional, add if querying frequently):**

```sql
-- Index on active_chip for chip analysis
CREATE INDEX idx_picks_chip ON picks((raw_json->>'active_chip'))
  WHERE raw_json->>'active_chip' IS NOT NULL;

-- GIN indexes for complex JSONB queries (use sparingly, large indexes)
CREATE INDEX idx_picks_raw_gin ON picks USING GIN (raw_json);
CREATE INDEX idx_entries_raw_gin ON entries USING GIN (raw_json);
```

---

## FPL API → Our Tables

| FPL Endpoint | Our Table | JSONB Storage |
|--------------|-----------|---------------|
| `/api/bootstrap-static/` (events) | `events` | Full event object |
| `/api/entry/{id}/` | `entries` | Full entry response |
| `/api/entry/{id}/event/{event}/picks/` | `picks` | Full picks response |
| `/api/leagues-classic/{id}/standings/` | `leagues` | Full standings response |
| `/api/leagues-classic/{id}/standings/` (results[]) | `participants` | Individual standings entry |

> **Note:** Player and team data from `/api/bootstrap-static/` (elements, teams arrays) is not cached in MVP. Add `players` and `teams` tables when features require individual player/team information.

---

## Scale Characteristics

| Metric | Capacity |
|--------|----------|
| Participants per tournament | 1,000,000+ |
| Matches per tournament | 1,000,000+ |
| Round resolution time | ~2 seconds (500K matches) |
| Tournament creation time | ~5 seconds (1M matches) |
| "Find my match" query | <10ms |

---

## Related

- [data-flow.md](./data-flow.md) - How data moves through the system
- [../integrations/fpl-api.md](../integrations/fpl-api.md) - FPL API endpoint details
- [../../product/features/](../../product/features/CLAUDE.md) - Feature specifications
