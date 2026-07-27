// editor.js - CMS Article Composer Logic
import { API } from './api.js';
import { showToast } from './blog.js';

let currentUser = null;
let editPostId = null;
let coverImageBase64 = "";
let autosaveTimer = null;
let lastSavedContent = "";

async function initEditor() {
  currentUser = await API.getCurrentUser();
  if (!currentUser) return;

  // Initialize Categories Dropdown
  const categorySelect = document.getElementById('editor-category');
  const categories = await API.getCategories();
  if (categorySelect) {
    categorySelect.innerHTML = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  }

  // Bind Editor/Preview Tabs
  initEditorTabs();

  // Check URL parameters for Edit Mode
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');

  if (postId) {
    editPostId = Number(postId);
    await loadPostForEdit(editPostId);
  } else {
    // Write Mode
    document.getElementById('editor-page-title').textContent = "Write Article";
    setupSlugGenerator();
    checkForRecoverableDraft("new");
  }

  // Bind image uploader preview
  initImageUploader();

  // Bind action buttons
  document.getElementById('btn-save-draft').addEventListener('click', () => savePost('draft'));
  document.getElementById('btn-publish').addEventListener('click', () => savePost('published'));

  // Start Autosave daemon
  startAutosaveLoop();
}

async function loadPostForEdit(id) {
  try {
    const post = await API.getPost(id);
    
    // Authorization Check: authors can edit only their own posts
    if (currentUser.role === 'author' && post.authorId !== currentUser.id) {
      showToast("Access denied. You can only edit your own posts.", "warning");
      setTimeout(() => {
        window.location.href = 'posts.html';
      }, 1000);
      return;
    }

    document.getElementById('editor-page-title').textContent = "Edit Article";
    document.getElementById('editor-title').value = post.title;
    document.getElementById('editor-slug').value = post.slug;
    document.getElementById('editor-category').value = post.categoryId;
    document.getElementById('editor-tags').value = post.tags.join(', ');
    document.getElementById('editor-content').value = post.content;
    
    if (post.coverImage) {
      coverImageBase64 = post.coverImage;
      showCoverPreview(post.coverImage);
    }

    lastSavedContent = post.content + post.title;

    // Check for autosaved recoverable draft
    checkForRecoverableDraft(id);

  } catch (err) {
    showToast("Error loading post for editing", "error");
  }
}

function setupSlugGenerator() {
  const titleInput = document.getElementById('editor-title');
  const slugInput = document.getElementById('editor-slug');

  titleInput.addEventListener('input', () => {
    const slug = titleInput.value.toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    slugInput.value = slug;
  });
}

function initImageUploader() {
  const fileInput = document.getElementById('cover-file');
  const trigger = document.getElementById('cover-preview-trigger');
  const removeBtn = document.getElementById('remove-cover-btn');

  if (trigger && fileInput) {
    trigger.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          coverImageBase64 = event.target.result;
          showCoverPreview(coverImageBase64);
          showToast("Cover image loaded successfully", "success");
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Cover URL Paste binding
  const coverUrlInput = document.getElementById('cover-url-input');
  if (coverUrlInput) {
    coverUrlInput.addEventListener('input', (e) => {
      const url = e.target.value.trim();
      if (url.startsWith('http')) {
        coverImageBase64 = url;
        showCoverPreview(url);
        showToast("Cover image loaded from URL", "success");
      }
    });
  }

  if (removeBtn) {
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      coverImageBase64 = "";
      document.getElementById('cover-preview-box').innerHTML = `
        <i class="fas fa-cloud-upload-alt"></i>
        <span>Click to upload cover image or paste URL below</span>
      `;
      removeBtn.style.display = 'none';
      if (fileInput) fileInput.value = "";
      if (coverUrlInput) coverUrlInput.value = "";
      showToast("Cover image removed", "info");
    });
  }
}

function showCoverPreview(src) {
  const box = document.getElementById('cover-preview-box');
  const removeBtn = document.getElementById('remove-cover-btn');
  if (box) {
    box.innerHTML = `<img src="${src}" alt="Cover Preview" onerror="this.src='../assets/images/default-cover.jpg'; this.onerror=null;">`;
    if (removeBtn) removeBtn.style.display = 'block';
  }
}

function initEditorTabs() {
  const tabs = document.querySelectorAll('.editor-mode-tab');
  const textarea = document.getElementById('editor-content');
  const preview = document.getElementById('editor-preview');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const mode = tab.dataset.mode;
      if (mode === 'preview') {
        textarea.style.display = 'none';
        preview.style.display = 'block';
        preview.classList.add('active');
        
        // Simple HTML rendering helper
        preview.innerHTML = `<div class="preview-content">${textarea.value || '<p style="color:var(--text-muted); font-style:italic;">No content written yet.</p>'}</div>`;
      } else {
        textarea.style.display = 'block';
        preview.style.display = 'none';
        preview.classList.remove('active');
      }
    });
  });
}

