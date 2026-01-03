# Matchup Card Redesign

## Overview

Update the "Your Matchup" card component to match the agreed design specification.

---

## Header Section

### Layout
```
[Status Badge]                                    (faint trophy icon)
Your Matchup
GW24 • Deadline: Sat 11:00
```

### Status Badge
- Position: Top left, above title
- States:
  - **Active**: Green background (e.g., `bg-winner-bg text-primary`)
  - **Eliminated**: Red background
  - **Advanced**: Green background (or distinct style)
- Content: Round name + status (e.g., "Round 5 Active", "Quarter-Finals Eliminated")

### Trophy Icon
- Position: Top right of header area
- Style: Faint/low opacity (e.g., `opacity-10` or `opacity-20`)
- Size: Large decorative element

### Live Indicator
- Move from inner card to header area
- Position near the status badge or gameweek text

---

## Inner Score Card

### Container
- Background: Slightly darker/different from outer card (creates visual separation)
- Border: Subtle border for definition
- Padding: Comfortable spacing

### Layout
- **Vertical stack** (NOT side-by-side)
- Your team on top, opponent below
- Remove the "VS" divider element

### Team Row Structure
```
Team Name                                    Score
Manager Name (Seed #XXX)
```

### Your Team (Top Row)
- Team name: **Green** (`text-primary`) - always green to indicate "you"
- Manager + seed: Muted text
- Score:
  - **White** during live/active match
  - **White** if match finished and you won
  - **Muted** if match finished and you lost

### Opponent (Bottom Row)
- Team name: **White**
- Manager + seed: Muted text
- Score:
  - **White** during live/active match
  - **White** if match finished and they won
  - **Muted** if match finished and they lost

### Avatars
- **Remove avatars** - not needed in this design

---

## Action Buttons

- Position: Below inner score card
- Buttons:
  1. "View Match Details" - Primary green button
  2. "Analyze Opponent" - Secondary/ghost button

---

## Example States

### Live Match (You Winning)
```
[Round 5 Active]                              (trophy)
Your Matchup
GW24 • Deadline: Sat 11:00

┌─────────────────────────────────────────────────┐
│  O-win FC                                  72   │  <- green name, white score
│  Owen Monagan (Seed #142)                       │
│                                                 │
│  Klopps & Robbers                          65   │  <- white name, white score
│  Sarah Jenkins (Seed #4005)                     │
└─────────────────────────────────────────────────┘

[View Match Details]  [Analyze Opponent]
```

### Finished Match (You Lost)
```
[Quarter-Finals Eliminated]                   (trophy)
Your Matchup
GW2 • Finished

┌─────────────────────────────────────────────────┐
│  O-win                                     48   │  <- green name, MUTED score (lost)
│  Owen Monagan (Seed #1)                         │
│                                                 │
│  WeAreTheCherkiGirls                       67   │  <- white name, white score (won)
│  Carl Ryan (Seed #8)                            │
└─────────────────────────────────────────────────┘

[View Match Details]  [Analyze Opponent]
```

---

## Implementation Checklist

- [ ] Update header layout (badge above title, trophy right)
- [ ] Move Live indicator to header area
- [ ] Change inner card background color
- [ ] Convert team layout from horizontal to vertical
- [ ] Remove VS divider
- [ ] Remove avatar elements
- [ ] Apply green color to user's team name
- [ ] Implement conditional score coloring (white vs muted based on win/loss)
- [ ] Ensure responsive behavior maintained
