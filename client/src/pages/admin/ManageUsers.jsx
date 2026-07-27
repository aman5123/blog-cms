import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../components/ToastContainer';
import { API } from '../../services/api';
import '../../styles/admin.css';

const ROLES = ['subscriber', 'author', 'admin'];

export default function ManageUsers() {
  const { logout, currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await API.getUsers();
      setUsers(data);
    } catch (err) {
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    if (id === (currentUser?.id || currentUser?._id)) {
      showToast("You cannot change your own role", 'warning');
      return;
    }
    try {
      await API.updateUserRole(id, newRole);
      showToast(`Role updated to ${newRole}`, 'success');
      setUsers((prev) =>
        prev.map((u) => ((u.id || u._id) === id ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      showToast('Failed to update role', 'error');
    }
  };

  const handleDeleteUser = async (id, userName) => {
    if (id === (currentUser?.id || currentUser?._id)) {
      showToast("You cannot delete your own admin account", 'warning');
      return;
    }
    if (!window.confirm(`Delete user "${userName}" permanently?`)) return;
    try {
      await API.deleteUser(id);
      showToast(`User ${userName} deleted successfully`, 'success');
      setUsers((prev) => prev.filter((u) => (u.id || u._id) !== id));
    } catch (err) {
      showToast('Failed to delete user', 'error');
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-left">
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(true)}><i className="fas fa-bars"></i></button>
            <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>User Management</span>
          </div>
          <div className="topbar-right">
            <button className="btn-icon" onClick={toggleTheme}><i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i></button>
            <button onClick={logout} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </header>

        <div className="admin-content">
          <div className="page-header">
            <div>
              <h1 style={{ fontSize: '1.75rem' }}>Users & Roles</h1>
              <p className="page-title-desc">Manage platform users, assign access roles, or delete sample accounts.</p>
            </div>
            <span className="badge badge-primary" style={{ fontSize: '0.9rem', padding: '8px 16px' }}>
              {users.length} Total Users
            </span>
          </div>

          <div className="dashboard-card" style={{ padding: '16px 24px' }}>
            <div className="search-container" style={{ maxWidth: '300px' }}>
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                className="search-input"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="dashboard-card">
            <div className="table-responsive">
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--primary)' }}></i>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Username</th>
                      <th>Joined</th>
                      <th>Role</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                          No users found.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((user) => {
                        const id = user.id || user._id;
                        const isSelf = id === (currentUser?.id || currentUser?._id);
                        return (
                          <tr key={id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <img src={user.avatar} alt={user.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                                <span style={{ fontWeight: 600 }}>{user.name} {isSelf ? <span style={{ color: 'var(--primary)', fontSize: '0.8rem' }}>(You)</span> : ''}</span>
                              </div>
                            </td>
                            <td style={{ color: 'var(--text-muted)' }}>{user.email}</td>
                            <td style={{ color: 'var(--text-muted)' }}>@{user.username}</td>
                            <td>{new Date(user.createdAt || Date.now()).toLocaleDateString()}</td>
                            <td>
                              <select
                                className="editor-select"
                                style={{ width: 'auto', padding: '6px 10px' }}
                                value={user.role}
                                onChange={(e) => handleRoleChange(id, e.target.value)}
                                disabled={isSelf}
                              >
                                {ROLES.map((r) => (
                                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                                ))}
                              </select>
                            </td>
                            <td>
                              {!isSelf ? (
                                <button
                                  className="btn-action btn-action-delete"
                                  title="Delete User Account"
                                  onClick={() => handleDeleteUser(id, user.name)}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Owner</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
