import type { FPLTeamPicks, FPLPlayer } from './fpl';

export type PositionType = 'GK' | 'DEF' | 'MID' | 'FWD';

export interface DifferentialPlayer {
  player: FPLPlayer;
  points: number;
  multiplier: number;
  isCaptain: boolean;
  isViceCaptain: boolean;
}

export interface Differential {
  position: PositionType;
  teamA: DifferentialPlayer | null;
  teamB: DifferentialPlayer | null;
  pointDifference: number;
}

export interface CommonPlayer {
  player: FPLPlayer;
  position: PositionType;
  points: number;
  multiplier: number;
  isCaptain: boolean;
  totalPoints: number;
}

function getPositionType(elementType: number): PositionType {
  switch (elementType) {
    case 1:
      return 'GK';
    case 2:
      return 'DEF';
    case 3:
      return 'MID';
    case 4:
      return 'FWD';
    default:
      return 'MID';
  }
}

export function calculateDifferentials(
  teamA: FPLTeamPicks,
  teamB: FPLTeamPicks,
  playerMap: Map<number, FPLPlayer>,
  liveScores: Map<number, number>
): Differential[] {
  const differentials: Differential[] = [];

  const teamAStarters = teamA.picks.filter((p) => p.multiplier > 0);
  const teamBStarters = teamB.picks.filter((p) => p.multiplier > 0);

  const teamAMap = new Map(teamAStarters.map((p) => [p.element, p]));
  const teamBMap = new Map(teamBStarters.map((p) => [p.element, p]));

  const allPlayerIds = new Set([
    ...teamAStarters.map((p) => p.element),
    ...teamBStarters.map((p) => p.element),
  ]);

  for (const playerId of allPlayerIds) {
    const pickA = teamAMap.get(playerId);
    const pickB = teamBMap.get(playerId);
    const player = playerMap.get(playerId);

    if (!player) continue;

    const basePoints = liveScores.get(playerId) || 0;

    const isUniqueToA = pickA && !pickB;
    const isUniqueToB = pickB && !pickA;
    const hasDifferentMultipliers = pickA && pickB && pickA.multiplier !== pickB.multiplier;

    if (isUniqueToA || isUniqueToB || hasDifferentMultipliers) {
      const teamAPlayer: DifferentialPlayer | null = pickA
        ? {
            player,
            points: basePoints,
            multiplier: pickA.multiplier,
            isCaptain: pickA.is_captain,
            isViceCaptain: pickA.is_vice_captain,
          }
        : null;

      const teamBPlayer: DifferentialPlayer | null = pickB
        ? {
            player,
            points: basePoints,
            multiplier: pickB.multiplier,
            isCaptain: pickB.is_captain,
            isViceCaptain: pickB.is_vice_captain,
          }
        : null;

      const teamATotal = teamAPlayer ? teamAPlayer.points * teamAPlayer.multiplier : 0;
      const teamBTotal = teamBPlayer ? teamBPlayer.points * teamBPlayer.multiplier : 0;

      differentials.push({
        position: getPositionType(player.element_type),
        teamA: teamAPlayer,
        teamB: teamBPlayer,
        pointDifference: teamATotal - teamBTotal,
      });
    }
  }

  return differentials;
}

export function calculateCommonPlayers(
  teamA: FPLTeamPicks,
  teamB: FPLTeamPicks,
  playerMap: Map<number, FPLPlayer>,
  liveScores: Map<number, number>
): CommonPlayer[] {
  const commonPlayers: CommonPlayer[] = [];

  const teamAStarters = teamA.picks.filter((p) => p.multiplier > 0);
  const teamBStarters = teamB.picks.filter((p) => p.multiplier > 0);

  const teamAMap = new Map(teamAStarters.map((p) => [p.element, p]));
  const teamBMap = new Map(teamBStarters.map((p) => [p.element, p]));

  // Find players in both teams
  for (const [playerId, pickA] of teamAMap) {
    const pickB = teamBMap.get(playerId);
    
    // Player must be in both teams with same multiplier
    if (pickB && pickA.multiplier === pickB.multiplier) {
      const player = playerMap.get(playerId);
      if (!player) continue;

      const basePoints = liveScores.get(playerId) || 0;
      const totalPoints = basePoints * pickA.multiplier;

      commonPlayers.push({
        player,
        position: getPositionType(player.element_type),
        points: basePoints,
        multiplier: pickA.multiplier,
        isCaptain: pickA.is_captain,
        totalPoints,
      });
    }
  }

  return commonPlayers;
}

export interface Battle {
  playerA: DifferentialPlayer | null;
  playerB: DifferentialPlayer | null;
  swing: number;
  winner: 'A' | 'B' | 'draw';
}

export function createBattleMatchups(differentials: Differential[]): Battle[] {
  const battles: Battle[] = [];

  // Separate Team A and Team B differentials, calculate impact for each
  const teamADiffs: Array<{ diff: Differential; impact: number }> = [];
  const teamBDiffs: Array<{ diff: Differential; impact: number }> = [];

  for (const diff of differentials) {
    if (diff.teamA !== null) {
      const impact = Math.abs(diff.teamA.points * diff.teamA.multiplier);
      teamADiffs.push({ diff, impact });
    }
    if (diff.teamB !== null) {
      const impact = Math.abs(diff.teamB.points * diff.teamB.multiplier);
      teamBDiffs.push({ diff, impact });
    }
  }

  // Sort by impact (highest first)
  teamADiffs.sort((a, b) => b.impact - a.impact);
  teamBDiffs.sort((a, b) => b.impact - a.impact);

  // Create matchups: MVP vs MVP, #2 vs #2, etc.
  const maxBattles = Math.max(teamADiffs.length, teamBDiffs.length);

  for (let i = 0; i < maxBattles; i++) {
    const playerA = teamADiffs[i]?.diff.teamA || null;
    const playerB = teamBDiffs[i]?.diff.teamB || null;

    const pointsA = playerA ? playerA.points * playerA.multiplier : 0;
    const pointsB = playerB ? playerB.points * playerB.multiplier : 0;
    const swing = Math.abs(pointsA - pointsB);

    let winner: 'A' | 'B' | 'draw';
    if (pointsA > pointsB) {
      winner = 'A';
    } else if (pointsB > pointsA) {
      winner = 'B';
    } else {
      winner = 'draw';
    }

    battles.push({
      playerA,
      playerB,
      swing,
      winner,
    });
  }

  // Sort battles by swing (biggest impact first)
  battles.sort((a, b) => b.swing - a.swing);

  return battles;
}
