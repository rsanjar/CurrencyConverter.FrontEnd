import { useState, type ReactEventHandler } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import ErrorMessage from '../components/ErrorMessage';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit: ReactEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setValidationError(null);

    if (!username.trim()) {
      setValidationError('Username is required.');
      return;
    }
    if (!password) {
      setValidationError('Password is required.');
      return;
    }

    try {
      await login(username.trim(), password);
      navigate('/convert');
    } catch {
      // error handled by auth context
    }
  };

  const displayError = validationError || error;

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <span className="login-icon">💱</span>
          <h1 className="login-title">Currency Converter</h1>
          <p className="login-subtitle">Sign in to access exchange rates</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          {displayError && (
            <ErrorMessage
              message={displayError}
              onDismiss={() => setValidationError(null)}
            />
          )}

          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={isLoading}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
