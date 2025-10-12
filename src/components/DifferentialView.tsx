import { useState } from 'react';
import { createBattleMatchups, type Differential, type CommonPlayer } from '../services/differentials';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { BattleCard } from './BattleCard';

interface DifferentialViewProps {
  differentials: Differential[];
  commonPlayers?: CommonPlayer[];
  teamAName: string;
  teamBName: string;
  teamAScore: number;
  teamBScore: number;
  teamAChip?: string | null;
  teamBChip?: string | null;
}

function formatChipName(chip: string): string {
  const chipMap: Record<string, string> = {
    '3xc': '3xC',
    'bboost': 'BB',
    'freehit': 'FH',
    'wildcard': 'WC',
  };
  
  return chipMap[chip.toLowerCase()] || chip.toUpperCase();
}

export function DifferentialView({
  differentials,
  commonPlayers = [],
  teamAName,
  teamBName,
  teamAScore,
  teamBScore,
  teamAChip,
  teamBChip,
}: DifferentialViewProps) {
  const [isCommonOpen, setIsCommonOpen] = useState(false);

  // Create battle matchups
  const battles = createBattleMatchups(differentials);

  // Calculate global max points across all battles for relative progress bars
  const maxPointsGlobal = battles.reduce((max, battle) => {
    const pointsA = battle.playerA ? battle.playerA.points * battle.playerA.multiplier : 0;
    const pointsB = battle.playerB ? battle.playerB.points * battle.playerB.multiplier : 0;
    return Math.max(max, pointsA, pointsB);
  }, 1);

  // Group common players by position
  const commonByPosition: Record<string, CommonPlayer[]> = {
    GK: [],
    DEF: [],
    MID: [],
    FWD: [],
  };

  for (const player of commonPlayers) {
    commonByPosition[player.position].push(player);
  }

  // Calculate summary stats
  const totalDifferentials = differentials.length;
  const battlesWonA = battles.filter((b) => b.winner === 'A').length;
  const battlesWonB = battles.filter((b) => b.winner === 'B').length;
  const teamAAdvantage = differentials.reduce((sum, d) => sum + Math.max(0, d.pointDifference), 0);
  const teamBAdvantage = differentials.reduce((sum, d) => sum + Math.max(0, -d.pointDifference), 0);
  
  const biggestSwing = battles.length > 0 ? battles[0] : null;
  const closestBattle = battles.length > 0 
    ? battles.reduce((min, b) => b.swing < min.swing ? b : min, battles[0])
    : null;

  const winnerName = teamAScore > teamBScore ? teamAName : teamBName;
  const scoreDiff = Math.abs(teamAScore - teamBScore);

  // Common players stats
  const totalCommonPoints = commonPlayers.reduce((sum, p) => sum + p.totalPoints, 0);
  const bestCommonPlayer = commonPlayers.reduce(
    (max, p) => (p.totalPoints > (max?.totalPoints || 0) ? p : max),
    commonPlayers[0]
  );

  return (
    <div className="space-y-4">
      {/* Header Card with Match Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span>{teamAName}</span>
                {teamAChip && (
                  <Badge variant="secondary" className="text-xs">
                    {formatChipName(teamAChip)}
                  </Badge>
                )}
              </div>
              <span>vs</span>
              <div className="flex items-center gap-2">
                <span>{teamBName}</span>
                {teamBChip && (
                  <Badge variant="secondary" className="text-xs">
                    {formatChipName(teamBChip)}
                  </Badge>
                )}
              </div>
            </div>
            <div className="mt-1">Battle Results</div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center gap-4 text-lg font-semibold">
            <span className={teamAScore > teamBScore ? 'text-blue-600' : ''}>{teamAScore}</span>
            <span className="text-muted-foreground">-</span>
            <span className={teamBScore > teamAScore ? 'text-purple-600' : ''}>{teamBScore}</span>
          </div>
        </CardContent>
      </Card>

      {/* All Battle Cards - Ultra Condensed */}
      {battles.length > 0 && (
        <div className="space-y-1.5">
          {battles.map((battle, idx) => (
            <BattleCard
              key={idx}
              battle={battle}
              teamAName={teamAName}
              teamBName={teamBName}
              battleRank={idx + 1}
              maxPointsGlobal={maxPointsGlobal}
            />
          ))}
        </div>
      )}

      {/* Collapsible Common Players Section */}
      {commonPlayers.length > 0 && (
        <Collapsible open={isCommonOpen} onOpenChange={setIsCommonOpen}>
          <Card className="border-muted">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-muted-foreground">Common Players</CardTitle>
                    <Badge variant="secondary">{commonPlayers.length} players</Badge>
                    <span className="text-sm text-muted-foreground">• {totalCommonPoints} combined points</span>
                  </div>
                  {isCommonOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                {Object.entries(commonByPosition).map(([position, players]) => {
                  if (players.length === 0) return null;

                  return (
                    <div key={position}>
                      <Badge variant="outline" className="mb-2">
                        {position}
                      </Badge>
                      <div className="space-y-2">
                        {players.map((player, idx) => (
                          <div key={idx} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-muted-foreground">{player.player.web_name}</span>
                              {player.isCaptain && (
                                <Badge variant="outline" className="text-xs">C</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                {player.points} × {player.multiplier}
                              </span>
                              <span className="font-semibold text-muted-foreground">
                                {player.totalPoints} pts
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      {position !== 'FWD' && <Separator className="mt-4" />}
                    </div>
                  );
                })}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Battle Summary Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Battle Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Winner:</span>
            <span className="font-semibold">{winnerName} by {scoreDiff} points</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Battles Won:</span>
            <span className="font-semibold">
              <span className="text-blue-600">{teamAName}: {battlesWonA}</span>
              {' | '}
              <span className="text-purple-600">{teamBName}: {battlesWonB}</span>
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Battles:</span>
            <span className="font-semibold">{battles.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{teamAName} differential points:</span>
            <span className="font-semibold text-blue-600">+{teamAAdvantage}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{teamBName} differential points:</span>
            <span className="font-semibold text-purple-600">+{teamBAdvantage}</span>
          </div>
          {biggestSwing && (
            <div className="flex justify-between pt-2 border-t">
              <span className="text-muted-foreground">Biggest swing:</span>
              <span className="font-semibold">
                {biggestSwing.playerA?.player.web_name || biggestSwing.playerB?.player.web_name}{' '}
                ({biggestSwing.swing} pts)
              </span>
            </div>
          )}
          {closestBattle && closestBattle.swing > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Closest battle:</span>
              <span className="font-semibold">
                {closestBattle.playerA?.player.web_name || closestBattle.playerB?.player.web_name}{' '}
                ({closestBattle.swing} pts)
              </span>
            </div>
          )}
          {commonPlayers.length > 0 && (
            <>
              <Separator className="my-2" />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Common players:</span>
                <span className="font-semibold">{commonPlayers.length} players ({totalCommonPoints} pts)</span>
              </div>
              {bestCommonPlayer && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Best common player:</span>
                  <span className="font-semibold">
                    {bestCommonPlayer.player.web_name} ({bestCommonPlayer.totalPoints} pts)
                  </span>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
