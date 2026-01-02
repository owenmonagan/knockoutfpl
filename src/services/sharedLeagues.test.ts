import { describe, it, expect } from 'vitest';
import { computeSharedLeagueCounts, sortParticipantsByFriendship } from './sharedLeagues';

describe('sharedLeagues service', () => {
  describe('computeSharedLeagueCounts', () => {
    it('counts shared leagues correctly', () => {
      const userLeagueIds = [100, 200, 300];
      const participantLeagues = [
        { entryId: 1, leagueId: 100 },  // 1 shared
        { entryId: 1, leagueId: 400 },  // Not shared
        { entryId: 2, leagueId: 100 },  // 1 shared
        { entryId: 2, leagueId: 200 },  // 2 shared total
        { entryId: 3, leagueId: 500 },  // 0 shared
      ];

      const counts = computeSharedLeagueCounts(userLeagueIds, participantLeagues);

      expect(counts.get(1)).toBe(1);
      expect(counts.get(2)).toBe(2);
      expect(counts.get(3)).toBe(0);
    });

    it('returns empty map for empty inputs', () => {
      const counts = computeSharedLeagueCounts([], []);
      expect(counts.size).toBe(0);
    });

    it('handles participant with no shared leagues', () => {
      const userLeagueIds = [100, 200];
      const participantLeagues = [
        { entryId: 1, leagueId: 999 },
      ];

      const counts = computeSharedLeagueCounts(userLeagueIds, participantLeagues);
      expect(counts.get(1)).toBe(0);
    });

    it('handles multiple entries for same participant correctly', () => {
      const userLeagueIds = [100, 200, 300];
      const participantLeagues = [
        { entryId: 1, leagueId: 100 },
        { entryId: 1, leagueId: 200 },
        { entryId: 1, leagueId: 300 },
      ];

      const counts = computeSharedLeagueCounts(userLeagueIds, participantLeagues);
      expect(counts.get(1)).toBe(3);
    });
  });

  describe('sortParticipantsByFriendship', () => {
    it('sorts participants by shared count descending', () => {
      const participants = [
        { fplTeamId: 1, fplTeamName: 'Team A', managerName: 'Alice', seed: 1 },
        { fplTeamId: 2, fplTeamName: 'Team B', managerName: 'Bob', seed: 2 },
        { fplTeamId: 3, fplTeamName: 'Team C', managerName: 'Charlie', seed: 3 },
      ];

      const sharedCounts = new Map([
        [1, 1],  // Alice: 1 shared
        [2, 3],  // Bob: 3 shared (friend!)
        [3, 0],  // Charlie: 0 shared
      ]);

      const sorted = sortParticipantsByFriendship(participants, sharedCounts);

      expect(sorted[0].fplTeamId).toBe(2); // Bob first (3 shared)
      expect(sorted[1].fplTeamId).toBe(1); // Alice second (1 shared)
      expect(sorted[2].fplTeamId).toBe(3); // Charlie last (0 shared)
    });

    it('falls back to alphabetical for same shared count', () => {
      const participants = [
        { fplTeamId: 1, fplTeamName: 'Zebra FC', managerName: 'Zach', seed: 1 },
        { fplTeamId: 2, fplTeamName: 'Alpha FC', managerName: 'Adam', seed: 2 },
      ];

      const sharedCounts = new Map([
        [1, 1],
        [2, 1], // Same count
      ]);

      const sorted = sortParticipantsByFriendship(participants, sharedCounts);

      expect(sorted[0].fplTeamName).toBe('Alpha FC'); // Alphabetical
      expect(sorted[1].fplTeamName).toBe('Zebra FC');
    });

    it('handles participants not in sharedCounts map (defaults to 0)', () => {
      const participants = [
        { fplTeamId: 1, fplTeamName: 'Team A', managerName: 'Alice', seed: 1 },
        { fplTeamId: 2, fplTeamName: 'Team B', managerName: 'Bob', seed: 2 },
      ];

      const sharedCounts = new Map([
        [1, 2], // Only Alice has a count
      ]);

      const sorted = sortParticipantsByFriendship(participants, sharedCounts);

      expect(sorted[0].fplTeamId).toBe(1); // Alice first (2 shared)
      expect(sorted[1].fplTeamId).toBe(2); // Bob last (0 shared - default)
    });

    it('does not mutate original array', () => {
      const participants = [
        { fplTeamId: 1, fplTeamName: 'Team A', managerName: 'Alice', seed: 1 },
        { fplTeamId: 2, fplTeamName: 'Team B', managerName: 'Bob', seed: 2 },
      ];

      const sharedCounts = new Map([
        [1, 0],
        [2, 5],
      ]);

      const originalFirst = participants[0];
      sortParticipantsByFriendship(participants, sharedCounts);

      expect(participants[0]).toBe(originalFirst);
    });

    it('handles empty participants array', () => {
      const sorted = sortParticipantsByFriendship([], new Map());
      expect(sorted).toEqual([]);
    });
  });
});
