# Overview Tab Implementation Plan

> Implementation plan for the Overview tab of the Scalable Tournament View

**Date:** 2026-01-03
**Status:** Approved
**Parent Spec:** [Scalable Cup View Design](./2026-01-03-scalable-cup-view-design.md)

---

## Summary

Incremental implementation of the Overview tab for tournament view, providing a personalized dashboard for users to see their match, tournament progress, and upcoming opponents.

---

## Decisions Made

| Decision | Choice |
|----------|--------|
| Tab scope | All 4 tabs with placeholders, focus on Overview content |
| Your Matchup layout | Vertical stacking - You on top, Opponent below |
| Styling approach | Adapt mockup to shadcn patterns, keep dark palette, use Lucide icons |
| Match History | Reuse existing `YourMatchesSection` component |
| Possible Opponents | Show the match card (not just a list) |
| Tournament Stats | Tournament-focused (remaining, round, seed, status) |
| Sibling match logic | Use `qualifiesTo` field to find match |
| Possible Opponents visibility | Always show (even if eliminated) |

---

## Component Structure

```
src/components/tournament/
├── TournamentView.tsx          # Renamed from BracketView, adds Tabs wrapper
├── OverviewTab.tsx             # Overview tab content
├── YourMatchupCard.tsx         # Hero match card (vertical layout)
├── TournamentStats.tsx         # Stats sidebar/card
├── PossibleOpponents.tsx       # Next opponent match card
├── BracketTab.tsx              # Wrapper for existing bracket views
├── ParticipantsTab.tsx         # Wrapper for existing table
├── MatchesTab.tsx              # Placeholder for future
└── [existing components...]
```

**Data Flow:**
```
LeaguePage
  └── TournamentView (receives Tournament, user context)
        ├── TournamentHeader (name, status, share)
        ├── Tabs (shadcn)
        │     ├── Overview → OverviewTab
        │     ├── Matches → MatchesTab (placeholder)
        │     ├── Participants → ParticipantsTab
        │     └── Bracket → BracketTab
        └── URL sync (?tab=overview)
```

---

## OverviewTab Layout

**Desktop (lg+):** Two-column grid
```
┌─────────────────────────────────────────────────────────┐
│ [YourMatchupCard - 2/3 width]  [TournamentStats - 1/3] │
├─────────────────────────────────────────────────────────┤
│ [FriendsActivity - 2/3]        [PossibleOpponents-1/3] │
├─────────────────────────────────────────────────────────┤
│ [MatchHistory - full width]                             │
└─────────────────────────────────────────────────────────┘
```

**Mobile:** Single column, stacked
```
┌─────────────────────┐
│ YourMatchupCard     │
├─────────────────────┤
│ FriendsActivity     │  ← placeholder for Phase 4
├─────────────────────┤
│ TournamentStats     │
├─────────────────────┤
│ PossibleOpponents   │
├─────────────────────┤
│ MatchHistory        │
└─────────────────────┘
```

**Conditional Rendering:**
| Section | Condition |
|---------|-----------|
| YourMatchupCard | User is participant + has current/upcoming match |
| TournamentStats | Always shown |
| PossibleOpponents | User has match with `qualifiesTo` (not in final) |
| FriendsActivity | Phase 4 (placeholder or hidden for now) |
| MatchHistory | User has played at least 1 match |

---

## Component Specifications

### YourMatchupCard

**Vertical layout with You on top:**

```
┌──────────────────────────────────────────────┐
│ Round 5 Active                    Live GW24  │
├──────────────────────────────────────────────┤
│                                              │
│  YOU (Seed #142)                             │
│  ┌────────────────────────────────────────┐  │
│  │ [Avatar]  O-win FC              72 pts │  │
│  │           Owen Monagan                 │  │
│  └────────────────────────────────────────┘  │
│                                              │
│                    VS                        │
│                                              │
│  OPPONENT (Seed #4005)                       │
│  ┌────────────────────────────────────────┐  │
│  │ [Avatar]  Klopps & Robbers      65 pts │  │
│  │           Sarah Jenkins                │  │
│  └────────────────────────────────────────┘  │
│                                              │
├──────────────────────────────────────────────┤
│ [View Match Details]    [Analyze Opponent]   │
└──────────────────────────────────────────────┘
```

