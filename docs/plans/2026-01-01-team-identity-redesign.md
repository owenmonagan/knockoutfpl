# Team Identity Section Redesign

## Overview

Update the `TeamIdentity` component on the Leagues/Dashboard page to match the design mockup, adding FPL stats badges, a sync button, and an edit team link.

## Current State

The current `TeamIdentity` component is minimal:
- Team name (h1)
- Manager name (p)
- No styling, badges, or actions

## Design Requirements

Based on design mockup at `/Users/owen/Downloads/stitch_knockout_fpl_landing_page_2/screen.png`

### Layout

Card container with flexbox layout:
- **Desktop**: Content on left, sync button on right
- **Mobile**: Stacked vertically (content above, button below full-width)

### Content (Left Side)

1. **Team name row**
   - Large bold heading (text-2xl sm:text-3xl)
   - Small pencil/edit icon next to name
   - Edit icon navigates to `/connect` to change linked team

2. **Manager subtitle**
   - Muted text: "Manager: {name}"

3. **Badges row** (horizontal, wrapped)
   - **Overall Rank badge**
     - Leaderboard icon (`leaderboard` material symbol)
     - Text: "OR: {rank}" (formatted with k/m suffix for large numbers)
     - Primary accent styling (green background tint, primary text)
   - **Gameweek Points badge**
     - Trending icon (`trending_up` material symbol)
     - Text: "GW{number}: {points} pts"
     - Neutral styling (muted background, white text)

### Action (Right Side)

- **"Sync Latest Data" button**
  - Primary variant (green background)
  - Sync icon (`sync` material symbol)
  - Shows loading state while syncing
  - Triggers full data refresh (team info, leagues, matches)

### Styling

- Card with `bg-card` background
- Border with `border-border`
- Rounded corners (`rounded-xl` or `rounded-2xl`)
- Padding: `p-6 sm:p-8`
- Optional: Subtle texture overlay (as in design) - can skip for MVP

## Component Interface

```typescript
interface TeamIdentityProps {
  teamName: string;
  managerName: string;
  overallRank: number;
  gameweekNumber: number;
  gameweekPoints: number;
  onSync: () => void;
  onEditTeam: () => void;
  isSyncing?: boolean;
}
```

## Data Requirements

All data is already available from existing FPL API calls:

| Field | Source |
|-------|--------|
| `teamName` | `getFPLTeamInfo()` - already used |
| `managerName` | `getFPLTeamInfo()` - already used |
| `overallRank` | `getFPLTeamInfo()` - need to extract from response |
| `gameweekNumber` | `getFPLBootstrapData()` - already fetched |
| `gameweekPoints` | `getFPLTeamInfo()` or entry history - may need additional field |

## Files to Modify

1. **`src/components/dashboard/TeamIdentity.tsx`** - Complete rewrite
2. **`src/components/dashboard/TeamIdentity.test.tsx`** - Update tests
3. **`src/pages/LeaguesPage.tsx`** - Pass new props, add sync handler
4. **`src/services/fpl.ts`** - Ensure `overallRank` and `gameweekPoints` are returned

## Out of Scope

- Team avatar (FPL doesn't provide avatars)
- Texture/pattern overlay on card (nice-to-have, not essential)

## Decision Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Avatar | Skip entirely | FPL doesn't provide team avatars |
| Sync button | Refresh page data | User wants functional sync |
| Edit team | Small icon next to name | Subtle, doesn't compete with sync |
