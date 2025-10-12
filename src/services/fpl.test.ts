import { describe, it, expect, vi } from 'vitest';
import { getFPLTeamInfo, getFPLGameweekScore, getFPLTeamPicks, getFPLPlayers } from './fpl';

describe('FPL Service', () => {
  describe('getFPLTeamInfo', () => {
    it('should fetch and return team information', async () => {
      const mockTeamData = {
        id: 158256,
        name: "Owen's XI",
        player_first_name: 'Owen',
        player_last_name: 'Test',
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockTeamData,
      });

      const result = await getFPLTeamInfo(158256);

      expect(global.fetch).toHaveBeenCalledWith('/api/fpl/entry/158256/');
      expect(result).toEqual({
        teamId: 158256,
        teamName: "Owen's XI",
        managerName: 'Owen Test',
      });
    });
  });

  describe('getFPLGameweekScore', () => {
    it('should fetch and return gameweek score', async () => {
      const mockGameweekData = {
        entry_history: {
          points: 78,
          event: 7,
        },
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockGameweekData,
      });

      const result = await getFPLGameweekScore(158256, 7);

      expect(global.fetch).toHaveBeenCalledWith('/api/fpl/entry/158256/event/7/picks/');
      expect(result).toEqual({
        points: 78,
        gameweek: 7,
      });
    });
  });

  describe('getFPLTeamPicks', () => {
    it('should fetch and return team picks with player details', async () => {
      const mockPicksData = {
        picks: [
          { element: 1, position: 1, multiplier: 1, is_captain: false, is_vice_captain: false },
          { element: 234, position: 2, multiplier: 2, is_captain: true, is_vice_captain: false },
          { element: 567, position: 3, multiplier: 1, is_captain: false, is_vice_captain: true },
        ],
        entry_history: {
          event: 7,
          points: 78,
          total_points: 500,
        },
        active_chip: null,
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockPicksData,
      });

      const result = await getFPLTeamPicks(158256, 7);

      expect(global.fetch).toHaveBeenCalledWith('/api/fpl/entry/158256/event/7/picks/');
      expect(result).toEqual({
        picks: [
          { element: 1, position: 1, multiplier: 1, is_captain: false, is_vice_captain: false },
          { element: 234, position: 2, multiplier: 2, is_captain: true, is_vice_captain: false },
          { element: 567, position: 3, multiplier: 1, is_captain: false, is_vice_captain: true },
        ],
        entryHistory: {
          event: 7,
          points: 78,
          totalPoints: 500,
        },
        activeChip: null,
      });
    });
  });

  describe('getFPLPlayers', () => {
    it('should fetch and return player data map', async () => {
      const mockBootstrapData = {
        elements: [
          { id: 1, web_name: 'Pope', element_type: 1, team: 1, now_cost: 50 },
          { id: 234, web_name: 'Salah', element_type: 3, team: 2, now_cost: 130 },
          { id: 567, web_name: 'Haaland', element_type: 4, team: 3, now_cost: 145 },
        ],
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockBootstrapData,
      });

      const result = await getFPLPlayers();

      expect(global.fetch).toHaveBeenCalledWith('/api/fpl/bootstrap-static/');
      expect(result.size).toBe(3);
      expect(result.get(1)).toEqual({
        id: 1,
        web_name: 'Pope',
        element_type: 1,
        team: 1,
        now_cost: 50,
      });
      expect(result.get(234)).toEqual({
        id: 234,
        web_name: 'Salah',
        element_type: 3,
        team: 2,
        now_cost: 130,
      });
    });
  });
});
