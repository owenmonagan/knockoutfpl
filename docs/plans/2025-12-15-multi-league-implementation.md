# Multi-League Ingestion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend FPL data ingestion to support multiple mini-leagues with historical backfill.

**Architecture:** Normalized Firestore storage separating global FPL data from league-specific data. Single scheduled function processes leagues by staleness priority. Incremental backfill is resumable across runs.

**Tech Stack:** Firebase Cloud Functions v2, Firestore, TypeScript

**Design Reference:** `docs/plans/2025-12-15-multi-league-ingestion-design.md`

---

## Task 1: TrackedLeague Type Definition

**Files:**
- Create: `functions/src/types/trackedLeague.ts`
- Test: `functions/src/types/trackedLeague.test.ts`

**Step 1: Write the failing test**

```typescript
// functions/src/types/trackedLeague.test.ts
import { describe, it, expect } from 'vitest';
import type { TrackedLeague } from './trackedLeague';

describe('TrackedLeague type', () => {
  it('should define all required fields', () => {
    const league: TrackedLeague = {
      leagueId: 634129,
      name: 'FLOAWO',
      addedAt: { toMillis: () => 1234567890 } as any,
      addedBy: 'user123',
      enabled: true,
      capturedGameweeks: [1, 2, 3],
      lastCaptureAt: null,
      teamCount: 20,
      lastError: null,
      lastErrorAt: null,
      consecutiveErrors: 0,
    };

    expect(league.leagueId).toBe(634129);
    expect(league.enabled).toBe(true);
    expect(league.capturedGameweeks).toEqual([1, 2, 3]);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd functions && npm test -- --run trackedLeague.test.ts`
Expected: FAIL with "Cannot find module './trackedLeague'"

**Step 3: Write minimal implementation**

```typescript
// functions/src/types/trackedLeague.ts
import { Timestamp } from 'firebase-admin/firestore';

export interface TrackedLeague {
  leagueId: number;
  name: string;
  addedAt: Timestamp;
  addedBy: string;
  enabled: boolean;

  // Capture state
  capturedGameweeks: number[];
  lastCaptureAt: Timestamp | null;

  // Metadata
  teamCount: number;

  // Error tracking
  lastError: string | null;
  lastErrorAt: Timestamp | null;
  consecutiveErrors: number;
}
```

**Step 4: Run test to verify it passes**

Run: `cd functions && npm test -- --run trackedLeague.test.ts`
Expected: PASS

**Step 5: Export from types index**

```typescript
// functions/src/types/index.ts - add this export
export * from './trackedLeague';
```

**Step 6: Commit**

```bash
git add functions/src/types/trackedLeague.ts functions/src/types/trackedLeague.test.ts functions/src/types/index.ts
git commit -m "feat(types): add TrackedLeague type for multi-league config"
```

---

## Task 2: GlobalSnapshot Type Definition

**Files:**
- Create: `functions/src/types/globalSnapshot.ts`
- Test: `functions/src/types/globalSnapshot.test.ts`

**Step 1: Write the failing test**

```typescript
// functions/src/types/globalSnapshot.test.ts
import { describe, it, expect } from 'vitest';
import type { GlobalSnapshot } from './globalSnapshot';

describe('GlobalSnapshot type', () => {
  it('should define all required fields', () => {
    const snapshot: GlobalSnapshot = {
      gameweek: 15,
      capturedAt: { toMillis: () => 1234567890 } as any,
      gameweekStatus: 'in_progress',
      bootstrap: {
        events: [],
        teams: [],
        element_types: [],
      },
      fixtures: [],
      liveScores: null,
      eventStatus: { status: [] },
      dreamTeam: null,
      setPieceNotes: { teams: [] },
    };

    expect(snapshot.gameweek).toBe(15);
    expect(snapshot.gameweekStatus).toBe('in_progress');
  });

  it('should accept all valid gameweek statuses', () => {
    const statuses: GlobalSnapshot['gameweekStatus'][] = ['not_started', 'in_progress', 'finished'];
    expect(statuses).toHaveLength(3);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd functions && npm test -- --run globalSnapshot.test.ts`
Expected: FAIL with "Cannot find module './globalSnapshot'"

**Step 3: Write minimal implementation**

```typescript
// functions/src/types/globalSnapshot.ts
import { Timestamp } from 'firebase-admin/firestore';
import type {
  FPLEvent,
  FPLTeam,
  FPLElementType,
  FixtureResponse,
  LiveResponse,
  EventStatusResponse,
  DreamTeamResponse,
  SetPieceResponse,
} from './fplApiResponses';

export type GameweekStatus = 'not_started' | 'in_progress' | 'finished';

export interface GlobalSnapshot {
  gameweek: number;
  capturedAt: Timestamp;
  gameweekStatus: GameweekStatus;

  bootstrap: {
    events: FPLEvent[];
    teams: FPLTeam[];
    element_types: FPLElementType[];
    // elements stored in subcollection (too large)
  };
  fixtures: FixtureResponse[];
  liveScores: LiveResponse | null;
  eventStatus: EventStatusResponse;
  dreamTeam: DreamTeamResponse | null;
  setPieceNotes: SetPieceResponse;
}
```

**Step 4: Run test to verify it passes**

Run: `cd functions && npm test -- --run globalSnapshot.test.ts`
Expected: PASS

**Step 5: Export from types index**

```typescript
// functions/src/types/index.ts - add this export
export * from './globalSnapshot';
```

**Step 6: Commit**

```bash
git add functions/src/types/globalSnapshot.ts functions/src/types/globalSnapshot.test.ts functions/src/types/index.ts
git commit -m "feat(types): add GlobalSnapshot type for shared FPL data"
```

---

## Task 3: LeagueSnapshot Type Definition

**Files:**
- Create: `functions/src/types/leagueSnapshot.ts`
- Test: `functions/src/types/leagueSnapshot.test.ts`

**Step 1: Write the failing test**

```typescript
// functions/src/types/leagueSnapshot.test.ts
import { describe, it, expect } from 'vitest';
import type { LeagueSnapshot, TeamSnapshot } from './leagueSnapshot';

describe('LeagueSnapshot types', () => {
  it('should define LeagueSnapshot with all required fields', () => {
    const snapshot: LeagueSnapshot = {
      leagueId: 634129,
      gameweek: 15,
      capturedAt: { toMillis: () => 1234567890 } as any,
      standings: {
        league: { id: 634129, name: 'FLOAWO' },
        standings: { results: [] },
      },
    };

    expect(snapshot.leagueId).toBe(634129);
    expect(snapshot.gameweek).toBe(15);
  });

  it('should define TeamSnapshot with all required fields', () => {
    const team: TeamSnapshot = {
      entry: {
        id: 12345,
        name: 'My Team',
        player_first_name: 'John',
        player_last_name: 'Doe',
        summary_overall_points: 1000,
        summary_overall_rank: 50000,
        summary_event_points: 60,
        summary_event_rank: 100000,
        last_deadline_value: 1000,
      },
      history: { current: [], chips: [] },
      picks: null,
      transfers: [],
    };

    expect(team.entry.id).toBe(12345);
    expect(team.picks).toBeNull();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd functions && npm test -- --run leagueSnapshot.test.ts`
