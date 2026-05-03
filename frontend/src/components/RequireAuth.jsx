import { Navigate } from 'react-router-dom';
import { useAuth } from '../OidcContext';

export default function RequireAuth({ children }) {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
