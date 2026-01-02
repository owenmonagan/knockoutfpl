# Your Matches Prioritization Design

**Date:** 2026-01-01
**Status:** Approved

## Problem

"Your Matches" section shows too many matches when a user is in multiple leagues, creating information overload. Users want to see only what's important right now.

## Solution

Prioritize matches to show only what matters:

1. **Primary:** Show live matches (current gameweek)
2. **Fallback:** If no live matches, show the single nearest upcoming match

Remove "recent results" from this section entirely.

## Current Behavior

- Shows both `currentMatch` and `recentResult` for every league
- With multiple leagues, this creates clutter

## New Behavior

- **Live matches first:** Any match where `isLive === true` (round gameweek equals current FPL gameweek and round not completed)
- **Fallback to next upcoming:** If no live matches exist, show the single nearest upcoming match across all leagues
- **No recent results:** Finished matches no longer shown in this section

## Implementation

### `LeaguesPage.tsx` - `aggregateMatches()` function

Currently builds array from all `currentMatch` + `recentResult` entries.

Change to:
1. Collect all `currentMatch` entries
2. Separate into `liveMatches` (where `isLive === true`) and `upcomingMatches`
3. If `liveMatches.length > 0` → return live matches only
4. Else → return the single upcoming match with lowest gameweek (or empty if none)

### `YourMatchesSection.tsx`

No changes needed - already handles variable-length match arrays and displays match type correctly based on `type` prop.

### Data Flow

Unchanged. `getTournamentSummaryForLeague()` already provides `isLive` and `gameweek` on matches. No backend/service changes required.

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| No leagues joined | Section hidden (existing behavior) |
| All tournaments complete | Section hidden (no matches to show) |
| Multiple live matches | Show all of them (one per league max) |
| No live, multiple upcoming | Show only the nearest one |
| Bye round (no opponent yet) | Show with "TBD" opponent (existing behavior) |

## Testing

### Unit Tests for `aggregateMatches()`

- Live matches only → returns live matches
- No live, has upcoming → returns single nearest upcoming
- No live, no upcoming → returns empty array
- Mixed: 2 live + 3 upcoming → returns only the 2 live

### E2E Verification

- Login with test account
- Verify only relevant matches display
- Confirm no console errors
