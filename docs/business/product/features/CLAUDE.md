# Feature Specifications

Detailed specs for each discrete capability. An engineer reads these to build.

---

## Purpose

Each feature doc answers:
- **What does this feature do?**
- **What are the inputs and outputs?**
- **What are the edge cases and error states?**
- **What's explicitly out of scope?**

If you're building a feature and have to guess, the doc has failed.

---

## Documents

- **[authentication.md](./authentication.md)** - Signup, login, logout, session handling.
- **[fpl-connection.md](./fpl-connection.md)** - Linking and verifying FPL team ID.
- **[league-browser.md](./league-browser.md)** - Viewing user's FPL mini-leagues.
- **[tournament-creation.md](./tournament-creation.md)** - Creating a knockout from a league.
- **[tournament-bracket.md](./tournament-bracket.md)** - Viewing bracket, matches, and results.
- **[scoring-progression.md](./scoring-progression.md)** - Automatic scoring and round advancement.
- **[tournament-experience.md](./tournament-experience.md)** - Dashboard, match cards, victory/elimination screens, emails, notifications.

---

## Reading Order

Features are relatively independent. Read what you need to build.

For full context, start with [../glossary.md](../glossary.md) and [../overview.md](../overview.md).

---

## Related

- See [../journeys/](../journeys/CLAUDE.md) for how features connect into user experiences
- See [../glossary.md](../glossary.md) for shared vocabulary
- See [../../technical/](../../technical/CLAUDE.md) for implementation details
