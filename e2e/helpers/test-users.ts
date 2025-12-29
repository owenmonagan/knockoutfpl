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
  // Standard test user for most E2E tests
  standard: {
    uid: 'test-user-uid',
    email: 'testuser@knockoutfpl.com',
    password: 'TestPass123!',
    displayName: 'Test User',
    fplTeamId: 158256,
    fplTeamName: 'o-win',
  },
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
  // User with no tournaments - used for empty state testing
  withNoTournaments: {
    uid: 'no-tournament-user-uid',
    email: 'notournaments@knockoutfpl.com',
    password: 'TestPass123!',
    displayName: 'No Tournament User',
    fplTeamId: 158257,
    fplTeamName: 'Empty User',
  },
};

/**
 * Seeds a single test user in BOTH Firebase Auth AND Firestore
 */
async function seedUser(user: TestUser): Promise<void> {
  const auth = getAuth();
  const db = getFirestore();

  try {
    // Create in Auth
    await auth.createUser({
      uid: user.uid,
      email: user.email,
      password: user.password,
      displayName: user.displayName,
    });

    // Create in Firestore
    await db.collection('users').doc(user.uid).set({
      userId: user.uid,
      fplTeamId: user.fplTeamId,
      fplTeamName: user.fplTeamName,
      email: user.email,
      displayName: user.displayName,
      wins: 0,
      losses: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    console.log(`✅ ${user.displayName} seeded (Auth + Firestore)`);
  } catch (error: any) {
    if (error.code === 'auth/uid-already-exists') {
      console.log(`ℹ️  ${user.displayName} already exists`);
    } else {
      throw error;
    }
  }
}

/**
 * Seeds test users in BOTH Firebase Auth AND Firestore
 * This ensures users can login AND have profile data
 */
export async function seedTestUsers(): Promise<void> {
  // Seed all test users
  await seedUser(TEST_USERS.standard);
  await seedUser(TEST_USERS.creator);
  await seedUser(TEST_USERS.opponent);
  await seedUser(TEST_USERS.withNoTournaments);
}

/**
 * Cleans up a single test user from BOTH Auth AND Firestore
 */
async function cleanupUser(user: TestUser): Promise<void> {
  const auth = getAuth();
  const db = getFirestore();

  try {
    await auth.deleteUser(user.uid);
    await db.collection('users').doc(user.uid).delete();
    console.log(`✅ ${user.displayName} cleaned up`);
  } catch (error: any) {
    if (error.code !== 'auth/user-not-found') {
      console.error(`Error cleaning up ${user.displayName}:`, error);
    }
  }
}

/**
 * Cleans up test users from BOTH Auth AND Firestore
 */
export async function cleanupTestUsers(): Promise<void> {
  await cleanupUser(TEST_USERS.standard);
  await cleanupUser(TEST_USERS.creator);
  await cleanupUser(TEST_USERS.opponent);
  await cleanupUser(TEST_USERS.withNoTournaments);
}
