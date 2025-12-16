# FPL Test Fixtures Infrastructure Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a comprehensive testing infrastructure that captures real FPL API data, stores it in Firestore, and provides tools to generate synthetic test scenarios for testing tournament progression, gameweek completion, and other time-dependent features.

**Architecture:** Three-layer approach: (1) Firebase scheduled function captures hourly FPL API snapshots to Firestore, (2) CLI tools download snapshots to local JSON files for offline testing, (3) Test utilities provide fixture loaders, transformers, and mock providers for unit and E2E tests.

**Tech Stack:** Firebase Functions v2, Firestore, Vitest, Playwright, MSW (Mock Service Worker), TypeScript

---

## Phase 1: Data Collection Infrastructure

### Task 1: Create FPLSnapshot TypeScript Types

**Files:**
- Create: `functions/src/types/fpl-snapshot.ts`
- Test: `functions/src/types/fpl-snapshot.test.ts`

**Step 1: Write test for FPLSnapshot type validation**

```typescript
// functions/src/types/fpl-snapshot.test.ts
import { describe, it, expect } from 'vitest';
import { validateFPLSnapshot, FPLSnapshot } from './fpl-snapshot';

describe('FPLSnapshot Types', () => {
  it('validates a minimal valid snapshot', () => {
    const snapshot: FPLSnapshot = {
      capturedAt: new Date(),
      gameweek: 16,
      gameweekStatus: 'in_progress',
      bootstrapStatic: { events: [], elements: [], teams: [], element_types: [] },
      fixtures: [],
      fixturesCurrentGW: [],
      liveScores: null,
      eventStatus: { status: [], leagues: '' },
      dreamTeam: null,
      leagueStandings: { league: { id: 634129 }, standings: { results: [] } },
      teamData: {},
      playerSummaries: {},
    };

    expect(validateFPLSnapshot(snapshot)).toBe(true);
  });

  it('validates gameweekStatus enum values', () => {
    expect(['not_started', 'in_progress', 'finished']).toContain('in_progress');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd functions && npm test -- --run fpl-snapshot.test.ts`
Expected: FAIL with "Cannot find module"

**Step 3: Write minimal type definitions**

```typescript
// functions/src/types/fpl-snapshot.ts
import { Timestamp } from 'firebase-admin/firestore';

export type GameweekStatus = 'not_started' | 'in_progress' | 'finished';

export interface BootstrapStaticResponse {
  events: any[];
  elements: any[];
  teams: any[];
  element_types: any[];
}

export interface FixtureResponse {
  id: number;
  event: number;
  team_h: number;
  team_a: number;
  started: boolean;
  finished: boolean;
  minutes: number;
}

export interface LiveResponse {
  elements: Array<{
    id: number;
    stats: { total_points: number };
  }>;
}

export interface EventStatusResponse {
  status: any[];
  leagues: string;
}

export interface DreamTeamResponse {
  team: any[];
}

export interface LeagueStandingsResponse {
  league: { id: number; name?: string };
  standings: {
    results: Array<{
      entry: number;
      entry_name: string;
      player_name: string;
      rank: number;
      total: number;
    }>;
  };
}

export interface EntryResponse {
  id: number;
  name: string;
  player_first_name: string;
  player_last_name: string;
  summary_overall_points: number;
  summary_overall_rank: number;
}

export interface HistoryResponse {
  current: any[];
  past: any[];
  chips: any[];
}

export interface TransferResponse {
  element_in: number;
  element_out: number;
  event: number;
}

export interface PicksResponse {
  picks: any[];
  entry_history: {
    event: number;
    points: number;
    total_points: number;
  };
  active_chip: string | null;
}

export interface ElementSummaryResponse {
  fixtures: any[];
  history: any[];
  history_past: any[];
}

export interface TeamDataEntry {
  entry: EntryResponse;
  history: HistoryResponse;
  transfers: TransferResponse[];
  picks: Record<number, PicksResponse>;
}

export interface FPLSnapshot {
  capturedAt: Date | Timestamp;
  gameweek: number;
  gameweekStatus: GameweekStatus;

  // Global data
  bootstrapStatic: BootstrapStaticResponse;
  fixtures: FixtureResponse[];
  fixturesCurrentGW: FixtureResponse[];
  liveScores: LiveResponse | null;
  eventStatus: EventStatusResponse;
  dreamTeam: DreamTeamResponse | null;

  // League data
  leagueStandings: LeagueStandingsResponse;

  // Per-team data
  teamData: Record<number, TeamDataEntry>;

  // Player deep data
  playerSummaries: Record<number, ElementSummaryResponse>;
}

export function validateFPLSnapshot(snapshot: FPLSnapshot): boolean {
  return (
    snapshot.capturedAt !== undefined &&
    typeof snapshot.gameweek === 'number' &&
    ['not_started', 'in_progress', 'finished'].includes(snapshot.gameweekStatus)
  );
}
```

**Step 4: Run test to verify it passes**

Run: `cd functions && npm test -- --run fpl-snapshot.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add functions/src/types/fpl-snapshot.ts functions/src/types/fpl-snapshot.test.ts
git commit -m "$(cat <<'EOF'
feat(functions): add FPLSnapshot TypeScript types

Define comprehensive type definitions for FPL API snapshot data
including bootstrap, fixtures, live scores, team data, and player
summaries. Includes validation helper function.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Create FPL API Fetcher Module

**Files:**
- Create: `functions/src/fpl/fetcher.ts`
- Test: `functions/src/fpl/fetcher.test.ts`

**Step 1: Write test for fetchBootstrapStatic**

```typescript
// functions/src/fpl/fetcher.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchBootstrapStatic } from './fetcher';

describe('FPL Fetcher', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches bootstrap-static data', async () => {
    const mockData = { events: [{ id: 1 }], elements: [], teams: [], element_types: [] };
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    } as Response);

    const result = await fetchBootstrapStatic();

    expect(fetch).toHaveBeenCalledWith('https://fantasy.premierleague.com/api/bootstrap-static/');
    expect(result.events).toHaveLength(1);
  });

  it('throws on fetch error', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    await expect(fetchBootstrapStatic()).rejects.toThrow('Failed to fetch bootstrap-static');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd functions && npm test -- --run fetcher.test.ts`
Expected: FAIL with "Cannot find module"

**Step 3: Write minimal implementation**

```typescript
// functions/src/fpl/fetcher.ts
const FPL_API_BASE = 'https://fantasy.premierleague.com/api';

export async function fetchBootstrapStatic(): Promise<any> {
  const response = await fetch(`${FPL_API_BASE}/bootstrap-static/`);
  if (!response.ok) {
    throw new Error(`Failed to fetch bootstrap-static: ${response.status}`);
  }
  return response.json();
}

export async function fetchFixtures(): Promise<any[]> {
  const response = await fetch(`${FPL_API_BASE}/fixtures/`);
  if (!response.ok) {
    throw new Error(`Failed to fetch fixtures: ${response.status}`);
  }
  return response.json();
}

export async function fetchFixturesForGameweek(gameweek: number): Promise<any[]> {
  const response = await fetch(`${FPL_API_BASE}/fixtures/?event=${gameweek}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch fixtures for GW${gameweek}: ${response.status}`);
  }
  return response.json();
}

export async function fetchLiveScores(gameweek: number): Promise<any> {
  const response = await fetch(`${FPL_API_BASE}/event/${gameweek}/live/`);
  if (!response.ok) {
    throw new Error(`Failed to fetch live scores for GW${gameweek}: ${response.status}`);
  }
  return response.json();
}

export async function fetchEventStatus(): Promise<any> {
  const response = await fetch(`${FPL_API_BASE}/event-status/`);
  if (!response.ok) {
    throw new Error(`Failed to fetch event status: ${response.status}`);
  }
  return response.json();
}

export async function fetchDreamTeam(gameweek: number): Promise<any> {
  const response = await fetch(`${FPL_API_BASE}/dream-team/${gameweek}/`);
  if (!response.ok) {
    return null; // Dream team not available before gameweek starts
  }
  return response.json();
}

export async function fetchLeagueStandings(leagueId: number): Promise<any> {
  const response = await fetch(`${FPL_API_BASE}/leagues-classic/${leagueId}/standings/`);
  if (!response.ok) {
    throw new Error(`Failed to fetch league ${leagueId} standings: ${response.status}`);
  }
  return response.json();
}

export async function fetchEntry(teamId: number): Promise<any> {
  const response = await fetch(`${FPL_API_BASE}/entry/${teamId}/`);
  if (!response.ok) {
    throw new Error(`Failed to fetch entry ${teamId}: ${response.status}`);
  }
  return response.json();
}

export async function fetchEntryHistory(teamId: number): Promise<any> {
  const response = await fetch(`${FPL_API_BASE}/entry/${teamId}/history/`);
  if (!response.ok) {
    throw new Error(`Failed to fetch entry ${teamId} history: ${response.status}`);
  }
  return response.json();
}

export async function fetchEntryTransfers(teamId: number): Promise<any[]> {
  const response = await fetch(`${FPL_API_BASE}/entry/${teamId}/transfers/`);
  if (!response.ok) {
    throw new Error(`Failed to fetch entry ${teamId} transfers: ${response.status}`);
  }
  return response.json();
}

export async function fetchEntryPicks(teamId: number, gameweek: number): Promise<any> {
  const response = await fetch(`${FPL_API_BASE}/entry/${teamId}/event/${gameweek}/picks/`);
  if (!response.ok) {
    throw new Error(`Failed to fetch entry ${teamId} GW${gameweek} picks: ${response.status}`);
  }
  return response.json();
}

