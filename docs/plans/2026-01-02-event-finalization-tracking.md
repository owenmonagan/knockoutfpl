# Event Finalization Tracking Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add `finalizedAt` column to Event table and create scheduled function to detect when FPL scores are truly final.

**Architecture:** Extend the existing Event table with a `finalizedAt` timestamp. Create a new scheduled Cloud Function `checkEventStatus` that polls the FPL `/event-status/` endpoint to detect when all bonus points are added and leagues are updated. This enables the email system to know when it's safe to send verdict emails.

**Tech Stack:** Firebase Cloud Functions (v2 scheduler), DataConnect (PostgreSQL), FPL API

---

## Background

The FPL API has two ways to check gameweek completion:

1. **`/bootstrap-static/`** → `event.finished: true` (gameweek over, but bonus may still be processing)
2. **`/event-status/`** → Granular status showing `bonus_added`, `points: "r"`, and `leagues: "Updated"`

We currently only use #1. This plan adds support for #2 to know when scores are truly final.

**Example `/event-status/` response:**
```json
{
  "status": [
    { "bonus_added": true, "date": "2025-12-30", "event": 19, "points": "r" },
    { "bonus_added": true, "date": "2026-01-01", "event": 19, "points": "r" }
  ],
  "leagues": "Updated"
}
```

Scores are final when: ALL days have `bonus_added: true` AND `points: "r"` AND `leagues: "Updated"`.

---

## Task 1: Add `finalizedAt` Column to Event Schema

**Files:**
- Modify: `dataconnect/schema/schema.gql:90-106`

**Step 1: Add the finalizedAt column**

Edit the Event table definition to add the new column:

```graphql
# Cached FPL event/gameweek data
type Event @table(name: "events", key: ["event", "season"]) {
  event: Int!
  season: String!

  # Extracted fields (commonly queried)
  name: String!
  deadlineTime: Timestamp! @col(name: "deadline_time")
  finished: Boolean! @default(value: false)
  finalizedAt: Timestamp @col(name: "finalized_at")  # NEW: When bonus+leagues complete
  isCurrent: Boolean! @col(name: "is_current") @default(value: false)
  isNext: Boolean! @col(name: "is_next") @default(value: false)

  # Raw API response (complete data, future-proof)
  rawJson: String! @col(name: "raw_json")

  cachedAt: Timestamp! @col(name: "cached_at") @default(expr: "request.time")
}
```

**Step 2: Verify schema compiles**

Run: `cd dataconnect && npm run build`
Expected: No errors

**Step 3: Commit**

```bash
git add dataconnect/schema/schema.gql
git commit -m "feat(schema): add finalizedAt column to Event table

Tracks when FPL bonus points and league tables are fully updated,
enabling accurate detection of when scores are truly final."
```

---

## Task 2: Update UpsertEvent Mutation

**Files:**
- Modify: `dataconnect/connector/mutations.gql:122-148`
- Modify: `functions/src/dataconnect-mutations.ts:78-98`

**Step 1: Update GraphQL mutation**

Add `finalizedAt` parameter to the UpsertEvent mutation:

```graphql
mutation UpsertEvent(
  $event: Int!
  $season: String!
  $name: String!
  $deadlineTime: Timestamp!
  $finished: Boolean!
  $finalizedAt: Timestamp  # NEW - optional
  $isCurrent: Boolean!
  $isNext: Boolean!
  $rawJson: String!
) @auth(level: PUBLIC) {
  event_upsert(
    data: {
      event: $event
      season: $season
      name: $name
      deadlineTime: $deadlineTime
      finished: $finished
      finalizedAt: $finalizedAt
      isCurrent: $isCurrent
      isNext: $isNext
      rawJson: $rawJson
    }
  )
}
```

**Step 2: Update TypeScript mutation string**

In `functions/src/dataconnect-mutations.ts`, update `UPSERT_EVENT_MUTATION`:

```typescript
const UPSERT_EVENT_MUTATION = `
  mutation UpsertEvent(
    $event: Int!
    $season: String!
    $name: String!
    $deadlineTime: Timestamp!
    $finished: Boolean!
    $finalizedAt: Timestamp
    $isCurrent: Boolean!
    $isNext: Boolean!
    $rawJson: String!
  ) {
    event_upsert(
      data: {
        event: $event
        season: $season
        name: $name
        deadlineTime: $deadlineTime
        finished: $finished
        finalizedAt: $finalizedAt
        isCurrent: $isCurrent
        isNext: $isNext
        rawJson: $rawJson
      }
    )
  }
`;
```

**Step 3: Update UpsertEventInput type**

Find the `UpsertEventInput` interface and add `finalizedAt`:

