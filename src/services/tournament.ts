// src/services/tournament.ts
import { httpsCallable } from 'firebase/functions';
import { functions, dataConnect } from '../lib/firebase';
import {
  getLeagueTournaments,
  getTournamentWithParticipants,
  getTournamentRounds,
  getRoundMatches,
  getAllTournamentMatchPicks,
  getPicksForEvent,
  getCurrentEvent,
} from '@knockoutfpl/dataconnect';
import type { Tournament, Round, Match, Participant, MatchPlayer } from '../types/tournament';
import type { UUIDString } from '@knockoutfpl/dataconnect';

// ============================================================================
// Types for Tournament Summary
// ============================================================================

export interface TournamentSummary {
  id: string;
  status: 'active' | 'completed';
  currentRound: number;
  totalRounds: number;
}

export interface UserProgress {
  status: 'active' | 'eliminated' | 'winner';
  eliminationRound: number | null;
}

// Cloud Function types
interface CreateTournamentRequest {
  fplLeagueId: number;
  startEvent?: number;
}

interface CreateTournamentResponse {
  tournamentId: string;
  participantCount: number;
  totalRounds: number;
  startEvent: number;
}

interface RefreshTournamentRequest {
  tournamentId: string;
}

export interface RefreshTournamentResponse {
  picksRefreshed: number;
  matchesResolved: number;
}

/**
 * Generate round name based on round number and total rounds
 */
function getRoundName(roundNumber: number, totalRounds: number): string {
  const roundsFromEnd = totalRounds - roundNumber;
  if (roundsFromEnd === 0) return 'Final';
  if (roundsFromEnd === 1) return 'Semi-Finals';
  if (roundsFromEnd === 2) return 'Quarter-Finals';
  return `Round ${roundNumber}`;
}

/**
 * Get tournament by FPL league ID using Data Connect
 * Fetches full tournament data including participants, rounds, and matches
 */
export async function getTournamentByLeague(leagueId: number): Promise<Tournament | null> {
  // First, get basic tournament info
  const tournamentsResult = await getLeagueTournaments(dataConnect, { fplLeagueId: leagueId });

  if (!tournamentsResult.data.tournaments || tournamentsResult.data.tournaments.length === 0) {
    return null;
  }

  const basicTournament = tournamentsResult.data.tournaments[0];
  const tournamentId = basicTournament.id as UUIDString;

  // Fetch participants, rounds, and current gameweek in parallel
  const [participantsResult, roundsResult, currentEventResult] = await Promise.all([
    getTournamentWithParticipants(dataConnect, { id: tournamentId }),
    getTournamentRounds(dataConnect, { tournamentId }),
    getCurrentEvent(dataConnect, { season: '2024-25' }),
  ]);

  // Get current FPL gameweek from Events table
  // Fallback: if no event data, assume we're before the tournament starts (startGameweek - 1)
  // This ensures future rounds show seeds, not "0" scores
  const startEvent = participantsResult.data.tournament?.startEvent ?? basicTournament.currentRound;
  const currentGameweek = currentEventResult.data.events?.[0]?.event ?? (startEvent - 1);

  // Map participants to our type
  const participants: Participant[] = (participantsResult.data.participants || []).map((p) => ({
    fplTeamId: p.entryId,
    fplTeamName: p.teamName,
    managerName: p.managerName,
    seed: p.seed,
  }));

  // Create a lookup map for participants by entryId
  const participantMap = new Map(participants.map((p) => [p.fplTeamId, p]));

  // Collect unique gameweeks from rounds and fetch scores for each
  const uniqueEvents = [...new Set((roundsResult.data.rounds || []).map((r) => r.event))];

  // Get all participant entry IDs to filter picks query
  const entryIds = participants.map((p) => p.fplTeamId);

  // Fetch picks for all unique events in parallel (includes provisional scores)
  // Filter by tournament participant entry IDs to avoid default pagination limits
  const picksResults = await Promise.all(
    uniqueEvents.map((event) => getPicksForEvent(dataConnect, { event, entryIds }))
  );

  // Create a score lookup map: key = "entryId-event", value = points
  const scoreMap = new Map<string, number>();
  picksResults.forEach((result, index) => {
    const event = uniqueEvents[index];
    for (const pick of result.data.picks || []) {
      scoreMap.set(`${pick.entryId}-${event}`, pick.points);
    }
  });

  // Fetch ALL match picks for the tournament in ONE query (avoids rate limiting)
  const allMatchPicksResult = await getAllTournamentMatchPicks(dataConnect, { tournamentId });

  // Group match picks by matchId for efficient lookup
  const matchPicksByMatchId = new Map<number, typeof allMatchPicksResult.data.matchPicks>();
  for (const pick of allMatchPicksResult.data.matchPicks || []) {
    const existing = matchPicksByMatchId.get(pick.matchId) || [];
    existing.push(pick);
    matchPicksByMatchId.set(pick.matchId, existing);
  }

  // For each round, fetch matches and use pre-loaded match picks
  const rounds: Round[] = await Promise.all(
    (roundsResult.data.rounds || []).map(async (r) => {
      // Get matches for this round
      const matchesResult = await getRoundMatches(dataConnect, {
        tournamentId,
        roundNumber: r.roundNumber,
      });

      // For each match, use pre-loaded match picks (no additional queries)
      const matches: Match[] = (matchesResult.data.matches || []).map((m) => {
        const picks = matchPicksByMatchId.get(m.matchId) || [];
        const player1Pick = picks.find((p) => p.slot === 1);
        const player2Pick = picks.find((p) => p.slot === 2);

        // Look up scores from the picks table using entryId and round's event
        const player1Score = player1Pick
          ? scoreMap.get(`${player1Pick.entryId}-${r.event}`) ?? null
          : null;
        const player2Score = player2Pick
          ? scoreMap.get(`${player2Pick.entryId}-${r.event}`) ?? null
          : null;

        const player1: MatchPlayer | null = player1Pick
          ? {
              fplTeamId: player1Pick.entryId,
              seed: participantMap.get(player1Pick.entryId)?.seed ?? 0,
              score: player1Score,
            }
          : null;

        const player2: MatchPlayer | null = player2Pick
          ? {
              fplTeamId: player2Pick.entryId,
              seed: participantMap.get(player2Pick.entryId)?.seed ?? 0,
              score: player2Score,
            }
          : null;

        return {
          id: `${m.tournamentId}-${m.matchId}`,
          player1,
          player2,
          winnerId: m.winnerEntryId ?? null,
          isBye: m.isBye,
        };
      });

      return {
        roundNumber: r.roundNumber,
        name: getRoundName(r.roundNumber, basicTournament.totalRounds),
        gameweek: r.event,
        matches,
        isComplete: r.status === 'completed',
      };
    })
  );

  // Get winner from tournament data
  const tournamentData = participantsResult.data.tournament;
  const winnerId = tournamentData?.winnerEntryId ?? null;

  return {
    id: basicTournament.id,
    fplLeagueId: leagueId,
    fplLeagueName: basicTournament.fplLeagueName,
    creatorUserId: basicTournament.creatorUid,
    startGameweek: tournamentData?.startEvent ?? basicTournament.currentRound,
    currentRound: basicTournament.currentRound,
    currentGameweek,
    totalRounds: basicTournament.totalRounds,
    status: basicTournament.status as 'active' | 'completed',
    participants,
    rounds,
    winnerId,
    createdAt: basicTournament.createdAt,
    updatedAt: basicTournament.createdAt, // Use createdAt as fallback for updatedAt
  };
}

