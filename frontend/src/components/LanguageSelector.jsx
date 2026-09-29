import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe, Check, ChevronDown } from 'lucide-react';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelect = (lang) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        id="top-language-selector-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Select Language"
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-white text-xs font-bold transition shadow-xs select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-300"
      >
        <Globe className="w-4 h-4 text-amber-300 shrink-0" />
        <span className="font-semibold">{language === 'hi' ? 'हिंदी' : 'English'}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-white/70 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="top-language-selector-btn"
          className="absolute right-0 top-full mt-2 w-44 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/20 shadow-2xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 border-b border-white/10">
            {language === 'hi' ? 'भाषा चुनें (Select Language)' : 'Choose Language'}
          </div>

          {/* Option: English */}
          <button
            type="button"
            role="menuitem"
            id="lang-option-en"
            onClick={() => handleSelect('en')}
            className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between transition-colors ${
              language === 'en'
                ? 'bg-blue-600 text-white font-bold'
                : 'text-slate-200 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base" role="img" aria-label="UK Flag">
                🇬🇧
              </span>
              <span>English</span>
            </div>
            {language === 'en' && <Check className="w-4 h-4 text-amber-300" />}
          </button>

          {/* Option: Hindi */}
          <button
            type="button"
            role="menuitem"
            id="lang-option-hi"
            onClick={() => handleSelect('hi')}
            className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between transition-colors ${
              language === 'hi'
                ? 'bg-blue-600 text-white font-bold'
                : 'text-slate-200 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base" role="img" aria-label="India Flag">
                🇮🇳
              </span>
              <span className="font-hindi">हिंदी</span>
            </div>
            {language === 'hi' && <Check className="w-4 h-4 text-amber-300" />}
          </button>
        </div>
      )}
    </div>
  );
}
