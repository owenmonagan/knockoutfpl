import type { RouteHandlers, StateSetupResult } from '../types';
import { setupLoadingState, setupAuthError, FIREBASE_PATTERNS } from '../network-mocks';

export const forgotPasswordHandlers: RouteHandlers = {
  /**
   * Empty forgot password form.
   */
  default: async (): Promise<StateSetupResult> => {
    return { url: '/forgot-password' };
  },

  /**
   * Forgot password success state (email sent confirmation).
   */
  success: async ({ page }): Promise<StateSetupResult> => {
    await page.goto('/forgot-password');
    await page.waitForLoadState('networkidle');

    // Fill form with valid email
    await page.getByLabel(/email/i).fill('existing@example.com');

    // Submit - the form should show success message
    // Note: In emulator mode, this may actually send the reset email
    await page.getByRole('button', { name: /reset|send|submit/i }).click();

    // Wait for success message
    try {
      await page.waitForSelector('[role="alert"], .text-green, [class*="success"]', {
        timeout: 5000,
      });
    } catch {
      // If no success indicator found, just wait
      await page.waitForTimeout(2000);
    }

    return { waitForNetworkIdle: false };
  },

  /**
   * Forgot password error state (email not found or other error).
   */
  error: async ({ page }): Promise<StateSetupResult> => {
    // Setup auth to return error
    await setupAuthError(page, 'auth/user-not-found', 'No user found with this email');

    await page.goto('/forgot-password');
    await page.waitForLoadState('networkidle');

    // Fill form with email that will fail
    await page.getByLabel(/email/i).fill('nonexistent@example.com');

    // Submit to trigger error
    await page.getByRole('button', { name: /reset|send|submit/i }).click();

    // Wait for error message
    try {
      await page.waitForSelector('[role="alert"], .text-destructive, [class*="error"]', {
        timeout: 5000,
      });
    } catch {
      await page.waitForTimeout(1000);
    }

    return { waitForNetworkIdle: false };
  },
};
