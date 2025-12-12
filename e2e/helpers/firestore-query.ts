import { getFirestore } from 'firebase-admin/firestore';

/**
 * DATABASE STATE VERIFICATION - SOURCE OF TRUTH
 *
 * These functions query Firestore directly to verify the database state
 * at each phase of the challenge lifecycle. This is our "source of truth"
 * for ensuring the system behaves correctly.
 */

export interface ChallengeDoc {
  challengeId: string;
  gameweek: number;
  status: string;
  creatorUserId: string;
  creatorFplId: number;
  creatorFplTeamName: string;
  creatorScore: number | null;
  opponentUserId: string | null;
  opponentFplId: number | null;
  opponentFplTeamName: string | null;
  opponentScore: number | null;
  winnerId: string | null;
  isDraw: boolean;
  gameweekFinished: boolean;
  completedAt: any;
}

/**
 * Gets a challenge document from Firestore
 * @param challengeId - The challenge document ID
 * @returns The challenge data or null if not found
 */
export async function getChallengeFromFirestore(challengeId: string): Promise<ChallengeDoc | null> {
  const db = getFirestore();
  
  const doc = await db.collection('challenges').doc(challengeId).get();
  
  if (!doc.exists) {
    return null;
  }
  
  return {
    challengeId: doc.id,
    ...doc.data(),
  } as ChallengeDoc;
}

/**
 * Verifies a challenge is in the expected state
 * Throws assertion error if state doesn't match
 */
export async function verifyChallengeState(
  challengeId: string,
  expected: {
    status?: string;
    gameweekFinished?: boolean;
    opponentUserId?: string | null;
    winnerId?: string | null;
    creatorScore?: number | null;
    opponentScore?: number | null;
  }
): Promise<ChallengeDoc> {
  const challenge = await getChallengeFromFirestore(challengeId);
  
  if (!challenge) {
    throw new Error(`Challenge ${challengeId} not found in Firestore`);
  }
  
  // Verify each expected field
  if (expected.status !== undefined && challenge.status !== expected.status) {
    throw new Error(`Expected status '${expected.status}' but got '${challenge.status}'`);
  }
  
  if (expected.gameweekFinished !== undefined && challenge.gameweekFinished !== expected.gameweekFinished) {
    throw new Error(`Expected gameweekFinished ${expected.gameweekFinished} but got ${challenge.gameweekFinished}`);
  }
  
  if (expected.opponentUserId !== undefined && challenge.opponentUserId !== expected.opponentUserId) {
    throw new Error(`Expected opponentUserId '${expected.opponentUserId}' but got '${challenge.opponentUserId}'`);
  }
  
  if (expected.winnerId !== undefined && challenge.winnerId !== expected.winnerId) {
    throw new Error(`Expected winnerId '${expected.winnerId}' but got '${challenge.winnerId}'`);
  }
  
  if (expected.creatorScore !== undefined && challenge.creatorScore !== expected.creatorScore) {
    throw new Error(`Expected creatorScore ${expected.creatorScore} but got ${challenge.creatorScore}`);
  }
  
  if (expected.opponentScore !== undefined && challenge.opponentScore !== expected.opponentScore) {
    throw new Error(`Expected opponentScore ${expected.opponentScore} but got ${challenge.opponentScore}'`);
  }
  
  console.log('✅ Database state verified:', expected);
  
  return challenge;
}

/**
 * Gets user document from Firestore
 */
export async function getUserFromFirestore(userId: string) {
  const db = getFirestore();
  
  const doc = await db.collection('users').doc(userId).get();
  
  if (!doc.exists) {
    return null;
  }
  
  return {
    userId: doc.id,
    ...doc.data(),
  };
}
