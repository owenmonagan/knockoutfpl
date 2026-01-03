import type { RouteHandlers, StateSetupResult } from '../types';
import { loginUser } from '../../../e2e/helpers/auth-helpers';
import { TEST_USERS } from '../../../e2e/helpers/test-users';
import { setupLoadingState, setupEmptyLeagues, FIREBASE_PATTERNS, FPL_PATTERNS } from '../network-mocks';

export const leaguesHandlers: RouteHandlers = {
  /**
   * Leagues page with no leagues (empty state).
   */
  empty: async ({ page }): Promise<StateSetupResult> => {
    // Setup empty leagues response
    await setupEmptyLeagues(page);

    // Login as standard user
    await loginUser(page, TEST_USERS.standard);

    return { url: '/leagues' };
  },

  /**
   * Leagues page with leagues to display.
   */
  'with-leagues': async ({ page }): Promise<StateSetupResult> => {
    // Login as standard user (has FPL leagues)
    await loginUser(page, TEST_USERS.standard);

    return {
      url: '/leagues',
      waitForNetworkIdle: true,
      additionalWaitMs: 500, // Extra time for league cards to render
    };
  },

  /**
   * Leagues page in loading state.
   */
  loading: async ({ page }): Promise<StateSetupResult> => {
    // Login first
    await loginUser(page, TEST_USERS.standard);

    // Setup loading state for both FPL and DataConnect requests
    await setupLoadingState(page, [FPL_PATTERNS.all, FIREBASE_PATTERNS.dataConnect]);

    return { url: '/leagues', waitForNetworkIdle: false };
  },
};
