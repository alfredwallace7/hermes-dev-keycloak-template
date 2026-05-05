import { useEffect, useRef } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../OidcContext';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const { isLoading, isAuthenticated, isUnauthorized, login } = useAuth();
  const startedLogin = useRef(false);
  const errorType = searchParams.get('error');

  useEffect(() => {
    // Only skip auto-login if: still loading, already authenticated, or explicit error param present
    // Note: isUnauthorized alone doesn't block login — it may be stale from a previous session.
    // We only show "Accès refusé" when there's an explicit ?error=unauthorized query param.
    if (isLoading || isAuthenticated || !!errorType || startedLogin.current) return;

    startedLogin.current = true;
    login();
  }, [isLoading, isAuthenticated, errorType, login]);

  // If user successfully authenticated and authorized, go home
  if (isAuthenticated && !isUnauthorized && !errorType) {
    return <Navigate to="/" replace />;
  }

  // Show rejection message only for explicit error param (not stale isUnauthorized flag)
  if (errorType === 'unauthorized') {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <Alert variant="destructive" className="max-w-md w-full">
          <AlertTitle>Accès refusé</AlertTitle>
          <AlertDescription>
            Vous n'êtes pas autorisé à accéder à ce site. Contactez l'administrateur pour être ajouté.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // isUnauthorized without error param means user was redirected from RequireAuth (not yet logged in)
  // — let them attempt login instead of showing rejection

  if (errorType === 'failed') {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <Alert variant="destructive" className="max-w-md w-full">
          <AlertTitle>Erreur de connexion</AlertTitle>
          <AlertDescription>
            La connexion a échoué. Veuillez réessayer.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <div className="flex items-center justify-center h-64">Redirection vers la connexion...</div>;
}