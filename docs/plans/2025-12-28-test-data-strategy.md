# Test Data Strategy

**Date:** 2025-12-28
**Status:** Active

---

## Overview

This document defines the FPL API response shapes needed for testing tournament creation and progression, and how to source realistic test data.

---

## Data Sources

### 1. Live FPL API Snapshots

Captured via `functions/src/snapshotCapture.ts` and stored in `test-fixtures/snapshots/`.

**Current snapshots:**
- `gw16-2025-12-15T23-00.json` - GW16 in-progress (5.5MB)

**To capture:**
- GW18 in-progress (current state)
- GW18 finished (after bonus added)

### 2. Historical Picks

For any completed gameweek, we can fetch:
- `/api/entry/{id}/event/{gw}/picks/` - Final scores with `entry_history.points`
- `/api/entry/{id}/history/` - All gameweek summaries

### 3. Fabricated Edge Cases

For scenarios that may not occur naturally (exact tiebreakers), we create modified versions of real data.

---

## API Response Shapes

### 1. Bootstrap Static (Gameweek Status)

**Endpoint:** `GET /api/bootstrap-static/`

**Used for:** Determining current gameweek, checking if finished

```typescript
interface BootstrapResponse {
  events: Array<{
    id: number;              // Gameweek number (1-38)
    name: string;            // "Gameweek 18"
    is_current: boolean;     // True for active GW
    is_next: boolean;        // True for upcoming GW
    finished: boolean;       // True when all matches done + bonus added
    deadline_time: string;   // ISO timestamp
  }>;
  // ... teams, elements, element_types (not needed for tournament logic)
}
```

**Key fields for testing:**
- `events[].is_current` - Find active gameweek
- `events[].finished` - Trigger round resolution

**Example (GW18 current, not finished):**
```json
{
  "id": 18,
  "name": "Gameweek 18",
  "is_current": true,
  "is_next": false,
  "finished": false,
  "deadline_time": "2025-12-26T18:30:00Z"
}
```

---

### 2. Fixtures (Match Status)

**Endpoint:** `GET /api/fixtures/?event={gw}`

**Used for:** Determining gameweek progress (not_started/in_progress/finished)

```typescript
interface FixtureResponse {
  id: number;
  event: number;           // Gameweek number
  team_h: number;          // Home team ID
  team_a: number;          // Away team ID
  team_h_score: number | null;
  team_a_score: number | null;
  started: boolean;        // Kickoff passed
  finished: boolean;       // 90+ minutes done
  minutes: number;         // Match minute
  kickoff_time: string;    // ISO timestamp
}
```

**Gameweek status logic:**
```typescript
function determineGameweekStatus(fixtures: FixtureResponse[]): GameweekStatus {
  if (fixtures.length === 0) return 'not_started';
  if (fixtures.every(f => f.finished)) return 'finished';
  if (fixtures.some(f => f.started)) return 'in_progress';
  return 'not_started';
}
```

---

### 3. League Standings (Tournament Creation)

**Endpoint:** `GET /api/leagues-classic/{league_id}/standings/`

**Used for:** Getting participants for tournament creation

```typescript
interface LeagueStandingsResponse {
  league: {
    id: number;
    name: string;          // "FLOAWO"
  };
  standings: {
    results: Array<{
      entry: number;       // FPL Team ID (e.g., 158256)
      entry_name: string;  // Team name (e.g., "O-win")
      player_name: string; // Manager name (e.g., "Owen Monagan")
      rank: number;        // Current league rank (for seeding)
      total: number;       // Total points
    }>;
  };
}
```

**Key fields for testing:**
- `standings.results[].entry` - Entry IDs for participants
- `standings.results[].rank` - Determines tournament seeding

**Example (FLOAWO - 15 participants):**
```json
{
  "league": { "id": 634129, "name": "FLOAWO" },
  "standings": {
    "results": [
      { "entry": 158256, "entry_name": "O-win", "player_name": "Owen Monagan", "rank": 1, "total": 1098 },
      { "entry": 7576365, "entry_name": "Califiorication", "player_name": "Enda Cawley", "rank": 2, "total": 1078 },
      // ... 13 more
    ]
  }
}
```

---

### 4. Entry (Team Info)

