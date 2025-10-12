# Team Differential Visualization - Product Requirements Document

## 📋 Overview

**Feature Name:** Team Differential Visualization
**Priority:** High (Post-MVP Phase 7)
**Status:** Planning
**Last Updated:** 2025-10-12

---

## 🎯 Problem Statement

### The Challenge

In Fantasy Premier League head-to-head competitions, teams are often nearly identical due to the "template team" phenomenon:
- **70-80% overlap**: Most competitive FPL teams share 7-10 of the same players
- **High-ownership players dominate**: Elite assets like Haaland, Salah, and Palmer appear in 50-80% of teams
- **Differentials decide outcomes**: Head-to-head matches are won or lost by the 2-4 players that differ between teams

### Current User Pain Point

When comparing two FPL teams for a gameweek challenge, users must:
1. Mentally scan through both full 15-player squads
2. Manually identify which players are different
3. Calculate which differentials contributed to the point gap
4. Determine if captain choices differed (2x point multiplier)

**This cognitive load obscures the most interesting insight: "Why did one team beat the other?"**

---

## 💡 User Value Proposition

### What Users Get

**Primary Value:**
- **Instant clarity** on what actually differentiated the two teams
- **Visual highlight** of the 2-4 key players/decisions that decided the match
- **Captain comparison** showing if different captain choices swung the result

**Secondary Benefits:**
- **Learning opportunity**: See which differential picks paid off
- **Strategic insights**: Understand where opponents took risks
- **Shareable moments**: Visual proof of a winning differential choice
- **Reduced cognitive load**: No need to scan full squads

### Target Scenarios

1. **Post-gameweek review**: "Why did I lose by 5 points?"
2. **Pre-challenge scouting**: "What differentials does my opponent usually pick?"
3. **Trophy moments**: "My differential captain pick won the match!"
4. **Learning from elites**: "How do top managers differentiate their teams?"

---

## 🎨 Core Functionality

### 1. Differential Detection

**Identify Three Categories of Differences:**

#### A. Unique Players
- Players present in Team A but not in Team B (and vice versa)
- Include position, points scored, and ownership percentage
- Distinguish between starters (multiplier=1) and bench players (multiplier=0)

#### B. Captain Differences
- **Different players captained**: Most impactful differential (2x points)
- **Same player, different captain**: One team captained Salah, other didn't
- **Triple Captain chip**: Multiplier=3 (rare but game-changing)

#### C. Vice-Captain Differences
- Only relevant if captain didn't play (auto-sub to VC multiplier=2)
- Lower priority but should be tracked

### 2. Visual Representation

**Design Pattern: Split-Screen Pitch View**

```
┌─────────────────────────────────────────────────┐
│           TEAM A vs TEAM B                       │
│           78 pts    76 pts                       │
├─────────────────────────────────────────────────┤
│                                                  │
│   [TEAM A SIDE]        [TEAM B SIDE]            │
│                                                  │
│   Only show:           Only show:                │
│   • Unique players     • Unique players          │
│   • Different captain  • Different captain       │
│                                                  │
│   [Verbruggen]         [Pope]                    │
│   GK • 1 pt            GK • 7 pts (C)            │
│                                                  │
│   [Grealish]           [Guehi]                   │
│   MID • 10 pts         DEF • 3 pts               │
│                                                  │
│   ...                  ...                       │
│                                                  │
└─────────────────────────────────────────────────┘
│                                                  │
│  📊 DIFFERENTIAL SUMMARY                         │
│  • Team B's Pope (C) +14 pts vs Verbruggen      │
│  • Team A's Grealish +7 pts vs Guehi            │
│  • Net differential: Team B +7 pts              │
└─────────────────────────────────────────────────┘
```

#### Visual Elements

1. **Split-screen layout**: Teams side-by-side for direct comparison
2. **Color coding**:
   - Team A: Blue/Cyan gradient (left side)
   - Team B: Purple/Magenta gradient (right side)
   - Winning differentials: Gold/green highlight
   - Losing differentials: Red/orange highlight
3. **Captain badge**: Clear (C) indicator with 2x multiplier notation
4. **Position-based grouping**: GK, DEF, MID, FWD sections
5. **Point differential**: +/- notation showing who "won" each position

