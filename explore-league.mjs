import { chromium } from 'playwright';

async function createTournamentWithGW10() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Login
    console.log('=== LOGIN ===');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    await page.getByLabel(/email/i).fill('testuser@knockoutfpl.com');
    await page.getByLabel(/password/i).fill('TestPass123!');
    await page.getByRole('button', { name: /log in/i }).click();
    await page.waitForTimeout(2000);

    // Navigate to league (tournament now deleted)
    console.log('=== NAVIGATE TO LEAGUE 39776 ===');
    await page.goto('http://localhost:5173/league/39776', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: '.playwright-mcp/league-no-tournament.png', fullPage: true });

    // Check page state
    const bodyText = await page.locator('body').textContent();
    console.log('\nPage content (first 1000 chars):');
    console.log(bodyText?.substring(0, 1000).replace(/\s+/g, ' ').trim());

    const buttons = await page.locator('button').allTextContents();
    console.log('\nButtons:', buttons.filter(b => b.trim()));

    // Look for gameweek selector
    console.log('\n=== LOOKING FOR GW SELECTOR ===');
    const gwButton = page.locator('button:has-text("GW")');
    if (await gwButton.count() > 0) {
      const gwText = await gwButton.first().textContent();
      console.log('Found GW button:', gwText);

      // Click to open dropdown
      await gwButton.first().click();
      await page.waitForTimeout(500);

      await page.screenshot({ path: '.playwright-mcp/gw-dropdown.png', fullPage: true });

      // Find available options
      const dropdownContent = await page.locator('[role="listbox"], [role="menu"], [data-radix-popper-content-wrapper]').textContent();
      console.log('Dropdown content:', dropdownContent?.substring(0, 500));

      // Try to select GW 10
      const gw10 = page.locator('[role="option"]:has-text("10"), [role="menuitem"]:has-text("10"), text="GW 10"').first();
      if (await gw10.count() > 0) {
        console.log('Found GW 10 option, clicking...');
        await gw10.click();
        await page.waitForTimeout(500);
      } else {
        // Check if there's a select element
        const allOptions = await page.locator('[role="option"], [role="menuitem"]').allTextContents();
        console.log('Available options:', allOptions);

        // Try clicking on any option containing "10"
        const option10 = page.locator('[role="option"]:has-text("10")').first();
        if (await option10.count() > 0) {
          await option10.click();
          await page.waitForTimeout(500);
        }
      }

      await page.screenshot({ path: '.playwright-mcp/after-gw-select.png', fullPage: true });

      // Check what's selected now
      const newGwText = await gwButton.first().textContent();
      console.log('GW button after selection:', newGwText);
    } else {
      console.log('No GW button found');
    }

    // Create tournament
    console.log('\n=== CREATE TOURNAMENT ===');
    const createBtn = page.getByRole('button', { name: /create tournament/i });
    if (await createBtn.count() > 0) {
      console.log('Found Create Tournament button, clicking...');
      await createBtn.click();

      // Wait for creation
      console.log('Waiting for tournament creation...');
      await page.waitForTimeout(10000);

      await page.screenshot({ path: '.playwright-mcp/tournament-created.png', fullPage: true });

      const finalText = await page.locator('body').textContent();
      console.log('\nFinal page content:');
      console.log(finalText?.substring(0, 1500).replace(/\s+/g, ' ').trim());

      // Check what starting GW the tournament has
      const gwRefs = await page.locator('text=/GW\\s*\\d+/').allTextContents();
      console.log('\nAll GW references:', [...new Set(gwRefs)].slice(0, 10));

      const startingGw = await page.locator('text=/Starting.*Gameweek/i').allTextContents();
      console.log('Starting gameweek info:', startingGw);

    } else {
      console.log('No Create Tournament button found');
    }

  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: '.playwright-mcp/error-state.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

createTournamentWithGW10();
