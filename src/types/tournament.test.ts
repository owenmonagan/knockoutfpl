import { describe, it, expect } from 'vitest';
import type { Match, Tournament } from './tournament';
import { getMatchPlayers } from './tournament';

describe('Tournament types', () => {
  it('Match supports N players via players array', () => {
    const match: Match = {
      id: 'match-1',
      players: [
        { fplTeamId: 1, seed: 1, score: 45 },
        { fplTeamId: 2, seed: 2, score: 52 },
        { fplTeamId: 3, seed: 3, score: 38 },
      ],
      winnerId: 2,
      isBye: false,
    };

    expect(match.players?.length).toBe(3);
    expect(match.winnerId).toBe(2);
  });

  it('Match supports legacy player1/player2 for backward compatibility', () => {
    const match: Match = {
      id: 'match-1',
      player1: { fplTeamId: 1, seed: 1, score: 45 },
      player2: { fplTeamId: 2, seed: 2, score: 52 },
      players: [],
      winnerId: 2,
      isBye: false,
    };

    expect(match.player1?.fplTeamId).toBe(1);
    expect(match.player2?.fplTeamId).toBe(2);
  });

  it('Tournament has matchSize field', () => {
    const tournament: Partial<Tournament> = {
      id: 'test',
      matchSize: 3,
    };

    expect(tournament.matchSize).toBe(3);
  });

  describe('getMatchPlayers', () => {
    it('returns players array when populated', () => {
      const match: Match = {
        id: 'match-1',
        players: [
          { fplTeamId: 1, seed: 1, score: 45 },
          { fplTeamId: 2, seed: 2, score: 52 },
          { fplTeamId: 3, seed: 3, score: 38 },
        ],
        winnerId: 2,
        isBye: false,
      };

      const players = getMatchPlayers(match);
      expect(players.length).toBe(3);
      expect(players[0].fplTeamId).toBe(1);
      expect(players[1].fplTeamId).toBe(2);
      expect(players[2].fplTeamId).toBe(3);
    });

    it('falls back to legacy player1/player2 when players array is empty', () => {
      const match: Match = {
        id: 'match-1',
        players: [],
        player1: { fplTeamId: 1, seed: 1, score: 45 },
        player2: { fplTeamId: 2, seed: 2, score: 52 },
        winnerId: 2,
        isBye: false,
      };

      const players = getMatchPlayers(match);
      expect(players.length).toBe(2);
      expect(players[0].fplTeamId).toBe(1);
      expect(players[1].fplTeamId).toBe(2);
    });

    it('handles match with only player1 (bye)', () => {
      const match: Match = {
        id: 'match-1',
        players: [],
        player1: { fplTeamId: 1, seed: 1, score: null },
        player2: null,
        winnerId: 1,
        isBye: true,
      };

      const players = getMatchPlayers(match);
      expect(players.length).toBe(1);
      expect(players[0].fplTeamId).toBe(1);
    });

    it('returns empty array when no players', () => {
      const match: Match = {
        id: 'match-1',
        players: [],
        winnerId: null,
        isBye: true,
      };

      const players = getMatchPlayers(match);
      expect(players.length).toBe(0);
    });
  });
});
