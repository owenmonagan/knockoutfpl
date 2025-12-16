# Layer 1: FPL Data Collection Infrastructure - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Firebase scheduled function that captures complete FPL API data for the FLOAWO league hourly and stores snapshots in Firestore.

**Architecture:** A scheduled Cloud Function runs hourly (11:00-23:00 GMT), fetches all relevant FPL API endpoints for the FLOAWO league (634129) and its 15 team members, then stores the complete snapshot in the `fpl_snapshots` Firestore collection. Each snapshot is ~2.5MB and captures the entire state needed for testing.

**Tech Stack:** Firebase Cloud Functions v2 (Node 20), Firestore, TypeScript, Vitest

---

## Task 1: Create FPL API Response Types

**Files:**
- Create: `functions/src/types/fplApiResponses.ts`
- Test: `functions/src/types/fplApiResponses.test.ts`

### Step 1: Write the test file structure

```typescript
// functions/src/types/fplApiResponses.test.ts
import { describe, it, expect } from 'vitest';
import type {
  BootstrapResponse,
  FixtureResponse,
  LiveResponse,
  EventStatusResponse,
  DreamTeamResponse,
  SetPieceResponse,
  LeagueStandingsResponse,
  EntryResponse,
  HistoryResponse,
  TransferResponse,
  PicksResponse,
  ElementSummaryResponse,
} from './fplApiResponses';

describe('FPL API Response Types', () => {
  it('should allow valid BootstrapResponse structure', () => {
    const bootstrap: BootstrapResponse = {
      events: [{ id: 1, name: 'Gameweek 1', is_current: true, is_next: false, finished: false, deadline_time: '2025-08-16T10:00:00Z' }],
      teams: [{ id: 1, name: 'Arsenal', short_name: 'ARS' }],
      elements: [{ id: 1, web_name: 'Saka', element_type: 3, team: 1, now_cost: 100 }],
      element_types: [{ id: 1, singular_name: 'Goalkeeper', plural_name: 'Goalkeepers' }],
    };
    expect(bootstrap.events).toHaveLength(1);
  });

  it('should allow valid FixtureResponse structure', () => {
    const fixture: FixtureResponse = {
      id: 1,
      event: 16,
      team_h: 1,
      team_a: 2,
      team_h_score: 2,
      team_a_score: 1,
      started: true,
      finished: true,
      minutes: 90,
      kickoff_time: '2025-12-14T15:00:00Z',
    };
    expect(fixture.finished).toBe(true);
  });

  it('should allow valid LeagueStandingsResponse structure', () => {
    const standings: LeagueStandingsResponse = {
      league: { id: 634129, name: 'FLOAWO' },
      standings: {
        results: [
          { entry: 158256, entry_name: 'Test Team', player_name: 'Test Manager', rank: 1, total: 1000 }
        ]
      }
    };
    expect(standings.standings.results).toHaveLength(1);
  });

  it('should allow valid EntryResponse structure', () => {
    const entry: EntryResponse = {
      id: 158256,
      name: 'Test Team',
      player_first_name: 'Test',
      player_last_name: 'User',
      summary_overall_points: 1000,
      summary_overall_rank: 50000,
      summary_event_points: 65,
      summary_event_rank: 100000,
      last_deadline_value: 1005,
    };
    expect(entry.id).toBe(158256);
  });

  it('should allow valid PicksResponse structure', () => {
    const picks: PicksResponse = {
      picks: [
        { element: 1, position: 1, multiplier: 1, is_captain: false, is_vice_captain: false }
      ],
      entry_history: { event: 16, points: 65, total_points: 1000, rank: 100000 },
      active_chip: null,
    };
    expect(picks.picks).toHaveLength(1);
  });
});
```

### Step 2: Run test to verify it fails

Run: `cd functions && npm test -- --run`
Expected: FAIL with "Cannot find module './fplApiResponses'"

### Step 3: Create the types file

