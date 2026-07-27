import React, { createContext, useContext, useState, useEffect } from 'react';
import { API } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('cms_token');
      if (token) {
        try {
          const user = await API.getMe();
          setCurrentUser(user);
        } catch (err) {
          console.warn('Session expired or token invalid');
          localStorage.removeItem('cms_token');
          setCurrentUser(null);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const data = await API.login(email, password);
    localStorage.setItem('cms_token', data.token);
    setCurrentUser(data);
    return data;
  };

  const register = async (userData) => {
    const data = await API.register(userData);
    localStorage.setItem('cms_token', data.token);
    setCurrentUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('cms_token');
    setCurrentUser(null);
  };

  const updateBookmarksState = (bookmarks) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, bookmarks });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        loading,
        login,
        register,
        logout,
        updateBookmarksState,
        isAdmin: currentUser?.role === 'admin',
        isAuthor: currentUser?.role === 'author',
        isAdminOrAuthor: currentUser?.role === 'admin' || currentUser?.role === 'author',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
