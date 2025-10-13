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

  test('should navigate from landing page to signup via Get Started button @navigation @critical', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify Get Started button is visible
    const getStartedButton = page.getByRole('link', { name: 'Get Started' });
    await expect(getStartedButton).toBeVisible();

    // Click and verify navigation
    await getStartedButton.click();
    await page.waitForLoadState('networkidle');

    // Verify we're on the signup page
    await expect(page).toHaveURL('/signup');
    await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible();
  });

  test('should navigate from landing page to login via Log In button @navigation @critical', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify Log In button is visible
    const logInButton = page.getByRole('link', { name: 'Log In' });
    await expect(logInButton).toBeVisible();

    // Click and verify navigation
    await logInButton.click();
    await page.waitForLoadState('networkidle');

    // Verify we're on the login page
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('button', { name: 'Log In' })).toBeVisible();
  });
});
