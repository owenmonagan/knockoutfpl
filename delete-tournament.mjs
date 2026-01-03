import { initializeApp } from 'firebase/app';
import { getDataConnect, executeMutation, mutationRef } from 'firebase/data-connect';
import { connectorConfig } from '@knockoutfpl/dataconnect';

const firebaseConfig = {
  apiKey: "AIzaSyCZ2KDHJSRewJ6JLDsIdxYqnzvTFf_IGVc",
  authDomain: "knockoutfpl-dev.firebaseapp.com",
  projectId: "knockoutfpl-dev",
};

const app = initializeApp(firebaseConfig);
const dataConnect = getDataConnect(app, connectorConfig);

const TOURNAMENT_ID = '90ec652e2e7f409bb538d422a0e2b06c';

async function deleteTournament() {
  console.log('Deleting tournament:', TOURNAMENT_ID);

  // Delete in FK order
  console.log('  Deleting match picks...');
  const matchPicks = await executeMutation(
    mutationRef(dataConnect, 'DeleteMatchPicksByTournament', { tournamentId: TOURNAMENT_ID })
  );
  console.log('  Deleted', matchPicks.data.matchPick_deleteMany, 'match picks');

  console.log('  Deleting matches...');
  const matches = await executeMutation(
    mutationRef(dataConnect, 'DeleteMatchesByTournament', { tournamentId: TOURNAMENT_ID })
  );
  console.log('  Deleted', matches.data.match_deleteMany, 'matches');

  console.log('  Deleting rounds...');
  const rounds = await executeMutation(
    mutationRef(dataConnect, 'DeleteRoundsByTournament', { tournamentId: TOURNAMENT_ID })
  );
  console.log('  Deleted', rounds.data.round_deleteMany, 'rounds');

  console.log('  Deleting participants...');
  const participants = await executeMutation(
    mutationRef(dataConnect, 'DeleteParticipantsByTournament', { tournamentId: TOURNAMENT_ID })
  );
  console.log('  Deleted', participants.data.participant_deleteMany, 'participants');

  console.log('  Deleting tournament...');
  await executeMutation(
    mutationRef(dataConnect, 'DeleteTournamentById', { id: TOURNAMENT_ID })
  );
  console.log('  Tournament deleted!');
}

deleteTournament().catch(console.error);
