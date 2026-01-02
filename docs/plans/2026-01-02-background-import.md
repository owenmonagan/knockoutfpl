# Background Import Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable tournament creation for leagues with 49-50,000 participants via background processing.

**Architecture:** Add new fields to Tournament table for import status tracking. Create a new Cloud Function `startTournamentImport` that validates the league, creates a tournament in 'creating' status, and triggers a background job. The background job `processTournamentImport` fetches participants in batches, creates database records, and updates progress. Existing batch mutation infrastructure is reused.

**Tech Stack:** Firebase Cloud Functions, Firebase DataConnect (PostgreSQL), FPL API

---

## Task 1: Add Tournament Import Fields to Schema

**Files:**
- Modify: `/Users/owen/work/knockoutfpl/dataconnect/schema/schema.gql:144-166`

**Step 1: Add new fields to Tournament table**

Add these fields after `isTest` field (around line 161):

```graphql
  # Background import tracking
  size: String @col(name: "size")                    # 'standard' | 'large' | 'mega'
  importStatus: String @col(name: "import_status")   # 'pending' | 'importing' | 'complete' | 'failed'
  importProgress: Int @col(name: "import_progress")  # 0-100 percentage
  importedCount: Int @col(name: "imported_count")    # Actual count imported
  totalCount: Int @col(name: "total_count")          # Total to import
  importError: String @col(name: "import_error")     # Error message if failed
```

**Step 2: Run DataConnect codegen**

Run: `npm run dataconnect:generate`
Expected: Generated TypeScript SDK updated with new fields

**Step 3: Commit**

```bash
git add dataconnect/schema/schema.gql dataconnect/dataconnect-generated/
git commit -m "feat(schema): add tournament import tracking fields"
```

---

## Task 2: Add DataConnect Mutations for Import Status

**Files:**
- Modify: `/Users/owen/work/knockoutfpl/dataconnect/connector/mutations.gql`

**Step 1: Add mutation to create tournament with import status**

Add after existing `tournament_upsert` mutation:

```graphql
mutation CreateTournamentWithImportStatus(
  $id: UUID!,
  $fplLeagueId: Int!,
  $fplLeagueName: String!,
  $creatorUid: String!,
  $participantCount: Int!,
  $totalRounds: Int!,
  $startEvent: Int!,
  $seedingMethod: String!,
  $matchSize: Int!,
  $isTest: Boolean!,
  $size: String!,
  $importStatus: String!,
  $totalCount: Int!
) @auth(level: NO_ACCESS) {
  tournament_insert(data: {
    id: $id,
    fplLeagueId: $fplLeagueId,
    fplLeagueName: $fplLeagueName,
    creatorUid: $creatorUid,
    participantCount: $participantCount,
    totalRounds: $totalRounds,
    currentRound: 1,
    startEvent: $startEvent,
    seedingMethod: $seedingMethod,
    matchSize: $matchSize,
    status: "creating",
    isTest: $isTest,
    size: $size,
    importStatus: $importStatus,
    importProgress: 0,
    importedCount: 0,
    totalCount: $totalCount,
    createdAt_expr: "request.time",
    updatedAt_expr: "request.time"
  })
}
```

**Step 2: Add mutation to update import progress**

```graphql
mutation UpdateTournamentImportProgress(
  $id: UUID!,
  $importStatus: String!,
  $importProgress: Int!,
  $importedCount: Int!,
  $importError: String
) @auth(level: NO_ACCESS) {
  tournament_update(id: $id, data: {
    importStatus: $importStatus,
    importProgress: $importProgress,
    importedCount: $importedCount,
    importError: $importError,
    updatedAt_expr: "request.time"
  })
}
```

**Step 3: Add mutation to finalize tournament import**

```graphql
mutation FinalizeTournamentImport(
  $id: UUID!,
  $participantCount: Int!
) @auth(level: NO_ACCESS) {
  tournament_update(id: $id, data: {
    importStatus: "complete",
    importProgress: 100,
    importedCount: $participantCount,
    participantCount: $participantCount,
    status: "active",
    updatedAt_expr: "request.time"
  })
}
```

**Step 4: Run DataConnect codegen**

Run: `npm run dataconnect:generate`
Expected: Generated TypeScript SDK updated with new mutations

