import { describe, it, expect } from 'vitest';
import { resolveMatch, getNextRoundSlot, canPopulateNextMatch, validateFeedersComplete } from './match-resolver';
import { RoundMatch } from './dataconnect-mutations';

describe('resolveMatch', () => {
  const createMatch = (
    matchId: number,
    picks: Array<{ entryId: number; slot: number; seed: number }>
  ): RoundMatch => ({
    tournamentId: 'test-tournament',
    matchId,
    roundNumber: 1,
    positionInRound: 1,
    qualifiesToMatchId: null,
    isBye: false,
    status: 'active',
    matchPicks: picks.map(p => ({
      entryId: p.entryId,
      slot: p.slot,
      participant: { seed: p.seed },
    })),
  });

  it('should determine winner by higher points', () => {
    const match = createMatch(1, [
      { entryId: 100, slot: 1, seed: 1 },
      { entryId: 200, slot: 2, seed: 2 },
    ]);
    const scores = new Map([[100, 50], [200, 70]]);

    const result = resolveMatch(match, scores);

    expect(result).not.toBeNull();
    expect(result!.winnerId).toBe(200);
    expect(result!.loserId).toBe(100);
    expect(result!.winnerScore).toBe(70);
    expect(result!.loserScore).toBe(50);
    expect(result!.decidedByTiebreaker).toBe(false);
  });

  it('should use seed as tiebreaker when points are equal', () => {
    const match = createMatch(1, [
      { entryId: 100, slot: 1, seed: 3 },
      { entryId: 200, slot: 2, seed: 1 },
    ]);
    const scores = new Map([[100, 60], [200, 60]]);

    const result = resolveMatch(match, scores);

    expect(result).not.toBeNull();
    expect(result!.winnerId).toBe(200); // Seed 1 beats seed 3
    expect(result!.loserId).toBe(100);
    expect(result!.decidedByTiebreaker).toBe(true);
  });

  it('should handle bye matches with single player', () => {
    const match: RoundMatch = {
      ...createMatch(1, [{ entryId: 100, slot: 1, seed: 1 }]),
      isBye: true,
    };
    const scores = new Map([[100, 0]]);

    const result = resolveMatch(match, scores);

    expect(result).not.toBeNull();
    expect(result!.winnerId).toBe(100);
    expect(result!.loserId).toBeNull();
  });

  it('should return null for matches with invalid player count', () => {
    const match = createMatch(1, [
      { entryId: 100, slot: 1, seed: 1 },
      { entryId: 200, slot: 2, seed: 2 },
      { entryId: 300, slot: 3, seed: 3 },
    ]);
    const scores = new Map([[100, 50], [200, 60], [300, 70]]);

    const result = resolveMatch(match, scores);

    expect(result).toBeNull();
  });

  it('should return null when one player score is missing', () => {
    const match = createMatch(1, [
      { entryId: 100, slot: 1, seed: 1 },
      { entryId: 200, slot: 2, seed: 2 },
    ]);
    const scores = new Map([[100, 50]]); // Only player 100 has a score

    const result = resolveMatch(match, scores);

    expect(result).toBeNull();
  });

  it('should return null when both player scores are missing', () => {
    const match = createMatch(1, [
      { entryId: 100, slot: 1, seed: 1 },
      { entryId: 200, slot: 2, seed: 2 },
    ]);
    const scores = new Map<number, number>(); // No scores

    const result = resolveMatch(match, scores);

    expect(result).toBeNull();
  });

  it('should resolve match when both scores are present (including zero)', () => {
    const match = createMatch(1, [
      { entryId: 100, slot: 1, seed: 1 },
      { entryId: 200, slot: 2, seed: 2 },
    ]);
    const scores = new Map([[100, 50], [200, 0]]); // Both scores present, one is zero

    const result = resolveMatch(match, scores);

    expect(result).not.toBeNull();
    expect(result!.winnerId).toBe(100);
    expect(result!.loserId).toBe(200);
    expect(result!.winnerScore).toBe(50);
    expect(result!.loserScore).toBe(0);
  });

  it('should return correct winner slot', () => {
    const match = createMatch(1, [
      { entryId: 100, slot: 1, seed: 2 },
      { entryId: 200, slot: 2, seed: 1 },
    ]);
    const scores = new Map([[100, 80], [200, 60]]);

    const result = resolveMatch(match, scores);

    expect(result).not.toBeNull();
    expect(result!.winnerId).toBe(100);
    expect(result!.winnerSlot).toBe(1);
  });
});

describe('getNextRoundSlot', () => {
  it('should return slot 1 for odd positions', () => {
    expect(getNextRoundSlot(1)).toBe(1);
    expect(getNextRoundSlot(3)).toBe(1);
    expect(getNextRoundSlot(5)).toBe(1);
  });

  it('should return slot 2 for even positions', () => {
    expect(getNextRoundSlot(2)).toBe(2);
    expect(getNextRoundSlot(4)).toBe(2);
    expect(getNextRoundSlot(6)).toBe(2);
  });
});

