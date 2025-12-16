import { ReactNode, useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserProfile } from '../../services/user';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { AlertCircle } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading, connectionError, user } = useAuth();
  const location = useLocation();
  const [isCheckingFpl, setIsCheckingFpl] = useState(true);
  const [hasFplTeam, setHasFplTeam] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkFplConnection() {
      if (!user?.uid) {
        setIsCheckingFpl(false);
        return;
      }

      try {
        const profile = await getUserProfile(user.uid);
        setHasFplTeam(profile && profile.fplTeamId > 0);
      } catch {
        setHasFplTeam(false);
      } finally {
        setIsCheckingFpl(false);
      }
    }

    if (isAuthenticated) {
      checkFplConnection();
    } else {
      setIsCheckingFpl(false);
    }
  }, [user?.uid, isAuthenticated]);

  if (loading || isCheckingFpl) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unable to Connect</AlertTitle>
          <AlertDescription className="mt-2">
            We couldn't connect to the authentication service. This may be because:
            <ul className="list-disc list-inside mt-2">
              <li>Firebase emulators aren't running (for local development)</li>
              <li>Network connection issues</li>
            </ul>
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to /connect if no FPL team connected (but don't redirect if already on /connect)
  if (hasFplTeam === false && location.pathname !== '/connect') {
    return <Navigate to="/connect" replace />;
  }

  return <>{children}</>;
}
