import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

export default function Sidebar() {
  const { user } = useAuth();

  const studentLinks = [
    { to: '/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/profile', icon: '👤', label: 'My Profile' },
    { to: '/training', icon: '📚', label: 'Training' },
    { to: '/tests', icon: '📝', label: 'Tests' },
    { to: '/results', icon: '📈', label: 'Results' },
    { to: '/placements', icon: '💼', label: 'Placements' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/admin/students', icon: '👥', label: 'Students' },
    { to: '/admin/training', icon: '📚', label: 'Training' },
    { to: '/admin/tests', icon: '📝', label: 'Tests' },
    { to: '/admin/placements', icon: '💼', label: 'Placements' },
  ];

  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  return (
    <aside className="sidebar" id="main-sidebar">
      <div className="sidebar-section">
        <span className="sidebar-section-title">Navigation</span>
        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
              }
            >
              <span className="sidebar-link-icon">{link.icon}</span>
              <span className="sidebar-link-label">{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-footer-card">
          <span className="sidebar-footer-emoji">🎓</span>
          <p>TalentTrack Portal</p>
          <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}
