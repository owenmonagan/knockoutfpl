# FPL Test Fixtures Infrastructure Design

> **Created:** December 15, 2025
> **Status:** Approved

## Overview

Build a comprehensive testing infrastructure that captures real FPL API data, stores it in Firestore, and provides tools to generate synthetic test scenarios. This enables testing of tournament progression, gameweek completion, and other time-dependent features without relying on live API data.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  LAYER 1: Data Collection (Firebase Function)          │
│  - Scheduled function polls FPL API hourly (11am-11pm) │
│  - Captures complete data for FLOAWO league (634129)   │
│  - Stores snapshots in Firestore `fpl_snapshots`       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  LAYER 2: Local Fixtures (test-fixtures/)              │
│  - CLI tool `npm run fixtures:download` pulls from     │
│    Firestore to local JSON files                       │
│  - Committed to git for offline/CI testing             │
│  - Structure: test-fixtures/scenarios/{name}.json      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  LAYER 3: Test Utilities (src/test-utils/)             │
│  - Fixture loader: loadScenario('gw-finished')         │
│  - Transformers: makeGameweekFinished(), setScores()   │
│  - Mock providers for unit tests, MSW for E2E          │
└─────────────────────────────────────────────────────────┘
```

## Data Collection (Layer 1)

### Polling Schedule

- **Frequency:** Every hour
- **Active hours:** 11:00 to 23:00 GMT (covers all match times with buffer)
- **Snapshots per day:** 13
- **Estimated storage:** ~35MB/day, ~1GB/month

### Complete API Coverage

```typescript
interface FPLSnapshot {
  capturedAt: Timestamp;
  gameweek: number;
  gameweekStatus: 'not_started' | 'in_progress' | 'finished';

  // === GLOBAL DATA ===

  bootstrapStatic: BootstrapResponse;        // /bootstrap-static/
  fixtures: FixtureResponse[];               // /fixtures/
  fixturesCurrentGW: FixtureResponse[];      // /fixtures/?event={gw}
  liveScores: LiveResponse | null;           // /event/{gw}/live/
  eventStatus: EventStatusResponse;          // /event-status/
  dreamTeam: DreamTeamResponse | null;       // /dream-team/{gw}/
  setPieceNotes: SetPieceResponse;           // /team/set-piece-notes/

  // === LEAGUE DATA ===

  leagueStandings: LeagueStandingsResponse;  // /leagues-classic/634129/standings/

  // === PER-TEAM DATA (for each FLOAWO member) ===

  teamData: {
    [teamId: number]: {
      entry: EntryResponse;                  // /entry/{id}/
      history: HistoryResponse;              // /entry/{id}/history/
      transfers: TransferResponse;           // /entry/{id}/transfers/
      picks: {
        [gameweek: number]: PicksResponse;   // /entry/{id}/event/{gw}/picks/
      };
    };
  };

  // === PLAYER DEEP DATA (top 50 owned players) ===

  playerSummaries: {
    [playerId: number]: ElementSummaryResponse;  // /element-summary/{id}/
  };
}
```

### FPL API Endpoints Captured

| Endpoint | Description |
|----------|-------------|
| `/bootstrap-static/` | Players, teams, gameweeks, positions |
| `/fixtures/` | All fixtures with scores and stats |
| `/fixtures/?event={gw}` | Current gameweek fixtures |
| `/event/{gw}/live/` | Live player points |
| `/event-status/` | Bonus processing status |
| `/dream-team/{gw}/` | Best performing XI |
| `/team/set-piece-notes/` | Set piece takers |
| `/leagues-classic/{id}/standings/` | League standings |
| `/entry/{id}/` | Team info |
| `/entry/{id}/history/` | Season history |
| `/entry/{id}/transfers/` | Transfer history |
| `/entry/{id}/event/{gw}/picks/` | Gameweek picks |
| `/element-summary/{id}/` | Player detailed data |

## Local Fixtures (Layer 2)

### Directory Structure

```
test-fixtures/
├── snapshots/                    # Downloaded from Firestore (gitignored)
│   ├── gw16-2025-12-15T14:00.json
│   ├── gw16-2025-12-15T15:00.json
│   └── gw16-2025-12-16T10:00.json
│
├── scenarios/                    # Curated test scenarios (committed)
│   ├── gw-not-started.json       # Before deadline
│   ├── gw-in-progress.json       # Matches being played
│   ├── gw-finished.json          # All matches complete
│   ├── tournament-round1.json    # Tournament in round 1
│   ├── tournament-complete.json  # Tournament finished
│   └── tie-scenario.json         # Equal scores (tiebreaker test)
│
└── index.ts                      # Fixture loader + exports
```

### CLI Tools

```bash
# Download latest snapshot
npm run fixtures:download

# Download specific gameweek range
npm run fixtures:download -- --from=gw15 --to=gw17

# List available snapshots in Firestore
npm run fixtures:list

