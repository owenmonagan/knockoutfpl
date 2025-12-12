import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { getCurrentGameweek, getGameweekInfo } from '../services/fpl';
import { createChallenge } from '../services/challenge';
import { useAuth } from '../contexts/AuthContext';
import type { User } from '../types/user';
import { getUserProfile } from '../services/user';

export function CreateChallengePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [currentGameweek, setCurrentGameweek] = useState<number | null>(null);
  const [selectedGameweek, setSelectedGameweek] = useState<string>('');
  const [gameweekDeadline, setGameweekDeadline] = useState<Date | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);

  // Fetch user profile from Firestore
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.uid) return;
      const profile = await getUserProfile(user.uid);
      setUserData(profile);
    };
    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    const fetchGameweek = async () => {
      const gw = await getCurrentGameweek();
      setCurrentGameweek(gw);
    };
    fetchGameweek();
  }, []);

  // Fetch deadline when gameweek changes
  useEffect(() => {
    if (!selectedGameweek) {
      setGameweekDeadline(null);
      return;
    }

    const fetchDeadline = async () => {
      const gameweekNum = parseInt(selectedGameweek, 10);
      const gameweekInfo = await getGameweekInfo(gameweekNum);
      setGameweekDeadline(gameweekInfo.deadline);
    };

    fetchDeadline();
  }, [selectedGameweek]);

  const gameweekOptions = currentGameweek
    ? Array.from({ length: 38 - currentGameweek + 1 }, (_, i) => currentGameweek + i)
    : [];

  const handleCreateChallenge = async () => {
    if (!selectedGameweek || !userData) return;

    const gameweekNum = parseInt(selectedGameweek, 10);
    const gameweekInfo = await getGameweekInfo(gameweekNum);

    const id = await createChallenge({
      userId: user!.uid,
      fplTeamId: userData.fplTeamId,
      fplTeamName: userData.fplTeamName,
      gameweek: gameweekNum,
      gameweekDeadline: gameweekInfo.deadline,
    });

    setChallengeId(id);
  };

  // Check if user has FPL team connected (from Firestore, not Auth)
  const hasFplTeam = userData && userData.fplTeamId && userData.fplTeamId > 0;
  const isButtonDisabled = !hasFplTeam || !selectedGameweek;

  if (challengeId) {
    const challengeUrl = `${window.location.origin}/challenge/${challengeId}`;

    const handleCopyLink = async () => {
      try {
        await navigator.clipboard.writeText(challengeUrl);
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    };

    return (
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Challenge Created Successfully!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Shareable Link</Label>
              <p className="text-sm text-muted-foreground break-all mt-1">
                {challengeUrl}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCopyLink}>Copy Link</Button>
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main>
      <Card>
        <CardHeader>
          <CardTitle>Create Challenge</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gameweek">Select Gameweek</Label>
            <Select value={selectedGameweek} onValueChange={setSelectedGameweek}>
              <SelectTrigger id="gameweek">
                <SelectValue placeholder="Select a gameweek" />
              </SelectTrigger>
              <SelectContent>
                {gameweekOptions.map((gw) => (
                  <SelectItem key={gw} value={String(gw)}>
                    Gameweek {gw}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {gameweekDeadline && (
              <p className="text-sm text-muted-foreground mt-2">
                Deadline: {gameweekDeadline.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
          </div>
          <Button onClick={handleCreateChallenge} disabled={isButtonDisabled}>
            Create Challenge
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
