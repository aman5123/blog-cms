import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/ToastContainer';

// Public pages
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Contact from './pages/Contact';
import Categories from './pages/Categories';
import ExploreFeed from './pages/ExploreFeed';

// Admin pages
import Dashboard from './pages/admin/Dashboard';
import ManagePosts from './pages/admin/ManagePosts';
import Editor from './pages/admin/Editor';
import ManageComments from './pages/admin/ManageComments';
import ManageUsers from './pages/admin/ManageUsers';
import Settings from './pages/admin/Settings';
import Profile from './pages/admin/Profile';

// Route guards
function PrivateRoute({ children, adminOnly = false }) {
  const { currentUser, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--background)' }}>
        <div style={{ textAlign: 'center' }}>
          <i className="fas fa-feather-alt" style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '16px', display: 'block', animation: 'pulse 1.5s infinite' }}></i>
          <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
        </div>
      </div>
    );
  }
  if (!currentUser) return <Navigate to="/login" replace />;
  if (adminOnly && !['admin', 'author'].includes(currentUser.role)) return <Navigate to="/" replace />;
  return children;
}

function PublicOnlyRoute({ children }) {
  const { currentUser, loading } = useAuth();
  if (loading) return null;
  if (currentUser) return <Navigate to="/admin" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/post/:slug" element={<PostDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/feed" element={<ExploreFeed />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<PrivateRoute adminOnly={true}><Dashboard /></PrivateRoute>} />
            <Route path="/admin/posts" element={<PrivateRoute adminOnly={true}><ManagePosts /></PrivateRoute>} />
            <Route path="/admin/editor" element={<PrivateRoute adminOnly={true}><Editor /></PrivateRoute>} />
            <Route path="/admin/comments" element={<PrivateRoute adminOnly={true}><ManageComments /></PrivateRoute>} />
            <Route path="/admin/users" element={<PrivateRoute adminOnly={true}><ManageUsers /></PrivateRoute>} />
            <Route path="/admin/settings" element={<PrivateRoute adminOnly={true}><Settings /></PrivateRoute>} />
            <Route path="/admin/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
