// functions/src/dataconnect-mutations.ts
// Admin SDK mutations - execute as admin (no impersonation for internal mutations)

import { dataConnectAdmin } from './dataconnect-admin';

// AuthClaims type for backwards compatibility (not used for internal mutations)
export type AuthClaims = { [key: string]: unknown };

// GraphQL mutations matching dataconnect/connector/mutations.gql
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

const UPSERT_EVENT_MUTATION = `
  mutation UpsertEvent(
    $event: Int!
    $season: String!
    $name: String!
    $deadlineTime: Timestamp!
    $finished: Boolean!
    $isCurrent: Boolean!
    $isNext: Boolean!
    $rawJson: String!
  ) {
    event_upsert(
      data: {
        event: $event
        season: $season
        name: $name
        deadlineTime: $deadlineTime
        finished: $finished
        isCurrent: $isCurrent
        isNext: $isNext
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
    $status: String!
  ) {
    match_insert(
      data: {
        tournamentId: $tournamentId
        matchId: $matchId
        roundNumber: $roundNumber
        positionInRound: $positionInRound
        qualifiesToMatchId: $qualifiesToMatchId
        isBye: $isBye
        status: $status
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
        fplLeagueId
        fplLeagueName
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
        fplLeagueId
        fplLeagueName
      }
    }
  }
`;

const GET_STUCK_TEST_TOURNAMENTS_QUERY = `
  query GetStuckTestTournaments($cutoffTime: Timestamp!) {
    tournaments(where: { isTest: { eq: true }, status: { ne: "completed" }, createdAt: { lt: $cutoffTime } }) {
      id
      fplLeagueId
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
        status: { ne: "complete" }
        isBye: { eq: false }
      }
    ) {
      tournamentId
      matchId
      roundNumber
      positionInRound
      qualifiesToMatchId
      isBye
      status
    }
  }
`;

