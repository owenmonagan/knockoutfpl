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
 * Synthetic response for missing/deleted FPL teams
 * Used when treatMissingAsZero option is enabled
 */
export interface SyntheticPicksResponse {
  entry_history: {
    points: 0;
    total_points: number;
    rank: number;
  };
  active_chip: null;
  picks: [];
  _synthetic: true;
  _reason: 'team_deleted' | 'api_error';
}

export interface FetchScoresOptions {
  treatMissingAsZero?: boolean;
}

/**
 * FPL event-status endpoint types
 * Endpoint: /api/event-status/
 */
export interface EventStatusDay {
  bonus_added: boolean;
  date: string;
  event: number;
  points: string;  // "r" = ready/resolved
}

export interface EventStatusResponse {
  status: EventStatusDay[];
  leagues: string;  // "Updating" | "Updated"
}

export interface EventFinalizationStatus {
  event: number;
  isFinalized: boolean;
  allBonusAdded: boolean;
  allPointsReady: boolean;
  leaguesUpdated: boolean;
}

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

export interface GameweekStatus {
  event: number;
  finished: boolean;
  name: string;
  deadlineTime: string;
  isCurrent: boolean;
  isNext: boolean;
}

/**
 * Fetch current gameweek status from bootstrap-static
 */
export async function fetchCurrentGameweek(): Promise<GameweekStatus | null> {
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
      name: currentEvent.name,
      deadlineTime: currentEvent.deadline_time,
      isCurrent: currentEvent.is_current,
      isNext: currentEvent.is_next,
    };
  } catch (error) {
    console.error('Failed to fetch current gameweek:', error);
    return null;
  }
}

/**
 * Batch fetch scores for multiple entries
 *
 * @param entryIds - Array of FPL entry IDs to fetch
 * @param event - Gameweek number
 * @param options - Optional settings
 * @param options.treatMissingAsZero - If true, missing entries get synthetic 0-point responses
 */
export async function fetchScoresForEntries(
  entryIds: number[],
  event: number,
  options?: FetchScoresOptions
): Promise<Map<number, PicksResponse | SyntheticPicksResponse>> {
  const results = new Map<number, PicksResponse | SyntheticPicksResponse>();

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

  // If treatMissingAsZero is enabled, add synthetic entries for missing responses
  if (options?.treatMissingAsZero) {
    const missingEntryIds: number[] = [];
    for (const entryId of entryIds) {
      if (!results.has(entryId)) {
        missingEntryIds.push(entryId);
        results.set(entryId, {
          entry_history: { points: 0, total_points: 0, rank: 0 },
          active_chip: null,
          picks: [],
          _synthetic: true,
          _reason: 'team_deleted',
        });
      }
    }
    if (missingEntryIds.length > 0) {
      console.warn(`[fpl-scores] Missing entries treated as 0 points in GW${event}: ${missingEntryIds.join(', ')}`);
    }
  }

  return results;
}

/**
 * Fetch event status to check if scores are truly final
 *
 * Scores are final when:
 * - All days have bonus_added: true
 * - All days have points: "r" (ready)
 * - leagues: "Updated"
 */
export async function fetchEventStatus(): Promise<EventFinalizationStatus | null> {
  try {
    const url = `${FPL_API_BASE}/event-status/`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`FPL API event-status error: ${response.status}`);
      return null;
    }

    const data = await response.json() as EventStatusResponse;

    if (!data.status || data.status.length === 0) {
      return null;
    }

    const allBonusAdded = data.status.every(day => day.bonus_added);
    const allPointsReady = data.status.every(day => day.points === 'r');
    const leaguesUpdated = data.leagues === 'Updated';

    return {
      event: data.status[0].event,
      isFinalized: allBonusAdded && allPointsReady && leaguesUpdated,
      allBonusAdded,
      allPointsReady,
      leaguesUpdated,
    };
  } catch (error) {
    console.error('Failed to fetch event status:', error);
    return null;
  }
}
