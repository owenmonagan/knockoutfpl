const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'knockoutfpl-dev-service',
  location: 'us-east1'
};
exports.connectorConfig = connectorConfig;

const upsertUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertUser', inputVars);
}
upsertUserRef.operationName = 'UpsertUser';
exports.upsertUserRef = upsertUserRef;

exports.upsertUser = function upsertUser(dcOrVars, vars) {
  return executeMutation(upsertUserRef(dcOrVars, vars));
};

const connectFplEntryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ConnectFplEntry', inputVars);
}
connectFplEntryRef.operationName = 'ConnectFplEntry';
exports.connectFplEntryRef = connectFplEntryRef;

exports.connectFplEntry = function connectFplEntry(dcOrVars, vars) {
  return executeMutation(connectFplEntryRef(dcOrVars, vars));
};

const upsertEntryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertEntry', inputVars);
}
upsertEntryRef.operationName = 'UpsertEntry';
exports.upsertEntryRef = upsertEntryRef;

exports.upsertEntry = function upsertEntry(dcOrVars, vars) {
  return executeMutation(upsertEntryRef(dcOrVars, vars));
};

const upsertPickRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertPick', inputVars);
}
upsertPickRef.operationName = 'UpsertPick';
exports.upsertPickRef = upsertPickRef;

exports.upsertPick = function upsertPick(dcOrVars, vars) {
  return executeMutation(upsertPickRef(dcOrVars, vars));
};

const upsertLeagueRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertLeague', inputVars);
}
upsertLeagueRef.operationName = 'UpsertLeague';
exports.upsertLeagueRef = upsertLeagueRef;

exports.upsertLeague = function upsertLeague(dcOrVars, vars) {
  return executeMutation(upsertLeagueRef(dcOrVars, vars));
};

const upsertEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertEvent', inputVars);
}
upsertEventRef.operationName = 'UpsertEvent';
exports.upsertEventRef = upsertEventRef;

exports.upsertEvent = function upsertEvent(dcOrVars, vars) {
  return executeMutation(upsertEventRef(dcOrVars, vars));
};

const createTournamentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateTournament', inputVars);
}
createTournamentRef.operationName = 'CreateTournament';
exports.createTournamentRef = createTournamentRef;

exports.createTournament = function createTournament(dcOrVars, vars) {
  return executeMutation(createTournamentRef(dcOrVars, vars));
};

const createTournamentWithImportStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateTournamentWithImportStatus', inputVars);
}
createTournamentWithImportStatusRef.operationName = 'CreateTournamentWithImportStatus';
exports.createTournamentWithImportStatusRef = createTournamentWithImportStatusRef;

exports.createTournamentWithImportStatus = function createTournamentWithImportStatus(dcOrVars, vars) {
  return executeMutation(createTournamentWithImportStatusRef(dcOrVars, vars));
};

const updateTournamentImportProgressRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateTournamentImportProgress', inputVars);
}
updateTournamentImportProgressRef.operationName = 'UpdateTournamentImportProgress';
exports.updateTournamentImportProgressRef = updateTournamentImportProgressRef;

exports.updateTournamentImportProgress = function updateTournamentImportProgress(dcOrVars, vars) {
  return executeMutation(updateTournamentImportProgressRef(dcOrVars, vars));
};

const finalizeTournamentImportRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'FinalizeTournamentImport', inputVars);
}
finalizeTournamentImportRef.operationName = 'FinalizeTournamentImport';
exports.finalizeTournamentImportRef = finalizeTournamentImportRef;

exports.finalizeTournamentImport = function finalizeTournamentImport(dcOrVars, vars) {
  return executeMutation(finalizeTournamentImportRef(dcOrVars, vars));
};

const updateTournamentStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateTournamentStatus', inputVars);
}
updateTournamentStatusRef.operationName = 'UpdateTournamentStatus';
exports.updateTournamentStatusRef = updateTournamentStatusRef;

