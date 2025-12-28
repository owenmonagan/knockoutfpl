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
