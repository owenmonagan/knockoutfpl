/**
 * Test fixtures and helper data for E2E tests
 *
 * This file contains:
 * - Test user definitions (TEST_USERS)
 * - Test tournament scenarios (TEST_TOURNAMENTS)
 * - Helper functions for test data generation
 */

import type { Page, Response } from '@playwright/test';

// =============================================================================
// TEST USERS
// =============================================================================

export const testUsers = {
  user1: {
    email: 'test1@example.com',
    password: 'TestPassword123!',
    fplTeamId: 158256,
    fplTeamName: "Test User 1's Team",
  },
  user2: {
    email: 'test2@example.com',
    password: 'TestPassword123!',
    fplTeamId: 71631,
    fplTeamName: "Test User 2's Team",
  },
};

export const testGameweeks = {
  current: 1,
  upcoming: 2,
  completed: 0,
};

/**
 * Extended test user definitions for tournament seeding
 */
export const TEST_USERS = {
  withFplConnected: {
    uid: 'test-user-uid',
    email: 'testuser@knockoutfpl.com',
    password: 'TestPass123!',
    displayName: 'Test User',
    fplTeamId: 158256,
    fplTeamName: 'o-win',
  },
  withNoTournaments: {
    uid: 'no-tournament-user-uid',
    email: 'notournaments@knockoutfpl.com',
    password: 'TestPass123!',
    displayName: 'No Tournament User',
    fplTeamId: 158257,
    fplTeamName: 'Empty User',
  },
  creator: {
    uid: 'test-creator-uid',
    email: 'creator@knockoutfpl.com',
    password: 'TestPass123!',
    displayName: 'Test Creator',
    fplTeamId: 158256,
    fplTeamName: 'Creator FC',
  },
};

// =============================================================================
// TEST TOURNAMENT PARTICIPANTS
// =============================================================================

/**
 * Generate 16 participants for a full bracket
 * Test user (fplTeamId: 158256) is always seed 1
 */
function generateParticipants(
  testUserSeed: number = 1
): Array<{
  fplTeamId: number;
  fplTeamName: string;
  managerName: string;
  seed: number;
}> {
  const participants = [];

  for (let i = 1; i <= 16; i++) {
    if (i === testUserSeed) {
      // Test user at specified seed position
      participants.push({
        fplTeamId: 158256,
        fplTeamName: 'o-win',
        managerName: 'Test User',
        seed: i,
      });
    } else {
      participants.push({
        fplTeamId: 100000 + i,
        fplTeamName: `Test Team ${i}`,
        managerName: `Manager ${i}`,
        seed: i,
      });
    }
  }

  return participants;
}

/**
 * Generate empty bracket rounds for a 16-participant tournament
 */
