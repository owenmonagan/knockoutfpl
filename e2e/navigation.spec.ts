import { test, expect } from '@playwright/test';

/**
 * Navigation & Routing E2E Tests
 *
 * Tags:
 * @smoke - Critical smoke tests that should always pass
 * @navigation - Navigation and routing tests
 * @critical - Critical user flows
 */

test.describe('Navigation & Routing', () => {
  test('should load landing page successfully @smoke @navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify page loaded (check for common React app elements)
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate from landing page to signup via Enter the Arena button @navigation @critical', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify Enter the Arena button is visible
    const enterArenaButton = page.getByRole('link', { name: 'Enter the Arena' });
    await expect(enterArenaButton).toBeVisible();

    // Click and verify navigation
    await enterArenaButton.click();
    await page.waitForLoadState('networkidle');

    // Verify we're on the signup page
    await expect(page).toHaveURL('/signup');
    await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible();
  });

  test('should navigate from landing page to login via Login link @navigation @critical', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify Login link is visible
    const loginLink = page.getByRole('link', { name: 'Login' });
    await expect(loginLink).toBeVisible();

    // Click and verify navigation
    await loginLink.click();
    await page.waitForLoadState('networkidle');

    // Verify we're on the login page
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('button', { name: 'Log In' })).toBeVisible();
  });
});