```typescript
// functions/src/types/fplApiResponses.ts

// === BOOTSTRAP STATIC ===

export interface FPLEvent {
  id: number;
  name: string;
  is_current: boolean;
  is_next: boolean;
  finished: boolean;
  deadline_time: string;
}

export interface FPLTeam {
  id: number;
  name: string;
  short_name: string;
}

export interface FPLElement {
  id: number;
  web_name: string;
  element_type: number;
  team: number;
  now_cost: number;
}

export interface FPLElementType {
  id: number;
  singular_name: string;
  plural_name: string;
}

export interface BootstrapResponse {
  events: FPLEvent[];
  teams: FPLTeam[];
  elements: FPLElement[];
  element_types: FPLElementType[];
}

// === FIXTURES ===

export interface FixtureResponse {
  id: number;
  event: number;
  team_h: number;
  team_a: number;
  team_h_score: number | null;
  team_a_score: number | null;
  started: boolean;
  finished: boolean;
  minutes: number;
  kickoff_time: string;
}

// === LIVE SCORES ===

export interface LiveElementStats {
  total_points: number;
  minutes: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  bonus: number;
}

export interface LiveElement {
  id: number;
  stats: LiveElementStats;
}

export interface LiveResponse {
  elements: LiveElement[];
}

// === EVENT STATUS ===

export interface EventStatusItem {
  event: number;
  points: string;
  bonus_added: boolean;
}

export interface EventStatusResponse {
  status: EventStatusItem[];
}

// === DREAM TEAM ===

export interface DreamTeamPick {
  element: number;
  points: number;
  position: number;
}

export interface DreamTeamResponse {
  top_player: { id: number; points: number } | null;
  team: DreamTeamPick[];
}

// === SET PIECE NOTES ===

export interface SetPieceResponse {
  teams: Array<{
    id: number;
    notes: Array<{ info_message: string }>;
  }>;
}

// === LEAGUE STANDINGS ===

export interface LeagueInfo {
  id: number;
  name: string;
}

export interface LeagueStandingEntry {
  entry: number;
  entry_name: string;
  player_name: string;
  rank: number;
  total: number;
}

export interface LeagueStandingsResponse {
  league: LeagueInfo;
  standings: {
    results: LeagueStandingEntry[];
  };
}

// === ENTRY (TEAM INFO) ===

export interface EntryResponse {
  id: number;
  name: string;
  player_first_name: string;
  player_last_name: string;
  summary_overall_points: number;
  summary_overall_rank: number;
  summary_event_points: number;
  summary_event_rank: number;
  last_deadline_value: number;
}

// === HISTORY ===

export interface HistoryEvent {
  event: number;
  points: number;
  total_points: number;
  rank: number;
  overall_rank: number;
}

export interface HistoryChip {
  name: string;
  event: number;
}

export interface HistoryResponse {
  current: HistoryEvent[];
  chips: HistoryChip[];
}

// === TRANSFERS ===

export interface TransferItem {
  element_in: number;
  element_out: number;
  event: number;
  time: string;
}

export type TransferResponse = TransferItem[];

// === PICKS ===

export interface PickItem {
  element: number;
  position: number;
  multiplier: number;
  is_captain: boolean;
  is_vice_captain: boolean;
}

export interface PicksEntryHistory {
  event: number;
  points: number;
  total_points: number;
  rank: number;
}

export interface PicksResponse {
  picks: PickItem[];
  entry_history: PicksEntryHistory;
  active_chip: string | null;
}

// === ELEMENT SUMMARY ===

export interface ElementSummaryFixture {
  event: number;
  is_home: boolean;
  difficulty: number;
}

export interface ElementSummaryHistory {
  element: number;
  fixture: number;
  total_points: number;
  round: number;
}

export interface ElementSummaryResponse {
  fixtures: ElementSummaryFixture[];
  history: ElementSummaryHistory[];
}
```

### Step 4: Run test to verify it passes

Run: `cd functions && npm test -- --run`
Expected: PASS

### Step 5: Commit

```bash
git add functions/src/types/
git commit -m "feat(types): add FPL API response types for snapshot capture"
```

---

## Task 2: Create FPLSnapshot Interface

**Files:**
- Create: `functions/src/types/fplSnapshot.ts`
- Modify: `functions/src/types/fplApiResponses.test.ts` (add snapshot tests)

### Step 1: Write test for FPLSnapshot type

Add to `functions/src/types/fplApiResponses.test.ts`:

```typescript
import type { FPLSnapshot, GameweekStatus } from './fplSnapshot';
import { Timestamp } from 'firebase-admin/firestore';

describe('FPLSnapshot Type', () => {
  it('should allow valid FPLSnapshot structure', () => {
    const snapshot: FPLSnapshot = {
      capturedAt: Timestamp.now(),
      gameweek: 16,
      gameweekStatus: 'in_progress',
      leagueId: 634129,

      bootstrapStatic: {
        events: [],
        teams: [],
        elements: [],
        element_types: [],
      },
      fixtures: [],
      fixturesCurrentGW: [],
      liveScores: null,
      eventStatus: { status: [] },
      dreamTeam: null,
      setPieceNotes: { teams: [] },

      leagueStandings: {
        league: { id: 634129, name: 'FLOAWO' },
        standings: { results: [] },
      },

      teamData: {},
      playerSummaries: {},
    };

    expect(snapshot.gameweek).toBe(16);
    expect(snapshot.gameweekStatus).toBe('in_progress');
  });

  it('should allow teamData with nested picks by gameweek', () => {
    const snapshot: FPLSnapshot = {
      capturedAt: Timestamp.now(),
      gameweek: 16,
      gameweekStatus: 'finished',
      leagueId: 634129,
      bootstrapStatic: { events: [], teams: [], elements: [], element_types: [] },
      fixtures: [],
      fixturesCurrentGW: [],
      liveScores: null,
      eventStatus: { status: [] },
      dreamTeam: null,
      setPieceNotes: { teams: [] },
      leagueStandings: { league: { id: 634129, name: 'FLOAWO' }, standings: { results: [] } },
      teamData: {
        158256: {
          entry: {
            id: 158256,
            name: 'Test Team',
            player_first_name: 'Test',
            player_last_name: 'User',
            summary_overall_points: 1000,
            summary_overall_rank: 50000,
            summary_event_points: 65,
            summary_event_rank: 100000,
            last_deadline_value: 1005,
          },
          history: { current: [], chips: [] },
          transfers: [],
          picks: {
            16: {
              picks: [],
              entry_history: { event: 16, points: 65, total_points: 1000, rank: 100000 },
              active_chip: null,
            },
          },
        },
      },
      playerSummaries: {},
    };

    expect(snapshot.teamData[158256].picks[16].entry_history.points).toBe(65);
  });
});
```