**States:**
| State | Visual Treatment |
|-------|------------------|
| Live | Green border, pulsing dot, scores shown |
| Upcoming | Dashed border, "VS" with gameweek, no scores |
| Finished (Won) | Subtle green border, "Advanced" badge |
| Finished (Lost) | Muted styling, "Eliminated" badge |

**Props:**
```typescript
interface YourMatchupCardProps {
  match: MatchSummaryCardProps;
  yourSeed: number;
  opponentSeed?: number;
  tournamentName: string;
}
```

---

### TournamentStats

**Layout:**
```
┌─────────────────────────────────┐
│ 📊 Tournament Stats             │
├─────────────────────────────────┤
│ Teams Remaining                 │
│ 3,012 / 48,204                  │
│ [████░░░░░░░░░░░] 6%            │
├─────────────────────────────────┤
│ Current Round                   │
│ Quarter-Finals • GW28           │
│ 3 rounds remaining              │
├─────────────────────────────────┤
│ Your Status                     │
│ ┌─────────────┐ ┌─────────────┐ │
│ │ Seed        │ │ Status      │ │
│ │ #142        │ │ Active ●    │ │
│ └─────────────┘ └─────────────┘ │
└─────────────────────────────────┘
```

**Props:**
```typescript
interface TournamentStatsProps {
  totalParticipants: number;
  remainingParticipants: number;
  currentRound: number;
  totalRounds: number;
  currentRoundName: string;
  currentGameweek: number;
  userSeed?: number;
  userStatus: 'in' | 'eliminated' | 'winner' | null;
  eliminatedRound?: number;
}
```

---

### PossibleOpponents

**Layout:**
```
┌─────────────────────────────────┐
│ 👀 Possible Next Opponents      │
│ Winner of Match #1024           │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ Live • GW28                 │ │
│ │                             │ │
│ │ KDB De Bruyne          62   │ │
│ │ ─────────────────────────── │ │
│ │ No Kane No Gain        41   │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ ℹ️ If you win, you'll face the  │
│   winner in GW29                │
└─────────────────────────────────┘
```

**Logic to find sibling match:**
```typescript
function findNextOpponentMatch(
  tournament: Tournament,
  userCurrentMatch: Match
): Match | null {
  const targetMatchId = userCurrentMatch.qualifiesTo;
  if (!targetMatchId) return null; // User is in final

  // Find other match that also qualifies to same target
  for (const round of tournament.rounds) {
    for (const match of round.matches) {
      if (match.qualifiesTo === targetMatchId && match.id !== userCurrentMatch.id) {
        return match;
      }
    }
  }
  return null;
}
```

**Visibility:**
- Always shown (even if eliminated)
- If user in final: section hidden (no `qualifiesTo`)

**Footer text (always):**
> "If you win, you'll face the winner in GW[X]"

---

## Implementation Phases

### Phase 1: Tab Structure + Shell
- [ ] Add shadcn Tabs component (`npx shadcn@latest add tabs`)
- [ ] Rename `BracketView` → `TournamentView`
- [ ] Create tab wrapper with URL sync (`?tab=overview`)
- [ ] Create placeholder components for all 4 tabs
- [ ] Move existing bracket views into `BracketTab`
- [ ] Move existing `ParticipantsTable` into `ParticipantsTab`
- [ ] Create `MatchesTab` with "Coming soon" placeholder
- [ ] Create empty `OverviewTab` shell

### Phase 2: Your Matchup + Match History
- [ ] Build `YourMatchupCard` component (vertical layout)
- [ ] Integrate existing `YourMatchesSection` for match history
- [ ] Wire up data from `buildMatchesForTeam()` (already exists)
- [ ] Handle all match states (live/upcoming/finished)

### Phase 3: Tournament Stats + Possible Opponents
- [ ] Build `TournamentStats` component
- [ ] Build `PossibleOpponents` component
- [ ] Add `findNextOpponentMatch()` helper using `qualifiesTo`
- [ ] Calculate remaining participants count

### Phase 4: Friends (Future)
- [ ] FPL API integration for shared leagues
- [ ] `FriendsActivity` component
- [ ] New data fetching + caching

---

## Dependencies

- shadcn Tabs component (to be added)
- Existing `YourMatchesSection` component
- Existing `MatchSummaryCard` component
- Existing `buildMatchesForTeam()` function
- Tournament type with `qualifiesTo` field on matches
