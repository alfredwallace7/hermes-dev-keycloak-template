import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../OidcContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

function safeReturnTo(value) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/';
  return value;
}

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const { isLoading, isAuthenticated, isUnauthorized, login, clearAuthState } = useAuth();
  const errorType = searchParams.get('error');
  const returnTo = safeReturnTo(searchParams.get('next'));

  const startLogin = async () => {
    await clearAuthState();
    await login({ returnTo });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  if (isAuthenticated && !isUnauthorized && !errorType) {
    return <Navigate to={returnTo} replace />;
  }

  if (errorType === 'unauthorized') {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <Alert variant="destructive" className="max-w-md w-full">
          <AlertTitle>Accès refusé</AlertTitle>
          <AlertDescription className="flex flex-col gap-4">
            <span>Vous n'êtes pas autorisé à accéder à ce site. Contactez l'administrateur pour être ajouté.</span>
            <Button size="sm" onClick={startLogin}>
              Se connecter
            </Button>
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
          <AlertDescription className="flex flex-col gap-4">
            <span>La connexion a échoué. Veuillez réessayer.</span>
            <Button size="sm" onClick={startLogin}>
              Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Alert className="max-w-md w-full">
        <AlertTitle>Connexion requise</AlertTitle>
        <AlertDescription className="flex flex-col gap-4">
          <span>Connectez-vous pour accéder à cette application.</span>
          <Button size="sm" onClick={startLogin}>
            Se connecter
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
