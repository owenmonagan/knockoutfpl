// src/pages/LeaguePage.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
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
        <p className="text-muted-foreground">Loading league data...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
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
            <CreateTournamentButton onCreate={handleCreateTournament} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
