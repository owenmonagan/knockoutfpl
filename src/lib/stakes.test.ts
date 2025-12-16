import { describe, it, expect } from 'vitest';
import { getStakesCallout } from './stakes';

describe('getStakesCallout', () => {
  describe('when user is winning', () => {
    it('returns "X points from elimination" when ahead by 1-10 points', () => {
      const result = getStakesCallout(67, 62, true);
      expect(result).toBe('⚡ 5 points from elimination');
    });

    it('returns "X points from elimination" when ahead by exactly 1', () => {
      const result = getStakesCallout(50, 49, true);
      expect(result).toBe('⚡ 1 point from elimination');
    });

    it('returns "Holding on. X point cushion." when ahead by 11-20 points', () => {
      const result = getStakesCallout(80, 65, true);
      expect(result).toBe('⚡ Holding on. 15 point cushion.');
    });

    it('returns "Cruising. X point lead." when ahead by 21+ points', () => {
      const result = getStakesCallout(90, 65, true);
      expect(result).toBe('⚡ Cruising. 25 point lead.');
    });
  });

  describe('when user is losing', () => {
    it('returns "X points from survival" when behind by 1-10 points', () => {
      const result = getStakesCallout(55, 62, true);
      expect(result).toBe('⚡ 7 points from survival');
    });

    it('returns "1 point from survival" when behind by exactly 1', () => {
      const result = getStakesCallout(49, 50, true);
      expect(result).toBe('⚡ 1 point from survival');
    });

    it('returns "X behind. Time to fight." when behind by 11-20 points', () => {
      const result = getStakesCallout(50, 65, true);
      expect(result).toBe('⚡ 15 behind. Time to fight.');
    });

    it('returns "Danger zone. X points to make up." when behind by 21+ points', () => {
      const result = getStakesCallout(40, 70, true);
      expect(result).toBe('⚡ Danger zone. 30 points to make up.');
    });
  });

  describe('when tied', () => {
    it('returns "Dead heat." when scores are equal', () => {
      const result = getStakesCallout(65, 65, true);
      expect(result).toBe('⚡ Dead heat.');
    });
  });

  describe('when not user match', () => {
    it('returns empty string for non-user matches', () => {
      const result = getStakesCallout(70, 50, false);
      expect(result).toBe('');
    });
  });
});
