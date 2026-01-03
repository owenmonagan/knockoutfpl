import type { Page, Route } from '@playwright/test';
import { FPL_PATTERNS } from './delay';

/**
 * Intercept FPL entry requests and return 404 (team not found).
 */
export async function setupTeamNotFound(page: Page): Promise<void> {
  await page.route(FPL_PATTERNS.entry, async (route: Route) => {
    await route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ detail: 'Not found.' }),
    });
  });
}

/**
 * Intercept FPL league requests and return empty leagues.
 */
export async function setupEmptyLeagues(page: Page): Promise<void> {
  await page.route('**/api/fpl/entry/*/leagues', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        classic: [],
        h2h: [],
        cup: null,
        cup_matches: [],
      }),
    });
  });
}

/**
 * Intercept FPL API requests and return error.
 */
export async function setupFPLApiError(
  page: Page,
  statusCode = 500,
  message = 'Internal Server Error'
): Promise<void> {
  await page.route(FPL_PATTERNS.all, async (route: Route) => {
    await route.fulfill({
      status: statusCode,
      contentType: 'application/json',
      body: JSON.stringify({ error: message }),
    });
  });
}

/**
 * Mock FPL entry data for a specific team.
 */
export async function setupMockTeamData(
  page: Page,
  teamData: {
    id: number;
    name: string;
    player_first_name?: string;
    player_last_name?: string;
  }
): Promise<void> {
  await page.route(FPL_PATTERNS.entry, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: teamData.id,
        name: teamData.name,
        player_first_name: teamData.player_first_name ?? 'Test',
        player_last_name: teamData.player_last_name ?? 'User',
        started_event: 1,
        current_event: 16,
        summary_overall_points: 1000,
        summary_overall_rank: 50000,
      }),
    });
  });
}

/**
 * Mock FPL league data with sample standings.
 */
export async function setupMockLeagueData(
  page: Page,
  leagueId: number,
  leagueName = 'Test League'
): Promise<void> {
  await page.route(`**/api/fpl/leagues-classic/${leagueId}/**`, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        league: {
          id: leagueId,
          name: leagueName,
          created: '2024-07-01T00:00:00Z',
        },
        standings: {
          results: [
            { id: 1, entry: 158256, entry_name: 'Team A', player_name: 'Player A', rank: 1, total: 500 },
            { id: 2, entry: 158257, entry_name: 'Team B', player_name: 'Player B', rank: 2, total: 480 },
          ],
        },
      }),
    });
  });
}
