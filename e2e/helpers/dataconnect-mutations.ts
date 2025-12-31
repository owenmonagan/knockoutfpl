/**
 * DataConnect GraphQL Mutations for E2E Test Seeding
 *
 * This module provides mutations for seeding test data into DataConnect.
 * Based on functions/src/dataconnect-mutations.ts but adapted for E2E testing.
 */

import { getDataConnectInstance } from './dataconnect-admin';

// =============================================================================
// GRAPHQL MUTATIONS
// =============================================================================

const UPSERT_USER_MUTATION = `
  mutation UpsertUser($uid: String!, $email: String!) {
    user_upsert(
      data: {
        uid: $uid
        email: $email
      }
    )
  }
`;

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
    $status: String!
    $currentRound: Int!
    $winnerEntryId: Int
  ) {
    tournament_upsert(
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
        status: $status
        currentRound: $currentRound
        winnerEntryId: $winnerEntryId
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
    round_upsert(
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
    $status: String!
    $eliminationRound: Int
  ) {
    participant_upsert(
      data: {
        tournamentId: $tournamentId
        entryId: $entryId
        teamName: $teamName
        managerName: $managerName
        seed: $seed
        leagueRank: $leagueRank
        leaguePoints: $leaguePoints
        rawJson: $rawJson
        status: $status
        eliminationRound: $eliminationRound
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
    matchPick_upsert(
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

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface UpsertUserInput {
  uid: string;
  email: string;
}

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

export interface CreateTournamentInput {
  id: string;
  fplLeagueId: number;
  fplLeagueName: string;
  creatorUid: string;
  participantCount: number;
  totalRounds: number;
  startEvent: number;
  seedingMethod: string;
  isTest: boolean;
  status: string;
  currentRound: number;
  winnerEntryId?: number | null;
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
  status: string;
  eliminationRound?: number | null;
}

export interface CreateMatchInput {
  tournamentId: string;
  matchId: number;
  roundNumber: number;
  positionInRound: number;
  qualifiesToMatchId?: number | null;
  isBye: boolean;
  status: string;
  winnerEntryId?: number | null;
}

export interface CreateMatchPickInput {
  tournamentId: string;
  matchId: number;
  entryId: number;
  slot: number;
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

// =============================================================================
// MUTATION FUNCTIONS
// =============================================================================

/**
 * Upsert a user in DataConnect
 */
export async function upsertUser(input: UpsertUserInput): Promise<void> {
  const dc = getDataConnectInstance();
  await dc.executeGraphql(UPSERT_USER_MUTATION, { variables: input });
}

/**
 * Upsert an FPL entry in DataConnect
 */
export async function upsertEntry(input: UpsertEntryInput): Promise<void> {
  const dc = getDataConnectInstance();
  await dc.executeGraphql(UPSERT_ENTRY_MUTATION, { variables: input });
}

/**
 * Create a tournament in DataConnect
 */
export async function createTournament(
  input: CreateTournamentInput
): Promise<void> {
  const dc = getDataConnectInstance();
  await dc.executeGraphql(CREATE_TOURNAMENT_MUTATION, { variables: input });
}

/**
 * Create a tournament round in DataConnect
 */
export async function createRound(input: CreateRoundInput): Promise<void> {
  const dc = getDataConnectInstance();
  await dc.executeGraphql(CREATE_ROUND_MUTATION, { variables: input });
}

/**
 * Create a tournament participant in DataConnect
 */
export async function createParticipant(
  input: CreateParticipantInput
): Promise<void> {
  const dc = getDataConnectInstance();
  await dc.executeGraphql(CREATE_PARTICIPANT_MUTATION, { variables: input });
}

/**
 * Create a match in DataConnect
 */
export async function createMatch(input: CreateMatchInput): Promise<void> {
  const dc = getDataConnectInstance();
  await dc.executeGraphql(CREATE_MATCH_MUTATION, { variables: input });
}

/**
 * Create a match pick (links participant to match) in DataConnect
 */
export async function createMatchPick(
  input: CreateMatchPickInput
): Promise<void> {
  const dc = getDataConnectInstance();
  await dc.executeGraphql(CREATE_MATCH_PICK_MUTATION, { variables: input });
}

/**
 * Upsert a gameweek pick in DataConnect
 */
export async function upsertPick(input: UpsertPickInput): Promise<void> {
  const dc = getDataConnectInstance();
  await dc.executeGraphql(UPSERT_PICK_MUTATION, { variables: input });
}
