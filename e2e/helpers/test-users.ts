import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

export interface TestUser {
  uid: string;
  email: string;
  password: string;
  displayName: string;
  fplTeamId: number;
  fplTeamName: string;
}

export const TEST_USERS = {
  creator: {
    uid: 'test-creator-uid',
    email: 'creator@knockoutfpl.com',
    password: 'TestPass123!',
    displayName: 'Test Creator',
    fplTeamId: 158256,
    fplTeamName: 'Creator FC',
  },
  opponent: {
    uid: 'test-opponent-uid',
    email: 'opponent@knockoutfpl.com',
    password: 'TestPass123!',
    displayName: 'Test Opponent',
    fplTeamId: 2780009,
    fplTeamName: 'Opponent FC',
  },
};

/**
 * Seeds test users in BOTH Firebase Auth AND Firestore
 * This ensures users can login AND have profile data
 */
export async function seedTestUsers(): Promise<void> {
  const auth = getAuth();
  const db = getFirestore();
  
  // Seed Creator
  try {
    // Create in Auth
    await auth.createUser({
      uid: TEST_USERS.creator.uid,
      email: TEST_USERS.creator.email,
      password: TEST_USERS.creator.password,
      displayName: TEST_USERS.creator.displayName,
    });
    
    // Create in Firestore
    await db.collection('users').doc(TEST_USERS.creator.uid).set({
      userId: TEST_USERS.creator.uid,
      fplTeamId: TEST_USERS.creator.fplTeamId,
      fplTeamName: TEST_USERS.creator.fplTeamName,
      email: TEST_USERS.creator.email,
      displayName: TEST_USERS.creator.displayName,
      wins: 0,
      losses: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    console.log('✅ Creator user seeded (Auth + Firestore)');
  } catch (error: any) {
    if (error.code === 'auth/uid-already-exists') {
      console.log('ℹ️  Creator user already exists');
    } else {
      throw error;
    }
  }
  
  // Seed Opponent
  try {
    // Create in Auth
    await auth.createUser({
      uid: TEST_USERS.opponent.uid,
      email: TEST_USERS.opponent.email,
      password: TEST_USERS.opponent.password,
      displayName: TEST_USERS.opponent.displayName,
    });
    
    // Create in Firestore
    await db.collection('users').doc(TEST_USERS.opponent.uid).set({
      userId: TEST_USERS.opponent.uid,
      fplTeamId: TEST_USERS.opponent.fplTeamId,
      fplTeamName: TEST_USERS.opponent.fplTeamName,
      email: TEST_USERS.opponent.email,
      displayName: TEST_USERS.opponent.displayName,
      wins: 0,
      losses: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    console.log('✅ Opponent user seeded (Auth + Firestore)');
  } catch (error: any) {
    if (error.code === 'auth/uid-already-exists') {
      console.log('ℹ️  Opponent user already exists');
    } else {
      throw error;
    }
  }
}

/**
 * Cleans up test users from BOTH Auth AND Firestore
 */
export async function cleanupTestUsers(): Promise<void> {
  const auth = getAuth();
  const db = getFirestore();
  
  // Cleanup Creator
  try {
    await auth.deleteUser(TEST_USERS.creator.uid);
    await db.collection('users').doc(TEST_USERS.creator.uid).delete();
    console.log('✅ Creator user cleaned up');
  } catch (error: any) {
    if (error.code !== 'auth/user-not-found') {
      console.error('Error cleaning up creator:', error);
    }
  }
  
  // Cleanup Opponent
  try {
    await auth.deleteUser(TEST_USERS.opponent.uid);
    await db.collection('users').doc(TEST_USERS.opponent.uid).delete();
    console.log('✅ Opponent user cleaned up');
  } catch (error: any) {
    if (error.code !== 'auth/user-not-found') {
      console.error('Error cleaning up opponent:', error);
    }
  }
}
