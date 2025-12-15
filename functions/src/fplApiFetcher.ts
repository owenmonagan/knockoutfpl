// functions/src/fplApiFetcher.ts
import type {
  BootstrapResponse,
  FixtureResponse,
  LiveResponse,
  EventStatusResponse,
  DreamTeamResponse,
  SetPieceResponse,
  LeagueStandingsResponse,
  EntryResponse,
  HistoryResponse,
  TransferResponse,
  PicksResponse,
  ElementSummaryResponse,
} from './types/fplApiResponses';

export const FPL_API_BASE = 'https://fantasy.premierleague.com/api';

async function fetchJSON<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`FPL API error: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchBootstrapStatic(): Promise<BootstrapResponse> {
  return fetchJSON(`${FPL_API_BASE}/bootstrap-static/`);
}

export async function fetchFixtures(gameweek?: number): Promise<FixtureResponse[]> {
  const url = gameweek
    ? `${FPL_API_BASE}/fixtures/?event=${gameweek}`
    : `${FPL_API_BASE}/fixtures/`;
  return fetchJSON(url);
}

export async function fetchLiveScores(gameweek: number): Promise<LiveResponse> {
  return fetchJSON(`${FPL_API_BASE}/event/${gameweek}/live/`);
}

export async function fetchEventStatus(): Promise<EventStatusResponse> {
  return fetchJSON(`${FPL_API_BASE}/event-status/`);
}

export async function fetchDreamTeam(gameweek: number): Promise<DreamTeamResponse> {
  return fetchJSON(`${FPL_API_BASE}/dream-team/${gameweek}/`);
}

export async function fetchSetPieceNotes(): Promise<SetPieceResponse> {
  return fetchJSON(`${FPL_API_BASE}/team/set-piece-notes/`);
}

export async function fetchLeagueStandings(leagueId: number): Promise<LeagueStandingsResponse> {
  return fetchJSON(`${FPL_API_BASE}/leagues-classic/${leagueId}/standings/`);
}

export async function fetchEntry(teamId: number): Promise<EntryResponse> {
  return fetchJSON(`${FPL_API_BASE}/entry/${teamId}/`);
}

export async function fetchHistory(teamId: number): Promise<HistoryResponse> {
  return fetchJSON(`${FPL_API_BASE}/entry/${teamId}/history/`);
}

export async function fetchTransfers(teamId: number): Promise<TransferResponse> {
  return fetchJSON(`${FPL_API_BASE}/entry/${teamId}/transfers/`);
}

export async function fetchPicks(teamId: number, gameweek: number): Promise<PicksResponse> {
  return fetchJSON(`${FPL_API_BASE}/entry/${teamId}/event/${gameweek}/picks/`);
}

export async function fetchElementSummary(elementId: number): Promise<ElementSummaryResponse> {
  return fetchJSON(`${FPL_API_BASE}/element-summary/${elementId}/`);
}
