import { describe, it, expect, vi } from 'vitest';
import { getFPLTeamInfo, getFPLGameweekScore, getFPLTeamPicks, getFPLPlayers, getFPLLiveScores, getCurrentGameweek, getGameweekInfo, getFPLFixtures, getPlayerFixtureStatus, getUserMiniLeagues } from './fpl';

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

  describe('getFPLLiveScores', () => {
    it('should fetch and return live player scores as a Map', async () => {
      const mockLiveData = {
        elements: [
          { id: 1, stats: { total_points: 7 } },
          { id: 234, stats: { total_points: 12 } },
          { id: 567, stats: { total_points: 15 } },
        ],
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockLiveData,
      });

      const result = await getFPLLiveScores(7);

      expect(global.fetch).toHaveBeenCalledWith('/api/fpl/event/7/live/');
      expect(result.size).toBe(3);
      expect(result.get(1)).toBe(7);
      expect(result.get(234)).toBe(12);
      expect(result.get(567)).toBe(15);
    });
  });

  describe('getCurrentGameweek', () => {
    it('should fetch and return current gameweek number', async () => {
      const mockBootstrapData = {
        events: [
          { id: 6, is_current: false, deadline_time: '2025-10-06T10:30:00Z', finished: true },
          { id: 7, is_current: true, deadline_time: '2025-10-13T10:30:00Z', finished: false },
          { id: 8, is_current: false, deadline_time: '2025-10-20T10:30:00Z', finished: false },
        ],
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockBootstrapData,
      });

      const result = await getCurrentGameweek();

      expect(global.fetch).toHaveBeenCalledWith('/api/fpl/bootstrap-static/');
      expect(result).toBe(7);
    });

    it('should return different gameweek when is_current changes', async () => {
      const mockBootstrapData = {
        events: [
          { id: 7, is_current: false, deadline_time: '2025-10-13T10:30:00Z', finished: true },
          { id: 8, is_current: true, deadline_time: '2025-10-20T10:30:00Z', finished: false },
          { id: 9, is_current: false, deadline_time: '2025-10-27T10:30:00Z', finished: false },
        ],
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockBootstrapData,
      });

      const result = await getCurrentGameweek();

      expect(result).toBe(8);
    });
  });

  describe('getGameweekInfo', () => {
    it('should fetch and return gameweek information', async () => {
      const mockBootstrapData = {
        events: [
          { id: 6, is_current: false, deadline_time: '2025-10-06T10:30:00Z', finished: true },
          { id: 7, is_current: true, deadline_time: '2025-10-13T10:30:00Z', finished: false },
          { id: 8, is_current: false, deadline_time: '2025-10-20T10:30:00Z', finished: false },
        ],
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockBootstrapData,
      });

      const result = await getGameweekInfo(7);

      expect(global.fetch).toHaveBeenCalledWith('/api/fpl/bootstrap-static/');
      expect(result.id).toBe(7);
      expect(result.deadline).toBeInstanceOf(Date);
      expect(result.finished).toBe(false);
    });

    it('should return correct info for different gameweek', async () => {
      const mockBootstrapData = {
        events: [
          { id: 7, is_current: false, deadline_time: '2025-10-13T10:30:00Z', finished: true },
          { id: 8, is_current: true, deadline_time: '2025-10-20T10:30:00Z', finished: false },
          { id: 9, is_current: false, deadline_time: '2025-10-27T10:30:00Z', finished: false },
        ],
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockBootstrapData,
      });

      const result = await getGameweekInfo(8);

      expect(result.id).toBe(8);
      expect(result.finished).toBe(false);
    });

    it('should parse the correct deadline from API response', async () => {
      const mockBootstrapData = {
        events: [
          { id: 8, is_current: true, deadline_time: '2025-10-20T15:45:00Z', finished: false },
        ],
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockBootstrapData,
      });

      const result = await getGameweekInfo(8);

      expect(result.deadline.toISOString()).toBe('2025-10-20T15:45:00.000Z');
    });

    it('should find the correct event by ID when multiple events exist', async () => {
      const mockBootstrapData = {
        events: [
          { id: 7, is_current: false, deadline_time: '2025-10-13T10:30:00Z', finished: true },
          { id: 8, is_current: true, deadline_time: '2025-10-20T10:30:00Z', finished: false },
          { id: 9, is_current: false, deadline_time: '2025-10-27T11:00:00Z', finished: false },
        ],
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockBootstrapData,
      });

      const result = await getGameweekInfo(9);

      expect(result.id).toBe(9);
      expect(result.deadline.toISOString()).toBe('2025-10-27T11:00:00.000Z');
      expect(result.finished).toBe(false);
    });
  });

  describe('getFPLFixtures', () => {
    it('should fetch and return fixtures for a gameweek', async () => {
      const mockFixturesData = [
        {
          id: 100,
          event: 7,
          team_h: 1,
          team_a: 2,
          started: false,
          finished: false,
          minutes: 0,
        },
        {
          id: 101,
          event: 7,
          team_h: 3,
          team_a: 4,
          started: true,
          finished: false,
          minutes: 45,
        },
      ];

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockFixturesData,
      });

      const result = await getFPLFixtures(7);

      expect(global.fetch).toHaveBeenCalledWith('/api/fpl/fixtures/?event=7');
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 100,
        event: 7,
        teamH: 1,
        teamA: 2,
        started: false,
        finished: false,
        minutes: 0,
      });
    });
  });

  describe('getPlayerFixtureStatus', () => {
    it('should return "scheduled" when player fixture has not started', () => {
      const playerId = 234;
      const playerMap = new Map([[234, { id: 234, web_name: 'Salah', element_type: 3, team: 2, now_cost: 130 }]]);
      const fixtures = [
        { id: 100, event: 7, teamH: 1, teamA: 2, started: false, finished: false, minutes: 0 },
      ];

      const result = getPlayerFixtureStatus(playerId, fixtures, playerMap);

      expect(result).toBe('scheduled');
    });

    it('should return "live" when player fixture has started but not finished', () => {
      const playerId = 234;
      const playerMap = new Map([[234, { id: 234, web_name: 'Salah', element_type: 3, team: 2, now_cost: 130 }]]);
      const fixtures = [
        { id: 100, event: 7, teamH: 1, teamA: 2, started: true, finished: false, minutes: 45 },
      ];

      const result = getPlayerFixtureStatus(playerId, fixtures, playerMap);

      expect(result).toBe('live');
    });

    it('should return "finished" when player fixture has finished', () => {
      const playerId = 234;
      const playerMap = new Map([[234, { id: 234, web_name: 'Salah', element_type: 3, team: 2, now_cost: 130 }]]);
      const fixtures = [
        { id: 100, event: 7, teamH: 1, teamA: 2, started: true, finished: true, minutes: 90 },
      ];

      const result = getPlayerFixtureStatus(playerId, fixtures, playerMap);

      expect(result).toBe('finished');
    });

    it('should find the correct fixture for player team among multiple fixtures', () => {
      const playerId = 234;
      const playerMap = new Map([[234, { id: 234, web_name: 'Salah', element_type: 3, team: 2, now_cost: 130 }]]);
      const fixtures = [
        { id: 100, event: 7, teamH: 1, teamA: 3, started: false, finished: false, minutes: 0 },
        { id: 101, event: 7, teamH: 2, teamA: 4, started: true, finished: false, minutes: 45 },
        { id: 102, event: 7, teamH: 5, teamA: 6, started: false, finished: false, minutes: 0 },
      ];

      const result = getPlayerFixtureStatus(playerId, fixtures, playerMap);

      expect(result).toBe('live');
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
});
