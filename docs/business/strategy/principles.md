# Product Principles

Decision-making rules for Knockout FPL. When facing trade-offs, these guide consistent choices.

---

## 1. Sell the Ride, Build the Engine

**Know what transformation you're selling, then build the minimum to deliver it.**

The "ride" is the feeling: fresh competition, weekly stakes, banter with your community. The "engine" is tournaments, brackets, scoring. Build the engine first (MVP), but always with the ride in mind.

**In practice:**
- MVP is functionality that works
- But design decisions should already serve the emotional payoff
- Marketing, copy, and positioning should sell the ride from day one
- Don't wait until the product is "done" to articulate why it matters

**Examples:**
- ✅ Build working tournaments (engine), but frame it as "something to play for" (ride)
- ✅ Even rough MVP copy should hint at the transformation
- ❌ Don't describe features; describe what they enable
- ❌ Don't wait for polish to think about positioning

---

## 2. Mini-Leagues First, Controls Later

**Build for the core use case. Add flexibility only when users demand it.**

Mini-leagues are the first audience. Build what they need, nothing more. When communities and creators come, add controls then - not before.

**Examples:**
- ✅ One tournament format that works for 8-20 people
- ✅ Default settings that make sense for friends competing
- ❌ Don't build admin controls "just in case"
- ❌ Don't add customization until users ask repeatedly

---

## 3. North Star or No

**If it doesn't improve the North Star Metric, don't build it.**

Every feature must connect to the metric that matters. "Nice to have" isn't a reason. "Users might like it" isn't a reason. Will it measurably move the thing we're measuring?

The North Star Metric is **Page Views** - see [metrics.md](./metrics.md).

**Examples:**
- ✅ Build what increases the NSM
- ❌ Don't add features because competitors have them
- ❌ Don't build for hypothetical users

---

## 4. FPL is Truth, Cache for Debugging

**Trust the FPL API completely. Keep local copies only for debugging.**

We don't dispute FPL scores. We don't build manual overrides. If FPL says 47 points, it's 47 points. Store local copies to debug issues, not to second-guess the source.

**Examples:**
- ✅ Display scores directly from FPL with link to source
- ✅ Cache locally for debugging and performance
- ❌ Never allow manual score entry
- ❌ Don't build "dispute" flows

---

## 5. Responsive Web, Mobile-First

**One web app. Design for phones, ensure it works on desktop.**

Not a native app. A responsive website that feels great on mobile because that's where FPL managers live. Desktop is supported, not prioritized.

**Examples:**
- ✅ Test every feature on mobile first
- ✅ Touch-friendly, thumb-reachable UI
- ❌ Don't build features that only work on desktop
- ❌ Don't build a native app (yet)

---

## 6. Free Now, Paid at Scale

**No monetization until we've proven value. Then charge for volume, not features.**

Stay free to remove friction and enable word-of-mouth growth. When monetization comes, it's for large-scale usage (big tournaments, many participants) - not gating core features behind paywalls.

**Examples:**
- ✅ All core features free for typical mini-league use
- ✅ Charge for 100+ participant tournaments when the time comes
- ❌ Don't paywall features that make the core experience better
- ❌ Don't add ads

---

## 7. Ship Fast for Experiments, Quality for Core

**Experiments can be rough. Core features must be solid.**

When testing a hypothesis, speed beats polish. When building something that's staying, take the time to do it right.

**Examples:**
- ✅ Hack together a prototype to test if users want feature X
- ✅ Polish and test thoroughly before shipping to everyone
- ❌ Don't gold-plate an experiment
- ❌ Don't ship broken core features to "learn"

---

## 8. Delete Instead of Fix

**If it's not worth fixing properly, remove it.**

Bad code, broken features, half-working experiments - delete them. Don't patch, don't work around, don't leave them rotting. Smaller and working beats larger and fragile.

**Examples:**
- ✅ Remove a feature that's causing bugs and low usage
- ✅ Delete dead code rather than commenting it out
- ❌ Don't keep patching something fundamentally broken
- ❌ Don't leave experiments running forever

---

## 9. Listen, Then Decide

**Do what users ask - if it makes sense.**

User feedback matters. But filter it through your own judgment and the North Star. "Users asked for it" isn't automatic justification. "Users asked for it AND it moves the NSM" is.

**Examples:**
- ✅ Build requested features that align with vision
- ✅ Say "no" or "not yet" to requests that don't
- ❌ Don't build every feature request
- ❌ Don't ignore patterns in feedback

---

## Related

- [vision.md](./vision.md) - What we're building toward
- [metrics.md](./metrics.md) - The North Star Metric these principles serve
