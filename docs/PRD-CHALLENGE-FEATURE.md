# Product Requirements Document: Challenge Feature

**Version:** 1.0
**Date:** October 13, 2025
**Status:** Draft
**Owner:** Product Team

---

## 1. Executive Summary

### Vision
Enable FPL managers to challenge each other to head-to-head matches for any gameweek, creating an engaging competitive experience independent of traditional league standings.

### Problem
FPL players want to compete directly against friends, but the current league system is:
- Season-long commitment (hard to recover from bad start)
- No direct head-to-head stakes
- Limited engagement week-to-week

### Solution
A challenge system where any two FPL managers can compete for a single gameweek, with instant winner determination based on FPL points scored.

### Success Criteria
- **Engagement:** 70%+ of users create at least one challenge per month
- **Viral Growth:** 40%+ of new users arrive via challenge links
- **Retention:** 60%+ of users return each gameweek to check challenge results
- **Technical:** <2s page load, 99.9% uptime, 0 critical bugs

---

## 2. User Stories

### Primary User: Challenge Creator
> "As an FPL manager, I want to challenge my friend to a head-to-head match for this gameweek, so we can compete directly and have bragging rights."

**Acceptance Criteria:**
- I can create a challenge for any future gameweek
- I receive a shareable link immediately
- I can see the challenge in my dashboard as "Pending"
- I'm notified when opponent accepts (future: email/push)
- I see the result automatically after gameweek ends

### Secondary User: Challenge Opponent
> "As someone who received a challenge link, I want to accept the challenge and compete, even if I don't have an account yet."

**Acceptance Criteria:**
- I can view challenge details without logging in
- I can sign up/login via the challenge link flow
- I can connect my FPL team if needed
- I can accept the challenge with one click
- I see confirmation and am redirected to dashboard

### Tertiary User: Observer
> "As either participant, I want to see the detailed results of our challenge, including final scores and who won."

**Acceptance Criteria:**
- I see final scores immediately after gameweek ends
- I see who won (or if it was a draw)
- I can view my overall challenge record (wins/losses/draws)
- I can access past challenges for reference

---

## 3. User Flows

### 3.1 Create Challenge Flow

```
[Dashboard] → [Create Challenge Button]
    ↓
[Create Challenge Page]
    - Select Gameweek (dropdown: current to GW38)
    - Shows gameweek deadline
    - [Create Challenge] button
    ↓
[Challenge Created]
    - Shows challenge details
    - Shareable link with copy button
    - Share buttons (WhatsApp, Twitter, Email)
    - [Back to Dashboard] button
```

**Validation:**
- ✅ User must have FPL team connected
- ✅ Gameweek must not have started (deadline not passed)
- ✅ Gameweek must be valid (1-38)

### 3.2 Accept Challenge Flow (New User)

```
[Receives Link] → [Clicks Link]
    ↓
[Challenge Detail Page - Public View]
    - Shows creator info (name, team, gameweek)
    - Shows deadline
    - [Accept Challenge] button (requires login)
    ↓
[Redirects to Signup] → [User Signs Up]
    ↓
[Redirects to Profile] → [Connects FPL Team]
    ↓
[Redirects back to Challenge]
    ↓
[Accept Challenge] → [Challenge Accepted]
    ↓
[Dashboard with success message]
```

### 3.3 Accept Challenge Flow (Existing User)

```
[Receives Link] → [Clicks Link]
    ↓
[Challenge Detail Page]
    - Shows creator info
    - Shows deadline
    - [Accept Challenge] button
    ↓
[Clicks Accept]
    ↓
[Challenge Accepted - Confirmation]
    ↓
[Dashboard with success message]
```

### 3.4 View Results Flow

```
[Gameweek Ends] → [Cloud Function Runs]
    ↓
[Fetches Scores from FPL API]
    ↓
[Updates Challenge with Results]
    ↓
[User Visits Dashboard]
    ↓
[Sees Challenge in "Completed" Section]
    - Shows final scores
    - Shows winner badge or "Draw"
    - [View Details] for breakdown (future)
```

---

## 4. Functional Requirements

### 4.1 Challenge Creation (Priority: P0 - MVP)

**FR-1.1:** User can create challenge for any valid gameweek
- **Input:** Gameweek number (1-38)
- **Validation:**
  - User has FPL team connected
  - Gameweek deadline has not passed
  - User is authenticated
