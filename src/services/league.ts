// src/services/league.ts
// League import status tracking for the frontend

import { dataConnect } from '../lib/firebase';
import { getLeagueImportStatus as getLeagueImportStatusQuery } from '@knockoutfpl/dataconnect';

/**
 * League import status for display in UI.
 * Used to show import progress on Leagues page and tournament creation.
 */
export interface LeagueImportStatus {
  leagueId: number;
  name: string;
  entriesCount: number | null;
  importStatus: 'idle' | 'importing' | 'complete' | 'failed' | null;
  importProgress: number | null;
  lastRefreshAt: Date | null;
  lastRefreshId: string | null;
}

/**
 * Get the current FPL season string (e.g., "2024-25").
 * FPL season runs Aug-May, so Jan-Jul is previous year's season.
 */
function getCurrentSeason(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  // FPL season runs Aug-May
  // If we're in Jan-Jul, we're in the previous year's season
  if (month < 7) { // Jan-Jul
    return `${year - 1}-${year.toString().slice(-2)}`;
  }
  // Aug-Dec, we're in this year's season
  return `${year}-${(year + 1).toString().slice(-2)}`;
}

/**
 * Get the import status of a league.
 * Used to poll for progress during large league imports.
 *
 * @param leagueId - FPL league ID
 * @returns League import status or null if league not found
 */
export async function getLeagueImportStatus(
  leagueId: number
): Promise<LeagueImportStatus | null> {
  const season = getCurrentSeason();

  const result = await getLeagueImportStatusQuery(dataConnect, {
    leagueId,
    season,
  });

  const league = result.data.leagues?.[0];
  if (!league) return null;

  return {
    leagueId: league.leagueId,
    name: league.name,
    entriesCount: league.entriesCount ?? null,
    importStatus: (league.importStatus as LeagueImportStatus['importStatus']) ?? null,
    importProgress: league.importProgress ?? null,
    lastRefreshAt: league.lastRefreshAt ? new Date(league.lastRefreshAt) : null,
    lastRefreshId: league.lastRefreshId ?? null,
  };
}

/**
 * Check if a league has been imported (has a refresh ID).
 * Quick check without full status details.
 *
 * @param leagueId - FPL league ID
 * @returns true if league has been imported
 */
export async function isLeagueImported(leagueId: number): Promise<boolean> {
  const status = await getLeagueImportStatus(leagueId);
  return status?.lastRefreshId !== null;
}

/**
 * Check if a league is currently being imported.
 *
 * @param leagueId - FPL league ID
 * @returns true if league is currently importing
 */
export async function isLeagueImporting(leagueId: number): Promise<boolean> {
  const status = await getLeagueImportStatus(leagueId);
  return status?.importStatus === 'importing';
}
