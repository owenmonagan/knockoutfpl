import { useState, type FormEvent } from 'react';
import { getFPLTeamInfo, getFPLGameweekScore, getFPLTeamPicks, getFPLPlayers, getFPLLiveScores } from '../services/fpl';
import { calculateDifferentials, calculateCommonPlayers } from '../services/differentials';
import { DifferentialView } from './DifferentialView';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { InputGroup, InputGroupInput, InputGroupAddon } from './ui/input-group';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Spinner } from './ui/spinner';
import { Users, Calendar } from 'lucide-react';
import type { Differential, CommonPlayer } from '../services/differentials';

interface ComparisonResult {
  team1: { name: string; points: number; activeChip?: string | null };
  team2: { name: string; points: number; activeChip?: string | null };
  differentials: Differential[];
  commonPlayers: CommonPlayer[];
}

export function CompareTeams() {
  const [team1Id, setTeam1Id] = useState('');
  const [team2Id, setTeam2Id] = useState('');
  const [gameweek, setGameweek] = useState('');
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const compareTeams = async (t1Id: string, t2Id: string, gw: string) => {
    setIsLoading(true);

    try {
      const [team1Info, team2Info, team1Score, team2Score, team1Picks, team2Picks, playerMap, liveScores] = await Promise.all([
        getFPLTeamInfo(Number(t1Id)),
        getFPLTeamInfo(Number(t2Id)),
        getFPLGameweekScore(Number(t1Id), Number(gw)),
        getFPLGameweekScore(Number(t2Id), Number(gw)),
        getFPLTeamPicks(Number(t1Id), Number(gw)),
        getFPLTeamPicks(Number(t2Id), Number(gw)),
        getFPLPlayers(),
        getFPLLiveScores(Number(gw)),
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

      setResult({
        team1: { 
          name: team1Info.teamName, 
          points: team1Score.points,
          activeChip: team1Picks.activeChip,
        },
        team2: { 
          name: team2Info.teamName, 
          points: team2Score.points,
          activeChip: team2Picks.activeChip,
        },
        differentials,
        commonPlayers,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await compareTeams(team1Id, team2Id, gameweek);
  };

  const loadExample = async () => {
    const exampleTeam1 = '158256';
    const exampleTeam2 = '71631';
    const exampleGameweek = '7';
    
    setTeam1Id(exampleTeam1);
    setTeam2Id(exampleTeam2);
    setGameweek(exampleGameweek);
    
    await compareTeams(exampleTeam1, exampleTeam2, exampleGameweek);
  };

  const loadRandomExample = async () => {
    const randomTeam1 = Math.floor(Math.random() * 1000000) + 1;
    let randomTeam2 = Math.floor(Math.random() * 1000000) + 1;

    // Ensure team2 is different from team1
    while (randomTeam2 === randomTeam1) {
      randomTeam2 = Math.floor(Math.random() * 1000000) + 1;
    }

    const randomGameweek = Math.floor(Math.random() * 7) + 1;

    const t1 = String(randomTeam1);
    const t2 = String(randomTeam2);
    const gw = String(randomGameweek);

    setTeam1Id(t1);
    setTeam2Id(t2);
    setGameweek(gw);
    
    await compareTeams(t1, t2, gw);
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
        </form>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button type="submit" form="compare-form">Compare Teams</Button>
        <Button type="button" variant="outline" onClick={loadExample}>
          Try Example
        </Button>
        <Button type="button" variant="outline" onClick={loadRandomExample}>
          Try Random
        </Button>
      </CardFooter>
      <CardContent>
        {isLoading && <Spinner />}

        {result && !isLoading && (
          <DifferentialView
            differentials={result.differentials}
            commonPlayers={result.commonPlayers}
            teamAName={result.team1.name}
            teamBName={result.team2.name}
            teamAScore={result.team1.points}
            teamBScore={result.team2.points}
            teamAChip={result.team1.activeChip}
            teamBChip={result.team2.activeChip}
          />
        )}
      </CardContent>
    </Card>
  );
}
