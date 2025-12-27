# Metrics

How we measure success for Knockout FPL.

---

## North Star Metric

**Page Views**

Why page views:
- Directly correlates to ad revenue (1,000 PV = ~$0.50 at conservative CPM)
- Measurable from day one without ad integration
- Captures both acquisition (new users) and engagement (return visits)

**Phase 1 Target: 240,000 page views**

| Week | Weekly Target | Cumulative |
|------|---------------|------------|
| 1 | 60,000 | 60,000 |
| 2 | 60,000 | 120,000 |
| 3 | 60,000 | 180,000 |
| 4 | 60,000 | 240,000 |

Based on: 20,000 active users × 3 visits per gameweek × 4 gameweeks.

**Secondary Metric: Page Views per Active User**

Separates engagement from acquisition. Target: 3+ per gameweek.

---

## P/L Dashboard

**The Core Equation**

```
Profit = (Page Views × $0.0005) - Firebase Costs
```

**Assumptions**

| Factor | Value | Notes |
|--------|-------|-------|
| Ad CPM | $0.50 | Conservative for sports/hobby niche |
| Ads per page view | 1 | Single non-intrusive placement |
| Firebase reads per PV | ~4 | User doc, tournament, bracket |
| Firebase read cost | $0.036/100k | After free tier |

**Phase 1 P/L Target**

| Metric | Target |
|--------|--------|
| Page Views | 240,000 |
| Revenue (at $0.50 CPM) | $120 |
| Firebase Costs | <$5 |
| **Net** | ~$115 |

**Budget & Alerts**

| Alert | Threshold | Action |
|-------|-----------|--------|
| Firebase budget | $10/month | Email alert at 50%, 90% |
| Budget exceeded | 100% | Review architecture |

**Break-even Check**

At $0.50 CPM, break-even requires:
```
Page Views > (Firebase Costs ÷ 0.0005)
```

If Firebase costs $5/month → need >10,000 page views. Phase 1 target gives 24x headroom.

---

## Input Metrics

These drive the NSM. If page views are off track, diagnose here.

### Acquisition

| Metric | Definition | Phase 1 Target |
|--------|------------|----------------|
| Signups | Users who complete registration | 20,000 |
| Signup conversion | Visitors → Signups | >50% |
| Source | Where signups came from | 80%+ Reddit |

### Engagement

| Metric | Definition | Phase 1 Target |
|--------|------------|----------------|
| Active users (weekly) | Users who visited that gameweek | 15,000+ |
| Page views per active user | PV ÷ Active users | 3+ |
| Return rate | % of users who return next gameweek | >60% |

### Tournament Health

| Metric | Definition | Phase 1 Target |
|--------|------------|----------------|
| Bracket completion | Tournament finishes with a winner | 100% |
| Eliminated user drop-off | % who stop visiting after elimination | <50% |

---

## Measurement

### Weekly Dashboard (Every Monday)

| Section | Metrics | Source |
|---------|---------|--------|
| NSM | Page views (weekly, cumulative) | Google Analytics |
| P/L | Revenue estimate, Firebase costs, net | GA + Firebase Console |
| Acquisition | New signups, conversion rate, sources | Firebase Auth + GA |
| Engagement | Active users, PV per user, return rate | GA |

### Where to Find Data

| Metric | Location |
|--------|----------|
| Page views | Firebase Analytics or Google Analytics |
| Firestore reads/writes | Firebase Console → Usage |
| Cloud Function invocations | Firebase Console → Functions |
| Estimated costs | Firebase Console → Usage & Billing |
| Signups | Firebase Console → Authentication |

### Alerts to Configure

| Alert | Threshold | Action |
|-------|-----------|--------|
| Firebase budget | $10/month | Email at 50%, 90% |
| Error rate | >1% of requests | Immediate notification |
| Signup conversion | <30% | Investigate funnel |

### Weekly Review Questions

1. Are we on track for 240k page views?
2. Are costs within budget?
3. Is return rate holding above 60%?
4. Are eliminated users still checking in?

---

## Related

- [vision.md](./vision.md) - What success looks like qualitatively
- [gtm-strategy.md](./gtm-strategy.md) - Phase 1 launch plan these metrics measure
- [hypotheses.md](./hypotheses.md) - Assumptions these metrics validate
- [principles.md](./principles.md) - "North Star or No" principle
