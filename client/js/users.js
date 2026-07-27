// users.js - Admin User Registry & Operations
import { API } from './api.js';
import { showToast } from './blog.js';

let searchQuery = '';

async function initUsersPage() {
  const currentUser = await API.getCurrentUser();
  if (!currentUser) return;

  // Load and render users
  await loadAndRenderUsers();

  // Search input binding
  const searchInput = document.getElementById('users-search');
  if (searchInput) {
    searchInput.addEventListener('input', async (e) => {
      searchQuery = e.target.value;
      await loadAndRenderUsers();
    });
  }
}

async function loadAndRenderUsers() {
  const tbody = document.getElementById('users-tbody');
  if (!tbody) return;

  try {
    let users = await API.getUsers();

    if (searchQuery) {
      const queryLower = searchQuery.toLowerCase();
      users = users.filter(u => 
        u.name.toLowerCase().includes(queryLower) ||
        u.username.toLowerCase().includes(queryLower) ||
        u.email.toLowerCase().includes(queryLower) ||
        u.role.toLowerCase().includes(queryLower)
      );
    }

    renderUsersTable(users);
  } catch (err) {
    showToast("Error loading users database", "error");
  }
}

function renderUsersTable(users) {
  const tbody = document.getElementById('users-tbody');
  if (!tbody) return;

  tbody.innerHTML = users.map(u => {
    const isSuspended = u.status === 'suspended';
    const statusBadgeClass = isSuspended ? 'badge-danger' : 'badge-success';
    const roleBadgeClass = u.role === 'admin' ? 'badge-primary' : (u.role === 'author' ? 'badge-success' : 'badge-warning');

    return `
      <tr id="user-row-${u.id}">
        <td>
          <div style="display:flex; align-items:center; gap:12px;">
            <img src="${u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}" alt="${u.name}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;" onerror="this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';">
            <div>
              <div style="font-weight:600;">${u.name}</div>
              <div style="font-size:0.75rem; color:var(--text-muted);">@${u.username}</div>
            </div>
          </div>
        </td>
        <td>${u.email}</td>
        <td>
          <!-- Role Selection Dropdown -->
          <select class="editor-select user-role-select" data-user-id="${u.id}" style="width:130px; padding:6px 10px; font-size:0.85rem;">
            <option value="user" ${u.role === 'user' ? 'selected' : ''}>User</option>
            <option value="author" ${u.role === 'author' ? 'selected' : ''}>Author</option>
            <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
          </select>
        </td>
        <td>
          <span class="badge ${statusBadgeClass}">${u.status}</span>
        </td>
        <td>
          <div class="actions-cell">
            ${isSuspended 
              ? `<button class="btn-action toggle-status-btn" data-user-id="${u.id}" data-status="active" title="Activate Account"><i class="fas fa-user-check" style="color:var(--success);"></i></button>`
              : `<button class="btn-action toggle-status-btn" data-user-id="${u.id}" data-status="suspended" title="Suspend Account"><i class="fas fa-user-slash" style="color:var(--danger);"></i></button>`
            }
            <button class="btn-action btn-action-delete delete-user-btn" data-user-id="${u.id}" data-name="${u.name}" title="Delete User"><i class="fas fa-trash-alt"></i></button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Bind role selection changes
  tbody.querySelectorAll('.user-role-select').forEach(select => {
    select.addEventListener('change', async (e) => {
      const userId = Number(select.dataset.userId);
      const newRole = e.target.value;

      try {
        await API.updateUser(userId, { role: newRole });
        showToast("User role updated successfully", "success");
        await loadAndRenderUsers();
      } catch (err) {
        showToast(err.message, "error");
      }
    });
  });

  // Bind toggle status triggers
  tbody.querySelectorAll('.toggle-status-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const userId = Number(btn.dataset.userId);
      const newStatus = btn.dataset.status;

      try {
        await API.updateUser(userId, { status: newStatus });
        showToast(newStatus === 'active' ? "User account activated" : "User account suspended", "success");
        await loadAndRenderUsers();
      } catch (err) {
        showToast(err.message, "error");
      }
    });
  });

  // Bind delete triggers
  tbody.querySelectorAll('.delete-user-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const userId = Number(btn.dataset.userId);
      const userName = btn.dataset.name;

      if (confirm(`Are you sure you want to permanently delete the user "${userName}"?`)) {
        try {
          await API.deleteUser(userId);
          showToast("User deleted successfully", "success");

          const row = document.getElementById(`user-row-${userId}`);
          if (row) {
            row.style.opacity = '0';
            row.style.transform = 'scale(0.95)';
            setTimeout(async () => {
              row.remove();
              await loadAndRenderUsers();
            }, 300);
          }
        } catch (err) {
          showToast(err.message, "error");
        }
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', initUsersPage);
