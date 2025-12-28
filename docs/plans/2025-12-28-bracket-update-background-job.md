# Bracket Update Background Job Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a scheduled Cloud Function that fetches FPL scores when gameweeks complete, resolves matches, advances winners, and progresses tournaments to completion.

**Architecture:** A scheduled function runs every 2 hours, finds active rounds where the gameweek is complete, fetches final scores from FPL API, determines match winners (with tiebreaker by seed), creates match_picks for advancing winners, and marks tournaments complete when the final is decided.

**Tech Stack:** TypeScript, Firebase Cloud Functions (scheduled), FPL API, Data Connect GraphQL mutations

---

## Context

**Data Flow Reference:** `docs/business/technical/data/data-flow.md` - "Score Fetch & Round Resolution" section

**What exists:**
- Tournament creation with placeholder picks (picks have `isFinal: false`)
- Round 1 match_picks created at tournament creation
- Matches created with `qualifiesToMatchId` linking to next round

**What this implements:**
- Step 5 from the Required Data Flow: "Update Bracket"
- Scheduled function to process completed gameweeks
- Score fetching and pick record updates
- Match resolution with winner determination
- Winner advancement to next round

**Key Files:**
- Create: `functions/src/updateBrackets.ts`
- Modify: `functions/src/dataconnect-mutations.ts` (add query functions)
- Modify: `functions/src/index.ts` (export new function)

---

## Task 1: Add Query Functions for Active Rounds

**Files:**
- Modify: `functions/src/dataconnect-mutations.ts`

**Step 1: Add GET_ACTIVE_ROUNDS query constant**

Add after the mutation constants (around line 150):

```typescript
const GET_ACTIVE_ROUNDS_QUERY = `
  query GetActiveRounds($event: Int!) {
    rounds(where: { event: { eq: $event }, status: { eq: "active" } }) {
      tournamentId
      roundNumber
      event
      status
      tournament {
        id
        status
        totalRounds
      }
    }
  }
`;
```

**Step 2: Add GET_ROUND_MATCHES query constant**

```typescript
const GET_ROUND_MATCHES_QUERY = `
  query GetRoundMatches($tournamentId: UUID!, $roundNumber: Int!) {
    matches(
      where: {
        tournamentId: { eq: $tournamentId }
        roundNumber: { eq: $roundNumber }
        status: { eq: "active" }
      }
    ) {
      tournamentId
      matchId
      roundNumber
      positionInRound
      qualifiesToMatchId
      isBye
      status
      matchPicks {
        entryId
        slot
        participant {
          seed
        }
      }
    }
  }
`;
```

**Step 3: Add GET_CURRENT_EVENT query constant**

```typescript
const GET_CURRENT_EVENT_QUERY = `
  query GetCurrentEvent($season: String!) {
    events(where: { season: { eq: $season }, isCurrent: { eq: true } }) {
      event
      season
      finished
      isCurrent
    }
  }
`;
```

**Step 4: Add ActiveRound interface**

Add after existing interfaces:

```typescript
export interface ActiveRound {
  tournamentId: string;
  roundNumber: number;
  event: number;
  status: string;
  tournament: {
    id: string;
    status: string;
    totalRounds: number;
  };
}

export interface RoundMatch {
  tournamentId: string;
  matchId: number;
  roundNumber: number;
  positionInRound: number;
  qualifiesToMatchId: number | null;
  isBye: boolean;
  status: string;
  matchPicks: Array<{
    entryId: number;
    slot: number;
    participant: {
      seed: number;
    };
  }>;
}

export interface CurrentEvent {
  event: number;
  season: string;
  finished: boolean;
  isCurrent: boolean;
}
```

**Step 5: Add query functions**

```typescript
export async function getActiveRoundsForEvent(event: number): Promise<ActiveRound[]> {
  const result = await dataConnectAdmin.executeGraphql<{ rounds: ActiveRound[] }>(
    GET_ACTIVE_ROUNDS_QUERY,
    { variables: { event } }
  );
  return result.data.rounds;
}

export async function getRoundMatches(tournamentId: string, roundNumber: number): Promise<RoundMatch[]> {
  const result = await dataConnectAdmin.executeGraphql<{ matches: RoundMatch[] }>(
    GET_ROUND_MATCHES_QUERY,
    { variables: { tournamentId, roundNumber } }
  );
  return result.data.matches;
}

export async function getCurrentEvent(season: string): Promise<CurrentEvent | null> {
  const result = await dataConnectAdmin.executeGraphql<{ events: CurrentEvent[] }>(
    GET_CURRENT_EVENT_QUERY,
    { variables: { season } }
  );
  return result.data.events[0] || null;
}
```

