// src/lib/nWayBracket.test.ts
import { describe, it, expect } from 'vitest';
import { calculateBracketPreview, getRoundName } from './nWayBracket';

describe('calculateBracketPreview', () => {
  describe('1v1 (matchSize=2) brackets', () => {
    it('calculates perfect power of 2 (8 participants)', () => {
      const result = calculateBracketPreview(8, 2);
      expect(result.rounds).toBe(3);
      expect(result.totalSlots).toBe(8);
      expect(result.byeCount).toBe(0);
      expect(result.matchesPerRound).toEqual([4, 2, 1]);
    });

    it('calculates with byes (6 participants)', () => {
      const result = calculateBracketPreview(6, 2);
      expect(result.rounds).toBe(3);
      expect(result.totalSlots).toBe(8);
      expect(result.byeCount).toBe(2);
      expect(result.matchesPerRound).toEqual([4, 2, 1]);
    });

    it('calculates minimum bracket (4 participants)', () => {
      const result = calculateBracketPreview(4, 2);
      expect(result.rounds).toBe(2);
      expect(result.byeCount).toBe(0);
      expect(result.matchesPerRound).toEqual([2, 1]);
    });

    it('calculates 16-participant bracket', () => {
      const result = calculateBracketPreview(16, 2);
      expect(result.rounds).toBe(4);
      expect(result.byeCount).toBe(0);
      expect(result.matchesPerRound).toEqual([8, 4, 2, 1]);
    });
  });

  describe('3-way (matchSize=3) brackets', () => {
    it('calculates perfect power of 3 (9 participants)', () => {
      const result = calculateBracketPreview(9, 3);
      expect(result.rounds).toBe(2);
      expect(result.totalSlots).toBe(9);
      expect(result.byeCount).toBe(0);
      expect(result.matchesPerRound).toEqual([3, 1]);
    });

    it('calculates perfect power of 3 (27 participants)', () => {
      const result = calculateBracketPreview(27, 3);
      expect(result.rounds).toBe(3);
      expect(result.totalSlots).toBe(27);
      expect(result.byeCount).toBe(0);
      expect(result.matchesPerRound).toEqual([9, 3, 1]);
    });

    it('calculates with byes (7 participants)', () => {
      const result = calculateBracketPreview(7, 3);
      expect(result.rounds).toBe(2);
      expect(result.totalSlots).toBe(9);
      expect(result.byeCount).toBe(2);
      expect(result.matchesPerRound).toEqual([3, 1]);
    });

    it('calculates with many byes (10 participants)', () => {
      const result = calculateBracketPreview(10, 3);
      expect(result.rounds).toBe(3);
      expect(result.totalSlots).toBe(27);
      expect(result.byeCount).toBe(17);
      expect(result.matchesPerRound).toEqual([9, 3, 1]);
    });
  });

  describe('4-way (matchSize=4) brackets', () => {
    it('calculates minimum bracket (4 participants)', () => {
      const result = calculateBracketPreview(4, 4);
      expect(result.rounds).toBe(1);
      expect(result.totalSlots).toBe(4);
      expect(result.byeCount).toBe(0);
      expect(result.matchesPerRound).toEqual([1]);
    });

    it('calculates perfect power of 4 (16 participants)', () => {
      const result = calculateBracketPreview(16, 4);
      expect(result.rounds).toBe(2);
      expect(result.totalSlots).toBe(16);
      expect(result.byeCount).toBe(0);
      expect(result.matchesPerRound).toEqual([4, 1]);
    });

    it('calculates with byes (10 participants)', () => {
      const result = calculateBracketPreview(10, 4);
      expect(result.rounds).toBe(2);
      expect(result.totalSlots).toBe(16);
      expect(result.byeCount).toBe(6);
      expect(result.matchesPerRound).toEqual([4, 1]);
    });

    it('calculates 64-participant bracket', () => {
      const result = calculateBracketPreview(64, 4);
      expect(result.rounds).toBe(3);
      expect(result.byeCount).toBe(0);
      expect(result.matchesPerRound).toEqual([16, 4, 1]);
    });
  });

  describe('edge cases', () => {
    it('returns empty result for 0 participants', () => {
      const result = calculateBracketPreview(0, 2);
      expect(result.rounds).toBe(0);
      expect(result.totalSlots).toBe(0);
      expect(result.byeCount).toBe(0);
      expect(result.matchesPerRound).toEqual([]);
    });

    it('returns empty result for 1 participant', () => {
      const result = calculateBracketPreview(1, 2);
      expect(result.rounds).toBe(0);
      expect(result.matchesPerRound).toEqual([]);
    });

    it('handles 2 participants in 1v1', () => {
      const result = calculateBracketPreview(2, 2);
      expect(result.rounds).toBe(1);
      expect(result.matchesPerRound).toEqual([1]);
    });

    it('handles 3 participants in 3-way', () => {
      const result = calculateBracketPreview(3, 3);
      expect(result.rounds).toBe(1);
      expect(result.matchesPerRound).toEqual([1]);
    });
  });
});

describe('getRoundName', () => {
  it('returns Final for last round', () => {
    expect(getRoundName(3, 3)).toBe('Final');
    expect(getRoundName(1, 1)).toBe('Final');
    expect(getRoundName(5, 5)).toBe('Final');
  });

  it('returns Semi-Finals for second to last round', () => {
    expect(getRoundName(2, 3)).toBe('Semi-Finals');
    expect(getRoundName(4, 5)).toBe('Semi-Finals');
  });

  it('returns Quarter-Finals for third to last round', () => {
    expect(getRoundName(1, 3)).toBe('Quarter-Finals');
    expect(getRoundName(3, 5)).toBe('Quarter-Finals');
  });

  it('returns Round N for earlier rounds', () => {
    expect(getRoundName(1, 4)).toBe('Round 1');
    expect(getRoundName(2, 5)).toBe('Round 2');
    expect(getRoundName(1, 5)).toBe('Round 1');
  });
});
