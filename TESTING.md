# Testing Guide - Challenge States

## Overview

This guide explains how to test all challenge states (Preview, Live, Completed) using the Test Data Generator page.

---

## Test Data Generator (`/test-data`)

**Location:** `http://localhost:5173/test-data`

**Purpose:** Create test challenges in different states to verify UI rendering.

### Features

1. **Create Live Challenge** - Creates a challenge with a past deadline (2 days ago), gameweek in progress
   - Status: `accepted`
   - Deadline: 2 days ago
   - Gameweek finished: `false`
   - Expected UI: Shows LIVE badge, DifferentialView component

2. **Create Completed Challenge** - Creates a finished challenge with scores
   - Status: `completed`
   - Deadline: 7 days ago
   - Gameweek finished: `true`
   - Scores: Creator (85) vs Opponent (72)
   - Winner: Creator
   - Expected UI: Shows final scores and winner

---

## Firebase Setup Required

The Test Data Generator writes to Firestore and requires one of the following setups:

### Option 1: Firebase Emulator (Recommended for Development)

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Start emulator
firebase emulators:start

# In another terminal, start dev server
npm run dev

# Navigate to http://localhost:5173/test-data
# Click buttons to create test challenges
```

**Emulator Benefits:**
- No production data impact
- Repeatable test environment
- Fast data reset

### Option 2: Update Firestore Rules (Development Only)

**⚠️ WARNING: Only for local development, never deploy these rules to production!**

Update `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /challenges/{challengeId} {
      // Allow writes for testing (DEVELOPMENT ONLY!)
      allow write: if request.time < timestamp.date(2025, 12, 31);
      allow read: if true;
    }
  }
}
```

### Option 3: Manual Challenge Creation

Directly create test challenges in Firebase Console:

**Live Challenge:**
```javascript
{
  challengeId: "test-live-challenge",
  gameweek: 8,
  status: "accepted",
  creatorUserId: "testUser1",
  creatorFplId: 158256,
  creatorFplTeamName: "Monzaga",
  creatorScore: null,
  opponentUserId: "testUser2",
  opponentFplId: 2780009,
  opponentFplTeamName: "Eyad fc",
  opponentScore: null,
  winnerId: null,
  isDraw: false,
  gameweekDeadline: Timestamp(2 days ago),
  gameweekFinished: false,
  completedAt: null,
  createdAt: Timestamp.now()
}
```

**Completed Challenge:**
```javascript
{
  challengeId: "test-completed-challenge",
  gameweek: 7,
  status: "completed",
  creatorUserId: "testUser1",
  creatorFplId: 158256,
  creatorFplTeamName: "Monzaga",
  creatorScore: 85,
  opponentUserId: "testUser2",
  opponentFplId: 2780009,
  opponentFplTeamName: "Eyad fc",
  opponentScore: 72,
  winnerId: "testUser1",
  isDraw: false,
  gameweekDeadline: Timestamp(7 days ago),
  gameweekFinished: true,
  completedAt: Timestamp.now(),
  createdAt: Timestamp.now()
}
```

Then navigate to:
- Live: `http://localhost:5173/challenge/test-live-challenge`
- Completed: `http://localhost:5173/challenge/test-completed-challenge`

---

## E2E Testing Workflow

### 1. Start Services

```bash
# Terminal 1: Start Firebase Emulator (if using)
firebase emulators:start

# Terminal 2: Start dev server
npm run dev
```

### 2. Create Test Challenges

Navigate to `http://localhost:5173/test-data` and click:
- "Create Live Challenge"
- "Create Completed Challenge"

### 3. Test Each State

After creating challenges, you'll see links to view them. Verify:

**Preview State** (existing challenge):
- ✓ Gradient background (cyan to purple)
- ✓ ⚔️ emoji in title
- ✓ "Gameweek X Showdown" subtitle
- ✓ "⏰ Starting Soon" badge
- ✓ Large countdown timer
- ✓ Team stats with emojis (🎯 📈 🔥 ⚡)
- ✓ Visual separator between teams
- ✓ "Preview Teams" and "Share Challenge" buttons

**Live State**:
- ✓ "🔴 LIVE" badge
- ✓ DifferentialView component showing matchup
- ✓ Player differentials highlighted
- ✓ Common players section
- ✓ Refresh button

**Completed State**:
- ✓ Final scores displayed
- ✓ Winner announced
- ✓ No LIVE badge
- ✓ Clean, simple result display

---

## Playwright MCP E2E Testing

Once challenges are created with Firebase Emulator:

```typescript
// Navigate to test-data page
await browser_navigate('http://localhost:5173/test-data')

// Create live challenge
await browser_click({ element: 'Create Live Challenge', ref: 'e6' })

// Wait for link to appear
await browser_wait_for({ text: 'View Live Challenge' })

// Click link to view
await browser_click({ element: 'View Live Challenge', ref: '...' })

// Verify LIVE badge appears
await browser_snapshot()

// Check for console errors
await browser_console_messages({ onlyErrors: true })
```

---

## Test Data Summary

| Challenge ID | State | URL | Expected UI |
|---|---|---|---|
| tw45uXJ4hMFC05bpNBhw | Preview | `/challenge/tw45uXJ4hMFC05bpNBhw` | Countdown timer, stats preview |
| (Generated) | Live | `/challenge/{id}` | LIVE badge, differential view |
| (Generated) | Completed | `/challenge/{id}` | Scores, winner display |

---

## Troubleshooting

**Error: "Missing or insufficient permissions"**
- Solution: Use Firebase Emulator or update Firestore rules (see above)

**Challenge doesn't show expected state**
- Check deadline is in the past for Live/Completed
- Verify `gameweekFinished` flag matches state
- Check `status` field is correct

**DifferentialView shows "Loading..."**
- FPL API might be rate limiting
- Check network tab for API errors
- Verify FPL IDs are valid (158256, 2780009)

---

## Quick Reference

**Preview State Logic:**
```typescript
status === 'accepted' && now < deadline
```

**Live State Logic:**
```typescript
status === 'accepted' && now >= deadline && !gameweekFinished
```

**Completed State Logic:**
```typescript
status === 'completed' && gameweekFinished
```
