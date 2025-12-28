import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AdvanceTournamentRoundData {
  tournament_update?: Tournament_Key | null;
}

export interface AdvanceTournamentRoundVariables {
  id: UUIDString;
  nextRound: number;
}

export interface ConnectFplEntryData {
  user_upsert: User_Key;
}

export interface ConnectFplEntryVariables {
  uid: string;
  email: string;
  entryId: number;
}

export interface CreateMatchData {
  match_insert: Match_Key;
}

export interface CreateMatchPickData {
  matchPick_insert: MatchPick_Key;
}

export interface CreateMatchPickVariables {
  tournamentId: UUIDString;
  matchId: number;
  entryId: number;
  slot: number;
}

export interface CreateMatchVariables {
  tournamentId: UUIDString;
  matchId: number;
  roundNumber: number;
  positionInRound: number;
  qualifiesToMatchId?: number | null;
  isBye: boolean;
}

export interface CreateParticipantData {
  participant_insert: Participant_Key;
}

export interface CreateParticipantVariables {
  tournamentId: UUIDString;
  entryId: number;
  teamName: string;
  managerName: string;
  seed: number;
  leagueRank?: number | null;
  leaguePoints?: number | null;
  rawJson: string;
}

export interface CreateRoundData {
  round_insert: Round_Key;
}

export interface CreateRoundVariables {
  tournamentId: UUIDString;
  roundNumber: number;
  event: number;
  status: string;
}

export interface CreateTournamentData {
  tournament_insert: Tournament_Key;
}

export interface CreateTournamentVariables {
  fplLeagueId: number;
  fplLeagueName: string;
  creatorUid: string;
  participantCount: number;
  totalRounds: number;
  startEvent: number;
  seedingMethod: string;
}

export interface DeleteTournamentData {
  tournament_delete?: Tournament_Key | null;
}

export interface DeleteTournamentVariables {
  id: UUIDString;
}

export interface Entry_Key {
  entryId: number;
  __typename?: 'Entry_Key';
}

export interface Event_Key {
  event: number;
  season: string;
  __typename?: 'Event_Key';
}

export interface GetActiveParticipantsData {
  participants: ({
    tournamentId: UUIDString;
    entryId: number;
    teamName: string;
    managerName: string;
    seed: number;
    leagueRank?: number | null;
    status: string;
  } & Participant_Key)[];
}

export interface GetActiveParticipantsVariables {
  tournamentId: UUIDString;
}

export interface GetActiveRoundsData {
  rounds: ({
    tournamentId: UUIDString;
    roundNumber: number;
    event: number;
    status: string;
    tournament: {
      id: UUIDString;
      fplLeagueName: string;
      currentRound: number;
    } & Tournament_Key;
  } & Round_Key)[];
}

export interface GetActiveRoundsVariables {
  event: number;
}

export interface GetCurrentEventData {
  events: ({
    event: number;
    season: string;
    name: string;
    deadlineTime: TimestampString;
    finished: boolean;
    isCurrent: boolean;
    isNext: boolean;
  } & Event_Key)[];
}

export interface GetCurrentEventVariables {
  season: string;
}

export interface GetEntriesData {
  entries: ({
    entryId: number;
    season: string;
    name: string;
    playerFirstName?: string | null;
    playerLastName?: string | null;
    summaryOverallPoints?: number | null;
    summaryOverallRank?: number | null;
    cachedAt: TimestampString;
  } & Entry_Key)[];
}

export interface GetEntriesVariables {
  entryIds: number[];
}

export interface GetEntryData {
  entries: ({
    entryId: number;
    season: string;
    name: string;
    playerFirstName?: string | null;
    playerLastName?: string | null;
    summaryOverallPoints?: number | null;
    summaryOverallRank?: number | null;
    summaryEventPoints?: number | null;
    summaryEventRank?: number | null;
    rawJson: string;
    cachedAt: TimestampString;
  } & Entry_Key)[];
}

export interface GetEntryVariables {
  entryId: number;
}

export interface GetEventData {
  events: ({
    event: number;
    season: string;
    name: string;
    deadlineTime: TimestampString;
    finished: boolean;
    isCurrent: boolean;
    isNext: boolean;
    rawJson: string;
    cachedAt: TimestampString;
  } & Event_Key)[];
}

export interface GetEventVariables {
  event: number;
  season: string;
}

export interface GetFinalPicksForEventData {
  picks: ({
    entryId: number;
    event: number;
    points: number;
    totalPoints?: number | null;
    rank?: number | null;
    isFinal: boolean;
  } & Pick_Key)[];
}

export interface GetFinalPicksForEventVariables {
  event: number;
}

export interface GetLeagueData {
  leagues: ({
    leagueId: number;
    season: string;
    name: string;
    created?: TimestampString | null;
    adminEntry?: number | null;
    rawJson: string;
    cachedAt: TimestampString;
  } & League_Key)[];
}

