# Documentation Restructure Design

> **Created:** 2025-12-27
> **Status:** Ready for implementation

---

## Goal

Align the documentation navigation to match reality, integrate orphaned concept/ docs, and switch to a recursive CLAUDE.md structure.

---

## Changes Overview

### Files to Move

| From | To |
|------|-----|
| `concept/principles.md` | `business/product/design/brand-voice.md` |
| `concept/branding.md` | `business/product/design/design-system.md` |
| `concept/pages/landing-page.md` | `business/product/design/pages/landing-page.md` |
| `concept/onboarding.md` | `business/product/journeys/onboarding.md` |
| `concept/core.md` | `business/product/features/tournament-experience.md` |

### Files to Delete

- `concept/` (entire folder after moves)
- `testing/` (entire folder)
- `reports/` (entire folder)

### New CLAUDE.md Files to Create

- `business/product/design/CLAUDE.md`
- `business/product/design/pages/CLAUDE.md`

### CLAUDE.md Files to Update

| File | Changes |
|------|---------|
| `docs/CLAUDE.md` | Simplify to recursive structure - only reference business/, plans/ |
| `business/product/CLAUDE.md` | Add design/ section |
| `business/product/features/CLAUDE.md` | Add tournament-experience.md |
| `business/product/journeys/CLAUDE.md` | Add onboarding.md |

---

## New Directory Structure

```
docs/
├── CLAUDE.md                     # Philosophy + links to business/, plans/
├── business/
│   ├── CLAUDE.md                 # Links to strategy/, product/, technical/
│   ├── strategy/                 # Unchanged
│   ├── product/
│   │   ├── CLAUDE.md             # Links to overview, glossary, design/, features/, journeys/
│   │   ├── overview.md
│   │   ├── glossary.md
│   │   ├── design/               # NEW
│   │   │   ├── CLAUDE.md
│   │   │   ├── brand-voice.md
│   │   │   ├── design-system.md
│   │   │   └── pages/
│   │   │       ├── CLAUDE.md
│   │   │       └── landing-page.md
│   │   ├── features/
│   │   │   ├── CLAUDE.md
│   │   │   ├── ...existing 6 features...
│   │   │   └── tournament-experience.md  # NEW
│   │   └── journeys/
│   │       ├── CLAUDE.md
│   │       ├── ...existing 3 journeys...
│   │       └── onboarding.md     # NEW
│   └── technical/                # Unchanged
└── plans/                        # Implementation plans
```

---

## Recursive CLAUDE.md Pattern

Each CLAUDE.md only references immediate children:

```
docs/CLAUDE.md
└── business/, plans/

    business/CLAUDE.md
    └── strategy/, product/, technical/

        business/product/CLAUDE.md
        └── overview.md, glossary.md, design/, features/, journeys/

            business/product/design/CLAUDE.md
            └── brand-voice.md, design-system.md, pages/
```

**Benefits:**
- Each CLAUDE.md is short and maintainable
- Adding a doc only requires updating parent CLAUDE.md
- No deep links that break when things move
- Follows locality principle

---

## Implementation Steps

1. Create new directories: `business/product/design/`, `business/product/design/pages/`
2. Move concept files to new locations
3. Create new CLAUDE.md files for design/, design/pages/
4. Update existing CLAUDE.md files to recursive structure
5. Delete concept/, testing/, reports/ folders
6. Verify all links work

---

## Decisions Made

- **Structure approach:** Align vision to reality (not create missing files)
- **concept/ integration:** Create new design/ section under product/
- **Orphaned content:** Delete testing/ and reports/ (outdated artifacts)
- **Navigation style:** Recursive CLAUDE.md (each only links to children)
