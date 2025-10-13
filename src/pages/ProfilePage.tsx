import { useAuth } from '../contexts/AuthContext';
import { FPLTeamConnect } from '../components/profile/FPLTeamConnect';
import { Skeleton } from '../components/ui/skeleton';

export function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div>
      <FPLTeamConnect userId={user.uid} />
    </div>
  );
}
