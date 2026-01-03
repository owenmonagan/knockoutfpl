// src/components/tournament/UserPathBracket.tsx
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Spinner } from '../ui/spinner';
import { cn } from '../../lib/utils';
import { getFplTeamUrl } from '../../lib/fpl-urls';
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

    // Capture focalTeamId in a local const to satisfy TypeScript narrowing
    const teamId = focalTeamId;

    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch focal team's path
        const path = await fetchUserTournamentMatches(
          tournament.id,
          teamId,
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

  // Render a player row in BracketMatchCard style
  const renderPlayerRow = (
    teamName: string | null,
    seed: number | null,
    score: number | null,
    fplTeamId: number | null,
    isWinner: boolean,
    isLoser: boolean,
    isBye: boolean,
    gameweek: number,
    roundStarted: boolean
  ) => {
    if (isBye) {
      return (
        <div className="flex justify-between items-center px-2 py-1.5 text-muted-foreground text-sm">
          <span>BYE</span>
        </div>
      );
    }

    if (!teamName) {
      return (
        <div className="flex justify-between items-center px-2 py-1.5 text-muted-foreground text-sm">
          <span>TBD</span>
        </div>
      );
    }

    const showScore = roundStarted && score !== null;

    const rowContent = (
      <div
        className={cn(
          "flex justify-between items-center px-2 py-1.5 text-sm",
          isWinner && "font-semibold bg-green-50 dark:bg-green-950",
          isLoser && "opacity-50"
        )}
      >
        <div className="flex items-center gap-1.5 truncate">
          <span className="truncate">{teamName}</span>
          {seed !== null && !showScore && (
            <span className="text-muted-foreground text-xs">({seed})</span>
          )}
        </div>
        {showScore && (
          <span className={cn("tabular-nums font-medium", isWinner && "text-green-600 dark:text-green-400")}>
            {score}
          </span>
        )}
      </div>
    );

    if (fplTeamId) {
      return (
        <a
          href={getFplTeamUrl(fplTeamId, gameweek, roundStarted)}
          target="_blank"
          rel="noopener noreferrer"
          className="block cursor-pointer hover:bg-muted/50 transition-colors"
        >
          {rowContent}
        </a>
      );
    }

    return rowContent;
  };

  // Render a match card for user's path
  const renderPathMatchCard = (match: UserMatchInfo) => {
    const roundStarted = match.gameweek <= currentGameweek;
    const yourWon = match.result === 'won';
    const yourLost = match.result === 'lost';
    const opponentWon = match.result === 'lost';
    const opponentLost = match.result === 'won';

    return (
      <Card className="w-44 overflow-hidden">
        {renderPlayerRow(
          match.yourTeamName,
          match.yourSeed,
          match.yourScore,
          match.yourFplTeamId,
          yourWon,
          yourLost,
          false,
          match.gameweek,
          roundStarted
        )}
        <div className="border-t" />
        {match.isBye ? (
          renderPlayerRow(null, null, null, null, false, false, true, match.gameweek, roundStarted)
        ) : (
          renderPlayerRow(
            match.opponentTeamName,
            match.opponentSeed,
            match.opponentScore,
            match.opponentFplTeamId,
            opponentWon,
            opponentLost,
            false,
            match.gameweek,
            roundStarted
          )
        )}
      </Card>
    );
  };

  // Render opponent history match card (smaller/muted)
  const renderHistoryMatchCard = (match: OpponentMatchInfo) => {
    const isWinner = match.result === 'won';
    const isLoser = match.result === 'lost';

    return (
      <Card className="w-44 overflow-hidden opacity-70">
        {renderPlayerRow(
          match.teamName,
          match.seed,
          match.score,
          match.fplTeamId,
          isWinner,
          isLoser,
          false,
          match.gameweek,
          true
        )}
        <div className="border-t" />
        {renderPlayerRow(
          match.opponentTeamName,
          match.opponentSeed,
          match.opponentScore,
          match.opponentFplTeamId,
          !isWinner && match.result !== 'pending',
          isWinner,
          false,
          match.gameweek,
          true
        )}
      </Card>
    );
  };

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

      {/* Path visualization - column layout like original bracket */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {userPath.map((match) => {
          const opponentId = match.opponentFplTeamId;
          const history = opponentId ? opponentHistories.get(opponentId) : [];

          return (
            <div key={match.matchId} className="flex flex-col gap-2 shrink-0">
              {/* Round header */}
              <div className="text-sm font-medium">
                {match.roundName}
                <div className="text-xs text-muted-foreground font-normal">
                  GW {match.gameweek}
                </div>
              </div>

              {/* Your match in this round */}
              {renderPathMatchCard(match)}

              {/* Opponent's previous matches (their path to face you) */}
              {(history ?? []).map((histMatch) => (
                <div key={histMatch.matchId}>
                  {renderHistoryMatchCard(histMatch)}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="text-xs text-muted-foreground">
        Showing {userPath.length} matches on path to final
      </div>
    </div>
  );
}
