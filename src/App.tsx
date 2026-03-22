import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/useAuth';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import CurrencyConversionPage from './pages/CurrencyConversionPage';
import LatestRatesPage from './pages/LatestRatesPage';
import HistoricalByDatePage from './pages/HistoricalByDatePage';
import HistoricalRangePage from './pages/HistoricalRangePage';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/convert" replace /> : <LoginPage />}
      />
      <Route
        path="/convert"
        element={
          <ProtectedRoute>
            <CurrencyConversionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/latest"
        element={
          <ProtectedRoute>
            <LatestRatesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/historical"
        element={
          <ProtectedRoute>
            <HistoricalByDatePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <HistoricalRangePage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={isAuthenticated ? '/convert' : '/login'} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
