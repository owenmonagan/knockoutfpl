/**
 * Refresh Tournament - Eager Update Path
 *
 * HTTPS Callable function triggered when a user views a tournament page.
 * Refreshes all current round matches by:
 * 1. Fetching latest picks from FPL API
 * 2. Storing picks in database (with isFinal based on gameweek status)
 * 3. Resolving matches if gameweek is finished and feeders are complete
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { dataConnectAdmin } from './dataconnect-admin';
import {
  getRoundMatches,
  upsertPickAdmin,
  updateMatchWinner,
  updateRoundStatus,
  updateTournamentStatus,
  updateParticipantStatus,
  createMatchPickAdmin,
  RoundMatch,
  AuthClaims,
} from './dataconnect-mutations';
import { fetchCurrentGameweek, fetchScoresForEntries } from './fpl-scores';
import { resolveMatch, getNextRoundSlot, validateFeedersComplete, MatchResult, MinimalMatch } from './match-resolver';

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
      totalRounds
      fplLeagueId
      fplLeagueName
    }
    rounds(where: { tournamentId: { eq: $id } }) {
      roundNumber
      event
      status
    }
  }
`;

// GraphQL query for getting ALL matches in a tournament (for feeder validation)
const GET_ALL_TOURNAMENT_MATCHES_QUERY = `
  query GetAllTournamentMatches($tournamentId: UUID!) {
    matches(where: { tournamentId: { eq: $tournamentId } }) {
      matchId
      status
      qualifiesToMatchId
      roundNumber
    }
  }
`;

interface TournamentInfo {
  id: string;
  status: string;
  currentRound: number;
  totalRounds: number;
  fplLeagueId: number;
  fplLeagueName: string;
}

interface RoundInfo {
  roundNumber: number;
  event: number;
  status: string;
}

interface TournamentWithRoundResult {
  tournament: TournamentInfo | null;
  rounds: RoundInfo[];
}

interface TournamentMatch {
  matchId: number;
  status: string;
  qualifiesToMatchId: number | null;
  roundNumber: number;
}

interface RefreshResult {
  matchesRefreshed: number;
  matchesResolved: number;
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

function logWarn(action: string, reason: string, data: Record<string, unknown>): void {
  console.warn(JSON.stringify({
    level: 'warn',
    action,
    reason,
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
 * Get all matches for a tournament (for feeder validation)
 */
async function getAllTournamentMatches(tournamentId: string): Promise<TournamentMatch[]> {
  const result = await dataConnectAdmin.executeGraphql<{ matches: TournamentMatch[] }, { tournamentId: string }>(
    GET_ALL_TOURNAMENT_MATCHES_QUERY,
    { variables: { tournamentId } }
  );
  return result.data.matches;
}

/**
 * Create match_picks for winners advancing to next round
 */
async function advanceWinnersToNextRound(
  tournamentId: string,
  currentRound: number,
  matches: RoundMatch[],
  results: MatchResult[]
): Promise<void> {
  logInfo('advance_winners', { tournamentId, currentRound, nextRound: currentRound + 1 });

  // Group by next match
  const winnersByNextMatch = new Map<number, Array<{ winnerId: number; slot: number }>>();

  for (const match of matches) {
    if (!match.qualifiesToMatchId) continue;

    const result = results.find(r => r.matchId === match.matchId);
    if (!result) continue;

    const nextMatchId = match.qualifiesToMatchId;
    const slot = getNextRoundSlot(match.positionInRound);

    if (!winnersByNextMatch.has(nextMatchId)) {
      winnersByNextMatch.set(nextMatchId, []);
    }
    winnersByNextMatch.get(nextMatchId)!.push({
      winnerId: result.winnerId,
      slot,
    });
  }

  // Create match_picks for next round
  for (const [nextMatchId, winners] of winnersByNextMatch) {
    for (const { winnerId, slot } of winners) {
      await createMatchPickAdmin(
        {
          tournamentId,
          matchId: nextMatchId,
          entryId: winnerId,
          slot,
        },
        SYSTEM_AUTH_CLAIMS
      );
      logInfo('match_pick_created', { tournamentId, nextMatchId, winnerId, slot });
    }
  }
}