Expected: FAIL with "Cannot find module './leagueSnapshot'"

**Step 3: Write minimal implementation**

```typescript
// functions/src/types/leagueSnapshot.ts
import { Timestamp } from 'firebase-admin/firestore';
import type {
  LeagueStandingsResponse,
  EntryResponse,
  HistoryResponse,
  PicksResponse,
  TransferResponse,
} from './fplApiResponses';

export interface LeagueSnapshot {
  leagueId: number;
  gameweek: number;
  capturedAt: Timestamp;
  standings: LeagueStandingsResponse;
  // teams stored in subcollection
}

export interface TeamSnapshot {
  entry: EntryResponse;
  history: HistoryResponse;
  picks: PicksResponse | null;
  transfers: TransferResponse;
}
```

**Step 4: Run test to verify it passes**

Run: `cd functions && npm test -- --run leagueSnapshot.test.ts`
Expected: PASS

**Step 5: Export from types index**

```typescript
// functions/src/types/index.ts - add this export
export * from './leagueSnapshot';
```

**Step 6: Commit**

```bash
git add functions/src/types/leagueSnapshot.ts functions/src/types/leagueSnapshot.test.ts functions/src/types/index.ts
git commit -m "feat(types): add LeagueSnapshot and TeamSnapshot types"
```

---

## Task 4: getFinishedGameweeks Helper

**Files:**
- Create: `functions/src/lib/gameweekHelpers.ts`
- Test: `functions/src/lib/gameweekHelpers.test.ts`

**Step 1: Write the failing test**

```typescript
// functions/src/lib/gameweekHelpers.test.ts
import { describe, it, expect } from 'vitest';
import { getFinishedGameweeks } from './gameweekHelpers';
import type { FPLEvent } from '../types/fplApiResponses';

describe('getFinishedGameweeks', () => {
  it('should return empty array when no events are finished', () => {
    const events: FPLEvent[] = [
      { id: 1, name: 'GW1', is_current: true, is_next: false, finished: false, deadline_time: '' },
    ];
    expect(getFinishedGameweeks(events)).toEqual([]);
  });

  it('should return finished gameweek IDs in ascending order', () => {
    const events: FPLEvent[] = [
      { id: 3, name: 'GW3', is_current: false, is_next: false, finished: true, deadline_time: '' },
      { id: 1, name: 'GW1', is_current: false, is_next: false, finished: true, deadline_time: '' },
      { id: 2, name: 'GW2', is_current: false, is_next: false, finished: true, deadline_time: '' },
      { id: 4, name: 'GW4', is_current: true, is_next: false, finished: false, deadline_time: '' },
    ];
    expect(getFinishedGameweeks(events)).toEqual([1, 2, 3]);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd functions && npm test -- --run gameweekHelpers.test.ts`
Expected: FAIL with "Cannot find module './gameweekHelpers'"

**Step 3: Write minimal implementation**

```typescript
// functions/src/lib/gameweekHelpers.ts
import type { FPLEvent } from '../types/fplApiResponses';

export function getFinishedGameweeks(events: FPLEvent[]): number[] {
  return events
    .filter((e) => e.finished)
    .map((e) => e.id)
    .sort((a, b) => a - b);
}
```

**Step 4: Run test to verify it passes**

Run: `cd functions && npm test -- --run gameweekHelpers.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add functions/src/lib/gameweekHelpers.ts functions/src/lib/gameweekHelpers.test.ts
git commit -m "feat(lib): add getFinishedGameweeks helper"
```

---

## Task 5: getMissingGameweeks Helper

**Files:**
- Modify: `functions/src/lib/gameweekHelpers.ts`
- Modify: `functions/src/lib/gameweekHelpers.test.ts`

**Step 1: Write the failing test**

```typescript
// Add to functions/src/lib/gameweekHelpers.test.ts
describe('getMissingGameweeks', () => {
  it('should return all finished GWs when none captured', () => {
    const finishedGWs = [1, 2, 3, 4, 5];
    const capturedGWs: number[] = [];
    expect(getMissingGameweeks(finishedGWs, capturedGWs)).toEqual([1, 2, 3, 4, 5]);
  });

  it('should return only missing GWs', () => {
    const finishedGWs = [1, 2, 3, 4, 5];
    const capturedGWs = [1, 2, 4];
    expect(getMissingGameweeks(finishedGWs, capturedGWs)).toEqual([3, 5]);
  });

  it('should return empty array when all captured', () => {
    const finishedGWs = [1, 2, 3];
    const capturedGWs = [1, 2, 3];
    expect(getMissingGameweeks(finishedGWs, capturedGWs)).toEqual([]);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd functions && npm test -- --run gameweekHelpers.test.ts`
Expected: FAIL with "getMissingGameweeks is not defined"

**Step 3: Write minimal implementation**

```typescript
// Add to functions/src/lib/gameweekHelpers.ts
export function getMissingGameweeks(finishedGWs: number[], capturedGWs: number[]): number[] {
  const capturedSet = new Set(capturedGWs);
  return finishedGWs.filter((gw) => !capturedSet.has(gw));
}
```

**Step 4: Run test to verify it passes**

Run: `cd functions && npm test -- --run gameweekHelpers.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add functions/src/lib/gameweekHelpers.ts functions/src/lib/gameweekHelpers.test.ts
git commit -m "feat(lib): add getMissingGameweeks helper"
```

---

## Task 6: determineWorkType Helper

**Files:**
- Modify: `functions/src/lib/gameweekHelpers.ts`
- Modify: `functions/src/lib/gameweekHelpers.test.ts`

**Step 1: Write the failing test**

```typescript
// Add to functions/src/lib/gameweekHelpers.test.ts
import { determineWorkType, type WorkType } from './gameweekHelpers';

describe('determineWorkType', () => {
  it('should return backfill when missing finished gameweeks', () => {
    const result = determineWorkType({
      capturedGameweeks: [1, 2],
      finishedGameweeks: [1, 2, 3, 4],
      currentGameweek: 5,
      currentGWStatus: 'in_progress',
    });
    expect(result).toEqual({ type: 'backfill', missingGameweeks: [3, 4] });
  });

  it('should return current_gw when in_progress and not captured', () => {
    const result = determineWorkType({
      capturedGameweeks: [1, 2, 3],
      finishedGameweeks: [1, 2, 3],
      currentGameweek: 4,
      currentGWStatus: 'in_progress',
    });
    expect(result).toEqual({ type: 'current_gw' });
  });

  it('should return current_gw when finished but not captured', () => {
    const result = determineWorkType({
      capturedGameweeks: [1, 2, 3],
      finishedGameweeks: [1, 2, 3, 4],
      currentGameweek: 4,
      currentGWStatus: 'finished',
    });
    expect(result).toEqual({ type: 'backfill', missingGameweeks: [4] });
  });

  it('should return none when fully up to date', () => {
    const result = determineWorkType({
      capturedGameweeks: [1, 2, 3, 4],
      finishedGameweeks: [1, 2, 3],
      currentGameweek: 4,
      currentGWStatus: 'in_progress',
    });
    expect(result).toEqual({ type: 'none' });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd functions && npm test -- --run gameweekHelpers.test.ts`
