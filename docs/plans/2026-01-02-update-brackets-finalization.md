# Update Brackets Finalization Gate Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Modify `updateBrackets` to only process rounds when gameweek scores are truly final, using `Event.finalizedAt` and staleness checks.

**Architecture:** Add `updatedAt` to Round table for staleness tracking. Modify `updateBrackets` to gate on `Event.finalizedAt` instead of `Event.finished`. Only process rounds where `Round.updatedAt < Event.finalizedAt`.

**Tech Stack:** Firebase Cloud Functions, DataConnect (PostgreSQL)

**Depends on:** `2026-01-02-event-finalization-tracking.md` (Event.finalizedAt must exist)

---

## Current State

`updateBrackets.ts` currently:
1. Calls `fetchCurrentGameweek()` → gets `finished: boolean`
2. If `finished`, processes all active rounds for that gameweek
3. **Problem:** `finished` is set before bonus points are added and leagues updated

**What we need:**
1. Check `Event.finalizedAt` instead of `currentGW.finished`
2. Only process rounds where `Round.updatedAt < Event.finalizedAt`
3. Update `Round.updatedAt` after processing

---

## Task 1: Add `updatedAt` Column to Round Table

**Files:**
- Modify: `dataconnect/schema/schema.gql:138-151`

**Step 1: Add updatedAt to Round schema**

```graphql
# Tournament rounds
type Round @table(name: "rounds", key: ["tournamentId", "roundNumber"]) {
  tournamentId: UUID! @col(name: "tournament_id")
  roundNumber: Int! @col(name: "round_number")

  event: Int!  # FPL gameweek for this round
  status: String! @default(value: "pending")

  startedAt: Timestamp @col(name: "started_at")
  completedAt: Timestamp @col(name: "completed_at")
  updatedAt: Timestamp! @col(name: "updated_at") @default(expr: "request.time")  # NEW

  # Relations
  tournament: Tournament!
}
```

**Step 2: Verify schema compiles**

Run: `cd dataconnect && npm run build`
Expected: No errors

**Step 3: Commit**

```bash
git add dataconnect/schema/schema.gql
git commit -m "feat(schema): add updatedAt to Round table for staleness tracking"
```

---

## Task 2: Add Query for Finalized Event by Gameweek

**Files:**
- Modify: `dataconnect/connector/queries.gql`
- Modify: `functions/src/dataconnect-mutations.ts`

**Step 1: Add GraphQL query**

```graphql
# Get event finalization status for a specific gameweek
query GetEventFinalization($event: Int!, $season: String!) @auth(level: PUBLIC) {
  events(
    where: { event: { eq: $event }, season: { eq: $season } }
    limit: 1
  ) {
    event
    season
    finished
    finalizedAt
  }
}
```

**Step 2: Add TypeScript function**

```typescript
const GET_EVENT_FINALIZATION_QUERY = `
  query GetEventFinalization($event: Int!, $season: String!) {
    events(
      where: { event: { eq: $event }, season: { eq: $season } }
      limit: 1
    ) {
      event
      season
      finished
      finalizedAt
    }
  }
`;

export interface EventFinalization {
  event: number;
  season: string;
  finished: boolean;
  finalizedAt: string | null;
}

export async function getEventFinalization(
  event: number,
  season: string
): Promise<EventFinalization | null> {
  const result = await dataConnectAdmin.executeGraphql<{
    events: EventFinalization[];
  }>(GET_EVENT_FINALIZATION_QUERY, { variables: { event, season } });

  return result.data.events[0] ?? null;
}
```

**Step 3: Commit**

```bash
git add dataconnect/connector/queries.gql functions/src/dataconnect-mutations.ts
git commit -m "feat(queries): add GetEventFinalization query"
```

---

## Task 3: Add Mutation to Update Round.updatedAt

**Files:**
- Modify: `dataconnect/connector/mutations.gql`
- Modify: `functions/src/dataconnect-mutations.ts`

**Step 1: Add GraphQL mutation**

