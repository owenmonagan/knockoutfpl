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
    { variables: input }
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
