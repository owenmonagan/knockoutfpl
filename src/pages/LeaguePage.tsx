// src/pages/LeaguePage.tsx
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Skeleton } from '../components/ui/skeleton';
import { Card, CardContent } from '../components/ui/card';
import { BracketView } from '../components/tournament/BracketView';
import { NoTournamentEmptyState } from '../components/leagues/NoTournamentEmptyState';
import {
  getTournamentByLeague,
  callCreateTournament,
  callRefreshTournament,
} from '../services/tournament';
import { getLeagueInfo, type FPLLeagueInfo } from '../services/fpl';
import { useAuth } from '../contexts/AuthContext';
import type { Tournament } from '../types/tournament';
import { MAX_TOURNAMENT_PARTICIPANTS } from '../constants/tournament';

export function LeaguePage() {
  const { leagueId } = useParams<{ leagueId: string }>();
  const { user } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [leagueInfo, setLeagueInfo] = useState<FPLLeagueInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const mountedRef = useRef(true);

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

    // Call the Cloud Function to create the tournament with the selected start gameweek
    // TODO: Pass matchSize to callCreateTournament once backend supports it
    await callCreateTournament(Number(leagueId), startEvent);
    console.log('Tournament created with matchSize:', matchSize);

    // Reload tournament data
    const newTournament = await getTournamentByLeague(Number(leagueId));
    if (newTournament) {
      setTournament(newTournament);
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

  const isLocked = leagueInfo ? leagueInfo.memberCount > MAX_TOURNAMENT_PARTICIPANTS : false;

  return (
    <div className="container mx-auto p-4 space-y-6">
      {tournament ? (
        <BracketView tournament={tournament} isRefreshing={isRefreshing} />
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
    </div>
  );
}
