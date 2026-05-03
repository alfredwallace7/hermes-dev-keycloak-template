import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../OidcContext';

export default function CallbackPage() {
  const { isLoading, handleSigninCallback } = useAuth();
  const handledCallback = useRef(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isLoading || !handleSigninCallback || handledCallback.current) return;

    handledCallback.current = true;
    handleSigninCallback().catch((err) => {
      console.error('Failed to process OIDC callback:', err);
      setError(err);
    });
  }, [isLoading, handleSigninCallback]);

  if (error) {
    return <div className="flex items-center justify-center h-64">Login failed. Please try again.</div>;
  }

  return <div className="flex items-center justify-center h-64">Processing login...</div>;
}