export interface GetLeagueTournamentsData {
  tournaments: ({
    id: UUIDString;
    fplLeagueName: string;
    participantCount: number;
    totalRounds: number;
    currentRound: number;
    status: string;
    createdAt: TimestampString;
    creatorUid: string;
  } & Tournament_Key)[];
}

export interface GetLeagueTournamentsVariables {
  fplLeagueId: number;
}

export interface GetLeagueVariables {
  leagueId: number;
  season: string;
}

export interface GetMatchData {
  matches: ({
    tournamentId: UUIDString;
    matchId: number;
    roundNumber: number;
    positionInRound: number;
    status: string;
    winnerEntryId?: number | null;
    isBye: boolean;
    completedAt?: TimestampString | null;
    qualifiesToMatchId?: number | null;
    tournament: {
      fplLeagueName: string;
      currentRound: number;
    };
  } & Match_Key)[];
}

export interface GetMatchPicksData {
  matchPicks: ({
    tournamentId: UUIDString;
    matchId: number;
    entryId: number;
    slot: number;
    entry: {
      entryId: number;
      name: string;
      playerFirstName?: string | null;
      playerLastName?: string | null;
    } & Entry_Key;
  } & MatchPick_Key)[];
}

export interface GetMatchPicksVariables {
  tournamentId: UUIDString;
  matchId: number;
}

export interface GetMatchVariables {
  tournamentId: UUIDString;
  matchId: number;
}

export interface GetParticipantData {
  participants: ({
    tournamentId: UUIDString;
    entryId: number;
    teamName: string;
    managerName: string;
    seed: number;
    leagueRank?: number | null;
    leaguePoints?: number | null;
    status: string;
    eliminationRound?: number | null;
    uid?: string | null;
    rawJson: string;
  } & Participant_Key)[];
}

export interface GetParticipantVariables {
  tournamentId: UUIDString;
  entryId: number;
}

export interface GetPickData {
  picks: ({
    entryId: number;
    event: number;
    points: number;
    totalPoints?: number | null;
    rank?: number | null;
    overallRank?: number | null;
    activeChip?: string | null;
    isFinal: boolean;
    rawJson: string;
    cachedAt: TimestampString;
  } & Pick_Key)[];
}

export interface GetPickVariables {
  entryId: number;
  event: number;
}

export interface GetRoundData {
  rounds: ({
    tournamentId: UUIDString;
    roundNumber: number;
    event: number;
    status: string;
    startedAt?: TimestampString | null;
    completedAt?: TimestampString | null;
  } & Round_Key)[];
}

export interface GetRoundMatchesData {
  matches: ({
    tournamentId: UUIDString;
    matchId: number;
    roundNumber: number;
    positionInRound: number;
    status: string;
    winnerEntryId?: number | null;
    isBye: boolean;
    completedAt?: TimestampString | null;
    qualifiesToMatchId?: number | null;
  } & Match_Key)[];
}

export interface GetRoundMatchesVariables {
  tournamentId: UUIDString;
  roundNumber: number;
}

export interface GetRoundVariables {
  tournamentId: UUIDString;
  roundNumber: number;
}

export interface GetSeasonEventsData {
  events: ({
    event: number;
    season: string;
    name: string;
    deadlineTime: TimestampString;
    finished: boolean;
    isCurrent: boolean;
    isNext: boolean;
  } & Event_Key)[];
}

export interface GetSeasonEventsVariables {
  season: string;
}

export interface GetTournamentData {
  tournament?: {
    id: UUIDString;
    fplLeagueId: number;
    fplLeagueName: string;
    creatorUid: string;
    participantCount: number;
    totalRounds: number;
    currentRound: number;
    startEvent: number;
    seedingMethod: string;
    status: string;
    winnerEntryId?: number | null;
    createdAt: TimestampString;
    updatedAt: TimestampString;
    creator: {
      uid: string;
      email: string;
    } & User_Key;
  } & Tournament_Key;
}

export interface GetTournamentRoundsData {
  rounds: ({
    tournamentId: UUIDString;
    roundNumber: number;
    event: number;
    status: string;
    startedAt?: TimestampString | null;
    completedAt?: TimestampString | null;
  } & Round_Key)[];
}

export interface GetTournamentRoundsVariables {
  tournamentId: UUIDString;
}

export interface GetTournamentVariables {
  id: UUIDString;
}

export interface GetTournamentWithParticipantsData {
  tournament?: {
    id: UUIDString;
    fplLeagueId: number;
    fplLeagueName: string;
    participantCount: number;
    totalRounds: number;
    currentRound: number;
    startEvent: number;
    status: string;
    winnerEntryId?: number | null;
  } & Tournament_Key;
    participants: ({
      tournamentId: UUIDString;
      entryId: number;
      teamName: string;
      managerName: string;
      seed: number;
      leagueRank?: number | null;
      leaguePoints?: number | null;
      status: string;
      eliminationRound?: number | null;
      uid?: string | null;
    } & Participant_Key)[];
}

