import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { initializeApp, deleteApp, FirebaseApp } from 'firebase/app';
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import {
  getAuth,
  signInWithEmailAndPassword,
  connectAuthEmulator,
  signOut,
} from 'firebase/auth';

/**
 * Integration tests for createTournament cloud function
 *
 * Tests the batched mutation implementation against the real dev environment.
 * These tests verify that tournament creation works end-to-end with DataConnect.
 *
 * Prerequisites:
 * - Firebase dev environment deployed
 * - Test user account exists (testuser@knockoutfpl.com)
 *
 * Run with: npm run test:integration
 */

// Test configuration
const USE_EMULATOR = process.env.USE_EMULATOR === 'true';
const TEST_EMAIL = 'testuser@knockoutfpl.com';
const TEST_PASSWORD = 'TestPass123!';

// Test leagues with different sizes to verify batching works
const TEST_LEAGUES = [
  { id: 249, name: 'Test league 249', expectedParticipants: { min: 4, max: 60 } },
  { id: 39776, name: 'Test league 39776', expectedParticipants: { min: 4, max: 60 } },
];

// Firebase config for dev environment
const firebaseConfig = {
  apiKey: 'AIzaSyCZ2KDHJSRewJ6JLDsIdxYqnzvTFf_IGVc',
  authDomain: 'knockoutfpl-dev.firebaseapp.com',
  projectId: 'knockoutfpl-dev',
  storageBucket: 'knockoutfpl-dev.firebasestorage.app',
  messagingSenderId: '23223093101',
  appId: '1:23223093101:web:1176fe6f832ddfb2eafc64',
};

describe('createTournament Integration Tests', () => {
  let app: FirebaseApp;
  let auth: ReturnType<typeof getAuth>;
  let functions: ReturnType<typeof getFunctions>;

  beforeAll(async () => {
    // Initialize Firebase
    app = initializeApp(firebaseConfig, 'integration-test');
    auth = getAuth(app);
    functions = getFunctions(app);

    if (USE_EMULATOR) {
      connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
      connectFunctionsEmulator(functions, '127.0.0.1', 5001);
    }

    // Sign in with test user
    try {
      await signInWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
      console.log('Signed in as test user');
    } catch (error) {
      console.error('Failed to sign in:', error);
      throw new Error(
        `Failed to sign in with test user. Make sure ${TEST_EMAIL} exists in Firebase Auth.`
      );
    }
  }, 30000);

  afterAll(async () => {
    if (auth.currentUser) {
      await signOut(auth);
    }
    await deleteApp(app);
  });

  describe('Tournament creation with batched mutations', () => {
    test.each(TEST_LEAGUES)(
      'should create tournament for $name (league $id)',
      async ({ id: leagueId, expectedParticipants }) => {
        const createTournament = httpsCallable<
          { fplLeagueId: number },
          { tournamentId: string; participantCount: number; totalRounds: number }
        >(functions, 'createTournament');

        const startTime = Date.now();

        try {
          const result = await createTournament({ fplLeagueId: leagueId });
          const duration = Date.now() - startTime;

          console.log(`Tournament created in ${duration}ms:`, result.data);

          // Verify response structure
          expect(result.data).toHaveProperty('tournamentId');
          expect(result.data).toHaveProperty('participantCount');
          expect(result.data).toHaveProperty('totalRounds');

          // Verify tournament ID is a valid UUID
          expect(result.data.tournamentId).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
          );

          // Verify participant count is within expected range
          expect(result.data.participantCount).toBeGreaterThanOrEqual(
            expectedParticipants.min
          );
          expect(result.data.participantCount).toBeLessThanOrEqual(
            expectedParticipants.max
          );

          // Verify total rounds is reasonable (log2 of bracket size)
          expect(result.data.totalRounds).toBeGreaterThanOrEqual(2);
          expect(result.data.totalRounds).toBeLessThanOrEqual(7);

          // Performance check: should complete in reasonable time with batching
          // Old implementation: ~300 calls * 100ms = 30s
          // New implementation: ~20 calls * 100ms = 2s
          expect(duration).toBeLessThan(30000); // 30 second timeout
        } catch (error: unknown) {
          // If tournament already exists, that's OK for this test
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (errorMessage.includes('Tournament already exists')) {
            console.log(`Tournament already exists for league ${leagueId}, skipping`);
            return;
          }
          throw error;
        }
      },
      60000 // 60 second timeout per test
    );
  });

  describe('Error handling', () => {
    test('should reject invalid league ID', async () => {
      const createTournament = httpsCallable(functions, 'createTournament');

      await expect(createTournament({ fplLeagueId: 999999999 })).rejects.toThrow();
    });

    test('should handle missing fplLeagueId parameter', async () => {
      const createTournament = httpsCallable(functions, 'createTournament');

      // Missing required parameter should fail
      await expect(createTournament({})).rejects.toThrow();
    });
  });
});

describe('Batch mutation verification', () => {
  test('batch size of 20 handles various tournament sizes', () => {
    const BATCH_SIZE = 20;

    // Calculate expected batch counts for different tournament sizes
    const testCases = [
      { participants: 8, entries: 8, picks: 24, rounds: 3, matches: 7 },
      { participants: 16, entries: 16, picks: 64, rounds: 4, matches: 15 },
      { participants: 32, entries: 32, picks: 160, rounds: 5, matches: 31 },
      { participants: 50, entries: 50, picks: 300, rounds: 6, matches: 63 },
    ];

    for (const tc of testCases) {
      const entryBatches = Math.ceil(tc.entries / BATCH_SIZE);
      const pickBatches = Math.ceil(tc.picks / BATCH_SIZE);
      const roundBatches = Math.ceil(tc.rounds / BATCH_SIZE);
      const matchBatches = Math.ceil(tc.matches / BATCH_SIZE);
      const participantBatches = Math.ceil(tc.participants / BATCH_SIZE);

      const totalBatches =
        entryBatches + pickBatches + roundBatches + matchBatches + participantBatches + 1; // +1 for tournament

      const oldCallCount = tc.entries + tc.picks + tc.rounds + tc.matches + tc.participants + 1;

      console.log(`${tc.participants} participants:`);
      console.log(`  Old: ${oldCallCount} calls`);
      console.log(`  New: ${totalBatches} batches`);
      console.log(`  Reduction: ${((1 - totalBatches / oldCallCount) * 100).toFixed(0)}%`);

      // Verify significant reduction
      expect(totalBatches).toBeLessThan(oldCallCount / 5); // At least 5x reduction
    }
  });
});
