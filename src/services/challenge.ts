import { collection, addDoc, doc, getDoc, query, where, getDocs, updateDoc, Timestamp } from 'firebase/firestore';
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
    gameweekDeadline: Timestamp.fromDate(data.gameweekDeadline),
    gameweekFinished: false,
    completedAt: null,
    createdAt: Timestamp.now(),
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
  const challengesRef = collection(db, 'challenges');

  // Query challenges where user is creator
  const creatorWhereClause = where('creatorUserId', '==', userId);
  const creatorQuery = query(challengesRef, creatorWhereClause);
  const creatorSnapshot = await getDocs(creatorQuery);

  // Query challenges where user is opponent
  const opponentWhereClause = where('opponentUserId', '==', userId);
  const opponentQuery = query(challengesRef, opponentWhereClause);
  const opponentSnapshot = await getDocs(opponentQuery);

  // Map creator challenges
  const creatorChallenges = creatorSnapshot.docs.map((doc) => ({
    challengeId: doc.id,
    ...doc.data(),
  })) as Challenge[];

  // Map opponent challenges
  const opponentChallenges = opponentSnapshot.docs.map((doc) => ({
    challengeId: doc.id,
    ...doc.data(),
  })) as Challenge[];

  // Combine both arrays
  return [...creatorChallenges, ...opponentChallenges];
}

export async function acceptChallenge(
  challengeId: string,
  opponentUserId: string,
  opponentFplId: number,
  opponentFplTeamName: string
): Promise<void> {
  const challengeRef = doc(db, 'challenges', challengeId);
  await updateDoc(challengeRef, {
    opponentUserId,
    opponentFplId,
    opponentFplTeamName,
    status: 'accepted',
  });
}
