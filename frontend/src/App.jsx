import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { OidcProvider, useAuth } from './OidcContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AdminUsersPage from './pages/AdminUsersPage';

const KEYCLOAK_CONFIG = {
  authority: 'https://keycloak.netcraft.fr/realms/hermes',
  client_id: 'hermes-dev',
  redirect_uri: window.location.origin + '/callback',
  response_type: 'code',
  scope: 'openid profile email',
};

function AppContent() {
  const { isAuthenticated, user } = useAuth();

  // Protected route wrapper — requires admin status
  function RequireAdmin({ children }) {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
      async function checkAdmin() {
        try {
          const res = await fetch('/api/me', {
            headers: { 'Authorization': `Bearer ${user?.access_token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setIsAdmin(!!data.admin);
          } else {
            setIsAdmin(false);
          }
        } catch (e) {
          console.error('Failed to check admin status:', e);
          setIsAdmin(false);
        } finally {
          setLoading(false);
        }
      }
      
      if (isAuthenticated && user?.access_token) {
        checkAdmin();
      } else {
        setLoading(false);
      }
    }, [isAuthenticated, user]);

    if (loading) return <div className="flex items-center justify-center h-64">Loading...</div>;
    
    if (!isAdmin) {
      return <Navigate to="/" replace />;
    }
    
    return children;
  }

  // Redirect unauthenticated users to login
  function RequireAuth({ children }) {
    if (!isAuthenticated) {
      window.location.href = KEYCLOAK_CONFIG.authority + '/protocol/openid-connect/auth?' + 
        new URLSearchParams({
          client_id: KEYCLOAK_CONFIG.client_id,
          redirect_uri: KEYCLOAK_CONFIG.redirect_uri,
          response_type: 'code',
          scope: KEYCLOAK_CONFIG.scope,
        });
      return null;
    }
    
    return children;
  }

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={
            <RequireAuth>
              <HomePage />
            </RequireAuth>
          } />
          
          {/* Admin-only routes */}
          <Route path="/admin/users" element={
            <RequireAdmin>
              <AdminUsersPage />
            </RequireAdmin>
          } />
          
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <OidcProvider config={KEYCLOAK_CONFIG}>
      <AppContent />
    </OidcProvider>
  );
}
