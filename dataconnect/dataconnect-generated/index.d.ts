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

export interface CreateEmailQueueEntryData {
  emailQueue_insert: EmailQueue_Key;
}

export interface CreateEmailQueueEntryVariables {
  userUid: string;
  toEmail: string;
  type: string;
  event: number;
  subject: string;
  htmlBody: string;
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

export interface CreateParticipantLeaguesData {
  participantLeague_insertMany: ParticipantLeague_Key[];
}

export interface CreateParticipantLeaguesVariables {
  data: ({
    tournamentId?: UUIDString | null;
    tournamentId_expr?: {
    };
      entryId?: number | null;
      entryId_expr?: {
      };
        entryId_update?: ({
          inc?: number | null;
          dec?: number | null;
        })[];
          leagueId?: number | null;
          leagueId_expr?: {
          };
            leagueId_update?: ({
              inc?: number | null;
              dec?: number | null;
            })[];
              participant?: Participant_Key | null;
              tournament?: Tournament_Key | null;
              entryRank?: number | null;
              entryRank_expr?: {
              };
                entryRank_update?: ({
                  inc?: number | null;
                  dec?: number | null;
                })[];
                  leagueName?: string | null;
                  leagueName_expr?: {
                  };
  })[];
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
  matchSize: number;
}

export interface CreateTournamentWithImportStatusData {
  tournament_insert: Tournament_Key;
}

export interface CreateTournamentWithImportStatusVariables {
  id: UUIDString;
  fplLeagueId: number;
  fplLeagueName: string;
  creatorUid: string;
  participantCount: number;
  totalRounds: number;
  startEvent: number;
  seedingMethod: string;
  matchSize: number;
  isTest: boolean;
  size: string;
  importStatus: string;
  totalCount: number;
}

export interface DeleteMatchPicksByTournamentData {
  matchPick_deleteMany: number;
}

export interface DeleteMatchPicksByTournamentVariables {
  tournamentId: UUIDString;
}

export interface DeleteMatchesByTournamentData {
  match_deleteMany: number;
}

export interface DeleteMatchesByTournamentVariables {
  tournamentId: UUIDString;
}

export interface DeleteParticipantsByTournamentData {
  participant_deleteMany: number;
}

export interface DeleteParticipantsByTournamentVariables {
  tournamentId: UUIDString;
}

export interface DeleteRoundsByTournamentData {
  round_deleteMany: number;
}

export interface DeleteRoundsByTournamentVariables {
  tournamentId: UUIDString;
}

export interface DeleteStaleLeagueEntriesData {
  leagueEntry_deleteMany: number;
}

export interface DeleteStaleLeagueEntriesVariables {
  leagueId: number;
  season: string;
  currentRefreshId: UUIDString;
}

export interface DeleteTournamentByIdData {
  tournament_delete?: Tournament_Key | null;
}

export interface DeleteTournamentByIdVariables {
  id: UUIDString;
}

export interface DeleteTournamentData {
  tournament_delete?: Tournament_Key | null;
}

export interface DeleteTournamentVariables {
  id: UUIDString;
}

export interface EmailQueue_Key {
  id: UUIDString;
  __typename?: 'EmailQueue_Key';
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

export interface FinalizeTournamentImportData {
  tournament_update?: Tournament_Key | null;
}

export interface FinalizeTournamentImportVariables {
  id: UUIDString;
  participantCount: number;
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

export interface GetAllTournamentMatchPicksData {
  matchPicks: ({
    matchId: number;
    entryId: number;
    slot: number;
    entry: {
      entryId: number;
      name: string;
      playerFirstName?: string | null;
      playerLastName?: string | null;
    } & Entry_Key;
      participant: {
        seed: number;
        teamName: string;
        managerName: string;
      };
  })[];
}

export interface GetAllTournamentMatchPicksVariables {
  tournamentId: UUIDString;
}

export interface GetAllTournamentsData {
  tournaments: ({
    id: UUIDString;
    fplLeagueId: number;
    fplLeagueName: string;
    participantCount: number;
    status: string;
    createdAt: TimestampString;
  } & Tournament_Key)[];
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

export interface GetEntryMatchPicksData {
  matchPicks: ({
    tournamentId: UUIDString;
    matchId: number;
    entryId: number;
    slot: number;
    match: {
      matchId: number;
      roundNumber: number;
      status: string;
      winnerEntryId?: number | null;
      updatedAt: TimestampString;
      isBye: boolean;
    };
  } & MatchPick_Key)[];
}

export interface GetEntryMatchPicksVariables {
  entryId: number;
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

export interface GetEventFinalizationData {
  events: ({
    event: number;
    season: string;
    finished: boolean;
    finalizedAt?: TimestampString | null;
  } & Event_Key)[];
}

export interface GetEventFinalizationVariables {
  event: number;
  season: string;
}

export interface GetEventVariables {
  event: number;
  season: string;
}

export interface GetEventsNeedingFinalizationData {
  events: ({
    event: number;
    season: string;
    name: string;
    finished: boolean;
    finalizedAt?: TimestampString | null;
    deadlineTime: TimestampString;
    rawJson: string;
    isCurrent: boolean;
    isNext: boolean;
  } & Event_Key)[];
}

export interface GetEventsNeedingFinalizationVariables {
  season: string;
}

export interface GetExistingEmailQueueData {
  emailQueues: ({
    id: UUIDString;
    status: string;
  } & EmailQueue_Key)[];
}

export interface GetExistingEmailQueueVariables {
  userUid: string;
  type: string;
  event: number;
}

export interface GetFinalizedEventsData {
  events: ({
    event: number;
    season: string;
    name: string;
    finished: boolean;
    finalizedAt?: TimestampString | null;
  } & Event_Key)[];
}

export interface GetFinalizedEventsVariables {
  season: string;
}

export interface GetFriendsInTournamentData {
  userLeagues: ({
    leagueId: number;
  })[];
    tournamentParticipants: ({
      entryId: number;
      seed: number;
      status: string;
      entry: {
        name: string;
        playerFirstName?: string | null;
        playerLastName?: string | null;
      };
    })[];
}

export interface GetFriendsInTournamentVariables {
  tournamentId: UUIDString;
  userEntryId: number;
  season: string;
}

export interface GetHighestSeedRemainingData {
  participants: ({
    entryId: number;
    teamName: string;
    managerName: string;
    seed: number;
  })[];
}

export interface GetHighestSeedRemainingVariables {
  tournamentId: UUIDString;
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

export interface GetLeagueEntriesData {
  leagueEntries: ({
    entryId: number;
    rank?: number | null;
    refreshId: UUIDString;
    entry: {
      name: string;
      playerFirstName?: string | null;
      playerLastName?: string | null;
    };
  })[];
}

export interface GetLeagueEntriesForEntriesData {
  leagueEntries: ({
    entryId: number;
    leagueId: number;
  })[];
}

export interface GetLeagueEntriesForEntriesVariables {
  entryIds: number[];
  season: string;
}

export interface GetLeagueEntriesVariables {
  leagueId: number;
  season: string;
}

export interface GetLeagueRefreshStatusData {
  leagues: ({
    leagueId: number;
    name: string;
    entriesCount?: number | null;
    lastRefreshId?: UUIDString | null;
    lastRefreshAt?: TimestampString | null;
  })[];
}

export interface GetLeagueRefreshStatusVariables {
  leagueId: number;
  season: string;
}

export interface GetLeagueTournamentsData {
  tournaments: ({
    id: UUIDString;
    fplLeagueName: string;
    participantCount: number;
    totalRounds: number;
    currentRound: number;
    startEvent: number;
    seedingMethod: string;
    matchSize: number;
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

export interface GetLeaguesData {
  leagues: ({
    leagueId: number;
    name: string;
  })[];
}

export interface GetLeaguesVariables {
  leagueIds: number[];
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

export interface GetMatchParticipantsData {
  matchPicks: ({
    entryId: number;
    slot: number;
    participant: {
      entryId: number;
      teamName: string;
      seed: number;
    };
  })[];
}

export interface GetMatchParticipantsVariables {
  tournamentId: UUIDString;
  matchId: number;
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

export interface GetMatchesInRangeData {
  matches: ({
    matchId: number;
    roundNumber: number;
    positionInRound: number;
    status: string;
    winnerEntryId?: number | null;
    isBye: boolean;
    qualifiesToMatchId?: number | null;
    matchPicks_on_match: ({
      entryId: number;
      slot: number;
      participant: {
        seed: number;
        teamName: string;
        managerName: string;
      };
    })[];
  })[];
}

export interface GetMatchesInRangeVariables {
  tournamentId: UUIDString;
  roundNumber: number;
  startPosition: number;
  endPosition: number;
}

export interface GetOpponentMatchHistoriesData {
  matchPicks: ({
    entryId: number;
    slot: number;
    match: {
      matchId: number;
      roundNumber: number;
      positionInRound: number;
      status: string;
      winnerEntryId?: number | null;
      isBye: boolean;
      matchPicks_on_match: ({
        entryId: number;
        slot: number;
        participant: {
          entryId: number;
          teamName: string;
          managerName: string;
          seed: number;
        };
      })[];
    };
  })[];
}

export interface GetOpponentMatchHistoriesVariables {
  tournamentId: UUIDString;
  entryIds: number[];
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

export interface GetParticipantLeaguesForTournamentData {
  participantLeagues: ({
    tournamentId: UUIDString;
    entryId: number;
    leagueId: number;
    leagueName: string;
    entryRank?: number | null;
  } & ParticipantLeague_Key)[];
}

export interface GetParticipantLeaguesForTournamentVariables {
  tournamentId: UUIDString;
}

export interface GetParticipantVariables {
  tournamentId: UUIDString;
  entryId: number;
}

export interface GetPendingActiveRoundsData {
  rounds: ({
    tournamentId: UUIDString;
    roundNumber: number;
    event: number;
    status: string;
    updatedAt?: TimestampString | null;
    tournament: {
      id: UUIDString;
      fplLeagueId: number;
      fplLeagueName: string;
      totalRounds: number;
      status: string;
    } & Tournament_Key;
  } & Round_Key)[];
}

export interface GetPendingActiveRoundsVariables {
  maxEvent: number;
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

export interface GetPickScoresData {
  picks: ({
    entryId: number;
    event: number;
    points: number;
  } & Pick_Key)[];
}

export interface GetPickScoresVariables {
  entryIds: number[];
  event: number;
}

export interface GetPickVariables {
  entryId: number;
  event: number;
}

export interface GetPicksForEventData {
  picks: ({
    entryId: number;
    event: number;
    points: number;
    totalPoints?: number | null;
    rank?: number | null;
    isFinal: boolean;
  } & Pick_Key)[];
}

export interface GetPicksForEventVariables {
  event: number;
  entryIds: number[];
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
    matchPicks_on_match: ({
      entryId: number;
      slot: number;
      participant: {
        seed: number;
        teamName: string;
        managerName: string;
      };
    })[];
  } & Match_Key)[];
}

export interface GetRoundMatchesVariables {
  tournamentId: UUIDString;
  roundNumber: number;
  limit?: number | null;
  offset?: number | null;
}

export interface GetRoundMatchesWithPriorityData {
  matches: ({
    matchId: number;
    roundNumber: number;
    positionInRound: number;
    status: string;
    winnerEntryId?: number | null;
    qualifiesToMatchId?: number | null;
    matchPicks_on_match: ({
      entryId: number;
      slot: number;
      participant: {
        seed: number;
        uid?: string | null;
        teamName: string;
        managerName: string;
      };
    })[];
  })[];
}

export interface GetRoundMatchesWithPriorityVariables {
  tournamentId: UUIDString;
  roundNumber: number;
}

export interface GetRoundVariables {
  tournamentId: UUIDString;
  roundNumber: number;
}

export interface GetRoundsInEventData {
  rounds: ({
    tournamentId: UUIDString;
    roundNumber: number;
    event: number;
  } & Round_Key)[];
}

export interface GetRoundsInEventVariables {
  event: number;
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
    matchSize: number;
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

export interface GetTournamentEntriesData {
  tournamentEntries: ({
    entryId: number;
    seed: number;
    status: string;
    eliminationRound?: number | null;
    uid?: string | null;
    entry: {
      name: string;
      playerFirstName?: string | null;
      playerLastName?: string | null;
      summaryOverallPoints?: number | null;
    };
  })[];
}

export interface GetTournamentEntriesVariables {
  tournamentId: UUIDString;
}

export interface GetTournamentImportStatusData {
  tournament?: {
    id: UUIDString;
    importStatus?: string | null;
    importProgress?: number | null;
    importedCount?: number | null;
    totalCount?: number | null;
    importError?: string | null;
  } & Tournament_Key;
}

export interface GetTournamentImportStatusVariables {
  id: UUIDString;
}

export interface GetTournamentParticipantsWithUsersData {
  participants: ({
    tournamentId: UUIDString;
    uid?: string | null;
    entryId: number;
    teamName: string;
    user?: {
      uid: string;
      email: string;
    } & User_Key;
  } & Participant_Key)[];
}

export interface GetTournamentParticipantsWithUsersVariables {
  tournamentId: UUIDString;
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
    seedingMethod: string;
    matchSize: number;
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
  participantLimit?: number | null;
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

export interface GetUserTournamentEntryData {
  tournamentEntries: ({
    entryId: number;
    seed: number;
    status: string;
    eliminationRound?: number | null;
    uid?: string | null;
  })[];
}

export interface GetUserTournamentEntryVariables {
  tournamentId: UUIDString;
  entryId: number;
}

export interface GetUserTournamentMatchesData {
  matchPicks: ({
    matchId: number;
    entryId: number;
    slot: number;
    participant: {
      entryId: number;
      teamName: string;
      managerName: string;
      seed: number;
      status: string;
    };
      match: {
        matchId: number;
        roundNumber: number;
        positionInRound: number;
        status: string;
        winnerEntryId?: number | null;
        isBye: boolean;
        matchPicks_on_match: ({
          entryId: number;
          slot: number;
          participant: {
            entryId: number;
            teamName: string;
            managerName: string;
            seed: number;
          };
        })[];
      };
  })[];
}

export interface GetUserTournamentMatchesVariables {
  tournamentId: UUIDString;
  entryId: number;
}

export interface GetUserTournamentsData {
  tournaments: ({
    id: UUIDString;
    fplLeagueId: number;
    fplLeagueName: string;
    participantCount: number;
    totalRounds: number;
    currentRound: number;
    startEvent: number;
    seedingMethod: string;
    matchSize: number;
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

export interface GetUserVerdictMatchPicksData {
  matchPicks: ({
    tournamentId: UUIDString;
    matchId: number;
    entryId: number;
    slot: number;
    match: {
      matchId: number;
      roundNumber: number;
      status: string;
      winnerEntryId?: number | null;
      isBye: boolean;
      positionInRound: number;
      tournament: {
        id: UUIDString;
        fplLeagueName: string;
        totalRounds: number;
      } & Tournament_Key;
    };
      participant: {
        entryId: number;
        teamName: string;
        seed: number;
      };
  } & MatchPick_Key)[];
}

export interface GetUserVerdictMatchPicksVariables {
  entryId: number;
}

export interface LeagueEntry_Key {
  leagueId: number;
  entryId: number;
  season: string;
  __typename?: 'LeagueEntry_Key';
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

export interface ParticipantLeague_Key {
  tournamentId: UUIDString;
  entryId: number;
  leagueId: number;
  __typename?: 'ParticipantLeague_Key';
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

export interface SearchParticipantsData {
  participants: ({
    entryId: number;
    teamName: string;
    managerName: string;
    seed: number;
    status: string;
  })[];
}

export interface SearchParticipantsVariables {
  tournamentId: UUIDString;
  searchTerm: string;
  limit?: number | null;
}

export interface SetTournamentWinnerData {
  tournament_update?: Tournament_Key | null;
}

export interface SetTournamentWinnerVariables {
  id: UUIDString;
  winnerEntryId: number;
}

export interface TournamentEntry_Key {
  tournamentId: UUIDString;
  entryId: number;
  __typename?: 'TournamentEntry_Key';
}

export interface Tournament_Key {
  id: UUIDString;
  __typename?: 'Tournament_Key';
}

export interface UpdateMatchData {
  match_upsert: Match_Key;
}

export interface UpdateMatchUpdatedAtData {
  match_update?: Match_Key | null;
}

export interface UpdateMatchUpdatedAtVariables {
  tournamentId: UUIDString;
  matchId: number;
  updatedAt: TimestampString;
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

export interface UpdateRoundUpdatedAtData {
  round_update?: Round_Key | null;
}

export interface UpdateRoundUpdatedAtVariables {
  tournamentId: UUIDString;
  roundNumber: number;
  updatedAt: TimestampString;
}

export interface UpdateRoundVariables {
  tournamentId: UUIDString;
  roundNumber: number;
  event: number;
  status: string;
}

export interface UpdateTournamentImportProgressData {
  tournament_update?: Tournament_Key | null;
}

export interface UpdateTournamentImportProgressVariables {
  id: UUIDString;
  importStatus: string;
  importProgress: number;
  importedCount: number;
  importError?: string | null;
}

export interface UpdateTournamentStatusData {
  tournament_update?: Tournament_Key | null;
}

export interface UpdateTournamentStatusVariables {
  id: UUIDString;
  status: string;
  winnerEntryId?: number | null;
  updatedAt: TimestampString;
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
  finalizedAt?: TimestampString | null;
  isCurrent: boolean;
  isNext: boolean;
  rawJson: string;
}

export interface UpsertLeagueData {
  league_upsert: League_Key;
}

export interface UpsertLeagueEntriesBatchData {
  leagueEntry_upsertMany: LeagueEntry_Key[];
}

export interface UpsertLeagueEntriesBatchVariables {
  entries: ({
    leagueId?: number | null;
    leagueId_expr?: {
    };
      leagueId_update?: ({
        inc?: number | null;
        dec?: number | null;
      })[];
        entryId?: number | null;
        entryId_expr?: {
        };
          entryId_update?: ({
            inc?: number | null;
            dec?: number | null;
          })[];
            season?: string | null;
            season_expr?: {
            };
              entryEntryId?: number | null;
              entryEntryId_expr?: {
              };
                entryEntryId_update?: ({
                  inc?: number | null;
                  dec?: number | null;
                })[];
                  entry?: Entry_Key | null;
                  rank?: number | null;
                  rank_expr?: {
                  };
                    rank_update?: ({
                      inc?: number | null;
                      dec?: number | null;
                    })[];
                      refreshId?: UUIDString | null;
                      refreshId_expr?: {
                      };
  })[];
}

export interface UpsertLeagueVariables {
  leagueId: number;
  season: string;
  name: string;
  created?: TimestampString | null;
  adminEntry?: number | null;
  entriesCount?: number | null;
  refreshId?: UUIDString | null;
  rawJson: string;
}

export interface UpsertParticipantLeagueData {
  participantLeague_upsert: ParticipantLeague_Key;
}

export interface UpsertParticipantLeagueVariables {
  tournamentId: UUIDString;
  entryId: number;
  leagueId: number;
  leagueName: string;
  entryRank?: number | null;
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

interface UpsertLeagueEntriesBatchRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertLeagueEntriesBatchVariables): MutationRef<UpsertLeagueEntriesBatchData, UpsertLeagueEntriesBatchVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertLeagueEntriesBatchVariables): MutationRef<UpsertLeagueEntriesBatchData, UpsertLeagueEntriesBatchVariables>;
  operationName: string;
}
export const upsertLeagueEntriesBatchRef: UpsertLeagueEntriesBatchRef;

export function upsertLeagueEntriesBatch(vars: UpsertLeagueEntriesBatchVariables): MutationPromise<UpsertLeagueEntriesBatchData, UpsertLeagueEntriesBatchVariables>;
export function upsertLeagueEntriesBatch(dc: DataConnect, vars: UpsertLeagueEntriesBatchVariables): MutationPromise<UpsertLeagueEntriesBatchData, UpsertLeagueEntriesBatchVariables>;

interface DeleteStaleLeagueEntriesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteStaleLeagueEntriesVariables): MutationRef<DeleteStaleLeagueEntriesData, DeleteStaleLeagueEntriesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteStaleLeagueEntriesVariables): MutationRef<DeleteStaleLeagueEntriesData, DeleteStaleLeagueEntriesVariables>;
  operationName: string;
}
export const deleteStaleLeagueEntriesRef: DeleteStaleLeagueEntriesRef;

export function deleteStaleLeagueEntries(vars: DeleteStaleLeagueEntriesVariables): MutationPromise<DeleteStaleLeagueEntriesData, DeleteStaleLeagueEntriesVariables>;
export function deleteStaleLeagueEntries(dc: DataConnect, vars: DeleteStaleLeagueEntriesVariables): MutationPromise<DeleteStaleLeagueEntriesData, DeleteStaleLeagueEntriesVariables>;

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

interface CreateTournamentWithImportStatusRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateTournamentWithImportStatusVariables): MutationRef<CreateTournamentWithImportStatusData, CreateTournamentWithImportStatusVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateTournamentWithImportStatusVariables): MutationRef<CreateTournamentWithImportStatusData, CreateTournamentWithImportStatusVariables>;
  operationName: string;
}
export const createTournamentWithImportStatusRef: CreateTournamentWithImportStatusRef;

export function createTournamentWithImportStatus(vars: CreateTournamentWithImportStatusVariables): MutationPromise<CreateTournamentWithImportStatusData, CreateTournamentWithImportStatusVariables>;
export function createTournamentWithImportStatus(dc: DataConnect, vars: CreateTournamentWithImportStatusVariables): MutationPromise<CreateTournamentWithImportStatusData, CreateTournamentWithImportStatusVariables>;

interface UpdateTournamentImportProgressRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateTournamentImportProgressVariables): MutationRef<UpdateTournamentImportProgressData, UpdateTournamentImportProgressVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateTournamentImportProgressVariables): MutationRef<UpdateTournamentImportProgressData, UpdateTournamentImportProgressVariables>;
  operationName: string;
}
export const updateTournamentImportProgressRef: UpdateTournamentImportProgressRef;

export function updateTournamentImportProgress(vars: UpdateTournamentImportProgressVariables): MutationPromise<UpdateTournamentImportProgressData, UpdateTournamentImportProgressVariables>;
export function updateTournamentImportProgress(dc: DataConnect, vars: UpdateTournamentImportProgressVariables): MutationPromise<UpdateTournamentImportProgressData, UpdateTournamentImportProgressVariables>;

interface FinalizeTournamentImportRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: FinalizeTournamentImportVariables): MutationRef<FinalizeTournamentImportData, FinalizeTournamentImportVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: FinalizeTournamentImportVariables): MutationRef<FinalizeTournamentImportData, FinalizeTournamentImportVariables>;
  operationName: string;
}
export const finalizeTournamentImportRef: FinalizeTournamentImportRef;

export function finalizeTournamentImport(vars: FinalizeTournamentImportVariables): MutationPromise<FinalizeTournamentImportData, FinalizeTournamentImportVariables>;
export function finalizeTournamentImport(dc: DataConnect, vars: FinalizeTournamentImportVariables): MutationPromise<FinalizeTournamentImportData, FinalizeTournamentImportVariables>;

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

interface UpdateRoundUpdatedAtRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateRoundUpdatedAtVariables): MutationRef<UpdateRoundUpdatedAtData, UpdateRoundUpdatedAtVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateRoundUpdatedAtVariables): MutationRef<UpdateRoundUpdatedAtData, UpdateRoundUpdatedAtVariables>;
  operationName: string;
}
export const updateRoundUpdatedAtRef: UpdateRoundUpdatedAtRef;

export function updateRoundUpdatedAt(vars: UpdateRoundUpdatedAtVariables): MutationPromise<UpdateRoundUpdatedAtData, UpdateRoundUpdatedAtVariables>;
export function updateRoundUpdatedAt(dc: DataConnect, vars: UpdateRoundUpdatedAtVariables): MutationPromise<UpdateRoundUpdatedAtData, UpdateRoundUpdatedAtVariables>;

interface UpdateMatchUpdatedAtRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateMatchUpdatedAtVariables): MutationRef<UpdateMatchUpdatedAtData, UpdateMatchUpdatedAtVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateMatchUpdatedAtVariables): MutationRef<UpdateMatchUpdatedAtData, UpdateMatchUpdatedAtVariables>;
  operationName: string;
}
export const updateMatchUpdatedAtRef: UpdateMatchUpdatedAtRef;

