/**
 * Route definitions — uses React.lazy() for code-splitting.
 *
 * To add a new route:
 *   1. Create the page component (e.g. src/pages/SettingsPage.jsx)
 *   2. Add a lazy import below
 *   3. Add a <Route> entry in ROUTES array
 */

import { lazy, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import RequireAuth from '../components/RequireAuth';
import { useAuth } from '../OidcContext';

// --- Lazy-loaded page components ---
const HomePage = lazy(() => import('../pages/HomePage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const CallbackPage = lazy(() => import('../pages/CallbackPage'));
const AdminUsersPage = lazy(() => import('../pages/AdminUsersPage'));

// --- Route configuration ---
export const ROUTES = [
  {
    path: '/callback',
    element: <CallbackPage />,
    description: 'OIDC callback — processes authentication response',
  },
  {
    path: '/login',
    element: <LoginPage />,
    description: 'Login trigger page',
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <HomePage />
      </RequireAuth>
    ),
    description: 'Home page — requires authentication',
  },
  {
    path: '/admin/users',
    element: (
      <RequireAdmin>
        <AdminUsersPage />
      </RequireAdmin>
    ),
    description: 'Admin user management — requires admin role',
  },
];

/**
 * AdminCheck — checks if the current user has admin privileges via /api/me.
 */
function AdminCheck({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const res = await fetch('/api/me', {
          headers: { 'Authorization': `Bearer ${user?.access_token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setIsAdmin(!!data.admin);
        } else {
          if (!cancelled) setIsAdmin(false);
        }
      } catch {
        if (!cancelled) setIsAdmin(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (isAuthenticated && user?.access_token) check();
    else { setIsAdmin(false); setLoading(false); }
    return () => { cancelled = true; };
  }, [isAuthenticated, user?.access_token]);

  if (loading) return <div className="flex items-center justify-center h-64">Loading...</div>;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

/** RequireAdmin — wraps children with admin check. */
function RequireAdmin({ children }) {
  return <AdminCheck>{children}</AdminCheck>;
}
