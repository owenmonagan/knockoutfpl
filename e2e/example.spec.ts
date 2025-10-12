import { test, expect } from '@playwright/test';

test.describe('Knockout FPL - Landing Page', () => {
  test('should load the homepage successfully', async ({ page }) => {
    await page.goto('/');

    // Wait for React to render
    await page.waitForLoadState('networkidle');

    // Check that the page loaded
    await expect(page).toHaveTitle(/Vite \+ React/);
  });

  test('should display Vite and React logos', async ({ page }) => {
    await page.goto('/');

    // Check for Vite logo
    const viteLogo = page.locator('img[alt*="Vite"]');
    await expect(viteLogo).toBeVisible();

    // Check for React logo
    const reactLogo = page.locator('img[alt*="React"]');
    await expect(reactLogo).toBeVisible();
  });

  test('should have interactive counter button', async ({ page }) => {
    await page.goto('/');

    // Find the counter button
    const counterButton = page.locator('button', { hasText: /count is/i });
    await expect(counterButton).toBeVisible();

    // Click and verify count increases
    await counterButton.click();
    await expect(counterButton).toContainText('count is 1');

    await counterButton.click();
    await expect(counterButton).toContainText('count is 2');
  });

  test('should have no console errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(consoleErrors).toHaveLength(0);
  });
});
