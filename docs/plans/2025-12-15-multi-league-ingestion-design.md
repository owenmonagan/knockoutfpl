# Multi-League Support & Historical Backfill Design

**Date:** 2025-12-15
**Status:** Approved

## Overview

Extend the FPL data ingestion service to support multiple mini-leagues with historical backfill on initialization. Uses normalized storage to separate global FPL data from league-specific data.

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Storage model | Normalized (global + league) | Avoids duplicating bootstrap/fixtures across leagues |
| Historical data | Scores + picks per gameweek | Enables captain/chip analysis, full squad history |
| League config | Firestore collection | Enables tracking backfill state, no redeploy needed |
| Data freshness | Point-in-time snapshots | Compare snapshots to see changes over time |
| Rate limiting | 1 req/sec during backfill | Conservative, spread over background runs |
| Ingestion trigger | Single function, every 15 min | Processes leagues by staleness priority until timeout |
| Global refresh | Once per hour max | Expensive shared data doesn't need frequent updates |
| Finished gameweeks | Never re-fetch | Data is immutable once GW concludes |

## Data Model

### Collections

```
Firestore:
├── tracked_leagues/{leagueId}     # League config & state
├── global_snapshots/gw{N}         # Shared FPL data per gameweek
│   └── elements/chunk_{N}         # Player data (chunked)
└── league_snapshots/{leagueId}_gw{N}  # Per-league per-GW data
    └── teams/{teamId}             # Per-team data
```

### tracked_leagues/{leagueId}

```typescript
interface TrackedLeague {
  leagueId: number;
  name: string;
  addedAt: Timestamp;
  addedBy: string;
  enabled: boolean;

  // Capture state
  capturedGameweeks: number[];    // e.g., [1,2,3,4,5]
  lastCaptureAt: Timestamp | null;

  // Metadata
  teamCount: number;

  // Error tracking
  lastError: string | null;
  lastErrorAt: Timestamp | null;
  consecutiveErrors: number;
}
```

### global_snapshots/gw{N}

```typescript
interface GlobalSnapshot {
  gameweek: number;
  capturedAt: Timestamp;
  gameweekStatus: 'not_started' | 'in_progress' | 'finished';

  bootstrap: {
    events: FPLEvent[];
    teams: FPLTeam[];
    element_types: FPLElementType[];
    // elements in subcollection (too large)
  };
  fixtures: FixtureResponse[];
  liveScores: LiveResponse | null;
  eventStatus: EventStatusResponse;
  dreamTeam: DreamTeamResponse | null;
  setPieceNotes: SetPieceResponse;
}
```

### league_snapshots/{leagueId}_gw{N}

```typescript
interface LeagueSnapshot {
  leagueId: number;
  gameweek: number;
  capturedAt: Timestamp;
  standings: LeagueStandingsResponse;
  // teams in subcollection
}

// teams/{teamId} subcollection document
interface TeamSnapshot {
  entry: EntryResponse;
  history: HistoryResponse;
  picks: PicksResponse | null;
  transfers: TransferResponse;
}
```

## Ingestion Flow

### Main Function (every 15 minutes)

```typescript
async function runIngestion() {
  const startTime = Date.now();
  const MAX_RUNTIME_MS = 8 * 60 * 1000; // 8 min (1 min buffer)

  const currentGW = await getCurrentGameweek();

  // Global snapshot: refresh if >1 hour old and GW in progress
  await ensureGlobalSnapshot(currentGW);

  // Get enabled leagues, ordered by staleness
  const leagues = await getLeaguesNeedingWork();

  for (const league of leagues) {
    if (isNearTimeout(startTime, MAX_RUNTIME_MS)) break;
    if (shouldSkipLeague(league)) continue; // 5+ consecutive errors

    await processLeagueSafely(league, currentGW);
  }
}
```

### Work Determination

```typescript
function determineWork(league: TrackedLeague, currentGW: number, gwStatus: string) {
  const capturedGWs = league.capturedGameweeks || [];
  const finishedGWs = getFinishedGameweeks(); // From bootstrap events

  // Missing = finished GWs we don't have
  const missingGWs = finishedGWs.filter(gw => !capturedGWs.includes(gw));

  if (missingGWs.length > 0) {
    return { type: 'backfill', missingGameweeks: missingGWs };
  }

  // Current GW: capture if in_progress OR (finished but not yet captured)
  const hasCurrentGW = capturedGWs.includes(currentGW);
  const currentGWFinished = gwStatus === 'finished';

  if (!hasCurrentGW && (gwStatus === 'in_progress' || currentGWFinished)) {
    return { type: 'current_gw' };
  }

  return { type: 'none' }; // Fully up to date
}
```