### Step 2: Run test to verify it fails

Run: `cd functions && npm test -- --run`
Expected: FAIL with "Cannot find module './fplSnapshot'"

### Step 3: Create the FPLSnapshot type file

```typescript
// functions/src/types/fplSnapshot.ts
import { Timestamp } from 'firebase-admin/firestore';
import type {
  BootstrapResponse,
  FixtureResponse,
  LiveResponse,
  EventStatusResponse,
  DreamTeamResponse,
  SetPieceResponse,
  LeagueStandingsResponse,
  EntryResponse,
  HistoryResponse,
  TransferResponse,
  PicksResponse,
  ElementSummaryResponse,
} from './fplApiResponses';

export type GameweekStatus = 'not_started' | 'in_progress' | 'finished';

export interface TeamSnapshotData {
  entry: EntryResponse;
  history: HistoryResponse;
  transfers: TransferResponse;
  picks: {
    [gameweek: number]: PicksResponse;
  };
}

export interface FPLSnapshot {
  capturedAt: Timestamp;
  gameweek: number;
  gameweekStatus: GameweekStatus;
  leagueId: number;

  // Global data
  bootstrapStatic: BootstrapResponse;
  fixtures: FixtureResponse[];
  fixturesCurrentGW: FixtureResponse[];
  liveScores: LiveResponse | null;
  eventStatus: EventStatusResponse;
  dreamTeam: DreamTeamResponse | null;
  setPieceNotes: SetPieceResponse;

  // League data
  leagueStandings: LeagueStandingsResponse;

  // Per-team data
  teamData: {
    [teamId: number]: TeamSnapshotData;
  };

  // Player deep data (top owned)
  playerSummaries: {
    [playerId: number]: ElementSummaryResponse;
  };
}
```

### Step 4: Run test to verify it passes

Run: `cd functions && npm test -- --run`
Expected: PASS

### Step 5: Create types index file

```typescript
// functions/src/types/index.ts
export * from './fplApiResponses';
export * from './fplSnapshot';
```

### Step 6: Commit

```bash
git add functions/src/types/
git commit -m "feat(types): add FPLSnapshot type for data collection"
```

---

## Task 3: Create FPL API Fetcher Module

**Files:**
- Create: `functions/src/fplApiFetcher.ts`
- Create: `functions/src/fplApiFetcher.test.ts`

### Step 1: Write test for fetchBootstrapStatic

