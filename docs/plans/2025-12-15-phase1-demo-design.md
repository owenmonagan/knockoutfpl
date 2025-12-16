# Phase 1 Demo Design — One-Week Knockout Demo

## Overview

**Goal:** Prove the knockout concept works. Show the feeling of stakes ("4 points from elimination") with minimal UI.

**Scope:** One-week demo. Not the full product — a proof of concept that demonstrates the core emotional loop.

**Entry point:** Existing auth system + FPL Team ID connection to user profile.

---

## User Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Login     │───▶│  Connect    │───▶│   Pick a    │───▶│   View      │
│  (existing) │    │  FPL Team   │    │   League    │    │  Knockout   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

1. **Login** — Uses existing auth system. Redirects to connect screen if no FPL Team ID linked.
2. **Connect FPL Team** — Enter FPL Team ID, validate via API, save to Firestore.
3. **Pick a League** — Show user's mini-leagues, tap "Start Knockout" on one.
4. **View Knockout** — Auto-generate 16-team bracket, display as list view with match cards and stakes callouts.

---

## Screen 1: Connect FPL Team

**Route:** `/connect` (redirected here after login if no FPL Team ID)

### Layout

```
┌────────────────────────────────────────────────────────────────────┐
│  [Logo]                                         [Profile ▼]        │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│                      Connect Your FPL Team                         │
│                                                                    │
│              Let's see what you're made of.                        │
│                                                                    │
│   FPL Team ID                                                      │
│   ┌──────────────────────────────────────────────────────────┐     │
│   │  158256                                                  │     │
│   └──────────────────────────────────────────────────────────┘     │
│   Where's my Team ID?                                              │
│                                                                    │
│         ┌──────────────────────────────────────────────┐           │
│         │              Find My Team                    │           │
│         └──────────────────────────────────────────────┘           │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Behavior

1. User enters FPL Team ID (number)
2. Click "Find My Team" → loading state ("Finding your team...")
3. Fetch `GET /api/entry/{teamId}/` from FPL API
4. **Success:** Show confirmation, save to Firestore, redirect to `/leagues`
5. **Error:** Show "Team not found. Check your ID and try again."

### Success Confirmation (1.5s auto-advance)

```
        ✓
   [Team Name FC]
   Overall Rank: 245,892

   Let's go.
```

### Help Modal

"Where's my Team ID?" opens modal explaining:
- It's in the FPL URL: `fantasy.premierleague.com/entry/[THIS NUMBER]/event/1`
- Also in FPL app: Team → Team Details → Your Team ID

---

## Screen 2: League Picker

**Route:** `/leagues`

### Layout

```
┌────────────────────────────────────────────────────────────────────┐
│  [Logo]                                         [Profile ▼]        │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│                       Your Mini Leagues                            │
│                                                                    │
│         Pick one. We'll turn it into sudden death.                 │
│                                                                    │
│   ┌────────────────────────────────────────────────────────────┐   │
│   │                                                            │   │
│   │  👥  Work Friends League                                   │   │
│   │      47 members · You're ranked #12                        │   │
│   │                                                            │   │
│   │                            ┌─────────────────────┐         │   │
│   │                            │   Start Knockout    │         │   │
│   │                            └─────────────────────┘         │   │
│   │                                                            │   │
│   └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│   ┌────────────────────────────────────────────────────────────┐   │
│   │                                                            │   │
│   │  👥  Family Cup                                            │   │
│   │      12 members · You're ranked #3                         │   │
│   │                                                            │   │
│   │                            ┌─────────────────────┐         │   │
│   │                            │   Start Knockout    │         │   │
│   │                            └─────────────────────┘         │   │
│   │                                                            │   │
│   └────────────────────────────────────────────────────────────┘   │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Behavior

1. On load, fetch user's classic leagues from FPL API
2. Display each league as a card with name, member count, user's rank
3. Click "Start Knockout" → generate bracket → navigate to `/knockout/:leagueId`

### Edge Cases

- **No leagues:** "You're not in any mini-leagues yet. Join one on the FPL site."
- **Loading:** Skeleton cards

---

## Screen 3: Knockout View (List Layout)

**Route:** `/knockout/:leagueId`

### Layout

