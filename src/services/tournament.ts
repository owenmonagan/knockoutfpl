// src/services/tournament.ts
import { httpsCallable } from 'firebase/functions';
import { functions, dataConnect } from '../lib/firebase';
import {
  getLeagueTournaments,
  getTournamentWithParticipants,
  getTournamentRounds,
  getRoundMatches,
  getMatchPicks,
  getFinalPicksForEvent,
} from '@knockoutfpl/dataconnect';
import type { Tournament, Round, Match, Participant, MatchPlayer } from '../types/tournament';
import type { UUIDString } from '@knockoutfpl/dataconnect';

// Cloud Function types
interface CreateTournamentRequest {
  fplLeagueId: number;
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

interface RefreshTournamentResponse {
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
  console.log('[DEBUG] Tournament ID:', tournamentId);

  // Trigger refresh to update picks and resolve matches (eager update on view)
  // This is fire-and-forget from the user's perspective - they just see fresh data
  await callRefreshTournament(tournamentId);

  // Fetch participants and rounds in parallel
  const [participantsResult, roundsResult] = await Promise.all([
    getTournamentWithParticipants(dataConnect, { id: tournamentId }),
    getTournamentRounds(dataConnect, { tournamentId }),
  ]);

  console.log('[DEBUG] Participants count:', participantsResult.data.participants?.length);
  console.log('[DEBUG] Rounds count:', roundsResult.data.rounds?.length);

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
  console.log('[DEBUG] Unique events to fetch scores for:', uniqueEvents);

  // Fetch picks for all unique events in parallel
  const picksResults = await Promise.all(
    uniqueEvents.map((event) => getFinalPicksForEvent(dataConnect, { event }))
  );

  // Create a score lookup map: key = "entryId-event", value = points
  const scoreMap = new Map<string, number>();
  picksResults.forEach((result, index) => {
    const event = uniqueEvents[index];
    for (const pick of result.data.picks || []) {
      scoreMap.set(`${pick.entryId}-${event}`, pick.points);
    }
  });
  console.log('[DEBUG] Score map size:', scoreMap.size);

  // For each round, fetch matches and match picks
  const rounds: Round[] = await Promise.all(
    (roundsResult.data.rounds || []).map(async (r) => {
      // Get matches for this round
      const matchesResult = await getRoundMatches(dataConnect, {
        tournamentId,
        roundNumber: r.roundNumber,
      });
      console.log(`[DEBUG] Round ${r.roundNumber} matches:`, matchesResult.data.matches?.length);

      // For each match, get the match picks (players)
      const matches: Match[] = await Promise.all(
        (matchesResult.data.matches || []).map(async (m) => {
          const picksResult = await getMatchPicks(dataConnect, {
            tournamentId,
            matchId: m.matchId,
          });
          console.log(`[DEBUG] Match ${m.matchId} picks:`, picksResult.data.matchPicks?.length);

          const picks = picksResult.data.matchPicks || [];
          const player1Pick = picks.find((p) => p.slot === 1);
          const player2Pick = picks.find((p) => p.slot === 2);

          // Look up scores from the picks table using entryId and round's event
          const player1Score = player1Pick
            ? scoreMap.get(`${player1Pick.entryId}-${r.event}`) ?? null
            : null;
          const player2Score = player2Pick
            ? scoreMap.get(`${player2Pick.entryId}-${r.event}`) ?? null
            : null;

          // Debug: log score lookups for non-bye matches
          if (player1Pick && player2Pick) {
            console.log(`[DEBUG] Match ${m.matchId} (GW ${r.event}): entry ${player1Pick.entryId} score=${player1Score}, entry ${player2Pick.entryId} score=${player2Score}`);
          }

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
        })
      );

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
    totalRounds: basicTournament.totalRounds,
    status: basicTournament.status as 'active' | 'completed',
    participants,
    rounds,
    winnerId,
  };
}

/**
 * Call the createTournament Cloud Function
 * This replaces the client-side bracket generation with server-side logic
 */
export async function callCreateTournament(
  fplLeagueId: number
): Promise<CreateTournamentResponse> {
  const createTournamentFn = httpsCallable<
    CreateTournamentRequest,
    CreateTournamentResponse
  >(functions, 'createTournament');

  const result = await createTournamentFn({ fplLeagueId });
  return result.data;
}

/**
 * Call the refreshTournament Cloud Function
 * Updates picks and resolves matches for a tournament
 * This is called before fetching tournament data to ensure fresh state
 */
async function callRefreshTournament(
  tournamentId: string
): Promise<RefreshTournamentResponse | null> {
  try {
    const refreshTournamentFn = httpsCallable<
      RefreshTournamentRequest,
      RefreshTournamentResponse
    >(functions, 'refreshTournament');

    const result = await refreshTournamentFn({ tournamentId });
    console.log('[DEBUG] Tournament refresh result:', result.data);
    return result.data;
  } catch (error) {
    // Log warning but don't fail - user may not be authenticated
    // or there may be a transient error
    console.warn('[WARN] Failed to refresh tournament:', error);
    return null;
  }
}