**Step 6: Verify TypeScript compiles**

Run: `cd functions && npm run build`
Expected: No TypeScript errors

**Step 7: Commit**

```bash
git add functions/src/dataconnect-mutations.ts
git commit -m "$(cat <<'EOF'
feat(functions): add query functions for bracket updates

Adds GraphQL queries to fetch:
- Active rounds for a given gameweek
- Matches in a round with their match_picks
- Current event status

These are needed for the scheduled bracket update function.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Add Update Mutations

**Files:**
- Modify: `functions/src/dataconnect-mutations.ts`

**Step 1: Add UPDATE_MATCH_WINNER mutation**

```typescript
const UPDATE_MATCH_WINNER_MUTATION = `
  mutation UpdateMatchWinner(
    $tournamentId: UUID!
    $matchId: Int!
    $winnerEntryId: Int!
    $status: String!
  ) {
    match_update(
      tournamentId: $tournamentId
      matchId: $matchId
      data: {
        winnerEntryId: $winnerEntryId
        status: $status
      }
    )
  }
`;
```

**Step 2: Add UPDATE_ROUND_STATUS mutation**

```typescript
const UPDATE_ROUND_STATUS_MUTATION = `
  mutation UpdateRoundStatus(
    $tournamentId: UUID!
    $roundNumber: Int!
    $status: String!
  ) {
    round_update(
      tournamentId: $tournamentId
      roundNumber: $roundNumber
      data: {
        status: $status
      }
    )
  }
`;
```

**Step 3: Add UPDATE_TOURNAMENT_STATUS mutation**

```typescript
const UPDATE_TOURNAMENT_STATUS_MUTATION = `
  mutation UpdateTournamentStatus(
    $id: UUID!
    $status: String!
    $winnerEntryId: Int
  ) {
    tournament_update(
      id: $id
      data: {
        status: $status
        winnerEntryId: $winnerEntryId
      }
    )
  }
`;
```

**Step 4: Add UPDATE_PARTICIPANT_STATUS mutation**

```typescript
const UPDATE_PARTICIPANT_STATUS_MUTATION = `
  mutation UpdateParticipantStatus(
    $tournamentId: UUID!
    $entryId: Int!
    $status: String!
    $eliminationRound: Int
  ) {
    participant_update(
      tournamentId: $tournamentId
      entryId: $entryId
      data: {
        status: $status
        eliminationRound: $eliminationRound
      }
    )
  }
`;
```

**Step 5: Add mutation function implementations**

```typescript
export async function updateMatchWinner(
  tournamentId: string,
  matchId: number,
  winnerEntryId: number
): Promise<void> {
  await dataConnectAdmin.executeGraphql(
    UPDATE_MATCH_WINNER_MUTATION,
    { variables: { tournamentId, matchId, winnerEntryId, status: 'complete' } }
  );
}

export async function updateRoundStatus(
  tournamentId: string,
  roundNumber: number,
  status: string
): Promise<void> {
  await dataConnectAdmin.executeGraphql(
    UPDATE_ROUND_STATUS_MUTATION,
    { variables: { tournamentId, roundNumber, status } }
  );
}

export async function updateTournamentStatus(
  tournamentId: string,
  status: string,
  winnerEntryId?: number
): Promise<void> {
  await dataConnectAdmin.executeGraphql(
    UPDATE_TOURNAMENT_STATUS_MUTATION,
    { variables: { id: tournamentId, status, winnerEntryId } }
  );
}

