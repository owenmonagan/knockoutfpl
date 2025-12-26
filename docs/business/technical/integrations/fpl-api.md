# FPL API Integration

> **Status:** DRAFT - needs endpoint verification and error documentation
> **Last Updated:** December 2025

---

## Overview

The Fantasy Premier League API is an unofficial public API. It powers the official FPL website and is not officially documented or supported.

**Base URL:** `https://fantasy.premierleague.com/api/`

**Key Characteristics:**
- Public, no authentication required
- CORS blocked (must proxy via Cloud Functions)
- Rate limits undocumented (be conservative)
- Can change without notice

---

## Endpoints Used (DRAFT)

<!-- TODO: Verify these match src/services/fpl.ts -->

### Bootstrap Static

**URL:** `/bootstrap-static/`

**Purpose:** Get global FPL data including current gameweek

**Used for:**
- Determine current/next gameweek
- Check if gameweek is finished
- Get player data (names, teams, positions)

**Response structure (relevant fields):**

```typescript
interface BootstrapStatic {
  events: Event[];           // Gameweeks
  teams: Team[];             // Premier League teams
  elements: Player[];        // All players
}

interface Event {
  id: number;                // Gameweek number (1-38)
  name: string;              // "Gameweek 1"
  deadline_time: string;     // ISO timestamp
  is_current: boolean;
  is_next: boolean;
  finished: boolean;
}
```

---

### Team Entry

**URL:** `/entry/{teamId}/`

**Purpose:** Get team info and mini-leagues

**Used for:**
- Verify FPL Team ID exists
- Get team name
- Get user's mini-leagues

**Response structure (relevant fields):**

```typescript
interface Entry {
  id: number;                // Team ID
  name: string;              // Team name
  player_first_name: string;
  player_last_name: string;
  leagues: {
    classic: MiniLeague[];   // Classic mini-leagues
  };
}

interface MiniLeague {
  id: number;                // League ID
  name: string;              // League name
  entry_rank: number;        // User's rank in league
}
```

---

### Gameweek Picks

**URL:** `/entry/{teamId}/event/{gameweek}/picks/`

**Purpose:** Get team's picks and score for a gameweek

**Used for:**
- Fetch gameweek scores
- Determine match winners

**Response structure (relevant fields):**

```typescript
interface GameweekPicks {
  entry_history: {
    points: number;          // Total GW points
    event_transfers_cost: number;  // Transfer hit
  };
  picks: Pick[];             // Selected players
  active_chip: string | null; // "bboost", "3xc", "freehit", "wildcard"
}
```

---

### League Standings

**URL:** `/leagues-classic/{leagueId}/standings/`

**Purpose:** Get league standings for bracket seeding

**Used for:**
- Fetch all league members
- Determine seeding order

**Response structure (relevant fields):**

```typescript
interface LeagueStandings {
  league: {
    id: number;
    name: string;
  };
  standings: {
    results: Standing[];
  };
}

interface Standing {
  entry: number;             // FPL Team ID
  entry_name: string;        // Team name
  player_name: string;       // Manager name
  rank: number;              // Current rank
  total: number;             // Total points
}
```

---

## Data Transformations (DRAFT)

<!-- TODO: Verify these match implementation -->

### FPL → Our Types

| FPL Field | Our Field | Transformation |
|-----------|-----------|----------------|
| `entry.id` | `fplTeamId` | Direct |
| `entry.name` | `fplTeamName` | Direct |
| `standing.rank` | `seed` | Inverted (1 = best) |
| `entry_history.points` | `score` | Direct |

---

## CORS & Proxying (DRAFT)

<!-- TODO: Verify Cloud Function implementation -->

**Problem:** FPL API has CORS restrictions, can't call directly from browser.

**Solution:** Cloud Functions proxy

```
Browser → Cloud Function → FPL API → Cloud Function → Browser
```

**Implementation:**
- Cloud Function `fplProxy` accepts endpoint and params
- Fetches from FPL API
- Returns response to client

---

## Rate Limits (DRAFT)

<!-- TODO: Research and document actual limits -->

**Official limits:** Not documented

**Observed behavior:**
- Aggressive requests may get rate-limited
- No known ban for reasonable usage

**Our approach:**
- Cache aggressively
- Don't poll excessively
- Batch requests where possible

---

## Failure Modes (DRAFT)

<!-- TODO: Document actual error handling -->

| Error | Cause | Handling |
|-------|-------|----------|
| 404 | Team/league doesn't exist | Show user-friendly error |
| 503 | FPL maintenance | Retry with backoff |
| Timeout | Slow response | Retry with backoff |
| CORS error | Proxy misconfigured | Check Cloud Function |
| Rate limited | Too many requests | Back off, retry later |

---

## Caching Strategy (DRAFT)

<!-- TODO: Document caching implementation -->

| Endpoint | Cache | Reason |
|----------|-------|--------|
| Bootstrap static | 1 hour | Changes rarely during GW |
| Team entry | Short (5 min) | Team name rarely changes |
| GW picks (complete GW) | Permanent | Scores are final |
| GW picks (active GW) | None | Scores change |
| League standings | At creation only | Snapshot for seeding |

---

## API Reliability Risks (DRAFT)

<!-- TODO: Plan mitigations -->

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| API changes structure | Low | High | Monitor, test regularly |
| API becomes private | Very Low | Critical | No good mitigation |
| Rate limiting | Medium | Medium | Cache, backoff |
| Downtime during GW | Low | High | Queue and retry |

---

## Testing (DRAFT)

<!-- TODO: Document testing approach -->

**Local development:**
- Use Vite proxy to bypass CORS
- Can hit live FPL API

**E2E tests:**
- Use fixtures to mock FPL responses
- Don't hit live API in tests

**Production:**
- Cloud Functions proxy
- Monitor for failures

---

## Related

- [../data/data-flow.md](../data/data-flow.md) - How FPL data flows through system
- [../../product/specs/functional-spec.md](../../product/specs/functional-spec.md) - How we use FPL data
- [../architecture.md](../architecture.md) - System architecture