exports.updateTournamentStatus = function updateTournamentStatus(dcOrVars, vars) {
  return executeMutation(updateTournamentStatusRef(dcOrVars, vars));
};

const setTournamentWinnerRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SetTournamentWinner', inputVars);
}
setTournamentWinnerRef.operationName = 'SetTournamentWinner';
exports.setTournamentWinnerRef = setTournamentWinnerRef;

exports.setTournamentWinner = function setTournamentWinner(dcOrVars, vars) {
  return executeMutation(setTournamentWinnerRef(dcOrVars, vars));
};

const advanceTournamentRoundRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AdvanceTournamentRound', inputVars);
}
advanceTournamentRoundRef.operationName = 'AdvanceTournamentRound';
exports.advanceTournamentRoundRef = advanceTournamentRoundRef;

exports.advanceTournamentRound = function advanceTournamentRound(dcOrVars, vars) {
  return executeMutation(advanceTournamentRoundRef(dcOrVars, vars));
};

const createRoundRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateRound', inputVars);
}
createRoundRef.operationName = 'CreateRound';
exports.createRoundRef = createRoundRef;

exports.createRound = function createRound(dcOrVars, vars) {
  return executeMutation(createRoundRef(dcOrVars, vars));
};

const updateRoundRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateRound', inputVars);
}
updateRoundRef.operationName = 'UpdateRound';
exports.updateRoundRef = updateRoundRef;

exports.updateRound = function updateRound(dcOrVars, vars) {
  return executeMutation(updateRoundRef(dcOrVars, vars));
};

const updateRoundUpdatedAtRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateRoundUpdatedAt', inputVars);
}
updateRoundUpdatedAtRef.operationName = 'UpdateRoundUpdatedAt';
exports.updateRoundUpdatedAtRef = updateRoundUpdatedAtRef;

exports.updateRoundUpdatedAt = function updateRoundUpdatedAt(dcOrVars, vars) {
  return executeMutation(updateRoundUpdatedAtRef(dcOrVars, vars));
};

const updateMatchUpdatedAtRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateMatchUpdatedAt', inputVars);
}
updateMatchUpdatedAtRef.operationName = 'UpdateMatchUpdatedAt';
exports.updateMatchUpdatedAtRef = updateMatchUpdatedAtRef;

exports.updateMatchUpdatedAt = function updateMatchUpdatedAt(dcOrVars, vars) {
  return executeMutation(updateMatchUpdatedAtRef(dcOrVars, vars));
};

const createParticipantRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateParticipant', inputVars);
}
createParticipantRef.operationName = 'CreateParticipant';
exports.createParticipantRef = createParticipantRef;

exports.createParticipant = function createParticipant(dcOrVars, vars) {
  return executeMutation(createParticipantRef(dcOrVars, vars));
};

const updateParticipantRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateParticipant', inputVars);
}
updateParticipantRef.operationName = 'UpdateParticipant';
exports.updateParticipantRef = updateParticipantRef;

exports.updateParticipant = function updateParticipant(dcOrVars, vars) {
  return executeMutation(updateParticipantRef(dcOrVars, vars));
};

const createMatchRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateMatch', inputVars);
}
createMatchRef.operationName = 'CreateMatch';
exports.createMatchRef = createMatchRef;

exports.createMatch = function createMatch(dcOrVars, vars) {
  return executeMutation(createMatchRef(dcOrVars, vars));
};

const updateMatchRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateMatch', inputVars);
}
updateMatchRef.operationName = 'UpdateMatch';
exports.updateMatchRef = updateMatchRef;

exports.updateMatch = function updateMatch(dcOrVars, vars) {
  return executeMutation(updateMatchRef(dcOrVars, vars));
};

const createMatchPickRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateMatchPick', inputVars);
}
createMatchPickRef.operationName = 'CreateMatchPick';
exports.createMatchPickRef = createMatchPickRef;

