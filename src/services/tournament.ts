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
  getUserTournamentMatches,
  getOpponentMatchHistories,
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
  startGameweek: number;
  endGameweek: number; // Calculated: startGameweek + totalRounds - 1
}

export interface MatchSummary {
  opponentTeamName: string;
  opponentManagerName: string;
  opponentFplTeamId: number;
  roundNumber: number;
  roundName: string;
  gameweek: number;
  yourScore: number | null;
  theirScore: number | null;
  isLive: boolean;
  result: 'won' | 'lost' | 'pending';
}

export interface OpponentSummary {
  teamName: string;
  managerName: string;
  roundNumber: number;
  roundName: string;
  gameweek: number;
}

export interface UserProgress {
  status: 'active' | 'eliminated' | 'winner';
  eliminationRound: number | null;
  currentRoundName?: string;
  currentMatch: MatchSummary | null;
  recentResult: MatchSummary | null;
  nextOpponent: OpponentSummary | null;
}

// Cloud Function types
interface CreateTournamentRequest {
  fplLeagueId: number;
  startEvent?: number;
  matchSize?: number;
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

interface RefreshVisibleMatchesRequest {
  tournamentId: string;
  matchIds: number[];
}

export interface RefreshVisibleMatchesResponse {
  picksRefreshed: number;
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

        // Use participant data directly from match picks (avoids participant lookup limit issues)
        const player1: MatchPlayer | null = player1Pick
          ? {
              fplTeamId: player1Pick.entryId,
              seed: player1Pick.participant?.seed ?? participantMap.get(player1Pick.entryId)?.seed ?? 0,
              score: player1Score,
              teamName: player1Pick.participant?.teamName ?? participantMap.get(player1Pick.entryId)?.fplTeamName,
              managerName: player1Pick.participant?.managerName ?? participantMap.get(player1Pick.entryId)?.managerName,
            }
          : null;

