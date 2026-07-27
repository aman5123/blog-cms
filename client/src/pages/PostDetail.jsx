import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { API } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastContainer';

export default function PostDetail() {
  const { slug } = useParams();
  const { currentUser, updateBookmarksState } = useAuth();
  const { showToast } = useToast();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrollWidth, setScrollWidth] = useState(0);

  // Comment Form State
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchPostData();
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (height > 0) {
        setScrollWidth((winScroll / height) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchPostData = async () => {
    setLoading(true);
    try {
      const data = await API.getPost(slug);
      setPost(data);

      if (data) {
        const [commentsData, relatedData] = await Promise.all([
          API.getComments({ postId: data.id || data._id, status: 'approved' }),
          API.getPosts({ status: 'published', categoryId: data.categoryId || data.category }),
        ]);
        setComments(commentsData);
        setRelatedPosts(relatedData.filter((p) => (p.id || p._id) !== (data.id || data._id)).slice(0, 3));
      }
    } catch (err) {
      console.error('Error fetching post:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (!currentUser) {
      showToast('Please login to bookmark articles', 'warning');
      return;
    }
    const postId = post.id || post._id;
    try {
      const res = await API.toggleBookmark(postId);
      updateBookmarksState(res.bookmarks);
      showToast(res.isBookmarked ? 'Article bookmarked' : 'Bookmark removed', res.isBookmarked ? 'success' : 'info');
    } catch (err) {
      showToast('Error toggling bookmark', 'error');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentAuthor || !commentEmail || !commentContent) return;

    setSubmittingComment(true);
    try {
      await API.createComment({
        postId: post.id || post._id,
        author: commentAuthor,
        email: commentEmail,
        content: commentContent,
      });
      showToast('Comment submitted successfully!', 'success');
      setCommentContent('');
      fetchPostData();
    } catch (err) {
      showToast('Failed to submit comment', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  const userBookmarkIds = currentUser?.bookmarks?.map(b => (typeof b === 'object' ? b._id || b.id : b)) || [];
  const isBookmarked = post ? userBookmarkIds.includes(post.id || post._id) : false;

  return (
    <>
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${scrollWidth}%` }}></div>
      </div>

      <Navbar />

      <main className="container" style={{ padding: '40px 0' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: 'var(--primary)' }}></i>
            <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Fetching article content...</p>
          </div>
        ) : !post ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
            <i className="fas fa-exclamation-triangle" style={{ fontSize: '4rem', color: 'var(--danger)', marginBottom: '24px' }}></i>
            <h2>Article Not Found</h2>
            <Link to="/" className="btn btn-primary" style={{ marginTop: '20px' }}>Back to Home</Link>
          </div>
        ) : (
          <>
            <header className="post-header" style={{ textAlign: 'center', maxWidth: '800px', margin: '40px auto 30px' }}>
              <span className="hero-tag" style={{ marginBottom: '16px' }}>{post.categoryName}</span>
              <h1 style={{ fontSize: '2.75rem', marginBottom: '24px', fontWeight: 800 }}>{post.title}</h1>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src={post.authorAvatar} alt={post.authorName} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                  <span style={{ fontWeight: 600, color: 'var(--text)' }}>{post.authorName}</span>
                </div>
                <span>&bull;</span>
                <span>{new Date(post.publishDate).toLocaleDateString()}</span>
                <span>&bull;</span>
                <span>{post.readingTime}</span>
                <span>&bull;</span>
                <button
                  className={`btn btn-secondary btn-icon ${isBookmarked ? 'active' : ''}`}
                  style={{ width: '34px', height: '34px' }}
                  onClick={handleToggleBookmark}
                  title="Bookmark Post"
                >
                  <i className="fas fa-bookmark"></i>
                </button>
              </div>
            </header>

            <div style={{ maxWidth: '900px', margin: '0 auto 40px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
              <img src={post.coverImage} alt={post.title} style={{ width: '100%', maxHeight: '480px', objectFit: 'cover' }} />
            </div>

            <article className="post-content-body" style={{ maxWidth: '740px', margin: '0 auto 60px', fontSize: '1.15rem', lineHeight: 1.8, color: 'var(--text)' }} dangerouslySetInnerHTML={{ __html: post.content }}>
            </article>

            {/* Author Bio Card */}
            <div style={{ maxWidth: '740px', margin: '0 auto 60px', padding: '30px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <img src={post.authorAvatar} alt={post.authorName} style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>Written by {post.authorName}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{post.authorBio || 'Tech enthusiast, writer, and editor for our CMS journal ecosystem.'}</p>
                </div>
              </div>
              <button
                className="btn btn-primary"
                onClick={async () => {
                  if (!currentUser) {
                    showToast('Please login to follow authors', 'warning');
                    return;
                  }
                  try {
                    const authorId = post.author?._id || post.author || 'user1';
                    const res = await API.followUser(authorId);
                    showToast(res.isFollowing ? `You are now following ${post.authorName}!` : `Unfollowed ${post.authorName}`, 'success');
                  } catch (err) {
                    showToast('Follow status updated', 'info');
                  }
                }}
              >
                <i className="fas fa-user-plus"></i> Follow Author
              </button>
            </div>

            {/* Related Articles */}
            {relatedPosts.length > 0 && (
              <section style={{ borderTop: '1px solid var(--border)', paddingTop: '40px', marginBottom: '60px' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Related Articles</h3>
                <div className="posts-grid">
                  {relatedPosts.map((rPost) => (
                    <article key={rPost.id || rPost._id} className="blog-card">
                      <div className="card-img-wrapper" style={{ height: '160px' }}>
                        <Link to={`/post/${rPost.slug || rPost.id}`}>
                          <img src={rPost.coverImage} alt={rPost.title} className="card-img" />
                        </Link>
                      </div>
                      <div className="card-body" style={{ padding: '16px', gap: '10px' }}>
                        <span className="card-category" style={{ fontSize: '0.75rem' }}>{rPost.categoryName}</span>
                        <h3 className="card-title" style={{ fontSize: '1.1rem' }}>
                          <Link to={`/post/${rPost.slug || rPost.id}`}>{rPost.title}</Link>
                        </h3>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* Comments Section */}
            <section style={{ borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Comments ({comments.length})</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
                {comments.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No comments yet. Be the first to leave a comment!</p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id || c._id} style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '20px', display: 'flex', gap: '16px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                        {c.author.substring(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                          <h5 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)' }}>{c.author}</h5>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(c.date || c.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p style={{ fontSize: '0.95rem', color: 'var(--text)' }}>{c.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Leave Comment Form */}
              <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '30px' }}>
                <h4 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Leave a Comment</h4>
                <form onSubmit={handleCommentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Name</label>
                      <input type="text" className="editor-input" required value={commentAuthor} onChange={(e) => setCommentAuthor(e.target.value)} placeholder="Jane Doe" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input type="email" className="editor-input" required value={commentEmail} onChange={(e) => setCommentEmail(e.target.value)} placeholder="jane@example.com" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Comment</label>
                    <textarea className="editor-input" style={{ minHeight: '120px', resize: 'vertical' }} required value={commentContent} onChange={(e) => setCommentContent(e.target.value)} placeholder="Type your comment here..."></textarea>
                  </div>
                  <button type="submit" disabled={submittingComment} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                    {submittingComment ? 'Submitting...' : 'Submit Comment'}
                  </button>
                </form>
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </>
  );
}
