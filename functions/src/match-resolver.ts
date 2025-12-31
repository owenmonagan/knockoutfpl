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

  // Check for missing scores before proceeding
  const missingScoreEntryIds = picks
    .filter(pick => !scores.has(pick.entryId))
    .map(pick => pick.entryId);

  if (missingScoreEntryIds.length > 0) {
    console.warn(
      `Match ${match.matchId}: Cannot resolve - missing scores for entry IDs: ${missingScoreEntryIds.join(', ')}`
    );
    return null;
  }

  // Get player scores (we've verified all scores exist above)
  const players: PlayerScore[] = picks.map(pick => ({
    entryId: pick.entryId,
    slot: pick.slot,
    seed: pick.participant.seed,
    points: scores.get(pick.entryId)!,
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

/**
 * Minimal match interface for validateFeedersComplete
 * Works with simple match arrays without requiring full RoundMatch type
 */
export interface MinimalMatch {
  matchId: number;
  status: string;
  qualifiesToMatchId?: number | null;
}

/**
 * Validate that all feeder matches for a target match are complete
 *
 * @param targetMatchId - The match ID to check feeders for
 * @param allMatches - Array of all matches with matchId, status, and qualifiesToMatchId
 * @returns { ready: boolean, incompleteFeederIds: number[] }
 *   - ready: true if all feeders are complete (or no feeders exist for round 1)
 *   - incompleteFeederIds: IDs of feeder matches that are not complete
 */
export function validateFeedersComplete(
  targetMatchId: number,
  allMatches: MinimalMatch[]
): { ready: boolean; incompleteFeederIds: number[] } {
  // Find matches that feed into this one
  const feederMatches = allMatches.filter(
    m => m.qualifiesToMatchId === targetMatchId
  );

  // Round 1 matches have no feeders - always ready
  if (feederMatches.length === 0) {
    return { ready: true, incompleteFeederIds: [] };
  }

  // Find which feeders are not complete
  const incompleteFeederIds = feederMatches
    .filter(m => m.status !== 'complete')
    .map(m => m.matchId);

  return {
    ready: incompleteFeederIds.length === 0,
    incompleteFeederIds,
  };
}
