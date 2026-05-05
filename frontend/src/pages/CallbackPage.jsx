import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../OidcContext';

export default function CallbackPage() {
  const navigate = useNavigate();
  const { isLoading, handleSigninCallback, verifyRegistered, clearAuthState, isAuthenticated, user } = useAuth();
  const handledCallback = useRef(false);

  // Step 1: Process OIDC callback when loading completes
  useEffect(() => {
    if (isLoading || !handleSigninCallback || handledCallback.current) return;
    handledCallback.current = true;
    handleSigninCallback();
  }, [isLoading, handleSigninCallback]);

  // Step 2: After React re-renders with new auth state, check registration
  useEffect(() => {
    if (isLoading || !isAuthenticated || !user?.access_token) return;

    (async () => {
      try {
        const registered = await verifyRegistered();
        console.log('verifyRegistered result:', registered);
        if (!registered) {
          // User has valid Keycloak token but not in our database
          await clearAuthState();
          navigate('/login?error=unauthorized', { replace: true });
        } else {
          // Registered — go home
          console.log('User verified, redirecting to /');
          navigate('/', { replace: true });
        }
      } catch (err) {
        console.error('Failed to verify registered user:', err);
        navigate('/login?error=failed', { replace: true });
      }
    })();
  }, [isLoading, isAuthenticated, user, verifyRegistered, clearAuthState, navigate]);

  return <div className="flex items-center justify-center h-64">Traitement de la connexion...</div>;
}