function generateEmptyRounds(
  startGameweek: number
): Array<{
  roundNumber: number;
  name: string;
  gameweek: number;
  matches: Array<{
    id: string;
    player1: { fplTeamId: number; seed: number; score: number | null } | null;
    player2: { fplTeamId: number; seed: number; score: number | null } | null;
    winnerId: number | null;
    isBye: boolean;
  }>;
  isComplete: boolean;
}> {
  return [
    {
      roundNumber: 1,
      name: 'Round 1',
      gameweek: startGameweek,
      matches: [
        {
          id: 'r1m1',
          player1: { fplTeamId: 158256, seed: 1, score: null },
          player2: { fplTeamId: 100016, seed: 16, score: null },
          winnerId: null,
          isBye: false,
        },
        {
          id: 'r1m2',
          player1: { fplTeamId: 100008, seed: 8, score: null },
          player2: { fplTeamId: 100009, seed: 9, score: null },
          winnerId: null,
          isBye: false,
        },
        {
          id: 'r1m3',
          player1: { fplTeamId: 100004, seed: 4, score: null },
          player2: { fplTeamId: 100013, seed: 13, score: null },
          winnerId: null,
          isBye: false,
        },
        {
          id: 'r1m4',
          player1: { fplTeamId: 100005, seed: 5, score: null },
          player2: { fplTeamId: 100012, seed: 12, score: null },
          winnerId: null,
          isBye: false,
        },
        {
          id: 'r1m5',
          player1: { fplTeamId: 100002, seed: 2, score: null },
          player2: { fplTeamId: 100015, seed: 15, score: null },
          winnerId: null,
          isBye: false,
        },
        {
          id: 'r1m6',
          player1: { fplTeamId: 100007, seed: 7, score: null },
          player2: { fplTeamId: 100010, seed: 10, score: null },
          winnerId: null,
          isBye: false,
        },
        {
          id: 'r1m7',
          player1: { fplTeamId: 100003, seed: 3, score: null },
          player2: { fplTeamId: 100014, seed: 14, score: null },
          winnerId: null,
          isBye: false,
        },
        {
          id: 'r1m8',
          player1: { fplTeamId: 100006, seed: 6, score: null },
          player2: { fplTeamId: 100011, seed: 11, score: null },
          winnerId: null,
          isBye: false,
        },
      ],
      isComplete: false,
    },
    {
      roundNumber: 2,
      name: 'Quarter-Finals',
      gameweek: startGameweek + 1,
      matches: [
        {
          id: 'r2m1',
          player1: null,
          player2: null,
          winnerId: null,
          isBye: false,
        },
        {
          id: 'r2m2',
          player1: null,
          player2: null,
          winnerId: null,
          isBye: false,
        },
        {
          id: 'r2m3',
          player1: null,
          player2: null,
          winnerId: null,
          isBye: false,
        },
        {
          id: 'r2m4',
          player1: null,
          player2: null,
          winnerId: null,
          isBye: false,
        },
      ],
      isComplete: false,
    },
    {
      roundNumber: 3,
      name: 'Semi-Finals',
      gameweek: startGameweek + 2,
      matches: [
        {
          id: 'r3m1',
          player1: null,
          player2: null,
          winnerId: null,
          isBye: false,
        },
        {
          id: 'r3m2',
          player1: null,
          player2: null,
          winnerId: null,
          isBye: false,
        },
      ],
      isComplete: false,
    },
    {
      roundNumber: 4,
      name: 'Final',
      gameweek: startGameweek + 3,
      matches: [
        {
          id: 'r4m1',
          player1: null,
          player2: null,
          winnerId: null,
          isBye: false,
        },
      ],
      isComplete: false,
    },
  ];
}

// =============================================================================
// TEST TOURNAMENTS
// =============================================================================

