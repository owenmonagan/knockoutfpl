import { describe, it, expect } from 'vitest';
import * as functions from './index';

describe('Cloud Functions', () => {
  describe('exports', () => {
    it('should export getFPLBootstrapData function', () => {
      expect(functions.getFPLBootstrapData).toBeDefined();
    });

    it('should export getFPLTeamInfo function', () => {
      expect(functions.getFPLTeamInfo).toBeDefined();
    });

    it('should export getFPLGameweekScore function', () => {
      expect(functions.getFPLGameweekScore).toBeDefined();
    });

    it('should export updateCompletedGameweeks scheduled function', () => {
      expect(functions.updateCompletedGameweeks).toBeDefined();
    });
  });
});
