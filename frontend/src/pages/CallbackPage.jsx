import { useEffect, useRef } from 'react';
import { useAuth } from '../OidcContext';

export default function CallbackPage() {
  const { isLoading, handleSigninCallback, verifyRegistered, clearAuthState } = useAuth();
  const handledCallback = useRef(false);

  useEffect(() => {
    if (isLoading || !handleSigninCallback || handledCallback.current) return;

    handledCallback.current = true;

    (async () => {
      try {
        await handleSigninCallback();
        // OIDC callback succeeded — now check if user is registered in local DB
        const registered = await verifyRegistered();
        if (!registered) {
          // User has valid Keycloak token but not in our database
          await clearAuthState();
          window.location.href = '/login?error=unauthorized';
        }
        // If registered, redirect to home (handleSigninCallback doesn't auto-redirect anymore)
      } catch (err) {
        console.error('Failed to process OIDC callback:', err);
        window.location.href = '/login?error=failed';
      }
    })();
  }, [isLoading, handleSigninCallback, verifyRegistered, clearAuthState]);

  return <div className="flex items-center justify-center h-64">Traitement de la connexion...</div>;
}
