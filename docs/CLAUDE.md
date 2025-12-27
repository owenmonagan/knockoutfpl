# Documentation Guide

> **Philosophy:** Draft early, refine later. Empty docs with TODOs are better than no docs.

---

## Documentation Approach

**Create draft documents proactively.** When you encounter a concept, decision, or flow that isn't documented:

1. **Create the file immediately** - Don't wait until you have "complete" information
2. **Mark sections as TODO** - Use `<!-- TODO: ... -->` comments liberally
3. **Add what you know** - Even a single sentence is valuable
4. **Link to related docs** - Even if those docs are also drafts
5. **Update the directory's CLAUDE.md** - Add a one-line description

---

## Documentation Structure

```
docs/
├── CLAUDE.md           # You are here - navigation guide
├── business/           # All business documentation
│   ├── strategy/       # Why we exist, where we're going
│   ├── product/        # What we're building, how users experience it
│   └── technical/      # How it's built, data structures
└── plans/              # Implementation plans (time-boxed, disposable)
```

---

## Sections

- **[business/](./business/CLAUDE.md)** - Strategy, product specs, and technical architecture.
- **[plans/](./plans/)** - Time-boxed implementation plans. Created for specific work, archived when done.

---

## Navigation Pattern

Each folder has a `CLAUDE.md` that links to its immediate children. Navigate by following the chain:

```
docs/CLAUDE.md
└── business/CLAUDE.md
    ├── strategy/CLAUDE.md → vision, metrics, principles...
    ├── product/CLAUDE.md → glossary, features/, journeys/, design/...
    └── technical/CLAUDE.md → architecture, data/, integrations/...
```

This keeps each navigation file short and maintainable.

---

## Relationship to Code

- **Docs describe intent** - What we want the system to do
- **Code implements behavior** - What the system actually does
- **When they diverge** - Update whichever is wrong

The root `CLAUDE.md` (in project root, not this file) covers development workflows, testing, and coding standards. This docs/ folder covers business and product documentation.

---

## TODO Convention

Use HTML comments for TODOs so they're visible in source but not rendered:

```markdown
<!-- TODO: Add example of tournament creation flow -->
<!-- TODO: Verify this matches current implementation -->
```

For draft sections, mark the heading:

```markdown
## Scoring Rules (DRAFT)

<!-- TODO: This section needs review -->
```
