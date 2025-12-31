// src/services/tournament.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getTournamentByLeague,
  callCreateTournament,
  callRefreshTournament,
  getTournamentSummaryForLeague,
} from './tournament';

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
  getPicksForEvent: vi.fn(),
  getCurrentEvent: vi.fn(),
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
      getCurrentEvent,
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

    vi.mocked(getCurrentEvent).mockResolvedValue({
      data: {
        events: [{ event: 19 }],
      },
    } as any);

    const result = await getTournamentByLeague(123);
    expect(result?.id).toBe('tournament-123');
    expect(result?.fplLeagueName).toBe('Test League');
    expect(result?.currentGameweek).toBe(19);
  });
});

describe('callCreateTournament', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call the Cloud Function with league ID only when startEvent not provided', async () => {
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

  it('should call the Cloud Function with league ID and startEvent when provided', async () => {
    const { httpsCallable } = await import('firebase/functions');
    const mockCallable = vi.fn().mockResolvedValue({
      data: {
        tournamentId: 'new-tournament-456',
        participantCount: 16,
        totalRounds: 4,
        startEvent: 25,
      },
    });
    vi.mocked(httpsCallable).mockReturnValue(mockCallable);

    const result = await callCreateTournament(12345, 25);

    expect(result.tournamentId).toBe('new-tournament-456');
    expect(result.participantCount).toBe(16);
    expect(result.totalRounds).toBe(4);
    expect(result.startEvent).toBe(25);
    expect(mockCallable).toHaveBeenCalledWith({ fplLeagueId: 12345, startEvent: 25 });
  });

  it('should not include startEvent in request when undefined', async () => {
    const { httpsCallable } = await import('firebase/functions');
    const mockCallable = vi.fn().mockResolvedValue({
      data: {
        tournamentId: 'new-tournament-789',
        participantCount: 8,
        totalRounds: 3,
        startEvent: 20,
      },
    });
    vi.mocked(httpsCallable).mockReturnValue(mockCallable);

    const result = await callCreateTournament(12345, undefined);

    expect(result.tournamentId).toBe('new-tournament-789');
    expect(mockCallable).toHaveBeenCalledWith({ fplLeagueId: 12345 });
  });
});

describe('callRefreshTournament', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null on error without throwing', async () => {
    const { httpsCallable } = await import('firebase/functions');
    const mockCallable = vi.fn().mockRejectedValue(new Error('Network error'));
    vi.mocked(httpsCallable).mockReturnValue(mockCallable);

    const result = await callRefreshTournament('tournament-123');

    expect(result).toBeNull();
  });

  it('should return refresh result on success', async () => {
    const { httpsCallable } = await import('firebase/functions');
    const mockCallable = vi.fn().mockResolvedValue({
      data: { picksRefreshed: 5, matchesResolved: 2 },
    });
    vi.mocked(httpsCallable).mockReturnValue(mockCallable);

    const result = await callRefreshTournament('tournament-123');

    expect(result).toEqual({ picksRefreshed: 5, matchesResolved: 2 });
    expect(mockCallable).toHaveBeenCalledWith({ tournamentId: 'tournament-123' });
  });
});

