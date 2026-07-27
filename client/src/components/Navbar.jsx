import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import BookmarksDrawer from './BookmarksDrawer';

export default function Navbar() {
  const { currentUser, logout, isAdminOrAuthor } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);

  return (
    <>
      <nav className="navbar-wrapper">
        <div className="container navbar">
          <Link to="/" className="logo">
            <i className="fas fa-cubes"></i> CMS<span>Blog</span>
          </Link>

          <ul className="nav-links">
            <li>
              <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
            </li>
            <li>
              <Link to="/feed" className={`nav-link ${location.pathname === '/feed' ? 'active' : ''}`}>
                <i className="fas fa-stream" style={{ marginRight: '4px' }}></i> Feed
              </Link>
            </li>
            <li>
              <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>About</Link>
            </li>
            <li>
              <Link to="/contact" className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}>Contact</Link>
            </li>
          </ul>

          <div className="nav-actions">
            <button className="btn-icon" onClick={toggleTheme} title="Toggle Theme">
              <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>

            <button className="btn-icon" onClick={() => setIsBookmarksOpen(true)} title="View Bookmarks">
              <i className="fas fa-bookmark"></i>
            </button>

            {currentUser ? (
              <>
                {isAdminOrAuthor && (
                  <>
                    <Link to="/admin/editor" className="btn btn-primary">
                      <i className="fas fa-edit"></i> Write Article
                    </Link>
                    <Link to="/admin" className="btn btn-secondary">
                      <i className="fas fa-chart-line"></i> Dashboard
                    </Link>
                  </>
                )}
                <button onClick={logout} className="btn btn-secondary">
                  <i className="fas fa-sign-out-alt"></i> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary">Login</Link>
                <Link to="/register" className="btn btn-primary">Register</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <BookmarksDrawer isOpen={isBookmarksOpen} onClose={() => setIsBookmarksOpen(false)} />
    </>
  );
}
