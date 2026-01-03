import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('./fpl', () => ({
  getUserMiniLeagues: vi.fn(),
}));

vi.mock('./tournament', () => ({
  getParticipantLeaguesForTournament: vi.fn(),
}));

import { getUserMiniLeagues } from './fpl';
import { getParticipantLeaguesForTournament } from './tournament';
import { getTournamentFriends } from './friends';
import type { Participant } from '@/types/tournament';

describe('getTournamentFriends', () => {
  const mockParticipants: Participant[] = [
    { fplTeamId: 1001, fplTeamName: 'My Team', managerName: 'Me', seed: 1 },
    { fplTeamId: 1002, fplTeamName: 'Friend Team', managerName: 'Alice', seed: 2 },
    { fplTeamId: 1003, fplTeamName: 'Stranger Team', managerName: 'Bob', seed: 3 },
    { fplTeamId: 1004, fplTeamName: 'Best Friend', managerName: 'Charlie', seed: 4 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('identifies friends who share leagues (excluding tournament league)', async () => {
    // User is in leagues 100 (tournament), 200 (work), 300 (draft)
    vi.mocked(getUserMiniLeagues).mockResolvedValue([
      { id: 100, name: 'Tournament League', entryRank: 1 },
      { id: 200, name: 'Work League', entryRank: 5 },
      { id: 300, name: 'Draft League', entryRank: 2 },
    ]);

    // Participant leagues stored in DB
    vi.mocked(getParticipantLeaguesForTournament).mockResolvedValue([
      // User (1001) - should be skipped
      { entryId: 1001, leagueId: 100, leagueName: 'Tournament League' },
      { entryId: 1001, leagueId: 200, leagueName: 'Work League' },
      // Alice (1002) - shares Work League -> friend
      { entryId: 1002, leagueId: 100, leagueName: 'Tournament League' },
      { entryId: 1002, leagueId: 200, leagueName: 'Work League' },
      // Bob (1003) - only shares tournament league -> NOT a friend
      { entryId: 1003, leagueId: 100, leagueName: 'Tournament League' },
      // Charlie (1004) - shares Work + Draft -> best friend (2 shared)
      { entryId: 1004, leagueId: 100, leagueName: 'Tournament League' },
      { entryId: 1004, leagueId: 200, leagueName: 'Work League' },
      { entryId: 1004, leagueId: 300, leagueName: 'Draft League' },
    ]);

    const friends = await getTournamentFriends(
      'tournament-123',
      100, // tournament league ID
      1001, // user's FPL team ID
      mockParticipants
    );

    // Should have 2 friends: Charlie (2 shared) and Alice (1 shared)
    expect(friends).toHaveLength(2);

    // Sorted by sharedLeagueCount desc
    expect(friends[0].fplTeamId).toBe(1004); // Charlie - 2 shared
    expect(friends[0].sharedLeagueCount).toBe(2);
    expect(friends[0].sharedLeagueNames).toEqual(['Work League', 'Draft League']);

    expect(friends[1].fplTeamId).toBe(1002); // Alice - 1 shared
    expect(friends[1].sharedLeagueCount).toBe(1);
  });

  it('returns empty array when user has no friends', async () => {
    vi.mocked(getUserMiniLeagues).mockResolvedValue([
      { id: 100, name: 'Tournament League', entryRank: 1 },
    ]);

    vi.mocked(getParticipantLeaguesForTournament).mockResolvedValue([
      { entryId: 1002, leagueId: 100, leagueName: 'Tournament League' },
      { entryId: 1003, leagueId: 100, leagueName: 'Tournament League' },
    ]);

    const friends = await getTournamentFriends('t-1', 100, 1001, mockParticipants);
    expect(friends).toEqual([]);
  });

  it('excludes self from friends list', async () => {
    vi.mocked(getUserMiniLeagues).mockResolvedValue([
      { id: 100, name: 'Tournament League', entryRank: 1 },
      { id: 200, name: 'Work League', entryRank: 5 },
    ]);

    vi.mocked(getParticipantLeaguesForTournament).mockResolvedValue([
      { entryId: 1001, leagueId: 100, leagueName: 'Tournament League' },
      { entryId: 1001, leagueId: 200, leagueName: 'Work League' },
    ]);

    const friends = await getTournamentFriends('t-1', 100, 1001, mockParticipants);
    expect(friends).toEqual([]);
  });

  it('sorts alphabetically when shared count is equal', async () => {
    vi.mocked(getUserMiniLeagues).mockResolvedValue([
      { id: 100, name: 'Tournament League', entryRank: 1 },
      { id: 200, name: 'Work League', entryRank: 5 },
    ]);

    vi.mocked(getParticipantLeaguesForTournament).mockResolvedValue([
      { entryId: 1002, leagueId: 200, leagueName: 'Work League' },
      { entryId: 1004, leagueId: 200, leagueName: 'Work League' },
    ]);

    const friends = await getTournamentFriends('t-1', 100, 1001, mockParticipants);

    // Both have 1 shared league, so sorted alphabetically by team name
    expect(friends[0].teamName).toBe('Best Friend'); // Charlie
    expect(friends[1].teamName).toBe('Friend Team'); // Alice
  });
});
