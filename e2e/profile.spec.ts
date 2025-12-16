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

  test('shows FPL connection card on profile @profile', async ({ page }) => {
    await page.goto('/profile');

    // FPLConnectionCard should be visible - it's the second article
    // If connected, shows team name; if not, shows "Connect Your FPL Team"
    const fplSection = page.getByRole('article').nth(1);
    await expect(fplSection).toBeVisible();
  });

  test('can update FPL team from profile @profile', async ({ page }) => {
    await page.goto('/profile');

    // Find the FPL section - it's the second article after Account Details
    const fplSection = page.getByRole('article').nth(1);

    // Check if Edit button is visible (team already connected)
    const editButton = fplSection.getByRole('button', { name: /edit/i });
    const isConnected = await editButton.isVisible({ timeout: 2000 }).catch(() => false);

    if (isConnected) {
      // Team is connected - click Edit to update
      await editButton.click();

      // Wait for input field
      const input = fplSection.getByLabel('FPL Team ID');
      await expect(input).toBeVisible();

      // Clear and enter valid team ID (use 158256 which we know works)
      await input.clear();
      await input.fill('158256');

      // Click Update button and wait for it to be enabled first
      const updateButton = fplSection.getByRole('button', { name: /update/i });

      // Use force click since button might auto-trigger during fill
      await updateButton.click({ force: true }).catch(async () => {
        // If click fails, just wait - the update might have auto-triggered
      });
    } else {
      // Team not connected - enter team ID
      const input = fplSection.getByLabel('FPL Team ID');
      await input.fill('158256');

      // Try to click Connect, but don't fail if button auto-triggers
      const connectButton = fplSection.getByRole('button', { name: /connect/i });
      await connectButton.click({ force: true }).catch(async () => {
        // If click fails, connection might have auto-triggered
      });
    }

    // Wait for success - card should show team stats
    await expect(fplSection.getByText('GW Points')).toBeVisible({ timeout: 10000 });
  });
});
