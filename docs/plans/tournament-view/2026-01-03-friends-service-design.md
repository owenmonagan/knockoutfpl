# Friends Service Design

> Design for Phase 4: Friends Activity and reusable friends lookup pattern

**Date:** 2026-01-03
**Status:** Approved
**Parent Spec:** [Scalable Cup View Design](./2026-01-03-scalable-cup-view-design.md)

---

## Summary

A reusable friends service that identifies managers who share leagues with the user (beyond the tournament's league) and surfaces them across multiple views: Overview tab (Friends Activity), Matches tab (highlighting), and Participants tab (badges).

---

## Friend Definition

A **friend** is a manager who shares at least **1 mini-league** with the user, **excluding** the tournament's league.

- Everyone in the tournament already shares the tournament's league by definition
- "Friend" means having an additional connection outside this tournament
- Calculated by cross-referencing FPL league memberships

---

## API Design

### getTournamentFriends

```typescript
// src/services/friends.ts

interface FriendInTournament {
  fplTeamId: number;
  teamName: string;
  managerName: string;
  sharedLeagueCount: number;     // Excludes tournament league
  sharedLeagueNames: string[];   // For display: "Work League, Draft League"
  status: 'in' | 'eliminated';
  eliminatedRound?: number;
  seed: number;
}

export async function getTournamentFriends(
  tournamentId: string,
  tournamentLeagueId: number,
  userFplTeamId: number,
  participants: Participant[]
): Promise<FriendInTournament[]>
```

**Returns:** Friends sorted by sharedLeagueCount desc, then alphabetically.

---

### getTournamentMatchups

```typescript
// src/services/matchups.ts

interface MatchupOptions {
  round?: number;              // undefined = latest match per participant
  friendsOnly?: boolean;       // filter to just friends
  userFplTeamId?: number;      // required if friendsOnly or for isFriend flag
  tournamentLeagueId?: number; // required if friendsOnly
}

interface MatchupResult {
  participant: Participant;
  match: Match | null;
  round: Round | null;
  opponent: Participant | null;
  matchStatus: 'live' | 'upcoming' | 'finished' | 'eliminated';
  result?: 'winning' | 'losing' | 'tied' | 'won' | 'lost';
  isFriend?: boolean;          // Always included if userFplTeamId provided
  sharedLeagueCount?: number;
}

export async function getTournamentMatchups(
  tournament: Tournament,
  options?: MatchupOptions
): Promise<MatchupResult[]>
```

**Usage examples:**
```typescript
// Overview: friends' latest matches
getTournamentMatchups(tournament, { friendsOnly: true, userFplTeamId, tournamentLeagueId })

// Matches tab: all matches in round 3
getTournamentMatchups(tournament, { round: 3 })

// Matches tab: all matches with friend highlighting
getTournamentMatchups(tournament, { round: 3, userFplTeamId, tournamentLeagueId })

// Matches tab: just friends in round 3
getTournamentMatchups(tournament, { round: 3, friendsOnly: true, userFplTeamId, tournamentLeagueId })
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ Tournament Creation (one-time)                                  │
│ ─────────────────────────────────────────────────────────────── │
│ Cloud Function: processTournamentImport                         │
│   ↓                                                             │
│ Fetch all participants' leagues from FPL API (batched)          │
│   ↓                                                             │
│ Store in ParticipantLeague table                                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Runtime Query                                                   │
│ ─────────────────────────────────────────────────────────────── │
│ 1. Get user's leagues from FPL API (getUserMiniLeagues)         │
│ 2. Query ParticipantLeague table for tournament                 │
│ 3. Compute: shared leagues excluding tournamentLeagueId         │
│ 4. Filter: sharedCount >= 1 = friend                            │
│ 5. Sort: by sharedCount desc, then alphabetically               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation

### getTournamentFriends

```typescript
// src/services/friends.ts
import { getUserMiniLeagues } from './fpl';
import { getParticipantLeaguesForTournament } from './tournament';
import type { Participant } from '@/types/tournament';

export async function getTournamentFriends(
  tournamentId: string,
  tournamentLeagueId: number,
  userFplTeamId: number,
  participants: Participant[]
): Promise<FriendInTournament[]> {
  // 1. Get user's leagues
  const userLeagues = await getUserMiniLeagues(userFplTeamId);
  const userLeagueIds = new Set(userLeagues.map(l => l.id));

  // 2. Query ParticipantLeague table (cached from tournament creation)
  const participantLeagues = await getParticipantLeaguesForTournament(tournamentId);

  // 3. For each participant, find shared leagues (excluding tournament league)
  const friends: FriendInTournament[] = [];

  for (const participant of participants) {
    if (participant.fplTeamId === userFplTeamId) continue; // Skip self

    const theirLeagues = participantLeagues
      .filter(pl => pl.entryId === participant.fplTeamId)
      .filter(pl => pl.leagueId !== tournamentLeagueId);

    const sharedLeagues = theirLeagues.filter(pl => userLeagueIds.has(pl.leagueId));

    if (sharedLeagues.length >= 1) {
      friends.push({
        fplTeamId: participant.fplTeamId,
        teamName: participant.fplTeamName,
        managerName: participant.managerName,
        sharedLeagueCount: sharedLeagues.length,
        sharedLeagueNames: sharedLeagues.map(l => l.leagueName),
        seed: participant.seed,
        status: 'in',
        eliminatedRound: undefined,
      });
    }
  }

  // 4. Sort by shared count desc, then alphabetically
  return friends.sort((a, b) => {
    if (b.sharedLeagueCount !== a.sharedLeagueCount) {
      return b.sharedLeagueCount - a.sharedLeagueCount;
    }
    return a.teamName.localeCompare(b.teamName);
  });
}
```

### getTournamentMatchups

```typescript
// src/services/matchups.ts
import { getTournamentFriends } from './friends';
import type { Tournament, Match, Round, Participant } from '@/types/tournament';
import { getMatchPlayers } from '@/types/tournament';

export async function getTournamentMatchups(
  tournament: Tournament,
  options: MatchupOptions = {}
): Promise<MatchupResult[]> {
  const { round, friendsOnly, userFplTeamId, tournamentLeagueId } = options;

  // 1. Get friends if needed
  let friendIds: Set<number> | null = null;
  let friendsMap: Map<number, FriendInTournament> | null = null;

  if (userFplTeamId && tournamentLeagueId) {
    const friends = await getTournamentFriends(
      tournament.id,
      tournament.fplLeagueId,
      userFplTeamId,
      tournament.participants
    );
    friendIds = new Set(friends.map(f => f.fplTeamId));
    friendsMap = new Map(friends.map(f => [f.fplTeamId, f]));
  }

  // 2. Build matchups
  let matchups: MatchupResult[];

  if (round !== undefined) {
    matchups = buildMatchupsForRound(tournament, round);
  } else {
    matchups = buildLatestMatchups(tournament);
  }

  // 3. Enrich with friend data
  if (friendsMap) {
    matchups = matchups.map(m => ({
      ...m,
      isFriend: friendIds!.has(m.participant.fplTeamId),
      sharedLeagueCount: friendsMap!.get(m.participant.fplTeamId)?.sharedLeagueCount,
    }));
  }

  // 4. Filter if friendsOnly
  if (friendsOnly && friendIds) {
    matchups = matchups.filter(m => friendIds!.has(m.participant.fplTeamId));
  }

  return matchups;
}

function buildMatchupsForRound(tournament: Tournament, roundNum: number): MatchupResult[] {
  const round = tournament.rounds.find(r => r.roundNumber === roundNum);
  if (!round) return [];

  const results: MatchupResult[] = [];
  const participantMap = new Map(tournament.participants.map(p => [p.fplTeamId, p]));

  for (const match of round.matches) {
    const players = getMatchPlayers(match);

    for (const player of players) {
      const participant = participantMap.get(player.fplTeamId);
      if (!participant) continue;

      const opponents = players.filter(p => p.fplTeamId !== player.fplTeamId);
      const opponent = opponents[0] ? participantMap.get(opponents[0].fplTeamId) : null;

      const matchStatus = getMatchStatus(round, match, tournament.currentGameweek);
      const result = getMatchResult(match, player.fplTeamId, round.isComplete);

      results.push({
        participant,
        match,
        round,
        opponent: opponent ?? null,
        matchStatus,
        result,
      });
    }
  }

  return results;
}

function buildLatestMatchups(tournament: Tournament): MatchupResult[] {
  const results: MatchupResult[] = [];
  const seen = new Set<number>();

  // Iterate rounds in reverse to find each participant's latest match
  for (let i = tournament.rounds.length - 1; i >= 0; i--) {
    const round = tournament.rounds[i];
    const roundMatchups = buildMatchupsForRound(tournament, round.roundNumber);

    for (const matchup of roundMatchups) {
      if (!seen.has(matchup.participant.fplTeamId)) {
        seen.add(matchup.participant.fplTeamId);
        results.push(matchup);
      }
    }
  }

  return results;
}

function getMatchStatus(
  round: Round,
  match: Match,
  currentGameweek: number
): 'live' | 'upcoming' | 'finished' | 'eliminated' {
  if (round.isComplete) return 'finished';
  if (round.gameweek <= currentGameweek) return 'live';
  return 'upcoming';
}

function getMatchResult(
  match: Match,
  fplTeamId: number,
  isComplete: boolean
): 'winning' | 'losing' | 'tied' | 'won' | 'lost' | undefined {
  const players = getMatchPlayers(match);
  const player = players.find(p => p.fplTeamId === fplTeamId);
  const opponent = players.find(p => p.fplTeamId !== fplTeamId);

  if (!player || player.score === null) return undefined;
  if (!opponent || opponent.score === null) return undefined;

  const diff = player.score - opponent.score;

  if (isComplete) {
    return match.winnerId === fplTeamId ? 'won' : 'lost';
  }

  if (diff > 0) return 'winning';
  if (diff < 0) return 'losing';
  return 'tied';
}
```

---

## UI Integration

### TournamentView (parent)

```typescript
// Compute friends once, pass down to all tabs
const [friends, setFriends] = useState<FriendInTournament[] | null>(null);

useEffect(() => {
  if (userFplTeamId && tournament) {
    getTournamentFriends(
      tournament.id,
      tournament.fplLeagueId,
      userFplTeamId,
      tournament.participants
    ).then(setFriends);
  }
}, [tournament.id, userFplTeamId]);

const friendIds = useMemo(
  () => new Set(friends?.map(f => f.fplTeamId) ?? []),
  [friends]
);

// Pass to tabs
<OverviewTab friends={friends} ... />
<MatchesTab friendIds={friendIds} ... />
<ParticipantsTab friendIds={friendIds} ... />
```

### Tab Usage

| Tab | Data Needed | Display |
|-----|-------------|---------|
| **Overview** | `friends` array | Friends Activity section with matches |
| **Matches** | `friendIds` set | Badge/highlight on friend matches |
| **Participants** | `friendIds` set | Friend indicator next to name |

---

## Caching Strategy

| Data | Cache Location | Expiry |
|------|---------------|--------|
| ParticipantLeague records | PostgreSQL (DataConnect) | Never (set at tournament creation) |
| User's mini-leagues | React state (per session) | Session duration |
| Friends list | React state (TournamentView) | Recalculate on tournament change |

---

## Dependencies

**Existing (reuse):**
- `getUserMiniLeagues()` in src/services/fpl.ts
- `fetchParticipantLeaguesBatch()` in functions/src/fetchParticipantLeagues.ts
- `ParticipantLeague` table in DataConnect schema
- `computeSharedLeagueCounts()` in src/services/sharedLeagues.ts

**New to create:**
- `src/services/friends.ts` - getTournamentFriends
- `src/services/matchups.ts` - getTournamentMatchups
- DataConnect query: `getParticipantLeaguesForTournament`
- `FriendsActivity` component for Overview tab

---

## File Structure

```
src/services/
├── friends.ts          # NEW: getTournamentFriends()
├── matchups.ts         # NEW: getTournamentMatchups()
├── fpl.ts              # EXISTING: getUserMiniLeagues()
├── tournament.ts       # ADD: getParticipantLeaguesForTournament()
└── sharedLeagues.ts    # EXISTING: computation helpers

src/components/tournament/
├── FriendsActivity.tsx # NEW: Friends Activity section
└── tabs/
    └── OverviewTab.tsx # MODIFY: add FriendsActivity
```
