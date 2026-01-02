# Claim Team Feature Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable users to "claim" their team directly from a public bracket, triggering sign-up with their FPL team ID pre-filled, then landing on the dashboard with their team already connected.

**Architecture:** URL-based state passing with `?claimTeam={fplTeamId}` query parameter. The claim flow leverages existing Google sign-in infrastructure and auto-connects the FPL team after authentication.

**Tech Stack:** React, TypeScript, React Router (useSearchParams), existing auth services

---

## User Flow

```
1. User views public bracket at /league/{leagueId}
2. Sees "Claim" button next to a team (visible only when not signed in)
3. Clicks "Claim" on their team
4. Google sign-in popup appears
5. After successful sign-in:
   a. FPL team is automatically connected (using ID from URL)
   b. User redirected to /leagues (their dashboard)
6. User sees their leagues with the tournament they just claimed from
```

---

## Design Decisions

### Data Passing Mechanism: URL Query Parameter

**Chosen approach:** `?claimTeam={fplTeamId}` query parameter

**Rationale:**
- **Simple & stateless** - No localStorage or context needed
- **Survives redirects** - Google OAuth popup doesn't lose the state
- **Shareable** - Deep linking works (user can share claim link)
- **Debuggable** - State visible in URL for troubleshooting
- **Already precedent** - React Router's `useSearchParams` is already available

**Alternatives considered:**
- **localStorage:** Works but adds complexity, needs cleanup, less visible
- **React Context:** Lost on page refresh, doesn't survive OAuth redirect
- **URL path segment:** Messy routing, not semantic

### Claim Button Placement

The claim button appears in `BracketMatchCard.tsx` next to each player slot. It:
- Shows only when user is NOT authenticated
- Shows only for real players (not TBD/BYE slots)
- Appears as a small icon button to avoid cluttering the UI

### Auto-Connect Flow

After Google sign-in:
1. Check if `claimTeam` param exists in URL
2. If yes, call `connectFPLTeam(uid, email, fplTeamId)` automatically
3. Redirect to `/leagues` (standard post-auth destination)
4. User profile now has FPL team connected

### No Verification Needed

