# Data Flow

> **Status:** DRAFT - needs sequence diagrams and verification
> **Last Updated:** December 2025

---

## Overview

How data moves through the system for key operations.

**Database:** PostgreSQL via Firebase Data Connect

**Data layers:**
- **FPL Cache** (`events`, `leagues`) - Re-fetchable from FPL API
- **FPL Records** (`entries`, `picks`) - Authoritative for result verification
- **User** (`users`) - Firebase Auth accounts
- **Tournament** (`tournaments`, `rounds`, `participants`, `matches`, `match_picks`) - Tournament structure

---

## Read Flows

### Dashboard Load

```
User opens /dashboard
    │
    ▼
AuthContext checks Firebase Auth state
    │
    ▼
Query: users WHERE uid = $auth_uid
    │
    ▼
Query: participants WHERE uid = $auth_uid
    → JOIN tournaments
    │
    ▼
Render dashboard with tournaments list
```

**Tables read:**
- `users` - Get user profile and entry_id
- `participants` - Find user's tournament participations
- `tournaments` - Get tournament metadata

---

### Tournament View

```
User opens /league/:fpl_league_id
    │
    ▼
Query: tournaments WHERE fpl_league_id = $id
    │
    ▼
Query: rounds, matches, match_picks for tournament
    │
    ▼
For each match needing scores:
    │
    ├─ If gameweek not started: Show "GW X"
    │
    ├─ If gameweek in progress:
    │   └─ Fetch live scores from FPL API (not cached)
    │
    └─ If gameweek complete:
        └─ Query picks table (authoritative record)
    │
    ▼
Render bracket with scores
```

**Tables read:**
- `tournaments` - Tournament metadata
- `rounds` - Round → gameweek mapping
- `matches` - Match structure and winners
- `match_picks` - Who plays in each match
- `picks` - Authoritative scores (FPL Records layer)
- `entries` - Team names

---

### Leagues List

```
User opens /leagues
    │
    ▼
Query: users WHERE uid = $auth_uid → get entry_id
    │
    ▼
Query: entries WHERE entry_id = $entry_id → get raw_json.leagues
    │
    ▼
If stale or missing: Fetch from FPL API, update entries
    │
    ▼
Render leagues list
```

**Tables read:**
- `users` - Get user's entry_id
- `entries` - Get cached league memberships from raw_json

**FPL API (if cache miss):**
- `/api/entry/{entry_id}/` → leagues.classic[]

---

## Write Flows

### User Signup

```
User signs in with Google
    │
    ▼
Firebase Auth: Create/authenticate user
    │
    ▼
INSERT INTO users (uid, email) ON CONFLICT DO NOTHING
    │
    ▼
Redirect to /connect (if no entry_id) or /dashboard
```

**Tables written:**
- `users` - New user record

---

### FPL Connection

```
User enters FPL Team ID
    │
    ▼
Cloud Function: Fetch /api/entry/{entry_id}/ from FPL
    │
    ▼
Validate entry exists
    │
    ▼
INSERT INTO entries (entry_id, season, name, raw_json, ...)
  ON CONFLICT UPDATE
    │
    ▼
UPDATE users SET entry_id_2025 = $entry_id WHERE uid = $auth_uid
    │
    ▼
Redirect to /dashboard
```

**Tables written:**
- `entries` - Cache entry data (FPL Records - retained for verification)
- `users` - Link user to entry

---

### Tournament Creation

```
User selects league → clicks "Create Tournament"
    │
    ▼
Cloud Function: Fetch /api/leagues-classic/{id}/standings/
    │
    ▼
Cache league data:
  INSERT INTO leagues (league_id, season, name, raw_json)
    │
    ▼
For each standing in results[]:
  INSERT INTO entries (entry_id, ...) ON CONFLICT UPDATE
    │
    ▼
Create placeholder picks for tournament gameweeks:
  For each entry × each round's gameweek:
    INSERT INTO picks (entry_id, event, points=0, is_final=false)
      ON CONFLICT DO NOTHING
    │
    ▼
Generate bracket structure (order matters for FK constraints):
  1. INSERT INTO tournaments
  2. INSERT INTO rounds (one per gameweek)
  3. INSERT INTO participants (from standings, linked to entries)
  4. INSERT INTO matches (with qualifies_to links)
  5. INSERT INTO match_picks (round 1 assignments only)
    │
    ▼
Return tournament URL
```