/**
 * Call the createTournament Cloud Function
 * This replaces the client-side bracket generation with server-side logic
 */
export async function callCreateTournament(
  fplLeagueId: number,
  startEvent?: number
): Promise<CreateTournamentResponse> {
  const createTournamentFn = httpsCallable<
    CreateTournamentRequest,
    CreateTournamentResponse
  >(functions, 'createTournament');

  const request: CreateTournamentRequest = { fplLeagueId };
  if (startEvent !== undefined) {
    request.startEvent = startEvent;
  }

  const result = await createTournamentFn(request);
  return result.data;
}

/**
 * Call the refreshTournament Cloud Function
 * Updates picks and resolves matches for a tournament
 * Returns refresh statistics or null on failure (fails silently)
 */
export async function callRefreshTournament(
  tournamentId: string
): Promise<RefreshTournamentResponse | null> {
  try {
    const refreshTournamentFn = httpsCallable<
      RefreshTournamentRequest,
      RefreshTournamentResponse
    >(functions, 'refreshTournament');

    const result = await refreshTournamentFn({ tournamentId });
    return result.data;
  } catch (error) {
    // Log warning but don't fail - user may not be authenticated
    // or there may be a transient error
    console.warn('[WARN] Failed to refresh tournament:', error);
    return null;
  }
}

/**
 * Get a lightweight tournament summary for displaying on the leagues page.
 * Does NOT fetch full bracket data - just tournament status and user's progress.
 * Does NOT call refreshTournament - this is a read-only summary.
 */
export async function getTournamentSummaryForLeague(
  fplLeagueId: number,
  userFplTeamId: number | null
): Promise<{
  tournament: TournamentSummary | null;
  userProgress: UserProgress | null;
}> {
  // Step 1: Check if tournament exists for this league
  const tournamentsResult = await getLeagueTournaments(dataConnect, { fplLeagueId });

  if (!tournamentsResult.data.tournaments || tournamentsResult.data.tournaments.length === 0) {
    return { tournament: null, userProgress: null };
  }

  // Get the first (most recent) tournament for this league
  const basicTournament = tournamentsResult.data.tournaments[0];

  // Build the tournament summary
  const tournamentSummary: TournamentSummary = {
    id: basicTournament.id,
    status: basicTournament.status as 'active' | 'completed',
    currentRound: basicTournament.currentRound,
    totalRounds: basicTournament.totalRounds,
  };

  // Step 2: If no user team ID provided, return tournament only
  if (userFplTeamId === null) {
    return { tournament: tournamentSummary, userProgress: null };
  }

  // Step 3: Fetch participant data to determine user's progress
  const tournamentId = basicTournament.id as UUIDString;
  const participantsResult = await getTournamentWithParticipants(dataConnect, { id: tournamentId });

  // Find the user's participant record
  const participants = participantsResult.data.participants || [];
  const userParticipant = participants.find((p) => p.entryId === userFplTeamId);

  // If user is not a participant, return null userProgress
  if (!userParticipant) {
    return { tournament: tournamentSummary, userProgress: null };
  }

  // Step 4: Determine user's status
  const winnerEntryId = participantsResult.data.tournament?.winnerEntryId ?? null;

  let userStatus: 'active' | 'eliminated' | 'winner';
  if (winnerEntryId === userFplTeamId) {
    userStatus = 'winner';
  } else if (userParticipant.eliminationRound !== null) {
    userStatus = 'eliminated';
  } else {
    userStatus = 'active';
  }

  const userProgress: UserProgress = {
    status: userStatus,
    eliminationRound: userParticipant.eliminationRound ?? null,
  };

  return { tournament: tournamentSummary, userProgress };
}
