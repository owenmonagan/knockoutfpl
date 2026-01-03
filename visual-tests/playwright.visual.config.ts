import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for visual regression screenshot capture.
 * Runs sequentially with a single worker to avoid auth conflicts.
 */
export default defineConfig({
  testDir: './scripts',
  testMatch: 'capture.spec.ts',

  // Run sequentially to avoid auth state conflicts
  fullyParallel: false,
  workers: 1,

  // Don't fail on first error - capture all screenshots
  maxFailures: 0,

  // Don't retry - just capture what we can
  retries: 0,

  // Longer timeout for complex states (network interception, auth, etc.)
  timeout: 60000,

  // Don't forbid .only in development
  forbidOnly: !!process.env.CI,

  reporter: [
    ['list'],
    ['html', { outputFolder: './reports/visual-capture', open: 'never' }],
    ['json', { outputFile: './reports/visual-capture/results.json' }],
  ],

  use: {
    baseURL: 'http://localhost:5173',

    // Capture trace on failure for debugging
    trace: 'retain-on-failure',

    // We handle screenshots manually in the test
    screenshot: 'off',
    video: 'off',

    // Reasonable action timeout
    actionTimeout: 10000,
  },

  projects: [
    {
      name: 'visual-capture',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Reuse existing dev server and emulators if running
  webServer: [
    {
      command: 'npm run emulators:e2e',
      url: 'http://127.0.0.1:4400',
      reuseExistingServer: true,
      timeout: 120 * 1000,
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 120 * 1000,
    },
  ],
});
