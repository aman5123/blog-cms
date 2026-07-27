import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../components/ToastContainer';
import { API } from '../../services/api';
import '../../styles/admin.css';

export default function ManageComments() {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [filterStatus]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const params = filterStatus ? { status: filterStatus } : {};
      const data = await API.getComments(params);
      setComments(data);
    } catch (err) {
      showToast('Failed to load comments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await API.updateCommentStatus(id, newStatus);
      showToast(`Comment ${newStatus}`, 'success');
      setComments((prev) =>
        prev.map((c) => ((c.id || c._id) === id ? { ...c, status: newStatus } : c))
      );
    } catch (err) {
      showToast('Failed to update comment status', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this comment permanently?')) return;
    try {
      await API.deleteComment(id);
      showToast('Comment deleted', 'success');
      setComments((prev) => prev.filter((c) => (c.id || c._id) !== id));
    } catch (err) {
      showToast('Failed to delete comment', 'error');
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-left">
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(true)}><i className="fas fa-bars"></i></button>
            <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Comment Moderation</span>
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
              <h1 style={{ fontSize: '1.75rem' }}>Comments</h1>
              <p className="page-title-desc">Approve, reject, or delete reader comments.</p>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="dashboard-card" style={{ padding: '12px 24px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['', 'approved', 'pending', 'rejected'].map((s) => (
                <button
                  key={s}
                  className={`category-tab ${filterStatus === s ? 'active' : ''}`}
                  onClick={() => setFilterStatus(s)}
                >
                  {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="dashboard-card">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--primary)' }}></i>
              </div>
            ) : comments.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                <i className="fas fa-comments" style={{ fontSize: '3rem', marginBottom: '16px', display: 'block' }}></i>
                <p>No comments found.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {comments.map((c) => {
                  const id = c.id || c._id;
                  return (
                    <div key={id} style={{
                      padding: '20px',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--surface)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                              {c.author.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <strong style={{ fontSize: '0.95rem' }}>{c.author}</strong>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '8px' }}>{c.email}</span>
                            </div>
                            <span className={`badge ${c.status === 'approved' ? 'badge-success' : c.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>
                              {c.status}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.95rem', color: 'var(--text)', margin: '8px 0 6px 48px' }}>{c.content}</p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '48px' }}>
                            On: <strong>{c.postTitle || 'Article'}</strong> &bull; {new Date(c.date || c.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="actions-cell">
                          {c.status !== 'approved' && (
                            <button className="btn-action" title="Approve" onClick={() => handleStatusUpdate(id, 'approved')}>
                              <i className="fas fa-check" style={{ color: 'var(--success)' }}></i>
                            </button>
                          )}
                          {c.status !== 'rejected' && (
                            <button className="btn-action" title="Reject" onClick={() => handleStatusUpdate(id, 'rejected')}>
                              <i className="fas fa-ban" style={{ color: 'var(--warning)' }}></i>
                            </button>
                          )}
                          <button className="btn-action btn-action-delete" title="Delete" onClick={() => handleDelete(id)}>
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