export async function updateParticipantStatus(
  tournamentId: string,
  entryId: number,
  status: string,
  eliminationRound?: number
): Promise<void> {
  await dataConnectAdmin.executeGraphql(
    UPDATE_PARTICIPANT_STATUS_MUTATION,
    { variables: { tournamentId, entryId, status, eliminationRound } }
  );
}
```

**Step 6: Verify TypeScript compiles**

Run: `cd functions && npm run build`
Expected: No TypeScript errors

**Step 7: Commit**

```bash
git add functions/src/dataconnect-mutations.ts
git commit -m "$(cat <<'EOF'
feat(functions): add update mutations for bracket progression

Adds GraphQL mutations to update:
- Match winners and status
- Round status
- Tournament status and winner
- Participant elimination status

These are needed for the scheduled bracket update function.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Create FPL Score Fetcher

**Files:**
- Create: `functions/src/fpl-scores.ts`

**Step 1: Create the file with score fetching logic**

```typescript
/**
 * FPL Score Fetching
 *
 * Fetches final gameweek scores from the FPL API.
 */

import fetch from 'node-fetch';

const FPL_API_BASE = 'https://fantasy.premierleague.com/api';

export interface FPLPicksResponse {
  active_chip: string | null;
  entry_history: {
    event: number;
    points: number;
    total_points: number;
    rank: number;
    overall_rank: number;
    bank: number;
    value: number;
    event_transfers: number;
    event_transfers_cost: number;
    points_on_bench: number;
  };
  picks: Array<{
    element: number;
    position: number;
    multiplier: number;
    is_captain: boolean;
    is_vice_captain: boolean;
  }>;
}

export interface FPLBootstrapResponse {
  events: Array<{
    id: number;
    name: string;
    deadline_time: string;
    finished: boolean;
    is_current: boolean;
    is_next: boolean;
  }>;
}

/**
 * Fetch picks/score for an entry in a specific gameweek
 */
export async function fetchEntryPicks(
  entryId: number,
  event: number
): Promise<FPLPicksResponse | null> {
  try {
    const url = `${FPL_API_BASE}/entry/${entryId}/event/${event}/picks/`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`FPL API error for entry ${entryId} event ${event}: ${response.status}`);
      return null;
    }

    return await response.json() as FPLPicksResponse;
  } catch (error) {
    console.error(`Failed to fetch picks for entry ${entryId} event ${event}:`, error);
    return null;
  }
}

/**
 * Fetch current gameweek status from bootstrap-static
 */
export async function fetchCurrentGameweek(): Promise<{
  event: number;
  finished: boolean;
} | null> {
  try {
    const url = `${FPL_API_BASE}/bootstrap-static/`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`FPL API bootstrap error: ${response.status}`);
      return null;
    }

    const data = await response.json() as FPLBootstrapResponse;
    const currentEvent = data.events.find(e => e.is_current);

    if (!currentEvent) {
      return null;
    }

    return {
      event: currentEvent.id,
      finished: currentEvent.finished,
    };
  } catch (error) {
    console.error('Failed to fetch current gameweek:', error);
    return null;
  }
}

/**
 * Batch fetch scores for multiple entries
 */
export async function fetchScoresForEntries(
  entryIds: number[],
  event: number
): Promise<Map<number, FPLPicksResponse>> {
  const results = new Map<number, FPLPicksResponse>();

  // Fetch in parallel with rate limiting (max 10 concurrent)
  const batchSize = 10;
  for (let i = 0; i < entryIds.length; i += batchSize) {
    const batch = entryIds.slice(i, i + batchSize);
    const promises = batch.map(async (entryId) => {
      const picks = await fetchEntryPicks(entryId, event);
      if (picks) {
        results.set(entryId, picks);
      }
    });
    await Promise.all(promises);

    // Small delay between batches to be nice to FPL API
    if (i + batchSize < entryIds.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
}
```

**Step 2: Verify TypeScript compiles**

Run: `cd functions && npm run build`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add functions/src/fpl-scores.ts
git commit -m "$(cat <<'EOF'
feat(functions): add FPL score fetching module

Adds functions to fetch gameweek scores from FPL API:
- fetchEntryPicks: Get picks/score for one entry
- fetchCurrentGameweek: Get current GW status
- fetchScoresForEntries: Batch fetch with rate limiting

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Create Match Resolution Logic

**Files:**
- Create: `functions/src/match-resolver.ts`

**Step 1: Create the file with match resolution logic**

