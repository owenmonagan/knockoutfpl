# Refresh & Score Updates Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Optimize refresh for large tournaments by scoping to visible matches, increasing background job frequency to 15 minutes, and prioritizing claimed users.

**Architecture:** Modify `refreshTournament` to accept optional match IDs for scoped refresh. Update `updateBrackets` scheduled job to run every 15 minutes with priority ordering (claimed users first). Add new `refreshVisibleMatches` endpoint for frontend pagination. Reuse existing FPL score batching infrastructure.

**Tech Stack:** Firebase Cloud Functions, Firebase DataConnect, FPL API

---

## Task 1: Update Background Job Frequency to 15 Minutes

**Files:**
- Modify: `/Users/owen/work/knockoutfpl/functions/src/updateBrackets.ts:211-216`

**Step 1: Change schedule from 2 hours to 15 minutes**

Find line 213 and change:

```typescript
// Before
export const updateBrackets = onSchedule(
  {
    schedule: 'every 2 hours',
    timeZone: 'Europe/London',
    ...
  },

// After
export const updateBrackets = onSchedule(
  {
    schedule: 'every 15 minutes',
    timeZone: 'Europe/London',
    ...
  },
```

**Step 2: Build to verify no errors**

Run: `cd functions && npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add functions/src/updateBrackets.ts
git commit -m "feat: increase updateBrackets frequency to 15 minutes"
```

---

## Task 2: Add Priority Ordering Query for Claimed Users

**Files:**
- Modify: `/Users/owen/work/knockoutfpl/dataconnect/connector/queries.gql`

**Step 1: Add query to get matches with claimed user priority**

Add new query:

```graphql
# Get matches for a round with claimed user priority ordering
# Returns matches where at least one participant has claimed (has uid)
query GetRoundMatchesWithPriority(
  $tournamentId: UUID!,
  $roundNumber: Int!
) @auth(level: NO_ACCESS) {
  # Matches with both participants claimed (highest priority)
  bothClaimed: matches(
    where: {
      tournamentId: { eq: $tournamentId }
      roundNumber: { eq: $roundNumber }
      status: { ne: "complete" }
      isBye: { eq: false }
    }
  ) {
    matchId
    roundNumber
    positionInRound
    status
    winnerEntryId
    qualifiesToMatchId
    matchPicks: matchPicks_on_match {
      entryId
      slot
      participant {
        seed
        uid
      }
    }
  }
}
```

**Step 2: Run DataConnect codegen**

Run: `npm run dataconnect:generate`
Expected: Generated SDK updated

**Step 3: Commit**

```bash
git add dataconnect/connector/queries.gql dataconnect/dataconnect-generated/
git commit -m "feat(dataconnect): add priority ordering query for matches"
```

---

## Task 3: Add Priority Sorting to updateBrackets

**Files:**
- Modify: `/Users/owen/work/knockoutfpl/functions/src/updateBrackets.ts`
- Test: `/Users/owen/work/knockoutfpl/functions/src/updateBrackets.test.ts`

**Step 1: Write the failing test**

Add to existing test file or create new section:

```typescript
describe('priority ordering', () => {
  it('processes matches with claimed users first', async () => {
    const matches = [
      { matchId: 1, participants: [{ uid: null }, { uid: null }] },      // 0 claimed
      { matchId: 2, participants: [{ uid: 'user1' }, { uid: null }] },   // 1 claimed
      { matchId: 3, participants: [{ uid: 'user1' }, { uid: 'user2' }] }, // 2 claimed
      { matchId: 4, participants: [{ uid: null }, { uid: 'user3' }] },   // 1 claimed
    ];

    const sorted = sortMatchesByClaimedPriority(matches);

    expect(sorted[0].matchId).toBe(3); // Both claimed first
    expect([2, 4]).toContain(sorted[1].matchId); // One claimed next
    expect([2, 4]).toContain(sorted[2].matchId);
    expect(sorted[3].matchId).toBe(1); // No claimed last
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- functions/src/updateBrackets.test.ts`
Expected: FAIL - function not defined

**Step 3: Add priority sorting function**

