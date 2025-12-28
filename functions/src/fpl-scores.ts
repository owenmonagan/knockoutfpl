/**
 * FPL Score Fetching
 *
 * Fetches final gameweek scores from the FPL API.
 */

import { FPL_API_BASE } from './fplApiFetcher';
import type { PicksResponse, BootstrapResponse } from './types/fplApiResponses';

// Re-export the PicksResponse type for convenience
export type { PicksResponse as FPLPicksResponse } from './types/fplApiResponses';

/**
 * Fetch picks/score for an entry in a specific gameweek
 */
export async function fetchEntryPicks(
  entryId: number,
  event: number
): Promise<PicksResponse | null> {
  try {
    const url = `${FPL_API_BASE}/entry/${entryId}/event/${event}/picks/`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`FPL API error for entry ${entryId} event ${event}: ${response.status}`);
      return null;
    }

    return await response.json() as PicksResponse;
  } catch (error) {
    console.error(`Failed to fetch picks for entry ${entryId} event ${event}:`, error);
    return null;
  }
}

/**
 * Fetch current gameweek status from bootstrap-static
 */
export async function fetchCurrentGameweek(): Promise<{
  event: number;
  finished: boolean;
} | null> {
  try {
    const url = `${FPL_API_BASE}/bootstrap-static/`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`FPL API bootstrap error: ${response.status}`);
      return null;
    }

    const data = await response.json() as BootstrapResponse;
    const currentEvent = data.events.find(e => e.is_current);

    if (!currentEvent) {
      return null;
    }

    return {
      event: currentEvent.id,
      finished: currentEvent.finished,
    };
  } catch (error) {
    console.error('Failed to fetch current gameweek:', error);
    return null;
  }
}

/**
 * Batch fetch scores for multiple entries
 */
export async function fetchScoresForEntries(
  entryIds: number[],
  event: number
): Promise<Map<number, PicksResponse>> {
  const results = new Map<number, PicksResponse>();

  // Fetch in parallel with rate limiting (max 10 concurrent)
  const batchSize = 10;
  for (let i = 0; i < entryIds.length; i += batchSize) {
    const batch = entryIds.slice(i, i + batchSize);
    const promises = batch.map(async (entryId) => {
      const picks = await fetchEntryPicks(entryId, event);
      if (picks) {
        results.set(entryId, picks);
      }
    });
    await Promise.all(promises);

    // Small delay between batches to be nice to FPL API
    if (i + batchSize < entryIds.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
}
