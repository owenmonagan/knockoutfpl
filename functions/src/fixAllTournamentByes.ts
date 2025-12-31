/**
 * Fix BYE winners for ALL tournaments - creates missing match_picks
 */

import { onRequest } from 'firebase-functions/v2/https';
import { dataConnectAdmin } from './dataconnect-admin';

const GET_ALL_TOURNAMENTS = `
  query GetAllTournaments {
    tournaments {
      id
      fplLeagueName
    }
  }
`;

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

interface Tournament {
  id: string;
  fplLeagueName: string;
}

interface ByeMatch {
  matchId: number;
  roundNumber: number;
  positionInRound: number;
  qualifiesToMatchId: number | null;
  winnerEntryId: number | null;
  status: string;
}

export const fixAllTournamentByes = onRequest(async (_req, res) => {
  console.log(`[fixAllTournamentByes] Starting...`);

  // Get all tournaments
  const tournamentsResult = await dataConnectAdmin.executeGraphql<
    { tournaments: Tournament[] },
    Record<string, never>
  >(
    GET_ALL_TOURNAMENTS,
    {}
  );

  const tournaments = tournamentsResult.data.tournaments;
  console.log(`[fixAllTournamentByes] Found ${tournaments.length} tournaments`);

  let totalCreated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  const results: any[] = [];

  for (const tournament of tournaments) {
    const tournamentId = tournament.id;

    // Get all BYE matches for this tournament
    const byeResult = await dataConnectAdmin.executeGraphql<
      { matches: ByeMatch[] },
      { tournamentId: string }
    >(
      GET_TOURNAMENT_BYE_MATCHES,
      { variables: { tournamentId } }
    );

    const byeMatches = byeResult.data.matches;
    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const bye of byeMatches) {
      if (!bye.qualifiesToMatchId || !bye.winnerEntryId) {
        skipped++;
        continue;
      }

      const slot = bye.positionInRound % 2 === 1 ? 1 : 2;

      try {
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
        created++;
      } catch (error) {
        console.error(`[fixAllTournamentByes] Error for tournament ${tournamentId}, match ${bye.matchId}:`, error);
        errors++;
      }
    }

    if (created > 0 || errors > 0) {
      results.push({
        tournamentId,
        name: tournament.fplLeagueName,
        byeMatches: byeMatches.length,
        created,
        skipped,
        errors,
      });
    }

    totalCreated += created;
    totalSkipped += skipped;
    totalErrors += errors;
  }

  const summary = {
    totalTournaments: tournaments.length,
    totalCreated,
    totalSkipped,
    totalErrors,
    details: results,
  };

  console.log('[fixAllTournamentByes] Complete:', summary);
  res.json(summary);
});
