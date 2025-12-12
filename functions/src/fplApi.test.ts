import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchFPLBootstrapData, fetchFPLTeamInfo, fetchFPLGameweekScore } from './fplApi';

describe('FPL API', () => {
  beforeEach(() => {
    // Clear mocks before each test
    vi.clearAllMocks();
  });

  describe('fetchFPLBootstrapData', () => {
    it('should fetch data from FPL API', async () => {
      const result = await fetchFPLBootstrapData();
      expect(result).toBeDefined();
    });

    it('should return data with events array', async () => {
      const result = await fetchFPLBootstrapData();
      expect(result.events).toBeDefined();
      expect(Array.isArray(result.events)).toBe(true);
    });

    it('should call fetch with correct FPL API URL', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        json: async () => ({ events: [] }),
      });
      global.fetch = mockFetch;

      await fetchFPLBootstrapData();

      expect(mockFetch).toHaveBeenCalledWith('https://fantasy.premierleague.com/api/bootstrap-static/');
    });
  });

  describe('fetchFPLTeamInfo', () => {
    it('should fetch team info from FPL API', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        json: async () => ({
          id: 158256,
          name: "Owen's XI",
          player_first_name: 'Owen',
          player_last_name: 'Test',
        }),
      });
      global.fetch = mockFetch;

      const result = await fetchFPLTeamInfo(158256);

      expect(mockFetch).toHaveBeenCalledWith('https://fantasy.premierleague.com/api/entry/158256/');
      expect(result.id).toBe(158256);
    });
  });

  describe('fetchFPLGameweekScore', () => {
    it('should fetch gameweek score from FPL API', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        json: async () => ({
          entry_history: {
            event: 7,
            points: 78,
          },
        }),
      });
      global.fetch = mockFetch;

      const result = await fetchFPLGameweekScore(158256, 7);

      expect(mockFetch).toHaveBeenCalledWith('https://fantasy.premierleague.com/api/entry/158256/event/7/picks/');
      expect(result.entry_history.points).toBe(78);
    });
  });
});
