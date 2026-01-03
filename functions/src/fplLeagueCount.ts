// functions/src/fplLeagueCount.ts

const FPL_API_BASE = 'https://fantasy.premierleague.com/api';

interface StandingsPage {
  standings: {
    has_next: boolean;
    results: { entry: number; rank: number }[];
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
 * Fetches a single page and returns the rank of the last entry.
 * The rank IS the total count when on the last page.
 */
function getLastEntryRank(page: StandingsPage): number {
  const results = page.standings.results;
  if (results.length === 0) return 0;
  return results[results.length - 1].rank;
}

/**
 * Uses binary search to find the total participant count for a league.
 * The rank of the last entry on the last page equals the total count.
 *
 * Algorithm:
 * 1. Fetch page 1 to check if small league (no has_next)
 * 2. If has_next, exponentially probe to find upper bound
 * 3. Binary search to find last page with results
 * 4. Return rank of last entry (= total count)
 */
export async function getLeagueParticipantCount(leagueId: number): Promise<number> {
  // Step 1: Fetch page 1
  const page1 = await fetchStandingsPage(leagueId, 1);
  if (!page1) {
    throw new Error('League not found');
  }

  // Small league - single page, return last entry's rank
  if (!page1.standings.has_next) {
    return getLastEntryRank(page1);
  }

  // Step 2: Find upper bound via exponential probing
  let lowerBound = 1;
  let upperBound = 100;

  while (true) {
    const probe = await fetchStandingsPage(leagueId, upperBound);
    // FPL API returns empty results[] for pages beyond last, not 404
    if (probe === null || probe.standings.results.length === 0) {
      // Overshot - the last page is between lowerBound and upperBound
      break;
    }
    if (!probe.standings.has_next) {
      // Found exact last page - return last entry's rank
      return getLastEntryRank(probe);
    }
    lowerBound = upperBound;
    upperBound *= 10; // 100 -> 1000 -> 10000

    // Safety cap at 10000 pages (500k participants)
    if (upperBound > 10000) {
      upperBound = 10000;
      break;
    }
  }

  // Step 3: Binary search for last valid page with results
  while (lowerBound < upperBound - 1) {
    const mid = Math.floor((lowerBound + upperBound) / 2);
    const probe = await fetchStandingsPage(leagueId, mid);

    // Empty results means we've gone past the last page
    if (probe === null || probe.standings.results.length === 0) {
      upperBound = mid;
    } else if (!probe.standings.has_next) {
      // Found exact last page - return last entry's rank
      return getLastEntryRank(probe);
    } else {
      lowerBound = mid;
    }
  }

  // Step 4: Fetch the last page to get exact count
  const lastPage = await fetchStandingsPage(leagueId, lowerBound);
  if (!lastPage || lastPage.standings.results.length === 0) {
    throw new Error('Unexpected: could not find last page');
  }

  // If this page has_next, try the next page
  if (lastPage.standings.has_next) {
    const nextPage = await fetchStandingsPage(leagueId, lowerBound + 1);
    if (nextPage && nextPage.standings.results.length > 0 && !nextPage.standings.has_next) {
      return getLastEntryRank(nextPage);
    }
  }

  return getLastEntryRank(lastPage);
}

/**
 * Determines tournament size tier based on participant count.
 */
export function getTournamentSizeTier(count: number): 'standard' | 'large' | 'mega' {
  if (count <= 48) return 'standard';
  if (count <= 1000) return 'large';
  return 'mega';
}
