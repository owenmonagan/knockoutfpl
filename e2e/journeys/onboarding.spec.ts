import { test, expect } from '@playwright/test';
import { TEST_USERS } from '../helpers/test-users';

/**
 * Onboarding Journey E2E Tests
 *
 * Tests the complete onboarding flow from landing page to league selection.
 * Based on: docs/business/product/journeys/onboarding.md
 *
 * Tags:
 * @journey - User journey tests
 * @onboarding - Onboarding flow
 * @critical - Critical user flows
 * @smoke - Fast smoke tests
 */

test.describe('Onboarding Journey @journey @onboarding', () => {
  test.describe('Landing Page', () => {
    test('should display landing page with Enter the Arena CTA @smoke', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Verify the Hero section with CTA is visible
      await expect(page.getByRole('heading', { name: /knockout fpl/i })).toBeVisible();
      await expect(page.getByText(/every gameweek is a cup final/i)).toBeVisible();

      // Verify the Enter the Arena CTA button
      const ctaButton = page.getByRole('link', { name: /enter the arena/i });
      await expect(ctaButton).toBeVisible();
      await expect(ctaButton).toHaveAttribute('href', '/signup');
    });

    test('should navigate to team entry on CTA click @critical', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Click the Enter the Arena CTA
      const ctaButton = page.getByRole('link', { name: /enter the arena/i });
      await ctaButton.click();
      await page.waitForLoadState('networkidle');

      // Should navigate to signup page (first step before team entry)
      await expect(page).toHaveURL('/signup');
      await expect(page.getByRole('button', { name: /sign up/i })).toBeVisible();
    });
  });

  test.describe('Team Entry', () => {
    // For team entry tests, we need an authenticated user
    // These tests require the user to be logged in first
    test.beforeEach(async ({ page }) => {
      // Login with test user credentials
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      await page.getByLabel('Email').fill('testuser@knockoutfpl.com');
      await page.getByLabel('Password').fill('TestPass123!');
      await page.getByRole('button', { name: /log in/i }).click();

      // Wait for redirect after login
      await page.waitForURL(/\/(connect|leagues|dashboard)/, { timeout: 10000 });

      // Navigate to connect page to test team entry
      await page.goto('/connect');
      await page.waitForLoadState('networkidle');
    });

    test('should find team by FPL Team ID @critical', async ({ page }) => {
      // Verify connect form is displayed
      await expect(page.getByRole('heading', { name: /connect your fpl team/i })).toBeVisible();

      // Enter a valid FPL team ID
      const teamIdInput = page.getByLabel(/fpl team id/i);
      await expect(teamIdInput).toBeVisible();
      await teamIdInput.fill(TEST_USERS.creator.fplTeamId.toString());

      // Click Find My Team button
      await page.getByRole('button', { name: /find my team/i }).click();

      // Should show loading state
      await expect(page.getByText(/finding your team/i)).toBeVisible();

      // Should find the team and show success (team name visible)
      // The team name "o-win" is the actual team name for ID 158256
      await expect(page.getByText(/o-win/i)).toBeVisible({ timeout: 10000 });
    });

    test('should show team found confirmation with auto-advance @critical', async ({ page }) => {
      // Enter valid FPL team ID
      const teamIdInput = page.getByLabel(/fpl team id/i);
      await teamIdInput.fill(TEST_USERS.creator.fplTeamId.toString());

      // Click submit
      await page.getByRole('button', { name: /find my team/i }).click();

      // Wait for success confirmation
      await expect(page.getByText(/o-win/i)).toBeVisible({ timeout: 10000 });

      // Verify "Let's go" confirmation message
      await expect(page.getByText(/let.*go/i)).toBeVisible();

      // Should auto-redirect to leagues page after ~1.5s
      await page.waitForURL(/\/leagues/, { timeout: 5000 });
      await expect(page).toHaveURL(/\/leagues/);
    });

    test('should handle invalid FPL Team ID with error message', async ({ page }) => {
      // Enter an invalid team ID (very large number that doesn't exist)
      const teamIdInput = page.getByLabel(/fpl team id/i);
      await teamIdInput.fill('999999999');

      // Click submit
      await page.getByRole('button', { name: /find my team/i }).click();

      // Should show error message
      await expect(page.getByText(/team not found|check.*id/i)).toBeVisible({ timeout: 10000 });

      // Should still be on connect page
      await expect(page).toHaveURL(/\/connect/);
    });

    test('should show help modal for finding Team ID', async ({ page }) => {
      // Click the help link
      await page.getByText(/where.*team id/i).click();

      // Dialog should appear with instructions
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByText(/finding your team id/i)).toBeVisible();

      // Verify help content shows FPL URL pattern
      await expect(page.getByText(/fantasy\.premierleague\.com\/entry/i)).toBeVisible();

      // Verify alternative instruction for FPL app
      await expect(page.getByText(/fpl app/i)).toBeVisible();
    });
  });

  test.describe('Existing Tournaments', () => {
    /**
     * NOTE: These tests require Firebase emulators with seeded data.
     * To run these tests:
     * 1. Start Firebase emulators: firebase emulators:start
     * 2. Seed test user with tournaments in Firestore
     * 3. Run tests with emulator configuration
     */

    test('should display existing tournaments if user is in any @critical', async ({ page }) => {
      // Login as test user who has tournaments (seeded via test-data.ts)
      await page.goto('/login');
      await page.getByLabel('Email').fill(TEST_USERS.standard.email);
      await page.getByLabel('Password').fill(TEST_USERS.standard.password);
      await page.getByRole('button', { name: /log in/i }).click();

      await page.waitForURL(/\/(connect|leagues|dashboard)/, { timeout: 10000 });
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Verify tournament cards are displayed
      // The test user is a participant in seeded tournaments
      await expect(page.getByText(/active|tournament/i)).toBeVisible({ timeout: 10000 });
    });

    test('should show "arena awaits" state when no tournaments exist', async ({ page }) => {
      // Login as user with no tournaments
      await page.goto('/login');
      await page.getByLabel('Email').fill(TEST_USERS.withNoTournaments.email);
      await page.getByLabel('Password').fill(TEST_USERS.withNoTournaments.password);
      await page.getByRole('button', { name: /log in/i }).click();

      await page.waitForURL(/\/(connect|leagues|dashboard)/, { timeout: 10000 });
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Verify empty state - dashboard should show "arena awaits" or similar message
      await expect(page.getByText(/arena awaits|no tournaments/i)).toBeVisible();
    });
  });

  test.describe('League Selection', () => {
    /**
     * NOTE: These tests require:
     * 1. Firebase emulators running
     * 2. User with connected FPL team
     * 3. FPL API calls to work (may need mocking)
     *
     * The leagues page fetches real FPL data based on user's FPL team ID.
     */

    test('should display mini leagues with create/view options @critical', async ({ page }) => {
      // Login with test user
      await page.goto('/login');
      await page.getByLabel('Email').fill('testuser@knockoutfpl.com');
      await page.getByLabel('Password').fill('TestPass123!');
      await page.getByRole('button', { name: /log in/i }).click();

      // Wait for post-login redirect
      await page.waitForURL(/\/(connect|leagues|dashboard)/, { timeout: 10000 });

      // Navigate to leagues page
      await page.goto('/leagues');
      await page.waitForLoadState('networkidle');

      // Verify leagues page header
      await expect(page.getByRole('heading', { name: /your mini leagues/i })).toBeVisible();
      await expect(page.getByText(/select a league to start a knockout tournament/i)).toBeVisible();

      // If user has FPL team connected and leagues exist, they should be displayed
      // Wait for loading to complete - either shows leagues or "no leagues" message
      await expect(
        page.getByText(/loading leagues|members|no mini leagues found/i)
      ).toBeVisible({ timeout: 15000 });

      // If leagues are found, verify league card structure
      const hasLeagues = await page.getByText(/members/i).isVisible().catch(() => false);

      if (hasLeagues) {
        // Verify league card has Start Knockout button
        await expect(page.getByRole('button', { name: /start knockout/i }).first()).toBeVisible();
      } else {
        // Verify empty state message
        await expect(page.getByText(/no mini leagues found/i)).toBeVisible();
      }
    });
  });
});
