import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5002',
  withCredentials: true
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on page load
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const res = await api.get('/api/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
        }
      } catch (error) {
        // User is not logged in, that's okay
        console.log('User not logged in');
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.post('/api/auth/register', userData);
      
      if (res.data.success) {
        setUser(res.data.user);
      }
      return res.data;
    } catch (error) {
      setError(
        error.response?.data?.error ||
        'Registration failed. Please try again.'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.post('/api/auth/login', userData);
      
      if (res.data.success) {
        setUser(res.data.user);
      }
      return res.data;
    } catch (error) {
      setError(
        error.response?.data?.error ||
        'Login failed. Please check your credentials.'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      setLoading(true);
      await api.post('/api/auth/logout');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;