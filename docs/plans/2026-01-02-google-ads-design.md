# Google Ads & Analytics Integration Design

**Date:** 2026-01-02
**Status:** Approved
**Goal:** Cover infrastructure costs with ad revenue

---

## Scope

### In Scope

| Component | Description |
|-----------|-------------|
| Google AdSense | One ad unit above the bracket view page |
| Google Analytics (GA4) | Basic page view tracking for data-driven ad placement decisions |
| Privacy Policy page | Custom-written, required for AdSense approval |
| Terms of Service page | Custom-written, required for AdSense approval |
| Footer component | Links to legal pages |

### Out of Scope

- Cookie consent banner (add later if EU traffic is significant)
- Multiple ad placements (data-driven decision after launch)
- Ad-free premium tier (Phase 3 per business model)
- Custom analytics events (page views only for MVP)

---

## Technical Approach

### Google AdSense Integration

**How it works:**
1. Apply for AdSense account (requires live site with legal pages)
2. Get approved (can take days to weeks)
3. Add AdSense script to `<head>`
4. Place ad unit component on bracket view

**File structure:**
```
src/components/ads/
├── AdUnit.tsx        # Reusable ad component wrapper
└── BracketAd.tsx     # Specific placement for bracket view
```

**Ad placement:** Above the bracket on tournament view. Immediately visible, doesn't interrupt the core bracket viewing experience.

### Google Analytics Integration

**How it works:**
1. Create GA4 property in Google Analytics console
2. Get Measurement ID (format: `G-XXXXXXXXXX`)
3. Add gtag.js script to `<head>`
4. Track page views on React Router navigation

**File structure:**
```
src/lib/analytics.ts
├── trackPageView()    # Called on route changes
└── trackEvent()       # For custom events (future use)
```

**What gets tracked:**
- Page views with URL paths (`/dashboard`, `/tournament/123`, etc.)
- Basic user metrics (sessions, bounce rate, time on page)

**Environment handling:**
- Only load in production (skip during local development)
- Measurement ID stored in environment variable

### Legal Pages

**Routes:**
- `/privacy` - Privacy Policy
- `/terms` - Terms of Service

**Content approach:** Custom-written pages tailored to Knockout FPL, covering:
- What data is collected (email, FPL team ID)
- How cookies are used (analytics, advertising)
- Third-party services (Firebase, Google AdSense, Google Analytics)
- User rights and contact information

**Footer:** Simple footer component with links to both legal pages.

---

## Environment Variables

```bash
# .env.production
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX    # From GA4 console
VITE_ADSENSE_CLIENT_ID=ca-pub-XXXXXXX  # From AdSense after approval
```

---

## Error Handling

| Scenario | Behavior |
|----------|----------|
| AdSense not approved yet | Ad component renders nothing (no empty space) |
| Ad blocker detected | Silently fail, don't break the page |
| Analytics blocked | Page works normally, no tracking |
| Local development | Neither ads nor analytics load |

Both Google scripts are designed to fail silently. No special error handling needed.

---

## Implementation Sequence

Order matters due to dependencies:

### Phase 1: Legal Pages (no dependencies)
1. Create `PrivacyPage.tsx` with custom content
2. Create `TermsPage.tsx` with custom content
3. Add `/privacy` and `/terms` routes
4. Create `Footer.tsx` component with links
5. Add footer to layout

### Phase 2: Google Analytics (needs live site)
1. Create GA4 property in Google Analytics console
2. Add `VITE_GA_MEASUREMENT_ID` to environment
3. Add gtag.js script to `index.html`
4. Create `src/lib/analytics.ts` helper
5. Wire up page view tracking in `App.tsx`

### Phase 3: Google AdSense (needs legal pages + approval)
1. Apply for AdSense account (after site is live with legal pages)
2. Wait for approval (days to weeks)
3. Add `VITE_ADSENSE_CLIENT_ID` to environment
4. Add AdSense script to `index.html`
5. Create `AdUnit.tsx` component
6. Create `BracketAd.tsx` component
7. Add `<BracketAd />` above bracket in tournament view

### Phase 4: Verify
1. Confirm analytics tracking in GA4 dashboard
2. Confirm ad displays correctly on bracket page
3. Test on mobile viewport

---

## Testing Approach

- **Unit tests:** None needed (third-party scripts)
- **E2E:** Verify pages load, ad component doesn't break layout
- **Manual:** Check GA4 dashboard shows page views after deploy

---

## Key Blocker

AdSense approval requires a live site with real content and legal pages. Complete Phases 1-2 before launch. Apply for AdSense immediately after deploying. Phase 3 activates once approved.

---

## Related

- [business-model.md](../business/strategy/business-model.md) - Revenue model context
- [metrics.md](../business/strategy/metrics.md) - Success metrics
