/**
 * DashboardPage - Redirects to /leagues
 *
 * Kept for backward compatibility with bookmarks and external links.
 * All authenticated users should use /leagues as their home.
 */

import { Navigate } from 'react-router-dom';

export function DashboardPage() {
  return <Navigate to="/leagues" replace />;
}