```graphql
# Update round's updatedAt timestamp
mutation UpdateRoundUpdatedAt(
  $tournamentId: UUID!
  $roundNumber: Int!
  $updatedAt: Timestamp!
) @auth(level: PUBLIC) {
  round_update(
    key: { tournamentId: $tournamentId, roundNumber: $roundNumber }
    data: { updatedAt: $updatedAt }
  )
}
```

**Step 2: Add TypeScript function**

```typescript
const UPDATE_ROUND_UPDATED_AT_MUTATION = `
  mutation UpdateRoundUpdatedAt(
    $tournamentId: UUID!
    $roundNumber: Int!
    $updatedAt: Timestamp!
  ) {
    round_update(
      key: { tournamentId: $tournamentId, roundNumber: $roundNumber }
      data: { updatedAt: $updatedAt }
    )
  }
`;

export async function updateRoundUpdatedAt(
  tournamentId: string,
  roundNumber: number,
  updatedAt: Date
): Promise<void> {
  await dataConnectAdmin.executeGraphql(
    UPDATE_ROUND_UPDATED_AT_MUTATION,
    { variables: { tournamentId, roundNumber, updatedAt: updatedAt.toISOString() } }
  );
}
```

**Step 3: Commit**

```bash
git add dataconnect/connector/mutations.gql functions/src/dataconnect-mutations.ts
git commit -m "feat(mutations): add UpdateRoundUpdatedAt mutation"
```

---

## Task 4: Update getPendingActiveRounds to Include updatedAt

**Files:**
- Modify: `dataconnect/connector/queries.gql`
- Modify: `functions/src/dataconnect-mutations.ts`

**Step 1: Find existing query and add updatedAt**

The existing `GetPendingActiveRounds` query needs to return `updatedAt`. Update it:

```graphql
query GetPendingActiveRounds($maxEvent: Int!) @auth(level: PUBLIC) {
  rounds(
    where: {
      status: { eq: "active" }
      event: { le: $maxEvent }
    }
  ) {
    tournamentId
    roundNumber
    event
    status
    updatedAt  # ADD THIS
    tournament {
      id
      fplLeagueId
      fplLeagueName
      totalRounds
      status
    }
  }
}
```

**Step 2: Update ActiveRound interface**

```typescript
export interface ActiveRound {
  tournamentId: string;
  roundNumber: number;
  event: number;
  status: string;
  updatedAt: string;  // ADD THIS
  tournament: {
    id: string;
    fplLeagueId: number;
    fplLeagueName: string;
    totalRounds: number;
    status: string;
  };
}
```

**Step 3: Commit**

```bash
git add dataconnect/connector/queries.gql functions/src/dataconnect-mutations.ts
git commit -m "feat(queries): add updatedAt to GetPendingActiveRounds"
```

---

## Task 5: Modify updateBrackets to Use Finalization Gate

**Files:**
- Modify: `functions/src/updateBrackets.ts`

**Step 1: Import new functions**

```typescript
import {
  getPendingActiveRounds,
  getRoundMatches,
  upsertPickAdmin,
  updateMatchWinner,
  updateRoundStatus,
  updateTournamentStatus,
  updateParticipantStatus,
  createMatchPickAdmin,
  getEventFinalization,      // NEW
  updateRoundUpdatedAt,      // NEW
  ActiveRound,
  RoundMatch,
  AuthClaims,
} from './dataconnect-mutations';
```

**Step 2: Replace the main function logic**

Replace the existing `updateBrackets` function with:

