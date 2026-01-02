import { describe, it, expect } from 'vitest';
import { resolveNWayMatch, NWayPlayerScore } from './nWayMatchResolver';

describe('resolveNWayMatch', () => {
  it('returns winner with highest points', () => {
    const scores: NWayPlayerScore[] = [
      { entryId: 1, slot: 1, seed: 1, points: 45, transferCost: 0, benchPoints: 10 },
      { entryId: 2, slot: 2, seed: 2, points: 52, transferCost: 0, benchPoints: 8 },
      { entryId: 3, slot: 3, seed: 3, points: 38, transferCost: 4, benchPoints: 12 },
    ];

    const result = resolveNWayMatch(1, scores);

    expect(result?.winnerId).toBe(2);
    expect(result?.rankings).toEqual([
      { entryId: 2, rank: 1, points: 52 },
      { entryId: 1, rank: 2, points: 45 },
      { entryId: 3, rank: 3, points: 38 },
    ]);
  });

  it('breaks tie by transfer cost (lower is better)', () => {
    const scores: NWayPlayerScore[] = [
      { entryId: 1, slot: 1, seed: 1, points: 50, transferCost: 8, benchPoints: 10 },
      { entryId: 2, slot: 2, seed: 2, points: 50, transferCost: 4, benchPoints: 10 },
      { entryId: 3, slot: 3, seed: 3, points: 50, transferCost: 0, benchPoints: 10 },
    ];

    const result = resolveNWayMatch(1, scores);

    expect(result?.winnerId).toBe(3); // 0 transfer cost wins
    expect(result?.rankings[0].entryId).toBe(3);
    expect(result?.rankings[1].entryId).toBe(2);
    expect(result?.rankings[2].entryId).toBe(1);
    expect(result?.decidedByTiebreaker).toBe(true);
  });

  it('breaks tie by bench points (higher is better)', () => {
    const scores: NWayPlayerScore[] = [
      { entryId: 1, slot: 1, seed: 1, points: 50, transferCost: 0, benchPoints: 8 },
      { entryId: 2, slot: 2, seed: 2, points: 50, transferCost: 0, benchPoints: 15 },
      { entryId: 3, slot: 3, seed: 3, points: 50, transferCost: 0, benchPoints: 12 },
    ];

    const result = resolveNWayMatch(1, scores);

    expect(result?.winnerId).toBe(2); // 15 bench points wins
    expect(result?.decidedByTiebreaker).toBe(true);
  });

  it('breaks final tie by seed (lower is better)', () => {
    const scores: NWayPlayerScore[] = [
      { entryId: 1, slot: 1, seed: 3, points: 50, transferCost: 0, benchPoints: 10 },
      { entryId: 2, slot: 2, seed: 1, points: 50, transferCost: 0, benchPoints: 10 },
      { entryId: 3, slot: 3, seed: 2, points: 50, transferCost: 0, benchPoints: 10 },
    ];

    const result = resolveNWayMatch(1, scores);

    expect(result?.winnerId).toBe(2); // Seed 1 wins
    expect(result?.decidedByTiebreaker).toBe(true);
  });

  it('handles single player (auto-advance)', () => {
    const scores: NWayPlayerScore[] = [
      { entryId: 1, slot: 1, seed: 1, points: 45, transferCost: 0, benchPoints: 10 },
    ];

    const result = resolveNWayMatch(1, scores);

    expect(result?.winnerId).toBe(1);
    expect(result?.decidedByTiebreaker).toBe(false);
  });

  it('returns null for empty scores', () => {
    const result = resolveNWayMatch(1, []);
    expect(result).toBeNull();
  });
});