```typescript
export interface UpsertEventInput {
  event: number;
  season: string;
  name: string;
  deadlineTime: string;
  finished: boolean;
  finalizedAt?: string;  // NEW - ISO timestamp or undefined
  isCurrent: boolean;
  isNext: boolean;
  rawJson: string;
}
```

**Step 4: Verify build**

Run: `cd functions && npm run build`
Expected: No errors

**Step 5: Commit**

```bash
git add dataconnect/connector/mutations.gql functions/src/dataconnect-mutations.ts
git commit -m "feat(mutations): add finalizedAt to UpsertEvent mutation"
```

---

## Task 3: Add Query for Events Needing Finalization

**Files:**
- Modify: `dataconnect/connector/queries.gql`
- Modify: `functions/src/dataconnect-mutations.ts`

**Step 1: Add GraphQL query**

Add a query to find events that are finished but not yet finalized:

```graphql
# Get events that are finished but not yet finalized (need to check /event-status/)
query GetEventsNeedingFinalization($season: String!) @auth(level: PUBLIC) {
  events(
    where: {
      season: { eq: $season }
      finished: { eq: true }
      finalizedAt: { isNull: true }
    }
  ) {
    event
    season
    name
    finished
    finalizedAt
  }
}
```

**Step 2: Add TypeScript query function**

In `functions/src/dataconnect-mutations.ts`, add:

```typescript
const GET_EVENTS_NEEDING_FINALIZATION_QUERY = `
  query GetEventsNeedingFinalization($season: String!) {
    events(
      where: {
        season: { eq: $season }
        finished: { eq: true }
        finalizedAt: { isNull: true }
      }
    ) {
      event
      season
      name
      finished
      finalizedAt
    }
  }
`;

export interface EventNeedingFinalization {
  event: number;
  season: string;
  name: string;
  finished: boolean;
  finalizedAt: string | null;
}

export async function getEventsNeedingFinalization(
  season: string
): Promise<EventNeedingFinalization[]> {
  const result = await dataConnectAdmin.executeGraphql<{
    events: EventNeedingFinalization[];
  }>(GET_EVENTS_NEEDING_FINALIZATION_QUERY, { variables: { season } });

  return result.data.events;
}
```

**Step 3: Verify build**

Run: `cd functions && npm run build`
Expected: No errors

**Step 4: Commit**

```bash
git add dataconnect/connector/queries.gql functions/src/dataconnect-mutations.ts
git commit -m "feat(queries): add GetEventsNeedingFinalization query"
```

---

## Task 4: Add FPL Event Status Fetcher

**Files:**
- Modify: `functions/src/fpl-scores.ts`

**Step 1: Add types for event-status response**

```typescript
/**
 * FPL event-status endpoint types
 * Endpoint: /api/event-status/
 */
export interface EventStatusDay {
  bonus_added: boolean;
  date: string;
  event: number;
  points: string;  // "r" = ready/resolved
}

export interface EventStatusResponse {
  status: EventStatusDay[];
  leagues: string;  // "Updating" | "Updated"
}

export interface EventFinalizationStatus {
  event: number;
  isFinalized: boolean;
  allBonusAdded: boolean;
  allPointsReady: boolean;
  leaguesUpdated: boolean;
}
```

**Step 2: Add fetch function**

```typescript
/**
 * Fetch event status to check if scores are truly final
 *
 * Scores are final when:
 * - All days have bonus_added: true
 * - All days have points: "r" (ready)
 * - leagues: "Updated"
 */
export async function fetchEventStatus(): Promise<EventFinalizationStatus | null> {
  try {
    const url = `${FPL_API_BASE}/event-status/`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`FPL API event-status error: ${response.status}`);
      return null;
    }

    const data = await response.json() as EventStatusResponse;

    if (!data.status || data.status.length === 0) {
      return null;
    }

    const allBonusAdded = data.status.every(day => day.bonus_added);
    const allPointsReady = data.status.every(day => day.points === 'r');
    const leaguesUpdated = data.leagues === 'Updated';

    return {
      event: data.status[0].event,
      isFinalized: allBonusAdded && allPointsReady && leaguesUpdated,
      allBonusAdded,
      allPointsReady,
      leaguesUpdated,
    };
  } catch (error) {
    console.error('Failed to fetch event status:', error);
    return null;
  }
}
```

**Step 3: Write test**

Create `functions/src/__tests__/fpl-scores.test.ts` (or add to existing):

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Import after mocking
import { fetchEventStatus } from '../fpl-scores';

