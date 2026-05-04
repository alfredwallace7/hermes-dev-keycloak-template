import { Navigate } from 'react-router-dom';
import { useAuth } from '../OidcContext';

export default function RequireAuth({ children }) {
  const { isLoading, isAuthenticated, isUnauthorized } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  // User was rejected by backend — redirect to login with error message
  if (isUnauthorized || !isAuthenticated) {
    return <Navigate to="/login?error=unauthorized" replace />;
  }

  return children;
}
