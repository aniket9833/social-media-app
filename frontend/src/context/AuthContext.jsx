import { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import api from '../services/api';
import config from '../config/config';

const AuthContext = createContext();

// Add the useAuth hook export
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem(config.AUTH_TOKEN_KEY);
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        localStorage.removeItem(config.AUTH_TOKEN_KEY);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const data = await api.auth.login({ email, password });
      if (!data || !data.token) {
        throw new Error('Invalid response from server');
      }
      localStorage.setItem(config.AUTH_TOKEN_KEY, JSON.stringify(data));
      setUser(data);
      return data;
    } catch (error) {
      setError(error.message || 'Login failed');
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      if (!userData.email || !userData.password || !userData.username) {
        throw new Error('Missing required fields');
      }
      const data = await api.auth.register(userData);
      if (!data || !data.token) {
        throw new Error('Invalid response from server');
      }
      localStorage.setItem(config.AUTH_TOKEN_KEY, JSON.stringify(data));
      setUser(data);
      return data;
    } catch (error) {
      setError(error.message || 'Registration failed');
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem(config.AUTH_TOKEN_KEY);
      setUser(null);
      setError(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;
