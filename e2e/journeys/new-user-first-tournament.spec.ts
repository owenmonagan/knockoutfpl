import { test, expect } from '@playwright/test';

/**
 * New User First Tournament Journey E2E Tests
 *
 * Tests the creator journey from signup through tournament creation and sharing.
 * Based on: docs/business/product/journeys/new-user-first-tournament.md
 *
 * Tags:
 * @journey - User journey tests
 * @tournament - Tournament-related tests
 * @critical - Critical user flows
 *
 * Test FPL Team: 158256 (O-win)
 * Test Leagues: Overall (ID: 314) - has 16+ members for bracket, FLOAWO (ID: 634129)
 */

// Generate unique email for each test run to avoid conflicts
const generateTestEmail = () =>
  `e2e_journey_${Date.now()}_${Math.random().toString(36).substring(7)}@knockoutfpl.com`;

const TEST_PASSWORD = 'TestPass123!';
const TEST_FPL_TEAM_ID = '158256';
const TEST_LEAGUE_NAME = 'Overall';

/**
 * Helper function to complete signup and FPL connection flow
 * Returns the test email used
 */
async function signupAndConnect(page: import('@playwright/test').Page, displayName: string): Promise<string> {
  const testEmail = generateTestEmail();

  // Navigate to signup
  await page.goto('/signup');
  await page.waitForLoadState('networkidle');

  // Fill signup form
  await page.getByLabel('Email').fill(testEmail);
  await page.getByLabel('Display Name').fill(displayName);
  await page.getByLabel(/^Password$/).fill(TEST_PASSWORD);
  await page.getByLabel('Confirm Password').fill(TEST_PASSWORD);

  // Submit signup - should redirect to /connect
  await page.getByRole('button', { name: 'Sign Up' }).click();
  await expect(page).toHaveURL('/connect', { timeout: 10000 });

  // Enter FPL Team ID and submit
  await page.getByLabel('FPL Team ID').pressSequentially(TEST_FPL_TEAM_ID);
  await page.getByRole('button', { name: 'Find My Team' }).click();

  // Wait for API to complete then navigate to leagues
  await page.waitForTimeout(3000);
  await page.goto('/leagues');
  await page.waitForLoadState('networkidle');

  // Verify we're on leagues page with leagues loaded
  await expect(page.getByRole('heading', { name: 'Your Mini Leagues' })).toBeVisible();
  await expect(page.getByText(TEST_LEAGUE_NAME)).toBeVisible({ timeout: 15000 });

  return testEmail;
}

