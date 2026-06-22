import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import './Login.css';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      if (isLogin) {
        response = await authAPI.login(email, password);
      } else {
        response = await authAPI.register(name, email, password);
      }

      const { token, user } = response.data;
      login(user, token);

      navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Animated background orbs */}
      <div className="login-bg-orb login-bg-orb-1"></div>
      <div className="login-bg-orb login-bg-orb-2"></div>
      <div className="login-bg-orb login-bg-orb-3"></div>

      <div className="login-container animate-fade-in-up">
        <div className="login-header">
          <span className="login-logo">🎓</span>
          <h1>TalentTrack Portal</h1>
          <p>Student Training & Placement Management System</p>
        </div>

        <div className="login-card glass-card-static">
          <div className="login-tabs">
            <button
              className={`login-tab ${isLogin ? 'login-tab-active' : ''}`}
              onClick={() => { setIsLogin(true); setError(''); }}
              id="login-tab"
            >
              Sign In
            </button>
            <button
              className={`login-tab ${!isLogin ? 'login-tab-active' : ''}`}
              onClick={() => { setIsLogin(false); setError(''); }}
              id="register-tab"
            >
              Register
            </button>
          </div>

          {error && (
            <div className="alert alert-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            {!isLogin && (
              <div className="form-group animate-fade-in">
                <label className="form-label" htmlFor="name-input">Full Name</label>
                <input
                  id="name-input"
                  type="text"
                  className="form-input"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="email-input">Email Address</label>
              <input
                id="email-input"
                type="email"
                className="form-input"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password-input">Password</label>
              <input
                id="password-input"
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg btn-full"
              disabled={loading}
              id="submit-btn"
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span>
                  Processing...
                </span>
              ) : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="login-demo-info">
            <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-sm)' }}>
              Demo Credentials:
            </p>
            <div className="login-demo-creds">
              <div className="demo-cred">
                <span className="badge badge-primary">Admin</span>
                <code>admin@talenttrack.com</code>
              </div>
              <div className="demo-cred">
                <span className="badge badge-success">Student</span>
                <code>rahul.sharma@student.edu</code>
              </div>
              <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>
                Password: <code>admin123</code> / <code>student123</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
