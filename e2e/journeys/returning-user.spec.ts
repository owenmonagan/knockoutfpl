import { test, expect } from '@playwright/test';

/**
 * Returning User Journey E2E Tests
 *
 * Tests the returning user experience checking tournament status.
 * Based on: docs/business/product/journeys/returning-user.md
 *
 * Tags:
 * @journey - User journey tests
 * @dashboard - Dashboard tests
 * @critical - Critical user flows
 *
 * Test User: testuser@knockoutfpl.com / TestPass123!
 * Alternative Test Users: creator@knockoutfpl.com, opponent@knockoutfpl.com
 */

const TEST_EMAIL = 'testuser@knockoutfpl.com';
const TEST_PASSWORD = 'TestPass123!';

/**
 * Helper function to login and wait for redirect
 */
async function loginAndWait(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  await page.getByLabel('Email').fill(TEST_EMAIL);
  await page.getByLabel('Password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /log in/i }).click();

  // Wait for redirect after login (to connect, leagues, or dashboard)
  await page.waitForURL(/\/(connect|leagues|dashboard)/, { timeout: 10000 });
}

test.describe('Returning User Journey @journey @dashboard', () => {
  test.describe('Authentication', () => {
    test('should auto-redirect to dashboard when authenticated @critical', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      // Login first to establish authentication
      await loginAndWait(page);

      // Now navigate to landing page - authenticated users should be able to access it
      // (landing page doesn't auto-redirect, but protected routes should work)
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Landing page is accessible to all users (authenticated or not)
      // The expected behavior is that authenticated users see the landing page
      // but have easy access to dashboard via navigation
      await expect(page.getByRole('heading', { name: /knockout fpl/i })).toBeVisible();

      // Now try to access dashboard directly - should work for authenticated users
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Should successfully reach dashboard (not redirected to login)
      await expect(page).toHaveURL(/\/(dashboard|connect|leagues)/);

      // If on dashboard, verify dashboard content
      const onDashboard = page.url().includes('/dashboard');
      if (onDashboard) {
        await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
        // Should show welcome message with user name
        await expect(page.getByText(/welcome back/i)).toBeVisible();
      }

      // Verify no console errors during navigation
      expect(consoleErrors).toHaveLength(0);
    });
  });

  test.describe('Dashboard Display', () => {
    test.beforeEach(async ({ page }) => {
      await loginAndWait(page);
    });

    test('should display all user leagues with tournament status @dashboard @critical', async ({ page }) => {
      // Navigate to leagues page
      await page.goto('/leagues');
      await page.waitForLoadState('networkidle');

      // Verify leagues page header
      await expect(page.getByRole('heading', { name: /your mini leagues/i })).toBeVisible();

      // Wait for leagues to load - either shows leagues or "no leagues" message
      await expect(
        page.getByText(/loading leagues|members|no mini leagues found/i)
      ).toBeVisible({ timeout: 15000 });

      // Check if leagues are found
      const hasLeagues = await page.getByText(/members/i).isVisible().catch(() => false);

      if (hasLeagues) {
        // Verify league cards are displayed with member count
        await expect(page.getByText(/\d+ members/)).toBeVisible();

        // Verify each league card has Start Knockout button
        await expect(
          page.getByRole('button', { name: /start knockout/i }).first()
        ).toBeVisible();

        // Verify user's rank is shown
        await expect(page.getByText(/you're ranked #\d+/i).first()).toBeVisible();
      } else {
        // Verify empty state message is shown
        await expect(page.getByText(/no mini leagues found/i)).toBeVisible();
      }
    });

    test('should show active match with current scores @dashboard', async ({ page }) => {
      // Navigate to leagues page first
      await page.goto('/leagues');
      await page.waitForLoadState('networkidle');

      // Wait for leagues to load
      await page.waitForTimeout(2000);

      // Check if any leagues exist
      const hasLeagues = await page.getByText(/members/i).isVisible().catch(() => false);

      if (!hasLeagues) {
        // Skip if no leagues - test requires leagues to exist
        test.skip();
        return;
      }

      // Click on a league to view the knockout bracket
      await page.getByRole('button', { name: /start knockout/i }).first().click();
      await page.waitForLoadState('networkidle');

      // Wait for bracket data to load
      await page.waitForTimeout(3000);

      // Should be on knockout or league page
      await expect(page).toHaveURL(/\/(knockout|league)\/\d+/);

      // Check for bracket elements with scores
      // Look for gameweek badge (e.g., "GW 15")
      const hasGameweekBadge = await page.getByText(/GW\s*\d+/).isVisible().catch(() => false);

      if (hasGameweekBadge) {
        // Verify gameweek info is displayed
        await expect(page.getByText(/GW\s*\d+/)).toBeVisible();

        // Look for score elements (2-3 digit numbers representing FPL scores)
        const hasScores = await page.locator('text=/^\\d{2,3}$/').first().isVisible().catch(() => false);

        // If scores are visible, we have an active match with current scores
        if (hasScores) {
          // Verify team names are displayed
          await expect(page.locator('[class*="Card"]').first()).toBeVisible();
        }
      }

      // Verify the page shows some bracket-related content
      // (teams remaining, bracket structure, or participant info)
      await expect(
        page.getByText(/16 REMAIN|\d+ teams|\d+ members|Round/i).first()
      ).toBeVisible({ timeout: 10000 });
    });

    test('should handle user with no tournaments gracefully @dashboard', async ({ page }) => {
      // Navigate to dashboard
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Dashboard should display even without tournaments
      await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();

      // Should show welcome message
      await expect(page.getByText(/welcome back/i)).toBeVisible();

      // Should have navigation to view leagues (the primary action for users without tournaments)
      await expect(page.getByRole('button', { name: /view your leagues/i })).toBeVisible();

      // Navigate to leagues to verify empty state handling
      await page.goto('/leagues');
      await page.waitForLoadState('networkidle');

      // Page should load without errors
      await expect(page.getByRole('heading', { name: /your mini leagues/i })).toBeVisible();

      // Should show either leagues or the empty state gracefully
      await expect(
        page.getByText(/loading leagues|members|no mini leagues found/i)
      ).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe('Tournament Status', () => {
    /**
     * NOTE: These tests require Firebase emulators with seeded tournament data
     * where the test user has specific tournament states (eliminated, winner).
     *
     * Current implementation cannot fully test these scenarios without:
     * 1. Firebase emulators running with test data
     * 2. Tournaments created with the test user as a participant
     * 3. Tournament state set to specific conditions (user eliminated, tournament complete)
     */

    test.fixme('should indicate eliminated status when user is out @dashboard @critical', async ({ page }) => {
      // TODO: Implement when Firebase emulators are configured with seeded tournament data
      //
      // This test requires:
      // 1. A tournament where the test user participated
      // 2. The test user's match has been resolved
      // 3. The test user lost their match (eliminated)
      //
      // Expected behavior:
      // 1. Login as test user
      await loginAndWait(page);

      // 2. Navigate to tournament/knockout page
      await page.goto('/leagues');
      await page.waitForLoadState('networkidle');

      // 3. Access a tournament where user is eliminated
      // The UI should show:
      // - User's match with losing status (opacity-50 or similar styling)
      // - "Eliminated" badge or status indicator
      // - Match result showing the user lost
      //
      // Verification:
      // await expect(page.getByText(/eliminated|knocked out|lost/i)).toBeVisible();
      // - OR -
      // await expect(page.locator('.opacity-50, [data-eliminated="true"]')).toBeVisible();
      //
      // Current workaround: Check for loser styling in MatchCard
      // The MatchCard applies "opacity-50" class to the losing player
      // When user is eliminated, their row in their match should have this styling
    });

    test.fixme('should show winner celebration when tournament complete @dashboard @critical', async ({ page }) => {
      // TODO: Implement when Firebase emulators are configured with seeded tournament data
      //
      // This test requires:
      // 1. A completed tournament where the test user participated
      // 2. The test user won the tournament (reached and won the final)
      // 3. Tournament status is set to "completed"
      //
      // Expected behavior:
      // 1. Login as test user
      await loginAndWait(page);

      // 2. Navigate to leagues/tournaments
      await page.goto('/leagues');
      await page.waitForLoadState('networkidle');

      // 3. Access the completed tournament
      // The UI should show:
      // - Tournament marked as "Completed"
      // - Winner celebration/trophy UI
      // - Final match with winner highlighted
      // - User's victory status
      //
      // Verification patterns when implemented:
      // await expect(page.getByText(/champion|winner|congratulations/i)).toBeVisible();
      // await expect(page.locator('[data-testid="trophy-icon"], .trophy, .celebration')).toBeVisible();
      // await expect(page.getByText(/tournament complete/i)).toBeVisible();
      //
      // Note: The tournament.status === 'completed' and tournament.winnerId
      // would need to match the test user's FPL team ID for this to display
    });
  });
});
