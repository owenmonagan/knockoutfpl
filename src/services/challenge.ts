import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { CreateChallengeData } from '../types/challenge';

export async function createChallenge(data: CreateChallengeData): Promise<string> {
  const challengesRef = collection(db, 'challenges');

  const docRef = await addDoc(challengesRef, {
    gameweek: data.gameweek,
    status: 'pending',
    creatorUserId: data.userId,
    creatorFplId: data.fplTeamId,
    creatorFplTeamName: data.fplTeamName,
    creatorScore: null,
    opponentUserId: null,
    opponentFplId: null,
    opponentFplTeamName: null,
    opponentScore: null,
    winnerId: null,
    isDraw: false,
    gameweekFinished: false,
    completedAt: null,
  });
  return docRef.id;
}
