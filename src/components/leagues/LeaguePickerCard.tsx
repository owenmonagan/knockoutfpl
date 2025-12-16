import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { FPLMiniLeague } from '../../services/fpl';

export interface LeaguePickerCardProps {
  league: FPLMiniLeague;
  memberCount: number;
  onStartKnockout: () => void;
  isLoading?: boolean;
}

export function LeaguePickerCard({ league, memberCount, onStartKnockout, isLoading }: LeaguePickerCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{league.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{memberCount} members</p>
          <p className="text-sm text-muted-foreground">You're ranked #{league.entryRank}</p>
        </div>
        <Button onClick={onStartKnockout} disabled={isLoading}>Start Knockout</Button>
      </CardContent>
    </Card>
  );
}