```typescript
const CURRENT_SEASON = '2024-25';

/**
 * Main scheduled function - runs every 2 hours
 * Only processes rounds when gameweek is truly finalized (bonus + leagues done)
 */
export const updateBrackets = onSchedule(
  {
    schedule: 'every 2 hours',
    timeZone: 'Europe/London',
    retryCount: 3,
  },
  async () => {
    console.log('[updateBrackets] Starting bracket update check...');

    try {
      // 1. Check current gameweek status (still needed to know max event)
      const currentGW = await fetchCurrentGameweek();

      if (!currentGW) {
        console.log('[updateBrackets] Could not fetch current gameweek');
        return;
      }

      console.log(`[updateBrackets] Current gameweek: ${currentGW.event}, finished: ${currentGW.finished}`);

      // 2. Determine max event to check
      const maxEvent = currentGW.finished ? currentGW.event : currentGW.event - 1;

      if (maxEvent < 1) {
        console.log('[updateBrackets] No finished gameweeks yet, skipping');
        return;
      }

      // 3. Find all active rounds up to maxEvent
      const pendingRounds = await getPendingActiveRounds(maxEvent);
      console.log(`[updateBrackets] Found ${pendingRounds.length} active rounds`);

      if (pendingRounds.length === 0) {
        console.log('[updateBrackets] No active rounds to process');
        return;
      }

      // 4. Group rounds by event for finalization check
      const roundsByEvent = new Map<number, ActiveRound[]>();
      for (const round of pendingRounds) {
        if (!roundsByEvent.has(round.event)) {
          roundsByEvent.set(round.event, []);
        }
        roundsByEvent.get(round.event)!.push(round);
      }

      // 5. Process each event's rounds (only if finalized)
      let totalRoundsProcessed = 0;

      for (const [event, rounds] of roundsByEvent) {
        // Check if this event is finalized
        const eventStatus = await getEventFinalization(event, CURRENT_SEASON);

        if (!eventStatus?.finalizedAt) {
          console.log(`[updateBrackets] GW${event} not finalized yet, skipping ${rounds.length} rounds`);
          continue;
        }

        const finalizedAt = new Date(eventStatus.finalizedAt);
        console.log(`[updateBrackets] GW${event} finalized at ${eventStatus.finalizedAt}`);

        // Process rounds that are stale (updatedAt < finalizedAt)
        for (const round of rounds) {
          const roundUpdatedAt = new Date(round.updatedAt);

          if (roundUpdatedAt >= finalizedAt) {
            console.log(`[updateBrackets] Round ${round.roundNumber} of ${round.tournamentId} already up-to-date, skipping`);
            continue;
          }

          console.log(`[updateBrackets] Round ${round.roundNumber} is stale (${round.updatedAt} < ${eventStatus.finalizedAt})`);

          try {
            await processRound(round, event);

            // Update round.updatedAt to mark as processed
            await updateRoundUpdatedAt(round.tournamentId, round.roundNumber, new Date());

            totalRoundsProcessed++;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`[updateBrackets] Error processing round ${round.roundNumber} of ${round.tournamentId}:`, error);

            await sendDiscordAlert(
              `🔴 updateBrackets error: Round ${round.roundNumber} of tournament ${round.tournamentId} (League: ${round.tournament.fplLeagueName} #${round.tournament.fplLeagueId}) failed: ${errorMessage}`,
              DISCORD_WEBHOOK_URL
            );
          }
        }
      }

      console.log(`[updateBrackets] Bracket update complete. Processed ${totalRoundsProcessed} rounds.`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[updateBrackets] Fatal error:', error);
      await sendDiscordAlert(
        `🔴 updateBrackets crashed: ${errorMessage}`,
        DISCORD_WEBHOOK_URL
      );
      throw error;
    }
  }
);
```

**Step 3: Remove the catch-up loop**

The previous implementation had a MAX_ITERATIONS loop. The new approach is simpler:
- Fetch all active rounds once
- Filter by finalization + staleness
- Process in a single pass

**Step 4: Verify build**

Run: `cd functions && npm run build`
Expected: No errors

**Step 5: Commit**

```bash
git add functions/src/updateBrackets.ts
git commit -m "feat(updateBrackets): gate on Event.finalizedAt + staleness check

Only process rounds when:
1. Event.finalizedAt is set (bonus + leagues complete)
2. Round.updatedAt < Event.finalizedAt (stale)

