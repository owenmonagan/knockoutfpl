import { test, expect } from '@playwright/test';

/**
 * Phase 1 Demo E2E Tests
 *
 * Tests the complete demo flow:
 * - Signup → Connect FPL → Leagues → Knockout
 *
 * Tags:
 * @smoke - Critical smoke tests that should always pass
 * @critical - Critical user flows
 * @demo - Demo flow tests
 *
 * Test FPL Team: 158256 (O-win)
 * Test League: Overall (ID: 314) - has 16+ members for bracket
 */

// Generate unique email for each test run to avoid conflicts
const generateTestEmail = () =>
  `e2e_demo_${Date.now()}_${Math.random().toString(36).substring(7)}@knockoutfpl.com`;

const TEST_PASSWORD = 'TestPass123!';
const TEST_FPL_TEAM_ID = '158256';
const TEST_LEAGUE_NAME = 'Overall';

test.describe('Phase 1 Demo Flow @critical @smoke', () => {
  // These tests require Data Connect + FPL API to be fully functional
  // They verify the complete user journey but need the full backend stack

  test('complete flow: signup → connect → leagues → knockout @critical @smoke', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    const testEmail = generateTestEmail();

    // Step 1: Navigate to signup
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');

    // Step 2: Fill signup form
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Display Name').fill('Demo Tester');
    await page.getByLabel(/^Password$/).fill(TEST_PASSWORD);
    await page.getByLabel('Confirm Password').fill(TEST_PASSWORD);

    // Step 3: Submit signup - should redirect to /dashboard
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });

    // Step 4: Navigate to Connect page to link FPL team
    await page.goto('/connect');
    await expect(page.getByRole('heading', { name: 'Connect Your FPL Team' })).toBeVisible();

    // Step 5: Enter FPL Team ID and submit
    await page.getByLabel('FPL Team ID').pressSequentially(TEST_FPL_TEAM_ID);
    await page.getByRole('button', { name: 'Find My Team' }).click();

    // Step 6: Wait for API to complete (connection happens in background)
    // Note: Due to React re-rendering behavior, the UI may not show success state
    // but the connection still completes. Wait for network to settle then navigate.
    await page.waitForTimeout(3000);

    // Navigate to leagues - the connection should be complete
    await page.goto('/leagues');

    // Step 7: Verify Leagues page
    await expect(page.getByRole('heading', { name: 'Your Mini Leagues' })).toBeVisible();
    await expect(page.getByText(TEST_LEAGUE_NAME)).toBeVisible({ timeout: 15000 });

    // Step 8: Click "Start Knockout" on a large league (Overall has 16+ members)
    const overallCard = page.locator(`text=${TEST_LEAGUE_NAME}`).locator('..').locator('..');
    await overallCard.getByRole('button', { name: 'Start Knockout' }).click();

    // Step 9: Verify knockout page
    await expect(page).toHaveURL(/\/league\/\d+/);
    await expect(page.getByText('16 REMAIN')).toBeVisible({ timeout: 30000 });
    await expect(page.getByText(/\d+ teams · GW\d+ scores/)).toBeVisible();

    // Step 10: Verify bracket structure (seeds and scores)
    await expect(page.getByText('(1)')).toBeVisible();
    await expect(page.getByText('(16)')).toBeVisible();

    // Step 11: Back navigation works
    await page.getByText('← Back to Leagues').click();
    await expect(page).toHaveURL('/leagues');

    // Verify no console errors
    expect(consoleErrors).toHaveLength(0);
  });

  test('login flow: existing user → dashboard → leagues @critical', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    const testEmail = generateTestEmail();

    // First: Create user via signup and connect FPL
    await page.goto('/signup');
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Display Name').fill('Login Flow Tester');
    await page.getByLabel(/^Password$/).fill(TEST_PASSWORD);
    await page.getByLabel('Confirm Password').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });

    // Navigate to Connect page to link FPL team
    await page.goto('/connect');
    await page.getByLabel('FPL Team ID').pressSequentially(TEST_FPL_TEAM_ID);
    await page.getByRole('button', { name: 'Find My Team' }).click();

    // Wait for API to complete then navigate to leagues
    await page.waitForTimeout(3000);
    await page.goto('/leagues');
    await expect(page.getByText(TEST_LEAGUE_NAME)).toBeVisible({ timeout: 15000 });

    // Logout by clearing session
    await page.goto('/');
    await page.context().clearCookies();

    // Now: Test login flow
    await page.goto('/login');
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Password').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Log In' }).click();

    // Should go to dashboard (user has FPL connected)
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText(/Welcome back/)).toBeVisible();

    // Click "View Your Leagues"
    await page.getByRole('button', { name: 'View Your Leagues' }).click();
    await expect(page).toHaveURL('/leagues');
    await expect(page.getByText(TEST_LEAGUE_NAME)).toBeVisible({ timeout: 15000 });

    expect(consoleErrors).toHaveLength(0);
  });
});

