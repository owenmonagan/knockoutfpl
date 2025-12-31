/**
 * Fix BYE winners for a specific tournament - creates missing match_picks
 */

import { onRequest } from 'firebase-functions/v2/https';
import { dataConnectAdmin } from './dataconnect-admin';

const GET_TOURNAMENT_BYE_MATCHES = `
  query GetTournamentByeMatches($tournamentId: UUID!) {
    matches(where: { tournamentId: { eq: $tournamentId }, isBye: { eq: true } }) {
      matchId
      roundNumber
      positionInRound
      qualifiesToMatchId
      winnerEntryId
      status
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

interface ByeMatch {
  matchId: number;
  roundNumber: number;
  positionInRound: number;
  qualifiesToMatchId: number | null;
  winnerEntryId: number | null;
  status: string;
}

export const fixTournamentByes = onRequest(async (req, res) => {
  const tournamentId = req.query.tournamentId as string;

  if (!tournamentId) {
    res.status(400).json({ error: 'tournamentId query parameter required' });
    return;
  }

  console.log(`[fixTournamentByes] Fixing tournament: ${tournamentId}`);

  // Get all BYE matches for this tournament
  const byeResult = await dataConnectAdmin.executeGraphql<
    { matches: ByeMatch[] },
    { tournamentId: string }
  >(
    GET_TOURNAMENT_BYE_MATCHES,
    { variables: { tournamentId } }
  );

  const byeMatches = byeResult.data.matches;
  console.log(`[fixTournamentByes] Found ${byeMatches.length} BYE matches`);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const bye of byeMatches) {
    if (!bye.qualifiesToMatchId || !bye.winnerEntryId) {
      console.log(`[fixTournamentByes] Skipping match ${bye.matchId} - no qualifiesToMatchId or winnerEntryId`);
      skipped++;
      continue;
    }

    const slot = bye.positionInRound % 2 === 1 ? 1 : 2;

    try {
      // Force create/update the match_pick using upsert
      await dataConnectAdmin.executeGraphql(
        CREATE_MATCH_PICK_MUTATION,
        {
          variables: {
            tournamentId,
            matchId: bye.qualifiesToMatchId,
            entryId: bye.winnerEntryId,
            slot,
          }
        }
      );

      console.log(`[fixTournamentByes] Created pick: match=${bye.qualifiesToMatchId}, entry=${bye.winnerEntryId}, slot=${slot}`);
      created++;
    } catch (error) {
      console.error(`[fixTournamentByes] Error for match ${bye.matchId}:`, error);
      errors++;
    }
  }

  res.json({
    tournamentId,
    byeMatchCount: byeMatches.length,
    created,
    skipped,
    errors,
  });
});