export async function fetchElementSummary(playerId: number): Promise<any> {
  const response = await fetch(`${FPL_API_BASE}/element-summary/${playerId}/`);
  if (!response.ok) {
    throw new Error(`Failed to fetch player ${playerId} summary: ${response.status}`);
  }
  return response.json();
}
```

**Step 4: Run test to verify it passes**

Run: `cd functions && npm test -- --run fetcher.test.ts`
Expected: PASS

**Step 5: Write additional tests for other fetch functions**

```typescript
// Add to functions/src/fpl/fetcher.test.ts

  it('fetches league standings', async () => {
    const mockData = { league: { id: 634129 }, standings: { results: [] } };
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    } as Response);

    const result = await fetchLeagueStandings(634129);

    expect(fetch).toHaveBeenCalledWith('https://fantasy.premierleague.com/api/leagues-classic/634129/standings/');
    expect(result.league.id).toBe(634129);
  });

  it('fetches entry data', async () => {
    const mockData = { id: 158256, name: 'Test Team' };
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    } as Response);

    const result = await fetchEntry(158256);

    expect(result.id).toBe(158256);
  });
```

**Step 6: Run tests to verify they pass**

Run: `cd functions && npm test -- --run fetcher.test.ts`
Expected: PASS

**Step 7: Commit**

```bash
git add functions/src/fpl/fetcher.ts functions/src/fpl/fetcher.test.ts
git commit -m "$(cat <<'EOF'
feat(functions): add FPL API fetcher module

Create comprehensive fetch functions for all FPL API endpoints
needed for snapshot capture: bootstrap, fixtures, live scores,
event status, dream team, league standings, entry data, picks,
transfers, and element summaries.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Create Snapshot Capture Service

**Files:**
- Create: `functions/src/services/snapshot-capture.ts`
- Test: `functions/src/services/snapshot-capture.test.ts`

**Step 1: Write test for getCurrentGameweekInfo**

```typescript
// functions/src/services/snapshot-capture.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCurrentGameweekInfo } from './snapshot-capture';
import * as fetcher from '../fpl/fetcher';

vi.mock('../fpl/fetcher');

describe('Snapshot Capture Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('gets current gameweek info', async () => {
    vi.mocked(fetcher.fetchBootstrapStatic).mockResolvedValue({
      events: [
        { id: 15, is_current: false, finished: true },
        { id: 16, is_current: true, finished: false },
        { id: 17, is_current: false, finished: false },
      ],
    });

    const result = await getCurrentGameweekInfo();

    expect(result.gameweek).toBe(16);
    expect(result.status).toBe('in_progress');
  });

  it('identifies finished gameweek', async () => {
    vi.mocked(fetcher.fetchBootstrapStatic).mockResolvedValue({
      events: [
        { id: 16, is_current: true, finished: true },
      ],
    });

    const result = await getCurrentGameweekInfo();

    expect(result.status).toBe('finished');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd functions && npm test -- --run snapshot-capture.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

```typescript
// functions/src/services/snapshot-capture.ts
import * as fetcher from '../fpl/fetcher';
import { FPLSnapshot, GameweekStatus } from '../types/fpl-snapshot';

const FLOAWO_LEAGUE_ID = 634129;

export interface GameweekInfo {
  gameweek: number;
  status: GameweekStatus;
  bootstrapData: any;
}

export async function getCurrentGameweekInfo(): Promise<GameweekInfo> {
  const bootstrapData = await fetcher.fetchBootstrapStatic();
  const currentEvent = bootstrapData.events.find((e: any) => e.is_current);

  if (!currentEvent) {
    throw new Error('No current gameweek found');
  }

  let status: GameweekStatus = 'in_progress';
  if (currentEvent.finished) {
    status = 'finished';
  } else if (!currentEvent.data_checked) {
    // Check if deadline has passed
    const deadline = new Date(currentEvent.deadline_time);
    if (new Date() < deadline) {
      status = 'not_started';
    }
  }

  return {
    gameweek: currentEvent.id,
    status,
    bootstrapData,
  };
}

export async function getLeagueTeamIds(leagueId: number): Promise<number[]> {
  const standings = await fetcher.fetchLeagueStandings(leagueId);
  return standings.standings.results.map((r: any) => r.entry);
}

export async function getTopOwnedPlayers(bootstrapData: any, count: number = 50): Promise<number[]> {
  const elements = bootstrapData.elements as any[];
  const sorted = [...elements].sort((a, b) =>
    parseFloat(b.selected_by_percent) - parseFloat(a.selected_by_percent)
  );
  return sorted.slice(0, count).map((e: any) => e.id);
}

export async function captureSnapshot(): Promise<FPLSnapshot> {
  // Get current gameweek info
  const { gameweek, status, bootstrapData } = await getCurrentGameweekInfo();

  // Fetch global data in parallel
  const [fixtures, fixturesCurrentGW, eventStatus] = await Promise.all([
    fetcher.fetchFixtures(),
    fetcher.fetchFixturesForGameweek(gameweek),
    fetcher.fetchEventStatus(),
  ]);

  // Fetch live scores and dream team (may fail for not-started gameweeks)
  let liveScores = null;
  let dreamTeam = null;

  if (status !== 'not_started') {
    [liveScores, dreamTeam] = await Promise.all([
      fetcher.fetchLiveScores(gameweek).catch(() => null),
      fetcher.fetchDreamTeam(gameweek).catch(() => null),
    ]);
  }

  // Fetch league standings
  const leagueStandings = await fetcher.fetchLeagueStandings(FLOAWO_LEAGUE_ID);

  // Get team IDs from league
  const teamIds = await getLeagueTeamIds(FLOAWO_LEAGUE_ID);

  // Fetch team data for each team
  const teamData: Record<number, any> = {};
  for (const teamId of teamIds) {
    const [entry, history, transfers] = await Promise.all([
      fetcher.fetchEntry(teamId),
      fetcher.fetchEntryHistory(teamId),
      fetcher.fetchEntryTransfers(teamId),
    ]);

    // Fetch picks for current and previous gameweeks
    const picks: Record<number, any> = {};
    const gwsToFetch = [gameweek, gameweek - 1, gameweek - 2].filter(gw => gw > 0);

    for (const gw of gwsToFetch) {
      try {
        picks[gw] = await fetcher.fetchEntryPicks(teamId, gw);
      } catch {
        // Picks may not exist for future gameweeks
      }
    }

    teamData[teamId] = { entry, history, transfers, picks };
  }

  // Fetch player summaries for top owned players
  const topPlayerIds = await getTopOwnedPlayers(bootstrapData);
  const playerSummaries: Record<number, any> = {};

  for (const playerId of topPlayerIds) {
    try {
      playerSummaries[playerId] = await fetcher.fetchElementSummary(playerId);
    } catch {
      // Skip players that fail
    }
  }

  return {
    capturedAt: new Date(),
    gameweek,
    gameweekStatus: status,
    bootstrapStatic: bootstrapData,
    fixtures,
    fixturesCurrentGW,
    liveScores,
    eventStatus,
    dreamTeam,
    leagueStandings,
    teamData,
    playerSummaries,
  };
}
```

**Step 4: Run test to verify it passes**

Run: `cd functions && npm test -- --run snapshot-capture.test.ts`
Expected: PASS

**Step 5: Write test for captureSnapshot**

```typescript
// Add to functions/src/services/snapshot-capture.test.ts

  it('captures full snapshot', async () => {
    // Mock all fetch functions
    vi.mocked(fetcher.fetchBootstrapStatic).mockResolvedValue({
      events: [{ id: 16, is_current: true, finished: false }],
      elements: [{ id: 1, selected_by_percent: '50.0' }],
    });
    vi.mocked(fetcher.fetchFixtures).mockResolvedValue([]);
    vi.mocked(fetcher.fetchFixturesForGameweek).mockResolvedValue([]);
    vi.mocked(fetcher.fetchEventStatus).mockResolvedValue({ status: [], leagues: '' });
    vi.mocked(fetcher.fetchLiveScores).mockResolvedValue({ elements: [] });
    vi.mocked(fetcher.fetchDreamTeam).mockResolvedValue({ team: [] });
    vi.mocked(fetcher.fetchLeagueStandings).mockResolvedValue({
      league: { id: 634129 },
      standings: { results: [{ entry: 158256 }] },
    });
    vi.mocked(fetcher.fetchEntry).mockResolvedValue({ id: 158256, name: 'Test' });
    vi.mocked(fetcher.fetchEntryHistory).mockResolvedValue({ current: [], past: [], chips: [] });
    vi.mocked(fetcher.fetchEntryTransfers).mockResolvedValue([]);
    vi.mocked(fetcher.fetchEntryPicks).mockResolvedValue({ picks: [], entry_history: {}, active_chip: null });
    vi.mocked(fetcher.fetchElementSummary).mockResolvedValue({ fixtures: [], history: [] });

    const snapshot = await captureSnapshot();

    expect(snapshot.gameweek).toBe(16);
    expect(snapshot.gameweekStatus).toBe('in_progress');
    expect(snapshot.teamData[158256]).toBeDefined();
  });
```

**Step 6: Run tests to verify they pass**

Run: `cd functions && npm test -- --run snapshot-capture.test.ts`
Expected: PASS

**Step 7: Commit**

```bash
git add functions/src/services/snapshot-capture.ts functions/src/services/snapshot-capture.test.ts
git commit -m "$(cat <<'EOF'
feat(functions): add snapshot capture service

