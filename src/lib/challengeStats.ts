import type { Challenge } from '../types/challenge';

export interface ChallengeStats {
  total: number;
  wins: number;
  losses: number;
  winRate: string;
}

export function calculateChallengeStats(
  challenges: Challenge[],
  userId: string
): ChallengeStats {
  const wins = challenges.filter(
    (c) => c.status === 'completed' && c.winnerId === userId
  ).length;

  const losses = challenges.filter(
    (c) =>
      c.status === 'completed' &&
      c.winnerId !== null &&
      c.winnerId !== userId &&
      !c.isDraw
  ).length;

  const completedGames = wins + losses;
  const winRate =
    completedGames > 0
      ? `${Math.round((wins / completedGames) * 100)}%`
      : 'N/A';

  return {
    total: challenges.length,
    wins,
    losses,
    winRate,
  };
}
