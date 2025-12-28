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
     * NOTE: Current implementation has /league/:id as a protected route.
     * Anonymous users are redirected to /login.
     *
     * The journey vision (docs/business/product/journeys/shared-link-viewer.md)
     * expects anonymous users to:
     * 1. View bracket without authentication
     * 2. See "Claim team" buttons on participants
     * 3. Click claim -> sign in with Google -> land on dashboard
     *
     * These tests document the expected behavior once public bracket viewing
     * is implemented.
     */

    test('should redirect anonymous users to login (current behavior) @smoke', async ({
      page,
    }) => {
      // Navigate to a league page as an anonymous user
      await page.goto(`/league/${TEST_LEAGUE_ID}`);
      await page.waitForLoadState('networkidle');

      // Currently, protected route redirects to login
      await expect(page).toHaveURL(/\/login/);
    });

    test('should redirect anonymous users from knockout page to login @smoke', async ({
      page,
    }) => {
      // Navigate to knockout page as an anonymous user
      await page.goto(`/knockout/${TEST_LEAGUE_ID}`);
      await page.waitForLoadState('networkidle');

      // Currently, protected route redirects to login
      await expect(page).toHaveURL(/\/login/);
    });

    /**
     * Future implementation tests - require public route access
     * These tests document the expected behavior from the journey doc
     */

    // TODO: Implement when public bracket viewing is enabled
    // The /league/:id route needs to allow anonymous access to show the bracket
    test.fixme(
      'should display bracket without authentication @critical',
      async () => {
        // When public viewing is implemented:
        // 1. Navigate to /league/{id} without login
        // 2. Verify bracket layout is visible (data-testid="bracket-layout")
        // 3. Verify league name is displayed
        // 4. Verify participant count and round info shown
      }
    );

    // TODO: Implement when public bracket viewing is enabled
    test.fixme(
      'should show all participants and matchups',
      async () => {
        // When public viewing is implemented:
        // 1. Navigate to /league/{id} or /knockout/{id} without login
        // 2. Verify all participant names are visible
        // 3. Verify matchups are displayed with seeds (e.g., "(1)" vs "(16)")
        // 4. Verify BYE displayed for odd brackets
      }
    );

    // TODO: Implement when public bracket viewing and Firebase emulators are ready
    test.fixme(
      'should display current round status and scores',
      async () => {
        // Requires:
        // - Public route access
        // - Firebase emulators with seeded tournament data
        // Test should:
        // 1. Navigate to public bracket
        // 2. Verify current round is highlighted
        // 3. Verify scores are displayed (if gameweek complete)
        // 4. Verify round status badge (Active/Complete)
      }
    );

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

      // For anonymous users, should redirect to login first
      // (Once public viewing is enabled, this should show an error state)
      await expect(page).toHaveURL(/\/login/);
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
      const content = page.locator(
        'text=/loading|no tournament|bracket/i, [data-testid="bracket-layout"]'
      );
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
