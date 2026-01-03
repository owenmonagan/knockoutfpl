import type { Page, Route } from '@playwright/test';

/**
 * Setup routes to never resolve, keeping the page in a loading state.
 * The routes will hang indefinitely until the page is closed.
 */
export async function setupLoadingState(
  page: Page,
  urlPatterns: (string | RegExp)[]
): Promise<void> {
  for (const pattern of urlPatterns) {
    await page.route(pattern, async () => {
      // Never resolve - keeps request pending forever
      await new Promise(() => {});
    });
  }
}

/**
 * Setup a route to delay before responding.
 * Useful for testing loading states with eventual resolution.
 */
export async function setupDelayedResponse(
  page: Page,
  urlPattern: string | RegExp,
  delayMs: number,
  response?: { status?: number; json?: unknown; body?: string }
): Promise<void> {
  await page.route(urlPattern, async (route: Route) => {
    await new Promise((resolve) => setTimeout(resolve, delayMs));

    if (response) {
      await route.fulfill({
        status: response.status ?? 200,
        contentType: 'application/json',
        body: response.json ? JSON.stringify(response.json) : response.body,
      });
    } else {
      await route.continue();
    }
  });
}

/**
 * Common URL patterns for Firebase/DataConnect requests
 */
export const FIREBASE_PATTERNS = {
  /** Firebase Auth identity toolkit */
  auth: '**/identitytoolkit.googleapis.com/**',
  /** DataConnect GraphQL endpoint */
  dataConnect: '**/v1alpha/projects/*/locations/*/services/*/connectors/**',
  /** Firestore REST API */
  firestore: '**/firestore.googleapis.com/**',
} as const;

/**
 * Common URL patterns for FPL API requests (proxied through cloud functions)
 */
export const FPL_PATTERNS = {
  /** FPL entry/team data */
  entry: '**/api/fpl/entry/**',
  /** FPL league data */
  league: '**/api/fpl/leagues-classic/**',
  /** FPL bootstrap static data */
  bootstrap: '**/api/fpl/bootstrap-static/**',
  /** All FPL API calls */
  all: '**/api/fpl/**',
} as const;