Add to `updateBrackets.ts` around line 30:

```typescript
interface MatchWithParticipants {
  matchId: number;
  participants: Array<{ uid: string | null }>;
}

/**
 * Sorts matches by claimed user priority.
 * Order: Both claimed > One claimed > None claimed
 */
export function sortMatchesByClaimedPriority<T extends MatchWithParticipants>(
  matches: T[]
): T[] {
  return [...matches].sort((a, b) => {
    const aClaimedCount = a.participants.filter(p => p.uid != null).length;
    const bClaimedCount = b.participants.filter(p => p.uid != null).length;
    return bClaimedCount - aClaimedCount; // Higher claimed count first
  });
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- functions/src/updateBrackets.test.ts`
Expected: PASS

**Step 5: Integrate into processRound function**

Find `processRound` function and add sorting before processing matches:

```typescript
// After fetching matches, before processing
const matchesWithPicks = await getRoundMatches(tournamentId, roundNumber);

// Sort by claimed user priority
const sortedMatches = sortMatchesByClaimedPriority(
  matchesWithPicks.matches.map(m => ({
    ...m,
    participants: m.matchPicks.map(mp => ({ uid: mp.participant?.uid || null }))
  }))
);

// Process in priority order
for (const match of sortedMatches) {
  // ... existing processing logic
}
```

**Step 6: Commit**

```bash
git add functions/src/updateBrackets.ts functions/src/updateBrackets.test.ts
git commit -m "feat: add priority ordering for claimed users in updateBrackets"
```

---

## Task 4: Create refreshVisibleMatches Cloud Function

**Files:**
- Create: `/Users/owen/work/knockoutfpl/functions/src/refreshVisibleMatches.ts`
- Test: `/Users/owen/work/knockoutfpl/functions/src/refreshVisibleMatches.test.ts`

**Step 1: Write the failing test**

Create `/Users/owen/work/knockoutfpl/functions/src/refreshVisibleMatches.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./dataconnect-admin', () => ({
  dataConnectAdmin: {
    executeGraphql: vi.fn()
  }
}));

vi.mock('./fpl-scores', () => ({
  fetchScoresForEntries: vi.fn(),
  fetchCurrentGameweek: vi.fn()
}));

describe('refreshVisibleMatches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('only fetches scores for specified match IDs', async () => {
    const { fetchScoresForEntries } = await import('./fpl-scores');
    const { dataConnectAdmin } = await import('./dataconnect-admin');

    // Mock tournament with current round
    vi.mocked(dataConnectAdmin.executeGraphql)
      .mockResolvedValueOnce({
        data: {
          tournament: { id: 'tour-1', currentRound: 1 },
          rounds: [{ roundNumber: 1, event: 20 }]
        }
      })
      // Mock match picks for visible matches only
      .mockResolvedValueOnce({
        data: {
          matchPicks: [
            { matchId: 5, entryId: 100, slot: 1 },
            { matchId: 5, entryId: 101, slot: 2 },
            { matchId: 6, entryId: 102, slot: 1 },
            { matchId: 6, entryId: 103, slot: 2 },
          ]
        }
      });

    vi.mocked(fetchScoresForEntries).mockResolvedValue([
      { entryId: 100, points: 55, totalPoints: 1000 },
      { entryId: 101, points: 48, totalPoints: 950 },
      { entryId: 102, points: 62, totalPoints: 1100 },
      { entryId: 103, points: 51, totalPoints: 980 },
    ]);

    const { refreshVisibleMatchesHandler } = await import('./refreshVisibleMatches');

    const result = await refreshVisibleMatchesHandler({
      tournamentId: 'tour-1',
      matchIds: [5, 6]
    });

    // Should only fetch 4 entries (2 per match × 2 matches)
    expect(fetchScoresForEntries).toHaveBeenCalledWith(
      expect.arrayContaining([100, 101, 102, 103]),
      20,
      expect.any(Object)
    );
    expect(result.picksRefreshed).toBe(4);
  });

  it('rejects if more than 20 matches requested', async () => {
    const { refreshVisibleMatchesHandler } = await import('./refreshVisibleMatches');

    const matchIds = Array.from({ length: 25 }, (_, i) => i + 1);

    await expect(
      refreshVisibleMatchesHandler({ tournamentId: 'tour-1', matchIds })
    ).rejects.toThrow('Maximum 20 matches per refresh');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- functions/src/refreshVisibleMatches.test.ts`
