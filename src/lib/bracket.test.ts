// src/lib/bracket.test.ts
import { describe, it, expect } from 'vitest';
import type { Participant, Round, Match } from '../types/tournament';
import { getRoundName, calculateByes, generateBracket, determineMatchWinner, advanceWinnersToNextRound } from './bracket';

describe('getRoundName', () => {
  it('should return "Final" for last round', () => {
    expect(getRoundName(4, 4)).toBe('Final');
  });

  it('should return "Semi-Finals" for second to last round', () => {
    expect(getRoundName(3, 4)).toBe('Semi-Finals');
  });

  it('should return "Quarter-Finals" for third to last round', () => {
    expect(getRoundName(2, 4)).toBe('Quarter-Finals');
  });

  it('should return "Round X" for earlier rounds', () => {
    expect(getRoundName(1, 4)).toBe('Round 1');
    expect(getRoundName(1, 6)).toBe('Round 1');
  });
});

describe('calculateByes', () => {
  it('should return 0 byes for power of 2', () => {
    expect(calculateByes(8)).toBe(0);
    expect(calculateByes(16)).toBe(0);
  });

  it('should return correct byes for non-power of 2', () => {
    expect(calculateByes(5)).toBe(3);  // Next power is 8, need 3 byes
    expect(calculateByes(6)).toBe(2);
    expect(calculateByes(7)).toBe(1);
    expect(calculateByes(10)).toBe(6); // Next power is 16, need 6 byes
  });
});

describe('generateBracket', () => {
  const fourParticipants: Participant[] = [
    { fplTeamId: 1, fplTeamName: 'Team 1', managerName: 'Manager 1', seed: 1 },
    { fplTeamId: 2, fplTeamName: 'Team 2', managerName: 'Manager 2', seed: 2 },
    { fplTeamId: 3, fplTeamName: 'Team 3', managerName: 'Manager 3', seed: 3 },
    { fplTeamId: 4, fplTeamName: 'Team 4', managerName: 'Manager 4', seed: 4 },
  ];

  it('should generate 2 rounds for 4 participants', () => {
    const rounds = generateBracket(fourParticipants, 16);
    expect(rounds).toHaveLength(2);
  });

  it('should have Semi-Finals and Final round names', () => {
    const rounds = generateBracket(fourParticipants, 16);
    expect(rounds[0].name).toBe('Semi-Finals');
    expect(rounds[1].name).toBe('Final');
  });

  it('should have correct gameweeks', () => {
    const rounds = generateBracket(fourParticipants, 16);
    expect(rounds[0].gameweek).toBe(16);
    expect(rounds[1].gameweek).toBe(17);
  });

  it('should pair seed 1 vs seed 4, seed 2 vs seed 3', () => {
    const rounds = generateBracket(fourParticipants, 16);
    const round1 = rounds[0];

    expect(round1.matches).toHaveLength(2);
    expect(round1.matches[0].player1?.seed).toBe(1);
    expect(round1.matches[0].player2?.seed).toBe(4);
    expect(round1.matches[1].player1?.seed).toBe(2);
    expect(round1.matches[1].player2?.seed).toBe(3);
  });
});

describe('generateBracket with byes', () => {
  const fiveParticipants: Participant[] = [
    { fplTeamId: 1, fplTeamName: 'Team 1', managerName: 'Manager 1', seed: 1 },
    { fplTeamId: 2, fplTeamName: 'Team 2', managerName: 'Manager 2', seed: 2 },
    { fplTeamId: 3, fplTeamName: 'Team 3', managerName: 'Manager 3', seed: 3 },
    { fplTeamId: 4, fplTeamName: 'Team 4', managerName: 'Manager 4', seed: 4 },
    { fplTeamId: 5, fplTeamName: 'Team 5', managerName: 'Manager 5', seed: 5 },
  ];

  it('should generate 3 rounds for 5 participants', () => {
    const rounds = generateBracket(fiveParticipants, 16);
    expect(rounds).toHaveLength(3);
  });

  it('should give byes to top seeds', () => {
    const rounds = generateBracket(fiveParticipants, 16);
    const round1 = rounds[0];

    // Top 3 seeds should have byes
    const byeMatches = round1.matches.filter(m => m.isBye);
    expect(byeMatches.length).toBeGreaterThanOrEqual(1);
  });
});

