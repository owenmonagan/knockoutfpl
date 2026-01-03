// src/components/tournament/UserPathBracket.tsx
import { useState, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';
import { PathMatchCard } from './PathMatchCard';
import { HistoryMatchCard } from './HistoryMatchCard';
import {
  fetchUserTournamentMatches,
  fetchOpponentHistories,
  fetchHighestSeedRemaining,
  type UserMatchInfo,
  type OpponentMatchInfo,
  type FocalTeamInfo,
} from '../../services/tournament';
import type { Tournament } from '../../types/tournament';

interface UserPathBracketProps {
  tournament: Tournament;
  userFplTeamId?: number | null;
  isAuthenticated?: boolean;
  currentGameweek: number;
}

export function UserPathBracket({
  tournament,
  userFplTeamId,
  isAuthenticated,
  currentGameweek,
}: UserPathBracketProps) {
  // Focal team state
  const [focalTeamId, setFocalTeamId] = useState<number | null>(null);
  const [focalTeamInfo, setFocalTeamInfo] = useState<FocalTeamInfo | null>(null);

  // Data state
  const [userPath, setUserPath] = useState<UserMatchInfo[]>([]);
  const [opponentHistories, setOpponentHistories] = useState<Map<number, OpponentMatchInfo[]>>(new Map());

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Determine initial focal team
  useEffect(() => {
    async function initFocalTeam() {
      // If user is authenticated and in tournament, use their team
      if (isAuthenticated && userFplTeamId) {
        setFocalTeamId(userFplTeamId);
        return;
      }

      // Otherwise, fetch highest seed remaining
      try {
        const highest = await fetchHighestSeedRemaining(tournament.id);
        if (highest) {
          setFocalTeamId(highest.entryId);
          setFocalTeamInfo(highest);
        }
      } catch (err) {
        console.error('Failed to fetch highest seed:', err);
      }
    }

    initFocalTeam();
  }, [tournament.id, isAuthenticated, userFplTeamId]);

  // Fetch user path and opponent histories when focal team changes
  useEffect(() => {
    if (!focalTeamId) return;

    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch focal team's path
        const path = await fetchUserTournamentMatches(
          tournament.id,
          focalTeamId,
          tournament.totalRounds,
          currentGameweek
        );
        setUserPath(path);

        // Extract opponent entry IDs from future matches
        const opponentIds = path
          .filter((m) => m.opponentFplTeamId !== null)
          .map((m) => m.opponentFplTeamId as number);

        // Fetch opponent histories
        if (opponentIds.length > 0) {
          const histories = await fetchOpponentHistories(tournament.id, opponentIds);
          setOpponentHistories(histories);
        }

        // Update focal team info from first match
        if (path.length > 0) {
          setFocalTeamInfo({
            entryId: path[0].yourFplTeamId,
            teamName: path[0].yourTeamName,
            managerName: '',
            seed: path[0].yourSeed,
          });
        }
      } catch (err) {
        console.error('Failed to fetch path data:', err);
        setError('Failed to load bracket data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [focalTeamId, tournament.id, tournament.totalRounds, currentGameweek]);

  // Calculate max opponent history depth (for grid layout)
  const maxHistoryDepth = useMemo(() => {
    return Math.max(0, ...userPath.map((m) => m.roundNumber - 1));
  }, [userPath]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 gap-2">
        <Spinner className="size-5" />
        <span className="text-muted-foreground">Loading bracket...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with team selector */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Viewing:</span>
          <span className="font-medium">
            {focalTeamInfo?.teamName ?? 'Select a team'}
          </span>
          {focalTeamInfo && (
            <span className="text-sm text-muted-foreground">
              (Seed #{focalTeamInfo.seed})
            </span>
          )}
          {isAuthenticated && focalTeamId === userFplTeamId && (
            <span className="text-sm text-primary">★ You</span>
          )}
        </div>

        {/* Search placeholder - will implement team search */}
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Search teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-48"
          />
          <Button variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Path visualization */}
      <div className="space-y-4">
        {/* Your path row */}
        <div className="flex gap-4 overflow-x-auto pb-2">
          {userPath.map((match, index) => (
            <div key={match.matchId} className="flex items-center gap-2">
              <PathMatchCard
                match={match}
                isFocalTeam={true}
                currentGameweek={currentGameweek}
              />
              {index < userPath.length - 1 && (
                <span className="text-muted-foreground">→</span>
              )}
            </div>
          ))}
        </div>

        {/* Opponent histories grid */}
        {maxHistoryDepth > 0 && (
          <div className="flex gap-4 overflow-x-auto">
            {/* Empty space for first match (no opponent history) */}
            <div className="w-48 shrink-0" />

            {/* History columns for each future match */}
            {userPath.slice(1).map((match) => {
              const opponentId = match.opponentFplTeamId;
              const history = opponentId ? opponentHistories.get(opponentId) : [];

              return (
                <div key={match.matchId} className="flex flex-col gap-2 shrink-0">
                  {(history ?? []).map((histMatch) => (
                    <HistoryMatchCard key={histMatch.matchId} match={histMatch} />
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="text-xs text-muted-foreground">
        Showing {userPath.length} matches on path to final
      </div>
    </div>
  );
}
