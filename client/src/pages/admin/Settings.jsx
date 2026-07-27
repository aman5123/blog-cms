import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../components/ToastContainer';
import { API } from '../../services/api';
import '../../styles/admin.css';

export default function Settings() {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState({
    siteTitle: '',
    siteDescription: '',
    postsPerPage: 6,
    allowRegistration: true,
    allowComments: true,
    requireCommentApproval: true,
    maintenanceMode: false,
  });
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySlug, setNewCategorySlug] = useState('');

  useEffect(() => {
    API.getSettings().then(setSettings).catch(() => {});
    API.getCategories().then(setCategories).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await API.updateSettings(settings);
      showToast('Settings saved successfully!', 'success');
    } catch (err) {
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    const slug = newCategorySlug || newCategoryName.toLowerCase().replace(/\s+/g, '-');
    try {
      const created = await API.createCategory({ name: newCategoryName, slug });
      setCategories((prev) => [...prev, created]);
      setNewCategoryName('');
      setNewCategorySlug('');
      showToast('Category added!', 'success');
    } catch (err) {
      showToast('Failed to add category', 'error');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await API.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => (c.id || c._id) !== id));
      showToast('Category deleted', 'success');
    } catch (err) {
      showToast('Failed to delete category', 'error');
    }
  };

  const handleToggle = (key) => setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="admin-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-left">
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(true)}><i className="fas fa-bars"></i></button>
            <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Site Settings</span>
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
              <h1 style={{ fontSize: '1.75rem' }}>Settings</h1>
              <p className="page-title-desc">Configure your blog platform preferences.</p>
            </div>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-save"></i> Save Changes</>}
            </button>
          </div>

          <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: '1fr 1fr' }}>
            {/* General Settings */}
            <div className="dashboard-card">
              <h2 style={{ marginBottom: '20px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.8rem' }}>
                <i className="fas fa-globe" style={{ marginRight: '8px' }}></i> General
              </h2>

              <div className="editor-option-group">
                <label className="form-label">Site Title</label>
                <input
                  type="text"
                  className="editor-input"
                  value={settings.siteTitle}
                  onChange={(e) => setSettings((p) => ({ ...p, siteTitle: e.target.value }))}
                />
              </div>
              <div className="editor-option-group">
                <label className="form-label">Site Description</label>
                <textarea
                  className="editor-input"
                  style={{ height: '80px', resize: 'vertical' }}
                  value={settings.siteDescription}
                  onChange={(e) => setSettings((p) => ({ ...p, siteDescription: e.target.value }))}
                />
              </div>
              <div className="editor-option-group">
                <label className="form-label">Posts Per Page</label>
                <input
                  type="number"
                  className="editor-input"
                  min="1"
                  max="50"
                  value={settings.postsPerPage}
                  onChange={(e) => setSettings((p) => ({ ...p, postsPerPage: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            {/* Feature Toggles */}
            <div className="dashboard-card">
              <h2 style={{ marginBottom: '20px', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                <i className="fas fa-toggle-on" style={{ marginRight: '8px' }}></i> Feature Toggles
              </h2>
              {[
                { key: 'allowRegistration', label: 'Allow New Registrations', icon: 'fa-user-plus' },
                { key: 'allowComments', label: 'Allow Comments', icon: 'fa-comments' },
                { key: 'requireCommentApproval', label: 'Require Comment Approval', icon: 'fa-shield-alt' },
                { key: 'maintenanceMode', label: 'Maintenance Mode', icon: 'fa-tools', danger: true },
              ].map(({ key, label, icon, danger }) => (
                <div
                  key={key}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px 0', borderBottom: '1px solid var(--border)',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', color: danger && settings[key] ? 'var(--danger)' : 'var(--text)' }}>
                    <i className={`fas ${icon}`} style={{ width: '18px', textAlign: 'center', color: 'var(--primary)' }}></i>
                    {label}
                  </span>
                  <button
                    onClick={() => handleToggle(key)}
                    style={{
                      width: '48px', height: '26px', borderRadius: '13px',
                      background: settings[key] ? (danger ? 'var(--danger)' : 'var(--primary)') : 'var(--border)',
                      border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.3s',
                    }}
                  >
                    <span style={{
                      width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
                      position: 'absolute', top: '3px',
                      left: settings[key] ? '25px' : '3px',
                      transition: 'left 0.3s',
                    }} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Categories Management */}
          <div className="dashboard-card">
            <h2 style={{ marginBottom: '20px', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              <i className="fas fa-tags" style={{ marginRight: '8px' }}></i> Manage Categories
            </h2>

            {/* Add Category Form */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <input
                type="text"
                className="editor-input"
                placeholder="Category name..."
                style={{ flex: '1', minWidth: '150px' }}
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <input
                type="text"
                className="editor-input"
                placeholder="Slug (optional)"
                style={{ flex: '1', minWidth: '150px' }}
                value={newCategorySlug}
                onChange={(e) => setNewCategorySlug(e.target.value)}
              />
              <button className="btn btn-primary" onClick={handleAddCategory}>
                <i className="fas fa-plus"></i> Add
              </button>
            </div>

            {/* Categories List */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {categories.map((cat) => {
                const id = cat.id || cat._id;
                return (
                  <div key={id} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    background: 'var(--primary)', color: '#fff',
                    padding: '8px 14px', borderRadius: '20px', fontSize: '0.88rem',
                  }}>
                    <span>{cat.name}</span>
                    <span style={{ opacity: 0.7 }}>({cat.postCount || 0})</span>
                    <button
                      onClick={() => handleDeleteCategory(id)}
                      style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0', lineHeight: 1 }}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                );
              })}
              {categories.length === 0 && (
                <p style={{ color: 'var(--text-muted)' }}>No categories yet.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