describe('determineMatchWinner', () => {
  it('should return player with higher score', () => {
    const match: Match = {
      id: 'r1-m1',
      player1: { fplTeamId: 1, seed: 1, score: 65 },
      player2: { fplTeamId: 2, seed: 4, score: 58 },
      winnerId: null,
      isBye: false,
    };

    expect(determineMatchWinner(match)).toBe(1);
  });

  it('should return higher seed (lower number) on tie', () => {
    const match: Match = {
      id: 'r1-m1',
      player1: { fplTeamId: 1, seed: 3, score: 60 },
      player2: { fplTeamId: 2, seed: 2, score: 60 },
      winnerId: null,
      isBye: false,
    };

    // Player 2 has higher seed (seed 2 < seed 3), so player 2 wins on tie
    expect(determineMatchWinner(match)).toBe(2);
  });

  it('should return null if scores are not set', () => {
    const match: Match = {
      id: 'r1-m1',
      player1: { fplTeamId: 1, seed: 1, score: null },
      player2: { fplTeamId: 2, seed: 4, score: null },
      winnerId: null,
      isBye: false,
    };

    expect(determineMatchWinner(match)).toBeNull();
  });

  it('should return player1 for bye matches', () => {
    const match: Match = {
      id: 'r1-m1',
      player1: { fplTeamId: 1, seed: 1, score: null },
      player2: null,
      winnerId: null,
      isBye: true,
    };

    expect(determineMatchWinner(match)).toBe(1);
  });
});

describe('advanceWinnersToNextRound', () => {
  it('should advance winners to next round matches', () => {
    const rounds: Round[] = [
      {
        roundNumber: 1,
        name: 'Semi-Finals',
        gameweek: 16,
        matches: [
          { id: 'r1-m1', player1: { fplTeamId: 1, seed: 1, score: 65 }, player2: { fplTeamId: 4, seed: 4, score: 58 }, winnerId: 1, isBye: false },
          { id: 'r1-m2', player1: { fplTeamId: 2, seed: 2, score: 60 }, player2: { fplTeamId: 3, seed: 3, score: 70 }, winnerId: 3, isBye: false },
        ],
        isComplete: true,
      },
      {
        roundNumber: 2,
        name: 'Final',
        gameweek: 17,
        matches: [
          { id: 'r2-m1', player1: null, player2: null, winnerId: null, isBye: false },
        ],
        isComplete: false,
      },
    ];

    const participants: Participant[] = [
      { fplTeamId: 1, fplTeamName: 'Team 1', managerName: 'Manager 1', seed: 1 },
      { fplTeamId: 2, fplTeamName: 'Team 2', managerName: 'Manager 2', seed: 2 },
      { fplTeamId: 3, fplTeamName: 'Team 3', managerName: 'Manager 3', seed: 3 },
      { fplTeamId: 4, fplTeamName: 'Team 4', managerName: 'Manager 4', seed: 4 },
    ];

    const updatedRounds = advanceWinnersToNextRound(rounds, 1, participants);

    // Final should now have player1 = team 1 (winner of match 1) and player2 = team 3 (winner of match 2)
    expect(updatedRounds[1].matches[0].player1?.fplTeamId).toBe(1);
    expect(updatedRounds[1].matches[0].player2?.fplTeamId).toBe(3);
  });

  it('should not modify rounds if current round is not complete', () => {
    const rounds: Round[] = [
      {
        roundNumber: 1,
        name: 'Semi-Finals',
        gameweek: 16,
        matches: [
          { id: 'r1-m1', player1: { fplTeamId: 1, seed: 1, score: null }, player2: { fplTeamId: 4, seed: 4, score: null }, winnerId: null, isBye: false },
        ],
        isComplete: false,
      },
      {
        roundNumber: 2,
        name: 'Final',
        gameweek: 17,
        matches: [
          { id: 'r2-m1', player1: null, player2: null, winnerId: null, isBye: false },
        ],
        isComplete: false,
      },
    ];

    const updatedRounds = advanceWinnersToNextRound(rounds, 1, []);

    // Final should still have null players
    expect(updatedRounds[1].matches[0].player1).toBeNull();
  });
});
