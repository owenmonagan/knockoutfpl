# Documentation Guide

> **Philosophy:** Draft early, refine later. Empty docs with TODOs are better than no docs.

---

## Documentation Approach

**Create draft documents proactively.** When you encounter a concept, decision, or flow that isn't documented:

1. **Create the file immediately** - Don't wait until you have "complete" information
2. **Mark sections as TODO** - Use `<!-- TODO: ... -->` comments liberally
3. **Add what you know** - Even a single sentence is valuable
4. **Link to related docs** - Even if those docs are also drafts

This approach ensures:
- Nothing gets forgotten
- Context is captured when it's fresh
- Documentation grows organically with the product

---

## Documentation Structure

```
docs/
├── CLAUDE.md                 # You are here - navigation guide
├── business/                 # All business documentation
│   ├── strategy/             # Why we exist, where we're going
│   ├── product/              # What we're building, how users experience it
│   └── technical/            # How it's built, data structures
└── plans/                    # Implementation plans (time-boxed, disposable)
```

---

## Quick Reference

| Question Type | Go To |
|--------------|-------|
| "Why does this product exist?" | [business/strategy/vision.md](./business/strategy/vision.md) |
| "Who are our users?" | [business/strategy/business-model.md](./business/strategy/business-model.md) |
| "How do we launch/grow?" | [business/strategy/gtm-strategy.md](./business/strategy/gtm-strategy.md) |
| "How do we measure success?" | [business/strategy/metrics.md](./business/strategy/metrics.md) |
| "How do we make decisions?" | [business/strategy/principles.md](./business/strategy/principles.md) |
| "What are we assuming?" | [business/strategy/hypotheses.md](./business/strategy/hypotheses.md) |
| "What are we building?" | [business/product/requirements/](./business/product/requirements/CLAUDE.md) |
| "What does X term mean?" | [business/product/specs/glossary.md](./business/product/specs/glossary.md) |
| "How does X behave?" | [business/product/specs/functional-spec.md](./business/product/specs/functional-spec.md) |
| "How do users do X?" | [business/product/journeys/](./business/product/journeys/CLAUDE.md) |
| "How is the system built?" | [business/technical/architecture.md](./business/technical/architecture.md) |
| "What data do we store?" | [business/technical/data/](./business/technical/data/CLAUDE.md) |
| "How does the FPL API work?" | [business/technical/integrations/fpl-api.md](./business/technical/integrations/fpl-api.md) |

---

## Reading Order for New Contributors

1. **[business/strategy/vision.md](./business/strategy/vision.md)** - Understand the mission
2. **[business/product/specs/glossary.md](./business/product/specs/glossary.md)** - Learn the vocabulary
3. **[business/product/requirements/core-prd.md](./business/product/requirements/core-prd.md)** - See what we're building
4. **[business/technical/architecture.md](./business/technical/architecture.md)** - Understand the system
5. Browse journeys and specs as needed

---

## Relationship to Code

- **Docs describe intent** - What we want the system to do
- **Code implements behavior** - What the system actually does
- **When they diverge** - Update whichever is wrong

The root `CLAUDE.md` (in project root, not this file) covers development workflows, testing, and coding standards. This docs/ folder covers business and product documentation.

---

## Keeping Docs Updated

| When... | Update... |
|---------|-----------|
| Adding a new feature | `requirements/`, `functional-spec.md`, relevant journey |
| Changing data model | `data-dictionary.md`, `data-flow.md` |
| New integration | `integrations/` |
| Terminology change | `glossary.md` first, then grep and update others |
| Strategic shift | `strategy/` docs |

---

## TODO Convention

Use HTML comments for TODOs so they're visible in source but not rendered:

```markdown
<!-- TODO: Add example of tournament creation flow -->
<!-- TODO: Verify this matches current implementation -->
<!-- TODO: Get user feedback on this assumption -->
```

For draft sections, mark the heading:

```markdown
## Scoring Rules (DRAFT)

<!-- TODO: This section needs review -->
```
