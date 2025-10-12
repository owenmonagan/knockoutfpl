/**
 * Test fixtures and helper data for E2E tests
 */

import type { Page, Response } from '@playwright/test';

export const testUsers = {
  user1: {
    email: 'test1@example.com',
    password: 'TestPassword123!',
    fplTeamId: 158256,
    fplTeamName: "Test User 1's Team",
  },
  user2: {
    email: 'test2@example.com',
    password: 'TestPassword123!',
    fplTeamId: 71631,
    fplTeamName: "Test User 2's Team",
  },
};

export const testGameweeks = {
  current: 1,
  upcoming: 2,
  completed: 0,
};

/**
 * Helper function to generate unique test email
 */
export function generateTestEmail(): string {
  const timestamp = Date.now();
  return `test-${timestamp}@example.com`;
}

/**
 * Helper function to wait for API calls
 */
export async function waitForApiCall(page: Page, urlPattern: string | RegExp) {
  return page.waitForResponse((response: Response) => {
    const url = response.url();
    if (typeof urlPattern === 'string') {
      return url.includes(urlPattern);
    }
    return urlPattern.test(url);
  });
}
