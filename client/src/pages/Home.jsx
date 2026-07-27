import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { API } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastContainer';

export default function Home() {
  const { currentUser, updateBookmarksState } = useAuth();
  const { showToast } = useToast();

  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchFilteredPosts();
  }, [activeCategory, searchQuery]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catsData, postsData] = await Promise.all([
        API.getCategories(),
        API.getPosts({ status: 'published' }),
      ]);
      setCategories(catsData);
      setPosts(postsData);
    } catch (err) {
      console.error('Error loading home data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredPosts = async () => {
    try {
      const filtered = await API.getPosts({
        status: 'published',
        categoryId: activeCategory,
        search: searchQuery,
      });
      setPosts(filtered);
    } catch (err) {
      console.error('Error filtering posts:', err);
    }
  };

  const handleToggleBookmark = async (e, postId) => {
    e.preventDefault();
    e.stopPropagation();
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

  const userBookmarkIds = currentUser?.bookmarks?.map(b => (typeof b === 'object' ? b._id || b.id : b)) || [];
  const heroPost = posts[0];

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          {loading ? (
            <div style={{ textAlignment: 'center', padding: '60px 0', textAlign: 'center' }}>
              <i className="fas fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: 'var(--primary)' }}></i>
            </div>
          ) : heroPost ? (
            <div className="hero-grid">
              <div className="hero-content">
                <span className="hero-tag">{heroPost.categoryName}</span>
                <h1 className="hero-title">
                  <Link to={`/post/${heroPost.slug || heroPost.id}`}>{heroPost.title}</Link>
                </h1>
                <p className="hero-desc">{heroPost.summary || heroPost.content.replace(/<[^>]*>/g, '').substring(0, 160) + '...'}</p>
                <div className="hero-meta">
                  <img src={heroPost.authorAvatar} alt={heroPost.authorName} className="hero-author-img" />
                  <div>
                    <span style={{ fontWeight: 600, display: 'block', color: 'var(--text)' }}>{heroPost.authorName}</span>
                    <span>{new Date(heroPost.publishDate).toLocaleDateString()} &bull; {heroPost.readingTime}</span>
                  </div>
                </div>
              </div>

              <div className="hero-image-wrapper">
                <Link to={`/post/${heroPost.slug || heroPost.id}`}>
                  <img src={heroPost.coverImage} alt={heroPost.title} className="hero-image" />
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Filter & Articles Grid */}
      <main className="container" style={{ padding: '40px 0' }}>
        <h2 style={{ fontSize: '1.85rem', marginBottom: '8px' }}>Explore Articles</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Filter posts by interest categories or search using keywords</p>

        <div className="filter-search-bar">
          <div className="categories-tabs">
            <button
              className={`category-tab ${activeCategory === '' ? 'active' : ''}`}
              onClick={() => setActiveCategory('')}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id || cat._id}
                className={`category-tab ${activeCategory === (cat.id || cat._id) ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id || cat._id)}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="search-container">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              className="search-input"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Posts Grid */}
        <div className="posts-grid">
          {posts.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)', padding: '60px 0' }}>
              <i className="fas fa-search" style={{ fontSize: '3rem', marginBottom: '16px', display: 'block' }}></i>
              <h3>No posts found matching criteria</h3>
              <p>Try refining your search keyword or selected category tab.</p>
            </div>
          ) : (
            posts.map((post) => {
              const postId = post.id || post._id;
              const isBookmarked = userBookmarkIds.includes(postId);
              const excerpt = (post.summary || post.content.replace(/<[^>]*>/g, '')).substring(0, 110) + '...';

              return (
                <article key={postId} className="blog-card">
                  <div className="card-img-wrapper">
                    <Link to={`/post/${post.slug || postId}`}>
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="card-img"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800';
                        }}
                      />
                    </Link>
                    <button
                      className={`card-bookmark-btn ${isBookmarked ? 'active' : ''}`}
                      onClick={(e) => handleToggleBookmark(e, postId)}
                      title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Post'}
                    >
                      <i className="fas fa-bookmark"></i>
                    </button>
                  </div>
                  <div className="card-body">
                    <span className="card-category">{post.categoryName}</span>
                    <h3 className="card-title">
                      <Link to={`/post/${post.slug || postId}`}>{post.title}</Link>
                    </h3>
                    <p className="card-excerpt">{excerpt}</p>
                    <div className="card-footer">
                      <div className="card-author">
                        <img src={post.authorAvatar} alt={post.authorName} className="card-author-img" />
                        <span className="card-author-name">{post.authorName}</span>
                      </div>
                      <span className="card-date">{new Date(post.publishDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