```
┌────────────────────────────────────────────────────────────────────┐
│  [Logo]                                         [Profile ▼]        │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ← Back to Leagues                                                 │
│                                                                    │
│  WORK FRIENDS KNOCKOUT                                             │
│  16 teams · GW15 scores                                            │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ══════════════════════════════════════════════════════════════    │
│  16 REMAIN                                                         │
│  ══════════════════════════════════════════════════════════════    │
│                                                                    │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │  YOUR MATCH                                                 │  │
│   │                                                             │  │
│   │  [Your Team FC]                                    67       │  │
│   │  [Dave's Dumpster Fire]                            52       │  │
│   │                                                             │  │
│   │  ⚡ 15 points from elimination                              │  │
│   └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │  [Team A]                                          58       │  │
│   │  [Team B]                                          71 ✓     │  │
│   └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
│   ... (more matches)                                               │
│                                                                    │
│  ══════════════════════════════════════════════════════════════    │
│  8 REMAIN                                                          │
│  ══════════════════════════════════════════════════════════════    │
│                                                                    │
│   (Projected matchups from Round 1 winners)                        │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Behavior

1. Take top 16 from league standings (by FPL rank)
2. Seed bracket: #1 vs #16, #2 vs #15, etc.
3. Fetch historical gameweek scores (GW15 or similar completed GW)
4. Display as rounds: "16 REMAIN", "8 REMAIN", etc.
5. User's match pinned at top of their round with gold border
6. Winner = higher score, marked with ✓

---

## Match Card Component

### Anatomy

```
┌─────────────────────────────────────────────────────────────────┐
│  [Team 1 Name]                                         [Score]  │
│  [Team 2 Name]                                         [Score]  │
│                                                                 │
│  ⚡ [Stakes callout]                                            │
└─────────────────────────────────────────────────────────────────┘
```

### Visual Treatments

| State | Card Border | Winner Row | Stakes Callout |
|-------|-------------|------------|----------------|
| User's match | 2px gold (#C9A227) | — | Always shown |
| Other match | 1px gray-200 | — | Not shown |
| Winner row | — | ✓ after score, bold | — |
| Loser row | — | 50% opacity | — |

### Stakes Callout Copy

| Situation | Copy |
|-----------|------|
| Winning by 1-10 | ⚡ X points from elimination |
| Winning by 11-20 | ⚡ Holding on. X point cushion. |
| Winning by 21+ | ⚡ Cruising. X point lead. |
| Losing by 1-10 | ⚡ X points from survival |
| Losing by 11-20 | ⚡ X behind. Time to fight. |
| Losing by 21+ | ⚡ Danger zone. X points to make up. |
| Tied | ⚡ Dead heat. |

### Component Interface

```typescript
interface MatchCardProps {
  team1: { id: number; name: string; score: number };
  team2: { id: number; name: string; score: number };
  isUserMatch: boolean;
  userTeamId?: number;
}
```

---

## Technical Architecture

### FPL API Endpoints

| Endpoint | Purpose | When Called |
|----------|---------|-------------|
| `GET /api/entry/{teamId}/` | Validate team, get name + leagues | Connect screen |
| `GET /api/leagues-classic/{leagueId}/standings/` | Get league members + ranks | League picker, Bracket gen |
| `GET /api/entry/{teamId}/event/{gw}/picks/` | Get team's GW score | Knockout view (×16) |

### Bracket Generation

```typescript
function generateBracket(leagueStandings: Team[], gameweek: number): Round[] {
  // 1. Take top 16 by rank
  const top16 = leagueStandings.slice(0, 16);

  // 2. Seed matchups for proper bracket flow
  const matchups = [
    [top16[0], top16[15]],  // 1 vs 16
    [top16[7], top16[8]],   // 8 vs 9
    [top16[4], top16[11]],  // 5 vs 12
    [top16[3], top16[12]],  // 4 vs 13
    [top16[2], top16[13]],  // 3 vs 14
    [top16[5], top16[10]],  // 6 vs 11
    [top16[6], top16[9]],   // 7 vs 10
    [top16[1], top16[14]],  // 2 vs 15
  ];

  // 3. Fetch scores for gameweek
  // 4. Determine winners
  // 5. Generate subsequent rounds
}
```

### Database Changes

Add to `users` collection:
```typescript
{
  // existing fields...
  fplTeamId: number;      // e.g., 158256
  fplTeamName: string;    // e.g., "Owen's XI"
}
```

**No tournaments collection** — bracket generated on-the-fly for demo.

---

## Implementation Order

### Phase A: FPL Connection (Foundation)
1. Add `fplTeamId` / `fplTeamName` fields to Firestore user schema
2. Create FPL API service (team lookup, leagues fetch)
3. Build Connect FPL screen with form + validation
4. Update auth flow to redirect to connect screen if no FPL ID

### Phase B: League Picker
5. Build league standings API service
6. Build League Picker screen with cards
7. Add loading/error states

### Phase C: Bracket Logic
8. Create bracket generation utility (seeding, matchups)
9. Create stakes callout utility (copy logic)
10. Create score fetching service for gameweek

### Phase D: Knockout View
11. Build Match Card component
12. Build Round section component
13. Build Knockout View page (assembles rounds + cards)
14. Wire up "Start Knockout" → generate → display

---

## Out of Scope

- Persisting tournaments to Firestore
- Tournament creation flow with config options
- Live scores / polling
- Multiple gameweeks (demo uses single historical GW)
- Mobile optimization
- Animations / celebrations
- Email notifications
- Head-to-head detailed view

---

## Success Criteria

The demo is successful when:
1. User can log in and connect their FPL Team ID
2. User can see their mini-leagues
3. User can tap "Start Knockout" and see a bracket
4. User's match is highlighted with a stakes callout
5. The stakes callout makes them feel something

**The ultimate test:** Does this make the stakes feel real?

---

*Document Version 1.0 | December 2025*
*"Every gameweek is a cup final."*
