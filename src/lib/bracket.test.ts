// src/lib/bracket.test.ts
import { describe, it, expect } from 'vitest';
import { getRoundName, calculateByes } from './bracket';

describe('getRoundName', () => {
  it('should return "Final" for last round', () => {
    expect(getRoundName(4, 4)).toBe('Final');
  });

  it('should return "Semi-Finals" for second to last round', () => {
    expect(getRoundName(3, 4)).toBe('Semi-Finals');
  });

  it('should return "Quarter-Finals" for third to last round', () => {
    expect(getRoundName(2, 4)).toBe('Quarter-Finals');
  });

  it('should return "Round X" for earlier rounds', () => {
    expect(getRoundName(1, 4)).toBe('Round 1');
    expect(getRoundName(1, 6)).toBe('Round 1');
  });
});

describe('calculateByes', () => {
  it('should return 0 byes for power of 2', () => {
    expect(calculateByes(8)).toBe(0);
    expect(calculateByes(16)).toBe(0);
  });

  it('should return correct byes for non-power of 2', () => {
    expect(calculateByes(5)).toBe(3);  // Next power is 8, need 3 byes
    expect(calculateByes(6)).toBe(2);
    expect(calculateByes(7)).toBe(1);
    expect(calculateByes(10)).toBe(6); // Next power is 16, need 6 byes
  });
});
