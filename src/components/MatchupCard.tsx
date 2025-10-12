import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import type { Matchup } from '../services/differentials';

interface MatchupCardProps {
  matchup: Matchup;
  teamAName: string;
  teamBName: string;
  matchupRank: number;
  maxSwing: number;
}

export function MatchupCard({ matchup, teamAName, teamBName, matchupRank, maxSwing }: MatchupCardProps) {
  const { playerA, playerB, swing, winner } = matchup;

  const pointsA = playerA ? playerA.points * playerA.multiplier : 0;
  const pointsB = playerB ? playerB.points * playerB.multiplier : 0;

  // Scale bars based on swing relative to max swing
  const scaleFactor = swing / maxSwing;
  const maxPointsInMatchup = Math.max(pointsA, pointsB, 1);
  
  const progressA = (pointsA / maxPointsInMatchup) * scaleFactor * 100;
  const progressB = (pointsB / maxPointsInMatchup) * scaleFactor * 100;

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
        {/* Header: Matchup number and swing */}
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-muted-foreground">Matchup #{matchupRank}</span>
          <Badge variant={swing > 10 ? 'default' : 'secondary'} className="text-xs h-5">
            {swing > 0 ? `+${swing}pt swing` : 'Draw'}
          </Badge>
        </div>

        {/* Matchup Layout */}
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
              </>
            ) : (
              <div className="text-xs text-muted-foreground italic text-right">No differential</div>
            )}
          </div>
        </div>

        {/* Center-aligned progress bars (population chart style) */}
        <div className="flex items-center gap-0 mt-1">
          {/* Left bar - grows from center to left */}
          <div className="flex-1 flex justify-end">
            {playerA && (
              <div 
                className={`h-1.5 rounded-l transition-all ${winner === 'A' ? 'bg-blue-500' : 'bg-muted'}`}
                style={{ width: `${progressA}%` }}
              />
            )}
          </div>
          
          {/* Center divider */}
          <div className="w-0.5 h-3 bg-border" />
          
          {/* Right bar - grows from center to right */}
          <div className="flex-1">
            {playerB && (
              <div 
                className={`h-1.5 rounded-r transition-all ${winner === 'B' ? 'bg-purple-500' : 'bg-muted'}`}
                style={{ width: `${progressB}%` }}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
