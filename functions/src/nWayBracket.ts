/**
 * N-Way Bracket Calculator
 *
 * Calculates bracket structure for tournaments with N managers per match.
 */

export interface NWayBracketResult {
  rounds: number;
  totalSlots: number;
  byeCount: number;
  groupsPerRound: number[];
}

export interface ByeDistribution {
  groupsWithByes: number;      // Groups with exactly 1 bye
  groupsWithTwoByes: number;   // Groups with exactly 2 byes (matchSize-1 byes = auto-advance)
  fullGroups: number;          // Groups with 0 byes
  autoAdvanceCount: number;    // Groups where 1 player auto-advances
}

/**
 * Calculate bracket structure for N-way matches.
 *
 * @param participantCount - Number of real participants
 * @param matchSize - Managers per match (2, 3, 4, etc.)
 * @returns Bracket structure with rounds, slots, and byes
 */
export function calculateNWayBracket(
  participantCount: number,
  matchSize: number
): NWayBracketResult {
  // Find minimum rounds needed: matchSize^rounds >= participantCount
  // Use a small epsilon to handle floating point precision issues
  // (e.g., log(27)/log(3) = 3.0000000000000004 instead of 3)
  const rawRounds = Math.log(participantCount) / Math.log(matchSize);
  const rounds = Math.ceil(rawRounds - 1e-10);

  // Total slots is the perfect power of matchSize
  const totalSlots = Math.pow(matchSize, rounds);

  // Byes fill the gap
  const byeCount = totalSlots - participantCount;

  // Groups per round: starts with totalSlots/matchSize, reduces by factor of matchSize each round
  const groupsPerRound: number[] = [];
  for (let r = 1; r <= rounds; r++) {
    groupsPerRound.push(Math.pow(matchSize, rounds - r));
  }

  return { rounds, totalSlots, byeCount, groupsPerRound };
}

/**
 * Distribute byes across round 1 groups.
 *
 * Strategy:
 * - Spread byes evenly to minimize auto-advances
 * - Top seeds get byes first (reward higher league rank)
 *
 * @param groupCount - Number of groups in round 1
 * @param byeCount - Total byes to distribute
 * @param matchSize - Managers per match
 */
export function distributeByesAcrossGroups(
  groupCount: number,
  byeCount: number,
  matchSize: number
): ByeDistribution {
  const maxByesPerGroup = matchSize - 1; // Can't have matchSize byes (no players)

  // First pass: give each group up to 1 bye
  const firstPassByes = Math.min(byeCount, groupCount);
  let remainingByes = byeCount - firstPassByes;

  // Second pass: give second bye to groups (if needed)
  const secondPassByes = Math.min(remainingByes, groupCount);
  remainingByes -= secondPassByes;

  // Groups with 2 byes = auto-advance (only 1 real player)
  const groupsWithTwoByes = secondPassByes;
  const groupsWithByes = firstPassByes;
  const fullGroups = groupCount - firstPassByes;

  // Auto-advance happens when a group has matchSize-1 byes
  const autoAdvanceCount = matchSize === 3 ? groupsWithTwoByes : 0;

  return {
    groupsWithByes,
    groupsWithTwoByes,
    fullGroups,
    autoAdvanceCount,
  };
}
