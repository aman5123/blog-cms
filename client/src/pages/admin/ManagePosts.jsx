import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../components/ToastContainer';
import { API } from '../../services/api';
import '../../styles/admin.css';

export default function ManagePosts() {
  const { logout, isAdmin, currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPostIds, setSelectedPostIds] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, [filterStatus]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      const data = await API.getPosts(params);
      setPosts(data);
    } catch (err) {
      showToast('Failed to load posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await API.deletePost(id);
      showToast('Post deleted successfully', 'success');
      setPosts((prev) => prev.filter((p) => (p.id || p._id) !== id));
      setSelectedPostIds((prev) => prev.filter((selectedId) => selectedId !== id));
    } catch (err) {
      showToast('Failed to delete post', 'error');
    }
  };

  const handleToggleStatus = async (post) => {
    const id = post.id || post._id;
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    try {
      await API.updatePost(id, { status: newStatus });
      showToast(`Post changed to ${newStatus}`, 'success');
      setPosts((prev) =>
        prev.map((p) => ((p.id || p._id) === id ? { ...p, status: newStatus } : p))
      );
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  // Checkbox select handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedPostIds(filteredPosts.map((p) => p.id || p._id));
    } else {
      setSelectedPostIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedPostIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Bulk Actions
  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedPostIds.length} selected posts?`)) return;
    try {
      await Promise.all(selectedPostIds.map((id) => API.deletePost(id)));
      showToast(`${selectedPostIds.length} posts deleted successfully`, 'success');
      setPosts((prev) => prev.filter((p) => !selectedPostIds.includes(p.id || p._id)));
      setSelectedPostIds([]);
    } catch (err) {
      showToast('Error executing bulk delete', 'error');
    }
  };

  const handleBulkStatusChange = async (targetStatus) => {
    try {
      await Promise.all(
        selectedPostIds.map((id) => API.updatePost(id, { status: targetStatus }))
      );
      showToast(`Selected posts updated to ${targetStatus}`, 'success');
      setPosts((prev) =>
        prev.map((p) =>
          selectedPostIds.includes(p.id || p._id) ? { ...p, status: targetStatus } : p
        )
      );
      setSelectedPostIds([]);
    } catch (err) {
      showToast('Error executing bulk status update', 'error');
    }
  };

  // Export articles as JSON file
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(posts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `posts_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Posts database exported as JSON', 'info');
  };

  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!isAdmin) {
      const currentId = currentUser?.id || currentUser?._id;
      const isOwner =
        (p.author?._id || p.author || p.authorId) === currentId ||
        p.authorName === currentUser?.name ||
        p.authorName === currentUser?.username;
      return matchesSearch && isOwner;
    }

    return matchesSearch;
  });

  return (
    <div className="admin-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-left">
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(true)}><i className="fas fa-bars"></i></button>
            <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Manage Posts</span>
          </div>
          <div className="topbar-right">
            <button className="btn-icon" onClick={toggleTheme}><i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i></button>
            <Link to="/" className="btn btn-secondary btn-icon"><i className="fas fa-external-link-alt"></i></Link>
            <button onClick={logout} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </header>

        <div className="admin-content">
          <div className="page-header">
            <div>
              <h1 style={{ fontSize: '1.75rem' }}>Posts Database</h1>
              <p className="page-title-desc">Manage, edit, publish, or delete your articles.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-secondary" onClick={handleExportJSON} title="Backup posts as JSON">
                <i className="fas fa-download"></i> Export Data
              </button>
              <Link to="/admin/editor" className="btn btn-primary"><i className="fas fa-plus"></i> New Post</Link>
            </div>
          </div>

          {/* Filter & Bulk Actions Toolbar */}
          <div className="dashboard-card" style={{ padding: '16px 24px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="search-container" style={{ maxWidth: '260px' }}>
                  <i className="fas fa-search search-icon"></i>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['', 'published', 'draft'].map((s) => (
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

              {/* Bulk Actions Menu (Visible when items selected) */}
              {selectedPostIds.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--primary)', color: '#fff', padding: '6px 14px', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{selectedPostIds.length} Selected</span>
                  <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem', background: '#fff', color: '#000' }} onClick={() => handleBulkStatusChange('published')}>
                    <i className="fas fa-check"></i> Publish All
                  </button>
                  <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem', background: '#fff', color: '#000' }} onClick={() => handleBulkStatusChange('draft')}>
                    <i className="fas fa-file-alt"></i> Draft All
                  </button>
                  <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem', background: 'var(--danger)', color: '#fff', border: 'none' }} onClick={handleBulkDelete}>
                    <i className="fas fa-trash"></i> Delete Selected
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Posts Table */}
          <div className="dashboard-card">
            <div className="table-responsive">
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--primary)' }}></i>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>
                        <input
                          type="checkbox"
                          onChange={handleSelectAll}
                          checked={filteredPosts.length > 0 && selectedPostIds.length === filteredPosts.length}
                        />
                      </th>
                      <th>Post Title</th>
                      <th>Category</th>
                      <th>Author</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Views</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPosts.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                          No posts found.
                        </td>
                      </tr>
                    ) : (
                      filteredPosts.map((post) => {
                        const id = post.id || post._id;
                        const isSelected = selectedPostIds.includes(id);
                        return (
                          <tr key={id} style={{ backgroundColor: isSelected ? 'rgba(79, 70, 229, 0.08)' : 'transparent' }}>
                            <td>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleSelectOne(id)}
                              />
                            </td>
                            <td>
                              <div className="table-post-cell">
                                <img
                                  src={post.coverImage}
                                  alt={post.title}
                                  className="table-post-img"
                                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800'; }}
                                />
                                <a href={`/post/${post.slug || id}`} target="_blank" rel="noreferrer" className="table-post-title">
                                  {post.title}
                                </a>
                              </div>
                            </td>
                            <td>{post.categoryName}</td>
                            <td>{post.authorName}</td>
                            <td>{new Date(post.publishDate || post.createdAt).toLocaleDateString()}</td>
                            <td>
                              <button
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                onClick={() => handleToggleStatus(post)}
                                title="Click to toggle status"
                              >
                                <span className={`badge ${post.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                                  {post.status} <i className="fas fa-sync-alt" style={{ marginLeft: '4px', fontSize: '0.7rem' }}></i>
                                </span>
                              </button>
                            </td>
                            <td>{post.views}</td>
                            <td>
                              <div className="actions-cell">
                                <button
                                  className="btn-action"
                                  title="Edit Post"
                                  onClick={() => navigate(`/admin/editor?id=${id}`)}
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button
                                  className="btn-action btn-action-delete"
                                  title="Delete Post"
                                  onClick={() => handleDelete(id, post.title)}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
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
