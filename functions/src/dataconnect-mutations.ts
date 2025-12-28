// functions/src/dataconnect-mutations.ts
// Admin SDK mutations - execute as admin (no impersonation for internal mutations)

import { dataConnectAdmin } from './dataconnect-admin';

// AuthClaims type for backwards compatibility (not used for internal mutations)
export type AuthClaims = { [key: string]: unknown };

// GraphQL mutations matching dataconnect/connector/mutations.gql
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
      }
    )
  }
`;

// Type definitions for mutation inputs
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

// Mutation functions - execute as admin (internal mutations use NO_ACCESS auth)
// authClaims parameter kept for API compatibility but not used
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
