// src/hooks/useTournamentFriends.ts
import { useState, useEffect, useMemo } from 'react';
import { getTournamentFriends } from '@/services/friends';
import type { FriendInTournament } from '@/services/friends';
import type { Participant, TournamentEntry } from '@/types/tournament';

interface UseTournamentFriendsOptions {
  tournamentId: string;
  tournamentLeagueId: number;
  userFplTeamId: number | null | undefined;
  /** Accepts both legacy Participant[] and new TournamentEntry[] formats */
  participants: Participant[] | TournamentEntry[];
  enabled?: boolean;
}

interface UseTournamentFriendsResult {
  friends: FriendInTournament[] | null;
  friendIds: Set<number>;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch and cache tournament friends.
 * Returns both the full friends array and a Set of friend IDs for efficient lookup.
 */
export function useTournamentFriends({
  tournamentId,
  tournamentLeagueId,
  userFplTeamId,
  participants,
  enabled = true,
}: UseTournamentFriendsOptions): UseTournamentFriendsResult {
  const [friends, setFriends] = useState<FriendInTournament[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled || !userFplTeamId || !tournamentId || participants.length === 0) {
      setFriends(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getTournamentFriends(tournamentId, tournamentLeagueId, userFplTeamId, participants)
      .then((result) => {
        if (!cancelled) {
          setFriends(result);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Failed to fetch tournament friends:', err);
          setError(err);
          setFriends(null);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [tournamentId, tournamentLeagueId, userFplTeamId, participants, enabled]);

  const friendIds = useMemo(
    () => new Set(friends?.map((f) => f.fplTeamId) ?? []),
    [friends]
  );

  return { friends, friendIds, isLoading, error };
}
