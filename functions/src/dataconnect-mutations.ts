// functions/src/dataconnect-mutations.ts
// Admin SDK mutations - execute as admin (no impersonation for internal mutations)

import { dataConnectAdmin } from './dataconnect-admin';

// AuthClaims type for backwards compatibility (not used for internal mutations)
export type AuthClaims = { [key: string]: unknown };

// GraphQL mutations matching dataconnect/connector/mutations.gql
const UPSERT_ENTRY_MUTATION = `
  mutation UpsertEntry(
    $entryId: Int!
    $season: String!
    $name: String!
    $playerFirstName: String
    $playerLastName: String
    $summaryOverallPoints: Int
    $summaryOverallRank: Int
    $rawJson: String!
  ) {
    entry_upsert(
      data: {
        entryId: $entryId
        season: $season
        name: $name
        playerFirstName: $playerFirstName
        playerLastName: $playerLastName
        summaryOverallPoints: $summaryOverallPoints
        summaryOverallRank: $summaryOverallRank
        rawJson: $rawJson
      }
    )
  }
`;

const UPSERT_PICK_MUTATION = `
  mutation UpsertPick(
    $entryId: Int!
    $event: Int!
    $points: Int!
    $totalPoints: Int
    $rank: Int
    $overallRank: Int
    $eventTransfersCost: Int
    $activeChip: String
    $rawJson: String!
    $isFinal: Boolean!
  ) {
    pick_upsert(
      data: {
        entryId: $entryId
        event: $event
        points: $points
        totalPoints: $totalPoints
        rank: $rank
        overallRank: $overallRank
        eventTransfersCost: $eventTransfersCost
        activeChip: $activeChip
        rawJson: $rawJson
        isFinal: $isFinal
        entryEntryId: $entryId
      }
    )
  }
`;

const CREATE_TOURNAMENT_MUTATION = `
  mutation CreateTournament(
    $id: UUID!
    $fplLeagueId: Int!
    $fplLeagueName: String!
    $creatorUid: String!
    $participantCount: Int!
    $totalRounds: Int!
    $startEvent: Int!
    $seedingMethod: String!
    $isTest: Boolean!
  ) {
    tournament_insert(
      data: {
        id: $id
        fplLeagueId: $fplLeagueId
        fplLeagueName: $fplLeagueName
        creatorUid: $creatorUid
        participantCount: $participantCount
        totalRounds: $totalRounds
        startEvent: $startEvent
        seedingMethod: $seedingMethod
        isTest: $isTest
      }
    )
  }
`;

const CREATE_ROUND_MUTATION = `
  mutation CreateRound(
    $tournamentId: UUID!
    $roundNumber: Int!
    $event: Int!
    $status: String!
  ) {
    round_insert(
      data: {
        tournamentId: $tournamentId
        roundNumber: $roundNumber
        event: $event
        status: $status
      }
    )
  }
`;

const CREATE_PARTICIPANT_MUTATION = `
  mutation CreateParticipant(
    $tournamentId: UUID!
    $entryId: Int!
    $teamName: String!
    $managerName: String!
    $seed: Int!
    $leagueRank: Int
    $leaguePoints: Int
    $rawJson: String!
  ) {
    participant_insert(
      data: {
        tournamentId: $tournamentId
        entryId: $entryId
        teamName: $teamName
        managerName: $managerName
        seed: $seed
        leagueRank: $leagueRank
        leaguePoints: $leaguePoints
        rawJson: $rawJson
        entryEntryId: $entryId
      }
    )
  }
`;

const CREATE_MATCH_MUTATION = `
  mutation CreateMatch(
    $tournamentId: UUID!
    $matchId: Int!
    $roundNumber: Int!
    $positionInRound: Int!
    $qualifiesToMatchId: Int
    $isBye: Boolean!
  ) {
    match_insert(
      data: {
        tournamentId: $tournamentId
        matchId: $matchId
        roundNumber: $roundNumber
        positionInRound: $positionInRound
        qualifiesToMatchId: $qualifiesToMatchId
        isBye: $isBye
      }
    )
  }
`;

