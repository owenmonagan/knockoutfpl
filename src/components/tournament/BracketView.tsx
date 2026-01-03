// src/components/tournament/BracketView.tsx
import { useState, useMemo, useCallback, useEffect } from 'react';
import { Share2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Spinner } from '../ui/spinner';
import { BracketLayout } from './BracketLayout';
import { UserPathBracket } from './UserPathBracket';
import { ParticipantsTable } from './ParticipantsTable';
import { ShareTournamentDialog } from './ShareTournamentDialog';
import { TeamSearchOverlay } from './TeamSearchOverlay';
import { YourMatchesSection } from '../dashboard/YourMatchesSection';
import type { Participant, Tournament } from '../../types/tournament';
import { getMatchPlayers } from '../../types/tournament';
import type { MatchSummaryCardProps } from '../dashboard/MatchSummaryCard';
import { fetchUserTournamentMatches, type UserMatchInfo } from '../../services/tournament';

// Threshold for switching to paginated bracket view
const LARGE_TOURNAMENT_THRESHOLD = 64; // More than 64 participants = paginated

/**
 * Converts UserMatchInfo (from API) to MatchSummaryCardProps (for display).
 */
function userMatchInfoToCard(
  match: UserMatchInfo,
  leagueName: string
): MatchSummaryCardProps {
  let type: 'live' | 'upcoming' | 'finished';
  if (match.status === 'complete') {
    type = 'finished';
  } else if (match.status === 'active') {
    type = 'live';
  } else {
    type = 'upcoming';
  }

  return {
    type,
    yourTeamName: match.yourTeamName,
    yourFplTeamId: match.yourFplTeamId,
    opponentTeamName: match.isBye ? undefined : (match.opponentTeamName ?? undefined),
    opponentFplTeamId: match.isBye ? undefined : (match.opponentFplTeamId ?? undefined),
    leagueName,
    roundName: match.roundName,
    yourScore: match.yourScore,
    theirScore: match.opponentScore,
    gameweek: match.gameweek,
    result: match.result === 'pending' ? undefined : match.result,
  };
}

interface BracketViewProps {
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
    tournament.participants.map((p) => [p.fplTeamId, p])
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

      let matchType: 'live' | 'upcoming' | 'finished';
      let result: 'won' | 'lost' | undefined;

