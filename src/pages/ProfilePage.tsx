import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile } from '../services/user';
import { getFPLTeamInfo, type FPLTeamInfo } from '../services/fpl';
import { Skeleton } from '../components/ui/skeleton';
import type { User } from '../types/user';

export function ProfilePage() {
  const { user: authUser } = useAuth();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fplData, setFplData] = useState<FPLTeamInfo | null>(null);
  const [fplLoading, setFplLoading] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      if (!authUser?.uid) return;

      setIsLoading(true);
      try {
        const profile = await getUserProfile(authUser.uid);
        setUserProfile(profile);
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
      } finally {
        setFplLoading(false);
      }
    }

    fetchFplData();
  }, [userProfile?.fplTeamId]);

  if (!authUser || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      {/* Will add FPLConnectionCard next */}
    </main>
  );
}
