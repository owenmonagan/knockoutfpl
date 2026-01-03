import type { RouteHandlers, StateSetupResult } from '../types';
import { setupLoadingState, FIREBASE_PATTERNS } from '../network-mocks';

// Use a known test league ID from seeded data
const TEST_LEAGUE_ID = '634129';

export const leagueHandlers: RouteHandlers = {
  /**
   * Normal league view with bracket.
   */
  default: async (): Promise<StateSetupResult> => {
    return {
      url: `/league/${TEST_LEAGUE_ID}`,
      waitForNetworkIdle: true,
      additionalWaitMs: 500, // Extra time for bracket to render
    };
  },

  /**
   * League not found (invalid league ID).
   */
  'not-found': async (): Promise<StateSetupResult> => {
    return {
      url: '/league/99999999',
      waitForNetworkIdle: true,
      additionalWaitMs: 500,
    };
  },

  /**
   * League page in loading state.
   */
  loading: async ({ page }): Promise<StateSetupResult> => {
    // Setup loading state for DataConnect requests
    await setupLoadingState(page, [FIREBASE_PATTERNS.dataConnect]);

    return { url: `/league/${TEST_LEAGUE_ID}`, waitForNetworkIdle: false };
  },
};
