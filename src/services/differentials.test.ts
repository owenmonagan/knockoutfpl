import { describe, it, expect } from 'vitest';
import { calculateDifferentials } from './differentials';
import type { FPLTeamPicks, FPLPlayer } from './fpl';

describe('calculateDifferentials', () => {
  it('should identify unique players in each team', () => {
    const teamA: FPLTeamPicks = {
      picks: [
        { element: 1, position: 1, multiplier: 1, is_captain: false, is_vice_captain: false }, // Pope (GK)
        { element: 2, position: 2, multiplier: 1, is_captain: false, is_vice_captain: false }, // Shared DEF
        { element: 10, position: 3, multiplier: 2, is_captain: true, is_vice_captain: false }, // Grealish (C)
      ],
      entryHistory: { event: 7, points: 76, totalPoints: 500 },
      activeChip: null,
    };

    const teamB: FPLTeamPicks = {
      picks: [
        { element: 5, position: 1, multiplier: 1, is_captain: false, is_vice_captain: false }, // Guehi (DEF)
        { element: 2, position: 2, multiplier: 1, is_captain: false, is_vice_captain: false }, // Shared DEF
        { element: 10, position: 3, multiplier: 1, is_captain: false, is_vice_captain: false }, // Grealish (not C)
      ],
      entryHistory: { event: 7, points: 78, totalPoints: 510 },
      activeChip: null,
    };

    const playerMap = new Map<number, FPLPlayer>([
      [1, { id: 1, web_name: 'Pope', element_type: 1, team: 1, now_cost: 50 }],
      [2, { id: 2, web_name: 'Saliba', element_type: 2, team: 2, now_cost: 60 }],
      [5, { id: 5, web_name: 'Guehi', element_type: 2, team: 3, now_cost: 45 }],
      [10, { id: 10, web_name: 'Grealish', element_type: 3, team: 4, now_cost: 65 }],
    ]);

    const liveScores = new Map<number, number>([
      [1, 7],   // Pope: 7 points
      [2, 2],   // Saliba: 2 points (shared, not a differential)
      [5, 3],   // Guehi: 3 points
      [10, 10], // Grealish: 10 points (but Team A captained = 20)
    ]);

    const result = calculateDifferentials(teamA, teamB, playerMap, liveScores);

    // Pope is unique to Team A
    const popeDiff = result.find((d) => d.teamA?.player.id === 1);
    expect(popeDiff).toBeDefined();
    expect(popeDiff?.teamA?.player.web_name).toBe('Pope');
    expect(popeDiff?.teamA?.points).toBe(7);
    expect(popeDiff?.teamA?.multiplier).toBe(1);
    expect(popeDiff?.teamB).toBeNull();

    // Guehi is unique to Team B
    const guehiDiff = result.find((d) => d.teamB?.player.id === 5);
    expect(guehiDiff).toBeDefined();
    expect(guehiDiff?.teamB?.player.web_name).toBe('Guehi');
    expect(guehiDiff?.teamB?.points).toBe(3);
    expect(guehiDiff?.teamA).toBeNull();

    // Grealish is in both teams but captained by Team A (differential)
    const grealishDiff = result.find((d) =>
      d.teamA?.player.id === 10 && d.teamB?.player.id === 10
    );
    expect(grealishDiff).toBeDefined();
    expect(grealishDiff?.teamA?.isCaptain).toBe(true);
    expect(grealishDiff?.teamA?.multiplier).toBe(2);
    expect(grealishDiff?.teamB?.isCaptain).toBe(false);
    expect(grealishDiff?.teamB?.multiplier).toBe(1);
    expect(grealishDiff?.pointDifference).toBe(10); // 20 - 10 = +10 for Team A
  });
});
