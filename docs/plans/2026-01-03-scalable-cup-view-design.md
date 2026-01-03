# Scalable Cup View Design

> Design spec for tournament view that handles 48K+ participants (24K matches per round)

**Date:** 2026-01-03
**Status:** Draft
**Inspired by:** FA Cup app design patterns

---

## Overview & Goals

### Problem Statement

The current `BracketView` component works for small tournaments (≤64 participants) but breaks down at scale. With tournaments of 48K+ participants (24K matches per round), we need a fundamentally different approach inspired by how the FA Cup app handles large knockout competitions.

### Design Goals

1. **Scale gracefully** - Handle 48K participants without performance degradation
2. **Personalize first** - User's own journey is the hero content
3. **Social context** - Surface friends' matches to increase engagement
4. **Progressive disclosure** - Load what matters, defer the rest
5. **Familiar patterns** - Tab-based navigation like FA Cup app

### User States

The experience adapts based on user identity:

| State | Description | Experience |
|-------|-------------|------------|
| **Identified + In Tournament** | User's FPL team is linked and they're a participant | Full personalized experience |
| **Identified + Not In Tournament** | User's FPL team is linked but not in this tournament | Can browse, prompted to find friends |
| **Unidentified** | No FPL team linked | Prompted to search for their team |

---

## Tab Structure

### Navigation Pattern

Horizontal scrollable tabs at top of the tournament view (mobile-first):

```
┌─────────────────────────────────────────────────────────┐
│  League Name                                 [Share]    │
├─────────────────────────────────────────────────────────┤
│  Overview   Matches   Participants   Bracket            │
│  ────────                                               │
└─────────────────────────────────────────────────────────┘
```

### Tab Definitions

| Tab | Purpose | Content |
|-----|---------|---------|
| **Overview** | Personal dashboard | Your match, tournament stats, gameweek status |
| **Matches** | Browse all matches | Grouped list with round selector dropdown |
| **Participants** | Browse all teams | Grouped list of all participants with status |
| **Bracket** | Visual bracket | Final 5 rounds, traditional bracket layout |
| **Groups** *(future)* | Group stage tables | Your group, friends' groups, all groups |

### Default Tab Logic

- Landing on tournament → **Overview** tab
- Deep link to specific match → **Matches** tab with match highlighted
- Deep link to specific team → **Participants** tab with team highlighted

### Tab Persistence

Selected tab persists in URL query param (`?tab=matches`) so users can share/bookmark specific views.

---

## Overview Tab

### Purpose

Your personal tournament dashboard - the first thing you see.

### Layout (Mobile-First)

```
┌─────────────────────────────────┐
│ Premier League Fans             │
│ Quarter-Finals • GW28           │
├─────────────────────────────────┤
│                                 │
│  ┌───────────────────────────┐  │
│  │ YOUR MATCH                 │  │
│  │ ─────────────────────────  │  │
│  │ Live • GW28                │  │
│  │                            │  │
│  │ Your Team Name        124  │  │
│  │ Opponent Name         118  │  │
│  │                            │  │
│  │         [View Details →]   │  │
│  └───────────────────────────┘  │
│                                 │
│  TOURNAMENT PROGRESS            │
│  ┌───────────────────────────┐  │
│  │ Round 6 of 15              │  │
│  │ ████████░░░░░░░  40%       │  │
│  │                            │  │
│  │ 6,144 of 49,152 remain     │  │
│  │ Your seed: #847            │  │
│  │ You're still in!           │  │
│  └───────────────────────────┘  │
│                                 │
│  FRIENDS                        │
│  ┌───────────────────────────┐  │
│  │ 3 of 5 friends still in    │  │
│  │                            │  │
│  │ @Mike - Playing now        │  │
│  │ @Sarah - Won (142-128)     │  │
│  │ @Dave - Eliminated R3      │  │
│  └───────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

### Content Blocks

| Block | Visibility | Content |
|-------|------------|---------|
| **Your Match** | Identified + in tournament | Current/next match with live score or result |
| **Find Your Team** | Unidentified | Search prompt (existing `TeamSearchOverlay`) |
| **Tournament Progress** | Always | Round, progress bar, remaining count |
| **Your Status** | Identified + in tournament | Seed, still in/eliminated status |
| **Friends** | Has friends in tournament | Summary + mini list of friend statuses |
| **Gameweek Status** | Always | "Live now" / "Starts in 3 days" / "Complete" |

### Touch Targets

- Your Match card: tappable → expands to match detail or navigates to Matches tab
- Friend rows: tappable → navigates to their match in Matches tab
- All interactive elements ≥ 44px touch target

---

## Matches Tab

### Purpose

Browse all matches for any round, grouped by relevance to you.

### Layout (Mobile-First)

```
┌─────────────────────────────────┐
│ Overview  [Matches]  Participants│
├─────────────────────────────────┤
│                                 │
│  ┌───────────────────────────┐  │
│  │ Quarter-Finals        ▼   │  │
│  └───────────────────────────┘  │
│                                 │
│  YOU                            │
│  ┌───────────────────────────┐  │
│  │ Live                       │  │
│  │ Your Team Name        124  │  │
│  │ Opponent Name         118  │  │
│  └───────────────────────────┘  │
│                                 │
│  FRIENDS                        │
│  ┌───────────────────────────┐  │
│  │ FT                         │  │
│  │ Mike's Team           142  │  │
│  │ Some Opponent         128  │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ Live                       │  │
│  │ Sarah's Team          98   │  │
│  │ Another Team          103  │  │
│  └───────────────────────────┘  │
│                                 │
│  WHO'S NEXT?                    │
│  ┌───────────────────────────┐  │
│  │ Live                       │  │
│  │ Potential Opp A       131  │  │
│  │ Potential Opp B       127  │  │
│  └───────────────────────────┘  │
│                                 │
│  EVERYONE ELSE                  │
│  ┌───────────────────────────┐  │
│  │ FT                         │  │
│  │ Random Team A         156  │  │
│  │ Random Team B         134  │  │
│  └───────────────────────────┘  │
│           ...                   │
│  ┌───────────────────────────┐  │
│  │      Load More (50)        │  │
│  └───────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