### Capture Logic Summary

| Scenario | Action |
|----------|--------|
| Missing finished GWs | Backfill (1 GW at a time, resumable) |
| Current GW in_progress, not captured | Capture |
| Current GW finished, not captured | Capture once |
| Current GW already captured, finished | Skip (immutable) |
| All GWs captured | Skip league this run |

### Global Snapshot Refresh

| GW Status | Last Capture | Action |
|-----------|--------------|--------|
| `finished` | Any | Never update |
| `in_progress` | <1 hour ago | Skip |
| `in_progress` | >1 hour ago | Refresh live scores |
| `not_started` | Any | Check if started |

## Backfill Process

### Incremental & Resumable

```typescript
async function processBackfill(league, missingGWs, startTime, maxRuntime) {
  const teamIds = await getLeagueTeamIds(league.leagueId);

  for (const gw of missingGWs.sort((a, b) => a - b)) {
    if (isNearTimeout(startTime, maxRuntime)) {
      // Will resume next run
      return;
    }

    await ensureGlobalSnapshot(gw);
    await captureLeagueGameweek(league.leagueId, gw, teamIds);
    await updateLeagueCapturedGameweeks(league.leagueId, gw);
  }
}
```

### Rate Limiting

- 1 second delay between team fetches
- ~20 seconds per gameweek for 20-team league
- Backfill spreads across multiple 15-minute runs
- No impact on real-time operations

## Adding a New League

```typescript
async function addTrackedLeague(leagueId: number, userId: string) {
  // Validate league exists
  const standings = await fetchLeagueStandings(leagueId);

  await db.doc(`tracked_leagues/${leagueId}`).set({
    leagueId,
    name: standings.league.name,
    addedAt: Timestamp.now(),
    addedBy: userId,
    enabled: true,
    capturedGameweeks: [],  // Empty triggers backfill
    lastCaptureAt: null,
    teamCount: standings.standings.results.length,
    lastError: null,
    lastErrorAt: null,
    consecutiveErrors: 0,
  });
}
```

**Flow after adding:**
1. League document created with empty `capturedGameweeks`
2. Next ingestion run sees missing GWs
3. Backfill processes automatically
4. Progress saved after each GW (resumable)

## Error Handling

### Per-League Error Tracking

```typescript
// On failure
await db.doc(`tracked_leagues/${leagueId}`).update({
  lastError: errorMsg,
  lastErrorAt: Timestamp.now(),
  consecutiveErrors: FieldValue.increment(1),
});

// On success
await db.doc(`tracked_leagues/${leagueId}`).update({
  lastError: null,
  consecutiveErrors: 0,
});
```

### Error Responses

| Error | Action |
|-------|--------|
| FPL API 429 | Retry with exponential backoff |
| FPL API 5xx | Retry with backoff |
| FPL API 404 | Log, skip league, increment errors |
| 5+ consecutive failures | Skip league until manual reset |

## Migration from Current System

### Current State
- Single hardcoded league (FLOAWO: 634129)
- Flat snapshots in `fpl_snapshots/` collection
- No backfill capability

### Migration Steps
1. Deploy new collections (`tracked_leagues`, `global_snapshots`, `league_snapshots`)
2. Add FLOAWO as first tracked league
3. Run backfill to populate historical data
4. Deprecate old `fpl_snapshots` collection
5. Update any code reading from old collection

## API Calls per Operation

### Regular Capture (per league, current GW)
- 1 league standings
- N team entries
- N team histories
- N team picks
- **Total: 1 + 3N calls** (N = team count)

### Backfill (per league, per GW)
- Same as above per GW
- **Total: (1 + 3N) × missing_GWs calls**

### Global Snapshot
- bootstrap-static, fixtures, event-status, set-piece-notes
- live-scores, dream-team (if GW started)
- **Total: 4-6 calls per refresh**

## Firestore Indexes Needed

```json
{
  "indexes": [
    {
      "collectionGroup": "tracked_leagues",
      "fields": [
        { "fieldPath": "enabled", "order": "ASCENDING" },
        { "fieldPath": "lastCaptureAt", "order": "ASCENDING" }
      ]
    }
  ]
}
```

## Future Considerations

- **Admin UI:** Manage tracked leagues, view backfill progress
- **Webhooks:** Notify when backfill completes
- **Data retention:** Archive old snapshots to cold storage
- **Cross-league analytics:** Compare performance across leagues
