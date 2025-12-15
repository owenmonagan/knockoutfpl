// src/services/tournament.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTournamentByLeague, createTournament, updateTournament } from './tournament';
import type { Tournament } from '../types/tournament';

// Mock Firebase
vi.mock('../lib/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  doc: vi.fn(),
  Timestamp: {
    now: () => ({ seconds: 0, nanoseconds: 0 }),
  },
}));

describe('getTournamentByLeague', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null when no tournament exists', async () => {
    const { getDocs } = await import('firebase/firestore');
    vi.mocked(getDocs).mockResolvedValue({
      empty: true,
      docs: [],
    } as any);

    const result = await getTournamentByLeague(123);
    expect(result).toBeNull();
  });

  it('should return tournament when one exists', async () => {
    const { getDocs } = await import('firebase/firestore');
    vi.mocked(getDocs).mockResolvedValue({
      empty: false,
      docs: [{
        id: 'tournament-123',
        data: () => ({
          fplLeagueId: 123,
          fplLeagueName: 'Test League',
        }),
      }],
    } as any);

    const result = await getTournamentByLeague(123);
    expect(result?.id).toBe('tournament-123');
    expect(result?.fplLeagueId).toBe(123);
  });
});

describe('createTournament', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create tournament and return it with id', async () => {
    const { addDoc } = await import('firebase/firestore');
    vi.mocked(addDoc).mockResolvedValue({ id: 'new-tournament-id' } as any);

    const tournamentData = {
      fplLeagueId: 123,
      fplLeagueName: 'Test League',
      creatorUserId: 'user-123',
      startGameweek: 16,
      currentRound: 1,
      totalRounds: 3,
      status: 'active' as const,
      participants: [],
      rounds: [],
      winnerId: null,
    };

    const result = await createTournament(tournamentData);

    expect(result.id).toBe('new-tournament-id');
    expect(result.fplLeagueId).toBe(123);
  });
});

describe('updateTournament', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update tournament document', async () => {
    const { updateDoc, doc } = await import('firebase/firestore');
    vi.mocked(doc).mockReturnValue({} as any);
    vi.mocked(updateDoc).mockResolvedValue(undefined);

    const tournament = {
      id: 'tournament-123',
      currentRound: 2,
    } as Tournament;

    await updateTournament(tournament);

    expect(updateDoc).toHaveBeenCalled();
  });
});
