// src/components/leagues/LeagueCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import type { FPLMiniLeague } from '../../services/fpl';

interface LeagueCardProps {
  league: FPLMiniLeague;
  onClick: () => void;
  hasTournament?: boolean;
  tournamentStatus?: 'active' | 'completed';
}

export function LeagueCard({
  league,
  onClick,
  hasTournament = false,
  tournamentStatus,
}: LeagueCardProps) {
  return (
    <Card
      role="article"
      className="cursor-pointer hover:bg-accent transition-colors"
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>{league.name}</span>
          {hasTournament && tournamentStatus && (
            <Badge variant={tournamentStatus === 'active' ? 'default' : 'secondary'}>
              {tournamentStatus === 'active' ? 'Tournament Active' : 'Tournament Complete'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Rank #{league.entryRank}</p>
      </CardContent>
    </Card>
  );
}
