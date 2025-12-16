import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile } from '../services/user';
import { getUserMiniLeagues, getLeagueStandings, type FPLMiniLeague } from '../services/fpl';
import { LeaguePickerCard } from '../components/leagues/LeaguePickerCard';

interface LeagueWithMembers extends FPLMiniLeague {
  memberCount: number;
}

export function LeaguesPage() {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const [leagues, setLeagues] = useState<LeagueWithMembers[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadLeagues() {
      if (!authUser?.uid) return;

      // Get user profile
      const userProfile = await getUserProfile(authUser.uid);
      if (!userProfile || userProfile.fplTeamId === 0) return;

      // Fetch leagues
      setIsLoading(true);
      const miniLeagues = await getUserMiniLeagues(userProfile.fplTeamId);

      // Fetch member counts for each league
      const leaguesWithMembers = await Promise.all(
        miniLeagues.map(async (league) => {
          const standings = await getLeagueStandings(league.id);
          return {
            ...league,
            memberCount: standings.length,
          };
        })
      );

      setLeagues(leaguesWithMembers);
      setIsLoading(false);
    }

    loadLeagues();
  }, [authUser]);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Mini Leagues</h1>
          <p className="text-muted-foreground mt-2">
            Select a league to start a knockout tournament
          </p>
        </div>

        {isLoading && <p>Loading leagues...</p>}

        {!isLoading && leagues.length > 0 && (
          <div className="space-y-4">
            {leagues.map((league) => (
              <LeaguePickerCard
                key={league.id}
                league={league}
                memberCount={league.memberCount}
                onStartKnockout={() => navigate(`/knockout/${league.id}`)}
              />
            ))}
          </div>
        )}

        {!isLoading && leagues.length === 0 && (
          <p className="text-muted-foreground">
            No mini leagues found. Join a league on the FPL website to get started!
          </p>
        )}
      </div>
    </main>
  );
}