```typescript
/**
 * Match Resolution Logic
 *
 * Determines winners based on points with seed tiebreaker.
 */

import { RoundMatch } from './dataconnect-mutations';

export interface MatchResult {
  matchId: number;
  winnerId: number;
  loserId: number | null;
  winnerSlot: number;
  winnerScore: number;
  loserScore: number | null;
  decidedByTiebreaker: boolean;
}

export interface PlayerScore {
  entryId: number;
  slot: number;
  seed: number;
  points: number;
}

/**
 * Resolve a single match given the scores
 */
export function resolveMatch(
  match: RoundMatch,
  scores: Map<number, number>
): MatchResult | null {
  const picks = match.matchPicks;

  // Handle bye matches (already resolved at creation)
  if (match.isBye || picks.length === 1) {
    const player = picks[0];
    return {
      matchId: match.matchId,
      winnerId: player.entryId,
      loserId: null,
      winnerSlot: player.slot,
      winnerScore: scores.get(player.entryId) ?? 0,
      loserScore: null,
      decidedByTiebreaker: false,
    };
  }

  // Need exactly 2 players for a real match
  if (picks.length !== 2) {
    console.error(`Match ${match.matchId} has ${picks.length} players, expected 2`);
    return null;
  }

  // Get player scores
  const players: PlayerScore[] = picks.map(pick => ({
    entryId: pick.entryId,
    slot: pick.slot,
    seed: pick.participant.seed,
    points: scores.get(pick.entryId) ?? 0,
  }));

  const [player1, player2] = players;

  let winner: PlayerScore;
  let loser: PlayerScore;
  let decidedByTiebreaker = false;

  if (player1.points > player2.points) {
    winner = player1;
    loser = player2;
  } else if (player2.points > player1.points) {
    winner = player2;
    loser = player1;
  } else {
    // Tie - lower seed wins (seed 1 beats seed 2)
    decidedByTiebreaker = true;
    if (player1.seed < player2.seed) {
      winner = player1;
      loser = player2;
    } else {
      winner = player2;
      loser = player1;
    }
  }

  return {
    matchId: match.matchId,
    winnerId: winner.entryId,
    loserId: loser.entryId,
    winnerSlot: winner.slot,
    winnerScore: winner.points,
    loserScore: loser.points,
    decidedByTiebreaker,
  };
}

/**
 * Determine the slot for a winner advancing to the next round
 * Odd positions → slot 1, even positions → slot 2
 */
export function getNextRoundSlot(positionInRound: number): 1 | 2 {
  return positionInRound % 2 === 1 ? 1 : 2;
}

/**
 * Check if both feeder matches for a target match are complete
 */
export function canPopulateNextMatch(
  targetMatchId: number,
  allMatches: RoundMatch[],
  completedMatchIds: Set<number>
): { ready: boolean; feederMatchIds: number[] } {
  // Find matches that feed into this one
  const feederMatches = allMatches.filter(m => m.qualifiesToMatchId === targetMatchId);

  if (feederMatches.length === 0) {
    return { ready: false, feederMatchIds: [] };
  }

  const feederMatchIds = feederMatches.map(m => m.matchId);
  const allFeedersComplete = feederMatchIds.every(id => completedMatchIds.has(id));

  return {
    ready: allFeedersComplete,
    feederMatchIds,
  };
}
```

**Step 2: Verify TypeScript compiles**

Run: `cd functions && npm run build`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add functions/src/match-resolver.ts
git commit -m "$(cat <<'EOF'
feat(functions): add match resolution logic

Adds match resolution with:
- Points comparison to determine winner
- Seed tiebreaker when points are equal
- Slot assignment for advancing winners
- Feeder match completion checking

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Create Scheduled Update Function

**Files:**
- Create: `functions/src/updateBrackets.ts`

**Step 1: Create the main scheduled function**

