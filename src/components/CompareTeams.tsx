import { useState, type FormEvent } from 'react';
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
    <Card>
      <CardHeader>
        <CardTitle>Compare Teams</CardTitle>
        <CardDescription>
          Enter two team IDs and a gameweek to compare their performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} id="compare-form">
          <Label htmlFor="team1">Team 1 ID</Label>
          <Input
            id="team1"
            type="number"
            value={team1Id}
            onChange={(e) => setTeam1Id(e.target.value)}
          />
          <Label htmlFor="team2">Team 2 ID</Label>
          <Input
            id="team2"
            type="number"
            value={team2Id}
            onChange={(e) => setTeam2Id(e.target.value)}
          />
          <Label htmlFor="gameweek">Gameweek</Label>
          <Input
            id="gameweek"
            type="number"
            value={gameweek}
            onChange={(e) => setGameweek(e.target.value)}
          />
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" form="compare-form">Compare Teams</Button>
        <Button type="button" variant="outline" onClick={loadExample}>
          Try Example
        </Button>
      </CardFooter>
      <CardContent>

        {isLoading && (
          <>
            <p>Loading...</p>
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </>
        )}

        {result && !isLoading && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>{result.team1.name}</CardTitle>
                <CardDescription>{result.team1.points} points</CardDescription>
              </CardHeader>
              {result.team1.points > result.team2.points && (
                <CardContent>
                  <Badge>Winner</Badge>
                </CardContent>
              )}
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{result.team2.name}</CardTitle>
                <CardDescription>{result.team2.points} points</CardDescription>
              </CardHeader>
              {result.team2.points > result.team1.points && (
                <CardContent>
                  <Badge>Winner</Badge>
                </CardContent>
              )}
            </Card>
            {result.team1.points === result.team2.points && (
              <Badge variant="secondary">Draw!</Badge>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
