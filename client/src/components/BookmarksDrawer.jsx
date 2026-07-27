import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from './ToastContainer';
import { API } from '../services/api';

export default function BookmarksDrawer({ isOpen, onClose }) {
  const { currentUser, updateBookmarksState } = useAuth();
  const { showToast } = useToast();
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser) {
      fetchBookmarks();
    }
  }, [isOpen, currentUser]);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const user = await API.getMe();
      setBookmarkedPosts(user.bookmarks || []);
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (postId) => {
    try {
      const res = await API.toggleBookmark(postId);
      updateBookmarksState(res.bookmarks);
      setBookmarkedPosts((prev) => prev.filter((p) => (p._id || p.id) !== postId));
      showToast('Bookmark removed', 'info');
    } catch (err) {
      showToast('Failed to remove bookmark', 'error');
    }
  };

  return (
    <>
      <div className={`drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
      <div className={`bookmarks-drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="drawer-title">
            <i className="fas fa-bookmark" style={{ marginRight: '8px', color: 'var(--primary)' }}></i>
            Bookmarked Posts
          </div>
          <button className="drawer-close" onClick={onClose}>&times;</button>
        </div>

        <div className="drawer-content">
          {!currentUser ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>
              <i className="fas fa-user-lock" style={{ fontSize: '2.5rem', marginBottom: '16px', display: 'block' }}></i>
              <p>Please <Link to="/login" onClick={onClose} style={{ color: 'var(--primary)', fontWeight: 600 }}>Login</Link> to bookmark articles.</p>
            </div>
          ) : loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--primary)' }}></i>
            </div>
          ) : bookmarkedPosts.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>
              <i className="fas fa-folder-open" style={{ fontSize: '2.5rem', marginBottom: '16px', display: 'block' }}></i>
              <p>No bookmarked articles yet.</p>
            </div>
          ) : (
            bookmarkedPosts.map((post) => {
              const postId = post._id || post.id;
              return (
                <div className="bookmark-item" key={postId}>
                  <img src={post.coverImage || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150'} alt={post.title} className="bookmark-item-img" />
                  <div className="bookmark-item-details">
                    <Link to={`/post/${post.slug || postId}`} onClick={onClose} className="bookmark-item-title">
                      {post.title}
                    </Link>
                    <div className="bookmark-item-meta">
                      <span>{post.readingTime}</span>
                      <button className="bookmark-remove-btn" onClick={() => handleRemoveBookmark(postId)}>Remove</button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
