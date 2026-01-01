import { describe, it, expect } from 'vitest';
import { getInitials } from './initials';

describe('getInitials', () => {
  it('should return first two letters of first two words', () => {
    expect(getInitials("Haaland's Hairband FC")).toBe('HH');
  });

  it('should handle single word names', () => {
    expect(getInitials('Arsenal')).toBe('AR');
  });

  it('should handle two word names', () => {
    expect(getInitials('Work League')).toBe('WL');
  });

  it('should handle names with special characters', () => {
    expect(getInitials("Dave's Dumpster Fire")).toBe('DD');
  });

  it('should uppercase the result', () => {
    expect(getInitials('lower case team')).toBe('LC');
  });

  it('should handle empty string', () => {
    expect(getInitials('')).toBe('??');
  });

  it('should handle whitespace-only string', () => {
    expect(getInitials('   ')).toBe('??');
  });
});
