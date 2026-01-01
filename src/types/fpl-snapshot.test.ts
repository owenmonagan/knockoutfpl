import { describe, it, expect } from 'vitest';
import type { FPLSnapshot, GameweekStatus, TeamSnapshotData } from './fpl-snapshot';

describe('FPL Snapshot Types', () => {
  it('should allow valid FPLSnapshot structure', () => {
    const snapshot: FPLSnapshot = {
      capturedAt: '2025-12-15T14:00:00Z',
      gameweek: 16,
      gameweekStatus: 'in_progress',
      leagueId: 634129,
      bootstrapStatic: { events: [], teams: [], elements: [], element_types: [] },
      fixtures: [],
      fixturesCurrentGW: [],
      liveScores: null,
      eventStatus: { status: [] },
      dreamTeam: null,
      setPieceNotes: { teams: [] },
      leagueStandings: { league: { id: 634129, name: 'FLOAWO' }, standings: { results: [] } },
      teamData: {},
      playerSummaries: {},
    };
    expect(snapshot.gameweek).toBe(16);
  });

  it('should validate GameweekStatus enum', () => {
    const statuses: GameweekStatus[] = ['not_started', 'in_progress', 'finished'];
    expect(statuses).toContain('in_progress');
  });

  it('should allow TeamSnapshotData with nested picks', () => {
    const teamData: TeamSnapshotData = {
      entry: {
        id: 158256,
        name: 'Test Team',
        player_first_name: 'Test',
        player_last_name: 'User',
        summary_overall_points: 1000,
        summary_overall_rank: 50000,
        summary_event_points: 65,
        summary_event_rank: 100000,
        last_deadline_value: 1005,
      },
      history: { current: [], chips: [] },
      transfers: [],
      picks: {
        16: {
          picks: [],
          entry_history: { event: 16, points: 65, total_points: 1000, rank: 100000 },
          active_chip: null,
        },
      },
    };
    expect(teamData.entry.id).toBe(158256);
  });
});
