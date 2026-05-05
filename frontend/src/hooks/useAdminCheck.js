/**
 * Hook to check if the current user has admin privileges.
 * Calls /api/me and reads the `admin` flag from the response.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../OidcContext';

export function useAdminCheck() {
  const { isAuthenticated, user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkAdminStatus() {
      try {
        const res = await fetch('/api/me', {
          headers: { 'Authorization': `Bearer ${user?.access_token}` },
        });
        const data = res.ok ? await res.json() : null;
        if (!cancelled) setIsAdmin(!!data?.admin);
      } catch (e) {
        console.error('Failed to check admin status:', e);
        if (!cancelled) setIsAdmin(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (isAuthenticated && user?.access_token) {
      checkAdminStatus();
    } else {
      setIsAdmin(false);
      setLoading(false);
    }

    return () => { cancelled = true; };
  }, [isAuthenticated, user?.access_token]);

  return { isAdmin, loading };
}