const GET_ROUND_MATCH_PICKS_QUERY = `
  query GetRoundMatchPicks($tournamentId: UUID!, $matchIds: [Int!]!) {
    matchPicks(
      where: {
        tournamentId: { eq: $tournamentId }
        matchId: { in: $matchIds }
      }
    ) {
      matchId
      entryId
      slot
      participant {
        seed
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

const UPDATE_TOURNAMENT_CURRENT_ROUND_MUTATION = `
  mutation UpdateTournamentCurrentRound(
    $id: UUID!
    $currentRound: Int!
  ) {
    tournament_update(
      id: $id
      data: {
        currentRound: $currentRound
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

export interface UpsertEventInput {
  event: number;
  season: string;
  name: string;
  deadlineTime: string; // ISO 8601 string
  finished: boolean;
  isCurrent: boolean;
  isNext: boolean;
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
  status: string;
}

export interface UpdateMatchInput extends CreateMatchInput {
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
    fplLeagueId: number;
    fplLeagueName: string;
  };
}

// Raw match data from query (without matchPicks)
interface RawMatch {
  tournamentId: string;
  matchId: number;
  roundNumber: number;
  positionInRound: number;
  qualifiesToMatchId: number | null;
  isBye: boolean;
  status: string;
}

// Match pick from separate query
interface RawMatchPick {
  matchId: number;
  entryId: number;
  slot: number;
  participant: {
    seed: number;
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
  fplLeagueId: number;
  fplLeagueName: string;
  status: string;
  createdAt: string;
  participantCount: number;
  totalRounds: number;
  currentRound: number;
}

// Mutation functions - execute as admin (internal mutations use NO_ACCESS auth)
// authClaims parameter kept for API compatibility but not used

export async function upsertUserAdmin(uid: string, email: string): Promise<void> {
  await dataConnectAdmin.executeGraphql(
    UPSERT_USER_MUTATION,
    { variables: { uid, email } }
  );
}

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

export async function upsertEventAdmin(
  input: UpsertEventInput
): Promise<void> {
  await dataConnectAdmin.executeGraphql(
    UPSERT_EVENT_MUTATION,
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
  // Query matches without matchPicks
  const matchesResult = await dataConnectAdmin.executeGraphql<{ matches: RawMatch[] }, { tournamentId: string; roundNumber: number }>(
    GET_ROUND_MATCHES_QUERY,
    { variables: { tournamentId, roundNumber } }
  );

  const matches = matchesResult.data.matches;
  if (matches.length === 0) {
    return [];
  }

  // Query match picks separately
  const matchIds = matches.map(m => m.matchId);
  const picksResult = await dataConnectAdmin.executeGraphql<{ matchPicks: RawMatchPick[] }, { tournamentId: string; matchIds: number[] }>(
    GET_ROUND_MATCH_PICKS_QUERY,
    { variables: { tournamentId, matchIds } }
  );

  // Group picks by matchId
  const picksByMatch = new Map<number, RawMatchPick[]>();
  for (const pick of picksResult.data.matchPicks) {
    const existing = picksByMatch.get(pick.matchId) || [];
    existing.push(pick);
    picksByMatch.set(pick.matchId, existing);
  }

  // Merge matches with their picks
  return matches.map(match => ({
    ...match,
    matchPicks: picksByMatch.get(match.matchId) || [],
  }));
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

export async function updateTournamentCurrentRound(
  tournamentId: string,
  currentRound: number
): Promise<void> {
  await dataConnectAdmin.executeGraphql(
    UPDATE_TOURNAMENT_CURRENT_ROUND_MUTATION,
    { variables: { id: tournamentId, currentRound } }
  );
}

// =============================================================================
// BATCH MUTATION FUNCTIONS
// =============================================================================
// These functions batch multiple mutations into a single GraphQL request
// using aliases to reduce connection overhead

const BATCH_SIZE = 20; // Max mutations per batch to avoid query size limits

/**
 * Batch upsert entries - reduces N calls to ceil(N/BATCH_SIZE) calls
 */
export async function upsertEntriesBatch(
  entries: UpsertEntryInput[],
  _authClaims: AuthClaims
): Promise<void> {
  if (entries.length === 0) return;

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);

    // Build mutation with aliases
    const mutations = batch.map((entry, idx) => `
      e${idx}: entry_upsert(data: {
        entryId: ${entry.entryId}
        season: "${entry.season}"
        name: ${JSON.stringify(entry.name)}
        playerFirstName: ${entry.playerFirstName ? JSON.stringify(entry.playerFirstName) : 'null'}
        playerLastName: ${entry.playerLastName ? JSON.stringify(entry.playerLastName) : 'null'}
        summaryOverallPoints: ${entry.summaryOverallPoints ?? 'null'}
        summaryOverallRank: ${entry.summaryOverallRank ?? 'null'}
        rawJson: ${JSON.stringify(entry.rawJson)}
      })
    `).join('\n');

    const batchMutation = `mutation BatchUpsertEntries { ${mutations} }`;
    await dataConnectAdmin.executeGraphql(batchMutation, {});
  }
}

/**
 * Batch upsert picks - reduces N calls to ceil(N/BATCH_SIZE) calls
 */
export async function upsertPicksBatch(
  picks: UpsertPickInput[],
  _authClaims: AuthClaims
): Promise<void> {
  if (picks.length === 0) return;

  for (let i = 0; i < picks.length; i += BATCH_SIZE) {
    const batch = picks.slice(i, i + BATCH_SIZE);

    const mutations = batch.map((pick, idx) => `
      p${idx}: pick_upsert(data: {
        entryId: ${pick.entryId}
        event: ${pick.event}
        points: ${pick.points}
        totalPoints: ${pick.totalPoints ?? 'null'}
        rank: ${pick.rank ?? 'null'}
        overallRank: ${pick.overallRank ?? 'null'}
        eventTransfersCost: ${pick.eventTransfersCost ?? 'null'}
        activeChip: ${pick.activeChip ? JSON.stringify(pick.activeChip) : 'null'}
        rawJson: ${JSON.stringify(pick.rawJson)}
        isFinal: ${pick.isFinal}
        entryEntryId: ${pick.entryId}
      })
    `).join('\n');

    const batchMutation = `mutation BatchUpsertPicks { ${mutations} }`;
    await dataConnectAdmin.executeGraphql(batchMutation, {});
  }
}

/**
 * Batch create rounds - reduces N calls to ceil(N/BATCH_SIZE) calls
 */
export async function createRoundsBatch(
  rounds: CreateRoundInput[],
  _authClaims: AuthClaims
): Promise<void> {
  if (rounds.length === 0) return;

  for (let i = 0; i < rounds.length; i += BATCH_SIZE) {
    const batch = rounds.slice(i, i + BATCH_SIZE);

    const mutations = batch.map((round, idx) => `
      r${idx}: round_insert(data: {
        tournamentId: "${round.tournamentId}"
        roundNumber: ${round.roundNumber}
        event: ${round.event}
        status: "${round.status}"
      })
    `).join('\n');

    const batchMutation = `mutation BatchCreateRounds { ${mutations} }`;
    await dataConnectAdmin.executeGraphql(batchMutation, {});
  }
}

/**
 * Batch create participants - reduces N calls to ceil(N/BATCH_SIZE) calls
 */
export async function createParticipantsBatch(
  participants: CreateParticipantInput[],
  _authClaims: AuthClaims
): Promise<void> {
  if (participants.length === 0) return;

  for (let i = 0; i < participants.length; i += BATCH_SIZE) {
    const batch = participants.slice(i, i + BATCH_SIZE);

    const mutations = batch.map((p, idx) => `
      p${idx}: participant_insert(data: {
        tournamentId: "${p.tournamentId}"
        entryId: ${p.entryId}
        teamName: ${JSON.stringify(p.teamName)}
        managerName: ${JSON.stringify(p.managerName)}
        seed: ${p.seed}
        leagueRank: ${p.leagueRank ?? 'null'}
        leaguePoints: ${p.leaguePoints ?? 'null'}
        rawJson: ${JSON.stringify(p.rawJson)}
        entryEntryId: ${p.entryId}
      })
    `).join('\n');

    const batchMutation = `mutation BatchCreateParticipants { ${mutations} }`;
    await dataConnectAdmin.executeGraphql(batchMutation, {});
  }
}

/**
 * Batch create matches - reduces N calls to ceil(N/BATCH_SIZE) calls
 */
export async function createMatchesBatch(
  matches: CreateMatchInput[],
  _authClaims: AuthClaims
): Promise<void> {
  if (matches.length === 0) return;

  for (let i = 0; i < matches.length; i += BATCH_SIZE) {
    const batch = matches.slice(i, i + BATCH_SIZE);

    const mutations = batch.map((m, idx) => `
      m${idx}: match_insert(data: {
        tournamentId: "${m.tournamentId}"
        matchId: ${m.matchId}
        roundNumber: ${m.roundNumber}
        positionInRound: ${m.positionInRound}
        qualifiesToMatchId: ${m.qualifiesToMatchId ?? 'null'}
        isBye: ${m.isBye}
        status: "${m.status ?? 'pending'}"
      })
    `).join('\n');

    const batchMutation = `mutation BatchCreateMatches { ${mutations} }`;
    await dataConnectAdmin.executeGraphql(batchMutation, {});
  }
}

/**
 * Batch update matches (for bye winners) - reduces N calls to ceil(N/BATCH_SIZE) calls
 */
export async function updateMatchesBatch(
  matches: UpdateMatchInput[],
  _authClaims: AuthClaims
): Promise<void> {
  if (matches.length === 0) return;

  for (let i = 0; i < matches.length; i += BATCH_SIZE) {
    const batch = matches.slice(i, i + BATCH_SIZE);

    const mutations = batch.map((m, idx) => `
      m${idx}: match_update(
        key: { tournamentId: "${m.tournamentId}", matchId: ${m.matchId} }
        data: {
          roundNumber: ${m.roundNumber}
          positionInRound: ${m.positionInRound}
          qualifiesToMatchId: ${m.qualifiesToMatchId ?? 'null'}
          isBye: ${m.isBye}
          status: "${m.status}"
          winnerEntryId: ${m.winnerEntryId ?? 'null'}
        }
      )
    `).join('\n');

    const batchMutation = `mutation BatchUpdateMatches { ${mutations} }`;
    await dataConnectAdmin.executeGraphql(batchMutation, {});
  }
}

/**
 * Batch create match picks - reduces N calls to ceil(N/BATCH_SIZE) calls
 */
export async function createMatchPicksBatch(
  picks: CreateMatchPickInput[],
  _authClaims: AuthClaims
): Promise<void> {
  if (picks.length === 0) return;

  console.log(`[createMatchPicksBatch] Total picks to create: ${picks.length}`);

  for (let i = 0; i < picks.length; i += BATCH_SIZE) {
    const batch = picks.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(picks.length / BATCH_SIZE);

    console.log(`[createMatchPicksBatch] Processing batch ${batchNumber}/${totalBatches} (${batch.length} picks)`);

    const mutations = batch.map((p, idx) => `
      mp${idx}: matchPick_upsert(data: {
        tournamentId: "${p.tournamentId}"
        matchId: ${p.matchId}
        entryId: ${p.entryId}
        slot: ${p.slot}
        entryEntryId: ${p.entryId}
      })
    `).join('\n');

    const batchMutation = `mutation BatchCreateMatchPicks { ${mutations} }`;

    try {
      await dataConnectAdmin.executeGraphql(batchMutation, {});
      console.log(`[createMatchPicksBatch] Batch ${batchNumber}/${totalBatches} completed successfully`);
    } catch (error) {
      // Log detailed error information
      console.error(`[createMatchPicksBatch] Batch ${batchNumber}/${totalBatches} FAILED`);
      console.error(`[createMatchPicksBatch] Batch data:`, JSON.stringify(batch, null, 2));
      console.error(`[createMatchPicksBatch] Error details:`, error);

      // Log match IDs in this batch for debugging
      const matchIds = batch.map(p => p.matchId);
      const entryIds = batch.map(p => p.entryId);
      console.error(`[createMatchPicksBatch] Match IDs in batch: ${matchIds.join(', ')}`);
      console.error(`[createMatchPicksBatch] Entry IDs in batch: ${entryIds.join(', ')}`);

      throw error;
    }
  }
}