Implement captureSnapshot() that fetches complete FPL API data
for the FLOAWO league (634129) including bootstrap data, fixtures,
live scores, league standings, team data for all members, and
player summaries for top 50 owned players.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Create Scheduled Firebase Function

**Files:**
- Modify: `functions/src/index.ts`
- Test: `functions/src/index.test.ts` (integration test)

**Step 1: Write test for scheduled function**

```typescript
// functions/src/index.test.ts (add new describe block)
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Note: Integration test - will test that function is exported correctly

describe('captureFloawoSnapshot function', () => {
  it('exports captureFloawoSnapshot', async () => {
    const index = await import('./index');
    expect(index.captureFloawoSnapshot).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd functions && npm test -- --run index.test.ts`
Expected: FAIL with "captureFloawoSnapshot is not defined"

**Step 3: Add scheduled function to index.ts**

```typescript
// Add to functions/src/index.ts (after existing imports)

import { captureSnapshot } from './services/snapshot-capture';

// ============================================================================
// FPL Snapshot Capture (Scheduled)
// ============================================================================

/**
 * Captures FPL API data for FLOAWO league every hour between 11:00-23:00 GMT.
 * Stores snapshots in Firestore `fpl_snapshots` collection.
 *
 * Schedule: Every hour from 11:00 to 23:00 GMT
 */
export const captureFloawoSnapshot = onSchedule({
  schedule: '0 11-23 * * *',
  timeZone: 'Europe/London',
  retryCount: 3,
}, async (event) => {
  console.log('Starting FPL snapshot capture at', new Date().toISOString());

  try {
    const snapshot = await captureSnapshot();

    // Generate document ID based on gameweek and timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const docId = `gw${snapshot.gameweek}-${timestamp}`;

    // Store in Firestore
    await db.collection('fpl_snapshots').doc(docId).set({
      ...snapshot,
      capturedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Snapshot ${docId} saved successfully`);
    console.log(`Gameweek: ${snapshot.gameweek}, Status: ${snapshot.gameweekStatus}`);
    console.log(`Teams captured: ${Object.keys(snapshot.teamData).length}`);
    console.log(`Players captured: ${Object.keys(snapshot.playerSummaries).length}`);

  } catch (error: any) {
    console.error('Failed to capture snapshot:', error);
    throw error; // Re-throw to trigger retry
  }
});
```

**Step 4: Run test to verify it passes**

Run: `cd functions && npm test -- --run index.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add functions/src/index.ts functions/src/index.test.ts
git commit -m "$(cat <<'EOF'
feat(functions): add scheduled FPL snapshot capture

Add captureFloawoSnapshot Cloud Function that runs hourly from
11:00-23:00 GMT to capture FPL API data for the FLOAWO league.
Stores snapshots in Firestore fpl_snapshots collection with
gameweek and timestamp-based document IDs.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Add Firestore Security Rules for Snapshots

**Files:**
- Modify: `firestore.rules`

**Step 1: Read current rules**

Run: `cat firestore.rules`

**Step 2: Add snapshot collection rules**

```javascript
// Add to firestore.rules under rules_version = '2';

    // FPL Snapshots - read-only for authenticated users, write only by Cloud Functions
    match /fpl_snapshots/{snapshotId} {
      allow read: if request.auth != null;
      allow write: if false; // Only Cloud Functions (admin SDK) can write
    }
```

**Step 3: Commit**

```bash
git add firestore.rules
git commit -m "$(cat <<'EOF'
chore(firestore): add security rules for fpl_snapshots

Allow authenticated users to read snapshots, restrict writes
to Cloud Functions only (using Admin SDK).

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 2: Local Fixtures Tooling

### Task 6: Create test-fixtures Directory Structure

**Files:**
- Create: `test-fixtures/.gitkeep`
- Create: `test-fixtures/snapshots/.gitkeep`
- Create: `test-fixtures/scenarios/.gitkeep`
- Modify: `.gitignore`

**Step 1: Create directory structure**

```bash
mkdir -p test-fixtures/snapshots test-fixtures/scenarios
touch test-fixtures/.gitkeep
touch test-fixtures/snapshots/.gitkeep
touch test-fixtures/scenarios/.gitkeep
```

**Step 2: Update .gitignore to ignore downloaded snapshots**

```gitignore
# Add to .gitignore