export function updateMatchUpdatedAt(vars: UpdateMatchUpdatedAtVariables): MutationPromise<UpdateMatchUpdatedAtData, UpdateMatchUpdatedAtVariables>;
export function updateMatchUpdatedAt(dc: DataConnect, vars: UpdateMatchUpdatedAtVariables): MutationPromise<UpdateMatchUpdatedAtData, UpdateMatchUpdatedAtVariables>;

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

interface DeleteMatchPicksByTournamentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteMatchPicksByTournamentVariables): MutationRef<DeleteMatchPicksByTournamentData, DeleteMatchPicksByTournamentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteMatchPicksByTournamentVariables): MutationRef<DeleteMatchPicksByTournamentData, DeleteMatchPicksByTournamentVariables>;
  operationName: string;
}
export const deleteMatchPicksByTournamentRef: DeleteMatchPicksByTournamentRef;

export function deleteMatchPicksByTournament(vars: DeleteMatchPicksByTournamentVariables): MutationPromise<DeleteMatchPicksByTournamentData, DeleteMatchPicksByTournamentVariables>;
export function deleteMatchPicksByTournament(dc: DataConnect, vars: DeleteMatchPicksByTournamentVariables): MutationPromise<DeleteMatchPicksByTournamentData, DeleteMatchPicksByTournamentVariables>;

interface DeleteMatchesByTournamentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteMatchesByTournamentVariables): MutationRef<DeleteMatchesByTournamentData, DeleteMatchesByTournamentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteMatchesByTournamentVariables): MutationRef<DeleteMatchesByTournamentData, DeleteMatchesByTournamentVariables>;
  operationName: string;
}
export const deleteMatchesByTournamentRef: DeleteMatchesByTournamentRef;

export function deleteMatchesByTournament(vars: DeleteMatchesByTournamentVariables): MutationPromise<DeleteMatchesByTournamentData, DeleteMatchesByTournamentVariables>;
export function deleteMatchesByTournament(dc: DataConnect, vars: DeleteMatchesByTournamentVariables): MutationPromise<DeleteMatchesByTournamentData, DeleteMatchesByTournamentVariables>;

interface DeleteRoundsByTournamentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteRoundsByTournamentVariables): MutationRef<DeleteRoundsByTournamentData, DeleteRoundsByTournamentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteRoundsByTournamentVariables): MutationRef<DeleteRoundsByTournamentData, DeleteRoundsByTournamentVariables>;
  operationName: string;
}
export const deleteRoundsByTournamentRef: DeleteRoundsByTournamentRef;

export function deleteRoundsByTournament(vars: DeleteRoundsByTournamentVariables): MutationPromise<DeleteRoundsByTournamentData, DeleteRoundsByTournamentVariables>;
export function deleteRoundsByTournament(dc: DataConnect, vars: DeleteRoundsByTournamentVariables): MutationPromise<DeleteRoundsByTournamentData, DeleteRoundsByTournamentVariables>;

interface DeleteParticipantsByTournamentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteParticipantsByTournamentVariables): MutationRef<DeleteParticipantsByTournamentData, DeleteParticipantsByTournamentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteParticipantsByTournamentVariables): MutationRef<DeleteParticipantsByTournamentData, DeleteParticipantsByTournamentVariables>;
  operationName: string;
}
export const deleteParticipantsByTournamentRef: DeleteParticipantsByTournamentRef;

export function deleteParticipantsByTournament(vars: DeleteParticipantsByTournamentVariables): MutationPromise<DeleteParticipantsByTournamentData, DeleteParticipantsByTournamentVariables>;
export function deleteParticipantsByTournament(dc: DataConnect, vars: DeleteParticipantsByTournamentVariables): MutationPromise<DeleteParticipantsByTournamentData, DeleteParticipantsByTournamentVariables>;

interface DeleteTournamentByIdRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteTournamentByIdVariables): MutationRef<DeleteTournamentByIdData, DeleteTournamentByIdVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteTournamentByIdVariables): MutationRef<DeleteTournamentByIdData, DeleteTournamentByIdVariables>;
  operationName: string;
}
export const deleteTournamentByIdRef: DeleteTournamentByIdRef;

export function deleteTournamentById(vars: DeleteTournamentByIdVariables): MutationPromise<DeleteTournamentByIdData, DeleteTournamentByIdVariables>;
export function deleteTournamentById(dc: DataConnect, vars: DeleteTournamentByIdVariables): MutationPromise<DeleteTournamentByIdData, DeleteTournamentByIdVariables>;

