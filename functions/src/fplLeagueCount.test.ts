import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getLeagueParticipantCount, getTournamentSizeTier } from './fplLeagueCount';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('getLeagueParticipantCount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns count for small league (single page)', async () => {
    // League with 25 participants - all on page 1, no has_next
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        standings: {
          has_next: false,
          results: Array(25).fill({ entry: 1 })
        }
      })
    });

    const count = await getLeagueParticipantCount(12345);
    expect(count).toBe(25);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('uses binary search for large league', async () => {
    // Simulate a league with 735 pages (36,750 participants)
    const totalPages = 735;

    mockFetch.mockImplementation((url: string) => {
      const pageMatch = url.match(/page_standings=(\d+)/);
      const page = pageMatch ? parseInt(pageMatch[1]) : 1;

      if (page > totalPages) {
        return Promise.resolve({
          ok: false,
          status: 404
        });
      }

      const isLastPage = page === totalPages;
      const resultsOnPage = isLastPage ? 47 : 50; // Last page has 47

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          standings: {
            has_next: !isLastPage,
            results: Array(resultsOnPage).fill({ entry: 1 })
          }
        })
      });
    });

    const count = await getLeagueParticipantCount(12345);

    // (734 * 50) + 47 = 36,747
    expect(count).toBe(36747);

    // Binary search should take ~15 requests, not 735
    expect(mockFetch.mock.calls.length).toBeLessThan(20);
  });

  it('throws on invalid league', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404
    });

    await expect(getLeagueParticipantCount(99999)).rejects.toThrow('League not found');
  });

  it('handles exact page boundary (e.g., 100 participants = 2 full pages)', async () => {
    // 100 participants = exactly 2 pages of 50 each
    mockFetch.mockImplementation((url: string) => {
      const pageMatch = url.match(/page_standings=(\d+)/);
      const page = pageMatch ? parseInt(pageMatch[1]) : 1;

      if (page > 2) {
        return Promise.resolve({
          ok: false,
          status: 404
        });
      }

      const isLastPage = page === 2;
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          standings: {
            has_next: !isLastPage,
            results: Array(50).fill({ entry: 1 })
          }
        })
      });
    });

    const count = await getLeagueParticipantCount(12345);
    expect(count).toBe(100);
  });

  it('handles medium league (51-100 participants, 2 pages)', async () => {
    // 75 participants = 1 full page + 25 on second page
    mockFetch.mockImplementation((url: string) => {
      const pageMatch = url.match(/page_standings=(\d+)/);
      const page = pageMatch ? parseInt(pageMatch[1]) : 1;

      if (page === 1) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            standings: {
              has_next: true,
              results: Array(50).fill({ entry: 1 })
            }
          })
        });
      } else if (page === 2) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            standings: {
              has_next: false,
              results: Array(25).fill({ entry: 1 })
            }
          })
        });
      } else {
        return Promise.resolve({
          ok: false,
          status: 404
        });
      }
    });

    const count = await getLeagueParticipantCount(12345);
    expect(count).toBe(75);
  });

  it('handles empty league (0 participants)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        standings: {
          has_next: false,
          results: []
        }
      })
    });

    const count = await getLeagueParticipantCount(12345);
    expect(count).toBe(0);
  });
});

describe('getTournamentSizeTier', () => {
  it('returns standard for <= 48 participants', () => {
    expect(getTournamentSizeTier(1)).toBe('standard');
    expect(getTournamentSizeTier(16)).toBe('standard');
    expect(getTournamentSizeTier(32)).toBe('standard');
    expect(getTournamentSizeTier(48)).toBe('standard');
  });

  it('returns large for 49-1000 participants', () => {
    expect(getTournamentSizeTier(49)).toBe('large');
    expect(getTournamentSizeTier(100)).toBe('large');
    expect(getTournamentSizeTier(500)).toBe('large');
    expect(getTournamentSizeTier(1000)).toBe('large');
  });

  it('returns mega for > 1000 participants', () => {
    expect(getTournamentSizeTier(1001)).toBe('mega');
    expect(getTournamentSizeTier(5000)).toBe('mega');
    expect(getTournamentSizeTier(50000)).toBe('mega');
  });
});