```typescript
// functions/src/fplApiFetcher.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchBootstrapStatic, fetchFixtures, fetchLiveScores, fetchLeagueStandings, fetchEntry, fetchHistory, fetchTransfers, fetchPicks, FPL_API_BASE } from './fplApiFetcher';
import type { BootstrapResponse } from './types';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('FPL API Fetcher', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('fetchBootstrapStatic', () => {
    it('should fetch and return bootstrap data', async () => {
      const mockData: BootstrapResponse = {
        events: [{ id: 16, name: 'Gameweek 16', is_current: true, is_next: false, finished: false, deadline_time: '2025-12-14T11:00:00Z' }],
        teams: [],
        elements: [],
        element_types: [],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await fetchBootstrapStatic();

      expect(mockFetch).toHaveBeenCalledWith(`${FPL_API_BASE}/bootstrap-static/`);
      expect(result).toEqual(mockData);
    });

    it('should throw on fetch failure', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

      await expect(fetchBootstrapStatic()).rejects.toThrow('FPL API error: 500');
    });
  });

  describe('fetchFixtures', () => {
    it('should fetch all fixtures', async () => {
      const mockData = [{ id: 1, event: 16, team_h: 1, team_a: 2, started: true, finished: false }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await fetchFixtures();

      expect(mockFetch).toHaveBeenCalledWith(`${FPL_API_BASE}/fixtures/`);
      expect(result).toEqual(mockData);
    });

    it('should fetch fixtures for specific gameweek', async () => {
      const mockData = [{ id: 1, event: 16, team_h: 1, team_a: 2, started: true, finished: false }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await fetchFixtures(16);

      expect(mockFetch).toHaveBeenCalledWith(`${FPL_API_BASE}/fixtures/?event=16`);
      expect(result).toEqual(mockData);
    });
  });

  describe('fetchLiveScores', () => {
    it('should fetch live scores for gameweek', async () => {
      const mockData = { elements: [{ id: 1, stats: { total_points: 10 } }] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await fetchLiveScores(16);

      expect(mockFetch).toHaveBeenCalledWith(`${FPL_API_BASE}/event/16/live/`);
      expect(result).toEqual(mockData);
    });
  });

  describe('fetchLeagueStandings', () => {
    it('should fetch league standings', async () => {
      const mockData = {
        league: { id: 634129, name: 'FLOAWO' },
        standings: { results: [{ entry: 158256, entry_name: 'Test', rank: 1 }] },
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await fetchLeagueStandings(634129);

      expect(mockFetch).toHaveBeenCalledWith(`${FPL_API_BASE}/leagues-classic/634129/standings/`);
      expect(result).toEqual(mockData);
    });
  });

  describe('fetchEntry', () => {
    it('should fetch team entry data', async () => {
      const mockData = { id: 158256, name: 'Test Team' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await fetchEntry(158256);

      expect(mockFetch).toHaveBeenCalledWith(`${FPL_API_BASE}/entry/158256/`);
      expect(result).toEqual(mockData);
    });
  });

  describe('fetchHistory', () => {
    it('should fetch team history', async () => {
      const mockData = { current: [], chips: [] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await fetchHistory(158256);

      expect(mockFetch).toHaveBeenCalledWith(`${FPL_API_BASE}/entry/158256/history/`);
      expect(result).toEqual(mockData);
    });
  });

  describe('fetchTransfers', () => {
    it('should fetch team transfers', async () => {
      const mockData = [{ element_in: 1, element_out: 2, event: 16 }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await fetchTransfers(158256);

      expect(mockFetch).toHaveBeenCalledWith(`${FPL_API_BASE}/entry/158256/transfers/`);
      expect(result).toEqual(mockData);
    });
  });

  describe('fetchPicks', () => {
    it('should fetch team picks for gameweek', async () => {
      const mockData = { picks: [], entry_history: { event: 16, points: 65 }, active_chip: null };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await fetchPicks(158256, 16);

      expect(mockFetch).toHaveBeenCalledWith(`${FPL_API_BASE}/entry/158256/event/16/picks/`);
      expect(result).toEqual(mockData);
    });
  });
});
```

### Step 2: Run test to verify it fails

Run: `cd functions && npm test -- --run`
Expected: FAIL with "Cannot find module './fplApiFetcher'"

### Step 3: Implement FPL API Fetcher

```typescript
// functions/src/fplApiFetcher.ts
import type {
  BootstrapResponse,
  FixtureResponse,
  LiveResponse,
  EventStatusResponse,
  DreamTeamResponse,
  SetPieceResponse,
  LeagueStandingsResponse,
  EntryResponse,
  HistoryResponse,
  TransferResponse,
  PicksResponse,
  ElementSummaryResponse,
} from './types';

export const FPL_API_BASE = 'https://fantasy.premierleague.com/api';

async function fetchJSON<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`FPL API error: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchBootstrapStatic(): Promise<BootstrapResponse> {
  return fetchJSON(`${FPL_API_BASE}/bootstrap-static/`);
}

export async function fetchFixtures(gameweek?: number): Promise<FixtureResponse[]> {
  const url = gameweek
    ? `${FPL_API_BASE}/fixtures/?event=${gameweek}`
    : `${FPL_API_BASE}/fixtures/`;
  return fetchJSON(url);
}

export async function fetchLiveScores(gameweek: number): Promise<LiveResponse> {
  return fetchJSON(`${FPL_API_BASE}/event/${gameweek}/live/`);
}

export async function fetchEventStatus(): Promise<EventStatusResponse> {
  return fetchJSON(`${FPL_API_BASE}/event-status/`);
}

export async function fetchDreamTeam(gameweek: number): Promise<DreamTeamResponse> {
  return fetchJSON(`${FPL_API_BASE}/dream-team/${gameweek}/`);
}

export async function fetchSetPieceNotes(): Promise<SetPieceResponse> {
  return fetchJSON(`${FPL_API_BASE}/team/set-piece-notes/`);
}

export async function fetchLeagueStandings(leagueId: number): Promise<LeagueStandingsResponse> {
  return fetchJSON(`${FPL_API_BASE}/leagues-classic/${leagueId}/standings/`);
}

export async function fetchEntry(teamId: number): Promise<EntryResponse> {
  return fetchJSON(`${FPL_API_BASE}/entry/${teamId}/`);
}

