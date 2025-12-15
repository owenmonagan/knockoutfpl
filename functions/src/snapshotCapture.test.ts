// functions/src/snapshotCapture.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { determineGameweekStatus, getCurrentGameweek, getTeamIdsFromStandings } from './snapshotCapture';
import type { BootstrapResponse, FixtureResponse, LeagueStandingsResponse } from './types';

describe('Snapshot Capture Service', () => {
  describe('determineGameweekStatus', () => {
    it('should return "not_started" when no fixtures have started', () => {
      const fixtures: FixtureResponse[] = [
        { id: 1, event: 16, team_h: 1, team_a: 2, team_h_score: null, team_a_score: null, started: false, finished: false, minutes: 0, kickoff_time: '2025-12-14T15:00:00Z' },
        { id: 2, event: 16, team_h: 3, team_a: 4, team_h_score: null, team_a_score: null, started: false, finished: false, minutes: 0, kickoff_time: '2025-12-14T17:30:00Z' },
      ];

      expect(determineGameweekStatus(fixtures)).toBe('not_started');
    });

    it('should return "in_progress" when some fixtures have started but not all finished', () => {
      const fixtures: FixtureResponse[] = [
        { id: 1, event: 16, team_h: 1, team_a: 2, team_h_score: 2, team_a_score: 1, started: true, finished: true, minutes: 90, kickoff_time: '2025-12-14T15:00:00Z' },
        { id: 2, event: 16, team_h: 3, team_a: 4, team_h_score: 1, team_a_score: 0, started: true, finished: false, minutes: 45, kickoff_time: '2025-12-14T17:30:00Z' },
      ];

      expect(determineGameweekStatus(fixtures)).toBe('in_progress');
    });

    it('should return "finished" when all fixtures have finished', () => {
      const fixtures: FixtureResponse[] = [
        { id: 1, event: 16, team_h: 1, team_a: 2, team_h_score: 2, team_a_score: 1, started: true, finished: true, minutes: 90, kickoff_time: '2025-12-14T15:00:00Z' },
        { id: 2, event: 16, team_h: 3, team_a: 4, team_h_score: 1, team_a_score: 0, started: true, finished: true, minutes: 90, kickoff_time: '2025-12-14T17:30:00Z' },
      ];

      expect(determineGameweekStatus(fixtures)).toBe('finished');
    });

    it('should return "not_started" for empty fixtures array', () => {
      expect(determineGameweekStatus([])).toBe('not_started');
    });
  });

  describe('getCurrentGameweek', () => {
    it('should return current gameweek id from bootstrap', () => {
      const bootstrap: BootstrapResponse = {
        events: [
          { id: 15, name: 'Gameweek 15', is_current: false, is_next: false, finished: true, deadline_time: '2025-12-07T11:00:00Z' },
          { id: 16, name: 'Gameweek 16', is_current: true, is_next: false, finished: false, deadline_time: '2025-12-14T11:00:00Z' },
          { id: 17, name: 'Gameweek 17', is_current: false, is_next: true, finished: false, deadline_time: '2025-12-21T11:00:00Z' },
        ],
        teams: [],
        elements: [],
        element_types: [],
      };

      expect(getCurrentGameweek(bootstrap)).toBe(16);
    });

    it('should throw if no current gameweek found', () => {
      const bootstrap: BootstrapResponse = {
        events: [
          { id: 15, name: 'Gameweek 15', is_current: false, is_next: false, finished: true, deadline_time: '2025-12-07T11:00:00Z' },
        ],
        teams: [],
        elements: [],
        element_types: [],
      };

      expect(() => getCurrentGameweek(bootstrap)).toThrow('No current gameweek found');
    });
  });

  describe('getTeamIdsFromStandings', () => {
    it('should extract team IDs from league standings', () => {
      const standings: LeagueStandingsResponse = {
        league: { id: 634129, name: 'FLOAWO' },
        standings: {
          results: [
            { entry: 158256, entry_name: 'Team A', player_name: 'Manager A', rank: 1, total: 1000 },
            { entry: 234567, entry_name: 'Team B', player_name: 'Manager B', rank: 2, total: 950 },
            { entry: 345678, entry_name: 'Team C', player_name: 'Manager C', rank: 3, total: 900 },
          ],
        },
      };

      expect(getTeamIdsFromStandings(standings)).toEqual([158256, 234567, 345678]);
    });

    it('should return empty array for empty standings', () => {
      const standings: LeagueStandingsResponse = {
        league: { id: 634129, name: 'FLOAWO' },
        standings: { results: [] },
      };

      expect(getTeamIdsFromStandings(standings)).toEqual([]);
    });
  });
});