**Step 5: Commit**

```bash
git add dataconnect/connector/mutations.gql dataconnect/dataconnect-generated/
git commit -m "feat(dataconnect): add import status mutations"
```

---

## Task 3: Add Binary Search for Participant Count

**Files:**
- Create: `/Users/owen/work/knockoutfpl/functions/src/fplLeagueCount.ts`
- Test: `/Users/owen/work/knockoutfpl/functions/src/fplLeagueCount.test.ts`

**Step 1: Write the failing test**

Create `/Users/owen/work/knockoutfpl/functions/src/fplLeagueCount.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getLeagueParticipantCount } from './fplLeagueCount';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('getLeagueParticipantCount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns count for small league (single page)', async () => {
    // League with 25 participants - all on page 1, no has_next
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        standings: {
          has_next: false,
          results: Array(25).fill({ entry: 1 })
        }
      })
    });

    const count = await getLeagueParticipantCount(12345);
    expect(count).toBe(25);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('uses binary search for large league', async () => {
    // Simulate a league with 735 pages (36,750 participants)
    const totalPages = 735;

    mockFetch.mockImplementation((url: string) => {
      const pageMatch = url.match(/page_standings=(\d+)/);
      const page = pageMatch ? parseInt(pageMatch[1]) : 1;

      if (page > totalPages) {
        return Promise.resolve({
          ok: false,
          status: 404
        });
      }

      const isLastPage = page === totalPages;
      const resultsOnPage = isLastPage ? 47 : 50; // Last page has 47

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          standings: {
            has_next: !isLastPage,
            results: Array(resultsOnPage).fill({ entry: 1 })
          }
        })
      });
    });

    const count = await getLeagueParticipantCount(12345);

    // (734 * 50) + 47 = 36,747
    expect(count).toBe(36747);

    // Binary search should take ~15 requests, not 735
    expect(mockFetch.mock.calls.length).toBeLessThan(20);
  });

  it('throws on invalid league', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404
    });

    await expect(getLeagueParticipantCount(99999)).rejects.toThrow('League not found');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- functions/src/fplLeagueCount.test.ts`
Expected: FAIL - module not found

**Step 3: Write minimal implementation**

Create `/Users/owen/work/knockoutfpl/functions/src/fplLeagueCount.ts`:

```typescript
const FPL_API_BASE = 'https://fantasy.premierleague.com/api';

interface StandingsPage {
  standings: {
    has_next: boolean;
    results: { entry: number }[];
  };
}

/**
 * Fetches a single page of league standings.
 * Returns null if page doesn't exist (404).
 */
async function fetchStandingsPage(leagueId: number, page: number): Promise<StandingsPage | null> {
  const url = `${FPL_API_BASE}/leagues-classic/${leagueId}/standings/?page_standings=${page}`;
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`FPL API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Uses binary search to find the total participant count for a league.
 * FPL API paginates at 50 results per page.
 *
 * Algorithm:
 * 1. Fetch page 1 to check if small league (no has_next)
 * 2. If has_next, exponentially probe (100, 1000, 10000) to find upper bound
 * 3. Binary search to find exact last page
 * 4. Count = (lastPage - 1) * 50 + results on last page
 */
