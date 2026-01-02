# League Summary Card Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign LeagueSummaryCard to match the new dashboard design with gradient headers, status badges, and two-column stats layout.

**Architecture:** Update the existing component in-place. The card will have two sections: a header (with gradient, badge, manager count, league name) and content (two-column stats grid, action button). Visual variants controlled by existing state logic.

**Tech Stack:** React, TypeScript, Tailwind CSS, shadcn/ui Card component

**Reference:** Design spec at `docs/plans/2026-01-01-league-summary-card-redesign.md`

---

## Task 1: Add userRank Prop

**Files:**
- Modify: `src/components/dashboard/LeagueSummaryCard.tsx:6-27`
- Modify: `src/components/dashboard/LeagueSummaryCard.test.tsx`

**Step 1: Write failing test for userRank display**

Add to test file after line 27:

```typescript
it('should display user rank with ordinal suffix', () => {
  render(
    <LeagueSummaryCard
      leagueName="Work Colleagues League"
      memberCount={14}
      userRank={1}
      tournament={{
        startGameweek: 12,
        endGameweek: 15,
        currentRound: 3,
        totalRounds: 4,
        status: 'active',
      }}
      userProgress={{
        status: 'active',
        currentRoundName: 'Semi-finals',
      }}
      onClick={() => {}}
    />
  );

  expect(screen.getByText('1st')).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/components/dashboard/LeagueSummaryCard.test.tsx`
Expected: FAIL - "1st" not found

**Step 3: Add userRank to props interface**

In `LeagueSummaryCard.tsx`, update the interface:

```typescript
export interface LeagueSummaryCardProps {
  leagueName: string;
  memberCount: number;
  userRank?: number;  // Add this line

  // ... rest stays the same
```

**Step 4: Add ordinal suffix helper function**

Add before the component function:

```typescript
function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
```

**Step 5: Run test to verify it still fails**

Run: `npm test -- --run src/components/dashboard/LeagueSummaryCard.test.tsx`
Expected: FAIL - we haven't rendered it yet

**Step 6: Commit prop addition**

```bash
git add src/components/dashboard/LeagueSummaryCard.tsx src/components/dashboard/LeagueSummaryCard.test.tsx
git commit -m "feat(LeagueSummaryCard): add userRank prop and ordinal helper"
```

---

## Task 2: Restructure to Header + Content Layout

**Files:**
- Modify: `src/components/dashboard/LeagueSummaryCard.tsx`
- Modify: `src/components/dashboard/LeagueSummaryCard.test.tsx`

**Step 1: Write test for header section structure**

Add new describe block:

```typescript
describe('Header Section', () => {
  it('should render league name in header', () => {
    render(
      <LeagueSummaryCard
        leagueName="Work Colleagues"
        memberCount={14}
        userRank={1}
        tournament={{
          startGameweek: 12,
          endGameweek: 15,
          currentRound: 3,
          totalRounds: 4,
          status: 'active',
        }}
        userProgress={{ status: 'active' }}
        onClick={() => {}}
      />
    );

    const header = screen.getByTestId('league-card-header');
    expect(header).toBeInTheDocument();
    expect(header).toHaveTextContent('Work Colleagues');
  });

  it('should render manager count in header', () => {
    render(
      <LeagueSummaryCard
        leagueName="Work Colleagues"
        memberCount={14}
        tournament={null}
        onClick={() => {}}
      />
    );

    const header = screen.getByTestId('league-card-header');
    expect(header).toHaveTextContent('14 Managers');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/components/dashboard/LeagueSummaryCard.test.tsx`
Expected: FAIL - testid not found

**Step 3: Implement header section**

Replace the component's return statement with new structure:

