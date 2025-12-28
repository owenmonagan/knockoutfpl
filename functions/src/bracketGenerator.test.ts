import { describe, it, expect } from 'vitest';
import {
  calculateBracketSize,
  calculateTotalRounds,
  calculateByeCount,
  getMatchCountForRound,
} from './bracketGenerator';

describe('bracketGenerator', () => {
  describe('calculateBracketSize', () => {
    it('returns next power of 2', () => {
      expect(calculateBracketSize(4)).toBe(4);
      expect(calculateBracketSize(5)).toBe(8);
      expect(calculateBracketSize(8)).toBe(8);
      expect(calculateBracketSize(12)).toBe(16);
      expect(calculateBracketSize(50)).toBe(64);
    });
  });

  describe('calculateTotalRounds', () => {
    it('returns log2 of bracket size', () => {
      expect(calculateTotalRounds(4)).toBe(2);
      expect(calculateTotalRounds(8)).toBe(3);
      expect(calculateTotalRounds(16)).toBe(4);
      expect(calculateTotalRounds(32)).toBe(5);
      expect(calculateTotalRounds(64)).toBe(6);
    });
  });

  describe('calculateByeCount', () => {
    it('returns difference between bracket size and participants', () => {
      expect(calculateByeCount(8, 8)).toBe(0);
      expect(calculateByeCount(8, 6)).toBe(2);
      expect(calculateByeCount(16, 12)).toBe(4);
      expect(calculateByeCount(64, 50)).toBe(14);
    });
  });

  describe('getMatchCountForRound', () => {
    it('returns correct match count per round', () => {
      // 16-bracket
      expect(getMatchCountForRound(16, 1)).toBe(8);
      expect(getMatchCountForRound(16, 2)).toBe(4);
      expect(getMatchCountForRound(16, 3)).toBe(2);
      expect(getMatchCountForRound(16, 4)).toBe(1);
    });
  });
});
