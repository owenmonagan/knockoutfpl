/**
 * FPLConnectionCard - Component for connecting/displaying user's FPL team
 *
 * This is the PRIMARY ONBOARDING component. New users see this first.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * THREE STATES
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * STATE A: NOT CONNECTED (fplTeamId === 0)
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ 🏆 Connect Your FPL Team                                                │
 * │                                                                         │
 * │ Link your FPL team to start creating challenges                        │
 * │                                                                         │
 * │ [Team ID Input] [Connect Button]                                       │
 * │                                                                         │
 * │ Find your Team ID at fantasy.premierleague.com                         │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * STATE B: CONNECTED (fplTeamId > 0)
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ 🏆 Your FPL Team                                            [Edit]       │
 * │                                                                         │
 * │ Team: Monzaga                                                           │
 * │ GW Points: 78 | GW Rank: 1,656,624                                     │
 * │ Overall: 427 pts | Overall Rank: 841,192                               │
 * │ Team Value: £102.0m                                                     │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * STATE C: EDITING (isEditing === true)
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ 🏆 Edit Your FPL Team                                                   │
 * │                                                                         │
 * │ [Team ID Input (pre-filled)] [Update] [Cancel]                         │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * PROPS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * - user: User | null (from Firestore)
 * - fplData: FPLTeamData | null (live FPL API data)
 * - isLoading: boolean (loading state for API calls)
 * - onConnect: (teamId: number) => Promise<void> (connect FPL team)
 * - onUpdate: (teamId: number) => Promise<void> (update FPL team ID)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * VALIDATION RULES
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * - Team ID must be 6-7 digits
 * - Team ID must be numeric only
 * - Team ID must exist in FPL API (verified on submit)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * MICRO-TDD STEPS (from DashboardPage comments, Steps 6-36)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * NOT CONNECTED STATE (Steps 6-21):
 * [ ] Step 6: Component renders
 * [ ] Step 7: Shows "Connect Your FPL Team" title when not connected
 * [ ] Step 8: Shows description text
 * [ ] Step 9: Shows team ID input field
 * [ ] Step 10: Input has proper label
 * [ ] Step 11: Shows "Connect" button
 * [ ] Step 12: Button is disabled when input is empty
 * [ ] Step 13: Validates team ID format (6-7 digits)
 * [ ] Step 14: Shows error for invalid team ID
 * [ ] Step 15: Shows error for non-numeric input
 * [ ] Step 16: Shows help text with link
 * [ ] Step 17: Button shows loading state when connecting
 * [ ] Step 18: Button is disabled while loading
 * [ ] Step 19: Calls onConnect with team ID on submit
 * [ ] Step 20: Shows error message from API failure
 * [ ] Step 21: Clears error when user types
 *
 * CONNECTED STATE (Steps 22-29):
 * [ ] Step 22: Shows "Your FPL Team" title when connected
 * [ ] Step 23: Displays team name
 * [ ] Step 24: Displays gameweek points
 * [ ] Step 25: Displays gameweek rank (formatted)
 * [ ] Step 26: Displays overall points
 * [ ] Step 27: Displays overall rank (formatted)
 * [ ] Step 28: Displays team value (formatted)
 * [ ] Step 29: Shows "Edit" button
 *
 * EDITING STATE (Steps 30-36):
 * [ ] Step 30: Clicking Edit shows input field
 * [ ] Step 31: Input is pre-filled with current team ID
 * [ ] Step 32: Shows "Update" button
 * [ ] Step 33: Shows "Cancel" button
 * [ ] Step 34: Cancel exits edit mode
 * [ ] Step 35: Update calls onUpdate with new team ID
 * [ ] Step 36: Exits edit mode after successful update
 */

import type { User } from '../../types/user';

export interface FPLTeamData {
  teamName: string;
  overallPoints: number;
  overallRank: number;
  gameweekPoints: number;
  gameweekRank: number;
  teamValue: number; // in £m
}

export interface FPLConnectionCardProps {
  user: User | null;
  fplData: FPLTeamData | null;
  isLoading: boolean;
  onConnect: (teamId: number) => Promise<void>;
  onUpdate: (teamId: number) => Promise<void>;
}

export function FPLConnectionCard(props: FPLConnectionCardProps) {
  return <article role="article">FPLConnectionCard</article>;
}
