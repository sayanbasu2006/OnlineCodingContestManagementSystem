import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Terminal, LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  let user = null;
  try {
    user = userStr && userStr !== 'undefined' ? JSON.parse(userStr) : null;
  } catch (e) {}

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <Terminal size={28} />
          <span>Code</span>Arena
        </Link>
        <div className="nav-links">
          <Link to="/contests" className="nav-link">Contests</Link>
          <Link to="/problems" className="nav-link">Problems</Link>
          <Link to="/leaderboard" className="nav-link">Leaderboard</Link>
          {token ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <UserIcon size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  {user?.username}
                </span>
                <button onClick={handleLogout} className="btn btn-danger" style={{ padding: '0.4rem 0.8rem' }}>
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary">Login</Link>
              <Link to="/register" className="btn">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
