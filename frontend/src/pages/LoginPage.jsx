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
    if (isLoading || isAuthenticated || isUnauthorized || !!errorType || startedLogin.current) return;

    startedLogin.current = true;
    login();
  }, [isLoading, isAuthenticated, isUnauthorized, errorType, login]);

  // If user successfully authenticated and authorized, go home
  if (isAuthenticated && !isUnauthorized && !errorType) {
    return <Navigate to="/" replace />;
  }

  // Show rejection message for users not registered in the local DB
  if (isUnauthorized || errorType === 'unauthorized') {
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