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
});
