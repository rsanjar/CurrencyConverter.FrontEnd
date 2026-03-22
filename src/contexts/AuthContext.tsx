import { useCallback, useEffect, useEffectEvent, useMemo, useState, type ReactNode } from 'react';
import { authApi, AUTH_EXPIRED_EVENT } from '../services/api';
import { AuthContext } from './useAuth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.login({ username, password });
      localStorage.setItem('auth_token', response.token);
      setToken(response.token);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setError(null);
  }, []);

  const handleAuthExpired = useEffectEvent(() => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setError('Session expired. Please sign in again.');
  });

  useEffect(() => {
    const onAuthExpired = () => {
      handleAuthExpired();
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, onAuthExpired);
    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, onAuthExpired);
    };
  }, []);

  const value = useMemo(
    () => ({ token, isAuthenticated: !!token, isLoading, error, login, logout }),
    [token, isLoading, error, login, logout],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