# FPL Test Fixtures - snapshots are downloaded, not committed
test-fixtures/snapshots/*.json
!test-fixtures/snapshots/.gitkeep
```

**Step 3: Commit**

```bash
git add test-fixtures/ .gitignore
git commit -m "$(cat <<'EOF'
chore: add test-fixtures directory structure

Create directories for local FPL test fixtures:
- snapshots/ for downloaded Firestore data (gitignored)
- scenarios/ for curated test scenarios (committed)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Create Fixture Types for Frontend

**Files:**
- Create: `src/test-utils/fpl-fixture-types.ts`
- Test: `src/test-utils/fpl-fixture-types.test.ts`

**Step 1: Write test for fixture type exports**

```typescript
// src/test-utils/fpl-fixture-types.test.ts
import { describe, it, expect } from 'vitest';
import { FPLTestSnapshot, validateTestSnapshot } from './fpl-fixture-types';

describe('FPL Fixture Types', () => {
  it('validates a minimal test snapshot', () => {
    const snapshot: FPLTestSnapshot = {
      capturedAt: '2025-12-15T14:00:00Z',
      gameweek: 16,
      gameweekStatus: 'in_progress',
      bootstrapStatic: { events: [], elements: [], teams: [], element_types: [] },
      fixtures: [],
      fixturesCurrentGW: [],
      liveScores: null,
      eventStatus: { status: [], leagues: '' },
      dreamTeam: null,
      leagueStandings: { league: { id: 634129 }, standings: { results: [] } },
      teamData: {},
      playerSummaries: {},
    };

    expect(validateTestSnapshot(snapshot)).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run fpl-fixture-types.test.ts`
Expected: FAIL

**Step 3: Write implementation**

```typescript
// src/test-utils/fpl-fixture-types.ts

export type GameweekStatus = 'not_started' | 'in_progress' | 'finished';

export interface FPLTestSnapshot {
  capturedAt: string; // ISO string for JSON serialization
  gameweek: number;
  gameweekStatus: GameweekStatus;

  // Global data
  bootstrapStatic: {
    events: any[];
    elements: any[];
    teams: any[];
    element_types: any[];
  };
  fixtures: any[];
  fixturesCurrentGW: any[];
  liveScores: { elements: any[] } | null;
  eventStatus: { status: any[]; leagues: string };
  dreamTeam: { team: any[] } | null;

  // League data
  leagueStandings: {
    league: { id: number; name?: string };
    standings: { results: any[] };
  };

  // Per-team data
  teamData: Record<number, {
    entry: any;
    history: any;
    transfers: any[];
    picks: Record<number, any>;
  }>;

  // Player summaries
  playerSummaries: Record<number, any>;
}

export function validateTestSnapshot(snapshot: FPLTestSnapshot): boolean {
  return (
    typeof snapshot.capturedAt === 'string' &&
    typeof snapshot.gameweek === 'number' &&
    ['not_started', 'in_progress', 'finished'].includes(snapshot.gameweekStatus) &&
    snapshot.bootstrapStatic !== undefined &&
    snapshot.leagueStandings !== undefined
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --run fpl-fixture-types.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/test-utils/fpl-fixture-types.ts src/test-utils/fpl-fixture-types.test.ts
git commit -m "$(cat <<'EOF'
feat(test-utils): add FPL fixture types for frontend

Define FPLTestSnapshot type for loading JSON fixtures in tests.
Uses string for capturedAt (JSON serialization) rather than
Firestore Timestamp.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Create Fixture Loader

**Files:**
- Create: `src/test-utils/fixture-loader.ts`
- Test: `src/test-utils/fixture-loader.test.ts`

**Step 1: Write test for loadScenario**

```typescript
// src/test-utils/fixture-loader.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadScenario, listScenarios } from './fixture-loader';

// Mock fs module
vi.mock('fs', () => ({
  readFileSync: vi.fn(),
  readdirSync: vi.fn(),
  existsSync: vi.fn(),
}));

describe('Fixture Loader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads a scenario by name', async () => {
    const mockScenario = {
      capturedAt: '2025-12-15T14:00:00Z',
      gameweek: 16,
      gameweekStatus: 'finished',
    };

    const fs = await import('fs');
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockScenario));

    const result = loadScenario('gw-finished');

    expect(result.gameweek).toBe(16);
    expect(result.gameweekStatus).toBe('finished');
  });

  it('throws when scenario not found', async () => {
    const fs = await import('fs');
    vi.mocked(fs.existsSync).mockReturnValue(false);

    expect(() => loadScenario('nonexistent')).toThrow('Scenario not found');
  });

  it('lists available scenarios', async () => {
    const fs = await import('fs');
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue([
      'gw-finished.json',
      'gw-in-progress.json',
      'README.md', // Should be filtered out
    ] as any);

    const scenarios = listScenarios();

    expect(scenarios).toEqual(['gw-finished', 'gw-in-progress']);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run fixture-loader.test.ts`
Expected: FAIL

**Step 3: Write implementation**

```typescript
// src/test-utils/fixture-loader.ts
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { FPLTestSnapshot, validateTestSnapshot } from './fpl-fixture-types';

const SCENARIOS_DIR = join(process.cwd(), 'test-fixtures', 'scenarios');
const SNAPSHOTS_DIR = join(process.cwd(), 'test-fixtures', 'snapshots');

export function loadScenario(name: string): FPLTestSnapshot {
  const filePath = join(SCENARIOS_DIR, `${name}.json`);

  if (!existsSync(filePath)) {
    throw new Error(`Scenario not found: ${name} (looked in ${filePath})`);
  }

  const content = readFileSync(filePath, 'utf-8');
  const snapshot = JSON.parse(content) as FPLTestSnapshot;

  if (!validateTestSnapshot(snapshot)) {
    throw new Error(`Invalid scenario file: ${name}`);
  }

  return snapshot;
}

export function loadSnapshot(filename: string): FPLTestSnapshot {
  const filePath = join(SNAPSHOTS_DIR, filename);

  if (!existsSync(filePath)) {
    throw new Error(`Snapshot not found: ${filename}`);
  }

  const content = readFileSync(filePath, 'utf-8');
  const snapshot = JSON.parse(content) as FPLTestSnapshot;

  return snapshot;
}

export function listScenarios(): string[] {
  if (!existsSync(SCENARIOS_DIR)) {
    return [];
  }

  return readdirSync(SCENARIOS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));
}

export function listSnapshots(): string[] {
  if (!existsSync(SNAPSHOTS_DIR)) {
    return [];
  }

  return readdirSync(SNAPSHOTS_DIR)
    .filter(f => f.endsWith('.json'));
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --run fixture-loader.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/test-utils/fixture-loader.ts src/test-utils/fixture-loader.test.ts
git commit -m "$(cat <<'EOF'
feat(test-utils): add fixture loader for scenarios and snapshots

Create loadScenario() and loadSnapshot() functions to load FPL
test fixtures from local JSON files. Includes listScenarios()
and listSnapshots() helpers.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Create CLI Download Script

**Files:**
- Create: `scripts/fixtures-download.ts`
- Modify: `package.json` (add script)

**Step 1: Create download script**

```typescript
// scripts/fixtures-download.ts
import * as admin from 'firebase-admin';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// Initialize Firebase Admin with application default credentials
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: process.env.FIREBASE_PROJECT_ID || 'knockoutfpl-dev',
});

const db = admin.firestore();

interface DownloadOptions {
  fromGw?: number;
  toGw?: number;
  latest?: boolean;
  limit?: number;
}

async function downloadSnapshots(options: DownloadOptions = {}) {
  const { fromGw, toGw, latest, limit = 10 } = options;

  console.log('Connecting to Firestore...');

  let query = db.collection('fpl_snapshots').orderBy('capturedAt', 'desc');

  if (fromGw && toGw) {
    query = query.where('gameweek', '>=', fromGw).where('gameweek', '<=', toGw);
  }

  if (latest) {
    query = query.limit(1);
  } else {
    query = query.limit(limit);
  }

  const snapshots = await query.get();

  if (snapshots.empty) {
    console.log('No snapshots found.');
    return;
  }

  const outputDir = join(process.cwd(), 'test-fixtures', 'snapshots');

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  console.log(`Found ${snapshots.size} snapshot(s). Downloading...`);

  for (const doc of snapshots.docs) {
    const data = doc.data();
    const filename = `${doc.id}.json`;
    const filepath = join(outputDir, filename);

    // Convert Firestore Timestamp to ISO string
    const snapshot = {
      ...data,
      capturedAt: data.capturedAt?.toDate?.()?.toISOString() || data.capturedAt,
    };

    writeFileSync(filepath, JSON.stringify(snapshot, null, 2));
    console.log(`  ✓ ${filename}`);
  }

  console.log(`\nDownloaded ${snapshots.size} snapshot(s) to ${outputDir}`);
}

async function listRemoteSnapshots(limit = 20) {
  console.log('Fetching available snapshots from Firestore...\n');

  const snapshots = await db.collection('fpl_snapshots')
    .orderBy('capturedAt', 'desc')
    .limit(limit)
    .get();

  if (snapshots.empty) {
    console.log('No snapshots found.');
    return;
  }

  console.log('Available snapshots:');
  console.log('─'.repeat(60));

  for (const doc of snapshots.docs) {
    const data = doc.data();
    const capturedAt = data.capturedAt?.toDate?.()?.toISOString() || 'unknown';
    console.log(`  ${doc.id}`);
    console.log(`    GW${data.gameweek} | ${data.gameweekStatus} | ${capturedAt}`);
  }
}

// Parse CLI arguments
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'download':
    const fromArg = args.find(a => a.startsWith('--from='));
    const toArg = args.find(a => a.startsWith('--to='));
    const latestArg = args.includes('--latest');
    const limitArg = args.find(a => a.startsWith('--limit='));

    downloadSnapshots({
      fromGw: fromArg ? parseInt(fromArg.split('=')[1].replace('gw', '')) : undefined,
      toGw: toArg ? parseInt(toArg.split('=')[1].replace('gw', '')) : undefined,
      latest: latestArg,
      limit: limitArg ? parseInt(limitArg.split('=')[1]) : 10,
    });
    break;

  case 'list':
    listRemoteSnapshots();
    break;

  default:
    console.log(`
FPL Fixtures CLI

Usage:
  npm run fixtures:download              Download latest 10 snapshots
  npm run fixtures:download -- --latest  Download only latest snapshot
  npm run fixtures:download -- --from=gw15 --to=gw17  Download GW range
  npm run fixtures:list                  List available snapshots in Firestore
`);
}
```

**Step 2: Add npm scripts to package.json**

```json
{
  "scripts": {
    "fixtures:download": "npx tsx scripts/fixtures-download.ts download",
    "fixtures:list": "npx tsx scripts/fixtures-download.ts list",
    "fixtures:scenario": "npx tsx scripts/fixtures-scenario.ts"
  }
}
```

**Step 3: Commit**

```bash
git add scripts/fixtures-download.ts package.json
git commit -m "$(cat <<'EOF'
feat(scripts): add CLI tools for fixture management

Add fixtures:download and fixtures:list npm scripts to download
FPL snapshots from Firestore to local JSON files. Supports
--latest, --from/--to gameweek filters, and --limit options.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: Create Scenario Creation Script

**Files:**
- Create: `scripts/fixtures-scenario.ts`

**Step 1: Create scenario script**

```typescript
// scripts/fixtures-scenario.ts
import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'fs';
import { join } from 'path';

const SNAPSHOTS_DIR = join(process.cwd(), 'test-fixtures', 'snapshots');
const SCENARIOS_DIR = join(process.cwd(), 'test-fixtures', 'scenarios');

function createScenario(snapshotName: string, scenarioName: string) {
  const snapshotPath = join(SNAPSHOTS_DIR, `${snapshotName}.json`);
  const scenarioPath = join(SCENARIOS_DIR, `${scenarioName}.json`);

  if (!existsSync(snapshotPath)) {
    console.error(`Snapshot not found: ${snapshotPath}`);
    process.exit(1);
  }

  if (existsSync(scenarioPath)) {
    console.error(`Scenario already exists: ${scenarioPath}`);
    console.log('Use a different name or delete the existing scenario.');
    process.exit(1);
  }

  // Copy snapshot to scenario
  copyFileSync(snapshotPath, scenarioPath);

  console.log(`✓ Created scenario: ${scenarioName}`);
  console.log(`  Source: ${snapshotPath}`);
  console.log(`  Output: ${scenarioPath}`);
  console.log('\nYou can now edit the scenario file to customize test data.');
}

// Parse CLI arguments
const args = process.argv.slice(2);
const snapshotName = args[0];
const scenarioName = args[1];

if (!snapshotName || !scenarioName) {
  console.log(`
Create Scenario from Snapshot

Usage:
  npm run fixtures:scenario <snapshot-name> <scenario-name>

Example:
  npm run fixtures:scenario gw16-2025-12-15T14-00-00Z gw-finished

This copies the snapshot to scenarios/ where it can be edited
and committed to version control.
`);
  process.exit(0);
}

createScenario(snapshotName, scenarioName);
```

**Step 2: Commit**

```bash
git add scripts/fixtures-scenario.ts
git commit -m "$(cat <<'EOF'
feat(scripts): add fixtures:scenario CLI for scenario creation

Add script to copy downloaded snapshots to scenarios directory
for curation and version control. Usage:
npm run fixtures:scenario <snapshot-name> <scenario-name>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 3: Test Utilities

### Task 11: Create Gameweek State Transformers

**Files:**
- Create: `src/test-utils/fpl-transformers.ts`
- Test: `src/test-utils/fpl-transformers.test.ts`

**Step 1: Write test for makeGameweekFinished**

```typescript
// src/test-utils/fpl-transformers.test.ts
import { describe, it, expect } from 'vitest';
import { makeGameweekFinished, makeGameweekInProgress, makeGameweekNotStarted } from './fpl-transformers';
import { FPLTestSnapshot } from './fpl-fixture-types';

describe('FPL Transformers', () => {
  const baseSnapshot: FPLTestSnapshot = {
    capturedAt: '2025-12-15T14:00:00Z',
    gameweek: 16,
    gameweekStatus: 'in_progress',
    bootstrapStatic: {
      events: [{ id: 16, is_current: true, finished: false }],
      elements: [],
      teams: [],
      element_types: [],
    },
    fixtures: [],
    fixturesCurrentGW: [
      { id: 1, event: 16, started: true, finished: false, minutes: 45 },
    ],
    liveScores: null,
    eventStatus: { status: [], leagues: '' },
    dreamTeam: null,
    leagueStandings: { league: { id: 634129 }, standings: { results: [] } },
    teamData: {},
    playerSummaries: {},
  };

  describe('makeGameweekFinished', () => {
    it('sets gameweekStatus to finished', () => {
      const result = makeGameweekFinished(baseSnapshot);
      expect(result.gameweekStatus).toBe('finished');
    });

    it('marks current event as finished', () => {
      const result = makeGameweekFinished(baseSnapshot);
      expect(result.bootstrapStatic.events[0].finished).toBe(true);
    });

    it('marks all fixtures as finished', () => {
      const result = makeGameweekFinished(baseSnapshot);
      expect(result.fixturesCurrentGW[0].finished).toBe(true);
      expect(result.fixturesCurrentGW[0].minutes).toBe(90);
    });

    it('does not mutate original snapshot', () => {
      makeGameweekFinished(baseSnapshot);
      expect(baseSnapshot.gameweekStatus).toBe('in_progress');
    });
  });

  describe('makeGameweekInProgress', () => {
    const finishedSnapshot = { ...baseSnapshot, gameweekStatus: 'finished' as const };

    it('sets gameweekStatus to in_progress', () => {
      const result = makeGameweekInProgress(finishedSnapshot);
      expect(result.gameweekStatus).toBe('in_progress');
    });
  });

  describe('makeGameweekNotStarted', () => {
    it('sets gameweekStatus to not_started', () => {
      const result = makeGameweekNotStarted(baseSnapshot);
      expect(result.gameweekStatus).toBe('not_started');
    });

    it('marks fixtures as not started', () => {
      const result = makeGameweekNotStarted(baseSnapshot);
      expect(result.fixturesCurrentGW[0].started).toBe(false);
      expect(result.fixturesCurrentGW[0].minutes).toBe(0);
    });

    it('clears live scores', () => {
      const snapshotWithLive = { ...baseSnapshot, liveScores: { elements: [] } };
      const result = makeGameweekNotStarted(snapshotWithLive);
      expect(result.liveScores).toBeNull();
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run fpl-transformers.test.ts`
Expected: FAIL

**Step 3: Write implementation**

```typescript
// src/test-utils/fpl-transformers.ts
import { FPLTestSnapshot, GameweekStatus } from './fpl-fixture-types';

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function makeGameweekFinished(snapshot: FPLTestSnapshot): FPLTestSnapshot {
  const result = deepClone(snapshot);
  result.gameweekStatus = 'finished';

  // Update bootstrap events
  result.bootstrapStatic.events = result.bootstrapStatic.events.map((event: any) => {
    if (event.id === result.gameweek) {
      return { ...event, finished: true };
    }
    return event;
  });

  // Update fixtures
  result.fixturesCurrentGW = result.fixturesCurrentGW.map((fixture: any) => ({
    ...fixture,
    started: true,
    finished: true,
    minutes: 90,
  }));

  result.fixtures = result.fixtures.map((fixture: any) => {
    if (fixture.event === result.gameweek) {
      return { ...fixture, started: true, finished: true, minutes: 90 };
    }
    return fixture;
  });

  return result;
}

export function makeGameweekInProgress(snapshot: FPLTestSnapshot): FPLTestSnapshot {
  const result = deepClone(snapshot);
  result.gameweekStatus = 'in_progress';

  // Update bootstrap events
  result.bootstrapStatic.events = result.bootstrapStatic.events.map((event: any) => {
    if (event.id === result.gameweek) {
      return { ...event, finished: false };
    }
    return event;
  });

  return result;
}

export function makeGameweekNotStarted(snapshot: FPLTestSnapshot): FPLTestSnapshot {
  const result = deepClone(snapshot);
  result.gameweekStatus = 'not_started';
  result.liveScores = null;
  result.dreamTeam = null;

  // Update bootstrap events
  result.bootstrapStatic.events = result.bootstrapStatic.events.map((event: any) => {
    if (event.id === result.gameweek) {
      return { ...event, finished: false };
    }
    return event;
  });

  // Reset fixtures
  result.fixturesCurrentGW = result.fixturesCurrentGW.map((fixture: any) => ({
    ...fixture,
    started: false,
    finished: false,
    minutes: 0,
  }));

  result.fixtures = result.fixtures.map((fixture: any) => {
    if (fixture.event === result.gameweek) {
      return { ...fixture, started: false, finished: false, minutes: 0 };
    }
    return fixture;
  });

  return result;
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --run fpl-transformers.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/test-utils/fpl-transformers.ts src/test-utils/fpl-transformers.test.ts
git commit -m "$(cat <<'EOF'
feat(test-utils): add gameweek state transformers

Add makeGameweekFinished(), makeGameweekInProgress(), and
makeGameweekNotStarted() functions to transform FPL snapshots
for testing different gameweek states. All transformers are
pure functions that don't mutate the original snapshot.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 12: Add Score Transformers

**Files:**
- Modify: `src/test-utils/fpl-transformers.ts`
- Modify: `src/test-utils/fpl-transformers.test.ts`

**Step 1: Write test for setTeamScore**

```typescript
// Add to src/test-utils/fpl-transformers.test.ts

describe('Score Transformers', () => {
  const snapshotWithTeam: FPLTestSnapshot = {
    ...baseSnapshot,
    teamData: {
      158256: {
        entry: { id: 158256, name: 'Test Team' },
        history: { current: [], past: [], chips: [] },
        transfers: [],
        picks: {
          16: {
            picks: [],
            entry_history: { event: 16, points: 50, total_points: 500 },
            active_chip: null,
          },
        },
      },
    },
  };

  it('sets team score for specific gameweek', () => {
    const result = setTeamScore(snapshotWithTeam, 158256, 16, 75);
    expect(result.teamData[158256].picks[16].entry_history.points).toBe(75);
  });

  it('updates total points correctly', () => {
    const result = setTeamScore(snapshotWithTeam, 158256, 16, 75);
    // Original was 50 points, adding 25 more = 475 + 25 = 525
    expect(result.teamData[158256].picks[16].entry_history.total_points).toBe(525);
  });

  it('throws for nonexistent team', () => {
    expect(() => setTeamScore(snapshotWithTeam, 999999, 16, 50))
      .toThrow('Team 999999 not found');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run fpl-transformers.test.ts`
Expected: FAIL

**Step 3: Add implementation**

```typescript
// Add to src/test-utils/fpl-transformers.ts

export function setTeamScore(
  snapshot: FPLTestSnapshot,
  teamId: number,
  gameweek: number,
  score: number
): FPLTestSnapshot {
  const result = deepClone(snapshot);

  if (!result.teamData[teamId]) {
    throw new Error(`Team ${teamId} not found in snapshot`);
  }

  if (!result.teamData[teamId].picks[gameweek]) {
    throw new Error(`Picks for team ${teamId} GW${gameweek} not found`);
  }

  const picks = result.teamData[teamId].picks[gameweek];
  const oldPoints = picks.entry_history.points;
  const pointsDiff = score - oldPoints;

  picks.entry_history.points = score;
  picks.entry_history.total_points += pointsDiff;

  return result;
}

export function setAllScores(
  snapshot: FPLTestSnapshot,
  scores: Record<number, number>,
  gameweek?: number
): FPLTestSnapshot {
  let result = deepClone(snapshot);
  const gw = gameweek || result.gameweek;

  for (const [teamIdStr, score] of Object.entries(scores)) {
    const teamId = parseInt(teamIdStr);
    result = setTeamScore(result, teamId, gw, score);
  }

  return result;
}

export function createTieScenario(
  snapshot: FPLTestSnapshot,
  team1: number,
  team2: number,
  score: number
): FPLTestSnapshot {
  let result = deepClone(snapshot);
  result = setTeamScore(result, team1, result.gameweek, score);
  result = setTeamScore(result, team2, result.gameweek, score);
  return makeGameweekFinished(result);
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --run fpl-transformers.test.ts`
Expected: PASS

**Step 5: Write test for createTieScenario**

```typescript
// Add to fpl-transformers.test.ts

  it('creates tie scenario with equal scores', () => {
    const twoTeamSnapshot = {
      ...snapshotWithTeam,
      teamData: {
        158256: snapshotWithTeam.teamData[158256],
        71631: {
          entry: { id: 71631, name: 'Team 2' },
          history: { current: [], past: [], chips: [] },
          transfers: [],
          picks: {
            16: {
              picks: [],
              entry_history: { event: 16, points: 60, total_points: 600 },
              active_chip: null,
            },
          },
        },
      },
    };

    const result = createTieScenario(twoTeamSnapshot, 158256, 71631, 70);

    expect(result.teamData[158256].picks[16].entry_history.points).toBe(70);
    expect(result.teamData[71631].picks[16].entry_history.points).toBe(70);
    expect(result.gameweekStatus).toBe('finished');
  });
```

**Step 6: Run test to verify it passes**

Run: `npm test -- --run fpl-transformers.test.ts`
Expected: PASS

**Step 7: Commit**

```bash
git add src/test-utils/fpl-transformers.ts src/test-utils/fpl-transformers.test.ts
git commit -m "$(cat <<'EOF'
feat(test-utils): add score transformer functions

Add setTeamScore(), setAllScores(), and createTieScenario()
functions for testing different scoring scenarios. These allow
setting exact scores for teams in specific gameweeks and
creating tie scenarios for tiebreaker testing.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 13: Create Mock FPL Service Provider

**Files:**
- Create: `src/test-utils/fpl-mock-provider.ts`
- Test: `src/test-utils/fpl-mock-provider.test.ts`

**Step 1: Write test for mockFPLService**

```typescript
// src/test-utils/fpl-mock-provider.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mockFPLService, clearFPLMocks } from './fpl-mock-provider';
import * as fpl from '../services/fpl';
import { FPLTestSnapshot } from './fpl-fixture-types';

vi.mock('../services/fpl');

describe('FPL Mock Provider', () => {
  const testSnapshot: FPLTestSnapshot = {
    capturedAt: '2025-12-15T14:00:00Z',
    gameweek: 16,
    gameweekStatus: 'finished',
    bootstrapStatic: {
      events: [{ id: 16, is_current: true, finished: true }],
      elements: [{ id: 100, web_name: 'Salah', element_type: 3, team: 1, now_cost: 130 }],
      teams: [{ id: 1, name: 'Liverpool' }],
      element_types: [{ id: 3, singular_name: 'Midfielder' }],
    },
    fixtures: [],
    fixturesCurrentGW: [{ id: 1, event: 16, started: true, finished: true, minutes: 90 }],
    liveScores: { elements: [{ id: 100, stats: { total_points: 15 } }] },
    eventStatus: { status: [], leagues: '' },
    dreamTeam: null,
    leagueStandings: {
      league: { id: 634129, name: 'FLOAWO' },
      standings: { results: [{ entry: 158256, entry_name: 'Test Team', player_name: 'Test', rank: 1, total: 500 }] },
    },
    teamData: {
      158256: {
        entry: { id: 158256, name: 'Test Team', player_first_name: 'Test', player_last_name: 'User', summary_overall_points: 500, summary_overall_rank: 1000 },
        history: { current: [], past: [], chips: [] },
        transfers: [],
        picks: {
          16: {
            picks: [{ element: 100, position: 1, multiplier: 2, is_captain: true, is_vice_captain: false }],
            entry_history: { event: 16, points: 75, total_points: 500 },
            active_chip: null,
          },
        },
      },
    },
    playerSummaries: {},
  };

  beforeEach(() => {
    mockFPLService(testSnapshot);
  });

  afterEach(() => {
    clearFPLMocks();
  });

  it('mocks getFPLTeamInfo', async () => {
    const result = await fpl.getFPLTeamInfo(158256);
    expect(result.teamId).toBe(158256);
    expect(result.teamName).toBe('Test Team');
  });

  it('mocks getCurrentGameweek', async () => {
    const result = await fpl.getCurrentGameweek();
    expect(result).toBe(16);
  });

  it('mocks getGameweekInfo', async () => {
    const result = await fpl.getGameweekInfo(16);
    expect(result.id).toBe(16);
    expect(result.finished).toBe(true);
  });

  it('mocks getFPLLiveScores', async () => {
    const result = await fpl.getFPLLiveScores(16);
    expect(result.get(100)).toBe(15);
  });

  it('mocks getLeagueStandings', async () => {
    const result = await fpl.getLeagueStandings(634129);
    expect(result).toHaveLength(1);
    expect(result[0].fplTeamId).toBe(158256);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run fpl-mock-provider.test.ts`
Expected: FAIL

**Step 3: Write implementation**

```typescript
// src/test-utils/fpl-mock-provider.ts
import { vi } from 'vitest';
import * as fpl from '../services/fpl';
import { FPLTestSnapshot } from './fpl-fixture-types';

export function mockFPLService(snapshot: FPLTestSnapshot) {
  // Mock getFPLTeamInfo
  vi.mocked(fpl.getFPLTeamInfo).mockImplementation(async (teamId: number) => {
    const teamData = snapshot.teamData[teamId];
    if (!teamData) {
      throw new Error(`Team ${teamId} not found`);
    }
    const entry = teamData.entry;
    return {
      teamId: entry.id,
      teamName: entry.name,
      managerName: `${entry.player_first_name} ${entry.player_last_name}`,
      overallPoints: entry.summary_overall_points,
      overallRank: entry.summary_overall_rank,
    };
  });

  // Mock getCurrentGameweek
  vi.mocked(fpl.getCurrentGameweek).mockImplementation(async () => {
    return snapshot.gameweek;
  });

  // Mock getGameweekInfo
  vi.mocked(fpl.getGameweekInfo).mockImplementation(async (gameweek: number) => {
    const event = snapshot.bootstrapStatic.events.find((e: any) => e.id === gameweek);
    return {
      id: gameweek,
      deadline: new Date(event?.deadline_time || Date.now()),
      finished: event?.finished ?? false,
    };
  });

  // Mock getFPLGameweekScore
  vi.mocked(fpl.getFPLGameweekScore).mockImplementation(async (teamId: number, gameweek: number) => {
    const teamData = snapshot.teamData[teamId];
    if (!teamData || !teamData.picks[gameweek]) {
      throw new Error(`Picks for team ${teamId} GW${gameweek} not found`);
    }
    return {
      gameweek,
      points: teamData.picks[gameweek].entry_history.points,
    };
  });

  // Mock getFPLTeamPicks
  vi.mocked(fpl.getFPLTeamPicks).mockImplementation(async (teamId: number, gameweek: number) => {
    const teamData = snapshot.teamData[teamId];
    if (!teamData || !teamData.picks[gameweek]) {
      throw new Error(`Picks for team ${teamId} GW${gameweek} not found`);
    }
    const picks = teamData.picks[gameweek];
    return {
      picks: picks.picks,
      entryHistory: {
        event: picks.entry_history.event,
        points: picks.entry_history.points,
        totalPoints: picks.entry_history.total_points,
      },
      activeChip: picks.active_chip,
    };
  });

  // Mock getFPLPlayers
  vi.mocked(fpl.getFPLPlayers).mockImplementation(async () => {
    const playerMap = new Map<number, fpl.FPLPlayer>();
    for (const element of snapshot.bootstrapStatic.elements) {
      playerMap.set(element.id, element);
    }
    return playerMap;
  });

  // Mock getFPLLiveScores
  vi.mocked(fpl.getFPLLiveScores).mockImplementation(async (_gameweek: number) => {
    const scoresMap = new Map<number, number>();
    if (snapshot.liveScores) {
      for (const element of snapshot.liveScores.elements) {
        scoresMap.set(element.id, element.stats.total_points);
      }
    }
    return scoresMap;
  });

  // Mock getFPLFixtures
  vi.mocked(fpl.getFPLFixtures).mockImplementation(async (gameweek: number) => {
    return snapshot.fixtures
      .filter((f: any) => f.event === gameweek)
      .map((f: any) => ({
        id: f.id,
        event: f.event,
        teamH: f.team_h,
        teamA: f.team_a,
        started: f.started,
        finished: f.finished,
        minutes: f.minutes,
      }));
  });

  // Mock getLeagueStandings
  vi.mocked(fpl.getLeagueStandings).mockImplementation(async (_leagueId: number) => {
    return snapshot.leagueStandings.standings.results.map((r: any) => ({
      fplTeamId: r.entry,
      teamName: r.entry_name,
      managerName: r.player_name,
      rank: r.rank,
      totalPoints: r.total,
    }));
  });

  // Mock getUserMiniLeagues
  vi.mocked(fpl.getUserMiniLeagues).mockImplementation(async (_teamId: number) => {
    return [{
      id: snapshot.leagueStandings.league.id,
      name: snapshot.leagueStandings.league.name || 'FLOAWO',
      entryRank: 1,
    }];
  });
}

export function clearFPLMocks() {
  vi.clearAllMocks();
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --run fpl-mock-provider.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/test-utils/fpl-mock-provider.ts src/test-utils/fpl-mock-provider.test.ts
git commit -m "$(cat <<'EOF'
feat(test-utils): add FPL mock service provider

Create mockFPLService() that configures Vitest mocks for all
FPL service functions using snapshot data. Enables unit testing
with realistic FPL data without network calls.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 14: Create Test Utils Index Export

**Files:**
- Create: `src/test-utils/index.ts`

**Step 1: Create index file**

```typescript
// src/test-utils/index.ts

// Types
export * from './fpl-fixture-types';

// Fixture loading
export * from './fixture-loader';

// Transformers
export * from './fpl-transformers';

// Mock providers
export * from './fpl-mock-provider';
```

**Step 2: Commit**

```bash
git add src/test-utils/index.ts
git commit -m "$(cat <<'EOF'
chore(test-utils): add barrel export for test utilities

Create index.ts that exports all FPL test utilities for
convenient importing in test files.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 4: E2E & Dev Mode

### Task 15: Install MSW (Mock Service Worker)

**Files:**
- Modify: `package.json`

**Step 1: Install MSW**

```bash
npm install -D msw
```

**Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "$(cat <<'EOF'
chore(deps): add MSW for API mocking in E2E tests

Install Mock Service Worker for intercepting FPL API calls
during E2E tests and demo mode.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 16: Create MSW Handlers

**Files:**
- Create: `src/test-utils/msw-handlers.ts`
- Test: `src/test-utils/msw-handlers.test.ts`

**Step 1: Write test for createFPLHandlers**

```typescript
// src/test-utils/msw-handlers.test.ts
import { describe, it, expect } from 'vitest';
import { createFPLHandlers } from './msw-handlers';
import { FPLTestSnapshot } from './fpl-fixture-types';

describe('MSW Handlers', () => {
  const testSnapshot: FPLTestSnapshot = {
    capturedAt: '2025-12-15T14:00:00Z',
    gameweek: 16,
    gameweekStatus: 'finished',
    bootstrapStatic: {
      events: [{ id: 16, is_current: true, finished: true }],
      elements: [],
      teams: [],
      element_types: [],
    },
    fixtures: [],
    fixturesCurrentGW: [],
    liveScores: null,
    eventStatus: { status: [], leagues: '' },
    dreamTeam: null,
    leagueStandings: { league: { id: 634129 }, standings: { results: [] } },
    teamData: {
      158256: {
        entry: { id: 158256, name: 'Test' },
        history: { current: [], past: [], chips: [] },
        transfers: [],
        picks: {},
      },
    },
    playerSummaries: {},
  };

  it('creates handlers array', () => {
    const handlers = createFPLHandlers(testSnapshot);
    expect(Array.isArray(handlers)).toBe(true);
    expect(handlers.length).toBeGreaterThan(0);
  });

  it('creates handler for bootstrap-static', () => {
    const handlers = createFPLHandlers(testSnapshot);
    // Each handler has info.path - check one exists for bootstrap
    const paths = handlers.map((h: any) => h.info?.path || '');
    expect(paths.some((p: string) => p.includes('bootstrap-static'))).toBe(true);
  });

  it('creates handler for entry endpoint', () => {
    const handlers = createFPLHandlers(testSnapshot);
    const paths = handlers.map((h: any) => h.info?.path || '');
    expect(paths.some((p: string) => p.includes('entry'))).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run msw-handlers.test.ts`
Expected: FAIL

**Step 3: Write implementation**

```typescript
// src/test-utils/msw-handlers.ts
import { http, HttpResponse } from 'msw';
import { FPLTestSnapshot } from './fpl-fixture-types';

const FPL_API_BASE = '/api/fpl';

export function createFPLHandlers(snapshot: FPLTestSnapshot) {
  return [
    // Bootstrap static
    http.get(`${FPL_API_BASE}/bootstrap-static/`, () => {
      return HttpResponse.json(snapshot.bootstrapStatic);
    }),

    // All fixtures
    http.get(`${FPL_API_BASE}/fixtures/`, ({ request }) => {
      const url = new URL(request.url);
      const event = url.searchParams.get('event');

      if (event) {
        const gw = parseInt(event);
        return HttpResponse.json(snapshot.fixtures.filter((f: any) => f.event === gw));
      }

      return HttpResponse.json(snapshot.fixtures);
    }),

    // Live scores
    http.get(`${FPL_API_BASE}/event/:gameweek/live/`, () => {
      if (!snapshot.liveScores) {
        return new HttpResponse(null, { status: 404 });
      }
      return HttpResponse.json(snapshot.liveScores);
    }),

    // Event status
    http.get(`${FPL_API_BASE}/event-status/`, () => {
      return HttpResponse.json(snapshot.eventStatus);
    }),

    // Dream team
    http.get(`${FPL_API_BASE}/dream-team/:gameweek/`, () => {
      if (!snapshot.dreamTeam) {
        return new HttpResponse(null, { status: 404 });
      }
      return HttpResponse.json(snapshot.dreamTeam);
    }),

    // League standings
    http.get(`${FPL_API_BASE}/leagues-classic/:leagueId/standings/`, () => {
      return HttpResponse.json(snapshot.leagueStandings);
    }),

    // Entry (team info)
    http.get(`${FPL_API_BASE}/entry/:teamId/`, ({ params }) => {
      const teamId = parseInt(params.teamId as string);
      const teamData = snapshot.teamData[teamId];

      if (!teamData) {
        return new HttpResponse(null, { status: 404 });
      }

      return HttpResponse.json(teamData.entry);
    }),

    // Entry history
    http.get(`${FPL_API_BASE}/entry/:teamId/history/`, ({ params }) => {
      const teamId = parseInt(params.teamId as string);
      const teamData = snapshot.teamData[teamId];

      if (!teamData) {
        return new HttpResponse(null, { status: 404 });
      }

      return HttpResponse.json(teamData.history);
    }),

    // Entry transfers
    http.get(`${FPL_API_BASE}/entry/:teamId/transfers/`, ({ params }) => {
      const teamId = parseInt(params.teamId as string);
      const teamData = snapshot.teamData[teamId];

      if (!teamData) {
        return new HttpResponse(null, { status: 404 });
      }

      return HttpResponse.json(teamData.transfers);
    }),

    // Entry picks
    http.get(`${FPL_API_BASE}/entry/:teamId/event/:gameweek/picks/`, ({ params }) => {
      const teamId = parseInt(params.teamId as string);
      const gameweek = parseInt(params.gameweek as string);
      const teamData = snapshot.teamData[teamId];

      if (!teamData || !teamData.picks[gameweek]) {
        return new HttpResponse(null, { status: 404 });
      }

      return HttpResponse.json(teamData.picks[gameweek]);
    }),

    // Element summary
    http.get(`${FPL_API_BASE}/element-summary/:playerId/`, ({ params }) => {
      const playerId = parseInt(params.playerId as string);
      const summary = snapshot.playerSummaries[playerId];

      if (!summary) {
        return new HttpResponse(null, { status: 404 });
      }

      return HttpResponse.json(summary);
    }),
  ];
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --run msw-handlers.test.ts`
Expected: PASS

**Step 5: Update index.ts export**

```typescript
// Add to src/test-utils/index.ts
export * from './msw-handlers';
```

**Step 6: Commit**

```bash
git add src/test-utils/msw-handlers.ts src/test-utils/msw-handlers.test.ts src/test-utils/index.ts
git commit -m "$(cat <<'EOF'
feat(test-utils): add MSW handlers for FPL API mocking

Create createFPLHandlers() that generates MSW request handlers
for all FPL API endpoints using snapshot data. Enables E2E
testing with controlled API responses.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 17: Create E2E Test Helper for MSW

**Files:**
- Create: `e2e/helpers/msw-setup.ts`

**Step 1: Create MSW setup helper**

```typescript
// e2e/helpers/msw-setup.ts
import { Page } from '@playwright/test';
import { FPLTestSnapshot } from '../../src/test-utils/fpl-fixture-types';

/**
 * Sets up MSW handlers for a Playwright page by injecting
 * route handlers that intercept FPL API calls.
 *
 * Usage:
 *   const snapshot = loadScenario('gw-finished');
 *   await setupFPLMocks(page, snapshot);
 */
