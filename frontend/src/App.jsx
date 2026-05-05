/**
 * Application entry point — wraps providers and renders route definitions.
 */

import { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { OidcProvider } from './OidcContext';
import { ThemeProvider } from './ThemeContext';
import Layout from './components/Layout';
import RequireAuth from './components/RequireAuth';
import { ROUTES } from './routes';
import { KEYCLOAK_CONFIG } from './utils/constants';

function AppContent() {
  return (
    <BrowserRouter>
      <Layout>
        <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
          <Routes>
            {/* Callback route — processes OIDC response */}
            <Route path="/callback" element={<ROUTES[0].element />} />

            {/* Login trigger */}
            <Route path="/login" element={<ROUTES[1].element />} />

            {/* Public routes (require auth) */}
            <Route path="/" element={ROUTES[2].element} />

            {/* Admin-only routes */}
            <Route path="/admin/users" element={ROUTES[3].element} />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <OidcProvider config={KEYCLOAK_CONFIG}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </OidcProvider>
  );
}
