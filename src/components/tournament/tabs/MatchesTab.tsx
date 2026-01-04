// src/components/tournament/tabs/MatchesTab.tsx
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CompactMatchCard } from '../CompactMatchCard';
import { getRoundStatus, getRoundStatusDisplay } from '@/lib/tournament-utils';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import { getRoundMatches } from '@knockoutfpl/dataconnect';
import type { Tournament, Participant, Match } from '@/types/tournament';

const PAGE_SIZE = 100;

interface MatchesTabProps {
  tournament: Tournament;
  participants: Participant[];
  userFplTeamId?: number;
  isAuthenticated?: boolean;
  onClaimTeam?: (fplTeamId: number) => void;
}

export function MatchesTab({
  tournament,
  participants,
  userFplTeamId,
  isAuthenticated,
  onClaimTeam,
}: MatchesTabProps) {
  // Default to current round
  const [selectedRoundNumber, setSelectedRoundNumber] = useState(
    tournament.currentRound
  );

  // Pagination state for "Everyone Else" section
  const [paginatedMatches, setPaginatedMatches] = useState<Match[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Get selected round data (for round info like gameweek)
  const selectedRound = useMemo(() => {
    return tournament.rounds.find((r) => r.roundNumber === selectedRoundNumber);
  }, [tournament.rounds, selectedRoundNumber]);

  // Find user's match from preloaded tournament data (always visible in "You" section)
  const userMatch = useMemo(() => {
    if (!userFplTeamId) return null;
    const round = tournament.rounds.find((r) => r.roundNumber === selectedRoundNumber);
    return round?.matches.find(
      (match) =>
        match.player1?.fplTeamId === userFplTeamId ||
        match.player2?.fplTeamId === userFplTeamId
    ) ?? null;
  }, [tournament.rounds, selectedRoundNumber, userFplTeamId]);

  // Transform API response to Match type
  const transformApiMatch = useCallback((apiMatch: {
    matchId: number;
    tournamentId: string;
    status: string;
    winnerEntryId?: number | null;
    isBye: boolean;
    qualifiesToMatchId?: number | null;
    matchPicks_on_match: Array<{
      entryId: number;
      slot: number;
      participant: {
        seed: number;
        teamName: string;
        managerName: string;
      };
    }>;
  }): Match => {
    // Sort by slot to ensure player1 = slot 1, player2 = slot 2
    const sortedPicks = [...apiMatch.matchPicks_on_match].sort((a, b) => a.slot - b.slot);
    const pick1 = sortedPicks[0];
    const pick2 = sortedPicks[1];

    return {
      id: `${apiMatch.tournamentId}-${apiMatch.matchId}`,
      player1: pick1 ? {
        fplTeamId: pick1.entryId,
        seed: pick1.participant.seed,
        score: null, // Score not included in this query
        teamName: pick1.participant.teamName,
        managerName: pick1.participant.managerName,
      } : null,
      player2: pick2 ? {
        fplTeamId: pick2.entryId,
        seed: pick2.participant.seed,
        score: null,
        teamName: pick2.participant.teamName,
        managerName: pick2.participant.managerName,
      } : null,
      winnerId: apiMatch.winnerEntryId ?? null,
      isBye: apiMatch.isBye,
      qualifiesTo: apiMatch.qualifiesToMatchId
        ? `${apiMatch.tournamentId}-${apiMatch.qualifiesToMatchId}`
        : undefined,
    };
  }, []);

  // Load more matches
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const result = await getRoundMatches({
        tournamentId: tournament.id,
        roundNumber: selectedRoundNumber,
        limit: PAGE_SIZE,
        offset,
      });

      const newMatches = result.data.matches.map(transformApiMatch);
      setPaginatedMatches((prev) => [...prev, ...newMatches]);
      setOffset((prev) => prev + newMatches.length);
      setHasMore(newMatches.length === PAGE_SIZE);
    } catch (error) {
      console.error('Failed to load matches:', error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, offset, tournament.id, selectedRoundNumber, transformApiMatch]);

  // Reset pagination when round changes
  useEffect(() => {
    setPaginatedMatches([]);
    setOffset(0);
    setHasMore(true);
  }, [selectedRoundNumber]);

  // Initial load when round changes or after reset
  useEffect(() => {
    if (paginatedMatches.length === 0 && hasMore && !isLoading) {
      loadMore();
    }
  }, [selectedRoundNumber, paginatedMatches.length, hasMore, isLoading, loadMore]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMore]);

  // Round status for display
  const roundStatus = selectedRound
    ? getRoundStatus(
        selectedRound.gameweek,
        tournament.currentGameweek,
        selectedRound.isComplete
      )
    : 'upcoming';

  const roundStarted =
    selectedRound && selectedRound.gameweek <= tournament.currentGameweek;

  return (
    <div className="space-y-6">
      {/* Round Selector */}
      <div className="space-y-2">
        <Select
          value={String(selectedRoundNumber)}
          onValueChange={(value) => setSelectedRoundNumber(Number(value))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select round" />
          </SelectTrigger>
          <SelectContent>
            {tournament.rounds.map((round) => (
              <SelectItem key={round.roundNumber} value={String(round.roundNumber)}>
                <span className="flex items-center gap-2">
                  {round.name}
                  {round.roundNumber === tournament.currentRound && (
                    <span className="text-xs text-muted-foreground">(current)</span>
                  )}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Round Status Line */}
        {selectedRound && (
          <p className="text-sm text-muted-foreground">
            GW{selectedRound.gameweek} •{' '}
            <span
              className={cn(
                roundStatus === 'live' && 'text-green-600 dark:text-green-400'
              )}
            >
              {getRoundStatusDisplay(roundStatus)}
            </span>
          </p>
        )}
      </div>

      {/* You Section */}
      {userMatch && (
        <section>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            You
          </h3>
          <CompactMatchCard
            match={userMatch}
            participants={participants}
            roundStarted={roundStarted ?? false}
            gameweek={selectedRound?.gameweek ?? 0}
            isAuthenticated={isAuthenticated}
            onClaimTeam={onClaimTeam}
            className="w-full border-2 border-primary"
          />
        </section>
      )}

      {/* Everyone Else Section */}
      <section>
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
          {userMatch ? 'Everyone Else' : 'All Matches'}
        </h3>
        {paginatedMatches.length > 0 ? (
          <div className="space-y-2">
            {paginatedMatches.map((match) => (
              <CompactMatchCard
                key={match.id}
                match={match}
                participants={participants}
                roundStarted={roundStarted ?? false}
                gameweek={selectedRound?.gameweek ?? 0}
                isAuthenticated={isAuthenticated}
                onClaimTeam={onClaimTeam}
                className="w-full"
              />
            ))}
          </div>
        ) : !isLoading ? (
          <p className="text-sm text-muted-foreground">No matches in this round.</p>
        ) : null}

        {/* Sentinel for infinite scroll */}
        {hasMore && (
          <div ref={sentinelRef} className="h-10 flex items-center justify-center">
            {isLoading && <Spinner className="size-5" />}
          </div>
        )}
      </section>
    </div>
  );
}
