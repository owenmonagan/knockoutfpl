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

  test('can edit display name @profile', async ({ page }) => {
    await page.goto('/profile');

    // Click Edit button in Account Details section
    const accountSection = page.getByRole('article').filter({ hasText: 'Account Details' });
    await accountSection.getByRole('button', { name: /edit/i }).click();

    // Verify input appears
    const input = accountSection.getByRole('textbox');
    await expect(input).toBeVisible();

    // Clear and type new name
    await input.clear();
    await input.fill('Updated Test User');

    // Save
    await accountSection.getByRole('button', { name: /save/i }).click();

    // Verify edit mode exits and new name shows
    await expect(input).not.toBeVisible();
    await expect(accountSection.getByText('Updated Test User')).toBeVisible();
  });

  test('can cancel display name edit @profile', async ({ page }) => {
    await page.goto('/profile');

    // Click Edit button in Account Details section
    const accountSection = page.getByRole('article').filter({ hasText: 'Account Details' });
    await accountSection.getByRole('button', { name: /edit/i }).click();

    const input = accountSection.getByRole('textbox');
    const originalName = await input.inputValue();

    await input.clear();
    await input.fill('Should Not Save');

    // Cancel
    await accountSection.getByRole('button', { name: /cancel/i }).click();

    // Verify original name is still shown
    await expect(input).not.toBeVisible();
    await expect(accountSection.getByText(originalName)).toBeVisible();
  });
});
