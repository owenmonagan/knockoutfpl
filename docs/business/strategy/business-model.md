# Business Model

Who we serve, how we reach them, and how the business works.

---

## Value Proposition

**For FPL players** who want more than season-long mini-league standings, **Knockout FPL provides** bracket-style tournament competitions using their existing FPL teams, **unlike** manual spreadsheet tracking or WhatsApp coordination.

**The core transformation:**
- **From:** "I'm 15th in my mini-league by December, nothing to play for"
- **To:** "Fresh knockout tournament, anyone can win, real stakes every gameweek"

**Pain points we solve:**
- Mini-leagues reward 38-week consistency—by mid-season, half the players are out of contention
- No built-in way to run knockout competitions in FPL
- Manual tournament tracking is tedious and error-prone
- No drama—leagues grind on without elimination moments

**Gains we create:**
- Knockout drama: win or go home
- Fresh competition regardless of league position
- Automatic scoring and bracket progression
- Clear winners and bragging rights
- Easy setup—create a tournament in under a minute

**Why this matters:**
Real football has both formats: the Premier League for consistency, knockout cups (FA Cup, Champions League) for elimination drama. FPL only has the league half. We complete the picture.

---

## Customer Segments

**Primary: FPL Mini-League Members**

The core user. Already plays FPL, already in 1+ mini-leagues with friends, work colleagues, or family. They don't need to be convinced that FPL is fun—they need a new way to compete.

Characteristics:
- Active FPL player (checks team weekly)
- Part of at least one social mini-league
- Wants more engagement beyond season standings
- Mobile-first (checks FPL on phone)

**Future: Content Creators & Community Leaders**

Podcasters, FPL Twitter accounts, Discord server admins, YouTube creators. They have audiences who want to compete together. This segment unlocks scale but needs controls (participant limits, moderation).

Characteristics:
- Audiences of 100-10,000+ followers
- Run communities (Discord, Patreon, Twitter)
- Want engagement tools for paid tiers
- Need content to talk about (tournament drama = episodes, threads, recaps)
- Willing to pay for premium features at scale

**Not targeting (for now):**
- Casual FPL players not in mini-leagues (no social hook)
- Betting/gambling users (legal complexity, wrong vibe)
- People who don't already play FPL (too much education needed)

---

## Channels & Distribution

**Launch: r/FantasyPL Mega Tournament**
- 30k+ player tournament demonstrates scale from day one
- Proves the product works at volume
- Creates immediate awareness across the largest FPL community
- Sets the standard: "This is how you run FPL tournaments"

**Primary: Word of mouth within mini-leagues**
- Player creates tournament → shares link → members join → they create for their other leagues
- Core viral loop: one person brings 8-20 others

**Influencer Strategy: Tool + Early Access**

*Why influencers want this:*
- **Engagement for paid tiers** - Exclusive tournaments for Patreon/Discord subscribers
- **Content creation** - Tournament drama gives them something to talk about (episodes, threads, recaps)
- **Audience interaction** - Compete against their followers

*How we seed it:*
- Identify 10-15 mid-tier FPL creators (podcasts, Twitter, YouTube)
- Offer early access before public launch
- Let them shape features—they feel ownership
- They launch tournaments for their audiences at the same time as the r/FantasyPL mega tournament

**Organic community spread:**
- FPL Twitter, Reddit, Discord share good tools fast
- Search captures high-intent users looking for tournament solutions

---

## Revenue Model

**Phase 1: Cover costs (now)**

Display ads (Google AdSense or similar) offset Firebase read/write costs. Keeps the product free while scaling.

- Non-intrusive placement (not interrupting core flows)
- Enables free usage at any scale
- Passive revenue, no sales effort required

**Phase 2: Premium placements (with traction)**

Once traffic is proven, upgrade to direct sponsorships:
- "This tournament powered by [FPL Creator/Brand]"
- Higher CPMs than programmatic
- Native feel, premium partners only
- FPL-adjacent brands: podcasts, tools, merchandise

**Phase 3: Volume pricing (at scale)**

When creators demand larger tournaments:

| Tier | Price | What you get |
|------|-------|--------------|
| Free | $0 | Tournaments up to 64 players, ads shown |
| Pro | TBD | 100-500 players, reduced/no ads, custom branding |
| Enterprise | TBD | 500+ players, white-label, API access |

**Explicitly not pursuing:**
- Feature gating for small users
- Paid entry / prize pools (legal complexity)
- Subscriptions for individuals

**The model:**
Ads pay for infrastructure. Volume pricing captures value from power users. Core experience stays free for mini-leagues.

---

## Key Activities

**What we must do well:**

1. **Reliable FPL data** - Scores must be accurate, fetched promptly when gameweeks finish. If scores are wrong, trust is gone.

2. **Bracket logic** - Seeding, byes, progression, tiebreakers must work correctly. No manual intervention needed.

3. **Scale for large tournaments** - 30k+ players in r/FantasyPL tournament. Must handle reads/writes efficiently.

4. **Simple tournament creation** - Create and share a tournament in under a minute. No friction.

5. **Mobile experience** - Most FPL users check on their phones. Mobile-first design.

---

## Key Resources

| Resource | Notes |
|----------|-------|
| FPL API access | Public, unofficial. No auth required. Must handle rate limits and caching. |
| Firebase infrastructure | Auth, Data Connect (PostgreSQL), Functions, Hosting. Costs scale with usage. |
| Domain | knockoutfpl.com or similar |
| Ad integration | Google AdSense or equivalent for revenue |
| Development time | Side project capacity |

---

## Key Risks

- **FPL API changes** - Unofficial API could break. No fallback. Monitor closely.
- **Firebase/Cloud SQL costs at scale** - 30k tournament = significant database load. Ads must offset.
- **Gameweek timing** - Must reliably detect when gameweeks finish to fetch final scores.

---

## Summary

**In one sentence:**
Knockout FPL is a free tournament platform for FPL players, funded by ads and volume pricing, spread through community word-of-mouth and influencer adoption.

**The model at a glance:**

| Element | Answer |
|---------|--------|
| **Who we serve** | FPL players in mini-leagues, scaling to content creators |
| **What we offer** | Bracket-style knockout tournaments using existing FPL teams |
| **How they find us** | r/FantasyPL mega tournament, influencer seeding, word of mouth |
| **How we make money** | Display ads (now), sponsorships (later), volume pricing (at scale) |
| **What we must nail** | Accurate scores, working brackets, mobile UX, scale |

**Key bets:**
1. FPL players want knockout competition, not just leagues
2. Community distribution beats paid marketing
3. Influencers will adopt it for engagement and content
4. Ads can cover infrastructure costs at scale

---

## Related

- [vision.md](./vision.md) - Why we exist and where we're headed
- [principles.md](./principles.md) - How we make decisions
- [competitive-landscape.md](./competitive-landscape.md) - Market context
- [gtm-strategy.md](./gtm-strategy.md) - Launch and growth tactics