- **Output:** Challenge ID, shareable URL

**FR-1.2:** System generates unique shareable URL
- **Format:** `https://knockoutfpl.com/challenge/{challengeId}`
- **ID:** Firestore auto-generated ID (20 characters)
- **Requirement:** URL must be copy-able and shareable via any channel

**FR-1.3:** Challenge is created in "pending" state
- **Data stored:**
  - Creator user ID
  - Creator FPL team ID
  - Creator FPL team name (snapshot at creation)
  - Gameweek number
  - Gameweek deadline (from FPL API)
  - Status: "pending"
  - All opponent fields: null
  - All score fields: null
  - Created timestamp

### 4.2 Challenge Discovery & Viewing (Priority: P0 - MVP)

**FR-2.1:** Anyone can view challenge details via URL (no auth required)
- **Shows:**
  - Creator name and team name
  - Gameweek number and deadline
  - Status (Pending/Accepted/Active/Completed)
  - Accept button (if pending and viewer is not creator)

**FR-2.2:** User can view all their challenges on dashboard
- **Sections:**
  - Pending Challenges (created by me, no opponent yet)
  - Active Challenges (accepted, gameweek in progress)
  - Completed Challenges (gameweek finished, results available)
- **Sorting:** Most recent first (by created date)

**FR-2.3:** Challenge cards show key information at a glance
- **Pending:** Gameweek, deadline, share button
- **Active:** Gameweek, opponent name, countdown to deadline
- **Completed:** Gameweek, opponent name, scores, winner/loser badge

### 4.3 Challenge Acceptance (Priority: P0 - MVP)

**FR-3.1:** Opponent can accept challenge if conditions met
- **Conditions:**
  - User is authenticated
  - User has FPL team connected
  - Gameweek deadline has not passed
  - User is not the creator
  - Challenge status is "pending"
- **Action:** Update challenge with opponent details

**FR-3.2:** Accept flow handles unauthenticated users
- **Redirect:** `/challenge/{id}` → `/signup?returnUrl=/challenge/{id}`
- **After signup:** Redirect to profile to connect FPL team
- **After FPL connect:** Redirect back to challenge to accept

**FR-3.3:** Challenge transitions to "accepted" state
- **Updates:**
  - Opponent user ID
  - Opponent FPL team ID
  - Opponent FPL team name (snapshot at acceptance)
  - Status: "accepted"
  - Updated timestamp

**FR-3.4:** Creator is notified of acceptance (Future: email/push)
- **MVP:** See status change on dashboard
- **Future:** Email notification, push notification

### 4.4 Automated Scoring (Priority: P0 - MVP)

**FR-4.1:** Cloud Function runs every 2 hours to check for completable challenges
- **Query:** Find challenges where:
  - Status is "accepted"
  - Gameweek is marked as finished (from FPL API)
  - `completedAt` is null (not already processed)

**FR-4.2:** Function fetches final scores from FPL API
- **Endpoint:** `/api/entry/{teamId}/event/{gameweek}/picks/`
- **Data needed:** `entry_history.points`
- **Fetch:** Both creator and opponent scores

**FR-4.3:** Function determines winner
- **Logic:**
  - If creator score > opponent score: Winner is creator
  - If opponent score > creator score: Winner is opponent
  - If scores are equal: It's a draw
- **Updates:**
  - `creatorScore`
  - `opponentScore`
  - `winnerId` (or null if draw)
  - `isDraw` (boolean)
  - `completedAt` timestamp
  - `status`: "completed"

**FR-4.4:** Function updates user win/loss records
- **Winner:** Increment `wins` counter
- **Loser:** Increment `losses` counter
- **Draw:** Increment neither (or add `draws` field future)

**FR-4.5:** Function handles errors gracefully
- **API failures:** Retry up to 3 times with exponential backoff
- **Invalid team IDs:** Mark challenge as error state
- **Partial failures:** Log error, continue to next challenge

### 4.5 Challenge Statistics (Priority: P0 - MVP)

**FR-5.1:** User dashboard shows aggregate stats
- **Metrics:**
  - Total Challenges
  - Wins
  - Losses
  - Win Rate (wins / total completed * 100)
