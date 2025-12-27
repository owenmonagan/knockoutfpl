# Glossary

Shared vocabulary for Knockout FPL. All product and technical docs use these terms.

---

## Purpose

This glossary serves two goals:

1. **Disambiguation** - Clarify terms that could be confused (e.g., "round" vs "gameweek")
2. **Consistency** - Establish canonical terms for docs and code

If a term isn't here, it either doesn't need a formal definition or should be added.

---

## FPL Concepts

Terms from Fantasy Premier League that we integrate with.

### Gameweek
One week of Premier League fixtures. FPL scores are finalized after the last match of the gameweek. Gameweeks run from August to May, numbered 1-38.

### Manager
A person playing FPL. They manage a team of 15 players and compete in leagues. Use "manager" not "user" or "player" (player means a footballer).

### Mini-league
A private FPL league created by managers to compete with friends, colleagues, or communities. Typically 8-20 people. This is our primary user context.

### Classic League
FPL's term for a mini-league scored by total points across the season. Distinguished from "Head-to-Head leagues" which we don't currently support.

### FPL Team ID
The unique numeric identifier for a manager's team (e.g., `158256`). Found in the URL when viewing a team on the FPL site. Required to link a Knockout FPL account.

### Points
A manager's gameweek points total, earned for their team's performance.

### Squad
A manager's 15 players. £100m budget, max 3 players from any Premier League club. Composed of 2 goalkeepers, 5 defenders, 5 midfielders, and 3 forwards.

### Price Changes
Player prices rise or fall daily based on transfer activity. High demand (transfers in) increases price by £0.1m; low demand (transfers out) decreases it. Max £0.3m change per gameweek. Changes happen overnight (1-3 AM UK).

### Team Value
The total worth of a manager's squad. Starts at £100m but fluctuates as player prices change. Managers try to grow value by owning in-demand players.

### Selling Price
When selling a player, you only keep half the profit. If you bought at £5.0m and price rose to £5.4m, your selling price is £5.2m (not £5.4m). This prevents pure speculation.

### Starting XI
The 11 players selected to score points in a gameweek. Must include 1 goalkeeper, at least 3 defenders, at least 2 midfielders, and at least 1 forward.

### Bench
The 4 players not in the Starting XI. They don't score points unless Bench Boost is active, or they auto-substitute for a non-playing starter.

### Captain
The player whose points are doubled for the gameweek. If the captain doesn't play, the vice-captain's points are doubled instead.

### Vice-Captain
Backup captain. Their points are doubled only if the captain doesn't play.

### Transfers
Swapping players in your squad. One free transfer per gameweek (can save up to five). Additional transfers cost 4 points each.

### Double Gameweek (DGW)
When a team plays two Premier League matches in one gameweek. Players from that team can score points in both matches. Usually caused by fixture rescheduling from cup competitions.

### Blank Gameweek (BGW)
When a team has no Premier League fixture in a gameweek. Players from that team score zero points. Usually caused by cup competition clashes.

### Chips
Special powers that can be used once per half-season. Only one chip can be active per gameweek. See: Wildcard, Free Hit, Triple Captain, Bench Boost.

### Wildcard
Chip that allows unlimited free transfers. Changes are permanent. Available once per half-season.

### Free Hit
Chip that allows unlimited transfers for one gameweek only. Squad reverts to its previous state after the gameweek ends.

### Triple Captain
Chip that triples the captain's points instead of doubling them. Often used during Double Gameweeks.

### Bench Boost
Chip that adds all four bench players' points to your total. Often used during Double Gameweeks when the full squad has favorable fixtures.

---

## Tournament Concepts

Terms for the tournament format we're building.

### Knockout
Fun branding name for our tournament platform.

### Tournament
A league/cup/playoff/bracket format competition. Losers exit, winner advances.

### Bracket
The playoff bracket showing all matches and progression paths. Generated automatically when a tournament is created. Visualized as a tree from first round to final. Note: tournaments may include group stages in future versions.

### Round
One stage of a tournament, typically played during a single gameweek. Could span multiple gameweeks in future versions.

### Match
A head-to-head pairing within a round. The manager with more points advances. The other is eliminated.

### Seeding
Initial bracket positions based on mini-league rank at tournament creation. Higher-ranked managers face lower-ranked opponents in round 1. May become customizable.

### Bye
Automatic advancement when brackets don't fill evenly. If 12 managers enter a 16-slot bracket, 4 managers get byes (advance without playing round 1).

### Group
A mini-league within a tournament where several managers compete before knockout rounds. Like World Cup group stages - top finishers advance to the bracket. Not in MVP, but a potential future format.

### Elimination
Losing a match and exiting the tournament.

### Single Elimination
Tournament format where one loss eliminates you. Current format for Knockout FPL.

### Double Elimination
Tournament format where you must lose twice to be eliminated. Losers enter a separate "losers bracket" and can still win the tournament. *Not in scope.*

### Round Robin
Format where every participant plays every other participant. Fairest measure of overall skill, but time-consuming. Used within Groups. *Not in scope for standalone use.*

### Group Stage
Dividing participants into small groups that each run a round robin. Top finishers from each group advance to a knockout bracket. Like World Cup format. *Not in scope.*

### League Phase
All participants in one large league, each playing a subset of opponents. Replaces traditional group stage. Used in Champions League 2024-25 format. *Not in scope.*

### Two-Leg Tie
Match decided over two games (home and away). Winner determined by aggregate score. *Not in scope - our matches are single gameweek.*

### Aggregate Score
Combined score across two-leg ties. If tied, may use away goals or extra time. *Not in scope.*

### Pots
Groupings used for tournament draws. Pot 1 contains top seeds, Pot 4 contains lowest. Ensures balanced groups. *Not in scope.*

### Predetermined Bracket
Knockout path fixed in advance based on group/league finish. No draw needed. Used in World Cup. *May be relevant if groups added.*

### Drawn Bracket
Knockout matchups determined by random draw after group stage. Traditional Champions League approach. *Not in scope.*

### Playoff Round
Extra knockout stage for teams on the "bubble" - those who didn't auto-qualify but aren't eliminated. Champions League 9th-24th play for remaining spots. *Not in scope.*

### Third-Place Match
Consolation final between semi-final losers. Used in World Cup. *Not in scope.*

### Best of X
Series format where winner is first to win majority of games (best of 3, best of 5). Common in esports. *Not in scope - single gameweek per match.*

### Grand Finals Advantage
In double elimination, the winners bracket finalist starts with a match advantage since they haven't lost yet. *Not in scope.*

### Walkover
Victory awarded when opponent cannot compete (withdrawal, disqualification). *Not in scope - inactive managers handled via Bye.*

---

## Other Concepts

Terms specific to Knockout FPL that don't fit the above categories.

### Creator
A content creator with an FPL audience - podcasters, Twitter accounts, Discord admins, YouTube channels. Secondary user segment after mini-league members.

### North Star Metric
The primary success metric for the product. Currently **Page Views** - see [strategy/metrics.md](../strategy/metrics.md) for rationale.

### Page View
A single page load by any visitor. The unit of measurement for our North Star Metric. Chosen because it correlates with engagement and future ad revenue potential.

---

## Related

- See [overview.md](./overview.md) for product scope and boundaries
- See [features/](./features/CLAUDE.md) for how these terms appear in feature specs
- See [../strategy/](../strategy/CLAUDE.md) for business context
