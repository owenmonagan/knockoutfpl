/**
 * Refresh Visible Matches - Scoped Update Path
 *
 * HTTPS Callable function triggered when a user views a subset of matches.
 * More efficient than refreshTournament for paginated views.
 *
 * Key differences from refreshTournament:
 * - Only fetches scores for specified match IDs (not entire round)
 * - Does NOT resolve matches or advance winners
 * - Limited to 20 matches per call for performance
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { dataConnectAdmin } from './dataconnect-admin';
import { fetchScoresForEntries } from './fpl-scores';
import { upsertPickAdmin, AuthClaims } from './dataconnect-mutations';

// Maximum matches that can be refreshed in a single call
const MAX_MATCHES_PER_REFRESH = 20;

// Auth claims for admin operations
const SYSTEM_AUTH_CLAIMS: AuthClaims = {
  sub: 'system',
  email: 'system@knockoutfpl.com',
  email_verified: true,
};

// GraphQL query for getting tournament with current round info
const GET_TOURNAMENT_WITH_ROUND_QUERY = `
  query GetTournamentWithRound($id: UUID!) {
    tournament(id: $id) {
      id
      status
      currentRound
    }
    rounds(where: { tournamentId: { eq: $id } }) {
      roundNumber
      event
    }
  }
`;

// GraphQL query for getting match picks for specific matches
const GET_MATCH_PICKS_FOR_MATCHES_QUERY = `
  query GetMatchPicksForMatches($tournamentId: UUID!, $matchIds: [Int!]!) {
    matchPicks(
      where: {
        tournamentId: { eq: $tournamentId }
        matchId: { in: $matchIds }
      }
    ) {
      matchId
      entryId
      slot
    }
  }
`;

interface TournamentInfo {
  id: string;
  status: string;
  currentRound: number;
}

interface RoundInfo {
  roundNumber: number;
  event: number;
}

interface TournamentWithRoundResult {
  tournament: TournamentInfo | null;
  rounds: RoundInfo[];
}

interface MatchPick {
  matchId: number;
  entryId: number;
  slot: number;
}

export interface RefreshVisibleMatchesRequest {
  tournamentId: string;
  matchIds: number[];
}

export interface RefreshVisibleMatchesResponse {
  picksRefreshed: number;
}

/**
 * Log structured JSON for debugging
 */
function logInfo(action: string, data: Record<string, unknown>): void {
  console.log(JSON.stringify({
    level: 'info',
    action,
    ...data,
  }));
}

function logError(action: string, error: string, data: Record<string, unknown>): void {
  console.error(JSON.stringify({
    level: 'error',
    action,
    error,
    ...data,
  }));
}

/**
 * Get tournament with its rounds info
 */
async function getTournamentWithRounds(tournamentId: string): Promise<TournamentWithRoundResult> {
  const result = await dataConnectAdmin.executeGraphql<TournamentWithRoundResult, { id: string }>(
    GET_TOURNAMENT_WITH_ROUND_QUERY,
    { variables: { id: tournamentId } }
  );
  return result.data;
}

/**
 * Get match picks for specific match IDs
 */
async function getMatchPicksForMatches(
  tournamentId: string,
  matchIds: number[]
): Promise<MatchPick[]> {
  const result = await dataConnectAdmin.executeGraphql<
    { matchPicks: MatchPick[] },
    { tournamentId: string; matchIds: number[] }
  >(
    GET_MATCH_PICKS_FOR_MATCHES_QUERY,
    { variables: { tournamentId, matchIds } }
  );
  return result.data.matchPicks;
}

/**
 * Handler function for refreshVisibleMatches (exported for testing)
 */
export async function refreshVisibleMatchesHandler(
  data: RefreshVisibleMatchesRequest
): Promise<RefreshVisibleMatchesResponse> {
  const { tournamentId, matchIds } = data;

  // Validate input
  if (!tournamentId) {
    throw new HttpsError('invalid-argument', 'tournamentId is required');
  }
  if (!matchIds) {
    throw new HttpsError('invalid-argument', 'matchIds is required');
  }
  if (!Array.isArray(matchIds) || matchIds.length === 0) {
    throw new HttpsError('invalid-argument', 'matchIds must not be empty');
  }
  if (matchIds.length > MAX_MATCHES_PER_REFRESH) {
    throw new HttpsError(
      'invalid-argument',
      `Maximum ${MAX_MATCHES_PER_REFRESH} matches per refresh`
    );
  }

  logInfo('refresh_visible_start', { tournamentId, matchCount: matchIds.length });

  let picksRefreshed = 0;

  // 1. Get tournament and round info
  const { tournament, rounds } = await getTournamentWithRounds(tournamentId);

  if (!tournament) {
    throw new HttpsError('not-found', `Tournament ${tournamentId} not found`);
  }

  // Find the current round's event (gameweek)
  const currentRoundInfo = rounds.find(r => r.roundNumber === tournament.currentRound);
  if (!currentRoundInfo) {
    throw new HttpsError(
      'internal',
      `Round ${tournament.currentRound} not found for tournament ${tournamentId}`
    );
  }

  const event = currentRoundInfo.event;

  // 2. Get match picks for the specified matches
  const matchPicks = await getMatchPicksForMatches(tournamentId, matchIds);

  if (matchPicks.length === 0) {
    logInfo('refresh_visible_no_picks', { tournamentId, matchIds });
    return { picksRefreshed: 0 };
  }

  // 3. Collect unique entry IDs
  const entryIds = [...new Set(matchPicks.map(mp => mp.entryId))];

  logInfo('fetching_visible_scores', {
    tournamentId,
    matchCount: matchIds.length,
    entryCount: entryIds.length,
    event,
  });

  // 4. Fetch scores from FPL API
  const scoresMap = await fetchScoresForEntries(entryIds, event, { treatMissingAsZero: true });

  // 5. Update pick records with scores
  for (const [entryId, picks] of scoresMap) {
    try {
      await upsertPickAdmin(
        {
          entryId,
          event,
          points: picks.entry_history.points,
          totalPoints: picks.entry_history.total_points,
          rank: picks.entry_history.rank,
          rawJson: JSON.stringify(picks),
          isFinal: false, // Visible matches refresh doesn't determine finality
        },
        SYSTEM_AUTH_CLAIMS
      );
      picksRefreshed++;
    } catch (error) {
      logError('pick_upsert_failed', String(error), { tournamentId, entryId, event });
      // Continue with other entries
    }
  }

  logInfo('refresh_visible_complete', {
    tournamentId,
    matchCount: matchIds.length,
    picksRefreshed,
  });

  return { picksRefreshed };
}

/**
 * Cloud Function to refresh scores for visible matches only
 *
 * More efficient than refreshTournament for paginated views:
 * - Only fetches scores for specified match IDs
 * - Does NOT resolve matches or advance winners
 * - Limited to 20 matches per call
 */
export const refreshVisibleMatches = onCall(
  {
    timeoutSeconds: 60,
  },
  async (request): Promise<RefreshVisibleMatchesResponse> => {
    // Require authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    logInfo('refresh_visible_call', { userId: request.auth.uid });

    return refreshVisibleMatchesHandler(request.data as RefreshVisibleMatchesRequest);
  }
);
