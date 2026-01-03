import type { RouteHandlers, StateSetupResult } from '../types';
import { loginUser } from '../../../e2e/helpers/auth-helpers';
import { TEST_USERS } from '../../../e2e/helpers/test-users';
import { setupLoadingState, setupTeamNotFound, FPL_PATTERNS } from '../network-mocks';

export const connectHandlers: RouteHandlers = {
  /**
   * Empty FPL team connection form.
   */
  default: async ({ page }): Promise<StateSetupResult> => {
    // Need to login first (connect page requires auth)
    // Use a user without FPL team to stay on connect page
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.getByLabel(/email/i).fill(TEST_USERS.standard.email);
    await page.getByLabel(/password/i).fill(TEST_USERS.standard.password);
    await page.getByRole('button', { name: /log in/i }).click();

    // Navigate to connect page
    return { url: '/connect' };
  },

  /**
   * Connect form with validation error (invalid team ID format).
   */
  'validation-error': async ({ page }): Promise<StateSetupResult> => {
    // Login first
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.getByLabel(/email/i).fill(TEST_USERS.standard.email);
    await page.getByLabel(/password/i).fill(TEST_USERS.standard.password);
    await page.getByRole('button', { name: /log in/i }).click();

    await page.goto('/connect');
    await page.waitForLoadState('networkidle');

    // Fill with invalid team ID
    const teamIdInput = page.getByLabel(/team id|fpl id/i);
    if (await teamIdInput.isVisible()) {
      await teamIdInput.fill('not-a-number');
    } else {
      // Try placeholder text
      await page.getByPlaceholder(/team id|enter.*id/i).fill('not-a-number');
    }

    // Submit to trigger validation
    await page.getByRole('button', { name: /connect|link|submit/i }).click();

    await page.waitForTimeout(500);

    return { waitForNetworkIdle: false };
  },

  /**
   * Connect form showing team not found error.
   */
  'invalid-team': async ({ page }): Promise<StateSetupResult> => {
    // Setup FPL API to return 404
    await setupTeamNotFound(page);

    // Login first
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.getByLabel(/email/i).fill(TEST_USERS.standard.email);
    await page.getByLabel(/password/i).fill(TEST_USERS.standard.password);
    await page.getByRole('button', { name: /log in/i }).click();

    await page.goto('/connect');
    await page.waitForLoadState('networkidle');

    // Fill with a team ID that won't be found
    const teamIdInput = page.getByLabel(/team id|fpl id/i);
    if (await teamIdInput.isVisible()) {
      await teamIdInput.fill('99999999');
    } else {
      await page.getByPlaceholder(/team id|enter.*id/i).fill('99999999');
    }

    // Submit to trigger error
    await page.getByRole('button', { name: /connect|link|submit/i }).click();

    // Wait for error message
    try {
      await page.waitForSelector('[role="alert"], .text-destructive', { timeout: 5000 });
    } catch {
      await page.waitForTimeout(1000);
    }

    return { waitForNetworkIdle: false };
  },

  /**
   * Connect form in loading state.
   */
  loading: async ({ page }): Promise<StateSetupResult> => {
    // Setup FPL API to never respond
    await setupLoadingState(page, [FPL_PATTERNS.entry]);

    // Login first
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.getByLabel(/email/i).fill(TEST_USERS.standard.email);
    await page.getByLabel(/password/i).fill(TEST_USERS.standard.password);
    await page.getByRole('button', { name: /log in/i }).click();

    await page.goto('/connect');
    await page.waitForLoadState('networkidle');

    // Fill with valid team ID
    const teamIdInput = page.getByLabel(/team id|fpl id/i);
    if (await teamIdInput.isVisible()) {
      await teamIdInput.fill('158256');
    } else {
      await page.getByPlaceholder(/team id|enter.*id/i).fill('158256');
    }

    // Submit to trigger loading
    await page.getByRole('button', { name: /connect|link|submit/i }).click();

    await page.waitForTimeout(500);

    return { waitForNetworkIdle: false };
  },
};
