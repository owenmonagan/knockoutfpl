// functions/src/fplApiFetcher.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchBootstrapStatic, fetchFixtures, fetchLiveScores, fetchLeagueStandings, fetchEntry, fetchHistory, fetchTransfers, fetchPicks, FPL_API_BASE } from './fplApiFetcher';
import type { BootstrapResponse } from './types/fplApiResponses';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('FPL API Fetcher', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('fetchBootstrapStatic', () => {
    it('should fetch and return bootstrap data', async () => {
      const mockData: BootstrapResponse = {
        events: [{ id: 16, name: 'Gameweek 16', is_current: true, is_next: false, finished: false, deadline_time: '2025-12-14T11:00:00Z' }],
        teams: [],
        elements: [],
        element_types: [],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await fetchBootstrapStatic();

      expect(mockFetch).toHaveBeenCalledWith(`${FPL_API_BASE}/bootstrap-static/`);
      expect(result).toEqual(mockData);
    });

    it('should throw on fetch failure', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

      await expect(fetchBootstrapStatic()).rejects.toThrow('FPL API error: 500');
    });
  });

  describe('fetchFixtures', () => {
    it('should fetch all fixtures', async () => {
      const mockData = [{ id: 1, event: 16, team_h: 1, team_a: 2, team_h_score: null, team_a_score: null, started: true, finished: false, minutes: 45, kickoff_time: '2025-12-14T12:30:00Z' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await fetchFixtures();

      expect(mockFetch).toHaveBeenCalledWith(`${FPL_API_BASE}/fixtures/`);
      expect(result).toEqual(mockData);
    });

    it('should fetch fixtures for specific gameweek', async () => {
      const mockData = [{ id: 1, event: 16, team_h: 1, team_a: 2, team_h_score: null, team_a_score: null, started: true, finished: false, minutes: 45, kickoff_time: '2025-12-14T12:30:00Z' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await fetchFixtures(16);

      expect(mockFetch).toHaveBeenCalledWith(`${FPL_API_BASE}/fixtures/?event=16`);
      expect(result).toEqual(mockData);
    });
  });

  describe('fetchLiveScores', () => {
    it('should fetch live scores for gameweek', async () => {
      const mockData = { elements: [{ id: 1, stats: { total_points: 10, minutes: 90, goals_scored: 1, assists: 0, clean_sheets: 0, bonus: 2 } }] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await fetchLiveScores(16);

      expect(mockFetch).toHaveBeenCalledWith(`${FPL_API_BASE}/event/16/live/`);
      expect(result).toEqual(mockData);
    });
  });

  describe('fetchLeagueStandings', () => {
    it('should fetch league standings', async () => {
      const mockData = {
        league: { id: 634129, name: 'FLOAWO' },
        standings: { results: [{ entry: 158256, entry_name: 'Test', player_name: 'Test User', rank: 1, total: 1000 }] },
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await fetchLeagueStandings(634129);

      expect(mockFetch).toHaveBeenCalledWith(`${FPL_API_BASE}/leagues-classic/634129/standings/`);
      expect(result).toEqual(mockData);
    });
  });

  describe('fetchEntry', () => {
    it('should fetch team entry data', async () => {
      const mockData = {
        id: 158256,
        name: 'Test Team',
        player_first_name: 'Test',
        player_last_name: 'User',
        summary_overall_points: 1000,
        summary_overall_rank: 500,
        summary_event_points: 65,
        summary_event_rank: 100,
        last_deadline_value: 1000,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await fetchEntry(158256);

      expect(mockFetch).toHaveBeenCalledWith(`${FPL_API_BASE}/entry/158256/`);
      expect(result).toEqual(mockData);
    });
  });

  describe('fetchHistory', () => {
    it('should fetch team history', async () => {
      const mockData = { current: [], chips: [] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await fetchHistory(158256);

      expect(mockFetch).toHaveBeenCalledWith(`${FPL_API_BASE}/entry/158256/history/`);
      expect(result).toEqual(mockData);
    });
  });

  describe('fetchTransfers', () => {
    it('should fetch team transfers', async () => {
      const mockData = [{ element_in: 1, element_out: 2, event: 16, time: '2025-12-14T10:00:00Z' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await fetchTransfers(158256);

      expect(mockFetch).toHaveBeenCalledWith(`${FPL_API_BASE}/entry/158256/transfers/`);
      expect(result).toEqual(mockData);
    });
  });

  describe('fetchPicks', () => {
    it('should fetch team picks for gameweek', async () => {
      const mockData = {
        picks: [],
        entry_history: { event: 16, points: 65, total_points: 1000, rank: 100 },
        active_chip: null,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await fetchPicks(158256, 16);

      expect(mockFetch).toHaveBeenCalledWith(`${FPL_API_BASE}/entry/158256/event/16/picks/`);
      expect(result).toEqual(mockData);
    });
  });
});
