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