```typescript
/**
 * Bracket Update Scheduled Function
 *
 * Runs every 2 hours to:
 * 1. Check if current gameweek is finished
 * 2. Find active rounds for that gameweek
 * 3. Fetch final scores from FPL API
 * 4. Update pick records with final scores
 * 5. Resolve matches and determine winners
 * 6. Advance winners to next round
 * 7. Mark tournaments complete when final is decided
 */

import { onSchedule } from 'firebase-functions/v2/scheduler';
import {
  getActiveRoundsForEvent,
  getRoundMatches,
  upsertPickAdmin,
  updateMatchWinner,
  updateRoundStatus,
  updateTournamentStatus,
  updateParticipantStatus,
  createMatchPickAdmin,
  ActiveRound,
  RoundMatch,
} from './dataconnect-mutations';
import { fetchCurrentGameweek, fetchScoresForEntries } from './fpl-scores';
import { resolveMatch, getNextRoundSlot, MatchResult } from './match-resolver';

// Auth claims for admin operations
const SYSTEM_AUTH_CLAIMS = {
  sub: 'system',
  email: 'system@knockoutfpl.com',
  email_verified: true,
};

/**
 * Process a single round: fetch scores, resolve matches, advance winners
 */
async function processRound(round: ActiveRound, event: number): Promise<void> {
  console.log(`[updateBrackets] Processing round ${round.roundNumber} of tournament ${round.tournamentId}`);

  // 1. Get all active matches in this round
  const matches = await getRoundMatches(round.tournamentId, round.roundNumber);
  console.log(`[updateBrackets] Found ${matches.length} active matches`);

  if (matches.length === 0) {
    // No active matches - round may already be complete
    return;
  }

  // 2. Collect all entry IDs that need scores
  const entryIds = new Set<number>();
  for (const match of matches) {
    for (const pick of match.matchPicks) {
      entryIds.add(pick.entryId);
    }
  }

  // 3. Fetch scores from FPL API
  console.log(`[updateBrackets] Fetching scores for ${entryIds.size} entries`);
  const scoresMap = await fetchScoresForEntries(Array.from(entryIds), event);

  // 4. Update pick records with final scores
  for (const [entryId, picks] of scoresMap) {
    await upsertPickAdmin(
      {
        entryId,
        event,
        points: picks.entry_history.points,
        totalPoints: picks.entry_history.total_points,
        rank: picks.entry_history.rank,
        overallRank: picks.entry_history.overall_rank,
        eventTransfersCost: picks.entry_history.event_transfers_cost,
        activeChip: picks.active_chip ?? undefined,
        rawJson: JSON.stringify(picks),
        isFinal: true,
      },
      SYSTEM_AUTH_CLAIMS
    );
  }

  // 5. Build points lookup from scores
  const pointsMap = new Map<number, number>();
  for (const [entryId, picks] of scoresMap) {
    pointsMap.set(entryId, picks.entry_history.points);
  }

  // 6. Resolve each match
  const results: MatchResult[] = [];
  const completedMatchIds = new Set<number>();

  for (const match of matches) {
    const result = resolveMatch(match, pointsMap);
    if (result) {
      results.push(result);
      completedMatchIds.add(match.matchId);

      // Update match with winner
      await updateMatchWinner(round.tournamentId, match.matchId, result.winnerId);

      // Update loser's participant status
      if (result.loserId) {
        await updateParticipantStatus(
          round.tournamentId,
          result.loserId,
          'eliminated',
          round.roundNumber
        );
      }

      console.log(`[updateBrackets] Match ${match.matchId}: winner=${result.winnerId} (${result.winnerScore} pts)${result.decidedByTiebreaker ? ' [tiebreaker]' : ''}`);
    }
  }

  // 7. Check if round is complete
  const allMatchesComplete = matches.every(m => completedMatchIds.has(m.matchId));

  if (allMatchesComplete) {
    console.log(`[updateBrackets] Round ${round.roundNumber} complete`);
    await updateRoundStatus(round.tournamentId, round.roundNumber, 'complete');

    // 8. Check if this was the final round
    const isFinalRound = round.roundNumber === round.tournament.totalRounds;

    if (isFinalRound) {
      // Tournament complete!
      const finalMatch = matches[0]; // Final has only 1 match
      const finalResult = results.find(r => r.matchId === finalMatch.matchId);

      if (finalResult) {
        await updateTournamentStatus(round.tournamentId, 'completed', finalResult.winnerId);
        await updateParticipantStatus(round.tournamentId, finalResult.winnerId, 'champion');
        console.log(`[updateBrackets] Tournament ${round.tournamentId} complete! Winner: ${finalResult.winnerId}`);
      }
    } else {
      // 9. Advance winners to next round
      await advanceWinnersToNextRound(round, matches, results);

      // Activate next round
      await updateRoundStatus(round.tournamentId, round.roundNumber + 1, 'active');
    }
  }
}

/**
 * Create match_picks for winners advancing to next round
 */
async function advanceWinnersToNextRound(
  round: ActiveRound,
  matches: RoundMatch[],
  results: MatchResult[]
): Promise<void> {
  console.log(`[updateBrackets] Advancing winners to round ${round.roundNumber + 1}`);

  // Group by next match
  const winnersByNextMatch = new Map<number, Array<{ winnerId: number; slot: number }>>();

  for (const match of matches) {
    if (!match.qualifiesToMatchId) continue;

    const result = results.find(r => r.matchId === match.matchId);
    if (!result) continue;

    const nextMatchId = match.qualifiesToMatchId;
    const slot = getNextRoundSlot(match.positionInRound);

    if (!winnersByNextMatch.has(nextMatchId)) {
      winnersByNextMatch.set(nextMatchId, []);
    }
    winnersByNextMatch.get(nextMatchId)!.push({
      winnerId: result.winnerId,
      slot,
    });
  }

  // Create match_picks for next round
  for (const [nextMatchId, winners] of winnersByNextMatch) {
    for (const { winnerId, slot } of winners) {
      await createMatchPickAdmin(
        {
          tournamentId: round.tournamentId,
          matchId: nextMatchId,
          entryId: winnerId,
          slot,
        },
        SYSTEM_AUTH_CLAIMS
      );
      console.log(`[updateBrackets] Created match_pick: match=${nextMatchId} entry=${winnerId} slot=${slot}`);
    }
  }
}

/**
 * Main scheduled function - runs every 2 hours
 */
export const updateBrackets = onSchedule(
  {
    schedule: 'every 2 hours',
    timeZone: 'Europe/London',
    retryCount: 3,
  },
  async () => {
    console.log('[updateBrackets] Starting bracket update check...');

    // 1. Check current gameweek status
    const currentGW = await fetchCurrentGameweek();

    if (!currentGW) {
      console.log('[updateBrackets] Could not fetch current gameweek');
      return;
    }

    console.log(`[updateBrackets] Current gameweek: ${currentGW.event}, finished: ${currentGW.finished}`);

    if (!currentGW.finished) {
      console.log('[updateBrackets] Gameweek not finished yet, skipping');
      return;
    }

    // 2. Find active rounds for this gameweek
    const activeRounds = await getActiveRoundsForEvent(currentGW.event);
    console.log(`[updateBrackets] Found ${activeRounds.length} active rounds for GW${currentGW.event}`);

    if (activeRounds.length === 0) {
      console.log('[updateBrackets] No active rounds to process');
      return;
    }

    // 3. Process each round
    for (const round of activeRounds) {
      try {
        await processRound(round, currentGW.event);
      } catch (error) {
        console.error(`[updateBrackets] Error processing round ${round.roundNumber} of ${round.tournamentId}:`, error);
        // Continue with other rounds
      }
    }

    console.log('[updateBrackets] Bracket update complete');
  }
);
```

