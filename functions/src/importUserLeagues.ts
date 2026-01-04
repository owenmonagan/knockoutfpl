// functions/src/importUserLeagues.ts
// Callable function to import a user's FPL leagues when they link their FPL account
//
// Behavior:
// - Fetches user's mini leagues from FPL API
// - Skips system leagues (id < 336)
// - Skips already-imported leagues
// - For small leagues (≤48 entries): imports synchronously via refreshLeague()
// - For large leagues (>48 entries): skips (imported on tournament creation)

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getCurrentSeason } from './createTournament';
import {
  getLeagueRefreshStatus,
  isSmallLeague,
  refreshLeague,
} from './leagueRefresh';

const FPL_API_BASE = 'https://fantasy.premierleague.com/api';

// Minimum league ID for custom leagues (below this are system leagues)
const MIN_CUSTOM_LEAGUE_ID = 336;

/**
 * Mini league info from FPL entry endpoint
 */
interface FPLMiniLeague {
  id: number;
  name: string;
  entry_rank: number;
  entry_last_rank: number;
}

/**
 * Response from FPL entry endpoint (subset of fields we need)
 */
interface FPLEntryResponse {
  id: number;
  name: string;
  leagues: {
    classic: FPLMiniLeague[];
  };
}

/**
 * Result of importing user leagues
 */
interface ImportUserLeaguesResult {
  leaguesFound: number;
  leaguesImported: number;
  leaguesSkipped: {
    system: number;
    alreadyImported: number;
    tooLarge: number;
  };
}

/**
 * Fetches a user's mini leagues from the FPL API
 *
 * @param entryId - FPL team/entry ID
 * @returns Array of mini leagues the user belongs to
 */
async function fetchUserMiniLeagues(entryId: number): Promise<FPLMiniLeague[]> {
  const url = `${FPL_API_BASE}/entry/${entryId}/`;
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new HttpsError('not-found', `FPL entry ${entryId} not found`);
    }
    throw new HttpsError('internal', `FPL API error: ${response.status}`);
  }

  const data: FPLEntryResponse = await response.json();
  return data.leagues?.classic || [];
}

/**
 * Callable function to import a user's FPL leagues.
 *
 * Called when a user links their FPL account. Imports small leagues
 * synchronously so they're immediately available for tournament creation.
 * Large leagues are skipped and will be imported when needed for tournament creation.
 *
 * @param request.data.entryId - FPL team/entry ID
 * @returns Import summary with counts
 */
export const importUserLeagues = onCall<{ entryId: number }, Promise<ImportUserLeaguesResult>>(
  {
    region: 'europe-west1',
    timeoutSeconds: 120, // Small leagues should import quickly, but allow time for multiple
  },
  async (request) => {
    // Require authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be logged in to import leagues');
    }

    const { entryId } = request.data;

    if (!entryId || typeof entryId !== 'number') {
      throw new HttpsError('invalid-argument', 'entryId is required and must be a number');
    }

    const season = getCurrentSeason();

    console.log(`[importUserLeagues] Starting import for entry ${entryId}, season ${season}`);

    // Fetch user's leagues from FPL API
    const leagues = await fetchUserMiniLeagues(entryId);

    console.log(`[importUserLeagues] Found ${leagues.length} leagues for entry ${entryId}`);

    const result: ImportUserLeaguesResult = {
      leaguesFound: leagues.length,
      leaguesImported: 0,
      leaguesSkipped: {
        system: 0,
        alreadyImported: 0,
        tooLarge: 0,
      },
    };

    for (const league of leagues) {
      // Skip system leagues (global leagues, cup leagues, etc.)
      if (league.id < MIN_CUSTOM_LEAGUE_ID) {
        result.leaguesSkipped.system++;
        continue;
      }

      // Check if league is already imported
      const status = await getLeagueRefreshStatus(league.id, season);
      if (status?.lastRefreshId) {
        console.log(`[importUserLeagues] League ${league.id} already imported, skipping`);
        result.leaguesSkipped.alreadyImported++;
        continue;
      }

      // Check if league is small enough for synchronous import
      try {
        const small = await isSmallLeague(league.id);

        if (small) {
          console.log(`[importUserLeagues] Importing small league ${league.id} (${league.name})`);
          await refreshLeague(league.id, season);
          result.leaguesImported++;
        } else {
          // Large leagues are skipped - they'll be imported on tournament creation
          console.log(`[importUserLeagues] Skipping large league ${league.id} (${league.name})`);
          result.leaguesSkipped.tooLarge++;
        }
      } catch (error) {
        // Log error but continue with other leagues
        console.error(`[importUserLeagues] Error processing league ${league.id}:`, error);
        // Don't throw - we want to continue processing other leagues
      }
    }

    console.log(`[importUserLeagues] Completed import for entry ${entryId}:`, result);

    return result;
  }
);