exports.createMatchPick = function createMatchPick(dcOrVars, vars) {
  return executeMutation(createMatchPickRef(dcOrVars, vars));
};

const deleteTournamentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteTournament', inputVars);
}
deleteTournamentRef.operationName = 'DeleteTournament';
exports.deleteTournamentRef = deleteTournamentRef;

exports.deleteTournament = function deleteTournament(dcOrVars, vars) {
  return executeMutation(deleteTournamentRef(dcOrVars, vars));
};

const deleteMatchPicksByTournamentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteMatchPicksByTournament', inputVars);
}
deleteMatchPicksByTournamentRef.operationName = 'DeleteMatchPicksByTournament';
exports.deleteMatchPicksByTournamentRef = deleteMatchPicksByTournamentRef;

exports.deleteMatchPicksByTournament = function deleteMatchPicksByTournament(dcOrVars, vars) {
  return executeMutation(deleteMatchPicksByTournamentRef(dcOrVars, vars));
};

const deleteMatchesByTournamentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteMatchesByTournament', inputVars);
}
deleteMatchesByTournamentRef.operationName = 'DeleteMatchesByTournament';
exports.deleteMatchesByTournamentRef = deleteMatchesByTournamentRef;

exports.deleteMatchesByTournament = function deleteMatchesByTournament(dcOrVars, vars) {
  return executeMutation(deleteMatchesByTournamentRef(dcOrVars, vars));
};

const deleteRoundsByTournamentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteRoundsByTournament', inputVars);
}
deleteRoundsByTournamentRef.operationName = 'DeleteRoundsByTournament';
exports.deleteRoundsByTournamentRef = deleteRoundsByTournamentRef;

exports.deleteRoundsByTournament = function deleteRoundsByTournament(dcOrVars, vars) {
  return executeMutation(deleteRoundsByTournamentRef(dcOrVars, vars));
};

const deleteParticipantsByTournamentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteParticipantsByTournament', inputVars);
}
deleteParticipantsByTournamentRef.operationName = 'DeleteParticipantsByTournament';
exports.deleteParticipantsByTournamentRef = deleteParticipantsByTournamentRef;

exports.deleteParticipantsByTournament = function deleteParticipantsByTournament(dcOrVars, vars) {
  return executeMutation(deleteParticipantsByTournamentRef(dcOrVars, vars));
};

const deleteTournamentByIdRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteTournamentById', inputVars);
}
deleteTournamentByIdRef.operationName = 'DeleteTournamentById';
exports.deleteTournamentByIdRef = deleteTournamentByIdRef;

exports.deleteTournamentById = function deleteTournamentById(dcOrVars, vars) {
  return executeMutation(deleteTournamentByIdRef(dcOrVars, vars));
};

const createEmailQueueEntryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateEmailQueueEntry', inputVars);
}
createEmailQueueEntryRef.operationName = 'CreateEmailQueueEntry';
exports.createEmailQueueEntryRef = createEmailQueueEntryRef;

exports.createEmailQueueEntry = function createEmailQueueEntry(dcOrVars, vars) {
  return executeMutation(createEmailQueueEntryRef(dcOrVars, vars));
};

const createParticipantLeaguesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateParticipantLeagues', inputVars);
}
createParticipantLeaguesRef.operationName = 'CreateParticipantLeagues';
exports.createParticipantLeaguesRef = createParticipantLeaguesRef;

exports.createParticipantLeagues = function createParticipantLeagues(dcOrVars, vars) {
  return executeMutation(createParticipantLeaguesRef(dcOrVars, vars));
};

const upsertParticipantLeagueRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertParticipantLeague', inputVars);
}
upsertParticipantLeagueRef.operationName = 'UpsertParticipantLeague';
exports.upsertParticipantLeagueRef = upsertParticipantLeagueRef;