Expected: FAIL with "determineWorkType is not defined"

**Step 3: Write minimal implementation**

```typescript
// Add to functions/src/lib/gameweekHelpers.ts
export type WorkType =
  | { type: 'backfill'; missingGameweeks: number[] }
  | { type: 'current_gw' }
  | { type: 'none' };

export interface DetermineWorkInput {
  capturedGameweeks: number[];
  finishedGameweeks: number[];
  currentGameweek: number;
  currentGWStatus: 'not_started' | 'in_progress' | 'finished';
}

export function determineWorkType(input: DetermineWorkInput): WorkType {
  const { capturedGameweeks, finishedGameweeks, currentGameweek, currentGWStatus } = input;

  // Check for missing finished gameweeks (needs backfill)
  const missingGWs = getMissingGameweeks(finishedGameweeks, capturedGameweeks);
  if (missingGWs.length > 0) {
    return { type: 'backfill', missingGameweeks: missingGWs };
  }

  // Check if current GW needs capture
  const hasCurrentGW = capturedGameweeks.includes(currentGameweek);
  if (!hasCurrentGW && currentGWStatus === 'in_progress') {
    return { type: 'current_gw' };
  }

  // Fully up to date
  return { type: 'none' };
}
```

**Step 4: Run test to verify it passes**

Run: `cd functions && npm test -- --run gameweekHelpers.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add functions/src/lib/gameweekHelpers.ts functions/src/lib/gameweekHelpers.test.ts
git commit -m "feat(lib): add determineWorkType helper for ingestion logic"
```

---

## Task 7: isNearTimeout Helper

**Files:**
- Modify: `functions/src/lib/gameweekHelpers.ts`
- Modify: `functions/src/lib/gameweekHelpers.test.ts`

**Step 1: Write the failing test**

```typescript
// Add to functions/src/lib/gameweekHelpers.test.ts
import { isNearTimeout } from './gameweekHelpers';

describe('isNearTimeout', () => {
  it('should return false when well under timeout', () => {
    const startTime = Date.now();
    const maxRuntime = 60000; // 1 minute
    expect(isNearTimeout(startTime, maxRuntime)).toBe(false);
  });

  it('should return true when past max runtime', () => {
    const startTime = Date.now() - 70000; // 70 seconds ago
    const maxRuntime = 60000; // 1 minute
    expect(isNearTimeout(startTime, maxRuntime)).toBe(true);
  });

  it('should return true when exactly at max runtime', () => {
    const startTime = Date.now() - 60000; // exactly 60 seconds ago
    const maxRuntime = 60000;
    expect(isNearTimeout(startTime, maxRuntime)).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd functions && npm test -- --run gameweekHelpers.test.ts`
Expected: FAIL with "isNearTimeout is not defined"

**Step 3: Write minimal implementation**

```typescript
// Add to functions/src/lib/gameweekHelpers.ts
export function isNearTimeout(startTime: number, maxRuntimeMs: number): boolean {
  return Date.now() - startTime >= maxRuntimeMs;
}
```

**Step 4: Run test to verify it passes**

Run: `cd functions && npm test -- --run gameweekHelpers.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add functions/src/lib/gameweekHelpers.ts functions/src/lib/gameweekHelpers.test.ts
git commit -m "feat(lib): add isNearTimeout helper for graceful shutdown"
```

---

## Task 8: shouldSkipLeague Helper

**Files:**
- Modify: `functions/src/lib/gameweekHelpers.ts`
- Modify: `functions/src/lib/gameweekHelpers.test.ts`

**Step 1: Write the failing test**

```typescript
// Add to functions/src/lib/gameweekHelpers.test.ts
import { shouldSkipLeague } from './gameweekHelpers';

describe('shouldSkipLeague', () => {
  it('should return false when no errors', () => {
    expect(shouldSkipLeague(0)).toBe(false);
  });

  it('should return false when under threshold', () => {
    expect(shouldSkipLeague(4)).toBe(false);
  });

  it('should return true when at threshold', () => {
    expect(shouldSkipLeague(5)).toBe(true);
  });

  it('should return true when over threshold', () => {
    expect(shouldSkipLeague(10)).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd functions && npm test -- --run gameweekHelpers.test.ts`
Expected: FAIL with "shouldSkipLeague is not defined"

**Step 3: Write minimal implementation**

```typescript
// Add to functions/src/lib/gameweekHelpers.ts
const MAX_CONSECUTIVE_ERRORS = 5;

export function shouldSkipLeague(consecutiveErrors: number): boolean {
  return consecutiveErrors >= MAX_CONSECUTIVE_ERRORS;
}
```

**Step 4: Run test to verify it passes**

Run: `cd functions && npm test -- --run gameweekHelpers.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add functions/src/lib/gameweekHelpers.ts functions/src/lib/gameweekHelpers.test.ts
git commit -m "feat(lib): add shouldSkipLeague helper for error handling"
```

---

## Task 9: delay Utility

**Files:**
- Modify: `functions/src/lib/gameweekHelpers.ts`
- Modify: `functions/src/lib/gameweekHelpers.test.ts`

**Step 1: Write the failing test**

```typescript
// Add to functions/src/lib/gameweekHelpers.test.ts
import { delay } from './gameweekHelpers';

describe('delay', () => {
  it('should resolve after specified milliseconds', async () => {
    const start = Date.now();
    await delay(100);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(95); // Allow small variance
    expect(elapsed).toBeLessThan(150);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd functions && npm test -- --run gameweekHelpers.test.ts`
Expected: FAIL with "delay is not defined"

**Step 3: Write minimal implementation**

```typescript
// Add to functions/src/lib/gameweekHelpers.ts
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

**Step 4: Run test to verify it passes**

Run: `cd functions && npm test -- --run gameweekHelpers.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add functions/src/lib/gameweekHelpers.ts functions/src/lib/gameweekHelpers.test.ts
git commit -m "feat(lib): add delay utility for rate limiting"
```

---

## Task 10: TrackedLeagueService - getLeaguesByStalenessPriority

**Files:**
- Create: `functions/src/services/trackedLeagueService.ts`
- Test: `functions/src/services/trackedLeagueService.test.ts`

**Step 1: Write the failing test**

```typescript
// functions/src/services/trackedLeagueService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getLeaguesByStalenessPriority } from './trackedLeagueService';

// Mock Firestore
vi.mock('firebase-admin/firestore', () => ({
  getFirestore: vi.fn(() => ({
    collection: vi.fn(() => ({
      where: vi.fn(() => ({
        orderBy: vi.fn(() => ({
          get: vi.fn(() => Promise.resolve({
            docs: [
              {
                data: () => ({
                  leagueId: 1,
                  lastCaptureAt: { toMillis: () => 1000 },
                  consecutiveErrors: 0,
                }),
              },
              {
                data: () => ({
                  leagueId: 2,
                  lastCaptureAt: null,
                  consecutiveErrors: 0,
                }),
              },
            ],
          })),
        })),
      })),
    })),
  })),
}));