export async function setupFPLMocks(page: Page, snapshot: FPLTestSnapshot) {
  // Route all FPL API calls through Playwright's routing
  await page.route('**/api/fpl/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace('/api/fpl', '');

    // Bootstrap static
    if (path === '/bootstrap-static/') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(snapshot.bootstrapStatic),
      });
    }

    // Fixtures
    if (path === '/fixtures/' || path.startsWith('/fixtures')) {
      const event = url.searchParams.get('event');
      const fixtures = event
        ? snapshot.fixtures.filter((f: any) => f.event === parseInt(event))
        : snapshot.fixtures;
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(fixtures),
      });
    }

    // Live scores
    const liveMatch = path.match(/\/event\/(\d+)\/live\//);
    if (liveMatch) {
      if (!snapshot.liveScores) {
        return route.fulfill({ status: 404 });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(snapshot.liveScores),
      });
    }

    // Event status
    if (path === '/event-status/') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(snapshot.eventStatus),
      });
    }

    // Dream team
    const dreamMatch = path.match(/\/dream-team\/(\d+)\//);
    if (dreamMatch) {
      if (!snapshot.dreamTeam) {
        return route.fulfill({ status: 404 });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(snapshot.dreamTeam),
      });
    }

    // League standings
    const leagueMatch = path.match(/\/leagues-classic\/(\d+)\/standings\//);
    if (leagueMatch) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(snapshot.leagueStandings),
      });
    }

    // Entry info
    const entryMatch = path.match(/\/entry\/(\d+)\/$/);
    if (entryMatch) {
      const teamId = parseInt(entryMatch[1]);
      const teamData = snapshot.teamData[teamId];
      if (!teamData) {
        return route.fulfill({ status: 404 });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(teamData.entry),
      });
    }

    // Entry history
    const historyMatch = path.match(/\/entry\/(\d+)\/history\//);
    if (historyMatch) {
      const teamId = parseInt(historyMatch[1]);
      const teamData = snapshot.teamData[teamId];
      if (!teamData) {
        return route.fulfill({ status: 404 });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(teamData.history),
      });
    }

    // Entry transfers
    const transfersMatch = path.match(/\/entry\/(\d+)\/transfers\//);
    if (transfersMatch) {
      const teamId = parseInt(transfersMatch[1]);
      const teamData = snapshot.teamData[teamId];
      if (!teamData) {
        return route.fulfill({ status: 404 });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(teamData.transfers),
      });
    }

    // Entry picks
    const picksMatch = path.match(/\/entry\/(\d+)\/event\/(\d+)\/picks\//);
    if (picksMatch) {
      const teamId = parseInt(picksMatch[1]);
      const gameweek = parseInt(picksMatch[2]);
      const teamData = snapshot.teamData[teamId];
      if (!teamData || !teamData.picks[gameweek]) {
        return route.fulfill({ status: 404 });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(teamData.picks[gameweek]),
      });
    }

    // Element summary
    const elementMatch = path.match(/\/element-summary\/(\d+)\//);
    if (elementMatch) {
      const playerId = parseInt(elementMatch[1]);
      const summary = snapshot.playerSummaries[playerId];
      if (!summary) {
        return route.fulfill({ status: 404 });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(summary),
      });
    }

    // Fallback - continue to actual API
    return route.continue();
  });
}

