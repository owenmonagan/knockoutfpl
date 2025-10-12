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

  // Separate Team A and Team B differentials by position
  const teamAByPosition: Record<PositionType, Array<{ diff: Differential; impact: number }>> = {
    GK: [],
    DEF: [],
    MID: [],
    FWD: [],
  };

  const teamBByPosition: Record<PositionType, Array<{ diff: Differential; impact: number }>> = {
    GK: [],
    DEF: [],
    MID: [],
    FWD: [],
  };

  // Separate captains
  let captainDiffA: { diff: Differential; impact: number } | null = null;
  let captainDiffB: { diff: Differential; impact: number } | null = null;

  // Group differentials by position and identify captains
  for (const diff of differentials) {
    if (diff.teamA !== null) {
      const impact = Math.abs(diff.teamA.points * diff.teamA.multiplier);
      const entry = { diff, impact };

      if (diff.teamA.isCaptain) {
        captainDiffA = entry;
      } else {
        teamAByPosition[diff.position].push(entry);
      }
    }

    if (diff.teamB !== null) {
      const impact = Math.abs(diff.teamB.points * diff.teamB.multiplier);
      const entry = { diff, impact };

      if (diff.teamB.isCaptain) {
        captainDiffB = entry;
      } else {
        teamBByPosition[diff.position].push(entry);
      }
    }
  }

  // Create captain battle first (if applicable)
  if (captainDiffA && captainDiffB) {
    const playerA = captainDiffA.diff.teamA;
    const playerB = captainDiffB.diff.teamB;

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
  } else if (captainDiffA) {
    const playerA = captainDiffA.diff.teamA;
    const pointsA = playerA ? playerA.points * playerA.multiplier : 0;

    battles.push({
      playerA,
      playerB: null,
      swing: pointsA,
      winner: 'A',
    });
  } else if (captainDiffB) {
    const playerB = captainDiffB.diff.teamB;
    const pointsB = playerB ? playerB.points * playerB.multiplier : 0;

    battles.push({
      playerA: null,
      playerB,
      swing: pointsB,
      winner: 'B',
    });
  }

  // Match by position: FWD, MID, DEF, GK
  const positions: PositionType[] = ['FWD', 'MID', 'DEF', 'GK'];

  for (const position of positions) {
    const teamAPlayers = teamAByPosition[position];
    const teamBPlayers = teamBByPosition[position];

    // Sort by impact within position (highest first)
    teamAPlayers.sort((a, b) => b.impact - a.impact);
    teamBPlayers.sort((a, b) => b.impact - a.impact);

    // Match players within the same position
    const maxMatches = Math.max(teamAPlayers.length, teamBPlayers.length);

    for (let i = 0; i < maxMatches; i++) {
      const playerA = teamAPlayers[i]?.diff.teamA || null;
      const playerB = teamBPlayers[i]?.diff.teamB || null;

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
  }

  // Sort all battles by swing (biggest impact first)
  battles.sort((a, b) => b.swing - a.swing);

  return battles;
}