interface CreateEmailQueueEntryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateEmailQueueEntryVariables): MutationRef<CreateEmailQueueEntryData, CreateEmailQueueEntryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateEmailQueueEntryVariables): MutationRef<CreateEmailQueueEntryData, CreateEmailQueueEntryVariables>;
  operationName: string;
}
export const createEmailQueueEntryRef: CreateEmailQueueEntryRef;

export function createEmailQueueEntry(vars: CreateEmailQueueEntryVariables): MutationPromise<CreateEmailQueueEntryData, CreateEmailQueueEntryVariables>;
export function createEmailQueueEntry(dc: DataConnect, vars: CreateEmailQueueEntryVariables): MutationPromise<CreateEmailQueueEntryData, CreateEmailQueueEntryVariables>;

interface CreateParticipantLeaguesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateParticipantLeaguesVariables): MutationRef<CreateParticipantLeaguesData, CreateParticipantLeaguesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateParticipantLeaguesVariables): MutationRef<CreateParticipantLeaguesData, CreateParticipantLeaguesVariables>;
  operationName: string;
}
export const createParticipantLeaguesRef: CreateParticipantLeaguesRef;

export function createParticipantLeagues(vars: CreateParticipantLeaguesVariables): MutationPromise<CreateParticipantLeaguesData, CreateParticipantLeaguesVariables>;
export function createParticipantLeagues(dc: DataConnect, vars: CreateParticipantLeaguesVariables): MutationPromise<CreateParticipantLeaguesData, CreateParticipantLeaguesVariables>;

interface UpsertParticipantLeagueRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertParticipantLeagueVariables): MutationRef<UpsertParticipantLeagueData, UpsertParticipantLeagueVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertParticipantLeagueVariables): MutationRef<UpsertParticipantLeagueData, UpsertParticipantLeagueVariables>;
  operationName: string;
}
export const upsertParticipantLeagueRef: UpsertParticipantLeagueRef;

export function upsertParticipantLeague(vars: UpsertParticipantLeagueVariables): MutationPromise<UpsertParticipantLeagueData, UpsertParticipantLeagueVariables>;
export function upsertParticipantLeague(dc: DataConnect, vars: UpsertParticipantLeagueVariables): MutationPromise<UpsertParticipantLeagueData, UpsertParticipantLeagueVariables>;

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

interface GetPicksForEventRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetPicksForEventVariables): QueryRef<GetPicksForEventData, GetPicksForEventVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetPicksForEventVariables): QueryRef<GetPicksForEventData, GetPicksForEventVariables>;
  operationName: string;
}
export const getPicksForEventRef: GetPicksForEventRef;

export function getPicksForEvent(vars: GetPicksForEventVariables): QueryPromise<GetPicksForEventData, GetPicksForEventVariables>;
export function getPicksForEvent(dc: DataConnect, vars: GetPicksForEventVariables): QueryPromise<GetPicksForEventData, GetPicksForEventVariables>;

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

interface GetLeaguesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetLeaguesVariables): QueryRef<GetLeaguesData, GetLeaguesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetLeaguesVariables): QueryRef<GetLeaguesData, GetLeaguesVariables>;
  operationName: string;
}
export const getLeaguesRef: GetLeaguesRef;

export function getLeagues(vars: GetLeaguesVariables): QueryPromise<GetLeaguesData, GetLeaguesVariables>;
export function getLeagues(dc: DataConnect, vars: GetLeaguesVariables): QueryPromise<GetLeaguesData, GetLeaguesVariables>;

interface GetLeagueRefreshStatusRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetLeagueRefreshStatusVariables): QueryRef<GetLeagueRefreshStatusData, GetLeagueRefreshStatusVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetLeagueRefreshStatusVariables): QueryRef<GetLeagueRefreshStatusData, GetLeagueRefreshStatusVariables>;
  operationName: string;
}
export const getLeagueRefreshStatusRef: GetLeagueRefreshStatusRef;