```tsx
return (
  <Card
    role="article"
    className={cn(
      getCardClasses(variant),
      'cursor-pointer hover:-translate-y-1 overflow-hidden'
    )}
    onClick={onClick}
  >
    {/* Header Section */}
    <div
      data-testid="league-card-header"
      className={cn(
        'relative h-24 p-4 flex flex-col justify-between overflow-hidden',
        getHeaderGradient(variant)
      )}
    >
      {/* Top row: Badge + Manager count */}
      <div className="relative z-10 flex justify-between items-start">
        {renderBadge()}
        <span className="text-white/60 text-xs font-medium">
          {memberCount} Managers
        </span>
      </div>
      {/* Bottom: League name */}
      <div className="relative z-10">
        <h3 className="text-lg font-bold text-white line-clamp-1">
          {leagueName}
          {userProgress?.status === 'winner' && (
            <span className="ml-2">&#127942;</span>
          )}
        </h3>
      </div>
    </div>

    {/* Content Section */}
    <CardContent className="p-4 flex flex-col gap-3">
      {renderStatsGrid()}
      {renderButton()}
    </CardContent>
  </Card>
);
```

**Step 4: Add getHeaderGradient helper**

```typescript
function getHeaderGradient(variant: CardVariant): string {
  switch (variant) {
    case 'active':
      return 'bg-gradient-to-br from-[#1a4d38] to-background-dark';
    case 'winner':
      return 'bg-gradient-to-br from-amber-900/50 to-background-dark';
    case 'eliminated':
    case 'completed':
      return 'bg-gradient-to-br from-[#2e1616] to-background-dark';
    case 'no-tournament':
    default:
      return 'bg-gradient-to-br from-[#273a31] to-background-dark';
  }
}
```

**Step 5: Add placeholder renderBadge and renderStatsGrid**

```typescript
const renderBadge = () => {
  return <span className="px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wide">Badge</span>;
};

const renderStatsGrid = () => {
  return <div>Stats placeholder</div>;
};
```

**Step 6: Run test to verify it passes**

