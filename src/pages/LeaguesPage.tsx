import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile } from '../services/user';
import {
  getUserMiniLeagues,
  getLeagueStandings,
  getFPLTeamInfo,
  getFPLBootstrapData,
  type FPLTeamInfo,
} from '../services/fpl';
import {
  getTournamentSummaryForLeague,
  type TournamentSummary,
  type UserProgress,
} from '../services/tournament';
import { TeamIdentity } from '../components/dashboard/TeamIdentity';
import { YourMatchesSection } from '../components/dashboard/YourMatchesSection';
import {
  YourLeaguesSection,
  type LeagueData,
} from '../components/dashboard/YourLeaguesSection';
import { Skeleton } from '../components/ui/skeleton';
import type { MatchSummaryCardProps } from '../components/dashboard/MatchSummaryCard';

// Session storage key used by ConnectPage for persisting success state
const CONNECT_SUCCESS_STORAGE_KEY = 'connectPage_successTeamInfo';

interface LeagueWithTournament {
  id: number;
  name: string;
  entryRank: number;
  memberCount: number;
  tournament: TournamentSummary | null;
  userProgress: UserProgress | null;
}

export function LeaguesPage() {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const [teamInfo, setTeamInfo] = useState<FPLTeamInfo | null>(null);
  const [leagues, setLeagues] = useState<LeagueWithTournament[]>([]);
  const [currentGameweek, setCurrentGameweek] = useState<number | undefined>(undefined);
  const [isLoadingTeam, setIsLoadingTeam] = useState(true);
  const [isLoadingLeagues, setIsLoadingLeagues] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Clear ConnectPage's sessionStorage on successful load
  useEffect(() => {
    sessionStorage.removeItem(CONNECT_SUCCESS_STORAGE_KEY);
  }, []);

  // Shared data loading function
  const loadAllData = async () => {
    if (!authUser?.uid) {
      setIsLoadingTeam(false);
      setIsLoadingLeagues(false);
      return;
    }

    // Get user profile
    const userProfile = await getUserProfile(authUser.uid);
    if (!userProfile || userProfile.fplTeamId === 0) {
      setIsLoadingTeam(false);
      setIsLoadingLeagues(false);
      return;
    }

    // Fetch team info and bootstrap data in parallel
    const [fplTeamInfo, bootstrapData] = await Promise.all([
      getFPLTeamInfo(userProfile.fplTeamId).catch(() => null),
      getFPLBootstrapData().catch(() => ({ currentGameweek: undefined })),
    ]);

    setTeamInfo(fplTeamInfo);
    setCurrentGameweek(bootstrapData.currentGameweek);
    setIsLoadingTeam(false);

    // Fetch leagues
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
    setIsLoadingLeagues(false);
  };

  useEffect(() => {
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  // Handle sync button click - refetch all data
  const handleSync = async () => {
    if (!authUser?.uid || isSyncing) return;

    setIsSyncing(true);
    setIsLoadingTeam(true);
    setIsLoadingLeagues(true);

    try {
      await loadAllData();
    } finally {
      setIsSyncing(false);
    }
  };

  // Transform league data to YourMatchesSection format
  const aggregateMatches = (): MatchSummaryCardProps[] => {
    const allMatches: MatchSummaryCardProps[] = [];

    for (const league of leagues) {
      // Add current match if exists
      if (league.userProgress?.currentMatch) {
        const match = league.userProgress.currentMatch;
        allMatches.push({
          type: match.isLive ? 'live' : 'upcoming',
          opponentTeamName: match.opponentTeamName,
          leagueName: league.name,
          roundName: match.roundName,
          yourScore: match.yourScore,
          theirScore: match.theirScore,
          gameweek: match.gameweek,
          onClick: () => navigate(`/league/${league.id}`),
        });
      }

      // Add recent result if exists
      if (league.userProgress?.recentResult) {
        const match = league.userProgress.recentResult;
        allMatches.push({
          type: 'finished',
          opponentTeamName: match.opponentTeamName,
          leagueName: league.name,
          roundName: match.roundName,
          yourScore: match.yourScore,
          theirScore: match.theirScore,
          result: match.result === 'won' ? 'won' : 'lost',
          onClick: () => navigate(`/league/${league.id}`),
        });
      }
    }

    return allMatches;
  };

  // Transform league data to YourLeaguesSection format
  const transformLeagues = (): LeagueData[] => {
    return leagues.map((league) => ({
      leagueId: league.id,
      leagueName: league.name,
      memberCount: league.memberCount,
      tournament: league.tournament
        ? {
            startGameweek: league.tournament.startGameweek,
            endGameweek: league.tournament.endGameweek,
            currentRound: league.tournament.currentRound,
            totalRounds: league.tournament.totalRounds,
            status: league.tournament.status,
          }
        : null,
      userProgress: league.userProgress
        ? {
            status: league.userProgress.status,
            currentRoundName: league.userProgress.currentRoundName,
            eliminationRound: league.userProgress.eliminationRound,
          }
        : null,
    }));
  };

  const handleLeagueClick = (leagueId: number) => {
    navigate(`/league/${leagueId}`);
  };

  // Check if any match is currently live
  const hasLiveMatch = leagues.some(
    (league) => league.userProgress?.currentMatch?.isLive
  );

  const matches = aggregateMatches();
  const leagueData = transformLeagues();

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Team Identity Section */}
        <section>
          {isLoadingTeam ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-5 w-32" />
            </div>
          ) : teamInfo ? (
            <TeamIdentity
              teamName={teamInfo.teamName}
              managerName={teamInfo.managerName}
              overallRank={teamInfo.overallRank ?? 0}
              gameweekNumber={currentGameweek ?? 0}
              gameweekPoints={teamInfo.gameweekPoints ?? 0}
              onSync={handleSync}
              onEditTeam={() => {
                navigate('/connect');
              }}
              isSyncing={isSyncing}
            />
          ) : null}
        </section>

        {/* Your Matches Section */}
        <YourMatchesSection
          matches={isLoadingLeagues ? [] : matches}
          currentGameweek={currentGameweek}
          isLive={hasLiveMatch}
        />

        {/* Your Leagues Section */}
        <YourLeaguesSection
          leagues={leagueData}
          onLeagueClick={handleLeagueClick}
          isLoading={isLoadingLeagues}
        />
      </div>
    </main>
  );
}
