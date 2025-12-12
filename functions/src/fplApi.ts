const FPL_API_BASE = 'https://fantasy.premierleague.com/api';

export async function fetchFPLBootstrapData(): Promise<any> {
  const response = await fetch(`${FPL_API_BASE}/bootstrap-static/`);
  const data = await response.json();
  return data;
}

export async function fetchFPLTeamInfo(teamId: number): Promise<any> {
  const response = await fetch(`${FPL_API_BASE}/entry/${teamId}/`);
  const data = await response.json();
  return data;
}

export async function fetchFPLGameweekScore(teamId: number, gameweek: number): Promise<any> {
  const response = await fetch(`${FPL_API_BASE}/entry/${teamId}/event/${gameweek}/picks/`);
  const data = await response.json();
  return data;
}