export async function fetchHistory(teamId: number): Promise<HistoryResponse> {
  return fetchJSON(`${FPL_API_BASE}/entry/${teamId}/history/`);
}

export async function fetchTransfers(teamId: number): Promise<TransferResponse> {
  return fetchJSON(`${FPL_API_BASE}/entry/${teamId}/transfers/`);
}

export async function fetchPicks(teamId: number, gameweek: number): Promise<PicksResponse> {
  return fetchJSON(`${FPL_API_BASE}/entry/${teamId}/event/${gameweek}/picks/`);
}

export async function fetchElementSummary(elementId: number): Promise<ElementSummaryResponse> {
  return fetchJSON(`${FPL_API_BASE}/element-summary/${elementId}/`);
}
```

### Step 4: Run test to verify it passes

Run: `cd functions && npm test -- --run`
Expected: PASS

### Step 5: Commit

```bash
git add functions/src/fplApiFetcher.ts functions/src/fplApiFetcher.test.ts
git commit -m "feat(functions): add FPL API fetcher module with typed responses"
```

---

## Task 4: Create Snapshot Capture Service

**Files:**
- Create: `functions/src/snapshotCapture.ts`
- Create: `functions/src/snapshotCapture.test.ts`

### Step 1: Write test for determineGameweekStatus

```typescript
// functions/src/snapshotCapture.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { determineGameweekStatus, getCurrentGameweek, getTeamIdsFromStandings } from './snapshotCapture';
import type { BootstrapResponse, FixtureResponse, LeagueStandingsResponse } from './types';

describe('Snapshot Capture Service', () => {
  describe('determineGameweekStatus', () => {
    it('should return "not_started" when no fixtures have started', () => {
      const fixtures: FixtureResponse[] = [
        { id: 1, event: 16, team_h: 1, team_a: 2, team_h_score: null, team_a_score: null, started: false, finished: false, minutes: 0, kickoff_time: '2025-12-14T15:00:00Z' },
        { id: 2, event: 16, team_h: 3, team_a: 4, team_h_score: null, team_a_score: null, started: false, finished: false, minutes: 0, kickoff_time: '2025-12-14T17:30:00Z' },
      ];

      expect(determineGameweekStatus(fixtures)).toBe('not_started');
    });

    it('should return "in_progress" when some fixtures have started but not all finished', () => {
      const fixtures: FixtureResponse[] = [
        { id: 1, event: 16, team_h: 1, team_a: 2, team_h_score: 2, team_a_score: 1, started: true, finished: true, minutes: 90, kickoff_time: '2025-12-14T15:00:00Z' },
        { id: 2, event: 16, team_h: 3, team_a: 4, team_h_score: 1, team_a_score: 0, started: true, finished: false, minutes: 45, kickoff_time: '2025-12-14T17:30:00Z' },
      ];

      expect(determineGameweekStatus(fixtures)).toBe('in_progress');
    });

    it('should return "finished" when all fixtures have finished', () => {
      const fixtures: FixtureResponse[] = [
        { id: 1, event: 16, team_h: 1, team_a: 2, team_h_score: 2, team_a_score: 1, started: true, finished: true, minutes: 90, kickoff_time: '2025-12-14T15:00:00Z' },
        { id: 2, event: 16, team_h: 3, team_a: 4, team_h_score: 1, team_a_score: 0, started: true, finished: true, minutes: 90, kickoff_time: '2025-12-14T17:30:00Z' },
      ];

      expect(determineGameweekStatus(fixtures)).toBe('finished');
    });

    it('should return "not_started" for empty fixtures array', () => {
      expect(determineGameweekStatus([])).toBe('not_started');
    });
  });

  describe('getCurrentGameweek', () => {
    it('should return current gameweek id from bootstrap', () => {
      const bootstrap: BootstrapResponse = {
        events: [
          { id: 15, name: 'Gameweek 15', is_current: false, is_next: false, finished: true, deadline_time: '2025-12-07T11:00:00Z' },
          { id: 16, name: 'Gameweek 16', is_current: true, is_next: false, finished: false, deadline_time: '2025-12-14T11:00:00Z' },
          { id: 17, name: 'Gameweek 17', is_current: false, is_next: true, finished: false, deadline_time: '2025-12-21T11:00:00Z' },
        ],
        teams: [],
        elements: [],
        element_types: [],
      };

      expect(getCurrentGameweek(bootstrap)).toBe(16);
    });

    it('should throw if no current gameweek found', () => {
      const bootstrap: BootstrapResponse = {
        events: [
          { id: 15, name: 'Gameweek 15', is_current: false, is_next: false, finished: true, deadline_time: '2025-12-07T11:00:00Z' },
        ],
        teams: [],
        elements: [],
        element_types: [],
      };

      expect(() => getCurrentGameweek(bootstrap)).toThrow('No current gameweek found');
    });
  });

  describe('getTeamIdsFromStandings', () => {
    it('should extract team IDs from league standings', () => {
      const standings: LeagueStandingsResponse = {
        league: { id: 634129, name: 'FLOAWO' },
        standings: {
          results: [
            { entry: 158256, entry_name: 'Team A', player_name: 'Manager A', rank: 1, total: 1000 },
            { entry: 234567, entry_name: 'Team B', player_name: 'Manager B', rank: 2, total: 950 },
            { entry: 345678, entry_name: 'Team C', player_name: 'Manager C', rank: 3, total: 900 },
          ],
        },
      };

      expect(getTeamIdsFromStandings(standings)).toEqual([158256, 234567, 345678]);
    });

    it('should return empty array for empty standings', () => {
      const standings: LeagueStandingsResponse = {
        league: { id: 634129, name: 'FLOAWO' },
        standings: { results: [] },
      };

      expect(getTeamIdsFromStandings(standings)).toEqual([]);
    });
  });
});
```

### Step 2: Run test to verify it fails

Run: `cd functions && npm test -- --run`
Expected: FAIL with "Cannot find module './snapshotCapture'"

### Step 3: Implement snapshot capture helpers

```typescript
// functions/src/snapshotCapture.ts
import type {
  BootstrapResponse,
  FixtureResponse,
  LeagueStandingsResponse,
} from './types';
import type { FPLSnapshot, GameweekStatus, TeamSnapshotData } from './types/fplSnapshot';
import { Timestamp } from 'firebase-admin/firestore';
import * as fetcher from './fplApiFetcher';

