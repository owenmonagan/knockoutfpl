import { useState } from 'react';
import { createMatchups, type Differential, type CommonPlayer } from '../services/differentials';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { MatchupCard } from './MatchupCard';

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

  // Create matchups from differentials
  const matchups = createMatchups(differentials);

  // Calculate max swing across all matchups for relative progress bars
  const maxSwing = matchups.reduce((max, matchup) => Math.max(max, matchup.swing), 1);

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
  const matchupsWonA = matchups.filter((m) => m.winner === 'A').length;
  const matchupsWonB = matchups.filter((m) => m.winner === 'B').length;
  const teamAAdvantage = differentials.reduce((sum, d) => sum + Math.max(0, d.pointDifference), 0);
  const teamBAdvantage = differentials.reduce((sum, d) => sum + Math.max(0, -d.pointDifference), 0);
  
  const biggestSwing = matchups.length > 0 ? matchups[0] : null;
  const closestMatchup = matchups.length > 0 
    ? matchups.reduce((min, m) => m.swing < min.swing ? m : min, matchups[0])
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
            <div className="mt-1">Matchup Results</div>
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

      {/* All Matchup Cards - Ultra Condensed */}
      {matchups.length > 0 && (
        <div className="space-y-1.5">
          {matchups.map((matchup, idx) => (
            <MatchupCard
              key={idx}
              matchup={matchup}
              teamAName={teamAName}
              teamBName={teamBName}
              matchupRank={idx + 1}
              maxSwing={maxSwing}
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

      {/* Matchup Summary Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Matchup Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Winner:</span>
            <span className="font-semibold">{winnerName} by {scoreDiff} points</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Matchups Won:</span>
            <span className="font-semibold">
              <span className="text-blue-600">{teamAName}: {matchupsWonA}</span>
              {' | '}
              <span className="text-purple-600">{teamBName}: {matchupsWonB}</span>
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Matchups:</span>
            <span className="font-semibold">{matchups.length}</span>
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
          {closestMatchup && closestMatchup.swing > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Closest matchup:</span>
              <span className="font-semibold">
                {closestMatchup.playerA?.player.web_name || closestMatchup.playerB?.player.web_name}{' '}
                ({closestMatchup.swing} pts)
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
