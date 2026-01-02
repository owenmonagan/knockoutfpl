import { describe, it, expect, vi } from 'vitest';
import { getFPLTeamInfo, getUserMiniLeagues, getLeagueStandings, getLeagueInfo } from './fpl';

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

    it('should return overallPoints from summary_overall_points', async () => {
      const mockTeamData = {
        id: 158256,
        name: "Owen's XI",
        player_first_name: 'Owen',
        player_last_name: 'Test',
        summary_overall_points: 427,
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockTeamData,
      });

      const result = await getFPLTeamInfo(158256);

      expect(result.overallPoints).toBe(427);
    });

    it('should return overallRank from summary_overall_rank', async () => {
      const mockTeamData = {
        id: 158256,
        name: "Owen's XI",
        player_first_name: 'Owen',
        player_last_name: 'Test',
        summary_overall_rank: 841192,
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockTeamData,
      });

      const result = await getFPLTeamInfo(158256);

      expect(result.overallRank).toBe(841192);
    });

    it('should return gameweekPoints from summary_event_points', async () => {
      const mockTeamData = {
        id: 158256,
        name: "Owen's XI",
        player_first_name: 'Owen',
        player_last_name: 'Test',
        summary_event_points: 78,
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockTeamData,
      });

      const result = await getFPLTeamInfo(158256);

      expect(result.gameweekPoints).toBe(78);
    });

    it('should return gameweekRank from summary_event_rank', async () => {
      const mockTeamData = {
        id: 158256,
        name: "Owen's XI",
        player_first_name: 'Owen',
        player_last_name: 'Test',
        summary_event_rank: 1656624,
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockTeamData,
      });

      const result = await getFPLTeamInfo(158256);

      expect(result.gameweekRank).toBe(1656624);
    });

    it('should return teamValue in £m from last_deadline_value', async () => {
      const mockTeamData = {
        id: 158256,
        name: "Owen's XI",
        player_first_name: 'Owen',
        player_last_name: 'Test',
        last_deadline_value: 1020,
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockTeamData,
      });

      const result = await getFPLTeamInfo(158256);

      expect(result.teamValue).toBe(102.0);
    });
  });

  describe('getUserMiniLeagues', () => {
    it('should return array of mini-leagues for a team', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          leagues: {
            classic: [
              { id: 123, name: 'Test League', entry_rank: 5 },
              { id: 456, name: 'Another League', entry_rank: 12 },
            ],
          },
        }),
      });

      const result = await getUserMiniLeagues(158256);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: 123, name: 'Test League', entryRank: 5 });
      expect(result[1]).toEqual({ id: 456, name: 'Another League', entryRank: 12 });
      expect(fetch).toHaveBeenCalledWith('/api/fpl/entry/158256/');
    });
  });

  describe('getLeagueStandings', () => {
    it('should return standings for a league', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          standings: {
            results: [
              {
                entry: 158256,
                entry_name: 'Team A',
                player_name: 'John Doe',
                rank: 1,
                total: 500,
              },
              {
                entry: 789012,
                entry_name: 'Team B',
                player_name: 'Jane Smith',
                rank: 2,
                total: 480,
              },
            ],
          },
        }),
      });

      const result = await getLeagueStandings(123);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        fplTeamId: 158256,
        teamName: 'Team A',
        managerName: 'John Doe',
        rank: 1,
        totalPoints: 500,
      });
      expect(fetch).toHaveBeenCalledWith('/api/fpl/leagues-classic/123/standings/');
    });
  });

  describe('getLeagueInfo', () => {
    it('should return league info with name and member count', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          league: {
            id: 29895,
            name: 'London Pub League',
          },
          standings: {
            results: Array(12).fill({ entry: 1 }),
          },
        }),
      });

      const result = await getLeagueInfo(29895);

      expect(result).toEqual({
        id: 29895,
        name: 'London Pub League',
        memberCount: 12,
      });
      expect(fetch).toHaveBeenCalledWith('/api/fpl/leagues-classic/29895/standings/');
    });

    it('should throw error when fetch fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(getLeagueInfo(99999)).rejects.toThrow('Failed to fetch league info');
    });

    it('should return 0 memberCount when standings is empty', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          league: { id: 123, name: 'Empty League' },
          standings: { results: [] },
        }),
      });

      const result = await getLeagueInfo(123);

      expect(result.memberCount).toBe(0);
    });

    it('should return 0 memberCount when standings is undefined', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          league: { id: 123, name: 'No Standings League' },
          // Note: no standings property at all
        }),
      });

      const result = await getLeagueInfo(123);

      expect(result.memberCount).toBe(0);
    });
  });
});
