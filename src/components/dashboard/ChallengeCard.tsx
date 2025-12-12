import { useNavigate } from 'react-router-dom';
import type { Challenge } from '../../types/challenge';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface ChallengeCardProps {
  challenge: Challenge;
  currentUserId: string;
}

export function ChallengeCard({ challenge, currentUserId }: ChallengeCardProps) {
  const navigate = useNavigate();
  const isPending = challenge.status === 'pending';
  const isActive = challenge.status === 'accepted' || challenge.status === 'active';
  const isCompleted = challenge.status === 'completed';

  // Determine if current user won, lost, or drew
  const isWinner = isCompleted && challenge.winnerId === currentUserId;
  const isLoser = isCompleted && challenge.winnerId !== null && challenge.winnerId !== currentUserId;
  const isDraw = isCompleted && challenge.isDraw;

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click from triggering
    const link = `${window.location.origin}/challenge/${challenge.challengeId}`;
    navigator.clipboard.writeText(link);
  };

  const handleCardClick = () => {
    navigate(`/challenge/${challenge.challengeId}`);
  };

  return (
    <Card role="article" onClick={handleCardClick} className="cursor-pointer hover:bg-accent/5 transition-colors">
      <CardContent className="pt-6 space-y-2">
        <div className="flex justify-between items-center">
          <p className="font-semibold">Gameweek {challenge.gameweek}</p>
          {isPending && <Badge variant="outline">Pending</Badge>}
          {isActive && <Badge variant="secondary">Active</Badge>}
          {isCompleted && isWinner && <Badge className="bg-green-500">Won</Badge>}
          {isCompleted && isLoser && <Badge className="bg-red-500">Lost</Badge>}
          {isCompleted && isDraw && <Badge variant="secondary">Draw</Badge>}
        </div>
        {isPending && (
          <>
            <p className="text-sm text-muted-foreground">Waiting for opponent...</p>
            <Button variant="outline" size="sm" onClick={handleShare}>
              Share Challenge
            </Button>
          </>
        )}
        {isActive && (
          <>
            <p className="text-sm">vs {challenge.opponentFplTeamName}</p>
            <p className="text-xs text-muted-foreground">Awaiting gameweek results...</p>
          </>
        )}
        {isCompleted && (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{challenge.creatorUserId === currentUserId ? 'You' : challenge.creatorFplTeamName}</span>
              <span className="font-semibold">{challenge.creatorScore}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>{challenge.opponentUserId === currentUserId ? 'You' : challenge.opponentFplTeamName}</span>
              <span className="font-semibold">{challenge.opponentScore}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
