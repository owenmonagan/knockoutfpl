import { describe, it, expect, vi, beforeEach } from 'vitest';

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

    const { fetchParticipantLeagues } = await import('./fetchParticipantLeagues');
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

    const { fetchParticipantLeagues } = await import('./fetchParticipantLeagues');
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

    const { fetchParticipantLeagues } = await import('./fetchParticipantLeagues');
    const result = await fetchParticipantLeagues(12345);

    expect(result).toEqual([]);
  });

  it('returns empty array on API error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404
    });

    const { fetchParticipantLeagues } = await import('./fetchParticipantLeagues');
    const result = await fetchParticipantLeagues(99999);

    expect(result).toEqual([]);
  });
});
