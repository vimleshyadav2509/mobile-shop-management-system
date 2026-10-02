import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getStoredCustomerToken,
  setStoredCustomerToken,
  clearStoredCustomerToken,
  requestCustomerOtp,
  verifyCustomerOtp,
  getCurrentCustomer,
  updateCustomerProfile,
  requestChangePhoneOtp,
  verifyChangePhoneOtp,
  customerLogout
} from '../services/api';

const CustomerAuthContext = createContext(null);

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [token, setToken] = useState(getStoredCustomerToken());
  const [isLoading, setIsLoading] = useState(true);

  // Validate stored customer token on mount
  useEffect(() => {
    async function loadCustomer() {
      const storedToken = getStoredCustomerToken();
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      try {
        const profile = await getCurrentCustomer();
        setCustomer(profile);
        setToken(storedToken);
      } catch (err) {
        console.warn('[CustomerAuth] Session expired or invalid:', err.message);
        clearStoredCustomerToken();
        setCustomer(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadCustomer();
  }, []);

  const handleRequestOtp = useCallback(async (phone) => {
    return await requestCustomerOtp(phone);
  }, []);

  const handleVerifyOtp = useCallback(async (phone, otp) => {
    const data = await verifyCustomerOtp(phone, otp);
    setToken(data.access_token);
    setCustomer(data.customer);
    return data;
  }, []);

  const handleUpdateProfile = useCallback(async (profileData) => {
    const updated = await updateCustomerProfile(profileData);
    setCustomer(updated);
    return updated;
  }, []);

  const handleRequestPhoneChange = useCallback(async (newPhone) => {
    return await requestChangePhoneOtp(newPhone);
  }, []);

  const handleVerifyPhoneChange = useCallback(async (newPhone, otp) => {
    const updated = await verifyChangePhoneOtp(newPhone, otp);
    setCustomer(updated);
    return updated;
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await customerLogout();
    } catch (err) {
      console.warn('[CustomerAuth] Logout warning:', err);
    } finally {
      clearStoredCustomerToken();
      setCustomer(null);
      setToken(null);
    }
  }, []);

  const refreshCustomer = useCallback(async () => {
    try {
      const profile = await getCurrentCustomer();
      setCustomer(profile);
    } catch {
      // Ignore if session lost
    }
  }, []);

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        token,
        isAuthenticated: !!(customer && token),
        isLoading,
        requestOtp: handleRequestOtp,
        verifyOtp: handleVerifyOtp,
        updateProfile: handleUpdateProfile,
        requestPhoneChangeOtp: handleRequestPhoneChange,
        verifyPhoneChangeOtp: handleVerifyPhoneChange,
        logout: handleLogout,
        refreshCustomer
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
}
