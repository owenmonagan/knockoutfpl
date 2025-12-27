# Knockout FPL

## Overview

This document defines the core user experience once someone enters the Knockout FPL ecosystem. It covers tournament views, match experiences, dashboard design, email communications, and the moments that create emotional engagement.

**Core principle:** Every screen answers one question — *"Am I going to survive this gameweek?"*

---

## Part 1: The Tournament Experience

### The Core Loop

Once a user is inside, their week revolves around tension and stakes. The interface exists to amplify that feeling, not just display data.

**What we're showing:** Who stands between you and the trophy.

**What we're selling:** The feeling that every point matters.

---

## Tournament Home: "The Bracket"

The main tournament view. The bracket isn't data visualization — it's a narrative map.

### Layout Hierarchy

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. HEADER                                                          │
│     Tournament name, current round, live status                     │
├─────────────────────────────────────────────────────────────────────┤
│  2. YOUR PATH TO THE FINAL                                          │
│     Personal journey strip — past, present, future matches          │
├─────────────────────────────────────────────────────────────────────┤
│  3. YOUR MATCH                                                      │
│     The main event — head-to-head detail with stakes callout        │
├─────────────────────────────────────────────────────────────────────┤
│  4. THE FULL BRACKET                                                │
│     Complete tournament view for context                            │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Component 1: Your Path to the Final

A horizontal journey strip showing only the user's matches.

#### Visual Specifications

| Element | Specification |
|---------|---------------|
| Container | Full width, 80px height, Gray 50 background |
| Round nodes | 64px circles connected by lines |
| Trophy icon | Final destination, always visible on right |
| Connector lines | 2px, Gold for completed wins, Gray 200 for pending |

#### Round Node States

