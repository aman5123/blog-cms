// dashboard.js - Admin Dashboard Operations
import { API } from './api.js';
import { showToast } from './blog.js';

async function initDashboard() {
  const currentUser = await API.getCurrentUser();
  if (!currentUser) return;

  // Read alert search parameter (route guard warnings)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('alert') === 'unauthorized') {
    showToast("Access Denied. Admins Only.", "warning");
    // Clear url query parameters
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  // Fetch all necessary data to run calculations
  const allPosts = await API.getPosts();
  const allUsers = await API.getUsers();
  const allComments = await API.getComments();

  // Role-based calculation variables
  let postsCount = 0;
  let draftsCount = 0;
  let commentsCount = 0;
  let metricsViews = 0;
  let postsList = [];

  if (currentUser.role === 'admin') {
    // Admin calculates metrics globally
    postsCount = allPosts.length;
    draftsCount = allPosts.filter(p => p.status === 'draft').length;
    commentsCount = allComments.length;
    metricsViews = allPosts.reduce((sum, p) => sum + (p.views || 0), 0);
    postsList = allPosts.slice(0, 5); // Last 5 posts
  } else {
    // Author calculates metrics specifically for their own content
    const authorPosts = allPosts.filter(p => p.authorId === currentUser.id);
    postsCount = authorPosts.length;
    draftsCount = authorPosts.filter(p => p.status === 'draft').length;
    
    // Comments on author posts
    const authorPostIds = authorPosts.map(p => p.id);
    const authorComments = allComments.filter(c => authorPostIds.includes(c.postId));
    commentsCount = authorComments.length;

    metricsViews = authorPosts.reduce((sum, p) => sum + (p.views || 0), 0);
    postsList = authorPosts.slice(0, 5);
  }

  // Update Stats DOM cards
  document.getElementById('stat-total-posts').textContent = postsCount;
  document.getElementById('stat-draft-posts').textContent = draftsCount;
  document.getElementById('stat-total-comments').textContent = commentsCount;
  document.getElementById('stat-total-views').textContent = metricsViews;

  // Dynamically change visual labels if Author vs Admin
  if (currentUser.role === 'author') {
    const userCard = document.getElementById('users-metric-card');
    if (userCard) {
      // Re-label to Total Views for Authors instead of Total Users
      userCard.querySelector('.metric-label').textContent = "Total Views";
      userCard.querySelector('.metric-icon-wrapper').className = "metric-icon-wrapper metric-icon-views";
      userCard.querySelector('i').className = "fas fa-eye";
    }
  } else {
    // Show Total Users count for Admin
    document.getElementById('stat-total-views').textContent = allUsers.length;
  }

  // Populate Recent Posts Table
  renderRecentPostsTable(postsList);

  // Load analytics graph
  renderAnalyticsChart(postsList);

  // Generate activities ticker
  renderActivityTicker(postsList, allComments, currentUser);
}

function renderRecentPostsTable(posts) {
  const tbody = document.getElementById('recent-posts-tbody');
  if (!tbody) return;

  if (posts.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:30px;">No articles written yet. <a href="editor.html" style="color:var(--primary); font-weight:600;">Create one!</a></td></tr>`;
    return;
  }

  tbody.innerHTML = posts.map(post => {
    const dateStr = post.publishDate ? new Date(post.publishDate).toLocaleDateString() : 'N/A';
    const badgeClass = post.status === 'published' ? 'badge-success' : 'badge-warning';

    return `
      <tr>
        <td>
          <div class="table-post-cell">
            <img src="${post.coverImage || ''}" alt="${post.title}" class="table-post-img" onerror="this.src='../assets/images/default-cover.jpg'; this.onerror=null;">
            <div>
              <a href="../public/post.html?slug=${post.slug}" target="_blank" class="table-post-title">${post.title}</a>
              <div style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">/posts/${post.slug}</div>
            </div>
          </div>
        </td>
        <td>${post.categoryName}</td>
        <td>${dateStr}</td>
        <td><span class="badge ${badgeClass}">${post.status}</span></td>
        <td><span style="font-weight:600;">${post.views || 0}</span></td>
      </tr>
    `;
  }).join('');

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

function renderAnalyticsChart(postsList) {
  const ctx = document.getElementById('analyticsChart');
  if (!ctx) return;

  // Generate mock chart data based on views or generic curves
  const viewsData = postsList.length > 0 ? postsList.map(p => p.views).reverse() : [0, 0, 0, 0, 0];
  const labelData = postsList.length > 0 ? postsList.map(p => p.title.substring(0, 15) + '...').reverse() : ['No Data', '', '', '', ''];

  if (window.Chart) {
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labelData,
        datasets: [{
          label: 'Views per Article',
          data: viewsData,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0,0,0,0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }
}

function renderActivityTicker(posts, comments, user) {
  const container = document.getElementById('activity-list');
  if (!container) return;

  const activities = [];

  // Add post activities
  posts.forEach(p => {
    activities.push({
      type: 'post',
      text: `Post <strong>"${p.title}"</strong> was compiled as <strong>${p.status}</strong>`,
      time: p.publishDate ? new Date(p.publishDate) : new Date(Date.now() - 3600000)
    });
  });

  // Add comment activities
  comments.slice(0, 3).forEach(c => {
    activities.push({
      type: 'comment',
      text: `Comment from <strong>${c.author}</strong> on post #${c.postId} was received (${c.status})`,
      time: new Date(c.date)
    });
  });

  // Sort activities by time descending
  activities.sort((a, b) => b.time - a.time);

  if (activities.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted); font-style:italic;">No activities recorded.</p>`;
    return;
  }

  container.innerHTML = activities.map(act => {
    const timeStr = act.time.toLocaleDateString(undefined, { hour: '2-digit', minute: '2-digit' });
    return `
      <div class="activity-item">
        <div class="activity-dot"></div>
        <div class="activity-desc">
          <p>${act.text}</p>
          <div class="activity-time">${timeStr}</div>
        </div>
      </div>
    `;
  }).join('');
}

document.addEventListener('DOMContentLoaded', initDashboard);
