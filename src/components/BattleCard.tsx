import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import type { Battle } from '../services/differentials';

interface BattleCardProps {
  battle: Battle;
  teamAName: string;
  teamBName: string;
  battleRank: number;
}

export function BattleCard({ battle, teamAName, teamBName, battleRank }: BattleCardProps) {
  const { playerA, playerB, swing, winner } = battle;

  const pointsA = playerA ? playerA.points * playerA.multiplier : 0;
  const pointsB = playerB ? playerB.points * playerB.multiplier : 0;
  const maxPoints = Math.max(pointsA, pointsB, 1);

  const progressA = (pointsA / maxPoints) * 100;
  const progressB = (pointsB / maxPoints) * 100;

  return (
    <Card className={`
      ${winner === 'A' ? 'border-l-4 border-l-blue-500' : ''}
      ${winner === 'B' ? 'border-r-4 border-r-purple-500' : ''}
      ${winner === 'draw' ? 'border-t-2 border-t-muted' : ''}
    `}>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
          <span>Battle #{battleRank}</span>
          <Badge variant={swing > 10 ? 'default' : 'secondary'}>
            {swing > 0 ? `+${swing} point swing` : 'Draw'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">

          <div className="space-y-2">
            {playerA ? (
              <>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{playerA.player.element_type === 1 ? 'GK' : playerA.player.element_type === 2 ? 'DEF' : playerA.player.element_type === 3 ? 'MID' : 'FWD'}</Badge>
                  <span className={`font-semibold ${winner === 'A' ? 'text-blue-600' : ''}`}>
                    {playerA.player.web_name}
                  </span>
                  {playerA.isCaptain && <Badge className="text-xs bg-blue-500">C</Badge>}
                </div>
                <div className="text-sm text-muted-foreground">
                  {playerA.points} × {playerA.multiplier} = {pointsA} pts
                </div>
                <Progress
                  value={progressA}
                  className={`h-2 ${winner === 'A' ? '[&>*]:bg-blue-500' : '[&>*]:bg-muted'}`}
                />
              </>
            ) : (
              <div className="text-sm text-muted-foreground italic">No differential</div>
            )}
          </div>

          <div className="flex flex-col items-center gap-1">
            <Separator orientation="vertical" className="h-12" />
            <span className="text-xs font-bold text-muted-foreground">VS</span>
            <Separator orientation="vertical" className="h-12" />
          </div>

          <div className="space-y-2">
            {playerB ? (
              <>
                <div className="flex items-center gap-2 justify-end">
                  {playerB.isCaptain && <Badge className="text-xs bg-purple-500">C</Badge>}
                  <span className={`font-semibold ${winner === 'B' ? 'text-purple-600' : ''}`}>
                    {playerB.player.web_name}
                  </span>
                  <Badge variant="outline" className="text-xs">{playerB.player.element_type === 1 ? 'GK' : playerB.player.element_type === 2 ? 'DEF' : playerB.player.element_type === 3 ? 'MID' : 'FWD'}</Badge>
                </div>
                <div className="text-sm text-muted-foreground text-right">
                  {pointsB} pts = {playerB.points} × {playerB.multiplier}
                </div>
                <Progress
                  value={progressB}
                  className={`h-2 ${winner === 'B' ? '[&>*]:bg-purple-500' : '[&>*]:bg-muted'}`}
                />
              </>
            ) : (
              <div className="text-sm text-muted-foreground italic text-right">No differential</div>
            )}
          </div>

        </div>

        <div className="mt-4 text-center">
          {winner === 'A' && (
            <Badge className="bg-blue-500">{teamAName} won this battle</Badge>
          )}
          {winner === 'B' && (
            <Badge className="bg-purple-500">{teamBName} won this battle</Badge>
          )}
          {winner === 'draw' && (
            <Badge variant="secondary">Draw</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