describe('getLeaguesByStalenessPriority', () => {
  it('should return leagues ordered by staleness', async () => {
    const leagues = await getLeaguesByStalenessPriority();
    expect(leagues).toHaveLength(2);
    expect(leagues[0].leagueId).toBe(1);
    expect(leagues[1].leagueId).toBe(2);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd functions && npm test -- --run trackedLeagueService.test.ts`
Expected: FAIL with "Cannot find module './trackedLeagueService'"

**Step 3: Write minimal implementation**

```typescript
// functions/src/services/trackedLeagueService.ts
import { getFirestore } from 'firebase-admin/firestore';
import type { TrackedLeague } from '../types/trackedLeague';

export async function getLeaguesByStalenessPriority(): Promise<TrackedLeague[]> {
  const db = getFirestore();

  const snapshot = await db
    .collection('tracked_leagues')
    .where('enabled', '==', true)
    .orderBy('lastCaptureAt', 'asc')
    .get();

  return snapshot.docs.map((doc) => doc.data() as TrackedLeague);
}
```

**Step 4: Run test to verify it passes**

Run: `cd functions && npm test -- --run trackedLeagueService.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add functions/src/services/trackedLeagueService.ts functions/src/services/trackedLeagueService.test.ts
git commit -m "feat(service): add getLeaguesByStalenessPriority"
```

---

## Task 11: TrackedLeagueService - addTrackedLeague

**Files:**
- Modify: `functions/src/services/trackedLeagueService.ts`
- Modify: `functions/src/services/trackedLeagueService.test.ts`

**Step 1: Write the failing test**

```typescript
// Add to functions/src/services/trackedLeagueService.test.ts
import { addTrackedLeague } from './trackedLeagueService';

// Add mock for fetchLeagueStandings
vi.mock('../fplApiFetcher', () => ({
  fetchLeagueStandings: vi.fn(() => Promise.resolve({
    league: { id: 634129, name: 'FLOAWO' },
    standings: { results: Array(20).fill({ entry: 1 }) },
  })),
}));

describe('addTrackedLeague', () => {
  const mockSet = vi.fn(() => Promise.resolve());
  const mockGet = vi.fn(() => Promise.resolve({ exists: false }));

  beforeEach(() => {
    vi.clearAllMocks();
    // Update mock to include doc operations
    vi.mocked(getFirestore).mockReturnValue({
      collection: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn(() => ({
            get: vi.fn(() => Promise.resolve({ docs: [] })),
          })),
        })),
      })),
      doc: vi.fn(() => ({
        get: mockGet,
        set: mockSet,
      })),
    } as any);
  });

  it('should create a new tracked league document', async () => {
    await addTrackedLeague(634129, 'user123');

    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        leagueId: 634129,
        name: 'FLOAWO',
        addedBy: 'user123',
        enabled: true,
        capturedGameweeks: [],
        teamCount: 20,
        consecutiveErrors: 0,
      })
    );
  });

  it('should throw if league already tracked', async () => {
    mockGet.mockResolvedValueOnce({ exists: true });

    await expect(addTrackedLeague(634129, 'user123'))
      .rejects.toThrow('League 634129 is already tracked');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd functions && npm test -- --run trackedLeagueService.test.ts`
Expected: FAIL with "addTrackedLeague is not defined"

**Step 3: Write minimal implementation**

```typescript
// Add to functions/src/services/trackedLeagueService.ts
import { Timestamp } from 'firebase-admin/firestore';
import * as fetcher from '../fplApiFetcher';

export async function addTrackedLeague(leagueId: number, userId: string): Promise<void> {
  const db = getFirestore();
  const leagueRef = db.doc(`tracked_leagues/${leagueId}`);

  // Check if already tracked
  const existing = await leagueRef.get();
  if (existing.exists) {
    throw new Error(`League ${leagueId} is already tracked`);
  }

  // Fetch league info to validate and get metadata
  const standings = await fetcher.fetchLeagueStandings(leagueId);

  await leagueRef.set({
    leagueId,
    name: standings.league.name,
    addedAt: Timestamp.now(),
    addedBy: userId,
    enabled: true,
    capturedGameweeks: [],
    lastCaptureAt: null,
    teamCount: standings.standings.results.length,
    lastError: null,
    lastErrorAt: null,
    consecutiveErrors: 0,
  });
}
```

**Step 4: Run test to verify it passes**

Run: `cd functions && npm test -- --run trackedLeagueService.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add functions/src/services/trackedLeagueService.ts functions/src/services/trackedLeagueService.test.ts
git commit -m "feat(service): add addTrackedLeague function"
```

---

## Task 12: TrackedLeagueService - updateLeagueAfterCapture

**Files:**
- Modify: `functions/src/services/trackedLeagueService.ts`
- Modify: `functions/src/services/trackedLeagueService.test.ts`

**Step 1: Write the failing test**

```typescript
// Add to functions/src/services/trackedLeagueService.test.ts
import { updateLeagueAfterCapture } from './trackedLeagueService';
import { FieldValue } from 'firebase-admin/firestore';

describe('updateLeagueAfterCapture', () => {
  const mockUpdate = vi.fn(() => Promise.resolve());

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getFirestore).mockReturnValue({
      doc: vi.fn(() => ({
        update: mockUpdate,
      })),
    } as any);
  });

  it('should update league with captured gameweek and clear errors', async () => {
    await updateLeagueAfterCapture(634129, 15);

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        lastError: null,
        consecutiveErrors: 0,
      })
    );
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd functions && npm test -- --run trackedLeagueService.test.ts`
Expected: FAIL with "updateLeagueAfterCapture is not defined"

**Step 3: Write minimal implementation**

```typescript
// Add to functions/src/services/trackedLeagueService.ts
import { FieldValue } from 'firebase-admin/firestore';

export async function updateLeagueAfterCapture(leagueId: number, gameweek: number): Promise<void> {
  const db = getFirestore();

  await db.doc(`tracked_leagues/${leagueId}`).update({
    capturedGameweeks: FieldValue.arrayUnion(gameweek),
    lastCaptureAt: Timestamp.now(),
    lastError: null,
    consecutiveErrors: 0,
  });
}
```

**Step 4: Run test to verify it passes**

Run: `cd functions && npm test -- --run trackedLeagueService.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add functions/src/services/trackedLeagueService.ts functions/src/services/trackedLeagueService.test.ts
git commit -m "feat(service): add updateLeagueAfterCapture function"
```

---

## Task 13: TrackedLeagueService - updateLeagueAfterError

**Files:**
- Modify: `functions/src/services/trackedLeagueService.ts`
- Modify: `functions/src/services/trackedLeagueService.test.ts`

**Step 1: Write the failing test**

```typescript
// Add to functions/src/services/trackedLeagueService.test.ts
import { updateLeagueAfterError } from './trackedLeagueService';

