# Phase 1 Demo Implementation Plan

> **Status:** ✅ **COMPLETED** - December 16, 2025
>
> All 8 tasks implemented. 327 unit tests passing, 2 E2E tests passing.
> See commits: `599f23d`, `72858e6`, `66203dd`, `eae2126`, `ceaa3b4`

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the one-week knockout demo that proves the knockout concept works — showing the feeling of stakes with minimal UI.

**Architecture:** Three new routes (`/connect`, `/leagues`, `/knockout/:leagueId`) with redirect logic after login. Enhance existing components (LeagueCard, MatchCard) with stakes callouts. Generate bracket on-the-fly without persisting to Firestore.

**Tech Stack:** React 18, TypeScript, shadcn/ui, Tailwind CSS, Firebase Auth, FPL API (proxied)

---

## Overview

The demo has 4 screens:
1. **Login** → Existing, needs redirect logic
2. **Connect FPL Team** (`/connect`) → New dedicated page
3. **League Picker** (`/leagues`) → New page using enhanced LeagueCard
4. **Knockout View** (`/knockout/:leagueId`) → New page with on-the-fly bracket generation

### Existing Code to Leverage

| Component | Location | Status |
|-----------|----------|--------|
| Auth system | `src/services/auth.ts`, `src/contexts/AuthContext.tsx` | ✓ Ready |
| FPL API service | `src/services/fpl.ts` | ✓ Ready |
| User service | `src/services/user.ts` | ✓ Ready |
| FPLConnectionCard | `src/components/dashboard/FPLConnectionCard.tsx` | Partial - extract form |
| LeagueCard | `src/components/leagues/LeagueCard.tsx` | Needs enhancement |
| MatchCard | `src/components/tournament/MatchCard.tsx` | Needs stakes callouts |
| Bracket utils | `src/lib/bracket.ts` | ✓ Ready |

---

## Task 1: Create Stakes Callout Utility

**Files:**
- Create: `src/lib/stakes.ts`
- Test: `src/lib/stakes.test.ts`

This utility generates the emotional copy shown below matches based on score differential.

**Step 1: Write the failing test for winning scenarios**

```typescript
// src/lib/stakes.test.ts
import { describe, it, expect } from 'vitest';
import { getStakesCallout } from './stakes';

describe('getStakesCallout', () => {
  describe('when user is winning', () => {
    it('returns "X points from elimination" when ahead by 1-10 points', () => {
      const result = getStakesCallout(67, 62, true);
      expect(result).toBe('⚡ 5 points from elimination');
    });

    it('returns "X points from elimination" when ahead by exactly 1', () => {
      const result = getStakesCallout(50, 49, true);
      expect(result).toBe('⚡ 1 point from elimination');
    });

    it('returns "Holding on. X point cushion." when ahead by 11-20 points', () => {
      const result = getStakesCallout(80, 65, true);
      expect(result).toBe('⚡ Holding on. 15 point cushion.');
    });

    it('returns "Cruising. X point lead." when ahead by 21+ points', () => {
      const result = getStakesCallout(90, 65, true);
      expect(result).toBe('⚡ Cruising. 25 point lead.');
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- stakes.test.ts`
Expected: FAIL with "getStakesCallout is not a function" or similar

**Step 3: Write minimal implementation for winning scenarios**

```typescript
// src/lib/stakes.ts
export function getStakesCallout(
  userScore: number,
  opponentScore: number,
  isUserMatch: boolean
): string {
  if (!isUserMatch) return '';

  const diff = userScore - opponentScore;
  const absDiff = Math.abs(diff);

  if (diff > 0) {
    // User is winning
    if (absDiff === 1) {
      return '⚡ 1 point from elimination';
    } else if (absDiff <= 10) {
      return `⚡ ${absDiff} points from elimination`;
    } else if (absDiff <= 20) {
      return `⚡ Holding on. ${absDiff} point cushion.`;
    } else {
      return `⚡ Cruising. ${absDiff} point lead.`;
    }
  }

  return '';
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- stakes.test.ts`
Expected: PASS

**Step 5: Add tests for losing scenarios**

```typescript
// Add to src/lib/stakes.test.ts
describe('when user is losing', () => {
  it('returns "X points from survival" when behind by 1-10 points', () => {
    const result = getStakesCallout(55, 62, true);
    expect(result).toBe('⚡ 7 points from survival');
  });

  it('returns "1 point from survival" when behind by exactly 1', () => {
    const result = getStakesCallout(49, 50, true);
    expect(result).toBe('⚡ 1 point from survival');
  });

  it('returns "X behind. Time to fight." when behind by 11-20 points', () => {
    const result = getStakesCallout(50, 65, true);
    expect(result).toBe('⚡ 15 behind. Time to fight.');
  });

  it('returns "Danger zone. X points to make up." when behind by 21+ points', () => {
    const result = getStakesCallout(40, 70, true);
    expect(result).toBe('⚡ Danger zone. 30 points to make up.');
  });
});
```

**Step 6: Run test to verify it fails**

Run: `npm test -- stakes.test.ts`
Expected: FAIL on losing scenarios

**Step 7: Implement losing scenarios**

```typescript
// Update src/lib/stakes.ts - add else branch
if (diff > 0) {
  // User is winning (existing code)
  // ...
} else if (diff < 0) {
  // User is losing
  if (absDiff === 1) {
    return '⚡ 1 point from survival';
  } else if (absDiff <= 10) {
    return `⚡ ${absDiff} points from survival`;
  } else if (absDiff <= 20) {
    return `⚡ ${absDiff} behind. Time to fight.`;
  } else {
    return `⚡ Danger zone. ${absDiff} points to make up.`;
  }
}
```

**Step 8: Run test to verify it passes**

Run: `npm test -- stakes.test.ts`
Expected: PASS

**Step 9: Add tests for tied and non-user matches**

```typescript
// Add to src/lib/stakes.test.ts
describe('when tied', () => {
  it('returns "Dead heat." when scores are equal', () => {
    const result = getStakesCallout(65, 65, true);
    expect(result).toBe('⚡ Dead heat.');
  });
});

describe('when not user match', () => {
  it('returns empty string for non-user matches', () => {
    const result = getStakesCallout(70, 50, false);
    expect(result).toBe('');
  });
});
```

**Step 10: Run test to verify it fails**

Run: `npm test -- stakes.test.ts`
Expected: FAIL on tied scenario

**Step 11: Implement tied scenario**

```typescript
// Update src/lib/stakes.ts - add else branch at end
} else {
  // Tied
  return '⚡ Dead heat.';
}
```

**Step 12: Run all tests to verify they pass**

Run: `npm test -- stakes.test.ts`
Expected: All PASS

**Step 13: Commit**

```bash
git add src/lib/stakes.ts src/lib/stakes.test.ts
git commit -m "$(cat <<'EOF'
feat(stakes): add stakes callout utility

Generates emotional copy for match cards based on score differential.
Handles winning, losing, tied, and non-user match scenarios.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Create Connect FPL Page

**Files:**
- Create: `src/pages/ConnectPage.tsx`
- Create: `src/pages/ConnectPage.test.tsx`
- Modify: `src/router.tsx` (add route)

The Connect page is the first experience after login for users without an FPL Team ID linked.

**Step 1: Write test for basic rendering**

```typescript
// src/pages/ConnectPage.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConnectPage } from './ConnectPage';

// Mock AuthContext
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-id', displayName: 'Test User' },
  }),
}));

// Mock user service
vi.mock('../services/user', () => ({
  connectFPLTeam: vi.fn(),
}));

// Mock FPL service
vi.mock('../services/fpl', () => ({
  getFPLTeamInfo: vi.fn(),
}));

