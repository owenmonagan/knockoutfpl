// src/pages/LeaguePage.tsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Skeleton } from '../components/ui/skeleton';
import { Card, CardContent } from '../components/ui/card';
import { BracketView } from '../components/tournament/BracketView';
import { NoTournamentEmptyState } from '../components/leagues/NoTournamentEmptyState';
import { ShareTournamentDialog } from '../components/tournament/ShareTournamentDialog';
import {
  getTournamentByLeague,
  callCreateTournament,
  callRefreshTournament,
} from '../services/tournament';
import { getLeagueInfo, type FPLLeagueInfo } from '../services/fpl';
import { signInWithGoogle } from '../services/auth';
import { createUserProfile, connectFPLTeam, getUserProfile } from '../services/user';
import { useAuth } from '../contexts/AuthContext';
import type { Tournament } from '../types/tournament';
import { MIN_TOURNAMENT_PARTICIPANTS, MAX_TOURNAMENT_PARTICIPANTS } from '../constants/tournament';

export function LeaguePage() {
  const { leagueId } = useParams<{ leagueId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [leagueInfo, setLeagueInfo] = useState<FPLLeagueInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [userFplTeamId, setUserFplTeamId] = useState<number | null>(null);
  const mountedRef = useRef(true);

  // Fetch user's FPL team ID when authenticated
  useEffect(() => {
    if (!user) {
      setUserFplTeamId(null);
      return;
    }

    getUserProfile(user.uid).then((profile) => {
      if (profile && profile.fplTeamId) {
        setUserFplTeamId(profile.fplTeamId);
      }
    });
  }, [user]);

  useEffect(() => {
    // Reset mounted ref on mount
    mountedRef.current = true;

    async function loadData() {
      if (!leagueId) return;

      setIsLoading(true);
      try {
        // Fetch league info and tournament in parallel
        const [leagueInfoResult, existingTournament] = await Promise.all([
          getLeagueInfo(Number(leagueId)).catch(() => null),
          getTournamentByLeague(Number(leagueId)),
        ]);

        if (!mountedRef.current) return;

        setLeagueInfo(leagueInfoResult);

        if (existingTournament) {
          setTournament(existingTournament);

          // Trigger background refresh (fire-and-forget)
          setIsRefreshing(true);
          callRefreshTournament(existingTournament.id)
            .then(async (result) => {
              if (!mountedRef.current) return;

              if (result && (result.picksRefreshed > 0 || result.matchesResolved > 0)) {
                const updatedTournament = await getTournamentByLeague(Number(leagueId));
                if (mountedRef.current && updatedTournament) {
                  setTournament(updatedTournament);
                }
              }
            })
            .catch(() => {
              // Silent failure
            })
            .finally(() => {
              if (mountedRef.current) {
                setIsRefreshing(false);
              }
            });
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    // Cleanup on unmount
    return () => {
      mountedRef.current = false;
    };
  }, [leagueId]);

  const handleCreateTournament = async (startEvent: number, matchSize: number) => {
    if (!leagueId || !user) return;

    // Call the Cloud Function to create the tournament with the selected start gameweek and match size
    await callCreateTournament(Number(leagueId), startEvent, matchSize);

    // Reload tournament data
    const newTournament = await getTournamentByLeague(Number(leagueId));
    if (newTournament) {
      setTournament(newTournament);
      setShowShareModal(true);
    }
  };

  const handleClaimTeam = async (fplTeamId: number) => {
    // If user is already authenticated, just redirect (edge case)
    if (user) {
      navigate('/leagues');
      return;
    }

    try {
      // Trigger Google sign-in
      const credential = await signInWithGoogle();

      // Create user profile (fire-and-forget for DataConnect)
      await createUserProfile({
        userId: credential.user.uid,
        email: credential.user.email || '',
        displayName: credential.user.displayName || '',
      });

      // Auto-connect the claimed FPL team
      await connectFPLTeam(
        credential.user.uid,
        credential.user.email || '',
        fplTeamId
      );

      // Redirect to leagues page
      navigate('/leagues');
    } catch (error) {
      // User cancelled sign-in or error occurred
      // Just stay on the page - no action needed
      console.warn('Claim team flow cancelled or failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const isLocked = leagueInfo
    ? leagueInfo.memberCount < MIN_TOURNAMENT_PARTICIPANTS ||
      leagueInfo.memberCount > MAX_TOURNAMENT_PARTICIPANTS
    : false;

  return (
    <div className="container mx-auto p-4 space-y-6">
      {tournament ? (
        <BracketView
          tournament={tournament}
          isRefreshing={isRefreshing}
          isAuthenticated={!!user}
          userFplTeamId={userFplTeamId}
          onClaimTeam={handleClaimTeam}
        />
      ) : leagueInfo ? (
        <NoTournamentEmptyState
          leagueName={leagueInfo.name}
          managerCount={leagueInfo.memberCount}
          isAuthenticated={!!user}
          onCreate={handleCreateTournament}
          isLocked={isLocked}
        />
      ) : (
        <Card className="w-full max-w-lg mx-auto">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Failed to load league information.</p>
          </CardContent>
        </Card>
      )}

      <ShareTournamentDialog
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        leagueId={Number(leagueId)}
        leagueName={leagueInfo?.name ?? 'Your League'}
      />
    </div>
  );
}
