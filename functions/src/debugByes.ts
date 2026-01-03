/**
 * Debug function to check BYE match state for a specific tournament
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

const GET_MATCH_PICKS = `
  query GetMatchPicks($tournamentId: UUID!, $matchId: Int!) {
    matchPicks(where: { tournamentId: { eq: $tournamentId }, matchId: { eq: $matchId } }) {
      entryId
      slot
    }
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

interface MatchPick {
  entryId: number;
  slot: number;
}

const GET_MATCHES_BY_IDS = `
  query GetMatchesByIds($tournamentId: UUID!) {
    matches(where: { tournamentId: { eq: $tournamentId } }, limit: 500) {
      matchId
      roundNumber
      positionInRound
      qualifiesToMatchId
      winnerEntryId
      status
      isBye
    }
  }
`;

const GET_TOURNAMENT_STATUS = `
  query GetTournamentStatus($tournamentId: UUID!) {
    tournament(id: $tournamentId) {
      id
      fplLeagueId
      importStatus
      importProgress
      importedCount
      totalCount
      participantCount
      currentRound
      totalRounds
    }
  }
`;

export const debugByes = onRequest(async (req, res) => {
  const tournamentId = req.query.tournamentId as string || '377b3636-aa7a-42ff-aecc-116c04380881';
  const checkMatches = req.query.matches as string; // e.g., "175,176,177,344,345"
  const showStatus = req.query.status === 'true';

  console.log(`[debugByes] Checking tournament: ${tournamentId}`);

  // Show tournament status
  if (showStatus) {
    const statusResult = await dataConnectAdmin.executeGraphql<
      { tournament: any },
      { tournamentId: string }
    >(
      GET_TOURNAMENT_STATUS,
      { variables: { tournamentId } }
    );
    res.json({ tournament: statusResult.data.tournament });
    return;
  }

  // If specific matches requested, check those
  if (checkMatches) {
    const matchIds = checkMatches.split(',').map(Number);
    const allMatchesResult = await dataConnectAdmin.executeGraphql<
      { matches: ByeMatch[] },
      { tournamentId: string }
    >(
      GET_MATCHES_BY_IDS,
      { variables: { tournamentId } }
    );

    const matchMap = new Map(allMatchesResult.data.matches.map(m => [m.matchId, m]));
    const results: any[] = [];

    for (const matchId of matchIds) {
      const match = matchMap.get(matchId);
      const picksResult = await dataConnectAdmin.executeGraphql<
        { matchPicks: MatchPick[] },
        { tournamentId: string; matchId: number }
      >(
        GET_MATCH_PICKS,
        { variables: { tournamentId, matchId } }
      );

      results.push({
        matchId,
        match: match || 'NOT FOUND',
        picks: picksResult.data.matchPicks,
      });
    }

    res.json({ tournamentId, requestedMatches: results });
    return;
  }

  // Get all BYE matches for this tournament
  const byeResult = await dataConnectAdmin.executeGraphql<
    { matches: ByeMatch[] },
    { tournamentId: string }
  >(
    GET_TOURNAMENT_BYE_MATCHES,
    { variables: { tournamentId } }
  );

  const byeMatches = byeResult.data.matches;
  console.log(`[debugByes] Found ${byeMatches.length} BYE matches`);

  const results: any[] = [];

  for (const bye of byeMatches) {
    // Get picks for this BYE match
    const byePicksResult = await dataConnectAdmin.executeGraphql<
      { matchPicks: MatchPick[] },
      { tournamentId: string; matchId: number }
    >(
      GET_MATCH_PICKS,
      { variables: { tournamentId, matchId: bye.matchId } }
    );

    // Get picks for the next round match
    let nextMatchPicks: MatchPick[] = [];
    if (bye.qualifiesToMatchId) {
      const nextPicksResult = await dataConnectAdmin.executeGraphql<
        { matchPicks: MatchPick[] },
        { tournamentId: string; matchId: number }
      >(
        GET_MATCH_PICKS,
        { variables: { tournamentId, matchId: bye.qualifiesToMatchId } }
      );
      nextMatchPicks = nextPicksResult.data.matchPicks;
    }

    results.push({
      byeMatch: bye,
      byeMatchPicks: byePicksResult.data.matchPicks,
      nextMatchId: bye.qualifiesToMatchId,
      nextMatchPicks,
      expectedSlotInNextMatch: bye.positionInRound % 2 === 1 ? 1 : 2,
    });
  }

  res.json({
    tournamentId,
    byeMatchCount: byeMatches.length,
    details: results,
  });
});