**Step 2: Verify TypeScript compiles**

Run: `cd functions && npm run build`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add functions/src/updateBrackets.ts
git commit -m "$(cat <<'EOF'
feat(functions): add scheduled bracket update function

Adds a scheduled Cloud Function that runs every 2 hours to:
1. Check if current gameweek is finished
2. Find active rounds for that gameweek
3. Fetch final scores from FPL API
4. Update pick records with final scores
5. Resolve matches and determine winners
6. Advance winners to next round
7. Mark tournaments complete when final is decided

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Export Function and Test Build

**Files:**
- Modify: `functions/src/index.ts`

**Step 1: Add export for updateBrackets**

Add to exports:

```typescript
export { updateBrackets } from './updateBrackets';
```

**Step 2: Verify full build succeeds**

Run: `cd functions && npm run build`
Expected: No TypeScript errors, all functions exported

**Step 3: Commit**

```bash
git add functions/src/index.ts
git commit -m "$(cat <<'EOF'
feat(functions): export updateBrackets scheduled function

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Add Unit Tests for Match Resolver

**Files:**
- Create: `functions/src/match-resolver.test.ts`

**Step 1: Create test file**

```typescript
import { describe, it, expect } from 'vitest';
import { resolveMatch, getNextRoundSlot, RoundMatch } from './match-resolver';