- **Calculation:** Real-time from challenges collection OR cached in user document

**FR-5.2:** Challenge history is viewable
- **Filter:** All / Won / Lost / Draws
- **Sort:** Most recent first
- **Pagination:** Load more (future: infinite scroll)

### 4.6 Data Consistency & Validation (Priority: P0 - MVP)

**FR-6.1:** Challenge creation validates gameweek
- **Must:** Fetch current gameweek from FPL API
- **Check:** Selected gameweek >= current gameweek
- **Check:** Deadline has not passed

**FR-6.2:** Challenge acceptance validates timing
- **Check:** Current time < gameweek deadline
- **Action:** If deadline passed, show "Challenge Expired" message

**FR-6.3:** System prevents duplicate processing
- **Check:** `completedAt` timestamp before fetching scores
- **Ensures:** Each challenge scored exactly once

**FR-6.4:** FPL team connection validates team exists
- **Action:** Fetch team info from FPL API
- **Error:** Show "Invalid Team ID" if API returns 404

---

## 5. Non-Functional Requirements

### 5.1 Performance

**NFR-1.1:** Page load time
- **Target:** <2 seconds for challenge detail page
- **Target:** <1 second for dashboard (with cached data)

**NFR-1.2:** API response time
- **Target:** <500ms for challenge creation
- **Target:** <500ms for challenge acceptance
- **Target:** <1s for dashboard data fetch

**NFR-1.3:** Scheduled function execution
- **Target:** Process all pending challenges within 15 minutes of gameweek completion
- **SLA:** 99.9% of challenges scored within 6 hours of gameweek end

### 5.2 Scalability

**NFR-2.1:** Handle concurrent challenge creation
- **Target:** Support 100 challenges created per minute
- **Firestore:** Adequate (writes scale automatically)

**NFR-2.2:** Handle viral growth from shared links
- **Target:** Support 1000 concurrent anonymous viewers
- **Strategy:** Static hosting scales, Firestore reads scale

### 5.3 Security

**NFR-3.1:** Firestore security rules enforce access control
- **Read:** User can read challenges where they are creator OR opponent
- **Write:** User can only create challenges (as creator)
- **Accept:** User can only update challenge by adding themselves as opponent
- **Scores:** Only Cloud Functions can update scores

**NFR-3.2:** FPL team IDs are validated before storage
- **Check:** API call to verify team exists
- **Prevents:** Invalid data entry

**NFR-3.3:** Authentication required for all mutations
- **Create:** Must be logged in
- **Accept:** Must be logged in

### 5.4 Reliability

**NFR-4.1:** Idempotent operations
- **Challenge creation:** Duplicate submissions don't create multiple challenges (debounce UI)
- **Score fetching:** Safe to retry without double-counting

**NFR-4.2:** Graceful degradation
- **FPL API down:** Show cached data, display error message
- **Firestore down:** Show error page with retry button

**NFR-4.3:** Error logging and monitoring
- **Log:** All Cloud Function errors
- **Alert:** If score fetching fails >10% of the time
- **Dashboard:** Monitor challenge completion rate

### 5.5 Usability

**NFR-5.1:** Mobile-first responsive design
- **Target:** Works perfectly on screens 320px+ wide
- **Touch:** All interactive elements ≥44px tap target

**NFR-5.2:** Accessibility
- **WCAG:** AA compliance
- **Keyboard:** Full keyboard navigation support
- **Screen readers:** Proper ARIA labels

**NFR-5.3:** Loading states
- **All async:** Show skeleton loaders or spinners
- **Timeouts:** 30 seconds max, then show error

---

## 6. Data Model

### 6.1 Challenge Document (`/challenges/{challengeId}`)

```typescript
interface Challenge {
  // Identity
  challengeId: string;              // Firestore document ID

  // Gameweek Info
  gameweek: number;                 // 1-38
  gameweekDeadline: Timestamp;      // When GW locks (from FPL API)
  gameweekFinished: boolean;        // From FPL API (bootstrap-static)

  // Status
  status: 'pending' | 'accepted' | 'active' | 'completed';

  // Creator
  creatorUserId: string;            // Firebase Auth UID
  creatorFplId: number;             // e.g., 158256
  creatorFplTeamName: string;       // Snapshot at creation
  creatorScore: number | null;      // Populated after GW ends

  // Opponent
  opponentUserId: string | null;    // null until accepted
  opponentFplId: number | null;     // null until accepted
  opponentFplTeamName: string | null; // Snapshot at acceptance
  opponentScore: number | null;     // Populated after GW ends

  // Results
  winnerId: string | null;          // userId of winner, null if draw
  isDraw: boolean;                  // true if scores equal

  // Timestamps
  createdAt: Timestamp;             // When challenge was created
  completedAt: Timestamp | null;    // When scores were fetched
}
```

