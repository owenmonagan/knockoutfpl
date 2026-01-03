import type { RouteHandlers, StateSetupResult } from '../types';
import { loginUser } from '../../../e2e/helpers/auth-helpers';
import { TEST_USERS } from '../../../e2e/helpers/test-users';
import { setupLoadingState, setupEmptyTournaments, FIREBASE_PATTERNS } from '../network-mocks';

export const dashboardHandlers: RouteHandlers = {
  /**
   * Dashboard with no tournaments (empty state).
   */
  empty: async ({ page }): Promise<StateSetupResult> => {
    // Setup empty tournament response
    await setupEmptyTournaments(page);

    // Login as standard user
    await loginUser(page, TEST_USERS.standard);

    return { url: '/dashboard' };
  },

  /**
   * Dashboard with active tournaments.
   */
  'with-tournaments': async ({ page }): Promise<StateSetupResult> => {
    // Login as standard user (has seeded tournaments)
    await loginUser(page, TEST_USERS.standard);

    return {
      url: '/dashboard',
      waitForNetworkIdle: true,
      additionalWaitMs: 500, // Extra time for tournament cards to render
    };
  },

  /**
   * Dashboard showing upcoming matches.
   */
  'with-matches': async ({ page }): Promise<StateSetupResult> => {
    // Login as standard user (has active matches in seeded data)
    await loginUser(page, TEST_USERS.standard);

    return {
      url: '/dashboard',
      waitForNetworkIdle: true,
      waitForSelectors: ['[data-testid="match-card"], [class*="match"], [class*="Match"]'],
      additionalWaitMs: 500,
    };
  },

  /**
   * Dashboard in loading state.
   */
  loading: async ({ page }): Promise<StateSetupResult> => {
    // Login first
    await loginUser(page, TEST_USERS.standard);

    // Setup loading state for DataConnect requests
    await setupLoadingState(page, [FIREBASE_PATTERNS.dataConnect]);

    return { url: '/dashboard', waitForNetworkIdle: false };
  },
};