const UPDATE_MATCH_MUTATION = `
  mutation UpdateMatch(
    $tournamentId: UUID!
    $matchId: Int!
    $roundNumber: Int!
    $positionInRound: Int!
    $qualifiesToMatchId: Int
    $isBye: Boolean!
    $status: String!
    $winnerEntryId: Int
  ) {
    match_upsert(
      data: {
        tournamentId: $tournamentId
        matchId: $matchId
        roundNumber: $roundNumber
        positionInRound: $positionInRound
        qualifiesToMatchId: $qualifiesToMatchId
        isBye: $isBye
        status: $status
        winnerEntryId: $winnerEntryId
      }
    )
  }
`;

const CREATE_MATCH_PICK_MUTATION = `
  mutation CreateMatchPick(
    $tournamentId: UUID!
    $matchId: Int!
    $entryId: Int!
    $slot: Int!
  ) {
    matchPick_insert(
      data: {
        tournamentId: $tournamentId
        matchId: $matchId
        entryId: $entryId
        slot: $slot
        entryEntryId: $entryId
      }
    )
  }
`;

// GraphQL queries for bracket updates
const GET_ACTIVE_ROUNDS_QUERY = `
  query GetActiveRounds($event: Int!) {
    rounds(where: { event: { eq: $event }, status: { eq: "active" } }) {
      tournamentId
      roundNumber
      event
      status
      tournament {
        id
        status
        totalRounds
      }
    }
  }
`;

const GET_PENDING_ACTIVE_ROUNDS_QUERY = `
  query GetPendingActiveRounds($maxEvent: Int!) {
    rounds(where: { event: { le: $maxEvent }, status: { eq: "active" } }, orderBy: { event: ASC }) {
      tournamentId
      roundNumber
      event
      status
      tournament {
        id
        status
        totalRounds
      }
    }
  }
`;

const GET_STUCK_TEST_TOURNAMENTS_QUERY = `
  query GetStuckTestTournaments($cutoffTime: Timestamp!) {
    tournaments(where: { isTest: { eq: true }, status: { ne: "completed" }, createdAt: { lt: $cutoffTime } }) {
      id
      fplLeagueName
      status
      createdAt
      participantCount
      totalRounds
      currentRound
    }
  }
`;

const GET_ROUND_MATCHES_QUERY = `
  query GetRoundMatches($tournamentId: UUID!, $roundNumber: Int!) {
    matches(
      where: {
        tournamentId: { eq: $tournamentId }
        roundNumber: { eq: $roundNumber }
        status: { eq: "active" }
      }
    ) {
      tournamentId
      matchId
      roundNumber
      positionInRound
      qualifiesToMatchId
      isBye
      status
      matchPicks {
        entryId
        slot
        participant {
          seed
        }
      }
    }
  }
`;

const GET_CURRENT_EVENT_QUERY = `
  query GetCurrentEvent($season: String!) {
    events(where: { season: { eq: $season }, isCurrent: { eq: true } }) {
      event
      season
      finished
      isCurrent
    }
  }
`;

// Update mutations for bracket progression
const UPDATE_MATCH_WINNER_MUTATION = `
  mutation UpdateMatchWinner(
    $tournamentId: UUID!
    $matchId: Int!
    $winnerEntryId: Int!
    $status: String!
  ) {
    match_update(
      key: { tournamentId: $tournamentId, matchId: $matchId }
      data: {
        winnerEntryId: $winnerEntryId
        status: $status
      }
    )
  }
`;

const UPDATE_ROUND_STATUS_MUTATION = `
  mutation UpdateRoundStatus(
    $tournamentId: UUID!
    $roundNumber: Int!
    $status: String!
  ) {
    round_update(
      key: { tournamentId: $tournamentId, roundNumber: $roundNumber }
      data: {
        status: $status
      }
    )
  }
`;

const UPDATE_TOURNAMENT_STATUS_MUTATION = `
  mutation UpdateTournamentStatus(
    $id: UUID!
    $status: String!
    $winnerEntryId: Int
  ) {
    tournament_update(
      id: $id
      data: {
        status: $status
        winnerEntryId: $winnerEntryId
      }
    )
  }
`;

