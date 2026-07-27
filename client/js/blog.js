// blog.js - Public Blog UI Logic and Shared Layout Utilities
import { API } from './api.js';

// --- TOAST NOTIFICATIONS SYSTEM ---
export function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconClass = 'fa-info-circle';
  if (type === 'success') iconClass = 'fa-check-circle';
  if (type === 'error') iconClass = 'fa-exclamation-circle';
  if (type === 'warning') iconClass = 'fa-exclamation-triangle';

  toast.innerHTML = `
    <i class="fas ${iconClass} toast-icon"></i>
    <div class="toast-content">
      <div class="toast-title">${type.toUpperCase()}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close">&times;</button>
  `;

  container.appendChild(toast);

  // Close event listener
  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  });

  // Auto-remove after 4 seconds
  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }
  }, 4000);
}

// --- THEME MANAGEMENT SYSTEM ---
export function initTheme() {
  const savedTheme = localStorage.getItem('cms_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeToggleIcon(savedTheme);
}

export function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('cms_theme', newTheme);
  updateThemeToggleIcon(newTheme);
  showToast(`Switched to ${newTheme} mode`, 'info');
}

function updateThemeToggleIcon(theme) {
  const themeIcon = document.getElementById('theme-icon');
  if (themeIcon) {
    if (theme === 'dark') {
      themeIcon.className = 'fas fa-sun';
    } else {
      themeIcon.className = 'fas fa-moon';
    }
  }
}

// --- NAVBAR RENDERING & SESSION WATCHER ---
export async function renderNavbar() {
  const navActions = document.getElementById('nav-actions-container');
  if (!navActions) return;

  const currentUser = await API.getCurrentUser();

  if (currentUser) {
    const isAdminOrAuthor = currentUser.role === 'admin' || currentUser.role === 'author';
    navActions.innerHTML = `
      <button class="btn-icon" id="theme-toggle" title="Toggle Theme"><i id="theme-icon" class="fas fa-moon"></i></button>
      <button class="btn-icon" id="bookmarks-toggle" title="View Bookmarks"><i class="fas fa-bookmark"></i></button>
      ${isAdminOrAuthor ? `<a href="../admin/dashboard.html" class="btn btn-primary"><i class="fas fa-chart-line"></i> Dashboard</a>` : ''}
      <button id="logout-btn" class="btn btn-secondary"><i class="fas fa-sign-out-alt"></i> Logout</button>
    `;

    document.getElementById('logout-btn').addEventListener('click', async () => {
      await API.logout();
      showToast("Logged out successfully", "success");
      setTimeout(() => window.location.reload(), 1000);
    });
  } else {
    navActions.innerHTML = `
      <button class="btn-icon" id="theme-toggle" title="Toggle Theme"><i id="theme-icon" class="fas fa-moon"></i></button>
      <button class="btn-icon" id="bookmarks-toggle" title="View Bookmarks"><i class="fas fa-bookmark"></i></button>
      <a href="./login.html" class="btn btn-secondary"><i class="fas fa-sign-in-alt"></i> Login</a>
      <a href="./register.html" class="btn btn-primary">Register</a>
    `;
  }

  // Bind theme toggle
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  updateThemeToggleIcon(document.documentElement.getAttribute('data-theme'));

  // Bind Bookmarks Toggle
  document.getElementById('bookmarks-toggle').addEventListener('click', toggleBookmarksDrawer);
}

// --- BOOKMARKS DRAWER HANDLERS ---
let drawerOverlay = null;
let bookmarksDrawer = null;

export function initBookmarksDrawer() {
  // Create overlay
  drawerOverlay = document.createElement('div');
  drawerOverlay.className = 'drawer-overlay';
  document.body.appendChild(drawerOverlay);

  // Create drawer
  bookmarksDrawer = document.createElement('div');
  bookmarksDrawer.className = 'bookmarks-drawer';
  bookmarksDrawer.innerHTML = `
    <div class="drawer-header">
      <div class="drawer-title"><i class="fas fa-bookmark"></i> Bookmarked Posts</div>
      <button class="drawer-close">&times;</button>
    </div>
    <div class="drawer-content" id="drawer-bookmarks-list">
      <!-- Bookmarks loaded dynamically -->
    </div>
  `;
  document.body.appendChild(bookmarksDrawer);

  // Close events
  drawerOverlay.addEventListener('click', toggleBookmarksDrawer);
  bookmarksDrawer.querySelector('.drawer-close').addEventListener('click', toggleBookmarksDrawer);
}