describe('ConnectPage', () => {
  it('renders the page title', () => {
    render(
      <BrowserRouter>
        <ConnectPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Connect Your FPL Team')).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- ConnectPage.test.tsx`
Expected: FAIL with module not found

**Step 3: Create minimal ConnectPage component**

```typescript
// src/pages/ConnectPage.tsx
export function ConnectPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Connect Your FPL Team</h1>
        </div>
      </div>
    </main>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- ConnectPage.test.tsx`
Expected: PASS

**Step 5: Add test for subtitle**

```typescript
// Add to ConnectPage.test.tsx
it('renders the subtitle', () => {
  render(
    <BrowserRouter>
      <ConnectPage />
    </BrowserRouter>
  );

  expect(screen.getByText("Let's see what you're made of.")).toBeInTheDocument();
});
```

**Step 6: Run test to verify it fails**

Run: `npm test -- ConnectPage.test.tsx`
Expected: FAIL

**Step 7: Add subtitle**

```typescript
// Update ConnectPage.tsx
<p className="text-muted-foreground">Let's see what you're made of.</p>
```

**Step 8: Run test to verify it passes**

Run: `npm test -- ConnectPage.test.tsx`
Expected: PASS

**Step 9: Add test for team ID input**

```typescript
// Add to ConnectPage.test.tsx
it('renders the FPL Team ID input', () => {
  render(
    <BrowserRouter>
      <ConnectPage />
    </BrowserRouter>
  );

  expect(screen.getByLabelText('FPL Team ID')).toBeInTheDocument();
});
```

**Step 10: Run test to verify it fails**

Run: `npm test -- ConnectPage.test.tsx`
Expected: FAIL

**Step 11: Add input with label**

```typescript
// Update ConnectPage.tsx - add imports and form
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { useState } from 'react';

export function ConnectPage() {
  const [teamId, setTeamId] = useState('');

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Connect Your FPL Team</h1>
          <p className="text-muted-foreground">Let's see what you're made of.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="team-id">FPL Team ID</Label>
          <Input
            id="team-id"
            type="text"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            placeholder="158256"
          />
        </div>
      </div>
    </main>
  );
}
```

**Step 12: Run test to verify it passes**

Run: `npm test -- ConnectPage.test.tsx`
Expected: PASS

**Step 13: Add test for "Where's my Team ID?" link**

```typescript
// Add to ConnectPage.test.tsx
it('renders the help link', () => {
  render(
    <BrowserRouter>
      <ConnectPage />
    </BrowserRouter>
  );

  expect(screen.getByText("Where's my Team ID?")).toBeInTheDocument();
});
```

**Step 14: Run test to verify it fails**

Run: `npm test -- ConnectPage.test.tsx`
Expected: FAIL

**Step 15: Add help link**

```typescript
// Add after Input in ConnectPage.tsx
import { Button } from '../components/ui/button';

// Inside the form div, after Input:
<button
  type="button"
  className="text-sm text-muted-foreground underline hover:text-foreground"
>
  Where's my Team ID?
</button>
```

**Step 16: Run test to verify it passes**

Run: `npm test -- ConnectPage.test.tsx`
Expected: PASS

**Step 17: Add test for submit button**

```typescript
// Add to ConnectPage.test.tsx
it('renders the Find My Team button', () => {
  render(
    <BrowserRouter>
      <ConnectPage />
    </BrowserRouter>
  );

  expect(screen.getByRole('button', { name: 'Find My Team' })).toBeInTheDocument();
});
```

**Step 18: Run test to verify it fails**

Run: `npm test -- ConnectPage.test.tsx`
Expected: FAIL

**Step 19: Add submit button**

```typescript
// Add after help link in ConnectPage.tsx
<Button type="button" className="w-full" size="lg">
  Find My Team
</Button>
```

**Step 20: Run test to verify it passes**

Run: `npm test -- ConnectPage.test.tsx`
Expected: PASS

**Step 21: Commit basic UI**

```bash
git add src/pages/ConnectPage.tsx src/pages/ConnectPage.test.tsx
git commit -m "$(cat <<'EOF'
feat(connect): add ConnectPage basic UI

Renders title, subtitle, team ID input, help link, and submit button.
Styled with shadcn/ui components.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

**Step 22: Add test for form submission loading state**

```typescript
// Add to ConnectPage.test.tsx
import userEvent from '@testing-library/user-event';
import { waitFor } from '@testing-library/react';
import { getFPLTeamInfo } from '../services/fpl';

it('shows loading state when form is submitted', async () => {
  const user = userEvent.setup();
  (getFPLTeamInfo as vi.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

  render(
    <BrowserRouter>
      <ConnectPage />
    </BrowserRouter>
  );

  await user.type(screen.getByLabelText('FPL Team ID'), '158256');
  await user.click(screen.getByRole('button', { name: 'Find My Team' }));

  await waitFor(() => {
    expect(screen.getByText('Finding your team...')).toBeInTheDocument();
  });
});
```

**Step 23: Run test to verify it fails**

Run: `npm test -- ConnectPage.test.tsx`
Expected: FAIL

**Step 24: Implement loading state**

```typescript
// Update ConnectPage.tsx
export function ConnectPage() {
  const [teamId, setTeamId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await getFPLTeamInfo(Number(teamId));
    } catch {
      // Handle error later
    }
  };

  return (
    // ... existing JSX
    <Button
      type="button"
      className="w-full"
      size="lg"
      onClick={handleSubmit}
      disabled={isLoading}
    >
      {isLoading ? 'Finding your team...' : 'Find My Team'}
    </Button>
  );
}
```

**Step 25: Run test to verify it passes**

Run: `npm test -- ConnectPage.test.tsx`
Expected: PASS

**Step 26: Add test for successful team lookup**

```typescript
// Add to ConnectPage.test.tsx
it('shows success confirmation after finding team', async () => {
  const user = userEvent.setup();
  (getFPLTeamInfo as vi.Mock).mockResolvedValue({
    teamId: 158256,
    teamName: 'Owen FC',
    overallRank: 245892,
  });

  render(
    <BrowserRouter>
      <ConnectPage />
    </BrowserRouter>
  );

  await user.type(screen.getByLabelText('FPL Team ID'), '158256');
  await user.click(screen.getByRole('button', { name: 'Find My Team' }));

  await waitFor(() => {
    expect(screen.getByText('Owen FC')).toBeInTheDocument();
    expect(screen.getByText('Overall Rank: 245,892')).toBeInTheDocument();
    expect(screen.getByText("Let's go.")).toBeInTheDocument();
  });
});
```

**Step 27: Run test to verify it fails**

Run: `npm test -- ConnectPage.test.tsx`
Expected: FAIL

**Step 28: Implement success state**

```typescript
// Update ConnectPage.tsx
import { CheckCircle } from 'lucide-react';
import { getFPLTeamInfo, type FPLTeamInfo } from '../services/fpl';

export function ConnectPage() {
  const [teamId, setTeamId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [teamInfo, setTeamInfo] = useState<FPLTeamInfo | null>(null);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const info = await getFPLTeamInfo(Number(teamId));
      setTeamInfo(info);
    } catch {
      // Handle error later
    } finally {
      setIsLoading(false);
    }
  };

  if (teamInfo) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <h2 className="text-xl font-bold">{teamInfo.teamName}</h2>
          <p className="text-muted-foreground">
            Overall Rank: {teamInfo.overallRank?.toLocaleString()}
          </p>
          <p className="text-lg font-medium">Let's go.</p>
        </div>
      </main>
    );
  }

  return (
    // ... existing form JSX
  );
}
```

**Step 29: Run test to verify it passes**

Run: `npm test -- ConnectPage.test.tsx`
Expected: PASS

**Step 30: Add test for error state**

```typescript
// Add to ConnectPage.test.tsx
it('shows error message when team not found', async () => {
  const user = userEvent.setup();
  (getFPLTeamInfo as vi.Mock).mockRejectedValue(new Error('Not found'));

  render(
    <BrowserRouter>
      <ConnectPage />
    </BrowserRouter>
  );

  await user.type(screen.getByLabelText('FPL Team ID'), '999999');
  await user.click(screen.getByRole('button', { name: 'Find My Team' }));

  await waitFor(() => {
    expect(screen.getByText('Team not found. Check your ID and try again.')).toBeInTheDocument();
  });
});
```

**Step 31: Run test to verify it fails**

Run: `npm test -- ConnectPage.test.tsx`
Expected: FAIL

**Step 32: Implement error state**

```typescript
// Update ConnectPage.tsx
const [error, setError] = useState('');

const handleSubmit = async () => {
  setIsLoading(true);
  setError('');
  try {
    const info = await getFPLTeamInfo(Number(teamId));
    setTeamInfo(info);
  } catch {
    setError('Team not found. Check your ID and try again.');
  } finally {
    setIsLoading(false);
  }
};

// In JSX, after the input:
{error && (
  <p className="text-sm text-destructive">{error}</p>
)}
```

**Step 33: Run test to verify it passes**

Run: `npm test -- ConnectPage.test.tsx`
Expected: PASS

**Step 34: Add test for saving to Firestore and redirecting**

```typescript
// Add to ConnectPage.test.tsx
import { connectFPLTeam } from '../services/user';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

it('saves team to Firestore and redirects to /leagues', async () => {
  const user = userEvent.setup();
  vi.useFakeTimers();

  (getFPLTeamInfo as vi.Mock).mockResolvedValue({
    teamId: 158256,
    teamName: 'Owen FC',
    overallRank: 245892,
  });

  render(
    <BrowserRouter>
      <ConnectPage />
    </BrowserRouter>
  );

  await user.type(screen.getByLabelText('FPL Team ID'), '158256');
  await user.click(screen.getByRole('button', { name: 'Find My Team' }));

  await waitFor(() => {
    expect(connectFPLTeam).toHaveBeenCalledWith('test-user-id', 158256);
  });

  // Advance timer for auto-redirect (1.5s)
  vi.advanceTimersByTime(1500);

  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith('/leagues');
  });

  vi.useRealTimers();
});
```

**Step 35: Run test to verify it fails**

Run: `npm test -- ConnectPage.test.tsx`
Expected: FAIL

**Step 36: Implement save and redirect**

```typescript
// Update ConnectPage.tsx
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { connectFPLTeam } from '../services/user';