const UPDATE_PARTICIPANT_STATUS_MUTATION = `
  mutation UpdateParticipantStatus(
    $tournamentId: UUID!
    $entryId: Int!
    $status: String!
    $eliminationRound: Int
  ) {
    participant_update(
      key: { tournamentId: $tournamentId, entryId: $entryId }
      data: {
        status: $status
        eliminationRound: $eliminationRound
      }
    )
  }
`;

// Type definitions for mutation inputs
export interface UpsertEntryInput {
  entryId: number;
  season: string;
  name: string;
  playerFirstName?: string;
  playerLastName?: string;
  summaryOverallPoints?: number;
  summaryOverallRank?: number;
  rawJson: string;
}

export interface UpsertPickInput {
  entryId: number;
  event: number;
  points: number;
  totalPoints?: number;
  rank?: number;
  overallRank?: number;
  eventTransfersCost?: number;
  activeChip?: string;
  rawJson: string;
  isFinal: boolean;
}

export interface CreateTournamentInput {
  id: string;
  fplLeagueId: number;
  fplLeagueName: string;
  creatorUid: string;
  participantCount: number;
  totalRounds: number;
  startEvent: number;
  seedingMethod: string;
  isTest?: boolean;
}

export interface CreateRoundInput {
  tournamentId: string;
  roundNumber: number;
  event: number;
  status: string;
}

export interface CreateParticipantInput {
  tournamentId: string;
  entryId: number;
  teamName: string;
  managerName: string;
  seed: number;
  leagueRank?: number;
  leaguePoints?: number;
  rawJson: string;
}

export interface CreateMatchInput {
  tournamentId: string;
  matchId: number;
  roundNumber: number;
  positionInRound: number;
  qualifiesToMatchId?: number | null;
  isBye: boolean;
}

export interface UpdateMatchInput extends CreateMatchInput {
  status: string;
  winnerEntryId?: number | null;
}

export interface CreateMatchPickInput {
  tournamentId: string;
  matchId: number;
  entryId: number;
  slot: number;
}

// Type definitions for query results
export interface ActiveRound {
  tournamentId: string;
  roundNumber: number;
  event: number;
  status: string;
  tournament: {
    id: string;
    status: string;
    totalRounds: number;
  };
}

export interface RoundMatch {
  tournamentId: string;
  matchId: number;
  roundNumber: number;
  positionInRound: number;
  qualifiesToMatchId: number | null;
  isBye: boolean;
  status: string;
  matchPicks: Array<{
    entryId: number;
    slot: number;
    participant: {
      seed: number;
    };
  }>;
}

export interface CurrentEvent {
  event: number;
  season: string;
  finished: boolean;
  isCurrent: boolean;
}

export interface StuckTournament {
  id: string;
  fplLeagueName: string;
  status: string;
  createdAt: string;
  participantCount: number;
  totalRounds: number;
  currentRound: number;
}

// Mutation functions - execute as admin (internal mutations use NO_ACCESS auth)
// authClaims parameter kept for API compatibility but not used
export async function upsertEntryAdmin(
  input: UpsertEntryInput,
  _authClaims: AuthClaims
): Promise<void> {
  await dataConnectAdmin.executeGraphql(
    UPSERT_ENTRY_MUTATION,
    { variables: input }
  );
}

export async function upsertPickAdmin(
  input: UpsertPickInput,
  _authClaims: AuthClaims
): Promise<void> {
  await dataConnectAdmin.executeGraphql(
    UPSERT_PICK_MUTATION,
    { variables: input }
  );
}

export async function createTournamentAdmin(
  input: CreateTournamentInput,
  _authClaims: AuthClaims
): Promise<void> {
  await dataConnectAdmin.executeGraphql(
    CREATE_TOURNAMENT_MUTATION,
    { variables: { ...input, isTest: input.isTest ?? false } }
  );
}

export async function createRoundAdmin(
  input: CreateRoundInput,
  _authClaims: AuthClaims
): Promise<void> {
  await dataConnectAdmin.executeGraphql(
    CREATE_ROUND_MUTATION,
    { variables: input }
  );
}

export async function createParticipantAdmin(
  input: CreateParticipantInput,
  _authClaims: AuthClaims
): Promise<void> {
  await dataConnectAdmin.executeGraphql(
    CREATE_PARTICIPANT_MUTATION,
    { variables: input }
  );
}