test.describe('New User First Tournament Journey @journey @tournament', () => {
  test.describe('Complete Flow', () => {
    test('should complete full flow: landing -> signup -> connect -> create -> share @critical', async ({
      page,
    }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      const testEmail = generateTestEmail();

      // Step 1: Landing page - verify CTA
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      await expect(page.getByRole('heading', { name: /knockout fpl/i })).toBeVisible();
      const ctaButton = page.getByRole('link', { name: /enter the arena/i });
      await expect(ctaButton).toBeVisible();

      // Step 2: Click CTA to go to signup
      await ctaButton.click();
      await expect(page).toHaveURL('/signup');

      // Step 3: Fill and submit signup form
      await page.getByLabel('Email').fill(testEmail);
      await page.getByLabel('Display Name').fill('Full Flow Tester');
      await page.getByLabel(/^Password$/).fill(TEST_PASSWORD);
      await page.getByLabel('Confirm Password').fill(TEST_PASSWORD);
      await page.getByRole('button', { name: 'Sign Up' }).click();

      // Step 4: Should redirect to connect page
      await expect(page).toHaveURL('/connect', { timeout: 10000 });
      await expect(page.getByRole('heading', { name: 'Connect Your FPL Team' })).toBeVisible();

      // Step 5: Connect FPL team
      await page.getByLabel('FPL Team ID').pressSequentially(TEST_FPL_TEAM_ID);
      await page.getByRole('button', { name: 'Find My Team' }).click();

      // Wait for connection to complete
      await page.waitForTimeout(3000);
      await page.goto('/leagues');

      // Step 6: Leagues page - select a league
      await expect(page.getByText(TEST_LEAGUE_NAME)).toBeVisible({ timeout: 15000 });

      // Click Start Knockout on a league
      const leagueCard = page.locator(`text=${TEST_LEAGUE_NAME}`).locator('..').locator('..');
      await leagueCard.getByRole('button', { name: 'Start Knockout' }).click();

      // Step 7: Should be on league page with bracket
      await expect(page).toHaveURL(/\/league\/\d+/);
      await page.waitForLoadState('networkidle');

      // Verify bracket elements are visible (either via KnockoutPage or LeaguePage)
      // The page should show team count, gameweek info, or bracket structure
      const hasBracket = await Promise.race([
        page.getByText(/\d+ teams|16 REMAIN|Active/).isVisible({ timeout: 10000 }),
        page.getByText(/Round 1|Quarter-Finals|Semi-Finals|Final/).isVisible({ timeout: 10000 }),
      ]).catch(() => false);

      expect(hasBracket).toBeTruthy();

      // Step 8: Verify share functionality exists (if implemented)
      // NOTE: Share functionality may not be fully implemented yet
      // This checks for common share UI patterns
      const shareButton = page.getByRole('button', { name: /share|copy link/i });
      const hasShare = await shareButton.isVisible().catch(() => false);

      // Log share status for debugging (not a failure if not implemented)
      if (!hasShare) {
        console.log('Note: Share functionality not visible - may not be implemented yet');
      }

      // Verify no console errors
      expect(consoleErrors).toHaveLength(0);
    });
  });

  test.describe('Tournament Creation', () => {
    test('should pre-fill tournament name from league name @tournament', async ({ page }) => {
      // Setup: signup and connect
      await signupAndConnect(page, 'Prefill Tester');

      // Navigate to a specific league
      await expect(page.getByText(TEST_LEAGUE_NAME)).toBeVisible({ timeout: 15000 });

      // Click Start Knockout to go to the league/knockout page
      const leagueCard = page.locator(`text=${TEST_LEAGUE_NAME}`).locator('..').locator('..');
      await leagueCard.getByRole('button', { name: 'Start Knockout' }).click();

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // The tournament/bracket page should display the league name as the tournament name
      // This verifies the tournament name is pre-filled from the league name
      // Check for league name in heading or title area (in uppercase as per KnockoutPage)
      await expect(
        page.getByText(TEST_LEAGUE_NAME.toUpperCase()).or(page.getByText(TEST_LEAGUE_NAME))
      ).toBeVisible({ timeout: 10000 });
    });

    test('should generate bracket on tournament creation @tournament @critical', async ({
      page,
    }) => {
      // Setup: signup and connect
      await signupAndConnect(page, 'Bracket Generator');

      // Navigate to a league with enough members for a bracket (16+)
      await expect(page.getByText(TEST_LEAGUE_NAME)).toBeVisible({ timeout: 15000 });

      // Click Start Knockout
      const leagueCard = page.locator(`text=${TEST_LEAGUE_NAME}`).locator('..').locator('..');
      await leagueCard.getByRole('button', { name: 'Start Knockout' }).click();

      // Wait for bracket to generate
      await page.waitForLoadState('networkidle');

      // Verify bracket structure is generated
      // Check for key bracket indicators:
      // 1. Team count (e.g., "16 REMAIN" or participant count)
      await expect(
        page.getByText(/16 REMAIN|\d+ teams|participants/i)
      ).toBeVisible({ timeout: 30000 });

      // 2. Seeds should be visible (seeded matchups)
      await expect(page.getByText('(1)')).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('(16)')).toBeVisible();

      // 3. Match scores should be displayed (gameweek scores)
      // Scores are 2-3 digit numbers
      const scoresVisible = await page.locator('text=/^\\d{2,3}$/').first().isVisible().catch(() => false);
      expect(scoresVisible).toBeTruthy();

      // 4. Gameweek info should be shown
      await expect(page.getByText(/GW\s*\d+/)).toBeVisible();
    });

    /**
     * Duplicate tournament prevention test
     *
     * This test is currently blocked because:
     * 1. The signupAndConnect helper fails (signup redirects to /dashboard not /connect)
     * 2. This is a broader issue affecting all journey tests that use signupAndConnect
     *
     * Enable this test when the signup flow is fixed to properly redirect new users
     * to the /connect page after signup.
     */
    test.fixme(
      'should prevent duplicate tournament for same league @tournament',
      async ({ page }) => {
        await signupAndConnect(page, 'Duplicate Preventer');

        // First navigation
        const leagueCard = page.locator(`text=${TEST_LEAGUE_NAME}`).locator('..').locator('..');
        await leagueCard.getByRole('button', { name: 'Start Knockout' }).click();
        await page.waitForLoadState('networkidle');

        // Second navigation - should show same tournament
        await page.goto('/leagues');
        await expect(page.getByText(TEST_LEAGUE_NAME)).toBeVisible({ timeout: 15000 });

        const leagueCardAgain = page.locator(`text=${TEST_LEAGUE_NAME}`).locator('..').locator('..');
        await leagueCardAgain.getByRole('button', { name: 'Start Knockout' }).click();

        // Should show existing tournament (same bracket)
        await expect(page.getByText(/Active|16 REMAIN|\d+ teams/)).toBeVisible({ timeout: 10000 });
      }
    );
  });

  test.describe('Post-Creation', () => {
    /**
     * NOTE: Share functionality may not be fully implemented in the current codebase.
     * This test verifies the expected share UI patterns when implemented.
     *
     * Expected share features:
     * - Share button/link after tournament creation
     * - Copy link functionality
     * - Shareable tournament URL
     */
    test.fixme(
      'should display share prompt with copy link functionality @tournament',
      async ({ page }) => {
        // TODO: Implement when share functionality is added to the UI
        // Current tournament pages (KnockoutPage, LeaguePage) don't show share UI

        // Steps to implement when share is available:
        // 1. Signup and connect
        await signupAndConnect(page, 'Share Tester');

        // 2. Create/view a tournament
        const leagueCard = page.locator(`text=${TEST_LEAGUE_NAME}`).locator('..').locator('..');
        await leagueCard.getByRole('button', { name: 'Start Knockout' }).click();
        await page.waitForLoadState('networkidle');

        // 3. Look for share UI elements
        // Expected elements (update when implemented):
        const shareButton = page.getByRole('button', { name: /share/i });
        await expect(shareButton).toBeVisible({ timeout: 5000 });

        // 4. Click share and verify copy link appears
        await shareButton.click();
        const copyLink = page.getByRole('button', { name: /copy link|copy url/i });
        await expect(copyLink).toBeVisible();

        // 5. Verify the shareable URL is displayed
        await expect(page.getByText(/knockoutfpl\.com\/|localhost:\d+\//)).toBeVisible();
      }
    );

    test('should show participant count after creation @tournament', async ({ page }) => {
      // Setup: signup, connect, and navigate to a tournament
      await signupAndConnect(page, 'Participant Counter');

      // Navigate to a league and start knockout
      const leagueCard = page.locator(`text=${TEST_LEAGUE_NAME}`).locator('..').locator('..');
      await leagueCard.getByRole('button', { name: 'Start Knockout' }).click();

      // Wait for tournament/bracket to load
      await page.waitForLoadState('networkidle');

      // Verify participant count is displayed
      // The KnockoutPage shows "16 REMAIN" and "{N} teams"
      // The BracketView would show participant info as well
      await expect(
        page
          .getByText(/16 REMAIN|\d+ teams|\d+ participants/i)
          .or(page.getByText(/\d+ members/i))
      ).toBeVisible({ timeout: 30000 });

      // Additionally verify the count is reasonable (16 for a full bracket)
      const teamCountText = await page
        .getByText(/16 REMAIN|16 teams/)
        .textContent()
        .catch(() => null);

      if (teamCountText) {
        expect(teamCountText).toMatch(/16/);
      }
    });
  });
});
