// auth.js - Authentication Handling & Route Guards
import { API } from './api.js';
import { showToast } from './blog.js';

// --- ROUTE GUARD SIMULATOR ---
export async function guardAdminRoutes() {
  const path = window.location.pathname;
  // Check if current page is inside /admin/
  if (path.includes('/admin/')) {
    try {
      const currentUser = await API.getCurrentUser();
      
      // If not logged in, redirect to login page
      if (!currentUser) {
        window.location.href = '../public/login.html?redirect=' + encodeURIComponent(window.location.pathname + window.location.search);
        return;
      }

      // Check roles: must be admin or author
      if (currentUser.role !== 'admin' && currentUser.role !== 'author') {
        window.location.href = '../public/index.html';
        return;
      }

      // Role authorization limits: Authors cannot manage comments or users
      const pageName = path.substring(path.lastIndexOf('/') + 1);
      if (currentUser.role === 'author') {
        if (pageName === 'comments.html' || pageName === 'users.html') {
          // Redirect to dashboard
          window.location.href = 'dashboard.html?alert=unauthorized';
          return;
        }
      }

      // Initialize Layout elements if logged in successfully
      await initAdminLayout(currentUser);

    } catch (err) {
      console.error("Route guarding error:", err);
    }
  }
}

// --- ADMIN LAYOUT ENGINE ---
export async function initAdminLayout(user) {
  // 1. Highlight active links
  const path = window.location.pathname;
  const pageName = path.substring(path.lastIndexOf('/') + 1);
  const activeLinkId = 'link-' + pageName.replace('.html', '');
  const activeLink = document.getElementById(activeLinkId);
  if (activeLink) activeLink.classList.add('active');

  // 2. Hide admin items for authors
  if (user.role === 'author') {
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
  }

  // 3. Fill profile footer
  const sidebarAvatar = document.getElementById('sidebar-avatar');
  const sidebarUsername = document.getElementById('sidebar-username');
  const sidebarRole = document.getElementById('sidebar-role');

  if (sidebarAvatar) sidebarAvatar.src = user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
  if (sidebarUsername) sidebarUsername.textContent = user.name || user.username;
  if (sidebarRole) sidebarRole.textContent = user.role;

  // 4. Sidebar Toggle Buttons
  const sidebar = document.getElementById('admin-sidebar');
  const openBtn = document.getElementById('sidebar-open-btn');
  const closeBtn = document.getElementById('sidebar-close-btn');

  if (sidebar && openBtn) {
    openBtn.addEventListener('click', () => {
      sidebar.classList.add('open');
      if (closeBtn) closeBtn.style.display = 'block';
    });
  }

  if (sidebar && closeBtn) {
    closeBtn.addEventListener('click', () => {
      sidebar.classList.remove('open');
      closeBtn.style.display = 'none';
    });
  }

  // 5. Admin Theme Toggle binding
  const themeToggle = document.getElementById('admin-theme-toggle');
  if (themeToggle) {
    const savedTheme = localStorage.getItem('cms_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateAdminThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('cms_theme', newTheme);
      updateAdminThemeIcon(newTheme);
      showToast(`Switched to ${newTheme} mode`, 'info');
    });
  }

  // 6. Admin Logout binding
  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await API.logout();
      showToast("Logged out successfully", "success");
      setTimeout(() => {
        window.location.href = '../public/login.html';
      }, 1000);
    });
  }
}

function updateAdminThemeIcon(theme) {
  const icon = document.getElementById('admin-theme-icon');
  if (icon) {
    if (theme === 'dark') {
      icon.className = 'fas fa-sun';
    } else {
      icon.className = 'fas fa-moon';
    }
  }
}


// --- INITIALIZE AUTHENTICATION FORMS ---
document.addEventListener('DOMContentLoaded', async () => {
  // Execute guards for admin dashboard layouts
  await guardAdminRoutes();

  // Login Form Handler
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value.trim();
      const rememberMe = document.getElementById('login-remember').checked;

      try {
        const user = await API.login(email, password);
        showToast(`Welcome back, ${user.name}!`, "success");
        
        // Handle redirect parameter
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect');
        
        setTimeout(() => {
          if (redirect) {
            window.location.href = decodeURIComponent(redirect);
          } else {
            window.location.href = '../admin/dashboard.html';
          }
        }, 1000);

      } catch (error) {
        showToast(error.message, "error");
      }
    });
  }

  // Registration Form Handler
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('register-username').value.trim();
      const name = document.getElementById('register-name').value.trim();
      const email = document.getElementById('register-email').value.trim();
      const password = document.getElementById('register-password').value;
      const confirmPassword = document.getElementById('register-confirm').value;

      if (password !== confirmPassword) {
        showToast("Passwords do not match.", "error");
        return;
      }

      try {
        await API.register(username, email, password, name);
        showToast("Registration successful! Redirecting to login...", "success");
        
        setTimeout(() => {
          window.location.href = './login.html';
        }, 1500);

      } catch (error) {
        showToast(error.message, "error");
      }
    });
  }
});
