import { test, expect } from '@playwright/test';

test.describe('League Page Exploration @explore', () => {
  test('explore league 39776 for large tournament features', async ({ page }) => {
    // Navigate to the league page
    await page.goto('http://localhost:5173/league/39776');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Take a screenshot
    await page.screenshot({ path: '.playwright-mcp/league-39776-initial.png', fullPage: true });

    // Log the page content
    const pageContent = await page.content();
    console.log('Page title:', await page.title());

    // Check what elements are present
    const h1 = await page.locator('h1').allTextContents();
    console.log('H1 elements:', h1);

    const h2 = await page.locator('h2').allTextContents();
    console.log('H2 elements:', h2);

    // Check for any error messages
    const errors = await page.locator('[role="alert"], .error, .text-red-500, .text-destructive').allTextContents();
    if (errors.length > 0) {
      console.log('Error messages:', errors);
    }

    // Check for loading states
    const loading = await page.locator('[data-loading], .loading, .spinner, .animate-spin').count();
    console.log('Loading elements:', loading);

    // Check for any bracket/match elements
    const matchElements = await page.locator('[data-match], .match, [class*="match"]').count();
    console.log('Match elements:', matchElements);

    // Check for pagination elements (for large tournament)
    const pagination = await page.locator('[data-pagination], .pagination, nav[aria-label*="pagination"]').count();
    console.log('Pagination elements:', pagination);

    // Check console for errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Wait a bit to capture any async console errors
    await page.waitForTimeout(2000);

    if (consoleErrors.length > 0) {
      console.log('Console errors:', consoleErrors);
    }

    // Take final screenshot
    await page.screenshot({ path: '.playwright-mcp/league-39776-final.png', fullPage: true });
  });
});
