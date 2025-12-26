# Go-to-Market Strategy

How Knockout FPL launches and grows.

---

## The Strategic Bet

We're not doing a traditional soft launch. We're proving scale from day one with a single, ambitious move: a 30,000+ player knockout tournament on r/FantasyPL, followed by onboarding FPL content creators once we have proof.

**Why this approach:**

1. **Proves the product works at scale** - No "can it handle 100 users?" questions. We answer "can it handle 30,000?" immediately.

2. **Creates undeniable social proof** - "The r/FantasyPL knockout" becomes a reference point. Everyone in the FPL community knows about it.

3. **Sets the standard** - We define what "FPL knockout tournament" means before anyone else can.

4. **De-risks creator outreach** - We pitch creators with proof ("20k signed up") instead of promises.

5. **Concentrated effort** - One big push is easier to execute than months of scattered marketing.

**The risk we're accepting:**

If the product fails at 30k scale, it fails publicly. This is intentional - we'd rather know immediately than discover it months later.

---

## Phased Launch Sequence

| Phase | Timeline | Goal | Success Gate |
|-------|----------|------|--------------|
| **1. Reddit Mega Tournament** | Weeks 1-4 | Prove scale, build proof | 15k+ active, positive sentiment |
| **2. Creator Outreach** | Weeks 4-6 | Onboard 10-15 creators | 5+ confirmed, tournaments set up |
| **3. Creator Tournaments** | Weeks 7+ | Expand to new audiences | Creators actively running + promoting |

---

## Phase 1: Reddit Mega Tournament

### The Tournament

| Element | Decision |
|---------|----------|
| **Size** | 32,768 players (2^15 = clean bracket, ~30k target) |
| **Format** | Single elimination, one gameweek per round |
| **Duration** | 15 gameweeks (GW1-15 or similar window) |
| **Entry** | Free, requires FPL team ID only |
| **Tiebreaker** | Highest rank in FPL if scores are equal |

### Timing

Launch at the start of the FPL season (GW1) when:
- Engagement is at its peak
- Everyone is optimistic about their team
- 15 gameweeks gives a full tournament arc before January window chaos
- r/FantasyPL traffic is highest

### Subreddit Engagement Strategy

This isn't a marketing post - it's a community event.

1. **Engage first** - Be an active r/FantasyPL member before announcing anything
2. **Mod coordination** - Reach out to mods in advance, get their buy-in (they may want to co-brand it)
3. **Frame as community event** - "The Official r/FantasyPL Knockout" not "Try my new app"
4. **Weekly updates** - Post bracket updates, dramatic eliminations, stats each gameweek
5. **Let drama emerge** - Highlight close matches, upsets, storylines

### Weekly Focus

| Week | Focus |
|------|-------|
| **Week 1** | Launch post. Drive signups. Hit 20k+ target. |
| **Week 2** | Tournament begins (GW1). Post first round results. Build drama. |
| **Week 3** | Round 2. Community engagement. Collect testimonials. |
| **Week 4** | Round 3. Compile proof: signup numbers, engagement, sentiment. |

### Success Criteria

| Metric | Target |
|--------|--------|
| Signups | 20,000+ (can run with 16,384 bracket if needed) |
| Completion rate | Tournament finishes with a winner |
| Subreddit sentiment | Net positive (upvotes > downvotes on posts) |
| Return for updates | >50% open weekly update posts |

**Success gate before Phase 2:**
- 15,000+ active participants
- Net positive Reddit sentiment
- No critical technical failures
- At least 3 organic "this is fun" posts from users

---

## Reddit Launch Day Execution

### Pre-Launch Checklist (T-7 days)

| Task | Owner |
|------|-------|
| Infrastructure load-tested for 30k signups | Dev |
| FPL API caching optimized | Dev |
| Signup flow tested end-to-end | Dev |
| r/FantasyPL rules reviewed (self-promotion policy) | Marketing |
| Mod outreach complete (if pursuing co-branding) | Marketing |
| Launch post drafted and reviewed | Marketing |
| Monitoring dashboards set up | Dev |
| Error alerting configured | Dev |

### Launch Day Timeline

| Time (UK) | Action |
|-----------|--------|
| **7:00 AM** | Final systems check. Confirm FPL API is responding. |
| **8:00 AM** | Post goes live on r/FantasyPL. Prime commuting/morning scroll time. |
| **8:00-12:00** | Active Reddit engagement. Reply to every comment. |
| **12:00 PM** | First checkpoint. Review: signups, errors, sentiment. |
| **6:00 PM** | Second checkpoint. Post evening update comment if momentum is strong. |
| **10:00 PM** | End of day review. Note issues for tomorrow. |
| **Day 2+** | Continue engagement. Post updates as milestones hit (10k, 20k, etc.). |

### Day 1 Success Metrics

| Metric | Good | Great |
|--------|------|-------|
| Signups | 5,000+ | 10,000+ |
| Post upvotes | 200+ | 500+ |
| Comment sentiment | Net positive | Enthusiastic |
| Critical errors | 0 | 0 |
| Time to first "this is great" comment | <1 hour | <15 min |

