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
  getAllTournamentMatchPicks: vi.fn(),
  getPicksForEvent: vi.fn(),
  getCurrentEvent: vi.fn(),
}));

// Mock Firebase Functions
vi.mock('firebase/functions', () => ({
  httpsCallable: vi.fn(() => {
    const callable = vi.fn();
    (callable as any).stream = vi.fn();
    return callable;
  }),
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
      getAllTournamentMatchPicks,
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

    vi.mocked(getAllTournamentMatchPicks).mockResolvedValue({
      data: {
        matchPicks: [],
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
    (mockCallable as any).stream = vi.fn();
    vi.mocked(httpsCallable).mockReturnValue(mockCallable as any);

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
    (mockCallable as any).stream = vi.fn();
    vi.mocked(httpsCallable).mockReturnValue(mockCallable as any);

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
    (mockCallable as any).stream = vi.fn();
    vi.mocked(httpsCallable).mockReturnValue(mockCallable as any);

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
    (mockCallable as any).stream = vi.fn();
    vi.mocked(httpsCallable).mockReturnValue(mockCallable as any);

    const result = await callRefreshTournament('tournament-123');

    expect(result).toBeNull();
  });

  it('should return refresh result on success', async () => {
    const { httpsCallable } = await import('firebase/functions');
    const mockCallable = vi.fn().mockResolvedValue({
      data: { picksRefreshed: 5, matchesResolved: 2 },
    });
    (mockCallable as any).stream = vi.fn();
    vi.mocked(httpsCallable).mockReturnValue(mockCallable as any);

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
    const { getLeagueTournaments, getTournamentWithParticipants } = await import('@knockoutfpl/dataconnect');
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
          startEvent: 20,
          winnerEntryId: null,
        },
        participants: [],
      },
    } as any);

    const result = await getTournamentSummaryForLeague(123, null);

    expect(result.tournament).toEqual({
      id: 'tournament-123',
      status: 'active',
      currentRound: 2,
      totalRounds: 4,
      startGameweek: 20,
      endGameweek: 23, // 20 + 4 - 1
    });
    expect(result.userProgress).toBeNull();
  });

  it('should return user as active when not eliminated and not winner', async () => {
    const {
      getLeagueTournaments,
      getTournamentWithParticipants,
      getTournamentRounds,
      getCurrentEvent,
      getAllTournamentMatchPicks,
      getPicksForEvent,
      getRoundMatches,
    } = await import('@knockoutfpl/dataconnect');

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
          startEvent: 20,
          winnerEntryId: null,
        },
        participants: [
          {
            entryId: 12345,
            teamName: 'Test Team',
            managerName: 'Test Manager',
            status: 'active',
            eliminationRound: null,
          },
          {
            entryId: 67890,
            teamName: 'Opponent Team',
            managerName: 'Opponent Manager',
            status: 'active',
            eliminationRound: null,
          },
        ],
      },
    } as any);

    vi.mocked(getTournamentRounds).mockResolvedValue({
      data: {
        rounds: [
          { roundNumber: 1, event: 20, status: 'completed' },
          { roundNumber: 2, event: 21, status: 'active' },
        ],
      },
    } as any);

    vi.mocked(getCurrentEvent).mockResolvedValue({
      data: { events: [{ event: 21 }] },
    } as any);

    vi.mocked(getAllTournamentMatchPicks).mockResolvedValue({
      data: {
        matchPicks: [
          { matchId: 1, entryId: 12345, slot: 1 },
          { matchId: 1, entryId: 99999, slot: 2 },
          { matchId: 2, entryId: 12345, slot: 1 },
          { matchId: 2, entryId: 67890, slot: 2 },
        ],
      },
    } as any);

    vi.mocked(getPicksForEvent).mockResolvedValue({
      data: { picks: [] },
    } as any);

    vi.mocked(getRoundMatches).mockImplementation(async (_dc, params: any) => {
      if (params.roundNumber === 1) {
        return {
          data: {
            matches: [{ matchId: 1, winnerEntryId: 12345, isBye: false }],
          },
        } as any;
      } else if (params.roundNumber === 2) {
        return {
          data: {
            matches: [{ matchId: 2, winnerEntryId: null, isBye: false }],
          },
        } as any;
      }
      return { data: { matches: [] } } as any;
    });

    const result = await getTournamentSummaryForLeague(123, 12345);

    expect(result.tournament).toEqual({
      id: 'tournament-123',
      status: 'active',
      currentRound: 2,
      totalRounds: 4,
      startGameweek: 20,
      endGameweek: 23,
    });
    expect(result.userProgress?.status).toBe('active');
    expect(result.userProgress?.eliminationRound).toBeNull();
    expect(result.userProgress?.currentMatch).not.toBeNull();
    expect(result.userProgress?.currentMatch?.opponentTeamName).toBe('Opponent Team');
    expect(result.userProgress?.currentMatch?.roundNumber).toBe(2);
    expect(result.userProgress?.currentMatch?.result).toBe('pending');
    expect(result.userProgress?.recentResult?.result).toBe('won');
  });

  it('should return user as eliminated when eliminationRound is set', async () => {
    const {
      getLeagueTournaments,
      getTournamentWithParticipants,
      getTournamentRounds,
      getCurrentEvent,
      getAllTournamentMatchPicks,
      getPicksForEvent,
      getRoundMatches,
    } = await import('@knockoutfpl/dataconnect');

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
          startEvent: 20,
          winnerEntryId: null,
        },
        participants: [
          {
            entryId: 12345,
            teamName: 'Test Team',
            managerName: 'Test Manager',
            status: 'eliminated',
            eliminationRound: 2,
          },
          {
            entryId: 67890,
            teamName: 'Opponent Team',
            managerName: 'Opponent Manager',
            status: 'active',
            eliminationRound: null,
          },
        ],
      },
    } as any);

    vi.mocked(getTournamentRounds).mockResolvedValue({
      data: {
        rounds: [
          { roundNumber: 1, event: 20, status: 'completed' },
          { roundNumber: 2, event: 21, status: 'completed' },
          { roundNumber: 3, event: 22, status: 'active' },
        ],
      },
    } as any);

    vi.mocked(getCurrentEvent).mockResolvedValue({
      data: { events: [{ event: 22 }] },
    } as any);

    vi.mocked(getAllTournamentMatchPicks).mockResolvedValue({
      data: {
        matchPicks: [
          { matchId: 1, entryId: 12345, slot: 1 },
          { matchId: 1, entryId: 99999, slot: 2 },
          { matchId: 2, entryId: 12345, slot: 1 },
          { matchId: 2, entryId: 67890, slot: 2 },
        ],
      },
    } as any);

    vi.mocked(getPicksForEvent).mockResolvedValue({
      data: { picks: [] },
    } as any);

    vi.mocked(getRoundMatches).mockImplementation(async (_dc, params: any) => {
      if (params.roundNumber === 1) {
        return {
          data: {
            matches: [{ matchId: 1, winnerEntryId: 12345, isBye: false }],
          },
        } as any;
      } else if (params.roundNumber === 2) {
        // User lost in round 2
        return {
          data: {
            matches: [{ matchId: 2, winnerEntryId: 67890, isBye: false }],
          },
        } as any;
      }
      return { data: { matches: [] } } as any;
    });

    const result = await getTournamentSummaryForLeague(123, 12345);

    expect(result.userProgress?.status).toBe('eliminated');
    expect(result.userProgress?.eliminationRound).toBe(2);
    // Eliminated user should not have current match
    expect(result.userProgress?.currentMatch).toBeNull();
    // But should have recent result showing the loss
    expect(result.userProgress?.recentResult?.result).toBe('lost');
    expect(result.userProgress?.recentResult?.roundNumber).toBe(2);
  });

  it('should return user as winner when tournament winnerEntryId matches', async () => {
    const {
      getLeagueTournaments,
      getTournamentWithParticipants,
      getTournamentRounds,
      getCurrentEvent,
      getAllTournamentMatchPicks,
      getPicksForEvent,
      getRoundMatches,
    } = await import('@knockoutfpl/dataconnect');

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
          startEvent: 20,
          winnerEntryId: 12345,
        },
        participants: [
          {
            entryId: 12345,
            teamName: 'Test Team',
            managerName: 'Test Manager',
            status: 'active',
            eliminationRound: null,
          },
          {
            entryId: 67890,
            teamName: 'Finalist Team',
            managerName: 'Finalist Manager',
            status: 'eliminated',
            eliminationRound: 4,
          },
        ],
      },
    } as any);

    vi.mocked(getTournamentRounds).mockResolvedValue({
      data: {
        rounds: [
          { roundNumber: 4, event: 23, status: 'completed' },
        ],
      },
    } as any);

    vi.mocked(getCurrentEvent).mockResolvedValue({
      data: { events: [{ event: 24 }] },
    } as any);

    vi.mocked(getAllTournamentMatchPicks).mockResolvedValue({
      data: {
        matchPicks: [
          { matchId: 1, entryId: 12345, slot: 1 },
          { matchId: 1, entryId: 67890, slot: 2 },
        ],
      },
    } as any);

    vi.mocked(getPicksForEvent).mockResolvedValue({
      data: { picks: [] },
    } as any);

    vi.mocked(getRoundMatches).mockResolvedValue({
      data: {
        matches: [{ matchId: 1, winnerEntryId: 12345, isBye: false }],
      },
    } as any);

    const result = await getTournamentSummaryForLeague(123, 12345);

    expect(result.userProgress?.status).toBe('winner');
    expect(result.userProgress?.eliminationRound).toBeNull();
    // Winner should have their final win as recentResult
    expect(result.userProgress?.recentResult?.result).toBe('won');
    expect(result.userProgress?.recentResult?.roundName).toBe('Final');
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
          startEvent: 20,
          winnerEntryId: null,
        },
        participants: [
          {
            entryId: 99999, // Different entryId
            teamName: 'Other Team',
            managerName: 'Other Manager',
            status: 'active',
            eliminationRound: null,
          },
        ],
      },
    } as any);

    const result = await getTournamentSummaryForLeague(123, 12345);

    expect(result.tournament).not.toBeNull();
    expect(result.tournament?.startGameweek).toBe(20);
    expect(result.tournament?.endGameweek).toBe(23);
    expect(result.userProgress).toBeNull();
  });

  it('should include startGameweek and endGameweek in tournament summary', async () => {
    const { getLeagueTournaments, getTournamentWithParticipants } = await import(
      '@knockoutfpl/dataconnect'
    );

    vi.mocked(getLeagueTournaments).mockResolvedValue({
      data: {
        tournaments: [
          {
            id: 'tournament-456',
            fplLeagueName: 'Another League',
            currentRound: 1,
            totalRounds: 3,
            status: 'active',
          },
        ],
      },
    } as any);

    vi.mocked(getTournamentWithParticipants).mockResolvedValue({
      data: {
        tournament: {
          id: 'tournament-456',
          startEvent: 15,
          winnerEntryId: null,
        },
        participants: [],
      },
    } as any);

    const result = await getTournamentSummaryForLeague(456, null);

    expect(result.tournament?.startGameweek).toBe(15);
    expect(result.tournament?.endGameweek).toBe(17); // 15 + 3 - 1
  });
});