| State | Background | Border | Content |
|-------|------------|--------|---------|
| Completed (won) | Gold (#C9A227) | None | ✓ checkmark |
| Current (live) | White | 2px pulsing green | "LIVE" text |
| Current (upcoming) | White | 2px Gray 200 | Opponent initial |
| Future | Gray 100 | 1px Gray 200 | "?" |
| Completed (lost) | N/A | N/A | Path disappears — user eliminated |

#### Content Display

| State | Primary Text | Secondary Text |
|-------|--------------|----------------|
| Completed (won) | "✓ Won 67-52" | Round name |
| Current (live) | "vs [Opponent]" | "LIVE" badge |
| Current (upcoming) | "vs [Opponent]" | "Sat 3pm" |
| Future | "?" | Round name |

---

### Component 2: Your Match (The Main Event)

The head-to-head comparison is the centerpiece. This is where tension lives.

#### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│  YOUR MATCH                                              LIVE 🔴    │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────┬─────────────────────────┐              │
│  │                         │                         │              │
│  │  YOUR TEAM              │  OPPONENT               │              │
│  │                         │                         │              │
│  │        52               │        48               │              │
│  │                         │                         │              │
│  │  ████████████████████   │  ████████████████       │              │
│  │                         │                         │              │
│  │  Top scorers:           │  Top scorers:           │              │
│  │  Salah (C) ······· 14   │  Haaland (C) ····· 8    │              │
│  │  Palmer ·········· 11   │  Palmer ·········· 11   │              │
│  │  Haaland ·········· 8   │  Salah ············ 7   │              │
│  │                         │                         │              │
│  │  Still to play: 1       │  Still to play: 2       │              │
│  │                         │                         │              │
│  │  [View Full Lineup]     │  [View Full Lineup]     │              │
│  │                         │                         │              │
│  └─────────────────────────┴─────────────────────────┘              │
├─────────────────────────────────────────────────────────────────────┤
│  ⚡ 4 points from elimination                                       │
│  Dave has 2 players left. You have 1. Monday decides this.          │
└─────────────────────────────────────────────────────────────────────┘
```

#### Visual Specifications

| Element | Specification |
|---------|---------------|
| Container | White background, radius-lg (12px), shadow-md |
| Live badge | Green (#28A745) background, white text, pulsing animation |
| Score | score token (28px), weight 700 |
| Progress bars | 8px height, rounded, Gold for user / Navy for opponent |
| Player list | body-sm (14px), dotted leaders between name and points |
| Stakes callout | Warning Amber background, Near Black text, radius-md |

#### Stakes Callout Logic

The stakes callout is the most important UX element — it transforms status into drama.

| Situation | Margin | Primary Line | Secondary Line |
|-----------|--------|--------------|----------------|
| Winning (narrow) | 1-10 pts | "⚡ [X] points from elimination" | "[Opponent] has [Y] players left. [Context]." |
| Winning (comfortable) | 11-20 pts | "⚡ Holding on. [X] point cushion." | "[Context about remaining players]" |
| Winning (cruising) | 21+ pts | "⚡ Cruising. But it's not over." | "[Context]" |
| Losing (narrow) | 1-10 pts | "⚡ [X] points from survival" | "You have [Y] players left. [Context]." |
| Losing (concerning) | 11-20 pts | "⚡ Need a comeback. [X] behind." | "[Context]" |
| Losing (danger) | 21+ pts | "⚡ Danger zone." | "Miracles happen. [X] points needed." |
| Tied | 0 pts | "⚡ Dead heat." | "Next point wins. [Context]." |

#### Context Line Examples

- "Dave has 2 players left. You have 1. Monday decides this."
- "Your captain hasn't played yet. Neither has theirs."
- "Salah plays Sunday. That's your chance."
- "All your players are done. Hope Dave's blank."

---

### Component 3: The Full Bracket

Complete tournament visualization for users who want the big picture.

#### Layout Principles

1. **Winners flow left to right** — Trophy on the right
2. **Connector lines show paths** — Gold for winners, gray for pending
3. **User's path highlighted** — Instantly visible
4. **Round headers tell the story** — "16 REMAIN" not "Round of 16"

#### Round Header Transformation

| Standard | Dramatic |
|----------|----------|
| Round of 32 | 32 REMAIN |
| Round of 16 | 16 REMAIN |
| Quarter-finals | 8 REMAIN |
| Semi-finals | 4 REMAIN |
| Final | THE FINAL |

#### Bracket Specifications

| Element | Specification |
|---------|---------------|
| Matchup card width | 200px minimum |
| Connector lines | 2px stroke, 4px corner radius |
| Default connector | Gray 200 (#E5E5E5) |
| Winner connector | Gold (#C9A227) |
| User's path | Gold highlight, slightly thicker (3px) |
| Round spacing | 48px between rounds |
| Animation | Lines draw left-to-right on advancement (300ms, ease-out) |

#### Mobile Adaptation

On screens < 640px:
- Bracket becomes swipeable by round
- "Your Match" pinned at top
- Navigation dots indicate current round
- Swipe gesture hints on first visit

---

### Match Card States

The matchup card tells the story of each fight.

#### Card Anatomy

```
┌─────────────────────────────────────────┐
│ ┌─────────────────────────────────────┐ │
│ │ [Avatar] Team Name             52   │ │  ← Row 1 (winner gets gold border)
│ ├─────────────────────────────────────┤ │
│ │ [Avatar] Opponent              48   │ │  ← Row 2 (loser gets dimmed)
│ └─────────────────────────────────────┘ │
│                     Stakes message      │  ← Context line
└─────────────────────────────────────────┘
```

#### State Treatments

| State | Card Treatment | Border | Shadow | Opacity |
|-------|---------------|--------|--------|---------|
| Upcoming | Default | 1px Gray 200 | shadow-md | 100% |
| Live | Pulsing border | 2px green, pulsing | shadow-md | 100% |
| User winning | Gold accent | 4px gold left on user row | shadow-md | 100% |
| User losing | Red accent | 2px red left on user row | shadow-md | 100% |
| Complete (won) | Gold celebration | 2px gold full | shadow-gold | 100% |
| Complete (lost) | Dimmed | 1px Gray 200 | none | 50% |
| User's match | Highlighted | 2px gold full card | shadow-lg | 100% |

#### Score Display

| State | User Score | Opponent Score |
|-------|------------|----------------|
| Upcoming | "—" | "—" |
| Live | Real-time, bold | Real-time, normal |
| User winning | Bold, gold text | Normal |
| User losing | Normal | Bold |
| Complete | Final score | Final score |

---

## The Dashboard: "Command Center"

Home base for users with multiple tournaments.

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER                                                             │
│  Logo + Profile                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Welcome back, [Team Name].                     GW22 · Sat 3pm      │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  YOUR BATTLES                                                       │
│                                                                     │
│  [Live Match Cards]                                                 │
│  [Upcoming Match Cards]                                             │
│  [Championship Cards]                                               │
│  [Elimination Cards]                                                │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  START A NEW TOURNAMENT                                             │
│                                                                     │
│  [Leagues without knockouts]                                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Card Priority Order

Display cards in this order (top to bottom):

1. **Live matches** — Need attention NOW
2. **Upcoming matches** — Building anticipation
3. **Championships won** — Glory deserves prominence
4. **Eliminations** — Story complete, still visible
5. **Leagues without tournaments** — The upsell

### Dashboard Card Types

#### Live Match Card

```
┌──────────────────────────────────────────────────────────────────┐
│  🔴 LIVE                                                         │
│                                                                  │
│  WORK FRIENDS KNOCKOUT                           Quarter-finals  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  You 52 ████████████████████                               │  │
│  │  Dave 48 ██████████████████                                │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ⚡ 4 points from elimination                  [View Bracket →]  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### Championship Card

```
┌──────────────────────────────────────────────────────────────────┐
│  🏆 CHAMPION                                                     │
│                                                                  │
│  FAMILY CUP 2024                                                 │
│                                                                  │
│  You won the whole thing.                                        │
│  Final: You 78 - 71 Uncle Terry                                  │
│                                                                  │
│                                            [View Trophy Room →]  │
└──────────────────────────────────────────────────────────────────┘
```

#### Elimination Card

```
┌──────────────────────────────────────────────────────────────────┐
│  💀 ELIMINATED                                                   │
│                                                                  │
│  REDDIT R/FANTASYFPL KNOCKOUT                     Round of 64    │
│                                                                  │
│  Knocked out by xXSalahLad99Xx · 45-51                           │
│  Champion: Still competing (Semi-finals)                         │
│                                                                  │
│                                              [Watch Bracket →]   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Key Moment Screens

### Victory Screen

Displayed when user wins a match.

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                           VICTORY.                                  │
│                                                                     │
│                      You advance to the                             │
│                       Quarter-finals.                               │
│                                                                     │
│           ┌────────────────────────────────────────┐                │
│           │  You 67                                │                │
│           │  ████████████████████████████████████  │                │
│           │                                        │                │
│           │  Tim's Terrors 52                      │                │
│           │  ██████████████████████████            │                │
│           └────────────────────────────────────────┘                │
│                                                                     │
│                    15 point victory.                                │
│                                                                     │
│          ─────────────────────────────────────────                  │
│                                                                     │
│                     NEXT OPPONENT                                   │
│                                                                     │
│                  Dave's Dumpster Fire                               │
│               Overall Rank: 124,892                                 │
│               Last Round: Won 71-63                                 │
│                                                                     │
│           The Quarter-finals begin Gameweek 23.                     │
│                                                                     │
│              ┌────────────────────────────┐                         │
│              │     View Updated Bracket   │                         │
│              └────────────────────────────┘                         │
│                                                                     │
│              ┌────────────────────────────┐                         │
│              │      Remind Dave →         │                         │
│              └────────────────────────────┘                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### Victory Animation Sequence

| Step | Duration | Animation |
|------|----------|-----------|
| 1 | 0ms | "VICTORY." fades in |
| 2 | 200ms | Card scales to 1.02 with ease-bounce |
| 3 | 300ms | Gold confetti begins (subtle, 3 seconds) |
| 4 | 400ms | Gold shadow fades in on card |
| 5 | 500ms | Next opponent section fades in |

#### Victory Specifications

| Element | Specification |
|---------|---------------|
| Headline | display-lg (48px), Near Black, center |
| Subhead | body-lg (18px), Gray 500 |
| Card | Gold border (2px), shadow-gold |
| Progress bars | Gold for winner, Gray 200 for loser |
| Next opponent | Navy background card, White text |
| Primary CTA | Gold background |
| Secondary CTA | Ghost (gold border) |

---

### Elimination Screen

Displayed when user loses a match.

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                         ELIMINATED.                                 │
│                                                                     │
│                     Round of 16. So close.                          │
│                                                                     │
│           ┌────────────────────────────────────────┐                │
│           │  You 48                                │                │
│           │  ████████████████████████              │                │
│           │                                        │                │
│           │  Dave's Dumpster Fire 52               │                │
│           │  ██████████████████████████████        │                │
│           └────────────────────────────────────────┘                │
│                                                                     │
│                    Lost by 4 points.                                │
│                                                                     │
│           ─────────────────────────────────────────                 │
│                                                                     │
│           You can still watch the tournament unfold.                │
│           Who knows — maybe you'll see Dave get crushed.            │
│                                                                     │
│              ┌────────────────────────────┐                         │
│              │      Watch Bracket         │                         │
│              └────────────────────────────┘                         │
│                                                                     │
│              ┌────────────────────────────┐                         │
│              │   See Next Season's Leagues    │                     │
│              └────────────────────────────┘                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### Elimination Animation Sequence

| Step | Duration | Animation |
|------|----------|-----------|
| 1 | 0ms | "ELIMINATED." fades in |
| 2 | 200ms | Card fades to 50% opacity |
| 3 | 300ms | Subtle shake (optional) |
| 4 | 400ms | Continued engagement section fades in |

#### Elimination Design Notes

- No confetti
- Quick transition — don't linger on the pain
- Schadenfreude line ("maybe you'll see Dave get crushed") turns elimination into new rooting interest
- Offer continued engagement (watch) and future hope (next season)

---

### Championship Screen

The ultimate moment. Earned, not given.

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ╔═════════════════════════════════════════════════════════════╗    │
│  ║                                                             ║    │
│  ║                           🏆                                ║    │
│  ║                                                             ║    │
│  ║                       CHAMPION                              ║    │
│  ║                                                             ║    │
│  ║                     [Team Name FC]                          ║    │
│  ║                                                             ║    │
│  ║              WORK FRIENDS KNOCKOUT 2024                     ║    │
│  ║                                                             ║    │
│  ║   ──────────────────────────────────────────────────────    ║    │
│  ║                                                             ║    │
│  ║                     THE FINAL                               ║    │
│  ║                                                             ║    │
│  ║               You 78 ━━━━━━ 71 Uncle Terry                  ║    │
│  ║                                                             ║    │
│  ║   ──────────────────────────────────────────────────────    ║    │
│  ║                                                             ║    │
│  ║                    THE JOURNEY                              ║    │
│  ║                                                             ║    │
│  ║          R32: 67-52 vs Tim's Terrors                        ║    │
│  ║          R16: 71-63 vs Sara's Squad                         ║    │
│  ║           QF: 58-55 vs Dave's Dumpster Fire                 ║    │
│  ║           SF: 81-72 vs The Chosen XI                        ║    │
│  ║        FINAL: 78-71 vs Uncle Terry's Terrors                ║    │
│  ║                                                             ║    │
│  ║           5 matches. 5 victories. 1 champion.               ║    │
│  ║                                                             ║    │
│  ╚═════════════════════════════════════════════════════════════╝    │
│                                                                     │
│     ┌────────────────────────┐  ┌────────────────────────┐          │
│     │    Share Victory       │  │    Download Trophy     │          │
│     └────────────────────────┘  └────────────────────────┘          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### Championship Specifications

| Element | Specification |
|---------|---------------|
| Container | Gold border (3px), Midnight Blue background |
| Trophy icon | 48px, animated glow |
| "CHAMPION" | display-lg (48px), Gold, caps |
| Team name | heading-1 (32px), White |
| Journey list | body (16px), Light Gold |
| Summary line | body-lg (18px), White, italic |
| Share buttons | Gold background, side by side |

#### "Download Trophy" Feature

Generates a shareable image optimized for social media:
- 1200x630px (Twitter/Facebook)
- 1080x1080px (Instagram)
- Includes: Trophy, team name, tournament name, final score
- Branded with Knockout FPL logo

---

## Part 2: Email Communications

### Philosophy

Emails serve one purpose: **drive users back into the tension.**

Not newsletters. Not updates. **Drama amplification.**

---

### Email Cadence Overview

| Email | Timing | Trigger | Purpose |
|-------|--------|---------|---------|
| The Matchup | Tuesday/Wednesday | GW preview | Build anticipation |
| It's Live | First kickoff | GW starts | Get them watching |
| Halftime Report | Sunday morning | Close match only | Mid-GW tension |
| The Verdict | Monday night | GW ends | Result + next steps |
| Tournament Milestones | As they happen | Final, champion | Major moments |

---

### Email 1: The Matchup

**When:** Tuesday or Wednesday before gameweek

**Subject line options:**
- "Your opponent this week: [Opponent Name]"
- "[Tournament Name]: You vs [Opponent]. One survives."
- "GW[X] Preview: [Opponent] stands between you and the [Round]"

#### Template Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  [KNOCKOUT FPL LOGO]                                                │
│                                                                     │
│  ═══════════════════════════════════════════════════════════════    │
│                                                                     │
│  [TOURNAMENT NAME]                                                  │
│  [Round] · [X] remain                                               │
│                                                                     │
│  ═══════════════════════════════════════════════════════════════    │
│                                                                     │
│                                                                     │
│  YOUR OPPONENT THIS WEEK                                            │
│                                                                     │
│           ┌──────────────────────────────────────┐                  │
│           │                                      │                  │
│           │  [OPPONENT NAME]                     │                  │
│           │                                      │                  │
│           │  Overall rank: [X]                   │                  │
│           │  Form: [W-W-L-W-W] (last 5 GWs)      │                  │
│           │  Last round: [Result]                │                  │
│           │                                      │                  │
│           └──────────────────────────────────────┘                  │
│                                                                     │
│                                                                     │
│  THE PATH FORWARD                                                   │
│                                                                     │
│  Win this week → [Next Round]                                       │
│  Lose → Eliminated                                                  │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  [Current] ───▶ [Next] ───▶ [Next+1] ───▶ 🏆               │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                     │
│  GW[X] kicks off [Day] at [Time].                                   │
│                                                                     │
│               ┌────────────────────────────┐                        │
│               │      View Full Bracket     │                        │
│               └────────────────────────────┘                        │
│                                                                     │
│  ───────────────────────────────────────────────────────────────    │
│  Knockout FPL · Unsubscribe · Manage preferences                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### Opponent Card Content

| Field | Source | Example |
|-------|--------|---------|
| Name | FPL API | "Dave's Dumpster Fire" |
| Overall rank | FPL API | "124,892" |
| Form | Calculate from last 5 GW scores | "W-W-L-W-W" |
| Last round result | Tournament data | "Won 71-63 vs Sara" |

---

### Email 2: It's Live

**When:** First kickoff of the gameweek (typically Saturday 3pm UK)

**Subject line options:**
- "⚽ It's on. You vs [Opponent] — LIVE"
- "LIVE: Your [Round] has begun"
- "⚽ Gameweek [X] is live. Your survival starts now."

#### Template Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  [KNOCKOUT FPL LOGO]                                                │
│                                                                     │
│                                                                     │
│                           IT'S ON.                                  │
│                                                                     │
│                    [Round] · LIVE                                   │
│                                                                     │
│                                                                     │
│           ┌──────────────────────────────────────┐                  │
│           │  You  vs  [Opponent]                 │                  │
│           │   0           0                      │                  │
│           └──────────────────────────────────────┘                  │
│                                                                     │
│                   Live scoring has begun.                           │
│                                                                     │
│                                                                     │
│               ┌────────────────────────────┐                        │
│               │      Watch Your Match      │                        │
│               └────────────────────────────┘                        │
│                                                                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Design notes:** Short. Urgent. Single CTA. Get them in.

---

### Email 3: Halftime Report

**When:** Sunday morning (around 10am UK)

**Condition:** Only send if match margin is ≤15 points

**Subject line options:**
- "⚡ [X] points from elimination. Sunday's matches decide this."
- "Dead heat. You and [Opponent] are tied."
- "⚡ You're clinging on. [X] points up with [Y] players left."

#### Template Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  [KNOCKOUT FPL LOGO]                                                │
│                                                                     │
│                                                                     │
│                    HALFTIME REPORT                                  │
│                                                                     │
│                                                                     │
│           ┌──────────────────────────────────────┐                  │
│           │  You  [Score]   [Score]  [Opponent]  │                  │
│           │  █████████████  ██████████████       │                  │
│           └──────────────────────────────────────┘                  │
│                                                                     │
│                                                                     │
│             ⚡ [Stakes callout]                                     │
│                                                                     │
│                                                                     │
│  WHAT'S LEFT                                                        │
│                                                                     │
│  You: [Player] ([Day])                                              │
│  [Opponent]: [Player] ([Day]), [Player] ([Day])                     │
│                                                                     │
│  [Encouraging/tension-building line]                                │
│                                                                     │
│                                                                     │
│               ┌────────────────────────────┐                        │
│               │      Watch Live Scores     │                        │
│               └────────────────────────────┘                        │
│                                                                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### Conditional Lines

| Situation | Encouraging Line |
|-----------|------------------|
| User winning, opponent has more players | "[Opponent] has more players left. But you've got this." |
| User winning, fewer players left | "Your lead might be enough. Stay calm." |
| User losing, has more players | "You have [X] more players to come. Plenty of time." |
| User losing, fewer players | "It's not over. One big haul changes everything." |
| Tied | "Every point matters. Who blinks first?" |

---

### Email 4: The Verdict

**When:** Monday night after gameweek ends

**Two versions:** Victory and Elimination

#### Victory Version

**Subject line options:**
- "Victory. You advance to the [Next Round]."
- "You survived. [X] points to spare."
- "✓ [Opponent] eliminated. [Next Round] awaits."

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  [KNOCKOUT FPL LOGO]                                                │
│                                                                     │
│                                                                     │
│                         VICTORY.                                    │
│                                                                     │
│                 You advance to the [Next Round].                    │
│                                                                     │
│                                                                     │
│           ┌──────────────────────────────────────┐                  │
│           │  You  [Score]   [Score]  [Opponent]  │                  │
│           │  █████████████████████████████████   │                  │
│           │  ████████████████████████            │                  │
│           └──────────────────────────────────────┘                  │
│                                                                     │
│                    [X] point victory.                               │
│                                                                     │
│                                                                     │
│  ═══════════════════════════════════════════════════════════════    │
│                                                                     │
│                    NEXT OPPONENT                                    │
│                                                                     │
│                   [Next Opponent Name]                              │
│                  (Defeated [Previous] [Score])                      │
│                                                                     │
│             [Next Round] begins Gameweek [X].                       │
│                                                                     │
│                                                                     │
│               ┌────────────────────────────┐                        │
│               │      View Updated Bracket  │                        │
│               └────────────────────────────┘                        │
│                                                                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### Elimination Version

**Subject line options:**
- "Eliminated. [Round]."
- "[Opponent] advances. Your run ends."
- "Lost by [X]. Next season awaits."

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  [KNOCKOUT FPL LOGO]                                                │
│                                                                     │
│                                                                     │
│                        ELIMINATED.                                  │
│                                                                     │
│                  [Round]. So close.                                 │
│                                                                     │
│                                                                     │
│           ┌──────────────────────────────────────┐                  │
│           │  You  [Score]   [Score]  [Opponent]  │                  │
│           │  ████████████████████████            │                  │
│           │  █████████████████████████████████   │                  │
│           └──────────────────────────────────────┘                  │
│                                                                     │
│                    Lost by [X] points.                              │
│                                                                     │
│                                                                     │
│  ═══════════════════════════════════════════════════════════════    │
│                                                                     │
│                                                                     │
│  You can still watch the tournament unfold.                         │
│  Follow [Opponent]'s run — or hope someone else knocks them out.    │
│                                                                     │
│                                                                     │
│               ┌────────────────────────────┐                        │
│               │       Watch Bracket        │                        │
│               └────────────────────────────┘                        │
│                                                                     │
│                                                                     │
│  ───────────────────────────────────────────────────────────────    │
│  We'll let you know when someone starts a tournament for            │
│  your other leagues.                                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Email 5: Champion Crowned

**When:** When tournament concludes

**Recipients:** All tournament participants (not just winner)

**Subject line:** "🏆 [Winner] is your [Tournament Name] Champion"

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  [KNOCKOUT FPL LOGO]                                                │
│                                                                     │
│                                                                     │
│           ╔═══════════════════════════════════════╗                 │
│           ║                                       ║                 │
│           ║                 🏆                    ║                 │
│           ║                                       ║                 │
│           ║              CHAMPION                 ║                 │
│           ║                                       ║                 │
│           ║         [Winner Team Name]            ║                 │
│           ║                                       ║                 │
│           ║     [TOURNAMENT NAME]                 ║                 │
│           ║                                       ║                 │
│           ╚═══════════════════════════════════════╝                 │
│                                                                     │
│                                                                     │
│  THE FINAL                                                          │
│                                                                     │
│  [Winner] [Score]  ━━━━  [Score]  [Runner-up]                       │
│                                                                     │
│                                                                     │
│  THE BRACKET                                                        │
│                                                                     │
│   [X] entered. [Y] gameweeks. 1 survivor.                           │
│                                                                     │
│               ┌────────────────────────────┐                        │
│               │      View Full Bracket     │                        │
│               └────────────────────────────┘                        │
│                                                                     │
│                                                                     │
│  ═══════════════════════════════════════════════════════════════    │
│                                                                     │
│  Ready for next season?                                             │
│  Create a new knockout for your league.                             │
│                                                                     │
│               ┌────────────────────────────┐                        │
│               │    Start New Tournament    │                        │
│               └────────────────────────────┘                        │
│                                                                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Email Frequency by User Status

| Tournament Phase | User Status | Emails/Week |
|-----------------|-------------|-------------|
| Active | Alive | 2-3 (Preview + Live + Result) |
| Active | Alive, close match | 3-4 (adds Halftime) |
| Completed | Eliminated | 0-1 (major milestones only) |
| Between tournaments | None active | 0 (silence until stakes exist) |

**Key principle:** Only email when there's tension to amplify.

---

### Email Preferences

User-controllable settings:

| Setting | Default | Description |
|---------|---------|-------------|
| Match previews | ✓ On | Tuesday opponent reveal |
| Live kickoff alerts | ✓ On | GW start notification |
| Halftime updates | ✓ On | Close matches only |
| Results | ✓ On | Win/loss notifications |
| Tournament milestones | ✓ On | Finals, champions |
| New tournament invites | ✓ On | When leagues get knockouts |

---

## Part 3: Push Notifications

For mobile app and browser notifications.

### Notification Triggers

| Trigger | Message | Urgency |
|---------|---------|---------|
| Opponent scores | "[Player] scores! [Opponent] pulls within [X] points." | High |
| User takes lead | "You're ahead. [Score]-[Score]. Keep it going." | Medium |
| User falls behind | "[Opponent] takes the lead. [Score]-[Score]. [X] points from elimination." | High |
| Final whistle (close) | "[Player]'s game is over. You're up [X] with [Player] left to play." | High |
| User wins match | "VICTORY. You advance to [Round]." | High |
| User loses match | "Eliminated. [Round]. Lost by [X]." | High |
| Captain scores big | "Your captain [Player] hauls [X] points!" | Medium |
| Opponent captain scores big | "Danger: [Opponent]'s captain [Player] scores [X]" | High |

### Notification Tone

- **Short** — Under 100 characters
- **Stakes-focused** — Always reference the competition context
- **Never cheerful in defeat** — Direct, respectful

---

## Part 4: Engagement Features

### The Trophy Room

Permanent record of championship victories.

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  YOUR TROPHY ROOM                                                   │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │                                                            │     │
│  │    🏆                      🏆                               │     │
│  │                                                            │     │
│  │  Work Friends           Family Cup                         │     │
│  │  Knockout 2024          2024                               │     │
│  │                                                            │     │
│  │  Champion               Champion                           │     │
│  │                                                            │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                     │
│  Season Record: 10W - 2L across 2 tournaments                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Trophy display:**
- Trophy icon with tournament name
- Year won
- Click to view full bracket/journey

---

### Head-to-Head History

When facing a previous opponent:

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  HEAD-TO-HEAD HISTORY                                               │
│                                                                     │
│  You vs [Opponent]                                                  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Work Friends 2024 R16    You 67 - 52 [Opp]    ✓ You won     │  │
│  │  Family Cup 2023 QF       You 48 - 51 [Opp]    ✗ [Opp] won   │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  All-time: 1-1 · Time for the decider.                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Creates narratives:** Revenge matches. Grudges. Storylines.

---

### "Who Knocked You Out?" Tracker

For eliminated users watching the bracket:

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  THE ONE WHO KNOCKED YOU OUT                                        │
│                                                                     │
│  [Opponent Name]                                                    │
│                                                                     │
│  Current status: Semi-finals                                        │
│  Next match: vs [Next Opponent] (GW[X])                             │
│                                                                     │
│  [ Root against them ]  [ Actually, go [Opponent] ]                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Design note:** Buttons are emotional release valves. They acknowledge the feeling of wanting your eliminator to fail (or succeed, for the gracious losers).

---

## Part 5: Design Specifications Summary

### Color Usage by Context

| Context | Primary | Secondary | Accent |
|---------|---------|-----------|--------|
| Winning | Gold (#C9A227) | White | Green (#28A745) |
| Losing | Navy (#1A3A5C) | Gray 500 | Red (#DC3545) |
| Live | Green (#28A745) | White | Gold |
| Eliminated | Gray 200 | Gray 500 | None |
| Champion | Gold | Midnight (#0D1F3C) | White |

### Animation Durations

| Context | Duration | Easing |
|---------|----------|--------|
| Hover states | 100ms | ease-out |
| Score updates | 200ms | ease-out |
| Card transitions | 300ms | ease-out |
| Victory celebration | 500ms | ease-bounce |
| Elimination fade | 300ms | ease-out |

### Typography for Key Moments

| Moment | Style | Example |
|--------|-------|---------|
| Victory headline | display-lg, caps | "VICTORY." |
| Elimination headline | display-lg, caps | "ELIMINATED." |
| Champion headline | display-lg, gold | "CHAMPION" |
| Stakes callout | body, semibold | "4 points from elimination" |
| Score | score token (28px) | "52" |

---

## Implementation Checklist

### Tournament View
- [ ] Personal journey strip implemented
- [ ] Head-to-head comparison with progress bars
- [ ] Stakes callout logic for all scenarios
- [ ] Full bracket with user path highlighting
- [ ] All match card states styled
- [ ] Mobile swipe navigation

### Dashboard
- [ ] Card priority ordering
- [ ] Live match cards with real-time updates
- [ ] Championship display
- [ ] Elimination cards with "watch" CTA
- [ ] League upsell section

### Key Moments
- [ ] Victory screen with animation
- [ ] Elimination screen
- [ ] Championship screen with share/download
- [ ] Trophy room feature

### Email System
- [ ] The Matchup template
- [ ] It's Live template
- [ ] Halftime Report (conditional)
- [ ] Victory Verdict template
- [ ] Elimination Verdict template
- [ ] Champion Crowned template
- [ ] Email preference settings

### Notifications
- [ ] Push notification system
- [ ] All trigger conditions implemented
- [ ] Notification preferences

### Engagement Features
- [ ] Trophy room
- [ ] Head-to-head history
- [ ] Eliminator tracker

---

## The Ultimate Test

Before shipping any feature, ask:

> **"Does this make the stakes feel real?"**

If no, rethink it.

---

*Document Version 1.0 | December 2025*
*"Every gameweek is a cup final."*