import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchShopSettings } from '../services/api';
import { SHOP_INFO } from '../data/mockData';

const ShopSettingsContext = createContext({
  settings: SHOP_INFO,
  loading: true,
  refreshSettings: () => {}
});

export function ShopSettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    shop_name: SHOP_INFO.name,
    tagline: 'Smartphones, Certified Pre-Owned & Expert Repairs',
    phone1: SHOP_INFO.phone1,
    phone2: SHOP_INFO.phone2,
    whatsapp: SHOP_INFO.whatsapp,
    email: 'contact@amitmobileshop.com',
    address: SHOP_INFO.location,
    opening_time: '09:00 AM',
    closing_time: '08:30 PM',
    weekly_off: 'None (Open All 7 Days)',
    google_maps_url: SHOP_INFO.mapsUrl
  });
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      const data = await fetchShopSettings();
      if (data && data.shop_name) {
        setSettings(data);
        // Sync into SHOP_INFO in memory so legacy references also stay fresh
        SHOP_INFO.name = data.shop_name || SHOP_INFO.name;
        SHOP_INFO.phone1 = data.phone1 || SHOP_INFO.phone1;
        SHOP_INFO.phone2 = data.phone2 || SHOP_INFO.phone2;
        SHOP_INFO.whatsapp = data.whatsapp || SHOP_INFO.whatsapp;
        SHOP_INFO.location = data.address || SHOP_INFO.location;
        SHOP_INFO.mapsUrl = data.google_maps_url || SHOP_INFO.mapsUrl;
        if (data.opening_time && data.closing_time) {
          SHOP_INFO.timing = `Open Daily: ${data.opening_time} - ${data.closing_time}`;
        }
      }
    } catch (err) {
      console.warn('[ShopSettingsContext] Using default shop settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <ShopSettingsContext.Provider value={{ settings, loading, refreshSettings: loadSettings }}>
      {children}
    </ShopSettingsContext.Provider>
  );
}

export function useShopSettings() {
  const context = useContext(ShopSettingsContext);
  if (!context) {
    return { settings: SHOP_INFO, loading: false, refreshSettings: () => {} };
  }
  return context;
}
