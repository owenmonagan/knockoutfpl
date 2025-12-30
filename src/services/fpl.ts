export interface FPLMiniLeague {
  id: number;
  name: string;
  entryRank: number;
}

export interface LeagueStanding {
  fplTeamId: number;
  teamName: string;
  managerName: string;
  rank: number;
  totalPoints: number;
}

export interface FPLTeamInfo {
  teamId: number;
  teamName: string;
  managerName: string;
  overallPoints?: number;
  overallRank?: number;
  gameweekPoints?: number;
  gameweekRank?: number;
  teamValue?: number;
}

export async function getFPLTeamInfo(teamId: number): Promise<FPLTeamInfo> {
  const response = await fetch(`/api/fpl/entry/${teamId}/`);

  if (!response.ok) {
    throw new Error('Failed to fetch team info');
  }

  const data = await response.json();

  return {
    teamId: data.id,
    teamName: data.name,
    managerName: `${data.player_first_name} ${data.player_last_name}`,
    overallPoints: data.summary_overall_points,
    overallRank: data.summary_overall_rank,
    gameweekPoints: data.summary_event_points,
    gameweekRank: data.summary_event_rank,
    teamValue: data.last_deadline_value ? data.last_deadline_value / 10 : undefined,
  };
}

export async function getUserMiniLeagues(teamId: number): Promise<FPLMiniLeague[]> {
  const response = await fetch(`/api/fpl/entry/${teamId}/`);

  if (!response.ok) {
    throw new Error('Failed to fetch team data');
  }

  const data = await response.json();
  const classicLeagues = data.leagues?.classic || [];

  return classicLeagues.map((league: any) => ({
    id: league.id,
    name: league.name,
    entryRank: league.entry_rank,
  }));
}

export async function getLeagueStandings(leagueId: number): Promise<LeagueStanding[]> {
  const response = await fetch(`/api/fpl/leagues-classic/${leagueId}/standings/`);

  if (!response.ok) {
    throw new Error('Failed to fetch league standings');
  }

  const data = await response.json();
  const results = data.standings?.results || [];

  return results.map((entry: any) => ({
    fplTeamId: entry.entry,
    teamName: entry.entry_name,
    managerName: entry.player_name,
    rank: entry.rank,
    totalPoints: entry.total,
  }));
}
