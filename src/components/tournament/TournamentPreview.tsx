// src/components/tournament/TournamentPreview.tsx
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { calculateBracketPreview, getRoundName } from '../../lib/nWayBracket';

interface TournamentPreviewProps {
  managerCount: number;
  matchSize: number;
  startGameweek: number;
}

export function TournamentPreview({
  managerCount,
  matchSize,
  startGameweek,
}: TournamentPreviewProps) {
  const preview = calculateBracketPreview(managerCount, matchSize);

  if (preview.rounds === 0) {
    return null;
  }

  const matchLabel = matchSize === 2 ? 'match' : 'group';
  const matchesLabel = matchSize === 2 ? 'matches' : 'groups';

  return (
    <Card className="p-4 bg-secondary/50 border-dashed">
      {/* Info Summary */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge variant="outline">{preview.rounds} rounds</Badge>
        <Badge variant="outline">
          GW {startGameweek}-{startGameweek + preview.rounds - 1}
        </Badge>
        {preview.byeCount > 0 && (
          <Badge variant="secondary">{preview.byeCount} byes</Badge>
        )}
      </div>

      {/* Abbreviated Visual Bracket */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {preview.matchesPerRound.map((matchCount, index) => {
          const roundNum = index + 1;
          const roundName = getRoundName(roundNum, preview.rounds);
          const isLast = roundNum === preview.rounds;

          return (
            <div key={roundNum} className="flex items-center gap-2">
              <div className="flex flex-col items-center min-w-[70px]">
                <div className="text-xs text-muted-foreground mb-1">
                  {roundName}
                </div>
                <div className="bg-card border rounded-md px-3 py-2 text-center">
                  <div className="text-lg font-semibold">{matchCount}</div>
                  <div className="text-xs text-muted-foreground">
                    {matchCount === 1 ? matchLabel : matchesLabel}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  GW {startGameweek + index}
                </div>
              </div>
              {!isLast && <span className="text-muted-foreground">→</span>}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
