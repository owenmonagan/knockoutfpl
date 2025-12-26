# Core Product Requirements Document

> **Status:** DRAFT - needs review and refinement
> **Last Updated:** December 2025

---

## Problem Statement (DRAFT)

<!-- TODO: Validate with real user feedback -->

FPL mini-league members want more excitement from their leagues beyond season-long standings. There's no easy way to run knockout-style tournaments that create the drama of winner-takes-all brackets.

**Current solutions are inadequate:**
- Manual tracking in spreadsheets is tedious
- WhatsApp/Discord coordination is error-prone
- No automated scoring integration

---

## Target Users (DRAFT)

<!-- TODO: Validate these personas -->

### Primary: FPL Mini-League Member

- Plays FPL actively (checks app daily during season)
- Member of 1+ mini-leagues (friends, work, family)
- Wants more engagement mid-season
- Comfortable with web apps

### Secondary: Mini-League Organizer

- Creates and manages mini-leagues
- Looking for ways to keep members engaged
- Often initiates group activities
- "Commissioner" personality type

---

## Product Scope (DRAFT)

<!-- TODO: Confirm scope boundaries -->

### In Scope (MVP)

- [x] User authentication (email/password)
- [x] FPL team connection (team ID verification)
- [ ] View user's FPL mini-leagues
- [ ] Create knockout tournament for a mini-league
- [ ] Automatic bracket generation (seeded by rank)
- [ ] Automatic score fetching from FPL API
- [ ] Automatic winner determination and progression
- [ ] View tournament bracket and results

### Out of Scope (Future)

- Live scoring during matches
- Custom tournament rules (chips banned, etc.)
- Multiple tournaments per league simultaneously
- Tournament chat/comments
- Notifications (email, push)
- Mobile native app

### Explicitly Not Doing

- Paid entry / prize pools
- Draft league support (classic FPL only)
- Replacing FPL itself

---

## Success Criteria (DRAFT)

<!-- TODO: Make these more specific -->

### Launch Goals

| Metric | Target | Rationale |
|--------|--------|-----------|
| Tournaments created | 50+ | Validates core use case |
| Tournament completion rate | >80% | Users follow through |
| Page load time | <2 seconds | Acceptable UX |
| Critical bugs | 0 | Reliable experience |

### Post-Launch Goals

| Metric | Target | Timeframe |
|--------|--------|-----------|
| Monthly active users | 500+ | 3 months |
| User retention | 70%+ | Return next gameweek |
| Tournaments per user | 2+ per season | Repeat usage |

---

## Assumptions (DRAFT)

<!-- TODO: Validate these assumptions -->

1. **FPL API remains accessible** - Public endpoints continue to work
2. **Users want knockout format** - Season-long isn't exciting enough
3. **One round per gameweek works** - Users don't want faster tournaments
4. **Seeding by rank is fair** - Top of league faces bottom
5. **Auto-include all members is right** - No invite/accept flow needed

---

## Dependencies (DRAFT)

<!-- TODO: Document mitigation strategies -->

| Dependency | Risk | Mitigation |
|------------|------|------------|
| FPL API | Could change or block | Cache aggressively, monitor for changes |
| Firebase | Vendor lock-in | Accept for now, standard infrastructure |
| Browser support | Older browsers may fail | Target modern browsers only |

---

## Risks & Mitigations (DRAFT)

<!-- TODO: Prioritize and plan mitigations -->

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| FPL API blocked | Low | Critical | Monitor, cache, have fallback |
| Low adoption | Medium | High | Focus on viral mini-league spread |
| Bracket logic bugs | Medium | High | Extensive testing, manual override |
| Score disputes | Low | Medium | Show FPL source link, no manual edits |

---

## Related

- [tournament-prd.md](./tournament-prd.md) - Tournament-specific requirements
- [../specs/functional-spec.md](../specs/functional-spec.md) - Detailed behavior
- [../../strategy/vision.md](../../strategy/vision.md) - Why we're building this
