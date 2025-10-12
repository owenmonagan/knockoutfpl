import { useState, FormEvent } from 'react';
import { getFPLTeamInfo, getFPLGameweekScore } from '../services/fpl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';

interface ComparisonResult {
  team1: { name: string; points: number };
  team2: { name: string; points: number };
}

export function CompareTeams() {
  const [team1Id, setTeam1Id] = useState('');
  const [team2Id, setTeam2Id] = useState('');
  const [gameweek, setGameweek] = useState('');
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const [team1Info, team2Info, team1Score, team2Score] = await Promise.all([
        getFPLTeamInfo(Number(team1Id)),
        getFPLTeamInfo(Number(team2Id)),
        getFPLGameweekScore(Number(team1Id), Number(gameweek)),
        getFPLGameweekScore(Number(team2Id), Number(gameweek)),
      ]);

      setResult({
        team1: { name: team1Info.teamName, points: team1Score.points },
        team2: { name: team2Info.teamName, points: team2Score.points },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadExample = () => {
    setTeam1Id('158256');
    setTeam2Id('71631');
    setGameweek('7');
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Compare Teams</CardTitle>
        <CardDescription>
          Enter two team IDs and a gameweek to compare their performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="team1">Team 1 ID</Label>
              <Input
                id="team1"
                type="number"
                placeholder="158256"
                value={team1Id}
                onChange={(e) => setTeam1Id(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team2">Team 2 ID</Label>
              <Input
                id="team2"
                type="number"
                placeholder="71631"
                value={team2Id}
                onChange={(e) => setTeam2Id(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="gameweek">Gameweek</Label>
            <Input
              id="gameweek"
              type="number"
              placeholder="7"
              value={gameweek}
              onChange={(e) => setGameweek(e.target.value)}
            />
          </div>
          <CardFooter className="px-0 pb-0">
            <div className="flex gap-2">
              <Button type="submit">Compare Teams</Button>
              <Button type="button" variant="outline" onClick={loadExample}>
                Try Example
              </Button>
            </div>
          </CardFooter>
        </form>

        {isLoading && (
          <div className="space-y-2 mt-6" role="status">
            <div className="sr-only">Loading...</div>
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-3/4" />
          </div>
        )}

        {result && !isLoading && (
          <div className="mt-6 p-6 border rounded-lg bg-muted/50">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-md bg-background">
                <span className="font-medium">{result.team1.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{result.team1.points}</span>
                  {result.team1.points > result.team2.points && (
                    <Badge className="bg-primary">Winner</Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-md bg-background">
                <span className="font-medium">{result.team2.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{result.team2.points}</span>
                  {result.team2.points > result.team1.points && (
                    <Badge className="bg-primary">Winner</Badge>
                  )}
                </div>
              </div>
              {result.team1.points === result.team2.points && (
                <div className="text-center py-2">
                  <Badge variant="secondary" className="text-base">Draw!</Badge>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