/**
 * Main refresh tournament function
 */
export const refreshTournament = onCall(
  {
    // Increase timeout for API calls
    timeoutSeconds: 120,
  },
  async (request): Promise<RefreshResult> => {
    // Require authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated to refresh tournament');
    }

    const { tournamentId } = request.data as { tournamentId?: string };

    if (!tournamentId) {
      throw new HttpsError('invalid-argument', 'tournamentId is required');
    }

    logInfo('refresh_start', { tournamentId, userId: request.auth.uid });

    let matchesRefreshed = 0;
    let matchesResolved = 0;

    try {
      // 1. Get tournament info and rounds
      const { tournament, rounds } = await getTournamentWithRounds(tournamentId);

      if (!tournament) {
        throw new HttpsError('not-found', `Tournament ${tournamentId} not found`);
      }

      if (tournament.status === 'completed') {
        logInfo('tournament_already_complete', { tournamentId });
        return { matchesRefreshed: 0, matchesResolved: 0 };
      }

      // Find the current round info
      const currentRoundInfo = rounds.find(r => r.roundNumber === tournament.currentRound);
      if (!currentRoundInfo) {
        throw new HttpsError('internal', `Round ${tournament.currentRound} not found for tournament ${tournamentId}`);
      }

      const event = currentRoundInfo.event;

      // 2. Check gameweek status from FPL API
      const gwStatus = await fetchCurrentGameweek();
      if (!gwStatus) {
        logWarn('refresh_skipped', 'could_not_fetch_gameweek', { tournamentId });
        return { matchesRefreshed: 0, matchesResolved: 0 };
      }

      // Determine if this round's gameweek is finished
      // The round's event might be before the current gameweek (catch-up scenario)
      const isEventFinished = event < gwStatus.event || (event === gwStatus.event && gwStatus.finished);

      logInfo('gameweek_status', {
        tournamentId,
        roundEvent: event,
        currentGW: gwStatus.event,
        currentGWFinished: gwStatus.finished,
        isEventFinished,
      });

      // 3. Get current round matches
      const matches = await getRoundMatches(tournamentId, tournament.currentRound);
      logInfo('matches_found', { tournamentId, count: matches.length });

      if (matches.length === 0) {
        logInfo('no_active_matches', { tournamentId, round: tournament.currentRound });
        return { matchesRefreshed: 0, matchesResolved: 0 };
      }

      // 4. Collect all entry IDs that need scores
      const entryIds = new Set<number>();
      for (const match of matches) {
        for (const pick of match.matchPicks) {
          entryIds.add(pick.entryId);
        }
      }

      // 5. Fetch scores from FPL API
      logInfo('fetching_scores', { tournamentId, entryCount: entryIds.size, event });
      const scoresMap = await fetchScoresForEntries(Array.from(entryIds), event);

      // 6. Update pick records with scores
      for (const [entryId, picks] of scoresMap) {
        try {
          await upsertPickAdmin(
            {
              entryId,
              event,
              points: picks.entry_history.points,
              totalPoints: picks.entry_history.total_points,
              rank: picks.entry_history.rank,
              activeChip: picks.active_chip ?? undefined,
              rawJson: JSON.stringify(picks),
              isFinal: isEventFinished,
            },
            SYSTEM_AUTH_CLAIMS
          );
          matchesRefreshed++;
        } catch (error) {
          logError('pick_upsert_failed', String(error), { tournamentId, entryId, event });
          // Continue with other entries
        }
      }

      // 7. If gameweek not finished, we're done (just refreshed picks)
      if (!isEventFinished) {
        logInfo('refresh_complete_pending', {
          tournamentId,
          matchesRefreshed,
          reason: 'gameweek_not_finished',
        });
        return { matchesRefreshed, matchesResolved: 0 };
      }

      // 8. Gameweek is finished - try to resolve matches
      logInfo('resolving_matches', { tournamentId, matchCount: matches.length });

      // Get all tournament matches for feeder validation
      const allMatches = await getAllTournamentMatches(tournamentId);
      const minimalMatches: MinimalMatch[] = allMatches.map(m => ({
        matchId: m.matchId,
        status: m.status,
        qualifiesToMatchId: m.qualifiesToMatchId,
      }));

      // Build points lookup from scores
      const pointsMap = new Map<number, number>();
      for (const [entryId, picks] of scoresMap) {
        pointsMap.set(entryId, picks.entry_history.points);
      }

      // Resolve each match
      const results: MatchResult[] = [];
      const completedMatchIds = new Set<number>();

      for (const match of matches) {
        // Check if feeders are complete
        const feederStatus = validateFeedersComplete(match.matchId, minimalMatches);
        if (!feederStatus.ready) {
          logWarn('match_skipped', 'feeder_incomplete', {
            tournamentId,
            matchId: match.matchId,
            event,
            incompleteFeederIds: feederStatus.incompleteFeederIds,
          });
          continue;
        }

        try {
          const result = resolveMatch(match, pointsMap);
          if (result) {
            results.push(result);
            completedMatchIds.add(match.matchId);

            // Update match with winner
            await updateMatchWinner(tournamentId, match.matchId, result.winnerId);

            // Update loser's participant status
            if (result.loserId) {
              await updateParticipantStatus(
                tournamentId,
                result.loserId,
                'eliminated',
                tournament.currentRound
              );
            }

            matchesResolved++;

            logInfo('match_resolved', {
              tournamentId,
              matchId: match.matchId,
              event,
              winnerId: result.winnerId,
              score: `${result.winnerScore}-${result.loserScore}`,
              decidedByTiebreaker: result.decidedByTiebreaker,
            });
          }
        } catch (error) {
          logError('match_resolve_failed', String(error), {
            tournamentId,
            matchId: match.matchId,
            event,
          });
          // Continue with other matches
        }
      }

      // 9. Check if round is complete
      const allMatchesComplete = matches.every(m => completedMatchIds.has(m.matchId));

      if (allMatchesComplete && results.length > 0) {
        logInfo('round_complete', { tournamentId, round: tournament.currentRound });
        await updateRoundStatus(tournamentId, tournament.currentRound, 'complete');

        // Check if this was the final round
        const isFinalRound = tournament.currentRound === tournament.totalRounds;

        if (isFinalRound) {
          // Tournament complete!
          const finalMatch = matches[0]; // Final has only 1 match
          const finalResult = results.find(r => r.matchId === finalMatch.matchId);

          if (finalResult) {
            await updateTournamentStatus(tournamentId, 'completed', finalResult.winnerId);
            await updateParticipantStatus(tournamentId, finalResult.winnerId, 'champion');
            logInfo('tournament_complete', {
              tournamentId,
              winnerId: finalResult.winnerId,
            });
          }
        } else {
          // Advance winners to next round
          await advanceWinnersToNextRound(tournamentId, tournament.currentRound, matches, results);

          // Activate next round
          await updateRoundStatus(tournamentId, tournament.currentRound + 1, 'active');
          logInfo('next_round_activated', {
            tournamentId,
            nextRound: tournament.currentRound + 1,
          });
        }
      }

      logInfo('refresh_complete', {
        tournamentId,
        matchesRefreshed,
        matchesResolved,
      });

      return { matchesRefreshed, matchesResolved };
    } catch (error) {
      if (error instanceof HttpsError) {
        throw error;
      }
      logError('refresh_failed', String(error), { tournamentId });
      throw new HttpsError('internal', `Failed to refresh tournament: ${error}`);
    }
  }
);
