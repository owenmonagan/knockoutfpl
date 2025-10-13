import { useAuth } from '../contexts/AuthContext';
import { FPLTeamConnect } from '../components/profile/FPLTeamConnect';

export function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <FPLTeamConnect userId={user.uid} />
    </div>
  );
}
