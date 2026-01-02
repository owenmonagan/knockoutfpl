import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./dataconnect-admin', () => ({
  dataConnectAdmin: {
    executeGraphql: vi.fn()
  }
}));

vi.mock('./fpl-scores', () => ({
  fetchScoresForEntries: vi.fn(),
  fetchCurrentGameweek: vi.fn()
}));

describe('refreshVisibleMatches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('only fetches scores for specified match IDs', async () => {
    const { fetchScoresForEntries } = await import('./fpl-scores');
    const { dataConnectAdmin } = await import('./dataconnect-admin');

    // Mock tournament with current round info
    vi.mocked(dataConnectAdmin.executeGraphql)
      .mockResolvedValueOnce({
        data: {
          tournament: { id: 'tour-1', currentRound: 1, status: 'active' },
          rounds: [{ roundNumber: 1, event: 20 }]
        }
      })
      // Mock match picks for visible matches only
      .mockResolvedValueOnce({
        data: {
          matchPicks: [
            { matchId: 5, entryId: 100, slot: 1 },
            { matchId: 5, entryId: 101, slot: 2 },
            { matchId: 6, entryId: 102, slot: 1 },
            { matchId: 6, entryId: 103, slot: 2 },
          ]
        }
      })
      // Mock pick upserts (4 calls batched)
      .mockResolvedValue({ data: {} });

    vi.mocked(fetchScoresForEntries).mockResolvedValue(
      new Map([
        [100, { entry_history: { points: 55, total_points: 1000 } }],
        [101, { entry_history: { points: 48, total_points: 950 } }],
        [102, { entry_history: { points: 62, total_points: 1100 } }],
        [103, { entry_history: { points: 51, total_points: 980 } }],
      ]) as any
    );

    const { refreshVisibleMatchesHandler } = await import('./refreshVisibleMatches');

    const result = await refreshVisibleMatchesHandler({
      tournamentId: 'tour-1',
      matchIds: [5, 6]
    });

    // Should only fetch 4 entries (2 per match x 2 matches)
    expect(fetchScoresForEntries).toHaveBeenCalledWith(
      expect.arrayContaining([100, 101, 102, 103]),
      20,
      expect.any(Object)
    );
    expect(result.picksRefreshed).toBe(4);
  });

  it('rejects if more than 20 matches requested', async () => {
    const { refreshVisibleMatchesHandler } = await import('./refreshVisibleMatches');

    const matchIds = Array.from({ length: 25 }, (_, i) => i + 1);

    await expect(
      refreshVisibleMatchesHandler({ tournamentId: 'tour-1', matchIds })
    ).rejects.toThrow('Maximum 20 matches per refresh');
  });

  it('requires tournamentId to be provided', async () => {
    const { refreshVisibleMatchesHandler } = await import('./refreshVisibleMatches');

    await expect(
      refreshVisibleMatchesHandler({ matchIds: [1, 2] } as any)
    ).rejects.toThrow('tournamentId is required');
  });

  it('requires matchIds to be provided', async () => {
    const { refreshVisibleMatchesHandler } = await import('./refreshVisibleMatches');

    await expect(
      refreshVisibleMatchesHandler({ tournamentId: 'tour-1' } as any)
    ).rejects.toThrow('matchIds is required');
  });

  it('requires matchIds to be non-empty', async () => {
    const { refreshVisibleMatchesHandler } = await import('./refreshVisibleMatches');

    await expect(
      refreshVisibleMatchesHandler({ tournamentId: 'tour-1', matchIds: [] })
    ).rejects.toThrow('matchIds must not be empty');
  });

  it('returns 0 picks when no match picks found for specified matches', async () => {
    const { dataConnectAdmin } = await import('./dataconnect-admin');

    // Mock tournament with current round info
    vi.mocked(dataConnectAdmin.executeGraphql)
      .mockResolvedValueOnce({
        data: {
          tournament: { id: 'tour-1', currentRound: 1, status: 'active' },
          rounds: [{ roundNumber: 1, event: 20 }]
        }
      })
      // Mock empty match picks
      .mockResolvedValueOnce({
        data: {
          matchPicks: []
        }
      });

    const { refreshVisibleMatchesHandler } = await import('./refreshVisibleMatches');

    const result = await refreshVisibleMatchesHandler({
      tournamentId: 'tour-1',
      matchIds: [999] // Non-existent match
    });

    expect(result.picksRefreshed).toBe(0);
  });

  it('throws if tournament not found', async () => {
    const { dataConnectAdmin } = await import('./dataconnect-admin');

    vi.mocked(dataConnectAdmin.executeGraphql).mockResolvedValueOnce({
      data: {
        tournament: null,
        rounds: []
      }
    });

    const { refreshVisibleMatchesHandler } = await import('./refreshVisibleMatches');

    await expect(
      refreshVisibleMatchesHandler({ tournamentId: 'non-existent', matchIds: [1] })
    ).rejects.toThrow('Tournament non-existent not found');
  });
});
