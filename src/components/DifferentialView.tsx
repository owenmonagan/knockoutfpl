import type { Differential } from '../services/differentials';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface DifferentialViewProps {
  differentials: Differential[];
  teamAName: string;
  teamBName: string;
  teamAScore: number;
  teamBScore: number;
}

export function DifferentialView({
  differentials,
  teamAName,
  teamBName,
  teamAScore,
  teamBScore,
}: DifferentialViewProps) {
  // Group differentials by position
  const byPosition: Record<string, Differential[]> = {
    GK: [],
    DEF: [],
    MID: [],
    FWD: [],
  };

  for (const diff of differentials) {
    byPosition[diff.position].push(diff);
  }

  // Calculate summary stats
  const totalDifferentials = differentials.length;
  const teamAAdvantage = differentials.reduce((sum, d) => sum + Math.max(0, d.pointDifference), 0);
  const teamBAdvantage = differentials.reduce((sum, d) => sum + Math.max(0, -d.pointDifference), 0);
  const biggestDiff = differentials.reduce(
    (max, d) => (Math.abs(d.pointDifference) > Math.abs(max.pointDifference) ? d : max),
    differentials[0]
  );

  const winnerName = teamAScore > teamBScore ? teamAName : teamBName;
  const scoreDiff = Math.abs(teamAScore - teamBScore);

  return (
    <div className="space-y-4">
      {/* Header Card with Match Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">
            {teamAName} vs {teamBName} - Gameweek Differentials
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center gap-4 text-lg font-semibold">
            <span className={teamAScore > teamBScore ? 'text-green-600' : ''}>{teamAScore}</span>
            <span className="text-muted-foreground">-</span>
            <span className={teamBScore > teamAScore ? 'text-green-600' : ''}>{teamBScore}</span>
          </div>
        </CardContent>
      </Card>

      {/* Split-screen differential layout */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Team A Panel */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="text-blue-600">{teamAName} Differentials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(byPosition).map(([position, diffs]) => {
              const teamADiffs = diffs.filter((d) => d.teamA !== null);
              if (teamADiffs.length === 0) return null;

              return (
                <div key={position}>
                  <Badge variant="secondary" className="mb-2">
                    {position}
                  </Badge>
                  <div className="space-y-2">
                    {teamADiffs.map((diff, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{diff.teamA!.player.web_name}</span>
                          {diff.teamA!.isCaptain && (
                            <Badge className="text-xs">C</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {diff.teamA!.points} × {diff.teamA!.multiplier}
                          </span>
                          <span className="font-semibold">
                            {diff.teamA!.points * diff.teamA!.multiplier} pts
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator className="mt-4" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Team B Panel */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="text-purple-600">{teamBName} Differentials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(byPosition).map(([position, diffs]) => {
              const teamBDiffs = diffs.filter((d) => d.teamB !== null);
              if (teamBDiffs.length === 0) return null;

              return (
                <div key={position}>
                  <Badge variant="secondary" className="mb-2">
                    {position}
                  </Badge>
                  <div className="space-y-2">
                    {teamBDiffs.map((diff, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{diff.teamB!.player.web_name}</span>
                          {diff.teamB!.isCaptain && (
                            <Badge className="text-xs">C</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {diff.teamB!.points} × {diff.teamB!.multiplier}
                          </span>
                          <span className="font-semibold">
                            {diff.teamB!.points * diff.teamB!.multiplier} pts
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator className="mt-4" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Summary Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Differential Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Winner:</span>
            <span className="font-semibold">{winnerName} by {scoreDiff} points</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Differentials:</span>
            <span className="font-semibold">{totalDifferentials} players</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{teamAName} differential points:</span>
            <span className="font-semibold text-blue-600">+{teamAAdvantage}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{teamBName} differential points:</span>
            <span className="font-semibold text-purple-600">+{teamBAdvantage}</span>
          </div>
          {biggestDiff && (
            <div className="flex justify-between pt-2 border-t">
              <span className="text-muted-foreground">Biggest swing:</span>
              <span className="font-semibold">
                {biggestDiff.teamA?.player.web_name || biggestDiff.teamB?.player.web_name}{' '}
                ({Math.abs(biggestDiff.pointDifference)} pts)
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
