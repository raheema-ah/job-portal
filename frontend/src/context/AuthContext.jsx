import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Validate and sync session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await authService.getCurrentUser();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('user', JSON.stringify(res.user));
          } else {
            await logout();
          }
        } catch (err) {
          console.warn('Session check failed or expired:', err.message);
          // Only clear if 401 unauthorized
          if (err.response?.status === 401) {
            await logout();
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password, role) => {
    const res = await authService.login(email, password, role);
    if (res.success) {
      const { token: authToken, user: authUser } = res;
      setToken(authToken);
      setUser(authUser);
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(authUser));
      return authUser;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (formData) => {
    const res = await authService.register(formData);
    if (res.success) {
      const { token: authToken, user: authUser } = res;
      setToken(authToken);
      setUser(authUser);
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(authUser));
      return authUser;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const isAdmin = user?.role === 'admin';
  const isEmployer = user?.role === 'employer' || user?.role === 'admin';
  const isCandidate = user?.role === 'candidate';
  const isEmployee = user?.role === 'employee';
  const isAuthenticated = Boolean(user && token);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        isEmployer,
        isCandidate,
        isEmployee,
        login,
        register,
        logout,
        updateUser,
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

export default AuthContext;