/**
 * Removes FPL API route handlers
 */
export async function clearFPLMocks(page: Page) {
  await page.unroute('**/api/fpl/**');
}
```

**Step 2: Commit**

```bash
git add e2e/helpers/msw-setup.ts
git commit -m "$(cat <<'EOF'
feat(e2e): add Playwright route handler for FPL mocking

Create setupFPLMocks() that uses Playwright's route API to
intercept FPL API calls during E2E tests. Returns snapshot
data for all endpoints, enabling controlled E2E testing.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 18: Create Minimal Test Scenario

**Files:**
- Create: `test-fixtures/scenarios/gw-finished-minimal.json`

**Step 1: Create minimal scenario file**

```json
{
  "capturedAt": "2025-12-15T14:00:00Z",
  "gameweek": 16,
  "gameweekStatus": "finished",
  "bootstrapStatic": {
    "events": [
      { "id": 15, "is_current": false, "finished": true },
      { "id": 16, "is_current": true, "finished": true },
      { "id": 17, "is_current": false, "finished": false }
    ],
    "elements": [
      { "id": 100, "web_name": "Salah", "element_type": 3, "team": 14, "now_cost": 130, "selected_by_percent": "60.0" },
      { "id": 200, "web_name": "Haaland", "element_type": 4, "team": 13, "now_cost": 150, "selected_by_percent": "80.0" }
    ],
    "teams": [
      { "id": 13, "name": "Man City", "short_name": "MCI" },
      { "id": 14, "name": "Liverpool", "short_name": "LIV" }
    ],
    "element_types": [
      { "id": 1, "singular_name": "Goalkeeper", "plural_name": "Goalkeepers" },
      { "id": 2, "singular_name": "Defender", "plural_name": "Defenders" },
      { "id": 3, "singular_name": "Midfielder", "plural_name": "Midfielders" },
      { "id": 4, "singular_name": "Forward", "plural_name": "Forwards" }
    ]
  },
  "fixtures": [
    { "id": 160, "event": 16, "team_h": 13, "team_a": 14, "started": true, "finished": true, "minutes": 90 }
  ],
  "fixturesCurrentGW": [
    { "id": 160, "event": 16, "team_h": 13, "team_a": 14, "started": true, "finished": true, "minutes": 90 }
  ],
  "liveScores": {
    "elements": [
      { "id": 100, "stats": { "total_points": 15 } },
      { "id": 200, "stats": { "total_points": 12 } }
    ]
  },
  "eventStatus": { "status": [], "leagues": "Updated" },
  "dreamTeam": null,
  "leagueStandings": {
    "league": { "id": 634129, "name": "FLOAWO" },
    "standings": {
      "results": [
        { "entry": 158256, "entry_name": "Team Alpha", "player_name": "Alice", "rank": 1, "total": 520 },
        { "entry": 71631, "entry_name": "Team Beta", "player_name": "Bob", "rank": 2, "total": 480 }
      ]
    }
  },
  "teamData": {
    "158256": {
      "entry": {
        "id": 158256,
        "name": "Team Alpha",
        "player_first_name": "Alice",
        "player_last_name": "Smith",
        "summary_overall_points": 520,
        "summary_overall_rank": 50000
      },
      "history": { "current": [], "past": [], "chips": [] },
      "transfers": [],
      "picks": {
        "16": {
          "picks": [
            { "element": 100, "position": 1, "multiplier": 2, "is_captain": true, "is_vice_captain": false },
            { "element": 200, "position": 2, "multiplier": 1, "is_captain": false, "is_vice_captain": true }
          ],
          "entry_history": { "event": 16, "points": 75, "total_points": 520 },
          "active_chip": null
        }
      }
    },
    "71631": {
      "entry": {
        "id": 71631,
        "name": "Team Beta",
        "player_first_name": "Bob",
        "player_last_name": "Jones",
        "summary_overall_points": 480,
        "summary_overall_rank": 100000
      },
      "history": { "current": [], "past": [], "chips": [] },
      "transfers": [],
      "picks": {
        "16": {
          "picks": [
            { "element": 200, "position": 1, "multiplier": 2, "is_captain": true, "is_vice_captain": false },
            { "element": 100, "position": 2, "multiplier": 1, "is_captain": false, "is_vice_captain": true }
          ],
          "entry_history": { "event": 16, "points": 68, "total_points": 480 },
          "active_chip": null
        }
      }
    }
  },
  "playerSummaries": {}
}
```

