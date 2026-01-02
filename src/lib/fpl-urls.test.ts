import { describe, it, expect } from 'vitest';
import { getFplTeamUrl } from './fpl-urls';

describe('getFplTeamUrl', () => {
  describe('when roundStarted is true', () => {
    it('returns event URL with gameweek', () => {
      const url = getFplTeamUrl(158256, 15, true);
      expect(url).toBe('https://fantasy.premierleague.com/entry/158256/event/15');
    });

    it('works with different fplTeamId values', () => {
      const url = getFplTeamUrl(12345, 10, true);
      expect(url).toBe('https://fantasy.premierleague.com/entry/12345/event/10');
    });

    it('works with gameweek 1', () => {
      const url = getFplTeamUrl(999999, 1, true);
      expect(url).toBe('https://fantasy.premierleague.com/entry/999999/event/1');
    });

    it('works with gameweek 38', () => {
      const url = getFplTeamUrl(100, 38, true);
      expect(url).toBe('https://fantasy.premierleague.com/entry/100/event/38');
    });
  });

  describe('when roundStarted is false', () => {
    it('returns history URL without gameweek', () => {
      const url = getFplTeamUrl(158256, 15, false);
      expect(url).toBe('https://fantasy.premierleague.com/entry/158256/history');
    });

    it('ignores gameweek parameter and returns history URL', () => {
      const url = getFplTeamUrl(12345, 10, false);
      expect(url).toBe('https://fantasy.premierleague.com/entry/12345/history');
    });

    it('works with different fplTeamId values', () => {
      const url = getFplTeamUrl(999999, 1, false);
      expect(url).toBe('https://fantasy.premierleague.com/entry/999999/history');
    });
  });
});
