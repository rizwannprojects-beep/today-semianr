import { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService.js';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('accessToken') || null);
  const [loading, setLoading] = useState(true);

  // Initialize and check current user status
  const checkAuth = useCallback(async () => {
    const storedToken = localStorage.getItem('accessToken');
    if (!storedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await authService.getMe();
      if (response?.data?.user) {
        setUser(response.data.user);
        localStorage.setItem('currentUser', JSON.stringify(response.data.user));
      }
    } catch (err) {
      console.warn('Initial session validation failed:', err.message);
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('accessToken');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    const { user: userData, accessToken } = res.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('currentUser', JSON.stringify(userData));
    setToken(accessToken);
    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    const { user: newUser, accessToken } = res.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    setToken(accessToken);
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Logout API error:', err.message);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('currentUser');
      setToken(null);
      setUser(null);
    }
  };

  const forgotPassword = async (email) => {
    const res = await authService.forgotPassword(email);
    return res.data;
  };

  const resetPassword = async (data) => {
    const res = await authService.resetPassword(data);
    return res.data;
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
