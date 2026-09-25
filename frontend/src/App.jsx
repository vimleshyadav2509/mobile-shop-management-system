import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CustomerStorefront from './components/CustomerStorefront';
import ErrorBoundary from './components/ErrorBoundary';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ShopSettingsProvider } from './context/ShopSettingsContext';
import AdminLoginPage from './components/Admin/AdminLoginPage';
import AdminDashboard from './components/Admin/AdminDashboard';
import ProtectedAdminRoute from './components/Admin/ProtectedAdminRoute';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <LanguageProvider>
            <ShopSettingsProvider>
              <Routes>
              {/* Public Customer Storefront with 3D Category Panels */}
              <Route
                path="/"
                element={
                  <ErrorBoundary>
                    <CustomerStorefront />
                  </ErrorBoundary>
                }
              />

              {/* Owner & Admin Authentication */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                }
              />

              {/* Fallback to Customer Store */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ShopSettingsProvider>
        </LanguageProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
