import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'default',
  service: 'knockoutfpl-dev-service',
  location: 'us-east1'
};

export const upsertUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertUser', inputVars);
}
upsertUserRef.operationName = 'UpsertUser';

export function upsertUser(dcOrVars, vars) {
  return executeMutation(upsertUserRef(dcOrVars, vars));
}

export const connectFplEntryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ConnectFplEntry', inputVars);
}
connectFplEntryRef.operationName = 'ConnectFplEntry';

export function connectFplEntry(dcOrVars, vars) {
  return executeMutation(connectFplEntryRef(dcOrVars, vars));
}

export const upsertEntryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertEntry', inputVars);
}
upsertEntryRef.operationName = 'UpsertEntry';

export function upsertEntry(dcOrVars, vars) {
  return executeMutation(upsertEntryRef(dcOrVars, vars));
}

export const upsertPickRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertPick', inputVars);
}
upsertPickRef.operationName = 'UpsertPick';

export function upsertPick(dcOrVars, vars) {
  return executeMutation(upsertPickRef(dcOrVars, vars));
}

export const upsertLeagueRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertLeague', inputVars);
}
upsertLeagueRef.operationName = 'UpsertLeague';

export function upsertLeague(dcOrVars, vars) {
  return executeMutation(upsertLeagueRef(dcOrVars, vars));
}

export const upsertLeagueEntriesBatchRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertLeagueEntriesBatch', inputVars);
}
upsertLeagueEntriesBatchRef.operationName = 'UpsertLeagueEntriesBatch';

export function upsertLeagueEntriesBatch(dcOrVars, vars) {
  return executeMutation(upsertLeagueEntriesBatchRef(dcOrVars, vars));
}

export const deleteStaleLeagueEntriesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteStaleLeagueEntries', inputVars);
}
deleteStaleLeagueEntriesRef.operationName = 'DeleteStaleLeagueEntries';

export function deleteStaleLeagueEntries(dcOrVars, vars) {
  return executeMutation(deleteStaleLeagueEntriesRef(dcOrVars, vars));
}

export const upsertEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertEvent', inputVars);
}
upsertEventRef.operationName = 'UpsertEvent';

export function upsertEvent(dcOrVars, vars) {
  return executeMutation(upsertEventRef(dcOrVars, vars));
}

export const createTournamentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateTournament', inputVars);
}
createTournamentRef.operationName = 'CreateTournament';

export function createTournament(dcOrVars, vars) {
  return executeMutation(createTournamentRef(dcOrVars, vars));
}

export const createTournamentWithImportStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateTournamentWithImportStatus', inputVars);
}
createTournamentWithImportStatusRef.operationName = 'CreateTournamentWithImportStatus';

export function createTournamentWithImportStatus(dcOrVars, vars) {
  return executeMutation(createTournamentWithImportStatusRef(dcOrVars, vars));
}

export const updateTournamentImportProgressRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateTournamentImportProgress', inputVars);
}
updateTournamentImportProgressRef.operationName = 'UpdateTournamentImportProgress';

export function updateTournamentImportProgress(dcOrVars, vars) {
  return executeMutation(updateTournamentImportProgressRef(dcOrVars, vars));
}

export const finalizeTournamentImportRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'FinalizeTournamentImport', inputVars);
}
finalizeTournamentImportRef.operationName = 'FinalizeTournamentImport';

export function finalizeTournamentImport(dcOrVars, vars) {
  return executeMutation(finalizeTournamentImportRef(dcOrVars, vars));
}

export const updateTournamentStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateTournamentStatus', inputVars);
}
updateTournamentStatusRef.operationName = 'UpdateTournamentStatus';

export function updateTournamentStatus(dcOrVars, vars) {
  return executeMutation(updateTournamentStatusRef(dcOrVars, vars));
}

export const setTournamentWinnerRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SetTournamentWinner', inputVars);
}
setTournamentWinnerRef.operationName = 'SetTournamentWinner';

