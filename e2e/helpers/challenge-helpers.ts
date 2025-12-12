import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { TEST_USERS } from './test-users';

export interface TestChallenge {
  challengeId: string;
  gameweek: number;
  status: 'pending' | 'accepted' | 'completed';
  creatorUserId: string;
  creatorFplId: number;
  creatorFplTeamName: string;
  opponentUserId: string | null;
  opponentFplId: number | null;
  opponentFplTeamName: string | null;
  gameweekDeadline: Date;
  gameweekFinished: boolean;
}

/**
 * Creates a challenge programmatically in Firestore
 * Bypasses UI flow for faster, more reliable testing
 */
export async function createTestChallenge(config: {
  status: 'pending' | 'accepted' | 'completed';
  gameweek: number;
  deadline: Date;
  gameweekFinished?: boolean;
}): Promise<string> {
  const db = getFirestore();
  
  const challengeData = {
    gameweek: config.gameweek,
    status: config.status,
    creatorUserId: TEST_USERS.creator.uid,
    creatorFplId: TEST_USERS.creator.fplTeamId,
    creatorFplTeamName: TEST_USERS.creator.fplTeamName,
    creatorScore: null,
    opponentUserId: config.status === 'pending' ? null : TEST_USERS.opponent.uid,
    opponentFplId: config.status === 'pending' ? null : TEST_USERS.opponent.fplTeamId,
    opponentFplTeamName: config.status === 'pending' ? null : TEST_USERS.opponent.fplTeamName,
    opponentScore: null,
    winnerId: null,
    isDraw: false,
    gameweekDeadline: Timestamp.fromDate(config.deadline),
    gameweekFinished: config.gameweekFinished ?? false,
    completedAt: null,
    createdAt: Timestamp.now(),
  };
  
  const docRef = await db.collection('challenges').add(challengeData);
  
  console.log(`✅ Test challenge created: ${docRef.id} (status: ${config.status})`);
  
  return docRef.id;
}

/**
 * Cleans up a test challenge from Firestore
 */
export async function cleanupTestChallenge(challengeId: string): Promise<void> {
  const db = getFirestore();
  
  try {
    await db.collection('challenges').doc(challengeId).delete();
    console.log(`✅ Test challenge cleaned up: ${challengeId}`);
  } catch (error: any) {
    console.error(`Error cleaning up challenge ${challengeId}:`, error);
  }
}

/**
 * Updates a challenge status (simulates acceptance or completion)
 */
export async function updateChallengeStatus(
  challengeId: string,
  updates: {
    status?: 'pending' | 'accepted' | 'completed';
    gameweekFinished?: boolean;
    opponentUserId?: string;
    opponentFplId?: number;
    opponentFplTeamName?: string;
  }
): Promise<void> {
  const db = getFirestore();
  
  await db.collection('challenges').doc(challengeId).update(updates);
  
  console.log(`✅ Challenge ${challengeId} updated:`, updates);
}