export interface GetTournamentWithParticipantsVariables {
  id: UUIDString;
}

export interface GetUserData {
  users: ({
    uid: string;
    email: string;
    entryId2025?: number | null;
    createdAt: TimestampString;
    updatedAt: TimestampString;
  } & User_Key)[];
}

export interface GetUserMatchesData {
  matchPicks: ({
    tournamentId: UUIDString;
    matchId: number;
    entryId: number;
    slot: number;
  } & MatchPick_Key)[];
}

export interface GetUserMatchesVariables {
  entryId: number;
}

export interface GetUserParticipationsData {
  participants: ({
    tournamentId: UUIDString;
    entryId: number;
    teamName: string;
    seed: number;
    status: string;
    eliminationRound?: number | null;
    tournament: {
      id: UUIDString;
      fplLeagueName: string;
      status: string;
      currentRound: number;
    } & Tournament_Key;
  } & Participant_Key)[];
}

export interface GetUserParticipationsVariables {
  uid: string;
}

export interface GetUserTournamentsData {
  tournaments: ({
    id: UUIDString;
    fplLeagueId: number;
    fplLeagueName: string;
    participantCount: number;
    totalRounds: number;
    currentRound: number;
    status: string;
    createdAt: TimestampString;
  } & Tournament_Key)[];
}

export interface GetUserTournamentsVariables {
  creatorUid: string;
}

export interface GetUserVariables {
  uid: string;
}

export interface League_Key {
  leagueId: number;
  season: string;
  __typename?: 'League_Key';
}

export interface MatchPick_Key {
  tournamentId: UUIDString;
  matchId: number;
  entryId: number;
  __typename?: 'MatchPick_Key';
}

export interface Match_Key {
  tournamentId: UUIDString;
  matchId: number;
  __typename?: 'Match_Key';
}

export interface Participant_Key {
  tournamentId: UUIDString;
  entryId: number;
  __typename?: 'Participant_Key';
}

export interface Pick_Key {
  entryId: number;
  event: number;
  __typename?: 'Pick_Key';
}

export interface Round_Key {
  tournamentId: UUIDString;
  roundNumber: number;
  __typename?: 'Round_Key';
}

export interface SetTournamentWinnerData {
  tournament_update?: Tournament_Key | null;
}

export interface SetTournamentWinnerVariables {
  id: UUIDString;
  winnerEntryId: number;
}

export interface Tournament_Key {
  id: UUIDString;
  __typename?: 'Tournament_Key';
}

export interface UpdateMatchData {
  match_upsert: Match_Key;
}

export interface UpdateMatchVariables {
  tournamentId: UUIDString;
  matchId: number;
  roundNumber: number;
  positionInRound: number;
  qualifiesToMatchId?: number | null;
  isBye: boolean;
  status: string;
  winnerEntryId?: number | null;
}

export interface UpdateParticipantData {
  participant_upsert: Participant_Key;
}

export interface UpdateParticipantVariables {
  tournamentId: UUIDString;
  entryId: number;
  teamName: string;
  managerName: string;
  seed: number;
  leagueRank?: number | null;
  leaguePoints?: number | null;
  rawJson: string;
  status: string;
  eliminationRound?: number | null;
  uid?: string | null;
}

export interface UpdateRoundData {
  round_upsert: Round_Key;
}

export interface UpdateRoundVariables {
  tournamentId: UUIDString;
  roundNumber: number;
  event: number;
  status: string;
}

export interface UpdateTournamentStatusData {
  tournament_update?: Tournament_Key | null;
}

export interface UpdateTournamentStatusVariables {
  id: UUIDString;
  status: string;
}

export interface UpsertEntryData {
  entry_upsert: Entry_Key;
}

export interface UpsertEntryVariables {
  entryId: number;
  season: string;
  name: string;
  playerFirstName?: string | null;
  playerLastName?: string | null;
  summaryOverallPoints?: number | null;
  summaryOverallRank?: number | null;
  summaryEventPoints?: number | null;
  summaryEventRank?: number | null;
  rawJson: string;
}

export interface UpsertEventData {
  event_upsert: Event_Key;
}

export interface UpsertEventVariables {
  event: number;
  season: string;
  name: string;
  deadlineTime: TimestampString;
  finished: boolean;
  isCurrent: boolean;
  isNext: boolean;
  rawJson: string;
}

export interface UpsertLeagueData {
  league_upsert: League_Key;
}

export interface UpsertLeagueVariables {
  leagueId: number;
  season: string;
  name: string;
  created?: TimestampString | null;
  adminEntry?: number | null;
  rawJson: string;
}

export interface UpsertPickData {
  pick_upsert: Pick_Key;
}

export interface UpsertPickVariables {
  entryId: number;
  event: number;
  points: number;
  totalPoints?: number | null;
  rank?: number | null;
  overallRank?: number | null;
  eventTransfersCost?: number | null;
  activeChip?: string | null;
  rawJson: string;
  isFinal: boolean;
}