describe('fetchEventStatus', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('returns finalized when all conditions met', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: [
          { bonus_added: true, date: '2025-12-30', event: 19, points: 'r' },
          { bonus_added: true, date: '2026-01-01', event: 19, points: 'r' },
        ],
        leagues: 'Updated',
      }),
    });

    const result = await fetchEventStatus();

    expect(result).toEqual({
      event: 19,
      isFinalized: true,
      allBonusAdded: true,
      allPointsReady: true,
      leaguesUpdated: true,
    });
  });

  it('returns not finalized when leagues still updating', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: [
          { bonus_added: true, date: '2025-12-30', event: 19, points: 'r' },
        ],
        leagues: 'Updating',
      }),
    });

    const result = await fetchEventStatus();

    expect(result?.isFinalized).toBe(false);
    expect(result?.leaguesUpdated).toBe(false);
  });

  it('returns not finalized when bonus not added', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: [
          { bonus_added: false, date: '2025-12-30', event: 19, points: 'r' },
        ],
        leagues: 'Updated',
      }),
    });

    const result = await fetchEventStatus();

    expect(result?.isFinalized).toBe(false);
    expect(result?.allBonusAdded).toBe(false);
  });

  it('returns null on API error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    const result = await fetchEventStatus();

    expect(result).toBeNull();
  });
});
```

**Step 4: Run test**

Run: `cd functions && npm test -- fpl-scores.test.ts`
Expected: All tests pass

**Step 5: Commit**

```bash
git add functions/src/fpl-scores.ts functions/src/__tests__/fpl-scores.test.ts
git commit -m "feat(fpl): add fetchEventStatus for finalization detection

Polls /event-status/ endpoint to check if bonus points are added
and leagues are updated before considering scores final."
```

---

## Task 5: Create checkEventStatus Scheduled Function

**Files:**
- Create: `functions/src/checkEventStatus.ts`
- Modify: `functions/src/index.ts`

**Step 1: Create the scheduled function**

```typescript
/**
 * Check Event Status Scheduled Function
 *
 * Runs every 15 minutes to:
 * 1. Find events that are finished but not finalized
 * 2. Poll FPL /event-status/ endpoint
 * 3. Set finalizedAt when scores are truly final
 */

import { onSchedule } from 'firebase-functions/v2/scheduler';
import { fetchEventStatus } from './fpl-scores';
import {
  getEventsNeedingFinalization,
  upsertEventAdmin,
} from './dataconnect-mutations';
import { sendDiscordAlert } from './discord';

const CURRENT_SEASON = '2024-25';

export const checkEventStatus = onSchedule(
  {
    schedule: 'every 15 minutes',
    timeZone: 'Europe/London',
    retryCount: 3,
  },
  async () => {
    console.log('[checkEventStatus] Starting event status check...');

    // 1. Find events that need finalization check
    const pendingEvents = await getEventsNeedingFinalization(CURRENT_SEASON);

    if (pendingEvents.length === 0) {
      console.log('[checkEventStatus] No events pending finalization');
      return;
    }

    console.log(`[checkEventStatus] Found ${pendingEvents.length} events pending finalization`);

    // 2. Fetch current event status from FPL
    const status = await fetchEventStatus();

    if (!status) {
      console.error('[checkEventStatus] Failed to fetch event status from FPL');
      return;
    }

    console.log(`[checkEventStatus] Event ${status.event} status:`, {
      isFinalized: status.isFinalized,
      allBonusAdded: status.allBonusAdded,
      allPointsReady: status.allPointsReady,
      leaguesUpdated: status.leaguesUpdated,
    });

    // 3. If finalized, update the event
    if (status.isFinalized) {
      const matchingEvent = pendingEvents.find(e => e.event === status.event);

      if (matchingEvent) {
        const now = new Date().toISOString();

        await upsertEventAdmin({
          event: matchingEvent.event,
          season: matchingEvent.season,
          name: matchingEvent.name,
          deadlineTime: now, // Will be overwritten by existing value
          finished: true,
          finalizedAt: now,
          isCurrent: false,
          isNext: false,
          rawJson: JSON.stringify({ finalizedAt: now }),
        });

        console.log(`[checkEventStatus] Marked GW${status.event} as finalized at ${now}`);

        // Send Discord notification
        await sendDiscordAlert({
          title: `GW${status.event} Finalized`,
          description: 'Bonus points added and leagues updated. Scores are now final.',
          color: 0x00ff00, // Green
        });
      }
    } else {
      console.log(`[checkEventStatus] GW${status.event} not yet finalized, will check again`);
    }
  }
);
```

**Step 2: Export from index.ts**

Add to `functions/src/index.ts`:

```typescript
export { checkEventStatus } from './checkEventStatus';
```

**Step 3: Verify build**

Run: `cd functions && npm run build`
Expected: No errors

**Step 4: Commit**

```bash
git add functions/src/checkEventStatus.ts functions/src/index.ts
git commit -m "feat(functions): add checkEventStatus scheduled function