exports.upsertParticipantLeague = function upsertParticipantLeague(dcOrVars, vars) {
  return executeMutation(upsertParticipantLeagueRef(dcOrVars, vars));
};

const getUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUser', inputVars);
}
getUserRef.operationName = 'GetUser';
exports.getUserRef = getUserRef;

exports.getUser = function getUser(dcOrVars, vars) {
  return executeQuery(getUserRef(dcOrVars, vars));
};

const getEntryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetEntry', inputVars);
}
getEntryRef.operationName = 'GetEntry';
exports.getEntryRef = getEntryRef;

exports.getEntry = function getEntry(dcOrVars, vars) {
  return executeQuery(getEntryRef(dcOrVars, vars));
};

const getEntriesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetEntries', inputVars);
}
getEntriesRef.operationName = 'GetEntries';
exports.getEntriesRef = getEntriesRef;

exports.getEntries = function getEntries(dcOrVars, vars) {
  return executeQuery(getEntriesRef(dcOrVars, vars));
};

const getPickRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetPick', inputVars);
}
getPickRef.operationName = 'GetPick';
exports.getPickRef = getPickRef;

exports.getPick = function getPick(dcOrVars, vars) {
  return executeQuery(getPickRef(dcOrVars, vars));
};

const getPicksForEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetPicksForEvent', inputVars);
}
getPicksForEventRef.operationName = 'GetPicksForEvent';
exports.getPicksForEventRef = getPicksForEventRef;

exports.getPicksForEvent = function getPicksForEvent(dcOrVars, vars) {
  return executeQuery(getPicksForEventRef(dcOrVars, vars));
};

const getLeagueRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetLeague', inputVars);
}
getLeagueRef.operationName = 'GetLeague';
exports.getLeagueRef = getLeagueRef;

exports.getLeague = function getLeague(dcOrVars, vars) {
  return executeQuery(getLeagueRef(dcOrVars, vars));
};

const getCurrentEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCurrentEvent', inputVars);
}
getCurrentEventRef.operationName = 'GetCurrentEvent';
exports.getCurrentEventRef = getCurrentEventRef;

exports.getCurrentEvent = function getCurrentEvent(dcOrVars, vars) {
  return executeQuery(getCurrentEventRef(dcOrVars, vars));
};

const getEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetEvent', inputVars);
}
getEventRef.operationName = 'GetEvent';
exports.getEventRef = getEventRef;

exports.getEvent = function getEvent(dcOrVars, vars) {
  return executeQuery(getEventRef(dcOrVars, vars));
};

const getSeasonEventsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetSeasonEvents', inputVars);
}
getSeasonEventsRef.operationName = 'GetSeasonEvents';
exports.getSeasonEventsRef = getSeasonEventsRef;

exports.getSeasonEvents = function getSeasonEvents(dcOrVars, vars) {
  return executeQuery(getSeasonEventsRef(dcOrVars, vars));
};

const getEventsNeedingFinalizationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetEventsNeedingFinalization', inputVars);
}
getEventsNeedingFinalizationRef.operationName = 'GetEventsNeedingFinalization';
exports.getEventsNeedingFinalizationRef = getEventsNeedingFinalizationRef;

exports.getEventsNeedingFinalization = function getEventsNeedingFinalization(dcOrVars, vars) {
  return executeQuery(getEventsNeedingFinalizationRef(dcOrVars, vars));
};

const getFinalizedEventsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetFinalizedEvents', inputVars);
}
getFinalizedEventsRef.operationName = 'GetFinalizedEvents';
exports.getFinalizedEventsRef = getFinalizedEventsRef;

exports.getFinalizedEvents = function getFinalizedEvents(dcOrVars, vars) {
  return executeQuery(getFinalizedEventsRef(dcOrVars, vars));
};

const getEventFinalizationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetEventFinalization', inputVars);
}
getEventFinalizationRef.operationName = 'GetEventFinalization';
exports.getEventFinalizationRef = getEventFinalizationRef;

