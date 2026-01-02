import { describe, it, expect } from 'vitest';
import {
  calculateNWayBracket,
  distributeByesAcrossGroups,
} from './nWayBracket';

describe('calculateNWayBracket', () => {
  describe('with matchSize=3', () => {
    it('calculates 27 participants: 3 rounds, 0 byes', () => {
      const result = calculateNWayBracket(27, 3);
      expect(result).toEqual({
        rounds: 3,
        totalSlots: 27,
        byeCount: 0,
        groupsPerRound: [9, 3, 1],
      });
    });

    it('calculates 20 participants: 3 rounds, 7 byes', () => {
      const result = calculateNWayBracket(20, 3);
      expect(result).toEqual({
        rounds: 3,
        totalSlots: 27,
        byeCount: 7,
        groupsPerRound: [9, 3, 1],
      });
    });

    it('calculates 10 participants: 3 rounds, 17 byes', () => {
      const result = calculateNWayBracket(10, 3);
      expect(result).toEqual({
        rounds: 3,
        totalSlots: 27,
        byeCount: 17,
        groupsPerRound: [9, 3, 1],
      });
    });
  });

  describe('with matchSize=4', () => {
    it('calculates 64 participants: 3 rounds, 0 byes', () => {
      const result = calculateNWayBracket(64, 4);
      expect(result).toEqual({
        rounds: 3,
        totalSlots: 64,
        byeCount: 0,
        groupsPerRound: [16, 4, 1],
      });
    });

    it('calculates 50 participants: 3 rounds, 14 byes', () => {
      const result = calculateNWayBracket(50, 4);
      expect(result).toEqual({
        rounds: 3,
        totalSlots: 64,
        byeCount: 14,
        groupsPerRound: [16, 4, 1],
      });
    });
  });

  describe('with matchSize=2 (1v1)', () => {
    it('calculates 16 participants: 4 rounds, 0 byes', () => {
      const result = calculateNWayBracket(16, 2);
      expect(result).toEqual({
        rounds: 4,
        totalSlots: 16,
        byeCount: 0,
        groupsPerRound: [8, 4, 2, 1],
      });
    });
  });
});

describe('distributeByesAcrossGroups', () => {
  it('distributes 7 byes across 9 groups evenly', () => {
    const result = distributeByesAcrossGroups(9, 7, 3);
    // Top 7 seeds get 1 bye each (facing only 2 opponents)
    // Remaining 2 groups have full 3-way matches
    expect(result.groupsWithByes).toBe(7);
    expect(result.groupsWithTwoByes).toBe(0);
    expect(result.fullGroups).toBe(2);
  });

  it('handles more byes than groups', () => {
    const result = distributeByesAcrossGroups(9, 17, 3);
    // 17 byes across 9 groups of 3 = 27 slots
    // 9 groups get 1 bye, 8 groups get a second bye
    expect(result.groupsWithByes).toBe(9);
    expect(result.groupsWithTwoByes).toBe(8);
    expect(result.fullGroups).toBe(0);
  });

  it('handles auto-advance (2 byes in group of 3)', () => {
    const result = distributeByesAcrossGroups(9, 18, 3);
    // Every group has exactly 2 byes = 1 real player each
    expect(result.groupsWithTwoByes).toBe(9);
    expect(result.autoAdvanceCount).toBe(9);
  });

  it('distributes byes for matchSize=4', () => {
    const result = distributeByesAcrossGroups(16, 14, 4);
    // 14 byes across 16 groups: 14 groups get 1 bye each, 2 groups are full
    expect(result.groupsWithByes).toBe(14);
    expect(result.fullGroups).toBe(2);
    // autoAdvanceCount is 0 for matchSize=4 (not yet implemented)
    expect(result.autoAdvanceCount).toBe(0);
  });
});
