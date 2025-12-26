# Documentation Structure Design

> **Created:** December 26, 2025
> **Status:** Approved
> **Purpose:** Define a comprehensive business documentation hierarchy for Knockout FPL

---

## Context

The project needs documentation that covers:
- Core concepts (mental model)
- User journeys (end-to-end flows)
- Business rules (scoring, edge cases)
- System behavior (architecture)

**Audience:** Developer (self) and future collaborators

**Key Decision:** Tournaments are the product direction. Challenges (1v1) are deprecated legacy code.

---

## Documentation Structure

```
docs/
├── CLAUDE.md                              # Master index, summaries + links
│
├── business/
│   ├── CLAUDE.md                          # Business docs hub, summaries + links
│   │
│   ├── strategy/
│   │   ├── CLAUDE.md                      # Strategy hub
│   │   ├── vision.md                      # North star, 3-year view
│   │   ├── business-model.md              # Value prop, segments, revenue
│   │   └── competitive-landscape.md       # Alternatives, differentiation
│   │
│   ├── product/
│   │   ├── CLAUDE.md                      # Product hub
│   │   ├── requirements/
│   │   │   ├── CLAUDE.md                  # PRD index
│   │   │   ├── core-prd.md                # Main product requirements
│   │   │   └── tournament-prd.md          # Tournament-specific
│   │   ├── specs/
│   │   │   ├── CLAUDE.md                  # Spec index
│   │   │   ├── functional-spec.md         # Business rules, edge cases
│   │   │   └── glossary.md                # Core concepts defined
│   │   └── journeys/
│   │       ├── CLAUDE.md                  # Journey index
│   │       ├── onboarding.md              # Signup → FPL connection
│   │       ├── tournament-creation.md     # Create tournament flow
│   │       └── tournament-participation.md
│   │
│   └── technical/
│       ├── CLAUDE.md                      # Technical hub
│       ├── architecture.md                # System diagram, components
│       ├── data/
│       │   ├── CLAUDE.md                  # Data layer hub
│       │   ├── data-dictionary.md         # Entities and fields
│       │   └── data-flow.md               # How data moves
│       └── integrations/
│           ├── CLAUDE.md                  # Integrations hub
│           └── fpl-api.md                 # FPL API specifics
│
└── plans/                                 # (existing) Implementation plans
    └── ...
```

**Total: 25 files** (11 CLAUDE.md hubs + 14 content docs)

---

## CLAUDE.md Hub Pattern

Each CLAUDE.md serves as a navigation guide with summaries + links:

```markdown
# [Section Name]

[1-2 sentence description of what this section covers]

## Documents

- **[child-doc.md](./child-doc.md)** - Brief summary of what this doc contains
- **[subdirectory/](./subdirectory/CLAUDE.md)** - Brief summary of subdirectory

## Reading Order

1. Suggested first doc
2. Suggested second doc
3. Reference docs as needed

## Related

- See [../related-section/](../related-section/CLAUDE.md) for related context
```

---

## Content Specifications

### Strategy Documents

#### `strategy/vision.md`
- Mission statement - One sentence: what does Knockout FPL do?
- Vision - Where is this headed in 3 years?
- Core beliefs - Why does this product need to exist?
- Success definition - What does "winning" look like?
- Non-goals - What we explicitly won't do

#### `strategy/business-model.md`
- Value proposition - What pain do we solve? What gain do we create?
- Customer segments - Who are our users?
- Channels - How do users find us?
- Key activities - What must we do well?
- Key resources - What do we need?
- Revenue streams - Current and future possibilities
- Cost structure - Infrastructure and time costs

#### `strategy/competitive-landscape.md`
- Direct competitors - Other FPL head-to-head tools
- Indirect alternatives - What do people do today?
- Our differentiation - Why choose Knockout FPL?
- Risks - What could kill this?

---

### Product Requirements Documents

#### `product/requirements/core-prd.md`
- Problem statement - What user problem are we solving?
- Target users - Primary and secondary personas
- Product scope - What's in, what's out
- Success criteria - Measurable goals for launch
- Assumptions - What we're betting on being true
- Dependencies - What must exist for this to work
- Risks & mitigations - Known risks and how we'll handle them

#### `product/requirements/tournament-prd.md`
- Feature overview - What is a tournament?
- User stories - As a user, I want to...
- Acceptance criteria - How do we know it's done?
- Scope boundaries - MVP vs future
- Open questions - Unresolved decisions

