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

const getFinalPicksForEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetFinalPicksForEvent', inputVars);
}
getFinalPicksForEventRef.operationName = 'GetFinalPicksForEvent';
exports.getFinalPicksForEventRef = getFinalPicksForEventRef;

exports.getFinalPicksForEvent = function getFinalPicksForEvent(dcOrVars, vars) {
  return executeQuery(getFinalPicksForEventRef(dcOrVars, vars));
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
