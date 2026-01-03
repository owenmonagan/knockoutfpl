import type { RouteHandlers, StateSetupResult } from '../types';
import { loginUser } from '../../../e2e/helpers/auth-helpers';
import { TEST_USERS } from '../../../e2e/helpers/test-users';
import { setupLoadingState, FIREBASE_PATTERNS } from '../network-mocks';

export const profileHandlers: RouteHandlers = {
  /**
   * Profile page in view mode.
   */
  default: async ({ page }): Promise<StateSetupResult> => {
    // Login as standard user
    await loginUser(page, TEST_USERS.standard);

    return {
      url: '/profile',
      waitForNetworkIdle: true,
    };
  },

  /**
   * Profile page in edit mode.
   */
  editing: async ({ page }): Promise<StateSetupResult> => {
    // Login as standard user
    await loginUser(page, TEST_USERS.standard);

    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Click edit button to enter edit mode
    const editButton = page.getByRole('button', { name: /edit/i });
    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForTimeout(300); // Wait for edit mode transition
    }

    return { waitForNetworkIdle: false };
  },

  /**
   * Profile page in loading state.
   */
  loading: async ({ page }): Promise<StateSetupResult> => {
    // Login first
    await loginUser(page, TEST_USERS.standard);

    // Setup loading state for DataConnect requests
    await setupLoadingState(page, [FIREBASE_PATTERNS.dataConnect]);

    return { url: '/profile', waitForNetworkIdle: false };
  },
};
