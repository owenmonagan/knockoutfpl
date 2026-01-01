# Match Summary Card Redesign - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign MatchSummaryCard with team avatars, prominent scores, and clear visual states per the design spec.

**Architecture:** Complete rewrite of MatchSummaryCard component with Header/Body/Footer sections. Add `yourTeamName` prop, make `opponentTeamName` optional for TBD state. Update parent components to pass new prop.

**Tech Stack:** React, TypeScript, Tailwind CSS, shadcn/ui (Card, Badge)

---

## Task 1: Add getInitials Helper Function

**Files:**
- Create: `src/lib/initials.ts`
- Create: `src/lib/initials.test.ts`

**Step 1: Write the failing test**

```typescript
// src/lib/initials.test.ts
import { describe, it, expect } from 'vitest';
import { getInitials } from './initials';

describe('getInitials', () => {
  it('should return first two letters of first two words', () => {
    expect(getInitials("Haaland's Hairband FC")).toBe('HH');
  });

  it('should handle single word names', () => {
    expect(getInitials('Arsenal')).toBe('AR');
  });

  it('should handle two word names', () => {
    expect(getInitials('Work League')).toBe('WL');
  });

  it('should handle names with special characters', () => {
    expect(getInitials("Dave's Dumpster Fire")).toBe('DD');
  });

  it('should uppercase the result', () => {
    expect(getInitials('lower case team')).toBe('LC');
  });

  it('should handle empty string', () => {
    expect(getInitials('')).toBe('??');
  });

  it('should handle whitespace-only string', () => {
    expect(getInitials('   ')).toBe('??');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/initials.test.ts`
Expected: FAIL - module not found

**Step 3: Write minimal implementation**

```typescript
// src/lib/initials.ts
export function getInitials(teamName: string): string {
  const words = teamName.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return '??';
  }

  if (words.length === 1) {
    // Single word: take first two characters
    return words[0].substring(0, 2).toUpperCase();
  }

  // Multiple words: take first character of first two words
  return (words[0][0] + words[1][0]).toUpperCase();
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/initials.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/initials.ts src/lib/initials.test.ts
git commit -m "feat: add getInitials helper for team avatars"
```

---

## Task 2: Update MatchSummaryCardProps Interface

**Files:**
- Modify: `src/components/dashboard/MatchSummaryCard.tsx`
- Modify: `src/components/dashboard/MatchSummaryCard.test.tsx`

**Step 1: Update the props interface**

In `src/components/dashboard/MatchSummaryCard.tsx`, replace the interface:

```typescript
export interface MatchSummaryCardProps {
  type: 'live' | 'upcoming' | 'finished';

  // Team info
  yourTeamName: string;           // NEW
  opponentTeamName?: string;      // Now optional (undefined = TBD)

  // Context
  leagueName: string;
  roundName: string;

  // Scores (live/finished)
  yourScore?: number | null;
  theirScore?: number | null;

  // Finished result
  result?: 'won' | 'lost';

  // Upcoming info
  gameweek?: number;

  // Navigation
  onClick?: () => void;
}
```

**Step 2: Update all test cases to include yourTeamName**

In every `render(<MatchSummaryCard ... />)` call, add `yourTeamName="My Team"`:

```typescript
render(
  <MatchSummaryCard
    type="live"
    yourTeamName="My Team"  // ADD THIS LINE
    opponentTeamName="Dave's Dumpster Fire"
    leagueName="Work League"
    roundName="Semi-finals"
    yourScore={52}
    theirScore={48}
  />
);
```

**Step 3: Run tests to verify they still pass**

Run: `npm test -- src/components/dashboard/MatchSummaryCard.test.tsx`
Expected: PASS (component still renders, just ignoring new prop for now)

**Step 4: Commit**

```bash
git add src/components/dashboard/MatchSummaryCard.tsx src/components/dashboard/MatchSummaryCard.test.tsx
git commit -m "feat: add yourTeamName prop to MatchSummaryCard interface"
```

---

## Task 3: Create TeamAvatar Sub-component

**Files:**
- Modify: `src/components/dashboard/MatchSummaryCard.tsx`
- Modify: `src/components/dashboard/MatchSummaryCard.test.tsx`

