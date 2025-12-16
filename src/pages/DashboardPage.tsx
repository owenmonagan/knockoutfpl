/**
 * DashboardPage - Simplified tournament-focused hub
 *
 * Displays:
 * - Welcome header with user's display name
 * - Quick link to view leagues and start knockouts
 *
 * Note: FPL connection is now handled by /connect via ProtectedRoute redirect
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';

export function DashboardPage() {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

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

        {/* Quick Actions */}
        <div className="space-y-4">
          <Button onClick={() => navigate('/leagues')} size="lg">
            View Your Leagues
          </Button>
        </div>
      </div>
    </main>
  );
}
