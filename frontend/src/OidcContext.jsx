import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserManager, WebStorageStateStore } from 'oidc-client-ts';

const AuthContext = createContext(null);

export function OidcProvider({ children, config }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [userManager, setUserManager] = useState(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  useEffect(() => {
    const store = new WebStorageStateStore({ store: window.localStorage });
    const settings = {
      authority: config.authority,
      client_id: config.client_id,
      redirect_uri: config.redirect_uri,
      post_logout_redirect_uri: window.location.origin + '/',
      response_type: config.response_type,
      scope: config.scope,
      userStore: store,
      automaticSilentRenew: true,
      disablePKCE: false,
    };

    const mgr = new UserManager(settings);

    // Check for existing OIDC session AND verify against backend DB
    (async () => {
      try {
        const u = await mgr.getUser();
        if (u) {
          // Verify user is registered in local DB before granting access
          try {
            const res = await fetch('/api/me', {
              headers: { 'Authorization': `Bearer ${u.access_token}` },
            });
            if (res.ok) {
              setUser(u);
              setIsAuthenticated(true);
            } else {
              // Not registered — clear session and mark as unauthorized
              await mgr.removeUser();
              setIsUnauthorized(true);
            }
          } catch {
            // Backend unreachable — still allow login attempt
            setUser(u);
            setIsAuthenticated(true);
          }
        }
      } catch {
        // No existing session
      }
    }).finally(() => setIsLoading(false));

    setUserManager(mgr);
  }, [config]);

  const login = useCallback(async () => {
    setIsUnauthorized(false);
    if (userManager) await userManager.signinRedirect();
  }, [userManager]);

  const handleSigninCallback = useCallback(async () => {
    if (!userManager) return;

    const signedInUser = await userManager.signinRedirectCallback();
    setUser(signedInUser);
    setIsAuthenticated(true);
  }, [userManager]);

  const logout = useCallback(async () => {
    setIsUnauthorized(false);
    if (userManager) {
      await userManager.signoutRedirect({
        id_token_hint: user?.id_token,
        post_logout_redirect_uri: window.location.origin + '/',
      });
    }
  }, [userManager, user]);

  // Verify that the OIDC-authenticated user is registered in the local DB.
  // Returns true if /api/me responds 200, false on 403 (unregistered/inactive).
  const verifyRegistered = useCallback(async () => {
    if (!user?.access_token) return false;
    try {
      const res = await fetch('/api/me', {
        headers: { 'Authorization': `Bearer ${user.access_token}` },
      });
      if (res.status === 403) return false;
      return res.ok;
    } catch {
      return false;
    }
  }, [user]);

  // Clear local auth state without redirecting to Keycloak logout
  const clearAuthState = useCallback(async () => {
    if (userManager) {
      await userManager.removeUser();
    }
    setUser(null);
    setIsAuthenticated(false);
    setIsUnauthorized(true);
  }, [userManager]);

  return (
    <AuthContext.Provider value={{ isLoading, isAuthenticated, isUnauthorized, user, login, logout, handleSigninCallback, verifyRegistered, clearAuthState }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
