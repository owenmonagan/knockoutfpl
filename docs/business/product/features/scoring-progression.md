# Feature: Scoring & Progression

Automatic scoring and round advancement based on FPL gameweek results.

---

## Summary

Fetches final gameweek scores, determines winners, advances bracket automatically.

See [../overview.md](../overview.md) for context.

---

## Behaviors

### Score Fetching
- After a gameweek completes, final points are fetched from FPL for all active matches
- Points only become final once FPL marks the gameweek as finished (includes bonus points)

### Match Resolution
- Higher points advances, lower points eliminated
- Ties broken by higher mini-league rank at tournament creation (lower seed wins)

### Bracket Advancement
- Winners automatically placed in next round matchups
- Bracket updates visible to all viewers
- Next round begins with the following gameweek

### Tournament Completion
- Tournament marked complete when final match is decided
- Winner highlighted in bracket

---

## Inputs

- Tournament records with active matches
- FPL gameweek completion status
- Manager points for the gameweek

---

## Outputs

- Match results (winner/loser per match)
- Updated bracket state
- Tournament completion status

---

## Edge Cases

### Both Managers Tie on Points
- Tiebreaker applies: higher seed (lower rank at tournament creation) advances

### Double Gameweek
- Some managers have players with multiple fixtures
- No special handling—just use final points from FPL
- Still one round per gameweek

### Gameweek Delayed or Postponed
- FPL doesn't mark gameweek as finished
- Tournament waits—no advancement until FPL confirms completion

### Manager Removed from FPL
- Manager's FPL team deleted mid-tournament
- Treat as 0 points for remaining rounds
- They remain in bracket (snapshot preserved)

---

## Scope Limits

- No live scoring during gameweek (only final points after completion)
- No manual score overrides
- No partial gameweek scoring
- One round per gameweek (no multi-gameweek rounds)
- No replays or rematches

---

## Related

- See [tournament-bracket.md](./tournament-bracket.md) for display
- See [tournament-creation.md](./tournament-creation.md) for initial bracket setup
- See [../journeys/returning-user.md](../journeys/returning-user.md) for checking results
- See [../../technical/](../../technical/CLAUDE.md) for implementation details (scheduled jobs, API calls)
