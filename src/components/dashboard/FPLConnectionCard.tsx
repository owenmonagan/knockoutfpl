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
 * │ Link your FPL team to join tournaments                                 │
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

import { useState } from 'react';
import type { User } from '../../types/user';
import type { FPLTeamInfo } from '../../services/fpl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';

// Re-export for backwards compatibility
export type FPLTeamData = FPLTeamInfo;

export interface FPLConnectionCardProps {
  user: User | null;
  fplData: FPLTeamData | null;
  isLoading: boolean;
  error?: string | null;
  onConnect: (teamId: number) => Promise<void>;
  onUpdate: (teamId: number) => Promise<void>;
  onClearError?: () => void;
}

export function FPLConnectionCard(props: FPLConnectionCardProps) {
  const { user, fplData, isLoading, error, onConnect, onClearError } = props;
  const [teamId, setTeamId] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Check if user is connected to FPL
  const isConnected = user && user.fplTeamId > 0;

  // Validate team ID format: must be 6-7 digits
  const isValidTeamId = (id: string): boolean => {
    return /^\d{6,7}$/.test(id);
  };

  // Show error if team ID is entered but invalid
  const showError = teamId.length > 0 && !isValidTeamId(teamId);

  // Handle connect button click
  const handleConnect = async () => {
    if (isValidTeamId(teamId)) {
      await onConnect(parseInt(teamId, 10));
    }
  };

  // Handle update button click
  const handleUpdate = async () => {
    if (isValidTeamId(teamId)) {
      await props.onUpdate(parseInt(teamId, 10));
      setIsEditing(false);
    }
  };

  return (
    <Card role="article">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>
              {isConnected && fplData ? fplData.teamName : isConnected ? 'Your FPL Team' : 'Connect Your FPL Team'}
            </CardTitle>
            <CardDescription>
              {isConnected && fplData ? fplData.managerName : 'Link your FPL team to join tournaments'}
            </CardDescription>
          </div>
          {isConnected && !isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (user) {
                  setTeamId(user.fplTeamId.toString());
                }
                setIsEditing(true);
              }}
            >
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isConnected && fplData && !isEditing ? (
          // Connected state: Show team stats in beautiful grid layout
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-2xl font-bold">{fplData.gameweekPoints ?? 'N/A'}</div>
              <div className="text-sm text-muted-foreground">GW Points</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">{fplData.gameweekRank?.toLocaleString() ?? 'N/A'}</div>
              <div className="text-sm text-muted-foreground">GW Rank</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">{fplData.overallPoints ?? 'N/A'}</div>
              <div className="text-sm text-muted-foreground">Overall Points</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">{fplData.overallRank?.toLocaleString() ?? 'N/A'}</div>
              <div className="text-sm text-muted-foreground">Overall Rank</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">£{fplData.teamValue?.toFixed(1) ?? 'N/A'}m</div>
              <div className="text-sm text-muted-foreground">Team Value</div>
            </div>
          </div>
        ) : isConnected && isEditing ? (
          // Editing state: Show input form
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fpl-team-id">FPL Team ID</Label>
              <Input
                id="fpl-team-id"
                type="text"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdate}>Update</Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          // Not connected state: Show input form
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fpl-team-id">FPL Team ID</Label>
              <Input
                id="fpl-team-id"
                type="text"
                value={teamId}
                onChange={(e) => {
                  setTeamId(e.target.value);
                  onClearError?.();
                }}
              />
              {showError && (
                <p className="text-sm text-destructive">
                  Team ID must be 6-7 digits
                </p>
              )}
            </div>
            <Button
              disabled={!isValidTeamId(teamId) || isLoading}
              onClick={handleConnect}
            >
              {isLoading ? 'Connecting...' : 'Connect'}
            </Button>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Find your Team ID at{' '}
              <a
                href="https://fantasy.premierleague.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                fantasy.premierleague.com
              </a>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
