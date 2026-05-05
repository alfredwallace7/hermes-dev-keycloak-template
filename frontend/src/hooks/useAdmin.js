import { useState, useEffect } from 'react';
import { useAuth } from '../OidcContext';
import { API_AUTH_ME } from '../utils/constants';
import { apiRequest } from '../utils/api';

/**
 * useAdmin - Hook to check if the current user has admin privileges.
 */
export function useAdmin() {
  const { isAuthenticated, user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkAdminStatus() {
      if (!isAuthenticated || !user?.access_token) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const data = await apiRequest(API_AUTH_ME, { token: user.access_token });
        if (!cancelled) setIsAdmin(!!data.admin);
      } catch {
        if (!cancelled) setIsAdmin(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    checkAdminStatus();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.access_token]);

  return { isAdmin, loading };
}