#### Optional: Pitch Layout
- Can optionally display in formation (4-3-3, 3-5-2, etc.)
- Pitch visualization for authentic FPL feel
- Use player shirt images/colors if available

### 3. Differential Summary Panel

**Key Metrics to Display:**

- **Total Point Differential**: Final score gap (e.g., Team B +2 pts)
- **Captain Impact**: Points gained/lost from captain choice
- **Biggest Differential**: Player who created largest swing
- **Differential Count**: Number of different players (e.g., "4 differences")
- **Template Overlap**: Percentage of shared players (e.g., "73% template")

**Example:**
```
📊 MATCH SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏆 Team B wins by 2 points (78-76)

KEY DIFFERENTIALS:
✅ Pope (C) +14 vs Verbruggen: +13 pts for Team B
✅ Grealish +10 vs Saka +8: +2 pts for Team A
✅ Haaland (C) vs João Pedro: +14 pts for Team B

📈 Captain choice decided this match
💡 11/15 players identical (73% template)
```

---

## 🔧 Technical Approach

### Data Requirements

**FPL API Endpoints:**

1. **Team Picks**: `/api/entry/{teamId}/event/{gameweek}/picks/`
   - Returns: `picks[]` array with player IDs, positions, multipliers
   - Returns: `active_chip` (e.g., "triple_captain")
   - Returns: `entry_history` with total points

2. **Player Details**: `/api/bootstrap-static/`
   - Returns: Player names, positions, teams, shirt images
   - Returns: Ownership percentages (for context)

3. **Live Scores**: `/api/event/{gameweek}/live/`
   - Returns: Individual player points for the gameweek

### Data Processing Algorithm

```typescript
interface Differential {
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  teamA: {
    player: Player | null;
    points: number;
    multiplier: number;
    isCaptain: boolean;
  };
  teamB: {
    player: Player | null;
    points: number;
    multiplier: number;
    isCaptain: boolean;
  };
  pointDifference: number; // Positive = Team A advantage
}

function calculateDifferentials(
  teamA: TeamPicks,
  teamB: TeamPicks,
  playerData: PlayerMap
): Differential[] {
  // 1. Get all player IDs from both teams (excluding bench)
  const teamAStarters = teamA.picks.filter(p => p.multiplier > 0);
  const teamBStarters = teamB.picks.filter(p => p.multiplier > 0);

  // 2. Find unique players in each team
  const teamAUnique = teamAStarters.filter(
    a => !teamBStarters.some(b => b.element === a.element)
  );
  const teamBUnique = teamBStarters.filter(
    b => !teamAStarters.some(a => a.element === b.element)
  );

  // 3. Identify captain differences
  const teamACaptain = teamA.picks.find(p => p.multiplier === 2 || p.multiplier === 3);
  const teamBCaptain = teamB.picks.find(p => p.multiplier === 2 || p.multiplier === 3);

  // 4. Build differential objects grouped by position
  const differentials: Differential[] = [];

  // Group unique players by position and pair them
  // Calculate point differences accounting for multipliers
  // Highlight captain differences even if same player

  return differentials;
}
```

### Performance Considerations

- **Caching**: Cache player data (bootstrap-static) for 24 hours
- **Batch requests**: Fetch both teams' data in parallel
- **Progressive loading**: Show skeleton UI immediately, populate as data arrives
- **Memoization**: Cache differential calculations per matchup

---

## 🎭 UI/UX Design

### Layout Structure

