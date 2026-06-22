import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-brand" onClick={() => navigate(user?.role === 'admin' ? '/admin/dashboard' : '/dashboard')}>
        <span className="navbar-logo">🎓</span>
        <span className="navbar-title">TalentTrack</span>
      </div>

      <div className="navbar-end">
        {user && (
          <>
            <div className="navbar-user">
              <div className="navbar-avatar">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="navbar-user-info">
                <span className="navbar-user-name">{user.name}</span>
                <span className="navbar-user-role">{user.role}</span>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout} id="logout-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