**Step 2: Commit**

```bash
git add test-fixtures/scenarios/gw-finished-minimal.json
git commit -m "$(cat <<'EOF'
feat(fixtures): add minimal gw-finished test scenario

Create a minimal but complete test scenario with 2 teams,
2 players, and finished gameweek state. Suitable for unit
and E2E testing of gameweek completion flows.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 19: Add Demo Mode Support

**Files:**
- Modify: `vite.config.ts`
- Create: `src/demo/demo-setup.ts`

**Step 1: Create demo setup module**

```typescript
// src/demo/demo-setup.ts
import { setupWorker } from 'msw/browser';
import { createFPLHandlers } from '../test-utils/msw-handlers';

// Import the minimal scenario directly for demo mode
// In production, this would load from a file
const demoSnapshot = {
  capturedAt: '2025-12-15T14:00:00Z',
  gameweek: 16,
  gameweekStatus: 'in_progress' as const,
  bootstrapStatic: {
    events: [{ id: 16, is_current: true, finished: false }],
    elements: [
      { id: 100, web_name: 'Salah', element_type: 3, team: 14, now_cost: 130 },
      { id: 200, web_name: 'Haaland', element_type: 4, team: 13, now_cost: 150 },
    ],
    teams: [
      { id: 13, name: 'Man City' },
      { id: 14, name: 'Liverpool' },
    ],
    element_types: [],
  },
  fixtures: [],
  fixturesCurrentGW: [
    { id: 160, event: 16, team_h: 13, team_a: 14, started: true, finished: false, minutes: 45 },
  ],
  liveScores: {
    elements: [
      { id: 100, stats: { total_points: 8 } },
      { id: 200, stats: { total_points: 6 } },
    ],
  },
  eventStatus: { status: [], leagues: '' },
  dreamTeam: null,
  leagueStandings: {
    league: { id: 634129, name: 'FLOAWO' },
    standings: { results: [] },
  },
  teamData: {
    158256: {
      entry: { id: 158256, name: 'Demo Team', player_first_name: 'Demo', player_last_name: 'User', summary_overall_points: 500, summary_overall_rank: 50000 },
      history: { current: [], past: [], chips: [] },
      transfers: [],
      picks: {
        16: {
          picks: [
            { element: 100, position: 1, multiplier: 2, is_captain: true, is_vice_captain: false },
          ],
          entry_history: { event: 16, points: 50, total_points: 500 },
          active_chip: null,
        },
      },
    },
  },
  playerSummaries: {},
};

