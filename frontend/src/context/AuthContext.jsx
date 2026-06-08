import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token and user exist in storage
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await API.post('/auth/login', { email, password });
      const { token, ...userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed! Please check your credentials.';
    } finally {
      setLoading(false);
    }
  };

  const register = async (studentData) => {
    try {
      await API.post('/auth/register', studentData);
    } catch (error) {
      throw error.response?.data?.validationErrors 
        ? Object.values(error.response.data.validationErrors).join(', ')
        : (error.response?.data?.message || 'Registration failed!');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateProfileState = (updatedData) => {
    if (user) {
      const updatedUser = {
        ...user,
        fullName: updatedData.fullName,
        email: updatedData.email || user.email
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfileState,
    isAdmin: () => user?.role === 'ROLE_ADMIN',
    isStudent: () => user?.role === 'ROLE_STUDENT',
    isSuperAdmin: () => user?.role === 'ROLE_SUPER_ADMIN',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
