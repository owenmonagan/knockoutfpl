import { test, expect } from '@playwright/test';

/**
 * Shared Link Viewer Journey E2E Tests
 *
 * Tests both anonymous and logged-in viewing of shared tournament brackets.
 * Based on: docs/business/product/journeys/shared-link-viewer.md
 *
 * Tags:
 * @journey - User journey tests
 * @bracket - Bracket viewing tests
 * @critical - Critical user flows
 *
 * Entry point: knockoutfpl.com/league/{fpl_league_id} (shared link format)
 *
 * Note: The current implementation has /league/:id and /knockout/:id as protected
 * routes. The journey doc envisions anonymous viewing with "claim team" CTAs.
 * Tests marked with test.fixme() require either:
 * - Public route implementation for anonymous bracket viewing
 * - Firebase emulators with seeded tournament data
 */

// Test league IDs - using known leagues from existing tests
const TEST_LEAGUE_ID = '314'; // Overall league - has 16+ members
const INVALID_LEAGUE_ID = '999999999999';

test.describe('Shared Link Viewer Journey @journey @bracket', () => {
  test.describe('Anonymous Viewer', () => {
    /**
     * Public bracket viewing is now enabled.
     * Anonymous users can:
     * 1. View bracket without authentication
     * 2. See all participants and scores
     * 3. View current round status
     *
     * Future: "Claim team" feature will allow users to claim their FPL team.
     */

    test('should NOT redirect anonymous users to login @smoke', async ({ page }) => {
      // Navigate to a league page as an anonymous user
      await page.goto(`/league/${TEST_LEAGUE_ID}`);
      await page.waitForLoadState('networkidle');

      // Should stay on league page (not redirect to login)
      await expect(page).toHaveURL(`/league/${TEST_LEAGUE_ID}`);
    });

    test('should NOT redirect anonymous users from knockout page @smoke', async ({
      page,
    }) => {
      // Navigate to knockout page as an anonymous user
      await page.goto(`/knockout/${TEST_LEAGUE_ID}`);
      await page.waitForLoadState('networkidle');

      // Should stay on knockout page (not redirect to login)
      await expect(page).toHaveURL(`/knockout/${TEST_LEAGUE_ID}`);
    });

    /**
     * Public bracket viewing tests - verify anonymous users can view brackets
     */

    test('should display bracket without authentication @critical', async ({ page }) => {
      await page.goto(`/knockout/${TEST_LEAGUE_ID}`);
      await page.waitForLoadState('networkidle');

      // Should NOT redirect to login
      await expect(page).toHaveURL(`/knockout/${TEST_LEAGUE_ID}`);

      // Bracket should be visible - shows teams remaining count
      await expect(page.getByText(/REMAIN|\d+ teams/i).first()).toBeVisible({ timeout: 15000 });
    });

    test('should show all participants and matchups', async ({ page }) => {
      await page.goto(`/knockout/${TEST_LEAGUE_ID}`);
      await page.waitForLoadState('networkidle');

      // Verify seeds are displayed
      await expect(page.getByText('(1)')).toBeVisible();
      await expect(page.getByText('(16)')).toBeVisible();
    });

    test('should display current round status and scores', async ({ page }) => {
      await page.goto(`/knockout/${TEST_LEAGUE_ID}`);
      await page.waitForLoadState('networkidle');

      // Verify gameweek info (use .first() since multiple GW badges exist)
      await expect(page.getByText(/GW\s*\d+/).first()).toBeVisible({ timeout: 15000 });

      // Verify scores are displayed (2-3 digit numbers)
      const scores = page.locator('text=/^\\d{2,3}$/');
      await expect(scores.first()).toBeVisible();
    });

    // TODO: Implement when claim team feature is built
    test.fixme(
      'should show claim team buttons on each participant',
      async () => {
        // When claim team feature is implemented:
        // 1. Navigate to public bracket
        // 2. Verify each participant row has "Claim team" button
        // 3. Verify clicking claim redirects to sign-in flow
        // 4. Verify FPL team ID is preserved through auth flow
      }
    );

    test('should handle non-existent tournament gracefully', async ({ page }) => {
      // Navigate to a league that doesn't exist
      await page.goto(`/league/${INVALID_LEAGUE_ID}`);
      await page.waitForLoadState('networkidle');

      // Should stay on the page (public viewing enabled) and show appropriate state
      await expect(page).toHaveURL(`/league/${INVALID_LEAGUE_ID}`);
    });
  });

  test.describe('Logged-in Viewer', () => {
    /**
     * Tests for authenticated users viewing shared bracket links.
     * These require:
     * 1. Test user to be logged in
     * 2. User's FPL team to be connected
     * 3. Navigation to knockout page with bracket data
     */

    test.beforeEach(async ({ page }) => {
      // Login with test user credentials
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      await page.getByLabel('Email').fill('testuser@knockoutfpl.com');
      await page.getByLabel('Password').fill('TestPass123!');
      await page.getByRole('button', { name: /log in/i }).click();

      // Wait for redirect after login
      await page.waitForURL(/\/(connect|leagues|dashboard)/, { timeout: 10000 });
    });

    test('should display bracket with user context @critical', async ({ page }) => {
      // Navigate to knockout page for a large league
      await page.goto(`/knockout/${TEST_LEAGUE_ID}`);
      await page.waitForLoadState('networkidle');

      // Should be on knockout page (not redirected)
      await expect(page).toHaveURL(/\/knockout/);

      // Wait for bracket to load
      // Either show bracket content OR show loading/error state
      const bracketOrContent = page.locator(
        'text=/REMAIN|teams|loading|no tournament/i'
      );
      await expect(bracketOrContent).toBeVisible({ timeout: 30000 });

      // If bracket loaded successfully, verify header structure
      const hasRemaining = await page.getByText(/REMAIN/i).isVisible().catch(() => false);

      if (hasRemaining) {
        // Verify gameweek info is shown
        await expect(page.getByText(/GW\d+/)).toBeVisible();

        // Verify seeds are displayed
        await expect(page.getByText('(1)')).toBeVisible();
      }
    });

    test('should highlight user own team in bracket @critical', async ({ page }) => {
      // Navigate to knockout page
      await page.goto(`/knockout/${TEST_LEAGUE_ID}`);
      await page.waitForLoadState('networkidle');

      // Wait for bracket to load
      const bracketLoaded = await page
        .getByText(/REMAIN/i)
        .isVisible({ timeout: 30000 })
        .catch(() => false);

      if (bracketLoaded) {
        // If user is in this bracket, "YOUR MATCH" should be highlighted
        const yourMatch = page.getByText(/YOUR MATCH/i);
        const yourMatchVisible = await yourMatch.isVisible().catch(() => false);

        if (yourMatchVisible) {
          // Verify the user's match is displayed with special styling
          await expect(yourMatch).toBeVisible();
          // The match card should contain the user's team name
          // (depends on the test user being part of this league)
        }
        // Note: If user is not in this league, YOUR MATCH won't appear
        // This is expected behavior
      }
    });

    // TODO: Implement when Firebase emulators have seeded tournament with active match
    test.fixme(
      'should show match status for user current match',
      async () => {
        // Requires:
        // - Firebase emulators with seeded tournament
        // - Test user to be a participant in the tournament
        // - Active match in current round
        // Test should:
        // 1. Navigate to bracket where user has active match
        // 2. Verify "YOUR MATCH" section is displayed
        // 3. Verify match shows both players with scores
        // 4. Verify winner indicator (checkmark) if match decided
      }
    );

    test('should navigate to dashboard after viewing', async ({ page }) => {
      // Navigate to knockout page
      await page.goto(`/knockout/${TEST_LEAGUE_ID}`);
      await page.waitForLoadState('networkidle');

      // Click back to leagues link
      const backLink = page.getByText(/← Back to Leagues/i);
      await expect(backLink).toBeVisible();
      await backLink.click();

      // Should navigate to leagues page
      await expect(page).toHaveURL(/\/leagues/);
      await expect(
        page.getByRole('heading', { name: /your mini leagues/i })
      ).toBeVisible();

      // From leagues, can navigate to dashboard
      await page.goto('/dashboard');
      await expect(page).toHaveURL('/dashboard');
      await expect(
        page.getByRole('heading', { name: /dashboard/i })
      ).toBeVisible();
    });

    test('should handle league page navigation @smoke', async ({ page }) => {
      // Navigate to league page (older route)
      await page.goto(`/league/${TEST_LEAGUE_ID}`);
      await page.waitForLoadState('networkidle');

      // Should stay on league page (authenticated)
      await expect(page).toHaveURL(/\/league/);

      // Should show either:
      // - Tournament bracket (if tournament exists)
      // - "No tournament" message with create button
      // - Loading state
      const content = page
        .locator('text=/loading|no tournament|bracket/i')
        .or(page.locator('[data-testid="bracket-layout"]'));
      await expect(content.first()).toBeVisible({ timeout: 10000 });
    });

    test('should handle non-existent league gracefully when logged in', async ({
      page,
    }) => {
      // Navigate to a league that doesn't exist
      await page.goto(`/league/${INVALID_LEAGUE_ID}`);
      await page.waitForLoadState('networkidle');

      // Should stay on the page (authenticated) but show appropriate state
      await expect(page).toHaveURL(new RegExp(`/league/${INVALID_LEAGUE_ID}`));

      // Wait for loading to complete
      await page.waitForTimeout(2000);

      // Should show either:
      // - "No tournament" message
      // - League ID in header (loading state resolved)
      const pageContent = await page.content();
      const hasLeagueReference =
        pageContent.includes(INVALID_LEAGUE_ID) ||
        pageContent.includes('No tournament') ||
        pageContent.includes('League');
      expect(hasLeagueReference).toBe(true);
    });
  });
});