export async function getLeagueParticipantCount(leagueId: number): Promise<number> {
  const RESULTS_PER_PAGE = 50;

  // Step 1: Fetch page 1
  const page1 = await fetchStandingsPage(leagueId, 1);
  if (!page1) {
    throw new Error('League not found');
  }

  // Small league - single page
  if (!page1.standings.has_next) {
    return page1.standings.results.length;
  }

  // Step 2: Find upper bound via exponential probing
  let lowerBound = 1;
  let upperBound = 100;

  while (true) {
    const probe = await fetchStandingsPage(leagueId, upperBound);
    if (probe === null) {
      // Overshot - the last page is between lowerBound and upperBound
      break;
    }
    if (!probe.standings.has_next) {
      // Found exact last page during probing
      return (upperBound - 1) * RESULTS_PER_PAGE + probe.standings.results.length;
    }
    lowerBound = upperBound;
    upperBound *= 10; // 100 -> 1000 -> 10000

    // Safety cap at 10000 pages (500k participants)
    if (upperBound > 10000) {
      upperBound = 10000;
      break;
    }
  }

  // Step 3: Binary search for last valid page
  while (lowerBound < upperBound - 1) {
    const mid = Math.floor((lowerBound + upperBound) / 2);
    const probe = await fetchStandingsPage(leagueId, mid);

    if (probe === null) {
      upperBound = mid;
    } else if (!probe.standings.has_next) {
      // Found exact last page
      return (mid - 1) * RESULTS_PER_PAGE + probe.standings.results.length;
    } else {
      lowerBound = mid;
    }
  }

  // Step 4: Fetch the last page to get exact count
  const lastPage = await fetchStandingsPage(leagueId, lowerBound);
  if (!lastPage) {
    throw new Error('Unexpected: could not find last page');
  }

  // If this page has_next, try the next page
  if (lastPage.standings.has_next) {
    const nextPage = await fetchStandingsPage(leagueId, lowerBound + 1);
    if (nextPage && !nextPage.standings.has_next) {
      return lowerBound * RESULTS_PER_PAGE + nextPage.standings.results.length;
    }
  }

  return (lowerBound - 1) * RESULTS_PER_PAGE + lastPage.standings.results.length;
}

/**
 * Determines tournament size tier based on participant count.
 */
