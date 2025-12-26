# Metrics Framework

> **Status:** DRAFT - needs validation and refinement
> **Last Updated:** December 2025

---

## Overview

This document defines how we measure success for Knockout FPL. It establishes our North Star Metric, supporting input metrics, and guardrail metrics we won't sacrifice.

---

## North Star Metric (DRAFT)

<!-- TODO: Validate this is the right North Star -->

### **Completed Tournaments per Week**

**Why this metric:**
- Directly measures core value delivered (users experiencing knockout drama)
- Leading indicator of engagement and retention
- Captures both creation AND completion (not vanity)
- Aligns team around outcomes, not outputs

**Definition:**
- A tournament is "completed" when a winner is determined
- Measured weekly (aligns with FPL gameweek cadence)
- Excludes abandoned tournaments

**Target trajectory:**
| Timeframe | Target | Notes |
|-----------|--------|-------|
| Launch week | 10+ | Validate core flow |
| Month 1 | 50+ | Early traction |
| Month 3 | 200+ | Growth phase |
| Season end | 500+/week | Established product |

---

## Input Metrics (DRAFT)

<!-- TODO: Set up tracking for all of these -->

These metrics "feed" the North Star. Improving them should improve completed tournaments.

### Acquisition Metrics

| Metric | Definition | Target | Why it matters |
|--------|------------|--------|----------------|
| **New signups** | Users completing registration | - | Top of funnel |
| **Signup conversion** | Visitors → Registered users | >30% | Landing page effectiveness |
| **FPL connection rate** | Registered → Connected FPL team | >80% | Critical activation step |

### Activation Metrics

| Metric | Definition | Target | Why it matters |
|--------|------------|--------|----------------|
| **Tournament creation rate** | Connected users who create a tournament | >20% | Core action |
| **Time to first tournament** | Time from signup to tournament creation | <5 min | Friction indicator |
| **Invite sent rate** | Tournaments with invites sent | >90% | Viral loop trigger |

### Engagement Metrics

| Metric | Definition | Target | Why it matters |
|--------|------------|--------|----------------|
| **Tournament completion rate** | Created → Completed tournaments | >70% | Quality indicator |
| **Bracket views per tournament** | Avg views of bracket page | >10 | Engagement depth |
| **Return visit rate** | Users who return after gameweek | >50% | Stickiness |

### Viral/Growth Metrics

| Metric | Definition | Target | Why it matters |
|--------|------------|--------|----------------|
| **Invite acceptance rate** | Invites sent → Accepted | >60% | Viral loop efficiency |
| **K-factor** | Avg new users from each user | >1.0 | Viral growth indicator |
| **Multi-league users** | Users in 2+ tournaments | >20% | Cross-pollination |

### Retention Metrics

| Metric | Definition | Target | Why it matters |
|--------|------------|--------|----------------|
| **Week 1 retention** | Return within 7 days | >40% | Early retention |
| **Gameweek retention** | Return next gameweek | >60% | Core retention |
| **Season retention** | Return next FPL season | >50% | Long-term health |

---

## Guardrail Metrics (DRAFT)

<!-- TODO: Set up alerting for these -->

Metrics we monitor to ensure we don't sacrifice quality for growth.

| Metric | Threshold | Why it matters |
|--------|-----------|----------------|
| **Page load time** | <2 seconds | UX quality |
| **Error rate** | <1% | Reliability |
| **Score accuracy** | 100% | Trust (must match FPL) |
| **Support requests** | <5% of users | Product quality |
| **Bracket disputes** | 0 | Core functionality |

---

## Metrics Hierarchy (DRAFT)