export function setTournamentWinner(dcOrVars, vars) {
  return executeMutation(setTournamentWinnerRef(dcOrVars, vars));
}

export const advanceTournamentRoundRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AdvanceTournamentRound', inputVars);
}
advanceTournamentRoundRef.operationName = 'AdvanceTournamentRound';

export function advanceTournamentRound(dcOrVars, vars) {
  return executeMutation(advanceTournamentRoundRef(dcOrVars, vars));
}

export const createRoundRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateRound', inputVars);
}
createRoundRef.operationName = 'CreateRound';

export function createRound(dcOrVars, vars) {
  return executeMutation(createRoundRef(dcOrVars, vars));
}

export const updateRoundRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateRound', inputVars);
}
updateRoundRef.operationName = 'UpdateRound';

export function updateRound(dcOrVars, vars) {
  return executeMutation(updateRoundRef(dcOrVars, vars));
}

export const updateRoundUpdatedAtRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateRoundUpdatedAt', inputVars);
}
updateRoundUpdatedAtRef.operationName = 'UpdateRoundUpdatedAt';

export function updateRoundUpdatedAt(dcOrVars, vars) {
  return executeMutation(updateRoundUpdatedAtRef(dcOrVars, vars));
}

export const updateMatchUpdatedAtRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateMatchUpdatedAt', inputVars);
}
updateMatchUpdatedAtRef.operationName = 'UpdateMatchUpdatedAt';

export function updateMatchUpdatedAt(dcOrVars, vars) {
  return executeMutation(updateMatchUpdatedAtRef(dcOrVars, vars));
}

export const createParticipantRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateParticipant', inputVars);
}
createParticipantRef.operationName = 'CreateParticipant';

export function createParticipant(dcOrVars, vars) {
  return executeMutation(createParticipantRef(dcOrVars, vars));
}

export const updateParticipantRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateParticipant', inputVars);
}
updateParticipantRef.operationName = 'UpdateParticipant';

export function updateParticipant(dcOrVars, vars) {
  return executeMutation(updateParticipantRef(dcOrVars, vars));
}

export const createMatchRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateMatch', inputVars);
}
createMatchRef.operationName = 'CreateMatch';

export function createMatch(dcOrVars, vars) {
  return executeMutation(createMatchRef(dcOrVars, vars));
}

export const updateMatchRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateMatch', inputVars);
}
updateMatchRef.operationName = 'UpdateMatch';

export function updateMatch(dcOrVars, vars) {
  return executeMutation(updateMatchRef(dcOrVars, vars));
}

export const createMatchPickRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateMatchPick', inputVars);
}
createMatchPickRef.operationName = 'CreateMatchPick';

export function createMatchPick(dcOrVars, vars) {
  return executeMutation(createMatchPickRef(dcOrVars, vars));
}

export const deleteTournamentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteTournament', inputVars);
}
deleteTournamentRef.operationName = 'DeleteTournament';

export function deleteTournament(dcOrVars, vars) {
  return executeMutation(deleteTournamentRef(dcOrVars, vars));
}

export const deleteMatchPicksByTournamentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteMatchPicksByTournament', inputVars);
}
deleteMatchPicksByTournamentRef.operationName = 'DeleteMatchPicksByTournament';

export function deleteMatchPicksByTournament(dcOrVars, vars) {
  return executeMutation(deleteMatchPicksByTournamentRef(dcOrVars, vars));
}

export const deleteMatchesByTournamentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteMatchesByTournament', inputVars);
}
deleteMatchesByTournamentRef.operationName = 'DeleteMatchesByTournament';

export function deleteMatchesByTournament(dcOrVars, vars) {
  return executeMutation(deleteMatchesByTournamentRef(dcOrVars, vars));
}

export const deleteRoundsByTournamentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteRoundsByTournament', inputVars);
}
deleteRoundsByTournamentRef.operationName = 'DeleteRoundsByTournament';

export function deleteRoundsByTournament(dcOrVars, vars) {
  return executeMutation(deleteRoundsByTournamentRef(dcOrVars, vars));
}

export const deleteParticipantsByTournamentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteParticipantsByTournament', inputVars);
}
deleteParticipantsByTournamentRef.operationName = 'DeleteParticipantsByTournament';

export function deleteParticipantsByTournament(dcOrVars, vars) {
  return executeMutation(deleteParticipantsByTournamentRef(dcOrVars, vars));
}

export const deleteTournamentByIdRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteTournamentById', inputVars);
}
deleteTournamentByIdRef.operationName = 'DeleteTournamentById';

export function deleteTournamentById(dcOrVars, vars) {
  return executeMutation(deleteTournamentByIdRef(dcOrVars, vars));
}

export const createEmailQueueEntryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateEmailQueueEntry', inputVars);
}
createEmailQueueEntryRef.operationName = 'CreateEmailQueueEntry';

export function createEmailQueueEntry(dcOrVars, vars) {
  return executeMutation(createEmailQueueEntryRef(dcOrVars, vars));
}

export const createParticipantLeaguesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateParticipantLeagues', inputVars);
}
createParticipantLeaguesRef.operationName = 'CreateParticipantLeagues';

export function createParticipantLeagues(dcOrVars, vars) {
  return executeMutation(createParticipantLeaguesRef(dcOrVars, vars));
}

export const upsertParticipantLeagueRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertParticipantLeague', inputVars);
}
upsertParticipantLeagueRef.operationName = 'UpsertParticipantLeague';

export function upsertParticipantLeague(dcOrVars, vars) {
  return executeMutation(upsertParticipantLeagueRef(dcOrVars, vars));
}

export const getUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUser', inputVars);
}
getUserRef.operationName = 'GetUser';

export function getUser(dcOrVars, vars) {
  return executeQuery(getUserRef(dcOrVars, vars));
}

export const getEntryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetEntry', inputVars);
}
getEntryRef.operationName = 'GetEntry';

export function getEntry(dcOrVars, vars) {
  return executeQuery(getEntryRef(dcOrVars, vars));
}

export const getEntriesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetEntries', inputVars);
}
getEntriesRef.operationName = 'GetEntries';

export function getEntries(dcOrVars, vars) {
  return executeQuery(getEntriesRef(dcOrVars, vars));
}

export const getPickRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetPick', inputVars);
}
getPickRef.operationName = 'GetPick';

export function getPick(dcOrVars, vars) {
  return executeQuery(getPickRef(dcOrVars, vars));
}

export const getPicksForEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetPicksForEvent', inputVars);
}
getPicksForEventRef.operationName = 'GetPicksForEvent';

export function getPicksForEvent(dcOrVars, vars) {
  return executeQuery(getPicksForEventRef(dcOrVars, vars));
}

export const getLeagueRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetLeague', inputVars);
}
getLeagueRef.operationName = 'GetLeague';

export function getLeague(dcOrVars, vars) {
  return executeQuery(getLeagueRef(dcOrVars, vars));
}

export const getLeaguesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetLeagues', inputVars);
}
getLeaguesRef.operationName = 'GetLeagues';

export function getLeagues(dcOrVars, vars) {
  return executeQuery(getLeaguesRef(dcOrVars, vars));
}

export const getLeagueRefreshStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetLeagueRefreshStatus', inputVars);
}
getLeagueRefreshStatusRef.operationName = 'GetLeagueRefreshStatus';

export function getLeagueRefreshStatus(dcOrVars, vars) {
  return executeQuery(getLeagueRefreshStatusRef(dcOrVars, vars));
}

export const getLeagueEntriesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetLeagueEntries', inputVars);
}
getLeagueEntriesRef.operationName = 'GetLeagueEntries';

export function getLeagueEntries(dcOrVars, vars) {
  return executeQuery(getLeagueEntriesRef(dcOrVars, vars));
}

export const getTournamentEntriesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetTournamentEntries', inputVars);
}
getTournamentEntriesRef.operationName = 'GetTournamentEntries';