**Indexes:**
- `creatorUserId` + `status` (for user's challenges)
- `opponentUserId` + `status` (for user's challenges)
- `status` + `gameweekFinished` + `completedAt` (for scheduled function)

### 6.2 User Document Updates

```typescript
interface User {
  // ... existing fields ...

  // Challenge Stats (added)
  wins: number;                     // Total wins
  losses: number;                   // Total losses
  // draws: number;                 // Future: separate draws counter
}
```

---

## 7. API Requirements

### 7.1 FPL API Endpoints Used

**Get Current Gameweek:**
```
GET https://fantasy.premierleague.com/api/bootstrap-static/
Response: { events: [{ id, is_current, deadline_time, finished }] }
```

**Get Team Info (for validation):**
```
GET https://fantasy.premierleague.com/api/entry/{teamId}/
Response: { id, name, player_first_name, player_last_name }
```

**Get Gameweek Score:**
```
GET https://fantasy.premierleague.com/api/entry/{teamId}/event/{gameweek}/picks/
Response: { entry_history: { event, points, total_points } }
```

### 7.2 Cloud Functions

**Function: `getFPLTeamInfo`**
- **Type:** HTTPS Callable
- **Purpose:** Proxy FPL API to avoid CORS
- **Input:** `{ teamId: number }`
- **Output:** `{ teamId, teamName, managerName }`
- **Error:** Throw if team not found

**Function: `getCurrentGameweek`**
- **Type:** HTTPS Callable
- **Purpose:** Get current/next gameweek info
- **Input:** None
- **Output:** `{ gameweek: number, deadline: Date, finished: boolean }`

**Function: `getFPLGameweekScore`**
- **Type:** HTTPS Callable
- **Purpose:** Get team's score for specific gameweek
- **Input:** `{ teamId: number, gameweek: number }`
- **Output:** `{ gameweek: number, points: number }`
- **Error:** Throw if gameweek not finished

**Function: `updateCompletedGameweeks` (Scheduled)**
- **Type:** Pub/Sub Scheduled (every 2 hours)
- **Purpose:** Fetch scores and update completed challenges
- **Logic:**
  1. Query challenges: `status='accepted' AND gameweekFinished=true AND completedAt=null`
  2. For each challenge:
     - Fetch creator score
     - Fetch opponent score
     - Determine winner
     - Update challenge document
     - Update user win/loss records
  3. Log results and errors

---

## 8. UI/UX Requirements

### 8.1 Create Challenge Page (`/create`)

**Layout:**
```
┌──────────────────────────────────┐
│ Create Challenge                 │
├──────────────────────────────────┤
│                                  │
│ Select Gameweek:                 │
│ [Dropdown: GW8, GW9, ..., GW38]  │
│                                  │
│ Deadline: Sat Oct 21, 11:30 AM  │
│                                  │
│ [Create Challenge Button]        │
│                                  │
└──────────────────────────────────┘
```

**Validation:**
- Dropdown only shows valid gameweeks (current → GW38)
- Show deadline for selected gameweek
- Disable button if no FPL team connected

### 8.2 Challenge Detail Page (`/challenge/{id}`)

**Layout (Pending - Public View):**
```
┌──────────────────────────────────┐
│ Challenge for Gameweek 8         │
├──────────────────────────────────┤
│ 🏆 Owen's Team challenges you!   │
│                                  │
│ Gameweek: 8                      │
│ Deadline: Sat Oct 21, 11:30 AM  │
│                                  │
│ [Accept Challenge Button]        │
│ (Requires login)                 │
└──────────────────────────────────┘
```

**Layout (Completed):**
```
┌──────────────────────────────────┐
│ Challenge for Gameweek 8         │
│ Status: Completed                │
├──────────────────────────────────┤
│ Owen's Team: 78 points  🏆       │
│ John's Team: 76 points           │
│                                  │
│ Winner: Owen's Team              │
└──────────────────────────────────┘
```

### 8.3 Dashboard Challenge Sections

**Pending Challenges Card:**
```
┌──────────────────────────────────┐
│ Gameweek 8                       │
│ Waiting for opponent...          │
│ Deadline: 2 days left            │
│ [Share Link] [Copy Link]         │
└──────────────────────────────────┘
```

**Active Challenges Card:**
```
┌──────────────────────────────────┐
│ Gameweek 8 vs John's Team        │
│ In Progress                      │
│ Deadline passed - Await results  │
└──────────────────────────────────┘
```

**Completed Challenges Card:**
```
┌──────────────────────────────────┐
│ Gameweek 7 vs John's Team        │
│ You: 78 • Opponent: 76  🏆 Won   │
└──────────────────────────────────┘
```

---

## 9. Edge Cases & Error Handling

### 9.1 Challenge Creation Errors

**Edge Case:** User tries to create challenge without FPL team
- **Handling:** Disable create button, show "Connect FPL Team" prompt

**Edge Case:** User selects past gameweek (deadline passed)
- **Handling:** Gameweek selector only shows valid options

**Edge Case:** FPL API is down
- **Handling:** Show error message: "Unable to fetch gameweek info. Try again later."

### 9.2 Challenge Acceptance Errors

**Edge Case:** Deadline passes while user is on accept page
- **Handling:** Accept button becomes disabled, show "Challenge expired" message

**Edge Case:** Creator tries to accept their own challenge
- **Handling:** Don't show accept button for creator

**Edge Case:** Challenge already accepted by someone else
- **Handling:** Show "Challenge no longer available" message

**Edge Case:** User tries to accept without FPL team
- **Handling:** Redirect to profile, prompt to connect team

### 9.3 Scoring Errors

**Edge Case:** FPL API returns 404 for team (deleted account)
- **Handling:** Mark challenge as error state, show "Unable to fetch score" on dashboard

**Edge Case:** Cloud Function times out
- **Handling:** Retry on next scheduled run (idempotent)

**Edge Case:** User changes their FPL team ID after accepting challenge
- **Handling:** Challenge uses snapshot of FPL team ID at accept time (correct behavior)

**Edge Case:** Both teams score 0 points (didn't play gameweek)
- **Handling:** Mark as draw (isDraw: true)

### 9.4 Data Consistency Errors

**Edge Case:** Challenge document partially updated (e.g., scores but no winner)
- **Handling:** Firestore transactions ensure atomic updates

**Edge Case:** User record out of sync with actual wins/losses
- **Handling:** For MVP, trust user document. Future: Add reconciliation job.

---

## 10. Success Metrics & Analytics

### 10.1 Key Metrics

**Engagement:**
- Challenges created per week
- Challenges accepted per week
- Acceptance rate (accepted / created)
- Average challenges per user per gameweek

**Growth:**
- New users from challenge links (track referral param)
- Viral coefficient (new users per existing user)

**Retention:**
- Weekly active users
- % users who return to check results
- % users who create repeat challenges

**Quality:**
- Challenge completion rate (completed / accepted)
- Error rate (challenges with scoring errors)
- API uptime (FPL API availability)

### 10.2 Analytics Events to Track

**Challenge Created:**
```json
{
  "event": "challenge_created",
  "gameweek": 8,
  "userId": "user-123",
  "timestamp": "2025-10-13T14:30:00Z"
}
```

**Challenge Accepted:**
```json
{
  "event": "challenge_accepted",
  "challengeId": "abc123",
  "gameweek": 8,
  "userId": "user-456",
  "creatorId": "user-123",
  "timeToAccept": 3600 // seconds
}
```

**Challenge Viewed (anonymous):**
```json
{
  "event": "challenge_viewed",
  "challengeId": "abc123",
  "referrer": "whatsapp",
  "authenticated": false
}
```

**Challenge Completed:**
```json
{
  "event": "challenge_completed",
  "challengeId": "abc123",
  "gameweek": 8,
  "winnerId": "user-123",
  "creatorScore": 78,
  "opponentScore": 76,
  "isDraw": false
}
```

---

## 11. Out of Scope (MVP)

The following features are **NOT** included in the MVP but may be added later:

### 11.1 Deferred to Post-MVP

**Notifications:**
- Email notifications when challenge accepted
- Push notifications for gameweek results
- Reminders before deadline

**Social Features:**
- Comments on challenges
- Trash talk / banter
- Share results on social media

**Enhanced Scoring:**
- Player-by-player breakdown showing who scored what
- Captain vs. captain sub-battles
- Bench points comparison

**Challenge Management:**
- Cancel pending challenges
- Rematch button (auto-create return challenge)
- Challenge history filtering and search

**Advanced Features:**
- Multi-gameweek tournaments
- Group challenges (3+ people)
- Betting/stakes system
- Private challenges (invite-only, not public link)

**Gamification:**
- Badges and achievements
- Leaderboards (most wins, best win rate, etc.)
- Streak tracking (consecutive wins)

**Performance:**
- Real-time updates (WebSocket / Firebase listeners)
- Optimistic UI updates
- Offline support

---

## 12. Future Considerations

### 12.1 Phase 2 Features (Post-MVP)

**Priority: High**
- Email notifications system
- Manual "Refresh Scores" button for impatient users
- Challenge cancellation (for pending challenges)
- Draws counter in user stats

**Priority: Medium**
- Player breakdown view (which players scored for each team)
- Share result on social media (pre-filled tweet)
- Challenge history filtering (by opponent, by gameweek, by result)

**Priority: Low**
- Private challenges (password-protected or invite-only)
- Challenge templates (quickly create challenge vs same opponent)
- Challenge notes / comments

### 12.2 Technical Debt to Address

**After MVP:**
- Add comprehensive error logging and monitoring
- Implement retry logic for failed Cloud Functions
- Add database backups and disaster recovery
- Optimize Firestore queries with composite indexes
- Add rate limiting for challenge creation
- Implement caching layer for FPL API calls

### 12.3 Scalability Considerations

**If we reach 10K+ users:**
- Move to dedicated FPL API proxy service
- Implement read replicas for Firestore
- Add CDN for static assets
- Consider moving to Firestore bundles for offline support

**If we reach 100K+ users:**
- Implement sharding strategy for challenges collection
- Use Firestore collectionGroup queries for cross-shard queries
- Consider BigQuery for analytics
- Add caching layer (Redis) for frequently accessed data

---

## 13. Open Questions

1. **Should we store FPL team name as a snapshot or always fetch fresh?**
   - **Decision:** Snapshot at creation/acceptance time (prevents issues if user changes team name)

2. **How do we handle users who delete their FPL account mid-challenge?**
   - **Decision:** Mark challenge as error state, show message to both users

3. **Should draws affect win rate calculation?**
   - **Decision:** Yes. Win Rate = Wins / (Wins + Losses + Draws)

4. **Can a user create multiple challenges for the same gameweek?**
   - **Decision:** Yes, no limit for MVP

5. **What happens if gameweek deadline changes after challenge is created?**
   - **Decision:** We store deadline snapshot at creation. If FPL changes deadline, our snapshot is out of date. Future: Add warning if deadlines don't match.

6. **Should we allow challenges for the current gameweek (if deadline hasn't passed)?**
   - **Decision:** Yes, as long as deadline hasn't passed yet

7. **How long should challenge links remain valid?**
   - **Decision:** Forever for MVP. Future: Add expiration (e.g., 7 days after gameweek ends)

---

## 14. Appendix

### A. Glossary

- **Challenge:** A head-to-head competition between two FPL managers for a specific gameweek
- **Creator:** The user who creates the challenge
- **Opponent:** The user who accepts the challenge
- **Gameweek (GW):** One round of FPL play (38 gameweeks per season)
- **Deadline:** The time when a gameweek locks and no more team changes are allowed
- **FPL Team ID:** Unique identifier for an FPL team (e.g., 158256)
- **Shareable Link:** URL that allows anyone to view and accept a challenge

### B. Related Documents

- [CLAUDE.md](../CLAUDE.md) - Development guide
- [PRODUCT.md](../PRODUCT.md) - Product vision and roadmap
- [Database Schema](../CLAUDE.md#database-schema-firestore) - Firestore collections

### C. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Oct 13, 2025 | Product Team | Initial PRD created |

