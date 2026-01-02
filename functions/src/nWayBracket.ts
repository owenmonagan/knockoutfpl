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

  // Auto-advance happens when a group has matchSize-1 byes (only 1 real player).
  // TODO: Generalize for matchSize > 3. Currently only handles matchSize=3 where
  // 2 byes = auto-advance. For matchSize=4, would need 3 byes for auto-advance,
  // which requires tracking groupsWithThreeByes. Deferred until matchSize=4 is needed.
  const autoAdvanceCount = matchSize === 3 ? groupsWithTwoByes : 0;

  return {
    groupsWithByes,
    groupsWithTwoByes,
    fullGroups,
    autoAdvanceCount,
  };
}

/**
 * Match structure for N-way brackets
 */
export interface NWayBracketMatch {
  matchId: number;
  roundNumber: number;
  positionInRound: number;
  qualifiesToMatchId: number | null;
}

/**
 * Generate bracket structure for N-way matches.
 * Creates all matches with proper qualifies_to links between rounds.
 *
 * @param matchSize - Managers per match (2, 3, 4, etc.)
 * @param rounds - Total number of rounds
 * @returns Array of matches with structure info
 */
export function generateNWayBracketStructure(
  matchSize: number,
  rounds: number
): NWayBracketMatch[] {
  const matches: NWayBracketMatch[] = [];
  let matchId = 1;

  // Track first match ID of each round for linking
  const roundStartIds: number[] = [];

  // Create matches for each round
  for (let round = 1; round <= rounds; round++) {
    roundStartIds[round] = matchId;
    // Matches per round: matchSize^(rounds - round)
    const matchCount = Math.pow(matchSize, rounds - round);

    for (let pos = 1; pos <= matchCount; pos++) {
      matches.push({
        matchId,
        roundNumber: round,
        positionInRound: pos,
        qualifiesToMatchId: null, // Set below
      });
      matchId++;
    }
  }

  // Set qualifies_to links
  // Each group of `matchSize` matches in round R feeds into 1 match in round R+1
  for (const match of matches) {
    if (match.roundNumber < rounds) {
      const nextRoundStart = roundStartIds[match.roundNumber + 1];
      // Which match in next round does this one feed into?
      // Position 1-matchSize → next match 1, position (matchSize+1)-(2*matchSize) → next match 2, etc.
      const nextPosition = Math.ceil(match.positionInRound / matchSize);
      match.qualifiesToMatchId = nextRoundStart + nextPosition - 1;
    }
  }

  return matches;
}

/**
 * Group assignment for N-way matches
 */
export interface NWayMatchAssignment {
  position: number;        // 1-indexed position in round 1
  seeds: (number | null)[]; // Seeds in this group (null = bye)
  isBye: boolean;          // True if only 1 real player (auto-advance)
}

/**
 * Assign participants to round 1 groups using snake draft seeding.
 * Top seeds get byes to give them easier groups.
 *
 * Snake draft example for 4 groups of 4:
 * Row 1: G1←1, G2←2, G3←3, G4←4
 * Row 2: G4←5, G3←6, G2←7, G1←8
 * Row 3: G1←9, G2←10, G3←11, G4←12
 * Row 4: G4←13, G3←14, G2←15, G1←16
 *
 * Result: G1=[1,8,9,16], G2=[2,7,10,15], G3=[3,6,11,14], G4=[4,5,12,13]
 *
 * @param matchSize - Managers per match
 * @param totalSlots - Total slots (matchSize^rounds)
 * @param participantCount - Actual participants (rest are byes)
 */
export function assignParticipantsToNWayMatches(
  matchSize: number,
  totalSlots: number,
  participantCount: number
): NWayMatchAssignment[] {
  const groupCount = totalSlots / matchSize;
  // Note: byeCount = totalSlots - participantCount (used implicitly below)

  // Initialize groups
  const groups: (number | null)[][] = [];
  for (let i = 0; i < groupCount; i++) {
    groups.push([]);
  }

  // Snake draft assignment
  // For each "row" of matchSize groups, alternate direction
  for (let seed = 1; seed <= totalSlots; seed++) {
    // Which row are we in? (0-indexed)
    const row = Math.floor((seed - 1) / groupCount);
    // Position within the row (0-indexed)
    const posInRow = (seed - 1) % groupCount;

    // Alternate direction each row
    const groupIndex = row % 2 === 0
      ? posInRow
      : groupCount - 1 - posInRow;

    // If seed > participantCount, it's a bye (null)
    const value = seed <= participantCount ? seed : null;
    groups[groupIndex].push(value);
  }

  // Convert to assignment objects
  const assignments: NWayMatchAssignment[] = groups.map((seeds, index) => {
    const realPlayerCount = seeds.filter(s => s !== null).length;
    return {
      position: index + 1,
      seeds,
      isBye: realPlayerCount <= 1, // Only 1 or 0 real players = auto-advance
    };
  });

  return assignments;
}