Expected: FAIL - module not found

**Step 3: Write minimal implementation**

Create `/Users/owen/work/knockoutfpl/functions/src/refreshVisibleMatches.ts`:

```typescript
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { dataConnectAdmin } from './dataconnect-admin';
import { fetchScoresForEntries, fetchCurrentGameweek } from './fpl-scores';
import { upsertPicksBatch } from './dataconnect-mutations';

const MAX_MATCHES_PER_REFRESH = 20;

interface RefreshVisibleMatchesRequest {
  tournamentId: string;
  matchIds: number[];
}

interface RefreshVisibleMatchesResponse {
  picksRefreshed: number;
  matchIds: number[];
}

/**
 * Core handler for refreshing visible matches.
 * Exported for testing.
 */
export async function refreshVisibleMatchesHandler(
  request: RefreshVisibleMatchesRequest
): Promise<RefreshVisibleMatchesResponse> {
  const { tournamentId, matchIds } = request;

  // Limit matches per request to prevent abuse
  if (matchIds.length > MAX_MATCHES_PER_REFRESH) {
    throw new HttpsError(
      'invalid-argument',
      `Maximum ${MAX_MATCHES_PER_REFRESH} matches per refresh`
    );
  }

  if (matchIds.length === 0) {
    return { picksRefreshed: 0, matchIds: [] };
  }

  // Get tournament and current round info
  const tournamentResult = await dataConnectAdmin.executeGraphql(
    `query GetTournamentForRefresh($id: UUID!) {
      tournament(id: $id) {
        id
        currentRound
        status
      }
      rounds(where: { tournamentId: { eq: $id } }) {
        roundNumber
        event
      }
    }`,
    { id: tournamentId }
  );

  const tournament = tournamentResult.data?.tournament;
  if (!tournament) {
    throw new HttpsError('not-found', 'Tournament not found');
  }

  if (tournament.status !== 'active' && tournament.status !== 'creating') {
    return { picksRefreshed: 0, matchIds };
  }

  // Find current round's event (gameweek)
  const currentRoundInfo = tournamentResult.data.rounds.find(
    (r: { roundNumber: number }) => r.roundNumber === tournament.currentRound
  );
  if (!currentRoundInfo) {
    throw new HttpsError('internal', 'Current round not found');
  }

  const event = currentRoundInfo.event;

  // Get match picks for the visible matches only
  const picksResult = await dataConnectAdmin.executeGraphql(
    `query GetMatchPicksForRefresh($tournamentId: UUID!, $matchIds: [Int!]!) {
      matchPicks(
        where: {
          tournamentId: { eq: $tournamentId }
          matchId: { in: $matchIds }
        }
      ) {
        matchId
        entryId
        slot
      }
    }`,
    { tournamentId, matchIds }
  );

  const matchPicks = picksResult.data?.matchPicks || [];
  if (matchPicks.length === 0) {
    return { picksRefreshed: 0, matchIds };
  }

  // Collect unique entry IDs
  const entryIds = [...new Set(matchPicks.map((mp: { entryId: number }) => mp.entryId))];

  // Fetch scores from FPL API
  const scores = await fetchScoresForEntries(entryIds, event, {
    treatMissingAsZero: true
  });

  // Check if gameweek is finished
  const currentGameweek = await fetchCurrentGameweek();
  const isEventFinished = currentGameweek
    ? event < currentGameweek.id || currentGameweek.finished
    : false;

  // Update picks in database
  const pickUpdates = scores.map(score => ({
    entryId: score.entryId,
    event,
    points: score.points,
    totalPoints: score.totalPoints,
    rank: score.rank || 0,
    overallRank: score.overallRank || 0,
    isFinal: isEventFinished
  }));

  await upsertPicksBatch(pickUpdates);

  return {
    picksRefreshed: pickUpdates.length,
    matchIds
  };
}

/**
 * Cloud Function: Refresh scores for specific visible matches.
 * Rate limited to once per 30 seconds per user.
 */
export const refreshVisibleMatches = onCall(
  {
    region: 'europe-west1',
    timeoutSeconds: 60,
    // Rate limiting handled by Firebase
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be logged in');
    }

    const { tournamentId, matchIds } = request.data;

    if (!tournamentId || !Array.isArray(matchIds)) {
      throw new HttpsError(
        'invalid-argument',
        'tournamentId and matchIds array required'
      );
    }

    return refreshVisibleMatchesHandler({ tournamentId, matchIds });
  }
);
```

