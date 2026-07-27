import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { currentUser, isAdmin } = useAuth();
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', path: '/admin', icon: 'fa-chart-pie' },
    { label: 'Posts', path: '/admin/posts', icon: 'fa-newspaper' },
    { label: 'Write Post', path: '/admin/editor', icon: 'fa-edit' },
    ...(isAdmin ? [
      { label: 'Comments', path: '/admin/comments', icon: 'fa-comments' },
      { label: 'Users', path: '/admin/users', icon: 'fa-users' },
    ] : []),
    { label: 'Settings', path: '/admin/settings', icon: 'fa-cog' },
    { label: 'Profile', path: '/admin/profile', icon: 'fa-user-circle' },
  ];

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <Link to="/" className="logo"><i className="fas fa-cubes"></i> CMS<span>Blog</span></Link>
        <button className="sidebar-toggle" onClick={onClose}><i className="fas fa-times"></i></button>
      </div>

      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              onClick={onClose}
              className={`sidebar-item-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <i className={`fas ${item.icon}`}></i> {item.label}
            </Link>
          </li>
        ))}
      </ul>

      {currentUser && (
        <div className="sidebar-footer">
          <img src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} alt={currentUser.name} className="sidebar-user-avatar" />
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{currentUser.name}</span>
            <span className="sidebar-user-role">{currentUser.role}</span>
          </div>
        </div>
      )}
    </aside>
  );
}