describe('updateLeagueAfterError', () => {
  const mockUpdate = vi.fn(() => Promise.resolve());

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getFirestore).mockReturnValue({
      doc: vi.fn(() => ({
        update: mockUpdate,
      })),
    } as any);
  });

  it('should update league with error info and increment counter', async () => {
    await updateLeagueAfterError(634129, 'API failed');

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        lastError: 'API failed',
      })
    );
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd functions && npm test -- --run trackedLeagueService.test.ts`
Expected: FAIL with "updateLeagueAfterError is not defined"

**Step 3: Write minimal implementation**

```typescript
// Add to functions/src/services/trackedLeagueService.ts
export async function updateLeagueAfterError(leagueId: number, errorMsg: string): Promise<void> {
  const db = getFirestore();

  await db.doc(`tracked_leagues/${leagueId}`).update({
    lastError: errorMsg,
    lastErrorAt: Timestamp.now(),
    consecutiveErrors: FieldValue.increment(1),
  });
}
```

**Step 4: Run test to verify it passes**

Run: `cd functions && npm test -- --run trackedLeagueService.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add functions/src/services/trackedLeagueService.ts functions/src/services/trackedLeagueService.test.ts
git commit -m "feat(service): add updateLeagueAfterError function"
```

---

## Task 14: GlobalSnapshotService - shouldRefreshGlobal

**Files:**
- Create: `functions/src/services/globalSnapshotService.ts`
- Test: `functions/src/services/globalSnapshotService.test.ts`

**Step 1: Write the failing test**

```typescript
// functions/src/services/globalSnapshotService.test.ts
import { describe, it, expect } from 'vitest';
import { shouldRefreshGlobal } from './globalSnapshotService';

describe('shouldRefreshGlobal', () => {
  const ONE_HOUR_MS = 60 * 60 * 1000;

  it('should return true when no snapshot exists', () => {
    expect(shouldRefreshGlobal(null, 'in_progress')).toBe(true);
  });

  it('should return false when finished', () => {
    const snapshot = {
      gameweekStatus: 'finished' as const,
      capturedAt: { toMillis: () => Date.now() - ONE_HOUR_MS * 2 },
    };
    expect(shouldRefreshGlobal(snapshot, 'finished')).toBe(false);
  });

  it('should return false when in_progress and captured recently', () => {
    const snapshot = {
      gameweekStatus: 'in_progress' as const,
      capturedAt: { toMillis: () => Date.now() - ONE_HOUR_MS / 2 },
    };
    expect(shouldRefreshGlobal(snapshot, 'in_progress')).toBe(false);
  });

  it('should return true when in_progress and captured over 1 hour ago', () => {
    const snapshot = {
      gameweekStatus: 'in_progress' as const,
      capturedAt: { toMillis: () => Date.now() - ONE_HOUR_MS * 1.5 },
    };
    expect(shouldRefreshGlobal(snapshot, 'in_progress')).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd functions && npm test -- --run globalSnapshotService.test.ts`
Expected: FAIL with "Cannot find module './globalSnapshotService'"

**Step 3: Write minimal implementation**

```typescript
// functions/src/services/globalSnapshotService.ts
import type { Timestamp } from 'firebase-admin/firestore';
import type { GameweekStatus } from '../types/globalSnapshot';

const GLOBAL_REFRESH_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

interface SnapshotInfo {
  gameweekStatus: GameweekStatus;
  capturedAt: Timestamp;
}

export function shouldRefreshGlobal(
  snapshot: SnapshotInfo | null,
  currentStatus: GameweekStatus
): boolean {
  // No snapshot exists
  if (!snapshot) {
    return true;
  }

  // Finished GWs never need refresh
  if (snapshot.gameweekStatus === 'finished') {
    return false;
  }

  // In progress - check if stale (>1 hour)
  const timeSinceCapture = Date.now() - snapshot.capturedAt.toMillis();
  return timeSinceCapture >= GLOBAL_REFRESH_INTERVAL_MS;
}
```

**Step 4: Run test to verify it passes**

Run: `cd functions && npm test -- --run globalSnapshotService.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add functions/src/services/globalSnapshotService.ts functions/src/services/globalSnapshotService.test.ts
git commit -m "feat(service): add shouldRefreshGlobal helper"
```

---

## Task 15: GlobalSnapshotService - ensureGlobalSnapshot

**Files:**
- Modify: `functions/src/services/globalSnapshotService.ts`
- Modify: `functions/src/services/globalSnapshotService.test.ts`

**Step 1: Write the failing test**

```typescript
// Add to functions/src/services/globalSnapshotService.test.ts
import { vi, beforeEach } from 'vitest';
import { ensureGlobalSnapshot } from './globalSnapshotService';

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: vi.fn(),
  Timestamp: { now: vi.fn(() => ({ toMillis: () => Date.now() })) },
}));

vi.mock('../fplApiFetcher', () => ({
  fetchBootstrapStatic: vi.fn(() => Promise.resolve({
    events: [{ id: 1, finished: true }, { id: 2, is_current: true, finished: false }],
    teams: [],
    elements: [],
    element_types: [],
  })),
  fetchFixtures: vi.fn(() => Promise.resolve([])),
  fetchEventStatus: vi.fn(() => Promise.resolve({ status: [] })),
  fetchSetPieceNotes: vi.fn(() => Promise.resolve({ teams: [] })),
  fetchLiveScores: vi.fn(() => Promise.resolve({ elements: [] })),
  fetchDreamTeam: vi.fn(() => Promise.resolve({ team: [], top_player: null })),
}));

describe('ensureGlobalSnapshot', () => {
  const mockSet = vi.fn(() => Promise.resolve());
  const mockGet = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getFirestore).mockReturnValue({
      doc: vi.fn(() => ({
        get: mockGet,
        set: mockSet,
        collection: vi.fn(() => ({
          doc: vi.fn(() => ({ set: vi.fn() })),
        })),
      })),
      batch: vi.fn(() => ({
        set: vi.fn(),
        commit: vi.fn(() => Promise.resolve()),
      })),
    } as any);
  });

  it('should create snapshot when none exists', async () => {
    mockGet.mockResolvedValueOnce({ exists: false });

    await ensureGlobalSnapshot(2, 'in_progress');

    expect(mockSet).toHaveBeenCalled();
  });

  it('should skip when snapshot exists and finished', async () => {
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({
        gameweekStatus: 'finished',
        capturedAt: { toMillis: () => Date.now() },
      }),
    });

    await ensureGlobalSnapshot(2, 'finished');

    expect(mockSet).not.toHaveBeenCalled();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd functions && npm test -- --run globalSnapshotService.test.ts`
Expected: FAIL with "ensureGlobalSnapshot is not defined"

**Step 3: Write minimal implementation**

```typescript
// Add to functions/src/services/globalSnapshotService.ts
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as fetcher from '../fplApiFetcher';
import type { GlobalSnapshot } from '../types/globalSnapshot';
import type { FPLElement } from '../types/fplApiResponses';

export async function ensureGlobalSnapshot(
  gameweek: number,
  currentStatus: GameweekStatus
): Promise<void> {
  const db = getFirestore();
  const globalRef = db.doc(`global_snapshots/gw${gameweek}`);

  const existing = await globalRef.get();

  if (existing.exists) {
    const data = existing.data() as SnapshotInfo;
    if (!shouldRefreshGlobal(data, currentStatus)) {
      return;
    }
  }

  // Create or update global snapshot
  await createGlobalSnapshot(gameweek, globalRef);
}