export function getTournamentEntries(dcOrVars, vars) {
  return executeQuery(getTournamentEntriesRef(dcOrVars, vars));
}

export const getUserTournamentEntryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserTournamentEntry', inputVars);
}
getUserTournamentEntryRef.operationName = 'GetUserTournamentEntry';

export function getUserTournamentEntry(dcOrVars, vars) {
  return executeQuery(getUserTournamentEntryRef(dcOrVars, vars));
}

export const getCurrentEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCurrentEvent', inputVars);
}
getCurrentEventRef.operationName = 'GetCurrentEvent';

export function getCurrentEvent(dcOrVars, vars) {
  return executeQuery(getCurrentEventRef(dcOrVars, vars));
}

export const getEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetEvent', inputVars);
}
getEventRef.operationName = 'GetEvent';

export function getEvent(dcOrVars, vars) {
  return executeQuery(getEventRef(dcOrVars, vars));
}

export const getSeasonEventsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetSeasonEvents', inputVars);
}
getSeasonEventsRef.operationName = 'GetSeasonEvents';

export function getSeasonEvents(dcOrVars, vars) {
  return executeQuery(getSeasonEventsRef(dcOrVars, vars));
}

export const getEventsNeedingFinalizationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetEventsNeedingFinalization', inputVars);
}
getEventsNeedingFinalizationRef.operationName = 'GetEventsNeedingFinalization';

export function getEventsNeedingFinalization(dcOrVars, vars) {
  return executeQuery(getEventsNeedingFinalizationRef(dcOrVars, vars));
}

export const getFinalizedEventsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetFinalizedEvents', inputVars);
}
getFinalizedEventsRef.operationName = 'GetFinalizedEvents';

export function getFinalizedEvents(dcOrVars, vars) {
  return executeQuery(getFinalizedEventsRef(dcOrVars, vars));
}

export const getEventFinalizationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetEventFinalization', inputVars);
}
getEventFinalizationRef.operationName = 'GetEventFinalization';

export function getEventFinalization(dcOrVars, vars) {
  return executeQuery(getEventFinalizationRef(dcOrVars, vars));
}

export const getTournamentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetTournament', inputVars);
}
getTournamentRef.operationName = 'GetTournament';

export function getTournament(dcOrVars, vars) {
  return executeQuery(getTournamentRef(dcOrVars, vars));
}

export const getTournamentWithParticipantsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetTournamentWithParticipants', inputVars);
}
getTournamentWithParticipantsRef.operationName = 'GetTournamentWithParticipants';

export function getTournamentWithParticipants(dcOrVars, vars) {
  return executeQuery(getTournamentWithParticipantsRef(dcOrVars, vars));
}

export const getUserTournamentsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserTournaments', inputVars);
}
getUserTournamentsRef.operationName = 'GetUserTournaments';

export function getUserTournaments(dcOrVars, vars) {
  return executeQuery(getUserTournamentsRef(dcOrVars, vars));
}

export const getLeagueTournamentsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetLeagueTournaments', inputVars);
}
getLeagueTournamentsRef.operationName = 'GetLeagueTournaments';

export function getLeagueTournaments(dcOrVars, vars) {
  return executeQuery(getLeagueTournamentsRef(dcOrVars, vars));
}

export const getAllTournamentsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetAllTournaments');
}
getAllTournamentsRef.operationName = 'GetAllTournaments';

export function getAllTournaments(dc) {
  return executeQuery(getAllTournamentsRef(dc));
}

export const getTournamentRoundsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetTournamentRounds', inputVars);
}
getTournamentRoundsRef.operationName = 'GetTournamentRounds';

export function getTournamentRounds(dcOrVars, vars) {
  return executeQuery(getTournamentRoundsRef(dcOrVars, vars));
}

export const getRoundRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetRound', inputVars);
}
getRoundRef.operationName = 'GetRound';

export function getRound(dcOrVars, vars) {
  return executeQuery(getRoundRef(dcOrVars, vars));
}

export const getActiveRoundsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetActiveRounds', inputVars);
}
getActiveRoundsRef.operationName = 'GetActiveRounds';

