import { describe, it, expect } from 'vitest';
import {
  calculateNWayBracket,
  distributeByesAcrossGroups,
  generateNWayBracketStructure,
  assignParticipantsToNWayMatches,
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

describe('generateNWayBracketStructure', () => {
  describe('with matchSize=4', () => {
    it('generates correct structure for 2 rounds (4 groups in R1, 1 final)', () => {
      const matches = generateNWayBracketStructure(4, 2);

      // Round 1: 4 matches, Round 2: 1 match = 5 total
      expect(matches.length).toBe(5);

      // Check round 1 matches
      const round1 = matches.filter(m => m.roundNumber === 1);
      expect(round1.length).toBe(4);
      round1.forEach((m, i) => {
        expect(m.positionInRound).toBe(i + 1);
        expect(m.qualifiesToMatchId).toBe(5); // All R1 matches go to match 5 (final)
      });

      // Check final
      const final = matches.find(m => m.roundNumber === 2);
      expect(final).toBeDefined();
      expect(final!.matchId).toBe(5);
      expect(final!.qualifiesToMatchId).toBeNull();
    });

    it('generates correct structure for 3 rounds (16→4→1)', () => {
      const matches = generateNWayBracketStructure(4, 3);

      // Round 1: 16, Round 2: 4, Round 3: 1 = 21 total
      expect(matches.length).toBe(21);

      const round1 = matches.filter(m => m.roundNumber === 1);
      const round2 = matches.filter(m => m.roundNumber === 2);
      const round3 = matches.filter(m => m.roundNumber === 3);

      expect(round1.length).toBe(16);
      expect(round2.length).toBe(4);
      expect(round3.length).toBe(1);

      // Check R1 match 1 qualifies to R2 match 1
      expect(round1[0].qualifiesToMatchId).toBe(17);
      expect(round1[1].qualifiesToMatchId).toBe(17);
      expect(round1[2].qualifiesToMatchId).toBe(17);
      expect(round1[3].qualifiesToMatchId).toBe(17);

      // Check R1 match 5-8 qualify to R2 match 2
      expect(round1[4].qualifiesToMatchId).toBe(18);
      expect(round1[7].qualifiesToMatchId).toBe(18);
    });
  });

  describe('with matchSize=3', () => {
    it('generates correct structure for 2 rounds (3 groups in R1, 1 final)', () => {
      const matches = generateNWayBracketStructure(3, 2);

      // Round 1: 3 matches, Round 2: 1 match = 4 total
      expect(matches.length).toBe(4);

      const round1 = matches.filter(m => m.roundNumber === 1);
      expect(round1.length).toBe(3);
      round1.forEach(m => {
        expect(m.qualifiesToMatchId).toBe(4); // All go to final
      });
    });

    it('generates correct structure for 3 rounds (9→3→1)', () => {
      const matches = generateNWayBracketStructure(3, 3);

      // 9 + 3 + 1 = 13 matches
      expect(matches.length).toBe(13);

      const round1 = matches.filter(m => m.roundNumber === 1);
      const round2 = matches.filter(m => m.roundNumber === 2);

      expect(round1.length).toBe(9);
      expect(round2.length).toBe(3);

      // R1 matches 1-3 qualify to R2 match 1
      expect(round1[0].qualifiesToMatchId).toBe(10);
      expect(round1[1].qualifiesToMatchId).toBe(10);
      expect(round1[2].qualifiesToMatchId).toBe(10);
    });
  });

  it('match IDs are sequential', () => {
    const matches = generateNWayBracketStructure(4, 2);
    const ids = matches.map(m => m.matchId).sort((a, b) => a - b);
    expect(ids).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('assignParticipantsToNWayMatches', () => {
  describe('with matchSize=4, 16 participants (no byes)', () => {
    it('assigns all participants to 4 groups', () => {
      const assignments = assignParticipantsToNWayMatches(4, 16, 16);

      // 4 groups of 4
      expect(assignments.length).toBe(4);

      // Each group has 4 seeds, no byes
      assignments.forEach(group => {
        expect(group.seeds.length).toBe(4);
        expect(group.isBye).toBe(false);
        expect(group.seeds.every(s => s !== null)).toBe(true);
      });

      // All 16 seeds are used exactly once
      const allSeeds = assignments.flatMap(g => g.seeds).filter(s => s !== null);
      expect(allSeeds.length).toBe(16);
      expect(new Set(allSeeds).size).toBe(16);
    });

    it('uses snake draft seeding (1,8,9,16 in group 1)', () => {
      const assignments = assignParticipantsToNWayMatches(4, 16, 16);

      // Snake draft for 4 groups of 4:
      // Row 1 (seeds 1-4): G1, G2, G3, G4
      // Row 2 (seeds 5-8): G4, G3, G2, G1
      // Row 3 (seeds 9-12): G1, G2, G3, G4
      // Row 4 (seeds 13-16): G4, G3, G2, G1

      // Group 1 should have seeds: 1, 8, 9, 16
      expect(assignments[0].seeds).toContain(1);
      expect(assignments[0].seeds).toContain(8);
      expect(assignments[0].seeds).toContain(9);
      expect(assignments[0].seeds).toContain(16);
    });
  });

  describe('with matchSize=4, 10 participants (6 byes)', () => {
    it('assigns 10 participants with 6 byes across 4 groups', () => {
      const assignments = assignParticipantsToNWayMatches(4, 16, 10);

      expect(assignments.length).toBe(4);

      // Count real players vs byes
      const allSeeds = assignments.flatMap(g => g.seeds);
      const realPlayers = allSeeds.filter(s => s !== null).length;
      const byes = allSeeds.filter(s => s === null).length;

      expect(realPlayers).toBe(10);
      expect(byes).toBe(6);
    });

    it('distributes byes to favor top seeds', () => {
      const assignments = assignParticipantsToNWayMatches(4, 16, 10);

      // Top seeds should have more byes in their groups
      // Groups with seed 1 and 2 should have byes
      const group1 = assignments.find(g => g.seeds.includes(1));
      const group2 = assignments.find(g => g.seeds.includes(2));

      expect(group1).toBeDefined();
      expect(group2).toBeDefined();

      // Both top seed groups should have at least 1 bye
      const group1Byes = group1!.seeds.filter(s => s === null).length;
      const group2Byes = group2!.seeds.filter(s => s === null).length;

      expect(group1Byes).toBeGreaterThanOrEqual(1);
      expect(group2Byes).toBeGreaterThanOrEqual(1);
    });

    it('marks groups as byes when they have only 1 real player', () => {
      // With extreme byes (e.g., 4 participants in 16-slot bracket = 12 byes)
      const assignments = assignParticipantsToNWayMatches(4, 16, 4);

      // Should still have 4 groups, but some may be auto-advance
      expect(assignments.length).toBe(4);

      // Each of the 4 participants gets their own group with 3 byes
      const byeGroups = assignments.filter(g => g.isBye);
      expect(byeGroups.length).toBe(4); // All groups are auto-advance
    });
  });

  describe('with matchSize=3, 9 participants (no byes)', () => {
    it('assigns all participants to 3 groups', () => {
      const assignments = assignParticipantsToNWayMatches(3, 9, 9);

      expect(assignments.length).toBe(3);

      assignments.forEach(group => {
        expect(group.seeds.length).toBe(3);
        expect(group.isBye).toBe(false);
      });
    });
  });

  describe('with matchSize=3, 7 participants (2 byes)', () => {
    it('assigns 7 participants with 2 byes', () => {
      const assignments = assignParticipantsToNWayMatches(3, 9, 7);

      expect(assignments.length).toBe(3);

      const allSeeds = assignments.flatMap(g => g.seeds);
      const realPlayers = allSeeds.filter(s => s !== null).length;
      const byes = allSeeds.filter(s => s === null).length;

      expect(realPlayers).toBe(7);
      expect(byes).toBe(2);
    });
  });
});
