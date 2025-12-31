/**
 * One-time migration: Add missing match_picks for BYE winners
 *
 * Problem: Existing tournaments have BYE matches but winners weren't added
 * to the next round's matches. Some BYE matches may also be missing winnerEntryId.
 *
 * Solution:
 * 1. Find all BYE matches (with or without winnerEntryId)
 * 2. For ones without winnerEntryId, look up slot 1 entry from match_picks
 * 3. Create match_picks for next round
 */

import { onRequest } from 'firebase-functions/v2/https';
import { dataConnectAdmin } from './dataconnect-admin';

// Find ALL BYE matches, not just ones with winnerEntryId
const FIND_ALL_BYE_MATCHES_QUERY = `
  query FindAllByeMatches {
    matches(where: { isBye: { eq: true } }) {
      tournamentId
      matchId
      roundNumber
      positionInRound
      qualifiesToMatchId
      winnerEntryId
    }
  }
`;

// Get the entry in slot 1 of a match (the BYE recipient)
const GET_SLOT1_ENTRY_QUERY = `
  query GetSlot1Entry($tournamentId: UUID!, $matchId: Int!) {
    matchPicks(where: {
      tournamentId: { eq: $tournamentId }
      matchId: { eq: $matchId }
      slot: { eq: 1 }
    }) {
      entryId
    }
  }
`;

const CHECK_MATCH_PICK_EXISTS_QUERY = `
  query CheckMatchPickExists($tournamentId: UUID!, $matchId: Int!, $entryId: Int!) {
    matchPicks(where: {
      tournamentId: { eq: $tournamentId }
      matchId: { eq: $matchId }
      entryId: { eq: $entryId }
    }) {
      matchId
      entryId
    }
  }
`;

const CREATE_MATCH_PICK_MUTATION = `
  mutation CreateMatchPick(
    $tournamentId: UUID!
    $matchId: Int!
    $entryId: Int!
    $slot: Int!
  ) {
    matchPick_upsert(
      data: {
        tournamentId: $tournamentId
        matchId: $matchId
        entryId: $entryId
        slot: $slot
        entryEntryId: $entryId
      }
    )
  }
`;

const UPDATE_MATCH_WINNER_MUTATION = `
  mutation UpdateMatchWinner($tournamentId: UUID!, $matchId: Int!, $winnerEntryId: Int!) {
    match_update(
      key: { tournamentId: $tournamentId, matchId: $matchId }
      data: { winnerEntryId: $winnerEntryId, status: "complete" }
    )
  }
`;

interface ByeMatch {
  tournamentId: string;
  matchId: number;
  roundNumber: number;
  positionInRound: number;
  qualifiesToMatchId: number | null;
  winnerEntryId: number | null;
}

interface MatchPick {
  matchId: number;
  entryId: number;
}

interface Slot1Entry {
  entryId: number;
}

export const migrateByes = onRequest(async (_req, res) => {
  console.log('[migrateByes] Starting BYE winner migration (v2)...');

  // 1. Find ALL BYE matches
  const byeResult = await dataConnectAdmin.executeGraphql<{ matches: ByeMatch[] }, Record<string, never>>(
    FIND_ALL_BYE_MATCHES_QUERY,
    {}
  );

  const byeMatches = byeResult.data.matches;
  console.log(`[migrateByes] Found ${byeMatches.length} BYE matches total`);

  let created = 0;
  let skipped = 0;
  let errors = 0;
  let winnersFixed = 0;

  // 2. For each BYE match, ensure winner is set and advanced
  for (const bye of byeMatches) {
    if (!bye.qualifiesToMatchId) {
      console.log(`[migrateByes] Skipping match ${bye.matchId} - no qualifiesToMatchId (final round?)`);
      skipped++;
      continue;
    }

    try {
      // Determine the winner - either from winnerEntryId or from slot 1 match_pick
      let winnerEntryId = bye.winnerEntryId;

      if (!winnerEntryId) {
        // Look up slot 1 entry from match_picks
        const slot1Result = await dataConnectAdmin.executeGraphql<
          { matchPicks: Slot1Entry[] },
          { tournamentId: string; matchId: number }
        >(
          GET_SLOT1_ENTRY_QUERY,
          {
            variables: {
              tournamentId: bye.tournamentId,
              matchId: bye.matchId,
            }
          }
        );

        if (slot1Result.data.matchPicks.length === 0) {
          console.log(`[migrateByes] Skipping match ${bye.matchId} - no slot 1 entry found`);
          skipped++;
          continue;
        }

        winnerEntryId = slot1Result.data.matchPicks[0].entryId;

        // Update the match with the winner
        await dataConnectAdmin.executeGraphql(
          UPDATE_MATCH_WINNER_MUTATION,
          {
            variables: {
              tournamentId: bye.tournamentId,
              matchId: bye.matchId,
              winnerEntryId,
            }
          }
        );
        console.log(`[migrateByes] Fixed winner for match ${bye.matchId}: entry ${winnerEntryId}`);
        winnersFixed++;
      }

      // Check if match_pick already exists in next round
      const existsResult = await dataConnectAdmin.executeGraphql<
        { matchPicks: MatchPick[] },
        { tournamentId: string; matchId: number; entryId: number }
      >(
        CHECK_MATCH_PICK_EXISTS_QUERY,
        {
          variables: {
            tournamentId: bye.tournamentId,
            matchId: bye.qualifiesToMatchId,
            entryId: winnerEntryId,
          }
        }
      );

      if (existsResult.data.matchPicks.length > 0) {
        skipped++;
        continue;
      }

      // Calculate slot: odd positions → slot 1, even → slot 2
      const slot = bye.positionInRound % 2 === 1 ? 1 : 2;

      // Create the missing match_pick
      await dataConnectAdmin.executeGraphql(
        CREATE_MATCH_PICK_MUTATION,
        {
          variables: {
            tournamentId: bye.tournamentId,
            matchId: bye.qualifiesToMatchId,
            entryId: winnerEntryId,
            slot,
          }
        }
      );

      console.log(`[migrateByes] Created match_pick: tournament=${bye.tournamentId} match=${bye.qualifiesToMatchId} entry=${winnerEntryId} slot=${slot}`);
      created++;
    } catch (error) {
      console.error(`[migrateByes] Error processing BYE match ${bye.matchId}:`, error);
      errors++;
    }
  }

  const result = {
    total: byeMatches.length,
    created,
    skipped,
    winnersFixed,
    errors,
  };

  console.log('[migrateByes] Migration complete:', result);
  res.json(result);
});
