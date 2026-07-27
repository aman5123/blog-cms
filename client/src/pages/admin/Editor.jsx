import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../components/ToastContainer';
import { API } from '../../services/api';
import '../../styles/admin.css';

export default function Editor() {
  const { logout, currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  const autosaveRef = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState('published');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [autosaveTime, setAutosaveTime] = useState(null);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    API.getCategories().then(setCategories).catch(() => {});
    if (editId) loadPost(editId);
  }, [editId]);

  useEffect(() => {
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  }, [content]);

  // 30-second autosave
  useEffect(() => {
    if (!title && !content) return;
    if (autosaveRef.current) clearInterval(autosaveRef.current);
    autosaveRef.current = setInterval(() => {
      const draft = { title, content, categoryId, tags, coverImage, status };
      localStorage.setItem('cms_draft', JSON.stringify(draft));
      setAutosaveTime(new Date().toLocaleTimeString());
    }, 30000);
    return () => clearInterval(autosaveRef.current);
  }, [title, content, categoryId, tags, coverImage, status]);

  // Load saved draft on mount if no editId
  useEffect(() => {
    if (!editId) {
      const saved = localStorage.getItem('cms_draft');
      if (saved) {
        try {
          const draft = JSON.parse(saved);
          if (window.confirm('A draft was found. Restore it?')) {
            setTitle(draft.title || '');
            setContent(draft.content || '');
            setCategoryId(draft.categoryId || '');
            setTags(draft.tags || '');
            setCoverImage(draft.coverImage || '');
            setStatus(draft.status || 'published');
          } else {
            localStorage.removeItem('cms_draft');
          }
        } catch (e) {}
      }
    }
  }, []);

  const loadPost = async (id) => {
    setLoading(true);
    try {
      const post = await API.getPost(id);
      setTitle(post.title || '');
      setContent(post.content || '');
      setCategoryId(post.category || post.categoryId || '');
      setTags(Array.isArray(post.tags) ? post.tags.join(', ') : post.tags || '');
      setCoverImage(post.coverImage || '');
      setStatus(post.status || 'published');
    } catch (err) {
      showToast('Failed to load post', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Image Upload & Optimization Handler from Computer / Device
  const handleImageFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCoverImage(dataUrl);
        showToast('Image uploaded and optimized from computer!', 'success');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (publishStatus) => {
    if (!title.trim()) {
      showToast('Title is required', 'warning');
      return;
    }
    if (!content.trim()) {
      showToast('Article content cannot be empty', 'warning');
      return;
    }
    setSaving(true);
    const finalStatus = publishStatus || status;
    const payload = {
      title,
      content,
      categoryId: categoryId || (categories[0]?.id || categories[0]?._id),
      tags,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
      status: finalStatus,
      authorName: currentUser?.name || 'Author',
      authorAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    };

    try {
      if (editId) {
        await API.updatePost(editId, payload);
        showToast('Post updated successfully!', 'success');
        navigate('/admin/posts');
      } else {
        await API.createPost(payload);
        localStorage.removeItem('cms_draft');
        showToast(`Post ${finalStatus === 'published' ? 'published' : 'saved as draft'} successfully!`, 'success');
        navigate('/admin/posts');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save post', 'error');
    } finally {
      setSaving(false);
    }
  };

  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="admin-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-left">
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(true)}><i className="fas fa-bars"></i></button>
            <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{editId ? 'Edit Post' : 'Write New Post'}</span>
          </div>
          <div className="topbar-right">
            <button className="btn-icon" onClick={toggleTheme}><i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i></button>
            <Link to="/admin/posts" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
              <i className="fas fa-arrow-left"></i> Back to Posts
            </Link>
          </div>
        </header>

        <div className="admin-content">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px' }}>
              <i className="fas fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: 'var(--primary)' }}></i>
            </div>
          ) : (
            <div className="editor-grid">
              {/* Main Editor Panel */}
              <div className="editor-main-panel">
                <input
                  className="editor-title-input"
                  placeholder="Write a compelling headline..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                {/* Editor / Preview Toggle */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className={`category-tab ${!previewMode ? 'active' : ''}`}
                    onClick={() => setPreviewMode(false)}
                  >
                    <i className="fas fa-edit" style={{ marginRight: '6px' }}></i> Write
                  </button>
                  <button
                    className={`category-tab ${previewMode ? 'active' : ''}`}
                    onClick={() => setPreviewMode(true)}
                  >
                    <i className="fas fa-eye" style={{ marginRight: '6px' }}></i> Preview
                  </button>
                  <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                    {wordCount} words &bull; ~{readingTime} min read
                  </span>
                </div>

                {!previewMode ? (
                  <textarea
                    className="editor-rich-textarea"
                    placeholder="Start writing your article here... HTML is supported (e.g. <h2>, <p>, <strong>, <ul>)"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                ) : (
                  <div
                    className="editor-live-preview active preview-content"
                    dangerouslySetInnerHTML={{ __html: content || '<p style="color: var(--text-muted);">Nothing to preview yet...</p>' }}
                  />
                )}

                {autosaveTime && (
                  <div className="autosave-indicator">
                    <div className="autosave-dot"></div>
                    Draft autosaved at {autosaveTime}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="editor-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleSave('draft')}
                    disabled={saving}
                  >
                    <i className="fas fa-save"></i> Save Draft
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleSave('published')}
                    disabled={saving}
                  >
                    {saving ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-paper-plane"></i> Publish Article</>}
                  </button>
                </div>
              </div>

              {/* Sidebar Options Panel */}
              <div className="editor-options-panel">
                {/* Cover Image with Local Computer Upload Option */}
                <div className="editor-option-group">
                  <label className="form-label">Cover Image</label>
                  
                  {/* Local Device Upload Button */}
                  <div style={{ marginBottom: '10px' }}>
                    <label
                      htmlFor="cover-file-upload"
                      className="btn btn-secondary"
                      style={{ width: '100%', justifyContent: 'center', cursor: 'pointer', fontSize: '0.88rem' }}
                    >
                      <i className="fas fa-upload" style={{ marginRight: '6px' }}></i> Upload from Computer
                    </label>
                    <input
                      id="cover-file-upload"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleImageFileUpload}
                    />
                  </div>

                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textAlign: 'center' }}>
                    — OR Paste Image URL —
                  </span>

                  <input
                    type="text"
                    className="editor-input"
                    placeholder="https://..."
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                  />

                  {coverImage && (
                    <div style={{ marginTop: '10px', position: 'relative' }}>
                      <img
                        src={coverImage}
                        alt="Cover Preview"
                        style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <button
                        type="button"
                        onClick={() => setCoverImage('')}
                        style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}
                      >
                        &times;
                      </button>
                    </div>
                  )}
                </div>

                {/* Category */}
                <div className="editor-option-group">
                  <label className="form-label">Category</label>
                  <select
                    className="editor-select"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <option value="">Select a category...</option>
                    {categories.map((cat) => (
                      <option key={cat.id || cat._id} value={cat.id || cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div className="editor-option-group">
                  <label className="form-label">Tags <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(comma-separated)</span></label>
                  <input
                    type="text"
                    className="editor-input"
                    placeholder="React, NodeJS, Technology..."
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </div>

                {/* Status */}
                <div className="editor-option-group">
                  <label className="form-label">Publication Status</label>
                  <select
                    className="editor-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                {/* Quick Stats */}
                <div style={{ background: 'var(--background)', borderRadius: 'var(--radius-sm)', padding: '16px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Word Count</span>
                    <strong>{wordCount}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Reading Time</span>
                    <strong>~{readingTime} min</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Characters</span>
                    <strong>{content.replace(/<[^>]*>/g, '').length}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
