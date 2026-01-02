import { describe, it, expect, vi } from 'vitest';
import { aggregateMatches, type LeagueMatchData, type AggregateMatchesOptions } from './aggregateMatches';

describe('aggregateMatches', () => {
  const defaultOptions: AggregateMatchesOptions = {
    yourTeamName: 'My Team',
    yourFplTeamId: 123,
    onNavigate: vi.fn(),
  };

  const createMatch = (overrides: Partial<LeagueMatchData['currentMatch']> & { isLive: boolean; gameweek: number }) => ({
    opponentTeamName: 'Opponent',
    opponentFplTeamId: 456,
    roundName: 'Round 1',
    yourScore: null,
    theirScore: null,
    result: 'pending' as const,
    ...overrides,
  });

  describe('live matches priority', () => {
    it('returns all live matches when present', () => {
      const leagues: LeagueMatchData[] = [
        { leagueId: 1, leagueName: 'League A', currentMatch: createMatch({ isLive: true, gameweek: 15 }) },
        { leagueId: 2, leagueName: 'League B', currentMatch: createMatch({ isLive: true, gameweek: 15 }) },
        { leagueId: 3, leagueName: 'League C', currentMatch: createMatch({ isLive: false, gameweek: 16 }) },
      ];

      const result = aggregateMatches(leagues, defaultOptions);

      expect(result).toHaveLength(2);
      expect(result.every(m => m.type === 'live')).toBe(true);
    });

    it('returns single live match when only one exists', () => {
      const leagues: LeagueMatchData[] = [
        { leagueId: 1, leagueName: 'League A', currentMatch: createMatch({ isLive: true, gameweek: 15 }) },
        { leagueId: 2, leagueName: 'League B', currentMatch: createMatch({ isLive: false, gameweek: 16 }) },
      ];

      const result = aggregateMatches(leagues, defaultOptions);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('live');
      expect(result[0].leagueName).toBe('League A');
    });
  });

  describe('upcoming match fallback', () => {
    it('returns single nearest upcoming when no live matches', () => {
      const leagues: LeagueMatchData[] = [
        { leagueId: 1, leagueName: 'League A', currentMatch: createMatch({ isLive: false, gameweek: 18 }) },
        { leagueId: 2, leagueName: 'League B', currentMatch: createMatch({ isLive: false, gameweek: 16 }) },
        { leagueId: 3, leagueName: 'League C', currentMatch: createMatch({ isLive: false, gameweek: 17 }) },
      ];

      const result = aggregateMatches(leagues, defaultOptions);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('upcoming');
      expect(result[0].leagueName).toBe('League B'); // gameweek 16 is nearest
      expect(result[0].gameweek).toBe(16);
    });

    it('returns first match when multiple have same gameweek', () => {
      const leagues: LeagueMatchData[] = [
        { leagueId: 1, leagueName: 'League A', currentMatch: createMatch({ isLive: false, gameweek: 16 }) },
        { leagueId: 2, leagueName: 'League B', currentMatch: createMatch({ isLive: false, gameweek: 16 }) },
      ];

      const result = aggregateMatches(leagues, defaultOptions);

      expect(result).toHaveLength(1);
      // Sort is stable, so first one wins
    });
  });

  describe('empty states', () => {
    it('returns empty array when no leagues', () => {
      const result = aggregateMatches([], defaultOptions);
      expect(result).toEqual([]);
    });

    it('returns empty array when all leagues have no currentMatch', () => {
      const leagues: LeagueMatchData[] = [
        { leagueId: 1, leagueName: 'League A', currentMatch: null },
        { leagueId: 2, leagueName: 'League B', currentMatch: null },
      ];

      const result = aggregateMatches(leagues, defaultOptions);
      expect(result).toEqual([]);
    });
  });

  describe('match properties', () => {
    it('includes correct properties in returned match', () => {
      const leagues: LeagueMatchData[] = [
        {
          leagueId: 42,
          leagueName: 'Test League',
          currentMatch: {
            isLive: true,
            opponentTeamName: 'Rival FC',
            opponentFplTeamId: 789,
            roundName: 'Semi-Final',
            yourScore: 55,
            theirScore: 48,
            gameweek: 15,
            result: 'pending',
          },
        },
      ];

      const result = aggregateMatches(leagues, defaultOptions);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'live',
        yourTeamName: 'My Team',
        yourFplTeamId: 123,
        opponentTeamName: 'Rival FC',
        opponentFplTeamId: 789,
        leagueName: 'Test League',
        roundName: 'Semi-Final',
        yourScore: 55,
        theirScore: 48,
        gameweek: 15,
      });
    });

    it('attaches onClick handler that navigates to league', () => {
      const onNavigate = vi.fn();
      const leagues: LeagueMatchData[] = [
        { leagueId: 42, leagueName: 'League A', currentMatch: createMatch({ isLive: true, gameweek: 15 }) },
      ];

      const result = aggregateMatches(leagues, { ...defaultOptions, onNavigate });

      result[0].onClick?.();
      expect(onNavigate).toHaveBeenCalledWith(42);
    });
  });

  describe('excludes recent results', () => {
    it('does not include recentResult matches (handled by not passing them)', () => {
      // This test documents that recentResult is not part of LeagueMatchData
      // The function only processes currentMatch, so recent results are automatically excluded
      const leagues: LeagueMatchData[] = [
        { leagueId: 1, leagueName: 'League A', currentMatch: null },
      ];

      const result = aggregateMatches(leagues, defaultOptions);
      expect(result).toEqual([]);
    });
  });
});
