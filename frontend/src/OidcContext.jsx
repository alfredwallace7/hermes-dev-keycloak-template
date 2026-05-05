import { createContext, use, useReducer, useEffect, useCallback, useRef } from 'react';
import { UserManager, WebStorageStateStore } from 'oidc-client-ts';
import { API_AUTH_ME } from './utils/constants';
import { apiRequest } from './utils/api';

const AuthContext = createContext(null);

async function verifyStoredUser(user) {
  await apiRequest(API_AUTH_ME, { token: user.access_token });
  return true;
}

const initialState = {
  isLoading: true,
  isAuthenticated: false,
  user: null,
  isUnauthorized: false,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'INITIALIZE':
      return { ...state, ...action.payload, isLoading: false };
    case 'SET_AUTH':
      return { ...state, isAuthenticated: action.isAuthenticated, user: action.user, isUnauthorized: false, isLoading: false };
    case 'SET_UNAUTHORIZED':
      return { ...state, isAuthenticated: false, user: null, isUnauthorized: true, isLoading: false };
    case 'SET_SIGNED_OUT':
      return { ...state, isAuthenticated: false, user: null, isUnauthorized: false, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'CLEAR_AUTH':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        isUnauthorized: action.unauthorized ?? false,
        isLoading: false,
      };
    default:
      return state;
  }
}

export function OidcProvider({ children, config }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const userManagerRef = useRef(null);

  useEffect(() => {
    const store = new WebStorageStateStore({ store: window.localStorage });
    const settings = {
      authority: config.authority,
      client_id: config.client_id,
      redirect_uri: config.redirect_uri,
      post_logout_redirect_uri: config.post_logout_redirect_uri,
      response_type: config.response_type,
      scope: config.scope,
      userStore: store,
      automaticSilentRenew: true,
      disablePKCE: false,
    };

    const mgr = new UserManager(settings);
    userManagerRef.current = mgr;

    // Check for existing OIDC session AND verify against backend DB
    mgr.getUser().then(u => {
      if (u) {
        return verifyStoredUser(u).then(isRegistered => {
          if (isRegistered) {
            dispatch({ type: 'SET_AUTH', isAuthenticated: true, user: u });
          } else {
            return mgr.removeUser().then(() => dispatch({ type: 'SET_UNAUTHORIZED' }));
          }
        }).catch(() => {
          return mgr.removeUser().then(() => dispatch({ type: 'SET_UNAUTHORIZED' }));
        });
      }
      dispatch({ type: 'SET_LOADING', payload: false });
      return Promise.resolve();
    }).catch(() => {
      dispatch({ type: 'SET_LOADING', payload: false });
      return Promise.resolve();
    });
  }, [config]);

  const login = useCallback(async ({ returnTo = '/' } = {}) => {
    if (userManagerRef.current) {
      await userManagerRef.current.signinRedirect({
        state: { returnTo },
      });
    }
  }, []);

  const handleSigninCallback = useCallback(async () => {
    if (!userManagerRef.current) return null;

    const signedInUser = await userManagerRef.current.signinRedirectCallback();
    dispatch({ type: 'SET_AUTH', isAuthenticated: true, user: signedInUser });
    return signedInUser;
  }, []);

  const logout = useCallback(async () => {
    if (userManagerRef.current) {
      const idToken = state.user?.id_token;
      await userManagerRef.current.removeUser();
      dispatch({ type: 'SET_SIGNED_OUT' });

      await userManagerRef.current.signoutRedirect({
        id_token_hint: idToken,
        post_logout_redirect_uri: config.post_logout_redirect_uri,
      });
    }
  }, [config.post_logout_redirect_uri, state.user]);

  const verifyRegistered = useCallback(async (candidateUser = state.user) => {
    if (!candidateUser?.access_token) return false;
    try {
      await apiRequest(API_AUTH_ME, { token: candidateUser.access_token });
      return true;
    } catch {
      return false;
    }
  }, [state.user]);

  const clearAuthState = useCallback(async ({ unauthorized = false } = {}) => {
    if (userManagerRef.current) {
      await userManagerRef.current.removeUser();
    }
    dispatch({ type: 'CLEAR_AUTH', unauthorized });
  }, []);

  const value = {
    ...state,
    login,
    logout,
    handleSigninCallback,
    verifyRegistered,
    clearAuthState
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return use(AuthContext);
}
