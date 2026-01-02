import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchParticipantLeagues, fetchParticipantLeaguesBatch } from './fetchParticipantLeagues';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('fetchParticipantLeagues', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and returns classic mini-leagues for an entry', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        id: 12345,
        name: 'Test Team',
        leagues: {
          classic: [
            { id: 100, name: 'Work League', entry_rank: 5 },
            { id: 200, name: 'Friends League', entry_rank: 12 },
            { id: 314, name: 'Overall', entry_rank: 150000 } // Skip overall
          ],
          h2h: []
        }
      })
    });

    const result = await fetchParticipantLeagues(12345);

    expect(result).toHaveLength(2); // Excludes Overall league
    expect(result[0]).toEqual({
      leagueId: 100,
      leagueName: 'Work League',
      entryRank: 5
    });
  });

  it('filters out system leagues (Overall, country leagues)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        id: 12345,
        leagues: {
          classic: [
            { id: 314, name: 'Overall', entry_rank: 1000 },
            { id: 100, name: 'England', entry_rank: 500 },
            { id: 999, name: 'My Private League', entry_rank: 3 }
          ],
          h2h: []
        }
      })
    });

    const result = await fetchParticipantLeagues(12345);

    // Only private league should remain
    expect(result).toHaveLength(1);
    expect(result[0].leagueName).toBe('My Private League');
  });

  it('handles missing leagues gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        id: 12345,
        leagues: null
      })
    });

    const result = await fetchParticipantLeagues(12345);

    expect(result).toEqual([]);
  });

  it('returns empty array on API error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404
    });

    const result = await fetchParticipantLeagues(99999);

    expect(result).toEqual([]);
  });
});

describe('fetchParticipantLeaguesBatch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty map for empty input', async () => {
    const result = await fetchParticipantLeaguesBatch([]);

    expect(result.size).toBe(0);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('fetches leagues for multiple entries', async () => {
    // Mock responses for three entries
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 1,
          leagues: {
            classic: [{ id: 100, name: 'League A', entry_rank: 1 }],
            h2h: []
          }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 2,
          leagues: {
            classic: [{ id: 200, name: 'League B', entry_rank: 2 }],
            h2h: []
          }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 3,
          leagues: {
            classic: [{ id: 300, name: 'League C', entry_rank: 3 }],
            h2h: []
          }
        })
      });

    const result = await fetchParticipantLeaguesBatch([1, 2, 3]);

    expect(result.size).toBe(3);
    expect(result.get(1)).toEqual([{ leagueId: 100, leagueName: 'League A', entryRank: 1 }]);
    expect(result.get(2)).toEqual([{ leagueId: 200, leagueName: 'League B', entryRank: 2 }]);
    expect(result.get(3)).toEqual([{ leagueId: 300, leagueName: 'League C', entryRank: 3 }]);
  });

  it('calls progress callback with correct counts', async () => {
    // Mock 15 entries to span two batches (batch size is 10)
    const entryIds = Array.from({ length: 15 }, (_, i) => i + 1);

    mockFetch.mockImplementation(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        leagues: {
          classic: [],
          h2h: []
        }
      })
    }));

    const progressCalls: [number, number][] = [];
    const onProgress = (count: number, total: number) => {
      progressCalls.push([count, total]);
    };

    await fetchParticipantLeaguesBatch(entryIds, onProgress);

    // Should be called after each batch
    expect(progressCalls).toEqual([
      [10, 15], // After first batch of 10
      [15, 15]  // After second batch of 5
    ]);
  });

  it('handles mixed success and failure responses', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 1,
          leagues: {
            classic: [{ id: 100, name: 'League A', entry_rank: 1 }],
            h2h: []
          }
        })
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 404
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 3,
          leagues: {
            classic: [{ id: 300, name: 'League C', entry_rank: 3 }],
            h2h: []
          }
        })
      });

    const result = await fetchParticipantLeaguesBatch([1, 2, 3]);

    expect(result.size).toBe(3);
    expect(result.get(1)).toEqual([{ leagueId: 100, leagueName: 'League A', entryRank: 1 }]);
    expect(result.get(2)).toEqual([]); // Failed entry returns empty array
    expect(result.get(3)).toEqual([{ leagueId: 300, leagueName: 'League C', entryRank: 3 }]);
  });
});
