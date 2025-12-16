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