async function createGlobalSnapshot(
  gameweek: number,
  ref: FirebaseFirestore.DocumentReference
): Promise<void> {
  const [bootstrap, fixtures, eventStatus, setPieceNotes] = await Promise.all([
    fetcher.fetchBootstrapStatic(),
    fetcher.fetchFixtures(),
    fetcher.fetchEventStatus(),
    fetcher.fetchSetPieceNotes(),
  ]);

  const gwFixtures = fixtures.filter((f) => f.event === gameweek);
  const status = determineGameweekStatusFromFixtures(gwFixtures);

  let liveScores = null;
  let dreamTeam = null;

  if (status !== 'not_started') {
    [liveScores, dreamTeam] = await Promise.all([
      fetcher.fetchLiveScores(gameweek).catch(() => null),
      fetcher.fetchDreamTeam(gameweek).catch(() => null),
    ]);
  }

  const snapshotData: Omit<GlobalSnapshot, 'capturedAt'> & { capturedAt: Timestamp } = {
    gameweek,
    capturedAt: Timestamp.now(),
    gameweekStatus: status,
    bootstrap: {
      events: bootstrap.events,
      teams: bootstrap.teams,
      element_types: bootstrap.element_types,
    },
    fixtures,
    liveScores,
    eventStatus,
    dreamTeam,
    setPieceNotes,
  };

  await ref.set(snapshotData);

  // Store elements in subcollection (chunked)
  await storeElementsChunked(ref, bootstrap.elements);
}

function determineGameweekStatusFromFixtures(fixtures: fetcher.FixtureResponse[]): GameweekStatus {
  if (fixtures.length === 0) return 'not_started';
  const allFinished = fixtures.every((f) => f.finished);
  const someStarted = fixtures.some((f) => f.started);
  if (allFinished) return 'finished';
  if (someStarted) return 'in_progress';
  return 'not_started';
}

async function storeElementsChunked(
  parentRef: FirebaseFirestore.DocumentReference,
  elements: FPLElement[]
): Promise<void> {
  const CHUNK_SIZE = 100;
  const db = getFirestore();
  const batch = db.batch();

  for (let i = 0; i < elements.length; i += CHUNK_SIZE) {
    const chunk = elements.slice(i, i + CHUNK_SIZE);
    const chunkRef = parentRef.collection('elements').doc(`chunk_${Math.floor(i / CHUNK_SIZE)}`);
    batch.set(chunkRef, { elements: chunk });
  }

  await batch.commit();
}
```

**Step 4: Run test to verify it passes**

Run: `cd functions && npm test -- --run globalSnapshotService.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add functions/src/services/globalSnapshotService.ts functions/src/services/globalSnapshotService.test.ts
git commit -m "feat(service): add ensureGlobalSnapshot function"
```

---

## Task 16: LeagueSnapshotService - captureLeagueGameweek

**Files:**
- Create: `functions/src/services/leagueSnapshotService.ts`
- Test: `functions/src/services/leagueSnapshotService.test.ts`

**Step 1: Write the failing test**

```typescript
// functions/src/services/leagueSnapshotService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { captureLeagueGameweek } from './leagueSnapshotService';

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: vi.fn(),
  Timestamp: { now: vi.fn(() => ({ toMillis: () => Date.now() })) },
}));

vi.mock('../fplApiFetcher', () => ({
  fetchLeagueStandings: vi.fn(() => Promise.resolve({
    league: { id: 634129, name: 'FLOAWO' },
    standings: { results: [{ entry: 1 }, { entry: 2 }] },
  })),
  fetchEntry: vi.fn((id) => Promise.resolve({ id, name: `Team ${id}` })),
  fetchHistory: vi.fn(() => Promise.resolve({ current: [], chips: [] })),
  fetchPicks: vi.fn(() => Promise.resolve({ picks: [], entry_history: {} })),
  fetchTransfers: vi.fn(() => Promise.resolve([])),
}));

vi.mock('../lib/gameweekHelpers', () => ({
  delay: vi.fn(() => Promise.resolve()),
}));

describe('captureLeagueGameweek', () => {
  const mockSet = vi.fn(() => Promise.resolve());
  const mockBatchSet = vi.fn();
  const mockBatchCommit = vi.fn(() => Promise.resolve());

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getFirestore).mockReturnValue({
      doc: vi.fn(() => ({
        set: mockSet,
        collection: vi.fn(() => ({
          doc: vi.fn(() => ({ ref: 'teamRef' })),
        })),
      })),
      batch: vi.fn(() => ({
        set: mockBatchSet,
        commit: mockBatchCommit,
      })),
    } as any);
  });

  it('should capture league snapshot with team data', async () => {
    await captureLeagueGameweek(634129, 15, [1, 2]);

    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        leagueId: 634129,
        gameweek: 15,
      })
    );
    // Two teams should be added via batch
    expect(mockBatchSet).toHaveBeenCalledTimes(2);
    expect(mockBatchCommit).toHaveBeenCalled();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd functions && npm test -- --run leagueSnapshotService.test.ts`
Expected: FAIL with "Cannot find module './leagueSnapshotService'"

**Step 3: Write minimal implementation**

```typescript
// functions/src/services/leagueSnapshotService.ts
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as fetcher from '../fplApiFetcher';
import { delay } from '../lib/gameweekHelpers';
import type { LeagueSnapshot, TeamSnapshot } from '../types/leagueSnapshot';

const RATE_LIMIT_DELAY_MS = 1000;

export async function captureLeagueGameweek(
  leagueId: number,
  gameweek: number,
  teamIds: number[]
): Promise<void> {
  const db = getFirestore();

  const leagueStandings = await fetcher.fetchLeagueStandings(leagueId);

  const snapshotRef = db.doc(`league_snapshots/${leagueId}_gw${gameweek}`);

  await snapshotRef.set({
    leagueId,
    gameweek,
    capturedAt: Timestamp.now(),
    standings: leagueStandings,
  } satisfies Omit<LeagueSnapshot, 'capturedAt'> & { capturedAt: Timestamp });

  // Fetch and store team data with rate limiting
  const batch = db.batch();

  for (const teamId of teamIds) {
    await delay(RATE_LIMIT_DELAY_MS);

    const [entry, history, picks, transfers] = await Promise.all([
      fetcher.fetchEntry(teamId),
      fetcher.fetchHistory(teamId),
      fetcher.fetchPicks(teamId, gameweek).catch(() => null),
      fetcher.fetchTransfers(teamId),
    ]);

    const teamRef = snapshotRef.collection('teams').doc(String(teamId));
    batch.set(teamRef, { entry, history, picks, transfers } satisfies TeamSnapshot);
  }

  await batch.commit();
}
```

**Step 4: Run test to verify it passes**

Run: `cd functions && npm test -- --run leagueSnapshotService.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add functions/src/services/leagueSnapshotService.ts functions/src/services/leagueSnapshotService.test.ts
git commit -m "feat(service): add captureLeagueGameweek function"
```

---

## Task 17: LeagueSnapshotService - getLeagueTeamIds

**Files:**
- Modify: `functions/src/services/leagueSnapshotService.ts`
- Modify: `functions/src/services/leagueSnapshotService.test.ts`

**Step 1: Write the failing test**

```typescript
// Add to functions/src/services/leagueSnapshotService.test.ts
import { getLeagueTeamIds } from './leagueSnapshotService';

