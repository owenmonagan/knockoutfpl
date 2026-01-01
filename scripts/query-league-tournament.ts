#!/usr/bin/env npx tsx
import { initializeApp } from 'firebase/app';
import { getDataConnect } from 'firebase/data-connect';
import {
  connectorConfig,
  getLeagueTournaments,
  getTournamentWithParticipants,
  getTournamentRounds,
  getRoundMatches,
  getMatchPicks,
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
  try {
    console.log(`\n=== Querying Tournament for League ${LEAGUE_ID} ===\n`);

    // Get tournament by league ID
    const { data: leagueTournaments } = await getLeagueTournaments(dataConnect, { fplLeagueId: LEAGUE_ID });

    if (!leagueTournaments.tournaments || leagueTournaments.tournaments.length === 0) {
      console.error('No tournament found for this league!');
      return;
    }

    const basicTournament = leagueTournaments.tournaments[0];
    const tournamentId = basicTournament.id;

    console.log('Tournament found:', {
      id: tournamentId,
      name: basicTournament.fplLeagueName,
      participantCount: basicTournament.participantCount,
      totalRounds: basicTournament.totalRounds,
      currentRound: basicTournament.currentRound,
      status: basicTournament.status,
    });

    // Get full tournament data
    const { data: tournamentData } = await getTournamentWithParticipants(dataConnect, { id: tournamentId });

    if (tournamentData.tournament) {
      console.log('\nTournament details:', {
        startEvent: tournamentData.tournament.startEvent,
        winnerEntryId: tournamentData.tournament.winnerEntryId,
      });
    }

    // Get rounds
    console.log('\n=== Rounds ===');
    const { data: roundsData } = await getTournamentRounds(dataConnect, { tournamentId });

    for (const round of roundsData.rounds.sort((a, b) => a.roundNumber - b.roundNumber)) {
      console.log(`\nRound ${round.roundNumber} (GW${round.event}) - STATUS: ${round.status}`);

      // Get matches for this round
      const { data: matchesData } = await getRoundMatches(dataConnect, {
        tournamentId,
        roundNumber: round.roundNumber,
      });

      let pendingMatches = 0;
      let completedMatches = 0;
      let activeMatches = 0;
      let otherMatches = 0;

      for (const match of matchesData.matches.sort((a, b) => a.positionInRound - b.positionInRound)) {
        const { data: picksData } = await getMatchPicks(dataConnect, {
          tournamentId,
          matchId: match.matchId,
        });

        const picks = picksData.matchPicks;
        const pickCount = picks.length;

        if (match.status === 'pending') pendingMatches++;
        else if (match.status === 'completed') completedMatches++;
        else if (match.status === 'active') activeMatches++;
        else otherMatches++;

        if (match.isBye) {
          const player = picks[0]?.entry;
          console.log(`  Match ${match.matchId}: BYE - ${player?.name || 'TBD'} [${match.status}]`);
        } else {
          const p1 = picks.find(p => p.slot === 1)?.entry;
          const p2 = picks.find(p => p.slot === 2)?.entry;
          const winner = match.winnerEntryId ? `Winner: ${match.winnerEntryId}` : 'No winner';
          console.log(`  Match ${match.matchId}: ${p1?.name || 'TBD'} vs ${p2?.name || 'TBD'} [${match.status}] ${winner} (picks: ${pickCount})`);
        }
      }

      console.log(`  Summary: ${completedMatches} completed, ${activeMatches} active, ${pendingMatches} pending, ${otherMatches} other`);
    }

    console.log('\n=== End Query ===\n');
  } catch (error: any) {
    console.error('Error:', error.message);
    if (error.stack) console.error(error.stack);
  }
}

main();
