import { getVisibleRounds } from './BracketTab';
import type { Round } from '@/types/tournament';

// Helper to create mock rounds
function createMockRounds(count: number): Round[] {
  return Array.from({ length: count }, (_, i) => ({
    roundNumber: i + 1,
    name: `Round ${i + 1}`,
    gameweek: 20 + i,
    matches: [],
    isComplete: false,
  }));
}

describe('getVisibleRounds', () => {
  it('returns all rounds when 5 or fewer', () => {
    const rounds = createMockRounds(3);
    const result = getVisibleRounds(rounds);

    expect(result.visibleRounds).toHaveLength(3);
    expect(result.hiddenCount).toBe(0);
  });

  it('returns last 5 rounds when more than 5', () => {
    const rounds = createMockRounds(10);
    const result = getVisibleRounds(rounds);

    expect(result.visibleRounds).toHaveLength(5);
    expect(result.visibleRounds[0].roundNumber).toBe(6);
    expect(result.visibleRounds[4].roundNumber).toBe(10);
    expect(result.hiddenCount).toBe(5);
  });

  it('returns exactly 5 rounds when exactly 5', () => {
    const rounds = createMockRounds(5);
    const result = getVisibleRounds(rounds);

    expect(result.visibleRounds).toHaveLength(5);
    expect(result.hiddenCount).toBe(0);
  });

  it('handles 15 rounds (large tournament)', () => {
    const rounds = createMockRounds(15);
    const result = getVisibleRounds(rounds);

    expect(result.visibleRounds).toHaveLength(5);
    expect(result.visibleRounds[0].roundNumber).toBe(11);
    expect(result.hiddenCount).toBe(10);
  });

  it('handles empty rounds array', () => {
    const result = getVisibleRounds([]);
    expect(result.visibleRounds).toHaveLength(0);
    expect(result.hiddenCount).toBe(0);
  });
});