**Step 1: Write the failing test for avatar rendering**

Add to `MatchSummaryCard.test.tsx`:

```typescript
describe('Team Avatars', () => {
  it('should display initials for your team', () => {
    render(
      <MatchSummaryCard
        type="live"
        yourTeamName="Haaland's Hairband"
        opponentTeamName="Salah's Legacy"
        leagueName="Work League"
        roundName="Semi-finals"
        yourScore={52}
        theirScore={48}
      />
    );

    expect(screen.getByText('HH')).toBeInTheDocument();
  });

  it('should display initials for opponent team', () => {
    render(
      <MatchSummaryCard
        type="live"
        yourTeamName="Haaland's Hairband"
        opponentTeamName="Salah's Legacy"
        leagueName="Work League"
        roundName="Semi-finals"
        yourScore={52}
        theirScore={48}
      />
    );

    expect(screen.getByText('SL')).toBeInTheDocument();
  });

  it('should display TBD for missing opponent', () => {
    render(
      <MatchSummaryCard
        type="upcoming"
        yourTeamName="Haaland's Hairband"
        leagueName="Work League"
        roundName="Semi-finals"
        gameweek={14}
      />
    );

    expect(screen.getByText('TBD')).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/components/dashboard/MatchSummaryCard.test.tsx`
Expected: FAIL - initials not rendered

**Step 3: Create TeamAvatar component inside the file**

Add above the main component in `MatchSummaryCard.tsx`:

```typescript
import { getInitials } from '@/lib/initials';

interface TeamAvatarProps {
  teamName?: string;
  isYou?: boolean;
  isWinner?: boolean;
  isLoser?: boolean;
  isTBD?: boolean;
}

function TeamAvatar({ teamName, isYou, isWinner, isLoser, isTBD }: TeamAvatarProps) {
  const initials = isTBD ? 'TBD' : teamName ? getInitials(teamName) : '??';

  const baseClasses = 'h-12 w-12 rounded-full flex items-center justify-center font-bold text-sm';

  if (isTBD) {
    return (
      <div className={cn(baseClasses, 'border-2 border-dashed border-muted-foreground/50 text-muted-foreground text-xs')}>
        {initials}
      </div>
    );
  }

  if (isWinner) {
    return (
      <div className={cn(baseClasses, 'border-2 border-primary bg-primary/10 text-primary')}>
        {initials}
      </div>
    );
  }

  if (isLoser) {
    return (
      <div className={cn(baseClasses, 'border border-muted bg-muted/50 text-muted-foreground grayscale')}>
        {initials}
      </div>
    );
  }

  if (isYou) {
    return (
      <div className={cn(baseClasses, 'border-2 border-primary bg-primary/10 text-primary')}>
        {initials}
      </div>
    );
  }

  // Default: opponent in live/upcoming
  return (
    <div className={cn(baseClasses, 'border border-muted bg-muted/50 text-muted-foreground')}>
      {initials}
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/components/dashboard/MatchSummaryCard.test.tsx`
Expected: FAIL (still need to use TeamAvatar in main component - will fix in next task)

**Step 5: Commit partial progress**

```bash
git add src/components/dashboard/MatchSummaryCard.tsx src/components/dashboard/MatchSummaryCard.test.tsx
git commit -m "feat: add TeamAvatar sub-component for match cards"
```

---

## Task 4: Rewrite MatchSummaryCard Layout

**Files:**
- Modify: `src/components/dashboard/MatchSummaryCard.tsx`
- Modify: `src/components/dashboard/MatchSummaryCard.test.tsx`

**Step 1: Write tests for new layout structure**

Add/update tests in `MatchSummaryCard.test.tsx`:

