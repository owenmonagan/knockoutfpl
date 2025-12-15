import { test, expect } from '@playwright/test';

/**
 * Dashboard E2E Tests
 *
 * Tags:
 * @smoke - Critical smoke tests that should always pass
 * @dashboard - Dashboard-related tests
 * @critical - Critical user flows
 */

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Set up authenticated user session when Firebase emulators are configured
  });

  test('should display dashboard placeholder @smoke @dashboard', async ({ page }) => {
    // TODO: This test will need authentication setup
    // For now, just verify the dashboard route exists
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Dashboard is protected, so this will likely redirect
    // Once auth is set up, verify dashboard content loads
    await expect(page.locator('body')).toBeVisible();
  });

  // TODO: Add more dashboard tests after Firebase emulators are set up:
  // - should load user's FPL data
  // - should display "Your Leagues" section
  // - should show league cards for connected leagues
  // - should navigate to league page when card is clicked
  // - should display tournament bracket for active tournaments
});
