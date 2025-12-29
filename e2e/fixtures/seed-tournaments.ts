/**
 * Test Tournament Seeding Script
 *
 * Seeds test tournaments into the Firebase emulator for E2E testing.
 * This script should be run after starting the emulators.
 *
 * Usage:
 *   npm run emulators:e2e (in terminal 1)
 *   npm run e2e:seed (in terminal 2)
 *
 * Environment:
 *   FIRESTORE_EMULATOR_HOST - Set automatically by the npm script
 */

import { initializeApp, getApps, deleteApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { TEST_TOURNAMENTS, TEST_USERS } from './test-data';

// Cleanup any existing app instances
async function cleanupExistingApps() {
  const apps = getApps();
  for (const app of apps) {
    await deleteApp(app);
  }
}

async function initializeFirebase() {
  await cleanupExistingApps();

  // Set emulator hosts if not already set
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
  }
  if (!process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
  }

  const app = initializeApp({
    projectId: 'knockoutfpl-dev',
  });

  return {
    db: getFirestore(app),
    auth: getAuth(app),
  };
}

/**
 * Seeds a single user into Firebase Auth and Firestore
 */
async function seedUser(
  auth: ReturnType<typeof getAuth>,
  db: ReturnType<typeof getFirestore>,
  user: (typeof TEST_USERS)[keyof typeof TEST_USERS]
): Promise<void> {
  try {
    // Create user in Auth
    await auth.createUser({
      uid: user.uid,
      email: user.email,
      password: user.password,
      displayName: user.displayName,
    });

    // Create user document in Firestore
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

    console.log(`  [+] User seeded: ${user.displayName} (${user.email})`);
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error) {
      const firebaseError = error as { code: string };
      if (firebaseError.code === 'auth/uid-already-exists') {
        console.log(`  [=] User already exists: ${user.displayName}`);
        return;
      }
    }
    throw error;
  }
}

/**
 * Seeds all test users
 */
async function seedUsers(
  auth: ReturnType<typeof getAuth>,
  db: ReturnType<typeof getFirestore>
): Promise<void> {
  console.log('\n--- Seeding Test Users ---');

  for (const [key, user] of Object.entries(TEST_USERS)) {
    await seedUser(auth, db, user);
  }

  console.log('--- Users seeding complete ---\n');
}

/**
 * Seeds a single tournament into Firestore
 */
async function seedTournament(
  db: ReturnType<typeof getFirestore>,
  key: string,
  tournament: (typeof TEST_TOURNAMENTS)[keyof typeof TEST_TOURNAMENTS]
): Promise<void> {
  const docRef = db.collection('tournaments').doc(key);

  // Check if tournament already exists
  const existing = await docRef.get();
  if (existing.exists) {
    console.log(`  [=] Tournament already exists: ${key}`);
    return;
  }

  await docRef.set({
    ...tournament,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  console.log(`  [+] Tournament seeded: ${key} (${tournament.fplLeagueName})`);
}

/**
 * Seeds all test tournaments
 */
async function seedTournaments(
  db: ReturnType<typeof getFirestore>
): Promise<void> {
  console.log('--- Seeding Test Tournaments ---');

  for (const [key, tournament] of Object.entries(TEST_TOURNAMENTS)) {
    await seedTournament(db, key, tournament);
  }

  console.log('--- Tournaments seeding complete ---\n');
}

/**
 * Clears all test data from the emulator
 */
async function clearTestData(
  auth: ReturnType<typeof getAuth>,
  db: ReturnType<typeof getFirestore>
): Promise<void> {
  console.log('--- Clearing existing test data ---');

  // Clear tournaments
  for (const key of Object.keys(TEST_TOURNAMENTS)) {
    try {
      await db.collection('tournaments').doc(key).delete();
      console.log(`  [-] Deleted tournament: ${key}`);
    } catch {
      // Ignore if doesn't exist
    }
  }

  // Clear users
  for (const user of Object.values(TEST_USERS)) {
    try {
      await auth.deleteUser(user.uid);
      await db.collection('users').doc(user.uid).delete();
      console.log(`  [-] Deleted user: ${user.displayName}`);
    } catch {
      // Ignore if doesn't exist
    }
  }

  console.log('--- Clear complete ---\n');
}

/**
 * Main seeding function
 */
async function main() {
  console.log('========================================');
  console.log('   Knockout FPL - Test Data Seeder');
  console.log('========================================');
  console.log(`Firestore: ${process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080'}`);
  console.log(`Auth: ${process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099'}`);
  console.log('');

  try {
    const { db, auth } = await initializeFirebase();

    // Check for --clear flag
    const shouldClear = process.argv.includes('--clear');
    if (shouldClear) {
      await clearTestData(auth, db);
    }

    // Seed users first (tournaments reference user IDs)
    await seedUsers(auth, db);

    // Seed tournaments
    await seedTournaments(db);

    console.log('========================================');
    console.log('   Seeding Complete!');
    console.log('========================================');
    console.log('');
    console.log('Seeded tournaments:');
    for (const [key, tournament] of Object.entries(TEST_TOURNAMENTS)) {
      console.log(`  - ${key}: ${tournament.fplLeagueName} (${tournament.status})`);
    }
    console.log('');
    console.log('Seeded users:');
    for (const [key, user] of Object.entries(TEST_USERS)) {
      console.log(`  - ${key}: ${user.email}`);
    }
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

// Run the seeder
main();