export function getLeagueRefreshStatus(vars: GetLeagueRefreshStatusVariables): QueryPromise<GetLeagueRefreshStatusData, GetLeagueRefreshStatusVariables>;
export function getLeagueRefreshStatus(dc: DataConnect, vars: GetLeagueRefreshStatusVariables): QueryPromise<GetLeagueRefreshStatusData, GetLeagueRefreshStatusVariables>;

interface GetLeagueEntriesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetLeagueEntriesVariables): QueryRef<GetLeagueEntriesData, GetLeagueEntriesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetLeagueEntriesVariables): QueryRef<GetLeagueEntriesData, GetLeagueEntriesVariables>;
  operationName: string;
}
export const getLeagueEntriesRef: GetLeagueEntriesRef;

export function getLeagueEntries(vars: GetLeagueEntriesVariables): QueryPromise<GetLeagueEntriesData, GetLeagueEntriesVariables>;
export function getLeagueEntries(dc: DataConnect, vars: GetLeagueEntriesVariables): QueryPromise<GetLeagueEntriesData, GetLeagueEntriesVariables>;

interface GetTournamentEntriesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetTournamentEntriesVariables): QueryRef<GetTournamentEntriesData, GetTournamentEntriesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetTournamentEntriesVariables): QueryRef<GetTournamentEntriesData, GetTournamentEntriesVariables>;
  operationName: string;
}
export const getTournamentEntriesRef: GetTournamentEntriesRef;

export function getTournamentEntries(vars: GetTournamentEntriesVariables): QueryPromise<GetTournamentEntriesData, GetTournamentEntriesVariables>;
export function getTournamentEntries(dc: DataConnect, vars: GetTournamentEntriesVariables): QueryPromise<GetTournamentEntriesData, GetTournamentEntriesVariables>;

interface GetUserTournamentEntryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserTournamentEntryVariables): QueryRef<GetUserTournamentEntryData, GetUserTournamentEntryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserTournamentEntryVariables): QueryRef<GetUserTournamentEntryData, GetUserTournamentEntryVariables>;
  operationName: string;
}
export const getUserTournamentEntryRef: GetUserTournamentEntryRef;

export function getUserTournamentEntry(vars: GetUserTournamentEntryVariables): QueryPromise<GetUserTournamentEntryData, GetUserTournamentEntryVariables>;
export function getUserTournamentEntry(dc: DataConnect, vars: GetUserTournamentEntryVariables): QueryPromise<GetUserTournamentEntryData, GetUserTournamentEntryVariables>;

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

interface GetEventsNeedingFinalizationRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetEventsNeedingFinalizationVariables): QueryRef<GetEventsNeedingFinalizationData, GetEventsNeedingFinalizationVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetEventsNeedingFinalizationVariables): QueryRef<GetEventsNeedingFinalizationData, GetEventsNeedingFinalizationVariables>;
  operationName: string;
}
export const getEventsNeedingFinalizationRef: GetEventsNeedingFinalizationRef;

export function getEventsNeedingFinalization(vars: GetEventsNeedingFinalizationVariables): QueryPromise<GetEventsNeedingFinalizationData, GetEventsNeedingFinalizationVariables>;
export function getEventsNeedingFinalization(dc: DataConnect, vars: GetEventsNeedingFinalizationVariables): QueryPromise<GetEventsNeedingFinalizationData, GetEventsNeedingFinalizationVariables>;

interface GetFinalizedEventsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetFinalizedEventsVariables): QueryRef<GetFinalizedEventsData, GetFinalizedEventsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetFinalizedEventsVariables): QueryRef<GetFinalizedEventsData, GetFinalizedEventsVariables>;
  operationName: string;
}
export const getFinalizedEventsRef: GetFinalizedEventsRef;

export function getFinalizedEvents(vars: GetFinalizedEventsVariables): QueryPromise<GetFinalizedEventsData, GetFinalizedEventsVariables>;
export function getFinalizedEvents(dc: DataConnect, vars: GetFinalizedEventsVariables): QueryPromise<GetFinalizedEventsData, GetFinalizedEventsVariables>;

interface GetEventFinalizationRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetEventFinalizationVariables): QueryRef<GetEventFinalizationData, GetEventFinalizationVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetEventFinalizationVariables): QueryRef<GetEventFinalizationData, GetEventFinalizationVariables>;
  operationName: string;
}
export const getEventFinalizationRef: GetEventFinalizationRef;

export function getEventFinalization(vars: GetEventFinalizationVariables): QueryPromise<GetEventFinalizationData, GetEventFinalizationVariables>;
export function getEventFinalization(dc: DataConnect, vars: GetEventFinalizationVariables): QueryPromise<GetEventFinalizationData, GetEventFinalizationVariables>;

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

interface GetAllTournamentsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetAllTournamentsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetAllTournamentsData, undefined>;
  operationName: string;
}
export const getAllTournamentsRef: GetAllTournamentsRef;

export function getAllTournaments(): QueryPromise<GetAllTournamentsData, undefined>;
export function getAllTournaments(dc: DataConnect): QueryPromise<GetAllTournamentsData, undefined>;

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

interface GetPendingActiveRoundsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetPendingActiveRoundsVariables): QueryRef<GetPendingActiveRoundsData, GetPendingActiveRoundsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetPendingActiveRoundsVariables): QueryRef<GetPendingActiveRoundsData, GetPendingActiveRoundsVariables>;
  operationName: string;
}
export const getPendingActiveRoundsRef: GetPendingActiveRoundsRef;

export function getPendingActiveRounds(vars: GetPendingActiveRoundsVariables): QueryPromise<GetPendingActiveRoundsData, GetPendingActiveRoundsVariables>;
export function getPendingActiveRounds(dc: DataConnect, vars: GetPendingActiveRoundsVariables): QueryPromise<GetPendingActiveRoundsData, GetPendingActiveRoundsVariables>;

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

interface GetMatchesInRangeRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetMatchesInRangeVariables): QueryRef<GetMatchesInRangeData, GetMatchesInRangeVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetMatchesInRangeVariables): QueryRef<GetMatchesInRangeData, GetMatchesInRangeVariables>;
  operationName: string;
}
export const getMatchesInRangeRef: GetMatchesInRangeRef;

export function getMatchesInRange(vars: GetMatchesInRangeVariables): QueryPromise<GetMatchesInRangeData, GetMatchesInRangeVariables>;
export function getMatchesInRange(dc: DataConnect, vars: GetMatchesInRangeVariables): QueryPromise<GetMatchesInRangeData, GetMatchesInRangeVariables>;

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

interface GetAllTournamentMatchPicksRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetAllTournamentMatchPicksVariables): QueryRef<GetAllTournamentMatchPicksData, GetAllTournamentMatchPicksVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetAllTournamentMatchPicksVariables): QueryRef<GetAllTournamentMatchPicksData, GetAllTournamentMatchPicksVariables>;
  operationName: string;
}
export const getAllTournamentMatchPicksRef: GetAllTournamentMatchPicksRef;

export function getAllTournamentMatchPicks(vars: GetAllTournamentMatchPicksVariables): QueryPromise<GetAllTournamentMatchPicksData, GetAllTournamentMatchPicksVariables>;
export function getAllTournamentMatchPicks(dc: DataConnect, vars: GetAllTournamentMatchPicksVariables): QueryPromise<GetAllTournamentMatchPicksData, GetAllTournamentMatchPicksVariables>;

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

interface SearchParticipantsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SearchParticipantsVariables): QueryRef<SearchParticipantsData, SearchParticipantsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SearchParticipantsVariables): QueryRef<SearchParticipantsData, SearchParticipantsVariables>;
  operationName: string;
}
export const searchParticipantsRef: SearchParticipantsRef;

export function searchParticipants(vars: SearchParticipantsVariables): QueryPromise<SearchParticipantsData, SearchParticipantsVariables>;
export function searchParticipants(dc: DataConnect, vars: SearchParticipantsVariables): QueryPromise<SearchParticipantsData, SearchParticipantsVariables>;

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

interface GetRoundsInEventRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetRoundsInEventVariables): QueryRef<GetRoundsInEventData, GetRoundsInEventVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetRoundsInEventVariables): QueryRef<GetRoundsInEventData, GetRoundsInEventVariables>;
  operationName: string;
}
export const getRoundsInEventRef: GetRoundsInEventRef;

export function getRoundsInEvent(vars: GetRoundsInEventVariables): QueryPromise<GetRoundsInEventData, GetRoundsInEventVariables>;
export function getRoundsInEvent(dc: DataConnect, vars: GetRoundsInEventVariables): QueryPromise<GetRoundsInEventData, GetRoundsInEventVariables>;

interface GetTournamentParticipantsWithUsersRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetTournamentParticipantsWithUsersVariables): QueryRef<GetTournamentParticipantsWithUsersData, GetTournamentParticipantsWithUsersVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetTournamentParticipantsWithUsersVariables): QueryRef<GetTournamentParticipantsWithUsersData, GetTournamentParticipantsWithUsersVariables>;
  operationName: string;
}
export const getTournamentParticipantsWithUsersRef: GetTournamentParticipantsWithUsersRef;

export function getTournamentParticipantsWithUsers(vars: GetTournamentParticipantsWithUsersVariables): QueryPromise<GetTournamentParticipantsWithUsersData, GetTournamentParticipantsWithUsersVariables>;
export function getTournamentParticipantsWithUsers(dc: DataConnect, vars: GetTournamentParticipantsWithUsersVariables): QueryPromise<GetTournamentParticipantsWithUsersData, GetTournamentParticipantsWithUsersVariables>;

interface GetExistingEmailQueueRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetExistingEmailQueueVariables): QueryRef<GetExistingEmailQueueData, GetExistingEmailQueueVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetExistingEmailQueueVariables): QueryRef<GetExistingEmailQueueData, GetExistingEmailQueueVariables>;
  operationName: string;
}
export const getExistingEmailQueueRef: GetExistingEmailQueueRef;

export function getExistingEmailQueue(vars: GetExistingEmailQueueVariables): QueryPromise<GetExistingEmailQueueData, GetExistingEmailQueueVariables>;
export function getExistingEmailQueue(dc: DataConnect, vars: GetExistingEmailQueueVariables): QueryPromise<GetExistingEmailQueueData, GetExistingEmailQueueVariables>;

interface GetEntryMatchPicksRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetEntryMatchPicksVariables): QueryRef<GetEntryMatchPicksData, GetEntryMatchPicksVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetEntryMatchPicksVariables): QueryRef<GetEntryMatchPicksData, GetEntryMatchPicksVariables>;
  operationName: string;
}
export const getEntryMatchPicksRef: GetEntryMatchPicksRef;

export function getEntryMatchPicks(vars: GetEntryMatchPicksVariables): QueryPromise<GetEntryMatchPicksData, GetEntryMatchPicksVariables>;
export function getEntryMatchPicks(dc: DataConnect, vars: GetEntryMatchPicksVariables): QueryPromise<GetEntryMatchPicksData, GetEntryMatchPicksVariables>;

interface GetUserTournamentMatchesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserTournamentMatchesVariables): QueryRef<GetUserTournamentMatchesData, GetUserTournamentMatchesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserTournamentMatchesVariables): QueryRef<GetUserTournamentMatchesData, GetUserTournamentMatchesVariables>;
  operationName: string;
}
export const getUserTournamentMatchesRef: GetUserTournamentMatchesRef;

export function getUserTournamentMatches(vars: GetUserTournamentMatchesVariables): QueryPromise<GetUserTournamentMatchesData, GetUserTournamentMatchesVariables>;
export function getUserTournamentMatches(dc: DataConnect, vars: GetUserTournamentMatchesVariables): QueryPromise<GetUserTournamentMatchesData, GetUserTournamentMatchesVariables>;

interface GetUserVerdictMatchPicksRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserVerdictMatchPicksVariables): QueryRef<GetUserVerdictMatchPicksData, GetUserVerdictMatchPicksVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserVerdictMatchPicksVariables): QueryRef<GetUserVerdictMatchPicksData, GetUserVerdictMatchPicksVariables>;
  operationName: string;
}
export const getUserVerdictMatchPicksRef: GetUserVerdictMatchPicksRef;

export function getUserVerdictMatchPicks(vars: GetUserVerdictMatchPicksVariables): QueryPromise<GetUserVerdictMatchPicksData, GetUserVerdictMatchPicksVariables>;
export function getUserVerdictMatchPicks(dc: DataConnect, vars: GetUserVerdictMatchPicksVariables): QueryPromise<GetUserVerdictMatchPicksData, GetUserVerdictMatchPicksVariables>;

interface GetMatchParticipantsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetMatchParticipantsVariables): QueryRef<GetMatchParticipantsData, GetMatchParticipantsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetMatchParticipantsVariables): QueryRef<GetMatchParticipantsData, GetMatchParticipantsVariables>;
  operationName: string;
}
export const getMatchParticipantsRef: GetMatchParticipantsRef;