**Tables written:**
- `leagues` - Cache league data (FPL Cache - can re-fetch)
- `entries` - Cache all participant entries (FPL Records - retained)
- `picks` - Placeholder records for tournament gameweeks (FPL Records)
- `tournaments` - Tournament metadata
- `rounds` - Round definitions
- `participants` - Participant snapshots
- `matches` - Match structure
- `match_picks` - Round 1 matchups only (later rounds populated when winners advance)

---

### Creation Order (FK Constraints)

Tournament creation must respect foreign key constraints. Records must exist before dependent records reference them.

```
┌─────────────────────────────────────────────────────────────┐
│  1. ENTRIES (FPL team data)                                 │
│     └── Must exist before: participants, match_picks        │
├─────────────────────────────────────────────────────────────┤
│  2. PICKS (placeholder records)                             │
│     └── Must exist for: score lookups during resolution     │
│     └── Created with: points=0, is_final=false              │
├─────────────────────────────────────────────────────────────┤
│  3. TOURNAMENT                                              │
│     └── Must exist before: rounds, participants, matches    │
├─────────────────────────────────────────────────────────────┤
│  4. ROUNDS                                                  │
│     └── Must exist before: matches reference round_number   │
├─────────────────────────────────────────────────────────────┤
│  5. PARTICIPANTS                                            │
│     └── Must exist before: match_picks reference entry_id   │
│     └── FK to: entries.entry_id                             │
├─────────────────────────────────────────────────────────────┤
│  6. MATCHES                                                 │
│     └── Must exist before: match_picks reference match_id   │
│     └── FK to: rounds.round_number, matches.qualifies_to    │
├─────────────────────────────────────────────────────────────┤
│  7. MATCH_PICKS (round 1 only at creation)                  │
│     └── FK to: matches.match_id, participants.entry_id      │
│     └── Later rounds: created when winners advance          │
└─────────────────────────────────────────────────────────────┘
```

**Why picks need placeholders:**
- `match_picks` → `picks` lookup uses `(entry_id, event)` composite key
- If pick record doesn't exist, score lookup fails
- Placeholders ensure FK integrity even before gameweek completes
- Background job updates `points` and sets `is_final=true` when gameweek finishes

---

## Background Flows

### Score Fetch & Round Resolution (Scheduled)

```
Cloud Function triggers (every 2 hours)
    │
    ▼
Query: events WHERE is_current = true → get current gameweek
    │
    ▼
Query: rounds WHERE event = $current_gw AND status = 'active'
    → JOIN tournaments WHERE status = 'active'
    │
    ▼
Check FPL API: Is gameweek finished?
    │
    ├─ If not finished: Exit (wait for next run)
    │
    └─ If finished:
        │
        ▼
    For each active round:
        │
        ▼
    Step 1: Update pick records with final scores
      - Query match_picks → get all entry_ids in this round
      - Batch fetch from FPL API: /api/entry/{entry_id}/event/{event}/picks/
      - UPDATE picks SET points=$score, raw_json=$data, is_final=true
        (placeholders already exist from tournament creation)
        │
        ▼
    Step 2: Resolve matches
      - Compare points from picks table
      - Set winner_entry_id (tiebreak by seed from participants)
      - Update match status = 'complete'
      - Update loser's participant status = 'eliminated'
        │
        ▼
    Step 3: Advance winners to next round
      - For each completed match with qualifies_to_match_id:
        - Find the target match
        - Check if BOTH source matches are complete
          (each next-round match has 2 feeder matches)
        - If both complete:
          - INSERT INTO match_picks (tournament_id, match_id, entry_id, slot)
            for both winners
          - UPDATE match SET status = 'active'
        │
        ▼
    Step 4: Update round status
      - If all matches in round complete:
        - UPDATE round SET status = 'complete'
        - UPDATE next round SET status = 'active'
        │
        ▼
    Step 5: Check for tournament completion
      - If final match complete:
        - UPDATE tournaments SET status = 'completed', winner_entry_id
        - UPDATE winner's participant SET status = 'champion'
```

