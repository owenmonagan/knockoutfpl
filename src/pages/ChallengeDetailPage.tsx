import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getChallenge, acceptChallenge } from '../services/challenge';
import { getUserProfile } from '../services/user';
import { getFPLTeamInfo, getFPLTeamPicks, getFPLPlayers, getFPLLiveScores, getFPLFixtures, type FPLFixture } from '../services/fpl';
import { calculateDifferentials, calculateCommonPlayers } from '../services/differentials';
import { DifferentialView } from '../components/DifferentialView';
import { PreviewStateView } from '../components/PreviewStateView';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import type { Challenge } from '../types/challenge';
import type { User } from '../types/user';
import type { Differential, CommonPlayer } from '../services/differentials';

export function ChallengeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Live challenge data state
  const [differentials, setDifferentials] = useState<Differential[]>([]);
  const [commonPlayers, setCommonPlayers] = useState<CommonPlayer[]>([]);
  const [teamAScore, setTeamAScore] = useState(0);
  const [teamBScore, setTeamBScore] = useState(0);
  const [teamAChip, setTeamAChip] = useState<string | null>(null);
  const [teamBChip, setTeamBChip] = useState<string | null>(null);
  const [fixtures, setFixtures] = useState<FPLFixture[]>([]);
  const [allPlayers, setAllPlayers] = useState<Map<number, FPLPlayer>>(new Map());

  useEffect(() => {
    const fetchChallenge = async () => {
      if (!id) return;

      setIsLoading(true);
      const data = await getChallenge(id);
      setChallenge(data);
      setIsLoading(false);
    };

    fetchChallenge();
  }, [id]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!authUser?.uid) return;
      const profile = await getUserProfile(authUser.uid);
      setUserData(profile);
    };

    fetchUserData();
  }, [authUser]);

  // Fetch live challenge data when gameweek has started
  useEffect(() => {
    const fetchLiveData = async () => {
      if (!challenge) return;

      // Check if gameweek has started
      const now = new Date();
      const deadline = challenge.gameweekDeadline?.toDate();
      const isExpired = deadline && deadline < now;
      const isAccepted = challenge.status === 'accepted' || challenge.status === 'active';
      const isGameweekStarted = isAccepted && isExpired;
      const isCompletedStatus = challenge.status === 'completed';

      if (!isGameweekStarted && !isCompletedStatus) return;

      try {
        // Fetch team picks for both teams
        const [teamAPicks, teamBPicks, allPlayers, liveScores, fixtures] = await Promise.all([
          getFPLTeamPicks(challenge.creatorFplId, challenge.gameweek),
          getFPLTeamPicks(challenge.opponentFplId!, challenge.gameweek),
          getFPLPlayers(),
          getFPLLiveScores(challenge.gameweek),
          getFPLFixtures(challenge.gameweek),
        ]);

        // Calculate differentials and common players
        const diffs = calculateDifferentials(teamAPicks, teamBPicks, allPlayers, liveScores);
        const common = calculateCommonPlayers(teamAPicks, teamBPicks, allPlayers, liveScores);

        // Calculate total scores
        const scoreA = teamAPicks.picks.reduce((sum, pick) => {
          const playerScore = liveScores.get(pick.element) || 0;
          return sum + (playerScore * pick.multiplier);
        }, 0);
        const scoreB = teamBPicks.picks.reduce((sum, pick) => {
          const playerScore = liveScores.get(pick.element) || 0;
          return sum + (playerScore * pick.multiplier);
        }, 0);

        // Update state
        setDifferentials(diffs);
        setCommonPlayers(common);
        setTeamAScore(scoreA);
        setTeamBScore(scoreB);
        setTeamAChip(teamAPicks.activeChip);
        setTeamBChip(teamBPicks.activeChip);
        setFixtures(fixtures);
        setAllPlayers(allPlayers);
      } catch (error) {
        console.error('Error fetching live challenge data:', error);
      }
    };

    fetchLiveData();
  }, [challenge]);

  const handleAcceptChallenge = async () => {
    if (!challenge || !authUser || !userData) return;

    try {
      setError(null);
      // Validate FPL team before accepting (FR-6.4)
      await getFPLTeamInfo(userData.fplTeamId);

      await acceptChallenge(
        challenge.challengeId,
        authUser.uid,
        userData.fplTeamId,
        userData.fplTeamName
      );
    } catch (err) {
      setError('Unable to validate your FPL team. Please check your team ID and try again.');
    }
  };

  if (isLoading) {
    return (
      <main>
        <div>Loading...</div>
      </main>
    );
  }

  if (!challenge) {
    return (
      <main>
        <div>Challenge not found</div>
      </main>
    );
  }

  // Format deadline if it exists
  const formattedDeadline = challenge.gameweekDeadline
    ? challenge.gameweekDeadline.toDate().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Deadline not available';

  const isCreator = authUser?.uid === challenge.creatorUserId;
  const isPending = challenge.status === 'pending';
  const isAccepted = challenge.status === 'accepted' || challenge.status === 'active';
  const isCompleted = challenge.status === 'completed';

  // Check if deadline has passed
  const now = new Date();
  const deadline = challenge.gameweekDeadline?.toDate();
  const isExpired = deadline && deadline < now;

  // Check if gameweek has started (deadline passed and challenge accepted)
  const isGameweekStarted = isAccepted && isExpired;

  // Check if user has FPL team connected
  const hasFplTeam = userData && userData.fplTeamId && userData.fplTeamId > 0;

  const handleSignUpToAccept = () => {
    const returnUrl = `/challenge/${challenge.challengeId}`;
    navigate(`/signup?returnUrl=${encodeURIComponent(returnUrl)}`);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Challenge for Gameweek {challenge.gameweek}</CardTitle>
            {isGameweekStarted && !challenge.gameweekFinished && (
              <Badge variant="destructive">🔴 LIVE</Badge>
            )}
            {isCompleted && (
              <Badge variant="default">✓ FINAL</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPending && (
            <>
              <p>{challenge.creatorFplTeamName} challenges you!</p>
              <p>Deadline: {formattedDeadline}</p>
              {error && (
                <p className="text-destructive text-sm">{error}</p>
              )}
              {isExpired ? (
                <p className="text-destructive font-semibold">Challenge Expired</p>
              ) : !isCreator && !authUser ? (
                <Button onClick={handleSignUpToAccept}>Sign Up to Accept</Button>
              ) : !isCreator && !hasFplTeam && authUser ? (
                <p className="text-muted-foreground">
                  Please connect your FPL team to accept this challenge.
                </p>
              ) : (
                !isCreator && hasFplTeam && <Button onClick={handleAcceptChallenge}>Accept Challenge</Button>
              )}
            </>
          )}

          {isAccepted && !isGameweekStarted && challenge.gameweekDeadline && (
            <PreviewStateView
              gameweek={challenge.gameweek}
              deadline={challenge.gameweekDeadline}
              creatorFplId={challenge.creatorFplId}
              creatorName={challenge.creatorFplTeamName || 'Creator'}
              opponentFplId={challenge.opponentFplId || 0}
              opponentName={challenge.opponentFplTeamName || 'Opponent'}
              challengeId={challenge.challengeId}
            />
          )}

          {(isGameweekStarted || isCompleted) && (
            <DifferentialView
              differentials={differentials}
              commonPlayers={commonPlayers}
              teamAName={challenge.creatorFplTeamName || ''}
              teamBName={challenge.opponentFplTeamName || ''}
              teamAScore={teamAScore}
              teamBScore={teamBScore}
              teamAChip={teamAChip}
              teamBChip={teamBChip}
              fixtures={fixtures}
              allPlayers={allPlayers}
            />
          )}
        </CardContent>
      </Card>
    </main>
  );
}