**Endpoint:** `GET /api/entry/{team_id}/`

**Used for:** Validating team exists, getting team metadata

```typescript
interface EntryResponse {
  id: number;                    // Team ID
  name: string;                  // Team name
  player_first_name: string;
  player_last_name: string;
  summary_overall_points: number;
  summary_overall_rank: number;
  summary_event_points: number;  // Current GW points (live)
  summary_event_rank: number;
  last_deadline_value: number;   // Team value in tenths (1042 = 104.2m)
}
```

---

### 5. Picks (Gameweek Scores) - CRITICAL

**Endpoint:** `GET /api/entry/{team_id}/event/{gw}/picks/`

**Used for:** Getting final scores for match resolution

```typescript
interface PicksResponse {
  picks: Array<{
    element: number;       // Player ID
    position: number;      // 1-15
    multiplier: number;    // 1, 2 (captain), 3 (triple captain)
    is_captain: boolean;
    is_vice_captain: boolean;
  }>;
  entry_history: {
    event: number;         // Gameweek number
    points: number;        // GW POINTS (key field!)
    total_points: number;  // Cumulative
    rank: number;          // GW rank
    overall_rank: number;  // Overall rank
    bank: number;          // Money in bank (tenths)
    value: number;         // Team value (tenths)
    event_transfers: number;
    event_transfers_cost: number;  // Hit points
    points_on_bench: number;
  };
  active_chip: string | null;  // "bboost", "3xc", "freehit", "wildcard"
}
```

**Key field for match resolution:**
- `entry_history.points` - THE SCORE used to determine match winners

**Completed GW17 example:**
```json
{
  "entry_history": {
    "event": 17,
    "points": 84,
    "total_points": 1048,
    "rank": 2245564,
    "overall_rank": 289577,
    "event_transfers_cost": 0,
    "points_on_bench": 5
  },
  "active_chip": null
}
```

**In-progress GW18 example:**
```json
{
  "entry_history": {
    "event": 18,
    "points": 50,           // LIVE - will change!
    "total_points": 1098,
    "rank": 940576,
    "overall_rank": 203382,
    "event_transfers_cost": 0,
    "points_on_bench": 14
  },
  "active_chip": "freehit"
}
```

---

### 6. History (All Gameweeks)

**Endpoint:** `GET /api/entry/{team_id}/history/`

**Used for:** Getting all historical scores at once

```typescript
interface HistoryResponse {
  current: Array<{
    event: number;           // Gameweek
    points: number;          // GW points
    total_points: number;
    rank: number;            // GW rank
    overall_rank: number;
  }>;
  chips: Array<{
    name: string;            // "wildcard", "bboost", "3xc", "freehit"
    event: number;           // GW used
  }>;
}
```

**Example:**
```json
{
  "current": [
    { "event": 14, "points": 72, "total_points": 856, "overall_rank": 128201 },
    { "event": 15, "points": 40, "total_points": 896, "overall_rank": 245613 },
    { "event": 16, "points": 68, "total_points": 964, "overall_rank": 314572 },
    { "event": 17, "points": 84, "total_points": 1048, "overall_rank": 289577 },
    { "event": 18, "points": 50, "total_points": 1098, "overall_rank": 203382 }
  ],
  "chips": [
    { "name": "wildcard", "event": 3 },
    { "name": "bboost", "event": 11 },
    { "name": "3xc", "event": 13 },
    { "name": "freehit", "event": 18 }
  ]
}
```

---

## Test Scenarios and Data Requirements

### Scenario 1: Tournament Creation (8-player)

**Data needed:**
- `LeagueStandingsResponse` with 8 entries
- `BootstrapResponse` to get current gameweek (start event)

**Mock approach:**
- Subset FLOAWO to first 8 participants
- Use real standings data

---

### Scenario 2: Tournament Creation (12-player with byes)

**Data needed:**
- `LeagueStandingsResponse` with 12 entries
- Same bootstrap

**Mock approach:**
- Subset FLOAWO to first 12 participants

---

### Scenario 3: Round Resolution (GW Complete)

**Data needed:**
- `BootstrapResponse` with `events[current].finished = true`
- `FixtureResponse[]` with all `finished = true`
- `PicksResponse` for each entry in active matches