export interface UpsertUserData {
  user_upsert: User_Key;
}

export interface UpsertUserVariables {
  uid: string;
  email: string;
}

export interface User_Key {
  uid: string;
  __typename?: 'User_Key';
}

interface UpsertUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertUserVariables): MutationRef<UpsertUserData, UpsertUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertUserVariables): MutationRef<UpsertUserData, UpsertUserVariables>;
  operationName: string;
}
export const upsertUserRef: UpsertUserRef;

export function upsertUser(vars: UpsertUserVariables): MutationPromise<UpsertUserData, UpsertUserVariables>;
export function upsertUser(dc: DataConnect, vars: UpsertUserVariables): MutationPromise<UpsertUserData, UpsertUserVariables>;

interface ConnectFplEntryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ConnectFplEntryVariables): MutationRef<ConnectFplEntryData, ConnectFplEntryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ConnectFplEntryVariables): MutationRef<ConnectFplEntryData, ConnectFplEntryVariables>;
  operationName: string;
}
export const connectFplEntryRef: ConnectFplEntryRef;

export function connectFplEntry(vars: ConnectFplEntryVariables): MutationPromise<ConnectFplEntryData, ConnectFplEntryVariables>;
export function connectFplEntry(dc: DataConnect, vars: ConnectFplEntryVariables): MutationPromise<ConnectFplEntryData, ConnectFplEntryVariables>;

interface UpsertEntryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertEntryVariables): MutationRef<UpsertEntryData, UpsertEntryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertEntryVariables): MutationRef<UpsertEntryData, UpsertEntryVariables>;
  operationName: string;
}
export const upsertEntryRef: UpsertEntryRef;

export function upsertEntry(vars: UpsertEntryVariables): MutationPromise<UpsertEntryData, UpsertEntryVariables>;
export function upsertEntry(dc: DataConnect, vars: UpsertEntryVariables): MutationPromise<UpsertEntryData, UpsertEntryVariables>;

interface UpsertPickRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertPickVariables): MutationRef<UpsertPickData, UpsertPickVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertPickVariables): MutationRef<UpsertPickData, UpsertPickVariables>;
  operationName: string;
}
export const upsertPickRef: UpsertPickRef;

export function upsertPick(vars: UpsertPickVariables): MutationPromise<UpsertPickData, UpsertPickVariables>;
export function upsertPick(dc: DataConnect, vars: UpsertPickVariables): MutationPromise<UpsertPickData, UpsertPickVariables>;

interface UpsertLeagueRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertLeagueVariables): MutationRef<UpsertLeagueData, UpsertLeagueVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertLeagueVariables): MutationRef<UpsertLeagueData, UpsertLeagueVariables>;
  operationName: string;
}
export const upsertLeagueRef: UpsertLeagueRef;

export function upsertLeague(vars: UpsertLeagueVariables): MutationPromise<UpsertLeagueData, UpsertLeagueVariables>;
export function upsertLeague(dc: DataConnect, vars: UpsertLeagueVariables): MutationPromise<UpsertLeagueData, UpsertLeagueVariables>;

interface UpsertEventRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertEventVariables): MutationRef<UpsertEventData, UpsertEventVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertEventVariables): MutationRef<UpsertEventData, UpsertEventVariables>;
  operationName: string;
}
export const upsertEventRef: UpsertEventRef;

export function upsertEvent(vars: UpsertEventVariables): MutationPromise<UpsertEventData, UpsertEventVariables>;
export function upsertEvent(dc: DataConnect, vars: UpsertEventVariables): MutationPromise<UpsertEventData, UpsertEventVariables>;

interface CreateTournamentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateTournamentVariables): MutationRef<CreateTournamentData, CreateTournamentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateTournamentVariables): MutationRef<CreateTournamentData, CreateTournamentVariables>;
  operationName: string;
}
export const createTournamentRef: CreateTournamentRef;

export function createTournament(vars: CreateTournamentVariables): MutationPromise<CreateTournamentData, CreateTournamentVariables>;
export function createTournament(dc: DataConnect, vars: CreateTournamentVariables): MutationPromise<CreateTournamentData, CreateTournamentVariables>;

interface UpdateTournamentStatusRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateTournamentStatusVariables): MutationRef<UpdateTournamentStatusData, UpdateTournamentStatusVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateTournamentStatusVariables): MutationRef<UpdateTournamentStatusData, UpdateTournamentStatusVariables>;
  operationName: string;
}
export const updateTournamentStatusRef: UpdateTournamentStatusRef;

export function updateTournamentStatus(vars: UpdateTournamentStatusVariables): MutationPromise<UpdateTournamentStatusData, UpdateTournamentStatusVariables>;
export function updateTournamentStatus(dc: DataConnect, vars: UpdateTournamentStatusVariables): MutationPromise<UpdateTournamentStatusData, UpdateTournamentStatusVariables>;

