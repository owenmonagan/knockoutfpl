# FPL Connection Page Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the FPL connection page with polished visual design, accordion help, and immediate redirect on success.

**Architecture:** Single page component (`ConnectPage.tsx`) with new FPL-specific Tailwind color tokens. Uses existing Collapsible component from shadcn. Handles both first-time connection and change-team modes with conditional UI.

**Tech Stack:** React, TypeScript, Tailwind CSS, shadcn/ui (Collapsible), Lucide icons

---

## Design Reference

### Design Decisions

- **No progress tracker** — Page stands alone, not part of a step wizard
- **No skip option** — FPL connection is required
- **Accordion for help** — Inline expandable instead of dialog/modal
- **Full visual polish** — Glowing icon, card styling, button glow effects
- **Both modes in one design** — First-time and change-team use same polished UI
- **No footer text** — Keep it clean, no terms/privacy note
- **Immediate redirect** — No success state display, redirect to `/leagues` on success

### Color Tokens

```js
"fpl-bg": "#101815",           // Page background
"fpl-surface": "#1b2822",      // Card background
"fpl-surface-light": "#273a31", // Borders, lighter surfaces
"fpl-primary": "#00ff88",      // Primary green (buttons, accents, glows)
"fpl-text-dim": "#9abcac",     // Secondary/muted text
```

### Two Modes

**First-Time Connection:**
- Heading: "Connect Your FPL Team"
- Subtext: "Enter your unique FPL Team ID to sync your leagues and automatically generate your knockout brackets."
- Input label: "FPL Team ID"
- Button: "Connect & Continue" with arrow icon

**Change Team (existing user):**
- Heading: "Change Your FPL Team"
- Subtext: "Enter a new Team ID to switch teams."
- Shows current team info box
- Input label: "New FPL Team ID"
- Button: "Switch to This Team" (no arrow)

---

## Task 1: Add FPL Color Tokens to Tailwind Config

**Files:**
- Modify: `tailwind.config.js:13-66` (colors section)

**Step 1: Add the FPL color tokens**

Add these colors inside the `colors` object in `tailwind.config.js`, after the existing brand colors (line ~21):

```js
// FPL connection page colors
'fpl-bg': '#101815',
'fpl-surface': '#1b2822',
'fpl-surface-light': '#273a31',
'fpl-primary': '#00ff88',
'fpl-text-dim': '#9abcac',
```

**Step 2: Verify the config is valid**

Run: `npm run build`
Expected: Build succeeds without errors

**Step 3: Commit**

```bash
git add tailwind.config.js
git commit -m "feat: add FPL connection page color tokens to Tailwind config"
```

---

## Task 2: Update Tests for New ConnectPage Behavior

**Files:**
- Modify: `src/pages/ConnectPage.test.tsx`

**Step 1: Update test for new subtitle text**

Change the subtitle test (line ~76-86) to expect the new copy:

```tsx
it('renders the subtitle', async () => {
  render(
    <BrowserRouter>
      <ConnectPage />
    </BrowserRouter>
  );

  await waitFor(() => {
    expect(screen.getByText(/Enter your unique FPL Team ID to sync your leagues/)).toBeInTheDocument();
  });
});
```

**Step 2: Update test for new button text**

Change the button test (line ~112-122) to expect "Connect & Continue":

```tsx
it('renders the Connect & Continue button', async () => {
  render(
    <BrowserRouter>
      <ConnectPage />
    </BrowserRouter>
  );

  await waitFor(() => {
    expect(screen.getByRole('button', { name: /Connect & Continue/i })).toBeInTheDocument();
  });
});
```

**Step 3: Update loading state test**

Change line ~140 to look for the new button text and update expected loading text:

```tsx
it('shows loading state when form is submitted', async () => {
  const user = userEvent.setup();
  (getFPLTeamInfo as ReturnType<typeof vi.fn>).mockImplementation(() => new Promise(() => {}));

  render(
    <BrowserRouter>
      <ConnectPage />
    </BrowserRouter>
  );

  await waitFor(() => {
    expect(screen.getByLabelText('FPL Team ID')).toBeInTheDocument();
  });

  await user.type(screen.getByLabelText('FPL Team ID'), '158256');
  await user.click(screen.getByRole('button', { name: /Connect & Continue/i }));

  await waitFor(() => {
    expect(screen.getByText(/Connecting.../i)).toBeInTheDocument();
  });
});
```

**Step 4: Update success test for immediate redirect (no success UI)**

Replace the success confirmation test (line ~147-174) with immediate redirect test:

