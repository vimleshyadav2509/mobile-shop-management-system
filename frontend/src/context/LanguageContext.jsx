import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from '../i18n/translations';

export { translations };

const LanguageContext = createContext();

/**
 * Helper to safely extract nested dot notation values like "hero.welcome_title"
 */
function resolvePath(obj, path) {
  if (!obj || !path) return undefined;
  if (typeof obj[path] === 'string' || typeof obj[path] === 'number') {
    return obj[path];
  }
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' || typeof current === 'number' ? current : undefined;
}

export function LanguageProvider({ children }) {
  // Read saved preference synchronously to prevent any UI flash
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem('preferredLanguage') || localStorage.getItem('ams_language');
      if (saved === 'hi' || saved === 'en') {
        return saved;
      }
    } catch (e) {
      console.warn('[LanguageContext] Storage read error:', e);
    }
    return 'hi';
  });

  const [hasChosenLanguage, setHasChosenLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem('preferredLanguage') || localStorage.getItem('ams_language');
      return saved === 'hi' || saved === 'en';
    } catch {
      return false;
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync document metadata on language switch
  useEffect(() => {
    try {
      if (typeof document !== 'undefined') {
        document.documentElement.lang = language === 'hi' ? 'hi' : 'en';
        document.title = language === 'hi'
          ? "अमित मोबाइल शॉप — खोड़ारे चौराहा, उत्तर प्रदेश (Amit Mobile Shop)"
          : "Amit Mobile Shop — Khorare Chowraha, UP (Sales & Repairs)";
      }
    } catch (e) {
      // safe fallback
    }
  }, [language]);

  const selectLanguage = useCallback((lang) => {
    if (lang !== 'hi' && lang !== 'en') return;
    setLanguageState(lang);
    setHasChosenLanguage(true);
    setIsModalOpen(false);

    try {
      localStorage.setItem('preferredLanguage', lang);
      localStorage.setItem('ams_language', lang);
    } catch (e) {
      console.warn('[LanguageContext] Failed to persist preferredLanguage:', e);
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    const next = language === 'hi' ? 'en' : 'hi';
    selectLanguage(next);
  }, [language, selectLanguage]);

  const openLanguageModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeLanguageModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  /**
   * Translation function with:
   * 1. Nested & flat key support (e.g. t('hero.welcome_title') or t('buying_title'))
   * 2. Variable interpolation: t('buying.only_left', { count: 3 })
   * 3. Robust fallback: active language -> English -> fallback string -> key
   */
  const t = useCallback((key, vars = {}) => {
    if (!key) return '';

    const langDict = translations[language] || translations.hi;
    const enDict = translations.en;

    let value = resolvePath(langDict, key);

    // Fallback to English if missing in active language
    if (value === undefined && enDict) {
      value = resolvePath(enDict, key);
    }

    // Ultimate fallback if missing entirely
    if (value === undefined) {
      if (typeof vars === 'string') return vars;
      return key;
    }

    // Interpolate variables if provided: { count: 3 } -> replaces {count}
    if (typeof vars === 'object' && vars !== null) {
      let strVal = String(value);
      for (const [k, v] of Object.entries(vars)) {
        strVal = strVal.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
      return strVal;
    }

    return value;
  }, [language]);

  const contextValue = {
    language,
    setLanguage: selectLanguage,
    toggleLanguage,
    hasChosenLanguage,
    isModalOpen,
    openLanguageModal,
    closeLanguageModal,
    t
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return {
      language: 'hi',
      setLanguage: () => {},
      toggleLanguage: () => {},
      hasChosenLanguage: true,
      isModalOpen: false,
      openLanguageModal: () => {},
      closeLanguageModal: () => {},
      t: (key, vars) => {
        const val = resolvePath(translations.hi, key) || resolvePath(translations.en, key) || (typeof vars === 'string' ? vars : key);
        return val;
      }
    };
  }
  return ctx;
}