interface SetTournamentWinnerRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SetTournamentWinnerVariables): MutationRef<SetTournamentWinnerData, SetTournamentWinnerVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SetTournamentWinnerVariables): MutationRef<SetTournamentWinnerData, SetTournamentWinnerVariables>;
  operationName: string;
}
export const setTournamentWinnerRef: SetTournamentWinnerRef;

export function setTournamentWinner(vars: SetTournamentWinnerVariables): MutationPromise<SetTournamentWinnerData, SetTournamentWinnerVariables>;
export function setTournamentWinner(dc: DataConnect, vars: SetTournamentWinnerVariables): MutationPromise<SetTournamentWinnerData, SetTournamentWinnerVariables>;

interface AdvanceTournamentRoundRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AdvanceTournamentRoundVariables): MutationRef<AdvanceTournamentRoundData, AdvanceTournamentRoundVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AdvanceTournamentRoundVariables): MutationRef<AdvanceTournamentRoundData, AdvanceTournamentRoundVariables>;
  operationName: string;
}
export const advanceTournamentRoundRef: AdvanceTournamentRoundRef;

export function advanceTournamentRound(vars: AdvanceTournamentRoundVariables): MutationPromise<AdvanceTournamentRoundData, AdvanceTournamentRoundVariables>;
export function advanceTournamentRound(dc: DataConnect, vars: AdvanceTournamentRoundVariables): MutationPromise<AdvanceTournamentRoundData, AdvanceTournamentRoundVariables>;

interface CreateRoundRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateRoundVariables): MutationRef<CreateRoundData, CreateRoundVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateRoundVariables): MutationRef<CreateRoundData, CreateRoundVariables>;
  operationName: string;
}
export const createRoundRef: CreateRoundRef;

export function createRound(vars: CreateRoundVariables): MutationPromise<CreateRoundData, CreateRoundVariables>;
export function createRound(dc: DataConnect, vars: CreateRoundVariables): MutationPromise<CreateRoundData, CreateRoundVariables>;

interface UpdateRoundRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateRoundVariables): MutationRef<UpdateRoundData, UpdateRoundVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateRoundVariables): MutationRef<UpdateRoundData, UpdateRoundVariables>;
  operationName: string;
}
export const updateRoundRef: UpdateRoundRef;

export function updateRound(vars: UpdateRoundVariables): MutationPromise<UpdateRoundData, UpdateRoundVariables>;
export function updateRound(dc: DataConnect, vars: UpdateRoundVariables): MutationPromise<UpdateRoundData, UpdateRoundVariables>;

interface CreateParticipantRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateParticipantVariables): MutationRef<CreateParticipantData, CreateParticipantVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateParticipantVariables): MutationRef<CreateParticipantData, CreateParticipantVariables>;
  operationName: string;
}
export const createParticipantRef: CreateParticipantRef;

export function createParticipant(vars: CreateParticipantVariables): MutationPromise<CreateParticipantData, CreateParticipantVariables>;
export function createParticipant(dc: DataConnect, vars: CreateParticipantVariables): MutationPromise<CreateParticipantData, CreateParticipantVariables>;

interface UpdateParticipantRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateParticipantVariables): MutationRef<UpdateParticipantData, UpdateParticipantVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateParticipantVariables): MutationRef<UpdateParticipantData, UpdateParticipantVariables>;
  operationName: string;
}
export const updateParticipantRef: UpdateParticipantRef;

export function updateParticipant(vars: UpdateParticipantVariables): MutationPromise<UpdateParticipantData, UpdateParticipantVariables>;
export function updateParticipant(dc: DataConnect, vars: UpdateParticipantVariables): MutationPromise<UpdateParticipantData, UpdateParticipantVariables>;

interface CreateMatchRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateMatchVariables): MutationRef<CreateMatchData, CreateMatchVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateMatchVariables): MutationRef<CreateMatchData, CreateMatchVariables>;
  operationName: string;
}
export const createMatchRef: CreateMatchRef;

export function createMatch(vars: CreateMatchVariables): MutationPromise<CreateMatchData, CreateMatchVariables>;
export function createMatch(dc: DataConnect, vars: CreateMatchVariables): MutationPromise<CreateMatchData, CreateMatchVariables>;

interface UpdateMatchRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateMatchVariables): MutationRef<UpdateMatchData, UpdateMatchVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateMatchVariables): MutationRef<UpdateMatchData, UpdateMatchVariables>;
  operationName: string;
}
export const updateMatchRef: UpdateMatchRef;

export function updateMatch(vars: UpdateMatchVariables): MutationPromise<UpdateMatchData, UpdateMatchVariables>;
export function updateMatch(dc: DataConnect, vars: UpdateMatchVariables): MutationPromise<UpdateMatchData, UpdateMatchVariables>;

