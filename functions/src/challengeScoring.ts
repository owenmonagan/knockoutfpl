import { fetchFPLGameweekScore } from './fplApi';

export async function findCompletableChallenges(): Promise<any[]> {
  // TODO: Implement with Firestore
  return [];
}

export function determineWinner(
  creatorScore: number,
  opponentScore: number,
  creatorUserId: string,
  opponentUserId: string
): { winnerId: string | null; isDraw: boolean } {
  if (creatorScore > opponentScore) {
    return { winnerId: creatorUserId, isDraw: false };
  }
  if (opponentScore > creatorScore) {
    return { winnerId: opponentUserId, isDraw: false };
  }
  return { winnerId: null, isDraw: true };
}

export async function scoreChallenge(challenge: {
  challengeId: string;
  gameweek: number;
  creatorFplId: number;
  creatorUserId: string;
  opponentFplId: number;
  opponentUserId: string;
}): Promise<{
  creatorScore: number;
  opponentScore: number;
  winnerId: string | null;
  isDraw: boolean;
}> {
  // Fetch both scores from FPL API
  const [creatorData, opponentData] = await Promise.all([
    fetchFPLGameweekScore(challenge.creatorFplId, challenge.gameweek),
    fetchFPLGameweekScore(challenge.opponentFplId, challenge.gameweek),
  ]);

  const creatorScore = creatorData.entry_history.points;
  const opponentScore = opponentData.entry_history.points;

  // Determine winner
  const { winnerId, isDraw } = determineWinner(
    creatorScore,
    opponentScore,
    challenge.creatorUserId,
    challenge.opponentUserId
  );

  return {
    creatorScore,
    opponentScore,
    winnerId,
    isDraw,
  };
}
