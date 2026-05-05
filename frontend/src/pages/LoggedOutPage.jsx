import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../OidcContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function LoggedOutPage() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const returnTo = searchParams.get('next') || '/';

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Alert className="max-w-md w-full">
        <AlertTitle>Déconnecté</AlertTitle>
        <AlertDescription className="flex flex-col gap-4">
          <span>Votre session est terminée.</span>
          <Button size="sm" onClick={() => login({ returnTo })}>
            Se connecter
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
