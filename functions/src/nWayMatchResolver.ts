/**
 * N-Way Match Resolver
 *
 * Determines winner from N participants using FPL tiebreaker cascade:
 * 1. Points (higher is better)
 * 2. Transfer cost (lower is better)
 * 3. Bench points (higher is better)
 * 4. Seed (lower is better) - fallback for perfect ties
 */

export interface NWayPlayerScore {
  entryId: number;
  slot: number;
  seed: number;
  points: number;
  transferCost: number;
  benchPoints: number;
}

export interface PlayerRanking {
  entryId: number;
  rank: number;
  points: number;
}

export interface NWayMatchResult {
  matchId: number;
  winnerId: number;
  rankings: PlayerRanking[];
  decidedByTiebreaker: boolean;
}

/**
 * Resolve an N-way match using FPL tiebreaker cascade.
 */
export function resolveNWayMatch(
  matchId: number,
  scores: NWayPlayerScore[]
): NWayMatchResult | null {
  if (scores.length === 0) {
    return null;
  }

  // Single player = auto-advance
  if (scores.length === 1) {
    return {
      matchId,
      winnerId: scores[0].entryId,
      rankings: [{ entryId: scores[0].entryId, rank: 1, points: scores[0].points }],
      decidedByTiebreaker: false,
    };
  }

  // Sort by tiebreaker cascade
  const sorted = [...scores].sort((a, b) => {
    // 1. Points (higher is better)
    if (b.points !== a.points) return b.points - a.points;

    // 2. Transfer cost (lower is better)
    if (a.transferCost !== b.transferCost) return a.transferCost - b.transferCost;

    // 3. Bench points (higher is better)
    if (b.benchPoints !== a.benchPoints) return b.benchPoints - a.benchPoints;

    // 4. Seed (lower is better)
    return a.seed - b.seed;
  });

  // Check if tiebreaker was used (any player has same points as winner)
  const winnerPoints = sorted[0].points;
  const decidedByTiebreaker = sorted.slice(1).some(p => p.points === winnerPoints);

  // Build rankings
  const rankings: PlayerRanking[] = sorted.map((player, index) => ({
    entryId: player.entryId,
    rank: index + 1,
    points: player.points,
  }));

  return {
    matchId,
    winnerId: sorted[0].entryId,
    rankings,
    decidedByTiebreaker,
  };
}
