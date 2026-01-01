# Dashboard Redesign Design

> **Status:** Approved
> **Created:** 2026-01-01
> **North Star:** Total page impressions

---

## Overview

Redesign the leagues page into a match-centric dashboard that answers "what's happening in my tournaments?" at a glance. The current leagues page is navigation-focused; the new design leads with active matches to drive engagement and return visits.

---

## Design Principles

1. **Matches first** — What's happening NOW is more important than league navigation
2. **Opponent-focused** — Human rivalry drives engagement, not data tables
3. **Timeline over rank** — Start/end gameweek is unique to Knockout FPL; rank is already known from FPL
4. **Click depth** — High-level preview here, click through for details

---

## Page Structure

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER (existing sticky nav)                               │
├─────────────────────────────────────────────────────────────┤
│  YOUR TEAM IDENTITY                                         │
│  Team name + Manager name                                   │
├─────────────────────────────────────────────────────────────┤
│  YOUR MATCHES                                               │
│  Current + Recent + Upcoming opponent                       │
├─────────────────────────────────────────────────────────────┤
│  YOUR LEAGUES                                               │
│  All leagues with tournament status                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Section 1: Team Identity

Minimal header showing the user's FPL identity.

### Content

| Element | Style |
|---------|-------|
| Team name | `text-2xl font-bold text-foreground` |
| Manager name | `text-muted-foreground` |

### Example

```
Haaland's Hairband FC
Manager: Owen Smith
```

### Data Source

- `FPLTeamInfo.teamName`
- `FPLTeamInfo.managerName`

---

## Section 2: Your Matches

Shows all matches relevant to the user across all tournaments.

### Match Types to Display

1. **Current matches** — This gameweek, tournaments where user is still active
2. **Recent results** — Last gameweek's results (won or lost)
3. **Upcoming opponent** — Who you'd face next round if you win current match

### Match Card Design

**Layout:** Horizontal scroll on mobile, 2-3 column grid on desktop.

#### Current Match (live/in-progress)

```
┌────────────────────────────────────────┐
│  vs Dave's Dumpster Fire               │
│  Work League · Semi-finals             │
│  52 - 48 · You're ahead                │
└────────────────────────────────────────┘
```

| Element | Content |
|---------|---------|
| Line 1 | `vs {opponent_team_name}` |
| Line 2 | `{league_name} · {round_name}` |
| Line 3 | `{your_score} - {their_score} · {status_text}` |
| Style | Primary color border, subtle glow |

**Status text logic:**
- You're ahead (winning)
- You're behind (losing)
- Tied

#### Current Match (upcoming, not started)

```
┌────────────────────────────────────────┐
│  vs Dave's Dumpster Fire               │
│  Work League · Semi-finals             │
│  GW14 · Starts Saturday                │
└────────────────────────────────────────┘
```

| Element | Content |
|---------|---------|
| Line 1 | `vs {opponent_team_name}` |
| Line 2 | `{league_name} · {round_name}` |
| Line 3 | `GW{gameweek} · Starts {day}` |
| Style | Subtle border |

#### Recent Result (won)

```
┌────────────────────────────────────────┐
│  ✓ Beat Dave's Dumpster Fire           │
│  Work League · Quarter-finals          │
│  67 - 52                               │
└────────────────────────────────────────┘
```

| Element | Content |
|---------|---------|
| Line 1 | `✓ Beat {opponent_team_name}` |
| Line 2 | `{league_name} · {round_name}` |
| Line 3 | `{your_score} - {their_score}` |
| Style | Subtle green left border |

#### Recent Result (lost)

```
┌────────────────────────────────────────┐
│  ✗ Lost to Dave's Dumpster Fire        │
│  Work League · Quarter-finals          │
│  48 - 52                               │
└────────────────────────────────────────┘
```

| Element | Content |
|---------|---------|
| Line 1 | `✗ Lost to {opponent_team_name}` |
| Line 2 | `{league_name} · {round_name}` |
| Line 3 | `{your_score} - {their_score}` |
| Style | Dimmed card, muted text |

#### Upcoming Opponent (next round preview)

```
┌────────────────────────────────────────┐
│  Next: Uncle Terry's XI                │
│  Work League · Final                   │
│  GW15 · If you win                     │
└────────────────────────────────────────┘
```

| Element | Content |
|---------|---------|
| Line 1 | `Next: {opponent_team_name}` |
| Line 2 | `{league_name} · {round_name}` |
| Line 3 | `GW{gameweek} · If you win` |
| Style | Dashed border (tentative/future) |

### Sorting

1. **By tournament progress** — Finals first, then Semi-finals, then earlier rounds
2. **Then by urgency** — Live > Upcoming > Recent results

### Empty State

When user has no active tournaments:

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  Your knockout journey starts here.                        │
│  Pick a league and create your first tournament.           │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Click Behavior

Clicking a match card navigates to the tournament bracket view, scrolled/focused to that specific match.

---

## Section 3: Your Leagues

Shows all leagues the user belongs to, with tournament status and navigation.

### League Card Design

**Layout:** 2-3 column grid on desktop, 1 column on mobile.

#### League with Active Tournament (user still alive)

```
┌────────────────────────────────────────┐
│  Work Colleagues League                │
│  14 managers · GW12 → GW15             │
│  Round 3 of 4 · You: Semi-finals       │
│  [View Tournament]                     │
└────────────────────────────────────────┘
```