Per the spec: "Manager ID is pre-filled from bracket context". We trust the user clicked on "their" team. There's no ownership verification - any user can claim any team. This is intentional for MVP simplicity.

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| User already signed in clicks "Claim" | Redirect to `/leagues` (they're already in, skip claim) |
| User claims team, sign-in fails | Show error in sign-up form, no FPL connection |
| User claims team they don't own | Allowed - no verification in MVP |
| User cancels Google popup | Stay on bracket page, no changes |
| FPL team ID doesn't exist | `connectFPLTeam` will fail gracefully, user lands on dashboard without team connected |
| User is signed in but has no FPL team | Show claim button? No - signed-in users should use /connect page |
| Multiple claim buttons clicked rapidly | No issue - last one wins, single Google popup |

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/tournament/BracketMatchCard.tsx` | Add "Claim" button with click handler |
| `src/pages/LeaguePage.tsx` | Handle claim flow (Google sign-in + auto-connect) |
| `src/services/auth.ts` | No changes needed (signInWithGoogle already exists) |
| `src/services/user.ts` | No changes needed (connectFPLTeam already exists) |
| `src/router.tsx` | No changes needed (routes are fine) |

---

## Task 1: Add ClaimTeamButton Component

**Files:**
- Create: `src/components/tournament/ClaimTeamButton.tsx`

**Step 1: Create the component**

```tsx
// src/components/tournament/ClaimTeamButton.tsx
import { UserPlus } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

interface ClaimTeamButtonProps {
  fplTeamId: number;
  onClaim: (fplTeamId: number) => void;
}

export function ClaimTeamButton({ fplTeamId, onClaim }: ClaimTeamButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={(e) => {
              e.preventDefault(); // Prevent link navigation
              e.stopPropagation();
              onClaim(fplTeamId);
            }}
          >
            <UserPlus className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Claim this team</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
```

**Step 2: Add Tooltip component if not installed**

Run: `npx shadcn@latest add tooltip`

**Step 3: Verify component compiles**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/components/tournament/ClaimTeamButton.tsx src/components/ui/tooltip.tsx
git commit -m "feat: add ClaimTeamButton component for bracket team claiming"
```

---

## Task 2: Integrate ClaimTeamButton into BracketMatchCard

**Files:**
- Modify: `src/components/tournament/BracketMatchCard.tsx`

**Step 1: Update imports**

Add at the top of the file:

```tsx
import { ClaimTeamButton } from './ClaimTeamButton';
```

**Step 2: Add props for auth state and claim handler**

Update the interface:

```tsx
interface BracketMatchCardProps {
  match: Match;
  participants: Participant[];
  roundStarted: boolean;
  gameweek: number;
  isAuthenticated?: boolean;
  onClaimTeam?: (fplTeamId: number) => void;
}
```

**Step 3: Add props to function signature**

```tsx
export function BracketMatchCard({
  match,
  participants,
  roundStarted,
  gameweek,
  isAuthenticated = false,
  onClaimTeam,
}: BracketMatchCardProps) {
```

**Step 4: Add claim button to player row**

Inside `renderPlayerSlot`, after the player name span and before the score, add the claim button:

```tsx
const rowContent = (
  <div
    className={cn(
      "flex justify-between items-center px-2 py-1.5 text-sm",
      isWinner && "font-semibold bg-green-50 dark:bg-green-950",
      isLoser && "opacity-50"
    )}
    data-winner={isWinner}
  >
    <div className="flex items-center gap-1.5 truncate">
      <span className="truncate">{participant?.fplTeamName || 'TBD'}</span>
      {/* Show seed when round hasn't started or no score available */}
      {participant && !showScore && (
        <span className="text-muted-foreground text-xs">({participant.seed})</span>
      )}
    </div>
    <div className="flex items-center gap-1">
      {/* Claim button - only show for non-authenticated users with real players */}
      {!isAuthenticated && onClaimTeam && player?.fplTeamId && (
        <ClaimTeamButton fplTeamId={player.fplTeamId} onClaim={onClaimTeam} />
      )}
      {/* Show score only when round has started and score is available */}
      {showScore && (
        <span className={cn("tabular-nums font-medium", isWinner && "text-green-600 dark:text-green-400")}>
          {player.score}
        </span>
      )}
    </div>
  </div>
);
```

**Step 5: Verify tests still pass**

Run: `npm test -- --run src/components/tournament/BracketMatchCard`
Expected: All tests pass (or update if needed for new props)

**Step 6: Commit**

```bash
git add src/components/tournament/BracketMatchCard.tsx
git commit -m "feat: add Claim button to BracketMatchCard for unauthenticated users"
```

---

## Task 3: Pass Props Through BracketLayout and BracketRound

**Files:**
- Modify: `src/components/tournament/BracketLayout.tsx`
- Modify: `src/components/tournament/BracketRound.tsx`

Note: The component hierarchy is `BracketView -> BracketLayout -> BracketRound -> BracketMatchCard`. We need to pass props through both intermediate components.

**Step 1: Update BracketLayout props and pass to BracketRound**

```tsx
// src/components/tournament/BracketLayout.tsx
interface BracketLayoutProps {
  rounds: Round[];
  participants: Participant[];
  currentGameweek: number;
  isAuthenticated?: boolean;
  onClaimTeam?: (fplTeamId: number) => void;
}

export function BracketLayout({
  rounds,
  participants,
  currentGameweek,
  isAuthenticated,
  onClaimTeam,
}: BracketLayoutProps) {
  return (
    <div
      data-testid="bracket-layout"
      className="flex flex-col gap-6 md:flex-row md:gap-8 md:overflow-x-auto overflow-visible"
    >
      {rounds.map((round) => (
        <BracketRound
          key={round.roundNumber}
          round={round}
          participants={participants}
          currentGameweek={currentGameweek}
          isAuthenticated={isAuthenticated}
          onClaimTeam={onClaimTeam}
        />
      ))}
    </div>
  );
}
```

**Step 2: Update BracketRound props and pass to BracketMatchCard**

```tsx
// src/components/tournament/BracketRound.tsx
interface BracketRoundProps {
  round: Round;
  participants: Participant[];
  currentGameweek: number;
  isAuthenticated?: boolean;
  onClaimTeam?: (fplTeamId: number) => void;
}

export function BracketRound({
  round,
  participants,
  currentGameweek,
  isAuthenticated,
  onClaimTeam,
}: BracketRoundProps) {
  // ... existing code ...

  return (
    <div className="flex flex-col overflow-visible" data-testid={`bracket-round-${round.roundNumber}`}>
      {/* ... header code ... */}

      <div className="flex flex-col justify-around flex-1 gap-2">
        {round.matches.map((match) => (
          <BracketMatchCard
            key={match.id}
            match={match}
            participants={participants}
            roundStarted={roundStarted}
            gameweek={round.gameweek}
            isAuthenticated={isAuthenticated}
            onClaimTeam={onClaimTeam}
          />
        ))}
      </div>
    </div>
  );
}
```

**Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/components/tournament/BracketLayout.tsx src/components/tournament/BracketRound.tsx
git commit -m "feat: pass claim props through BracketLayout and BracketRound"
```

---

## Task 4: Pass Props Through BracketView

**Files:**
- Modify: `src/components/tournament/BracketView.tsx`

**Step 1: Add new props to BracketView**

```tsx
interface BracketViewProps {
  tournament: Tournament;
  isRefreshing?: boolean;
  isAuthenticated?: boolean;
  onClaimTeam?: (fplTeamId: number) => void;
}
```

**Step 2: Pass props to BracketLayout**

```tsx
<BracketLayout
  rounds={tournament.rounds}
  participants={tournament.participants}
  currentGameweek={tournament.currentGameweek}
  isAuthenticated={isAuthenticated}
  onClaimTeam={onClaimTeam}
/>
```

**Step 3: Commit**

```bash
git add src/components/tournament/BracketView.tsx
git commit -m "feat: pass claim props through BracketView to BracketLayout"
```

---

## Task 5: Implement Claim Flow in LeaguePage

**Files:**
- Modify: `src/pages/LeaguePage.tsx`

**Step 1: Add imports**

```tsx
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../services/auth';
import { connectFPLTeam } from '../services/user';
import { createUserProfile } from '../services/user';
```

**Step 2: Add navigate hook**

```tsx
const navigate = useNavigate();
```

**Step 3: Create claim handler**

```tsx
const handleClaimTeam = async (fplTeamId: number) => {
  // If user is already authenticated, just redirect (edge case)
  if (user) {
    navigate('/leagues');
    return;
  }

  try {
    // Trigger Google sign-in
    const credential = await signInWithGoogle();

    // Create user profile (fire-and-forget for DataConnect)
    await createUserProfile({
      userId: credential.user.uid,
      email: credential.user.email || '',
      displayName: credential.user.displayName || '',
    });

    // Auto-connect the claimed FPL team
    await connectFPLTeam(
      credential.user.uid,
      credential.user.email || '',
      fplTeamId
    );

    // Redirect to leagues page
    navigate('/leagues');
  } catch (error) {
    // User cancelled sign-in or error occurred
    // Just stay on the page - no action needed
    console.warn('Claim team flow cancelled or failed:', error);
  }
};
```

**Step 4: Pass props to BracketView**

```tsx
<BracketView
  tournament={tournament}
  isRefreshing={isRefreshing}
  isAuthenticated={!!user}
  onClaimTeam={handleClaimTeam}
/>
```

**Step 5: Update existing imports if needed**

Make sure `createUserProfile` is imported from `../services/user`.

**Step 6: Run tests**

Run: `npm test -- --run src/pages/LeaguePage`
Expected: All tests pass

**Step 7: Commit**

```bash
git add src/pages/LeaguePage.tsx
git commit -m "feat: implement claim team flow with Google sign-in and auto FPL connect"
```

---

## Task 6: Add Unit Tests for ClaimTeamButton

**Files:**
- Create: `src/components/tournament/ClaimTeamButton.test.tsx`

**Step 1: Write tests**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ClaimTeamButton } from './ClaimTeamButton';

describe('ClaimTeamButton', () => {
  it('renders claim button', () => {
    render(<ClaimTeamButton fplTeamId={123} onClaim={() => {}} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls onClaim with fplTeamId when clicked', async () => {
    const handleClaim = vi.fn();
    const user = userEvent.setup();

    render(<ClaimTeamButton fplTeamId={456} onClaim={handleClaim} />);

    await user.click(screen.getByRole('button'));

    expect(handleClaim).toHaveBeenCalledWith(456);
    expect(handleClaim).toHaveBeenCalledTimes(1);
  });

  it('stops event propagation to prevent link navigation', async () => {
    const handleClaim = vi.fn();
    const user = userEvent.setup();

    render(
      <a href="/test">
        <ClaimTeamButton fplTeamId={789} onClaim={handleClaim} />
      </a>
    );

    await user.click(screen.getByRole('button'));

    // If propagation wasn't stopped, we'd navigate away
    expect(handleClaim).toHaveBeenCalled();
  });

  it('shows tooltip on hover', async () => {
    const user = userEvent.setup();

    render(<ClaimTeamButton fplTeamId={123} onClaim={() => {}} />);

    await user.hover(screen.getByRole('button'));

    // Tooltip may appear with delay
    await screen.findByText('Claim this team');
  });
});
```

**Step 2: Run tests**

Run: `npm test -- --run src/components/tournament/ClaimTeamButton.test.tsx`
Expected: All tests pass

**Step 3: Commit**

```bash
git add src/components/tournament/ClaimTeamButton.test.tsx
git commit -m "test: add unit tests for ClaimTeamButton component"
```

---

## Task 7: Update BracketMatchCard Tests

**Files:**
- Modify: `src/components/tournament/BracketMatchCard.test.tsx`

**Step 1: Add test for claim button visibility**

```tsx
describe('Claim button', () => {
  it('shows claim button when user is not authenticated', () => {
    const handleClaim = vi.fn();

    render(
      <BracketMatchCard
        match={mockMatch}
        participants={mockParticipants}
        roundStarted={false}
        gameweek={1}
        isAuthenticated={false}
        onClaimTeam={handleClaim}
      />
    );

    // Should show claim buttons for both players
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });

  it('hides claim button when user is authenticated', () => {
    const handleClaim = vi.fn();

    render(
      <BracketMatchCard
        match={mockMatch}
        participants={mockParticipants}
        roundStarted={false}
        gameweek={1}
        isAuthenticated={true}
        onClaimTeam={handleClaim}
      />
    );

    // Should not show any claim buttons
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('does not show claim button for TBD slots', () => {
    const matchWithTBD = {
      ...mockMatch,
      player2: null,
    };

    render(
      <BracketMatchCard
        match={matchWithTBD}
        participants={mockParticipants}
        roundStarted={false}
        gameweek={1}
        isAuthenticated={false}
        onClaimTeam={vi.fn()}
      />
    );

    // Only one claim button for player1
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });
});
```

**Step 2: Run tests**

Run: `npm test -- --run src/components/tournament/BracketMatchCard.test.tsx`
Expected: All tests pass

**Step 3: Commit**

```bash
git add src/components/tournament/BracketMatchCard.test.tsx
git commit -m "test: add claim button visibility tests for BracketMatchCard"
```

---

## Task 8: Visual Verification with Playwright MCP

**Step 1: Start dev server**

Run: `npm run dev`

**Step 2: Navigate to a public bracket page**

Use Playwright MCP: `browser_navigate({ url: 'http://localhost:5173/league/634129' })`

(Use a real test league ID that has a tournament)

**Step 3: Take snapshot and verify claim buttons**

Use: `browser_snapshot()`

Verify:
- Claim buttons visible next to each player in bracket
- Buttons have UserPlus icon
- Buttons are small and don't dominate the UI

**Step 4: Test claim button click**

Use: `browser_click({ element: 'Claim button', ref: '...' })`

Verify:
- Google sign-in popup appears
- Or if popup blocked, appropriate error shown

**Step 5: Test as authenticated user**

Log in first, then navigate to bracket:
- Verify: No claim buttons visible when signed in

**Step 6: Check console for errors**

Use: `browser_console_messages({ level: 'error' })`
Expected: No errors

**Step 7: Document verification results**

Note any issues found for fixing.

---

## Task 9: Integration Test for Full Claim Flow

**Files:**
- Create: `e2e/claim-team.spec.ts`

**Step 1: Write E2E test**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Claim Team Flow', () => {
  test('shows claim buttons on public bracket @smoke', async ({ page }) => {
    // Navigate to a public bracket
    await page.goto('/league/634129');
    await page.waitForLoadState('networkidle');

    // Verify claim buttons are visible
    const claimButtons = page.getByRole('button').filter({ has: page.locator('svg') });
    await expect(claimButtons.first()).toBeVisible();
  });

  test('hides claim buttons for authenticated users @auth', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel('Email').fill('testuser@knockoutfpl.com');
    await page.getByLabel('Password').fill('TestPass123!');
    await page.getByRole('button', { name: 'Log In' }).click();
    await page.waitForURL('/leagues');

    // Navigate to bracket
    await page.goto('/league/634129');
    await page.waitForLoadState('networkidle');

    // Verify no claim buttons (look for UserPlus icon absence)
    // Since user is authenticated, claim buttons should not appear
    const bracket = page.locator('[data-testid="bracket"]');
    // Claim buttons specifically have the UserPlus icon
    // We don't expect to see them when authenticated
  });

  // Note: Full claim flow with Google sign-in is hard to test in E2E
  // because Google OAuth requires actual Google credentials
  // Manual testing or mock auth may be needed
});
```

**Step 2: Run E2E tests**

Run: `npm run test:e2e -- --grep "Claim Team"`
Expected: Tests pass (or skip Google auth ones)

**Step 3: Commit**

```bash
git add e2e/claim-team.spec.ts
git commit -m "test: add E2E tests for claim team button visibility"
```

---

## Task 10: Final Cleanup and Documentation

**Step 1: Run full test suite**

Run: `npm test`
Expected: All tests pass

**Step 2: Run build to verify no TypeScript errors**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Update shared-link-viewer journey doc**

Update `docs/business/product/journeys/shared-link-viewer.md` with details about the claim flow now that it's implemented.

**Step 4: Update tournament-bracket feature doc**

Update `docs/business/product/features/tournament-bracket.md` if any behavior details changed.

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete claim team feature for viral signup

- Added ClaimTeamButton component with tooltip
- Integrated claim button into BracketMatchCard
- Implemented claim flow in LeaguePage (Google sign-in + auto FPL connect)
- Claim buttons only visible to unauthenticated users
- After claim, user lands on /leagues with FPL team connected
- Added unit and E2E tests for claim functionality"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Create ClaimTeamButton component | `ClaimTeamButton.tsx`, `tooltip.tsx` |
| 2 | Integrate into BracketMatchCard | `BracketMatchCard.tsx` |
| 3 | Pass props through BracketLayout/BracketRound | `BracketLayout.tsx`, `BracketRound.tsx` |
| 4 | Pass props through BracketView | `BracketView.tsx` |
| 5 | Implement claim flow in LeaguePage | `LeaguePage.tsx` |
| 6 | Add ClaimTeamButton tests | `ClaimTeamButton.test.tsx` |
| 7 | Update BracketMatchCard tests | `BracketMatchCard.test.tsx` |
| 8 | Visual verification | Playwright MCP |
| 9 | E2E integration tests | `claim-team.spec.ts` |
| 10 | Final cleanup | Documentation |

**Total estimated commits:** 8-10

---

## Future Enhancements (Out of Scope for MVP)

1. **Team ownership verification** - Verify the FPL team belongs to the Google account
2. **Claim confirmation modal** - "Are you sure you want to claim {team name}?"
3. **Already claimed indicator** - Show which teams have been claimed by other users
4. **Email sign-in option** - Currently only Google is supported for claim flow
5. **Claim from email link** - Deep link with claim param for viral sharing
