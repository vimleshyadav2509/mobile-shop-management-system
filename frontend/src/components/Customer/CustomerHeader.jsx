import React from 'react';
import { Smartphone, ShoppingBag, Search, Globe, ChevronDown, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';

export default function CustomerHeader({ searchQuery = '', onSearchChange, onLogoClick, showSearch = true }) {
  const { language, setLanguage, t } = useLanguage();
  const { cartCount, openCart } = useCart();

  const toggleLanguage = () => {
    setLanguage(language === 'hi' ? 'en' : 'hi');
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#E2E8F0] shadow-xs">
      {/* Top Bar: Shop Brand + Utilities */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Logo & Name */}
        <div 
          onClick={onLogoClick}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          {/* Shop Icon Badge */}
          <div className="w-10 h-10 rounded-xl bg-[#1264F5] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform duration-150 shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>

          <div>
            <h1 className="text-base sm:text-lg font-bold text-[#102A43] leading-tight tracking-tight">
              {t('common.shop_name') || 'Amit Mobile Shop'}
            </h1>
            <p className="text-[11px] text-[#64748B] font-medium leading-none">
              {t('ref_ui.subtitle') || 'Mobile | Accessories | Repair'}
            </p>
          </div>
        </div>

        {/* Right: Language Pill & Cart Icon */}
        <div className="flex items-center gap-2">
          {/* Language Toggle Pill */}
          <button
            type="button"
            onClick={toggleLanguage}
            aria-label="Toggle language"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#F5F9FF] border border-[#E2E8F0] hover:border-[#1264F5] text-xs font-semibold text-[#102A43] transition-colors cursor-pointer select-none"
          >
            <Globe className="w-3.5 h-3.5 text-[#1264F5]" />
            <span className="text-[11px] uppercase tracking-wide">
              {language === 'hi' ? 'हिंदी' : 'EN'}
            </span>
          </button>

          {/* Cart Icon with Notification Badge */}
          <button
            type="button"
            onClick={openCart}
            aria-label="Open Shopping Cart"
            className="relative p-2 rounded-xl bg-white hover:bg-[#F5F9FF] border border-[#E2E8F0] text-[#102A43] hover:text-[#1264F5] transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#EF4444] text-white text-[10px] font-black h-4.5 min-w-4.5 px-1 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search Bar Strip */}
      {showSearch && (
        <div className="max-w-7xl mx-auto px-4 pb-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder={t('ref_ui.search_placeholder') || 'Search mobile, brand, accessory...'}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#1264F5] focus:bg-white rounded-xl pl-9.5 pr-8 py-2 text-xs sm:text-sm text-[#102A43] placeholder-[#64748B] outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange && onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#64748B] hover:text-[#102A43]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