```tsx
it('redirects immediately on successful team connection', async () => {
  const user = userEvent.setup();
  const mockNavigate = vi.fn();

  // Mock useNavigate
  vi.doMock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
  });

  (getFPLTeamInfo as ReturnType<typeof vi.fn>).mockResolvedValue({
    teamId: 158256,
    teamName: 'Owen FC',
    overallRank: 245892,
  });
  (connectFPLTeam as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

  render(
    <BrowserRouter>
      <ConnectPage />
    </BrowserRouter>
  );

  await waitFor(() => {
    expect(screen.getByLabelText('FPL Team ID')).toBeInTheDocument();
  });

  await user.type(screen.getByLabelText('FPL Team ID'), '158256');
  await user.click(screen.getByRole('button', { name: /Connect & Continue/i }));

  await waitFor(() => {
    expect(connectFPLTeam).toHaveBeenCalledWith('test-user-id', 'test@example.com', 158256);
    expect(window.location.href).toBe('/leagues');
  });
});
```

**Step 5: Update help accordion test**

Update the help test (line ~199-218) to test accordion instead of modal:

```tsx
it('expands help accordion when clicking "Where do I find my Team ID?"', async () => {
  const user = userEvent.setup();

  render(
    <BrowserRouter>
      <ConnectPage />
    </BrowserRouter>
  );

  await waitFor(() => {
    expect(screen.getByText(/Where do I find my Team ID/)).toBeInTheDocument();
  });

  // Accordion content should not be visible initially
  expect(screen.queryByText(/fantasy.premierleague.com\/entry/)).not.toBeInTheDocument();

  await user.click(screen.getByText(/Where do I find my Team ID/));

  await waitFor(() => {
    expect(screen.getByText(/fantasy.premierleague.com\/entry/)).toBeInTheDocument();
  });
});
```

**Step 6: Remove the old redirect test with fake timers**

Delete the test "saves team to Firestore and redirects to /leagues" (lines ~220-256) since we now have immediate redirect without the 1.5s delay.

**Step 7: Run tests to verify they fail (TDD red phase)**