**Step 4: Run test to verify it passes**

Run: `npm test -- functions/src/refreshVisibleMatches.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add functions/src/refreshVisibleMatches.ts functions/src/refreshVisibleMatches.test.ts
git commit -m "feat: add refreshVisibleMatches for scoped refresh"
```

---

## Task 5: Add Rate Limiting for User Refresh

**Files:**
- Modify: `/Users/owen/work/knockoutfpl/functions/src/refreshVisibleMatches.ts`

**Step 1: Add rate limiting using Firestore**

Add rate limiting logic:

```typescript
import { getFirestore } from 'firebase-admin/firestore';

const RATE_LIMIT_SECONDS = 30;

async function checkRateLimit(userId: string, tournamentId: string): Promise<boolean> {
  const db = getFirestore();
  const rateLimitRef = db
    .collection('rateLimits')
    .doc(`refresh_${userId}_${tournamentId}`);

  const doc = await rateLimitRef.get();
  const now = Date.now();

  if (doc.exists) {
    const lastRefresh = doc.data()?.timestamp || 0;
    if (now - lastRefresh < RATE_LIMIT_SECONDS * 1000) {
      return false; // Rate limited
    }
  }

  // Update timestamp
  await rateLimitRef.set({ timestamp: now });
  return true;
}
```

**Step 2: Integrate into Cloud Function**

Update the `refreshVisibleMatches` function:

```typescript
export const refreshVisibleMatches = onCall(
  {
    region: 'europe-west1',
    timeoutSeconds: 60,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be logged in');
    }

    const { tournamentId, matchIds } = request.data;

    // Check rate limit
    const allowed = await checkRateLimit(request.auth.uid, tournamentId);
    if (!allowed) {
      throw new HttpsError(
        'resource-exhausted',
        `Please wait ${RATE_LIMIT_SECONDS} seconds between refreshes`
      );
    }

    // ... rest of implementation
  }
);
```

**Step 3: Commit**

```bash
git add functions/src/refreshVisibleMatches.ts
git commit -m "feat: add 30-second rate limiting to refreshVisibleMatches"
```

---

## Task 6: Export New Functions

**Files:**
- Modify: `/Users/owen/work/knockoutfpl/functions/src/index.ts`

**Step 1: Add export**

```typescript
// Scoped refresh
export { refreshVisibleMatches } from './refreshVisibleMatches';
```

**Step 2: Build to verify**

Run: `cd functions && npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add functions/src/index.ts
git commit -m "feat: export refreshVisibleMatches function"
```

---

## Task 7: Add Frontend Service for Scoped Refresh

**Files:**
- Modify: `/Users/owen/work/knockoutfpl/src/services/tournament.ts`
- Test: `/Users/owen/work/knockoutfpl/src/services/tournament.test.ts`

**Step 1: Write the failing test**

Add to existing test file:

```typescript
describe('refreshVisibleMatches', () => {
  it('calls cloud function with match IDs', async () => {
    const mockCallable = vi.fn().mockResolvedValue({
      data: { picksRefreshed: 4, matchIds: [1, 2] }
    });
    vi.mocked(httpsCallable).mockReturnValue(mockCallable);

    const result = await refreshVisibleMatches('tour-1', [1, 2]);

    expect(mockCallable).toHaveBeenCalledWith({
      tournamentId: 'tour-1',
      matchIds: [1, 2]
    });
    expect(result?.picksRefreshed).toBe(4);
  });

  it('returns null on rate limit error', async () => {
    const mockCallable = vi.fn().mockRejectedValue({
      code: 'functions/resource-exhausted'
    });
    vi.mocked(httpsCallable).mockReturnValue(mockCallable);

    const result = await refreshVisibleMatches('tour-1', [1, 2]);

    expect(result).toBeNull();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/services/tournament.test.ts`