interface CreateMatchPickRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateMatchPickVariables): MutationRef<CreateMatchPickData, CreateMatchPickVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateMatchPickVariables): MutationRef<CreateMatchPickData, CreateMatchPickVariables>;
  operationName: string;
}
export const createMatchPickRef: CreateMatchPickRef;

export function createMatchPick(vars: CreateMatchPickVariables): MutationPromise<CreateMatchPickData, CreateMatchPickVariables>;
export function createMatchPick(dc: DataConnect, vars: CreateMatchPickVariables): MutationPromise<CreateMatchPickData, CreateMatchPickVariables>;

interface DeleteTournamentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteTournamentVariables): MutationRef<DeleteTournamentData, DeleteTournamentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteTournamentVariables): MutationRef<DeleteTournamentData, DeleteTournamentVariables>;
  operationName: string;
}
export const deleteTournamentRef: DeleteTournamentRef;

export function deleteTournament(vars: DeleteTournamentVariables): MutationPromise<DeleteTournamentData, DeleteTournamentVariables>;
export function deleteTournament(dc: DataConnect, vars: DeleteTournamentVariables): MutationPromise<DeleteTournamentData, DeleteTournamentVariables>;

interface GetUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserVariables): QueryRef<GetUserData, GetUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserVariables): QueryRef<GetUserData, GetUserVariables>;
  operationName: string;
}
export const getUserRef: GetUserRef;

export function getUser(vars: GetUserVariables): QueryPromise<GetUserData, GetUserVariables>;
export function getUser(dc: DataConnect, vars: GetUserVariables): QueryPromise<GetUserData, GetUserVariables>;

interface GetEntryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetEntryVariables): QueryRef<GetEntryData, GetEntryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetEntryVariables): QueryRef<GetEntryData, GetEntryVariables>;
  operationName: string;
}
export const getEntryRef: GetEntryRef;

export function getEntry(vars: GetEntryVariables): QueryPromise<GetEntryData, GetEntryVariables>;
export function getEntry(dc: DataConnect, vars: GetEntryVariables): QueryPromise<GetEntryData, GetEntryVariables>;

interface GetEntriesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetEntriesVariables): QueryRef<GetEntriesData, GetEntriesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetEntriesVariables): QueryRef<GetEntriesData, GetEntriesVariables>;
  operationName: string;
}
export const getEntriesRef: GetEntriesRef;

export function getEntries(vars: GetEntriesVariables): QueryPromise<GetEntriesData, GetEntriesVariables>;
export function getEntries(dc: DataConnect, vars: GetEntriesVariables): QueryPromise<GetEntriesData, GetEntriesVariables>;

interface GetPickRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetPickVariables): QueryRef<GetPickData, GetPickVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetPickVariables): QueryRef<GetPickData, GetPickVariables>;
  operationName: string;
}
export const getPickRef: GetPickRef;

export function getPick(vars: GetPickVariables): QueryPromise<GetPickData, GetPickVariables>;
export function getPick(dc: DataConnect, vars: GetPickVariables): QueryPromise<GetPickData, GetPickVariables>;

interface GetFinalPicksForEventRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetFinalPicksForEventVariables): QueryRef<GetFinalPicksForEventData, GetFinalPicksForEventVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetFinalPicksForEventVariables): QueryRef<GetFinalPicksForEventData, GetFinalPicksForEventVariables>;
  operationName: string;
}
export const getFinalPicksForEventRef: GetFinalPicksForEventRef;

export function getFinalPicksForEvent(vars: GetFinalPicksForEventVariables): QueryPromise<GetFinalPicksForEventData, GetFinalPicksForEventVariables>;
export function getFinalPicksForEvent(dc: DataConnect, vars: GetFinalPicksForEventVariables): QueryPromise<GetFinalPicksForEventData, GetFinalPicksForEventVariables>;

interface GetLeagueRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetLeagueVariables): QueryRef<GetLeagueData, GetLeagueVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetLeagueVariables): QueryRef<GetLeagueData, GetLeagueVariables>;
  operationName: string;
}
export const getLeagueRef: GetLeagueRef;

export function getLeague(vars: GetLeagueVariables): QueryPromise<GetLeagueData, GetLeagueVariables>;
export function getLeague(dc: DataConnect, vars: GetLeagueVariables): QueryPromise<GetLeagueData, GetLeagueVariables>;

interface GetCurrentEventRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCurrentEventVariables): QueryRef<GetCurrentEventData, GetCurrentEventVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetCurrentEventVariables): QueryRef<GetCurrentEventData, GetCurrentEventVariables>;
  operationName: string;
}
export const getCurrentEventRef: GetCurrentEventRef;

export function getCurrentEvent(vars: GetCurrentEventVariables): QueryPromise<GetCurrentEventData, GetCurrentEventVariables>;
export function getCurrentEvent(dc: DataConnect, vars: GetCurrentEventVariables): QueryPromise<GetCurrentEventData, GetCurrentEventVariables>;

