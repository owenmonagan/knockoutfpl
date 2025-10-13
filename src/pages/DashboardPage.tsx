/**
 * DashboardPage - User's main hub after login
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * LAYOUT HIERARCHY
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ 1. PAGE HEADER                                                          │
 * │    - Welcome message with user display name                            │
 * │    - Logout button (optional, may move to nav)                         │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ 2. FPL CONNECTION CARD ⭐ PRIMARY ONBOARDING STEP                       │
 * │                                                                         │
 * │    STATE A: NOT CONNECTED (fplTeamId === 0)                            │
 * │    ┌─────────────────────────────────────────────────────────────────┐ │
 * │    │ 🏆 Connect Your FPL Team                                        │ │
 * │    │                                                                 │ │
 * │    │ "Link your FPL team to start creating challenges"             │ │
 * │    │                                                                 │ │
 * │    │ [Team ID Input Field] [Connect Button]                        │ │
 * │    │                                                                 │ │
 * │    │ "Find your Team ID at fantasy.premierleague.com"              │ │
 * │    └─────────────────────────────────────────────────────────────────┘ │
 * │                                                                         │
 * │    STATE B: CONNECTED (fplTeamId > 0)                                  │
 * │    ┌─────────────────────────────────────────────────────────────────┐ │
 * │    │ 🏆 Your FPL Team                                   [Edit Button]│ │
 * │    │                                                                 │ │
 * │    │ Team Name: "Monzaga"                                           │ │
 * │    │ GW Points: 78 | GW Rank: 1,656,624                            │ │
 * │    │ Overall: 427 pts | Overall Rank: 841,192                      │ │
 * │    │ Team Value: £102.0m                                            │ │
 * │    └─────────────────────────────────────────────────────────────────┘ │
 * │                                                                         │
 * │    STATE C: EDITING (user clicked Edit)                                │
 * │    - Shows input field with current team ID                            │
 * │    - Update button replaces Edit button                               │
 * │    - Cancel button to exit edit mode                                  │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ 3. CHALLENGE STATS SECTION (4 stat cards in responsive grid)           │
 * │    ┌──────────┬──────────┬──────────┬──────────┐                       │
 * │    │  Total   │   Wins   │  Losses  │ Win Rate │                       │
 * │    │    0     │     0    │     0    │   N/A    │                       │
 * │    └──────────┴──────────┴──────────┴──────────┘                       │
 * │                                                                         │
 * │    Stats calculated from challenges:                                   │
 * │    - Total: Count of all challenges                                    │
 * │    - Wins: challenges where current user is winnerId                   │
 * │    - Losses: completed challenges where user is not winner             │
 * │    - Win Rate: (wins / (wins + losses)) * 100, or "N/A" if no games   │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ 4. UPCOMING CHALLENGES SECTION                                          │
 * │    Header: "Upcoming Challenges (0)"                                   │
 * │                                                                         │
 * │    EMPTY STATE (initially):                                            │
 * │    ┌─────────────────────────────────────────────────────────────────┐ │
 * │    │ 📋 No Upcoming Challenges                                       │ │
 * │    │                                                                 │ │
 * │    │ "Create your first challenge to compete with other managers"  │ │
 * │    │                                                                 │ │
 * │    │ [Create Challenge Button]                                      │ │
 * │    └─────────────────────────────────────────────────────────────────┘ │
 * │                                                                         │
 * │    WITH DATA (Phase 3+):                                               │
 * │    Grid of ChallengeCard components showing:                           │
 * │    - Badge: "Pending"                                                  │
 * │    - Gameweek number                                                   │
 * │    - "Waiting for opponent..."                                         │
 * │    - Share button                                                      │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ 5. ACTIVE CHALLENGES SECTION                                            │
 * │    Header: "Active Challenges (0)"                                     │
 * │                                                                         │
 * │    EMPTY STATE (initially):                                            │
 * │    ┌─────────────────────────────────────────────────────────────────┐ │
 * │    │ ⚡ No Active Challenges                                          │ │
 * │    │                                                                 │ │
 * │    │ "Active challenges will appear here once accepted"             │ │
 * │    └─────────────────────────────────────────────────────────────────┘ │
 * │                                                                         │
 * │    WITH DATA (Phase 3+):                                               │
 * │    Grid of ChallengeCard components showing:                           │
 * │    - Badge: "Active"                                                   │
 * │    - Opponent name                                                     │
 * │    - Gameweek number                                                   │
 * │    - Deadline countdown (optional)                                     │
 * │    - View details button                                               │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ 6. COMPLETED CHALLENGES SECTION                                         │
 * │    Header: "Completed Challenges (0)"                                  │
 * │                                                                         │
 * │    EMPTY STATE (initially):                                            │
 * │    ┌─────────────────────────────────────────────────────────────────┐ │
 * │    │ 🏁 No Completed Challenges                                      │ │
 * │    │                                                                 │ │
 * │    │ "Your challenge history will appear here"                      │ │
 * │    └─────────────────────────────────────────────────────────────────┘ │
 * │                                                                         │
 * │    WITH DATA (Phase 3+):                                               │
 * │    Grid of ChallengeCard components showing:                           │
 * │    - Badge: "Won" (green) or "Lost" (red) or "Draw" (gray)            │
 * │    - Opponent name                                                     │
 * │    - Gameweek number                                                   │
 * │    - Final scores (e.g., "78 - 76")                                   │
 * │    - View details button                                               │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DATA FLOW & STATE MANAGEMENT
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ON COMPONENT MOUNT:
 * 1. Get current authenticated user (from auth context/hook)
 * 2. Fetch user profile from Firestore: getUserProfile(userId)
 * 3. If user.fplTeamId > 0:
 *    - Fetch live FPL data: GET /api/entry/{fplTeamId}/
 *    - Extract: name, summary_overall_points, summary_overall_rank,
 *               summary_event_points, summary_event_rank, value
 * 4. Fetch challenges (Phase 3):
 *    - Query where creatorUserId === userId OR opponentUserId === userId
 *    - Separate into upcoming/active/completed based on status
 *
 * STATE TO MANAGE:
 * - user: User | null (from Firestore)
 * - fplData: FPLTeamData | null (from FPL API)
 * - challenges: Challenge[] (from Firestore, Phase 3)
 * - isLoading: boolean
 * - error: string | null
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * COMPONENTS TO BUILD (Priority Order)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 1. FPLConnectionCard
 *    Props:
 *    - user: User | null
 *    - fplData: FPLTeamData | null
 *    - isLoading: boolean
 *    - onConnect: (teamId: number) => Promise<void>
 *    - onUpdate: (teamId: number) => Promise<void>
 *
 *    Responsibilities:
 *    - Show setup form if not connected
 *    - Show team stats if connected
 *    - Handle edit mode toggle
 *    - Validate team ID (6-7 digits)
 *    - Call FPL API to verify team exists
 *    - Update Firestore on successful connection
 *
 * 2. StatCard
 *    Props:
 *    - label: string (e.g., "Total Challenges")
 *    - value: string | number (e.g., 0, "N/A")
 *    - icon?: ReactNode (optional icon)
 *
 *    Responsibilities:
 *    - Display metric in Card component
 *    - Large number typography
 *    - Small label text
 *    - Responsive sizing
 *
 * 3. EmptyState
 *    Props:
 *    - title: string
 *    - description: string
 *    - actionLabel?: string (e.g., "Create Challenge")
 *    - onAction?: () => void
 *    - icon?: ReactNode
 *
 *    Responsibilities:
 *    - Centered layout in Card
 *    - Friendly messaging
 *    - Optional primary action button
 *    - Consistent styling across all empty states
 *
 * 4. ChallengeCard (Phase 3)
 *    Props:
 *    - challenge: Challenge
 *    - currentUserId: string
 *
 *    Responsibilities:
 *    - Display challenge info (opponent, gameweek, status)
 *    - Show appropriate badge (pending/active/won/lost)
 *    - Action buttons (Share, View, Accept)
 *    - Format scores and dates
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * FPL API INTEGRATION
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ENDPOINT: GET /api/entry/{teamId}/
 *
 * RESPONSE FIELDS WE NEED:
 * - name: string (team name, e.g., "Monzaga")
 * - summary_overall_points: number (e.g., 427)
 * - summary_overall_rank: number (e.g., 841192)
 * - summary_event_points: number (current GW points, e.g., 78)
 * - summary_event_rank: number (current GW rank, e.g., 1656624)
 * - value: number (team value in pence, divide by 10 for £, e.g., 1020 → £102.0m)
 *
 * TYPE DEFINITION:
 * interface FPLTeamData {
 *   teamName: string;
 *   overallPoints: number;
 *   overallRank: number;
 *   gameweekPoints: number;
 *   gameweekRank: number;
 *   teamValue: number; // in £m (already converted)
 * }
 *
 * NOTE: This data is fetched LIVE on dashboard load, not stored in Firestore.
 * Only fplTeamId and fplTeamName are stored in Firestore for persistence.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * MICRO-TDD IMPLEMENTATION STEPS (Numbered for sequential execution)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * PHASE 1: Basic Page Structure
 * [ ] Step 1: Page renders with main element
 * [ ] Step 2: Shows "Dashboard" heading
 * [ ] Step 3: Has container with proper spacing
 * [ ] Step 4: Shows welcome message
 * [ ] Step 5: Displays user's display name in welcome
 *
 * PHASE 2: FPL Connection Card (Not Connected State)
 * [ ] Step 6: FPLConnectionCard renders
 * [ ] Step 7: Shows "Connect Your FPL Team" title when not connected
 * [ ] Step 8: Shows description text
 * [ ] Step 9: Shows team ID input field
 * [ ] Step 10: Input has proper label
 * [ ] Step 11: Shows "Connect" button
 * [ ] Step 12: Button is disabled when input is empty
 * [ ] Step 13: Validates team ID format (must be 6-7 digits)
 * [ ] Step 14: Shows error for invalid team ID
 * [ ] Step 15: Shows error for non-numeric input
 * [ ] Step 16: Shows help text with link
 * [ ] Step 17: Button shows loading state when connecting
 * [ ] Step 18: Button is disabled while loading
 * [ ] Step 19: Calls onConnect with team ID on submit
 * [ ] Step 20: Shows error message from API failure
 * [ ] Step 21: Clears error when user types
 *
 * PHASE 3: FPL Connection Card (Connected State)
 * [ ] Step 22: Shows "Your FPL Team" title when connected
 * [ ] Step 23: Displays team name
 * [ ] Step 24: Displays gameweek points
 * [ ] Step 25: Displays gameweek rank (formatted with commas)
 * [ ] Step 26: Displays overall points
 * [ ] Step 27: Displays overall rank (formatted with commas)
 * [ ] Step 28: Displays team value (formatted as £XXX.Xm)
 * [ ] Step 29: Shows "Edit" button when connected
 * [ ] Step 30: Clicking Edit shows input field
 * [ ] Step 31: Input is pre-filled with current team ID
 * [ ] Step 32: Shows "Update" button in edit mode
 * [ ] Step 33: Shows "Cancel" button in edit mode
 * [ ] Step 34: Cancel button exits edit mode
 * [ ] Step 35: Update button calls onUpdate with new team ID
 * [ ] Step 36: Exits edit mode after successful update
 *
 * PHASE 4: Stats Section
 * [ ] Step 37: StatCard component renders
 * [ ] Step 38: StatCard displays label
 * [ ] Step 39: StatCard displays value
 * [ ] Step 40: StatCard displays icon (optional)
 * [ ] Step 41: Dashboard shows 4 stat cards
 * [ ] Step 42: Shows "Total Challenges" card with 0
 * [ ] Step 43: Shows "Wins" card with 0
 * [ ] Step 44: Shows "Losses" card with 0
 * [ ] Step 45: Shows "Win Rate" card with "N/A"
 * [ ] Step 46: Stats are in responsive grid (4 cols → 2 cols → 1 col)
 *
 * PHASE 5: Empty States Component
 * [ ] Step 47: EmptyState component renders
 * [ ] Step 48: EmptyState displays title
 * [ ] Step 49: EmptyState displays description
 * [ ] Step 50: EmptyState displays icon (optional)
 * [ ] Step 51: EmptyState shows action button when provided
 * [ ] Step 52: EmptyState calls onAction when button clicked
 * [ ] Step 53: EmptyState has centered layout
 * [ ] Step 54: EmptyState uses Card component
 *
 * PHASE 6: Challenge Sections
 * [ ] Step 55: Shows "Upcoming Challenges" section header
 * [ ] Step 56: Shows count in header (0 initially)
 * [ ] Step 57: Shows empty state for upcoming challenges
 * [ ] Step 58: Empty state has "Create Challenge" button
 * [ ] Step 59: Shows "Active Challenges" section header
 * [ ] Step 60: Shows empty state for active challenges
 * [ ] Step 61: Shows "Completed Challenges" section header
 * [ ] Step 62: Shows empty state for completed challenges
 *
 * PHASE 7: Integration & Loading States
 * [ ] Step 63: Shows loading spinner while fetching user
 * [ ] Step 64: Shows loading spinner while fetching FPL data
 * [ ] Step 65: Shows error message if user fetch fails
 * [ ] Step 66: Shows error message if FPL fetch fails
 * [ ] Step 67: All sections render after data loads
 *
 * PHASE 8: E2E Verification
 * [ ] Step 68: E2E test: Navigate to dashboard when logged in
 * [ ] Step 69: E2E test: See FPL connection form when not connected
 * [ ] Step 70: E2E test: Connect FPL team and see stats
 * [ ] Step 71: E2E test: Edit FPL team ID
 * [ ] Step 72: E2E test: See all empty states
 * [ ] Step 73: E2E test: No console errors
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * NOTES & CONSIDERATIONS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * - Use existing shadcn/ui components: Card, Button, Input, Label, Badge, Separator
 * - Mobile-first responsive design (Tailwind breakpoints: sm, md, lg)
 * - Loading states: Use Skeleton components from shadcn/ui
 * - Error handling: Show user-friendly messages, not technical errors
 * - Accessibility: Proper ARIA labels, keyboard navigation, focus management
 * - Performance: Fetch FPL data only when needed, cache in state
 * - Future: Challenge data will come from Firestore queries (Phase 3)
 * - Future: Real-time updates possible with Firestore listeners (Phase 7)
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FPLConnectionCard, type FPLTeamData } from '../components/dashboard/FPLConnectionCard';
import { StatCard } from '../components/dashboard/StatCard';
import { EmptyState } from '../components/dashboard/EmptyState';
import type { User } from '../types/user';
import { getUserProfile, connectFPLTeam, updateUserProfile } from '../services/user';
import { getFPLTeamInfo } from '../services/fpl';

export function DashboardPage() {
  const { user: authUser } = useAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [fplData, setFplData] = useState<FPLTeamData | null>(null);

  // Fetch user profile on mount
  useEffect(() => {
    async function loadDashboardData() {
      if (!authUser?.uid) return;

      const userProfile = await getUserProfile(authUser.uid);
      setUserData(userProfile);
    }

    loadDashboardData();
  }, [authUser]);

  // Fetch FPL data when user is connected
  useEffect(() => {
    async function loadFPLData() {
      if (!userData || userData.fplTeamId === 0) return;

      const teamInfo = await getFPLTeamInfo(userData.fplTeamId);
      setFplData(teamInfo);
    }

    loadFPLData();
  }, [userData]);

  // Connect FPL team
  const handleConnect = async (teamId: number) => {
    if (!authUser?.uid) return;
    await connectFPLTeam(authUser.uid, teamId);

    // Refresh user profile to get updated fplTeamId and fplTeamName
    const updatedProfile = await getUserProfile(authUser.uid);
    setUserData(updatedProfile);
  };

  const handleUpdate = async (teamId: number) => {
    if (!authUser?.uid) return;

    // Fetch new team info to validate and get team name
    const teamInfo = await getFPLTeamInfo(teamId);

    // Update user profile in Firestore
    await updateUserProfile(authUser.uid, {
      fplTeamId: teamId,
      fplTeamName: teamInfo.teamName,
    });

    // Refresh user profile
    const updatedProfile = await getUserProfile(authUser.uid);
    setUserData(updatedProfile);

    // Update FPL data
    setFplData(teamInfo);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back{authUser?.displayName ? `, ${authUser.displayName}` : ''}!
          </p>
        </div>

        {/* FPL Connection Card */}
        <FPLConnectionCard
          user={userData}
          fplData={fplData}
          isLoading={false}
          onConnect={handleConnect}
          onUpdate={handleUpdate}
        />

        {/* Stats Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Challenges" value={0} />
          <StatCard label="Wins" value={0} />
          <StatCard label="Losses" value={0} />
          <StatCard label="Win Rate" value="N/A" />
        </div>

        {/* Upcoming Challenges Section */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Upcoming Challenges (0)</h2>
          <EmptyState
            title="No Upcoming Challenges"
            description="Create your first challenge to compete with other managers"
          />
        </div>

        {/* Active Challenges Section */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Active Challenges (0)</h2>
          <EmptyState
            title="No Active Challenges"
            description="Active challenges will appear here once accepted"
          />
        </div>
      </div>
    </main>
  );
}