describe('resolveMatch', () => {
  const createMatch = (
    matchId: number,
    picks: Array<{ entryId: number; slot: number; seed: number }>
  ): RoundMatch => ({
    tournamentId: 'test-tournament',
    matchId,
    roundNumber: 1,
    positionInRound: 1,
    qualifiesToMatchId: null,
    isBye: false,
    status: 'active',
    matchPicks: picks.map(p => ({
      entryId: p.entryId,
      slot: p.slot,
      participant: { seed: p.seed },
    })),
  });

  it('should determine winner by higher points', () => {
    const match = createMatch(1, [
      { entryId: 100, slot: 1, seed: 1 },
      { entryId: 200, slot: 2, seed: 2 },
    ]);
    const scores = new Map([[100, 50], [200, 70]]);

    const result = resolveMatch(match, scores);

    expect(result).not.toBeNull();
    expect(result!.winnerId).toBe(200);
    expect(result!.loserId).toBe(100);
    expect(result!.winnerScore).toBe(70);
    expect(result!.loserScore).toBe(50);
    expect(result!.decidedByTiebreaker).toBe(false);
  });

  it('should use seed as tiebreaker when points are equal', () => {
    const match = createMatch(1, [
      { entryId: 100, slot: 1, seed: 3 },
      { entryId: 200, slot: 2, seed: 1 },
    ]);
    const scores = new Map([[100, 60], [200, 60]]);

    const result = resolveMatch(match, scores);

    expect(result).not.toBeNull();
    expect(result!.winnerId).toBe(200); // Seed 1 beats seed 3
    expect(result!.loserId).toBe(100);
    expect(result!.decidedByTiebreaker).toBe(true);
  });

  it('should handle bye matches with single player', () => {
    const match: RoundMatch = {
      ...createMatch(1, [{ entryId: 100, slot: 1, seed: 1 }]),
      isBye: true,
    };
    const scores = new Map([[100, 0]]);

    const result = resolveMatch(match, scores);

    expect(result).not.toBeNull();
    expect(result!.winnerId).toBe(100);
    expect(result!.loserId).toBeNull();
  });
});

describe('getNextRoundSlot', () => {
  it('should return slot 1 for odd positions', () => {
    expect(getNextRoundSlot(1)).toBe(1);
    expect(getNextRoundSlot(3)).toBe(1);
    expect(getNextRoundSlot(5)).toBe(1);
  });

  it('should return slot 2 for even positions', () => {
    expect(getNextRoundSlot(2)).toBe(2);
    expect(getNextRoundSlot(4)).toBe(2);
    expect(getNextRoundSlot(6)).toBe(2);
  });
});
```

**Step 2: Run tests**

Run: `cd functions && npm test`
Expected: All tests pass

**Step 3: Commit**

```bash
git add functions/src/match-resolver.test.ts
git commit -m "$(cat <<'EOF'
test(functions): add unit tests for match resolver

Tests cover:
- Winner determination by points
- Seed tiebreaker when points equal
- Bye match handling
- Next round slot assignment

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Add query functions for active rounds | `functions/src/dataconnect-mutations.ts` |
| 2 | Add update mutations | `functions/src/dataconnect-mutations.ts` |
| 3 | Create FPL score fetcher | `functions/src/fpl-scores.ts` |
| 4 | Create match resolution logic | `functions/src/match-resolver.ts` |
| 5 | Create scheduled update function | `functions/src/updateBrackets.ts` |
| 6 | Export function and test build | `functions/src/index.ts` |
| 7 | Add unit tests for match resolver | `functions/src/match-resolver.test.ts` |

**Total estimated steps:** 28

---

## Dependencies

This plan assumes:
- `node-fetch` is already a dependency in `functions/package.json`
- `vitest` is configured for testing in functions
- Data Connect schema supports the queries used

If `node-fetch` is not installed:
```bash
cd functions && npm install node-fetch@2 @types/node-fetch@2
```
