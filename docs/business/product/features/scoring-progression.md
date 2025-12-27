# Feature: Scoring & Progression

<!-- TODO: Complete specification -->

Automatic scoring and round advancement based on FPL gameweek results.

---

## Summary

Fetches final gameweek scores, determines winners, advances bracket automatically.

See [../overview.md](../overview.md) for context.

---

## Behaviors

<!-- TODO: Expand with detailed specifications -->

### Score Fetching
- Fetches final gameweek scores from FPL API
- Only after gameweek completes (not live scoring)
- Scheduled job checks for completed gameweeks

### Match Resolution
- Higher score advances, lower score eliminated
- Ties broken by higher mini-league rank at tournament creation

### Bracket Advancement
- Next round matchups populated automatically
- Bracket updates visible to all viewers

### Tournament Completion
- Tournament marked complete when final is decided
- Winner highlighted in bracket

---

## Inputs

- Tournament records with active matches
- FPL API gameweek scores

---

## Outputs

- Match results (winner/loser)
- Updated bracket state
- Tournament completion status

---

## Edge Cases

<!-- TODO: Document error states -->

- FPL API unavailable during scoring window
- Manager didn't play (no team selected) - score is 0?
- Blank gameweek (team has no fixture) - what happens?
- Double gameweek - still just one round

---

## Scope Limits

- No live scoring during gameweek
- No manual score overrides
- No partial gameweek scoring
- One round per gameweek (no multi-gameweek rounds in MVP)

---

## Related

- See [tournament-bracket.md](./tournament-bracket.md) for display
- See [tournament-creation.md](./tournament-creation.md) for initial bracket setup
- See [../journeys/returning-user.md](../journeys/returning-user.md) for checking results