**Winner Advancement Detail:**

Match_picks for rounds 2+ are created when winners advance, not at tournament creation:

```
Round 1 Match A (position 1) ─┐
                              ├─► Round 2 Match X
Round 1 Match B (position 2) ─┘
    │
    ▼
When Match A completes:
  - Winner known, but Match B not done
  - Cannot create match_picks for Match X yet
    │
    ▼
When Match B completes:
  - Both source matches now have winners
  - INSERT match_picks for Match X:
    - Winner of A → slot 1 (odd position)
    - Winner of B → slot 2 (even position)
  - UPDATE Match X SET status = 'active'
```

**Tables read:**
- `events` - Current gameweek status
- `rounds` - Active rounds
- `tournaments` - Active tournaments
- `match_picks` - Entries needing scores
- `matches` - Find feeder matches via qualifies_to_match_id
- `participants` - Seeds for tiebreaks

**Tables written:**
- `picks` - Update placeholders with actual scores (is_final=true)
- `matches` - Winners, status
- `match_picks` - Next round assignments (created when both feeders complete)
- `participants` - Elimination status
- `rounds` - Status updates
- `tournaments` - Completion status

---

## Caching Strategy

| Data | Table | Type | TTL | Notes |
|------|-------|------|-----|-------|
| Gameweek info | `events` | Cache | 1 hour | Re-fetch from bootstrap-static |
| League standings | `leagues` | Cache | At creation | Only needed for tournament setup |
| Entry/team data | `entries` | Record | Permanent | Authoritative for disputes |
| Gameweek scores | `picks` | Record | Permanent | Authoritative for results |

**Cache vs Records:**
- **Cache tables** can be truncated and rebuilt from FPL API
- **Record tables** must be retained - they're the source of truth for tournament results

---

## Data Freshness

| Data | Source | Acceptable Staleness |
|------|--------|----------------------|
| User profile | `users` table | Real-time (Data Connect) |
| Tournament bracket | `matches` table | Real-time (Data Connect) |
| Completed scores | `picks` table | Permanent (final) |
| Live scores | FPL API direct | < 5 minutes during active GW |
| Current gameweek | `events` table | < 1 hour |
| League standings | FPL API | Fresh at tournament creation only |

---

## Error Handling

| Failure Point | Impact | Recovery |
|---------------|--------|----------|
| FPL API down | Can't fetch new scores | Use cached `picks`, retry later |
| FPL API rate limit | Delayed score updates | Exponential backoff, batch requests |
| Database write fails | Incomplete transaction | Retry with idempotent operations |
| Cloud Function timeout | Partial round resolution | Next run picks up incomplete work |
| Entry not found | Can't verify participant | Log error, skip entry, alert admin |

---

## Audit Trail

The **FPL Records** layer (`entries`, `picks`) provides an audit trail:

1. **Dispute resolution** - If a user claims wrong score, check `picks.raw_json`
2. **API unavailability** - If FPL API goes down, we have authoritative records
3. **Historical analysis** - Can replay any tournament from stored data

```sql
-- Verify a match result
SELECT
  mp.slot,
  e.name as team_name,
  p.points,
  p.raw_json->'entry_history' as full_history
FROM match_picks mp
JOIN entries e ON e.entry_id = mp.entry_id
JOIN matches m ON m.tournament_id = mp.tournament_id AND m.match_id = mp.match_id
JOIN rounds r ON r.tournament_id = m.tournament_id AND r.round_number = m.round_number
JOIN picks p ON p.entry_id = mp.entry_id AND p.event = r.event
WHERE mp.tournament_id = $1 AND mp.match_id = $2;
```

---

## Related

- [data-dictionary.md](./data-dictionary.md) - Table definitions and schema
- [../integrations/fpl-api.md](../integrations/fpl-api.md) - FPL API details
- [../../product/features/](../../product/features/CLAUDE.md) - Feature specifications
