/**
 * Test Tournament Seeding Script - DataConnect Version
 *
 * Seeds test tournaments into the DataConnect emulator for E2E testing.
 * This script should be run after starting the emulators.
 *
 * Usage:
 *   npm run emulators:e2e (in terminal 1)
 *   npm run e2e:seed (in terminal 2)
 *
 * Environment:
 *   DATA_CONNECT_EMULATOR_HOST - Set automatically by the npm script
 *   FIREBASE_AUTH_EMULATOR_HOST - Set automatically by the npm script
 */

import { getAuth } from 'firebase-admin/auth';
import {
  initializeDataConnect,
  cleanupDataConnect,
  getAdminApp,
} from '../helpers/dataconnect-admin';
import {
  upsertUser,
  upsertEntry,
  createTournament,
  createRound,
  createParticipant,
  createMatch,
  createMatchPick,
  upsertPick,
} from '../helpers/dataconnect-mutations';
import { TEST_TOURNAMENTS, TEST_USERS } from './test-data';

// Current FPL season
const CURRENT_SEASON = '2024-25';

// =============================================================================
// TYPES
// =============================================================================

interface TestUser {
  uid: string;
  email: string;
  password: string;
  displayName: string;
  fplTeamId: number;
  fplTeamName: string;
}

interface TestParticipant {
  fplTeamId: number;
  fplTeamName: string;
  managerName: string;
  seed: number;
}

interface MatchPlayer {
  fplTeamId: number;
  seed: number;
  score: number | null;
}

interface TestMatch {
  id: string;
  player1: MatchPlayer | null;
  player2: MatchPlayer | null;
  winnerId: number | null;
  isBye: boolean;
}

interface TestRound {
  roundNumber: number;
  name: string;
  gameweek: number;
  matches: TestMatch[];
  isComplete: boolean;
}

interface TestTournament {
  id: string;
  fplLeagueId: number;
  fplLeagueName: string;
  creatorUserId: string;
  status: 'active' | 'completed';
  currentRound: number;
  totalRounds: number;
  startGameweek: number;
  winnerId: number | null;
  participants: TestParticipant[];
  rounds: TestRound[];
}

// =============================================================================
// SEEDING FUNCTIONS
// =============================================================================

/**
 * Seeds a single user into Firebase Auth and DataConnect
 */
async function seedUser(user: TestUser): Promise<void> {
  const auth = getAuth(getAdminApp());

  try {
    // Create user in Firebase Auth
    await auth.createUser({
      uid: user.uid,
      email: user.email,
      password: user.password,
      displayName: user.displayName,
    });
    console.log(`  [+] Auth user created: ${user.displayName}`);
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error) {
      const firebaseError = error as { code: string };
      if (firebaseError.code === 'auth/uid-already-exists') {
        console.log(`  [=] Auth user exists: ${user.displayName}`);
      } else {
        throw error;
      }
    } else {
      throw error;
    }
  }

  // Upsert user in DataConnect
  await upsertUser({
    uid: user.uid,
    email: user.email,
  });
  console.log(`  [+] DataConnect user upserted: ${user.displayName}`);
}

/**
 * Seeds an FPL entry into DataConnect
 */
async function seedEntry(
  entryId: number,
  name: string,
  managerName: string
): Promise<void> {
  // Parse manager name into first/last
  const nameParts = managerName.split(' ');
  const firstName = nameParts[0] || managerName;
  const lastName = nameParts.slice(1).join(' ') || undefined;

  await upsertEntry({
    entryId,
    season: CURRENT_SEASON,
    name,
    playerFirstName: firstName,
    playerLastName: lastName,
    rawJson: JSON.stringify({
      id: entryId,
      name,
      player_first_name: firstName,
      player_last_name: lastName,
    }),
  });
}

/**
 * Seeds all test users
 */
async function seedUsers(): Promise<void> {
  console.log('\n--- Seeding Test Users ---');

  for (const [, user] of Object.entries(TEST_USERS)) {
    await seedUser(user as TestUser);
  }

  console.log('--- Users seeding complete ---\n');
}

/**
 * Determine participant status based on tournament state
 */
