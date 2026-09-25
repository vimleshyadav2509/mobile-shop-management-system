import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminLogin, getCurrentAdmin, adminLogout, getStoredToken, clearStoredToken } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(getStoredToken());
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Validate existing token on mount
  useEffect(() => {
    async function checkExistingAuth() {
      const storedToken = getStoredToken();
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const adminProfile = await getCurrentAdmin();
        setAdmin(adminProfile);
        setToken(storedToken);
      } catch (err) {
        console.warn('[Auth] Session validation failed:', err.message);
        clearStoredToken();
        setAdmin(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkExistingAuth();
  }, []);

  const login = async (username, password) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const data = await adminLogin(username, password);
      setToken(data.access_token);
      setAdmin(data.admin);
      return { success: true };
    } catch (err) {
      setAuthError(err.message || 'Login failed');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await adminLogout();
    } catch (err) {
      console.warn('[Auth] Error during logout:', err);
    } finally {
      clearStoredToken();
      setAdmin(null);
      setToken(null);
      setAuthError(null);
      setIsLoading(false);
    }
  };

  const clearError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: !!admin,
        isLoading,
        authError,
        login,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    return {
      admin: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      authError: null,
      login: async () => ({ success: false }),
      logout: async () => {},
      clearError: () => {}
    };
  }
  return ctx;
}
