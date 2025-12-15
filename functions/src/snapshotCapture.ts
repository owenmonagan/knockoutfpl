// functions/src/snapshotCapture.ts
import type {
  BootstrapResponse,
  FixtureResponse,
  LeagueStandingsResponse,
} from './types';
import type { FPLSnapshot, GameweekStatus, TeamSnapshotData } from './types/fplSnapshot';
import { Timestamp } from 'firebase-admin/firestore';
import * as fetcher from './fplApiFetcher';

export const FLOAWO_LEAGUE_ID = 634129;

export function determineGameweekStatus(fixtures: FixtureResponse[]): GameweekStatus {
  if (fixtures.length === 0) {
    return 'not_started';
  }

  const allFinished = fixtures.every((f) => f.finished);
  const someStarted = fixtures.some((f) => f.started);

  if (allFinished) {
    return 'finished';
  }
  if (someStarted) {
    return 'in_progress';
  }
  return 'not_started';
}

export function getCurrentGameweek(bootstrap: BootstrapResponse): number {
  const current = bootstrap.events.find((e) => e.is_current);
  if (!current) {
    throw new Error('No current gameweek found');
  }
  return current.id;
}

export function getTeamIdsFromStandings(standings: LeagueStandingsResponse): number[] {
  return standings.standings.results.map((r) => r.entry);
}

export async function captureTeamData(
  teamId: number,
  currentGameweek: number
): Promise<TeamSnapshotData> {
  const [entry, history, transfers] = await Promise.all([
    fetcher.fetchEntry(teamId),
    fetcher.fetchHistory(teamId),
    fetcher.fetchTransfers(teamId),
  ]);

  // Fetch picks for current gameweek only (can expand later)
  const picks: TeamSnapshotData['picks'] = {};
  try {
    picks[currentGameweek] = await fetcher.fetchPicks(teamId, currentGameweek);
  } catch {
    // Picks may not be available yet before deadline
  }

  return { entry, history, transfers, picks };
}

export async function captureSnapshot(): Promise<FPLSnapshot> {
  // Fetch global data
  const [bootstrapStatic, fixtures, eventStatus, setPieceNotes, leagueStandings] =
    await Promise.all([
      fetcher.fetchBootstrapStatic(),
      fetcher.fetchFixtures(),
      fetcher.fetchEventStatus(),
      fetcher.fetchSetPieceNotes(),
      fetcher.fetchLeagueStandings(FLOAWO_LEAGUE_ID),
    ]);

  const currentGameweek = getCurrentGameweek(bootstrapStatic);
  const fixturesCurrentGW = fixtures.filter((f) => f.event === currentGameweek);
  const gameweekStatus = determineGameweekStatus(fixturesCurrentGW);

  // Fetch live scores and dream team if gameweek has started
  let liveScores = null;
  let dreamTeam = null;
  if (gameweekStatus !== 'not_started') {
    [liveScores, dreamTeam] = await Promise.all([
      fetcher.fetchLiveScores(currentGameweek).catch(() => null),
      fetcher.fetchDreamTeam(currentGameweek).catch(() => null),
    ]);
  }

  // Fetch team data for all league members
  const teamIds = getTeamIdsFromStandings(leagueStandings);
  const teamDataEntries = await Promise.all(
    teamIds.map(async (teamId) => {
      const data = await captureTeamData(teamId, currentGameweek);
      return [teamId, data] as const;
    })
  );
  const teamData = Object.fromEntries(teamDataEntries);

  // Fetch top 50 owned player summaries (simplified: skip for now)
  const playerSummaries = {};

  return {
    capturedAt: Timestamp.now(),
    gameweek: currentGameweek,
    gameweekStatus,
    leagueId: FLOAWO_LEAGUE_ID,
    bootstrapStatic,
    fixtures,
    fixturesCurrentGW,
    liveScores,
    eventStatus,
    dreamTeam,
    setPieceNotes,
    leagueStandings,
    teamData,
    playerSummaries,
  };
}