        const player2: MatchPlayer | null = player2Pick
          ? {
              fplTeamId: player2Pick.entryId,
              seed: player2Pick.participant?.seed ?? participantMap.get(player2Pick.entryId)?.seed ?? 0,
              score: player2Score,
              teamName: player2Pick.participant?.teamName ?? participantMap.get(player2Pick.entryId)?.fplTeamName,
              managerName: player2Pick.participant?.managerName ?? participantMap.get(player2Pick.entryId)?.managerName,
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
  startEvent?: number,
  matchSize?: number
): Promise<CreateTournamentResponse> {
  const createTournamentFn = httpsCallable<
    CreateTournamentRequest,
    CreateTournamentResponse
  >(functions, 'createTournament');

  const request: CreateTournamentRequest = { fplLeagueId };
  if (startEvent !== undefined) {
    request.startEvent = startEvent;
  }
  if (matchSize !== undefined) {
    request.matchSize = matchSize;
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
  const tournamentId = basicTournament.id as UUIDString;

  // Step 2: Fetch tournament details including startEvent (parallel with participant data if needed)
  const participantsResult = await getTournamentWithParticipants(dataConnect, { id: tournamentId });
  const startGameweek = participantsResult.data.tournament?.startEvent ?? basicTournament.currentRound;
  const endGameweek = startGameweek + basicTournament.totalRounds - 1;

  // Build the tournament summary with enhanced data
  const tournamentSummary: TournamentSummary = {
    id: basicTournament.id,
    status: basicTournament.status as 'active' | 'completed',
    currentRound: basicTournament.currentRound,
    totalRounds: basicTournament.totalRounds,
    startGameweek,
    endGameweek,
  };

  // Step 3: If no user team ID provided, return tournament only
  if (userFplTeamId === null) {
    return { tournament: tournamentSummary, userProgress: null };
  }

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

  // Create a lookup map for participants by entryId (for opponent names)
  const participantMap = new Map(participants.map((p) => [p.entryId, p]));

  // Step 5: Fetch match data to build currentMatch, recentResult, nextOpponent
  // Fetch rounds, current event, and match picks in parallel
  const [roundsResult, currentEventResult, allMatchPicksResult] = await Promise.all([
    getTournamentRounds(dataConnect, { tournamentId }),
    getCurrentEvent(dataConnect, { season: '2024-25' }),
    getAllTournamentMatchPicks(dataConnect, { tournamentId }),
  ]);

  const currentFplGameweek = currentEventResult.data.events?.[0]?.event ?? (startGameweek - 1);
  const rounds = roundsResult.data.rounds || [];

  // Group match picks by matchId for efficient lookup
  const matchPicksByMatchId = new Map<number, typeof allMatchPicksResult.data.matchPicks>();
  for (const pick of allMatchPicksResult.data.matchPicks || []) {
    const existing = matchPicksByMatchId.get(pick.matchId) || [];
    existing.push(pick);
    matchPicksByMatchId.set(pick.matchId, existing);
  }

  // Collect unique gameweeks from rounds and fetch scores
  const uniqueEvents = [...new Set(rounds.map((r) => r.event))];
  const entryIds = participants.map((p) => p.entryId);

  // Fetch picks/scores for all unique events in parallel
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

  // For each round, fetch matches and find user's matches
  let currentMatch: MatchSummary | null = null;
  let recentResult: MatchSummary | null = null;
  let nextOpponent: OpponentSummary | null = null;
  let currentRoundName: string | undefined;

  // Find user's matches across all rounds
  for (const round of rounds) {
    const roundName = getRoundName(round.roundNumber, basicTournament.totalRounds);
    const matchesResult = await getRoundMatches(dataConnect, {
      tournamentId,
      roundNumber: round.roundNumber,
    });

    // Look for user's match in this round
    for (const match of matchesResult.data.matches || []) {
      const picks = matchPicksByMatchId.get(match.matchId) || [];
      const userPick = picks.find((p) => p.entryId === userFplTeamId);

      if (!userPick) continue; // User not in this match

      // Found user's match in this round
      const opponentPick = picks.find((p) => p.entryId !== userFplTeamId);
      const opponentEntryId = opponentPick?.entryId;
      const opponentParticipant = opponentEntryId ? participantMap.get(opponentEntryId) : null;

      const yourScore = scoreMap.get(`${userFplTeamId}-${round.event}`) ?? null;
      const theirScore = opponentEntryId ? scoreMap.get(`${opponentEntryId}-${round.event}`) ?? null : null;

      // Determine if this match is for current round
      const isCurrentRound = round.roundNumber === basicTournament.currentRound;

      // Determine if match is live (current gameweek matches round gameweek)
      const isLive = currentFplGameweek === round.event && round.status !== 'completed';

      // Determine result
      let result: 'won' | 'lost' | 'pending' = 'pending';
      if (match.winnerEntryId !== null) {
        result = match.winnerEntryId === userFplTeamId ? 'won' : 'lost';
      }

      const matchSummary: MatchSummary = {
        opponentTeamName: opponentParticipant?.teamName ?? 'BYE',
        opponentManagerName: opponentParticipant?.managerName ?? '',
        opponentFplTeamId: opponentEntryId ?? 0,
        roundNumber: round.roundNumber,
        roundName,
        gameweek: round.event,
        yourScore,
        theirScore,
        isLive,
        result,
      };

      // Categorize this match
      if (isCurrentRound && userStatus === 'active') {
        // This is the user's current match
        currentMatch = matchSummary;
        currentRoundName = roundName;
      } else if (result !== 'pending') {
        // This is a completed match - track as most recent result
        // (will be overwritten by later rounds, so we get the most recent)
        recentResult = matchSummary;
      }
    }
  }

  // Step 6: Determine next opponent (for active users, look at next round)
  if (userStatus === 'active' && basicTournament.currentRound < basicTournament.totalRounds) {
    const nextRoundNumber = basicTournament.currentRound + 1;
    const nextRound = rounds.find((r) => r.roundNumber === nextRoundNumber);

    if (nextRound) {
      const nextRoundName = getRoundName(nextRoundNumber, basicTournament.totalRounds);
      const nextMatchesResult = await getRoundMatches(dataConnect, {
        tournamentId,
        roundNumber: nextRoundNumber,
      });

      // Find user's match in next round
      for (const match of nextMatchesResult.data.matches || []) {
        const picks = matchPicksByMatchId.get(match.matchId) || [];
        const userPick = picks.find((p) => p.entryId === userFplTeamId);

        if (userPick) {
          const opponentPick = picks.find((p) => p.entryId !== userFplTeamId);
          const opponentEntryId = opponentPick?.entryId;
          const opponentParticipant = opponentEntryId ? participantMap.get(opponentEntryId) : null;

          if (opponentParticipant) {
            nextOpponent = {
              teamName: opponentParticipant.teamName,
              managerName: opponentParticipant.managerName,
              roundNumber: nextRoundNumber,
              roundName: nextRoundName,
              gameweek: nextRound.event,
            };
          }
          break;
        }
      }
    }
  }

  const userProgress: UserProgress = {
    status: userStatus,
    eliminationRound: userParticipant.eliminationRound ?? null,
    currentRoundName,
    currentMatch,
    recentResult,
    nextOpponent,
  };

  return { tournament: tournamentSummary, userProgress };
}

/**
 * Refreshes scores for specific visible matches.
 * Used for paginated bracket view - only refreshes what user sees.
 * Rate limited to once per 30 seconds.
 */
export async function refreshVisibleMatches(
  tournamentId: string,
  matchIds: number[]
): Promise<RefreshVisibleMatchesResponse | null> {
  try {
    const refreshVisibleMatchesFn = httpsCallable<
      RefreshVisibleMatchesRequest,
      RefreshVisibleMatchesResponse
    >(functions, 'refreshVisibleMatches');

    const result = await refreshVisibleMatchesFn({ tournamentId, matchIds });
    return result.data;
  } catch (error) {
    // Silently handle rate limiting and other errors
    console.warn('[WARN] Failed to refresh visible matches:', error);
    return null;
  }
}

// ============================================================================
// User Match Fetching (for large tournaments)
// ============================================================================

export interface UserMatchInfo {
  matchId: number;
  roundNumber: number;
  roundName: string;
  gameweek: number;
  yourTeamName: string;
  yourFplTeamId: number;
  yourSeed: number;
  yourScore: number | null;
  opponentTeamName: string | null;
  opponentManagerName: string | null;
  opponentFplTeamId: number | null;
  opponentSeed: number | null;
  opponentScore: number | null;
  isBye: boolean;
  status: 'pending' | 'active' | 'complete';
  winnerId: number | null;
  result: 'won' | 'lost' | 'pending';
}

/**
 * Fetch user's matches in a tournament via API.
 * Used for large tournaments where participants array is capped.
 * Returns all matches the user is involved in with full details.
 */
export async function fetchUserTournamentMatches(
  tournamentId: string,
  entryId: number,
  totalRounds: number,
  currentGameweek: number
): Promise<UserMatchInfo[]> {
  // Fetch user's matches and rounds in parallel
  const [matchesResult, roundsResult] = await Promise.all([
    getUserTournamentMatches(dataConnect, {
      tournamentId: tournamentId as UUIDString,
      entryId,
    }),
    getTournamentRounds(dataConnect, {
      tournamentId: tournamentId as UUIDString,
    }),
  ]);

  // Build round event map: roundNumber -> event
  const roundEventMap = new Map<number, number>();
  const roundStatusMap = new Map<number, string>();
  for (const round of roundsResult.data.rounds || []) {
    roundEventMap.set(round.roundNumber, round.event);
    roundStatusMap.set(round.roundNumber, round.status);
  }

  // Collect entry IDs and events for score fetching
  const entryIdsForScores = new Set<number>();
  const eventsForScores = new Set<number>();

  for (const pick of matchesResult.data.matchPicks || []) {
    const roundEvent = roundEventMap.get(pick.match.roundNumber);
    if (roundEvent) eventsForScores.add(roundEvent);

    entryIdsForScores.add(pick.entryId);
    for (const oppPick of pick.match.matchPicks_on_match || []) {
      if (oppPick.entryId !== pick.entryId) {
        entryIdsForScores.add(oppPick.entryId);
      }
    }
  }

  // Fetch scores for all relevant entries and events
  const scoreMap = new Map<string, number>();
  if (eventsForScores.size > 0 && entryIdsForScores.size > 0) {
    const picksResults = await Promise.all(
      Array.from(eventsForScores).map((event) =>
        getPicksForEvent(dataConnect, {
          event,
          entryIds: Array.from(entryIdsForScores),
        })
      )
    );

    for (let i = 0; i < picksResults.length; i++) {
      const event = Array.from(eventsForScores)[i];
      for (const pick of picksResults[i].data.picks || []) {
        scoreMap.set(`${pick.entryId}-${event}`, pick.points);
      }
    }
  }

  // Build match info array
  const matches: UserMatchInfo[] = [];

  for (const pick of matchesResult.data.matchPicks || []) {
    const match = pick.match;
    const roundEvent = roundEventMap.get(match.roundNumber) ?? 0;
    const roundStatus = roundStatusMap.get(match.roundNumber) ?? 'pending';

    // Find opponent in matchPicks_on_match
    const opponentPick = (match.matchPicks_on_match || []).find(
      (p) => p.entryId !== pick.entryId
    );

    // Get scores
    const yourScore = scoreMap.get(`${pick.entryId}-${roundEvent}`) ?? null;
    const opponentScore = opponentPick
      ? scoreMap.get(`${opponentPick.entryId}-${roundEvent}`) ?? null
      : null;

    // Determine result
    let result: 'won' | 'lost' | 'pending' = 'pending';
    if (match.winnerEntryId !== null) {
      result = match.winnerEntryId === pick.entryId ? 'won' : 'lost';
    }

    // Determine status
    let status: 'pending' | 'active' | 'complete';
    if (match.status === 'complete' || roundStatus === 'completed') {
      status = 'complete';
    } else if (roundEvent <= currentGameweek) {
      status = 'active';
    } else {
      status = 'pending';
    }

    matches.push({
      matchId: match.matchId,
      roundNumber: match.roundNumber,
      roundName: getRoundName(match.roundNumber, totalRounds),
      gameweek: roundEvent,
      yourTeamName: pick.participant?.teamName ?? 'Unknown',
      yourFplTeamId: pick.entryId,
      yourSeed: pick.participant?.seed ?? 0,
      yourScore,
      opponentTeamName: opponentPick?.participant?.teamName ?? null,
      opponentManagerName: opponentPick?.participant?.managerName ?? null,
      opponentFplTeamId: opponentPick?.entryId ?? null,
      opponentSeed: opponentPick?.participant?.seed ?? null,
      opponentScore,
      isBye: match.isBye,
      status,
      winnerId: match.winnerEntryId ?? null,
      result,
    });
  }

  // Sort by round number
  return matches.sort((a, b) => a.roundNumber - b.roundNumber);
}

// ============================================================================
// Opponent Match Histories (for User Path Bracket)
// ============================================================================

/**
 * Match info for opponent history display
 */
export interface OpponentMatchInfo {
  matchId: number;
  roundNumber: number;
  positionInRound: number;
  entryId: number;
  teamName: string;
  managerName: string;
  seed: number;
  opponentTeamName: string | null;
  opponentSeed: number | null;
  status: 'pending' | 'active' | 'complete';
  won: boolean | null; // null if not complete
  isBye: boolean;
}

/**
 * Fetch match histories for multiple opponents.
 * Returns a map of entryId -> array of matches they played.
 */
export async function fetchOpponentHistories(
  tournamentId: string,
  opponentEntryIds: number[]
): Promise<Map<number, OpponentMatchInfo[]>> {
  if (opponentEntryIds.length === 0) {
    return new Map();
  }

  const result = await getOpponentMatchHistories(dataConnect, {
    tournamentId: tournamentId as UUIDString,
    entryIds: opponentEntryIds,
  });

  const historyMap = new Map<number, OpponentMatchInfo[]>();

  for (const pick of result.data.matchPicks || []) {
    const match = pick.match;

    // Find self in matchPicks_on_match to get participant data
    const selfPick = match.matchPicks_on_match?.find(
      (p) => p.entryId === pick.entryId
    );

    // Find opponent in this match
    const opponentPick = match.matchPicks_on_match?.find(
      (p) => p.entryId !== pick.entryId
    );

    const matchInfo: OpponentMatchInfo = {
      matchId: match.matchId,
      roundNumber: match.roundNumber,
      positionInRound: match.positionInRound,
      entryId: pick.entryId,
      teamName: selfPick?.participant?.teamName ?? 'Unknown',
      managerName: selfPick?.participant?.managerName ?? '',
      seed: selfPick?.participant?.seed ?? 0,
      opponentTeamName: opponentPick?.participant?.teamName ?? null,
      opponentSeed: opponentPick?.participant?.seed ?? null,
      status: match.status as 'pending' | 'active' | 'complete',
      won: match.status === 'complete' ? match.winnerEntryId === pick.entryId : null,
      isBye: match.isBye,
    };

    if (!historyMap.has(pick.entryId)) {
      historyMap.set(pick.entryId, []);
    }
    historyMap.get(pick.entryId)!.push(matchInfo);
  }

  // Sort each entry's matches by round number
  for (const [entryId, matches] of historyMap) {
    matches.sort((a, b) => a.roundNumber - b.roundNumber);
    historyMap.set(entryId, matches);
  }

  return historyMap;
}