describe('getLeagueTeamIds', () => {
  it('should return team IDs from league standings', async () => {
    const teamIds = await getLeagueTeamIds(634129);
    expect(teamIds).toEqual([1, 2]);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd functions && npm test -- --run leagueSnapshotService.test.ts`
Expected: FAIL with "getLeagueTeamIds is not defined"

**Step 3: Write minimal implementation**

```typescript
// Add to functions/src/services/leagueSnapshotService.ts
export async function getLeagueTeamIds(leagueId: number): Promise<number[]> {
  const standings = await fetcher.fetchLeagueStandings(leagueId);
  return standings.standings.results.map((r) => r.entry);
}
```

**Step 4: Run test to verify it passes**

Run: `cd functions && npm test -- --run leagueSnapshotService.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add functions/src/services/leagueSnapshotService.ts functions/src/services/leagueSnapshotService.test.ts
git commit -m "feat(service): add getLeagueTeamIds function"
```

---

## Task 18: Main Ingestion Function - runIngestion

**Files:**
- Create: `functions/src/ingestion/runIngestion.ts`
- Test: `functions/src/ingestion/runIngestion.test.ts`

**Step 1: Write the failing test**

```typescript
// functions/src/ingestion/runIngestion.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runIngestion } from './runIngestion';

vi.mock('../fplApiFetcher', () => ({
  fetchBootstrapStatic: vi.fn(() => Promise.resolve({
    events: [
      { id: 1, finished: true, is_current: false },
      { id: 2, finished: false, is_current: true },
    ],
  })),
}));

vi.mock('../services/trackedLeagueService', () => ({
  getLeaguesByStalenessPriority: vi.fn(() => Promise.resolve([
    {
      leagueId: 634129,
      capturedGameweeks: [1],
      consecutiveErrors: 0,
      enabled: true,
    },
  ])),
  updateLeagueAfterCapture: vi.fn(() => Promise.resolve()),
  updateLeagueAfterError: vi.fn(() => Promise.resolve()),
}));

vi.mock('../services/globalSnapshotService', () => ({
  ensureGlobalSnapshot: vi.fn(() => Promise.resolve()),
}));

vi.mock('../services/leagueSnapshotService', () => ({
  captureLeagueGameweek: vi.fn(() => Promise.resolve()),
  getLeagueTeamIds: vi.fn(() => Promise.resolve([1, 2])),
}));

describe('runIngestion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should process leagues and capture snapshots', async () => {
    const { ensureGlobalSnapshot } = await import('../services/globalSnapshotService');
    const { captureLeagueGameweek } = await import('../services/leagueSnapshotService');

    await runIngestion();

    expect(ensureGlobalSnapshot).toHaveBeenCalledWith(2, expect.any(String));
    expect(captureLeagueGameweek).toHaveBeenCalled();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd functions && npm test -- --run runIngestion.test.ts`
Expected: FAIL with "Cannot find module './runIngestion'"

**Step 3: Write minimal implementation**

```typescript
// functions/src/ingestion/runIngestion.ts
import * as fetcher from '../fplApiFetcher';
import {
  getLeaguesByStalenessPriority,
  updateLeagueAfterCapture,
  updateLeagueAfterError,
} from '../services/trackedLeagueService';
import { ensureGlobalSnapshot } from '../services/globalSnapshotService';
import { captureLeagueGameweek, getLeagueTeamIds } from '../services/leagueSnapshotService';
import {
  getFinishedGameweeks,
  determineWorkType,
  isNearTimeout,
  shouldSkipLeague,
} from '../lib/gameweekHelpers';
import type { TrackedLeague } from '../types/trackedLeague';
import type { GameweekStatus } from '../types/globalSnapshot';

const MAX_RUNTIME_MS = 8 * 60 * 1000; // 8 minutes

export async function runIngestion(): Promise<void> {
  const startTime = Date.now();

  // Get current gameweek info
  const bootstrap = await fetcher.fetchBootstrapStatic();
  const currentEvent = bootstrap.events.find((e) => e.is_current);
  if (!currentEvent) {
    console.log('No current gameweek found');
    return;
  }

  const currentGW = currentEvent.id;
  const currentGWStatus: GameweekStatus = currentEvent.finished
    ? 'finished'
    : 'in_progress';
  const finishedGWs = getFinishedGameweeks(bootstrap.events);

  // Ensure global snapshot
  await ensureGlobalSnapshot(currentGW, currentGWStatus);

  // Get leagues to process
  const leagues = await getLeaguesByStalenessPriority();

  for (const league of leagues) {
    if (isNearTimeout(startTime, MAX_RUNTIME_MS)) {
      console.log('Approaching timeout, stopping gracefully');
      break;
    }

    if (shouldSkipLeague(league.consecutiveErrors)) {
      console.log(`Skipping league ${league.leagueId} due to consecutive errors`);
      continue;
    }

    await processLeague(league, currentGW, currentGWStatus, finishedGWs, startTime);
  }
}

async function processLeague(
  league: TrackedLeague,
  currentGW: number,
  currentGWStatus: GameweekStatus,
  finishedGWs: number[],
  startTime: number
): Promise<void> {
  try {
    const work = determineWorkType({
      capturedGameweeks: league.capturedGameweeks,
      finishedGameweeks: finishedGWs,
      currentGameweek: currentGW,
      currentGWStatus,
    });

    if (work.type === 'none') {
      return;
    }

    const teamIds = await getLeagueTeamIds(league.leagueId);

    if (work.type === 'backfill') {
      // Process missing gameweeks one at a time
      for (const gw of work.missingGameweeks) {
        if (isNearTimeout(startTime, MAX_RUNTIME_MS)) break;

        await ensureGlobalSnapshot(gw, 'finished');
        await captureLeagueGameweek(league.leagueId, gw, teamIds);
        await updateLeagueAfterCapture(league.leagueId, gw);
      }
    } else {
      // Current GW capture
      await captureLeagueGameweek(league.leagueId, currentGW, teamIds);
      await updateLeagueAfterCapture(league.leagueId, currentGW);
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`League ${league.leagueId} failed: ${errorMsg}`);
    await updateLeagueAfterError(league.leagueId, errorMsg);
  }
}
```

**Step 4: Run test to verify it passes**

Run: `cd functions && npm test -- --run runIngestion.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add functions/src/ingestion/runIngestion.ts functions/src/ingestion/runIngestion.test.ts
git commit -m "feat(ingestion): add main runIngestion function"
```

---

## Task 19: Cloud Function Entry Point

**Files:**
- Modify: `functions/src/index.ts`
- Create: `functions/src/scheduledIngestion.ts`

**Step 1: Create scheduled function file**

```typescript
// functions/src/scheduledIngestion.ts
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { runIngestion } from './ingestion/runIngestion';

// Run every 15 minutes
export const scheduledIngestion = onSchedule(
  {
    schedule: 'every 15 minutes',
    timeZone: 'Europe/London',
    timeoutSeconds: 540, // 9 minutes
    memory: '512MiB',
  },
  async () => {
    console.log('Starting scheduled ingestion');
    await runIngestion();
    console.log('Scheduled ingestion complete');
  }
);

// Manual trigger for testing
export const triggerIngestion = onCall(
  { timeoutSeconds: 540, memory: '512MiB' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be authenticated');
    }

    console.log('Starting manual ingestion trigger');
    await runIngestion();
    console.log('Manual ingestion complete');

    return { success: true };
  }
);
```

**Step 2: Update index.ts exports**

```typescript
// Add to functions/src/index.ts
export { scheduledIngestion, triggerIngestion } from './scheduledIngestion';
```

**Step 3: Commit**

```bash
git add functions/src/scheduledIngestion.ts functions/src/index.ts
git commit -m "feat(functions): add scheduled ingestion cloud function"
```

---

## Task 20: Firestore Index for tracked_leagues

**Files:**
- Modify: `firestore.indexes.json`

**Step 1: Add composite index**

```json
{
  "indexes": [
    {
      "collectionGroup": "tracked_leagues",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "enabled", "order": "ASCENDING" },
        { "fieldPath": "lastCaptureAt", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

**Step 2: Commit**

```bash
git add firestore.indexes.json
git commit -m "feat(firestore): add index for tracked_leagues queries"
```

---

## Task 21: Firestore Security Rules

**Files:**
- Modify: `firestore.rules`

**Step 1: Add rules for new collections**

```
// Add to firestore.rules within rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ... existing rules ...

    // Tracked leagues - admin only (Cloud Functions)
    match /tracked_leagues/{leagueId} {
      allow read: if request.auth != null;
      allow write: if false; // Only Cloud Functions can write
    }

    // Global snapshots - read only for authenticated users
    match /global_snapshots/{snapshotId} {
      allow read: if request.auth != null;
      allow write: if false; // Only Cloud Functions can write

      match /elements/{chunkId} {
        allow read: if request.auth != null;
        allow write: if false;
      }
    }

    // League snapshots - read only for authenticated users
    match /league_snapshots/{snapshotId} {
      allow read: if request.auth != null;
      allow write: if false;

      match /teams/{teamId} {
        allow read: if request.auth != null;
        allow write: if false;
      }
    }
  }
}
```

**Step 2: Commit**

```bash
git add firestore.rules
git commit -m "feat(firestore): add security rules for snapshot collections"
```

---

## Task 22: Add FLOAWO as Initial Tracked League

**Files:**
- Create: `functions/src/scripts/seedTrackedLeagues.ts`

**Step 1: Create seed script**

```typescript
// functions/src/scripts/seedTrackedLeagues.ts
import * as admin from 'firebase-admin';

// Initialize if not already
if (!admin.apps.length) {
  admin.initializeApp();
}

const FLOAWO_LEAGUE_ID = 634129;

async function seedTrackedLeagues(): Promise<void> {
  const db = admin.firestore();

  const leagueRef = db.doc(`tracked_leagues/${FLOAWO_LEAGUE_ID}`);
  const existing = await leagueRef.get();

  if (existing.exists) {
    console.log(`League ${FLOAWO_LEAGUE_ID} already exists`);
    return;
  }

  await leagueRef.set({
    leagueId: FLOAWO_LEAGUE_ID,
    name: 'FLOAWO',
    addedAt: admin.firestore.Timestamp.now(),
    addedBy: 'system',
    enabled: true,
    capturedGameweeks: [],
    lastCaptureAt: null,
    teamCount: 0, // Will be updated on first capture
    lastError: null,
    lastErrorAt: null,
    consecutiveErrors: 0,
  });

  console.log(`Added league ${FLOAWO_LEAGUE_ID}`);
}

seedTrackedLeagues()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
```

**Step 2: Add npm script**

```json
// Add to functions/package.json scripts
"seed:leagues": "ts-node src/scripts/seedTrackedLeagues.ts"
```

**Step 3: Commit**

```bash
git add functions/src/scripts/seedTrackedLeagues.ts functions/package.json
git commit -m "feat(scripts): add seed script for initial tracked league"
```

---

## Task 23: Integration Test

**Files:**
- Create: `functions/src/ingestion/runIngestion.integration.test.ts`

**Step 1: Write integration test**

```typescript
// functions/src/ingestion/runIngestion.integration.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// This test validates the full flow with mocked externals
describe('runIngestion integration', () => {
  it('should handle empty leagues list gracefully', async () => {
    vi.doMock('../services/trackedLeagueService', () => ({
      getLeaguesByStalenessPriority: vi.fn(() => Promise.resolve([])),
      updateLeagueAfterCapture: vi.fn(),
      updateLeagueAfterError: vi.fn(),
    }));

    vi.doMock('../fplApiFetcher', () => ({
      fetchBootstrapStatic: vi.fn(() => Promise.resolve({
        events: [{ id: 1, is_current: true, finished: false }],
      })),
    }));

    vi.doMock('../services/globalSnapshotService', () => ({
      ensureGlobalSnapshot: vi.fn(() => Promise.resolve()),
    }));

    const { runIngestion } = await import('./runIngestion');

    // Should complete without error
    await expect(runIngestion()).resolves.toBeUndefined();
  });

  it('should skip leagues with too many errors', async () => {
    const mockCapture = vi.fn();

    vi.doMock('../services/trackedLeagueService', () => ({
      getLeaguesByStalenessPriority: vi.fn(() => Promise.resolve([
        { leagueId: 1, capturedGameweeks: [], consecutiveErrors: 10 },
      ])),
      updateLeagueAfterCapture: vi.fn(),
      updateLeagueAfterError: vi.fn(),
    }));

    vi.doMock('../services/leagueSnapshotService', () => ({
      captureLeagueGameweek: mockCapture,
      getLeagueTeamIds: vi.fn(() => Promise.resolve([1])),
    }));

    const { runIngestion } = await import('./runIngestion');

    await runIngestion();

    // Should not attempt to capture
    expect(mockCapture).not.toHaveBeenCalled();
  });
});
```

**Step 2: Run integration test**

Run: `cd functions && npm test -- --run runIngestion.integration.test.ts`
Expected: PASS

**Step 3: Commit**

```bash
git add functions/src/ingestion/runIngestion.integration.test.ts
git commit -m "test(ingestion): add integration tests for runIngestion"
```

---

## Final Task: Run Full Test Suite

**Step 1: Run all tests**

```bash
cd functions && npm test
```

**Step 2: Verify no regressions**

Expected: All tests pass

**Step 3: Final commit if any cleanup needed**

```bash
git add -A
git commit -m "chore: final cleanup for multi-league ingestion"
```

---

## Summary

**Total Tasks:** 23

**New Files Created:**
- `functions/src/types/trackedLeague.ts`
- `functions/src/types/globalSnapshot.ts`
- `functions/src/types/leagueSnapshot.ts`
- `functions/src/lib/gameweekHelpers.ts`
- `functions/src/services/trackedLeagueService.ts`
- `functions/src/services/globalSnapshotService.ts`
- `functions/src/services/leagueSnapshotService.ts`
- `functions/src/ingestion/runIngestion.ts`
- `functions/src/scheduledIngestion.ts`
- `functions/src/scripts/seedTrackedLeagues.ts`

**Files Modified:**
- `functions/src/types/index.ts`
- `functions/src/index.ts`
- `firestore.indexes.json`
- `firestore.rules`

**Commits:** ~23 atomic commits