# Create a named scenario from a snapshot
npm run fixtures:scenario gw16-2025-12-15T18:00 gw-finished
```

## Test Utilities (Layer 3)

### Transformer Functions

```typescript
// src/test-utils/fpl-transformers.ts

// Gameweek state transformers
export function makeGameweekFinished(snapshot: FPLSnapshot): FPLSnapshot
export function makeGameweekInProgress(snapshot: FPLSnapshot): FPLSnapshot
export function makeGameweekNotStarted(snapshot: FPLSnapshot): FPLSnapshot

// Score transformers
export function setTeamScore(snapshot: FPLSnapshot, teamId: number, gw: number, score: number): FPLSnapshot
export function setAllScores(snapshot: FPLSnapshot, scores: Record<number, number>): FPLSnapshot

// Tournament state transformers
export function advanceToRound(snapshot: FPLSnapshot, round: number): FPLSnapshot
export function completeTournament(snapshot: FPLSnapshot, winnerId: number): FPLSnapshot

// Edge case helpers
export function createTieScenario(snapshot: FPLSnapshot, team1: number, team2: number, score: number): FPLSnapshot
export function eliminateTeam(snapshot: FPLSnapshot, teamId: number): FPLSnapshot
```

### Mock Provider (Unit Tests)

```typescript
// src/test-utils/fpl-mock-provider.ts

export function mockFPLService(snapshot: FPLSnapshot) {
  vi.mocked(getFPLTeamInfo).mockImplementation((teamId) =>
    Promise.resolve(extractTeamInfo(snapshot, teamId))
  );
  vi.mocked(getLeagueStandings).mockImplementation((leagueId) =>
    Promise.resolve(extractLeagueStandings(snapshot))
  );
  // ... all FPL functions
}
```

### MSW Handlers (E2E Tests)

```typescript
// src/test-utils/msw-handlers.ts

export function createFPLHandlers(snapshot: FPLSnapshot) {
  return [
    http.get('/api/fpl/bootstrap-static/', () =>
      HttpResponse.json(snapshot.bootstrapStatic)
    ),
    http.get('/api/fpl/entry/:teamId/', ({ params }) =>
      HttpResponse.json(snapshot.teamData[params.teamId].entry)
    ),
    http.get('/api/fpl/leagues-classic/:leagueId/standings/', () =>
      HttpResponse.json(snapshot.leagueStandings)
    ),
    // ... all endpoints
  ];
}
```

### E2E Test Example

```typescript
// e2e/tournament-progression.spec.ts

test('should advance tournament when gameweek finishes', async ({ page }) => {
  const snapshot = loadScenario('gw-in-progress');
  const finishedSnapshot = makeGameweekFinished(snapshot);

  await useMSWHandlers(page, createFPLHandlers(finishedSnapshot));

  await page.goto('/league/634129');
  await expect(page.getByText('Round 1 Complete')).toBeVisible();
});
```

### Dev Mode (Demo Mode)

```bash
# Run dev server with mock FPL data
VITE_DEMO_MODE=true npm run dev
```

```typescript
// vite.config.ts - only in development
if (process.env.VITE_DEMO_MODE) {
  const demoSnapshot = loadScenario('tournament-round1');
  setupMSW(createFPLHandlers(demoSnapshot));
}
```

## Implementation Order

### Phase 1: Data Collection Infrastructure
1. Create `FPLSnapshot` TypeScript types
2. Build Firebase function `captureFloawoSnapshot`
3. Set up Pub/Sub schedule (hourly 11:00-23:00 GMT)
4. Deploy and verify snapshots are being stored

### Phase 2: Local Fixtures Tooling
5. Create `test-fixtures/` directory structure
6. Build CLI tool `fixtures:download`
7. Build CLI tool `fixtures:list`
8. Create initial curated scenarios from first snapshots

### Phase 3: Test Utilities
9. Build transformer functions (`makeGameweekFinished`, etc.)
10. Build `mockFPLService()` provider for unit tests
11. Migrate existing FPL service tests to use fixtures

### Phase 4: E2E & Dev Mode
12. Set up MSW handlers
13. Integrate MSW with Playwright E2E tests
14. Add `VITE_DEMO_MODE` for local development

## Test League Configuration

- **League:** FLOAWO
- **League ID:** 634129
- **Members:** 15 teams
- **FPL Team ID (primary):** 158256

## Success Criteria

- [ ] Firebase function captures snapshots hourly during active hours
- [ ] Snapshots contain all documented API data
- [ ] CLI tools can download and manage fixtures locally
- [ ] Transformer functions can mutate snapshots for test scenarios
- [ ] Unit tests use `mockFPLService()` with fixture data
- [ ] E2E tests use MSW to intercept FPL API calls
- [ ] Dev mode runs entirely on mock data

## References

- [FPL APIs Explained | Oliver Looney](https://www.oliverlooney.com/blogs/FPL-APIs-Explained)
- [Fantasy Premier League API Endpoints Guide | Medium](https://medium.com/@frenzelts/fantasy-premier-league-api-endpoints-a-detailed-guide-acbd5598eb19)