export function getActiveRounds(dcOrVars, vars) {
  return executeQuery(getActiveRoundsRef(dcOrVars, vars));
}

export const getPendingActiveRoundsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetPendingActiveRounds', inputVars);
}
getPendingActiveRoundsRef.operationName = 'GetPendingActiveRounds';

export function getPendingActiveRounds(dcOrVars, vars) {
  return executeQuery(getPendingActiveRoundsRef(dcOrVars, vars));
}

export const getRoundMatchesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetRoundMatches', inputVars);
}
getRoundMatchesRef.operationName = 'GetRoundMatches';

export function getRoundMatches(dcOrVars, vars) {
  return executeQuery(getRoundMatchesRef(dcOrVars, vars));
}

export const getMatchesInRangeRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMatchesInRange', inputVars);
}
getMatchesInRangeRef.operationName = 'GetMatchesInRange';

export function getMatchesInRange(dcOrVars, vars) {
  return executeQuery(getMatchesInRangeRef(dcOrVars, vars));
}

export const getMatchRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMatch', inputVars);
}
getMatchRef.operationName = 'GetMatch';

export function getMatch(dcOrVars, vars) {
  return executeQuery(getMatchRef(dcOrVars, vars));
}

export const getMatchPicksRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMatchPicks', inputVars);
}
getMatchPicksRef.operationName = 'GetMatchPicks';

export function getMatchPicks(dcOrVars, vars) {
  return executeQuery(getMatchPicksRef(dcOrVars, vars));
}

export const getAllTournamentMatchPicksRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetAllTournamentMatchPicks', inputVars);
}
getAllTournamentMatchPicksRef.operationName = 'GetAllTournamentMatchPicks';

export function getAllTournamentMatchPicks(dcOrVars, vars) {
  return executeQuery(getAllTournamentMatchPicksRef(dcOrVars, vars));
}

export const getUserMatchesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserMatches', inputVars);
}
getUserMatchesRef.operationName = 'GetUserMatches';

export function getUserMatches(dcOrVars, vars) {
  return executeQuery(getUserMatchesRef(dcOrVars, vars));
}

export const searchParticipantsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'SearchParticipants', inputVars);
}
searchParticipantsRef.operationName = 'SearchParticipants';

export function searchParticipants(dcOrVars, vars) {
  return executeQuery(searchParticipantsRef(dcOrVars, vars));
}

export const getParticipantRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetParticipant', inputVars);
}
getParticipantRef.operationName = 'GetParticipant';

export function getParticipant(dcOrVars, vars) {
  return executeQuery(getParticipantRef(dcOrVars, vars));
}

export const getActiveParticipantsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetActiveParticipants', inputVars);
}
getActiveParticipantsRef.operationName = 'GetActiveParticipants';

export function getActiveParticipants(dcOrVars, vars) {
  return executeQuery(getActiveParticipantsRef(dcOrVars, vars));
}

export const getUserParticipationsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserParticipations', inputVars);
}
getUserParticipationsRef.operationName = 'GetUserParticipations';

export function getUserParticipations(dcOrVars, vars) {
  return executeQuery(getUserParticipationsRef(dcOrVars, vars));
}

export const getRoundsInEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetRoundsInEvent', inputVars);
}
getRoundsInEventRef.operationName = 'GetRoundsInEvent';

export function getRoundsInEvent(dcOrVars, vars) {
  return executeQuery(getRoundsInEventRef(dcOrVars, vars));
}

export const getTournamentParticipantsWithUsersRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetTournamentParticipantsWithUsers', inputVars);
}
getTournamentParticipantsWithUsersRef.operationName = 'GetTournamentParticipantsWithUsers';

export function getTournamentParticipantsWithUsers(dcOrVars, vars) {
  return executeQuery(getTournamentParticipantsWithUsersRef(dcOrVars, vars));
}

export const getExistingEmailQueueRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetExistingEmailQueue', inputVars);
}
getExistingEmailQueueRef.operationName = 'GetExistingEmailQueue';