describe('canPopulateNextMatch', () => {
  const createMinimalMatch = (
    matchId: number,
    qualifiesToMatchId: number | null
  ): RoundMatch => ({
    tournamentId: 'test-tournament',
    matchId,
    roundNumber: 1,
    positionInRound: 1,
    qualifiesToMatchId,
    isBye: false,
    status: 'active',
    matchPicks: [],
  });

  it('should return ready=true when all feeder matches are complete', () => {
    const allMatches: RoundMatch[] = [
      createMinimalMatch(1, 5),
      createMinimalMatch(2, 5),
      createMinimalMatch(5, null),
    ];
    const completedMatchIds = new Set([1, 2]);

    const result = canPopulateNextMatch(5, allMatches, completedMatchIds);

    expect(result.ready).toBe(true);
    expect(result.feederMatchIds).toEqual([1, 2]);
  });

  it('should return ready=false when not all feeder matches are complete', () => {
    const allMatches: RoundMatch[] = [
      createMinimalMatch(1, 5),
      createMinimalMatch(2, 5),
      createMinimalMatch(5, null),
    ];
    const completedMatchIds = new Set([1]);

    const result = canPopulateNextMatch(5, allMatches, completedMatchIds);

    expect(result.ready).toBe(false);
    expect(result.feederMatchIds).toEqual([1, 2]);
  });

  it('should return ready=false when no feeder matches exist', () => {
    const allMatches: RoundMatch[] = [
      createMinimalMatch(1, null),
    ];
    const completedMatchIds = new Set<number>();

    const result = canPopulateNextMatch(1, allMatches, completedMatchIds);

    expect(result.ready).toBe(false);
    expect(result.feederMatchIds).toEqual([]);
  });
});

describe('validateFeedersComplete', () => {
  interface MinimalMatch {
    matchId: number;
    status: string;
    qualifiesToMatchId?: number | null;
  }

  it('should return ready=true for round 1 matches (no feeders)', () => {
    const allMatches: MinimalMatch[] = [
      { matchId: 1, status: 'pending', qualifiesToMatchId: 5 },
      { matchId: 2, status: 'pending', qualifiesToMatchId: 5 },
      { matchId: 5, status: 'pending', qualifiesToMatchId: null },
    ];

    // Match 1 is in round 1 - no matches feed into it
    const result = validateFeedersComplete(1, allMatches);

    expect(result.ready).toBe(true);
    expect(result.incompleteFeederIds).toEqual([]);
  });

  it('should return ready=true when all feeder matches are complete', () => {
    const allMatches: MinimalMatch[] = [
      { matchId: 1, status: 'complete', qualifiesToMatchId: 5 },
      { matchId: 2, status: 'complete', qualifiesToMatchId: 5 },
      { matchId: 5, status: 'pending', qualifiesToMatchId: null },
    ];

    const result = validateFeedersComplete(5, allMatches);

    expect(result.ready).toBe(true);
    expect(result.incompleteFeederIds).toEqual([]);
  });

  it('should return ready=false with incomplete feeder IDs when feeders not complete', () => {
    const allMatches: MinimalMatch[] = [
      { matchId: 1, status: 'complete', qualifiesToMatchId: 5 },
      { matchId: 2, status: 'active', qualifiesToMatchId: 5 },
      { matchId: 5, status: 'pending', qualifiesToMatchId: null },
    ];

    const result = validateFeedersComplete(5, allMatches);

    expect(result.ready).toBe(false);
    expect(result.incompleteFeederIds).toEqual([2]);
  });

  it('should return all incomplete feeder IDs when multiple feeders are incomplete', () => {
    const allMatches: MinimalMatch[] = [
      { matchId: 1, status: 'pending', qualifiesToMatchId: 5 },
      { matchId: 2, status: 'active', qualifiesToMatchId: 5 },
      { matchId: 5, status: 'pending', qualifiesToMatchId: null },
    ];

    const result = validateFeedersComplete(5, allMatches);

    expect(result.ready).toBe(false);
    expect(result.incompleteFeederIds).toEqual([1, 2]);
  });

  it('should handle matches with undefined qualifiesToMatchId', () => {
    const allMatches: MinimalMatch[] = [
      { matchId: 1, status: 'complete' }, // undefined qualifiesToMatchId
      { matchId: 2, status: 'complete', qualifiesToMatchId: null },
    ];

    // No matches feed into match 1
    const result = validateFeedersComplete(1, allMatches);

    expect(result.ready).toBe(true);
    expect(result.incompleteFeederIds).toEqual([]);
  });
});

