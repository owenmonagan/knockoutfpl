# Challenge Detail Page: Preview & Live Comparison States

## Overview
Transform the challenge detail page to have engaging, progressive states that build anticipation and excitement, inspired by the FPL app's polished design.

## Three-State Design System

### **State 1: PREVIEW/ANTICIPATION** (Status: Accepted, Before Gameweek Starts)
**Goal**: Build excitement and anticipation for the upcoming battle

**Visual Design**:
- **Hero Card**: Cyan-to-purple gradient background (#00D9FF → #8B5CF6)
- **Large Countdown Timer**: Prominent display "Kicks off in 2 days, 18 hours"
- **VS Layout**: Split design showing both managers side-by-side
- **Status Badge**: "⏰ Starting Soon" (changes color as deadline approaches)

**Layout**:
```
┌──────────────────────────────────────────────┐
│  ⚔️ Monzaga vs Eyad fc                      │
│     Gameweek 7 Showdown                      │
│  [⏰ Starting Soon Badge]                    │
├──────────────────────────────────────────────┤
│  [LARGE COUNTDOWN TIMER]                     │
│  Kicks off in 2 days, 18 hours               │
│  Deadline: Sat, Oct 18, 06:00 AM             │
├──────────────────────────────────────────────┤
│  YOU              [VS]           OPPONENT    │
│  Monzaga                         Eyad fc     │
│  ─────────────────────────────────────────   │
│  📈 Avg: 72 pts/GW                68 pts/GW  │
│  🎯 Rank: 1.2M                    1.8M       │
│  🔥 Form: W-W-L-W-W               L-W-L-W-L  │
│  ⚡ Advantage: +4 pts/GW (You!)              │
├──────────────────────────────────────────────┤
│  [Preview Teams] [Share Challenge]           │
└──────────────────────────────────────────────┘
```

**Features**:
- Dynamic countdown updates every minute
- Color transitions (blue → orange → red as deadline approaches)
- Pulse animation when < 24 hours
- Historical stats comparison (if available)
- "Preview Teams" button to see formations
- "Share Challenge" button to copy link

---

### **State 2: LIVE COMPARISON** (Status: Active, Gameweek In Progress) ✅ IMPLEMENTED
**Goal**: Show real-time comparison of both teams like the FPL app pitch view

**Implementation Status:** ✅ Complete - Using DifferentialView component with live data

**Visual Design** (Inspired by FPL App Screenshots):
- **Dual pitch layout**: Side-by-side football pitch views
- **Jersey cards**: Player shirts with points displayed
- **Gradient headers**: Cyan-to-blue for each team section
- **Live badge**: "🔴 LIVE" indicator
- **Running totals**: Large point displays for each manager

**Layout**:
```
┌──────────────────────────────────────────────┐
│  ⚔️ Monzaga vs Eyad fc                      │
│     Gameweek 7 • 🔴 LIVE                     │
├──────────────────────────────────────────────┤
│         76              VS              78   │
│     Your Points                  Their Points│
├──────────────────────────────────────────────┤
│  [YOUR TEAM - Pitch View]  [THEIR TEAM]     │
│  ┌─────────────────────┐  ┌───────────────┐ │
│  │    [Goalkeeper]     │  │  [Goalkeeper] │ │
│  │                     │  │               │ │
│  │   [Defenders x3]    │  │ [Defenders x4]│ │
│  │                     │  │               │ │
│  │   [Midfield x4]     │  │ [Midfield x3] │ │
│  │                     │  │               │ │
│  │   [Forwards x3]     │  │ [Forwards x3] │ │
│  └─────────────────────┘  └───────────────┘ │
│                                              │
│  Each player shows:                          │
│  - Jersey with team colors                   │
│  - Player name                               │
│  - Points scored (purple badge)              │
│  - Captain indicator (C)                     │
│  - Vice-captain (V)                          │
├──────────────────────────────────────────────┤
│  [Refresh] [View Bench] [Share]              │
└──────────────────────────────────────────────┘
```

**Technical Details**:
- ✅ **Reuses `DifferentialView` component** - Already built rich matchup visualization
- ✅ **Fetches live points** via `getFPLTeamPicks`, `getFPLLiveScores`, `getFPLPlayers`
- ✅ **Calculates differentials** using existing `calculateDifferentials` service
- ✅ **Shows matchup cards** with population-style progress bars
- ✅ **Displays common players** in collapsible section
- ✅ **Manual refresh button** to update live scores
- ✅ **State detection logic**: Compares current time vs gameweek deadline to determine if live

**Player Card Display** (per FPL app):
- Team jersey image
- Player name below
- Points in purple/dark badge
- Captain (C) or Vice-captain (V) indicator
- Red card for negative points or yellow for warnings

---

### **State 3: COMPLETED** (Existing - Keep Current Design)
**Goal**: Show final results with clear winner

**Current Design** (Keep):
```
┌──────────────────────────────────────────────┐
│  Monzaga vs Eyad fc                          │
│  Gameweek 7                                   │
├──────────────────────────────────────────────┤
│  Monzaga          85                          │
│  Eyad fc          72                          │
├──────────────────────────────────────────────┤
│  Winner: Monzaga                              │
└──────────────────────────────────────────────┘
```

---

## Implementation Plan (TDD)

### **Phase 1: Preview State Components**

1. **CountdownTimer Component**
   - Props: `deadline: Date`, `onDeadlineReached?: () => void`
   - Calculate time remaining (days, hours, minutes)
   - Format display dynamically
   - Color transitions based on urgency
   - Pulse animation when < 24 hours
   - Tests: time calculations, formatting, state changes

2. **HeadToHeadPreview Component**
   - Props: `creatorTeam`, `opponentTeam`, `stats`
   - Side-by-side manager comparison
   - Form indicators (W/L/D last 5 GWs)
   - Average points comparison
   - Rank comparison
   - Advantage calculation
   - Tests: data display, stat calculations

3. **Update ChallengeDetailPage**
   - Detect challenge state (pending/accepted/active/completed)
   - Render appropriate component based on state
   - Add "Preview Teams" and "Share" buttons
   - Tests: state transitions, button actions

### **Phase 2: Live Comparison State**

1. **DualPitchView Component**
   - Props: `yourTeam`, `opponentTeam`, `gameweek`
   - Render two side-by-side pitch views
   - Reuse existing pitch layout component
   - Show running point totals
   - Highlight differentials
   - Tests: layout rendering, data display

2. **LiveTeamPitch Component** (if not exists)
   - Props: `teamId`, `gameweek`, `isLive`
   - Fetch live team data
   - Display players in formation
   - Show player points
   - Indicate captain/vice-captain
   - Tests: data fetching, formation display

3. **Update ChallengeDetailPage for Live State**
   - Check if gameweek has started
   - Switch from preview to live view
   - Show "🔴 LIVE" badge
   - Add refresh button
   - Tests: state detection, live updates

### **Phase 3: Polish & Interactions**

1. **Animations**
   - Countdown pulse effect
   - Point updates animation
   - Smooth state transitions

2. **Responsive Design**
   - Desktop: Side-by-side pitches
   - Tablet: Side-by-side with smaller cards
   - Mobile: Stacked pitches (yours on top)

3. **Sharing**
   - Copy challenge link
   - Social media share buttons
   - Preview image generation

---

## Technical Requirements

### **Data Needed**
- Challenge info (gameweek, deadline, status)
- Both teams' FPL IDs
- Live points for both teams (when gameweek active)
- Historical stats (average points, form, rank)

### **API Calls**
- `getFPLTeamInfo(teamId)` - Get team data
- `getCurrentGameweek()` - Check if gameweek is active
- `getGameweekInfo(gameweek)` - Get deadline info
- Consider adding: `getManagerStats(teamId)` - Historical performance

### **State Detection Logic**
```typescript
const now = new Date();
const deadline = challenge.gameweekDeadline.toDate();
const isGameweekStarted = now >= deadline;
const isCompleted = challenge.status === 'completed';

if (isCompleted) {
  return <CompletedState />
} else if (isGameweekStarted) {
  return <LiveComparisonState />
} else {
  return <PreviewState />
}
```

---

## Design Tokens (from FPL App)

**Gradients**:
- Preview: `from-cyan-400 to-purple-500`
- Live: `from-cyan-400 to-blue-500`
- Completed: Neutral grays

**Colors**:
- Countdown Calm: `blue-500` (#3B82F6)
- Countdown Urgent: `orange-500` → `red-500`
- Live Badge: `red-500` with pulse
- Advantage: `green-500`
- Points Badge: `purple-900` (dark purple from FPL)

**Typography**:
- Countdown: `text-6xl font-bold`
- Points Total: `text-5xl font-bold`
- Player Points: `text-lg font-semibold`

---

## Dashboard Compare Feature ✅ IMPLEMENTED

### **Standalone Team Comparison Tool**

**Goal**: Allow users to compare any two FPL teams outside of challenges

**Route**: `/compare`

**Components**:
- **ComparePage**: Wrapper page for the comparison tool
- **CompareTeams**: Reused existing component with form inputs
- **DifferentialView**: Rich matchup visualization (shared with challenge view)

**Dashboard Entry Point**:
- "Compare Teams" card in dashboard after FPL Connection Card
- Icon, title, description, and action button
- Direct navigation to `/compare` route
- Accessible to all logged-in users

**Use Cases**:
- Preview potential opponents before sending challenge
- Analyze past gameweeks for strategy insights
- Explore differential strategies
- Experiment with team comparison before creating challenges

---

## Success Metrics

**Preview State**:
- Users understand when gameweek starts
- Countdown creates anticipation
- Stats comparison builds competitive excitement

**Live State**: ✅
- Users can easily compare both teams
- Points are clearly visible
- Interface matches FPL app quality
- Differentials and common players highlighted

**Dashboard Compare Tool**: ✅
- Easy discoverability from dashboard
- High usage rates indicate feature value
- Users experiment before creating challenges

**Overall**:
- Increased engagement (time on page)
- More challenges shared
- Positive user feedback on design
