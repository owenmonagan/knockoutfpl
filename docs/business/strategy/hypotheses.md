# Hypotheses & Experiments

> **Status:** DRAFT - living document, update as we learn
> **Last Updated:** December 2025

---

## Overview

This document tracks our core assumptions about the product and market. Every startup is a collection of hypotheses; this document makes ours explicit so we can validate or invalidate them systematically.

**How to use this:**
- Review before major product decisions
- Update status as we gather evidence
- Add new hypotheses as we identify assumptions
- Don't build major features on unvalidated hypotheses

---

## Hypothesis Status Legend

| Status | Meaning |
|--------|---------|
| 🔴 **Unvalidated** | Assumption only, no evidence |
| 🟡 **Testing** | Currently gathering evidence |
| 🟢 **Validated** | Evidence supports hypothesis |
| ⚫ **Invalidated** | Evidence contradicts hypothesis |

---

## Problem Hypotheses (DRAFT)

*Do users actually have this problem?*

### H1: Mini-leagues lack mid-season excitement
> "FPL mini-league members want more engagement beyond season-long standings."

| Attribute | Value |
|-----------|-------|
| Status | 🔴 Unvalidated |
| Confidence | Medium |
| Risk if wrong | Critical - no market |
| How to validate | User interviews, survey existing FPL players |
| Evidence | Anecdotal (personal experience), Reddit complaints about boring mid-season |

<!-- TODO: Conduct user interviews to validate -->

---

### H2: Manual tracking is painful
> "Running knockout tournaments manually (spreadsheets, WhatsApp) is tedious enough that people avoid it."

| Attribute | Value |
|-----------|-------|
| Status | 🔴 Unvalidated |
| Confidence | Medium |
| Risk if wrong | High - may not need automation |
| How to validate | Ask if people have tried manual tournaments, what happened |
| Evidence | Assumption based on general spreadsheet fatigue |

---

### H3: Knockout format appeals to FPL players
> "The bracket/knockout format (vs. league format) is inherently appealing to FPL players."

| Attribute | Value |
|-----------|-------|
| Status | 🔴 Unvalidated |
| Confidence | Medium-High |
| Risk if wrong | Critical - wrong format |
| How to validate | User preference testing, tournament completion rates |
| Evidence | FPL Cup exists and is popular; March Madness/World Cup popularity |

---

## Solution Hypotheses (DRAFT)

*Is our solution the right approach?*

### H4: One round per gameweek is right
> "Users want tournaments that progress one round per FPL gameweek, not faster."

| Attribute | Value |
|-----------|-------|
| Status | 🔴 Unvalidated |
| Confidence | Medium |
| Risk if wrong | Medium - could add flexibility later |
| How to validate | Ask users, test completion rates |
| Evidence | Matches FPL cadence; World Cup is ~1 game per few days |

---

### H5: Seeding by league rank is fair
> "Seeding brackets by current mini-league rank is perceived as fair."

| Attribute | Value |
|-----------|-------|
| Status | 🔴 Unvalidated |
| Confidence | Medium |
| Risk if wrong | Low - easy to change |
| How to validate | User feedback after first tournaments |
| Evidence | Standard practice in sports tournaments |

---

### H6: Auto-include all members works
> "Automatically including all mini-league members (vs. invite/accept) is the right UX."

| Attribute | Value |
|-----------|-------|
| Status | 🔴 Unvalidated |
| Confidence | Low |
| Risk if wrong | Medium - may need invite flow |
| How to validate | Watch for complaints about unwanted inclusion |
| Evidence | None - pure assumption |

<!-- TODO: This might be wrong. Watch closely. -->

---

### H7: Final scores only (not live) is acceptable
> "Users accept waiting for gameweek to finish for final scores, rather than live updates."

| Attribute | Value |
|-----------|-------|
| Status | 🔴 Unvalidated |
| Confidence | Medium |
| Risk if wrong | Medium - live is complex to build |
| How to validate | User feedback, feature requests |
| Evidence | FPL itself has live scores, but bonus points change |

