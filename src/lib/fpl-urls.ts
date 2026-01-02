export function getFplTeamUrl(fplTeamId: number, gameweek: number, roundStarted: boolean): string {
  const base = 'https://fantasy.premierleague.com/entry';
  if (roundStarted) {
    return `${base}/${fplTeamId}/event/${gameweek}`;
  }
  return `${base}/${fplTeamId}/history`;
}
