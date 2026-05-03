import { useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../OidcContext';

export default function LoginPage() {
  const { isLoading, isAuthenticated, login } = useAuth();
  const startedLogin = useRef(false);

  useEffect(() => {
    if (isLoading || isAuthenticated || startedLogin.current) return;

    startedLogin.current = true;
    login();
  }, [isLoading, isAuthenticated, login]);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <div className="flex items-center justify-center h-64">Redirecting to login...</div>;
}