Run: `npm test -- --run src/components/dashboard/LeagueSummaryCard.test.tsx`
Expected: New tests PASS, some old tests may fail (we'll fix those later)

**Step 7: Commit structure change**

```bash
git add src/components/dashboard/LeagueSummaryCard.tsx src/components/dashboard/LeagueSummaryCard.test.tsx
git commit -m "feat(LeagueSummaryCard): restructure to header + content layout"
```

---

## Task 3: Implement Status Badges

**Files:**
- Modify: `src/components/dashboard/LeagueSummaryCard.tsx`
- Modify: `src/components/dashboard/LeagueSummaryCard.test.tsx`

**Step 1: Write tests for badge variants**

```typescript
describe('Status Badge', () => {
  it('should show "Active" badge for active tournament with active user', () => {
    render(
      <LeagueSummaryCard
        leagueName="Work League"
        memberCount={14}
        tournament={{
          startGameweek: 12,
          endGameweek: 15,
          currentRound: 3,
          totalRounds: 4,
          status: 'active',
        }}
        userProgress={{ status: 'active' }}
        onClick={() => {}}
      />
    );

    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should show "Champion" badge for winner', () => {
    render(
      <LeagueSummaryCard
        leagueName="Work League"
        memberCount={8}
        tournament={{
          startGameweek: 10,
          endGameweek: 13,
          currentRound: 3,
          totalRounds: 3,
          status: 'completed',
        }}
        userProgress={{ status: 'winner' }}
        onClick={() => {}}
      />
    );

    expect(screen.getByText('Champion')).toBeInTheDocument();
  });

  it('should show "Classic" badge for league without tournament', () => {
    render(
      <LeagueSummaryCard
        leagueName="Family League"
        memberCount={6}
        tournament={null}
        onClick={() => {}}
      />
    );

    expect(screen.getByText('Classic')).toBeInTheDocument();
  });

  it('should show "Eliminated" badge when user is eliminated', () => {
    render(
      <LeagueSummaryCard
        leagueName="Work League"
        memberCount={14}
        tournament={{
          startGameweek: 12,
          endGameweek: 15,
          currentRound: 5,
          totalRounds: 7,
          status: 'active',
        }}
        userProgress={{ status: 'eliminated', eliminationRound: 2 }}
        onClick={() => {}}
      />
    );

    expect(screen.getByText('Eliminated')).toBeInTheDocument();
  });

  it('should show "Completed" badge for completed tournament where user lost', () => {
    render(
      <LeagueSummaryCard
        leagueName="Work League"
        memberCount={8}
        tournament={{
          startGameweek: 10,
          endGameweek: 13,
          currentRound: 3,
          totalRounds: 3,
          status: 'completed',
        }}
        userProgress={{ status: 'eliminated', eliminationRound: 2 }}
        onClick={() => {}}
      />
    );

    expect(screen.getByText('Completed')).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/components/dashboard/LeagueSummaryCard.test.tsx`
Expected: FAIL - badges show wrong text

**Step 3: Implement renderBadge with variant styling**

```typescript
function getBadgeConfig(variant: CardVariant): { text: string; className: string } {
  switch (variant) {
    case 'active':
      return {
        text: 'Active',
        className: 'bg-primary text-background-dark',
      };
    case 'winner':
      return {
        text: 'Champion',
        className: 'bg-amber-500 text-background-dark',
      };
    case 'eliminated':
      return {
        text: 'Eliminated',
        className: 'bg-[#3d1f1f] text-red-400',
      };
    case 'completed':
      return {
        text: 'Completed',
        className: 'bg-[#3d1f1f] text-red-400',
      };
    case 'no-tournament':
    default:
      return {
        text: 'Classic',
        className: 'bg-[#0f231a] text-text-subtle border border-[#3d5248]',
      };
  }
}

const renderBadge = () => {
  const { text, className } = getBadgeConfig(variant);
  return (
    <span
      className={cn(
        'px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wide',
        className
      )}
    >
      {text}
    </span>
  );
};
```

**Step 4: Run tests**

Run: `npm test -- --run src/components/dashboard/LeagueSummaryCard.test.tsx`
Expected: Badge tests PASS

**Step 5: Commit badge implementation**

```bash
git add src/components/dashboard/LeagueSummaryCard.tsx src/components/dashboard/LeagueSummaryCard.test.tsx
git commit -m "feat(LeagueSummaryCard): implement status badges with variant styling"
```

---

## Task 4: Implement Two-Column Stats Grid

**Files:**
- Modify: `src/components/dashboard/LeagueSummaryCard.tsx`
- Modify: `src/components/dashboard/LeagueSummaryCard.test.tsx`

**Step 1: Write tests for stats grid**

```typescript
describe('Stats Grid', () => {
  it('should display Your Rank label and value', () => {
    render(
      <LeagueSummaryCard
        leagueName="Work League"
        memberCount={14}
        userRank={1}
        tournament={{
          startGameweek: 12,
          endGameweek: 15,
          currentRound: 3,
          totalRounds: 4,
          status: 'active',
        }}
        userProgress={{ status: 'active', currentRoundName: 'Quarter Final' }}
        onClick={() => {}}
      />
    );

    expect(screen.getByText('Your Rank')).toBeInTheDocument();
    expect(screen.getByText('1st')).toBeInTheDocument();
  });

  it('should display Status label and current round name for active user', () => {
    render(
      <LeagueSummaryCard
        leagueName="Work League"
        memberCount={14}
        userRank={1}
        tournament={{
          startGameweek: 12,
          endGameweek: 15,
          currentRound: 3,
          totalRounds: 4,
          status: 'active',
        }}
        userProgress={{ status: 'active', currentRoundName: 'Quarter Final' }}
        onClick={() => {}}
      />
    );

    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Quarter Final')).toBeInTheDocument();
  });

  it('should display "Not Started" status for no-tournament', () => {
    render(
      <LeagueSummaryCard
        leagueName="Family League"
        memberCount={6}
        userRank={4}
        tournament={null}
        onClick={() => {}}
      />
    );

    expect(screen.getByText('Not Started')).toBeInTheDocument();
  });

  it('should display "Eliminated" status for eliminated user', () => {
    render(
      <LeagueSummaryCard
        leagueName="Work League"
        memberCount={14}
        userRank={89}
        tournament={{
          startGameweek: 12,
          endGameweek: 15,
          currentRound: 5,
          totalRounds: 7,
          status: 'active',
        }}
        userProgress={{ status: 'eliminated', eliminationRound: 2 }}
        onClick={() => {}}
      />
    );

    // Status column should show "Eliminated"
    const statusElements = screen.getAllByText('Eliminated');
    expect(statusElements.length).toBeGreaterThanOrEqual(1);
  });

  it('should show dash when userRank is not provided', () => {
    render(
      <LeagueSummaryCard
        leagueName="Work League"
        memberCount={14}
        tournament={null}
        onClick={() => {}}
      />
    );

    // Rank should show dash
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/components/dashboard/LeagueSummaryCard.test.tsx`
Expected: FAIL - stats grid not rendered

**Step 3: Implement renderStatsGrid**

```typescript
function getStatusText(
  variant: CardVariant,
  userProgress: LeagueSummaryCardProps['userProgress'],
  tournament: LeagueSummaryCardProps['tournament']
): string {
  switch (variant) {
    case 'active':
      if (userProgress?.currentRoundName) {
        return userProgress.currentRoundName;
      }
      if (tournament) {
        return getRoundName(tournament.currentRound, tournament.totalRounds);
      }
      return 'Active';
    case 'winner':
      return 'Champion';
    case 'eliminated':
    case 'completed':
      return 'Eliminated';
    case 'no-tournament':
    default:
      return 'Not Started';
  }
}

const renderStatsGrid = () => {
  const statusText = getStatusText(variant, userProgress, tournament);
  const rankDisplay = userRank ? getOrdinalSuffix(userRank) : '—';

  const statusColorClass =
    variant === 'active'
      ? 'text-primary'
      : variant === 'winner'
        ? 'text-amber-500'
        : variant === 'eliminated' || variant === 'completed'
          ? 'text-red-400'
          : 'text-text-subtle';

  return (
    <div className="grid grid-cols-2 gap-4 border-b border-[#273a31] pb-3">
      <div className="flex flex-col">
        <span className="text-[10px] uppercase text-text-subtle font-bold mb-1">
          Your Rank
        </span>
        <span className="text-white font-bold text-sm flex items-center gap-1">
          {variant === 'active' && (
            <span className="material-symbols-outlined text-sm text-primary">
              leaderboard
            </span>
          )}
          {rankDisplay}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] uppercase text-text-subtle font-bold mb-1">
          Status
        </span>
        <span className={cn('font-bold text-sm', statusColorClass)}>
          {statusText}
        </span>
      </div>
    </div>
  );
};
```

**Step 4: Run tests**

Run: `npm test -- --run src/components/dashboard/LeagueSummaryCard.test.tsx`
Expected: Stats grid tests PASS

**Step 5: Commit stats grid**

```bash
git add src/components/dashboard/LeagueSummaryCard.tsx src/components/dashboard/LeagueSummaryCard.test.tsx
git commit -m "feat(LeagueSummaryCard): implement two-column stats grid"
```

---

## Task 5: Update Button Styling

**Files:**
- Modify: `src/components/dashboard/LeagueSummaryCard.tsx`
- Modify: `src/components/dashboard/LeagueSummaryCard.test.tsx`

**Step 1: Write test for "View History" button**

```typescript
describe('Button Variants', () => {
  it('should show "View History" for eliminated user', () => {
    render(
      <LeagueSummaryCard
        leagueName="Work League"
        memberCount={14}
        tournament={{
          startGameweek: 12,
          endGameweek: 15,
          currentRound: 5,
          totalRounds: 7,
          status: 'active',
        }}
        userProgress={{ status: 'eliminated', eliminationRound: 2 }}
        onClick={() => {}}
      />
    );

    expect(screen.getByRole('button', { name: /View History/i })).toBeInTheDocument();
  });

  it('should show "View History" for completed tournament', () => {
    render(
      <LeagueSummaryCard
        leagueName="Work League"
        memberCount={8}
        tournament={{
          startGameweek: 10,
          endGameweek: 13,
          currentRound: 3,
          totalRounds: 3,
          status: 'completed',
        }}
        userProgress={{ status: 'eliminated' }}
        onClick={() => {}}
      />
    );

    expect(screen.getByRole('button', { name: /View History/i })).toBeInTheDocument();
  });

  it('should show "View Tournament" for winner', () => {
    render(
      <LeagueSummaryCard
        leagueName="Work League"
        memberCount={8}
        tournament={{
          startGameweek: 10,
          endGameweek: 13,
          currentRound: 3,
          totalRounds: 3,
          status: 'completed',
        }}
        userProgress={{ status: 'winner' }}
        onClick={() => {}}
      />
    );

    expect(screen.getByRole('button', { name: /View Tournament/i })).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/components/dashboard/LeagueSummaryCard.test.tsx`
Expected: FAIL - "View History" not found

**Step 3: Update renderButton with variant-specific styling**

```typescript
const renderButton = () => {
  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  // No tournament - Create Tournament (outline)
  if (!hasTournament) {
    return (
      <button
        className="flex items-center justify-center gap-2 h-9 rounded border border-primary text-primary text-xs font-bold hover:bg-primary/10 transition-colors"
        onClick={handleButtonClick}
      >
        Create Tournament
      </button>
    );
  }

  // Winner - View Tournament (solid)
  if (variant === 'winner') {
    return (
      <button
        className="flex items-center justify-center gap-2 h-9 rounded bg-[#273a31] text-white text-xs font-bold hover:bg-amber-500 hover:text-background-dark transition-colors"
        onClick={handleButtonClick}
      >
        View Tournament
      </button>
    );
  }

  // Eliminated or Completed - View History (muted)
  if (variant === 'eliminated' || variant === 'completed') {
    return (
      <button
        className="flex items-center justify-center gap-2 h-9 rounded bg-[#273a31] text-text-subtle text-xs font-bold hover:text-white transition-colors"
        onClick={handleButtonClick}
      >
        View History
      </button>
    );
  }

  // Active - View Tournament (solid with primary hover)
  return (
    <button
      className="flex items-center justify-center gap-2 h-9 rounded bg-[#273a31] text-white text-xs font-bold hover:bg-primary hover:text-background-dark transition-colors"
      onClick={handleButtonClick}
    >
      View Tournament
    </button>
  );
};
```

**Step 4: Run tests**

Run: `npm test -- --run src/components/dashboard/LeagueSummaryCard.test.tsx`
Expected: Button tests PASS

**Step 5: Commit button updates**

```bash
git add src/components/dashboard/LeagueSummaryCard.tsx src/components/dashboard/LeagueSummaryCard.test.tsx
git commit -m "feat(LeagueSummaryCard): update button variants per state"
```

---

## Task 6: Add Texture Overlay and Polish

**Files:**
- Modify: `src/components/dashboard/LeagueSummaryCard.tsx`

**Step 1: Add texture overlay to header**

Update the header section to include texture:

```tsx
<div
  data-testid="league-card-header"
  className={cn(
    'relative h-24 p-4 flex flex-col justify-between overflow-hidden',
    getHeaderGradient(variant)
  )}
>
  {/* Texture overlay */}
  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />

  {/* ... rest of header content ... */}
</div>
```

**Step 2: Add grayscale effect for no-tournament variant**

Update getCardClasses:

```typescript
function getCardClasses(variant: CardVariant): string {
  const baseClasses = 'transition-all duration-200';

  switch (variant) {
    case 'active':
      return cn(
        baseClasses,
        'border-primary/50 shadow-[0_0_20px_rgba(0,255,136,0.1)]',
        'hover:border-primary/70 hover:shadow-[0_0_25px_rgba(0,255,136,0.15)]'
      );
    case 'winner':
      return cn(
        baseClasses,
        'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.1)]',
        'hover:border-amber-500/70'
      );
    case 'eliminated':
    case 'completed':
      return cn(
        baseClasses,
        'opacity-90',
        'hover:border-red-900/50'
      );
    case 'no-tournament':
      return cn(
        baseClasses,
        'border-dashed border-[#273a31]',
        '[&_[data-testid=league-card-header]]:grayscale',
        'hover:[&_[data-testid=league-card-header]]:grayscale-0',
        'hover:border-text-subtle'
      );
    default:
      return baseClasses;
  }
}
```

**Step 3: Run all tests**

Run: `npm test -- --run src/components/dashboard/LeagueSummaryCard.test.tsx`
Expected: All tests PASS

**Step 4: Commit polish**

```bash
git add src/components/dashboard/LeagueSummaryCard.tsx
git commit -m "feat(LeagueSummaryCard): add texture overlay and polish effects"
```

---

## Task 7: Update Failing Tests

**Files:**
- Modify: `src/components/dashboard/LeagueSummaryCard.test.tsx`

Some existing tests check for old structure (member count inline, gameweek range display). These need updating to match new layout.

**Step 1: Run all tests to identify failures**

Run: `npm test -- --run src/components/dashboard/LeagueSummaryCard.test.tsx`
Note which tests fail.

**Step 2: Update tests that check for removed content**

Tests checking for `GW12 → GW15` or `14 managers · GW12` format need updating since we moved to separate header display.

Remove or update these tests:
- "should display member count and gameweek range" - update to check header only
- "should show round progress and user current round" - remove (replaced by stats grid)
- "should show dash instead of gameweek range" - remove (no longer applies)

**Step 3: Run full test suite**

Run: `npm test -- --run`
Expected: All 604+ tests PASS

**Step 4: Commit test updates**

```bash
git add src/components/dashboard/LeagueSummaryCard.test.tsx
git commit -m "test(LeagueSummaryCard): update tests for new layout structure"
```

---

## Task 8: Update YourLeaguesSection to Pass userRank

**Files:**
- Modify: `src/components/dashboard/YourLeaguesSection.tsx:7-9`
- Modify: `src/components/dashboard/YourLeaguesSection.test.tsx`

**Step 1: Update LeagueData interface**

```typescript
export interface LeagueData extends Omit<LeagueSummaryCardProps, 'onClick'> {
  leagueId: number;
  // userRank is already included via LeagueSummaryCardProps
}
```

**Step 2: Pass userRank in the render**

In YourLeaguesSection, ensure userRank is passed:

```tsx
<LeagueSummaryCard
  key={league.leagueId}
  leagueName={league.leagueName}
  memberCount={league.memberCount}
  userRank={league.userRank}  // Add this line
  tournament={league.tournament}
  userProgress={league.userProgress}
  onClick={() => onLeagueClick(league.leagueId)}
/>
```

**Step 3: Run tests**

Run: `npm test -- --run`
Expected: All tests PASS

**Step 4: Commit**

```bash
git add src/components/dashboard/YourLeaguesSection.tsx
git commit -m "feat(YourLeaguesSection): pass userRank to LeagueSummaryCard"
```

---

## Task 9: Visual E2E Verification

**Prerequisite:** Dev server running (`npm run dev`)

**Step 1: Navigate to dashboard**

Use Playwright MCP to navigate to dashboard with test user logged in.

**Step 2: Take screenshot of Your Leagues section**

Capture the league cards and compare against design reference.

**Step 3: Verify all variants visually**

- Active card: Green gradient, "Active" badge
- No-tournament card: Gray gradient (grayscale), "Classic" badge, dashed border
- If available: Winner card with gold styling

**Step 4: Check console for errors**

Use `browser_console_messages` to verify no errors.

---

## Final Verification

Run full test suite:
```bash
npm test -- --run
```

All tests should pass. The LeagueSummaryCard now matches the design specification.
