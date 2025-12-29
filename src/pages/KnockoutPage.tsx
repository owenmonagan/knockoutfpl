// src/pages/KnockoutPage.tsx
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile } from '../services/user';
import { getUserMiniLeagues, getLeagueStandings, getCurrentGameweek, getFPLGameweekScore } from '../services/fpl';
import type { Participant, Match, Round } from '../types/tournament';
import { MatchCard } from '../components/tournament/MatchCard';
import { Button } from '../components/ui/button';

interface Bracket {
  participants: Participant[];
  rounds: Round[];
}

export function KnockoutPage() {
  const { leagueId } = useParams<{ leagueId: string }>();
  const { user } = useAuth();
  const [leagueName, setLeagueName] = useState<string>('');
  const [bracket, setBracket] = useState<Bracket | null>(null);
  const [gameweek, setGameweek] = useState<number>(15);
  const [userFplTeamId, setUserFplTeamId] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      // Load user-specific data if authenticated
      if (user) {
        const profile = await getUserProfile(user.uid);
        if (profile?.fplTeamId) {
          setUserFplTeamId(profile.fplTeamId);

          const leagues = await getUserMiniLeagues(profile.fplTeamId);
          const league = leagues.find((l) => l.id === Number(leagueId));
          if (league) {
            setLeagueName(league.name);
          }
        }
      }

      // Load bracket data (works for both authenticated and anonymous users)
      const standings = await getLeagueStandings(Number(leagueId));
      const top16 = standings.slice(0, 16);
      const currentGw = await getCurrentGameweek();
      setGameweek(currentGw);

      // Only generate bracket if we have enough teams
      if (top16.length < 16) {
        return;
      }

      // Generate participants
      const participants: Participant[] = top16.map((s, i) => ({
        fplTeamId: s.fplTeamId,
        fplTeamName: s.teamName,
        managerName: s.managerName,
        seed: i + 1,
      }));

      // Generate Round 1 matches with seeding
      const matchups = [
        [0, 15], [7, 8], [4, 11], [3, 12],
        [2, 13], [5, 10], [6, 9], [1, 14],
      ];

      const matches: Match[] = matchups.map(([idx1, idx2], i) => ({
        id: `r1-m${i}`,
        player1: {
          fplTeamId: participants[idx1].fplTeamId,
          seed: participants[idx1].seed,
          score: null,
        },
        player2: {
          fplTeamId: participants[idx2].fplTeamId,
          seed: participants[idx2].seed,
          score: null,
        },
        winnerId: null,
        isBye: false,
      }));

      // Fetch scores for all teams
      const scorePromises = participants.map((p) =>
        getFPLGameweekScore(p.fplTeamId, currentGw)
      );
      const scores = await Promise.all(scorePromises);

      // Update match scores
      for (const match of matches) {
        if (match.player1) {
          const participantIndex = participants.findIndex(
            (p) => p.fplTeamId === match.player1!.fplTeamId
          );
          if (participantIndex !== -1) {
            match.player1.score = scores[participantIndex].points;
          }
        }
        if (match.player2) {
          const participantIndex = participants.findIndex(
            (p) => p.fplTeamId === match.player2!.fplTeamId
          );
          if (participantIndex !== -1) {
            match.player2.score = scores[participantIndex].points;
          }
        }

        // Determine winner
        if (match.player1?.score !== null && match.player2?.score !== null) {
          if (match.player1.score > match.player2.score) {
            match.winnerId = match.player1.fplTeamId;
          } else if (match.player2.score > match.player1.score) {
            match.winnerId = match.player2.fplTeamId;
          }
        }
      }

      const round: Round = {
        roundNumber: 1,
        name: 'Round 1',
        gameweek: currentGw,
        matches,
        isComplete: false,
      };

      setBracket({ participants, rounds: [round] });
    };

    loadData();
  }, [user, leagueId]);

  const currentRound = bracket?.rounds[0];

  // Find user's match
  const findUserMatch = (matches: Match[], userTeamId: number | null): Match | null => {
    if (!userTeamId) return null;
    return matches.find(m =>
      m.player1?.fplTeamId === userTeamId || m.player2?.fplTeamId === userTeamId
    ) || null;
  };

  const userMatch = currentRound && userFplTeamId
    ? findUserMatch(currentRound.matches, userFplTeamId)
    : null;

  const otherMatches = currentRound
    ? currentRound.matches.filter(m => m.id !== userMatch?.id)
    : [];

  const teamCount = bracket?.participants.length || 0;

  return (
    <div>
      {user ? (
        <Link to="/leagues">← Back to Leagues</Link>
      ) : (
        <Link to="/">← Back to Home</Link>
      )}
      {leagueName && <h1>{leagueName.toUpperCase()}</h1>}

      {/* Sign-up CTA for anonymous users */}
      {!user && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
          <p className="text-yellow-800 mb-2">Sign in to claim your team and track your progress!</p>
          <Link to="/signup">
            <Button>Enter the Arena</Button>
          </Link>
        </div>
      )}

      {bracket && (
        <div>
          <p>16 REMAIN</p>
          <p className="text-sm text-muted-foreground">
            {teamCount} teams · GW{gameweek} scores
          </p>
        </div>
      )}
      {currentRound && bracket && (
        <div>
          {userMatch && (
            <div>
              <p className="text-sm font-medium text-amber-600 mb-2">YOUR MATCH</p>
              <MatchCard
                match={userMatch}
                participants={bracket.participants}
                gameweek={currentRound.gameweek}
                isUserMatch={true}
                userTeamId={userFplTeamId || undefined}
              />
            </div>
          )}
          {otherMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              participants={bracket.participants}
              gameweek={currentRound.gameweek}
            />
          ))}
        </div>
      )}
    </div>
  );
}
