import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminThemeContext = createContext();

export function AdminThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('ams_admin_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark'; // Default to premium dark SaaS
  });

  useEffect(() => {
    localStorage.setItem('ams_admin_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <AdminThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const ctx = useContext(AdminThemeContext);
  if (!ctx) {
    throw new Error('useAdminTheme must be used within an AdminThemeProvider');
  }
  return ctx;
}