Run: `npm test -- --run src/pages/ConnectPage.test.tsx`
Expected: Tests FAIL (because we haven't updated the component yet)

**Step 8: Commit the test changes**

```bash
git add src/pages/ConnectPage.test.tsx
git commit -m "test: update ConnectPage tests for redesign (failing - TDD red phase)"
```

---

## Task 3: Implement ConnectPage Redesign

**Files:**
- Modify: `src/pages/ConnectPage.tsx`

**Step 1: Update imports**

Replace the current imports with:

```tsx
import { useState, useEffect } from 'react';
import { Link, HelpCircle, ChevronDown, ArrowRight, Hash } from 'lucide-react';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../components/ui/collapsible';
import { getFPLTeamInfo, type FPLTeamInfo } from '../services/fpl';
import { useAuth } from '../contexts/AuthContext';
import { connectFPLTeam, getUserProfile } from '../services/user';
```

**Step 2: Simplify state (remove success state)**

Replace the state and constants at the top of the component:

```tsx
export function ConnectPage() {
  const { user } = useAuth();
  const [teamId, setTeamId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentTeam, setCurrentTeam] = useState<FPLTeamInfo | null>(null);
  const [isLoadingCurrentTeam, setIsLoadingCurrentTeam] = useState(true);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
```

**Step 3: Keep the existing useEffect for fetching current team**

The existing `fetchCurrentTeam` useEffect stays the same (lines ~46-65).

**Step 4: Update handleSubmit for immediate redirect**

```tsx
const handleSubmit = async () => {
  if (!user?.uid || !user?.email) return;

  setIsLoading(true);
  setError('');
  try {
    const info = await getFPLTeamInfo(Number(teamId));
    await connectFPLTeam(user.uid, user.email, info.teamId);
    // Immediate redirect on success
    window.location.href = '/leagues';
  } catch {
    setError('Team not found. Check your ID and try again.');
    setIsLoading(false);
  }
};
```

**Step 5: Remove success state rendering and old redirect useEffects**

Delete all the code related to:
- `teamInfo` state
- `SUCCESS_STORAGE_KEY`
- `redirectScheduled` module-level flag
- The success state `if (teamInfo)` rendering block
- Both redirect-related useEffects

**Step 6: Implement the new JSX structure**

Replace the return statement with the full redesigned UI:

```tsx
const isChangingTeam = currentTeam !== null;

// Show loading state while checking for existing team
if (isLoadingCurrentTeam) {
  return (
    <main className="min-h-screen bg-fpl-bg flex items-center justify-center p-4">
      <p className="text-fpl-text-dim">Loading...</p>
    </main>
  );
}

return (
  <main className="min-h-screen bg-fpl-bg flex items-center justify-center p-4">
    <div className="w-full max-w-[540px]">
      {/* Card */}
      <div className="bg-fpl-surface border border-fpl-surface-light rounded-xl shadow-2xl p-6 md:p-8 flex flex-col gap-8">
        {/* Hero / Icon */}
        <div className="flex flex-col items-center text-center gap-4">
          <div className="size-16 rounded-full bg-fpl-surface-light border border-[#395648] flex items-center justify-center shadow-inner relative group">
            <Link className="size-8 text-fpl-primary" />
            {/* Decorative glow */}
            <div className="absolute inset-0 bg-fpl-primary/20 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {isChangingTeam ? 'Change Your FPL Team' : 'Connect Your FPL Team'}
            </h1>
            <p className="text-fpl-text-dim text-base max-w-[380px] mx-auto leading-relaxed">
              {isChangingTeam
                ? 'Enter a new Team ID to switch teams.'
                : 'Enter your unique FPL Team ID to sync your leagues and automatically generate your knockout brackets.'}
            </p>
          </div>
        </div>

        {/* Current Team Display (change mode only) */}
        {isChangingTeam && (
          <div className="bg-fpl-surface-light/50 border border-fpl-surface-light rounded-lg p-4 space-y-1">
            <p className="text-sm text-fpl-text-dim">Currently connected:</p>
            <p className="font-medium text-white">{currentTeam.teamName}</p>
            <p className="text-sm text-fpl-text-dim">
              Overall Rank: {currentTeam.overallRank?.toLocaleString()}
            </p>
          </div>
        )}

        {/* Input Form */}
        <div className="flex flex-col gap-6">
          {/* Input Field */}
          <div className="flex flex-col gap-2 w-full">
            <Label htmlFor="team-id" className="text-white text-sm font-semibold ml-1">
              {isChangingTeam ? 'New FPL Team ID' : 'FPL Team ID'}
            </Label>
            <div className="relative flex items-center">
              <Input
                id="team-id"
                type="text"
                value={teamId}
                onChange={(e) => {
                  setTeamId(e.target.value);
                  setError(''); // Clear error on input change
                }}
                placeholder="e.g. 582194"
                className="w-full bg-fpl-bg border-fpl-surface-light text-white text-lg placeholder:text-fpl-surface-light rounded-lg h-14 pl-4 pr-12 focus:ring-2 focus:ring-fpl-primary focus:border-fpl-primary transition-all font-mono tracking-wide"
              />
              <div className="absolute right-4 text-fpl-text-dim pointer-events-none">
                <Hash className="size-5" />
              </div>
            </div>
            {error && (
              <p className="text-sm text-destructive ml-1">{error}</p>
            )}
          </div>

          {/* Accordion Help */}
          <Collapsible open={isHelpOpen} onOpenChange={setIsHelpOpen}>
            <CollapsibleTrigger className="flex w-full cursor-pointer items-center justify-between p-4 bg-fpl-bg border border-fpl-surface-light rounded-lg hover:bg-fpl-surface-light/30 transition-colors">
              <div className="flex items-center gap-3">
                <HelpCircle className="size-5 text-fpl-primary" />
                <span className="text-white text-sm font-medium">Where do I find my Team ID?</span>
              </div>
              <ChevronDown className={`size-5 text-fpl-text-dim transition-transform ${isHelpOpen ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-fpl-bg border border-t-0 border-fpl-surface-light rounded-b-lg px-4 pb-4 pt-4">
              <div className="flex flex-col gap-3">
                <p className="text-fpl-text-dim text-sm leading-relaxed">
                  Log in to the official Fantasy Premier League website. Click on the <strong className="text-white">Points</strong> tab. Your ID is the number in the URL after <code className="bg-fpl-surface-light px-1 py-0.5 rounded text-fpl-primary font-mono text-xs">/entry/</code>.
                </p>
                <div className="rounded bg-[#0a0f0d] p-3 border border-fpl-surface-light/50 font-mono text-xs text-fpl-text-dim truncate">
                  <span className="opacity-50">https://fantasy.premierleague.com/entry/</span>
                  <span className="text-fpl-primary font-bold bg-fpl-primary/10 px-1 rounded">582194</span>
                  <span className="opacity-50">/event/1</span>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Submit Button */}
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !teamId.trim()}
            className="w-full h-12 bg-fpl-primary hover:bg-[#00e676] active:scale-[0.98] transition-all rounded-lg flex items-center justify-center gap-2 text-fpl-bg font-bold text-base shadow-[0_0_20px_rgba(0,255,136,0.15)] hover:shadow-[0_0_25px_rgba(0,255,136,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span>Connecting...</span>
            ) : isChangingTeam ? (
              <span>Switch to This Team</span>
            ) : (
              <>
                <span>Connect & Continue</span>
                <ArrowRight className="size-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  </main>
);
```

**Step 7: Run tests to verify they pass**

Run: `npm test -- --run src/pages/ConnectPage.test.tsx`
Expected: All tests PASS

**Step 8: Run full test suite**

Run: `npm test`
Expected: All tests PASS

**Step 9: Commit**

```bash
git add src/pages/ConnectPage.tsx
git commit -m "feat: redesign ConnectPage with polished UI and immediate redirect"
```

---

## Task 4: Visual Verification with Playwright MCP

**Step 1: Start dev server**

Run: `npm run dev`

**Step 2: Navigate to connect page**

Use Playwright MCP: `browser_navigate({ url: 'http://localhost:5173/connect' })`

**Step 3: Take snapshot of first-time user view**

Use: `browser_snapshot()`
Verify:
- Dark background (`#101815`)
- Centered card with glowing link icon
- "Connect Your FPL Team" heading
- "FPL Team ID" label
- "Connect & Continue" button with arrow

