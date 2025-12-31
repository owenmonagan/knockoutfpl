// src/pages/LeaguePage.tsx
import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';
import { BracketView } from '../components/tournament/BracketView';
import { CreateTournamentButton } from '../components/tournament/CreateTournamentButton';
import { getTournamentByLeague, callCreateTournament } from '../services/tournament';
import { useAuth } from '../contexts/AuthContext';
import type { Tournament } from '../types/tournament';

export function LeaguePage() {
  const { leagueId } = useParams<{ leagueId: string }>();
  const { user } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!leagueId) return;

      setIsLoading(true);
      try {
        // Check for existing tournament
        const existingTournament = await getTournamentByLeague(Number(leagueId));
        if (existingTournament) {
          setTournament(existingTournament);
        }
      } catch (error) {
        console.error('Error loading tournament:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
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
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
          <p>Refreshing scores and loading bracket...</p>
        </div>
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
        <BracketView tournament={tournament} />
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
