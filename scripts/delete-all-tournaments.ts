#!/usr/bin/env npx tsx
/**
 * Script to delete all tournaments and related data from the dev database
 *
 * This deletes in the correct order to respect foreign key constraints:
 * 1. MatchPicks (references Match, Participant)
 * 2. Matches (references Tournament)
 * 3. Rounds (references Tournament)
 * 4. Participants (references Tournament, Entry)
 * 5. Tournaments
 *
 * Usage: npx tsx scripts/delete-all-tournaments.ts [--dry-run]
 */

import { initializeApp } from 'firebase/app';
import { getDataConnect, executeMutation, executeQuery, mutationRef, queryRef } from 'firebase/data-connect';
import { connectorConfig } from '@knockoutfpl/dataconnect';

const firebaseConfig = {
  apiKey: "AIzaSyCZ2KDHJSRewJ6JLDsIdxYqnzvTFf_IGVc",
  authDomain: "knockoutfpl-dev.firebaseapp.com",
  projectId: "knockoutfpl-dev",
  storageBucket: "knockoutfpl-dev.firebasestorage.app",
  messagingSenderId: "23223093101",
  appId: "1:23223093101:web:1176fe6f832ddfb2eafc64"
};

const app = initializeApp(firebaseConfig);
const dataConnect = getDataConnect(app, connectorConfig);

interface Tournament {
  id: string;
  fplLeagueId: number;
  fplLeagueName: string;
  participantCount: number;
  status: string;
  createdAt: string;
}

async function getAllTournaments(): Promise<Tournament[]> {
  const ref = queryRef(dataConnect, 'GetAllTournaments');
  const result = await executeQuery(ref);
  return (result.data as { tournaments: Tournament[] }).tournaments;
}

async function deleteMatchPicksByTournament(tournamentId: string): Promise<number> {
  const ref = mutationRef(dataConnect, 'DeleteMatchPicksByTournament', { tournamentId });
  const result = await executeMutation(ref);
  return (result.data as { matchPick_deleteMany: number }).matchPick_deleteMany;
}

async function deleteMatchesByTournament(tournamentId: string): Promise<number> {
  const ref = mutationRef(dataConnect, 'DeleteMatchesByTournament', { tournamentId });
  const result = await executeMutation(ref);
  return (result.data as { match_deleteMany: number }).match_deleteMany;
}

async function deleteRoundsByTournament(tournamentId: string): Promise<number> {
  const ref = mutationRef(dataConnect, 'DeleteRoundsByTournament', { tournamentId });
  const result = await executeMutation(ref);
  return (result.data as { round_deleteMany: number }).round_deleteMany;
}

async function deleteParticipantsByTournament(tournamentId: string): Promise<number> {
  const ref = mutationRef(dataConnect, 'DeleteParticipantsByTournament', { tournamentId });
  const result = await executeMutation(ref);
  return (result.data as { participant_deleteMany: number }).participant_deleteMany;
}

async function deleteTournamentById(id: string): Promise<void> {
  const ref = mutationRef(dataConnect, 'DeleteTournamentById', { id });
  await executeMutation(ref);
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  console.log('='.repeat(60));
  console.log('Delete All Tournaments Script');
  console.log(dryRun ? '*** DRY RUN MODE - No data will be deleted ***' : '*** LIVE MODE - Data will be deleted! ***');
  console.log('='.repeat(60));
  console.log();

  try {
    // Fetch all tournaments
    console.log('Fetching all tournaments...');
    const tournaments = await getAllTournaments();

    if (tournaments.length === 0) {
      console.log('No tournaments found. Database is already clean.');
      return;
    }

    console.log(`Found ${tournaments.length} tournament(s):\n`);
    tournaments.forEach((t, i) => {
      console.log(`  ${i + 1}. ${t.fplLeagueName} (ID: ${t.id.slice(0, 8)}...)`);
      console.log(`     - League ID: ${t.fplLeagueId}`);
      console.log(`     - Participants: ${t.participantCount}`);
      console.log(`     - Status: ${t.status}`);
      console.log(`     - Created: ${t.createdAt}`);
      console.log();
    });

    if (dryRun) {
      console.log('DRY RUN: Would delete the above tournaments and all related data.');
      console.log('Run without --dry-run to actually delete.');
      return;
    }

    // Confirm deletion
    console.log('Starting deletion in 3 seconds... (Ctrl+C to cancel)');
    await new Promise(resolve => setTimeout(resolve, 3000));

    let totalMatchPicks = 0;
    let totalMatches = 0;
    let totalRounds = 0;
    let totalParticipants = 0;

    // Delete each tournament and its related data
    for (const tournament of tournaments) {
      console.log(`\nDeleting tournament: ${tournament.fplLeagueName} (${tournament.id.slice(0, 8)}...)...`);

      // Delete in FK order
      const matchPicks = await deleteMatchPicksByTournament(tournament.id);
      console.log(`  - Deleted ${matchPicks} match picks`);
      totalMatchPicks += matchPicks;

      const matches = await deleteMatchesByTournament(tournament.id);
      console.log(`  - Deleted ${matches} matches`);
      totalMatches += matches;

      const rounds = await deleteRoundsByTournament(tournament.id);
      console.log(`  - Deleted ${rounds} rounds`);
      totalRounds += rounds;

      const participants = await deleteParticipantsByTournament(tournament.id);
      console.log(`  - Deleted ${participants} participants`);
      totalParticipants += participants;

      await deleteTournamentById(tournament.id);
      console.log(`  - Deleted tournament`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('Deletion Complete!');
    console.log('='.repeat(60));
    console.log(`\nSummary:`);
    console.log(`  - Tournaments: ${tournaments.length}`);
    console.log(`  - Participants: ${totalParticipants}`);
    console.log(`  - Rounds: ${totalRounds}`);
    console.log(`  - Matches: ${totalMatches}`);
    console.log(`  - Match Picks: ${totalMatchPicks}`);
    console.log();

  } catch (error: any) {
    console.error('\nError:', error.message);
    if (error.details) console.error('Details:', error.details);
    process.exit(1);
  }
}

main();
