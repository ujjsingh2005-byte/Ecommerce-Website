import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/apiClient';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const { success, error: showError } = useToast();

  // Load current user profile if token exists
  const loadUser = useCallback(async () => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to load authenticated user:', err.message);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Login handler
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success && res.data) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data);
        success(`Welcome back, ${res.data.name}!`);
        return { success: true, user: res.data };
      }
    } catch (err) {
      showError(err.message || 'Login failed');
      return { success: false, message: err.message };
    }
  };

  // Register handler
  const register = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.success && res.data) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data);
        success('Registration successful! Welcome aboard.');
        return { success: true, user: res.data };
      }
    } catch (err) {
      showError(err.message || 'Registration failed');
      return { success: false, message: err.message };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    success('Logged out successfully.');
  };

  // Update profile details
  const updateProfile = async (profileData) => {
    try {
      const res = await api.put('/users/profile', profileData);
      if (res.success && res.data) {
        setUser((prev) => ({ ...prev, ...res.data }));
        success('Profile updated successfully.');
        return { success: true };
      }
    } catch (err) {
      showError(err.message || 'Failed to update profile');
      return { success: false, message: err.message };
    }
  };

  // Upload Profile Photo
  const uploadPhoto = async (file) => {
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const res = await api.post('/users/profile/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.success) {
        setUser((prev) => ({ ...prev, profilePhoto: res.data.profilePhoto }));
        success('Profile photo updated.');
        return { success: true };
      }
    } catch (err) {
      showError(err.message || 'Failed to upload photo');
      return { success: false };
    }
  };

  // Remove Profile Photo
  const removePhoto = async () => {
    try {
      const res = await api.delete('/users/profile/photo');
      if (res.success) {
        setUser((prev) => ({ ...prev, profilePhoto: '' }));
        success('Profile photo removed.');
        return { success: true };
      }
    } catch (err) {
      showError(err.message || 'Failed to remove photo');
      return { success: false };
    }
  };

  // Upload Resume
  const uploadResume = async (file) => {
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const res = await api.post('/users/profile/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.success) {
        setUser((prev) => ({ ...prev, resume: res.data.resume }));
        success('Resume uploaded successfully.');
        return { success: true };
      }
    } catch (err) {
      showError(err.message || 'Failed to upload resume');
      return { success: false };
    }
  };

  // Remove Resume
  const removeResume = async () => {
    try {
      const res = await api.delete('/users/profile/resume');
      if (res.success) {
        setUser((prev) => ({
          ...prev,
          resume: { url: '', originalName: '', uploadedAt: null }
        }));
        success('Resume removed successfully.');
        return { success: true };
      }
    } catch (err) {
      showError(err.message || 'Failed to remove resume');
      return { success: false };
    }
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = isAuthenticated && user.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
        uploadPhoto,
        removePhoto,
        uploadResume,
        removeResume,
        loadUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
