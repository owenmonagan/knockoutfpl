import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile } from '../services/user';
import { getUserMiniLeagues, getLeagueStandings } from '../services/fpl';
import { LeaguesTable, type LeagueWithTournament } from '../components/leagues/LeaguesTable';
import { getTournamentSummaryForLeague } from '../services/tournament';

// Session storage key used by ConnectPage for persisting success state
const CONNECT_SUCCESS_STORAGE_KEY = 'connectPage_successTeamInfo';

export function LeaguesPage() {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const [leagues, setLeagues] = useState<LeagueWithTournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Clear ConnectPage's sessionStorage on successful load
  useEffect(() => {
    sessionStorage.removeItem(CONNECT_SUCCESS_STORAGE_KEY);
  }, []);

  useEffect(() => {
    async function loadLeagues() {
      if (!authUser?.uid) {
        setIsLoading(false);
        return;
      }

      // Get user profile
      const userProfile = await getUserProfile(authUser.uid);
      if (!userProfile || userProfile.fplTeamId === 0) {
        setIsLoading(false);
        return;
      }

      // Fetch leagues (isLoading already true from initial state)
      const miniLeagues = await getUserMiniLeagues(userProfile.fplTeamId);

      // Fetch member counts and tournament data for each league in parallel
      const leaguesWithTournaments = await Promise.all(
        miniLeagues.map(async (league) => {
          const [standings, tournamentData] = await Promise.all([
            getLeagueStandings(league.id),
            getTournamentSummaryForLeague(league.id, userProfile.fplTeamId).catch(() => ({
              tournament: null,
              userProgress: null,
            })),
          ]);
          return {
            ...league,
            memberCount: standings.length,
            ...tournamentData, // adds tournament and userProgress
          };
        })
      );

      setLeagues(leaguesWithTournaments);
      setIsLoading(false);
    }

    loadLeagues();
  }, [authUser]);

  const handleLeagueAction = (league: LeagueWithTournament) => {
    navigate(`/league/${league.id}`);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Mini Leagues</h1>
          <p className="text-muted-foreground mt-2">
            Select a league to start a knockout tournament
          </p>
        </div>

        <LeaguesTable
          leagues={leagues}
          onLeagueAction={handleLeagueAction}
          isLoading={isLoading}
        />
      </div>
    </main>
  );
}
