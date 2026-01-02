import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch before importing the module
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Import after mocking
import { fetchEventStatus, fetchScoresForEntries, SyntheticPicksResponse } from './fpl-scores';

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

describe('fetchScoresForEntries', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  const mockPicksResponse = {
    entry_history: { points: 65, total_points: 500, rank: 100 },
    active_chip: null,
    picks: [],
  };

  it('returns scores for all valid entries', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockPicksResponse })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ...mockPicksResponse, entry_history: { points: 70, total_points: 520, rank: 90 } }) });

    const result = await fetchScoresForEntries([100, 200], 19);

    expect(result.size).toBe(2);
    expect(result.get(100)?.entry_history.points).toBe(65);
    expect(result.get(200)?.entry_history.points).toBe(70);
  });

  it('excludes missing entries by default', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockPicksResponse })
      .mockResolvedValueOnce({ ok: false, status: 404 }); // Entry 200 deleted

    const result = await fetchScoresForEntries([100, 200], 19);

    expect(result.size).toBe(1);
    expect(result.has(100)).toBe(true);
    expect(result.has(200)).toBe(false);
  });

  it('returns synthetic 0-point response for missing entries when treatMissingAsZero is true', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockPicksResponse })
      .mockResolvedValueOnce({ ok: false, status: 404 }); // Entry 200 deleted

    const result = await fetchScoresForEntries([100, 200], 19, { treatMissingAsZero: true });

    expect(result.size).toBe(2);
    expect(result.get(100)?.entry_history.points).toBe(65);

    const synthetic = result.get(200) as SyntheticPicksResponse;
    expect(synthetic.entry_history.points).toBe(0);
    expect(synthetic._synthetic).toBe(true);
    expect(synthetic._reason).toBe('team_deleted');
  });

  it('returns all synthetic when all entries missing with treatMissingAsZero', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 404 })
      .mockResolvedValueOnce({ ok: false, status: 404 });

    const result = await fetchScoresForEntries([100, 200], 19, { treatMissingAsZero: true });

    expect(result.size).toBe(2);
    expect((result.get(100) as SyntheticPicksResponse)._synthetic).toBe(true);
    expect((result.get(200) as SyntheticPicksResponse)._synthetic).toBe(true);
  });

  it('handles network errors for individual entries with treatMissingAsZero', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockPicksResponse })
      .mockRejectedValueOnce(new Error('Network error')); // Entry 200 network error

    const result = await fetchScoresForEntries([100, 200], 19, { treatMissingAsZero: true });

    expect(result.size).toBe(2);
    expect(result.get(100)?.entry_history.points).toBe(65);
    expect((result.get(200) as SyntheticPicksResponse)._synthetic).toBe(true);
  });
});
