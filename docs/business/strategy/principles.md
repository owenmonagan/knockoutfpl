# Product Principles

> **Status:** DRAFT - needs team alignment and refinement
> **Last Updated:** December 2025

---

## Overview

Product principles are the decision-making framework for Knockout FPL. When facing trade-offs, these principles guide us toward consistent choices aligned with our vision.

**How to use these:**
- Reference during design decisions
- Use in code reviews and product discussions
- When principles conflict, discuss and document the exception

---

## Core Principles (DRAFT)

<!-- TODO: Validate these with real product decisions -->

### 1. Simple over Flexible

> "Make the common case effortless, even if edge cases are unsupported."

**What this means:**
- Favor opinionated defaults over configuration options
- One clear way to do things, not multiple paths
- Say "no" to features that add complexity for edge cases

**Examples:**
- ✅ Auto-seed brackets by league rank (no manual seeding option)
- ✅ One round per gameweek (no custom timing)
- ❌ Don't add "exclude chips" option until many users request it
- ❌ Don't build custom bracket sizes; support standard sizes only

**Trade-off accepted:** Power users may want flexibility we don't offer.

---

### 2. FPL is the Source of Truth

> "We reflect FPL data; we never modify, store, or dispute it."

**What this means:**
- Scores come from FPL API, period
- If FPL says X, we say X (no manual overrides)
- We don't store historical FPL data beyond what's needed
- Link to FPL as authoritative source

**Examples:**
- ✅ Show "Score from FPL" with link to official source
- ✅ If FPL API has an issue, we wait for it to resolve
- ❌ Never allow manual score entry or override
- ❌ Don't build score dispute resolution (FPL is right)

**Trade-off accepted:** If FPL has errors, so do we. We accept this dependency.

---

### 3. Ship to Learn

> "Launch early, iterate fast. Real user feedback beats speculation."

**What this means:**
- Bias toward shipping over perfecting
- Small releases, quick iterations
- Measure, learn, adjust
- "Good enough" today beats "perfect" next month

**Examples:**
- ✅ Launch with basic bracket display; improve based on feedback
- ✅ Release MVP without notifications; add if users request
- ❌ Don't delay launch to add "nice to have" features
- ❌ Don't over-engineer for hypothetical scale

**Trade-off accepted:** Some users will see rough edges. That's okay.

---

### 4. Respect the Mini-League

> "Strengthen existing FPL communities; don't try to replace them."

**What this means:**
- We complement FPL mini-leagues, not compete
- Keep the social dynamic within existing groups
- Don't try to build our own social network
- Tournament value comes from playing with people you know

**Examples:**
- ✅ Import existing mini-league members
- ✅ Focus on private tournaments, not public matchmaking
- ❌ Don't build global leaderboards of strangers
- ❌ Don't add chat/social features (they have WhatsApp)

**Trade-off accepted:** Slower growth than a social platform, but deeper engagement.

---

### 5. Mobile-First Mindset

> "Most FPL users are on phones. Design for thumbs."

**What this means:**
- Test on mobile before desktop
- Touch-friendly UI, readable text, fast loading
- Core flows must work perfectly on mobile
- Desktop is "also good," not the primary target

**Examples:**
- ✅ Large tap targets, bottom navigation
- ✅ Bracket view optimized for portrait orientation
- ❌ Don't build features that only work on desktop
- ❌ Don't use hover states for critical information

**Trade-off accepted:** Desktop experience may be "fine" rather than "optimized."

---

### 6. Free Until Proven

> "Don't monetize until we've proven real value."

**What this means:**
- Build audience and trust before revenue
- Free removes friction for viral growth
- Monetization is a future problem, not a current one
- When we do monetize, don't degrade free experience

**Examples:**
- ✅ All core features free
- ✅ No ads (they degrade experience)
- ❌ Don't gate features behind paywall prematurely
- ❌ Don't add "premium" tiers until we have scale

**Trade-off accepted:** No revenue in short term. This is a side project, not a business (yet).

---

## Principles in Tension (DRAFT)

<!-- TODO: Add examples as we encounter them -->

When principles conflict, here's how to think about it:

| Conflict | Resolution |
|----------|------------|
| Simple vs. Ship to Learn | Ship simple things fast; don't ship complex things half-done |
| Mobile-First vs. Ship to Learn | Mobile must work; desktop can be "good enough" at launch |
| FPL Source of Truth vs. Simple | Accept FPL complexity (like bonus points timing) rather than oversimplify |

---

## Anti-Principles (DRAFT)

Things we explicitly **don't** prioritize:

| Anti-Principle | Why |
|----------------|-----|
| "Build for scale" | We're not at scale; optimize when needed |
| "Maximize engagement" | We want efficient, not addictive |
| "Feature parity with competitors" | We don't have competitors; we set our own path |
| "Enterprise-ready" | This is for friend groups, not corporations |

---

## Applying Principles (DRAFT)

### In Product Decisions

When evaluating a feature request:
1. Does it align with our principles?
2. Which principle does it serve?
3. Does it conflict with any principle?
4. If conflict, which principle wins and why?

### In Code Reviews

When reviewing implementation:
1. Is this simpler than it needs to be? (Principle 1)
2. Are we storing FPL data we shouldn't? (Principle 2)
3. Is this over-engineered? (Principle 3)
4. Does this work on mobile? (Principle 5)

### In Design Reviews

When reviewing UX:
1. Is there only one obvious way to do this? (Principle 1)
2. Can this be done in fewer steps? (Principle 1)
3. Will this work with a thumb on a phone? (Principle 5)

---

## Evolving Principles

Principles aren't permanent. Review and update when:

- We consistently make exceptions to a principle
- User feedback contradicts a principle
- Business context changes significantly
- A principle no longer serves our vision

Document any changes with rationale.

---

## Related

- [vision.md](./vision.md) - What we're building toward
- [../product/requirements/core-prd.md](../product/requirements/core-prd.md) - What's in/out of scope
