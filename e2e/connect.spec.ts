import { test, expect } from '@playwright/test';

/**
 * Connect Page E2E Tests
 *
 * Tags:
 * @smoke - Critical smoke tests that should always pass
 * @connect - Connect page functionality tests
 */

test.describe('Connect Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login with test user
    await page.goto('/login');
    await page.getByLabel('Email').fill('testuser@knockoutfpl.com');
    await page.getByLabel('Password').fill('TestPass123!');
    await page.getByRole('button', { name: /log in/i }).click();

    // Wait for redirect
    await page.waitForURL(/\/(connect|leagues|dashboard)/);

    // Navigate to connect page
    await page.goto('/connect');
  });

  test('shows connect form for users without FPL team @connect @smoke', async ({ page }) => {
    // Should show connect form
    await expect(page.getByRole('heading', { name: /connect your fpl team/i })).toBeVisible();
    await expect(page.getByLabel(/fpl team id/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /find my team/i })).toBeVisible();
  });

  test('has help dialog for finding team ID @connect', async ({ page }) => {
    // Click help link
    await page.getByText(/where.*team id/i).click();

    // Dialog should appear
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/finding your team id/i)).toBeVisible();
  });

  test('validates team ID and shows error @connect', async ({ page }) => {
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Enter invalid team ID (very large number that definitely doesn't exist)
    const input = page.getByLabel(/fpl team id/i);
    await input.fill('999999999');

    // Verify input has the correct value
    await expect(input).toHaveValue('999999999');

    // Click submit button
    await page.getByRole('button', { name: /find my team/i }).click();

    // Should show error (team not found or check your ID)
    await expect(page.getByText(/team not found|check.*id/i)).toBeVisible({ timeout: 10000 });
  });

  test('shows success UI after valid team ID @connect @critical', async ({ page }) => {
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Enter valid FPL team ID
    const input = page.getByLabel(/fpl team id/i);
    await input.fill('158256');
    await expect(input).toHaveValue('158256');

    // Click submit button
    await page.getByRole('button', { name: /find my team/i }).click();

    // Should show loading state first
    await expect(page.getByText(/finding your team/i)).toBeVisible();

    // TC-06: Should show success confirmation with team name and "Let's go"
    await expect(page.getByText(/o-win/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/let.*go/i)).toBeVisible();
  });

  test('auto-redirects to /leagues after success @connect @critical', async ({ page }) => {
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Enter valid FPL team ID
    const input = page.getByLabel(/fpl team id/i);
    await input.fill('158256');

    // Click submit button
    await page.getByRole('button', { name: /find my team/i }).click();

    // First wait for success UI to appear (team name)
    await expect(page.getByText(/o-win/i)).toBeVisible({ timeout: 10000 });

    // TC-07: Should auto-redirect to /leagues after ~1.5s from success
    // Note: Allow extra time for any network latency or re-renders
    await page.waitForURL(/\/leagues/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/leagues/);
  });
});
