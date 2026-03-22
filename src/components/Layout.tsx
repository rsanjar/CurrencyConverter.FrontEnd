import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="header-brand">
          <span className="header-icon">💱</span>
          <h1 className="header-title">Currency Converter</h1>
        </div>
        <button className="btn btn-outline btn-sm" onClick={handleLogout}>
          Sign Out
        </button>
      </header>
      <nav className="nav">
        <div className="nav-inner">
          <NavLink to="/convert" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Convert Currency
          </NavLink>
          <NavLink to="/latest" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Latest Rates
          </NavLink>
          <NavLink to="/historical" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Historical by Date
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Historical Range
          </NavLink>
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>
      <footer className="footer">
        <p>Powered by Frankfurter API</p>
      </footer>
    </div>
  );
}
