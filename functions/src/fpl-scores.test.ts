import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch before importing the module
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Import after mocking
import { fetchEventStatus } from './fpl-scores';

describe('fetchEventStatus', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('returns finalized when all conditions met', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: [
          { bonus_added: true, date: '2025-12-30', event: 19, points: 'r' },
          { bonus_added: true, date: '2026-01-01', event: 19, points: 'r' },
        ],
        leagues: 'Updated',
      }),
    });

    const result = await fetchEventStatus();

    expect(result).toEqual({
      event: 19,
      isFinalized: true,
      allBonusAdded: true,
      allPointsReady: true,
      leaguesUpdated: true,
    });
  });

  it('returns not finalized when leagues still updating', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: [
          { bonus_added: true, date: '2025-12-30', event: 19, points: 'r' },
        ],
        leagues: 'Updating',
      }),
    });

    const result = await fetchEventStatus();

    expect(result?.isFinalized).toBe(false);
    expect(result?.leaguesUpdated).toBe(false);
  });

  it('returns not finalized when bonus not added', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: [
          { bonus_added: false, date: '2025-12-30', event: 19, points: 'r' },
        ],
        leagues: 'Updated',
      }),
    });

    const result = await fetchEventStatus();

    expect(result?.isFinalized).toBe(false);
    expect(result?.allBonusAdded).toBe(false);
  });

  it('returns not finalized when points not ready', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: [
          { bonus_added: true, date: '2025-12-30', event: 19, points: 'l' },
        ],
        leagues: 'Updated',
      }),
    });

    const result = await fetchEventStatus();

    expect(result?.isFinalized).toBe(false);
    expect(result?.allPointsReady).toBe(false);
  });

  it('returns null on API error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    const result = await fetchEventStatus();

    expect(result).toBeNull();
  });

  it('returns null when status array is empty', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: [],
        leagues: 'Updated',
      }),
    });

    const result = await fetchEventStatus();

    expect(result).toBeNull();
  });

  it('returns null on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await fetchEventStatus();

    expect(result).toBeNull();
  });
});
