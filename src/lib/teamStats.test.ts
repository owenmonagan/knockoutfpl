import { describe, it, expect, vi } from 'vitest';
import { calculateAveragePoints, calculateForm, calculateAdvantage } from './teamStats';
import * as fplService from '../services/fpl';

vi.mock('../services/fpl');

describe('teamStats', () => {
  describe('calculateAveragePoints', () => {
    it('calculates average points from completed gameweeks', async () => {
      // Mock getFPLGameweekScore to return scores for gameweeks 1-5
      vi.mocked(fplService.getFPLGameweekScore)
        .mockResolvedValueOnce({ gameweek: 1, points: 60 })
        .mockResolvedValueOnce({ gameweek: 2, points: 75 })
        .mockResolvedValueOnce({ gameweek: 3, points: 50 })
        .mockResolvedValueOnce({ gameweek: 4, points: 80 })
        .mockResolvedValueOnce({ gameweek: 5, points: 65 });

      const avgPoints = await calculateAveragePoints(123, 6);

      // Average: (60 + 75 + 50 + 80 + 65) / 5 = 330 / 5 = 66
      expect(avgPoints).toBe(66);
    });
  });

  describe('calculateForm', () => {
    it('returns form indicators for last 5 gameweeks', async () => {
      // Average is 66 (from GW 1-10: 60+75+50+80+65+75+50+80+65+70 = 670 / 10 = 67)
      // Last 5 GWs: 75 (W), 50 (L), 80 (W), 65 (L), 70 (W)
      vi.mocked(fplService.getFPLGameweekScore)
        // For calculating average (GW 1-10) - called by calculateForm internally
        .mockResolvedValueOnce({ gameweek: 1, points: 60 })
        .mockResolvedValueOnce({ gameweek: 2, points: 75 })
        .mockResolvedValueOnce({ gameweek: 3, points: 50 })
        .mockResolvedValueOnce({ gameweek: 4, points: 80 })
        .mockResolvedValueOnce({ gameweek: 5, points: 65 })
        .mockResolvedValueOnce({ gameweek: 6, points: 75 })
        .mockResolvedValueOnce({ gameweek: 7, points: 50 })
        .mockResolvedValueOnce({ gameweek: 8, points: 80 })
        .mockResolvedValueOnce({ gameweek: 9, points: 65 })
        .mockResolvedValueOnce({ gameweek: 10, points: 70 })
        // For getting last 5 GW scores (GW 6-10)
        .mockResolvedValueOnce({ gameweek: 6, points: 75 })
        .mockResolvedValueOnce({ gameweek: 7, points: 50 })
        .mockResolvedValueOnce({ gameweek: 8, points: 80 })
        .mockResolvedValueOnce({ gameweek: 9, points: 65 })
        .mockResolvedValueOnce({ gameweek: 10, points: 70 });

      const form = await calculateForm(123, 11);

      // Average = 67, so: 75 >= 67 (W), 50 < 67 (L), 80 >= 67 (W), 65 < 67 (L), 70 >= 67 (W)
      expect(form).toBe('W-L-W-L-W');
    });
  });

  describe('calculateAdvantage', () => {
    it('returns advantage for team A when they have higher average', () => {
      const result = calculateAdvantage(72, 68);

      expect(result).toEqual({
        leader: 'A',
        advantage: 4,
        message: '⚡ +4 pts/GW (You!)'
      });
    });

    it('includes ⚡ emoji in advantage message', () => {
      const result1 = calculateAdvantage(72, 68);
      expect(result1.message).toMatch(/^⚡/);

      const result2 = calculateAdvantage(65, 70);
      expect(result2.message).toMatch(/^⚡/);

      const result3 = calculateAdvantage(70, 70);
      expect(result3.message).toMatch(/^⚡/);
    });
  });
});