exports.getEventFinalization = function getEventFinalization(dcOrVars, vars) {
  return executeQuery(getEventFinalizationRef(dcOrVars, vars));
};

const getTournamentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetTournament', inputVars);
}
getTournamentRef.operationName = 'GetTournament';
exports.getTournamentRef = getTournamentRef;

exports.getTournament = function getTournament(dcOrVars, vars) {
  return executeQuery(getTournamentRef(dcOrVars, vars));
};

const getTournamentWithParticipantsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetTournamentWithParticipants', inputVars);
}
getTournamentWithParticipantsRef.operationName = 'GetTournamentWithParticipants';
exports.getTournamentWithParticipantsRef = getTournamentWithParticipantsRef;

exports.getTournamentWithParticipants = function getTournamentWithParticipants(dcOrVars, vars) {
  return executeQuery(getTournamentWithParticipantsRef(dcOrVars, vars));
};

const getUserTournamentsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserTournaments', inputVars);
}
getUserTournamentsRef.operationName = 'GetUserTournaments';
exports.getUserTournamentsRef = getUserTournamentsRef;

exports.getUserTournaments = function getUserTournaments(dcOrVars, vars) {
  return executeQuery(getUserTournamentsRef(dcOrVars, vars));
};

const getLeagueTournamentsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetLeagueTournaments', inputVars);
}
getLeagueTournamentsRef.operationName = 'GetLeagueTournaments';
exports.getLeagueTournamentsRef = getLeagueTournamentsRef;

exports.getLeagueTournaments = function getLeagueTournaments(dcOrVars, vars) {
  return executeQuery(getLeagueTournamentsRef(dcOrVars, vars));
};

const getAllTournamentsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetAllTournaments');
}
getAllTournamentsRef.operationName = 'GetAllTournaments';
exports.getAllTournamentsRef = getAllTournamentsRef;

exports.getAllTournaments = function getAllTournaments(dc) {
  return executeQuery(getAllTournamentsRef(dc));
};

const getTournamentRoundsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetTournamentRounds', inputVars);
}
getTournamentRoundsRef.operationName = 'GetTournamentRounds';
exports.getTournamentRoundsRef = getTournamentRoundsRef;

exports.getTournamentRounds = function getTournamentRounds(dcOrVars, vars) {
  return executeQuery(getTournamentRoundsRef(dcOrVars, vars));
};

const getRoundRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetRound', inputVars);
}
getRoundRef.operationName = 'GetRound';
exports.getRoundRef = getRoundRef;

exports.getRound = function getRound(dcOrVars, vars) {
  return executeQuery(getRoundRef(dcOrVars, vars));
};

const getActiveRoundsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetActiveRounds', inputVars);
}
getActiveRoundsRef.operationName = 'GetActiveRounds';
exports.getActiveRoundsRef = getActiveRoundsRef;

exports.getActiveRounds = function getActiveRounds(dcOrVars, vars) {
  return executeQuery(getActiveRoundsRef(dcOrVars, vars));
};

const getPendingActiveRoundsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetPendingActiveRounds', inputVars);
}
getPendingActiveRoundsRef.operationName = 'GetPendingActiveRounds';
exports.getPendingActiveRoundsRef = getPendingActiveRoundsRef;

exports.getPendingActiveRounds = function getPendingActiveRounds(dcOrVars, vars) {
  return executeQuery(getPendingActiveRoundsRef(dcOrVars, vars));
};

const getRoundMatchesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetRoundMatches', inputVars);
}
getRoundMatchesRef.operationName = 'GetRoundMatches';
exports.getRoundMatchesRef = getRoundMatchesRef;

exports.getRoundMatches = function getRoundMatches(dcOrVars, vars) {
  return executeQuery(getRoundMatchesRef(dcOrVars, vars));
};

const getMatchesInRangeRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMatchesInRange', inputVars);
}
getMatchesInRangeRef.operationName = 'GetMatchesInRange';
exports.getMatchesInRangeRef = getMatchesInRangeRef;

