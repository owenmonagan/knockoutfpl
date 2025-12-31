/**
 * Test Users Helper - DataConnect Version
 *
 * Provides test user definitions and seeding/cleanup functions
 * for E2E tests using DataConnect.
 */

import { getAuth } from 'firebase-admin/auth';
import { getAdminApp } from './dataconnect-admin';
import { upsertUser } from './dataconnect-mutations';

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
 * Seeds a single test user in BOTH Firebase Auth AND DataConnect
 */
async function seedUser(user: TestUser): Promise<void> {
  const auth = getAuth(getAdminApp());

  try {
    // Create in Auth
    await auth.createUser({
      uid: user.uid,
      email: user.email,
      password: user.password,
      displayName: user.displayName,
    });
    console.log(`[+] Auth user created: ${user.displayName}`);
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error) {
      const firebaseError = error as { code: string };
      if (firebaseError.code === 'auth/uid-already-exists') {
        console.log(`[=] Auth user exists: ${user.displayName}`);
      } else {
        throw error;
      }
    } else {
      throw error;
    }
  }

  // Create in DataConnect
  await upsertUser({
    uid: user.uid,
    email: user.email,
  });
  console.log(`[+] DataConnect user upserted: ${user.displayName}`);
}

/**
 * Seeds test users in BOTH Firebase Auth AND DataConnect
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
 * Cleans up a single test user from Auth
 * Note: DataConnect data is ephemeral in emulator
 */
async function cleanupUser(user: TestUser): Promise<void> {
  const auth = getAuth(getAdminApp());

  try {
    await auth.deleteUser(user.uid);
    console.log(`[-] Auth user deleted: ${user.displayName}`);
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error) {
      const firebaseError = error as { code: string };
      if (firebaseError.code !== 'auth/user-not-found') {
        console.error(`Error cleaning up ${user.displayName}:`, error);
      }
    }
  }
}

/**
 * Cleans up test users from Auth
 * Note: DataConnect data is ephemeral and cleared on emulator restart
 */
export async function cleanupTestUsers(): Promise<void> {
  await cleanupUser(TEST_USERS.standard);
  await cleanupUser(TEST_USERS.creator);
  await cleanupUser(TEST_USERS.opponent);
  await cleanupUser(TEST_USERS.withNoTournaments);
}
