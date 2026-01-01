#!/usr/bin/env npx tsx
/**
 * Debug script to verify match_picks count and identify pagination issues
 */
import { initializeApp } from 'firebase/app';
import { getDataConnect } from 'firebase/data-connect';
import {
  connectorConfig,
  getLeagueTournaments,
  getAllTournamentMatchPicks,
  getTournamentRounds,
  getRoundMatches,
} from '@knockoutfpl/dataconnect';

const firebaseConfig = {
  apiKey: "AIzaSyCZ2KDHJSRewJ6JLDsIdxYqnzvTFf_IGVc",
  authDomain: "knockoutfpl-dev.firebaseapp.com",
  projectId: "knockoutfpl-dev",
};

const app = initializeApp(firebaseConfig);
const dataConnect = getDataConnect(app, connectorConfig);

const LEAGUE_ID = parseInt(process.argv[2] || '92341');

async function main() {
  console.log(`\n=== Debugging Match Picks for League ${LEAGUE_ID} ===\n`);

  // Get tournament
  const { data: leagueTournaments } = await getLeagueTournaments(dataConnect, { fplLeagueId: LEAGUE_ID });
  if (!leagueTournaments.tournaments?.length) {
    console.error('No tournament found');
    return;
  }

  const tournamentId = leagueTournaments.tournaments[0].id;
  console.log('Tournament ID:', tournamentId);

  // Method 1: getAllTournamentMatchPicks (the query used by UI)
  console.log('\n--- Method 1: getAllTournamentMatchPicks ---');
  const { data: allPicksData } = await getAllTournamentMatchPicks(dataConnect, { tournamentId });
  const allPicks = allPicksData.matchPicks || [];
  console.log('Total match_picks returned:', allPicks.length);

  // Group by matchId to see which matches have picks
  const picksByMatch = new Map<number, number>();
  for (const pick of allPicks) {
    picksByMatch.set(pick.matchId, (picksByMatch.get(pick.matchId) || 0) + 1);
  }
  console.log('Unique matches with picks:', picksByMatch.size);
  console.log('Match IDs with picks:', [...picksByMatch.keys()].sort((a, b) => a - b).join(', '));

  // Method 2: Count by querying each round individually
  console.log('\n--- Method 2: Query each round individually ---');
  const { data: roundsData } = await getTournamentRounds(dataConnect, { tournamentId });

  let totalExpectedPicks = 0;
  const missingMatches: number[] = [];

  for (const round of roundsData.rounds.sort((a, b) => a.roundNumber - b.roundNumber)) {
    const { data: matchesData } = await getRoundMatches(dataConnect, {
      tournamentId,
      roundNumber: round.roundNumber,
    });

    let roundPicks = 0;
    for (const match of matchesData.matches) {
      const expectedPicks = match.isBye ? 1 : 2;
      totalExpectedPicks += expectedPicks;

      const actualPicks = picksByMatch.get(match.matchId) || 0;
      roundPicks += actualPicks;

      if (actualPicks === 0) {
        missingMatches.push(match.matchId);
      }
    }

    console.log(`Round ${round.roundNumber}: ${matchesData.matches.length} matches, ${roundPicks} picks returned`);
  }

  console.log('\n--- Summary ---');
  console.log('Expected total picks (approx):', totalExpectedPicks);
  console.log('Actual picks returned:', allPicks.length);
  console.log('Missing matches (no picks returned):', missingMatches.length);
  if (missingMatches.length > 0) {
    console.log('Missing match IDs:', missingMatches.join(', '));
  }

  console.log('\n=== Done ===\n');
}

main().catch(console.error);