export const FLOAWO_LEAGUE_ID = 634129;

export function determineGameweekStatus(fixtures: FixtureResponse[]): GameweekStatus {
  if (fixtures.length === 0) {
    return 'not_started';
  }

  const allFinished = fixtures.every((f) => f.finished);
  const someStarted = fixtures.some((f) => f.started);

  if (allFinished) {
    return 'finished';
  }
  if (someStarted) {
    return 'in_progress';
  }
  return 'not_started';
}

export function getCurrentGameweek(bootstrap: BootstrapResponse): number {
  const current = bootstrap.events.find((e) => e.is_current);
  if (!current) {
    throw new Error('No current gameweek found');
  }
  return current.id;
}

export function getTeamIdsFromStandings(standings: LeagueStandingsResponse): number[] {
  return standings.standings.results.map((r) => r.entry);
}

export async function captureTeamData(
  teamId: number,
  currentGameweek: number
): Promise<TeamSnapshotData> {
  const [entry, history, transfers] = await Promise.all([
    fetcher.fetchEntry(teamId),
    fetcher.fetchHistory(teamId),
    fetcher.fetchTransfers(teamId),
  ]);

  // Fetch picks for current gameweek only (can expand later)
  const picks: TeamSnapshotData['picks'] = {};
  try {
    picks[currentGameweek] = await fetcher.fetchPicks(teamId, currentGameweek);
  } catch {
    // Picks may not be available yet before deadline
  }

  return { entry, history, transfers, picks };
}

export async function captureSnapshot(): Promise<FPLSnapshot> {
  // Fetch global data
  const [bootstrapStatic, fixtures, eventStatus, setPieceNotes, leagueStandings] =
    await Promise.all([
      fetcher.fetchBootstrapStatic(),
      fetcher.fetchFixtures(),
      fetcher.fetchEventStatus(),
      fetcher.fetchSetPieceNotes(),
      fetcher.fetchLeagueStandings(FLOAWO_LEAGUE_ID),
    ]);

  const currentGameweek = getCurrentGameweek(bootstrapStatic);
  const fixturesCurrentGW = fixtures.filter((f) => f.event === currentGameweek);
  const gameweekStatus = determineGameweekStatus(fixturesCurrentGW);

  // Fetch live scores and dream team if gameweek has started
  let liveScores = null;
  let dreamTeam = null;
  if (gameweekStatus !== 'not_started') {
    [liveScores, dreamTeam] = await Promise.all([
      fetcher.fetchLiveScores(currentGameweek).catch(() => null),
      fetcher.fetchDreamTeam(currentGameweek).catch(() => null),
    ]);
  }

  // Fetch team data for all league members
  const teamIds = getTeamIdsFromStandings(leagueStandings);
  const teamDataEntries = await Promise.all(
    teamIds.map(async (teamId) => {
      const data = await captureTeamData(teamId, currentGameweek);
      return [teamId, data] as const;
    })
  );
  const teamData = Object.fromEntries(teamDataEntries);

  // Fetch top 50 owned player summaries (simplified: skip for now)
  const playerSummaries = {};

  return {
    capturedAt: Timestamp.now(),
    gameweek: currentGameweek,
    gameweekStatus,
    leagueId: FLOAWO_LEAGUE_ID,
    bootstrapStatic,
    fixtures,
    fixturesCurrentGW,
    liveScores,
    eventStatus,
    dreamTeam,
    setPieceNotes,
    leagueStandings,
    teamData,
    playerSummaries,
  };
}
```

### Step 4: Run test to verify it passes

Run: `cd functions && npm test -- --run`
Expected: PASS

### Step 5: Commit

```bash
git add functions/src/snapshotCapture.ts functions/src/snapshotCapture.test.ts
git commit -m "feat(functions): add snapshot capture service with gameweek status detection"
```

---

## Task 5: Create Scheduled Firebase Function

**Files:**
- Modify: `functions/src/index.ts` (add scheduled function export)
- Create: `functions/src/captureFloawoSnapshot.ts`

### Step 1: Create the scheduled function file

```typescript
// functions/src/captureFloawoSnapshot.ts
import * as admin from 'firebase-admin';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { captureSnapshot, FLOAWO_LEAGUE_ID } from './snapshotCapture';

