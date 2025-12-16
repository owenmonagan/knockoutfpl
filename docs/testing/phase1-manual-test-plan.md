# Phase 1 Demo — Manual Test Plan

> **Purpose:** Verify the Phase 1 knockout demo is working correctly.
>
> **Scope:** Login → Connect FPL → Leagues → Knockout flow with stakes callouts.

---

## Prerequisites

### Start the App

1. Start Firebase emulators:
   ```bash
   npm run emulators
   ```

2. Start the dev server:
   ```bash
   npm run dev
   ```

3. Open `http://localhost:5173` in your browser

### Test Account

| Field | Value |
|-------|-------|
| Email | `testuser@knockoutfpl.com` |
| Password | `TestPass123!` |

### FPL Test Data

| Field | Value |
|-------|-------|
| FPL Team ID | `158256` |

### Browser

- Use Chrome, Firefox, or Safari (latest version)
- Open DevTools Console (F12) to monitor for errors during testing

---

## Test Cases

### Authentication

---

#### TC-01: Login Page Loads

- [ ] **PASS** / **FAIL**

**Steps:**
1. Navigate to `http://localhost:5173/login`
2. Observe the page

**Expected:**
- Login form displays with Email and Password fields
- "Log In" button is visible
- No console errors

**Notes:**


---

#### TC-02: Successful Login with Test Credentials

- [ ] **PASS** / **FAIL**

**Steps:**
1. Navigate to `http://localhost:5173/login`
2. Enter email: `testuser@knockoutfpl.com`
3. Enter password: `TestPass123!`
4. Click "Log In"

**Expected:**
- Login succeeds (no error message)
- User is redirected away from login page
- No console errors

**Notes:**


---

#### TC-03: Redirect to /connect When No FPL Team Linked

- [ ] **PASS** / **FAIL**

**Steps:**
1. Complete TC-02 (login successfully)
2. Observe the URL after login

**Expected:**
- URL changes to `/connect`
- "Connect Your FPL Team" heading is visible

**Notes:**


---

### FPL Connection

---

#### TC-04: Connect Page Displays Correctly

- [ ] **PASS** / **FAIL**

**Steps:**
1. Navigate to `http://localhost:5173/connect` (or arrive via login redirect)
2. Observe the page elements

**Expected:**
- Heading: "Connect Your FPL Team"
- Subtitle: "Let's see what you're made of."
- Input field labeled "FPL Team ID"
- "Where's my Team ID?" link visible
- "Find My Team" button visible
- No console errors

**Notes:**


---

#### TC-05: Help Modal Opens

- [ ] **PASS** / **FAIL**

**Steps:**
1. On the Connect page, click "Where's my Team ID?"
2. Observe the modal that appears

**Expected:**
- Modal opens with title "Finding Your Team ID"
- Shows URL example: `fantasy.premierleague.com/entry/[THIS NUMBER]/event/1`
- Modal can be closed

**Notes:**


---

#### TC-06: Valid Team ID Shows Success Confirmation

- [ ] **PASS** / **FAIL**

**Steps:**
1. On the Connect page, enter FPL Team ID: `158256`
2. Click "Find My Team"
3. Wait for the response

**Expected:**
- Button shows "Finding your team..." while loading
- Success screen appears with:
  - Green checkmark icon
  - Team name displayed
  - Overall rank displayed
  - "Let's go." text
- No console errors

**Notes:**


---

#### TC-07: Auto-Redirect to /leagues After Success

- [ ] **PASS** / **FAIL**

**Steps:**
1. Complete TC-06 (valid team ID success)
2. Wait approximately 1.5 seconds
3. Observe the URL

**Expected:**
- URL automatically changes to `/leagues`
- Leagues page content is visible

**Notes:**


---

### Leagues

---

#### TC-08: Leagues Page Displays User's Mini-Leagues

- [ ] **PASS** / **FAIL**

**Steps:**
1. Navigate to `http://localhost:5173/leagues` (or arrive via redirect)
2. Wait for leagues to load
3. Observe the page

**Expected:**
- Heading: "Your Mini Leagues"
- Subtitle: "Pick one. We'll turn it into sudden death."
- One or more league cards are displayed
- No console errors

**Notes:**


---

#### TC-09: League Cards Show Member Count and Rank

- [ ] **PASS** / **FAIL**

**Steps:**
1. On the Leagues page, examine a league card
2. Look for member count and rank information

**Expected:**
- Each league card shows:
  - League name
  - Member count (e.g., "47 members")
  - User's rank (e.g., "You're ranked #12")
  - "Start Knockout" button

**Notes:**


---

#### TC-10: "Start Knockout" Button Navigates to Knockout View

- [ ] **PASS** / **FAIL**

**Steps:**
1. On the Leagues page, click "Start Knockout" on any league card
2. Observe the URL and page content

**Expected:**
- URL changes to `/knockout/{leagueId}` (some number)
- Knockout page content begins loading
- No console errors

**Notes:**


---

### Knockout View

---

#### TC-11: Knockout Page Shows League Name and "16 REMAIN"

- [ ] **PASS** / **FAIL**

**Steps:**
1. Navigate to a knockout page (via Start Knockout button)
2. Wait for content to load
3. Observe the header and round section

**Expected:**
- League name displayed in header (uppercase)
- Subheader shows team count and gameweek (e.g., "16 teams · GW15 scores")
- Round header shows "16 REMAIN"
- "← Back to Leagues" link is visible
- No console errors

**Notes:**


---

#### TC-12: User's Match Appears at Top with "YOUR MATCH" Label

- [ ] **PASS** / **FAIL**

**Steps:**
1. On the Knockout page, look at the matches under "16 REMAIN"
2. Find the first match displayed

**Expected:**
- First match has "YOUR MATCH" label above it
- Match shows user's team name vs opponent's team name
- Both scores are displayed

**Notes:**


---

#### TC-13: User's Match Has Gold Border

- [ ] **PASS** / **FAIL**

**Steps:**
1. On the Knockout page, observe the "YOUR MATCH" card
2. Compare its border to other match cards

**Expected:**
- User's match card has a visible gold/amber border
- Other match cards do not have this border

**Notes:**


---

#### TC-14: Stakes Callout Displays

- [ ] **PASS** / **FAIL**

**Steps:**
1. On the Knockout page, look at the "YOUR MATCH" card
2. Find the stakes callout text below the scores

**Expected:**
- Stakes callout is visible (starts with ⚡)
- Text matches one of these patterns based on score difference:
  - Winning: "⚡ X points from elimination" or "⚡ Holding on..." or "⚡ Cruising..."
  - Losing: "⚡ X points from survival" or "⚡ X behind..." or "⚡ Danger zone..."
  - Tied: "⚡ Dead heat."

**Notes:**


---

## Test Summary

| Field | Value |
|-------|-------|
| Date Tested | __________ |
| Tester Name | __________ |
| Environment | localhost:5173 / Firebase Emulators |

### Results

| Section | Passed | Failed | Total |
|---------|--------|--------|-------|
| Authentication | /3 | /3 | 3 |
| FPL Connection | /4 | /4 | 4 |
| Leagues | /3 | /3 | 3 |
| Knockout View | /4 | /4 | 4 |
| **TOTAL** | **/14** | **/14** | **14** |

### Overall Result

- [ ] **ALL PASS** — Phase 1 Demo verified working
- [ ] **HAS FAILURES** — See notes in failed test cases

### General Notes

_(Any overall observations, suggestions, or blockers)_


---

*Document created: December 2025*
*"Every gameweek is a cup final."*