export function getTournamentSizeTier(count: number): 'standard' | 'large' | 'mega' {
  if (count <= 48) return 'standard';
  if (count <= 1000) return 'large';
  return 'mega';
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- functions/src/fplLeagueCount.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add functions/src/fplLeagueCount.ts functions/src/fplLeagueCount.test.ts
git commit -m "feat: add binary search for league participant count"
```

---

## Task 4: Create startTournamentImport Cloud Function

**Files:**
- Create: `/Users/owen/work/knockoutfpl/functions/src/startTournamentImport.ts`
- Test: `/Users/owen/work/knockoutfpl/functions/src/startTournamentImport.test.ts`

**Step 1: Write the failing test**

Create `/Users/owen/work/knockoutfpl/functions/src/startTournamentImport.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies before importing module
vi.mock('./fplLeagueCount', () => ({
  getLeagueParticipantCount: vi.fn(),
  getTournamentSizeTier: vi.fn()
}));

vi.mock('./fplApiFetcher', () => ({
  fetchFPLLeagueStandings: vi.fn()
}));

vi.mock('firebase-admin/app', () => ({
  getApps: vi.fn(() => []),
  initializeApp: vi.fn()
}));

vi.mock('firebase-functions/v2/https', () => ({
  onCall: vi.fn((opts, handler) => handler),
  HttpsError: class HttpsError extends Error {
    constructor(public code: string, message: string) {
      super(message);
    }
  }
}));

vi.mock('firebase-functions/v2/tasks', () => ({
  onTaskDispatched: vi.fn((opts, handler) => handler)
}));

vi.mock('firebase-admin/functions', () => ({
  getFunctions: vi.fn(() => ({
    taskQueue: vi.fn(() => ({
      enqueue: vi.fn()
    }))
  }))
}));

describe('startTournamentImport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns size tier and count for validation', async () => {
    const { getLeagueParticipantCount, getTournamentSizeTier } = await import('./fplLeagueCount');
    const { fetchFPLLeagueStandings } = await import('./fplApiFetcher');

    vi.mocked(getLeagueParticipantCount).mockResolvedValue(30000);
    vi.mocked(getTournamentSizeTier).mockReturnValue('mega');
    vi.mocked(fetchFPLLeagueStandings).mockResolvedValue({
      league: { id: 12345, name: 'Reddit FPL' },
      standings: { results: [] }
    });

    const { validateLargeLeague } = await import('./startTournamentImport');

    const result = await validateLargeLeague(12345);

    expect(result).toEqual({
      leagueId: 12345,
      leagueName: 'Reddit FPL',
      participantCount: 30000,
      sizeTier: 'mega',
      estimatedMinutes: expect.any(Number)
    });
  });

  it('rejects standard-size leagues', async () => {
    const { getLeagueParticipantCount, getTournamentSizeTier } = await import('./fplLeagueCount');
    const { fetchFPLLeagueStandings } = await import('./fplApiFetcher');

    vi.mocked(getLeagueParticipantCount).mockResolvedValue(32);
    vi.mocked(getTournamentSizeTier).mockReturnValue('standard');
    vi.mocked(fetchFPLLeagueStandings).mockResolvedValue({
      league: { id: 12345, name: 'Small League' },
      standings: { results: [] }
    });

    const { validateLargeLeague } = await import('./startTournamentImport');

    await expect(validateLargeLeague(12345)).rejects.toThrow(
      'Use standard tournament creation for leagues with 48 or fewer participants'
    );
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- functions/src/startTournamentImport.test.ts`
Expected: FAIL - module not found

**Step 3: Write minimal implementation**

Create `/Users/owen/work/knockoutfpl/functions/src/startTournamentImport.ts`:

```typescript
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onTaskDispatched } from 'firebase-functions/v2/tasks';
import { getFunctions } from 'firebase-admin/functions';
import { v4 as uuidv4 } from 'uuid';
import { getLeagueParticipantCount, getTournamentSizeTier } from './fplLeagueCount';
import { fetchFPLLeagueStandings } from './fplApiFetcher';
import { dataConnectAdmin } from './dataconnect-admin';

interface ValidateLargeLeagueResult {
  leagueId: number;
  leagueName: string;
  participantCount: number;
  sizeTier: 'large' | 'mega';
  estimatedMinutes: number;
}

/**
 * Validates a league for background import and returns sizing info.
 * Used by frontend to show confirmation dialog.
 */
export async function validateLargeLeague(leagueId: number): Promise<ValidateLargeLeagueResult> {
  // Get participant count via binary search
  const participantCount = await getLeagueParticipantCount(leagueId);
  const sizeTier = getTournamentSizeTier(participantCount);

  if (sizeTier === 'standard') {
    throw new HttpsError(
      'invalid-argument',
      'Use standard tournament creation for leagues with 48 or fewer participants'
    );
  }

  // Get league name
  const standings = await fetchFPLLeagueStandings(leagueId);
  const leagueName = standings.league.name;

  // Estimate time: ~50 requests/second, plus DB writes
  // participantCount API calls + DB batches (20 per batch)
  const apiSeconds = participantCount / 50;
  const dbBatches = Math.ceil(participantCount / 20);
  const dbSeconds = dbBatches * 0.5; // ~0.5s per batch
  const estimatedMinutes = Math.ceil((apiSeconds + dbSeconds) / 60);

  return {
    leagueId,
    leagueName,
    participantCount,
    sizeTier,
    estimatedMinutes
  };
}

/**
 * Cloud Function: Validate large league for import.
 * Called before showing confirmation dialog.
 */
export const validateLargeLeagueCallable = onCall(
  {
    region: 'europe-west1',
    timeoutSeconds: 60
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be logged in');
    }

    const { leagueId } = request.data;
    if (typeof leagueId !== 'number') {
      throw new HttpsError('invalid-argument', 'leagueId must be a number');
    }

    return validateLargeLeague(leagueId);
  }
);

/**
 * Cloud Function: Start background tournament import.
 * Creates tournament in 'creating' status and enqueues import task.
 */
export const startTournamentImport = onCall(
  {
    region: 'europe-west1',
    timeoutSeconds: 30
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be logged in');
    }

    const { leagueId, startEvent, matchSize = 2 } = request.data;

    // Validate league size
    const validation = await validateLargeLeague(leagueId);

    // Generate tournament ID
    const tournamentId = uuidv4();

    // Calculate bracket structure
    const bracketSize = Math.pow(2, Math.ceil(Math.log2(validation.participantCount)));
    const totalRounds = Math.log2(bracketSize);

    // Create tournament in 'creating' status
    await dataConnectAdmin.executeGraphql(
      `mutation CreateTournamentWithImportStatus(
        $id: UUID!,
        $fplLeagueId: Int!,
        $fplLeagueName: String!,
        $creatorUid: String!,
        $participantCount: Int!,
        $totalRounds: Int!,
        $startEvent: Int!,
        $seedingMethod: String!,
        $matchSize: Int!,
        $isTest: Boolean!,
        $size: String!,
        $importStatus: String!,
        $totalCount: Int!
      ) {
        tournament_insert(data: {
          id: $id,
          fplLeagueId: $fplLeagueId,
          fplLeagueName: $fplLeagueName,
          creatorUid: $creatorUid,
          participantCount: 0,
          totalRounds: $totalRounds,
          currentRound: 1,
          startEvent: $startEvent,
          seedingMethod: "league_rank",
          matchSize: $matchSize,
          status: "creating",
          isTest: false,
          size: $size,
          importStatus: "pending",
          importProgress: 0,
          importedCount: 0,
          totalCount: $totalCount,
          createdAt_expr: "request.time",
          updatedAt_expr: "request.time"
        })
      }`,
      {
        id: tournamentId,
        fplLeagueId: leagueId,
        fplLeagueName: validation.leagueName,
        creatorUid: request.auth.uid,
        participantCount: 0,
        totalRounds,
        startEvent: startEvent || 1,
        seedingMethod: 'league_rank',
        matchSize,
        isTest: false,
        size: validation.sizeTier,
        importStatus: 'pending',
        totalCount: validation.participantCount
      }
    );

    // Enqueue background import task
    const queue = getFunctions().taskQueue('processTournamentImport');
    await queue.enqueue({
      tournamentId,
      leagueId,
      totalCount: validation.participantCount,
      startEvent: startEvent || 1,
      matchSize
    });

    return {
      tournamentId,
      leagueName: validation.leagueName,
      participantCount: validation.participantCount,
      sizeTier: validation.sizeTier,
      estimatedMinutes: validation.estimatedMinutes
    };
  }
);
```

**Step 4: Run test to verify it passes**

Run: `npm test -- functions/src/startTournamentImport.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add functions/src/startTournamentImport.ts functions/src/startTournamentImport.test.ts
git commit -m "feat: add startTournamentImport cloud function"
```

---

## Task 5: Create processTournamentImport Task Handler

**Files:**
- Create: `/Users/owen/work/knockoutfpl/functions/src/processTournamentImport.ts`
- Test: `/Users/owen/work/knockoutfpl/functions/src/processTournamentImport.test.ts`

**Step 1: Write the failing test**

Create `/Users/owen/work/knockoutfpl/functions/src/processTournamentImport.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./dataconnect-admin', () => ({
  dataConnectAdmin: {
    executeGraphql: vi.fn()
  }
}));