**Mock approach:**
- Use GW17 data (completed) as template
- Fetch picks for all FLOAWO entries for GW17

---

### Scenario 4: Tiebreaker Resolution

**Data needed:**
- Two entries with identical `entry_history.points`

**Mock approach:**
- Take real picks data
- Modify one entry's points to match another
- Verify lower seed wins

---

### Scenario 5: Full Tournament Completion

**Data needed:**
- Multiple gameweeks of completed picks data
- Simulated progression through rounds

**Mock approach:**
- Use GW14-17 (4 completed weeks) for a 4-round tournament
- Real scores from history

---

### Scenario 6: Mid-Tournament State

**Data needed:**
- Round 1 picks (complete)
- Round 2 in active state

**Mock approach:**
- GW17 complete, GW18 active
- Current live data perfect for this

---

## Data Capture Commands

### Capture Current Snapshot

```bash
# From functions directory
npm run snapshot:capture

# Or using Cloud Function
curl -X POST https://your-project.cloudfunctions.net/captureSnapshot
```

### Download Snapshots Locally

```bash
# List available snapshots
npm run fixtures:list

# Download specific snapshot
npm run fixtures:download -- --id=gw18-2025-12-28T12-00
```

### Fetch Specific Data

```bash
# Fetch picks for all FLOAWO entries for GW17
for id in 158256 7576365 7033782 69686 3207410 692797 2449985 3095749 8031934 122712 3237008 71631 8484974 3798157 6537495; do
  curl -s "https://fantasy.premierleague.com/api/entry/$id/event/17/picks/" > "picks-$id-gw17.json"
done
```

---

## Test Data Files to Create

### 1. `test-fixtures/scenarios/tournament-creation-8.json`

8 entries from FLOAWO with GW18 as start event.

### 2. `test-fixtures/scenarios/tournament-creation-12.json`

12 entries from FLOAWO with byes for top 4 seeds.

### 3. `test-fixtures/scenarios/round-resolution-gw17.json`

All 15 FLOAWO entries with GW17 picks (completed).

### 4. `test-fixtures/scenarios/tiebreaker.json`

Two entries with identical points, different seeds.

### 5. `test-fixtures/scenarios/full-tournament-4-rounds.json`

GW14-17 picks for 16 simulated entries (power of 2).

### 6. `test-fixtures/scenarios/mid-tournament.json`

GW17 complete + GW18 in-progress for transition testing.

---

## FLOAWO Participants Reference

| Seed | Entry ID | Team Name | Manager |
|------|----------|-----------|---------|
| 1 | 158256 | O-win | Owen Monagan |
| 2 | 7576365 | Califiorication | Enda Cawley |
| 3 | 7033782 | MaduekeGentileMaduek | Jamie Boyd |
| 4 | 69686 | The Rusty Creamers | Killian Ross O'Crowley |
| 4 | 3207410 | Banging Slots | Olivier Welaratne |
| 6 | 692797 | Neymar Nay Less | Damhán Lloyd-Keogh |
| 7 | 2449985 | Gibberpool | Tom Gibbs |
| 8 | 3095749 | Eze OnASundayMorning | Alex Simonin |
| 9 | 8031934 | Tinchy Sneijder | Tom Crampton |
| 10 | 122712 | Eze Lover | Stephen Sheehy |
| 11 | 3237008 | Kinder Mbeumo | Oisin Tiernan |
| 12 | 71631 | Cucu cucurella | David Stead |
| 13 | 8484974 | Caliaforication | Nicolas Welaratne |
| 14 | 3798157 | Men with Van de Ven | Richard Connon |
| 15 | 6537495 | Grateful Red | Edward Prindiville |

---

## Next Steps

1. **Capture GW18 snapshot now** (in-progress state)
2. **Capture GW18 when finished** (after bonus added, ~2 hours after last match)
3. **Fetch GW17 picks for all entries** (completed scores)
4. **Create scenario files** from captured data
5. **Implement fixture loader** for integration tests

---

## Related

- [test-fixtures/README.md](../../test-fixtures/README.md) - Fixture infrastructure
- [test-strategy-design.md](./2025-12-28-test-strategy-design.md) - Test organization
- [data-flow.md](../business/technical/data/data-flow.md) - How data moves through system
