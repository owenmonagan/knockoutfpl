# Match Card Visual Refinements

**Date:** 2026-01-01
**Component:** `MatchSummaryCard.tsx`
**Reference:** `/Users/owen/Downloads/stitch_knockout_fpl_landing_page_2/screen.png`

## Overview

Refine the MatchSummaryCard component to improve visual polish in three areas:
1. Border treatments by match state
2. Score section typography and badges
3. Winner/loser visual contrast

## 1. Border Treatments

Different visual states for each match type:

| State | Border | Shadow/Glow |
|-------|--------|-------------|
| Live | `border-2 border-primary` | `shadow-[0_0_20px_rgba(0,255,136,0.2)]` |
| Finished (won) | `border border-primary/30` | `shadow-[0_0_10px_rgba(0,255,136,0.05)]` |
| Finished (lost) | `border border-muted` | None |
| Upcoming | `border-2 border-dashed border-muted` | None, hover: `border-muted-foreground` |

### Implementation

Update `cardClasses` in MatchSummaryCard:

```tsx
const cardClasses = cn(
  'overflow-hidden transition-all duration-200',
  {
    // Live: prominent green border + glow
    'border-2 border-primary shadow-[0_0_20px_rgba(0,255,136,0.2)]': type === 'live',

    // Finished won: subtle green border + hint of glow
    'border border-primary/30 shadow-[0_0_10px_rgba(0,255,136,0.05)]': type === 'finished' && result === 'won',

    // Finished lost: muted border, no glow
    'border border-muted': type === 'finished' && result === 'lost',

    // Upcoming: dashed border with hover enhancement
    'border-2 border-dashed border-muted hover:border-muted-foreground': type === 'upcoming',
  },
  isClickable && 'cursor-pointer hover:-translate-y-1'
);
```

## 2. Score Section

Larger typography and more prominent badges.

### Changes

| Element | Current | New |
|---------|---------|-----|
| Score size | `text-2xl` | `text-3xl` |
| Score separator spacing | `mx-1` | `mx-2` |
| Point diff badge padding | default | `px-3 py-1` |
| Won badge | default | Add glow: `shadow-[0_0_8px_rgba(0,255,136,0.3)]` |

### Score Color Contrast (Finished Matches)

Winner's score stays bright, loser's score is muted:

```tsx
// In renderScoreSection for finished matches:
<div className="text-3xl font-black tracking-wider tabular-nums">
  <span className={youWon ? 'text-foreground' : 'text-muted-foreground'}>
    {yourScore}
  </span>
  <span className="text-muted-foreground mx-2">-</span>
  <span className={youLost ? 'text-foreground' : 'text-muted-foreground'}>
    {theirScore}
  </span>
</div>
```

## 3. Winner/Loser Contrast

More dramatic visual hierarchy between winner and eliminated player.

### Loser Side Treatment

Wrap entire loser section in opacity/grayscale:

```tsx
// Opponent section wrapper
<div className={cn(
  "flex flex-col items-center gap-2 flex-1",
  youWon && "opacity-60 grayscale"  // opponent lost = dimmed
)}>
```

### Your Side Treatment (When You Lost)

```tsx
// Your section wrapper
<div className={cn(
  "flex flex-col items-center gap-2 flex-1",
  youLost && "opacity-60 grayscale"
)}>
```

### Avatar Adjustments

The TeamAvatar component already handles winner/loser states. Minor enhancement for loser:

```tsx
if (isLoser) {
  return (
    <div className={cn(baseClasses, 'border border-muted bg-muted/30 text-muted-foreground')}>
      {initials}
    </div>
  );
}
```

Remove the `grayscale` from avatar since it's now on the parent container.

## Files to Modify

- `src/components/dashboard/MatchSummaryCard.tsx`

## Not In Scope

- Footer changes (timer, icons)
- Animation enhancements
- Mobile-specific adjustments
