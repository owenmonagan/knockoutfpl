import { useState, type FormEvent } from 'react';
import { getFPLTeamInfo, getFPLGameweekScore, getFPLTeamPicks, getFPLPlayers, getFPLLiveScores } from '../services/fpl';
import { calculateDifferentials, calculateCommonPlayers } from '../services/differentials';
import { DifferentialView } from './DifferentialView';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { InputGroup, InputGroupInput, InputGroupAddon } from './ui/input-group';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { ButtonGroup } from './ui/button-group';
import { Badge } from './ui/badge';
import { Spinner } from './ui/spinner';
import { Users, Calendar } from 'lucide-react';
import type { Differential, CommonPlayer } from '../services/differentials';

interface ComparisonResult {
  team1: { name: string; points: number };
  team2: { name: string; points: number };
  differentials?: Differential[];
  commonPlayers?: CommonPlayer[];
}

export function CompareTeams() {
  const [team1Id, setTeam1Id] = useState('');
  const [team2Id, setTeam2Id] = useState('');
  const [gameweek, setGameweek] = useState('');
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'simple' | 'detailed'>('simple');

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

      const basicResult: ComparisonResult = {
        team1: { name: team1Info.teamName, points: team1Score.points },
        team2: { name: team2Info.teamName, points: team2Score.points },
      };

      // If detailed view, fetch differential data
      if (viewMode === 'detailed') {
        const [team1Picks, team2Picks, playerMap, liveScores] = await Promise.all([
          getFPLTeamPicks(Number(team1Id), Number(gameweek)),
          getFPLTeamPicks(Number(team2Id), Number(gameweek)),
          getFPLPlayers(),
          getFPLLiveScores(Number(gameweek)),
        ]);

        const differentials = calculateDifferentials(
          team1Picks,
          team2Picks,
          playerMap,
          liveScores
        );

        const commonPlayers = calculateCommonPlayers(
          team1Picks,
          team2Picks,
          playerMap,
          liveScores
        );

        basicResult.differentials = differentials;
        basicResult.commonPlayers = commonPlayers;
      }

      setResult(basicResult);
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
          <InputGroup>
            <InputGroupAddon>
              <Users />
            </InputGroupAddon>
            <InputGroupInput
              id="team1"
              type="number"
              value={team1Id}
              onChange={(e) => setTeam1Id(e.target.value)}
            />
          </InputGroup>
          <Label htmlFor="team2">Team 2 ID</Label>
          <InputGroup>
            <InputGroupAddon>
              <Users />
            </InputGroupAddon>
            <InputGroupInput
              id="team2"
              type="number"
              value={team2Id}
              onChange={(e) => setTeam2Id(e.target.value)}
            />
          </InputGroup>
          <Label htmlFor="gameweek">Gameweek</Label>
          <InputGroup>
            <InputGroupAddon>
              <Calendar />
            </InputGroupAddon>
            <InputGroupInput
              id="gameweek"
              type="number"
              value={gameweek}
              onChange={(e) => setGameweek(e.target.value)}
            />
          </InputGroup>

          <div className="mt-4">
            <Label>View Mode</Label>
            <ButtonGroup>
              <Button
                type="button"
                variant={viewMode === 'simple' ? 'default' : 'outline'}
                onClick={() => setViewMode('simple')}
              >
                Simple
              </Button>
              <Button
                type="button"
                variant={viewMode === 'detailed' ? 'default' : 'outline'}
                onClick={() => setViewMode('detailed')}
              >
                Detailed
              </Button>
            </ButtonGroup>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <ButtonGroup>
          <Button type="submit" form="compare-form">Compare Teams</Button>
          <Button type="button" variant="outline" onClick={loadExample}>
            Try Example
          </Button>
        </ButtonGroup>
      </CardFooter>
      <CardContent>

        {isLoading && <Spinner />}

        {result && !isLoading && viewMode === 'simple' && (
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

        {result && !isLoading && viewMode === 'detailed' && result.differentials && (
          <DifferentialView
            differentials={result.differentials}
            commonPlayers={result.commonPlayers}
            teamAName={result.team1.name}
            teamBName={result.team2.name}
            teamAScore={result.team1.points}
            teamBScore={result.team2.points}
          />
        )}
      </CardContent>
    </Card>
  );
}
