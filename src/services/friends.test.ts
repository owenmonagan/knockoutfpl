import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock DataConnect module
vi.mock('@knockoutfpl/dataconnect', () => ({
  dataConnect: {},
  getFriendsInTournament: vi.fn(),
  getLeagueEntriesForEntries: vi.fn(),
  getLeagues: vi.fn(),
}));

import { getFriendsInTournament, getLeagueEntriesForEntries, getLeagues } from '@knockoutfpl/dataconnect';
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
    // User is in leagues 200 (work), 300 (draft) - system leagues (id < 336) are filtered out by query
    vi.mocked(getFriendsInTournament).mockResolvedValue({
      data: {
        userLeagues: [
          { leagueId: 200 },
          { leagueId: 300 },
        ],
        tournamentParticipants: [], // Not used - we pass participants directly
      },
    } as any);

    // Participant leagues from LeagueEntry table
    vi.mocked(getLeagueEntriesForEntries).mockResolvedValue({
      data: {
        leagueEntries: [
          // Alice (1002) - shares Work League (200)
          { entryId: 1002, leagueId: 200 },
          // Bob (1003) - no shared leagues
          { entryId: 1003, leagueId: 400 },
          // Charlie (1004) - shares Work (200) + Draft (300)
          { entryId: 1004, leagueId: 200 },
          { entryId: 1004, leagueId: 300 },
        ],
      },
    } as any);

    // League names lookup
    vi.mocked(getLeagues).mockResolvedValue({
      data: {
        leagues: [
          { leagueId: 200, name: 'Work League' },
          { leagueId: 300, name: 'Draft League' },
        ],
      },
    } as any);

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
    expect(friends[0].sharedLeagueNames).toEqual(['Draft League', 'Work League']);

    expect(friends[1].fplTeamId).toBe(1002); // Alice - 1 shared
    expect(friends[1].sharedLeagueCount).toBe(1);
  });

  it('returns empty array when user has no leagues', async () => {
    vi.mocked(getFriendsInTournament).mockResolvedValue({
      data: {
        userLeagues: [], // No leagues
        tournamentParticipants: [],
      },
    } as any);

    const friends = await getTournamentFriends('t-1', 100, 1001, mockParticipants);
    expect(friends).toEqual([]);
  });

  it('returns empty array when no participants share leagues with user', async () => {
    vi.mocked(getFriendsInTournament).mockResolvedValue({
      data: {
        userLeagues: [{ leagueId: 200 }],
        tournamentParticipants: [],
      },
    } as any);

    vi.mocked(getLeagueEntriesForEntries).mockResolvedValue({
      data: {
        leagueEntries: [
          // No one shares league 200
          { entryId: 1002, leagueId: 400 },
          { entryId: 1003, leagueId: 500 },
        ],
      },
    } as any);

    const friends = await getTournamentFriends('t-1', 100, 1001, mockParticipants);
    expect(friends).toEqual([]);
  });

  it('excludes tournament league from friend calculation', async () => {
    vi.mocked(getFriendsInTournament).mockResolvedValue({
      data: {
        userLeagues: [
          { leagueId: 100 }, // Tournament league - should be excluded
          { leagueId: 200 },
        ],
        tournamentParticipants: [],
      },
    } as any);

    vi.mocked(getLeagueEntriesForEntries).mockResolvedValue({
      data: {
        leagueEntries: [
          // Alice only shares tournament league 100 - NOT a friend
          { entryId: 1002, leagueId: 100 },
          // Bob shares work league 200 - IS a friend
          { entryId: 1003, leagueId: 200 },
        ],
      },
    } as any);

    vi.mocked(getLeagues).mockResolvedValue({
      data: {
        leagues: [{ leagueId: 200, name: 'Work League' }],
      },
    } as any);

    const friends = await getTournamentFriends('t-1', 100, 1001, mockParticipants);

    // Only Bob should be a friend (Alice only shares tournament league)
    expect(friends).toHaveLength(1);
    expect(friends[0].fplTeamId).toBe(1003);
  });

  it('sorts alphabetically when shared count is equal', async () => {
    vi.mocked(getFriendsInTournament).mockResolvedValue({
      data: {
        userLeagues: [{ leagueId: 200 }],
        tournamentParticipants: [],
      },
    } as any);

    vi.mocked(getLeagueEntriesForEntries).mockResolvedValue({
      data: {
        leagueEntries: [
          { entryId: 1002, leagueId: 200 },
          { entryId: 1004, leagueId: 200 },
        ],
      },
    } as any);

    vi.mocked(getLeagues).mockResolvedValue({
      data: {
        leagues: [{ leagueId: 200, name: 'Work League' }],
      },
    } as any);

    const friends = await getTournamentFriends('t-1', 100, 1001, mockParticipants);

    // Both have 1 shared league, so sorted alphabetically by team name
    expect(friends[0].teamName).toBe('Best Friend'); // Charlie
    expect(friends[1].teamName).toBe('Friend Team'); // Alice
  });

  it('handles empty participants list', async () => {
    vi.mocked(getFriendsInTournament).mockResolvedValue({
      data: {
        userLeagues: [{ leagueId: 200 }],
        tournamentParticipants: [],
      },
    } as any);

    const friends = await getTournamentFriends('t-1', 100, 1001, []);
    expect(friends).toEqual([]);
  });

  it('handles participants list with only the user', async () => {
    vi.mocked(getFriendsInTournament).mockResolvedValue({
      data: {
        userLeagues: [{ leagueId: 200 }],
        tournamentParticipants: [],
      },
    } as any);

    const onlyMe: Participant[] = [
      { fplTeamId: 1001, fplTeamName: 'My Team', managerName: 'Me', seed: 1 },
    ];

    const friends = await getTournamentFriends('t-1', 100, 1001, onlyMe);
    expect(friends).toEqual([]);
  });
});
