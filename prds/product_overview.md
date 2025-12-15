# PRD: FPL Mini-League Knockout Tournaments

> **Status:** In Development
> **Last Updated:** December 15, 2025
> **Version:** 1.0

---

## Progress Tracker

### Week 1: Data Layer + Backend
| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Create Tournament types (`Tournament`, `TournamentParticipant`, `TournamentMatch`, `TournamentRound`) | [ ] | `src/types/tournament.ts` |
| 2 | Add FPL Service: `getUserMiniLeagues()` | [ ] | Extend `src/services/fpl.ts` |
| 3 | Add FPL Service: `getLeagueStandings()` | [ ] | Extend `src/services/fpl.ts` |
| 4 | Create Tournament Service: `createTournament()` | [ ] | `src/services/tournament.ts` |
| 5 | Create Tournament Service: `getTournament()` | [ ] | |
| 6 | Create Tournament Service: `updateTournament()` | [ ] | |
| 7 | Implement bracket generation algorithm | [ ] | Seeding + bye logic |
| 8 | Create Cloud Function: `processTournamentRounds` | [ ] | `functions/src/tournamentProcessing.ts` |
| 9 | Add Firestore security rules for tournaments | [ ] | `firestore.rules` |

### Week 2: Core UI (Simple)
| # | Task | Status | Notes |
|---|------|--------|-------|
| 10 | Create `LeagueCard` component | [ ] | `src/components/leagues/` |
| 11 | Create `LeagueList` component | [ ] | |
| 12 | Create `MatchCard` component | [ ] | Basic: names + scores + winner |
| 13 | Create simple bracket list view | [ ] | Rounds as sections |
| 14 | Create `/leagues` page | [ ] | `src/pages/LeaguesPage.tsx` |
| 15 | Create `/tournament/create/:leagueId` page | [ ] | `src/pages/CreateTournamentPage.tsx` |

### Week 3: Integration + Testing
| # | Task | Status | Notes |
|---|------|--------|-------|
| 16 | Create `/tournament/:tournamentId` page | [ ] | `src/pages/TournamentPage.tsx` |
| 17 | Update Dashboard to show tournaments | [ ] | |
| 18 | Implement score fetching on page load | [ ] | |
| 19 | E2E tests for tournament creation | [ ] | |
| 20 | E2E tests for bracket viewing | [ ] | |
| 21 | Error handling & loading states | [ ] | |

### Week 4 (Future): Polish UI
| # | Task | Status | Notes |
|---|------|--------|-------|
| 22 | Mobile carousel for bracket | [ ] | Future |
| 23 | Desktop bracket with connectors | [ ] | Future |
| 24 | Animations and transitions | [ ] | Future |

**Progress:** 0/21 MVP tasks complete (0%)

---

## Product Overview

**Vision:** Transform Knockout FPL from 1v1 challenges into a tournament platform for FPL mini-leagues. Users can create bracket-style knockout tournaments for their mini-leagues, with matches spanning gameweeks like the NBA Cup playoffs.

**Value Proposition:** Bring the excitement of knockout tournaments to your FPL mini-league. See who's truly the best in a winner-takes-all bracket.

**Design Philosophy:** Modern, clean, simple. Inspired by Google x Figma x Ramp.

---

## Core Requirements

| Requirement | Decision |
|-------------|----------|
| **Scope** | Fresh start/pivot, reuse auth & FPL integrations |
| **Round timing** | One round per gameweek (QF GW15 → SF GW16 → F GW17) |
| **Tiebreaker** | Higher mini-league rank wins; fallback to random if same rank |
| **Odd players** | Auto-bye to next round (no "play vs average") |
| **Bracket size** | Exact league size (no artificial padding) |
| **Seeding** | By mini-league rank (1st vs last, 2nd vs 2nd-last, etc.) |
| **Permissions** | Any league member can create tournament |
| **Joining** | Auto-include all league members |
| **Scoring** | Auto-refresh on page load (fetch from FPL API) |
| **Platform** | Mobile-first |
| **Tech stack** | React + shadcn/ui + Tailwind (current stack) |
| **MVP Priority** | Full automation first, simple UI second |

---

## User Flows

### Flow 1: Onboarding (Existing)
```
Landing Page → Sign Up → Connect FPL Team → Dashboard
```
*Reuse existing auth & FPL connection flow*

### Flow 2: View Mini-Leagues (NEW)
```
Dashboard → "My Leagues" tab → See all FPL mini-leagues
```
- Fetch leagues from `/api/fpl/entry/{teamId}/` → `leagues.classic[]`
- Display: League name, member count, user's rank

