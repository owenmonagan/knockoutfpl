import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { getFPLTeamInfo, type FPLTeamInfo } from '../services/fpl';
import { useAuth } from '../contexts/AuthContext';
import { connectFPLTeam } from '../services/user';

export function ConnectPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [teamId, setTeamId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [teamInfo, setTeamInfo] = useState<FPLTeamInfo | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!user?.uid) return;

    setIsLoading(true);
    setError('');
    try {
      const info = await getFPLTeamInfo(Number(teamId));
      await connectFPLTeam(user.uid, info.teamId);
      setTeamInfo(info);
    } catch {
      setError('Team not found. Check your ID and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-redirect after success
  useEffect(() => {
    if (teamInfo) {
      const timer = setTimeout(() => {
        navigate('/leagues');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [teamInfo, navigate]);

  if (teamInfo) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <h2 className="text-xl font-bold">{teamInfo.teamName}</h2>
          <p className="text-muted-foreground">
            Overall Rank: {teamInfo.overallRank?.toLocaleString()}
          </p>
          <p className="text-lg font-medium">Let's go.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Connect Your FPL Team</h1>
          <p className="text-muted-foreground">Let's see what you're made of.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="team-id">FPL Team ID</Label>
          <Input
            id="team-id"
            type="text"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            placeholder="158256"
          />
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                className="text-sm text-muted-foreground underline hover:text-foreground"
              >
                Where's my Team ID?
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Finding Your Team ID</DialogTitle>
              </DialogHeader>
              <DialogDescription asChild>
                <div className="space-y-4">
                  <p>Your Team ID is in the FPL URL:</p>
                  <code className="block bg-muted p-2 rounded text-sm">
                    fantasy.premierleague.com/entry/<strong>[THIS NUMBER]</strong>/event/1
                  </code>
                  <p>Or in the FPL app: Team → Team Details → Your Team ID</p>
                </div>
              </DialogDescription>
            </DialogContent>
          </Dialog>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <Button
          type="button"
          className="w-full"
          size="lg"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? 'Finding your team...' : 'Find My Team'}
        </Button>
      </div>
    </main>
  );
}