export const TEST_TOURNAMENTS = {
  /**
   * Active tournament in Round 1
   * - Test user (158256) is seed 1, still in competition
   * - No matches completed yet
   */
  activeTournament: {
    id: 'activeTournament',
    fplLeagueId: 314,
    fplLeagueName: 'Test League Active',
    creatorUserId: 'test-user-uid',
    status: 'active' as const,
    currentRound: 1,
    totalRounds: 4,
    startGameweek: 15,
    winnerId: null,
    participants: generateParticipants(1),
    rounds: generateEmptyRounds(15),
  },

  /**
   * Tournament where test user was eliminated in Round 1
   * - Test user (158256) lost to Team 2 in round 1
   * - Tournament is now in Round 2 (Quarter-Finals)
   */
  eliminatedUserTournament: {
    id: 'eliminatedUserTournament',
    fplLeagueId: 315,
    fplLeagueName: 'Test League Eliminated',
    creatorUserId: 'test-user-uid',
    status: 'active' as const,
    currentRound: 2,
    totalRounds: 4,
    startGameweek: 14,
    winnerId: null,
    participants: generateParticipants(1),
    rounds: [
      {
        roundNumber: 1,
        name: 'Round 1',
        gameweek: 14,
        matches: [
          {
            id: 'r1m1',
            player1: { fplTeamId: 158256, seed: 1, score: 45 },
            player2: { fplTeamId: 100016, seed: 16, score: 67 },
            winnerId: 100016, // Test user LOST
            isBye: false,
          },
          {
            id: 'r1m2',
            player1: { fplTeamId: 100008, seed: 8, score: 52 },
            player2: { fplTeamId: 100009, seed: 9, score: 48 },
            winnerId: 100008,
            isBye: false,
          },
          {
            id: 'r1m3',
            player1: { fplTeamId: 100004, seed: 4, score: 61 },
            player2: { fplTeamId: 100013, seed: 13, score: 55 },
            winnerId: 100004,
            isBye: false,
          },
          {
            id: 'r1m4',
            player1: { fplTeamId: 100005, seed: 5, score: 44 },
            player2: { fplTeamId: 100012, seed: 12, score: 58 },
            winnerId: 100012,
            isBye: false,
          },
          {
            id: 'r1m5',
            player1: { fplTeamId: 100002, seed: 2, score: 72 },
            player2: { fplTeamId: 100015, seed: 15, score: 41 },
            winnerId: 100002,
            isBye: false,
          },
          {
            id: 'r1m6',
            player1: { fplTeamId: 100007, seed: 7, score: 56 },
            player2: { fplTeamId: 100010, seed: 10, score: 63 },
            winnerId: 100010,
            isBye: false,
          },
          {
            id: 'r1m7',
            player1: { fplTeamId: 100003, seed: 3, score: 59 },
            player2: { fplTeamId: 100014, seed: 14, score: 47 },
            winnerId: 100003,
            isBye: false,
          },
          {
            id: 'r1m8',
            player1: { fplTeamId: 100006, seed: 6, score: 51 },
            player2: { fplTeamId: 100011, seed: 11, score: 49 },
            winnerId: 100006,
            isBye: false,
          },
        ],
        isComplete: true,
      },
      {
        roundNumber: 2,
        name: 'Quarter-Finals',
        gameweek: 15,
        matches: [
          {
            id: 'r2m1',
            player1: { fplTeamId: 100016, seed: 16, score: null }, // Beat test user
            player2: { fplTeamId: 100008, seed: 8, score: null },
            winnerId: null,
            isBye: false,
          },
          {
            id: 'r2m2',
            player1: { fplTeamId: 100004, seed: 4, score: null },
            player2: { fplTeamId: 100012, seed: 12, score: null },
            winnerId: null,
            isBye: false,
          },
          {
            id: 'r2m3',
            player1: { fplTeamId: 100002, seed: 2, score: null },
            player2: { fplTeamId: 100010, seed: 10, score: null },
            winnerId: null,
            isBye: false,
          },
          {
            id: 'r2m4',
            player1: { fplTeamId: 100003, seed: 3, score: null },
            player2: { fplTeamId: 100006, seed: 6, score: null },
            winnerId: null,
            isBye: false,
          },
        ],
        isComplete: false,
      },
      {
        roundNumber: 3,
        name: 'Semi-Finals',
        gameweek: 16,
        matches: [
          {
            id: 'r3m1',
            player1: null,
            player2: null,
            winnerId: null,
            isBye: false,
          },
          {
            id: 'r3m2',
            player1: null,
            player2: null,
            winnerId: null,
            isBye: false,
          },
        ],
        isComplete: false,
      },
      {
        roundNumber: 4,
        name: 'Final',
        gameweek: 17,
        matches: [
          {
            id: 'r4m1',
            player1: null,
            player2: null,
            winnerId: null,
            isBye: false,
          },
        ],
        isComplete: false,
      },
    ],
  },

  /**
   * Completed tournament where test user WON
   * - All 4 rounds complete
   * - Test user (158256) won the final
   */
  completedTournament: {
    id: 'completedTournament',
    fplLeagueId: 316,
    fplLeagueName: 'Test League Winner',
    creatorUserId: 'test-user-uid',
    status: 'completed' as const,
    currentRound: 4,
    totalRounds: 4,
    startGameweek: 10,
    winnerId: 158256, // Test user WON
    participants: generateParticipants(1),
    rounds: [
      {
        roundNumber: 1,
        name: 'Round 1',
        gameweek: 10,
        matches: [
          {
            id: 'r1m1',
            player1: { fplTeamId: 158256, seed: 1, score: 78 },
            player2: { fplTeamId: 100016, seed: 16, score: 52 },
            winnerId: 158256, // Test user won
            isBye: false,
          },
          {
            id: 'r1m2',
            player1: { fplTeamId: 100008, seed: 8, score: 65 },
            player2: { fplTeamId: 100009, seed: 9, score: 58 },
            winnerId: 100008,
            isBye: false,
          },
          {
            id: 'r1m3',
            player1: { fplTeamId: 100004, seed: 4, score: 71 },
            player2: { fplTeamId: 100013, seed: 13, score: 44 },
            winnerId: 100004,
            isBye: false,
          },
          {
            id: 'r1m4',
            player1: { fplTeamId: 100005, seed: 5, score: 62 },
            player2: { fplTeamId: 100012, seed: 12, score: 55 },
            winnerId: 100005,
            isBye: false,
          },
          {
            id: 'r1m5',
            player1: { fplTeamId: 100002, seed: 2, score: 69 },
            player2: { fplTeamId: 100015, seed: 15, score: 47 },
            winnerId: 100002,
            isBye: false,
          },
          {
            id: 'r1m6',
            player1: { fplTeamId: 100007, seed: 7, score: 58 },
            player2: { fplTeamId: 100010, seed: 10, score: 61 },
            winnerId: 100010,
            isBye: false,
          },
          {
            id: 'r1m7',
            player1: { fplTeamId: 100003, seed: 3, score: 73 },
            player2: { fplTeamId: 100014, seed: 14, score: 49 },
            winnerId: 100003,
            isBye: false,
          },
          {
            id: 'r1m8',
            player1: { fplTeamId: 100006, seed: 6, score: 56 },
            player2: { fplTeamId: 100011, seed: 11, score: 54 },
            winnerId: 100006,
            isBye: false,
          },
        ],
        isComplete: true,
      },
      {
        roundNumber: 2,
        name: 'Quarter-Finals',
        gameweek: 11,
        matches: [
          {
            id: 'r2m1',
            player1: { fplTeamId: 158256, seed: 1, score: 82 },
            player2: { fplTeamId: 100008, seed: 8, score: 67 },
            winnerId: 158256, // Test user won
            isBye: false,
          },
          {
            id: 'r2m2',
            player1: { fplTeamId: 100004, seed: 4, score: 59 },
            player2: { fplTeamId: 100005, seed: 5, score: 64 },
            winnerId: 100005,
            isBye: false,
          },
          {
            id: 'r2m3',
            player1: { fplTeamId: 100002, seed: 2, score: 71 },
            player2: { fplTeamId: 100010, seed: 10, score: 58 },
            winnerId: 100002,
            isBye: false,
          },
          {
            id: 'r2m4',
            player1: { fplTeamId: 100003, seed: 3, score: 66 },
            player2: { fplTeamId: 100006, seed: 6, score: 63 },
            winnerId: 100003,
            isBye: false,
          },
        ],
        isComplete: true,
      },
      {
        roundNumber: 3,
        name: 'Semi-Finals',
        gameweek: 12,
        matches: [
          {
            id: 'r3m1',
            player1: { fplTeamId: 158256, seed: 1, score: 75 },
            player2: { fplTeamId: 100005, seed: 5, score: 68 },
            winnerId: 158256, // Test user won
            isBye: false,
          },
          {
            id: 'r3m2',
            player1: { fplTeamId: 100002, seed: 2, score: 62 },
            player2: { fplTeamId: 100003, seed: 3, score: 70 },
            winnerId: 100003,
            isBye: false,
          },
        ],
        isComplete: true,
      },
      {
        roundNumber: 4,
        name: 'Final',
        gameweek: 13,
        matches: [
          {
            id: 'r4m1',
            player1: { fplTeamId: 158256, seed: 1, score: 85 },
            player2: { fplTeamId: 100003, seed: 3, score: 79 },
            winnerId: 158256, // Test user WON THE TOURNAMENT
            isBye: false,
          },
        ],
        isComplete: true,
      },
    ],
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Helper function to generate unique test email
 */
export function generateTestEmail(): string {
  const timestamp = Date.now();
  return `test-${timestamp}@example.com`;
}

/**
 * Helper function to wait for API calls
 */
export async function waitForApiCall(page: Page, urlPattern: string | RegExp) {
  return page.waitForResponse((response: Response) => {
    const url = response.url();
    if (typeof urlPattern === 'string') {
      return url.includes(urlPattern);
    }
    return urlPattern.test(url);
  });
}

/**
 * Get a tournament by key name
 */
export function getTournament(key: keyof typeof TEST_TOURNAMENTS) {
  return TEST_TOURNAMENTS[key];
}

/**
 * Get all tournament IDs for seeding
 */
export function getAllTournamentIds(): string[] {
  return Object.keys(TEST_TOURNAMENTS);
}
