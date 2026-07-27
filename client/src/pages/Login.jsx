import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastContainer';
import '../styles/auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemoBox, setShowDemoBox] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      showToast(`Welcome back, ${user.name}!`, 'success');
      if (user.role === 'admin' || user.role === 'author') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Invalid email or password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <i className="fas fa-cubes"></i> CMS<span>Blog</span>
          </Link>
          <h2 className="auth-title">Account Sign In</h2>
          <p className="auth-subtitle">Enter your email and password to access the platform</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <div className="form-control-wrapper">
              <i className="fas fa-envelope form-icon"></i>
              <input
                type="email"
                id="login-email"
                className="form-control"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div className="form-control-wrapper">
              <i className="fas fa-lock form-icon"></i>
              <input
                type="password"
                id="login-password"
                className="form-control"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '12px', fontSize: '1rem' }}>
            {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Sign In'}
          </button>
        </form>

        {/* Optional Demo Credentials Drawer Toggle */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            type="button"
            onClick={() => setShowDemoBox(!showDemoBox)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {showDemoBox ? 'Hide Quick Demo Credentials' : '🔑 Show Quick Demo Credentials'}
          </button>
        </div>

        {showDemoBox && (
          <div style={{ background: 'var(--surface)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.8rem', marginTop: '12px' }}>
            <strong style={{ display: 'block', marginBottom: '8px', color: 'var(--text)' }}>⚡ One-Click Quick Login:</strong>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => handleDemoAccount('amanvrma089@gmail.com', 'admin123')} className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                Aman (Admin)
              </button>
              <button type="button" onClick={() => handleDemoAccount('author@cms.com', 'author123')} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                Author
              </button>
              <button type="button" onClick={() => handleDemoAccount('user@cms.com', 'user123')} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                Subscriber
              </button>
            </div>
          </div>
        )}

        <div className="auth-footer">
          <span>Don't have an account? <Link to="/register" className="auth-link">Create one</Link></span>
        </div>
      </div>
    </div>
  );
}
