/**
 * Bracket Update Scheduled Function
 *
 * Runs every 2 hours to:
 * 1. Check if current gameweek is finished
 * 2. Find active rounds for that gameweek
 * 3. Fetch final scores from FPL API
 * 4. Update pick records with final scores
 * 5. Resolve matches and determine winners
 * 6. Advance winners to next round
 * 7. Mark tournaments complete when final is decided
 */

import { onSchedule } from 'firebase-functions/v2/scheduler';
import {
  getActiveRoundsForEvent,
  getRoundMatches,
  upsertPickAdmin,
  updateMatchWinner,
  updateRoundStatus,
  updateTournamentStatus,
  updateParticipantStatus,
  createMatchPickAdmin,
  ActiveRound,
  RoundMatch,
  AuthClaims,
} from './dataconnect-mutations';
import { fetchCurrentGameweek, fetchScoresForEntries } from './fpl-scores';
import { resolveMatch, getNextRoundSlot, MatchResult } from './match-resolver';

// Auth claims for admin operations
const SYSTEM_AUTH_CLAIMS: AuthClaims = {
  sub: 'system',
  email: 'system@knockoutfpl.com',
  email_verified: true,
};

/**
 * Process a single round: fetch scores, resolve matches, advance winners
 */
async function processRound(round: ActiveRound, event: number): Promise<void> {
  console.log(`[updateBrackets] Processing round ${round.roundNumber} of tournament ${round.tournamentId}`);

  // 1. Get all active matches in this round
  const matches = await getRoundMatches(round.tournamentId, round.roundNumber);
  console.log(`[updateBrackets] Found ${matches.length} active matches`);

  if (matches.length === 0) {
    // No active matches - round may already be complete
    return;
  }

  // 2. Collect all entry IDs that need scores
  const entryIds = new Set<number>();
  for (const match of matches) {
    for (const pick of match.matchPicks) {
      entryIds.add(pick.entryId);
    }
  }

  // 3. Fetch scores from FPL API
  console.log(`[updateBrackets] Fetching scores for ${entryIds.size} entries`);
  const scoresMap = await fetchScoresForEntries(Array.from(entryIds), event);

  // 4. Update pick records with final scores
  for (const [entryId, picks] of scoresMap) {
    await upsertPickAdmin(
      {
        entryId,
        event,
        points: picks.entry_history.points,
        totalPoints: picks.entry_history.total_points,
        rank: picks.entry_history.rank,
        activeChip: picks.active_chip ?? undefined,
        rawJson: JSON.stringify(picks),
        isFinal: true,
      },
      SYSTEM_AUTH_CLAIMS
    );
  }

  // 5. Build points lookup from scores
  const pointsMap = new Map<number, number>();
  for (const [entryId, picks] of scoresMap) {
    pointsMap.set(entryId, picks.entry_history.points);
  }

  // 6. Resolve each match
  const results: MatchResult[] = [];
  const completedMatchIds = new Set<number>();

  for (const match of matches) {
    const result = resolveMatch(match, pointsMap);
    if (result) {
      results.push(result);
      completedMatchIds.add(match.matchId);

      // Update match with winner
      await updateMatchWinner(round.tournamentId, match.matchId, result.winnerId);

      // Update loser's participant status
      if (result.loserId) {
        await updateParticipantStatus(
          round.tournamentId,
          result.loserId,
          'eliminated',
          round.roundNumber
        );
      }

      console.log(`[updateBrackets] Match ${match.matchId}: winner=${result.winnerId} (${result.winnerScore} pts)${result.decidedByTiebreaker ? ' [tiebreaker]' : ''}`);
    }
  }

  // 7. Check if round is complete
  const allMatchesComplete = matches.every(m => completedMatchIds.has(m.matchId));

  if (allMatchesComplete) {
    console.log(`[updateBrackets] Round ${round.roundNumber} complete`);
    await updateRoundStatus(round.tournamentId, round.roundNumber, 'complete');

    // 8. Check if this was the final round
    const isFinalRound = round.roundNumber === round.tournament.totalRounds;

    if (isFinalRound) {
      // Tournament complete!
      const finalMatch = matches[0]; // Final has only 1 match
      const finalResult = results.find(r => r.matchId === finalMatch.matchId);

      if (finalResult) {
        await updateTournamentStatus(round.tournamentId, 'completed', finalResult.winnerId);
        await updateParticipantStatus(round.tournamentId, finalResult.winnerId, 'champion');
        console.log(`[updateBrackets] Tournament ${round.tournamentId} complete! Winner: ${finalResult.winnerId}`);
      }
    } else {
      // 9. Advance winners to next round
      await advanceWinnersToNextRound(round, matches, results);

      // Activate next round
      await updateRoundStatus(round.tournamentId, round.roundNumber + 1, 'active');
    }
  }
}

/**
 * Create match_picks for winners advancing to next round
 */
async function advanceWinnersToNextRound(
  round: ActiveRound,
  matches: RoundMatch[],
  results: MatchResult[]
): Promise<void> {
  console.log(`[updateBrackets] Advancing winners to round ${round.roundNumber + 1}`);

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
          tournamentId: round.tournamentId,
          matchId: nextMatchId,
          entryId: winnerId,
          slot,
        },
        SYSTEM_AUTH_CLAIMS
      );
      console.log(`[updateBrackets] Created match_pick: match=${nextMatchId} entry=${winnerId} slot=${slot}`);
    }
  }
}

/**
 * Main scheduled function - runs every 2 hours
 */
export const updateBrackets = onSchedule(
  {
    schedule: 'every 2 hours',
    timeZone: 'Europe/London',
    retryCount: 3,
  },
  async () => {
    console.log('[updateBrackets] Starting bracket update check...');

    // 1. Check current gameweek status
    const currentGW = await fetchCurrentGameweek();

    if (!currentGW) {
      console.log('[updateBrackets] Could not fetch current gameweek');
      return;
    }

    console.log(`[updateBrackets] Current gameweek: ${currentGW.event}, finished: ${currentGW.finished}`);

    if (!currentGW.finished) {
      console.log('[updateBrackets] Gameweek not finished yet, skipping');
      return;
    }

    // 2. Find active rounds for this gameweek
    const activeRounds = await getActiveRoundsForEvent(currentGW.event);
    console.log(`[updateBrackets] Found ${activeRounds.length} active rounds for GW${currentGW.event}`);

    if (activeRounds.length === 0) {
      console.log('[updateBrackets] No active rounds to process');
      return;
    }

    // 3. Process each round
    for (const round of activeRounds) {
      try {
        await processRound(round, currentGW.event);
      } catch (error) {
        console.error(`[updateBrackets] Error processing round ${round.roundNumber} of ${round.tournamentId}:`, error);
        // Continue with other rounds
      }
    }

    console.log('[updateBrackets] Bracket update complete');
  }
);
