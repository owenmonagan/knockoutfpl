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
Generate bracket structure:
  1. INSERT INTO tournaments
  2. INSERT INTO rounds (one per gameweek)
  3. INSERT INTO participants (from standings)
  4. INSERT INTO matches (with qualifies_to links)
  5. INSERT INTO match_picks (initial round assignments)
    │
    ▼
Return tournament URL
```

**Tables written:**
- `leagues` - Cache league data (FPL Cache - can re-fetch)
- `entries` - Cache all participant entries (FPL Records - retained)
- `tournaments` - Tournament metadata
- `rounds` - Round definitions
- `participants` - Participant snapshots
- `matches` - Match structure
- `match_picks` - Initial matchups

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
    Query match_picks → get all entry_ids needing scores
        │
        ▼
    Batch fetch from FPL API:
      /api/entry/{entry_id}/event/{event}/picks/
        │
        ▼
    INSERT INTO picks (entry_id, event, points, raw_json, is_final=true)
      ON CONFLICT UPDATE
        │
        ▼
    Resolve matches (SQL bulk operation):
      - Compare points from picks table
      - Set winner_entry_id (tiebreak by seed from participants)
      - Update match status = 'complete'
        │
        ▼
    Advance winners:
      - INSERT INTO match_picks for next round matches
      - Update next round status = 'active'
        │
        ▼
    If final match complete:
      - UPDATE tournaments SET status = 'completed', winner_entry_id
```

**Tables read:**
- `events` - Current gameweek status
- `rounds` - Active rounds
- `tournaments` - Active tournaments
- `match_picks` - Entries needing scores
- `participants` - Seeds for tiebreaks

**Tables written:**
- `picks` - Authoritative score records (FPL Records)
- `matches` - Winners, status
- `match_picks` - Next round assignments
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
