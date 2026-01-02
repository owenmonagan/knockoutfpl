import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { fetchFPLBootstrapData, fetchFPLTeamInfo, fetchFPLGameweekScore as fetchScore } from './fplApi';

// Initialize Firebase Admin SDK
admin.initializeApp();

// ============================================================================
// FPL API Proxy Functions (HTTPS Callable)
// ============================================================================

/**
 * Get FPL bootstrap data (gameweeks, teams, players)
 * Proxies: /api/bootstrap-static/
 */
export const getFPLBootstrapData = onCall(async () => {
  try {
    const data = await fetchFPLBootstrapData();
    return { data };
  } catch (error: any) {
    console.error('getFPLBootstrapData error:', error);
    throw new HttpsError('internal', 'Failed to fetch FPL bootstrap data', { message: error.message });
  }
});

/**
 * Get FPL team info
 * Proxies: /api/entry/{teamId}/
 */
export const getFPLTeamInfo = onCall(async (request) => {
  const { teamId } = request.data;

  if (!teamId) {
    throw new HttpsError('invalid-argument', 'teamId is required');
  }

  try {
    const data = await fetchFPLTeamInfo(teamId);
    return { data };
  } catch (error: any) {
    console.error(`getFPLTeamInfo error for teamId ${teamId}:`, error);
    throw new HttpsError('internal', 'Failed to fetch FPL team info', { message: error.message });
  }
});

/**
 * Get FPL gameweek score
 * Proxies: /api/entry/{teamId}/event/{gameweek}/picks/
 */
export const getFPLGameweekScore = onCall(async (request) => {
  const { teamId, gameweek } = request.data;

  if (!teamId || !gameweek) {
    throw new HttpsError('invalid-argument', 'teamId and gameweek are required');
  }

  try {
    const data = await fetchScore(teamId, gameweek);
    return { data };
  } catch (error: any) {
    console.error(`getFPLGameweekScore error for teamId ${teamId}, gameweek ${gameweek}:`, error);
    throw new HttpsError('internal', 'Failed to fetch FPL gameweek score', { message: error.message });
  }
});

// Export proxy function
export { fplProxy } from './proxy';

// Export tournament creation function
export { createTournament } from './createTournament';

// Export scheduled bracket update function
export { updateBrackets } from './updateBrackets';

// Export scheduled test tournament creator (dev only)
export { createTestTournaments } from './createTestTournaments';

// Export scheduled stuck tournament checker
export { checkStuckTournaments } from './checkStuckTournaments';

// Export one-time BYE migration function
export { migrateByes } from './migrateByes';

// Export debug function for BYE matches
export { debugByes } from './debugByes';

// Export fix function for specific tournament BYEs
export { fixTournamentByes } from './fixTournamentByes';

// Export fix function for ALL tournament BYEs
export { fixAllTournamentByes } from './fixAllTournamentByes';

// Export eager refresh function for tournament viewing
export { refreshTournament } from './refreshTournament';

// Export scoped refresh function for visible matches (pagination)
export { refreshVisibleMatches } from './refreshVisibleMatches';

// Export scheduled event finalization checker
export { checkEventStatus } from './checkEventStatus';

// Export scheduled verdict email queue function
export { queueVerdicts } from './queueVerdicts';

// Export Cloud Task handler for background tournament import
export { processTournamentImport } from './processTournamentImport';