| Element | Content |
|---------|---------|
| Line 1 | `{league_name}` |
| Line 2 | `{member_count} managers · GW{start} → GW{end}` |
| Line 3 | `Round {current} of {total} · You: {round_name}` |
| Button | Primary: "View Tournament" |
| Style | Primary color accent |

#### League with Active Tournament (user eliminated)

```
┌────────────────────────────────────────┐
│  Reddit r/FantasyPL Knockout           │
│  128 managers · GW8 → GW15             │
│  Round 5 of 7 · You: Eliminated R2     │
│  [View Tournament]                     │
└────────────────────────────────────────┘
```

| Element | Content |
|---------|---------|
| Line 3 | `Round {current} of {total} · You: Eliminated R{round}` |
| Style | Muted styling |

#### League with Completed Tournament (user won)

```
┌────────────────────────────────────────┐
│  Family Cup                            │
│  8 managers · GW10 → GW13              │
│  Completed · You: Winner 🏆            │
│  [View Tournament]                     │
└────────────────────────────────────────┘
```

| Element | Content |
|---------|---------|
| Line 3 | `Completed · You: Winner 🏆` |
| Style | Gold/trophy accent |

#### League with Completed Tournament (user lost)

```
┌────────────────────────────────────────┐
│  Old School Mates                      │
│  8 managers · GW10 → GW13              │
│  Completed · You: Eliminated R2        │
│  [View Tournament]                     │
└────────────────────────────────────────┘
```

| Element | Content |
|---------|---------|
| Line 3 | `Completed · You: Eliminated R{round}` |
| Style | Muted styling |

#### League without Tournament

```
┌────────────────────────────────────────┐
│  Family & Friends                      │
│  6 managers · —                        │
│  [Create Tournament]                   │
└────────────────────────────────────────┘
```

| Element | Content |
|---------|---------|
| Line 2 | `{member_count} managers · —` |
| Button | Outline/secondary: "Create Tournament" |
| Style | Dashed or subtle border |

### Sorting

1. Active tournaments (user still alive)
2. Active tournaments (user eliminated)
3. Completed tournaments
4. No tournament yet

### Click Behavior

- **View Tournament** → Navigate to `/league/{fpl_league_id}` (bracket view)
- **Create Tournament** → Navigate to `/league/{fpl_league_id}` (triggers creation flow)

---

## Data Requirements

### New Data Needed

| Field | Source | Notes |
|-------|--------|-------|
| Tournament start gameweek | `tournament.startGameweek` | Already available |
| Tournament end gameweek | Calculate: `startGameweek + totalRounds - 1` | Derived |
| Current opponent | Match data for current round | Need to fetch |
| Next opponent | Match data for next round (winner of other match) | Need to fetch |
| Recent result | Match data for previous round | Need to fetch |

### API Changes

The `getTournamentSummaryForLeague` function needs to return additional data:

```typescript
interface TournamentSummary {
  id: string;
  status: 'active' | 'completed';
  currentRound: number;
  totalRounds: number;
  startGameweek: number;      // ADD
  endGameweek: number;        // ADD (calculated)
}

interface UserProgress {
  status: 'active' | 'eliminated' | 'winner';
  eliminationRound: number | null;
  currentMatch: MatchSummary | null;    // ADD
  recentResult: MatchSummary | null;    // ADD
  nextOpponent: OpponentSummary | null; // ADD
}

interface MatchSummary {
  opponentTeamName: string;
  opponentManagerName: string;
  roundNumber: number;
  roundName: string;
  gameweek: number;
  yourScore: number | null;
  theirScore: number | null;
  isLive: boolean;
  result: 'won' | 'lost' | 'pending';
}

interface OpponentSummary {
  teamName: string;
  roundNumber: number;
  roundName: string;
  gameweek: number;
}
```

---

## Visual Styling

Uses existing theme from `docs/theme.md`:

| Element | Token |
|---------|-------|
| Page background | `bg-background` |
| Card background | `bg-card` |
| Primary accent | `text-primary` / `border-primary` |
| Muted text | `text-muted-foreground` |
| Card borders | `border-border` |
| Glow effect | `shadow-[0_0_20px_rgba(0,255,136,0.1)]` |

---

## Mobile Considerations

| Section | Mobile Behavior |
|---------|-----------------|
| Team identity | Full width, left-aligned |
| Matches | Horizontal scroll, cards ~280px wide |
| Leagues | Single column, full-width cards |

---

## Implementation Notes

### Route

This replaces the current `/leagues` page (or `/dashboard` — same content).

### Components to Create/Modify

1. **MatchCard** — New component for match display
2. **LeagueCard** — Refactor from current table row to card
3. **LeaguesPage** — Restructure to new layout

### Backwards Compatibility

- URL `/leagues` continues to work
- All existing functionality preserved (create/view tournament)
- Just a visual/UX restructure

---

## Success Metrics

Tied to North Star (page impressions):

| Metric | Target | Rationale |
|--------|--------|-----------|
| Return visits per user | +20% | Match previews create reason to check back |
| Time to first click | -30% | Matches section surfaces action immediately |
| Tournament views from eliminated users | +50% | "View Tournament" accessible even when eliminated |

---

## Out of Scope

- Live score updates (real-time websockets)
- Push notifications
- Email integration
- Historical match data beyond last gameweek

---

## Related Documents

- [theme.md](../theme.md) — Visual design system
- [tournament-experience.md](../business/product/features/tournament-experience.md) — Full tournament UX spec
- [league-browser.md](../business/product/features/league-browser.md) — Current feature spec
- [metrics.md](../business/strategy/metrics.md) — North Star and success metrics