export function getMatchParticipants(vars: GetMatchParticipantsVariables): QueryPromise<GetMatchParticipantsData, GetMatchParticipantsVariables>;
export function getMatchParticipants(dc: DataConnect, vars: GetMatchParticipantsVariables): QueryPromise<GetMatchParticipantsData, GetMatchParticipantsVariables>;

interface GetPickScoresRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetPickScoresVariables): QueryRef<GetPickScoresData, GetPickScoresVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetPickScoresVariables): QueryRef<GetPickScoresData, GetPickScoresVariables>;
  operationName: string;
}
export const getPickScoresRef: GetPickScoresRef;

export function getPickScores(vars: GetPickScoresVariables): QueryPromise<GetPickScoresData, GetPickScoresVariables>;
export function getPickScores(dc: DataConnect, vars: GetPickScoresVariables): QueryPromise<GetPickScoresData, GetPickScoresVariables>;

interface GetRoundMatchesWithPriorityRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetRoundMatchesWithPriorityVariables): QueryRef<GetRoundMatchesWithPriorityData, GetRoundMatchesWithPriorityVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetRoundMatchesWithPriorityVariables): QueryRef<GetRoundMatchesWithPriorityData, GetRoundMatchesWithPriorityVariables>;
  operationName: string;
}
export const getRoundMatchesWithPriorityRef: GetRoundMatchesWithPriorityRef;

export function getRoundMatchesWithPriority(vars: GetRoundMatchesWithPriorityVariables): QueryPromise<GetRoundMatchesWithPriorityData, GetRoundMatchesWithPriorityVariables>;
export function getRoundMatchesWithPriority(dc: DataConnect, vars: GetRoundMatchesWithPriorityVariables): QueryPromise<GetRoundMatchesWithPriorityData, GetRoundMatchesWithPriorityVariables>;

interface GetOpponentMatchHistoriesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetOpponentMatchHistoriesVariables): QueryRef<GetOpponentMatchHistoriesData, GetOpponentMatchHistoriesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetOpponentMatchHistoriesVariables): QueryRef<GetOpponentMatchHistoriesData, GetOpponentMatchHistoriesVariables>;
  operationName: string;
}
export const getOpponentMatchHistoriesRef: GetOpponentMatchHistoriesRef;

export function getOpponentMatchHistories(vars: GetOpponentMatchHistoriesVariables): QueryPromise<GetOpponentMatchHistoriesData, GetOpponentMatchHistoriesVariables>;
export function getOpponentMatchHistories(dc: DataConnect, vars: GetOpponentMatchHistoriesVariables): QueryPromise<GetOpponentMatchHistoriesData, GetOpponentMatchHistoriesVariables>;

interface GetHighestSeedRemainingRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetHighestSeedRemainingVariables): QueryRef<GetHighestSeedRemainingData, GetHighestSeedRemainingVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetHighestSeedRemainingVariables): QueryRef<GetHighestSeedRemainingData, GetHighestSeedRemainingVariables>;
  operationName: string;
}
export const getHighestSeedRemainingRef: GetHighestSeedRemainingRef;

export function getHighestSeedRemaining(vars: GetHighestSeedRemainingVariables): QueryPromise<GetHighestSeedRemainingData, GetHighestSeedRemainingVariables>;
export function getHighestSeedRemaining(dc: DataConnect, vars: GetHighestSeedRemainingVariables): QueryPromise<GetHighestSeedRemainingData, GetHighestSeedRemainingVariables>;

interface GetTournamentImportStatusRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetTournamentImportStatusVariables): QueryRef<GetTournamentImportStatusData, GetTournamentImportStatusVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetTournamentImportStatusVariables): QueryRef<GetTournamentImportStatusData, GetTournamentImportStatusVariables>;
  operationName: string;
}
export const getTournamentImportStatusRef: GetTournamentImportStatusRef;

export function getTournamentImportStatus(vars: GetTournamentImportStatusVariables): QueryPromise<GetTournamentImportStatusData, GetTournamentImportStatusVariables>;
export function getTournamentImportStatus(dc: DataConnect, vars: GetTournamentImportStatusVariables): QueryPromise<GetTournamentImportStatusData, GetTournamentImportStatusVariables>;

interface GetParticipantLeaguesForTournamentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetParticipantLeaguesForTournamentVariables): QueryRef<GetParticipantLeaguesForTournamentData, GetParticipantLeaguesForTournamentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetParticipantLeaguesForTournamentVariables): QueryRef<GetParticipantLeaguesForTournamentData, GetParticipantLeaguesForTournamentVariables>;
  operationName: string;
}
export const getParticipantLeaguesForTournamentRef: GetParticipantLeaguesForTournamentRef;

export function getParticipantLeaguesForTournament(vars: GetParticipantLeaguesForTournamentVariables): QueryPromise<GetParticipantLeaguesForTournamentData, GetParticipantLeaguesForTournamentVariables>;
export function getParticipantLeaguesForTournament(dc: DataConnect, vars: GetParticipantLeaguesForTournamentVariables): QueryPromise<GetParticipantLeaguesForTournamentData, GetParticipantLeaguesForTournamentVariables>;

interface GetLeagueEntriesForEntriesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetLeagueEntriesForEntriesVariables): QueryRef<GetLeagueEntriesForEntriesData, GetLeagueEntriesForEntriesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetLeagueEntriesForEntriesVariables): QueryRef<GetLeagueEntriesForEntriesData, GetLeagueEntriesForEntriesVariables>;
  operationName: string;
}
export const getLeagueEntriesForEntriesRef: GetLeagueEntriesForEntriesRef;

export function getLeagueEntriesForEntries(vars: GetLeagueEntriesForEntriesVariables): QueryPromise<GetLeagueEntriesForEntriesData, GetLeagueEntriesForEntriesVariables>;
export function getLeagueEntriesForEntries(dc: DataConnect, vars: GetLeagueEntriesForEntriesVariables): QueryPromise<GetLeagueEntriesForEntriesData, GetLeagueEntriesForEntriesVariables>;

interface GetFriendsInTournamentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetFriendsInTournamentVariables): QueryRef<GetFriendsInTournamentData, GetFriendsInTournamentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetFriendsInTournamentVariables): QueryRef<GetFriendsInTournamentData, GetFriendsInTournamentVariables>;
  operationName: string;
}
export const getFriendsInTournamentRef: GetFriendsInTournamentRef;

export function getFriendsInTournament(vars: GetFriendsInTournamentVariables): QueryPromise<GetFriendsInTournamentData, GetFriendsInTournamentVariables>;
export function getFriendsInTournament(dc: DataConnect, vars: GetFriendsInTournamentVariables): QueryPromise<GetFriendsInTournamentData, GetFriendsInTournamentVariables>;

