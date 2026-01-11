import { createContext, useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import api from "../services/api";
import config from "../config/config";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Use sessionStorage to keep sessions isolated per tab
        const storedUser = sessionStorage.getItem(config.AUTH_TOKEN_KEY);
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        sessionStorage.removeItem(config.AUTH_TOKEN_KEY);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await api.auth.login({ email, password });
      const data = response.data || response;

      if (!data || !data.token) {
        throw new Error("Invalid response from server");
      }

      const userData = {
        _id: data._id,
        username: data.username,
        email: data.email,
        fullName: data.fullName,
        profilePicture: data.profilePicture,
        token: data.token,
      };

      sessionStorage.setItem(config.AUTH_TOKEN_KEY, JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || "Login failed";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      if (!userData.email || !userData.password || !userData.username) {
        throw new Error("Missing required fields");
      }
      const response = await api.auth.register(userData);
      const data = response.data || response;

      if (!data || !data.token) {
        throw new Error("Invalid response from server");
      }

      const userDataWithToken = {
        _id: data._id,
        username: data.username,
        email: data.email,
        fullName: data.fullName,
        profilePicture: data.profilePicture,
        token: data.token,
      };

      sessionStorage.setItem(
        config.AUTH_TOKEN_KEY,
        JSON.stringify(userDataWithToken)
      );
      setUser(userDataWithToken);
      return userDataWithToken;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || "Registration failed";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const logout = () => {
    try {
      sessionStorage.removeItem(config.AUTH_TOKEN_KEY);
      setUser(null);
      setError(null);
    } catch (error) {
      console.error("Logout error:", error);
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

// Hook should be exported after the provider component
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthProvider;