### Flow 3: Create Tournament (NEW)
```
My Leagues → Select League → "Create Tournament" →
Choose Start Gameweek → Confirm → Bracket Generated
```
- Fetch standings from `/api/fpl/leagues-classic/{leagueId}/standings/`
- Auto-seed by rank, generate bracket, save to Firestore

### Flow 4: View Bracket (NEW)
```
Dashboard → "My Tournaments" → Select Tournament → View Bracket
```
- Mobile: Round-by-round carousel with swipe navigation
- Desktop: Full horizontal bracket with connector lines
- Scores fetched on page load from FPL API

### Flow 5: Tournament Progression (Automatic)
```
Gameweek Ends → Cloud Function → Fetch Scores →
Determine Winners → Update Bracket → Notify Users
```

---

## Data Model (Firestore)

### Collection: `tournaments`

```typescript
interface Tournament {
  tournamentId: string;           // Document ID
  fplLeagueId: number;            // FPL mini-league ID
  fplLeagueName: string;          // Cached at creation

  creatorUserId: string;          // Firebase Auth UID
  creatorFplId: number;

  startGameweek: number;          // First round gameweek
  currentRound: number;           // Active round (1-indexed)
  status: 'pending' | 'active' | 'completed';

  participants: TournamentParticipant[];
  rounds: TournamentRound[];

  winnerFplId: number | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt: Timestamp | null;
}

interface TournamentParticipant {
  fplTeamId: number;
  fplTeamName: string;
  managerName: string;
  seed: number;                   // 1 = top seed
  initialLeagueRank: number;
}

interface TournamentRound {
  roundNumber: number;
  roundName: string;              // "Quarter-Finals", "Semi-Finals", "Final"
  gameweek: number;
  matches: TournamentMatch[];
  isComplete: boolean;
}

interface TournamentMatch {
  matchId: string;
  participant1FplId: number | null;
  participant1Seed: number | null;
  participant2FplId: number | null;  // null = BYE
  participant2Seed: number | null;
  winnerFplId: number | null;
  isBye: boolean;
  tiebreakReason: 'higher_rank' | 'random' | null;
}
```

### What We Store vs Fetch

| Data | Store | Fetch | Why |
|------|-------|-------|-----|
| Tournament structure | ✓ | | Core app state |
| Participants (snapshot) | ✓ | | Fixed at creation |
| Match winners | ✓ | | Permanent record |
| Gameweek scores | | ✓ | Changes until GW ends |
| User's mini-leagues | | ✓ | Can change |

---

## UI Components (Mobile-First)

### New Components to Build

```
src/components/
  leagues/
    LeagueList.tsx              # List user's mini-leagues
    LeagueCard.tsx              # Single league with create button

  bracket/
    BracketView.tsx             # Main container (carousel/grid switch)
    RoundCarousel.tsx           # Mobile swipe navigation
    BracketGrid.tsx             # Desktop horizontal layout
    MatchCard.tsx               # Individual matchup
    RoundIndicator.tsx          # Round pills/tabs

  tournament/
    TournamentList.tsx          # User's tournaments
    TournamentCard.tsx          # Tournament summary card
    CreateTournamentForm.tsx    # Gameweek selector + confirm
```

### Mobile Bracket Layout (Carousel)
```
+---------------------------+
|  Tournament Name          |
|  [QF] [SF] [F]           |  ← Tappable round pills
+---------------------------+
|  +---------------------+  |
|  | Team A    45 pts    |  |  ← Winner highlighted
|  | Team B    42 pts    |  |
|  +---------------------+  |
|                           |
|  +---------------------+  |
|  | Team C    [BYE]     |  |
|  +---------------------+  |
|                           |
|  ← Swipe for next round → |
+---------------------------+
```

### Match Status Visual States
- **Upcoming:** Muted, "GW X" badge, no scores
- **Live:** Pulsing indicator, provisional scores
- **Completed:** Winner highlighted (green border), loser muted
- **Bye:** Single team, "BYE" badge

---

## FPL API Integration

### New Endpoints Needed

```typescript
// Get user's mini-leagues (extend existing getFPLTeamInfo)
// Endpoint: /api/fpl/entry/{teamId}/
// Returns: leagues.classic[] array

interface FPLMiniLeague {
  id: number;
  name: string;
  entry_rank: number;           // User's rank in this league
}

async function getUserMiniLeagues(teamId: number): Promise<FPLMiniLeague[]>

// Get league standings
// Endpoint: /api/fpl/leagues-classic/{leagueId}/standings/

interface LeagueStanding {
  entry: number;                // FPL team ID
  entry_name: string;
  player_name: string;
  rank: number;
  event_total: number;          // Current GW points
  total: number;                // Season total
}

async function getLeagueStandings(leagueId: number): Promise<LeagueStanding[]>
```