      if (isComplete) {
        matchType = 'finished';
        result = match.winnerId === fplTeamId ? 'won' : 'lost';
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

export function BracketView({
  tournament,
  isRefreshing = false,
  isAuthenticated,
  userFplTeamId,
  onClaimTeam,
}: BracketViewProps) {
  // Animation timing constants
  const FADE_ANIMATION_DURATION_MS = 200;
  const CTA_SLIDE_IN_DELAY_MS = 100;

  // State for share dialog
  const [showShareDialog, setShowShareDialog] = useState(false);

  // Get current round for share dialog
  const currentRound = tournament.rounds.find(
    (r) => r.roundNumber === tournament.currentRound
  );

  // Check if this is a large tournament
  const isLargeTournament = tournament.participants.length > LARGE_TOURNAMENT_THRESHOLD;

  // State for API-fetched user matches (for large tournaments)
  const [apiUserMatches, setApiUserMatches] = useState<UserMatchInfo[] | null>(null);
  const [isLoadingUserMatches, setIsLoadingUserMatches] = useState(false);

  // For large tournaments, check participation via API
  // For small tournaments, check in the participants array
  const userIsParticipant = useMemo(() => {
    if (!isAuthenticated || !userFplTeamId) return false;
    // For large tournaments, check API result (null = still loading, [] = not participant)
    if (isLargeTournament) {
      // While loading or if we have matches, consider them a participant
      return apiUserMatches === null || apiUserMatches.length > 0;
    }
    return tournament.participants.some((p) => p.fplTeamId === userFplTeamId);
  }, [isAuthenticated, userFplTeamId, tournament.participants, isLargeTournament, apiUserMatches]);

  // Fetch user matches via API for large tournaments
  useEffect(() => {
    if (!isLargeTournament || !isAuthenticated || !userFplTeamId) {
      setApiUserMatches(null);
      return;
    }

    setIsLoadingUserMatches(true);
    fetchUserTournamentMatches(
      tournament.id,
      userFplTeamId,
      tournament.totalRounds,
      tournament.currentGameweek
    )
      .then((matches) => {
        setApiUserMatches(matches);
      })
      .catch((err) => {
        console.warn('[WARN] Failed to fetch user matches:', err);
        setApiUserMatches([]);
      })
      .finally(() => {
        setIsLoadingUserMatches(false);
      });
  }, [isLargeTournament, isAuthenticated, userFplTeamId, tournament.id, tournament.totalRounds, tournament.currentGameweek]);

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
      (p) => p.fplTeamId === previewedTeamId
    );
  }, [tournament.participants, previewedTeamId]);

  // Check if any previewed match is live
  const hasLivePreviewMatch = useMemo(() => {
    return previewedMatches.some((m) => m.type === 'live');
  }, [previewedMatches]);

  // Build matches for authenticated user (if they're a participant)
  // For large tournaments, use API-fetched matches
  const userMatches = useMemo(() => {
    if (!userIsParticipant || !userFplTeamId) return [];

    // For large tournaments, use API-fetched data
    if (isLargeTournament && apiUserMatches !== null) {
      return apiUserMatches.map((m) => userMatchInfoToCard(m, tournament.fplLeagueName));
    }

    // For small tournaments, use client-side computation
    return buildMatchesForTeam(tournament, userFplTeamId);
  }, [tournament, userIsParticipant, userFplTeamId, isLargeTournament, apiUserMatches]);

  // Get the authenticated user's participant info
  // For large tournaments, derive from API matches
  const userParticipant = useMemo((): Participant | null => {
    if (!userIsParticipant || !userFplTeamId) return null;

    // For large tournaments, derive from API data
    if (isLargeTournament && apiUserMatches && apiUserMatches.length > 0) {
      const firstMatch = apiUserMatches[0];
      return {
        fplTeamId: firstMatch.yourFplTeamId,
        fplTeamName: firstMatch.yourTeamName,
        managerName: '', // Not available from match data
        seed: firstMatch.yourSeed,
      };
    }

    // For small tournaments, find in participants array
    return tournament.participants.find(
      (p) => p.fplTeamId === userFplTeamId
    ) ?? null;
  }, [tournament.participants, userIsParticipant, userFplTeamId, isLargeTournament, apiUserMatches]);

  // Check if any of the user's matches is live
  const hasLiveUserMatch = useMemo(() => {
    return userMatches.some((m) => m.type === 'live');
  }, [userMatches]);

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
      {/* Your Matches Section - for authenticated users who are participants */}
      {isAuthenticated && userIsParticipant && tournament.rounds.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            {isLoadingUserMatches ? (
              <div className="flex items-center justify-center py-8 gap-2">
                <Spinner className="size-4" />
                <span className="text-sm text-muted-foreground">Loading your matches...</span>
              </div>
            ) : (
              <>
                {userParticipant && (
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-muted-foreground">Playing as</span>
                    <span className="font-medium">{userParticipant.fplTeamName}</span>
                  </div>
                )}
                <YourMatchesSection
                  matches={userMatches}
                  currentGameweek={tournament.currentGameweek}
                  isLive={hasLiveUserMatch}
                />
              </>
            )}
          </CardContent>
        </Card>
      )}

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

      {/* Bracket Card */}
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
        <CardContent>
          {tournament.rounds.length > 0 ? (
            // Use user path bracket for large tournaments
            tournament.participants.length > LARGE_TOURNAMENT_THRESHOLD ? (
              <UserPathBracket
                tournament={tournament}
                userFplTeamId={userFplTeamId}
                isAuthenticated={isAuthenticated}
                currentGameweek={tournament.currentGameweek}
              />
            ) : (
              <BracketLayout
                rounds={tournament.rounds}
                participants={tournament.participants}
                currentGameweek={tournament.currentGameweek}
                isAuthenticated={isAuthenticated}
                onClaimTeam={onClaimTeam}
              />
            )
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Bracket will appear when the tournament starts.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Participants Table - hide for large tournaments (too many to display) */}
      {tournament.rounds.length > 0 && tournament.participants.length <= LARGE_TOURNAMENT_THRESHOLD && (
        <Card>
          <CardContent className="pt-6">
            <ParticipantsTable
              participants={tournament.participants}
              seedingGameweek={tournament.startGameweek - 1}
            />
          </CardContent>
        </Card>
      )}

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
