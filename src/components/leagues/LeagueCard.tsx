// src/components/leagues/LeagueCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import type { FPLMiniLeague } from '../../services/fpl';

interface LeagueCardProps {
  league: FPLMiniLeague;
  hasTournament?: boolean;
  tournamentStatus?: 'active' | 'completed';
  onClick: () => void;
}

export function LeagueCard({
  league,
  hasTournament = false,
  tournamentStatus,
  onClick,
}: LeagueCardProps) {
  return (
    <Card
      role="article"
      onClick={onClick}
      className="cursor-pointer hover:bg-accent/5 transition-colors"
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{league.name}</CardTitle>
          {hasTournament && (
            <Badge variant={tournamentStatus === 'completed' ? 'secondary' : 'default'}>
              {tournamentStatus === 'completed' ? 'Tournament Complete' : 'Tournament Active'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Rank #{league.entryRank}</p>
      </CardContent>
    </Card>
  );
}
