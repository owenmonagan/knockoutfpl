import { useState, useEffect } from 'react';
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
import { connectFPLTeam, getUserProfile } from '../services/user';

// Session storage key for persisting success state across remounts
const SUCCESS_STORAGE_KEY = 'connectPage_successTeamInfo';

// Module-level flag to prevent duplicate redirects across unmount/remount cycles
let redirectScheduled = false;

export function ConnectPage() {
  const { user } = useAuth();
  const [teamId, setTeamId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize teamInfo from sessionStorage to survive remounts
  const [teamInfo, setTeamInfo] = useState<FPLTeamInfo | null>(() => {
    try {
      const stored = sessionStorage.getItem(SUCCESS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore parse errors
    }
    return null;
  });

  // Check if user already has FPL team connected - redirect to /leagues if so
  useEffect(() => {
    const checkExistingConnection = async () => {
      if (!user?.uid) return;
      try {
        const profile = await getUserProfile(user.uid);
        if (profile && profile.fplTeamId && profile.fplTeamId !== 0) {
          window.location.href = '/leagues';
        }
      } catch {
        // Ignore errors - user may not have profile yet
      }
    };
    checkExistingConnection();
  }, [user?.uid]);

  const handleSubmit = async () => {
    if (!user?.uid || !user?.email) return;

    setIsLoading(true);
    setError('');
    try {
      const info = await getFPLTeamInfo(Number(teamId));
      await connectFPLTeam(user.uid, user.email, info.teamId);
      // Persist to sessionStorage so it survives component remounts
      sessionStorage.setItem(SUCCESS_STORAGE_KEY, JSON.stringify(info));
      setTeamInfo(info);
    } catch {
      setError('Team not found. Check your ID and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-redirect after success - uses module-level flag to survive unmount/remount cycles
  useEffect(() => {
    if (teamInfo && !redirectScheduled) {
      redirectScheduled = true;
      window.setTimeout(() => {
        sessionStorage.removeItem(SUCCESS_STORAGE_KEY);
        window.location.href = '/leagues';
      }, 1500);
      // No cleanup - we never want to cancel this redirect once scheduled
    }
  }, [teamInfo]);

  // Reset module flag when component unmounts after successful navigation
  useEffect(() => {
    return () => {
      // Only reset if we're leaving /connect (user manually navigated or redirect completed)
      if (window.location.pathname !== '/connect') {
        redirectScheduled = false;
      }
    };
  }, []);

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
