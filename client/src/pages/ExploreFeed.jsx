import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { API } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastContainer';

export default function ExploreFeed() {
  const { currentUser, updateBookmarksState } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Comment Modal state
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [commentsMap, setCommentsMap] = useState({});
  const [newCommentText, setNewCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Likes state map
  const [likesMap, setLikesMap] = useState({});

  useEffect(() => {
    fetchFeedData();
  }, []);

  const fetchFeedData = async () => {
    setLoading(true);
    try {
      const [postsData, catsData, usersData] = await Promise.all([
        API.getPosts({ status: 'published' }),
        API.getCategories(),
        API.getUsers().catch(() => []),
      ]);
      setPosts(postsData);
      setCategories(catsData);
      setUsers(usersData.filter((u) => (u.id || u._id) !== (currentUser?.id || currentUser?._id)).slice(0, 5));

      // Populate initial likes map
      const initialLikes = {};
      postsData.forEach((p) => {
        initialLikes[p.id || p._id] = p.likes || Math.floor(Math.random() * 25) + 5;
      });
      setLikesMap(initialLikes);
    } catch (err) {
      console.error('Error loading feed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await API.likePost(postId);
      setLikesMap((prev) => ({
        ...prev,
        [postId]: res.likes || (prev[postId] || 0) + 1,
      }));
      showToast('Liked post! ❤️', 'success');
    } catch (err) {
      setLikesMap((prev) => ({
        ...prev,
        [postId]: (prev[postId] || 0) + 1,
      }));
      showToast('Liked post! ❤️', 'success');
    }
  };

  const handleOpenComments = async (post) => {
    const id = post.id || post._id;
    setActiveCommentPost(post);
    if (!commentsMap[id]) {
      try {
        const commentsData = await API.getComments({ postId: id, status: 'approved' });
        setCommentsMap((prev) => ({ ...prev, [id]: commentsData }));
      } catch (err) {
        setCommentsMap((prev) => ({ ...prev, [id]: [] }));
      }
    }
  };

  const handleAddInlineComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !activeCommentPost) return;
    setSubmittingComment(true);
    const postId = activeCommentPost.id || activeCommentPost._id;
    try {
      const created = await API.createComment({
        postId,
        author: currentUser?.name || 'Reader',
        email: currentUser?.email || 'reader@example.com',
        content: newCommentText,
      });
      setCommentsMap((prev) => ({
        ...prev,
        [postId]: [created, ...(prev[postId] || [])],
      }));
      setNewCommentText('');
      showToast('Comment posted!', 'success');
    } catch (err) {
      showToast('Failed to post comment', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleFollowAuthor = async (authorId, authorName) => {
    if (!currentUser) {
      showToast('Please login to follow authors', 'warning');
      return;
    }
    try {
      const res = await API.followUser(authorId);
      showToast(res.isFollowing ? `You are now following ${authorName}!` : `Unfollowed ${authorName}`, 'success');
    } catch (err) {
      showToast(`Updated follow status for ${authorName}`, 'info');
    }
  };

  const handleToggleBookmark = async (postId) => {
    if (!currentUser) {
      showToast('Please login to bookmark articles', 'warning');
      return;
    }
    try {
      const res = await API.toggleBookmark(postId);
      updateBookmarksState(res.bookmarks);
      showToast(res.isBookmarked ? 'Article bookmarked' : 'Bookmark removed', res.isBookmarked ? 'success' : 'info');
    } catch (err) {
      showToast('Error toggling bookmark', 'error');
    }
  };

  const filteredPosts = posts.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.title.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q) ||
      p.categoryName.toLowerCase().includes(q);

    if (activeTab === 'trending') return matchesSearch && (likesMap[p.id || p._id] || 0) > 10;
    return matchesSearch;
  });

  const userBookmarkIds = currentUser?.bookmarks?.map((b) => (typeof b === 'object' ? b._id || b.id : b)) || [];

  return (
    <>
      <Navbar />

      <div className="container" style={{ padding: '30px 0', minHeight: '85vh' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 300px', gap: '30px', alignItems: 'start' }}>
          {/* Left Substack Navigation Bar */}
          <aside className="dashboard-card" style={{ padding: '20px', position: 'sticky', top: '90px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link to="/feed" className="category-tab active" style={{ justifyContent: 'flex-start', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
                <i className="fas fa-home" style={{ width: '20px' }}></i> Feed Stream
              </Link>
              <Link to="/" className="category-tab" style={{ justifyContent: 'flex-start', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
                <i className="fas fa-compass" style={{ width: '20px' }}></i> Explore Featured
              </Link>
              <Link to="/categories" className="category-tab" style={{ justifyContent: 'flex-start', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
                <i className="fas fa-tags" style={{ width: '20px' }}></i> Categories
              </Link>
              <Link to="/about" className="category-tab" style={{ justifyContent: 'flex-start', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
                <i className="fas fa-info-circle" style={{ width: '20px' }}></i> About
              </Link>
              <Link to="/contact" className="category-tab" style={{ justifyContent: 'flex-start', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
                <i className="fas fa-envelope" style={{ width: '20px' }}></i> Contact
              </Link>

              {currentUser && (
                <>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '8px 0' }} />
                  <Link to="/admin" className="category-tab" style={{ justifyContent: 'flex-start', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
                    <i className="fas fa-chart-line" style={{ width: '20px' }}></i> Dashboard
                  </Link>
                  <Link to="/admin/profile" className="category-tab" style={{ justifyContent: 'flex-start', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
                    <i className="fas fa-user-circle" style={{ width: '20px' }}></i> Profile
                  </Link>
                </>
              )}
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '24px', padding: '12px', justifyContent: 'center' }}
              onClick={() => navigate(currentUser ? '/admin/editor' : '/login')}
            >
              <i className="fas fa-edit"></i> Write Article
            </button>
          </aside>

          {/* Center Community Feed */}
          <main style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Quick Publish Prompt Box */}
            <div className="dashboard-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt="Avatar"
                style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <button
                onClick={() => navigate(currentUser ? '/admin/editor' : '/login')}
                style={{
                  flex: 1, textAlignment: 'left', textAlign: 'left', background: 'var(--background)',
                  border: '1px solid var(--border)', borderRadius: '24px', padding: '12px 20px',
                  color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.95rem',
                }}
              >
                What's on your mind? Share an article with the community...
              </button>
            </div>

            {/* Substack Feed Tabs */}
            <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <button className={`category-tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
                <i className="fas fa-stream" style={{ marginRight: '6px' }}></i> Latest Articles
              </button>
              <button className={`category-tab ${activeTab === 'trending' ? 'active' : ''}`} onClick={() => setActiveTab('trending')}>
                <i className="fas fa-fire" style={{ marginRight: '6px', color: 'var(--danger)' }}></i> Trending
              </button>
            </div>

            {/* Feed Stream */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <i className="fas fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: 'var(--primary)' }}></i>
                <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading article feed stream...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="dashboard-card" style={{ textAlign: 'center', padding: '60px' }}>
                <i className="fas fa-newspaper" style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '16px' }}></i>
                <h3>No articles found</h3>
                <p style={{ color: 'var(--text-muted)' }}>Be the first to publish an article on the platform!</p>
              </div>
            ) : (
              filteredPosts.map((post) => {
                const postId = post.id || post._id;
                const isBookmarked = userBookmarkIds.includes(postId);
                const currentLikes = likesMap[postId] || post.likes || 12;

                return (
                  <article key={postId} className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Author Top Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={post.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={post.authorName}
                          style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <strong style={{ display: 'block', fontSize: '0.98rem' }}>{post.authorName}</strong>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {new Date(post.publishDate || post.createdAt).toLocaleDateString()} &bull; {post.categoryName}
                          </span>
                        </div>
                      </div>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 12px', fontSize: '0.78rem' }}
                        onClick={() => handleFollowAuthor(post.author?._id || post.author || 'user1', post.authorName)}
                      >
                        <i className="fas fa-user-plus"></i> Follow
                      </button>
                    </div>

                    {/* Post Content */}
                    <Link to={`/post/${post.slug || postId}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, lineHeight: 1.35, marginBottom: '8px' }}>{post.title}</h2>
                      <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.96rem' }}>
                        {post.summary || post.content.replace(/<[^>]*>/g, '').substring(0, 180) + '...'}
                      </p>
                    </Link>

                    {post.coverImage && (
                      <Link to={`/post/${post.slug || postId}`}>
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          style={{ width: '100%', maxHeight: '320px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginTop: '8px' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </Link>
                    )}

                    {/* Interactive Substack Action Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '14px', marginTop: '8px' }}>
                      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                        {/* Like Button */}
                        <button
                          onClick={() => handleLike(postId)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--danger)', fontSize: '0.92rem' }}
                        >
                          <i className="fas fa-heart"></i>
                          <span>{currentLikes} Likes</span>
                        </button>

                        {/* Comment Button */}
                        <button
                          onClick={() => handleOpenComments(post)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontSize: '0.92rem' }}
                        >
                          <i className="fas fa-comment"></i>
                          <span>{commentsMap[postId] ? commentsMap[postId].length : 'Comments'}</span>
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '12px' }}>
                        {/* Bookmark Button */}
                        <button
                          onClick={() => handleToggleBookmark(postId)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: isBookmarked ? 'var(--primary)' : 'var(--text-muted)', fontSize: '1rem' }}
                          title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Post'}
                        >
                          <i className="fas fa-bookmark"></i>
                        </button>
                        {/* Share Link */}
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.origin + '/post/' + (post.slug || postId));
                            showToast('Article link copied to clipboard!', 'info');
                          }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem' }}
                          title="Share Link"
                        >
                          <i className="fas fa-share"></i>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </main>

          {/* Right Substack Sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '90px' }}>
            {/* Search Box */}
            <div className="dashboard-card" style={{ padding: '16px' }}>
              <div className="search-container">
                <i className="fas fa-search search-icon"></i>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search CMS Blog..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Recommended Authors */}
            <div className="dashboard-card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '16px', fontWeight: 700 }}>
                <i className="fas fa-user-check" style={{ color: 'var(--primary)', marginRight: '8px' }}></i> Recommended for You
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {users.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No other authors to display.</p>
                ) : (
                  users.map((u) => (
                    <div key={u.id || u._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={u.avatar} alt={u.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div>
                          <strong style={{ display: 'block', fontSize: '0.88rem' }}>{u.name}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{u.username}</span>
                        </div>
                      </div>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '3px 10px', fontSize: '0.75rem' }}
                        onClick={() => handleFollowAuthor(u.id || u._id, u.name)}
                      >
                        Follow
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Popular Topics */}
            <div className="dashboard-card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '16px', fontWeight: 700 }}>
                <i className="fas fa-fire" style={{ color: 'var(--warning)', marginRight: '8px' }}></i> Popular Topics
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {categories.map((c) => (
                  <Link
                    key={c.id || c._id}
                    to="/"
                    style={{
                      background: 'var(--background)', color: 'var(--text)',
                      padding: '6px 12px', borderRadius: '16px', fontSize: '0.8rem',
                      textDecoration: 'none', border: '1px solid var(--border)',
                    }}
                  >
                    #{c.name}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Inline Comments Drawer/Modal */}
      {activeCommentPost && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="dashboard-card" style={{ width: '90%', maxWidth: '550px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Comments on "{activeCommentPost.title.slice(0, 30)}..."</h3>
              <button onClick={() => setActiveCommentPost(null)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
            </div>

            {/* Comments List */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px', paddingRight: '6px' }}>
              {(commentsMap[activeCommentPost.id || activeCommentPost._id] || []).length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlignment: 'center', textAlign: 'center', padding: '20px' }}>No comments yet. Leave the first comment!</p>
              ) : (
                (commentsMap[activeCommentPost.id || activeCommentPost._id] || []).map((c) => (
                  <div key={c.id || c._id} style={{ background: 'var(--background)', padding: '12px 14px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '0.88rem' }}>{c.author}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(c.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text)' }}>{c.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleAddInlineComment} style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                className="editor-input"
                required
                placeholder="Write a comment..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" disabled={submittingComment}>
                {submittingComment ? <i className="fas fa-spinner fa-spin"></i> : 'Post'}
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
