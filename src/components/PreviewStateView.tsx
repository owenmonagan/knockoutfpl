import { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { CountdownTimer } from './CountdownTimer';
import { HeadToHeadPreview } from './HeadToHeadPreview';
import { DifferentialView } from './DifferentialView';
import { getFPLTeamPicks, getFPLPlayers, getFPLLiveScores, getFPLFixtures, type FPLFixture, type FPLPlayer } from '../services/fpl';
import { calculateDifferentials, type Differential } from '../services/differentials';

interface PreviewStateViewProps {
  gameweek: number;
  deadline: Timestamp;
  creatorFplId: number;
  creatorName: string;
  opponentFplId: number;
  opponentName: string;
  challengeId: string;
}

export function PreviewStateView({
  gameweek,
  deadline,
  creatorFplId,
  creatorName,
  opponentFplId,
  opponentName,
  challengeId,
}: PreviewStateViewProps) {
  const [previewDifferentials, setPreviewDifferentials] = useState<Differential[]>([]);
  const [previewCreatorScore, setPreviewCreatorScore] = useState<number>(0);
  const [previewOpponentScore, setPreviewOpponentScore] = useState<number>(0);
  const [previewFixtures, setPreviewFixtures] = useState<FPLFixture[]>([]);
  const [previewPlayers, setPreviewPlayers] = useState<Map<number, FPLPlayer>>(new Map());

  const handleShareChallenge = async () => {
    const challengeUrl = `${window.location.origin}/challenge/${challengeId}`;
    try {
      await navigator.clipboard.writeText(challengeUrl);
    } catch (error) {
      console.error('Failed to copy challenge URL:', error);
    }
  };

  useEffect(() => {
    const fetchMatchupPreviewData = async () => {
      try {
        const previousGameweek = gameweek - 1;
        const [liveScores, creatorData, opponentData, playersData, fixturesData] = await Promise.all([
          getFPLLiveScores(previousGameweek),
          getFPLTeamPicks(creatorFplId, previousGameweek),
          getFPLTeamPicks(opponentFplId, previousGameweek),
          getFPLPlayers(),
          getFPLFixtures(previousGameweek),
        ]);

        // Calculate differentials from the preview data
        const differentials = calculateDifferentials(creatorData, opponentData, playersData, liveScores);
        setPreviewDifferentials(differentials);

        // Set scores from entry history
        setPreviewCreatorScore(creatorData.entryHistory.points);
        setPreviewOpponentScore(opponentData.entryHistory.points);

        // Store fixtures and players for fixture status badges
        setPreviewFixtures(fixturesData);
        setPreviewPlayers(playersData);
      } catch (error) {
        console.error('Failed to fetch matchup preview data:', error);
      }
    };
    fetchMatchupPreviewData();
  }, [gameweek, creatorFplId, opponentFplId]);

  return (
    <>
    <Card data-testid="preview-card" className="bg-gradient-to-r from-cyan-400 to-purple-500">
      <CardHeader>
        <CardTitle>⚔️ {creatorName} vs {opponentName}</CardTitle>
        <CardDescription>Gameweek {gameweek} Showdown</CardDescription>
        <Badge>⏰ Starting Soon</Badge>
      </CardHeader>
      <CardContent>
        <div data-testid="preview-state-view">
          <h2>Gameweek {gameweek}</h2>
          <CountdownTimer deadline={deadline.toDate()} />
          <HeadToHeadPreview
            creatorFplId={creatorFplId}
            creatorName={creatorName}
            opponentFplId={opponentFplId}
            opponentName={opponentName}
            gameweek={gameweek}
          />
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={handleShareChallenge}>Share Challenge</Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <div className="flex justify-center my-4">
      <Badge variant="secondary" className="text-lg px-4 py-2">PREVIEW</Badge>
    </div>

    <DifferentialView
      differentials={previewDifferentials}
      commonPlayers={[]}
      teamAName={creatorName}
      teamBName={opponentName}
      teamAScore={previewCreatorScore}
      teamBScore={previewOpponentScore}
      teamAChip={null}
      teamBChip={null}
      fixtures={previewFixtures}
      allPlayers={previewPlayers}
    />
  </>
  );
}
