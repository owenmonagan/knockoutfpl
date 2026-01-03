import type { RouteHandlers, StateSetupResult } from '../types';
import { loginUser } from '../../../e2e/helpers/auth-helpers';
import { TEST_USERS } from '../../../e2e/helpers/test-users';

export const landingHandlers: RouteHandlers = {
  /**
   * Default landing page for unauthenticated users.
   */
  default: async (): Promise<StateSetupResult> => {
    return { url: '/' };
  },

  /**
   * Landing page when user is logged in (may show different CTA).
   */
  authenticated: async ({ page }): Promise<StateSetupResult> => {
    // Login first
    await loginUser(page, TEST_USERS.standard);

    return { url: '/' };
  },
};