interface GetEventRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetEventVariables): QueryRef<GetEventData, GetEventVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetEventVariables): QueryRef<GetEventData, GetEventVariables>;
  operationName: string;
}
export const getEventRef: GetEventRef;

export function getEvent(vars: GetEventVariables): QueryPromise<GetEventData, GetEventVariables>;
export function getEvent(dc: DataConnect, vars: GetEventVariables): QueryPromise<GetEventData, GetEventVariables>;

interface GetSeasonEventsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetSeasonEventsVariables): QueryRef<GetSeasonEventsData, GetSeasonEventsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetSeasonEventsVariables): QueryRef<GetSeasonEventsData, GetSeasonEventsVariables>;
  operationName: string;
}
export const getSeasonEventsRef: GetSeasonEventsRef;

export function getSeasonEvents(vars: GetSeasonEventsVariables): QueryPromise<GetSeasonEventsData, GetSeasonEventsVariables>;
export function getSeasonEvents(dc: DataConnect, vars: GetSeasonEventsVariables): QueryPromise<GetSeasonEventsData, GetSeasonEventsVariables>;

interface GetTournamentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetTournamentVariables): QueryRef<GetTournamentData, GetTournamentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetTournamentVariables): QueryRef<GetTournamentData, GetTournamentVariables>;
  operationName: string;
}
export const getTournamentRef: GetTournamentRef;

export function getTournament(vars: GetTournamentVariables): QueryPromise<GetTournamentData, GetTournamentVariables>;
export function getTournament(dc: DataConnect, vars: GetTournamentVariables): QueryPromise<GetTournamentData, GetTournamentVariables>;

interface GetTournamentWithParticipantsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetTournamentWithParticipantsVariables): QueryRef<GetTournamentWithParticipantsData, GetTournamentWithParticipantsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetTournamentWithParticipantsVariables): QueryRef<GetTournamentWithParticipantsData, GetTournamentWithParticipantsVariables>;
  operationName: string;
}
export const getTournamentWithParticipantsRef: GetTournamentWithParticipantsRef;

export function getTournamentWithParticipants(vars: GetTournamentWithParticipantsVariables): QueryPromise<GetTournamentWithParticipantsData, GetTournamentWithParticipantsVariables>;
export function getTournamentWithParticipants(dc: DataConnect, vars: GetTournamentWithParticipantsVariables): QueryPromise<GetTournamentWithParticipantsData, GetTournamentWithParticipantsVariables>;

interface GetUserTournamentsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserTournamentsVariables): QueryRef<GetUserTournamentsData, GetUserTournamentsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserTournamentsVariables): QueryRef<GetUserTournamentsData, GetUserTournamentsVariables>;
  operationName: string;
}
export const getUserTournamentsRef: GetUserTournamentsRef;

export function getUserTournaments(vars: GetUserTournamentsVariables): QueryPromise<GetUserTournamentsData, GetUserTournamentsVariables>;
export function getUserTournaments(dc: DataConnect, vars: GetUserTournamentsVariables): QueryPromise<GetUserTournamentsData, GetUserTournamentsVariables>;

interface GetLeagueTournamentsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetLeagueTournamentsVariables): QueryRef<GetLeagueTournamentsData, GetLeagueTournamentsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetLeagueTournamentsVariables): QueryRef<GetLeagueTournamentsData, GetLeagueTournamentsVariables>;
  operationName: string;
}
export const getLeagueTournamentsRef: GetLeagueTournamentsRef;

export function getLeagueTournaments(vars: GetLeagueTournamentsVariables): QueryPromise<GetLeagueTournamentsData, GetLeagueTournamentsVariables>;
export function getLeagueTournaments(dc: DataConnect, vars: GetLeagueTournamentsVariables): QueryPromise<GetLeagueTournamentsData, GetLeagueTournamentsVariables>;

interface GetTournamentRoundsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetTournamentRoundsVariables): QueryRef<GetTournamentRoundsData, GetTournamentRoundsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetTournamentRoundsVariables): QueryRef<GetTournamentRoundsData, GetTournamentRoundsVariables>;
  operationName: string;
}
export const getTournamentRoundsRef: GetTournamentRoundsRef;

export function getTournamentRounds(vars: GetTournamentRoundsVariables): QueryPromise<GetTournamentRoundsData, GetTournamentRoundsVariables>;
export function getTournamentRounds(dc: DataConnect, vars: GetTournamentRoundsVariables): QueryPromise<GetTournamentRoundsData, GetTournamentRoundsVariables>;

interface GetRoundRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetRoundVariables): QueryRef<GetRoundData, GetRoundVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetRoundVariables): QueryRef<GetRoundData, GetRoundVariables>;
  operationName: string;
}
export const getRoundRef: GetRoundRef;

export function getRound(vars: GetRoundVariables): QueryPromise<GetRoundData, GetRoundVariables>;
export function getRound(dc: DataConnect, vars: GetRoundVariables): QueryPromise<GetRoundData, GetRoundVariables>;

