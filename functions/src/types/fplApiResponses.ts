// functions/src/types/fplApiResponses.ts

// === BOOTSTRAP STATIC ===

export interface FPLEvent {
  id: number;
  name: string;
  is_current: boolean;
  is_next: boolean;
  finished: boolean;
  deadline_time: string;
}

export interface FPLTeam {
  id: number;
  name: string;
  short_name: string;
}

export interface FPLElement {
  id: number;
  web_name: string;
  element_type: number;
  team: number;
  now_cost: number;
}

export interface FPLElementType {
  id: number;
  singular_name: string;
  plural_name: string;
}

export interface BootstrapResponse {
  events: FPLEvent[];
  teams: FPLTeam[];
  elements: FPLElement[];
  element_types: FPLElementType[];
}

// === FIXTURES ===

export interface FixtureResponse {
  id: number;
  event: number;
  team_h: number;
  team_a: number;
  team_h_score: number | null;
  team_a_score: number | null;
  started: boolean;
  finished: boolean;
  minutes: number;
  kickoff_time: string;
}

// === LIVE SCORES ===

export interface LiveElementStats {
  total_points: number;
  minutes: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  bonus: number;
}

export interface LiveElement {
  id: number;
  stats: LiveElementStats;
}

export interface LiveResponse {
  elements: LiveElement[];
}

// === EVENT STATUS ===

export interface EventStatusItem {
  event: number;
  points: string;
  bonus_added: boolean;
}

export interface EventStatusResponse {
  status: EventStatusItem[];
}

// === DREAM TEAM ===

export interface DreamTeamPick {
  element: number;
  points: number;
  position: number;
}

export interface DreamTeamResponse {
  top_player: { id: number; points: number } | null;
  team: DreamTeamPick[];
}

// === SET PIECE NOTES ===

export interface SetPieceResponse {
  teams: Array<{
    id: number;
    notes: Array<{ info_message: string }>;
  }>;
}

// === LEAGUE STANDINGS ===

export interface LeagueInfo {
  id: number;
  name: string;
}

export interface LeagueStandingEntry {
  entry: number;
  entry_name: string;
  player_name: string;
  rank: number;
  total: number;
}

export interface LeagueStandingsResponse {
  league: LeagueInfo;
  standings: {
    has_next: boolean;
    results: LeagueStandingEntry[];
  };
}

// === ENTRY (TEAM INFO) ===

export interface EntryResponse {
  id: number;
  name: string;
  player_first_name: string;
  player_last_name: string;
  summary_overall_points: number;
  summary_overall_rank: number;
  summary_event_points: number;
  summary_event_rank: number;
  last_deadline_value: number;
}

// === HISTORY ===

export interface HistoryEvent {
  event: number;
  points: number;
  total_points: number;
  rank: number;
  overall_rank: number;
}

export interface HistoryChip {
  name: string;
  event: number;
}

export interface HistoryResponse {
  current: HistoryEvent[];
  chips: HistoryChip[];
}

// === TRANSFERS ===

export interface TransferItem {
  element_in: number;
  element_out: number;
  event: number;
  time: string;
}

export type TransferResponse = TransferItem[];

// === PICKS ===

export interface PickItem {
  element: number;
  position: number;
  multiplier: number;
  is_captain: boolean;
  is_vice_captain: boolean;
}

export interface PicksEntryHistory {
  event: number;
  points: number;
  total_points: number;
  rank: number;
}

export interface PicksResponse {
  picks: PickItem[];
  entry_history: PicksEntryHistory;
  active_chip: string | null;
}

// === ELEMENT SUMMARY ===

export interface ElementSummaryFixture {
  event: number;
  is_home: boolean;
  difficulty: number;
}

export interface ElementSummaryHistory {
  element: number;
  fixture: number;
  total_points: number;
  round: number;
}

export interface ElementSummaryResponse {
  fixtures: ElementSummaryFixture[];
  history: ElementSummaryHistory[];
}