### Round Selector Dropdown

Tapping the dropdown shows all rounds:

```
┌───────────────────────────────┐
│ All Rounds                    │
│ Round 1                       │
│ Round 2                       │
│ ...                           │
│ Quarter-Finals    ← current   │
│ Semi-Finals                   │
│ Final                         │
└───────────────────────────────┘
```

### Match Card Component

Compact card optimized for lists:

```
┌───────────────────────────────┐
│ Live               GW28       │  ← Status pill + gameweek
│ Team Name Here           124  │  ← Team 1 + score (bold if winning)
│ Other Team Name          118  │  ← Team 2 + score
└───────────────────────────────┘
```

### Status Indicators

| Status | Display |
|--------|---------|
| Upcoming | `GW29` (muted) |
| Live | `Live` (green) |
| Complete | `FT` |
| Bye | `BYE` (muted) |

### Section Visibility Rules

| Section | When Visible |
|---------|--------------|
| You | User identified + in tournament + has match this round |
| Friends | User has friends with matches this round |
| Who's Next? | User still in + not in final + potential opponents exist |
| Everyone Else | Always |

---

## Participants Tab

### Purpose

Browse all teams in the tournament with their current status.

### Layout (Mobile-First)

```
┌─────────────────────────────────┐
│ Overview  Matches  [Participants]│
├─────────────────────────────────┤
│                                 │
│  49,152 participants            │
│  6,144 remaining                │
│                                 │
│  YOU                            │
│  ┌───────────────────────────┐  │
│  │ Your Team Name             │  │
│  │ #847 seed • Still in       │  │
│  │ Won 6 matches              │  │
│  └───────────────────────────┘  │
│                                 │
│  FRIENDS (5)                    │
│  ┌───────────────────────────┐  │
│  │ Mike's Team                │  │
│  │ #234 seed • Still in       │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ Sarah's Team               │  │
│  │ #1,203 seed • Still in     │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ Dave's Team                │  │
│  │ #8,421 seed • Out R3       │  │
│  └───────────────────────────┘  │
│                                 │
│  EVERYONE ELSE                  │
│  ┌───────────────────────────┐  │
│  │ Top Seed FC                │  │
│  │ #1 seed • Still in         │  │
│  └───────────────────────────┘  │
│           ...                   │
│  ┌───────────────────────────┐  │
│  │      Load More (50)        │  │
│  └───────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

### Participant Card Component

```
┌───────────────────────────────┐
│ Team Name Here                │  ← Team name (tappable)
│ #847 seed • Still in          │  ← Seed + status
└───────────────────────────────┘
```

### Status Display

| Status | Display |
|--------|---------|
| Still in | `Still in` |
| Eliminated | `Out R3` (shows round eliminated) |
| Winner | `Champion` |

### Sort Order

"Everyone Else" section sorted by:
1. Still in first, eliminated last
2. Within still-in: by seed ascending (#1, #2, #3...)
3. Within eliminated: by round eliminated descending (lasted longest first)

### Tap Action

Tapping a participant card → navigates to Matches tab filtered/scrolled to that team's current/last match.

---

## Bracket Tab

### Purpose

Traditional bracket visualization for final stages (max 5 rounds from final).

### Round Calculation

| Total Rounds | Rounds Shown | Starting From |
|--------------|--------------|---------------|
| 3 or fewer | All | Round 1 |
| 4 | All 4 | Round 1 |
| 5 | All 5 | Round 1 |
| 6+ | Last 5 | (Total - 4) to Final |

Example: 15-round tournament → shows Rounds 11-15 (R32 → Final)

### Layout

- Compact match cards arranged in columns (one column per round)
- Connector lines linking each match to its next-round match
- Horizontal scroll to navigate between rounds
- Final on the right, earlier rounds on the left

### Bracket Match Card (Compact)

```
┌────────────────┐
│ Team A     124 │  ← Bold if winner
│ Team B     118 │
└────────────────┘
```

### Highlighting

- Your matches: accent border/background
- Friends' matches: subtle indicator dot
- TBD slots: muted "TBD" text

### Interactions

- Horizontal swipe to pan through rounds
- Pinch to zoom (optional, if needed for 5 rounds)
- Tap match card → shows match detail modal or navigates to Matches tab

### Empty States

- Tournament not started: "Bracket available when tournament begins"
- User eliminated before shown rounds: No special highlighting, just standard view

---

## Groups Tab (Future)

### Purpose

Display group stage tables when tournament format includes groups.

### Tab Visibility

Groups tab only appears when `tournament.hasGroupStage === true`.

### Layout (Mobile-First)

```
┌─────────────────────────────────┐
│ Overview  Matches  Participants │
│ [Groups]  Bracket               │
├─────────────────────────────────┤
│                                 │
│  YOUR GROUP                     │
│  ┌───────────────────────────┐  │
│  │ Group C                    │  │
│  ├───────────────────────────┤  │
│  │ #  Team           P  W  D │  │
│  │ 1  Your Team ★    3  3  0 │  │
│  │ 2  Opponent A     3  2  1 │  │
│  │ 3  Opponent B     3  1  0 │  │
│  │ 4  Opponent C     3  0  1 │  │
│  └───────────────────────────┘  │
│                                 │
│  FRIENDS' GROUPS                │
│  ┌───────────────────────────┐  │
│  │ Group A (Mike's group)     │  │
│  ├───────────────────────────┤  │
│  │ #  Team           P  W  D │  │
│  │ 1  Some Team      3  3  0 │  │
│  │ 2  Mike's Team ●  3  2  0 │  │
│  │ ...                        │  │
│  └───────────────────────────┘  │
│                                 │
│  ALL GROUPS                     │
│  ┌───────────────────────────┐  │
│  │ Group A                    │  │
│  │ (expanded table)           │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ Group B                    │  │
│  │ (expanded table)           │  │
│  └───────────────────────────┘  │
│           ...                   │
│                                 │
└─────────────────────────────────┘
```

### Group Table Component

Compact table showing:
- Position (#)
- Team name (★ for you, ● for friends)
- Played (P)
- Won (W)
- Drawn (D)
- Points or GW score differential

### Display

All groups expanded by default for easy scanning.

---

## Data Loading Strategy

### Initial Page Load

When user lands on tournament page:

```
1. Fetch tournament metadata (name, round, status, participant count)
2. Fetch user context (their team, friends list, match status)
3. Default to Overview tab → render immediately
```

### Per-Tab Loading

| Tab | Initial Load | Deferred |
|-----|--------------|----------|
| **Overview** | Your match, stats, friends summary | — |
| **Matches** | You + Friends + Who's Next? | Everyone Else (paginated) |
| **Participants** | You + Friends | Everyone Else (paginated) |
| **Bracket** | Last 5 rounds of matches | — |

### Pagination (Everyone Else)

- Page size: 50 items
- Infinite scroll with "Load More" button at bottom
- Show skeleton loaders while fetching

### Caching Strategy

- Tournament metadata: cache for 5 minutes
- Match scores: cache for 1 minute during live gameweeks, 1 hour otherwise
- Friends list: cache for session duration
- Participant list: cache for 5 minutes

### API Endpoints Needed

| Endpoint | Returns |
|----------|---------|
| `GET /tournament/:id` | Metadata + stats |
| `GET /tournament/:id/my-context` | User's match, status, friends in tournament |
| `GET /tournament/:id/matches?round=X&offset=0&limit=50` | Paginated matches |
| `GET /tournament/:id/participants?offset=0&limit=50` | Paginated participants |
| `GET /tournament/:id/bracket` | Last 5 rounds of match data |

---

## Component Architecture

### Page Structure

```
TournamentPage
├── TournamentHeader
│   ├── League name + icon
│   ├── Status badge (Active/Complete)
│   └── Share button
├── TournamentTabs
│   └── Tab navigation (Overview | Matches | Participants | Bracket)
└── TabContent
    ├── OverviewTab
    ├── MatchesTab
    ├── ParticipantsTab
    └── BracketTab
```

### Shared Components

| Component | Used In | Purpose |
|-----------|---------|---------|
| `MatchCard` | Matches, Overview | Compact match display (status, teams, scores) |
| `ParticipantCard` | Participants | Team name, seed, status |
| `StatusPill` | MatchCard | Live/FT/Upcoming indicator |
| `GroupedList` | Matches, Participants | Sections with headers + lazy "Everyone Else" |
| `RoundSelector` | Matches | Dropdown to pick round |
| `LoadMoreButton` | GroupedList | Pagination trigger |

### New Components to Build

| Component | Description |
|-----------|-------------|
| `TournamentTabs` | Horizontal scrollable tab bar |
| `OverviewTab` | Your match card + stats + friends summary |
| `MatchesTab` | Round selector + grouped match list |
| `ParticipantsTab` | Summary stats + grouped participant list |
| `BracketTab` | Wrapper around existing `BracketLayout` (capped at 5 rounds) |
| `TournamentStats` | Progress bar, remaining count, gameweek info |
| `FriendsSummary` | "3 of 5 friends still in" + mini list |
| `FindYourTeam` | Prompt for unidentified users (reuse `TeamSearchOverlay`) |

### Reusable from Existing Codebase

- `BracketLayout` → reuse for Bracket tab (add round cap)
- `BracketMatchCard` → reuse for bracket view
- `TeamSearchOverlay` → reuse for Find Your Team
- `YourMatchesSection` → adapt for Overview tab

---

## Implementation Summary

### What's Changing

| Current | New |
|---------|-----|
| `BracketView` single component | `TournamentPage` with 4 tabs |
| Full bracket always shown | Bracket capped at 5 rounds |
| `UserPathBracket` for large tournaments | Replaced by Overview + Matches tabs |
| No friends awareness | Friends from FPL API (2+ shared leagues) |

### Component Migration

| Keep | Modify | New |
|------|--------|-----|
| `BracketLayout` | Add 5-round cap | `TournamentTabs` |
| `BracketMatchCard` | — | `OverviewTab` |
| `TeamSearchOverlay` | — | `MatchesTab` |
| `ParticipantsTable` | Refactor to `ParticipantCard` list | `ParticipantsTab` |
| | | `BracketTab` |
| | | `MatchCard` (compact) |
| | | `GroupedList` |
| | | `TournamentStats` |
| | | `FriendsSummary` |

### Data Model Additions

```typescript
// New: Friends context
interface FriendInTournament {
  fplTeamId: number;
  teamName: string;
  managerName: string;
  sharedLeagueCount: number; // must be >= 2
  status: 'in' | 'eliminated';
  eliminatedRound?: number;
}

// New: User tournament context
interface UserTournamentContext {
  isIdentified: boolean;
  isParticipant: boolean;
  fplTeamId?: number;
  currentMatch?: Match;
  status: 'in' | 'eliminated' | 'winner';
  eliminatedRound?: number;
  seed?: number;
  friends: FriendInTournament[];
  potentialOpponents: Participant[]; // "Who's Next?"
}
```

### URL Structure

```
/tournament/:id                      → Overview tab
/tournament/:id?tab=matches          → Matches tab
/tournament/:id?tab=matches&round=6  → Matches tab, specific round
/tournament/:id?tab=participants     → Participants tab
/tournament/:id?tab=bracket          → Bracket tab
```

---

## Friends Definition

Friends are determined automatically from FPL API data:

- A "friend" is any manager who shares **2 or more mini-leagues** with the current user
- Calculated by cross-referencing the user's mini-league memberships with other managers in the tournament
- No manual following/friending required
- Data fetched from FPL API on tournament load

---

## Open Questions

1. **Friends caching** - How long to cache the friends calculation? Session? 24 hours?
2. **Large friends lists** - What if user has 50+ friends in a tournament? Cap display at 10 with "See all"?
3. **Eliminated user experience** - Should eliminated users see "Who's Next?" for the person who beat them?