describe('getTournamentSummaryForLeague', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null when no tournament exists', async () => {
    const { getLeagueTournaments } = await import('@knockoutfpl/dataconnect');
    vi.mocked(getLeagueTournaments).mockResolvedValue({
      data: { tournaments: [] },
    } as any);

    const result = await getTournamentSummaryForLeague(123, null);

    expect(result.tournament).toBeNull();
    expect(result.userProgress).toBeNull();
  });

  it('should return tournament summary without user progress when userFplTeamId is null', async () => {
    const { getLeagueTournaments } = await import('@knockoutfpl/dataconnect');
    vi.mocked(getLeagueTournaments).mockResolvedValue({
      data: {
        tournaments: [
          {
            id: 'tournament-123',
            fplLeagueName: 'Test League',
            currentRound: 2,
            totalRounds: 4,
            status: 'active',
          },
        ],
      },
    } as any);

    const result = await getTournamentSummaryForLeague(123, null);

    expect(result.tournament).toEqual({
      id: 'tournament-123',
      status: 'active',
      currentRound: 2,
      totalRounds: 4,
    });
    expect(result.userProgress).toBeNull();
  });

  it('should return user as active when not eliminated and not winner', async () => {
    const { getLeagueTournaments, getTournamentWithParticipants } = await import(
      '@knockoutfpl/dataconnect'
    );

    vi.mocked(getLeagueTournaments).mockResolvedValue({
      data: {
        tournaments: [
          {
            id: 'tournament-123',
            fplLeagueName: 'Test League',
            currentRound: 2,
            totalRounds: 4,
            status: 'active',
          },
        ],
      },
    } as any);

    vi.mocked(getTournamentWithParticipants).mockResolvedValue({
      data: {
        tournament: {
          id: 'tournament-123',
          winnerEntryId: null,
        },
        participants: [
          {
            entryId: 12345,
            teamName: 'Test Team',
            status: 'active',
            eliminationRound: null,
          },
        ],
      },
    } as any);

    const result = await getTournamentSummaryForLeague(123, 12345);

    expect(result.tournament).toEqual({
      id: 'tournament-123',
      status: 'active',
      currentRound: 2,
      totalRounds: 4,
    });
    expect(result.userProgress).toEqual({
      status: 'active',
      eliminationRound: null,
    });
  });

  it('should return user as eliminated when eliminationRound is set', async () => {
    const { getLeagueTournaments, getTournamentWithParticipants } = await import(
      '@knockoutfpl/dataconnect'
    );

    vi.mocked(getLeagueTournaments).mockResolvedValue({
      data: {
        tournaments: [
          {
            id: 'tournament-123',
            fplLeagueName: 'Test League',
            currentRound: 3,
            totalRounds: 4,
            status: 'active',
          },
        ],
      },
    } as any);

    vi.mocked(getTournamentWithParticipants).mockResolvedValue({
      data: {
        tournament: {
          id: 'tournament-123',
          winnerEntryId: null,
        },
        participants: [
          {
            entryId: 12345,
            teamName: 'Test Team',
            status: 'eliminated',
            eliminationRound: 2,
          },
        ],
      },
    } as any);

    const result = await getTournamentSummaryForLeague(123, 12345);

    expect(result.userProgress).toEqual({
      status: 'eliminated',
      eliminationRound: 2,
    });
  });

  it('should return user as winner when tournament winnerEntryId matches', async () => {
    const { getLeagueTournaments, getTournamentWithParticipants } = await import(
      '@knockoutfpl/dataconnect'
    );

    vi.mocked(getLeagueTournaments).mockResolvedValue({
      data: {
        tournaments: [
          {
            id: 'tournament-123',
            fplLeagueName: 'Test League',
            currentRound: 4,
            totalRounds: 4,
            status: 'completed',
          },
        ],
      },
    } as any);

    vi.mocked(getTournamentWithParticipants).mockResolvedValue({
      data: {
        tournament: {
          id: 'tournament-123',
          winnerEntryId: 12345,
        },
        participants: [
          {
            entryId: 12345,
            teamName: 'Test Team',
            status: 'active',
            eliminationRound: null,
          },
        ],
      },
    } as any);

    const result = await getTournamentSummaryForLeague(123, 12345);

    expect(result.userProgress).toEqual({
      status: 'winner',
      eliminationRound: null,
    });
  });

  it('should return null userProgress when user is not a participant', async () => {
    const { getLeagueTournaments, getTournamentWithParticipants } = await import(
      '@knockoutfpl/dataconnect'
    );

    vi.mocked(getLeagueTournaments).mockResolvedValue({
      data: {
        tournaments: [
          {
            id: 'tournament-123',
            fplLeagueName: 'Test League',
            currentRound: 2,
            totalRounds: 4,
            status: 'active',
          },
        ],
      },
    } as any);

    vi.mocked(getTournamentWithParticipants).mockResolvedValue({
      data: {
        tournament: {
          id: 'tournament-123',
          winnerEntryId: null,
        },
        participants: [
          {
            entryId: 99999, // Different entryId
            teamName: 'Other Team',
            status: 'active',
            eliminationRound: null,
          },
        ],
      },
    } as any);

    const result = await getTournamentSummaryForLeague(123, 12345);

    expect(result.tournament).not.toBeNull();
    expect(result.userProgress).toBeNull();
  });
});
