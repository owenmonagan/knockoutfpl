/**
 * Calculate the bracket size (next power of 2)
 */
export function calculateBracketSize(participantCount: number): number {
  return Math.pow(2, Math.ceil(Math.log2(participantCount)));
}

/**
 * Calculate total rounds needed
 */
export function calculateTotalRounds(bracketSize: number): number {
  return Math.log2(bracketSize);
}

/**
 * Calculate how many byes are needed
 */
export function calculateByeCount(bracketSize: number, participantCount: number): number {
  return bracketSize - participantCount;
}

/**
 * Get number of matches in a specific round
 */
export function getMatchCountForRound(bracketSize: number, roundNumber: number): number {
  return bracketSize / Math.pow(2, roundNumber);
}

export interface SeedPairing {
  position: number;  // 1-indexed position in round 1
  seed1: number;     // Higher seed (slot 1)
  seed2: number;     // Lower seed (slot 2)
}

/**
 * Generate standard bracket seed pairings.
 * Uses recursive algorithm: in each region, top seed plays bottom seed.
 * Result: 1v16, 8v9, 4v13, 5v12, 2v15, 7v10, 3v14, 6v11 (for 16)
 */
export function generateSeedPairings(bracketSize: number): SeedPairing[] {
  const pairings: SeedPairing[] = [];
  const matchCount = bracketSize / 2;

  // Generate seed order using recursive splitting
  const seedOrder = generateSeedOrder(bracketSize);

  for (let i = 0; i < matchCount; i++) {
    const seed1 = seedOrder[i * 2];
    const seed2 = seedOrder[i * 2 + 1];
    pairings.push({
      position: i + 1,
      seed1: Math.min(seed1, seed2),
      seed2: Math.max(seed1, seed2),
    });
  }

  return pairings;
}

/**
 * Generate seed order for standard bracket.
 * For 8: [1,8,4,5,2,7,3,6] - ensures 1v8 winner meets 4v5 winner, etc.
 */
function generateSeedOrder(bracketSize: number): number[] {
  if (bracketSize === 2) {
    return [1, 2];
  }

  const halfSize = bracketSize / 2;
  const topHalf = generateSeedOrder(halfSize);
  const bottomHalf = topHalf.map(seed => bracketSize + 1 - seed);

  // Interleave: [top[0], bottom[0], top[1], bottom[1], ...]
  const result: number[] = [];
  for (let i = 0; i < halfSize; i++) {
    result.push(topHalf[i], bottomHalf[i]);
  }

  return result;
}

export interface BracketMatch {
  matchId: number;
  roundNumber: number;
  positionInRound: number;
  qualifiesToMatchId: number | null;
}

/**
 * Generate all matches for a bracket with qualifies_to links.
 */
export function generateBracketStructure(bracketSize: number): BracketMatch[] {
  const totalRounds = calculateTotalRounds(bracketSize);
  const matches: BracketMatch[] = [];
  let matchId = 1;

  // Track first match ID of each round for linking
  const roundStartIds: number[] = [];

  // Create matches for each round
  for (let round = 1; round <= totalRounds; round++) {
    roundStartIds[round] = matchId;
    const matchCount = getMatchCountForRound(bracketSize, round);

    for (let pos = 1; pos <= matchCount; pos++) {
      matches.push({
        matchId,
        roundNumber: round,
        positionInRound: pos,
        qualifiesToMatchId: null, // Will be set after all matches created
      });
      matchId++;
    }
  }

  // Set qualifies_to links
  for (const match of matches) {
    if (match.roundNumber < totalRounds) {
      const nextRoundStart = roundStartIds[match.roundNumber + 1];
      const nextPosition = Math.ceil(match.positionInRound / 2);
      match.qualifiesToMatchId = nextRoundStart + nextPosition - 1;
    }
  }

  return matches;
}