```
┌─────────────────────────────────────────────────┐
│  [Back] Team A vs Team B - Gameweek 7           │
├─────────────────────────────────────────────────┤
│  📊 MATCH SCORE                                  │
│  [Team A: 76]  vs  [Team B: 78] ✅              │
├──────────────────┬──────────────────────────────┤
│   TEAM A DIFFS   │   TEAM B DIFFS              │
│   (Left Panel)   │   (Right Panel)             │
│                  │                              │
│   🧤 GK          │   🧤 GK                     │
│   Verbruggen     │   Pope (C)                  │
│   1 pt           │   7 pts → 14 pts            │
│   ────────────── │   ──────────────            │
│                  │                              │
│   🛡️ DEF         │   🛡️ DEF                    │
│   (none)         │   Guehi                     │
│                  │   3 pts                     │
│   ────────────── │   ──────────────            │
│                  │                              │
│   ⚽ MID          │   ⚽ MID                     │
│   Grealish       │   Enzo                      │
│   10 pts         │   2 pts                     │
│   ────────────── │   ──────────────            │
│                  │                              │
│   🎯 FWD         │   🎯 FWD                     │
│   Gyökeres       │   Richarlison               │
│   2 pts          │   1 pt                      │
├──────────────────┴──────────────────────────────┤
│  📈 DIFFERENTIAL IMPACT                         │
│  Team B +2 pts overall                          │
│  ✅ Biggest swing: Pope (C) +13 for Team B      │
│  📊 11/15 players shared (73% template)         │
│  💡 Captain choice was decisive                 │
└─────────────────────────────────────────────────┘
```

### Interaction States

1. **Loading State**: Skeleton cards with shimmer effect
2. **Hover State**: Tooltip showing player details (fixtures, ownership %)
3. **Click State**: Expand to show full player stats for gameweek
4. **Empty State**: "No differentials - identical teams!" message

### Responsive Design

- **Desktop**: Side-by-side split view
- **Tablet**: Side-by-side with stacked positions
- **Mobile**: Stacked teams with accordion sections

### Accessibility

- **Semantic HTML**: Proper heading hierarchy, landmark regions
- **ARIA labels**: Screen reader descriptions for differentials
- **Keyboard navigation**: Tab through differential cards
- **Color contrast**: WCAG AA compliance for all text
- **Icons + text**: Never rely solely on color to convey meaning

---

## 🔢 Success Metrics

### Primary KPIs

1. **Engagement Rate**: % of users who view differential visualization after match completion
   - **Target**: 60%+ of users view differentials post-match

2. **Time on Feature**: Average time spent on differential view
   - **Target**: 30+ seconds (indicates user finds value)

3. **Share Rate**: % of matches with differentials shared externally
   - **Target**: 15%+ share rate (feature is compelling)

### Secondary Metrics

4. **Return Usage**: % of users who view differentials for multiple matches
   - **Target**: 70%+ return for 2nd match

5. **Mobile Usage**: % of differential views on mobile devices
   - **Target**: 50%+ (indicates good mobile UX)

6. **Captain Focus**: % of matches where captain differential is highlighted
   - **Benchmark**: ~40% of matches have different captains

### User Feedback

- **Qualitative interviews**: "Did this help you understand the match outcome?"
- **Feature satisfaction**: 5-star rating prompt after viewing
- **Feature requests**: Track requests for additional differential insights

---

## 🚧 Implementation Phases

### Phase 1: MVP Differential Display (Week 1-2)
**Goal**: Basic functional differential visualization

- ✅ Data fetching from FPL API (picks + live scores)
- ✅ Differential calculation algorithm
- ✅ Simple list view of differences (not pitch layout)
- ✅ Captain indicators
- ✅ Point differential summary
- ❌ No pitch visualization yet
- ❌ No player images yet

**Success Criteria**: Users can see which players differed and point impact

### Phase 2: Enhanced Visuals (Week 3)
**Goal**: Polished visual design

- ✅ Split-screen layout with team colors
- ✅ Position-based grouping (GK, DEF, MID, FWD)
- ✅ Winning/losing differential highlights
- ✅ Player shirt images/colors
- ✅ Responsive mobile layout
- ❌ No pitch layout yet

**Success Criteria**: Feature looks professional and matches FPL aesthetic

### Phase 3: Pitch Layout Option (Week 4)
**Goal**: Optional pitch visualization for premium experience

- ✅ Formation detection (4-3-3, 3-5-2, etc.)
- ✅ Pitch canvas with player positions
- ✅ Toggle between list and pitch views
- ✅ Animation when switching views

**Success Criteria**: 30%+ of users try pitch view, positive feedback

### Phase 4: Advanced Insights (Week 5+)
**Goal**: Deeper analytical value

- ✅ Historical differential performance
- ✅ "This differential has won X of your last Y matches"
- ✅ Ownership percentage context ("Grealish owned by 12.4%")
- ✅ Fixture difficulty comparison
- ✅ AI-generated differential summary

