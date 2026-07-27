// api.js - Mock Async API Layer wrapping storage.js
import { DB } from './storage.js';

// Helper to simulate network latency
const delay = (ms = 150) => new Promise(resolve => setTimeout(resolve, ms));

export const API = {
  // --- AUTHENTICATION & SESSIONS ---
  async login(email, password) {
    await delay();
    const users = DB.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) {
      throw new Error("Invalid email or password.");
    }
    if (user.status !== "active") {
      throw new Error("This account has been suspended.");
    }
    localStorage.setItem("cms_session", JSON.stringify(user));
    return user;
  },

  async getCurrentUser() {
    await delay(50);
    const session = localStorage.getItem("cms_session");
    return session ? JSON.parse(session) : null;
  },

  async logout() {
    await delay(50);
    localStorage.removeItem("cms_session");
    return true;
  },

  async register(username, email, password, name = "") {
    await delay();
    const users = DB.getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("Email is already registered.");
    }
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      throw new Error("Username is already taken.");
    }

    const newUser = {
      id: Date.now(),
      username: username.toLowerCase().replace(/\s+/g, "_"),
      email: email.toLowerCase(),
      password,
      name: name || username,
      role: "user", // Default registered user role
      status: "active",
      bio: "Joined the blog platform.",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
    };

    users.push(newUser);
    DB.saveUsers(users);
    return newUser;
  },

  // --- USERS MANAGEMENT ---
  async getUsers() {
    await delay();
    return DB.getUsers();
  },

  async updateUser(id, data) {
    await delay();
    const users = DB.getUsers();
    const index = users.findIndex(u => u.id === Number(id));
    if (index === -1) throw new Error("User not found.");

    users[index] = { ...users[index], ...data };
    DB.saveUsers(users);

    // Update active session if details of current user changed
    const session = await this.getCurrentUser();
    if (session && session.id === Number(id)) {
      localStorage.setItem("cms_session", JSON.stringify(users[index]));
    }

    return users[index];
  },

  async deleteUser(id) {
    await delay();
    const users = DB.getUsers();
    const filtered = users.filter(u => u.id !== Number(id));
    if (users.length === filtered.length) throw new Error("User not found.");
    DB.saveUsers(filtered);
    return true;
  },

  // --- POSTS ---
  async getPosts(filters = {}) {
    await delay();
    let posts = DB.getPosts();
    const users = DB.getUsers();
    const categories = DB.getCategories();

    // Map authors and categories for UI consumption
    posts = posts.map(post => {
      const author = users.find(u => u.id === post.authorId);
      const category = categories.find(c => c.id === post.categoryId);
      return {
        ...post,
        authorName: author ? author.name : "Anonymous",
        authorAvatar: author ? author.avatar : "",
        categoryName: category ? category.name : "Uncategorized"
      };
    });

    // Apply filtering
    if (filters.status) {
      posts = posts.filter(p => p.status === filters.status);
    }
    if (filters.categoryId) {
      posts = posts.filter(p => p.categoryId === Number(filters.categoryId));
    }
    if (filters.authorId) {
      posts = posts.filter(p => p.authorId === Number(filters.authorId));
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      posts = posts.filter(p => 
        p.title.toLowerCase().includes(searchLower) || 
        p.content.toLowerCase().includes(searchLower) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Sort: newest published first, or newly updated
    return posts.sort((a, b) => new Date(b.publishDate || 0) - new Date(a.publishDate || 0));
  },

  async getPost(id) {
    await delay();
    const posts = DB.getPosts();
    const index = posts.findIndex(p => p.id === Number(id));
    if (index === -1) throw new Error("Post not found.");

    // Increment views
    posts[index].views = (posts[index].views || 0) + 1;
    DB.savePosts(posts);

    const users = DB.getUsers();
    const categories = DB.getCategories();
    const author = users.find(u => u.id === posts[index].authorId);
    const category = categories.find(c => c.id === posts[index].categoryId);

    return {
      ...posts[index],
      authorName: author ? author.name : "Anonymous",
      authorAvatar: author ? author.avatar : "",
      authorBio: author ? author.bio : "",
      categoryName: category ? category.name : "Uncategorized"
    };
  },

  async getPostBySlug(slug) {
    await delay();
    const posts = DB.getPosts();
    const index = posts.findIndex(p => p.slug === slug);
    if (index === -1) throw new Error("Post not found.");

    // Increment views
    posts[index].views = (posts[index].views || 0) + 1;
    DB.savePosts(posts);

    const users = DB.getUsers();
    const categories = DB.getCategories();
    const author = users.find(u => u.id === posts[index].authorId);
    const category = categories.find(c => c.id === posts[index].categoryId);

    return {
      ...posts[index],
      authorName: author ? author.name : "Anonymous",
      authorAvatar: author ? author.avatar : "",
      authorBio: author ? author.bio : "",
      categoryName: category ? category.name : "Uncategorized"
    };
  },

  async createPost(data) {
    await delay();
    const posts = DB.getPosts();

    const title = data.title || "Untitled Post";
    const slug = data.slug || title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    // Simple reading time calc
    const wordCount = (data.content || "").trim().split(/\s+/).length;
    const readingTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

    const newPost = {
      id: Date.now(),
      title,
      slug,
      content: data.content || "",
      categoryId: Number(data.categoryId) || 1,
      tags: data.tags || [],
      coverImage: data.coverImage || "",
      authorId: Number(data.authorId),
      publishDate: data.status === "published" ? new Date().toISOString() : "",
      readingTime,
      status: data.status || "draft",
      views: 0
    };

    posts.push(newPost);
    DB.savePosts(posts);
    return newPost;
  },

  async updatePost(id, data) {
    await delay();
    const posts = DB.getPosts();
    const index = posts.findIndex(p => p.id === Number(id));
    if (index === -1) throw new Error("Post not found.");

    const existing = posts[index];
    const statusChanged = data.status && existing.status !== data.status;
    let publishDate = existing.publishDate;

    if (statusChanged && data.status === "published") {
      publishDate = new Date().toISOString();
    }

    // Recalculate reading time if content changed
    let readingTime = existing.readingTime;
    if (data.content) {
      const wordCount = data.content.trim().split(/\s+/).length;
      readingTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
    }

    posts[index] = {
      ...existing,
      ...data,
      publishDate,
      readingTime,
      id: existing.id, // Ensure ID is immutable
      authorId: existing.authorId // Ensure author is immutable
    };

    DB.savePosts(posts);
    return posts[index];
  },

  async deletePost(id) {
    await delay();
    const posts = DB.getPosts();
    const filtered = posts.filter(p => p.id !== Number(id));
    if (posts.length === filtered.length) throw new Error("Post not found.");
    DB.savePosts(filtered);
    return true;
  },

  // --- CATEGORIES ---
  async getCategories() {
    await delay(50);
    return DB.getCategories();
  },

  async createCategory(name) {
    await delay();
    const categories = DB.getCategories();
    if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      throw new Error("Category already exists.");
    }
    const newCat = {
      id: Date.now(),
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-')
    };
    categories.push(newCat);
    DB.saveCategories(categories);
    return newCat;
  },

  // --- COMMENTS ---
  async getComments(filters = {}) {
    await delay();
    let comments = DB.getComments();
    const posts = DB.getPosts();

    comments = comments.map(c => {
      const post = posts.find(p => p.id === c.postId);
      return {
        ...c,
        postTitle: post ? post.title : "Deleted Post"
      };
    });

    if (filters.status) {
      comments = comments.filter(c => c.status === filters.status);
    }
    if (filters.postId) {
      comments = comments.filter(c => c.postId === Number(filters.postId));
    }
    if (filters.authorId) {
      // Filter comments left on posts written by this author
      const authorPosts = posts.filter(p => p.authorId === Number(filters.authorId)).map(p => p.id);
      comments = comments.filter(c => authorPosts.includes(c.postId));
    }

    return comments.sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  async createComment(postId, author, email, content) {
    await delay();
    const comments = DB.getComments();
    const newComment = {
      id: Date.now(),
      postId: Number(postId),
      author,
      email,
      content,
      status: "pending", // Default to pending moderation
      date: new Date().toISOString()
    };
    comments.push(newComment);
    DB.saveComments(comments);
    return newComment;
  },

  async updateCommentStatus(id, status) {
    await delay();
    const comments = DB.getComments();
    const index = comments.findIndex(c => c.id === Number(id));
    if (index === -1) throw new Error("Comment not found.");

    comments[index].status = status; // 'approved' or 'pending'
    DB.saveComments(comments);
    return comments[index];
  },

  async deleteComment(id) {
    await delay();
    const comments = DB.getComments();
    const filtered = comments.filter(c => c.id !== Number(id));
    if (comments.length === filtered.length) throw new Error("Comment not found.");
    DB.saveComments(filtered);
    return true;
  },

  // --- BOOKMARKS ---
  async getBookmarks(userId) {
    await delay(50);
    const bookmarks = DB.getBookmarks();
    const userBookmarks = bookmarks.filter(b => b.userId === Number(userId));
    const postIds = userBookmarks.map(b => b.postId);
    
    // Fetch full post detail
    const posts = await this.getPosts({ status: 'published' });
    return posts.filter(p => postIds.includes(p.id));
  },

  async toggleBookmark(userId, postId) {
    await delay(50);
    const bookmarks = DB.getBookmarks();
    const index = bookmarks.findIndex(b => b.userId === Number(userId) && b.postId === Number(postId));
    let isBookmarked = false;

    if (index > -1) {
      bookmarks.splice(index, 1);
    } else {
      bookmarks.push({ userId: Number(userId), postId: Number(postId) });
      isBookmarked = true;
    }

    DB.saveBookmarks(bookmarks);
    return isBookmarked;
  }
};
