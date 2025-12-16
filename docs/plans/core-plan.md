# Knockout FPL — Implementation Plan

read @docs/concept to find content

## Core Philosophy for the Build

**Ship tension fast.** The product's value is the feeling of stakes—not features. Every milestone should deliver that feeling, even if incomplete.

---

## Phase 0: Foundation (Week 1-2)

**Goal:** Technical infrastructure that everything else builds on.

### What to build:
- **FPL API integration** — Team lookup, mini-league fetching, live scores
- **Auth system** — Simple email/password, link to FPL team ID
- **Database schema** — Users, tournaments, matches, results
- **Basic bracket generation** — Given N teams, create knockout structure with seeding

### What to skip for now:
- Pretty UI
- Email system
- Real-time updates

### Milestone check:
> Can you input a mini-league ID and generate a seeded bracket in the database?

---

## Phase 1: The Minimum Viable Drama (Week 3-5)

**Goal:** One person can create a tournament, see the bracket, see their match.

This is your "show people" milestone. Not launched, but demonstrable.

### What to build:

**Onboarding (stripped down):**
- Landing page with "Enter the Arena" CTA
- Team entry (search by name or ID)
- League selection (show their mini-leagues)
- Tournament creation (size + seeding + start GW)
- Account creation → tournament launches

**Tournament view (core only):**
- Full bracket visualization (desktop-first is fine)
- Match cards with scores (can be static/manual initially)
- User's match highlighted
- Round headers ("16 REMAIN" not "Round of 16")

**Match experience (basic):**
- Head-to-head view with scores
- Stakes callout logic ("4 points from elimination")
- Winner/loser states on cards

### What to skip for now:
- "Your Path to the Final" journey strip
- Live score updates (manual refresh OK)
- Victory/elimination celebration screens
- Mobile optimization
- Email system
- Dashboard (tournament home IS the dashboard for now)

### Design priority:
Focus styling effort on the **match card** and **stakes callout**. These are the emotional core. The bracket can be functional-ugly.

### Milestone check:
> Can someone create a tournament, share a link, and have a friend see the bracket with their match highlighted?

---

## Phase 2: The Live Experience (Week 6-8)

**Goal:** Real-time scores. The tension updates as you watch.

This is where it starts feeling like a product.

### What to build:

**Live scoring:**
- Poll FPL API for score updates (every 1-2 min during matches)
- Score animations (number scales, flashes gold)
- "LIVE" badge on active matches
- Dynamic stakes callout that updates

**Match detail expansion:**
- Top scorers comparison
- Players left to play
- Captain indicators
- Progress bars showing relative score

**Victory/Elimination moments:**
- Victory screen with next opponent preview
- Elimination screen with "watch bracket" CTA
- Animations (gold confetti for wins, fade for losses)

**Shareable invites:**
- Tournament invite link
- Pre-filled share messages (WhatsApp, Twitter, Email)
- "Bring your opponents" framing

### What to skip for now:
- Push notifications
- Email system
- Trophy room
- Head-to-head history
- Mobile-optimized bracket

### Milestone check:
> During a live gameweek, can you watch your match update in real-time and feel the tension?

---

## Phase 3: The Communication Layer (Week 9-11)

**Goal:** The product reaches out to you. You don't have to remember to check.

### What to build:

**Email system (prioritized by impact):**

1. **The Verdict** (win/loss result) — Highest impact, drives re-engagement
2. **It's Live** (GW kickoff) — Gets them in when stakes are real
3. **The Matchup** (Tuesday preview) — Builds anticipation
4. **Halftime Report** (close matches only) — Tension amplifier

**Dashboard:**
- Multi-tournament view
- Card hierarchy (live → upcoming → won → eliminated)
- "Start new tournament" for leagues without knockouts

**Basic notifications:**
- Browser notifications for key moments (optional opt-in)
- Score update alerts during live matches

### What to skip for now:
- Champion crowned email (wait for first tournament to complete)
- Push notifications (mobile app dependent)
- Complex notification preferences

### Milestone check:
> Does the product feel "alive" even when you're not looking at it?

---

## Phase 4: Polish & Delight (Week 12-14)

**Goal:** The moments feel earned. The product feels premium.

### What to build:

**Mobile experience:**
- Responsive bracket (round-by-round swipe)
- Touch-optimized match cards
- Mobile-first dashboard

**"Your Path to the Final" journey strip:**
- Horizontal progression view
- Past wins, current match, future rounds
- Trophy destination visible

**Championship experience:**
- Champion screen with full journey recap
- Downloadable trophy image (social sharing)
- Trophy room (persistent championship record)

**Engagement features:**
- Head-to-head history between repeat opponents
- "Who knocked you out?" tracker for eliminated users
- Eliminated users can still watch bracket

**Animation refinement:**
- Victory celebration (scale, gold shadow, confetti)
- Score update animations
- Bracket connector line draws

### Milestone check:
> When someone wins the whole tournament, does it feel like winning a trophy?

---

## Phase 5: Scale & Iterate (Week 15+)

**Goal:** Learn from real usage. Build what users actually want.

