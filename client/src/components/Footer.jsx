import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <h3><i className="fas fa-cubes"></i> CMS<span>Blog</span></h3>
          <p>A professional full-stack MERN Content Management System & Blog Platform built by <strong>Aman</strong>.</p>
        </div>

        <div className="footer-col">
          <h4>Navigation</h4>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/categories">Categories</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Member Portal</h4>
          <ul className="footer-links">
            <li><Link to="/login">Sign In</Link></li>
            <li><Link to="/register">Sign Up</Link></li>
            <li><Link to="/admin">Admin Dashboard</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Connect with Aman</h4>
          <ul className="footer-links" style={{ flexDirection: 'row', gap: '16px' }}>
            <li>
              <a href="mailto:amanvrma089@gmail.com" aria-label="Email" title="Email Aman">
                <i className="fas fa-envelope" style={{ fontSize: '1.35rem' }}></i>
              </a>
            </li>
            <li>
              <a href="https://github.com/aman5123" target="_blank" rel="noreferrer" aria-label="GitHub" title="GitHub - aman5123">
                <i className="fab fa-github" style={{ fontSize: '1.35rem' }}></i>
              </a>
            </li>
            <li>
              <a href="https://www.linkedin.com/in/aman-verma-214ba9304/" target="_blank" rel="noreferrer" aria-label="LinkedIn" title="LinkedIn - Aman Verma">
                <i className="fab fa-linkedin" style={{ fontSize: '1.35rem' }}></i>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>&copy; {new Date().getFullYear()} CMSBlog by Aman. All rights reserved.</p>
        <p>MERN Stack Enterprise Edition.</p>
      </div>
    </footer>
  );
}
