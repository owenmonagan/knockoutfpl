export interface FPLTeamInfo {
  teamId: number;
  teamName: string;
  managerName: string;
  overallPoints?: number;
  overallRank?: number;
  gameweekPoints?: number;
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
    overallPoints: data.summary_overall_points,
    overallRank: data.summary_overall_rank,
    gameweekPoints: data.summary_event_points,
    gameweekRank: data.summary_event_rank,
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

export interface FPLLiveElement {
  id: number;
  stats: {
    total_points: number;
  };
}

export async function getFPLLiveScores(gameweek: number): Promise<Map<number, number>> {
  const response = await fetch(`/api/fpl/event/${gameweek}/live/`);

  if (!response.ok) {
    throw new Error('Failed to fetch live scores');
  }

  const data = await response.json();
  const scoresMap = new Map<number, number>();

  for (const element of data.elements) {
    scoresMap.set(element.id, element.stats.total_points);
  }

  return scoresMap;
}