### Potential additions based on demand:
- Multiple tournament formats (group stage → knockout?)
- Public tournaments (not just mini-leagues)
- Predictions/bracket challenges
- Season-long rankings
- Premium features (detailed analytics, custom branding)

### What to measure:
- Tournament completion rate (do people stick through all rounds?)
- Share rate (do creators actually invite opponents?)
- Re-engagement (do eliminated users come back to watch?)
- Return creators (do people make tournaments next season?)

---

## Risk Checkpoints

### After Phase 1:
> "Is creating a tournament too much friction?"

If yes → Simplify. Auto-create tournaments for popular leagues?

### After Phase 2:
> "Do users actually check during live matches?"

If no → Push email/notification work earlier. The pull isn't strong enough.

### After Phase 3:
> "Are emails driving engagement or annoying people?"

Watch unsubscribe rates. Adjust cadence. Maybe halftime report is too much.

### After Phase 4:
> "Do championships feel special enough that winners share?"

If share rate is low → The celebration isn't earned enough. Invest in that moment.

---

## Resource Allocation Suggestion

### Solo Dev or Tiny Team:

| Phase | Focus | Timeframe |
|-------|-------|-----------|
| 0-1 | Backend + functional UI | 5 weeks |
| 2 | Live experience | 3 weeks |
| 3 | Communications | 3 weeks |
| 4 | Polish | 3 weeks |

**Total to "real product":** ~14 weeks

### Small Team (2-3 people):

Parallelize the work:
- **Dev 1:** Backend, API integration, bracket logic
- **Dev 2:** Frontend, component library, interactions
- **Dev 3 / Designer (optional):** Email system, polish, animations

---

## What to Build First (One-Week Demo)

If you need to ship something in one week that demonstrates the vision:

1. **FPL team lookup** — Enter ID, see your team name
2. **Mini-league fetch** — Show their leagues
3. **Static bracket generator** — Given 16 teams, show a bracket
4. **One match card** — User vs opponent with fake scores
5. **Stakes callout** — "4 points from elimination"

That's the pitch. That's the feeling. Everything else is making it real.

---

## Questions to Decide Before Building

1. **Do you seed by overall rank or mini-league rank?**
   - Recommendation: Mini-league rank—it's more relevant to the competition context.

2. **What happens with odd numbers?** (E.g., 13 teams)
   - Options: Byes for top seeds? Expand to next power of 2 with ghost teams?

3. **Tiebreaker?** When scores are equal, who advances?
   - FPL uses overall rank as tiebreaker—probably do the same.

4. **When does a tournament "lock"?** Can people join after it starts?
   - Recommendation: No. Creates cleaner bracket and more urgency to join.

5. **What's the minimum tournament size?**
   - 8 feels like the minimum for "tournament energy." 4 is too quick.

---

## Technical Architecture Notes

### FPL API Endpoints You'll Need:

```
GET /api/bootstrap-static/     → Player data, gameweek info
GET /api/entry/{team_id}/      → Team details
GET /api/entry/{team_id}/event/{gw}/picks/  → Team lineup for gameweek
GET /api/leagues-classic/{league_id}/standings/  → League standings
GET /api/event/{gw}/live/      → Live scores for gameweek
```

### Database Schema (Core Tables):

```
users
  - id
  - email
  - fpl_team_id
  - fpl_team_name
  - created_at

tournaments
  - id
  - name
  - mini_league_id
  - size (8, 16, 32, 64, 128)
  - seeding_type (rank, random)
  - start_gameweek
  - status (pending, active, completed)
  - created_by (user_id)
  - created_at

matches
  - id
  - tournament_id
  - round (1, 2, 3...)
  - position (bracket position)
  - team_1_id (user_id or fpl_team_id)
  - team_2_id
  - team_1_score
  - team_2_score
  - winner_id
  - gameweek
  - status (pending, live, completed)

tournament_entries
  - tournament_id
  - user_id
  - seed
  - status (active, eliminated, champion)
  - eliminated_round
```

### Key Technical Decisions:

1. **Polling vs WebSockets for live scores?**
   - Start with polling (simpler). WebSockets if you need sub-minute updates.

2. **Where to run score calculations?**
   - Server-side. Don't trust client calculations for competitive integrity.

3. **Caching strategy?**
   - Cache FPL API responses aggressively. Their API has rate limits.

---

## Brand Reminders for Implementation

From the Brand Guidelines—keep these visible during development:

### Language Transformations:
| Don't Say | Say Instead |
|-----------|-------------|
| "You're winning 52-48" | "4 points from elimination" |
| "Tournament created" | "IT'S ON." |
| "Round of 16" | "16 REMAIN" |
| "Share this link" | "Bring your opponents" |
| "Congratulations, you won!" | "Victory. You advance." |

### Color Rules:
- **Gold (#C9A227)** = Winners, glory, advancement. Never dilute it.
- **Eliminated** = 50% opacity, not deleted. They're part of the story.
- **User's match** = Always highlighted with gold border.

### The Ultimate Test:
> "Does this make it feel like a cup final?"

If no, rethink it.

---

*Document Version 1.0 | December 2025*
*"Every gameweek is a cup final."*