vi.mock('./fplApiFetcher', () => ({
  fetchFPLLeagueStandingsPage: vi.fn()
}));

describe('processTournamentImport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('imports participants in batches and updates progress', async () => {
    const { dataConnectAdmin } = await import('./dataconnect-admin');
    const { fetchFPLLeagueStandingsPage } = await import('./fplApiFetcher');

    // Mock 150 participants across 3 pages
    vi.mocked(fetchFPLLeagueStandingsPage)
      .mockResolvedValueOnce({
        standings: {
          has_next: true,
          results: Array(50).fill(null).map((_, i) => ({
            entry: i + 1,
            entry_name: `Team ${i + 1}`,
            player_name: `Manager ${i + 1}`,
            rank: i + 1,
            total: 1000 - i
          }))
        }
      })
      .mockResolvedValueOnce({
        standings: {
          has_next: true,
          results: Array(50).fill(null).map((_, i) => ({
            entry: i + 51,
            entry_name: `Team ${i + 51}`,
            player_name: `Manager ${i + 51}`,
            rank: i + 51,
            total: 950 - i
          }))
        }
      })
      .mockResolvedValueOnce({
        standings: {
          has_next: false,
          results: Array(50).fill(null).map((_, i) => ({
            entry: i + 101,
            entry_name: `Team ${i + 101}`,
            player_name: `Manager ${i + 101}`,
            rank: i + 101,
            total: 900 - i
          }))
        }
      });

    vi.mocked(dataConnectAdmin.executeGraphql).mockResolvedValue({});

    const { importParticipantsBatched } = await import('./processTournamentImport');

    const result = await importParticipantsBatched(
      'test-tournament-id',
      12345,
      150,
      (progress) => {} // progress callback
    );

    expect(result.importedCount).toBe(150);
    expect(fetchFPLLeagueStandingsPage).toHaveBeenCalledTimes(3);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- functions/src/processTournamentImport.test.ts`
Expected: FAIL - module not found

**Step 3: Write minimal implementation**

Create `/Users/owen/work/knockoutfpl/functions/src/processTournamentImport.ts`:

```typescript
import { onTaskDispatched } from 'firebase-functions/v2/tasks';
import { dataConnectAdmin } from './dataconnect-admin';
import { upsertEntriesBatch, createParticipantsBatch } from './dataconnect-mutations';
import {
  calculateBracketSize,
  generateBracketStructure,
  assignParticipantsToMatches
} from './bracketGenerator';

const FPL_API_BASE = 'https://fantasy.premierleague.com/api';
const RESULTS_PER_PAGE = 50;
const BATCH_SIZE = 100; // Process 100 participants at a time

interface LeagueStandingEntry {
  entry: number;
  entry_name: string;
  player_name: string;
  rank: number;
  total: number;
}

interface ImportProgress {
  importedCount: number;
  progress: number;
}

/**
 * Fetches a single page of league standings.
 */
export async function fetchFPLLeagueStandingsPage(
  leagueId: number,
  page: number
): Promise<{ standings: { has_next: boolean; results: LeagueStandingEntry[] } }> {
  const url = `${FPL_API_BASE}/leagues-classic/${leagueId}/standings/?page_standings=${page}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`FPL API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Updates tournament import progress in database.
 */
async function updateImportProgress(
  tournamentId: string,
  importedCount: number,
  totalCount: number,
  status: 'importing' | 'complete' | 'failed',
  error?: string
): Promise<void> {
  const progress = Math.round((importedCount / totalCount) * 100);

  await dataConnectAdmin.executeGraphql(
    `mutation UpdateTournamentImportProgress(
      $id: UUID!,
      $importStatus: String!,
      $importProgress: Int!,
      $importedCount: Int!,
      $importError: String
    ) {
      tournament_update(id: $id, data: {
        importStatus: $importStatus,
        importProgress: $importProgress,
        importedCount: $importedCount,
        importError: $importError,
        updatedAt_expr: "request.time"
      })
    }`,
    {
      id: tournamentId,
      importStatus: status,
      importProgress: progress,
      importedCount,
      importError: error || null
    }
  );
}

/**
 * Imports participants in batches, updating progress as we go.
 */
export async function importParticipantsBatched(
  tournamentId: string,
  leagueId: number,
  totalCount: number,
  onProgress: (progress: ImportProgress) => void
): Promise<{ importedCount: number; participants: LeagueStandingEntry[] }> {
  const allParticipants: LeagueStandingEntry[] = [];
  let page = 1;
  let hasNext = true;

  while (hasNext) {
    const pageData = await fetchFPLLeagueStandingsPage(leagueId, page);
    allParticipants.push(...pageData.standings.results);
    hasNext = pageData.standings.has_next;
    page++;

    // Report progress
    const progress = Math.round((allParticipants.length / totalCount) * 50); // 0-50% for fetching
    onProgress({ importedCount: allParticipants.length, progress });

    // Small delay to avoid rate limiting
    if (hasNext) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return { importedCount: allParticipants.length, participants: allParticipants };
}

/**
 * Creates Entry and Participant records in database.
 */
async function createDatabaseRecords(
  tournamentId: string,
  participants: LeagueStandingEntry[],
  onProgress: (progress: ImportProgress) => void
): Promise<void> {
  // Create Entry records
  const entries = participants.map(p => ({
    entryId: p.entry,
    teamName: p.entry_name,
    managerName: p.player_name,
    rawJson: JSON.stringify(p)
  }));

  await upsertEntriesBatch(entries);

  // Create Participant records
  const participantRecords = participants.map((p, idx) => ({
    tournamentId,
    entryId: p.entry,
    teamName: p.entry_name,
    managerName: p.player_name,
    seed: p.rank,
    leagueRank: p.rank,
    leaguePoints: p.total,
    status: 'active' as const,
    rawJson: JSON.stringify(p)
  }));

  await createParticipantsBatch(participantRecords);

  onProgress({ importedCount: participants.length, progress: 75 }); // 75% after participants
}

/**
 * Cloud Task: Process tournament import in background.
 */
export const processTournamentImport = onTaskDispatched(
  {
    region: 'europe-west1',
    retryConfig: {
      maxAttempts: 3,
      minBackoffSeconds: 60
    },
    rateLimits: {
      maxConcurrentDispatches: 1
    }
  },
  async (request) => {
    const { tournamentId, leagueId, totalCount, startEvent, matchSize } = request.data;

    try {
      // Update status to 'importing'
      await updateImportProgress(tournamentId, 0, totalCount, 'importing');

      // Import participants
      const { participants } = await importParticipantsBatched(
        tournamentId,
        leagueId,
        totalCount,
        async ({ importedCount, progress }) => {
          // Update progress every 10%
          if (progress % 10 === 0) {
            await updateImportProgress(tournamentId, importedCount, totalCount, 'importing');
          }
        }
      );

      // Create database records
      await createDatabaseRecords(
        tournamentId,
        participants,
        async ({ progress }) => {
          await updateImportProgress(tournamentId, participants.length, totalCount, 'importing');
        }
      );

      // Generate bracket and create matches
      // (Reuse existing bracket generation logic from createTournament.ts)
      const bracketSize = calculateBracketSize(participants.length, matchSize);
      const { matches, rounds } = generateBracketStructure(
        participants.length,
        bracketSize,
        matchSize,
        startEvent
      );

      // TODO: Create rounds, matches, and match picks using existing batch functions

      // Finalize tournament
      await dataConnectAdmin.executeGraphql(
        `mutation FinalizeTournamentImport($id: UUID!, $participantCount: Int!) {
          tournament_update(id: $id, data: {
            importStatus: "complete",
            importProgress: 100,
            importedCount: $participantCount,
            participantCount: $participantCount,
            status: "active",
            updatedAt_expr: "request.time"
          })
        }`,
        {
          id: tournamentId,
          participantCount: participants.length
        }
      );

    } catch (error) {
      console.error('Import failed:', error);
      await updateImportProgress(
        tournamentId,
        0,
        totalCount,
        'failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error; // Re-throw for Cloud Tasks retry
    }
  }
);
```

**Step 4: Run test to verify it passes**

Run: `npm test -- functions/src/processTournamentImport.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add functions/src/processTournamentImport.ts functions/src/processTournamentImport.test.ts
git commit -m "feat: add processTournamentImport task handler"
```

---

## Task 6: Export New Functions in Index

**Files:**
- Modify: `/Users/owen/work/knockoutfpl/functions/src/index.ts`

**Step 1: Add exports for new functions**

Add to the exports in `index.ts`:

```typescript
// Background import
export {
  validateLargeLeagueCallable,
  startTournamentImport
} from './startTournamentImport';
export { processTournamentImport } from './processTournamentImport';
```

**Step 2: Build to verify no errors**

Run: `cd functions && npm run build`
Expected: Build succeeds with no errors

**Step 3: Commit**

```bash
git add functions/src/index.ts
git commit -m "feat: export background import functions"
```

---

## Task 7: Add Frontend Service for Import

**Files:**
- Create: `/Users/owen/work/knockoutfpl/src/services/tournamentImport.ts`
- Test: `/Users/owen/work/knockoutfpl/src/services/tournamentImport.test.ts`

**Step 1: Write the failing test**

Create `/Users/owen/work/knockoutfpl/src/services/tournamentImport.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateLargeLeague, startTournamentImport } from './tournamentImport';

vi.mock('firebase/functions', () => ({
  getFunctions: vi.fn(),
  httpsCallable: vi.fn()
}));

describe('tournamentImport service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validateLargeLeague calls cloud function', async () => {
    const { httpsCallable } = await import('firebase/functions');
    const mockCallable = vi.fn().mockResolvedValue({
      data: {
        leagueId: 12345,
        leagueName: 'Reddit FPL',
        participantCount: 30000,
        sizeTier: 'mega',
        estimatedMinutes: 15
      }
    });
    vi.mocked(httpsCallable).mockReturnValue(mockCallable);

    const result = await validateLargeLeague(12345);

    expect(result.participantCount).toBe(30000);
    expect(result.sizeTier).toBe('mega');
  });

  it('startTournamentImport returns tournament ID', async () => {
    const { httpsCallable } = await import('firebase/functions');
    const mockCallable = vi.fn().mockResolvedValue({
      data: {
        tournamentId: 'test-uuid',
        leagueName: 'Reddit FPL',
        participantCount: 30000,
        sizeTier: 'mega',
        estimatedMinutes: 15
      }
    });
    vi.mocked(httpsCallable).mockReturnValue(mockCallable);

    const result = await startTournamentImport(12345, 20);

    expect(result.tournamentId).toBe('test-uuid');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/services/tournamentImport.test.ts`
Expected: FAIL - module not found

**Step 3: Write minimal implementation**

Create `/Users/owen/work/knockoutfpl/src/services/tournamentImport.ts`:

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

interface ValidateLargeLeagueResult {
  leagueId: number;
  leagueName: string;
  participantCount: number;
  sizeTier: 'large' | 'mega';
  estimatedMinutes: number;
}

interface StartImportResult {
  tournamentId: string;
  leagueName: string;
  participantCount: number;
  sizeTier: 'large' | 'mega';
  estimatedMinutes: number;
}

/**
 * Validates a large league for background import.
 * Returns sizing info for confirmation dialog.
 */
export async function validateLargeLeague(leagueId: number): Promise<ValidateLargeLeagueResult> {
  const functions = getFunctions();
  const callable = httpsCallable<{ leagueId: number }, ValidateLargeLeagueResult>(
    functions,
    'validateLargeLeagueCallable'
  );

  const result = await callable({ leagueId });
  return result.data;
}

/**
 * Starts background tournament import.
 * Returns immediately with tournament ID for progress tracking.
 */
export async function startTournamentImport(
  leagueId: number,
  startEvent: number,
  matchSize: number = 2
): Promise<StartImportResult> {
  const functions = getFunctions();
  const callable = httpsCallable<
    { leagueId: number; startEvent: number; matchSize: number },
    StartImportResult
  >(functions, 'startTournamentImport');

  const result = await callable({ leagueId, startEvent, matchSize });
  return result.data;
}

/**
 * Gets import progress for a tournament.
 * Polls the tournament record for importStatus and importProgress.
 */
export async function getImportProgress(tournamentId: string): Promise<{
  status: 'pending' | 'importing' | 'complete' | 'failed';
  progress: number;
  importedCount: number;
  totalCount: number;
  error?: string;
}> {
  // TODO: Implement via DataConnect query
  throw new Error('Not implemented');
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/services/tournamentImport.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/services/tournamentImport.ts src/services/tournamentImport.test.ts
git commit -m "feat: add frontend tournament import service"
```

---

## Task 8: Integration Test with Real FPL API

**Files:**
- Create: `/Users/owen/work/knockoutfpl/integration/backgroundImport.integration.test.ts`

**Step 1: Create integration test**

```typescript
import { describe, it, expect } from 'vitest';
import { getLeagueParticipantCount, getTournamentSizeTier } from '../functions/src/fplLeagueCount';

describe('Background Import Integration', () => {
  it('can count participants in real FPL league', async () => {
    // Reddit FPL league - should have many participants
    const leagueId = 39776;

    const count = await getLeagueParticipantCount(leagueId);

    expect(count).toBeGreaterThan(1000);
    console.log(`League ${leagueId} has ${count} participants`);

    const tier = getTournamentSizeTier(count);
    expect(['large', 'mega']).toContain(tier);
    console.log(`Size tier: ${tier}`);
  }, 60000); // 60 second timeout for API calls
});
```

**Step 2: Run integration test**

Run: `npm test -- integration/backgroundImport.integration.test.ts`
Expected: PASS (may take 30+ seconds due to binary search)

**Step 3: Commit**

```bash
git add integration/backgroundImport.integration.test.ts
git commit -m "test: add background import integration test"
```

---

## Summary

This plan implements Phase 1, Step 1 of the Large Tournament Scaling design:

1. **Schema changes** - Add import tracking fields to Tournament table
2. **Binary search** - Efficiently count participants without fetching all pages
3. **startTournamentImport** - Cloud function to validate and kick off import
4. **processTournamentImport** - Background task to import participants in batches
5. **Frontend service** - Client-side functions to trigger and track import

**Not included (future tasks):**
- UI for import progress (needs design)
- Retry queue with exponential backoff (Phase 2)
- Paginated bracket view (Phase 1, Step 3)
- Match creation for large tournaments (needs bracket generator updates)