export async function createMatchAdmin(
  input: CreateMatchInput,
  _authClaims: AuthClaims
): Promise<void> {
  await dataConnectAdmin.executeGraphql(
    CREATE_MATCH_MUTATION,
    { variables: input }
  );
}

export async function updateMatchAdmin(
  input: UpdateMatchInput,
  _authClaims: AuthClaims
): Promise<void> {
  await dataConnectAdmin.executeGraphql(
    UPDATE_MATCH_MUTATION,
    { variables: input }
  );
}

export async function createMatchPickAdmin(
  input: CreateMatchPickInput,
  _authClaims: AuthClaims
): Promise<void> {
  await dataConnectAdmin.executeGraphql(
    CREATE_MATCH_PICK_MUTATION,
    { variables: input }
  );
}

// Query functions for bracket updates
export async function getActiveRoundsForEvent(event: number): Promise<ActiveRound[]> {
  const result = await dataConnectAdmin.executeGraphql<{ rounds: ActiveRound[] }, { event: number }>(
    GET_ACTIVE_ROUNDS_QUERY,
    { variables: { event } }
  );
  return result.data.rounds;
}

/**
 * Get all active rounds for any finished gameweek (catch-up mode)
 * Returns rounds ordered by event ascending (oldest first)
 */
export async function getPendingActiveRounds(maxEvent: number): Promise<ActiveRound[]> {
  const result = await dataConnectAdmin.executeGraphql<{ rounds: ActiveRound[] }, { maxEvent: number }>(
    GET_PENDING_ACTIVE_ROUNDS_QUERY,
    { variables: { maxEvent } }
  );
  return result.data.rounds;
}

/**
 * Get test tournaments that haven't completed within the timeout period
 */
export async function getStuckTestTournaments(cutoffTime: Date): Promise<StuckTournament[]> {
  const result = await dataConnectAdmin.executeGraphql<{ tournaments: StuckTournament[] }, { cutoffTime: string }>(
    GET_STUCK_TEST_TOURNAMENTS_QUERY,
    { variables: { cutoffTime: cutoffTime.toISOString() } }
  );
  return result.data.tournaments;
}

export async function getRoundMatches(tournamentId: string, roundNumber: number): Promise<RoundMatch[]> {
  const result = await dataConnectAdmin.executeGraphql<{ matches: RoundMatch[] }, { tournamentId: string; roundNumber: number }>(
    GET_ROUND_MATCHES_QUERY,
    { variables: { tournamentId, roundNumber } }
  );
  return result.data.matches;
}

export async function getCurrentEvent(season: string): Promise<CurrentEvent | null> {
  const result = await dataConnectAdmin.executeGraphql<{ events: CurrentEvent[] }, { season: string }>(
    GET_CURRENT_EVENT_QUERY,
    { variables: { season } }
  );
  return result.data.events[0] || null;
}

// Update mutation functions for bracket progression
export async function updateMatchWinner(
  tournamentId: string,
  matchId: number,
  winnerEntryId: number
): Promise<void> {
  await dataConnectAdmin.executeGraphql(
    UPDATE_MATCH_WINNER_MUTATION,
    { variables: { tournamentId, matchId, winnerEntryId, status: 'complete' } }
  );
}

export async function updateRoundStatus(
  tournamentId: string,
  roundNumber: number,
  status: string
): Promise<void> {
  await dataConnectAdmin.executeGraphql(
    UPDATE_ROUND_STATUS_MUTATION,
    { variables: { tournamentId, roundNumber, status } }
  );
}

export async function updateTournamentStatus(
  tournamentId: string,
  status: string,
  winnerEntryId?: number
): Promise<void> {
  await dataConnectAdmin.executeGraphql(
    UPDATE_TOURNAMENT_STATUS_MUTATION,
    { variables: { id: tournamentId, status, winnerEntryId } }
  );
}

export async function updateParticipantStatus(
  tournamentId: string,
  entryId: number,
  status: string,
  eliminationRound?: number
): Promise<void> {
  await dataConnectAdmin.executeGraphql(
    UPDATE_PARTICIPANT_STATUS_MUTATION,
    { variables: { tournamentId, entryId, status, eliminationRound } }
  );
}