function getParticipantStatus(
  participant: TestParticipant,
  tournament: TestTournament
): { status: string; eliminationRound: number | null } {
  // Check if this participant was eliminated in any completed round
  for (const round of tournament.rounds) {
    if (!round.isComplete) continue;

    for (const match of round.matches) {
      if (match.winnerId === null) continue;

      // Check if this participant was in this match and lost
      const wasPlayer1 = match.player1?.fplTeamId === participant.fplTeamId;
      const wasPlayer2 = match.player2?.fplTeamId === participant.fplTeamId;

      if (wasPlayer1 || wasPlayer2) {
        if (match.winnerId !== participant.fplTeamId) {
          return { status: 'eliminated', eliminationRound: round.roundNumber };
        }
      }
    }
  }

  // If tournament is completed, the winner is still active, everyone else was eliminated
  if (tournament.status === 'completed') {
    if (tournament.winnerId === participant.fplTeamId) {
      return { status: 'active', eliminationRound: null };
    }
  }

  return { status: 'active', eliminationRound: null };
}

/**
 * Seeds a single tournament with all related data
 */
async function seedTournament(
  key: string,
  tournament: TestTournament
): Promise<void> {
  // Generate a proper UUID for the tournament
  const tournamentId = crypto.randomUUID();

  console.log(`  Seeding tournament: ${key} -> ${tournamentId}`);

  // 1. Seed all entries for participants
  console.log(`    - Seeding ${tournament.participants.length} entries...`);
  for (const participant of tournament.participants) {
    await seedEntry(
      participant.fplTeamId,
      participant.fplTeamName,
      participant.managerName
    );
  }

  // 2. Create the tournament record
  console.log(`    - Creating tournament record...`);
  await createTournament({
    id: tournamentId,
    fplLeagueId: tournament.fplLeagueId,
    fplLeagueName: tournament.fplLeagueName,
    creatorUid: tournament.creatorUserId,
    participantCount: tournament.participants.length,
    totalRounds: tournament.totalRounds,
    startEvent: tournament.startGameweek,
    seedingMethod: 'league_rank',
    isTest: true,
    status: tournament.status,
    currentRound: tournament.currentRound,
    winnerEntryId: tournament.winnerId,
  });

  // 3. Create participants
  console.log(`    - Creating ${tournament.participants.length} participants...`);
  for (const participant of tournament.participants) {
    const { status, eliminationRound } = getParticipantStatus(
      participant,
      tournament
    );

    await createParticipant({
      tournamentId,
      entryId: participant.fplTeamId,
      teamName: participant.fplTeamName,
      managerName: participant.managerName,
      seed: participant.seed,
      leagueRank: participant.seed,
      leaguePoints: 100 - participant.seed,
      rawJson: JSON.stringify(participant),
      status,
      eliminationRound,
    });
  }

  // 4. Create rounds and matches
  let globalMatchId = 1;

  for (const round of tournament.rounds) {
    // Determine round status based on matches
    let roundStatus = 'pending';
    if (round.isComplete) {
      roundStatus = 'complete';
    } else if (round.roundNumber === tournament.currentRound) {
      roundStatus = 'active';
    }

    console.log(`    - Creating round ${round.roundNumber} (${round.name})...`);
    await createRound({
      tournamentId,
      roundNumber: round.roundNumber,
      event: round.gameweek,
      status: roundStatus,
    });

    // Create matches for this round
    for (let i = 0; i < round.matches.length; i++) {
      const match = round.matches[i];
      const matchId = globalMatchId++;
      const positionInRound = i + 1;

      // Calculate qualifies to match ID (for bracket navigation)
      // In round R with position P, winner goes to round R+1 match ceil(P/2)
      let qualifiesToMatchId: number | null = null;
      if (round.roundNumber < tournament.totalRounds) {
        // Calculate the match number in the next round
        const nextRoundMatchPosition = Math.ceil(positionInRound / 2);
        // Count total matches in all previous rounds + next round's position
        let matchesBeforeNextRound = 0;
        for (let r = 1; r <= round.roundNumber; r++) {
          matchesBeforeNextRound += tournament.rounds[r - 1].matches.length;
        }
        qualifiesToMatchId = matchesBeforeNextRound + nextRoundMatchPosition;
      }

      // Determine match status
      let matchStatus = 'pending';
      if (match.winnerId !== null) {
        matchStatus = 'complete';
      } else if (roundStatus === 'active') {
        matchStatus = 'active';
      }

      await createMatch({
        tournamentId,
        matchId,
        roundNumber: round.roundNumber,
        positionInRound,
        qualifiesToMatchId,
        isBye: match.isBye,
        status: matchStatus,
        winnerEntryId: match.winnerId,
      });

      // Create match picks (players in the match)
      if (match.player1) {
        await createMatchPick({
          tournamentId,
          matchId,
          entryId: match.player1.fplTeamId,
          slot: 1,
        });

        // If there's a score, create a pick record
        if (match.player1.score !== null) {
          await upsertPick({
            entryId: match.player1.fplTeamId,
            event: round.gameweek,
            points: match.player1.score,
            rawJson: JSON.stringify({ points: match.player1.score }),
            isFinal: true,
          });
        }
      }

      if (match.player2) {
        await createMatchPick({
          tournamentId,
          matchId,
          entryId: match.player2.fplTeamId,
          slot: 2,
        });

        // If there's a score, create a pick record
        if (match.player2.score !== null) {
          await upsertPick({
            entryId: match.player2.fplTeamId,
            event: round.gameweek,
            points: match.player2.score,
            rawJson: JSON.stringify({ points: match.player2.score }),
            isFinal: true,
          });
        }
      }
    }
  }

  console.log(`  [+] Tournament seeded: ${key} (${tournament.fplLeagueName})`);
}

