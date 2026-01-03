import type { RouteHandlers, StateSetupResult } from '../types';
import { setupLoadingState, FIREBASE_PATTERNS } from '../network-mocks';

export const signupHandlers: RouteHandlers = {
  /**
   * Empty signup form.
   */
  default: async (): Promise<StateSetupResult> => {
    return { url: '/signup' };
  },

  /**
   * Signup form with validation errors.
   */
  'validation-error': async ({ page }): Promise<StateSetupResult> => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');

    // Fill form with invalid data
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByLabel(/^password$/i).fill('x'); // Too short
    await page.getByLabel(/confirm password/i).fill('y'); // Doesn't match

    // Submit to trigger validation
    await page.getByRole('button', { name: /sign up|create account/i }).click();

    // Wait for validation messages
    await page.waitForTimeout(500);

    return { waitForNetworkIdle: false };
  },

  /**
   * Signup form in loading/submitting state.
   */
  loading: async ({ page }): Promise<StateSetupResult> => {
    // Setup network interception to never resolve auth requests
    await setupLoadingState(page, [FIREBASE_PATTERNS.auth]);

    await page.goto('/signup');
    await page.waitForLoadState('networkidle');

    // Fill valid form data
    await page.getByLabel(/email/i).fill('newuser@example.com');
    await page.getByLabel(/^password$/i).fill('ValidPass123!');
    await page.getByLabel(/confirm password/i).fill('ValidPass123!');

    // Try to find and fill display name if it exists
    const displayNameInput = page.getByLabel(/display name|name/i);
    if (await displayNameInput.isVisible()) {
      await displayNameInput.fill('Test User');
    }

    // Submit to trigger loading state
    await page.getByRole('button', { name: /sign up|create account/i }).click();

    // Wait for loading indicator
    await page.waitForTimeout(500);

    return { waitForNetworkIdle: false };
  },
};
