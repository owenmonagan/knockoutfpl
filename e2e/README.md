# E2E Tests

End-to-end tests for Knockout FPL using Playwright.

## Running Tests

```bash
# Run all E2E tests (headless)
npm run test:e2e

# Run tests in UI mode (interactive, with browser preview)
npm run test:e2e:ui

# Run tests in debug mode (step through with debugger)
npm run test:e2e:debug

# Run specific test file
npx playwright test e2e/example.spec.ts

# Run tests in headed mode (see browser)
npx playwright test --headed
```

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/some-path');

    // Your test actions and assertions
    await expect(page.locator('h1')).toContainText('Expected Text');
  });
});
```

### Using Test Fixtures

Import shared test data from `fixtures/test-data.ts`:

```typescript
import { testUsers, generateTestEmail } from './fixtures/test-data';

test('should login with test user', async ({ page }) => {
  // Use predefined test user
  const user = testUsers.user1;

  // Or generate unique email
  const email = generateTestEmail();
});
```

## Test Organization

```
e2e/
├── example.spec.ts          # Sample tests (landing page)
├── fixtures/
│   └── test-data.ts         # Shared test data and helpers
└── README.md                # This file

Future structure:
├── auth.spec.ts             # Authentication flows
├── challenge-creation.spec.ts
├── challenge-accept.spec.ts
└── dashboard.spec.ts
```

## Manual Verification

### Using Playwright UI Mode

The best way to manually verify functionality:

```bash
npm run test:e2e:ui
```

This opens an interactive test runner where you can:
- See live browser preview
- Step through tests line-by-line
- Pause and inspect elements
- Re-run individual tests
- Watch tests while editing code

### Using Debug Mode

For stepping through with breakpoints:

```bash
npm run test:e2e:debug
```

Or add `await page.pause()` in your test code to pause at specific points.

### Viewing Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

This shows:
- Test results with screenshots/videos
- Trace viewer for failed tests
- Network activity
- Console logs

## Tips

### Selectors
- Prefer semantic selectors: `page.getByRole('button', { name: 'Submit' })`
- Use test IDs for complex components: `page.locator('[data-testid="login-form"]')`
- Avoid CSS selectors that may break with styling changes

### Waiting
- Playwright auto-waits for elements to be actionable
- Use `page.waitForLoadState('networkidle')` for async data loading
- Use `page.waitForURL()` for navigation assertions

### Screenshots
- Automatic on failure (configured in playwright.config.ts)
- Manual: `await page.screenshot({ path: 'screenshot.png' })`

### Videos
- Recorded on failure (configured in playwright.config.ts)
- Enable always: change `video: 'retain-on-failure'` to `video: 'on'`

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Locators Guide](https://playwright.dev/docs/locators)
- [Assertions](https://playwright.dev/docs/test-assertions)