Runs every 15 minutes to detect when FPL scores are truly final
by polling /event-status/ and setting Event.finalizedAt."
```

---

## Task 6: Update refreshTournament to Preserve finalizedAt

**Files:**
- Modify: `functions/src/refreshTournament.ts:252-268`

**Step 1: Update the upsertEventAdmin call**

The current code overwrites the event on every refresh. We need to preserve `finalizedAt` if it was already set. Update the upsert call:

```typescript
// 2a. Store current event in database (so frontend can get accurate current gameweek)
try {
  // Note: We don't set finalizedAt here - that's handled by checkEventStatus
  // which polls /event-status/ for accurate finalization detection
  await upsertEventAdmin({
    event: gwStatus.event,
    season: '2024-25',
    name: gwStatus.name,
    deadlineTime: gwStatus.deadlineTime,
    finished: gwStatus.finished,
    // finalizedAt intentionally omitted - preserves existing value
    isCurrent: gwStatus.isCurrent,
    isNext: gwStatus.isNext,
    rawJson: JSON.stringify(gwStatus),
  });
  logInfo('event_upserted', { event: gwStatus.event, name: gwStatus.name });
} catch (error) {
  // Log but don't fail - this is a best-effort update
  logWarn('event_upsert_failed', String(error), { event: gwStatus.event });
}
```

**Note:** Since `finalizedAt` is optional and we're not passing it, the upsert should preserve the existing value. Verify this behavior in DataConnect - if it clears the field, we may need to fetch the current value first.

**Step 2: Verify build**

Run: `cd functions && npm run build`
Expected: No errors

**Step 3: Commit**

```bash
git add functions/src/refreshTournament.ts
git commit -m "fix(refresh): don't overwrite finalizedAt on tournament refresh

finalizedAt is set by checkEventStatus, not refreshTournament."
```

---

## Task 7: Add Query for Finalized Events

**Files:**
- Modify: `dataconnect/connector/queries.gql`
- Modify: `functions/src/dataconnect-mutations.ts`

**Step 1: Add GraphQL query**

```graphql
# Get events that have been finalized (scores are final)
query GetFinalizedEvents($season: String!) @auth(level: PUBLIC) {
  events(
    where: {
      season: { eq: $season }
      finalizedAt: { isNull: false }
    }
    orderBy: { event: DESC }
  ) {
    event
    season
    name
    finished
    finalizedAt
  }
}
```

**Step 2: Add TypeScript function**

```typescript
const GET_FINALIZED_EVENTS_QUERY = `
  query GetFinalizedEvents($season: String!) {
    events(
      where: {
        season: { eq: $season }
        finalizedAt: { isNull: false }
      }
      orderBy: { event: DESC }
    ) {
      event
      season
      name
      finished
      finalizedAt
    }
  }
`;

export interface FinalizedEvent {
  event: number;
  season: string;
  name: string;
  finished: boolean;
  finalizedAt: string;
}

export async function getFinalizedEvents(
  season: string
): Promise<FinalizedEvent[]> {
  const result = await dataConnectAdmin.executeGraphql<{
    events: FinalizedEvent[];
  }>(GET_FINALIZED_EVENTS_QUERY, { variables: { season } });

  return result.data.events;
}
```

**Step 3: Commit**

```bash
git add dataconnect/connector/queries.gql functions/src/dataconnect-mutations.ts
git commit -m "feat(queries): add GetFinalizedEvents query"
```

---

## Task 8: Manual Testing

**Step 1: Deploy to dev environment**

```bash
firebase deploy --only functions:checkEventStatus
```

**Step 2: Trigger manually**

Use Firebase console or CLI to trigger the function:

```bash
firebase functions:shell
> checkEventStatus()
```

**Step 3: Verify in database**

Check that `finalizedAt` is set for completed gameweeks:

```sql
SELECT event, finished, finalized_at
FROM events
WHERE season = '2024-25'
ORDER BY event DESC;
```

**Step 4: Monitor logs**

```bash
firebase functions:log --only checkEventStatus
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Add `finalizedAt` column to schema | `schema.gql` |
| 2 | Update UpsertEvent mutation | `mutations.gql`, `dataconnect-mutations.ts` |
| 3 | Add GetEventsNeedingFinalization query | `queries.gql`, `dataconnect-mutations.ts` |
| 4 | Add fetchEventStatus function | `fpl-scores.ts` |
| 5 | Create checkEventStatus scheduled function | `checkEventStatus.ts`, `index.ts` |
| 6 | Update refreshTournament to preserve finalizedAt | `refreshTournament.ts` |
| 7 | Add GetFinalizedEvents query | `queries.gql`, `dataconnect-mutations.ts` |
| 8 | Manual testing | - |

**Total commits:** 7
