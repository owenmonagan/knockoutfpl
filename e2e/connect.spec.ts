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
});
