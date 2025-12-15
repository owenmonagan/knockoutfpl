// src/lib/bracket.test.ts
import { describe, it, expect } from 'vitest';
import { getRoundName } from './bracket';

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
