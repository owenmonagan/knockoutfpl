import { useState, useEffect } from 'react';
import { Link, HelpCircle, ChevronDown, ArrowRight, Hash } from 'lucide-react';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../components/ui/collapsible';
import { getFPLTeamInfo, type FPLTeamInfo } from '../services/fpl';
import { useAuth } from '../contexts/AuthContext';
import { connectFPLTeam, getUserProfile } from '../services/user';

export function ConnectPage() {
  const { user } = useAuth();
  const [teamId, setTeamId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentTeam, setCurrentTeam] = useState<FPLTeamInfo | null>(null);
  const [isLoadingCurrentTeam, setIsLoadingCurrentTeam] = useState(true);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Fetch current team info if user has one (for editing)
  useEffect(() => {
    const fetchCurrentTeam = async () => {
      if (!user?.uid) {
        setIsLoadingCurrentTeam(false);
        return;
      }
      try {
        const profile = await getUserProfile(user.uid);
        if (profile && profile.fplTeamId && profile.fplTeamId !== 0) {
          const teamData = await getFPLTeamInfo(profile.fplTeamId);
          setCurrentTeam(teamData);
        }
      } catch {
        // Ignore errors - user may not have team yet
      } finally {
        setIsLoadingCurrentTeam(false);
      }
    };
    fetchCurrentTeam();
  }, [user?.uid]);

  const handleSubmit = async () => {
    if (!user?.uid || !user?.email) return;

    setIsLoading(true);
    setError('');
    try {
      const info = await getFPLTeamInfo(Number(teamId));
      await connectFPLTeam(user.uid, user.email, info.teamId);
      // Immediate redirect on success
      window.location.href = '/leagues';
    } catch {
      setError('Team not found. Check your ID and try again.');
      setIsLoading(false);
    }
  };

  const isChangingTeam = currentTeam !== null;

  // Show loading state while checking for existing team
  if (isLoadingCurrentTeam) {
    return (
      <main className="min-h-screen bg-fpl-bg flex items-center justify-center p-4">
        <p className="text-fpl-text-dim">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-fpl-bg flex items-center justify-center p-4">
      <div className="w-full max-w-[540px]">
        {/* Card */}
        <div className="bg-fpl-surface border border-fpl-surface-light rounded-xl shadow-2xl p-6 md:p-8 flex flex-col gap-8">
          {/* Hero / Icon */}
          <div className="flex flex-col items-center text-center gap-4">
            <div className="size-16 rounded-full bg-fpl-surface-light border border-[#395648] flex items-center justify-center shadow-inner relative group">
              <Link className="size-8 text-fpl-primary" />
              {/* Decorative glow */}
              <div className="absolute inset-0 bg-fpl-primary/20 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                {isChangingTeam ? 'Change Your FPL Team' : 'Connect Your FPL Team'}
              </h1>
              <p className="text-fpl-text-dim text-base max-w-[380px] mx-auto leading-relaxed">
                {isChangingTeam
                  ? 'Enter a new Team ID to switch teams.'
                  : 'Enter your unique FPL Team ID to sync your leagues and automatically generate your knockout brackets.'}
              </p>
            </div>
          </div>

          {/* Current Team Display (change mode only) */}
          {isChangingTeam && (
            <div className="bg-fpl-surface-light/50 border border-fpl-surface-light rounded-lg p-4 space-y-1">
              <p className="text-sm text-fpl-text-dim">Currently connected:</p>
              <p className="font-medium text-white">{currentTeam.teamName}</p>
              <p className="text-sm text-fpl-text-dim">
                Overall Rank: {currentTeam.overallRank?.toLocaleString()}
              </p>
            </div>
          )}

          {/* Input Form */}
          <div className="flex flex-col gap-6">
            {/* Input Field */}
            <div className="flex flex-col gap-2 w-full">
              <Label htmlFor="team-id" className="text-white text-sm font-semibold ml-1">
                {isChangingTeam ? 'New FPL Team ID' : 'FPL Team ID'}
              </Label>
              <div className="relative flex items-center">
                <Input
                  id="team-id"
                  type="text"
                  value={teamId}
                  onChange={(e) => {
                    setTeamId(e.target.value);
                    setError(''); // Clear error on input change
                  }}
                  placeholder="e.g. 582194"
                  className="w-full bg-fpl-bg border-fpl-surface-light text-white text-lg placeholder:text-fpl-surface-light rounded-lg h-14 pl-4 pr-12 focus:ring-2 focus:ring-fpl-primary focus:border-fpl-primary transition-all font-mono tracking-wide"
                />
                <div className="absolute right-4 text-fpl-text-dim pointer-events-none">
                  <Hash className="size-5" />
                </div>
              </div>
              {error && (
                <p className="text-sm text-destructive ml-1">{error}</p>
              )}
            </div>

            {/* Accordion Help */}
            <Collapsible open={isHelpOpen} onOpenChange={setIsHelpOpen}>
              <CollapsibleTrigger className="flex w-full cursor-pointer items-center justify-between p-4 bg-fpl-bg border border-fpl-surface-light rounded-lg hover:bg-fpl-surface-light/30 transition-colors">
                <div className="flex items-center gap-3">
                  <HelpCircle className="size-5 text-fpl-primary" />
                  <span className="text-white text-sm font-medium">Where do I find my Team ID?</span>
                </div>
                <ChevronDown className={`size-5 text-fpl-text-dim transition-transform ${isHelpOpen ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="bg-fpl-bg border border-t-0 border-fpl-surface-light rounded-b-lg px-4 pb-4 pt-4">
                <div className="flex flex-col gap-3">
                  <p className="text-fpl-text-dim text-sm leading-relaxed">
                    Log in to the official Fantasy Premier League website. Click on the <strong className="text-white">Points</strong> tab. Your ID is the number in the URL after <code className="bg-fpl-surface-light px-1 py-0.5 rounded text-fpl-primary font-mono text-xs">/entry/</code>.
                  </p>
                  <div className="rounded bg-[#0a0f0d] p-3 border border-fpl-surface-light/50 font-mono text-xs text-fpl-text-dim truncate">
                    <span className="opacity-50">https://fantasy.premierleague.com/entry/</span>
                    <span className="text-fpl-primary font-bold bg-fpl-primary/10 px-1 rounded">582194</span>
                    <span className="opacity-50">/event/1</span>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Submit Button */}
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !teamId.trim()}
              className="w-full h-12 bg-fpl-primary hover:bg-[#00e676] active:scale-[0.98] transition-all rounded-lg flex items-center justify-center gap-2 text-fpl-bg font-bold text-base shadow-[0_0_20px_rgba(0,255,136,0.15)] hover:shadow-[0_0_25px_rgba(0,255,136,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span>Connecting...</span>
              ) : isChangingTeam ? (
                <span>Switch to This Team</span>
              ) : (
                <>
                  <span>Connect & Continue</span>
                  <ArrowRight className="size-5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