```typescript
describe('Card Layout', () => {
  it('should show status badge in header for live match', () => {
    render(
      <MatchSummaryCard
        type="live"
        yourTeamName="My Team"
        opponentTeamName="Their Team"
        leagueName="Work League"
        roundName="Semi-finals"
        yourScore={52}
        theirScore={48}
      />
    );

    expect(screen.getByText(/live/i)).toBeInTheDocument();
  });

  it('should show league and round in header', () => {
    render(
      <MatchSummaryCard
        type="live"
        yourTeamName="My Team"
        opponentTeamName="Their Team"
        leagueName="Work League"
        roundName="Semi-finals"
        yourScore={52}
        theirScore={48}
      />
    );

    expect(screen.getByText(/Work League/)).toBeInTheDocument();
    expect(screen.getByText(/Semi-finals/)).toBeInTheDocument();
  });

  it('should show large score display for live match', () => {
    render(
      <MatchSummaryCard
        type="live"
        yourTeamName="My Team"
        opponentTeamName="Their Team"
        leagueName="Work League"
        roundName="Semi-finals"
        yourScore={78}
        theirScore={62}
      />
    );

    // Score should be prominent
    const scoreElement = screen.getByText(/78/);
    expect(scoreElement).toBeInTheDocument();
  });

  it('should show point differential badge when winning', () => {
    render(
      <MatchSummaryCard
        type="live"
        yourTeamName="My Team"
        opponentTeamName="Their Team"
        leagueName="Work League"
        roundName="Semi-finals"
        yourScore={78}
        theirScore={62}
      />
    );

    expect(screen.getByText(/\+16/)).toBeInTheDocument();
  });

  it('should show VS for upcoming match', () => {
    render(
      <MatchSummaryCard
        type="upcoming"
        yourTeamName="My Team"
        opponentTeamName="Their Team"
        leagueName="Work League"
        roundName="Semi-finals"
        gameweek={14}
      />
    );

    expect(screen.getByText('VS')).toBeInTheDocument();
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm test -- src/components/dashboard/MatchSummaryCard.test.tsx`
Expected: FAIL - layout not implemented

**Step 3: Rewrite main component**

Replace the entire `MatchSummaryCard` function with new implementation:

```typescript
export function MatchSummaryCard(props: MatchSummaryCardProps) {
  const {
    type,
    yourTeamName,
    opponentTeamName,
    leagueName,
    roundName,
    yourScore,
    theirScore,
    gameweek,
    result,
    onClick,
  } = props;

  const isClickable = !!onClick;
  const isTBD = !opponentTeamName;
  const hasScores = yourScore != null && theirScore != null;
  const scoreDiff = hasScores ? yourScore - theirScore : 0;

  // Determine avatar states
  const youWon = type === 'finished' && result === 'won';
  const youLost = type === 'finished' && result === 'lost';

  // Card classes based on state
  const cardClasses = cn(
    'overflow-hidden transition-all duration-200',
    {
      'border-2 border-primary shadow-[0_0_20px_rgba(0,255,136,0.1)]': type === 'live',
      'border-dashed': type === 'upcoming',
      'opacity-90': youLost,
    },
    isClickable && 'cursor-pointer hover:-translate-y-1'
  );

  // Header badge content
  const renderStatusBadge = () => {
    switch (type) {
      case 'live':
        return (
          <Badge variant="default" className="gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse" />
            Live
          </Badge>
        );
      case 'finished':
        return (
          <Badge variant="secondary">
            Finished
          </Badge>
        );
      case 'upcoming':
        return (
          <Badge variant="outline">
            Upcoming
          </Badge>
        );
    }
  };

  // Score or VS display
  const renderScoreSection = () => {
    if (type === 'upcoming') {
      return (
        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl font-bold text-muted-foreground">VS</span>
          {gameweek && (
            <span className="text-xs text-muted-foreground">GW{gameweek}</span>
          )}
        </div>
      );
    }

    if (!hasScores) {
      return <span className="text-muted-foreground">-</span>;
    }

    return (
      <div className="flex flex-col items-center gap-1">
        <div className="text-2xl font-black tracking-wider tabular-nums">
          {yourScore}
          <span className="text-muted-foreground mx-1">-</span>
          {theirScore}
        </div>
        {type === 'live' && scoreDiff !== 0 && (
          <Badge variant={scoreDiff > 0 ? 'default' : 'destructive'} className="text-xs">
            {scoreDiff > 0 ? '+' : ''}{scoreDiff} pts
          </Badge>
        )}
        {type === 'finished' && (
          <Badge variant={youWon ? 'default' : 'destructive'} className="text-xs">
            {youWon ? 'Won' : 'Lost'}
          </Badge>
        )}
      </div>
    );
  };

  // Footer content
  const renderFooter = () => {
    if (type === 'live' && hasScores) {
      if (scoreDiff > 0) return 'Winning';
      if (scoreDiff < 0) return 'Losing';
      return 'Tied';
    }
    if (type === 'finished') {
      return youLost ? (
        <span className="text-destructive">Eliminated</span>
      ) : (
        <span className="text-primary">Advanced</span>
      );
    }
    if (type === 'upcoming' && isTBD && gameweek) {
      return `Opponent TBD after GW${gameweek - 1}`;
    }
    return null;
  };

  return (
    <Card role="article" className={cardClasses} onClick={onClick}>
      {/* Header */}
      <div className="px-4 py-2 border-b bg-muted/30 flex justify-between items-center">
        {renderStatusBadge()}
        <span className="text-xs text-muted-foreground">
          {leagueName} · {roundName}
        </span>
      </div>

      {/* Body */}
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Your team */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <TeamAvatar
              teamName={yourTeamName}
              isYou
              isWinner={youWon}
              isLoser={youLost}
            />
            <span className="text-xs font-medium text-center line-clamp-1">You</span>
          </div>

          {/* Score/VS */}
          {renderScoreSection()}

          {/* Opponent */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <TeamAvatar
              teamName={opponentTeamName}
              isTBD={isTBD}
              isWinner={youLost}
              isLoser={youWon}
            />
            <span className="text-xs font-medium text-muted-foreground text-center line-clamp-1">
              {isTBD ? 'TBD' : opponentTeamName}
            </span>
          </div>
        </div>
      </CardContent>

      {/* Footer */}
      <div className="px-4 py-2 border-t bg-muted/20 flex justify-between items-center">
        <span className="text-xs text-muted-foreground">{renderFooter()}</span>
        {isClickable && (
          <span className="text-xs text-muted-foreground">
            Details →
          </span>
        )}
      </div>
    </Card>
  );
}
```

