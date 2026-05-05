import { Navigate } from 'react-router-dom';
import { useAuth } from '../OidcContext';

export default function RequireAuth({ children }) {
  const { isLoading, isAuthenticated, isUnauthorized } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  // Unauthenticated user — redirect to login without error flag so they can actually log in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // User was explicitly rejected by backend (not just unauthenticated)
  if (isUnauthorized) {
    return <Navigate to="/login?error=unauthorized" replace />;
  }

  return children;
}