### Response Playbook

| Situation | Response |
|-----------|----------|
| "Is this legit?" | "Yeah - scores pulled directly from FPL API. Your existing team, no extra work." |
| "What if scores are wrong?" | "Scores come straight from FPL. If FPL says 47, we say 47." |
| "Can I run one for my league?" | "That's coming soon - for now join the big one!" (seed future demand) |
| "This is just like [X]" | "Cool, haven't seen that - how does it compare?" (curious, not defensive) |
| Bug reports | "Thanks for flagging - looking into it now." Then actually fix it. |

---

## Phase 2: Creator Outreach

### Timing

Start outreach in Week 4, once you have 3 weeks of Reddit data to share.

### Target List Criteria

Aim for 15-20 creators. Prioritize:

| Tier | Profile | Why |
|------|---------|-----|
| **Tier 1** (5-7) | Mid-size podcasts (5k-30k listeners) | Engaged audiences, need content weekly |
| **Tier 2** (5-7) | Active FPL Twitter/X (10k-50k followers) | Fast amplification, community-oriented |
| **Tier 3** (3-5) | Discord server admins, Patreon creators | Built-in groups ready to compete |

**Avoid for now:**
- Mega-influencers (100k+) - harder to reach, less personal
- Betting/tips accounts - wrong audience fit
- Inactive accounts (haven't posted in 2+ weeks)

### The Pitch

Short, proof-first, no hard sell:

> Hey [Name] - just ran a 20,000-player knockout tournament on r/FantasyPL. Three weeks in, [X]k still active, loads of drama.
>
> Thinking this could work well for your community. Want early access to run one for [their Discord/Patreon/audience]?
>
> No catch - just looking for feedback from people who actually run FPL communities.

### What We Offer

| Offer | Why It Matters to Them |
|-------|------------------------|
| Early access (before public self-serve) | Exclusivity, insider status |
| Higher participant cap | Can run for full audience |
| Direct support line | Problems fixed fast |
| Feature input | Shape the product for their needs |
| Cross-promotion | We share their tournament to our audience |

### What We Ask

| Ask | Why It Matters to Us |
|-----|----------------------|
| Run a tournament | Proves product works across communities |
| Mention it naturally | Organic > scripted endorsement |
| Share feedback | Learn what creators need |
| (Optional) Quick testimonial | Social proof for next wave |

### Outreach Sequence

| Day | Action |
|-----|--------|
| **Day 1** | Send initial DM (personalized, reference their content) |
| **Day 3** | If no response, light follow-up: "No worries if not - just wanted to flag it" |
| **Day 7** | If still no response, move on. Don't chase. |
| **If interested** | Schedule 15-min call or async walkthrough |

### Onboarding Flow

| Step | Timeline |
|------|----------|
| 1. Give access | Same day they confirm interest |
| 2. Walk through product | Within 48 hours (call or Loom video) |
| 3. They create test tournament | Within 1 week |
| 4. Soft launch to inner circle | Week 2 |
| 5. Public launch | Week 3 (or when ready) |

### Creator Communication

- **Shared Slack/Discord** - All creators in one channel (they'll help each other)
- **Weekly async update** - "Here's what we shipped, here's what's coming"
- **Fast response** - <2 hour reply time during onboarding phase

---

## Phase 3: Creator Tournaments

By the time creators launch, you have:
- Battle-tested product at scale
- Known failure modes and fixes
- Real community response to reference
- Creators who've seen the Reddit success

Their audiences may have already heard about the mega tournament - the product has credibility before creators even mention it.

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Reddit post removed** | Medium | High | Read rules carefully. Consider mod outreach for co-branding. Backup: post in FPL Discord servers instead. |
| **Signups below 10k** | Medium | Medium | Run with 8,192 bracket. Frame as "Season 1" - smaller, exclusive. Learn and scale next time. |
| **Site crashes under load** | Low | Critical | Load test beforehand. Have kill switch to pause signups. Honest status updates buy goodwill. |
| **FPL API goes down** | Low | Critical | Cache aggressively. Delay score updates rather than show wrong data. Communicate timeline. |
| **Negative Reddit sentiment** | Low | Medium | Don't argue. Acknowledge issues. Fix fast. One toxic thread won't kill you if product works. |
| **No creator interest (Phase 2)** | Medium | Low | Reddit tournament is the main event anyway. Creators are amplification, not dependency. |
| **Creator tournament fails** | Low | Medium | Support them heavily. Their failure reflects on you. Offer to help troubleshoot publicly. |

---

## Summary

**The Strategy in One Sentence**

Launch a 30k-player knockout on r/FantasyPL, prove it works, then use that proof to onboard FPL creators who run tournaments for their audiences.

**Key Decisions**

- Reddit first, creators second (proof before pitching)
- One big launch, not gradual rollout
- Accept public failure risk for faster learning
- Creators get early access, not payment

---

## Related

- [vision.md](./vision.md) - Why we're building this
- [business-model.md](./business-model.md) - Customer segments and channels
- [metrics.md](./metrics.md) - How we measure success
- [principles.md](./principles.md) - How we make decisions
