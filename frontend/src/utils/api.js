/**
 * Lightweight API client for authenticated requests.
 */

import { KEYCLOAK_CONFIG } from './constants';

/**
 * Fetch with automatic Bearer token injection.
 * @param {string} path - Path relative to API base (e.g. '/me')
 * @param {object} options - fetch options (method, body, etc.)
 * @returns {Promise<Response>}
 */
export async function apiFetch(path, options = {}) {
  // Try to get token from localStorage (oidc-client-ts stores tokens there)
  let token = null;
  try {
    const userStr = localStorage.getItem('oidc.user:' + KEYCLOAK_CONFIG.authority + ':' + KEYCLOAK_CONFIG.client_id);
    if (userStr) {
      const user = JSON.parse(userStr);
      token = user?.access_token || null;
    }
  } catch {
    // No stored session — caller should handle auth state
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(KEYCLOAK_CONFIG.redirect_uri.replace('/callback', '') + path, {
    ...options,
    headers,
    body: options.body && typeof options.body === 'object' ? JSON.stringify(options.body) : options.body,
  });
}
