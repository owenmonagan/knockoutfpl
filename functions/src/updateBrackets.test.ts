import { describe, it, expect } from 'vitest';
import { sortMatchesByClaimedPriority } from './updateBrackets';
import type { RoundMatch } from './dataconnect-mutations';

/**
 * Helper to create minimal RoundMatch objects for testing
 */
function createMatch(
  matchId: number,
  uids: Array<string | null>
): RoundMatch {
  return {
    tournamentId: 'test-tournament',
    matchId,
    roundNumber: 1,
    positionInRound: matchId,
    qualifiesToMatchId: null,
    isBye: false,
    status: 'pending',
    matchPicks: uids.map((uid, i) => ({
      entryId: matchId * 100 + i,
      slot: i,
      participant: {
        seed: i + 1,
        uid,
      },
    })),
  };
}

describe('sortMatchesByClaimedPriority', () => {
  it('processes matches with claimed users first', () => {
    const matches: RoundMatch[] = [
      createMatch(1, [null, null]),       // 0 claimed
      createMatch(2, ['user1', null]),    // 1 claimed
      createMatch(3, ['user1', 'user2']), // 2 claimed
      createMatch(4, [null, 'user3']),    // 1 claimed
    ];

    const sorted = sortMatchesByClaimedPriority(matches);

    expect(sorted[0].matchId).toBe(3); // Both claimed first
    expect([2, 4]).toContain(sorted[1].matchId); // One claimed next
    expect([2, 4]).toContain(sorted[2].matchId);
    expect(sorted[3].matchId).toBe(1); // No claimed last
  });

  it('does not mutate the original array', () => {
    const matches: RoundMatch[] = [
      createMatch(1, [null, null]),
      createMatch(2, ['user1', 'user2']),
    ];
    const originalOrder = matches.map(m => m.matchId);

    sortMatchesByClaimedPriority(matches);

    expect(matches.map(m => m.matchId)).toEqual(originalOrder);
  });

  it('handles empty array', () => {
    const matches: RoundMatch[] = [];

    const sorted = sortMatchesByClaimedPriority(matches);

    expect(sorted).toEqual([]);
  });

  it('handles single match', () => {
    const matches: RoundMatch[] = [
      createMatch(1, ['user1', null]),
    ];

    const sorted = sortMatchesByClaimedPriority(matches);

    expect(sorted).toHaveLength(1);
    expect(sorted[0].matchId).toBe(1);
  });

  it('handles matches with more than 2 participants', () => {
    const matches: RoundMatch[] = [
      createMatch(1, [null, null, null]),        // 0 claimed
      createMatch(2, ['u1', 'u2', 'u3']),         // 3 claimed
      createMatch(3, ['u1', null, 'u3']),         // 2 claimed
    ];

    const sorted = sortMatchesByClaimedPriority(matches);

    expect(sorted[0].matchId).toBe(2); // 3 claimed first
    expect(sorted[1].matchId).toBe(3); // 2 claimed second
    expect(sorted[2].matchId).toBe(1); // 0 claimed last
  });

  it('preserves all RoundMatch properties', () => {
    const match = createMatch(1, ['user1']);
    match.qualifiesToMatchId = 99;
    match.roundNumber = 3;
    match.status = 'active';
    const matches: RoundMatch[] = [match];

    const sorted = sortMatchesByClaimedPriority(matches);

    expect(sorted[0].qualifiesToMatchId).toBe(99);
    expect(sorted[0].roundNumber).toBe(3);
    expect(sorted[0].status).toBe('active');
  });

  it('maintains stable sort for equal claim counts', () => {
    // When matches have same claim count, original order should be preserved
    const matches: RoundMatch[] = [
      createMatch(1, ['user1', null]),  // 1 claimed
      createMatch(2, ['user2', null]),  // 1 claimed
      createMatch(3, ['user3', null]),  // 1 claimed
    ];

    const sorted = sortMatchesByClaimedPriority(matches);

    // All have 1 claimed, so original order should be preserved
    expect(sorted[0].matchId).toBe(1);
    expect(sorted[1].matchId).toBe(2);
    expect(sorted[2].matchId).toBe(3);
  });
});
