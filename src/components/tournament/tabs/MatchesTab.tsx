// src/components/tournament/tabs/MatchesTab.tsx
import { useState, useMemo } from 'react';
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
import type { Tournament, Participant } from '@/types/tournament';

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

  // Get selected round data
  const selectedRound = useMemo(() => {
    return tournament.rounds.find((r) => r.roundNumber === selectedRoundNumber);
  }, [tournament.rounds, selectedRoundNumber]);

  // Get matches for selected round
  const matches = selectedRound?.matches ?? [];

  // Find user's match in this round
  const userMatch = useMemo(() => {
    if (!userFplTeamId) return null;
    return matches.find(
      (match) =>
        match.player1?.fplTeamId === userFplTeamId ||
        match.player2?.fplTeamId === userFplTeamId
    );
  }, [matches, userFplTeamId]);

  // Everyone else = all matches except user's
  const otherMatches = useMemo(() => {
    if (!userMatch) return matches;
    return matches.filter((match) => match.id !== userMatch.id);
  }, [matches, userMatch]);

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
        {otherMatches.length > 0 ? (
          <div className="space-y-2">
            {otherMatches.map((match) => (
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
        ) : (
          <p className="text-sm text-muted-foreground">No matches in this round.</p>
        )}
      </section>
    </div>
  );
}
