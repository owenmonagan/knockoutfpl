#!/usr/bin/env npx tsx
/**
 * Query a tournament and its structure from Data Connect
 */

import { initializeApp } from 'firebase/app';
import { getDataConnect } from 'firebase/data-connect';
import {
  connectorConfig,
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

const TOURNAMENT_ID = process.argv[2] || 'da728edf-465e-488b-97ed-6c3ccb51b654';

async function main() {
  try {
    console.log(`\n=== Querying Tournament ${TOURNAMENT_ID} ===\n`);

    // Get tournament with participants
    const { data: tournamentData } = await getTournamentWithParticipants(dataConnect, { id: TOURNAMENT_ID });

    if (!tournamentData.tournament) {
      console.error('Tournament not found!');
      return;
    }

    const t = tournamentData.tournament;
    console.log('Tournament:', {
      id: t.id,
      name: t.fplLeagueName,
      fplLeagueId: t.fplLeagueId,
      participantCount: t.participantCount,
      totalRounds: t.totalRounds,
      currentRound: t.currentRound,
      startEvent: t.startEvent,
      status: t.status,
    });

    console.log('\n=== Participants ===');
    const participants = tournamentData.participants.sort((a, b) => a.seed - b.seed);
    for (const p of participants) {
      console.log(`  Seed ${p.seed}: ${p.teamName} (${p.managerName}) - ${p.status}`);
    }

    // Get rounds
    console.log('\n=== Rounds ===');
    const { data: roundsData } = await getTournamentRounds(dataConnect, { tournamentId: TOURNAMENT_ID });

    for (const round of roundsData.rounds.sort((a, b) => a.roundNumber - b.roundNumber)) {
      console.log(`\nRound ${round.roundNumber} (GW${round.event}) - ${round.status}`);

      // Get matches for this round
      const { data: matchesData } = await getRoundMatches(dataConnect, {
        tournamentId: TOURNAMENT_ID,
        roundNumber: round.roundNumber,
      });

      for (const match of matchesData.matches.sort((a, b) => a.positionInRound - b.positionInRound)) {
        const { data: picksData } = await getMatchPicks(dataConnect, {
          tournamentId: TOURNAMENT_ID,
          matchId: match.matchId,
        });

        const picks = picksData.matchPicks.sort((a, b) => a.slot - b.slot);

        if (match.isBye) {
          const player = picks[0]?.entry;
          console.log(`  Match ${match.matchId}: BYE - ${player?.name || 'TBD'}`);
        } else if (picks.length === 2) {
          const p1 = picks.find(p => p.slot === 1)?.entry;
          const p2 = picks.find(p => p.slot === 2)?.entry;
          const winner = match.winnerEntryId ? `Winner: ${match.winner?.name}` : 'Pending';
          console.log(`  Match ${match.matchId}: ${p1?.name || 'TBD'} vs ${p2?.name || 'TBD'} [${winner}]`);
        } else if (picks.length === 0) {
          console.log(`  Match ${match.matchId}: TBD vs TBD`);
        } else {
          console.log(`  Match ${match.matchId}: ${picks.length} picks - ${match.status}`);
        }
      }
    }

    console.log('\n=== Tournament Created Successfully! ===\n');
  } catch (error: any) {
    console.error('Error:', error.message);
    if (error.stack) console.error(error.stack);
  }
}

main();