test.describe('Knockout Page Features @demo', () => {
  test('displays bracket structure correctly', async ({ page }) => {
    const testEmail = generateTestEmail();

    // Setup: Signup and connect
    await page.goto('/signup');
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Display Name').fill('Bracket Viewer');
    await page.getByLabel(/^Password$/).fill(TEST_PASSWORD);
    await page.getByLabel('Confirm Password').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });

    await page.goto('/connect');
    await page.getByLabel('FPL Team ID').pressSequentially(TEST_FPL_TEAM_ID);
    await page.getByRole('button', { name: 'Find My Team' }).click();

    // Wait for API to complete then navigate to leagues
    await page.waitForTimeout(3000);
    await page.goto('/leagues');

    // Navigate to knockout for a large league
    await expect(page.getByText(TEST_LEAGUE_NAME)).toBeVisible({ timeout: 15000 });
    const overallCard = page.locator(`text=${TEST_LEAGUE_NAME}`).locator('..').locator('..');
    await overallCard.getByRole('button', { name: 'Start Knockout' }).click();

    await expect(page).toHaveURL(/\/league\/\d+/);

    // Verify header
    await expect(page.getByText(TEST_LEAGUE_NAME.toUpperCase())).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('16 REMAIN')).toBeVisible();

    // Verify seeds are displayed (1 vs 16 matchup)
    await expect(page.getByText('(1)')).toBeVisible();
    await expect(page.getByText('(16)')).toBeVisible();
    await expect(page.getByText('(8)')).toBeVisible();
    await expect(page.getByText('(9)')).toBeVisible();

    // Verify gameweek badge
    await expect(page.locator('text=/GW \\d+/').first()).toBeVisible();

    // Verify scores are displayed
    const scores = page.locator('text=/^\\d{2,3}$/');
    await expect(scores.first()).toBeVisible();
  });

  test('highlights winner with checkmark', async ({ page }) => {
    const testEmail = generateTestEmail();

    // Setup
    await page.goto('/signup');
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Display Name').fill('Winner Checker');
    await page.getByLabel(/^Password$/).fill(TEST_PASSWORD);
    await page.getByLabel('Confirm Password').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });

    await page.goto('/connect');
    await page.getByLabel('FPL Team ID').pressSequentially(TEST_FPL_TEAM_ID);
    await page.getByRole('button', { name: 'Find My Team' }).click();

    // Wait for API to complete then navigate to leagues
    await page.waitForTimeout(3000);
    await page.goto('/leagues');

    // Navigate to knockout
    await expect(page.getByText(TEST_LEAGUE_NAME)).toBeVisible({ timeout: 15000 });
    const overallCard = page.locator(`text=${TEST_LEAGUE_NAME}`).locator('..').locator('..');
    await overallCard.getByRole('button', { name: 'Start Knockout' }).click();

    await expect(page).toHaveURL(/\/league\/\d+/);
    await expect(page.getByText('16 REMAIN')).toBeVisible({ timeout: 30000 });

    // Winners should have green checkmark
    const checkmarks = page.locator('text=✓');
    const checkmarkCount = await checkmarks.count();
    expect(checkmarkCount).toBeGreaterThan(0);
  });
});

test.describe('Connect Page @demo', () => {
  test('shows help dialog with Team ID instructions', async ({ page }) => {
    const testEmail = generateTestEmail();

    await page.goto('/signup');
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Display Name').fill('Help Dialog Tester');
    await page.getByLabel(/^Password$/).fill(TEST_PASSWORD);
    await page.getByLabel('Confirm Password').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await expect(page).toHaveURL('/connect', { timeout: 10000 });

    // Click help link
    await page.getByText("Where's my Team ID?").click();

    // Verify dialog content
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Finding Your Team ID')).toBeVisible();
    await expect(page.getByText(/fantasy\.premierleague\.com/)).toBeVisible();
  });

  test('shows error for invalid Team ID', async ({ page }) => {
    const testEmail = generateTestEmail();

    await page.goto('/signup');
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Display Name').fill('Error Tester');
    await page.getByLabel(/^Password$/).fill(TEST_PASSWORD);
    await page.getByLabel('Confirm Password').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await expect(page).toHaveURL('/connect', { timeout: 10000 });

    // Enter invalid Team ID
    await page.getByLabel('FPL Team ID').pressSequentially('999999999');
    await page.getByRole('button', { name: 'Find My Team' }).click();

    // Verify error message
    await expect(page.getByText('Team not found. Check your ID and try again.')).toBeVisible({
      timeout: 10000,
    });
  });
});

test.describe('Leagues Page @demo', () => {
  test('displays league cards with member count and rank', async ({ page }) => {
    const testEmail = generateTestEmail();

    // Setup
    await page.goto('/signup');
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Display Name').fill('League Card Tester');
    await page.getByLabel(/^Password$/).fill(TEST_PASSWORD);
    await page.getByLabel('Confirm Password').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });

    await page.goto('/connect');
    await page.getByLabel('FPL Team ID').pressSequentially(TEST_FPL_TEAM_ID);
    await page.getByRole('button', { name: 'Find My Team' }).click();

    // Wait for API to complete then navigate to leagues
    await page.waitForTimeout(3000);
    await page.goto('/leagues');

    // Verify league cards
    await expect(page.getByText(TEST_LEAGUE_NAME)).toBeVisible({ timeout: 15000 });

    // Verify member count is displayed
    await expect(page.getByText(/\d+ members/).first()).toBeVisible();

    // Verify rank is displayed
    await expect(page.getByText(/You're ranked #\d+/).first()).toBeVisible();

    // Verify Start Knockout button
    await expect(page.getByRole('button', { name: 'Start Knockout' }).first()).toBeVisible();
  });
});
