import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastContainer';
import '../styles/auth.css';

export default function Register() {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { currentUser, logout, register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register({ username, name, email, password });
      showToast(`Account created! Welcome, ${user.name}`, 'success');
      navigate('/admin');
    } catch (err) {
      showToast(err.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAndRegister = () => {
    logout();
    showToast('Logged out. You can now register a new account.', 'info');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <i className="fas fa-cubes"></i> CMS<span>Blog</span>
          </Link>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join us to start reading, bookmarking, and publishing articles</p>
        </div>

        {/* If user is already logged in, show logout helper banner */}
        {currentUser ? (
          <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', textAlign: 'center' }}>
            <i className="fas fa-user-check" style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '12px', display: 'block' }}></i>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>You are currently signed in as <strong>{currentUser.name}</strong></h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              To register a new account, please sign out of your current session.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={handleLogoutAndRegister}>
                <i className="fas fa-sign-out-alt"></i> Sign Out & Register New Account
              </button>
              <Link to="/admin" className="btn btn-secondary">
                Go to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-username">Username</label>
              <div className="form-control-wrapper">
                <i className="fas fa-at form-icon"></i>
                <input
                  type="text"
                  id="reg-username"
                  className="form-control"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="janesmith"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name</label>
              <div className="form-control-wrapper">
                <i className="fas fa-user form-icon"></i>
                <input
                  type="text"
                  id="reg-name"
                  className="form-control"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Smith"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email Address</label>
              <div className="form-control-wrapper">
                <i className="fas fa-envelope form-icon"></i>
                <input
                  type="email"
                  id="reg-email"
                  className="form-control"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@domain.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div className="form-control-wrapper">
                <i className="fas fa-lock form-icon"></i>
                <input
                  type="password"
                  id="reg-password"
                  className="form-control"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '12px', fontSize: '1rem', marginTop: '10px' }}>
              {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Sign Up'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <span>Already have an account? <Link to="/login" className="auth-link">Sign In</Link></span>
        </div>
      </div>
    </div>
  );
}