*Note: Migrate and restructure content from existing `docs/prds/product_overview.md`*

---

### Specifications

#### `product/specs/glossary.md`
Define each term with: definition, example, related terms.

Terms to define:
- Tournament
- Round
- Match
- Participant
- Seed
- Bye
- Gameweek
- Mini-league
- Differential (deprecated - note as legacy)

#### `product/specs/functional-spec.md`
- Tournament lifecycle - States and transitions
- Bracket generation - Seeding rules, bye allocation, match pairing
- Scoring rules - How points are fetched, when scores become final
- Tiebreaker rules - What happens on equal points
- Edge cases - Odd participants, API failures, mid-tournament dropouts
- Validation rules - What inputs are valid/invalid
- Error states - What can go wrong, how it's handled

---

### User Journeys

#### `product/journeys/onboarding.md`
- Entry points - How do users discover the app?
- Signup flow - Step-by-step with decision points
- FPL connection - Entering team ID, verification, error handling
- First-time experience - What do they see after connecting?
- Success state - User is ready to create/join tournaments
- Drop-off risks - Where might users abandon?

#### `product/journeys/tournament-creation.md`
- Prerequisites - What must be true before this flow?
- Step-by-step flow - Select league → choose gameweek → confirm
- Decision points - What choices does the user make?
- Validation & errors - Invalid inputs, API failures
- Success state - Tournament exists, shareable
- Post-creation - What happens next?

#### `product/journeys/tournament-participation.md`
- Discovery - How do users find tournaments they're in?
- Viewing the bracket - What do they see? Navigation?
- Match status - Upcoming, live, completed states
- Score updates - When and how scores appear
- Progression - How winners advance, how losers exit
- Tournament completion - Winner announcement, final state

---

### Technical Documents

#### `technical/architecture.md`
- System diagram - Visual of components and connections
- Frontend - React, Vite, shadcn/ui, routing structure
- Backend - Firebase Auth, Firestore, Cloud Functions
- External services - FPL API
- Environments - Local dev, staging, production
- Key architectural decisions - Why Firebase? Why no dedicated backend?

#### `technical/data/data-dictionary.md`
- Users - Fields, types, constraints, indexes
- Tournaments - Fields, types, constraints, indexes
- TournamentParticipant - Embedded structure
- TournamentRound - Embedded structure
- TournamentMatch - Embedded structure
- Field-level notes - Why certain fields exist

#### `technical/data/data-flow.md`
- Read flows - User loads dashboard → what gets fetched?
- Write flows - User creates tournament → what gets written?
- Background flows - Scheduled function updates scores
- Caching strategy - What's cached, what's always fresh?
- Data freshness - How stale can data be?

#### `technical/integrations/fpl-api.md`
- Endpoints used - Full list with purpose
- Data structures - What FPL returns, how we transform it
- Rate limits - Known constraints
- Failure modes - What can go wrong, how we handle it
- CORS & proxying - Why we need Cloud Functions

---

## Top-Level CLAUDE.md

The `docs/CLAUDE.md` file explains the entire documentation system:

- Purpose of this docs structure
- When to read what (strategy questions → strategy/, implementation → technical/)
- How docs relate to code (docs describe intent, code implements it)
- Keeping docs updated (when to update which docs)

---

## Implementation Order

Recommended order to create these documents:

1. **Structure first** - Create all CLAUDE.md hub files (11 files)
2. **Glossary** - Define terms before writing about them
3. **Vision & Business Model** - Ground everything in purpose
4. **Core PRD** - What are we building?
5. **Functional Spec** - How does it behave?
6. **User Journeys** - How do users experience it?
7. **Technical Docs** - How is it built?
8. **Tournament PRD** - Migrate existing content
9. **Competitive Landscape** - Can be done anytime

---

## Migration Notes

### Files to migrate/deprecate:
- `docs/prds/product_overview.md` → content moves to `tournament-prd.md`
- `PRODUCT.md` (root) → consider consolidating into new structure

### Files to keep:
- `CLAUDE.md` (root) → development guide, separate from business docs
- `docs/plans/*` → implementation plans remain separate

---

## Success Criteria

- [ ] All 25 files created with appropriate content
- [ ] Every CLAUDE.md links correctly to children and related sections
- [ ] Glossary terms are used consistently across all docs
- [ ] No orphan docs (everything reachable from root CLAUDE.md)
- [ ] Existing PRD content migrated and old file deprecated
