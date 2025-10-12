import { describe, it, expect, vi } from 'vitest';
import { getFPLTeamInfo, getFPLGameweekScore } from './fpl';

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
});
