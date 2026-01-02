const FPL_API_BASE = 'https://fantasy.premierleague.com/api';

// System league IDs to filter out (Overall, country leagues, etc.)
const SYSTEM_LEAGUE_IDS = new Set([
  314,    // Overall
  // Country leagues have predictable patterns but we'll filter by name
]);

// System league name patterns to filter out
const SYSTEM_LEAGUE_PATTERNS = [
  /^Overall$/i,
  /^England$/i,
  /^Scotland$/i,
  /^Wales$/i,
  /^Northern Ireland$/i,
  /^Republic of Ireland$/i,
  // Add other country names as needed
];

export interface ParticipantLeague {
  leagueId: number;
  leagueName: string;
  entryRank: number;
}

/**
 * Checks if a league is a system league (Overall, country, etc.)
 * These should be filtered out as they don't indicate friendship.
 */
function isSystemLeague(leagueId: number, leagueName: string): boolean {
  if (SYSTEM_LEAGUE_IDS.has(leagueId)) {
    return true;
  }

  return SYSTEM_LEAGUE_PATTERNS.some(pattern => pattern.test(leagueName));
}

/**
 * Fetches mini-league memberships for a participant from FPL API.
 * Filters out system leagues (Overall, country leagues).
 * Returns empty array on error (graceful degradation).
 */
export async function fetchParticipantLeagues(
  entryId: number
): Promise<ParticipantLeague[]> {
  try {
    const url = `${FPL_API_BASE}/entry/${entryId}/`;
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`FPL API error for entry ${entryId}: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const classicLeagues = data.leagues?.classic || [];

    return classicLeagues
      .filter((league: { id: number; name: string }) =>
        !isSystemLeague(league.id, league.name)
      )
      .map((league: { id: number; name: string; entry_rank: number }) => ({
        leagueId: league.id,
        leagueName: league.name,
        entryRank: league.entry_rank
      }));
  } catch (error) {
    console.error(`Failed to fetch leagues for entry ${entryId}:`, error);
    return [];
  }
}

/**
 * Fetches mini-leagues for multiple participants in batches.
 * Includes rate limiting to avoid FPL API throttling.
 */
export async function fetchParticipantLeaguesBatch(
  entryIds: number[],
  onProgress?: (count: number, total: number) => void
): Promise<Map<number, ParticipantLeague[]>> {
  const BATCH_SIZE = 10;
  const BATCH_DELAY_MS = 100;

  const results = new Map<number, ParticipantLeague[]>();

  for (let i = 0; i < entryIds.length; i += BATCH_SIZE) {
    const batch = entryIds.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.all(
      batch.map(async (entryId) => ({
        entryId,
        leagues: await fetchParticipantLeagues(entryId)
      }))
    );

    for (const { entryId, leagues } of batchResults) {
      results.set(entryId, leagues);
    }

    onProgress?.(Math.min(i + BATCH_SIZE, entryIds.length), entryIds.length);

    // Rate limiting delay
    if (i + BATCH_SIZE < entryIds.length) {
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }

  return results;
}
