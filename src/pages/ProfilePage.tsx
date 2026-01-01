import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, connectFPLTeam, updateUserProfile } from '../services/user';
import { getFPLTeamInfo, type FPLTeamInfo } from '../services/fpl';
import { Skeleton } from '../components/ui/skeleton';
import { FPLConnectionCard } from '../components/dashboard/FPLConnectionCard';
import { ProfileForm } from '../components/profile/ProfileForm';
import type { User } from '../types/user';

export function ProfilePage() {
  const { user: authUser } = useAuth();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fplData, setFplData] = useState<FPLTeamInfo | null>(null);
  const [fplLoading, setFplLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!authUser?.uid) return;

      setIsLoading(true);
      try {
        const profile = await getUserProfile(authUser.uid);
        setUserProfile(profile);
      } catch (e) {
        console.error('Failed to fetch user profile:', e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [authUser?.uid]);

  useEffect(() => {
    async function fetchFplData() {
      if (!userProfile || userProfile.fplTeamId === 0) return;

      setFplLoading(true);
      try {
        const data = await getFPLTeamInfo(userProfile.fplTeamId);
        setFplData(data);
      } catch (e) {
        console.error('Failed to fetch FPL data:', e);
      } finally {
        setFplLoading(false);
      }
    }

    fetchFplData();
  }, [userProfile?.fplTeamId]);

  const handleConnect = async (teamId: number) => {
    if (!authUser?.uid || !authUser?.email) return;
    setError(null);
    try {
      await connectFPLTeam(authUser.uid, authUser.email, teamId);
      // Refresh profile after connect
      const profile = await getUserProfile(authUser.uid);
      setUserProfile(profile);
    } catch (e) {
      setError('Failed to connect team. Please check the ID and try again.');
    }
  };

  const handleUpdate = async (teamId: number) => {
    if (!authUser?.uid || !authUser?.email) return;
    setError(null);
    try {
      await connectFPLTeam(authUser.uid, authUser.email, teamId);
      // Refresh profile after update
      const profile = await getUserProfile(authUser.uid);
      setUserProfile(profile);
    } catch (e) {
      setError('Failed to update team. Please check the ID and try again.');
    }
  };

  const handleClearError = () => setError(null);

  const handleUpdateDisplayName = async (name: string) => {
    if (!authUser?.uid) return;
    await updateUserProfile(authUser.uid, { displayName: name });
    // Refresh profile
    const profile = await getUserProfile(authUser.uid);
    setUserProfile(profile);
  };

  if (!authUser || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <ProfileForm
        displayName={userProfile?.displayName ?? ''}
        email={userProfile?.email ?? authUser?.email ?? ''}
        onUpdateDisplayName={handleUpdateDisplayName}
        isLoading={false}
      />

      <FPLConnectionCard
        user={userProfile}
        fplData={fplData}
        isLoading={fplLoading}
        error={error}
        onConnect={handleConnect}
        onUpdate={handleUpdate}
        onClearError={handleClearError}
      />
    </main>
  );
}