exports.getMatchesInRange = function getMatchesInRange(dcOrVars, vars) {
  return executeQuery(getMatchesInRangeRef(dcOrVars, vars));
};

const getMatchRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMatch', inputVars);
}
getMatchRef.operationName = 'GetMatch';
exports.getMatchRef = getMatchRef;

exports.getMatch = function getMatch(dcOrVars, vars) {
  return executeQuery(getMatchRef(dcOrVars, vars));
};

const getMatchPicksRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMatchPicks', inputVars);
}
getMatchPicksRef.operationName = 'GetMatchPicks';
exports.getMatchPicksRef = getMatchPicksRef;

exports.getMatchPicks = function getMatchPicks(dcOrVars, vars) {
  return executeQuery(getMatchPicksRef(dcOrVars, vars));
};

const getAllTournamentMatchPicksRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetAllTournamentMatchPicks', inputVars);
}
getAllTournamentMatchPicksRef.operationName = 'GetAllTournamentMatchPicks';
exports.getAllTournamentMatchPicksRef = getAllTournamentMatchPicksRef;

exports.getAllTournamentMatchPicks = function getAllTournamentMatchPicks(dcOrVars, vars) {
  return executeQuery(getAllTournamentMatchPicksRef(dcOrVars, vars));
};

const getUserMatchesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserMatches', inputVars);
}
getUserMatchesRef.operationName = 'GetUserMatches';
exports.getUserMatchesRef = getUserMatchesRef;

exports.getUserMatches = function getUserMatches(dcOrVars, vars) {
  return executeQuery(getUserMatchesRef(dcOrVars, vars));
};

const searchParticipantsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'SearchParticipants', inputVars);
}
searchParticipantsRef.operationName = 'SearchParticipants';
exports.searchParticipantsRef = searchParticipantsRef;

exports.searchParticipants = function searchParticipants(dcOrVars, vars) {
  return executeQuery(searchParticipantsRef(dcOrVars, vars));
};

const getParticipantRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetParticipant', inputVars);
}
getParticipantRef.operationName = 'GetParticipant';
exports.getParticipantRef = getParticipantRef;

exports.getParticipant = function getParticipant(dcOrVars, vars) {
  return executeQuery(getParticipantRef(dcOrVars, vars));
};

const getActiveParticipantsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetActiveParticipants', inputVars);
}
getActiveParticipantsRef.operationName = 'GetActiveParticipants';
exports.getActiveParticipantsRef = getActiveParticipantsRef;

exports.getActiveParticipants = function getActiveParticipants(dcOrVars, vars) {
  return executeQuery(getActiveParticipantsRef(dcOrVars, vars));
};

const getUserParticipationsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserParticipations', inputVars);
}
getUserParticipationsRef.operationName = 'GetUserParticipations';
exports.getUserParticipationsRef = getUserParticipationsRef;

exports.getUserParticipations = function getUserParticipations(dcOrVars, vars) {
  return executeQuery(getUserParticipationsRef(dcOrVars, vars));
};

const getRoundsInEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetRoundsInEvent', inputVars);
}
getRoundsInEventRef.operationName = 'GetRoundsInEvent';
exports.getRoundsInEventRef = getRoundsInEventRef;

exports.getRoundsInEvent = function getRoundsInEvent(dcOrVars, vars) {
  return executeQuery(getRoundsInEventRef(dcOrVars, vars));
};

const getTournamentParticipantsWithUsersRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetTournamentParticipantsWithUsers', inputVars);
}
getTournamentParticipantsWithUsersRef.operationName = 'GetTournamentParticipantsWithUsers';
exports.getTournamentParticipantsWithUsersRef = getTournamentParticipantsWithUsersRef;

exports.getTournamentParticipantsWithUsers = function getTournamentParticipantsWithUsers(dcOrVars, vars) {
  return executeQuery(getTournamentParticipantsWithUsersRef(dcOrVars, vars));
};

const getExistingEmailQueueRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetExistingEmailQueue', inputVars);
}
getExistingEmailQueueRef.operationName = 'GetExistingEmailQueue';
exports.getExistingEmailQueueRef = getExistingEmailQueueRef;

exports.getExistingEmailQueue = function getExistingEmailQueue(dcOrVars, vars) {
  return executeQuery(getExistingEmailQueueRef(dcOrVars, vars));
};

const getEntryMatchPicksRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetEntryMatchPicks', inputVars);
}
getEntryMatchPicksRef.operationName = 'GetEntryMatchPicks';
exports.getEntryMatchPicksRef = getEntryMatchPicksRef;

exports.getEntryMatchPicks = function getEntryMatchPicks(dcOrVars, vars) {
  return executeQuery(getEntryMatchPicksRef(dcOrVars, vars));
};

const getUserTournamentMatchesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserTournamentMatches', inputVars);
}
getUserTournamentMatchesRef.operationName = 'GetUserTournamentMatches';
exports.getUserTournamentMatchesRef = getUserTournamentMatchesRef;

exports.getUserTournamentMatches = function getUserTournamentMatches(dcOrVars, vars) {
  return executeQuery(getUserTournamentMatchesRef(dcOrVars, vars));
};

const getUserVerdictMatchPicksRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserVerdictMatchPicks', inputVars);
}
getUserVerdictMatchPicksRef.operationName = 'GetUserVerdictMatchPicks';
exports.getUserVerdictMatchPicksRef = getUserVerdictMatchPicksRef;

exports.getUserVerdictMatchPicks = function getUserVerdictMatchPicks(dcOrVars, vars) {
  return executeQuery(getUserVerdictMatchPicksRef(dcOrVars, vars));
};

const getMatchParticipantsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMatchParticipants', inputVars);
}
getMatchParticipantsRef.operationName = 'GetMatchParticipants';
exports.getMatchParticipantsRef = getMatchParticipantsRef;

exports.getMatchParticipants = function getMatchParticipants(dcOrVars, vars) {
  return executeQuery(getMatchParticipantsRef(dcOrVars, vars));
};

const getPickScoresRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetPickScores', inputVars);
}
getPickScoresRef.operationName = 'GetPickScores';
exports.getPickScoresRef = getPickScoresRef;

exports.getPickScores = function getPickScores(dcOrVars, vars) {
  return executeQuery(getPickScoresRef(dcOrVars, vars));
};

const getRoundMatchesWithPriorityRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetRoundMatchesWithPriority', inputVars);
}
getRoundMatchesWithPriorityRef.operationName = 'GetRoundMatchesWithPriority';
exports.getRoundMatchesWithPriorityRef = getRoundMatchesWithPriorityRef;

exports.getRoundMatchesWithPriority = function getRoundMatchesWithPriority(dcOrVars, vars) {
  return executeQuery(getRoundMatchesWithPriorityRef(dcOrVars, vars));
};

const getOpponentMatchHistoriesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetOpponentMatchHistories', inputVars);
}
getOpponentMatchHistoriesRef.operationName = 'GetOpponentMatchHistories';
exports.getOpponentMatchHistoriesRef = getOpponentMatchHistoriesRef;

exports.getOpponentMatchHistories = function getOpponentMatchHistories(dcOrVars, vars) {
  return executeQuery(getOpponentMatchHistoriesRef(dcOrVars, vars));
};

const getHighestSeedRemainingRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetHighestSeedRemaining', inputVars);
}
getHighestSeedRemainingRef.operationName = 'GetHighestSeedRemaining';
exports.getHighestSeedRemainingRef = getHighestSeedRemainingRef;

exports.getHighestSeedRemaining = function getHighestSeedRemaining(dcOrVars, vars) {
  return executeQuery(getHighestSeedRemainingRef(dcOrVars, vars));
};