const db = admin.firestore();

/**
 * Scheduled function to capture FPL API snapshot for FLOAWO league.
 * Runs every hour from 11:00 to 23:00 GMT (covers all match times).
 *
 * Schedule: "0 11-23 * * *" means minute 0, hours 11-23, every day
 */
export const captureFloawoSnapshot = onSchedule(
  {
    schedule: '0 11-23 * * *',
    timeZone: 'Europe/London',
    retryCount: 3,
    memory: '512MiB',
    timeoutSeconds: 120,
  },
  async () => {
    console.log('Starting FLOAWO snapshot capture...');

    try {
      const snapshot = await captureSnapshot();

      // Generate document ID: gw{N}-{ISO timestamp}
      const timestamp = snapshot.capturedAt.toDate().toISOString().slice(0, 16).replace(':', '-');
      const docId = `gw${snapshot.gameweek}-${timestamp}`;

      // Store in Firestore
      await db.collection('fpl_snapshots').doc(docId).set(snapshot);

      console.log(`Snapshot captured successfully: ${docId}`);
      console.log(`Gameweek: ${snapshot.gameweek}, Status: ${snapshot.gameweekStatus}`);
      console.log(`Teams captured: ${Object.keys(snapshot.teamData).length}`);
    } catch (error) {
      console.error('Failed to capture snapshot:', error);
      throw error; // Re-throw to trigger retry
    }
  }
);
```

### Step 2: Export from index.ts

Add to `functions/src/index.ts`:

```typescript
// Add at end of file
export { captureFloawoSnapshot } from './captureFloawoSnapshot';
```

### Step 3: Verify TypeScript compiles

Run: `cd functions && npm run build`
Expected: No errors

### Step 4: Commit

```bash
git add functions/src/captureFloawoSnapshot.ts functions/src/index.ts
git commit -m "feat(functions): add scheduled captureFloawoSnapshot function"
```

---

## Task 6: Add Manual Trigger Function for Testing

**Files:**
- Modify: `functions/src/captureFloawoSnapshot.ts` (add callable function)
- Modify: `functions/src/index.ts` (export callable)

### Step 1: Add callable function for manual testing

Add to `functions/src/captureFloawoSnapshot.ts`:

```typescript
import { onCall, HttpsError } from 'firebase-functions/v2/https';

/**
 * Manual trigger for snapshot capture (for testing/debugging).
 * Call via Firebase SDK or curl.
 */
export const triggerSnapshotCapture = onCall(
  { memory: '512MiB', timeoutSeconds: 120 },
  async (request) => {
    console.log('Manual snapshot capture triggered');

    try {
      const snapshot = await captureSnapshot();

      const timestamp = snapshot.capturedAt.toDate().toISOString().slice(0, 16).replace(':', '-');
      const docId = `gw${snapshot.gameweek}-${timestamp}`;

      await db.collection('fpl_snapshots').doc(docId).set(snapshot);

      return {
        success: true,
        docId,
        gameweek: snapshot.gameweek,
        gameweekStatus: snapshot.gameweekStatus,
        teamsCount: Object.keys(snapshot.teamData).length,
      };
    } catch (error: any) {
      console.error('Manual snapshot capture failed:', error);
      throw new HttpsError('internal', 'Snapshot capture failed', { message: error.message });
    }
  }
);
```

### Step 2: Export from index.ts

Update `functions/src/index.ts`:

```typescript
export { captureFloawoSnapshot, triggerSnapshotCapture } from './captureFloawoSnapshot';
```

### Step 3: Verify build

Run: `cd functions && npm run build`
Expected: No errors

### Step 4: Commit

```bash
git add functions/src/captureFloawoSnapshot.ts functions/src/index.ts
git commit -m "feat(functions): add manual triggerSnapshotCapture callable function"
```

---

## Task 7: Deploy Functions

**Files:** None (deployment)

### Step 1: Deploy functions to Firebase

Run: `firebase deploy --only functions`
Expected: Successful deployment showing both `captureFloawoSnapshot` and `triggerSnapshotCapture`

### Step 2: Verify functions appear in Firebase Console

1. Go to Firebase Console > Functions
2. Confirm `captureFloawoSnapshot` is listed with schedule trigger `0 11-23 * * *`
3. Confirm `triggerSnapshotCapture` is listed as callable

### Step 3: Commit deployment

```bash
git add .
git commit -m "feat(functions): deploy Layer 1 snapshot capture functions"
```

---

## Task 8: Verify Deployment with Manual Trigger

**Files:** None (verification)

### Step 1: Create a test script to trigger the function

```typescript
// scripts/test-snapshot-capture.ts
import { initializeApp } from 'firebase/app';
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  projectId: 'knockoutfpl',
  // Add other config from your Firebase Console
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app, 'europe-west1'); // Update region if different

