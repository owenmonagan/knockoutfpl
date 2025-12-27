# Hypotheses

Core assumptions we're betting on, organized by risk if wrong.

---

## How to Use This

Every strategy doc makes assumptions. This one makes them explicit.

**Before building:** Check if you're building on an unvalidated existential bet.
**When learning:** Update status as evidence emerges.
**When stuck:** Ask which hypothesis you're trying to validate.

| Status | Meaning |
|--------|---------|
| 🔴 Unvalidated | Assumption only |
| 🟡 Testing | Gathering evidence |
| 🟢 Validated | Evidence confirms |
| ⚫ Invalidated | Evidence contradicts |

---

## Existential

If wrong, the product doesn't work. Validate before scaling.

---

### E1: FPL players want knockout competition
> "The knockout/bracket format appeals to FPL players beyond what mini-leagues offer."

| Attribute | Value |
|-----------|-------|
| Status | 🟢 Validated |
| Evidence | FPL Plugin (2020): 20k users from Reddit engagement. [r/FantasyPL cup thread](https://www.reddit.com/r/FantasyPL/comments/emi457/rfantasypl_cup_is_live/). Demand was real, execution was poor. |
| Risk if wrong | Critical - no market |

---

### E2: Mid-season disengagement is a real problem
> "By December, enough mini-league members feel 'out of contention' that they want fresh competition."

| Attribute | Value |
|-----------|-------|
| Status | 🟡 Testing |
| Evidence | FPL Plugin launched in January (mid-season), got traction. Anecdotal Reddit complaints. Not yet systematically validated. |
| Risk if wrong | Critical - solving a non-problem |
| How to validate | Post-tournament survey: "Were you out of contention in your main league?" |

---

### E3: FPL API remains accessible
> "The unofficial FPL API will continue working and not block our requests."

| Attribute | Value |
|-----------|-------|
| Status | 🟢 Validated |
| Evidence | API stable for 5+ years. FPL Plugin used it successfully. Dozens of tools depend on it. No blocking observed. |
| Risk if wrong | Critical - product breaks |
| Monitoring | Watch for changes each season, follow FPL developer community |

---

## Growth

If wrong, we stall. Can iterate, but need to catch early.

---

### G1: Reddit drives initial adoption
> "Sustained r/FantasyPL engagement accumulates significant signups over a tournament's lifetime."

| Attribute | Value |
|-----------|-------|
| Status | 🟢 Validated |
| Evidence | FPL Plugin: 20k lifetime users. ~1:1 upvote-to-signup ratio. Growth came from consistent presence, not viral moment. |
| Risk if wrong | High - launch strategy fails |
| Implication | Weekly updates, drama posts, and community engagement are the strategy—not hoping for one big hit. |

---

### G2: Mini-league viral loop works
> "When one person creates a tournament, it exposes 8-20 league members who then create tournaments for their OTHER leagues."

| Attribute | Value |
|-----------|-------|
| Status | 🔴 Unvalidated |
| Evidence | Assumption based on FPL players being in multiple leagues. FPL Plugin didn't track this. |
| Risk if wrong | High - single-use product, no organic growth |
| How to validate | Track: users in 2+ tournaments, source of tournament creation |

---

### G3: Word of mouth beats paid marketing
> "Most users come from friend referrals and community sharing, not ads or SEO."

| Attribute | Value |
|-----------|-------|
| Status | 🟡 Testing |
| Evidence | FPL Plugin grew entirely through Reddit + word of mouth. Zero paid marketing. But was that optimal or just what happened? |
| Risk if wrong | Medium - may need marketing budget |
| How to validate | Track acquisition source from day one |

---

### G4: Creators adopt for engagement and content
> "FPL podcasters/Twitter accounts will run tournaments because it gives them content and engages their audience."

| Attribute | Value |
|-----------|-------|
| Status | 🔴 Unvalidated |
| Evidence | Logical assumption. No direct outreach attempted with FPL Plugin. |
| Risk if wrong | Medium - limits scale, but mini-leagues still work |
| How to validate | Phase 2 creator outreach per GTM strategy |

---

## Execution

If wrong, we pivot. Lower risk—these are design choices, not market bets.

---

### X1: One round per gameweek is right
> "Users want tournaments that progress one round per FPL gameweek, not faster or slower."

| Attribute | Value |
|-----------|-------|
| Status | 🟢 Validated |
| Evidence | FPL Plugin used this cadence. No complaints. Matches FPL's natural rhythm. |
| Risk if wrong | Low - easy to add format options later |

---

### X2: Final scores only (not live) is acceptable
> "Users accept waiting for gameweek to finish for final scores, rather than live updates."

| Attribute | Value |
|-----------|-------|
| Status | 🟢 Validated |
| Evidence | FPL Plugin worked this way. Bonus points change until final anyway. Live adds complexity without value. |
| Risk if wrong | Low - can add live if demanded |

---

### X3: Ads cover infrastructure costs
> "Display ads offset Firebase read/write costs, keeping the product free."

| Attribute | Value |
|-----------|-------|
| Status | 🔴 Unvalidated |
| Evidence | FPL Plugin didn't run ads. Assumption based on typical CPMs and Firebase pricing. |
| Risk if wrong | Low - can explore other monetization or accept small loss |
| How to validate | Run the math once traffic exists |

---

### X4: No customization needed initially
> "One tournament format (single elimination, auto-seeding) works for mini-leagues without options."

| Attribute | Value |
|-----------|-------|
| Status | 🟡 Testing |
| Evidence | FPL Plugin was simple, worked fine. But didn't test with creator audiences who may want more control. |
| Risk if wrong | Low - add settings when users ask |

---

### X5: Mobile-first web is sufficient
> "A responsive web app is enough. Native apps aren't needed."

| Attribute | Value |
|-----------|-------|
| Status | 🟢 Validated |
| Evidence | FPL Plugin was web-only. FPL itself is web-first. No native app requests. |
| Risk if wrong | Low - can build native later if proven |

---

## Adding New Hypotheses

When you catch yourself saying "I assume..." or "Users probably...", add it here:

1. Write it as a clear statement
2. Categorize: Existential, Growth, or Execution
3. Note any evidence (including "none")
4. Define how to validate
5. Update status as you learn

---

## Summary

| Category | Validated | Testing | Unvalidated |
|----------|-----------|---------|-------------|
| **Existential** | E1, E3 | E2 | — |
| **Growth** | G1 | G3 | G2, G4 |
| **Execution** | X1, X2, X5 | X4 | X3 |

**Key unvalidated bets:**
- **G2** (viral loop) - determines if growth is organic or requires constant effort
- **G4** (creator adoption) - determines scale ceiling

---

## Related

- [vision.md](./vision.md) - Core beliefs these hypotheses support
- [metrics.md](./metrics.md) - How we measure validation
- [gtm-strategy.md](./gtm-strategy.md) - Launch plan that tests G1-G4
