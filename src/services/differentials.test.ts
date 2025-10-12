import { describe, it, expect } from 'vitest';
import { calculateDifferentials, calculateCommonPlayers } from './differentials';
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

describe('calculateCommonPlayers', () => {
  it('should identify players common to both teams with same multiplier', () => {
    const teamA: FPLTeamPicks = {
      picks: [
        { element: 1, position: 1, multiplier: 1, is_captain: false, is_vice_captain: false }, // Pope (GK) - common
        { element: 2, position: 2, multiplier: 1, is_captain: false, is_vice_captain: false }, // Saliba (DEF) - common
        { element: 3, position: 3, multiplier: 2, is_captain: true, is_vice_captain: false },  // Salah (MID) - common captain
        { element: 4, position: 4, multiplier: 1, is_captain: false, is_vice_captain: false }, // Haaland (FWD) - unique to A
        { element: 5, position: 5, multiplier: 0, is_captain: false, is_vice_captain: false }, // Benched player
      ],
      entryHistory: { event: 7, points: 76, totalPoints: 500 },
      activeChip: null,
    };

    const teamB: FPLTeamPicks = {
      picks: [
        { element: 1, position: 1, multiplier: 1, is_captain: false, is_vice_captain: false }, // Pope (GK) - common
        { element: 2, position: 2, multiplier: 1, is_captain: false, is_vice_captain: false }, // Saliba (DEF) - common
        { element: 3, position: 3, multiplier: 2, is_captain: true, is_vice_captain: false },  // Salah (MID) - common captain
        { element: 6, position: 4, multiplier: 1, is_captain: false, is_vice_captain: false }, // Kane (FWD) - unique to B
        { element: 5, position: 5, multiplier: 0, is_captain: false, is_vice_captain: false }, // Benched player
      ],
      entryHistory: { event: 7, points: 78, totalPoints: 510 },
      activeChip: null,
    };

    const playerMap = new Map<number, FPLPlayer>([
      [1, { id: 1, web_name: 'Pope', element_type: 1, team: 1, now_cost: 50 }],
      [2, { id: 2, web_name: 'Saliba', element_type: 2, team: 2, now_cost: 60 }],
      [3, { id: 3, web_name: 'Salah', element_type: 3, team: 3, now_cost: 130 }],
      [4, { id: 4, web_name: 'Haaland', element_type: 4, team: 4, now_cost: 145 }],
      [5, { id: 5, web_name: 'Bench1', element_type: 2, team: 5, now_cost: 40 }],
      [6, { id: 6, web_name: 'Kane', element_type: 4, team: 6, now_cost: 110 }],
    ]);

    const liveScores = new Map<number, number>([
      [1, 7],   // Pope: 7 points
      [2, 6],   // Saliba: 6 points
      [3, 12],  // Salah: 12 points (× 2 = 24)
      [4, 8],   // Haaland: 8 points
      [5, 2],   // Bench1: 2 points
      [6, 5],   // Kane: 5 points
    ]);

    const result = calculateCommonPlayers(teamA, teamB, playerMap, liveScores);

    // Should have 3 common players (Pope, Saliba, Salah)
    expect(result).toHaveLength(3);

    // Pope (GK) - common
    const pope = result.find((p) => p.player.id === 1);
    expect(pope).toBeDefined();
    expect(pope?.player.web_name).toBe('Pope');
    expect(pope?.position).toBe('GK');
    expect(pope?.points).toBe(7);
    expect(pope?.multiplier).toBe(1);
    expect(pope?.totalPoints).toBe(7);
    expect(pope?.isCaptain).toBe(false);

    // Saliba (DEF) - common
    const saliba = result.find((p) => p.player.id === 2);
    expect(saliba).toBeDefined();
    expect(saliba?.player.web_name).toBe('Saliba');
    expect(saliba?.position).toBe('DEF');
    expect(saliba?.points).toBe(6);
    expect(saliba?.multiplier).toBe(1);
    expect(saliba?.totalPoints).toBe(6);

    // Salah (MID) - common captain
    const salah = result.find((p) => p.player.id === 3);
    expect(salah).toBeDefined();
    expect(salah?.player.web_name).toBe('Salah');
    expect(salah?.position).toBe('MID');
    expect(salah?.points).toBe(12);
    expect(salah?.multiplier).toBe(2);
    expect(salah?.totalPoints).toBe(24);
    expect(salah?.isCaptain).toBe(true);

    // Haaland and Kane should NOT be in common (they're differentials)
    expect(result.find((p) => p.player.id === 4)).toBeUndefined();
    expect(result.find((p) => p.player.id === 6)).toBeUndefined();

    // Benched player should NOT be included (multiplier = 0)
    expect(result.find((p) => p.player.id === 5)).toBeUndefined();
  });
});
