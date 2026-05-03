import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserManager, WebStorageStateStore } from 'oidc-client-ts';

const AuthContext = createContext(null);

export function OidcProvider({ children, config }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [userManager, setUserManager] = useState(null);

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

    mgr.getUser().then((user) => {
      if (user) {
        setUser(user);
        setIsAuthenticated(true);
      }
    }).finally(() => setIsLoading(false));

    setUserManager(mgr);
  }, [config]);

  const login = useCallback(async () => {
    if (userManager) await userManager.signinRedirect();
  }, [userManager]);

  const handleSigninCallback = useCallback(async () => {
    if (!userManager) return;

    const signedInUser = await userManager.signinRedirectCallback();
    setUser(signedInUser);
    setIsAuthenticated(true);
    window.location.href = '/';
  }, [userManager]);

  const logout = useCallback(async () => {
    if (userManager) {
      await userManager.signoutRedirect({
        id_token_hint: user?.id_token,
        post_logout_redirect_uri: window.location.origin + '/',
      });
    }
  }, [userManager, user]);

  return (
    <AuthContext.Provider value={{ isLoading, isAuthenticated, user, login, logout, handleSigninCallback }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
