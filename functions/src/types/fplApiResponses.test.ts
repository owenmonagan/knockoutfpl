// functions/src/types/fplApiResponses.test.ts
import { describe, it, expect } from 'vitest';
import type {
  BootstrapResponse,
  FixtureResponse,
  LiveResponse,
  EventStatusResponse,
  DreamTeamResponse,
  SetPieceResponse,
  LeagueStandingsResponse,
  EntryResponse,
  HistoryResponse,
  TransferResponse,
  PicksResponse,
  ElementSummaryResponse,
} from './fplApiResponses';

describe('FPL API Response Types', () => {
  it('should allow valid BootstrapResponse structure', () => {
    const bootstrap: BootstrapResponse = {
      events: [{ id: 1, name: 'Gameweek 1', is_current: true, is_next: false, finished: false, deadline_time: '2025-08-16T10:00:00Z' }],
      teams: [{ id: 1, name: 'Arsenal', short_name: 'ARS' }],
      elements: [{ id: 1, web_name: 'Saka', element_type: 3, team: 1, now_cost: 100 }],
      element_types: [{ id: 1, singular_name: 'Goalkeeper', plural_name: 'Goalkeepers' }],
    };
    expect(bootstrap.events).toHaveLength(1);
  });

  it('should allow valid FixtureResponse structure', () => {
    const fixture: FixtureResponse = {
      id: 1,
      event: 16,
      team_h: 1,
      team_a: 2,
      team_h_score: 2,
      team_a_score: 1,
      started: true,
      finished: true,
      minutes: 90,
      kickoff_time: '2025-12-14T15:00:00Z',
    };
    expect(fixture.finished).toBe(true);
  });

  it('should allow valid LeagueStandingsResponse structure', () => {
    const standings: LeagueStandingsResponse = {
      league: { id: 634129, name: 'FLOAWO' },
      standings: {
        results: [
          { entry: 158256, entry_name: 'Test Team', player_name: 'Test Manager', rank: 1, total: 1000 }
        ]
      }
    };
    expect(standings.standings.results).toHaveLength(1);
  });

  it('should allow valid EntryResponse structure', () => {
    const entry: EntryResponse = {
      id: 158256,
      name: 'Test Team',
      player_first_name: 'Test',
      player_last_name: 'User',
      summary_overall_points: 1000,
      summary_overall_rank: 50000,
      summary_event_points: 65,
      summary_event_rank: 100000,
      last_deadline_value: 1005,
    };
    expect(entry.id).toBe(158256);
  });

  it('should allow valid PicksResponse structure', () => {
    const picks: PicksResponse = {
      picks: [
        { element: 1, position: 1, multiplier: 1, is_captain: false, is_vice_captain: false }
      ],
      entry_history: { event: 16, points: 65, total_points: 1000, rank: 100000 },
      active_chip: null,
    };
    expect(picks.picks).toHaveLength(1);
  });
});

import type { FPLSnapshot, GameweekStatus } from './fplSnapshot';
import { Timestamp } from 'firebase-admin/firestore';

describe('FPLSnapshot Type', () => {
  it('should allow valid FPLSnapshot structure', () => {
    const snapshot: FPLSnapshot = {
      capturedAt: Timestamp.now(),
      gameweek: 16,
      gameweekStatus: 'in_progress',
      leagueId: 634129,

      bootstrapStatic: {
        events: [],
        teams: [],
        elements: [],
        element_types: [],
      },
      fixtures: [],
      fixturesCurrentGW: [],
      liveScores: null,
      eventStatus: { status: [] },
      dreamTeam: null,
      setPieceNotes: { teams: [] },

      leagueStandings: {
        league: { id: 634129, name: 'FLOAWO' },
        standings: { results: [] },
      },

      teamData: {},
      playerSummaries: {},
    };

    expect(snapshot.gameweek).toBe(16);
    expect(snapshot.gameweekStatus).toBe('in_progress');
  });

  it('should allow teamData with nested picks by gameweek', () => {
    const snapshot: FPLSnapshot = {
      capturedAt: Timestamp.now(),
      gameweek: 16,
      gameweekStatus: 'finished',
      leagueId: 634129,
      bootstrapStatic: { events: [], teams: [], elements: [], element_types: [] },
      fixtures: [],
      fixturesCurrentGW: [],
      liveScores: null,
      eventStatus: { status: [] },
      dreamTeam: null,
      setPieceNotes: { teams: [] },
      leagueStandings: { league: { id: 634129, name: 'FLOAWO' }, standings: { results: [] } },
      teamData: {
        158256: {
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
        },
      },
      playerSummaries: {},
    };

    expect(snapshot.teamData[158256].picks[16].entry_history.points).toBe(65);
  });
});
