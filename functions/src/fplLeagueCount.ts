// functions/src/fplLeagueCount.ts

const FPL_API_BASE = 'https://fantasy.premierleague.com/api';

interface StandingsPage {
  standings: {
    has_next: boolean;
    results: { entry: number }[];
  };
}

/**
 * Fetches a single page of league standings.
 * Returns null if page doesn't exist (404).
 */
async function fetchStandingsPage(leagueId: number, page: number): Promise<StandingsPage | null> {
  const url = `${FPL_API_BASE}/leagues-classic/${leagueId}/standings/?page_standings=${page}`;
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`FPL API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Uses binary search to find the total participant count for a league.
 * FPL API paginates at 50 results per page.
 *
 * Algorithm:
 * 1. Fetch page 1 to check if small league (no has_next)
 * 2. If has_next, exponentially probe (100, 1000, 10000) to find upper bound
 * 3. Binary search to find exact last page
 * 4. Count = (lastPage - 1) * 50 + results on last page
 */
export async function getLeagueParticipantCount(leagueId: number): Promise<number> {
  const RESULTS_PER_PAGE = 50;

  // Step 1: Fetch page 1
  const page1 = await fetchStandingsPage(leagueId, 1);
  if (!page1) {
    throw new Error('League not found');
  }

  // Small league - single page
  if (!page1.standings.has_next) {
    return page1.standings.results.length;
  }

  // Step 2: Find upper bound via exponential probing
  let lowerBound = 1;
  let upperBound = 100;

  while (true) {
    const probe = await fetchStandingsPage(leagueId, upperBound);
    if (probe === null) {
      // Overshot - the last page is between lowerBound and upperBound
      break;
    }
    if (!probe.standings.has_next) {
      // Found exact last page during probing
      return (upperBound - 1) * RESULTS_PER_PAGE + probe.standings.results.length;
    }
    lowerBound = upperBound;
    upperBound *= 10; // 100 -> 1000 -> 10000

    // Safety cap at 10000 pages (500k participants)
    if (upperBound > 10000) {
      upperBound = 10000;
      break;
    }
  }

  // Step 3: Binary search for last valid page
  while (lowerBound < upperBound - 1) {
    const mid = Math.floor((lowerBound + upperBound) / 2);
    const probe = await fetchStandingsPage(leagueId, mid);

    if (probe === null) {
      upperBound = mid;
    } else if (!probe.standings.has_next) {
      // Found exact last page
      return (mid - 1) * RESULTS_PER_PAGE + probe.standings.results.length;
    } else {
      lowerBound = mid;
    }
  }

  // Step 4: Fetch the last page to get exact count
  const lastPage = await fetchStandingsPage(leagueId, lowerBound);
  if (!lastPage) {
    throw new Error('Unexpected: could not find last page');
  }

  // If this page has_next, try the next page
  if (lastPage.standings.has_next) {
    const nextPage = await fetchStandingsPage(leagueId, lowerBound + 1);
    if (nextPage && !nextPage.standings.has_next) {
      return lowerBound * RESULTS_PER_PAGE + nextPage.standings.results.length;
    }
  }

  return (lowerBound - 1) * RESULTS_PER_PAGE + lastPage.standings.results.length;
}

/**
 * Determines tournament size tier based on participant count.
 */
export function getTournamentSizeTier(count: number): 'standard' | 'large' | 'mega' {
  if (count <= 48) return 'standard';
  if (count <= 1000) return 'large';
  return 'mega';
}
