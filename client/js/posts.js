// posts.js - Admin Posts List & Operations
import { API } from './api.js';
import { showToast } from './blog.js';

let currentUser = null;
let activeCategoryId = '';
let activeStatus = '';
let searchQuery = '';

async function initPostsPage() {
  currentUser = await API.getCurrentUser();
  if (!currentUser) return;

  // Initialize Category Dropdown
  const categorySelect = document.getElementById('filter-category');
  const categories = await API.getCategories();
  if (categorySelect) {
    categorySelect.innerHTML = `
      <option value="">All Categories</option>
      ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
    `;
  }

  // Load and render posts
  await loadAndRenderPosts();

  // Bind Filters & Search
  if (categorySelect) {
    categorySelect.addEventListener('change', async (e) => {
      activeCategoryId = e.target.value;
      await loadAndRenderPosts();
    });
  }

  const statusSelect = document.getElementById('filter-status');
  if (statusSelect) {
    statusSelect.addEventListener('change', async (e) => {
      activeStatus = e.target.value;
      await loadAndRenderPosts();
    });
  }

  const searchInput = document.getElementById('posts-search');
  if (searchInput) {
    searchInput.addEventListener('input', async (e) => {
      searchQuery = e.target.value;
      await loadAndRenderPosts();
    });
  }
}

async function loadAndRenderPosts() {
  const tbody = document.getElementById('posts-tbody');
  if (!tbody) return;

  // Set up API filters
  const filters = {};
  if (activeStatus) filters.status = activeStatus;
  if (activeCategoryId) filters.categoryId = activeCategoryId;
  if (searchQuery) filters.search = searchQuery;
  
  // Enforce Author visibility limits
  if (currentUser.role === 'author') {
    filters.authorId = currentUser.id;
  }

  try {
    const posts = await API.getPosts(filters);
    renderPostsTable(posts);
  } catch (err) {
    showToast("Error loading posts list", "error");
  }
}

function renderPostsTable(posts) {
  const tbody = document.getElementById('posts-tbody');
  if (!tbody) return;

  if (posts.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:40px;"><i class="fas fa-folder-open" style="font-size:2rem; margin-bottom:12px; display:block;"></i>No articles found matching filters.</td></tr>`;
    return;
  }

  tbody.innerHTML = posts.map(post => {
    const dateStr = post.publishDate ? new Date(post.publishDate).toLocaleDateString() : 'Draft (Unpublished)';
    const statusBadgeClass = post.status === 'published' ? 'badge-success' : 'badge-warning';

    return `
      <tr id="post-row-${post.id}">
        <td>
          <div class="table-post-cell">
            <img src="${post.coverImage || ''}" alt="${post.title}" class="table-post-img" onerror="this.src='../assets/images/default-cover.jpg'; this.onerror=null;">
            <div>
              <a href="../public/post.html?slug=${post.slug}" target="_blank" class="table-post-title">${post.title}</a>
              <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">Author ID: ${post.authorId} &bull; Reading: ${post.readingTime}</div>
            </div>
          </div>
        </td>
        <td>${post.categoryName}</td>
        <td>${dateStr}</td>
        <td><span class="badge ${statusBadgeClass}">${post.status}</span></td>
        <td><span style="font-weight:600;">${post.views || 0}</span></td>
        <td>
          <div class="actions-cell">
            <a href="../public/post.html?slug=${post.slug}" target="_blank" class="btn-action" title="View Public Post"><i class="fas fa-eye"></i></a>
            <a href="editor.html?id=${post.id}" class="btn-action" title="Edit Post"><i class="fas fa-edit"></i></a>
            <button class="btn-action btn-action-delete delete-post-btn" data-post-id="${post.id}" data-title="${post.title}" title="Delete Post"><i class="fas fa-trash-alt"></i></button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Bind delete triggers
  tbody.querySelectorAll('.delete-post-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const postId = Number(btn.dataset.postId);
      const postTitle = btn.dataset.title;

      if (confirm(`Are you sure you want to delete the post "${postTitle}"?`)) {
        try {
          await API.deletePost(postId);
          showToast("Post deleted successfully", "success");
          
          // Animate row removal
          const row = document.getElementById(`post-row-${postId}`);
          if (row) {
            row.style.opacity = '0';
            row.style.transform = 'scale(0.95)';
            setTimeout(async () => {
              row.remove();
              await loadAndRenderPosts();
            }, 300);
          }
        } catch (err) {
          showToast(err.message, "error");
        }
      }
    });
  });

  // Attach fallbacks
  tbody.querySelectorAll('.table-post-img').forEach(img => {
    img.onerror = () => {
      const fallback = document.createElement('div');
      fallback.className = 'table-post-img img-fallback-container';
      fallback.style.fontSize = '1.2rem';
      fallback.innerHTML = `<i class="fas fa-image"></i>`;
      img.parentNode.replaceChild(fallback, img);
    };
  });
}

document.addEventListener('DOMContentLoaded', initPostsPage);