This ensures matches are only resolved with truly final scores."
```

---

## Task 6: Update Match.updatedAt on Resolution

**Files:**
- Modify: `functions/src/updateBrackets.ts`

**Step 1: Add mutation for Match.updatedAt**

In `dataconnect/connector/mutations.gql`:

```graphql
# Update match's updatedAt timestamp
mutation UpdateMatchUpdatedAt(
  $tournamentId: UUID!
  $matchId: Int!
  $updatedAt: Timestamp!
) @auth(level: PUBLIC) {
  match_update(
    key: { tournamentId: $tournamentId, matchId: $matchId }
    data: { updatedAt: $updatedAt }
  )
}
```

**Step 2: Add TypeScript function**

```typescript
const UPDATE_MATCH_UPDATED_AT_MUTATION = `
  mutation UpdateMatchUpdatedAt(
    $tournamentId: UUID!
    $matchId: Int!
    $updatedAt: Timestamp!
  ) {
    match_update(
      key: { tournamentId: $tournamentId, matchId: $matchId }
      data: { updatedAt: $updatedAt }
    )
  }
`;

export async function updateMatchUpdatedAt(
  tournamentId: string,
  matchId: number,
  updatedAt: Date
): Promise<void> {
  await dataConnectAdmin.executeGraphql(
    UPDATE_MATCH_UPDATED_AT_MUTATION,
    { variables: { tournamentId, matchId, updatedAt: updatedAt.toISOString() } }
  );
}
```

**Step 3: Update processRound to set Match.updatedAt**

In `processRound()`, after updating match winner, also update `updatedAt`:

```typescript
// Update match with winner
await updateMatchWinner(round.tournamentId, match.matchId, result.winnerId);

// Mark match as updated with final scores
await updateMatchUpdatedAt(round.tournamentId, match.matchId, new Date());
```

**Step 4: Commit**

```bash
git add dataconnect/connector/mutations.gql functions/src/dataconnect-mutations.ts functions/src/updateBrackets.ts
git commit -m "feat(matches): update Match.updatedAt when resolved"
```

---

## Task 7: Update Tournament.updatedAt on Completion

**Files:**
- Modify: `functions/src/updateBrackets.ts`

**Step 1: Verify updateTournamentStatus sets updatedAt**

Check if `updateTournamentStatus` already sets `updatedAt`. If not, add it:

```graphql
mutation UpdateTournamentStatus(
  $tournamentId: UUID!
  $status: String!
  $winnerEntryId: Int
  $updatedAt: Timestamp!
) @auth(level: PUBLIC) {
  tournament_update(
    id: $tournamentId
    data: {
      status: $status
      winnerEntryId: $winnerEntryId
      updatedAt: $updatedAt
    }
  )
}
```

**Step 2: Update call site**

```typescript
await updateTournamentStatus(round.tournamentId, 'completed', finalResult.winnerId, new Date());
```

**Step 3: Commit**

```bash
git add dataconnect/connector/mutations.gql functions/src/dataconnect-mutations.ts functions/src/updateBrackets.ts
git commit -m "feat(tournaments): update Tournament.updatedAt on status change"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Add `updatedAt` to Round schema | `schema.gql` |
| 2 | Add GetEventFinalization query | `queries.gql`, `dataconnect-mutations.ts` |
| 3 | Add UpdateRoundUpdatedAt mutation | `mutations.gql`, `dataconnect-mutations.ts` |
| 4 | Update GetPendingActiveRounds to include updatedAt | `queries.gql`, `dataconnect-mutations.ts` |
| 5 | Modify updateBrackets to use finalization gate | `updateBrackets.ts` |
| 6 | Update Match.updatedAt on resolution | `mutations.gql`, `updateBrackets.ts` |
| 7 | Update Tournament.updatedAt on completion | `mutations.gql`, `updateBrackets.ts` |

**Total commits:** 7

---

## Flow Diagram

```
checkEventStatus (every 15 mins)
    │
    └── Sets Event.finalizedAt when /event-status/ confirms ready
            │
            ▼
updateBrackets (every 2 hours)
    │
    ├── Fetch active rounds
    │
    ├── For each event:
    │     ├── Check Event.finalizedAt exists?
    │     │     └── No → Skip all rounds for this event
    │     │
    │     └── Yes → For each round:
    │           ├── Round.updatedAt >= Event.finalizedAt?
    │           │     └── Yes → Skip (already processed)
    │           │
    │           └── No → Process round:
    │                 ├── Fetch scores
    │                 ├── Resolve matches, set Match.updatedAt
    │                 ├── Advance winners
    │                 └── Set Round.updatedAt = now
    │
    └── Done
```
