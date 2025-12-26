# Onboarding Journey

> **Status:** DRAFT - needs flow diagrams and validation
> **Last Updated:** December 2025

---

## Overview

How a new user goes from discovering Knockout FPL to being ready to create or join tournaments.

```
Landing Page → Sign Up → Connect FPL Team → Dashboard (ready to play)
```

---

## Entry Points (DRAFT)

<!-- TODO: Prioritize and track these -->

**How users discover us:**

| Channel | Expected Behavior |
|---------|-------------------|
| Direct link from friend | Land on specific tournament → prompt to sign up |
| Search engine | Land on homepage |
| Social media | Land on homepage |
| FPL community link | Land on homepage |

---

## Step 1: Landing Page (DRAFT)

<!-- TODO: Verify this matches LandingPage.tsx -->

**URL:** `/`

**What user sees:**
- Hero: Clear value proposition
- Call to action: "Get Started" or "Sign Up"
- Brief feature overview

**User actions:**
- Click "Sign Up" → Go to signup page
- Click "Log In" → Go to login page

**Success state:** User understands what we do and clicks CTA

---

## Step 2: Sign Up (DRAFT)

<!-- TODO: Verify this matches SignUpPage.tsx -->

**URL:** `/signup`

**What user sees:**
- Email input
- Password input (with confirmation)
- Display name input
- Submit button
- Link to login (for existing users)

**Validation:**
- Email: Valid format required
- Password: Minimum 8 characters
- Display name: Required

**User actions:**
- Fill form → Submit → Account created
- Click "Log In" → Go to login page

**Error states:**
- Email already exists → Show error, link to login
- Weak password → Show requirements
- Network error → Show retry message

**Success state:** Account created, user authenticated, redirect to connect page

---

## Step 3: Connect FPL Team (DRAFT)

<!-- TODO: Verify this matches ConnectPage.tsx -->

**URL:** `/connect`

**What user sees:**
- Explanation of why we need FPL Team ID
- Input for FPL Team ID
- Link to "How to find your Team ID"
- Submit button

**Validation:**
- Team ID: Must be numeric
- Team ID: Must exist in FPL API

**User actions:**
- Enter Team ID → Submit → Validate with FPL → Save
- Click help link → Show instructions

**Error states:**
- Invalid Team ID format → Show error
- Team ID not found in FPL → Show error, suggest checking ID
- FPL API error → Show retry message

**Success state:** Team connected, user profile updated, redirect to dashboard

---

## Step 4: Dashboard (DRAFT)

<!-- TODO: Verify this matches DashboardPage.tsx -->

**URL:** `/dashboard`

**What user sees (first time):**
- Welcome message
- Connected FPL team info
- "View My Leagues" button
- Empty tournament list (or prompt to create first tournament)

**User actions:**
- View leagues → Go to leagues page
- Create tournament → Go to league selection

**Success state:** User understands next steps and is ready to engage

---

## Drop-off Risks (DRAFT)

<!-- TODO: Add analytics/tracking for these -->

| Point | Risk | Mitigation |
|-------|------|------------|
| Landing page | Value unclear | Clear headline, social proof |
| Sign up form | Too many fields | Minimal fields, inline validation |
| FPL connection | Don't know Team ID | Clear instructions, link to FPL |
| FPL connection | Team ID doesn't work | Helpful error messages |
| Dashboard | Don't know what to do | Clear CTAs, empty state guidance |

---

## Returning User Flow (DRAFT)

<!-- TODO: Document returning user experience -->

**URL:** `/login`

1. User enters email/password
2. Authentication
3. Redirect to dashboard
4. Dashboard shows their tournaments

---

## Related

- [tournament-creation.md](./tournament-creation.md) - Next step after onboarding
- [../specs/functional-spec.md](../specs/functional-spec.md) - Validation rules
- [../../technical/architecture.md](../../technical/architecture.md) - Auth system details
