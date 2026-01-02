# No Tournament Empty State Design

**Date:** 2026-01-01
**Status:** Implemented

## Overview

Implement a polished empty state for the LeaguePage when no tournament exists. Replaces the current basic Card UI with a visually engaging design that matches the app's green/dark theme.

## Component

**File:** `src/components/league/NoTournamentEmptyState.tsx`

### Props Interface

```typescript
interface NoTournamentEmptyStateProps {
  leagueName: string;        // e.g., "London Pub League"
  managerCount: number;      // e.g., 12 (dynamic from league data)
  isAuthenticated: boolean;  // From useAuth()
  onCreate: () => void;      // Opens gameweek selector / triggers creation
}
```

### Usage in LeaguePage

```tsx
<NoTournamentEmptyState
  leagueName={leagueInfo.name}
  managerCount={leagueInfo.memberCount}
  isAuthenticated={!!user}
  onCreate={() => setShowCreateDialog(true)}
/>
```

## Visual Structure

The component renders a centered card (`max-w-lg`) with three sections:

### 1. Hero Area (top)

- Height: `h-48` (~192px)
- Gradient background: darker green at top (`bg-secondary`) fading to card background
- Subtle dot pattern overlay using CSS radial-gradient at 10% opacity
- Trophy icon: `emoji_events` material symbol (text-6xl) inside circular `bg-primary/20` container with backdrop blur

### 2. Content Body (middle)

- Centered text alignment, padding `px-8 pb-10 pt-2`
- Headline: "No Tournament Yet" (`text-2xl md:text-3xl`, `font-bold`)
- Subtext: "Be the first to create a knockout tournament for **{leagueName}**"
  - League name rendered with `font-semibold text-foreground`
  - Rest of text in `text-muted-foreground`
- CTA Button area (see Auth Variations below)

### 3. How It Works Section (bottom)

- Background: `bg-secondary` with `border-border/50` border, rounded-lg
- Header: "HOW IT WORKS" (`text-xs`, `uppercase`, `tracking-wider`, `text-muted-foreground`)
- Three feature rows with `gap-4`:

| Icon | Title | Description |
|------|-------|-------------|
| `leaderboard` | Auto-Seeding | All {managerCount} managers auto-seeded by current rank |
| `swords` | Head-to-Head | Head-to-head matches each gameweek |
| `sync` | Auto-Updates | Scores update automatically from FPL |

Each row:
- Icon: `text-primary`, `text-[20px]`
- Title: `text-sm`, `font-medium`
- Description: `text-xs`, `text-muted-foreground`

## Auth State Variations

### Logged-in User

- CTA renders existing `<CreateTournamentButton onCreate={onCreate} />`
- This component includes the gameweek selector dropdown
- Green primary button styling with glow effect

### Logged-out User

- Brief text: "Sign in to create a knockout tournament"
- CTA: `<Button>` linking to `/signup`
- Button text: "Sign Up to Create Tournament"
- Same green primary styling with `btn-glow` class

## Data Requirements

### New Service Function

Add to `src/services/fpl.ts`:

```typescript
export interface FPLLeagueInfo {
  id: number;
  name: string;
  memberCount: number;
}

export async function getLeagueInfo(leagueId: number): Promise<FPLLeagueInfo> {
  const response = await fetch(`/api/fpl/leagues-classic/${leagueId}/standings/`);

  if (!response.ok) {
    throw new Error('Failed to fetch league info');
  }

  const data = await response.json();

  return {
    id: data.league.id,
    name: data.league.name,
    memberCount: data.standings?.results?.length || 0,
  };
}
```

**Note:** For leagues with 50+ members, `memberCount` may be capped at first page size due to API pagination. Acceptable for MVP.

### Updated LeaguePage Data Flow

```
1. Extract leagueId from URL params
2. Fetch league info (name, memberCount) via getLeagueInfo()
3. Fetch tournament by leagueId (existing logic)
4. If tournament exists → render BracketView
5. If no tournament → render NoTournamentEmptyState with league info
```

## Changes to LeaguePage

1. **Remove** the yellow "Sign in to claim your team" banner (lines 107-114)
2. **Add** league info fetch on mount
3. **Replace** the basic Card empty state with `<NoTournamentEmptyState />`
4. **Update** loading skeleton to account for league info fetch

## Styling Notes

- Uses existing Tailwind theme colors (`primary`, `secondary`, `muted-foreground`, etc.)
- Uses existing utility classes (`btn-glow`, `text-glow`)
- Material Symbols icons (already loaded via Google Fonts)
- Responsive: `text-2xl md:text-3xl` for headline, `w-full md:w-auto` for button

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/league/NoTournamentEmptyState.tsx` | Create |
| `src/services/fpl.ts` | Add `getLeagueInfo` function |
| `src/pages/LeaguePage.tsx` | Update to use new component and fetch league info |

## Reference Design

Design mockup located at:
`/Users/owen/Downloads/stitch_knockout_fpl_landing_page/empty_state_-_no_tournaments_yet/screen.png`
