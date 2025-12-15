// functions/src/types/fplSnapshot.ts
import { Timestamp } from 'firebase-admin/firestore';
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

export type GameweekStatus = 'not_started' | 'in_progress' | 'finished';

export interface TeamSnapshotData {
  entry: EntryResponse;
  history: HistoryResponse;
  transfers: TransferResponse;
  picks: {
    [gameweek: number]: PicksResponse;
  };
}

export interface FPLSnapshot {
  capturedAt: Timestamp;
  gameweek: number;
  gameweekStatus: GameweekStatus;
  leagueId: number;

  // Global data
  bootstrapStatic: BootstrapResponse;
  fixtures: FixtureResponse[];
  fixturesCurrentGW: FixtureResponse[];
  liveScores: LiveResponse | null;
  eventStatus: EventStatusResponse;
  dreamTeam: DreamTeamResponse | null;
  setPieceNotes: SetPieceResponse;

  // League data
  leagueStandings: LeagueStandingsResponse;

  // Per-team data
  teamData: {
    [teamId: number]: TeamSnapshotData;
  };

  // Player deep data (top owned)
  playerSummaries: {
    [playerId: number]: ElementSummaryResponse;
  };
}