export function getExistingEmailQueue(dcOrVars, vars) {
  return executeQuery(getExistingEmailQueueRef(dcOrVars, vars));
}

export const getEntryMatchPicksRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetEntryMatchPicks', inputVars);
}
getEntryMatchPicksRef.operationName = 'GetEntryMatchPicks';

export function getEntryMatchPicks(dcOrVars, vars) {
  return executeQuery(getEntryMatchPicksRef(dcOrVars, vars));
}

export const getUserTournamentMatchesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserTournamentMatches', inputVars);
}
getUserTournamentMatchesRef.operationName = 'GetUserTournamentMatches';

export function getUserTournamentMatches(dcOrVars, vars) {
  return executeQuery(getUserTournamentMatchesRef(dcOrVars, vars));
}

export const getUserVerdictMatchPicksRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserVerdictMatchPicks', inputVars);
}
getUserVerdictMatchPicksRef.operationName = 'GetUserVerdictMatchPicks';

export function getUserVerdictMatchPicks(dcOrVars, vars) {
  return executeQuery(getUserVerdictMatchPicksRef(dcOrVars, vars));
}

export const getMatchParticipantsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMatchParticipants', inputVars);
}
getMatchParticipantsRef.operationName = 'GetMatchParticipants';

export function getMatchParticipants(dcOrVars, vars) {
  return executeQuery(getMatchParticipantsRef(dcOrVars, vars));
}

export const getPickScoresRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetPickScores', inputVars);
}
getPickScoresRef.operationName = 'GetPickScores';

export function getPickScores(dcOrVars, vars) {
  return executeQuery(getPickScoresRef(dcOrVars, vars));
}

export const getRoundMatchesWithPriorityRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetRoundMatchesWithPriority', inputVars);
}
getRoundMatchesWithPriorityRef.operationName = 'GetRoundMatchesWithPriority';

export function getRoundMatchesWithPriority(dcOrVars, vars) {
  return executeQuery(getRoundMatchesWithPriorityRef(dcOrVars, vars));
}

export const getOpponentMatchHistoriesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetOpponentMatchHistories', inputVars);
}
getOpponentMatchHistoriesRef.operationName = 'GetOpponentMatchHistories';

export function getOpponentMatchHistories(dcOrVars, vars) {
  return executeQuery(getOpponentMatchHistoriesRef(dcOrVars, vars));
}

export const getHighestSeedRemainingRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetHighestSeedRemaining', inputVars);
}
getHighestSeedRemainingRef.operationName = 'GetHighestSeedRemaining';

export function getHighestSeedRemaining(dcOrVars, vars) {
  return executeQuery(getHighestSeedRemainingRef(dcOrVars, vars));
}

export const getTournamentImportStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetTournamentImportStatus', inputVars);
}
getTournamentImportStatusRef.operationName = 'GetTournamentImportStatus';

export function getTournamentImportStatus(dcOrVars, vars) {
  return executeQuery(getTournamentImportStatusRef(dcOrVars, vars));
}

export const getParticipantLeaguesForTournamentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetParticipantLeaguesForTournament', inputVars);
}
getParticipantLeaguesForTournamentRef.operationName = 'GetParticipantLeaguesForTournament';

export function getParticipantLeaguesForTournament(dcOrVars, vars) {
  return executeQuery(getParticipantLeaguesForTournamentRef(dcOrVars, vars));
}

export const getLeagueEntriesForEntriesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetLeagueEntriesForEntries', inputVars);
}
getLeagueEntriesForEntriesRef.operationName = 'GetLeagueEntriesForEntries';

export function getLeagueEntriesForEntries(dcOrVars, vars) {
  return executeQuery(getLeagueEntriesForEntriesRef(dcOrVars, vars));
}

export const getFriendsInTournamentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetFriendsInTournament', inputVars);
}
getFriendsInTournamentRef.operationName = 'GetFriendsInTournament';

export function getFriendsInTournament(dcOrVars, vars) {
  return executeQuery(getFriendsInTournamentRef(dcOrVars, vars));
}