// --- AUTOSAVE ENGINE ---
function startAutosaveLoop() {
  const indicator = document.getElementById('autosave-time');

  autosaveTimer = setInterval(() => {
    const title = document.getElementById('editor-title').value.trim();
    const content = document.getElementById('editor-content').value.trim();

    if (!title && !content) return; // Empty post, don't autosave

    const currentString = content + title;
    if (currentString === lastSavedContent) return; // No edits made

    // Save state to draft
    const draftKey = editPostId ? `cms_autosave_${editPostId}` : 'cms_autosave_new';
    const draftObj = {
      title,
      slug: document.getElementById('editor-slug').value,
      categoryId: document.getElementById('editor-category').value,
      tags: document.getElementById('editor-tags').value,
      content,
      coverImage: coverImageBase64,
      timestamp: Date.now()
    };

    localStorage.setItem(draftKey, JSON.stringify(draftObj));
    lastSavedContent = currentString;

    if (indicator) {
      const timeStr = new Date().toLocaleTimeString();
      indicator.innerHTML = `<div class="autosave-dot"></div> Autosaved at ${timeStr}`;
    }
  }, 30000); // Every 30 seconds
}

function checkForRecoverableDraft(id) {
  const draftKey = id === "new" ? 'cms_autosave_new' : `cms_autosave_${id}`;
  const saved = localStorage.getItem(draftKey);

  if (saved) {
    const draft = JSON.parse(saved);
    const dateStr = new Date(draft.timestamp).toLocaleTimeString();
    
    // Create restore notice
    const restoreNotice = document.createElement('div');
    restoreNotice.className = 'dashboard-card';
    restoreNotice.style.padding = '16px';
    restoreNotice.style.borderLeft = '4px solid var(--warning)';
    restoreNotice.style.flexDirection = 'row';
    restoreNotice.style.justifyContent = 'space-between';
    restoreNotice.style.alignItems = 'center';
    restoreNotice.style.marginBottom = '20px';
    restoreNotice.id = 'restore-draft-notice';

    restoreNotice.innerHTML = `
      <div style="font-size:0.9rem;">
        <i class="fas fa-exclamation-triangle" style="color:var(--warning); margin-right:8px;"></i>
        Found an unsaved backup of this article (Autosaved at ${dateStr}). Restore edits?
      </div>
      <div style="display:flex; gap:10px;">
        <button class="btn btn-primary" id="btn-restore-confirm" style="padding:6px 12px; font-size:0.8rem;">Restore</button>
        <button class="btn btn-secondary" id="btn-restore-discard" style="padding:6px 12px; font-size:0.8rem;">Discard</button>
      </div>
    `;

    const mainContainer = document.querySelector('.admin-content');
    if (mainContainer) {
      mainContainer.insertBefore(restoreNotice, mainContainer.querySelector('.editor-grid'));
      
      // Bind restore button
      document.getElementById('btn-restore-confirm').addEventListener('click', () => {
        document.getElementById('editor-title').value = draft.title;
        document.getElementById('editor-slug').value = draft.slug;
        document.getElementById('editor-category').value = draft.categoryId;
        document.getElementById('editor-tags').value = draft.tags;
        document.getElementById('editor-content').value = draft.content;
        
        if (draft.coverImage) {
          coverImageBase64 = draft.coverImage;
          showCoverPreview(draft.coverImage);
        }
        
        showToast("Edits restored from draft backup", "success");
        restoreNotice.remove();
      });

      // Bind discard button
      document.getElementById('btn-restore-discard').addEventListener('click', () => {
        localStorage.removeItem(draftKey);
        restoreNotice.remove();
        showToast("Backup discarded", "info");
      });
    }
  }
}

// --- SAVE / PUBLISH ACTIONS ---
async function savePost(status) {
  const title = document.getElementById('editor-title').value.trim();
  const slug = document.getElementById('editor-slug').value.trim();
  const categoryId = document.getElementById('editor-category').value;
  const tagsStr = document.getElementById('editor-tags').value.trim();
  const content = document.getElementById('editor-content').value.trim();

  if (!title) {
    showToast("Article title is required", "error");
    return;
  }

  const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [];

  const postData = {
    title,
    slug,
    categoryId: Number(categoryId),
    tags,
    content,
    coverImage: coverImageBase64,
    status,
    authorId: currentUser.id
  };

  try {
    if (editPostId) {
      await API.updatePost(editPostId, postData);
      showToast(`Article updated successfully as ${status}`, "success");
      // Clear autosave key
      localStorage.removeItem(`cms_autosave_${editPostId}`);
    } else {
      await API.createPost(postData);
      showToast(`New article created successfully as ${status}`, "success");
      // Clear autosave key
      localStorage.removeItem('cms_autosave_new');
    }

    clearInterval(autosaveTimer);

    setTimeout(() => {
      window.location.href = 'posts.html';
    }, 1200);

  } catch (err) {
    showToast(err.message, "error");
  }
}

document.addEventListener('DOMContentLoaded', initEditor);