### Existing Endpoints (Reuse)
- `getFPLTeamInfo(teamId)` - Team info
- `getFPLGameweekScore(teamId, gameweek)` - GW score
- `getCurrentGameweek()` - Current/next GW

---

## Pages & Routes

| Route | Page | Auth Required |
|-------|------|---------------|
| `/` | Landing | No |
| `/login` | Login | No |
| `/signup` | Sign Up | No |
| `/dashboard` | Dashboard (pivot to tournaments) | Yes |
| `/leagues` | My Mini-Leagues | Yes |
| `/tournament/create/:leagueId` | Create Tournament | Yes |
| `/tournament/:tournamentId` | View Bracket | Yes |

---

## Cloud Functions

### Existing (Reuse)
- `fplProxy` - CORS proxy for FPL API

### New
```typescript
// Scheduled: Process tournament rounds
// Runs every 2 hours after gameweek ends
async function processTournamentRounds() {
  // Find active tournaments where current round GW is finished
  // Fetch scores for all matches
  // Determine winners (handle tiebreakers)
  // Update bracket, advance to next round
  // Mark final tournament as completed
}
```

---

## Bracket Generation Algorithm

### Seeding Logic
```
For N participants ranked 1 to N:
- Seed 1 plays Seed N
- Seed 2 plays Seed N-1
- Seed 3 plays Seed N-2
- etc.
```

### Bye Logic
```
For odd number of participants:
- Calculate byes needed to reach next power of 2
- Award byes to top seeds (lowest seed numbers)
- Example: 5 participants → 3 byes → Seeds 1, 2, 3 get byes
```

### Round Naming
```typescript
function getRoundName(totalRounds: number, roundNumber: number): string {
  const roundsFromFinal = totalRounds - roundNumber + 1;
  switch (roundsFromFinal) {
    case 1: return 'Final';
    case 2: return 'Semi-Finals';
    case 3: return 'Quarter-Finals';
    case 4: return 'Round of 16';
    case 5: return 'Round of 32';
    default: return `Round ${roundNumber}`;
  }
}
```

### Tiebreaker Resolution
```typescript
function resolveWinner(score1: number, score2: number, seed1: number, seed2: number) {
  if (score1 > score2) return { winner: 1, reason: null };
  if (score2 > score1) return { winner: 2, reason: null };

  // Tie: higher seed (lower number) wins
  if (seed1 < seed2) return { winner: 1, reason: 'higher_rank' };
  if (seed2 < seed1) return { winner: 2, reason: 'higher_rank' };

  // Same seed (shouldn't happen): random
  return { winner: Math.random() < 0.5 ? 1 : 2, reason: 'random' };
}
```

---

## Critical Files

### Existing (Reuse/Extend)
- `src/services/fpl.ts` - Add mini-league endpoints
- `src/types/user.ts` - User type reference
- `src/contexts/AuthContext.tsx` - Auth state
- `firestore.rules` - Add tournament rules
- `functions/src/` - Cloud Functions

### New Files
- `src/types/tournament.ts` - Tournament types
- `src/services/tournament.ts` - Firestore CRUD
- `src/components/leagues/*.tsx` - League components
- `src/components/bracket/*.tsx` - Bracket components
- `src/pages/LeaguesPage.tsx`
- `src/pages/TournamentPage.tsx`
- `src/pages/CreateTournamentPage.tsx`
- `functions/src/tournamentProcessing.ts`

---

## Success Criteria

- [ ] User can see all their FPL mini-leagues
- [ ] User can create a tournament for any league
- [ ] Bracket generates correctly with seeding
- [ ] Byes awarded to top seeds for odd numbers
- [ ] Scores display correctly on page load
- [ ] Winners determined after gameweek ends
- [ ] Bracket advances to next round automatically
- [ ] Mobile UI is touch-friendly
- [ ] No console errors
- [ ] All critical flows have E2E tests

---

## Out of MVP Scope (Future)

- Fancy carousel/grid bracket visualization
- Desktop bracket with connector lines
- Notifications when rounds complete
- Tournament history/stats
- Multiple tournaments per league
- Custom tournament rules (chips allowed/banned)
- Live scoring during gameweeks
- Tournament chat/comments
