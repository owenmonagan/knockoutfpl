import type { Page, Route } from '@playwright/test';
import { FIREBASE_PATTERNS } from './delay';

/**
 * Intercept DataConnect requests and return empty tournament data.
 */
export async function setupEmptyTournaments(page: Page): Promise<void> {
  await page.route(FIREBASE_PATTERNS.dataConnect, async (route: Route) => {
    const request = route.request();
    const postData = request.postData() ?? '';

    // Check if this is a tournament-related query
    if (
      postData.includes('tournament') ||
      postData.includes('Tournament') ||
      postData.includes('getLeague')
    ) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            tournaments: [],
            tournament: null,
            userTournaments: [],
          },
        }),
      });
    } else {
      await route.continue();
    }
  });
}

/**
 * Intercept DataConnect requests and return empty user profile.
 */
export async function setupEmptyUserProfile(page: Page): Promise<void> {
  await page.route(FIREBASE_PATTERNS.dataConnect, async (route: Route) => {
    const request = route.request();
    const postData = request.postData() ?? '';

    if (postData.includes('getUserProfile') || postData.includes('userProfile')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            user: null,
            userProfile: null,
          },
        }),
      });
    } else {
      await route.continue();
    }
  });
}

/**
 * Intercept DataConnect and return error response.
 */
export async function setupDataConnectError(
  page: Page,
  errorMessage = 'Internal server error'
): Promise<void> {
  await page.route(FIREBASE_PATTERNS.dataConnect, async (route: Route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        errors: [{ message: errorMessage }],
      }),
    });
  });
}

/**
 * Intercept Firebase Auth and return error response.
 */
export async function setupAuthError(
  page: Page,
  errorCode = 'auth/user-not-found',
  errorMessage = 'User not found'
): Promise<void> {
  await page.route(FIREBASE_PATTERNS.auth, async (route: Route) => {
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({
        error: {
          code: 400,
          message: errorCode,
          errors: [{ message: errorMessage, domain: 'global', reason: errorCode }],
        },
      }),
    });
  });
}
