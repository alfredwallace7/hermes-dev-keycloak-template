/**
 * Application entry point — wraps providers and renders route definitions.
 */

import { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { OidcProvider } from './OidcContext';
import { ThemeProvider } from './ThemeContext';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import { ROUTES } from './routes';
import { KEYCLOAK_CONFIG } from './utils/constants';

function AppContent() {
  return (
    <BrowserRouter>
      <Layout>
        <ErrorBoundary>
          <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
            <Routes>
              {ROUTES.map((route) => (
                <Route key={route.path} path={route.path} element={route.element} />
              ))}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
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
