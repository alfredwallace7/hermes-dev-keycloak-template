import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../OidcContext';

export default function RequireAuth({ children }) {
  const { isLoading, isAuthenticated, isUnauthorized } = useAuth();
  const location = useLocation();
  const next = `${location.pathname}${location.search}`;

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  // User was explicitly rejected by backend (not just unauthenticated)
  if (isUnauthorized) {
    return <Navigate to={`/login?error=unauthorized&next=${encodeURIComponent(next)}`} replace />;
  }

  // Unauthenticated user — redirect to login without error flag so they can actually log in
  if (!isAuthenticated) {
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
  }

  return children;
}
