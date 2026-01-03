import { BracketLayout } from '../BracketLayout';
import { UserPathBracket } from '../UserPathBracket';
import type { Tournament } from '@/types/tournament';

interface BracketTabProps {
  tournament: Tournament;
  userFplTeamId?: number | null;
  isAuthenticated?: boolean;
  onClaimTeam?: (fplTeamId: number) => void;
}

export function BracketTab({
  tournament,
  userFplTeamId,
  isAuthenticated,
  onClaimTeam,
}: BracketTabProps) {
  if (tournament.rounds.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        Bracket will appear when the tournament starts.
      </p>
    );
  }

  // Use UserPathBracket for large tournaments (>64 participants)
  if (tournament.participants.length > 64) {
    return (
      <UserPathBracket
        tournament={tournament}
        userFplTeamId={userFplTeamId}
        isAuthenticated={isAuthenticated}
        currentGameweek={tournament.currentGameweek}
      />
    );
  }

  return (
    <BracketLayout
      rounds={tournament.rounds}
      participants={tournament.participants}
      currentGameweek={tournament.currentGameweek}
      isAuthenticated={isAuthenticated}
      onClaimTeam={onClaimTeam}
    />
  );
}
