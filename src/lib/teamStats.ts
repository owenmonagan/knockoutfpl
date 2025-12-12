import { getFPLGameweekScore } from '../services/fpl';

export async function calculateAveragePoints(
  teamId: number,
  currentGameweek: number
): Promise<number> {
  const gameweeksToFetch = currentGameweek - 1;

  if (gameweeksToFetch <= 0) {
    return 0;
  }

  const scores = await Promise.all(
    Array.from({ length: gameweeksToFetch }, (_, i) =>
      getFPLGameweekScore(teamId, i + 1)
    )
  );

  const totalPoints = scores.reduce((sum, score) => sum + score.points, 0);
  const average = totalPoints / gameweeksToFetch;

  return Math.round(average);
}

export async function calculateForm(
  teamId: number,
  currentGameweek: number
): Promise<string> {
  const average = await calculateAveragePoints(teamId, currentGameweek);

  const gameweeksToCheck = Math.min(5, currentGameweek - 1);
  const startGameweek = currentGameweek - gameweeksToCheck;

  const scores = await Promise.all(
    Array.from({ length: gameweeksToCheck }, (_, i) =>
      getFPLGameweekScore(teamId, startGameweek + i)
    )
  );

  const formIndicators = scores.map(score =>
    score.points >= average ? 'W' : 'L'
  );

  return formIndicators.join('-');
}

export interface AdvantageResult {
  leader: 'A' | 'B' | 'tie';
  advantage: number;
  message: string;
}

export function calculateAdvantage(
  teamAAverage: number,
  teamBAverage: number
): AdvantageResult {
  const diff = teamAAverage - teamBAverage;

  if (diff > 0) {
    return {
      leader: 'A',
      advantage: diff,
      message: `⚡ +${diff} pts/GW (You!)`
    };
  } else if (diff < 0) {
    return {
      leader: 'B',
      advantage: Math.abs(diff),
      message: `⚡ ${diff} pts/GW (Them!)`
    };
  } else {
    return {
      leader: 'tie',
      advantage: 0,
      message: '⚡ Even match!'
    };
  }
}