**Step 4: Run tests to verify they pass**

Run: `npm test -- src/components/dashboard/MatchSummaryCard.test.tsx`
Expected: Some pass, some may need adjustment

**Step 5: Fix any failing tests and run full suite**

Run: `npm test`
Expected: PASS

**Step 6: Commit**

```bash
git add src/components/dashboard/MatchSummaryCard.tsx src/components/dashboard/MatchSummaryCard.test.tsx
git commit -m "feat: redesign MatchSummaryCard with avatar layout"
```

---

## Task 5: Update Test File for New Behavior

**Files:**
- Modify: `src/components/dashboard/MatchSummaryCard.test.tsx`

**Step 1: Review and update all existing tests**

Many existing tests reference old behavior (e.g., "Beat X", "Lost to X" text). Update these to match new design:

- Remove tests for "Beat/Lost to" prefix text
- Update tests to check for "Won"/"Lost" badges
- Update tests for new footer content
- Keep click behavior tests
- Keep accessibility tests

**Step 2: Run full test suite**

Run: `npm test -- src/components/dashboard/MatchSummaryCard.test.tsx`
Expected: PASS

**Step 3: Commit**

```bash
git add src/components/dashboard/MatchSummaryCard.test.tsx
git commit -m "test: update MatchSummaryCard tests for new design"
```

---

## Task 6: Update YourMatchesSection Props

**Files:**
- Modify: `src/components/dashboard/YourMatchesSection.tsx`
- Modify: `src/components/dashboard/YourMatchesSection.test.tsx`

**Step 1: Update the test file to include yourTeamName in mock data**

In `YourMatchesSection.test.tsx`, add `yourTeamName` to all mock match objects:

```typescript
const mockMatches: MatchSummaryCardProps[] = [
  {
    type: 'live',
    yourTeamName: 'My Team',  // ADD THIS
    opponentTeamName: 'Team A',
    leagueName: 'League 1',
    roundName: 'Round 1',
    yourScore: 50,
    theirScore: 45,
  },
  // ... update all other mock objects
];
```

**Step 2: Run tests**

Run: `npm test -- src/components/dashboard/YourMatchesSection.test.tsx`
Expected: PASS (props just pass through)