**Success Criteria**: Users engage with advanced insights, share increases

---

## 🎯 User Stories

### As a casual FPL player...
- **I want to** quickly see why I lost my match
- **So that** I can learn from my opponent's choices without mental math

### As a competitive FPL player...
- **I want to** identify which differentials decided close matches
- **So that** I can refine my strategy for future gameweeks

### As a content creator...
- **I want to** share visually compelling differential comparisons
- **So that** I can create engaging FPL content for my audience

### As a mini-league rival...
- **I want to** see if my opponent's risky differential backfired
- **So that** I can have bragging rights (trash talk)

---

## 🚨 Risks & Mitigations

### Risk 1: FPL API Rate Limits
**Impact**: High | **Probability**: Medium

**Mitigation**:
- Implement aggressive caching (24hr for player data)
- Batch requests efficiently
- Consider fallback to cached data if API unavailable
- Monitor API usage and throttle if needed

### Risk 2: Identical Teams (No Differentials)
**Impact**: Low | **Probability**: High (~20% of matches)

**Mitigation**:
- Clear "No differentials - you picked the same players!" message
- Highlight captain difference if it exists (even for same player)
- Show bench differences as secondary insight
- Suggest this is a sign of good team selection

### Risk 3: Complex Edge Cases
**Impact**: Medium | **Probability**: Low

**Examples**:
- Captain doesn't play, vice-captain gets 2x
- Automatic substitutions change starting XI
- Triple Captain chip (3x multiplier)
- Bench Boost (all 15 players score)

**Mitigation**:
- Thoroughly test with historical gameweek data
- Handle auto-subs from API's `automatic_subs` field
- Clear notation for chips (show "TC" badge, "BB" indicator)
- Fallback to simple list view if complexity is too high

### Risk 4: Performance on Mobile
**Impact**: Medium | **Probability**: Medium

**Mitigation**:
- Lazy load player images
- Use skeleton screens during load
- Progressive enhancement (list view first, then enhancements)
- Monitor Core Web Vitals (LCP, CLS, FID)

---

## 📚 Research & References

### FPL Community Insights

1. **Template Teams**: 70-80% of competitive teams share core players
2. **Captain Picks**: 50-60% of teams captain the same player each GW
3. **Differentials**: Players owned by <10% considered "differentials"
4. **Decision Points**: Captain choice is the single most impactful decision

### Existing Tools

- **Fantasy Football Fix**: Offers manager comparison with live squad comparison
- **Premier Fantasy Tools**: Head-to-head analysis with stats format
- **FPL Official**: No native differential visualization

### FPL API Documentation

- **Picks Endpoint**: `multiplier` field (0=bench, 1=starter, 2=captain, 3=TC)
- **Live Endpoint**: Real-time player scores during gameweeks
- **Bootstrap Static**: Player metadata, ownership, prices

---

## 💭 Future Enhancements (Post-Phase 4)

1. **Differential Prediction**: "Based on form, this differential has 65% chance to outscore"
2. **Video Highlights**: Link to goal clips for differential players who scored
3. **Differential Leaderboard**: "Your best differentials this season"
4. **AI Coach**: "Your differentials tend to underperform - consider template picks"
5. **Social Comparison**: "Your differentials vs top 10k average"
6. **Chip Strategy**: Highlight when chips were used (TC, BB, FH, WC)

---

## ✅ Definition of Done

### Feature is complete when:

- [ ] Users can view differential visualization for any completed match
- [ ] Captain differences are clearly highlighted
- [ ] Point differential attribution is accurate
- [ ] Mobile responsive design works smoothly
- [ ] Loading states provide good UX
- [ ] Edge cases handled gracefully (auto-subs, chips, bench)
- [ ] Feature accessible via keyboard and screen readers
- [ ] Analytics tracking implemented for success metrics
- [ ] Performance benchmarks met (<2s load time, <150ms interaction)
- [ ] User testing shows 4+ star satisfaction
- [ ] Documentation updated for developers

---

## 📞 Stakeholder Sign-Off

**Product Manager**: _________________________
**Engineering Lead**: _________________________
**Design Lead**: _________________________
**Date**: _________________________

---

**End of PRD**