---

## Growth Hypotheses (DRAFT)

*Will users spread the product?*

### H8: Mini-league viral loop works
> "When one person creates a tournament, it exposes 5-20 league members to the product, some of whom create tournaments for their OTHER leagues."

| Attribute | Value |
|-----------|-------|
| Status | 🔴 Unvalidated |
| Confidence | Medium |
| Risk if wrong | Critical - main growth mechanism |
| How to validate | Track K-factor, multi-league user rate |
| Evidence | FPL players are typically in multiple leagues (assumption) |

---

### H9: FPL communities will share
> "Posts in r/FantasyPL and FPL Twitter will drive meaningful traffic."

| Attribute | Value |
|-----------|-------|
| Status | 🔴 Unvalidated |
| Confidence | Medium |
| Risk if wrong | Medium - may need other channels |
| How to validate | Launch and measure |
| Evidence | Active communities, but also crowded with content |

---

### H10: Word of mouth is primary channel
> "Most users will come from friend referrals (mini-league invites) rather than marketing."

| Attribute | Value |
|-----------|-------|
| Status | 🔴 Unvalidated |
| Confidence | Medium |
| Risk if wrong | Medium - may need more active marketing |
| How to validate | Track acquisition source |
| Evidence | Assumption based on social nature of mini-leagues |

---

## Technical Hypotheses (DRAFT)

*Will the technical approach work?*

### H11: FPL API remains accessible
> "The unofficial FPL API will continue to work and not block our requests."

| Attribute | Value |
|-----------|-------|
| Status | 🟡 Testing |
| Confidence | Medium |
| Risk if wrong | Critical - product doesn't work |
| How to validate | Ongoing monitoring, community reports |
| Evidence | API has been stable for years; other tools use it |

---

### H12: Firebase free tier is sufficient
> "Firebase Spark (free) plan will handle our initial scale."

| Attribute | Value |
|-----------|-------|
| Status | 🔴 Unvalidated |
| Confidence | High |
| Risk if wrong | Low - can upgrade |
| How to validate | Monitor usage as we grow |
| Evidence | Free tier limits are generous for small apps |

---

## Experiment Log (DRAFT)

<!-- TODO: Add experiments as we run them -->

### Template for New Experiments

```markdown
### EXP-XXX: [Experiment Name]

**Hypothesis being tested:** H[X]
**Start date:** YYYY-MM-DD
**End date:** YYYY-MM-DD

**What we did:**
[Description of experiment]

**What we measured:**
[Metrics tracked]

**Results:**
[Data and observations]

**Conclusion:**
[Validated/Invalidated/Inconclusive]

**Next steps:**
[What we'll do based on learnings]
```

---

### Completed Experiments

*None yet - add as we run them*

---

## Prioritized Validation Backlog (DRAFT)

<!-- TODO: Order by risk and ease of validation -->

| Priority | Hypothesis | Risk if Wrong | Ease to Validate |
|----------|------------|---------------|------------------|
| 1 | H1: Lack of mid-season excitement | Critical | Medium (interviews) |
| 2 | H3: Knockout format appeals | Critical | Medium (launch and see) |
| 3 | H8: Viral loop works | Critical | Hard (need users) |
| 4 | H11: FPL API stable | Critical | Easy (monitoring) |
| 5 | H6: Auto-include works | Medium | Easy (feedback) |

---

## Adding New Hypotheses

When you catch yourself saying "I assume..." or "Users probably...", add a hypothesis:

1. Write the hypothesis as a clear statement
2. Assess confidence level
3. Identify risk if wrong
4. Define how to validate
5. Note any existing evidence
6. Add to appropriate section

---

## Related

- [vision.md](./vision.md) - Core beliefs (many are hypotheses)
- [metrics.md](./metrics.md) - How we measure validation
- [../product/requirements/core-prd.md](../product/requirements/core-prd.md) - Assumptions section
