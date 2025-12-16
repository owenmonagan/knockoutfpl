import { test, expect } from '@playwright/test';

test.describe('Profile Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login with test user
    await page.goto('/login');
    await page.getByLabel('Email').fill('testuser@knockoutfpl.com');
    await page.getByLabel('Password').fill('TestPass123!');
    await page.getByRole('button', { name: /log in/i }).click();

    // Wait for redirect (either to /connect or /leagues depending on state)
    await page.waitForURL(/\/(connect|leagues|dashboard)/);
  });

  test('loads profile page @profile @smoke', async ({ page }) => {
    await page.goto('/profile');

    await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible();
    await expect(page.getByText('Account Details')).toBeVisible();
  });
});
