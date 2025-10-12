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

export interface FPLPick {
  element: number;
  position: number;
  multiplier: number;
  is_captain: boolean;
  is_vice_captain: boolean;
}

export interface FPLTeamPicks {
  picks: FPLPick[];
  entryHistory: {
    event: number;
    points: number;
    totalPoints: number;
  };
  activeChip: string | null;
}

export async function getFPLTeamPicks(teamId: number, gameweek: number): Promise<FPLTeamPicks> {
  const response = await fetch(`/api/fpl/entry/${teamId}/event/${gameweek}/picks/`);

  if (!response.ok) {
    throw new Error('Failed to fetch team picks');
  }

  const data = await response.json();

  return {
    picks: data.picks,
    entryHistory: {
      event: data.entry_history.event,
      points: data.entry_history.points,
      totalPoints: data.entry_history.total_points,
    },
    activeChip: data.active_chip,
  };
}

export interface FPLPlayer {
  id: number;
  web_name: string;
  element_type: number;
  team: number;
  now_cost: number;
}

export async function getFPLPlayers(): Promise<Map<number, FPLPlayer>> {
  const response = await fetch('/api/fpl/bootstrap-static/');

  if (!response.ok) {
    throw new Error('Failed to fetch player data');
  }

  const data = await response.json();
  const playerMap = new Map<number, FPLPlayer>();

  for (const element of data.elements) {
    playerMap.set(element.id, element);
  }

  return playerMap;
}
