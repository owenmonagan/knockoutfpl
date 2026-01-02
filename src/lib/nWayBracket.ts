// src/lib/nWayBracket.ts

/**
 * N-Way Bracket Calculator for frontend preview
 *
 * Calculates bracket structure for tournaments with N managers per match.
 * Ported from functions/src/nWayBracket.ts for use in tournament preview UI.
 */

export interface BracketPreviewInfo {
  rounds: number;
  totalSlots: number;
  byeCount: number;
  matchesPerRound: number[]; // [round1matches, round2matches, ...]
}

/**
 * Calculate bracket preview info for N-way matches.
 *
 * @param participantCount - Number of real participants
 * @param matchSize - Managers per match (2, 3, 4, etc.)
 * @returns Bracket structure preview info
 */
export function calculateBracketPreview(
  participantCount: number,
  matchSize: number
): BracketPreviewInfo {
  if (participantCount < 2) {
    return { rounds: 0, totalSlots: 0, byeCount: 0, matchesPerRound: [] };
  }

  // Find minimum rounds needed: matchSize^rounds >= participantCount
  // Use a small epsilon to handle floating point precision issues
  // (e.g., log(27)/log(3) = 3.0000000000000004 instead of 3)
  const rawRounds = Math.log(participantCount) / Math.log(matchSize);
  const rounds = Math.ceil(rawRounds - 1e-10);

  // Total slots is the perfect power of matchSize
  const totalSlots = Math.pow(matchSize, rounds);
  const byeCount = totalSlots - participantCount;

  // Matches per round: starts with totalSlots/matchSize, reduces by factor of matchSize each round
  const matchesPerRound: number[] = [];
  for (let r = 1; r <= rounds; r++) {
    matchesPerRound.push(Math.pow(matchSize, rounds - r));
  }

  return { rounds, totalSlots, byeCount, matchesPerRound };
}

/**
 * Get human-friendly round name.
 *
 * @param roundNumber - 1-indexed round number
 * @param totalRounds - Total rounds in tournament
 * @returns Round name (e.g., "Final", "Semi-Finals", "Round 1")
 */
export function getRoundName(roundNumber: number, totalRounds: number): string {
  const roundsFromEnd = totalRounds - roundNumber;

  if (roundsFromEnd === 0) return 'Final';
  if (roundsFromEnd === 1) return 'Semi-Finals';
  if (roundsFromEnd === 2) return 'Quarter-Finals';

  return `Round ${roundNumber}`;
}
