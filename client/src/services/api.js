import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor to attach JWT token to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export const API = {
  // Auth API
  login: (email, password) => api.post('/auth/login', { email, password }).then(res => res.data),
  register: (data) => api.post('/auth/register', data).then(res => res.data),
  getMe: () => api.get('/auth/me').then(res => res.data),

  // Posts API
  getPosts: (params) => api.get('/posts', { params }).then(res => res.data),
  getPost: (slugOrId) => api.get(`/posts/${slugOrId}`).then(res => res.data),
  createPost: (data) => api.post('/posts', data).then(res => res.data),
  updatePost: (id, data) => api.put(`/posts/${id}`, data).then(res => res.data),
  deletePost: (id) => api.delete(`/posts/${id}`).then(res => res.data),

  // Categories API
  getCategories: () => api.get('/categories').then(res => res.data),
  createCategory: (data) => api.post('/categories', data).then(res => res.data),

  // Comments API
  getComments: (params) => api.get('/comments', { params }).then(res => res.data),
  createComment: (data) => api.post('/comments', data).then(res => res.data),
  updateCommentStatus: (id, status) => api.put(`/comments/${id}/status`, { status }).then(res => res.data),
  deleteComment: (id) => api.delete(`/comments/${id}`).then(res => res.data),

  // Users & Bookmarks API
  getUsers: () => api.get('/users').then(res => res.data),
  updateUserRole: (id, role) => api.put(`/users/${id}/role`, { role }).then(res => res.data),
  deleteUser: (id) => api.delete(`/users/${id}`).then(res => res.data),
  followUser: (id) => api.post(`/users/${id}/follow`).then(res => res.data),
  updateProfile: (data) => api.put('/users/profile', data).then(res => res.data),
  changePassword: (data) => api.put('/users/password', data).then(res => res.data),
  toggleBookmark: (postId) => api.post(`/users/bookmarks/${postId}`).then(res => res.data),

  // Messages & Followers Broadcast API
  getMessages: () => api.get('/messages').then(res => res.data),
  sendMessage: (data) => api.post('/messages', data).then(res => res.data),

  // Settings API
  getSettings: () => api.get('/settings').then(res => res.data),
  updateSettings: (data) => api.put('/settings', data).then(res => res.data),

  // Category management
  deleteCategory: (id) => api.delete(`/categories/${id}`).then(res => res.data),

  // Likes
  likePost: (postId) => api.post(`/posts/${postId}/like`).then(res => res.data),

  // Stats API
  getStats: () => api.get('/stats').then(res => res.data),
};

export default api;
