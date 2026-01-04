// src/components/tournament/TournamentView.tsx
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShareTournamentDialog } from './ShareTournamentDialog';
import { TeamSearchOverlay } from './TeamSearchOverlay';
import { YourMatchesSection } from '@/components/dashboard/YourMatchesSection';
import { OverviewTab, MatchesTab, ParticipantsTab, BracketTab } from './tabs';
import { useTournamentFriends } from '@/hooks/useTournamentFriends';
import type { Participant, Tournament } from '@/types/tournament';
import { getEntryId, getMatchPlayers } from '@/types/tournament';
import type { MatchSummaryCardProps } from '@/components/dashboard/MatchSummaryCard';

interface TournamentViewProps {
  tournament: Tournament;
  isRefreshing?: boolean;
  isAuthenticated?: boolean;
  userFplTeamId?: number | null;
  onClaimTeam?: (fplTeamId: number) => void;
}

/**
 * Builds match cards for a specific team from tournament data.
 * Shows the team's journey through the tournament.
 */
function buildMatchesForTeam(
  tournament: Tournament,
  fplTeamId: number
): MatchSummaryCardProps[] {
  const participantMap = new Map<number, Participant>(
    tournament.participants.map((p) => [getEntryId(p), p])
  );

  const yourParticipant = participantMap.get(fplTeamId);
  if (!yourParticipant) return [];

  const matches: MatchSummaryCardProps[] = [];

  for (const round of tournament.rounds) {
    for (const match of round.matches) {
      const players = getMatchPlayers(match);
      const yourPlayer = players.find((p) => p.fplTeamId === fplTeamId);

      if (!yourPlayer) continue;

      // Find opponent(s) - for 1v1, there's just one
      const opponents = players.filter((p) => p.fplTeamId !== fplTeamId);
      const opponent = opponents[0]; // For now, assume 1v1

      const opponentParticipant = opponent
        ? participantMap.get(opponent.fplTeamId)
        : null;

      // Determine match type and result
      const roundStarted = round.gameweek <= tournament.currentGameweek;
      const hasScores =
        yourPlayer.score !== null &&
        (!opponent || opponent.score !== null);
      const isComplete = round.isComplete && hasScores;
      const tournamentComplete = tournament.status === 'completed';

      let matchType: 'live' | 'upcoming' | 'finished';
      let result: 'won' | 'lost' | undefined;

      if (isComplete || tournamentComplete) {
        matchType = 'finished';
        if (match.winnerId) {
          result = match.winnerId === fplTeamId ? 'won' : 'lost';
        } else if (hasScores) {
          // Infer from scores if winnerId missing
          const yourScore = yourPlayer.score ?? 0;
          const oppScore = opponent?.score ?? 0;
          if (yourScore !== oppScore) {
            result = yourScore > oppScore ? 'won' : 'lost';
          }
        }
      } else if (roundStarted && !round.isComplete) {
        matchType = 'live';
      } else {
        matchType = 'upcoming';
      }

      matches.push({
        type: matchType,
        yourTeamName: yourParticipant.fplTeamName,
        yourFplTeamId: fplTeamId,
        opponentTeamName: opponentParticipant?.fplTeamName,
        opponentFplTeamId: opponent?.fplTeamId,
        leagueName: tournament.fplLeagueName,
        roundName: round.name,
        yourScore: yourPlayer.score,
        theirScore: opponent?.score ?? null,
        gameweek: round.gameweek,
        result,
      });
    }
  }

  // Sort by round (ascending - earliest round first)
  return matches.sort((a, b) => (a.gameweek ?? 0) - (b.gameweek ?? 0));
}

type TabValue = 'overview' | 'matches' | 'participants' | 'bracket';

const TAB_OPTIONS: { value: TabValue; label: string }[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'matches', label: 'Matches' },
  { value: 'participants', label: 'Participants' },
  { value: 'bracket', label: 'Bracket' },
];

