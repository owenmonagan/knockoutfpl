// src/pages/LeaguePage.tsx
import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';
import { BracketView } from '../components/tournament/BracketView';
import { CreateTournamentButton } from '../components/tournament/CreateTournamentButton';
import {
  getTournamentByLeague,
  callCreateTournament,
  callRefreshTournament,
} from '../services/tournament';
import { useAuth } from '../contexts/AuthContext';
import type { Tournament } from '../types/tournament';

export function LeaguePage() {
  const { leagueId } = useParams<{ leagueId: string }>();
  const { user } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
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
        // Step 1: Fetch cached bracket data immediately
        const existingTournament = await getTournamentByLeague(Number(leagueId));

        if (!mountedRef.current) return;

        if (existingTournament) {
          setTournament(existingTournament);

          // Step 2: Trigger background refresh (fire-and-forget)
          setIsRefreshing(true);
          callRefreshTournament(existingTournament.id)
            .then(async (result) => {
              if (!mountedRef.current) return;

              // Step 3: If refresh made changes, re-fetch data
              if (result && (result.picksRefreshed > 0 || result.matchesResolved > 0)) {
                const updatedTournament = await getTournamentByLeague(Number(leagueId));
                if (mountedRef.current && updatedTournament) {
                  setTournament(updatedTournament);
                }
              }
            })
            .catch(() => {
              // Silent failure - don't break the UI
            })
            .finally(() => {
              if (mountedRef.current) {
                setIsRefreshing(false);
              }
            });
        }
      } catch (error) {
        console.error('Error loading tournament:', error);
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

  const handleCreateTournament = async () => {
    if (!leagueId || !user) return;

    // Call the Cloud Function to create the tournament
    await callCreateTournament(Number(leagueId));

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

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Sign-up CTA for anonymous users */}
      {!user && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <p className="text-yellow-800 mb-2">Sign in to claim your team and track your progress!</p>
          <Link to="/signup">
            <Button>Enter the Arena</Button>
          </Link>
        </div>
      )}

      {tournament ? (
        <BracketView tournament={tournament} isRefreshing={isRefreshing} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>League {leagueId}</CardTitle>
            <p className="text-muted-foreground">
              No tournament has been created for this league yet.
            </p>
          </CardHeader>
          <CardContent>
            {user ? (
              <CreateTournamentButton onCreate={handleCreateTournament} />
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Sign in to create a knockout tournament for this league.
                </p>
                <Link to="/signup">
                  <Button variant="outline">Sign Up to Create Tournament</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
