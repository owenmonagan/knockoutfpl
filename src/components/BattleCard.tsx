import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import type { Battle } from '../services/differentials';

interface BattleCardProps {
  battle: Battle;
  teamAName: string;
  teamBName: string;
  battleRank: number;
  maxPointsGlobal: number;
}

export function BattleCard({ battle, teamAName, teamBName, battleRank, maxPointsGlobal }: BattleCardProps) {
  const { playerA, playerB, swing, winner } = battle;

  const pointsA = playerA ? playerA.points * playerA.multiplier : 0;
  const pointsB = playerB ? playerB.points * playerB.multiplier : 0;

  const progressA = (pointsA / maxPointsGlobal) * 100;
  const progressB = (pointsB / maxPointsGlobal) * 100;

  const getPositionBadge = (elementType: number) => {
    switch(elementType) {
      case 1: return 'GK';
      case 2: return 'DEF';
      case 3: return 'MID';
      case 4: return 'FWD';
      default: return 'MID';
    }
  };

  return (
    <Card className={`
      ${winner === 'A' ? 'border-l-4 border-l-blue-500' : ''}
      ${winner === 'B' ? 'border-r-4 border-r-purple-500' : ''}
      ${winner === 'draw' ? 'border-t-2 border-t-muted' : ''}
    `}>
      <CardContent className="py-2 px-3">
        {/* Header: Battle number and swing */}
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-muted-foreground">Battle #{battleRank}</span>
          <Badge variant={swing > 10 ? 'default' : 'secondary'} className="text-xs h-5">
            {swing > 0 ? `+${swing}pt swing` : 'Draw'}
          </Badge>
        </div>

        {/* Battle Layout */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
          
          {/* Left Player (Team A) */}
          <div className="space-y-0.5">
            {playerA ? (
              <>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-[10px] h-4 px-1">{getPositionBadge(playerA.player.element_type)}</Badge>
                  <span className={`text-sm font-medium truncate ${winner === 'A' ? 'text-blue-600' : ''}`}>
                    {playerA.player.web_name}
                  </span>
                  {playerA.isCaptain && <Badge className="text-[10px] h-4 px-1 bg-blue-500">C</Badge>}
                </div>
                <div className="text-xs text-muted-foreground">
                  {playerA.points} × {playerA.multiplier} = <span className="font-semibold">{pointsA}pts</span>
                </div>
                <Progress
                  value={progressA}
                  className={`h-1.5 ${winner === 'A' ? '[&>*]:bg-blue-500' : '[&>*]:bg-muted'}`}
                />
              </>
            ) : (
              <div className="text-xs text-muted-foreground italic">No differential</div>
            )}
          </div>

          {/* VS Divider */}
          <div className="text-[10px] font-bold text-muted-foreground px-1">VS</div>

          {/* Right Player (Team B) */}
          <div className="space-y-0.5">
            {playerB ? (
              <>
                <div className="flex items-center gap-1 justify-end">
                  {playerB.isCaptain && <Badge className="text-[10px] h-4 px-1 bg-purple-500">C</Badge>}
                  <span className={`text-sm font-medium truncate ${winner === 'B' ? 'text-purple-600' : ''}`}>
                    {playerB.player.web_name}
                  </span>
                  <Badge variant="outline" className="text-[10px] h-4 px-1">{getPositionBadge(playerB.player.element_type)}</Badge>
                </div>
                <div className="text-xs text-muted-foreground text-right">
                  <span className="font-semibold">{pointsB}pts</span> = {playerB.points} × {playerB.multiplier}
                </div>
                <Progress
                  value={progressB}
                  className={`h-1.5 ${winner === 'B' ? '[&>*]:bg-purple-500' : '[&>*]:bg-muted'}`}
                />
              </>
            ) : (
              <div className="text-xs text-muted-foreground italic text-right">No differential</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
