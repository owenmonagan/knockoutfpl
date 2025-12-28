import { describe, it, expect } from 'vitest';
import {
  calculateBracketSize,
  calculateTotalRounds,
  calculateByeCount,
  getMatchCountForRound,
  generateSeedPairings,
  generateBracketStructure,
  BracketMatch,
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

  describe('generateSeedPairings', () => {
    it('generates standard bracket pairings for 8 seeds', () => {
      const pairings = generateSeedPairings(8);
      // Standard bracket: 1v8, 4v5, 2v7, 3v6
      expect(pairings).toEqual([
        { position: 1, seed1: 1, seed2: 8 },
        { position: 2, seed1: 4, seed2: 5 },
        { position: 3, seed1: 2, seed2: 7 },
        { position: 4, seed1: 3, seed2: 6 },
      ]);
    });

    it('generates standard bracket pairings for 16 seeds', () => {
      const pairings = generateSeedPairings(16);
      expect(pairings).toHaveLength(8);
      // First match: 1 vs 16
      expect(pairings[0]).toEqual({ position: 1, seed1: 1, seed2: 16 });
      // Second match: 8 vs 9 (adjacent seeds in standard bracket)
      expect(pairings[1]).toEqual({ position: 2, seed1: 8, seed2: 9 });
      // Last match: 6 vs 11
      expect(pairings[7]).toEqual({ position: 8, seed1: 6, seed2: 11 });
    });

    it('generates pairings for 4 seeds', () => {
      const pairings = generateSeedPairings(4);
      expect(pairings).toEqual([
        { position: 1, seed1: 1, seed2: 4 },
        { position: 2, seed1: 2, seed2: 3 },
      ]);
    });
  });

  describe('generateBracketStructure', () => {
    it('generates all matches with correct qualifies_to links for 8 participants', () => {
      const matches = generateBracketStructure(8);

      // 8 participants = 7 matches total (4 + 2 + 1)
      expect(matches).toHaveLength(7);

      // Round 1: matches 1-4
      expect(matches.filter(m => m.roundNumber === 1)).toHaveLength(4);
      // Round 2: matches 5-6
      expect(matches.filter(m => m.roundNumber === 2)).toHaveLength(2);
      // Round 3 (final): match 7
      expect(matches.filter(m => m.roundNumber === 3)).toHaveLength(1);

      // Check qualifies_to links
      // Match 1 (R1, pos 1) -> Match 5 (R2, pos 1)
      expect(matches[0].qualifiesToMatchId).toBe(5);
      // Match 2 (R1, pos 2) -> Match 5 (R2, pos 1)
      expect(matches[1].qualifiesToMatchId).toBe(5);
      // Match 3 (R1, pos 3) -> Match 6 (R2, pos 2)
      expect(matches[2].qualifiesToMatchId).toBe(6);
      // Match 4 (R1, pos 4) -> Match 6 (R2, pos 2)
      expect(matches[3].qualifiesToMatchId).toBe(6);

      // Final has no qualifies_to
      expect(matches[6].qualifiesToMatchId).toBeNull();
    });

    it('generates correct structure for 16 participants', () => {
      const matches = generateBracketStructure(16);

      // 16 participants = 15 matches (8 + 4 + 2 + 1)
      expect(matches).toHaveLength(15);

      // Verify round distribution
      expect(matches.filter(m => m.roundNumber === 1)).toHaveLength(8);
      expect(matches.filter(m => m.roundNumber === 2)).toHaveLength(4);
      expect(matches.filter(m => m.roundNumber === 3)).toHaveLength(2);
      expect(matches.filter(m => m.roundNumber === 4)).toHaveLength(1);
    });
  });
});
