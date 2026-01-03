import { test } from '@playwright/test';
import { routes } from '../config/routes';
import { viewports, getViewportFilename, type ViewportName } from '../config/viewports';
import { stateHandlers } from './state-handlers';
import type { RouteName } from './types';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration from environment
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const BASELINES_DIR = path.join(__dirname, '../baselines');
const CURRENT_DIR = path.join(__dirname, '../current');

// Filter options from environment
const FILTER_ROUTE = process.env.ROUTE as RouteName | undefined;
const FILTER_STATE = process.env.STATE;
const FILTER_VIEWPORT = process.env.VIEWPORT as ViewportName | undefined;
const UPDATE_BASELINES = process.env.UPDATE_BASELINES === 'true';

// Test case interface
interface TestCase {
  routeName: RouteName;
  stateName: string;
  viewportName: ViewportName;
}

/**
 * Generate all test cases based on routes, states, and viewports.
 * Applies any filters from environment variables.
 */
function generateTestCases(): TestCase[] {
  const testCases: TestCase[] = [];

  for (const [routeName, routeConfig] of Object.entries(routes)) {
    // Apply route filter
    if (FILTER_ROUTE && routeName !== FILTER_ROUTE) continue;

    for (const state of routeConfig.states) {
      // Apply state filter
      if (FILTER_STATE && state.name !== FILTER_STATE) continue;

      for (const viewportName of Object.keys(viewports) as ViewportName[]) {
        // Apply viewport filter
        if (FILTER_VIEWPORT && viewportName !== FILTER_VIEWPORT) continue;

        testCases.push({
          routeName: routeName as RouteName,
          stateName: state.name,
          viewportName,
        });
      }
    }
  }

  return testCases;
}

/**
 * Ensure a directory exists, creating it if necessary.
 */
function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Generate test matrix
const testCases = generateTestCases();

// Log test configuration
console.log(`\n📸 Visual Regression Capture`);
console.log(`   Routes: ${FILTER_ROUTE || 'all'}`);
console.log(`   States: ${FILTER_STATE || 'all'}`);
console.log(`   Viewports: ${FILTER_VIEWPORT || 'all'}`);
console.log(`   Total tests: ${testCases.length}`);
console.log(`   Output: ${UPDATE_BASELINES ? 'baselines/' : 'current/'}\n`);

test.describe('Visual Regression Capture', () => {
  // Don't use serial mode - we want tests to continue even if some fail

  for (const testCase of testCases) {
    const { routeName, stateName, viewportName } = testCase;
    const viewport = viewports[viewportName];
    const testName = `${routeName}/${stateName}/${viewportName}`;

    test(testName, async ({ page, context }) => {
      // Clear cookies/storage before each test for clean state
      await context.clearCookies();

      // Set viewport
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });

      // Get state handler
      const routeHandlers = stateHandlers[routeName];
      if (!routeHandlers) {
        throw new Error(`No handlers found for route: ${routeName}`);
      }

      const stateHandler = routeHandlers[stateName];
      if (!stateHandler) {
        throw new Error(`No handler found for state: ${routeName}/${stateName}`);
      }

      // Setup the state
      const result = await stateHandler({
        page,
        routeName,
        stateName,
        baseURL: BASE_URL,
      });

      // Navigate if URL provided
      if (result.url) {
        await page.goto(result.url);
      }

      // Wait conditions
      if (result.waitForNetworkIdle !== false) {
        await page.waitForLoadState('networkidle');
      }

      if (result.waitForSelectors) {
        for (const selector of result.waitForSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 10000 });
          } catch {
            console.warn(`  ⚠️  Selector not found: ${selector}`);
          }
        }
      }

      if (result.additionalWaitMs) {
        await page.waitForTimeout(result.additionalWaitMs);
      }

      // Determine output directory
      const outputDir = UPDATE_BASELINES
        ? path.join(BASELINES_DIR, routeName, stateName)
        : path.join(CURRENT_DIR, routeName, stateName);

      ensureDir(outputDir);

      // Take screenshot
      const filename = `${getViewportFilename(viewportName)}.png`;
      const screenshotPath = path.join(outputDir, filename);

      await page.screenshot({
        path: screenshotPath,
        fullPage: false,
      });

      console.log(`  ✅ ${testName}`);

      // Cleanup if needed
      if (result.cleanup) {
        await result.cleanup();
      }
    });
  }
});