```
                    ┌─────────────────────────┐
                    │   NORTH STAR METRIC     │
                    │ Completed Tournaments   │
                    │      per Week           │
                    └───────────┬─────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│  ACQUISITION  │     │  ACTIVATION   │     │   RETENTION   │
│               │     │               │     │               │
│ • Signups     │     │ • Tournament  │     │ • Return rate │
│ • Conversion  │     │   creation    │     │ • Multi-tourn │
│ • FPL connect │     │ • Invites     │     │   users       │
└───────────────┘     │ • Completion  │     └───────────────┘
                      └───────────────┘
                              │
                              ▼
                    ┌───────────────┐
                    │    VIRAL      │
                    │               │
                    │ • K-factor    │
                    │ • Invite rate │
                    │ • Multi-league│
                    └───────────────┘
```

---

## OKRs Template (DRAFT)

<!-- TODO: Set actual OKRs each quarter -->

### Example: Launch Quarter OKRs

**Objective 1: Validate product-market fit**
- KR1: 100 tournaments completed
- KR2: >60% tournament completion rate
- KR3: >30% of users return for second tournament

**Objective 2: Establish viral growth loop**
- KR1: >50% invite acceptance rate
- KR2: K-factor >0.5 (each user brings 0.5 new users)
- KR3: >15% of users create tournament for second league

**Objective 3: Maintain quality bar**
- KR1: 0 score discrepancies reported
- KR2: <2s page load time (p95)
- KR3: <1% error rate

---

## Tracking Implementation (DRAFT)

<!-- TODO: Implement these -->

### Decision: Firebase Analytics

**We will use Firebase Analytics (Google Analytics 4) as our primary analytics tool.**

**Why Firebase Analytics:**
- Already using Firebase for Auth, Firestore, Hosting - no new vendor
- Free tier is generous (unlimited events, 500 distinct event types)
- Built-in integration with Firebase ecosystem
- GA4 provides funnels, cohorts, retention analysis out of the box
- BigQuery export available if we need advanced analysis later

**What we won't use (for now):**
- Amplitude, Mixpanel, PostHog - unnecessary complexity for our stage
- Custom analytics in Firestore - use Firebase Analytics instead

### Must track from day 1

| Event | Parameters | Maps to Metric |
|-------|------------|----------------|
| `sign_up` | method | Acquisition |
| `fpl_team_connected` | team_id | Activation |
| `tournament_created` | tournament_id, league_size | North Star input |
| `tournament_completed` | tournament_id, rounds | North Star |
| `invite_sent` | tournament_id, count | Viral |
| `invite_accepted` | tournament_id | Viral |
| `bracket_viewed` | tournament_id | Engagement |

### Track as we scale
- [ ] Funnel conversion rates (use GA4 funnel exploration)
- [ ] Cohort retention (use GA4 cohort analysis)
- [ ] Viral metrics (K-factor) - may need custom calculation
- [ ] Feature usage

### Implementation Notes

```typescript
// Example: Track tournament creation
import { logEvent } from 'firebase/analytics';

logEvent(analytics, 'tournament_created', {
  tournament_id: tournament.id,
  league_size: tournament.participants.length,
  seeding_method: 'rank'  // for future flexibility
});
```

<!-- TODO: Create analytics.ts service wrapper for consistent event logging -->

---

## Review Cadence (DRAFT)

| Review | Frequency | Focus |
|--------|-----------|-------|
| **Metrics check** | Daily | North Star, errors |
| **Weekly review** | Weekly | Input metrics, trends |
| **OKR review** | Monthly | Progress toward goals |
| **Strategy review** | Quarterly | Are we measuring the right things? |

---

## Anti-Metrics (DRAFT)

Metrics we explicitly **won't** optimize for:

| Anti-Metric | Why we avoid it |
|-------------|-----------------|
| Total registered users | Vanity metric; doesn't indicate value |
| Time in app | We want efficient UX, not addiction |
| Tournaments started | Completion matters more |
| Social shares | Doesn't correlate with real value |

---

## Related

- [vision.md](./vision.md) - Success definition
- [gtm-strategy.md](./gtm-strategy.md) - Launch metrics
- [../product/requirements/core-prd.md](../product/requirements/core-prd.md) - Success criteria