export async function setupDemoMode() {
  if (import.meta.env.VITE_DEMO_MODE !== 'true') {
    return;
  }

  console.log('🎮 Demo mode enabled - using mock FPL data');

  const handlers = createFPLHandlers(demoSnapshot);
  const worker = setupWorker(...handlers);

  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  });

  console.log('✓ MSW worker started');
}
```

**Step 2: Update main.tsx to call setupDemoMode**

Read and update `src/main.tsx` to conditionally call `setupDemoMode()` before rendering.

**Step 3: Generate MSW service worker**

```bash
npx msw init public/ --save
```

**Step 4: Add npm script for demo mode**

```json
{
  "scripts": {
    "dev:demo": "VITE_DEMO_MODE=true vite"
  }
}
```

**Step 5: Commit**

```bash
git add src/demo/demo-setup.ts public/mockServiceWorker.js package.json
git commit -m "$(cat <<'EOF'
feat(demo): add demo mode with mock FPL data

Add VITE_DEMO_MODE support that uses MSW to intercept FPL API
calls and return mock data. Run with: npm run dev:demo

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 20: Deploy and Verify Snapshot Function

**Files:**
- None (deployment step)

**Step 1: Build functions**

```bash
cd functions && npm run build
```

**Step 2: Deploy snapshot function**

```bash
firebase deploy --only functions:captureFloawoSnapshot
```

**Step 3: Verify function deployed**

```bash
firebase functions:log --only captureFloawoSnapshot
```

**Step 4: Manually trigger function for testing**

The function is scheduled, but for initial testing, use Firebase console
or create a one-time HTTP trigger for testing.

**Step 5: Verify snapshot in Firestore**

Use Firebase console to check `fpl_snapshots` collection for new documents.

**Step 6: Commit (if any config changes)**

```bash
git add .
git commit -m "$(cat <<'EOF'
chore(deploy): deploy FPL snapshot capture function

Deploy captureFloawoSnapshot scheduled function to production.
Runs hourly 11:00-23:00 GMT to capture FPL API data.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Summary

This plan implements the FPL Test Fixtures Infrastructure in 4 phases with 20 tasks:

**Phase 1: Data Collection (Tasks 1-5)**
- FPLSnapshot types
- FPL API fetcher module
- Snapshot capture service
- Scheduled Firebase function
- Firestore security rules

**Phase 2: Local Fixtures (Tasks 6-10)**
- Directory structure
- Fixture types for frontend
- Fixture loader
- CLI download script
- Scenario creation script

**Phase 3: Test Utilities (Tasks 11-14)**
- Gameweek state transformers
- Score transformers
- Mock FPL service provider
- Test utils index export

**Phase 4: E2E & Dev Mode (Tasks 15-20)**
- MSW installation
- MSW handlers
- E2E test helper
- Minimal test scenario
- Demo mode support
- Deploy and verify

Each task includes explicit test-first steps, exact file paths, and commit messages.