**Step 4: Test accordion interaction**

Use: `browser_click({ element: 'Where do I find my Team ID?', ref: '...' })`
Use: `browser_snapshot()`
Verify:
- Accordion expanded
- URL example visible with highlighted "582194"
- Chevron rotated

**Step 5: Test form submission**

Use: `browser_type({ element: 'FPL Team ID input', ref: '...', text: '158256' })`
Use: `browser_click({ element: 'Connect & Continue button', ref: '...' })`
Verify: Redirects to `/leagues`

**Step 6: Check console for errors**

Use: `browser_console_messages({ level: 'error' })`
Expected: No errors

**Step 7: Commit if all visual checks pass**

```bash
git add -A
git commit -m "test: verify ConnectPage redesign with Playwright MCP"
```

---

## Task 5: Test Change-Team Mode (with existing user profile)

**Step 1: Mock existing user profile in test**

Add a new test in `ConnectPage.test.tsx`:

```tsx
it('shows change-team mode for users with existing FPL team', async () => {
  // Mock getUserProfile to return an existing profile
  const { getUserProfile } = await import('../services/user');
  (getUserProfile as ReturnType<typeof vi.fn>).mockResolvedValue({
    fplTeamId: 123456,
  });
  (getFPLTeamInfo as ReturnType<typeof vi.fn>).mockResolvedValue({
    teamId: 123456,
    teamName: 'Existing Team',
    overallRank: 100000,
  });

  render(
    <BrowserRouter>
      <ConnectPage />
    </BrowserRouter>
  );

  await waitFor(() => {
    expect(screen.getByText('Change Your FPL Team')).toBeInTheDocument();
    expect(screen.getByText('Enter a new Team ID to switch teams.')).toBeInTheDocument();
    expect(screen.getByText('Currently connected:')).toBeInTheDocument();
    expect(screen.getByText('Existing Team')).toBeInTheDocument();
    expect(screen.getByLabelText('New FPL Team ID')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Switch to This Team' })).toBeInTheDocument();
  });
});
```

**Step 2: Run tests**

Run: `npm test -- --run src/pages/ConnectPage.test.tsx`
Expected: All tests PASS

**Step 3: Commit**

```bash
git add src/pages/ConnectPage.test.tsx
git commit -m "test: add change-team mode test for ConnectPage"
```

---

## Task 6: Final Cleanup and Documentation

**Step 1: Run full test suite**

Run: `npm test`
Expected: All 622+ tests PASS

**Step 2: Run build to verify no TypeScript errors**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Update this plan with completion status**

Mark all tasks as completed in this file.

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete FPL connection page redesign

- Added FPL color tokens to Tailwind config
- Redesigned ConnectPage with polished card UI
- Replaced Dialog with Collapsible accordion for help
- Implemented immediate redirect on success
- Added glowing icon and button effects
- Supports both first-time and change-team modes
- Updated all tests for new behavior"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Add FPL color tokens | `tailwind.config.js` |
| 2 | Update tests (TDD red) | `ConnectPage.test.tsx` |
| 3 | Implement redesign | `ConnectPage.tsx` |
| 4 | Visual verification | Playwright MCP |
| 5 | Test change-team mode | `ConnectPage.test.tsx` |
| 6 | Final cleanup | All files |

**Total estimated commits:** 6-7