export function TournamentView({
  tournament,
  isRefreshing = false,
  isAuthenticated,
  userFplTeamId,
  onClaimTeam,
}: TournamentViewProps) {
  // URL-synced tab state
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const currentTab: TabValue =
    TAB_OPTIONS.some((t) => t.value === rawTab) ? (rawTab as TabValue) : 'overview';

  const handleTabChange = useCallback(
    (value: string) => {
      setSearchParams({ tab: value }, { replace: true });
    },
    [setSearchParams]
  );

  // Animation timing constants
  const FADE_ANIMATION_DURATION_MS = 200;
  const CTA_SLIDE_IN_DELAY_MS = 100;

  // State for share dialog
  const [showShareDialog, setShowShareDialog] = useState(false);

  // Get current round for share dialog
  const currentRound = tournament.rounds.find(
    (r) => r.roundNumber === tournament.currentRound
  );

  // Check if the authenticated user is a participant in this tournament
  const userIsParticipant = useMemo(() => {
    if (!isAuthenticated || !userFplTeamId) return false;
    return tournament.participants.some((p) => getEntryId(p) === userFplTeamId);
  }, [isAuthenticated, userFplTeamId, tournament.participants]);

  // State for previewed team (unauthenticated users only)
  const [previewedTeamId, setPreviewedTeamId] = useState<number | null>(null);
  const [showSearch, setShowSearch] = useState(!isAuthenticated && !userIsParticipant);
  // Track overlay visibility for fade animation (separate from mount state)
  const [overlayVisible, setOverlayVisible] = useState(!isAuthenticated && !userIsParticipant);
  const [overlayMounted, setOverlayMounted] = useState(!isAuthenticated && !userIsParticipant);
  // Track CTA visibility for slide-in animation
  const [ctaVisible, setCtaVisible] = useState(false);

  // Reset state when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setShowSearch(false);
      setOverlayVisible(false);
      setOverlayMounted(false);
      setPreviewedTeamId(null);
      setCtaVisible(false);
    }
  }, [isAuthenticated]);

  // Build matches for the previewed team (unauthenticated flow)
  const previewedMatches = useMemo(() => {
    if (!previewedTeamId) return [];
    return buildMatchesForTeam(tournament, previewedTeamId);
  }, [tournament, previewedTeamId]);

  // Get the previewed participant for displaying info
  const previewedParticipant = useMemo(() => {
    if (!previewedTeamId) return null;
    return tournament.participants.find(
      (p) => getEntryId(p) === previewedTeamId
    );
  }, [tournament.participants, previewedTeamId]);

  // Check if any previewed match is live
  const hasLivePreviewMatch = useMemo(() => {
    return previewedMatches.some((m) => m.type === 'live');
  }, [previewedMatches]);

  // Build matches for authenticated user (if they're a participant)
  const userMatches = useMemo(() => {
    if (!userIsParticipant || !userFplTeamId) return [];
    return buildMatchesForTeam(tournament, userFplTeamId);
  }, [tournament, userIsParticipant, userFplTeamId]);

  // Get the authenticated user's participant info
  const userParticipant = useMemo(() => {
    if (!userIsParticipant || !userFplTeamId) return null;
    return tournament.participants.find(
      (p) => getEntryId(p) === userFplTeamId
    );
  }, [tournament.participants, userIsParticipant, userFplTeamId]);

  // Fetch friends for the tournament
  const { friends, friendIds, isLoading: friendsLoading } = useTournamentFriends({
    tournamentId: tournament.id,
    tournamentLeagueId: tournament.fplLeagueId,
    userFplTeamId: userFplTeamId ?? null,
    participants: tournament.participants,
    enabled: !!userFplTeamId,
  });

  // Handle overlay fade animation
  useEffect(() => {
    let rafId: number;
    let timerId: ReturnType<typeof setTimeout>;

    if (showSearch) {
      // Show: mount first, then fade in
      setOverlayMounted(true);
      // Small delay to ensure mount happens before opacity transition
      rafId = requestAnimationFrame(() => {
        setOverlayVisible(true);
      });
    } else {
      // Hide: fade out first, then unmount
      setOverlayVisible(false);
      timerId = setTimeout(() => {
        setOverlayMounted(false);
      }, FADE_ANIMATION_DURATION_MS);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (timerId) clearTimeout(timerId);
    };
  }, [showSearch, FADE_ANIMATION_DURATION_MS]);

  // Handle CTA slide-in animation when team is selected
  useEffect(() => {
    if (previewedTeamId && !showSearch) {
      // Small delay before starting slide-in animation
      const timer = setTimeout(() => {
        setCtaVisible(true);
      }, CTA_SLIDE_IN_DELAY_MS);
      return () => clearTimeout(timer);
    } else {
      setCtaVisible(false);
    }
  }, [previewedTeamId, showSearch, CTA_SLIDE_IN_DELAY_MS]);

  const handleTeamConfirm = useCallback((fplTeamId: number) => {
    setPreviewedTeamId(fplTeamId);
    setShowSearch(false);
  }, []);

  const handleSearchClose = useCallback(() => {
    setShowSearch(false);
  }, []);

  const handleChangeTeam = useCallback(() => {
    setShowSearch(true);
  }, []);

  const handleSignupClick = useCallback(() => {
    if (previewedTeamId && onClaimTeam) {
      onClaimTeam(previewedTeamId);
    }
  }, [previewedTeamId, onClaimTeam]);

  return (
    <div className="space-y-6">
      {/* Tournament Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{tournament.fplLeagueName}</CardTitle>
            <div className="flex items-center gap-2">
              {isRefreshing && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Spinner className="size-3" />
                  <span>Updating...</span>
                </div>
              )}
              <Badge variant={tournament.status === 'completed' ? 'secondary' : 'default'}>
                {tournament.status === 'completed' ? 'Completed' : 'Active'}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowShareDialog(true)}
                aria-label="Share tournament"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Starting Gameweek {tournament.startGameweek} • {tournament.totalRounds} rounds
          </p>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          {TAB_OPTIONS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Find Your Team Section - FIRST for unauthenticated users */}
          {!isAuthenticated && tournament.rounds.length > 0 && (
            <>
              {/* Team Search (renders as its own Card) */}
              {overlayMounted && (
                <div
                  className={`transition-opacity duration-200 ${
                    overlayVisible ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <TeamSearchOverlay
                    participants={tournament.participants}
                    onConfirm={handleTeamConfirm}
                    onClose={handleSearchClose}
                  />
                </div>
              )}

              {/* Your Matches Section - shown after team is selected */}
              {previewedTeamId && !showSearch && (
                <Card>
                  <CardContent className="pt-6">
                    {/* Selected Team Header */}
                    {previewedParticipant && (
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            Viewing as
                          </span>
                          <span className="font-medium">
                            {previewedParticipant.fplTeamName}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleChangeTeam}
                        >
                          Change team
                        </Button>
                      </div>
                    )}

                    {/* Your Matches Section */}
                    <YourMatchesSection
                      matches={previewedMatches}
                      currentGameweek={tournament.currentGameweek}
                      isLive={hasLivePreviewMatch}
                    />
                  </CardContent>

                  {/* Signup CTA with slide-in animation */}
                  {onClaimTeam && (
                    <div
                      className={`border-t bg-muted/30 px-6 py-4 transition-all duration-300 ease-out ${
                        ctaVisible
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-0 translate-y-4'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-muted-foreground text-center sm:text-left">
                          Sign up to get notified when results are in
                        </p>
                        <Button onClick={handleSignupClick}>
                          Sign up and claim team
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              )}

              {/* Placeholder when search closed without selecting team */}
              {!previewedTeamId && !showSearch && (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground mb-4">
                      Select your team to see your matches
                    </p>
                    <Button variant="outline" onClick={handleChangeTeam}>
                      Find your team
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Overview Tab - full layout with cards */}
          <OverviewTab
            tournament={tournament}
            userFplTeamId={userFplTeamId}
            userParticipant={userParticipant}
            userMatches={userMatches}
            friends={friends}
            friendsLoading={friendsLoading}
          />
        </TabsContent>

        <TabsContent value="matches" className="mt-6">
          <MatchesTab
            tournament={tournament}
            participants={tournament.participants}
            userFplTeamId={userFplTeamId ?? undefined}
            isAuthenticated={isAuthenticated}
            onClaimTeam={onClaimTeam}
          />
        </TabsContent>

        <TabsContent value="participants" className="mt-6">
          <ParticipantsTab
            participants={tournament.participants}
            seedingGameweek={tournament.startGameweek - 1}
            friendIds={friendIds}
          />
        </TabsContent>

        <TabsContent value="bracket" className="mt-6">
          <BracketTab
            tournament={tournament}
            userFplTeamId={userFplTeamId}
            isAuthenticated={isAuthenticated}
            onClaimTeam={onClaimTeam}
          />
        </TabsContent>
      </Tabs>

      {/* Share Tournament Dialog */}
      <ShareTournamentDialog
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        leagueId={tournament.fplLeagueId}
        leagueName={tournament.fplLeagueName}
        roundName={currentRound?.name}
        participantCount={tournament.participants.length}
      />
    </div>
  );
}
