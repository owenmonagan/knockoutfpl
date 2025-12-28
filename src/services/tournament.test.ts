// src/services/tournament.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTournamentByLeague, callCreateTournament } from './tournament';

// Mock Firebase
vi.mock('../lib/firebase', () => ({
  functions: {},
  dataConnect: {},
}));

// Mock Data Connect
vi.mock('@knockoutfpl/dataconnect', () => ({
  getLeagueTournaments: vi.fn(),
  getTournamentWithParticipants: vi.fn(),
  getTournamentRounds: vi.fn(),
  getRoundMatches: vi.fn(),
  getMatchPicks: vi.fn(),
}));

// Mock Firebase Functions
vi.mock('firebase/functions', () => ({
  httpsCallable: vi.fn(() => vi.fn()),
}));

describe('getTournamentByLeague', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null when no tournament exists', async () => {
    const { getLeagueTournaments } = await import('@knockoutfpl/dataconnect');
    vi.mocked(getLeagueTournaments).mockResolvedValue({
      data: { tournaments: [] },
    } as any);

    const result = await getTournamentByLeague(123);
    expect(result).toBeNull();
  });

  it('should return tournament when one exists', async () => {
    const {
      getLeagueTournaments,
      getTournamentWithParticipants,
      getTournamentRounds,
    } = await import('@knockoutfpl/dataconnect');

    vi.mocked(getLeagueTournaments).mockResolvedValue({
      data: {
        tournaments: [{
          id: 'tournament-123',
          fplLeagueName: 'Test League',
          creatorUid: 'user-123',
          currentRound: 1,
          totalRounds: 3,
          status: 'active',
        }],
      },
    } as any);

    vi.mocked(getTournamentWithParticipants).mockResolvedValue({
      data: {
        tournament: {
          id: 'tournament-123',
          startEvent: 20,
          winnerEntryId: null,
        },
        participants: [],
      },
    } as any);

    vi.mocked(getTournamentRounds).mockResolvedValue({
      data: {
        rounds: [],
      },
    } as any);

    const result = await getTournamentByLeague(123);
    expect(result?.id).toBe('tournament-123');
    expect(result?.fplLeagueName).toBe('Test League');
  });
});

describe('callCreateTournament', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call the Cloud Function with league ID', async () => {
    const { httpsCallable } = await import('firebase/functions');
    const mockCallable = vi.fn().mockResolvedValue({
      data: {
        tournamentId: 'new-tournament-123',
        participantCount: 8,
        totalRounds: 3,
        startEvent: 20,
      },
    });
    vi.mocked(httpsCallable).mockReturnValue(mockCallable);

    const result = await callCreateTournament(12345);

    expect(result.tournamentId).toBe('new-tournament-123');
    expect(result.participantCount).toBe(8);
    expect(mockCallable).toHaveBeenCalledWith({ fplLeagueId: 12345 });
  });
});
