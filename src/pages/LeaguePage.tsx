// src/pages/LeaguePage.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { BracketView } from '../components/tournament/BracketView';
import { CreateTournamentButton } from '../components/tournament/CreateTournamentButton';
import { getLeagueStandings, getCurrentGameweek } from '../services/fpl';
import { getTournamentByLeague, createTournament } from '../services/tournament';
import { generateBracket } from '../lib/bracket';
import { useAuth } from '../contexts/AuthContext';
import type { Tournament, Participant } from '../types/tournament';

export function LeaguePage() {
  const { leagueId } = useParams<{ leagueId: string }>();
  const { user } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [leagueName, setLeagueName] = useState('');

  useEffect(() => {
    async function loadData() {
      if (!leagueId) return;

      setIsLoading(true);
      try {
        // Check for existing tournament
        const existingTournament = await getTournamentByLeague(Number(leagueId));
        if (existingTournament) {
          setTournament(existingTournament);
          setLeagueName(existingTournament.fplLeagueName);
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

    // Fetch league standings
    const standings = await getLeagueStandings(Number(leagueId));
    const gameweekData = await getCurrentGameweek();

    // Create participants from standings
    const participants: Participant[] = standings.map((standing, index) => ({
      fplTeamId: standing.fplTeamId,
      fplTeamName: standing.teamName,
      managerName: standing.managerName,
      seed: index + 1, // Seed by league rank
    }));

    // Generate bracket
    const startGameweek = gameweekData.id + 1; // Start next gameweek
    const rounds = generateBracket(participants, startGameweek);
    const totalRounds = rounds.length;

    // Get league name from first standing or use default
    const leagueNameFromStandings = standings.length > 0 ? `League ${leagueId}` : `League ${leagueId}`;

    // Create tournament
    const newTournament = await createTournament({
      fplLeagueId: Number(leagueId),
      fplLeagueName: leagueNameFromStandings,
      creatorUserId: user.uid,
      startGameweek,
      currentRound: 1,
      totalRounds,
      status: 'active',
      participants,
      rounds,
      winnerId: null,
    });

    setTournament(newTournament);
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
