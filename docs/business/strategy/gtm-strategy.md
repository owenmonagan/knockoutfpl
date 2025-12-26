# Go-to-Market Strategy

> **Status:** DRAFT - needs validation and refinement
> **Last Updated:** December 2025

---

## Overview

This document outlines how Knockout FPL will launch and grow. Our GTM strategy leverages the inherent viral nature of mini-leagues: one person creates a tournament, inviting their entire league.

---

## Launch Phases (DRAFT)

<!-- TODO: Define specific dates/triggers for each phase -->

### Phase 1: Friends & Family (Pre-launch)

**Goal:** Validate core flow works end-to-end

- [ ] Test with 2-3 real mini-leagues (personal connections)
- [ ] Gather qualitative feedback on UX
- [ ] Fix critical bugs before wider release
- [ ] Validate FPL API reliability

**Success criteria:**
- At least 2 tournaments completed without manual intervention
- No critical bugs in bracket progression
- Positive qualitative feedback

### Phase 2: Soft Launch (Beta)

**Goal:** Validate product-market fit with strangers

- [ ] Share in 1-2 targeted FPL communities
- [ ] Monitor for unexpected issues at slightly larger scale
- [ ] Iterate based on feedback
- [ ] Begin tracking key metrics

**Success criteria:**
- 10+ tournaments created by non-friends
- >50% tournament completion rate
- Users return for second tournament

### Phase 3: Public Launch

**Goal:** Drive awareness and adoption

- [ ] Announce broadly across FPL communities
- [ ] Reach out to FPL content creators
- [ ] Optimize based on learnings from soft launch

**Success criteria:**
- See [metrics.md](./metrics.md) for targets

---

## Target Channels (DRAFT)

<!-- TODO: Prioritize based on effort vs. impact -->

| Channel | Reach | Effort | Priority | Notes |
|---------|-------|--------|----------|-------|
| r/FantasyPL | High | Low | **P1** | Post during high-traffic times (pre-deadline) |
| FPL Twitter/X | High | Medium | **P1** | Engage with FPL community, not just broadcast |
| Word of mouth | Medium | Zero | **P1** | Built into product (invite league) |
| FPL Podcasts | Medium | Medium | P2 | Reach out to mid-tier podcasters first |
| FPL Discord servers | Medium | Low | P2 | Many active FPL communities |
| FPL content creators | High | High | P3 | Harder to get attention, but high impact |
| SEO ("FPL knockout") | Low | Medium | P3 | Long-term play, not launch priority |

### Channel Tactics

**Reddit (r/FantasyPL):**
<!-- TODO: Research subreddit rules on self-promotion -->
- Post as a community member, not marketer
- Share during gameweek deadlines when traffic peaks
- Offer value first (maybe share bracket results as content)
- Be responsive to feedback and questions

**Twitter/X:**
- Engage with FPL accounts before promoting
- Share interesting tournament outcomes as content
- Use FPL hashtags (#FPL, #FPLCommunity)
- Consider timing around big gameweeks

**Word of Mouth (Built-in Viral Loop):**
- Tournament creator invites entire mini-league
- Each participant sees the product
- Winners/losers have bragging rights to share
- Make sharing results easy

---

## Viral Loop (DRAFT)

<!-- TODO: Validate this assumption about viral spread -->

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  User discovers Knockout FPL                                │
│           │                                                 │
│           ▼                                                 │
│  Creates tournament for their mini-league                   │
│           │                                                 │
│           ▼                                                 │
│  Invites league members (5-20 people)                       │
│           │                                                 │
│           ▼                                                 │
│  League members experience the product                      │
│           │                                                 │
│           ▼                                                 │
│  Some members are in OTHER mini-leagues too                 │
│           │                                                 │
│           ▼                                                 │
│  They create tournaments for those leagues ─────────────────┘
│
└─────────────────────────────────────────────────────────────┘
```

**Key assumption:** FPL players are typically in multiple mini-leagues (work, friends, family, online). If true, one happy user can seed multiple leagues.

---

## Positioning & Messaging (DRAFT)

<!-- TODO: Test messaging with real users -->

### One-liner
"Knockout tournaments for your FPL mini-league"

### Value proposition (for different audiences)

**For mini-league members:**
> "Turn your mini-league into a knockout tournament. Same FPL team, new bracket drama."

**For mini-league organizers:**
> "Create a knockout tournament for your league in under a minute. We handle the brackets and scoring."

### Key messages
1. **It's automatic** - Scores pulled from FPL, no manual tracking
2. **It's simple** - Create a tournament in under a minute
3. **It's free** - No cost, no ads
4. **It's fun** - Knockout drama your league is missing

---

## Launch Timing (DRAFT)

<!-- TODO: Decide on actual launch timing -->

**Best times to launch:**
- [ ] Early season (GW1-5) - High engagement, people setting up leagues
- [ ] January (GW20+) - Mid-season slump, leagues need excitement
- [ ] Avoid: End of season (people checked out), during major holidays

**Avoid:**
- Blank gameweeks
- International breaks
- Major competing events

---

## Launch Checklist (DRAFT)

<!-- TODO: Complete before launch -->

### Pre-launch
- [ ] Product is stable (no critical bugs)
- [ ] Analytics/metrics tracking in place
- [ ] Error monitoring set up
- [ ] Landing page explains value clearly
- [ ] Mobile experience is acceptable

### Launch day
- [ ] Post to primary channels (Reddit, Twitter)
- [ ] Monitor for issues
- [ ] Be responsive to questions/feedback
- [ ] Track signups and tournament creation

### Post-launch (Week 1)
- [ ] Gather qualitative feedback
- [ ] Fix any critical issues
- [ ] Follow up with early users
- [ ] Document learnings

---

## Risks & Mitigations (DRAFT)

<!-- TODO: Add more risks as identified -->

| Risk | Mitigation |
|------|------------|
| Reddit post gets removed | Read rules carefully, engage authentically |
| Low initial adoption | Start smaller, iterate on messaging |
| FPL API issues at scale | Monitor closely, have fallback messaging |
| Negative feedback | Respond gracefully, iterate quickly |

---

## Success Metrics

See [metrics.md](./metrics.md) for detailed metrics framework.

**Launch-specific targets:**
- Week 1: 20+ tournaments created
- Month 1: 100+ tournaments created
- Month 1: >60% tournament completion rate

---

## Related

- [vision.md](./vision.md) - Why we're building this
- [business-model.md](./business-model.md) - Customer segments and channels
- [metrics.md](./metrics.md) - How we measure success