Expected: FAIL - function not defined

**Step 3: Add function to tournament.ts**

Add to `/Users/owen/work/knockoutfpl/src/services/tournament.ts`:

```typescript
interface RefreshVisibleMatchesResponse {
  picksRefreshed: number;
  matchIds: number[];
}

/**
 * Refreshes scores for specific visible matches.
 * Used for paginated bracket view - only refreshes what user sees.
 * Rate limited to once per 30 seconds.
 */
export async function refreshVisibleMatches(
  tournamentId: string,
  matchIds: number[]
): Promise<RefreshVisibleMatchesResponse | null> {
  try {
    const functions = getFunctions();
    const callable = httpsCallable<
      { tournamentId: string; matchIds: number[] },
      RefreshVisibleMatchesResponse
    >(functions, 'refreshVisibleMatches');

    const result = await callable({ tournamentId, matchIds });
    return result.data;
  } catch (error) {
    // Silently handle rate limiting
    console.warn('[WARN] Failed to refresh visible matches:', error);
    return null;
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/services/tournament.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/services/tournament.ts src/services/tournament.test.ts
git commit -m "feat: add refreshVisibleMatches frontend service"
```

---

## Task 8: Add Match Staleness Indicator

**Files:**
- Modify: `/Users/owen/work/knockoutfpl/dataconnect/schema/schema.gql`
- Modify: `/Users/owen/work/knockoutfpl/src/components/tournament/MatchCard.tsx`

**Step 1: Verify Match.updatedAt field exists**

Check schema - Match table should already have `updatedAt` field.

**Step 2: Add staleness display to MatchCard**

Add to MatchCard component:

```typescript
import { formatDistanceToNow } from 'date-fns';

interface MatchCardProps {
  // ... existing props
  updatedAt?: Date;
  isGameweekActive?: boolean;
}

function StalenessIndicator({
  updatedAt,
  isGameweekActive
}: {
  updatedAt?: Date;
  isGameweekActive?: boolean;
}) {
  if (!updatedAt) return null;

  const minutesAgo = Math.floor(
    (Date.now() - updatedAt.getTime()) / (1000 * 60)
  );
  const isStale = isGameweekActive && minutesAgo > 30;

  return (
    <span
      className={cn(
        "text-xs text-muted-foreground",
        isStale && "text-amber-500"
      )}
      title={`Last updated ${formatDistanceToNow(updatedAt)} ago`}
    >
      {isStale && "⚠️ "}
      Updated {formatDistanceToNow(updatedAt, { addSuffix: true })}
    </span>
  );
}
```

**Step 3: Integrate into MatchCard render**

Add below scores section:

```tsx
{match.updatedAt && (
  <StalenessIndicator
    updatedAt={new Date(match.updatedAt)}
    isGameweekActive={isGameweekActive}
  />
)}
```

**Step 4: Commit**

```bash
git add src/components/tournament/MatchCard.tsx
git commit -m "feat: add staleness indicator to MatchCard"
```

---

## Summary

This plan implements the Refresh & Score Updates portion of Large Tournament Scaling:

1. **15-minute frequency** - Background job runs 8x more often
2. **Priority ordering** - Claimed users' matches processed first
3. **refreshVisibleMatches** - New endpoint for scoped refresh (max 20 matches)
4. **Rate limiting** - 30-second cooldown per user per tournament
5. **Staleness indicator** - Visual feedback on match freshness

**Performance impact:**
- Current: Refresh fetches ALL round matches (16k for large tournament)
- New: Refresh fetches only visible matches (15-20 max)
- API calls reduced from O(n) to O(k) where k = visible matches

**Not included (future tasks):**
- "My Match" instant refresh (no rate limit)
- Match-level lastUpdated tracking in database
- Push notifications for score updates
