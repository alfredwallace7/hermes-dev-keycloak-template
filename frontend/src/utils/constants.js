/**
 * Application configuration constants.
 * Update these values to match your Keycloak / OIDC provider setup.
 */

export const KEYCLOAK_CONFIG = {
  authority: 'https://keycloak.netcraft.fr/realms/hermes',
  client_id: 'hermes-dev',
  redirect_uri: window.location.origin + '/callback',
  response_type: 'code',
  scope: 'openid profile email',
};

/** API base path — matches backend router prefix */
export const API_BASE = '/api/v1';
