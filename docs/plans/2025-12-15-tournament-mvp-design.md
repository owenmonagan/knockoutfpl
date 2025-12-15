# Tournament MVP Design

> **Created:** December 15, 2025
> **Status:** Approved

## Overview

Transform Knockout FPL from 1v1 challenges into a tournament platform for FPL mini-leagues. Users see their leagues, click one, and start a knockout tournament with one click. All league members auto-participate, seeded by current league rank.

## Key Decisions

| Decision | Choice |
|----------|--------|
| Challenge system | Remove completely |
| League size limit | Dynamic: max players = 2^(gameweeks remaining) |
| Live scores | Fetch once on load, show "Last updated" timestamp |
| Bracket UI (MVP) | Simple vertical list grouped by round |
| Navigation | Leagues-first dashboard |
| Create flow | One-click, auto-starts next gameweek |
| Round processing | Client-side (no Cloud Functions for MVP) |
| Cleanup | Delete challenge code first |

## User Flows

**New user:**
```
Signup → Link FPL Team → See Leagues → Click League → Create Tournament → See Bracket
```

**Returning user:**
```
Login → See Leagues → Click League with Tournament → See Bracket Progress
```

## Data Model

```typescript
// src/types/tournament.ts

interface Tournament {
  id: string;                    // Firestore document ID
  fplLeagueId: number;
  fplLeagueName: string;

  creatorUserId: string;
  startGameweek: number;         // First round GW (auto-set to next GW)
  currentRound: number;          // 1-indexed
  totalRounds: number;           // Calculated from participant count
  status: 'active' | 'completed';

  participants: Participant[];
  rounds: Round[];

  winnerId: number | null;       // FPL team ID of winner
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface Participant {
  fplTeamId: number;
  fplTeamName: string;
  managerName: string;
  seed: number;                  // 1 = top seed (best league rank)
}

interface Round {
  roundNumber: number;
  name: string;                  // "Quarter-Finals", "Semi-Finals", "Final"
  gameweek: number;
  matches: Match[];
  isComplete: boolean;
}

interface Match {
  id: string;
  player1: MatchPlayer | null;
  player2: MatchPlayer | null;   // null = BYE
  winnerId: number | null;       // FPL team ID
  isBye: boolean;
}

interface MatchPlayer {
  fplTeamId: number;
  seed: number;
  score: number | null;          // Stored after GW finishes
}
```

## Pages & Routes

```
/                    → LandingPage (existing, keep)
/login               → LoginPage (existing, keep)
/signup              → SignUpPage (existing, keep)
/dashboard           → DashboardPage (rewrite: show user's leagues)
/league/:leagueId    → LeaguePage (NEW: league detail + tournament)
/profile             → ProfilePage (existing, keep FPL connection)
```

**Removed:**
- `/tournament/create/:leagueId` (one-click inline instead)
- `/tournament/:tournamentId` (merged into LeaguePage)
- `/challenges/*` (deleted)

## Components

```
src/components/
  leagues/
    LeagueCard.tsx          # Card showing league name, rank, member count
    LeagueList.tsx          # List of LeagueCards

  tournament/
    BracketView.tsx         # Vertical list of rounds
    RoundSection.tsx        # Round header + list of matches
    MatchCard.tsx           # Single match: two players + scores
    CreateTournamentButton.tsx  # One-click button with loading state
```

**LeagueCard** shows:
- League name
- "Rank #X of Y" (user's position)
- Badge if tournament exists ("Tournament Active" / "Tournament Complete")

**MatchCard** shows:
- Player 1 name + seed + score (if available)
- Player 2 name + seed + score (or "BYE")
- Winner highlighted (green border/background)
- Status badge: "GW 16" / "Live" / "Complete"

**BracketView** shows:
- Tournament header (league name, status)
- "Last updated: X" timestamp
- List of RoundSections (Final at bottom, Round 1 at top)

## Services

**FPL Service extensions** (`src/services/fpl.ts`):

```typescript
interface FPLMiniLeague {
  id: number;
  name: string;
  entryRank: number;
}
async function getUserMiniLeagues(teamId: number): Promise<FPLMiniLeague[]>

interface LeagueStanding {
  fplTeamId: number;
  teamName: string;
  managerName: string;
  rank: number;
  totalPoints: number;
}
async function getLeagueStandings(leagueId: number): Promise<LeagueStanding[]>
```

**Tournament Service** (`src/services/tournament.ts`):

```typescript
async function createTournament(...): Promise<Tournament>
async function getTournamentByLeague(leagueId: number): Promise<Tournament | null>
async function updateTournament(tournament: Tournament): Promise<void>
async function getUserTournaments(fplTeamId: number): Promise<Tournament[]>
```

**Bracket Logic** (`src/lib/bracket.ts`):

```typescript
function generateBracket(participants: Participant[], startGameweek: number): Round[]
function determineWinner(match: Match): number | null
function advanceRound(tournament: Tournament): Tournament
```

## Dynamic Size Limit

Max participants based on gameweeks remaining:

| GWs Remaining | Max Players | Rounds |
|---------------|-------------|--------|
| 6+ | 64 | 6 |
| 5 | 32 | 5 |
| 4 | 16 | 4 |
| 3 | 8 | 3 |
| 2 | 4 | 2 |
| 1 | 2 | 1 |

If league exceeds limit, show error: "League has X members but only Y can participate with Z gameweeks remaining."

## Bracket Generation

**Seeding:** Top league rank = seed 1. Seed 1 plays lowest seed, seed 2 plays second-lowest, etc.

**Byes:** Award to top seeds when participant count isn't a power of 2.
- Example: 5 participants → 3 byes → Seeds 1, 2, 3 advance automatically to round 2.

**Tiebreaker:** Higher seed (lower number) wins ties.

## Implementation Order

**Phase 0: Cleanup**
- Delete challenge system (components, pages, services, types, tests)
- Update router to remove challenge routes
- Clean up dashboard references

**Phase 1: Data Layer**
1. Create tournament types
2. Add `getUserMiniLeagues()` to FPL service
3. Add `getLeagueStandings()` to FPL service
4. Create bracket generation logic
5. Create tournament service (CRUD)

**Phase 2: League UI**
1. Create `LeagueCard` component
2. Create `LeagueList` component
3. Rewrite `DashboardPage` to show leagues
4. Create `LeaguePage` (route + basic structure)

**Phase 3: Tournament UI**
1. Create `MatchCard` component
2. Create `RoundSection` component
3. Create `BracketView` component
4. Create `CreateTournamentButton` component
5. Integrate into `LeaguePage`

**Phase 4: Score Processing**
1. Add score fetching on page load
2. Implement winner determination (client-side)
3. Implement round advancement
4. Add "Last updated" timestamp display

**Phase 5: Polish & Edge Cases**
- Error handling for FPL API failures
- Loading states throughout
- Empty states (no leagues, league too big)
- E2E testing

## Success Criteria

- [ ] User can see all their FPL mini-leagues on dashboard
- [ ] User can click a league and see its details
- [ ] User can create tournament with one click
- [ ] Bracket generates correctly with seeding and byes
- [ ] Scores display correctly after gameweek ends
- [ ] Winners determined correctly (with tiebreaker)
- [ ] Bracket advances to next round
- [ ] Mobile-friendly vertical list UI
- [ ] No console errors
- [ ] Critical flows have tests