export async function toggleBookmarksDrawer() {
  if (!bookmarksDrawer || !drawerOverlay) return;

  const isOpen = bookmarksDrawer.classList.contains('open');
  if (isOpen) {
    bookmarksDrawer.classList.remove('open');
    drawerOverlay.classList.remove('open');
  } else {
    bookmarksDrawer.classList.add('open');
    drawerOverlay.classList.add('open');
    await loadBookmarks();
  }
}

async function loadBookmarks() {
  const container = document.getElementById('drawer-bookmarks-list');
  if (!container) return;

  const currentUser = await API.getCurrentUser();
  if (!currentUser) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); margin-top: 40px;">
        <i class="fas fa-user-lock" style="font-size: 2.5rem; margin-bottom: 16px; display: block;"></i>
        <p>Please <a href="login.html" style="color: var(--primary); font-weight: 600;">login</a> to bookmark articles.</p>
      </div>
    `;
    return;
  }

  const bookmarks = await API.getBookmarks(currentUser.id);
  if (bookmarks.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); margin-top: 40px;">
        <i class="fas fa-folder-open" style="font-size: 2.5rem; margin-bottom: 16px; display: block;"></i>
        <p>No bookmarked articles yet.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = bookmarks.map(post => `
    <div class="bookmark-item" id="bookmark-item-${post.id}">
      <img src="${post.coverImage || ''}" alt="${post.title}" class="bookmark-item-img" onerror="this.src='../assets/images/default-cover.jpg'; this.onerror=null;">
      <div class="bookmark-item-details">
        <a href="post.html?slug=${post.slug}" class="bookmark-item-title">${post.title}</a>
        <div class="bookmark-item-meta">
          <span>${post.readingTime}</span>
          <button class="bookmark-remove-btn" data-post-id="${post.id}">Remove</button>
        </div>
      </div>
    </div>
  `).join('');

  // Bind remove buttons
  container.querySelectorAll('.bookmark-remove-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const postId = Number(e.target.dataset.postId);
      await API.toggleBookmark(currentUser.id, postId);
      showToast("Bookmark removed", "info");
      
      // Animate removal
      const item = document.getElementById(`bookmark-item-${postId}`);
      if (item) {
        item.style.opacity = '0';
        item.style.transform = 'translateX(20px)';
        setTimeout(() => {
          item.remove();
          if (container.children.length === 0) {
            container.innerHTML = `<p style="text-align: center; color: var(--text-muted); margin-top: 40px;">No bookmarked articles yet.</p>`;
          }
        }, 300);
      }

      // Sync post card bookmarks if on homepage
      const cardBtn = document.querySelector(`.card-bookmark-btn[data-post-id="${postId}"]`);
      if (cardBtn) cardBtn.classList.remove('active');
    });
  });
}

// --- BOOKMARK TOGGLE HELPER ---
async function handleCardBookmarkClick(postId, btnElement) {
  const currentUser = await API.getCurrentUser();
  if (!currentUser) {
    showToast("Please login to bookmark articles", "warning");
    return;
  }

  const isBookmarked = await API.toggleBookmark(currentUser.id, postId);
  if (isBookmarked) {
    btnElement.classList.add('active');
    showToast("Article bookmarked", "success");
  } else {
    btnElement.classList.remove('active');
    showToast("Bookmark removed", "info");
  }
}

// --- IMAGE FALLBACK HELPER ---
export function handleImageFallback(imgElement) {
  const fallbackContainer = document.createElement('div');
  fallbackContainer.className = imgElement.className + ' img-fallback-container';
  fallbackContainer.innerHTML = `<i class="fas fa-image"></i>`;
  imgElement.parentNode.replaceChild(fallbackContainer, imgElement);
}

// --- HOME PAGE LOGIC ---
async function initHomePage() {
  const latestGrid = document.getElementById('latest-posts-grid');
  if (!latestGrid) return;

  const categoriesContainer = document.getElementById('categories-tabs-container');
  const searchInput = document.getElementById('search-input');
  
  // Render Categories
  const categories = await API.getCategories();
  if (categoriesContainer) {
    categoriesContainer.innerHTML = `
      <button class="category-tab active" data-category-id="">All</button>
      ${categories.map(c => `<button class="category-tab" data-category-id="${c.id}">${c.name}</button>`).join('')}
    `;
  }

  // Load and Render Posts
  let posts = await API.getPosts({ status: 'published' });
  const currentUser = await API.getCurrentUser();
  const userBookmarks = currentUser ? await API.getBookmarks(currentUser.id) : [];
  const bookmarkedIds = userBookmarks.map(b => b.id);

  // Render Hero
  renderHeroPost(posts[0]);

  // Render Latest Grid
  renderPostsGrid(posts, bookmarkedIds);

  // Filters & Search State
  let activeCategoryId = '';
  let searchQuery = '';

  const filterAndRender = async () => {
    const filtered = await API.getPosts({
      status: 'published',
      categoryId: activeCategoryId,
      search: searchQuery
    });
    renderPostsGrid(filtered, bookmarkedIds);
  };

  // Bind Categories click
  if (categoriesContainer) {
    categoriesContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('category-tab')) {
        categoriesContainer.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        activeCategoryId = e.target.dataset.categoryId;
        filterAndRender();
      }
    });
  }

  // Bind Search bar
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      filterAndRender();
    });
  }
}

function renderHeroPost(post) {
  const heroWrapper = document.getElementById('hero-post-wrapper');
  if (!heroWrapper || !post) return;

  const dateStr = post.publishDate ? new Date(post.publishDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';

  heroWrapper.innerHTML = `
    <div class="hero-content">
      <span class="hero-tag">${post.categoryName}</span>
      <h1 class="hero-title"><a href="post.html?slug=${post.slug}">${post.title}</a></h1>
      <p class="hero-desc">${post.content.replace(/<[^>]*>/g, '').substring(0, 160)}...</p>
      <div class="hero-meta">
        <img src="${post.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}" alt="${post.authorName}" class="hero-author-img">
        <div>
          <span style="font-weight:600; display:block; color:var(--text);">${post.authorName}</span>
          <span>${dateStr} &bull; ${post.readingTime}</span>
        </div>
      </div>
    </div>
    <div class="hero-image-wrapper">
      <a href="post.html?slug=${post.slug}">
        <img src="${post.coverImage || ''}" alt="${post.title}" class="hero-image" onerror="this.src='../assets/images/default-cover.jpg'; this.onerror=null;">
      </a>
    </div>
  `;
  
  // Attach fallback to image
  const img = heroWrapper.querySelector('.hero-image');
  if (img) {
    img.onerror = () => handleImageFallback(img);
  }
}

function renderPostsGrid(posts, bookmarkedIds) {
  const grid = document.getElementById('latest-posts-grid');
  if (!grid) return;

  if (posts.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 60px 0;">
        <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 16px; display:block;"></i>
        <h3>No posts found matching criteria</h3>
        <p>Try refining your search keyword or selected category tab.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = posts.map(post => {
    const isBookmarked = bookmarkedIds.includes(post.id);
    const dateStr = post.publishDate ? new Date(post.publishDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';
    const plainTextContent = post.content.replace(/<[^>]*>/g, '');
    const excerpt = plainTextContent.length > 110 ? plainTextContent.substring(0, 110) + '...' : plainTextContent;

    return `
      <article class="blog-card" data-id="${post.id}">
        <div class="card-img-wrapper">
          <a href="post.html?slug=${post.slug}">
            <img src="${post.coverImage || ''}" alt="${post.title}" class="card-img" onerror="this.src='../assets/images/default-cover.jpg'; this.onerror=null;">
          </a>
          <button class="card-bookmark-btn ${isBookmarked ? 'active' : ''}" data-post-id="${post.id}" title="${isBookmarked ? 'Remove Bookmark' : 'Bookmark Post'}">
            <i class="fas fa-bookmark"></i>
          </button>
        </div>
        <div class="card-body">
          <span class="card-category">${post.categoryName}</span>
          <h3 class="card-title"><a href="post.html?slug=${post.slug}">${post.title}</a></h3>
          <p class="card-excerpt">${excerpt}</p>
          <div class="card-footer">
            <div class="card-author">
              <img src="${post.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}" alt="${post.authorName}" class="card-author-img">
              <span class="card-author-name">${post.authorName}</span>
            </div>
            <span class="card-date">${dateStr}</span>
          </div>
        </div>
      </article>
    `;
  }).join('');

  // Bind Bookmark buttons
  grid.querySelectorAll('.card-bookmark-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const postId = Number(btn.dataset.postId);
      handleCardBookmarkClick(postId, btn);
    });
  });

  // Attach fallback to grid images
  grid.querySelectorAll('.card-img').forEach(img => {
    img.onerror = () => handleImageFallback(img);
  });
}

// --- SINGLE POST PAGE LOGIC ---
async function initPostPage() {
  const container = document.getElementById('post-detail-container');
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');
  const id = urlParams.get('id');

  try {
    let post;
    if (slug) {
      post = await API.getPostBySlug(slug);
    } else if (id) {
      post = await API.getPost(Number(id));
    } else {
      throw new Error("No post specified.");
    }

    // Initialize Scroll Progress Bar
    initScrollProgressBar();

    // Render Post detail
    const dateStr = post.publishDate ? new Date(post.publishDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'Draft';
    
    document.title = `${post.title} - CMS Blog Platform`;
    
    // Check if current user bookmarked
    const currentUser = await API.getCurrentUser();
    const userBookmarks = currentUser ? await API.getBookmarks(currentUser.id) : [];
    const isBookmarked = userBookmarks.some(b => b.id === post.id);

    container.innerHTML = `
      <header class="post-header" style="text-align: center; max-width: 800px; margin: 40px auto 30px;">
        <span class="hero-tag" style="margin-bottom:16px;">${post.categoryName}</span>
        <h1 style="font-size: 2.75rem; margin-bottom: 24px; font-weight:800;">${post.title}</h1>
        <div style="display: flex; align-items: center; justify-content: center; gap: 20px; color: var(--text-muted);">
          <div style="display:flex; align-items:center; gap:8px;">
            <img src="${post.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}" alt="${post.authorName}" style="width:40px; height:40px; border-radius:50%;">
            <span style="font-weight:600; color:var(--text);">${post.authorName}</span>
          </div>
          <span>&bull;</span>
          <span>${dateStr}</span>
          <span>&bull;</span>
          <span>${post.readingTime}</span>
          <span>&bull;</span>
          <button id="post-bookmark-btn" class="btn btn-secondary btn-icon ${isBookmarked ? 'active' : ''}" style="width:34px; height:34px;" title="Bookmark Post">
            <i class="fas fa-bookmark"></i>
          </button>
        </div>
      </header>

      <div style="max-width: 900px; margin: 0 auto 40px; border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-md);">
        <img id="post-cover" src="${post.coverImage || ''}" alt="${post.title}" style="width:100%; max-height:480px; object-fit:cover;" onerror="this.src='../assets/images/default-cover.jpg'; this.onerror=null;">
      </div>

      <article class="post-content-body" style="max-width: 740px; margin: 0 auto 60px; font-size: 1.15rem; line-height: 1.8; color: var(--text);">
        ${post.content}
        <div style="margin-top: 40px; display:flex; gap:8px; flex-wrap:wrap;">
          ${post.tags.map(tag => `<span style="background-color: var(--surface-hover); border:1px solid var(--border); padding: 4px 12px; border-radius:50px; font-size:0.85rem; font-weight:500;">#${tag}</span>`).join('')}
        </div>
      </article>

      <!-- Author Bio card -->
      <div style="max-width: 740px; margin: 0 auto 60px; padding:30px; border:1px solid var(--border); background-color:var(--surface); border-radius:var(--radius-md); display:flex; gap:20px; align-items:center;">
        <img src="${post.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}" alt="${post.authorName}" style="width:70px; height:70px; border-radius:50%; object-fit:cover;">
        <div>
          <h4 style="font-size:1.1rem; margin-bottom:6px;">Written by ${post.authorName}</h4>
          <p style="color:var(--text-muted); font-size:0.95rem;">${post.authorBio || 'Tech enthusiast, writer, and frequent editor for our CMS journal ecosystem.'}</p>
        </div>
      </div>

      <!-- Related Posts -->
      <section style="border-top:1px solid var(--border); padding-top:40px; margin-bottom:60px;">
        <h3 style="font-size: 1.5rem; margin-bottom: 24px;">Related Articles</h3>
        <div id="related-posts-grid" class="posts-grid"></div>
      </section>

      <!-- Comments -->
      <section style="border-top:1px solid var(--border); padding-top:40px;">
        <h3 style="font-size: 1.5rem; margin-bottom: 24px;">Comments</h3>
        <div id="comments-list" style="display:flex; flex-direction:column; gap:20px; margin-bottom:40px;"></div>
        
        <!-- Leave a comment form -->
        <div style="background-color:var(--surface); border:1px solid var(--border); border-radius:var(--radius-md); padding:30px;">
          <h4 style="font-size:1.25rem; margin-bottom:20px;">Leave a Comment</h4>
          <form id="comment-form" style="display:flex; flex-direction:column; gap:16px;">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
              <div class="form-group">
                <label class="form-label">Name</label>
                <input type="text" id="comment-author" class="editor-input" required placeholder="Jane Doe">
              </div>
              <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" id="comment-email" class="editor-input" required placeholder="jane@example.com">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Comment</label>
              <textarea id="comment-content" class="editor-input" style="min-height:120px; resize:vertical;" required placeholder="Type your comment here..."></textarea>
            </div>
            <button type="submit" class="btn btn-primary" style="align-self:flex-start;">Submit Comment</button>
          </form>
        </div>
      </section>
    `;

    // Cover image fallback setup
    const coverImg = document.getElementById('post-cover');
    if (coverImg) coverImg.onerror = () => handleImageFallback(coverImg);

    // Bookmarking single post handler
    const bookmarkBtn = document.getElementById('post-bookmark-btn');
    if (bookmarkBtn) {
      bookmarkBtn.addEventListener('click', async () => {
        if (!currentUser) {
          showToast("Please login to bookmark articles", "warning");
          return;
        }
        const bState = await API.toggleBookmark(currentUser.id, post.id);
        if (bState) {
          bookmarkBtn.classList.add('active');
          showToast("Article bookmarked", "success");
        } else {
          bookmarkBtn.classList.remove('active');
          showToast("Bookmark removed", "info");
        }
      });
    }

    // Load related posts & comments
    loadRelatedPosts(post.categoryId, post.id);
    loadComments(post.id);

    // Comment submission binding
    const commentForm = document.getElementById('comment-form');
    if (commentForm) {
      commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const author = document.getElementById('comment-author').value;
        const email = document.getElementById('comment-email').value;
        const content = document.getElementById('comment-content').value;

        await API.createComment(post.id, author, email, content);
        showToast("Comment submitted for moderation!", "success");
        commentForm.reset();
      });
    }

  } catch (error) {
    container.innerHTML = `
      <div style="text-align: center; padding: 100px 0; color: var(--text-muted);">
        <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: var(--danger); margin-bottom: 24px;"></i>
        <h2>Error Loading Post</h2>
        <p>${error.message}</p>
        <a href="index.html" class="btn btn-primary" style="margin-top:20px;">Back to Home</a>
      </div>
    `;
  }
}

async function loadRelatedPosts(categoryId, currentPostId) {
  const relatedGrid = document.getElementById('related-posts-grid');
  if (!relatedGrid) return;

  const allPosts = await API.getPosts({ status: 'published', categoryId });
  const filtered = allPosts.filter(p => p.id !== currentPostId).slice(0, 3);
  
  if (filtered.length === 0) {
    relatedGrid.parentNode.remove(); // Remove section if empty
    return;
  }

  const currentUser = await API.getCurrentUser();
  const userBookmarks = currentUser ? await API.getBookmarks(currentUser.id) : [];
  const bookmarkedIds = userBookmarks.map(b => b.id);

  relatedGrid.innerHTML = filtered.map(post => {
    const isBookmarked = bookmarkedIds.includes(post.id);
    const dateStr = post.publishDate ? new Date(post.publishDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';
    const plainTextContent = post.content.replace(/<[^>]*>/g, '');
    const excerpt = plainTextContent.length > 100 ? plainTextContent.substring(0, 100) + '...' : plainTextContent;

    return `
      <article class="blog-card" data-id="${post.id}">
        <div class="card-img-wrapper" style="height:160px;">
          <a href="post.html?slug=${post.slug}">
            <img src="${post.coverImage || ''}" alt="${post.title}" class="card-img" onerror="this.src='../assets/images/default-cover.jpg'; this.onerror=null;">
          </a>
          <button class="card-bookmark-btn ${isBookmarked ? 'active' : ''}" data-post-id="${post.id}" title="${isBookmarked ? 'Remove Bookmark' : 'Bookmark Post'}">
            <i class="fas fa-bookmark"></i>
          </button>
        </div>
        <div class="card-body" style="padding:16px; gap:10px;">
          <span class="card-category" style="font-size:0.75rem;">${post.categoryName}</span>
          <h3 class="card-title" style="font-size:1.1rem;"><a href="post.html?slug=${post.slug}">${post.title}</a></h3>
          <p class="card-excerpt" style="font-size:0.85rem;">${excerpt}</p>
          <div class="card-footer" style="padding-top:10px;">
            <div class="card-author">
              <span class="card-author-name" style="font-size:0.8rem;">${post.authorName}</span>
            </div>
            <span class="card-date" style="font-size:0.75rem;">${dateStr}</span>
          </div>
        </div>
      </article>
    `;
  }).join('');

  // Bind bookmarks inside related grid
  relatedGrid.querySelectorAll('.card-bookmark-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const postId = Number(btn.dataset.postId);
      handleCardBookmarkClick(postId, btn);
    });
  });

  relatedGrid.querySelectorAll('.card-img').forEach(img => {
    img.onerror = () => handleImageFallback(img);
  });
}

async function loadComments(postId) {
  const list = document.getElementById('comments-list');
  if (!list) return;

  const comments = await API.getComments({ postId, status: 'approved' });
  if (comments.length === 0) {
    list.innerHTML = `<p style="color:var(--text-muted); font-style:italic;">No comments yet. Be the first to leave a comment!</p>`;
    return;
  }

  list.innerHTML = comments.map(c => {
    const commentDate = new Date(c.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    return `
      <div style="background-color: var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); padding:20px; display:flex; gap:16px;">
        <div style="width:40px; height:40px; border-radius:50%; background-color:var(--primary); color:#ffffff; display:flex; align-items:center; justify-content:center; font-weight:700; flex-shrink:0;">
          ${c.author.substring(0, 1).toUpperCase()}
        </div>
        <div>
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:6px;">
            <h5 style="font-size:0.95rem; font-weight:700; color:var(--text);">${c.author}</h5>
            <span style="font-size:0.8rem; color:var(--text-muted);">${commentDate}</span>
          </div>
          <p style="font-size:0.95rem; color:var(--text);">${c.content}</p>
        </div>
      </div>
    `;
  }).join('');
}

// --- READING PROGRESS BAR LOGIC ---
function initScrollProgressBar() {
  const progressContainer = document.createElement('div');
  progressContainer.className = 'progress-bar-container';
  progressContainer.innerHTML = `<div class="progress-bar" id="post-progress-bar"></div>`;
  document.body.prepend(progressContainer);

  const progressBar = document.getElementById('post-progress-bar');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    if (height > 0) {
      const scrolled = (winScroll / height) * 100;
      progressBar.style.width = scrolled + '%';
    } else {
      progressBar.style.width = '0%';
    }
  });
}

// --- INITIALIZE ON SCRIPT LOAD ---
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  await renderNavbar();
  initBookmarksDrawer();
  
  // Route check
  if (document.getElementById('latest-posts-grid')) {
    await initHomePage();
  } else if (document.getElementById('post-detail-container')) {
    await initPostPage();
  }
});
