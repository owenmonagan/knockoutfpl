export interface FPLTeamInfo {
  teamId: number;
  teamName: string;
  managerName: string;
}

export interface FPLGameweekScore {
  gameweek: number;
  points: number;
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
  };
}

export async function getFPLGameweekScore(teamId: number, gameweek: number): Promise<FPLGameweekScore> {
  const response = await fetch(`/api/fpl/entry/${teamId}/event/${gameweek}/picks/`);

  if (!response.ok) {
    throw new Error('Failed to fetch gameweek score');
  }

  const data = await response.json();

  return {
    gameweek: data.entry_history.event,
    points: data.entry_history.points,
  };
}