async function testSnapshotCapture() {
  console.log('Triggering snapshot capture...');

  const triggerSnapshot = httpsCallable(functions, 'triggerSnapshotCapture');

  try {
    const result = await triggerSnapshot({});
    console.log('✅ Snapshot captured successfully!');
    console.log('Result:', JSON.stringify(result.data, null, 2));
  } catch (error: any) {
    console.error('❌ Failed to capture snapshot:', error.message);
    process.exit(1);
  }
}

testSnapshotCapture();
```

### Step 2: Run the manual trigger

Run: `npx tsx scripts/test-snapshot-capture.ts`

Expected output:
```
Triggering snapshot capture...
✅ Snapshot captured successfully!
Result: {
  "success": true,
  "docId": "gw16-2025-12-15T16-30",
  "gameweek": 16,
  "gameweekStatus": "finished",
  "teamsCount": 15
}
```

### Step 3: Verify snapshot in Firestore

1. Go to Firebase Console > Firestore Database
2. Navigate to `fpl_snapshots` collection
3. Verify document exists with ID like `gw16-2025-12-15T16-30`
4. Expand document and verify it contains:
   - `capturedAt` (Timestamp)
   - `gameweek` (number)
   - `gameweekStatus` (string: 'not_started' | 'in_progress' | 'finished')
   - `bootstrapStatic` (object with events, teams, elements)
   - `leagueStandings` (object with league info and standings)
   - `teamData` (object with 15 team entries)

### Step 4: Verify snapshot size is reasonable

In Firestore Console, check document size is ~2-3MB (expected for full snapshot)

### Step 5: Final verification commit

```bash
git add scripts/
git commit -m "test: add manual snapshot trigger verification script"
```

---

## Task 9: Clean Up and Document

**Files:**
- Create: `functions/README.md`

### Step 1: Add functions documentation

```markdown
# Knockout FPL Cloud Functions

## FPL Snapshot Capture

### Scheduled Function: `captureFloawoSnapshot`

Automatically captures FPL API data for the FLOAWO league (634129) every hour from 11:00-23:00 GMT.

**Schedule:** `0 11-23 * * *` (hourly during active hours)

**Data captured:**
- Bootstrap static (players, teams, gameweeks)
- All fixtures and current gameweek fixtures
- Live scores (when gameweek in progress)
- League standings
- Team data for all 15 FLOAWO members

**Storage:** `fpl_snapshots` collection in Firestore

### Manual Trigger: `triggerSnapshotCapture`

Callable function to manually capture a snapshot (for testing).

**Usage:**
```bash
npx tsx scripts/test-snapshot-capture.ts
```

**Returns:**
```json
{
  "success": true,
  "docId": "gw16-2025-12-15T16-30",
  "gameweek": 16,
  "gameweekStatus": "finished",
  "teamsCount": 15
}
```
```

### Step 2: Commit documentation

```bash
git add functions/README.md
git commit -m "docs: add functions README for snapshot capture"
```

---

## Summary

**Layer 1 Complete!** You now have:

| Task | What it does |
|------|--------------|
| 1-2 | TypeScript types for FPL API responses and `FPLSnapshot` |
| 3 | API fetcher module with typed functions for all endpoints |
| 4 | Snapshot capture service with gameweek status detection |
| 5-6 | Scheduled function + manual trigger callable |
| 7 | Deploy to Firebase |
| 8 | **Verify it works** by running manual trigger and checking Firestore |
| 9 | Documentation |

**Verification in Task 8:**
- Run `npx tsx scripts/test-snapshot-capture.ts`
- Confirm snapshot appears in Firestore `fpl_snapshots` collection
- Verify 15 teams captured with correct structure

**Storage:** ~2.5MB per snapshot × 13 snapshots/day × 30 days = ~1GB/month

**Next:** Proceed to Layer 2 (Local Fixtures Tooling) to create CLI tools for downloading snapshots to local test fixtures.
