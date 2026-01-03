import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Tournament, Round, Participant } from '@/types/tournament';
import { getTournamentMatchups } from './matchups';

// Mock friends service
vi.mock('./friends', () => ({
  getTournamentFriends: vi.fn(),
}));

import { getTournamentFriends } from './friends';

describe('getTournamentMatchups', () => {
  const mockParticipants: Participant[] = [
    { fplTeamId: 1, fplTeamName: 'Team A', managerName: 'Alice', seed: 1 },
    { fplTeamId: 2, fplTeamName: 'Team B', managerName: 'Bob', seed: 2 },
    { fplTeamId: 3, fplTeamName: 'Team C', managerName: 'Charlie', seed: 3 },
    { fplTeamId: 4, fplTeamName: 'Team D', managerName: 'Diana', seed: 4 },
  ];

  const mockRounds: Round[] = [
    {
      roundNumber: 1,
      name: 'Round 1',
      gameweek: 20,
      isComplete: true,
      matches: [
        {
          id: 'm1',
          players: [
            { fplTeamId: 1, seed: 1, score: 60 },
            { fplTeamId: 2, seed: 2, score: 55 },
          ],
          winnerId: 1,
          isBye: false,
        },
        {
          id: 'm2',
          players: [
            { fplTeamId: 3, seed: 3, score: 70 },
            { fplTeamId: 4, seed: 4, score: 65 },
          ],
          winnerId: 3,
          isBye: false,
        },
      ],
    },
    {
      roundNumber: 2,
      name: 'Final',
      gameweek: 21,
      isComplete: false,
      matches: [
        {
          id: 'm3',
          players: [
            { fplTeamId: 1, seed: 1, score: 45 },
            { fplTeamId: 3, seed: 3, score: 50 },
          ],
          winnerId: null,
          isBye: false,
        },
      ],
    },
  ];

  const mockTournament: Tournament = {
    id: 'tournament-1',
    fplLeagueId: 100,
    fplLeagueName: 'Test League',
    creatorUserId: 'user-1',
    startGameweek: 20,
    currentRound: 2,
    currentGameweek: 21,
    totalRounds: 2,
    status: 'active',
    participants: mockParticipants,
    rounds: mockRounds,
    winnerId: null,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns matchups for a specific round', async () => {
    const matchups = await getTournamentMatchups(mockTournament, { round: 1 });

    // Round 1 has 2 matches with 2 players each = 4 matchup results
    expect(matchups).toHaveLength(4);

    // All should be 'finished' since round is complete
    expect(matchups.every((m) => m.matchStatus === 'finished')).toBe(true);
  });

  it('returns latest matchups when no round specified', async () => {
    const matchups = await getTournamentMatchups(mockTournament);

    // Each participant's latest match
    // Team A: Final (round 2)
    // Team B: Round 1 (eliminated)
    // Team C: Final (round 2)
    // Team D: Round 1 (eliminated)
    expect(matchups).toHaveLength(4);

    // Verify Team A is in Final
    const teamA = matchups.find((m) => m.participant.fplTeamId === 1);
    expect(teamA?.round?.roundNumber).toBe(2);

    // Verify Team B is in Round 1 (eliminated there)
    const teamB = matchups.find((m) => m.participant.fplTeamId === 2);
    expect(teamB?.round?.roundNumber).toBe(1);
  });

  it('enriches with friend data when userFplTeamId provided', async () => {
    vi.mocked(getTournamentFriends).mockResolvedValue([
      {
        fplTeamId: 2,
        teamName: 'Team B',
        managerName: 'Bob',
        sharedLeagueCount: 2,
        sharedLeagueNames: ['Work', 'Draft'],
        status: 'in',
        seed: 2,
      },
    ]);

    const matchups = await getTournamentMatchups(mockTournament, {
      round: 1,
      userFplTeamId: 1,
      tournamentLeagueId: 100,
    });

    const teamB = matchups.find((m) => m.participant.fplTeamId === 2);
    expect(teamB?.isFriend).toBe(true);
    expect(teamB?.sharedLeagueCount).toBe(2);

    const teamA = matchups.find((m) => m.participant.fplTeamId === 1);
    expect(teamA?.isFriend).toBe(false);
  });

  it('filters to friends only when friendsOnly is true', async () => {
    vi.mocked(getTournamentFriends).mockResolvedValue([
      {
        fplTeamId: 2,
        teamName: 'Team B',
        managerName: 'Bob',
        sharedLeagueCount: 1,
        sharedLeagueNames: ['Work'],
        status: 'in',
        seed: 2,
      },
    ]);

    const matchups = await getTournamentMatchups(mockTournament, {
      round: 1,
      friendsOnly: true,
      userFplTeamId: 1,
      tournamentLeagueId: 100,
    });

    // Only Bob is a friend
    expect(matchups).toHaveLength(1);
    expect(matchups[0].participant.fplTeamId).toBe(2);
  });

  it('returns correct match statuses', async () => {
    const matchups = await getTournamentMatchups(mockTournament, { round: 2 });

    // Round 2 is not complete and gameweek matches current = live
    expect(matchups[0].matchStatus).toBe('live');

    const r1Matchups = await getTournamentMatchups(mockTournament, { round: 1 });
    expect(r1Matchups[0].matchStatus).toBe('finished');
  });

  it('returns correct match results', async () => {
    const matchups = await getTournamentMatchups(mockTournament, { round: 1 });

    const winner = matchups.find((m) => m.participant.fplTeamId === 1);
    expect(winner?.result).toBe('won');

    const loser = matchups.find((m) => m.participant.fplTeamId === 2);
    expect(loser?.result).toBe('lost');
  });
});
