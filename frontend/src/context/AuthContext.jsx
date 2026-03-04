import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const resp = await axios.get('/api/me');
      setUser(resp.data);
    } catch (e) {
      console.error('Failed to fetch current user', e);
    }
  };

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      console.log("🔐 Checking token on load:", token ? "Found" : "Not found");
      
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setIsAuthenticated(true);
        console.log("✅ User authenticated from token");
        await fetchCurrentUser();
      } else {
        setIsAuthenticated(false);
        console.log("❌ No token found, user not authenticated");
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = async (identifier, password) => {
    try {
      console.log("📤 Login attempt:", identifier);
      const response = await axios.post('/api/login', {
        identifier,
        password
      });
      const { access_token, username } = response.data;
      console.log("✅ Login successful, token received");
      
      localStorage.setItem('token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      setIsAuthenticated(true);
      setUser({ username });
      return { success: true };
    } catch (error) {
      console.log("❌ Login failed:", error.response?.data?.message);
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (username, email, password) => {
    try {
      console.log("📤 Register attempt:", email);
      const response = await axios.post('/api/register', {
        username,
        email,
        password
      });
      console.log("✅ Registration successful");
      return { success: true, message: response.data.message };
    } catch (error) {
      console.log("❌ Registration failed:", error.response?.data?.message);
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    console.log("🚪 Logging out");
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};