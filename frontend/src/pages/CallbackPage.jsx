import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../OidcContext';

function safeReturnTo(value) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/';
  return value;
}

export default function CallbackPage() {
  const navigate = useNavigate();
  const { isLoading, handleSigninCallback, verifyRegistered, clearAuthState } = useAuth();
  const handledCallback = useRef(false);

  useEffect(() => {
    if (isLoading || !handleSigninCallback || handledCallback.current) return;
    handledCallback.current = true;

    (async () => {
      try {
        const signedInUser = await handleSigninCallback();
        const registered = await verifyRegistered(signedInUser);
        if (!registered) {
          await clearAuthState({ unauthorized: true });
          navigate('/login?error=unauthorized', { replace: true });
        } else {
          navigate(safeReturnTo(signedInUser?.state?.returnTo), { replace: true });
        }
      } catch {
        navigate('/login?error=failed', { replace: true });
      }
    })();
  }, [isLoading, handleSigninCallback, verifyRegistered, clearAuthState, navigate]);

  return <div className="flex items-center justify-center h-64">Traitement de la connexion...</div>;
}
