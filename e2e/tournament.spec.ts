import { test, expect } from '@playwright/test';

/**
 * Tournament E2E Tests
 *
 * Tests the full tournament lifecycle:
 * - Signup → Connect FPL → Create Tournament
 * - Login → Verify Tournament Persists
 *
 * Tags:
 * @tournament - Tournament-related tests
 * @critical - Critical user flows
 *
 * Test League: FLOAWO (ID: 634129)
 * Test FPL Team: 158256
 */

// Generate unique email for each test run to avoid conflicts
const generateTestEmail = () =>
  `e2e_${Date.now()}_${Math.random().toString(36).substring(7)}@knockoutfpl.com`;

const TEST_PASSWORD = 'TestPass123!';
const TEST_FPL_TEAM_ID = '158256';
const TEST_LEAGUE_ID = '634129';
const TEST_LEAGUE_NAME = 'FLOAWO';

// NOTE: These tests are from an older implementation design (pre-Phase 1).
// The current Phase 1 flow is tested in knockout-demo.spec.ts.
// These tests are skipped pending an update to match the new flow:
// - Signup now redirects to /connect (not /dashboard)
// - FPL connection happens on /connect page (not dashboard)
// - Leagues are viewed at /leagues (not dashboard)
// - Knockout brackets are at /league/{id}
test.describe.skip('Tournament Flow', () => {
  test.describe.configure({ mode: 'serial' });

  let testEmail: string;

  test.beforeAll(() => {
    testEmail = generateTestEmail();
  });

  test('should signup, connect FPL, and create tournament @tournament @critical', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Step 1: Navigate to signup
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');

    // Step 2: Fill signup form
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Display Name').fill('E2E Tournament Tester');
    await page.getByLabel(/^Password$/).fill(TEST_PASSWORD);
    await page.getByLabel('Confirm Password').fill(TEST_PASSWORD);

    // Step 3: Submit signup
    await page.getByRole('button', { name: 'Sign Up' }).click();

    // Step 4: Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    await expect(
      page.getByRole('heading', { name: 'Connect Your FPL Team' })
    ).toBeVisible();

    // Step 5: Connect FPL Team
    await page.getByLabel('FPL Team ID').fill(TEST_FPL_TEAM_ID);
    await page.getByRole('button', { name: 'Connect' }).click();

    // Step 6: Wait for FPL data to load
    await expect(page.getByText('O-win')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Your Leagues' })).toBeVisible();

    // Step 7: Find and click FLOAWO league
    await expect(page.getByText(TEST_LEAGUE_NAME)).toBeVisible({ timeout: 10000 });
    await page.getByText(TEST_LEAGUE_NAME).click();

    // Step 8: Should be on league page
    await expect(page).toHaveURL(`/league/${TEST_LEAGUE_ID}`);
    await page.waitForLoadState('networkidle');

    // Step 9: Create tournament if it doesn't exist yet
    const createButton = page.getByRole('button', { name: 'Create Tournament' });
    if (await createButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createButton.click();
    }

    // Step 10: Verify bracket is displayed (tournament exists either way)
    await expect(page.getByText('Active')).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('heading', { name: 'Round 1' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Final', exact: true })).toBeVisible();

    // Verify seeding is present (seed 1 should be visible)
    await expect(page.getByText('(1)')).toBeVisible();

    // Verify no console errors
    expect(consoleErrors).toHaveLength(0);
  });

  test('should login and see persisted tournament @tournament @critical', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Step 1: Navigate to login
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Step 2: Fill login form with the same email from signup
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Password').fill(TEST_PASSWORD);

    // Step 3: Submit login
    await page.getByRole('button', { name: 'Log In' }).click();

    // Step 4: Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });

    // Step 5: Wait for FPL data to load
    await expect(page.getByText('O-win')).toBeVisible({ timeout: 10000 });

    // Step 6: Navigate to FLOAWO league
    await expect(page.getByText(TEST_LEAGUE_NAME)).toBeVisible({ timeout: 10000 });
    await page.getByText(TEST_LEAGUE_NAME).click();

    // Step 7: Verify tournament persists
    await expect(page).toHaveURL(`/league/${TEST_LEAGUE_ID}`);

    // Tournament should still be active (not showing "Create Tournament" button)
    await expect(page.getByText('Active')).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('heading', { name: 'Round 1' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Final', exact: true })).toBeVisible();

    // Verify bracket structure persists
    await expect(page.getByRole('heading', { name: 'Quarter-Finals' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Semi-Finals' })).toBeVisible();

    // Verify seeding persists
    await expect(page.getByText('(1)')).toBeVisible();
    await expect(page.getByText('(2)')).toBeVisible();

    // Verify no console errors
    expect(consoleErrors).toHaveLength(0);
  });
});

test.describe.skip('Tournament Creation', () => {
  test('should display bracket with correct structure after creation @tournament', async ({
    page,
  }) => {
    const testEmail = generateTestEmail();

    // Signup
    await page.goto('/signup');
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Display Name').fill('Bracket Tester');
    await page.getByLabel(/^Password$/).fill(TEST_PASSWORD);
    await page.getByLabel('Confirm Password').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Sign Up' }).click();

    // Connect FPL
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    await page.getByLabel('FPL Team ID').fill(TEST_FPL_TEAM_ID);
    await page.getByRole('button', { name: 'Connect' }).click();

    // Wait for leagues and navigate to FLOAWO
    await expect(page.getByText(TEST_LEAGUE_NAME)).toBeVisible({ timeout: 15000 });
    await page.getByText(TEST_LEAGUE_NAME).click();

    // Create tournament
    await expect(page).toHaveURL(`/league/${TEST_LEAGUE_ID}`);
    await page.waitForLoadState('networkidle');

    // Check if tournament already exists or needs to be created
    const createButton = page.getByRole('button', { name: 'Create Tournament' });
    if (await createButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await createButton.click();
    }

    // Verify bracket structure
    await expect(page.getByText('Active')).toBeVisible({ timeout: 5000 });

    // Should have 4 rounds for 15 participants
    await expect(page.getByRole('heading', { name: 'Round 1' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Quarter-Finals' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Semi-Finals' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Final', exact: true })).toBeVisible();

    // Verify participant names are displayed
    await expect(page.getByText('Banging Slots')).toBeVisible();
    await expect(page.getByText('O-win')).toBeVisible();

    // Verify BYE is shown for odd bracket
    await expect(page.getByText('BYE').first()).toBeVisible();
  });
});

test.describe.skip('League Navigation', () => {
  test('should navigate from dashboard to league and back @tournament @navigation', async ({
    page,
  }) => {
    const testEmail = generateTestEmail();

    // Setup: Signup and connect FPL
    await page.goto('/signup');
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Display Name').fill('Navigation Tester');
    await page.getByLabel(/^Password$/).fill(TEST_PASSWORD);
    await page.getByLabel('Confirm Password').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Sign Up' }).click();

    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    await page.getByLabel('FPL Team ID').fill(TEST_FPL_TEAM_ID);
    await page.getByRole('button', { name: 'Connect' }).click();

    // Wait for leagues to load
    await expect(page.getByRole('heading', { name: 'Your Leagues' })).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText(TEST_LEAGUE_NAME)).toBeVisible();

    // Navigate to league
    await page.getByText(TEST_LEAGUE_NAME).click();
    await expect(page).toHaveURL(`/league/${TEST_LEAGUE_ID}`);

    // Navigate back to dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: 'Your Leagues' })).toBeVisible();
  });
});
