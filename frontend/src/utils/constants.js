/**
 * Application configuration constants.
 * Update these values to match your Keycloak / OIDC provider setup.
 */

function requiredEnv(name) {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }
  return value;
}

export const KEYCLOAK_CONFIG = {
  authority: requiredEnv('VITE_KEYCLOAK_ISSUER'),
  client_id: requiredEnv('VITE_KEYCLOAK_CLIENT_ID'),
  redirect_uri: window.location.origin + '/callback',
  post_logout_redirect_uri: import.meta.env.VITE_POST_LOGOUT_REDIRECT_URI ?? `${window.location.origin}/`,
  response_type: 'code',
  scope: 'openid profile email',
};

/** API base path — matches backend router prefix */
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';
export const API_AUTH_ME = `${API_BASE}/auth/me`;
export const API_ADMIN_USERS = `${API_BASE}/admin/users`;