**Step 3: Commit**

```bash
git add src/components/dashboard/YourMatchesSection.tsx src/components/dashboard/YourMatchesSection.test.tsx
git commit -m "test: update YourMatchesSection tests with yourTeamName"
```

---

## Task 7: Update LeaguesPage to Pass yourTeamName

**Files:**
- Modify: `src/pages/LeaguesPage.tsx`
- Modify: `src/pages/LeaguesPage.test.tsx`

**Step 1: Update aggregateMatches function**

In `LeaguesPage.tsx`, update the `aggregateMatches` function to include `yourTeamName`:

```typescript
const aggregateMatches = (): MatchSummaryCardProps[] => {
  const allMatches: MatchSummaryCardProps[] = [];
  const yourTeamName = teamInfo?.teamName ?? 'Your Team';  // ADD THIS

  for (const league of leagues) {
    if (league.userProgress?.currentMatch) {
      const match = league.userProgress.currentMatch;
      allMatches.push({
        type: match.isLive ? 'live' : 'upcoming',
        yourTeamName,  // ADD THIS
        opponentTeamName: match.opponentTeamName,
        leagueName: league.name,
        roundName: match.roundName,
        yourScore: match.yourScore,
        theirScore: match.theirScore,
        gameweek: match.gameweek,
        onClick: () => navigate(`/league/${league.id}`),
      });
    }

    if (league.userProgress?.recentResult) {
      const match = league.userProgress.recentResult;
      allMatches.push({
        type: 'finished',
        yourTeamName,  // ADD THIS
        opponentTeamName: match.opponentTeamName,
        leagueName: league.name,
        roundName: match.roundName,
        yourScore: match.yourScore,
        theirScore: match.theirScore,
        result: match.result === 'won' ? 'won' : 'lost',
        onClick: () => navigate(`/league/${league.id}`),
      });
    }
  }

  return allMatches;
};
```

**Step 2: Update LeaguesPage tests if needed**

Run: `npm test -- src/pages/LeaguesPage.test.tsx`
Expected: PASS

**Step 3: Run full test suite**

Run: `npm test`
Expected: PASS

**Step 4: Commit**

```bash
git add src/pages/LeaguesPage.tsx src/pages/LeaguesPage.test.tsx
git commit -m "feat: pass yourTeamName to match cards in LeaguesPage"
```

---

## Task 8: Visual Polish and Final Testing

**Files:**
- Modify: `src/components/dashboard/MatchSummaryCard.tsx`

**Step 1: Add any missing Tailwind classes for design fidelity**

Review against design reference and adjust:
- Border colors
- Shadow effects
- Animation for pulsing dot
- Typography sizes
- Spacing

**Step 2: Manual visual verification**

Run: `npm run dev`
- Navigate to leagues page
- Check live match card appearance
- Check finished (won) card appearance
- Check finished (lost) card appearance
- Check upcoming card appearance
- Test click navigation

**Step 3: Run full test suite**

Run: `npm test`
Expected: PASS

**Step 4: Final commit**

```bash
git add src/components/dashboard/MatchSummaryCard.tsx
git commit -m "style: polish MatchSummaryCard visual design"
```

---

## Summary

| Task | Description | Est. Time |
|------|-------------|-----------|
| 1 | Add getInitials helper | 5 min |
| 2 | Update props interface | 5 min |
| 3 | Create TeamAvatar sub-component | 10 min |
| 4 | Rewrite main card layout | 15 min |
| 5 | Update tests for new behavior | 10 min |
| 6 | Update YourMatchesSection | 5 min |
| 7 | Update LeaguesPage | 5 min |
| 8 | Visual polish | 10 min |

**Total: ~65 minutes**

## Verification Checklist

- [ ] All unit tests pass
- [ ] Live match card shows green border, pulsing indicator, scores, diff badge
- [ ] Finished (won) card shows green accent, "Won" badge
- [ ] Finished (lost) card shows muted styling, "Lost" badge, "Eliminated" footer
- [ ] Upcoming card shows dashed border, "VS", gameweek info
- [ ] TBD opponent shows dashed avatar circle
- [ ] Click navigation works for all card types
- [ ] No console errors
