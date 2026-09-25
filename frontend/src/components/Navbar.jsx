import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Wrench,
  Phone,
  MessageCircle,
  MapPin,
  Globe,
  Menu,
  X,
  Search,
  ShoppingBag
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { SHOP_INFO } from '../data/mockData';

export default function Navbar({ activeHub, setActiveHub, onSearchClick }) {
  const { language, toggleLanguage, t } = useLanguage();
  const { cartCount, openCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global ⌘K / Ctrl+K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('storefront-search-input');
        if (searchInput) {
          searchInput.focus();
          searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (onSearchClick) {
          onSearchClick();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSearchClick]);

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-sm">
      
      {/* Top Location & Timing Utility Bar */}
      <div className="bg-slate-950/80 border-b border-slate-800/80 text-slate-300 text-xs py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Kuk Nagar Grint Rd, Khorare, UP 271312</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Open Daily: 9:00 AM – 8:30 PM</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span>Finance Partners: <strong className="text-amber-300 font-semibold">Bajaj • TVS • Samsung+</strong></span>
            <span className="text-slate-600">|</span>
            <a href={`tel:${SHOP_INFO.phone1}`} className="text-slate-300 hover:text-white transition flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>+91 {SHOP_INFO.phone1}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Location */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none shrink-0"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-9 h-9 rounded-lg bg-primary-800 border border-primary-700 flex items-center justify-center text-white shadow-sm shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black tracking-tight text-white font-['Poppins'] leading-tight">
                Amit Mobile Shop
              </div>
              <p className="text-[11px] text-slate-400 leading-none mt-0.5">
                Khorare, Uttar Pradesh
              </p>
            </div>
          </div>

          {/* Quick Search Bar with ⌘K */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
            <div 
              onClick={() => {
                const el = document.getElementById('storefront-search-input');
                if (el) {
                  el.focus();
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-400 hover:border-slate-600 cursor-pointer transition"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span>Search iPhone, Samsung, Realme, repairs...</span>
              </div>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 border border-slate-600">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Navigation Items & Quick Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              <button
                onClick={() => {
                  setActiveHub('buying');
                  const el = document.getElementById('hub-content-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`px-3 py-1.5 rounded-md transition ${
                  activeHub === 'buying' 
                    ? 'text-white bg-slate-800 font-semibold' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {t('hub_buying')}
              </button>

              <button
                onClick={() => {
                  setActiveHub('repairing');
                  const el = document.getElementById('hub-content-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`px-3 py-1.5 rounded-md transition ${
                  activeHub === 'repairing' 
                    ? 'text-white bg-slate-800 font-semibold' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {t('hub_repairing')}
              </button>
            </nav>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>{language === 'hi' ? 'English' : 'हिंदी'}</span>
            </button>

            {/* Cart Drawer Trigger */}
            <button
              onClick={openCart}
              className="relative p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition"
              title="View Cart / Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary-600 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* WhatsApp CTA (Primary Action Button) */}
            <a
              href={`https://wa.me/${SHOP_INFO.whatsapp}?text=${encodeURIComponent(
                language === 'hi'
                  ? 'नमस्ते Amit Mobile Shop, मुझे फोन और EMI के बारे में जानकारी चाहिए।'
                  : 'Hello Amit Mobile Shop, I would like to inquire about smartphones and 0% EMI.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp text-xs py-2 px-3 sm:px-4 shrink-0"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 px-4 pt-3 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setActiveHub('buying');
                setMobileMenuOpen(false);
                const el = document.getElementById('hub-content-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`py-2 px-3 text-center rounded-lg text-xs font-semibold ${
                activeHub === 'buying' ? 'bg-primary-700 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {t('hub_buying')}
            </button>

            <button
              onClick={() => {
                setActiveHub('repairing');
                setMobileMenuOpen(false);
                const el = document.getElementById('hub-content-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`py-2 px-3 text-center rounded-lg text-xs font-semibold ${
                activeHub === 'repairing' ? 'bg-primary-700 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {t('hub_repairing')}
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Shop Helpline:</span>
            <a href={`tel:${SHOP_INFO.phone1}`} className="text-white font-semibold">
              +91 {SHOP_INFO.phone1}
            </a>
          </div>
        </div>
      )}

    </header>
  );
}