export function ConnectPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  // ... existing state

  const handleSubmit = async () => {
    if (!user?.uid) return;

    setIsLoading(true);
    setError('');
    try {
      const info = await getFPLTeamInfo(Number(teamId));
      await connectFPLTeam(user.uid, info.teamId);
      setTeamInfo(info);
    } catch {
      setError('Team not found. Check your ID and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-redirect after success
  useEffect(() => {
    if (teamInfo) {
      const timer = setTimeout(() => {
        navigate('/leagues');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [teamInfo, navigate]);

  // ... rest of component
}
```

**Step 37: Run test to verify it passes**

Run: `npm test -- ConnectPage.test.tsx`
Expected: PASS

**Step 38: Commit form functionality**

```bash
git add src/pages/ConnectPage.tsx src/pages/ConnectPage.test.tsx
git commit -m "$(cat <<'EOF'
feat(connect): add form submission with loading, success, and error states

- Shows loading state during FPL API call
- Displays success confirmation with team name and rank
- Shows error message if team not found
- Saves team to Firestore and auto-redirects to /leagues after 1.5s

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

**Step 39: Add help modal test**

```typescript
// Add to ConnectPage.test.tsx
it('opens help modal when clicking "Where\'s my Team ID?"', async () => {
  const user = userEvent.setup();

  render(
    <BrowserRouter>
      <ConnectPage />
    </BrowserRouter>
  );

  await user.click(screen.getByText("Where's my Team ID?"));

  await waitFor(() => {
    expect(screen.getByText(/fantasy.premierleague.com\/entry/)).toBeInTheDocument();
  });
});
```

**Step 40: Run test to verify it fails**

Run: `npm test -- ConnectPage.test.tsx`
Expected: FAIL

**Step 41: Implement help modal**

```typescript
// Update ConnectPage.tsx - add Dialog imports and state
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';

// Replace the help button with:
<Dialog>
  <DialogTrigger asChild>
    <button
      type="button"
      className="text-sm text-muted-foreground underline hover:text-foreground"
    >
      Where's my Team ID?
    </button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Finding Your Team ID</DialogTitle>
    </DialogHeader>
    <DialogDescription asChild>
      <div className="space-y-4">
        <p>Your Team ID is in the FPL URL:</p>
        <code className="block bg-muted p-2 rounded text-sm">
          fantasy.premierleague.com/entry/<strong>[THIS NUMBER]</strong>/event/1
        </code>
        <p>Or in the FPL app: Team → Team Details → Your Team ID</p>
      </div>
    </DialogDescription>
  </DialogContent>
</Dialog>
```

**Step 42: Run test to verify it passes**

Run: `npm test -- ConnectPage.test.tsx`
Expected: PASS

**Step 43: Add route to router**

```typescript
// Modify src/router.tsx - add import and route
import { ConnectPage } from './pages/ConnectPage';

// Add to routes array after /forgot-password:
{
  path: '/connect',
  element: (
    <ProtectedRoute>
      <ConnectPage />
    </ProtectedRoute>
  ),
},
```

**Step 44: Commit complete ConnectPage**

```bash
git add src/pages/ConnectPage.tsx src/pages/ConnectPage.test.tsx src/router.tsx
git commit -m "$(cat <<'EOF'
feat(connect): complete ConnectPage with help modal and routing

- Adds Dialog modal explaining where to find FPL Team ID
- Registers /connect route with ProtectedRoute wrapper
- Complete flow: input → validate → save → redirect

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Add Auth Redirect Logic

**Files:**
- Modify: `src/components/auth/ProtectedRoute.tsx`
- Test: `src/components/auth/ProtectedRoute.test.tsx` (modify existing)

Users without an FPL Team ID should be redirected to `/connect` after login.

**Step 1: Add test for redirect when no FPL Team ID**

```typescript
// Add to src/components/auth/ProtectedRoute.test.tsx
import { getUserProfile } from '../../services/user';

vi.mock('../../services/user', () => ({
  getUserProfile: vi.fn(),
}));

describe('FPL Team redirect', () => {
  it('redirects to /connect when user has no FPL Team ID', async () => {
    (getUserProfile as vi.Mock).mockResolvedValue({
      userId: 'test-user-id',
      fplTeamId: 0,
      fplTeamName: '',
    });

    // Mock authenticated user
    vi.mocked(useAuth).mockReturnValue({
      user: { uid: 'test-user-id' } as any,
      isLoading: false,
      connectionError: null,
      retryConnection: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Dashboard</div>
              </ProtectedRoute>
            }
          />
          <Route path="/connect" element={<div>Connect Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Connect Page')).toBeInTheDocument();
    });
  });

  it('does not redirect when user has FPL Team ID', async () => {
    (getUserProfile as vi.Mock).mockResolvedValue({
      userId: 'test-user-id',
      fplTeamId: 158256,
      fplTeamName: 'Owen FC',
    });

    vi.mocked(useAuth).mockReturnValue({
      user: { uid: 'test-user-id' } as any,
      isLoading: false,
      connectionError: null,
      retryConnection: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Dashboard</div>
              </ProtectedRoute>
            }
          />
          <Route path="/connect" element={<div>Connect Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- ProtectedRoute.test.tsx`
Expected: FAIL

**Step 3: Implement redirect logic in ProtectedRoute**

```typescript
// Update src/components/auth/ProtectedRoute.tsx
import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserProfile } from '../../services/user';
import { Skeleton } from '../ui/skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading: authLoading, connectionError, retryConnection } = useAuth();
  const location = useLocation();
  const [isCheckingFpl, setIsCheckingFpl] = useState(true);
  const [hasFplTeam, setHasFplTeam] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkFplConnection() {
      if (!user?.uid) {
        setIsCheckingFpl(false);
        return;
      }

      try {
        const profile = await getUserProfile(user.uid);
        setHasFplTeam(profile && profile.fplTeamId > 0);
      } catch {
        setHasFplTeam(false);
      } finally {
        setIsCheckingFpl(false);
      }
    }

    checkFplConnection();
  }, [user?.uid]);

  // Show loading while checking auth
  if (authLoading || isCheckingFpl) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Handle connection error (existing logic)
  if (connectionError) {
    // ... existing error handling
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to connect if no FPL team (except if already on /connect)
  if (hasFplTeam === false && location.pathname !== '/connect') {
    return <Navigate to="/connect" replace />;
  }

  return <>{children}</>;
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- ProtectedRoute.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/auth/ProtectedRoute.tsx src/components/auth/ProtectedRoute.test.tsx
git commit -m "$(cat <<'EOF'
feat(auth): redirect users without FPL Team ID to /connect

ProtectedRoute now checks if user has an FPL team connected.
If not, redirects to /connect (unless already there).

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Create Leagues Page

**Files:**
- Create: `src/pages/LeaguesPage.tsx`
- Create: `src/pages/LeaguesPage.test.tsx`
- Modify: `src/router.tsx` (add route)

The Leagues page shows user's mini-leagues with "Start Knockout" buttons.

**Step 1: Write test for basic rendering**

```typescript
// src/pages/LeaguesPage.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LeaguesPage } from './LeaguesPage';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-id' },
  }),
}));

vi.mock('../services/user', () => ({
  getUserProfile: vi.fn().mockResolvedValue({
    userId: 'test-user-id',
    fplTeamId: 158256,
    fplTeamName: 'Owen FC',
  }),
}));

vi.mock('../services/fpl', () => ({
  getUserMiniLeagues: vi.fn().mockResolvedValue([]),
}));

describe('LeaguesPage', () => {
  it('renders the page title', async () => {
    render(
      <BrowserRouter>
        <LeaguesPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Your Mini Leagues')).toBeInTheDocument();
  });

  it('renders the subtitle', async () => {
    render(
      <BrowserRouter>
        <LeaguesPage />
      </BrowserRouter>
    );

    expect(screen.getByText("Pick one. We'll turn it into sudden death.")).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- LeaguesPage.test.tsx`
Expected: FAIL

**Step 3: Create minimal LeaguesPage**

```typescript
// src/pages/LeaguesPage.tsx
export function LeaguesPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Your Mini Leagues</h1>
          <p className="text-muted-foreground">Pick one. We'll turn it into sudden death.</p>
        </div>
      </div>
    </main>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- LeaguesPage.test.tsx`
Expected: PASS

**Step 5: Add test for loading leagues**

```typescript
// Add to LeaguesPage.test.tsx
import { getUserMiniLeagues } from '../services/fpl';

it('displays leagues from FPL API', async () => {
  (getUserMiniLeagues as vi.Mock).mockResolvedValue([
    { id: 123, name: 'Work Friends League', entryRank: 12 },
    { id: 456, name: 'Family Cup', entryRank: 3 },
  ]);

  render(
    <BrowserRouter>
      <LeaguesPage />
    </BrowserRouter>
  );

  await waitFor(() => {
    expect(screen.getByText('Work Friends League')).toBeInTheDocument();
    expect(screen.getByText('Family Cup')).toBeInTheDocument();
  });
});
```

**Step 6: Run test to verify it fails**

Run: `npm test -- LeaguesPage.test.tsx`
Expected: FAIL

**Step 7: Implement league fetching and display**

```typescript
// Update src/pages/LeaguesPage.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile } from '../services/user';
import { getUserMiniLeagues, type FPLMiniLeague } from '../services/fpl';
import { Skeleton } from '../components/ui/skeleton';

export function LeaguesPage() {
  const { user } = useAuth();
  const [leagues, setLeagues] = useState<FPLMiniLeague[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLeagues() {
      if (!user?.uid) return;

      try {
        const profile = await getUserProfile(user.uid);
        if (profile?.fplTeamId) {
          const miniLeagues = await getUserMiniLeagues(profile.fplTeamId);
          setLeagues(miniLeagues);
        }
      } catch (error) {
        console.error('Error loading leagues:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadLeagues();
  }, [user?.uid]);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Your Mini Leagues</h1>
          <p className="text-muted-foreground">Pick one. We'll turn it into sudden death.</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            {leagues.map((league) => (
              <div key={league.id} className="border rounded-lg p-4">
                <h3 className="font-medium">{league.name}</h3>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
```

**Step 8: Run test to verify it passes**

Run: `npm test -- LeaguesPage.test.tsx`
Expected: PASS

**Step 9: Commit basic LeaguesPage**

```bash
git add src/pages/LeaguesPage.tsx src/pages/LeaguesPage.test.tsx
git commit -m "$(cat <<'EOF'
feat(leagues): add LeaguesPage with league loading

Fetches user's mini-leagues from FPL API and displays them.
Shows loading skeleton while fetching.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

**Step 10: Add test for league card with member count and rank**

```typescript
// Add to LeaguesPage.test.tsx
it('displays member count on league cards', async () => {
  (getUserMiniLeagues as vi.Mock).mockResolvedValue([
    { id: 123, name: 'Work Friends League', entryRank: 12 },
  ]);

  // Mock getLeagueStandings to return member count
  vi.mock('../services/fpl', async () => {
    const actual = await vi.importActual('../services/fpl');
    return {
      ...actual,
      getUserMiniLeagues: vi.fn().mockResolvedValue([
        { id: 123, name: 'Work Friends League', entryRank: 12 },
      ]),
      getLeagueStandings: vi.fn().mockResolvedValue(
        Array.from({ length: 47 }, (_, i) => ({ fplTeamId: i + 1 }))
      ),
    };
  });

  render(
    <BrowserRouter>
      <LeaguesPage />
    </BrowserRouter>
  );

  await waitFor(() => {
    expect(screen.getByText(/47 members/)).toBeInTheDocument();
    expect(screen.getByText(/You're ranked #12/)).toBeInTheDocument();
  });
});
```

**Step 11: Run test to verify it fails**

Run: `npm test -- LeaguesPage.test.tsx`
Expected: FAIL

**Step 12: Create enhanced LeaguePickerCard component**

```typescript
// Create src/components/leagues/LeaguePickerCard.tsx
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Users } from 'lucide-react';
import type { FPLMiniLeague } from '../../services/fpl';

interface LeaguePickerCardProps {
  league: FPLMiniLeague;
  memberCount: number;
  onStartKnockout: () => void;
  isLoading?: boolean;
}

export function LeaguePickerCard({
  league,
  memberCount,
  onStartKnockout,
  isLoading = false,
}: LeaguePickerCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold text-lg">{league.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {memberCount} members · You're ranked #{league.entryRank}
            </p>
          </div>
          <Button onClick={onStartKnockout} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Start Knockout'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

**Step 13: Update LeaguesPage to use LeaguePickerCard with member counts**

```typescript
// Update src/pages/LeaguesPage.tsx
import { getLeagueStandings } from '../services/fpl';
import { LeaguePickerCard } from '../components/leagues/LeaguePickerCard';
import { useNavigate } from 'react-router-dom';

// Add state for member counts
const [memberCounts, setMemberCounts] = useState<Map<number, number>>(new Map());

// In useEffect, after loading leagues:
// Fetch member counts for each league
const counts = new Map<number, number>();
await Promise.all(
  miniLeagues.map(async (league) => {
    try {
      const standings = await getLeagueStandings(league.id);
      counts.set(league.id, standings.length);
    } catch {
      counts.set(league.id, 0);
    }
  })
);
setMemberCounts(counts);

// In JSX, replace simple div with:
<LeaguePickerCard
  key={league.id}
  league={league}
  memberCount={memberCounts.get(league.id) || 0}
  onStartKnockout={() => navigate(`/knockout/${league.id}`)}
/>
```

**Step 14: Run test to verify it passes**

Run: `npm test -- LeaguesPage.test.tsx`
Expected: PASS

**Step 15: Add test for empty state**

```typescript
// Add to LeaguesPage.test.tsx
it('shows empty state when user has no leagues', async () => {
  (getUserMiniLeagues as vi.Mock).mockResolvedValue([]);

  render(
    <BrowserRouter>
      <LeaguesPage />
    </BrowserRouter>
  );

  await waitFor(() => {
    expect(screen.getByText(/not in any mini-leagues/i)).toBeInTheDocument();
  });
});
```

**Step 16: Run test to verify it fails**

Run: `npm test -- LeaguesPage.test.tsx`
Expected: FAIL

**Step 17: Implement empty state**

```typescript
// Update LeaguesPage.tsx JSX
{leagues.length === 0 ? (
  <p className="text-center text-muted-foreground py-8">
    You're not in any mini-leagues yet. Join one on the FPL site.
  </p>
) : (
  <div className="space-y-4">
    {/* existing league cards */}
  </div>
)}
```

**Step 18: Run test to verify it passes**

Run: `npm test -- LeaguesPage.test.tsx`
Expected: PASS

**Step 19: Add route to router**

```typescript
// Modify src/router.tsx
import { LeaguesPage } from './pages/LeaguesPage';

// Add route:
{
  path: '/leagues',
  element: (
    <ProtectedRoute>
      <LeaguesPage />
    </ProtectedRoute>
  ),
},
```

**Step 20: Commit**

```bash
git add src/pages/LeaguesPage.tsx src/pages/LeaguesPage.test.tsx src/components/leagues/LeaguePickerCard.tsx src/router.tsx
git commit -m "$(cat <<'EOF'
feat(leagues): complete LeaguesPage with member counts and Start Knockout

- Displays user's mini-leagues with member count and rank
- LeaguePickerCard with Start Knockout button
- Empty state for users with no leagues
- Navigates to /knockout/:leagueId on button click

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Enhance MatchCard with Stakes Callout

**Files:**
- Modify: `src/components/tournament/MatchCard.tsx`
- Modify: `src/components/tournament/MatchCard.test.tsx`

Add stakes callouts and user highlighting to MatchCard.

**Step 1: Add test for stakes callout display**

```typescript
// Add to src/components/tournament/MatchCard.test.tsx
import { getStakesCallout } from '../../lib/stakes';

vi.mock('../../lib/stakes', () => ({
  getStakesCallout: vi.fn(),
}));

describe('stakes callout', () => {
  it('displays stakes callout for user match', () => {
    (getStakesCallout as vi.Mock).mockReturnValue('⚡ 15 points from elimination');

    const match = {
      id: 'r1-m1',
      player1: { fplTeamId: 158256, seed: 1, score: 67 },
      player2: { fplTeamId: 999999, seed: 16, score: 52 },
      winnerId: null,
      isBye: false,
    };

    render(
      <MatchCard
        match={match}
        participants={mockParticipants}
        gameweek={15}
        isUserMatch={true}
        userTeamId={158256}
      />
    );

    expect(screen.getByText('⚡ 15 points from elimination')).toBeInTheDocument();
  });

  it('does not display stakes callout for non-user match', () => {
    const match = {
      id: 'r1-m1',
      player1: { fplTeamId: 111111, seed: 1, score: 67 },
      player2: { fplTeamId: 222222, seed: 16, score: 52 },
      winnerId: null,
      isBye: false,
    };

    render(
      <MatchCard
        match={match}
        participants={mockParticipants}
        gameweek={15}
        isUserMatch={false}
        userTeamId={158256}
      />
    );

    expect(screen.queryByText(/⚡/)).not.toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- MatchCard.test.tsx`
Expected: FAIL

**Step 3: Update MatchCard interface and add stakes callout**

```typescript
// Update src/components/tournament/MatchCard.tsx
import { getStakesCallout } from '../../lib/stakes';

interface MatchCardProps {
  match: Match;
  participants: Participant[];
  gameweek: number;
  isUserMatch?: boolean;
  userTeamId?: number;
}

export function MatchCard({
  match,
  participants,
  gameweek,
  isUserMatch = false,
  userTeamId,
}: MatchCardProps) {
  // ... existing code

  // Calculate stakes callout
  const stakesCallout = isUserMatch && match.player1?.score !== null && match.player2?.score !== null
    ? getStakesCallout(
        userTeamId === match.player1?.fplTeamId ? match.player1.score : match.player2!.score,
        userTeamId === match.player1?.fplTeamId ? match.player2!.score : match.player1.score,
        true
      )
    : '';

  return (
    <Card className={isUserMatch ? 'border-2 border-amber-500' : ''}>
      <CardContent className="p-4">
        {/* ... existing content */}
        {stakesCallout && (
          <p className="text-sm font-medium text-amber-600 mt-2">{stakesCallout}</p>
        )}
      </CardContent>
    </Card>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- MatchCard.test.tsx`
Expected: PASS

**Step 5: Add test for gold border on user match**

```typescript
// Add to MatchCard.test.tsx
it('has gold border when isUserMatch is true', () => {
  const match = {
    id: 'r1-m1',
    player1: { fplTeamId: 158256, seed: 1, score: 67 },
    player2: { fplTeamId: 999999, seed: 16, score: 52 },
    winnerId: null,
    isBye: false,
  };

  const { container } = render(
    <MatchCard
      match={match}
      participants={mockParticipants}
      gameweek={15}
      isUserMatch={true}
      userTeamId={158256}
    />
  );

  const card = container.querySelector('[data-slot="card"]') || container.firstChild;
  expect(card).toHaveClass('border-amber-500');
});
```

**Step 6: Run test to verify it passes**

Run: `npm test -- MatchCard.test.tsx`
Expected: PASS (already implemented in step 3)

**Step 7: Add test for winner checkmark**

```typescript
// Add to MatchCard.test.tsx
it('shows checkmark next to winner score', () => {
  const match = {
    id: 'r1-m1',
    player1: { fplTeamId: 158256, seed: 1, score: 67 },
    player2: { fplTeamId: 999999, seed: 16, score: 52 },
    winnerId: 158256,
    isBye: false,
  };

  render(
    <MatchCard
      match={match}
      participants={mockParticipants}
      gameweek={15}
      isUserMatch={true}
      userTeamId={158256}
    />
  );

  // Check for checkmark next to winner score
  expect(screen.getByText('67')).toBeInTheDocument();
  expect(screen.getByText('✓')).toBeInTheDocument();
});
```

**Step 8: Run test to verify it fails**

Run: `npm test -- MatchCard.test.tsx`
Expected: FAIL

**Step 9: Add checkmark to winner row**

```typescript
// Update renderPlayerRow in MatchCard.tsx
const renderPlayerRow = (
  player: typeof match.player1,
  participant: Participant | null,
  isWinner: boolean,
  isLoser: boolean
) => {
  // ... existing null check

  return (
    <div className={`flex justify-between items-center py-2 ${isWinner ? 'font-semibold' : ''} ${isLoser ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-2">
        <span>{participant.fplTeamName}</span>
        <span className="text-muted-foreground text-sm">({participant.seed})</span>
      </div>
      <div className="flex items-center gap-1">
        {player.score !== null && <span className="text-lg">{player.score}</span>}
        {isWinner && <span className="text-green-500">✓</span>}
      </div>
    </div>
  );
};

// Update calls to include isLoser:
{renderPlayerRow(
  match.player1,
  player1,
  match.winnerId === match.player1?.fplTeamId,
  match.winnerId !== null && match.winnerId !== match.player1?.fplTeamId
)}
```

**Step 10: Run test to verify it passes**

Run: `npm test -- MatchCard.test.tsx`
Expected: PASS

**Step 11: Add test for loser opacity**

```typescript
// Add to MatchCard.test.tsx
it('shows loser row with reduced opacity', () => {
  const match = {
    id: 'r1-m1',
    player1: { fplTeamId: 158256, seed: 1, score: 67 },
    player2: { fplTeamId: 999999, seed: 16, score: 52 },
    winnerId: 158256,
    isBye: false,
  };

  render(
    <MatchCard
      match={match}
      participants={mockParticipants}
      gameweek={15}
    />
  );

  // The loser row should have opacity-50
  const loserRow = screen.getByText('52').closest('div');
  expect(loserRow).toHaveClass('opacity-50');
});
```

**Step 12: Run test to verify it passes**

Run: `npm test -- MatchCard.test.tsx`
Expected: PASS (already implemented in step 9)

**Step 13: Commit**

```bash
git add src/components/tournament/MatchCard.tsx src/components/tournament/MatchCard.test.tsx
git commit -m "$(cat <<'EOF'
feat(match-card): add stakes callout and visual enhancements

- Gold border (border-amber-500) for user's match
- Stakes callout text below scores
- Checkmark (✓) next to winner's score
- Reduced opacity on loser row
- Accepts isUserMatch and userTeamId props

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Create Knockout Page with On-the-Fly Bracket

**Files:**
- Create: `src/pages/KnockoutPage.tsx`
- Create: `src/pages/KnockoutPage.test.tsx`
- Modify: `src/router.tsx` (add route)

The Knockout page generates a bracket on-the-fly from league standings without persisting to Firestore.

**Step 1: Write test for basic rendering**

```typescript
// src/pages/KnockoutPage.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { KnockoutPage } from './KnockoutPage';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-id' },
  }),
}));

vi.mock('../services/user', () => ({
  getUserProfile: vi.fn().mockResolvedValue({
    userId: 'test-user-id',
    fplTeamId: 158256,
  }),
}));

vi.mock('../services/fpl', () => ({
  getLeagueStandings: vi.fn().mockResolvedValue([]),
  getCurrentGameweek: vi.fn().mockResolvedValue(15),
  getFPLGameweekScore: vi.fn().mockResolvedValue({ points: 65 }),
}));

describe('KnockoutPage', () => {
  it('renders the back link', async () => {
    render(
      <MemoryRouter initialEntries={['/knockout/123']}>
        <Routes>
          <Route path="/knockout/:leagueId" element={<KnockoutPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('← Back to Leagues')).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- KnockoutPage.test.tsx`
Expected: FAIL

**Step 3: Create minimal KnockoutPage**

```typescript
// src/pages/KnockoutPage.tsx
import { Link } from 'react-router-dom';

export function KnockoutPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <Link to="/leagues" className="text-muted-foreground hover:text-foreground">
        ← Back to Leagues
      </Link>
    </main>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- KnockoutPage.test.tsx`
Expected: PASS

**Step 5: Add test for league name header**

```typescript
// Add to KnockoutPage.test.tsx
import { getLeagueStandings } from '../services/fpl';

it('displays league name in header', async () => {
  (getLeagueStandings as vi.Mock).mockResolvedValue([
    { fplTeamId: 1, teamName: 'Team 1', rank: 1 },
    { fplTeamId: 2, teamName: 'Team 2', rank: 2 },
  ]);

  // Need to mock getUserMiniLeagues to get league name
  vi.mock('../services/fpl', async () => {
    const actual = await vi.importActual('../services/fpl');
    return {
      ...actual,
      getUserMiniLeagues: vi.fn().mockResolvedValue([
        { id: 123, name: 'Work Friends Knockout', entryRank: 5 },
      ]),
    };
  });

  render(
    <MemoryRouter initialEntries={['/knockout/123']}>
      <Routes>
        <Route path="/knockout/:leagueId" element={<KnockoutPage />} />
      </Routes>
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(screen.getByText('WORK FRIENDS KNOCKOUT')).toBeInTheDocument();
  });
});
```

**Step 6: Run test to verify it fails**

Run: `npm test -- KnockoutPage.test.tsx`
Expected: FAIL

**Step 7: Implement league name header**

```typescript
// Update src/pages/KnockoutPage.tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile } from '../services/user';
import { getLeagueStandings, getUserMiniLeagues, getCurrentGameweek } from '../services/fpl';
import { Skeleton } from '../components/ui/skeleton';

export function KnockoutPage() {
  const { leagueId } = useParams<{ leagueId: string }>();
  const { user } = useAuth();
  const [leagueName, setLeagueName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user?.uid || !leagueId) return;

      try {
        const profile = await getUserProfile(user.uid);
        if (profile?.fplTeamId) {
          const leagues = await getUserMiniLeagues(profile.fplTeamId);
          const league = leagues.find(l => l.id === Number(leagueId));
          if (league) {
            setLeagueName(league.name.toUpperCase());
          }
        }
      } catch (error) {
        console.error('Error loading knockout:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [user?.uid, leagueId]);

  return (
    <main className="container mx-auto px-4 py-8 space-y-6">
      <Link to="/leagues" className="text-muted-foreground hover:text-foreground">
        ← Back to Leagues
      </Link>

      {isLoading ? (
        <Skeleton className="h-8 w-64" />
      ) : (
        <h1 className="text-2xl font-bold tracking-tight">{leagueName}</h1>
      )}
    </main>
  );
}
```

**Step 8: Run test to verify it passes**

Run: `npm test -- KnockoutPage.test.tsx`
Expected: PASS

**Step 9: Add test for bracket generation from top 16**

```typescript
// Add to KnockoutPage.test.tsx
it('generates bracket from top 16 teams', async () => {
  const standings = Array.from({ length: 20 }, (_, i) => ({
    fplTeamId: i + 1,
    teamName: `Team ${i + 1}`,
    rank: i + 1,
    totalPoints: 1000 - i * 10,
  }));

  (getLeagueStandings as vi.Mock).mockResolvedValue(standings);

  render(
    <MemoryRouter initialEntries={['/knockout/123']}>
      <Routes>
        <Route path="/knockout/:leagueId" element={<KnockoutPage />} />
      </Routes>
    </MemoryRouter>
  );

  await waitFor(() => {
    // Should show "16 REMAIN" header
    expect(screen.getByText('16 REMAIN')).toBeInTheDocument();
  });
});
```

**Step 10: Run test to verify it fails**

Run: `npm test -- KnockoutPage.test.tsx`
Expected: FAIL

**Step 11: Implement bracket generation**

```typescript
// Update src/pages/KnockoutPage.tsx
import type { Participant, Round, Match, MatchPlayer } from '../types/tournament';

interface KnockoutBracket {
  participants: Participant[];
  rounds: Round[];
  gameweek: number;
}

// Add state
const [bracket, setBracket] = useState<KnockoutBracket | null>(null);

// In useEffect, after getting league name:
const standings = await getLeagueStandings(Number(leagueId));
const currentGw = await getCurrentGameweek();

// Take top 16
const top16 = standings.slice(0, 16);

// Create participants
const participants: Participant[] = top16.map((s, i) => ({
  fplTeamId: s.fplTeamId,
  fplTeamName: s.teamName,
  managerName: s.managerName,
  seed: i + 1,
}));

// Generate matchups (1v16, 8v9, etc.)
const matchups = [
  [0, 15], [7, 8], [4, 11], [3, 12],
  [2, 13], [5, 10], [6, 9], [1, 14],
];

const matches: Match[] = matchups.map(([p1, p2], i) => ({
  id: `r1-m${i + 1}`,
  player1: { fplTeamId: participants[p1].fplTeamId, seed: participants[p1].seed, score: null },
  player2: { fplTeamId: participants[p2].fplTeamId, seed: participants[p2].seed, score: null },
  winnerId: null,
  isBye: false,
}));

const rounds: Round[] = [
  { roundNumber: 1, name: '16 REMAIN', gameweek: currentGw, matches, isComplete: false },
  // Future rounds would be added here
];

setBracket({ participants, rounds, gameweek: currentGw });

// In JSX:
{bracket && (
  <div className="space-y-8">
    {bracket.rounds.map((round) => (
      <div key={round.roundNumber}>
        <h2 className="text-xl font-bold text-center py-4 border-y">{round.name}</h2>
        {/* Match cards will go here */}
      </div>
    ))}
  </div>
)}
```

**Step 12: Run test to verify it passes**

Run: `npm test -- KnockoutPage.test.tsx`
Expected: PASS

**Step 13: Add test for fetching historical GW scores**

```typescript
// Add to KnockoutPage.test.tsx
import { getFPLGameweekScore } from '../services/fpl';

it('fetches and displays gameweek scores for all teams', async () => {
  const standings = Array.from({ length: 16 }, (_, i) => ({
    fplTeamId: i + 1,
    teamName: `Team ${i + 1}`,
    rank: i + 1,
  }));

  (getLeagueStandings as vi.Mock).mockResolvedValue(standings);
  (getFPLGameweekScore as vi.Mock).mockImplementation((teamId) =>
    Promise.resolve({ gameweek: 15, points: 50 + teamId })
  );

  render(
    <MemoryRouter initialEntries={['/knockout/123']}>
      <Routes>
        <Route path="/knockout/:leagueId" element={<KnockoutPage />} />
      </Routes>
    </MemoryRouter>
  );

  await waitFor(() => {
    // Team 1 should have score 51
    expect(screen.getByText('51')).toBeInTheDocument();
  });
});
```

**Step 14: Run test to verify it fails**

Run: `npm test -- KnockoutPage.test.tsx`
Expected: FAIL

**Step 15: Implement score fetching**

```typescript
// Update src/pages/KnockoutPage.tsx
import { getFPLGameweekScore } from '../services/fpl';

// After generating matchups, fetch scores:
const scoresPromises = top16.map(async (team) => {
  try {
    const score = await getFPLGameweekScore(team.fplTeamId, currentGw);
    return { fplTeamId: team.fplTeamId, score: score.points };
  } catch {
    return { fplTeamId: team.fplTeamId, score: 0 };
  }
});

const scores = await Promise.all(scoresPromises);
const scoreMap = new Map(scores.map(s => [s.fplTeamId, s.score]));

// Update matches with scores
const matchesWithScores: Match[] = matchups.map(([p1, p2], i) => {
  const team1Id = participants[p1].fplTeamId;
  const team2Id = participants[p2].fplTeamId;

  return {
    id: `r1-m${i + 1}`,
    player1: {
      fplTeamId: team1Id,
      seed: participants[p1].seed,
      score: scoreMap.get(team1Id) ?? null,
    },
    player2: {
      fplTeamId: team2Id,
      seed: participants[p2].seed,
      score: scoreMap.get(team2Id) ?? null,
    },
    winnerId: null,
    isBye: false,
  };
});
```

**Step 16: Run test to verify it passes**

Run: `npm test -- KnockoutPage.test.tsx`
Expected: PASS

**Step 17: Add test for user's match highlighted at top**

```typescript
// Add to KnockoutPage.test.tsx
it('shows user match at top with YOUR MATCH label', async () => {
  const standings = Array.from({ length: 16 }, (_, i) => ({
    fplTeamId: i + 1,
    teamName: `Team ${i + 1}`,
    rank: i + 1,
  }));

  // User's team is ID 158256
  standings[4] = { fplTeamId: 158256, teamName: 'My Team', rank: 5 };

  (getLeagueStandings as vi.Mock).mockResolvedValue(standings);

  render(
    <MemoryRouter initialEntries={['/knockout/123']}>
      <Routes>
        <Route path="/knockout/:leagueId" element={<KnockoutPage />} />
      </Routes>
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(screen.getByText('YOUR MATCH')).toBeInTheDocument();
  });
});
```

**Step 18: Run test to verify it fails**

Run: `npm test -- KnockoutPage.test.tsx`
Expected: FAIL

**Step 19: Implement user match highlighting**

```typescript
// Update src/pages/KnockoutPage.tsx
// Add userFplTeamId to state
const [userFplTeamId, setUserFplTeamId] = useState<number>(0);

// In useEffect:
setUserFplTeamId(profile.fplTeamId);

// Create function to find user's match
function findUserMatch(matches: Match[], userTeamId: number): Match | null {
  return matches.find(m =>
    m.player1?.fplTeamId === userTeamId || m.player2?.fplTeamId === userTeamId
  ) || null;
}

// In JSX, render user match first with label:
{bracket && (
  <div className="space-y-8">
    {bracket.rounds.map((round) => {
      const userMatch = findUserMatch(round.matches, userFplTeamId);
      const otherMatches = round.matches.filter(m => m !== userMatch);

      return (
        <div key={round.roundNumber}>
          <h2 className="text-xl font-bold text-center py-4 border-y">{round.name}</h2>
          <div className="space-y-4 mt-4">
            {userMatch && (
              <div>
                <p className="text-sm font-medium text-amber-600 mb-2">YOUR MATCH</p>
                <MatchCard
                  match={userMatch}
                  participants={bracket.participants}
                  gameweek={round.gameweek}
                  isUserMatch={true}
                  userTeamId={userFplTeamId}
                />
              </div>
            )}
            {otherMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                participants={bracket.participants}
                gameweek={round.gameweek}
                isUserMatch={false}
              />
            ))}
          </div>
        </div>
      );
    })}
  </div>
)}
```

**Step 20: Run test to verify it passes**

Run: `npm test -- KnockoutPage.test.tsx`
Expected: PASS

**Step 21: Add test for gameweek info in header**

```typescript
// Add to KnockoutPage.test.tsx
it('shows team count and gameweek in subheader', async () => {
  const standings = Array.from({ length: 16 }, (_, i) => ({
    fplTeamId: i + 1,
    teamName: `Team ${i + 1}`,
    rank: i + 1,
  }));

  (getLeagueStandings as vi.Mock).mockResolvedValue(standings);
  (getCurrentGameweek as vi.Mock).mockResolvedValue(15);

  render(
    <MemoryRouter initialEntries={['/knockout/123']}>
      <Routes>
        <Route path="/knockout/:leagueId" element={<KnockoutPage />} />
      </Routes>
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(screen.getByText(/16 teams/)).toBeInTheDocument();
    expect(screen.getByText(/GW15 scores/)).toBeInTheDocument();
  });
});
```

**Step 22: Run test to verify it fails**

Run: `npm test -- KnockoutPage.test.tsx`
Expected: FAIL

**Step 23: Add subheader with team count and gameweek**

```typescript
// Update KnockoutPage.tsx JSX
{isLoading ? (
  <Skeleton className="h-8 w-64" />
) : (
  <div>
    <h1 className="text-2xl font-bold tracking-tight">{leagueName}</h1>
    {bracket && (
      <p className="text-muted-foreground">
        {bracket.participants.length} teams · GW{bracket.gameweek} scores
      </p>
    )}
  </div>
)}
```

**Step 24: Run test to verify it passes**

Run: `npm test -- KnockoutPage.test.tsx`
Expected: PASS

**Step 25: Add route to router**

```typescript
// Modify src/router.tsx
import { KnockoutPage } from './pages/KnockoutPage';

// Add route:
{
  path: '/knockout/:leagueId',
  element: (
    <ProtectedRoute>
      <KnockoutPage />
    </ProtectedRoute>
  ),
},
```

**Step 26: Commit**

```bash
git add src/pages/KnockoutPage.tsx src/pages/KnockoutPage.test.tsx src/router.tsx
git commit -m "$(cat <<'EOF'
feat(knockout): add KnockoutPage with on-the-fly bracket generation

- Generates bracket from top 16 league members
- Fetches historical GW scores for all teams
- Shows user's match at top with YOUR MATCH label
- Displays team count and gameweek info
- Uses proper tournament seeding (1v16, 8v9, etc.)
- No Firestore persistence (demo mode)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Update Dashboard Redirect

**Files:**
- Modify: `src/pages/DashboardPage.tsx`

Remove FPL connection from Dashboard (now handled by `/connect`).

**Step 1: Update Dashboard to remove FPLConnectionCard when connected**

```typescript
// Simplify DashboardPage.tsx
// Remove FPLConnectionCard import and usage
// The connect flow is now handled by /connect redirect

export function DashboardPage() {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<User | null>(null);
  const [leagues, setLeagues] = useState<FPLMiniLeague[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!authUser?.uid) return;

      try {
        const profile = await getUserProfile(authUser.uid);
        setUserData(profile);

        if (profile?.fplTeamId) {
          const miniLeagues = await getUserMiniLeagues(profile.fplTeamId);
          setLeagues(miniLeagues);
        }
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [authUser?.uid]);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back{authUser?.displayName ? `, ${authUser.displayName}` : ''}!
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quick link to leagues */}
            <div className="flex gap-4">
              <Button onClick={() => navigate('/leagues')}>
                View Your Leagues
              </Button>
            </div>

            {/* Summary stats could go here in future */}
          </div>
        )}
      </div>
    </main>
  );
}
```

**Step 2: Commit**

```bash
git add src/pages/DashboardPage.tsx
git commit -m "$(cat <<'EOF'
refactor(dashboard): simplify to remove FPL connection (now at /connect)

Dashboard now just shows welcome and link to leagues.
FPL connection is handled by ProtectedRoute redirect to /connect.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Add Comprehensive E2E Test

**Files:**
- Create: `e2e/knockout-demo.spec.ts`

End-to-end test for the complete user flow.

**Step 1: Write E2E test for complete flow**

```typescript
// e2e/knockout-demo.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Phase 1 Demo Flow @critical @smoke', () => {
  test('complete flow: login → connect → leagues → knockout', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.getByLabel('Email').fill('testuser@knockoutfpl.com');
    await page.getByLabel('Password').fill('TestPass123!');
    await page.getByRole('button', { name: 'Log In' }).click();

    // 2. Should redirect to /connect if no FPL team
    await expect(page).toHaveURL('/connect');
    await expect(page.getByText('Connect Your FPL Team')).toBeVisible();

    // 3. Connect FPL team
    await page.getByLabel('FPL Team ID').fill('158256');
    await page.getByRole('button', { name: 'Find My Team' }).click();

    // Wait for success confirmation
    await expect(page.getByText("Let's go.")).toBeVisible();

    // 4. Auto-redirect to /leagues
    await expect(page).toHaveURL('/leagues', { timeout: 5000 });
    await expect(page.getByText('Your Mini Leagues')).toBeVisible();

    // 5. Start Knockout on a league
    await page.getByRole('button', { name: 'Start Knockout' }).first().click();

    // 6. Verify knockout view
    await expect(page.getByText('16 REMAIN')).toBeVisible();
    await expect(page.getByText('YOUR MATCH')).toBeVisible();
  });

  test('shows stakes callout on user match', async ({ page }) => {
    // Login with connected user
    await page.goto('/login');
    await page.getByLabel('Email').fill('testuser@knockoutfpl.com');
    await page.getByLabel('Password').fill('TestPass123!');
    await page.getByRole('button', { name: 'Log In' }).click();

    // Navigate to knockout
    await page.goto('/leagues');
    await page.getByRole('button', { name: 'Start Knockout' }).first().click();

    // Verify stakes callout
    await expect(page.getByText(/⚡/)).toBeVisible();
  });
});
```

**Step 2: Run E2E test**

Run: `npm run test:e2e -- knockout-demo.spec.ts`
Expected: Tests should pass if dev server is running

**Step 3: Commit**

```bash
git add e2e/knockout-demo.spec.ts
git commit -m "$(cat <<'EOF'
test(e2e): add comprehensive Phase 1 demo flow test

Tests complete user journey:
- Login → Connect FPL → Leagues → Knockout
- Verifies stakes callout appears on user match

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Summary

### Files Created
- `src/lib/stakes.ts` - Stakes callout utility
- `src/lib/stakes.test.ts` - Stakes tests
- `src/pages/ConnectPage.tsx` - FPL connection page
- `src/pages/ConnectPage.test.tsx` - Connect page tests
- `src/pages/LeaguesPage.tsx` - League picker page
- `src/pages/LeaguesPage.test.tsx` - Leagues page tests
- `src/pages/KnockoutPage.tsx` - Knockout bracket view
- `src/pages/KnockoutPage.test.tsx` - Knockout page tests
- `src/components/leagues/LeaguePickerCard.tsx` - Enhanced league card
- `e2e/knockout-demo.spec.ts` - E2E test for complete flow

### Files Modified
- `src/router.tsx` - Added /connect, /leagues, /knockout routes
- `src/components/auth/ProtectedRoute.tsx` - Added FPL connection redirect
- `src/components/tournament/MatchCard.tsx` - Added stakes callout
- `src/pages/DashboardPage.tsx` - Simplified (removed FPL connection)

### Routes
- `/connect` - FPL Team connection (new)
- `/leagues` - League picker (new)
- `/knockout/:leagueId` - Knockout bracket view (new)

### User Flow
1. Login → ProtectedRoute checks for FPL Team ID
2. No FPL Team → Redirect to `/connect`
3. Enter Team ID → Validate → Save → Redirect to `/leagues`
4. See mini-leagues → Click "Start Knockout"
5. View bracket with user's match highlighted + stakes callout

---

*Plan complete. Execute with superpowers:executing-plans or superpowers:subagent-driven-development.*
