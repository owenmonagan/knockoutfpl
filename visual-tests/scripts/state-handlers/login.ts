import type { RouteHandlers, StateSetupResult } from '../types';
import { setupLoadingState, FIREBASE_PATTERNS } from '../network-mocks';

export const loginHandlers: RouteHandlers = {
  /**
   * Empty login form.
   */
  default: async (): Promise<StateSetupResult> => {
    return { url: '/login' };
  },

  /**
   * Login form with validation errors (invalid email format).
   */
  'validation-error': async ({ page }): Promise<StateSetupResult> => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Fill form with invalid email format
    await page.getByLabel(/email/i).fill('not-an-email');
    await page.getByLabel(/password/i).fill('x');

    // Submit to trigger validation
    await page.getByRole('button', { name: /log in/i }).click();

    // Wait for validation message to appear
    await page.waitForTimeout(500);

    return { waitForNetworkIdle: false };
  },

  /**
   * Login form showing authentication error (wrong credentials).
   */
  'auth-error': async ({ page }): Promise<StateSetupResult> => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Fill form with valid format but non-existent credentials
    await page.getByLabel(/email/i).fill('nonexistent@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword123');

    // Submit (will fail authentication)
    await page.getByRole('button', { name: /log in/i }).click();

    // Wait for error alert to appear
    try {
      await page.waitForSelector('[role="alert"]', { timeout: 10000 });
    } catch {
      // If no alert, wait a bit for any error message
      await page.waitForTimeout(1000);
    }

    return { waitForNetworkIdle: false };
  },

  /**
   * Login form in loading/submitting state.
   */
  loading: async ({ page }): Promise<StateSetupResult> => {
    // Setup network interception to never resolve auth requests
    await setupLoadingState(page, [FIREBASE_PATTERNS.auth]);

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Fill and submit to trigger loading state
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /log in/i }).click();

    // Wait for loading indicator to appear
    await page.waitForTimeout(500);

    return { waitForNetworkIdle: false };
  },
};
