import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart3 } from 'lucide-react';

export interface TournamentStatsProps {
  totalParticipants: number;
  remainingParticipants: number;
  currentRound: number;
  totalRounds: number;
  currentRoundName: string;
  currentGameweek: number;
  userSeed?: number;
  userStatus: 'in' | 'eliminated' | 'winner' | null;
  eliminatedRound?: number;
}

export function TournamentStats({
  totalParticipants,
  remainingParticipants,
  currentRound,
  totalRounds,
  currentRoundName,
  currentGameweek,
  userSeed,
  userStatus,
  eliminatedRound,
}: TournamentStatsProps) {
  // Progress shows tournament completion: 0% at start, 100% when champion crowned
  const progressPercent = ((totalParticipants - remainingParticipants) / (totalParticipants - 1)) * 100;
  const roundsRemaining = totalRounds - currentRound;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-4 w-4" />
          Tournament Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Teams Remaining */}
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-muted-foreground">Teams Left</span>
            <span className="font-bold">
              {remainingParticipants.toLocaleString()} / {totalParticipants.toLocaleString()}
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Current Round */}
        <div className="pt-2 border-t">
          <p className="text-sm text-muted-foreground mb-1">Current Round</p>
          <p className="font-bold">{currentRoundName}</p>
          <p className="text-sm text-muted-foreground">
            GW{currentGameweek} • {roundsRemaining} rounds remaining
          </p>
        </div>

        {/* Your Status */}
        {userStatus && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground mb-2">Your Status</p>
            <div className="grid grid-cols-2 gap-3">
              {/* Seed */}
              {userSeed && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-0.5">Seed</p>
                  <p className="font-bold">#{userSeed.toLocaleString()}</p>
                </div>
              )}

              {/* Status */}
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-0.5">Status</p>
                <div className="flex items-center gap-1.5">
                  {userStatus === 'in' && (
                    <>
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span className="font-bold">Active</span>
                    </>
                  )}
                  {userStatus === 'eliminated' && (
                    <span className="font-bold text-muted-foreground">
                      Eliminated R{eliminatedRound}
                    </span>
                  )}
                  {userStatus === 'winner' && (
                    <Badge variant="default" className="font-bold">
                      Champion
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
