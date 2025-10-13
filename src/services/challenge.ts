import { collection, addDoc, doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { CreateChallengeData, Challenge } from '../types/challenge';

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

export async function getChallenge(challengeId: string): Promise<Challenge | null> {
  const challengeRef = doc(db, 'challenges', challengeId);
  const challengeSnap = await getDoc(challengeRef);

  if (!challengeSnap.exists()) {
    return null;
  }

  return {
    challengeId: challengeSnap.id,
    ...challengeSnap.data(),
  } as Challenge;
}

export async function getUserChallenges(userId: string): Promise<Challenge[]> {
  collection(db, 'challenges');
  return [];
}