interface GetActiveRoundsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetActiveRoundsVariables): QueryRef<GetActiveRoundsData, GetActiveRoundsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetActiveRoundsVariables): QueryRef<GetActiveRoundsData, GetActiveRoundsVariables>;
  operationName: string;
}
export const getActiveRoundsRef: GetActiveRoundsRef;

export function getActiveRounds(vars: GetActiveRoundsVariables): QueryPromise<GetActiveRoundsData, GetActiveRoundsVariables>;
export function getActiveRounds(dc: DataConnect, vars: GetActiveRoundsVariables): QueryPromise<GetActiveRoundsData, GetActiveRoundsVariables>;

interface GetRoundMatchesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetRoundMatchesVariables): QueryRef<GetRoundMatchesData, GetRoundMatchesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetRoundMatchesVariables): QueryRef<GetRoundMatchesData, GetRoundMatchesVariables>;
  operationName: string;
}
export const getRoundMatchesRef: GetRoundMatchesRef;

export function getRoundMatches(vars: GetRoundMatchesVariables): QueryPromise<GetRoundMatchesData, GetRoundMatchesVariables>;
export function getRoundMatches(dc: DataConnect, vars: GetRoundMatchesVariables): QueryPromise<GetRoundMatchesData, GetRoundMatchesVariables>;

interface GetMatchRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetMatchVariables): QueryRef<GetMatchData, GetMatchVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetMatchVariables): QueryRef<GetMatchData, GetMatchVariables>;
  operationName: string;
}
export const getMatchRef: GetMatchRef;

export function getMatch(vars: GetMatchVariables): QueryPromise<GetMatchData, GetMatchVariables>;
export function getMatch(dc: DataConnect, vars: GetMatchVariables): QueryPromise<GetMatchData, GetMatchVariables>;

interface GetMatchPicksRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetMatchPicksVariables): QueryRef<GetMatchPicksData, GetMatchPicksVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetMatchPicksVariables): QueryRef<GetMatchPicksData, GetMatchPicksVariables>;
  operationName: string;
}
export const getMatchPicksRef: GetMatchPicksRef;

export function getMatchPicks(vars: GetMatchPicksVariables): QueryPromise<GetMatchPicksData, GetMatchPicksVariables>;
export function getMatchPicks(dc: DataConnect, vars: GetMatchPicksVariables): QueryPromise<GetMatchPicksData, GetMatchPicksVariables>;

interface GetUserMatchesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserMatchesVariables): QueryRef<GetUserMatchesData, GetUserMatchesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserMatchesVariables): QueryRef<GetUserMatchesData, GetUserMatchesVariables>;
  operationName: string;
}
export const getUserMatchesRef: GetUserMatchesRef;

export function getUserMatches(vars: GetUserMatchesVariables): QueryPromise<GetUserMatchesData, GetUserMatchesVariables>;
export function getUserMatches(dc: DataConnect, vars: GetUserMatchesVariables): QueryPromise<GetUserMatchesData, GetUserMatchesVariables>;

interface GetParticipantRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetParticipantVariables): QueryRef<GetParticipantData, GetParticipantVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetParticipantVariables): QueryRef<GetParticipantData, GetParticipantVariables>;
  operationName: string;
}
export const getParticipantRef: GetParticipantRef;

export function getParticipant(vars: GetParticipantVariables): QueryPromise<GetParticipantData, GetParticipantVariables>;
export function getParticipant(dc: DataConnect, vars: GetParticipantVariables): QueryPromise<GetParticipantData, GetParticipantVariables>;

interface GetActiveParticipantsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetActiveParticipantsVariables): QueryRef<GetActiveParticipantsData, GetActiveParticipantsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetActiveParticipantsVariables): QueryRef<GetActiveParticipantsData, GetActiveParticipantsVariables>;
  operationName: string;
}
export const getActiveParticipantsRef: GetActiveParticipantsRef;

export function getActiveParticipants(vars: GetActiveParticipantsVariables): QueryPromise<GetActiveParticipantsData, GetActiveParticipantsVariables>;
export function getActiveParticipants(dc: DataConnect, vars: GetActiveParticipantsVariables): QueryPromise<GetActiveParticipantsData, GetActiveParticipantsVariables>;

interface GetUserParticipationsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserParticipationsVariables): QueryRef<GetUserParticipationsData, GetUserParticipationsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserParticipationsVariables): QueryRef<GetUserParticipationsData, GetUserParticipationsVariables>;
  operationName: string;
}
export const getUserParticipationsRef: GetUserParticipationsRef;

export function getUserParticipations(vars: GetUserParticipationsVariables): QueryPromise<GetUserParticipationsData, GetUserParticipationsVariables>;
export function getUserParticipations(dc: DataConnect, vars: GetUserParticipationsVariables): QueryPromise<GetUserParticipationsData, GetUserParticipationsVariables>;

