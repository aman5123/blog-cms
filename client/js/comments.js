// comments.js - Admin Comments Moderation desk
import { API } from './api.js';
import { showToast } from './blog.js';

let activeStatus = '';
let searchQuery = '';

async function initCommentsPage() {
  const currentUser = await API.getCurrentUser();
  if (!currentUser) return;

  // Render comments list
  await loadAndRenderComments();

  // Bind filters
  const statusFilter = document.getElementById('filter-comment-status');
  if (statusFilter) {
    statusFilter.addEventListener('change', async (e) => {
      activeStatus = e.target.value;
      await loadAndRenderComments();
    });
  }

  const searchInput = document.getElementById('comments-search');
  if (searchInput) {
    searchInput.addEventListener('input', async (e) => {
      searchQuery = e.target.value;
      await loadAndRenderComments();
    });
  }
}

async function loadAndRenderComments() {
  const tbody = document.getElementById('comments-tbody');
  if (!tbody) return;

  try {
    const filters = {};
    if (activeStatus) filters.status = activeStatus;

    let comments = await API.getComments(filters);

    // Filter by search query if set
    if (searchQuery) {
      const queryLower = searchQuery.toLowerCase();
      comments = comments.filter(c => 
        c.author.toLowerCase().includes(queryLower) ||
        c.email.toLowerCase().includes(queryLower) ||
        c.content.toLowerCase().includes(queryLower)
      );
    }

    renderCommentsTable(comments);
  } catch (err) {
    showToast("Error loading comments", "error");
  }
}

function renderCommentsTable(comments) {
  const tbody = document.getElementById('comments-tbody');
  if (!tbody) return;

  if (comments.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:40px;"><i class="fas fa-comments" style="font-size:2rem; margin-bottom:12px; display:block;"></i>No comments found.</td></tr>`;
    return;
  }

  tbody.innerHTML = comments.map(comment => {
    const dateStr = new Date(comment.date).toLocaleDateString(undefined, { hour: '2-digit', minute: '2-digit' });
    const isApproved = comment.status === 'approved';
    const statusBadgeClass = isApproved ? 'badge-success' : 'badge-warning';

    return `
      <tr id="comment-row-${comment.id}">
        <td>
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:36px; height:36px; border-radius:50%; background-color:var(--primary); color:#ffffff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.9rem;">
              ${comment.author.substring(0, 1).toUpperCase()}
            </div>
            <div>
              <div style="font-weight:600;">${comment.author}</div>
              <div style="font-size:0.75rem; color:var(--text-muted);">${comment.email}</div>
            </div>
          </div>
        </td>
        <td>
          <div style="max-width:320px; text-overflow:ellipsis; overflow:hidden; font-size:0.9rem; line-height:1.4;" title="${comment.content}">
            ${comment.content}
          </div>
        </td>
        <td>
          <a href="../public/post.html?id=${comment.postId}" target="_blank" style="color:var(--primary); font-weight:500;">
            ${comment.postTitle}
          </a>
        </td>
        <td>
          <div>${dateStr}</div>
          <span class="badge ${statusBadgeClass}" style="margin-top:4px;">${comment.status}</span>
        </td>
        <td>
          <div class="actions-cell">
            ${isApproved 
              ? `<button class="btn-action toggle-status-btn" data-comment-id="${comment.id}" data-action="pending" title="Unapprove Comment"><i class="fas fa-times-circle" style="color:var(--warning);"></i></button>`
              : `<button class="btn-action toggle-status-btn" data-comment-id="${comment.id}" data-action="approved" title="Approve Comment"><i class="fas fa-check-circle" style="color:var(--success);"></i></button>`
            }
            <button class="btn-action btn-action-delete delete-comment-btn" data-comment-id="${comment.id}" title="Delete Comment"><i class="fas fa-trash-alt"></i></button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Bind toggle status triggers
  tbody.querySelectorAll('.toggle-status-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const commentId = Number(btn.dataset.commentId);
      const nextStatus = btn.dataset.action;

      try {
        await API.updateCommentStatus(commentId, nextStatus);
        showToast(nextStatus === 'approved' ? "Comment approved!" : "Comment marked as pending moderation", "success");
        await loadAndRenderComments();
      } catch (err) {
        showToast(err.message, "error");
      }
    });
  });

  // Bind delete triggers
  tbody.querySelectorAll('.delete-comment-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const commentId = Number(btn.dataset.commentId);

      if (confirm("Are you sure you want to delete this comment?")) {
        try {
          await API.deleteComment(commentId);
          showToast("Comment deleted successfully", "success");
          
          const row = document.getElementById(`comment-row-${commentId}`);
          if (row) {
            row.style.opacity = '0';
            row.style.transform = 'scale(0.95)';
            setTimeout(async () => {
              row.remove();
              await loadAndRenderComments();
            }, 300);
          }
        } catch (err) {
          showToast(err.message, "error");
        }
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', initCommentsPage);
