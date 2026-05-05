/**
 * Route definitions — uses React.lazy() for code-splitting.
 *
 * To add a new route:
 *   1. Create the page component (e.g. src/pages/SettingsPage.jsx)
 *   2. Add a lazy import below
 *   3. Add a <Route> entry in ROUTES array
 */

import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import RequireAuth from '../components/RequireAuth';
import { useAdmin } from '../hooks/useAdmin';

// --- Lazy-loaded page components ---
const HomePage = lazy(() => import('../pages/HomePage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const LoggedOutPage = lazy(() => import('../pages/LoggedOutPage'));
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
    description: 'Login page',
  },
  {
    path: '/logged-out',
    element: <LoggedOutPage />,
    description: 'Post-logout landing page',
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
 * RequireAdmin — wraps children with admin check.
 */
function RequireAdmin({ children }) {
  const { isAdmin, loading } = useAdmin();

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
