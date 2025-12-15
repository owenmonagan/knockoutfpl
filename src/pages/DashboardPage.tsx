/**
 * DashboardPage - Simplified tournament-focused hub
 *
 * Displays:
 * - Welcome header with user's display name
 * - FPL Connection Card (tournament-relevant, allows users to link their FPL team)
 * - "Your Leagues" placeholder section (for future tournament feature)
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FPLConnectionCard, type FPLTeamData } from '../components/dashboard/FPLConnectionCard';
import { Card, CardContent } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import type { User } from '../types/user';
import { getUserProfile, connectFPLTeam, updateUserProfile } from '../services/user';
import { getFPLTeamInfo } from '../services/fpl';

export function DashboardPage() {
  const { user: authUser } = useAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [fplData, setFplData] = useState<FPLTeamData | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [isLoadingFpl, setIsLoadingFpl] = useState(false);

  // Fetch user profile on mount
  useEffect(() => {
    async function loadDashboardData() {
      if (!authUser?.uid) return;

      setIsLoadingUser(true);
      const userProfile = await getUserProfile(authUser.uid);
      setUserData(userProfile);
      setIsLoadingUser(false);
    }

    loadDashboardData();
  }, [authUser]);

  // Fetch FPL data when user is connected
  useEffect(() => {
    async function loadFPLData() {
      if (!userData || userData.fplTeamId === 0) return;

      setIsLoadingFpl(true);
      const teamInfo = await getFPLTeamInfo(userData.fplTeamId);
      setFplData(teamInfo);
      setIsLoadingFpl(false);
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

        {isLoadingUser ? (
          <>
            {/* FPL Connection Card Skeleton */}
            <Card>
              <CardContent className="space-y-4 pt-6">
                <Skeleton className="h-6 w-[200px]" />
                <Skeleton className="h-4 w-[280px]" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-[100px]" />
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* FPL Connection Card */}
            <FPLConnectionCard
              user={userData}
              fplData={fplData}
              isLoading={isLoadingFpl}
              onConnect={handleConnect}
              onUpdate={handleUpdate}
            />

            {/* Your Leagues Section - Placeholder */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-4">
                Your Leagues
              </h2>
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                  <p className="text-muted-foreground">
                    Tournament leagues will appear here
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