/**
 * Seeds all test tournaments
 */
async function seedTournaments(): Promise<void> {
  console.log('--- Seeding Test Tournaments ---');

  for (const [key, tournament] of Object.entries(TEST_TOURNAMENTS)) {
    await seedTournament(key, tournament as TestTournament);
  }

  console.log('--- Tournaments seeding complete ---\n');
}

/**
 * Clears test users from Firebase Auth
 * Note: DataConnect data is cleared when emulator restarts
 */
async function clearTestUsers(): Promise<void> {
  console.log('--- Clearing test users from Auth ---');
  const auth = getAuth(getAdminApp());

  for (const user of Object.values(TEST_USERS) as TestUser[]) {
    try {
      await auth.deleteUser(user.uid);
      console.log(`  [-] Deleted user: ${user.displayName}`);
    } catch {
      // Ignore if doesn't exist
    }
  }

  console.log('--- Clear complete ---\n');
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  console.log('========================================');
  console.log('   Knockout FPL - Test Data Seeder');
  console.log('        (DataConnect Version)');
  console.log('========================================');
  console.log(`DataConnect: ${process.env.DATA_CONNECT_EMULATOR_HOST || '127.0.0.1:9399'}`);
  console.log(`Auth: ${process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099'}`);
  console.log('');

  try {
    // Initialize DataConnect
    await initializeDataConnect();

    // Check for --clear flag
    const shouldClear = process.argv.includes('--clear');
    if (shouldClear) {
      await clearTestUsers();
    }

    // Seed users first (tournaments reference user IDs)
    await seedUsers();

    // Seed tournaments
    await seedTournaments();

    console.log('========================================');
    console.log('   Seeding Complete!');
    console.log('========================================');
    console.log('');
    console.log('Seeded tournaments:');
    for (const [key, tournament] of Object.entries(TEST_TOURNAMENTS)) {
      const t = tournament as TestTournament;
      console.log(`  - ${key}: ${t.fplLeagueName} (${t.status})`);
    }
    console.log('');
    console.log('Seeded users:');
    for (const [key, user] of Object.entries(TEST_USERS) as [string, TestUser][]) {
      console.log(`  - ${key}: ${user.email}`);
    }
    console.log('');

    // Cleanup
    await cleanupDataConnect();

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    await cleanupDataConnect();
    process.exit(1);
  }
}

// Run the seeder
main();
