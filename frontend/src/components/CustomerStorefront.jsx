import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Smartphone,
  Headphones,
  Wrench,
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  ShieldCheck,
  Zap,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import BuyingHub from './BuyingHub/BuyingHub';
import AccessoriesHub from './AccessoriesHub';
import RepairingHub from './RepairingHub/RepairingHub';
import CartDrawer from './CartDrawer';
import LanguageModal from './LanguageModal';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { SHOP_INFO } from '../data/mockData';

export default function CustomerStorefront() {
  // Active Category State: 'mobiles' | 'accessories' | 'repairs'
  const [activeTab, setActiveTab] = useState('mobiles');
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const { language = 'hi', t = (k) => k } = useLanguage();

  let cartCount = 0;
  let openCart = () => {};
  try {
    const cartCtx = useCart();
    if (cartCtx) {
      cartCount = cartCtx.cartCount || 0;
      openCart = cartCtx.openCart || (() => {});
    }
  } catch (e) {
    console.warn('[CustomerStorefront] Safe fallback for useCart:', e);
  }

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const contentEl = document.getElementById('storefront-tab-content');
    if (contentEl) {
      contentEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white pb-20 md:pb-0">
      
      {/* First-Visit / Explicit Language Selection Modal */}
      <LanguageModal />

      {/* Non-blocking Subtle Offline Badge (Bottom Left) */}
      {!isOnline && (
        <div className="hidden sm:flex fixed bottom-5 left-5 z-40 bg-slate-900/90 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg items-center gap-1.5 backdrop-blur-xs font-hindi">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>{t('common.offline_mode')}</span>
        </div>
      )}

      {/* Slide-out Cart Drawer */}
      <CartDrawer />

      {/* =========================================================================
          1. HEADER & BRANDING BANNER:
          - Deep Royal Blue Gradient background (from blue-950 to primary-700)
          - Left: Large, clear bold shop title
          - Right: Clean Location Badge, Language Selector & Utility Controls
          ========================================================================= */}
      <header className="sticky top-0 z-30 bg-gradient-to-r from-blue-950 via-primary-900 to-primary-700 text-white shadow-lg border-b border-primary-800">
        
        {/* Top Mini Utility Strip */}
        <div className="bg-black/20 border-b border-white/10 text-slate-200 text-xs py-1.5 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4 text-[11px] sm:text-xs">
              <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{t('header.main_branch')}</span>
              </span>
              <span className="text-white/30 hidden sm:inline">•</span>
              <span className="text-white/80 hidden sm:inline">{t('header.hours_label')}</span>
            </div>

            <div className="flex items-center gap-4 text-[11px] sm:text-xs">
              <a
                href={`tel:${SHOP_INFO.phone1}`}
                className="hover:text-amber-300 transition flex items-center gap-1 font-semibold"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>+91 {SHOP_INFO.phone1}</span>
              </a>
              <span className="text-white/30">|</span>
              <Link
                to="/admin/login"
                className="text-white/70 hover:text-white transition font-medium"
              >
                {t('common.owner_portal')}
              </Link>
            </div>
          </div>
        </div>

        {/* Main Branding Header Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            
            {/* Left: Large, Clear Bold Shop Title */}
            <div 
              onClick={() => {
                setActiveTab('mobiles');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-3.5 cursor-pointer select-none group"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/25 flex items-center justify-center text-white shadow-inner group-hover:scale-105 transition-transform duration-200 shrink-0">
                <Smartphone className="w-7 h-7 sm:w-8 sm:h-8 text-amber-300" />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-hindi tracking-tight text-white drop-shadow-md">
                  {t('common.shop_name')}
                </h1>
                <p className="text-xs sm:text-sm text-blue-100 font-medium">
                  Amit Mobile Shop • Khorare Chowraha
                </p>
              </div>
            </div>

            {/* Right: Location Badge + Utility Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Clean Location Badge with Map Pin icon */}
              <a
                href={SHOP_INFO.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={t('footer.maps_directions')}
                className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold backdrop-blur-md transition shadow-xs group"
              >
                <div className="p-1 rounded-md bg-amber-400/20 text-amber-300">
                  <MapPin className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-left leading-tight">
                  <span className="font-bold text-white block">Amit Mobile Shop</span>
                  <span className="text-[11px] text-blue-100 font-normal">Khorare, UP 271312</span>
                </div>
              </a>

              {/* Language Switcher Dropdown */}
              <LanguageSelector />

              {/* Shopping Cart Drawer Trigger */}
              <button
                type="button"
                onClick={openCart}
                className="relative p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition shadow-sm cursor-pointer"
                title={t('common.view_bag')}
              >
                <ShoppingBag className="w-5 h-5 text-amber-300" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 text-[11px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-primary-900 shadow-md">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* WhatsApp Quick CTA */}
              <a
                href={`https://wa.me/${SHOP_INFO.whatsapp}?text=${encodeURIComponent(
                  language === 'hi'
                    ? 'नमस्ते Amit Mobile Shop, मुझे जानकारी चाहिए।'
                    : 'Hello Amit Mobile Shop, I need information.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black transition shadow-md hover:shadow-lg"
              >
                <MessageCircle className="w-4 h-4 fill-white text-emerald-500" />
                <span>{t('common.whatsapp_chat')}</span>
              </a>

            </div>

          </div>
        </div>

        {/* Mobile Location Sub-bar */}
        <div className="md:hidden bg-black/30 border-t border-white/10 px-4 py-1.5 flex items-center justify-between text-[11px] text-blue-100">
          <a 
            href={SHOP_INFO.mapsUrl}
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:underline"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="truncate">Kuk Nagar Grint Rd, Khorare, UP 271312</span>
          </a>
          <span className="text-emerald-300 font-bold shrink-0">{t('common.open_status')}</span>
        </div>

      </header>


      {/* =========================================================================
          2. HERO GREETING SECTION:
          - Soft off-white / light blue background (#F8FAFC)
          - Prominent, friendly welcome heading
          ========================================================================= */}
      <section className="bg-[#F8FAFC] border-b border-slate-200/80 pt-8 pb-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          
          {/* Friendly Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/70 border border-blue-200 text-primary-900 text-xs sm:text-sm font-bold font-hindi shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>{t('hero.eyebrow')}</span>
          </div>

          {/* Prominent Welcome Heading */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-hindi text-slate-950 tracking-tight leading-tight">
            {t('hero.welcome_title')}
          </h2>

          {/* Subtitle & Trust Promises */}
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
            {t('hero.welcome_subtitle')}
          </p>

          {/* 3 Quick Assurance Chips */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-bold text-slate-700">
            <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>{t('hero.chip_emi')}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{t('hero.chip_genuine')}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              <span>{t('hero.chip_repair')}</span>
            </span>
          </div>

        </div>
      </section>


      {/* =========================================================================
          3. CORE 3D CATEGORY BUTTONS (THE MAIN 3-COLUMN GRID):
          Tactile 3D Cards/Buttons with heavy rounded corners (rounded-3xl),
          vibrant gradients, distinct drop-shadows, and smooth push-down 3D animation
          ========================================================================= */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 -mt-4 sm:-mt-6 z-10 relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          
          {/* CARD 1: Mobiles */}
          <button
            type="button"
            onClick={() => handleTabChange('mobiles')}
            className={`group relative text-left rounded-3xl p-6 sm:p-7 text-white transition-all duration-300 overflow-hidden cursor-pointer select-none
              bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700
              border-t border-blue-400/50
              border-b-[8px] border-blue-900
              shadow-[0_12px_0_#1e40af]
              hover:shadow-[0_16px_0_#1e40af] hover:-translate-y-2
              active:shadow-[0_2px_0_#1e40af] active:translate-y-1
              ${activeTab === 'mobiles' ? 'ring-4 ring-offset-4 ring-blue-500 scale-[1.02]' : 'opacity-95 hover:opacity-100'}
            `}
          >
            {/* Specular Light Reflection */}
            <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/30 to-transparent pointer-events-none rounded-t-3xl" />

            {/* Active Pill Indicator */}
            {activeTab === 'mobiles' && (
              <div className="absolute top-4 right-4 bg-white text-blue-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <span>{t('category_cards.active_badge')}</span>
              </div>
            )}

            <div className="flex flex-col justify-between h-full space-y-6">
              
              {/* 3D Styled Icon Container */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-inner group-hover:rotate-3 transition-transform duration-300">
                <div className="relative">
                  <Smartphone className="w-9 h-9 sm:w-11 sm:h-11 text-white drop-shadow-md" />
                  <Sparkles className="w-4 h-4 text-amber-300 absolute -top-1 -right-1 animate-bounce" />
                </div>
              </div>

              {/* Title & Subtitle */}
              <div>
                <h3 className="text-2xl sm:text-3xl font-black font-hindi text-white tracking-tight drop-shadow-sm">
                  {t('category_cards.mobiles_title')}
                </h3>
                <p className="text-blue-100 font-semibold text-sm sm:text-base mt-1.5 font-hindi">
                  {t('category_cards.mobiles_subtitle')}
                </p>
                <p className="text-xs text-blue-200 mt-1">
                  {t('category_cards.mobiles_brands')}
                </p>
              </div>

              {/* Action Prompt */}
              <div className="pt-2 flex items-center justify-between text-xs font-bold text-white/90 border-t border-white/20">
                <span>{t('category_cards.mobiles_action')}</span>
                <span className="p-1.5 rounded-full bg-white/20 group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4 text-white" />
                </span>
              </div>

            </div>
          </button>


          {/* CARD 2: Accessories */}
          <button
            type="button"
            onClick={() => handleTabChange('accessories')}
            className={`group relative text-left rounded-3xl p-6 sm:p-7 text-white transition-all duration-300 overflow-hidden cursor-pointer select-none
              bg-gradient-to-b from-emerald-500 via-emerald-600 to-emerald-700
              border-t border-emerald-400/50
              border-b-[8px] border-emerald-900
              shadow-[0_12px_0_#065f46]
              hover:shadow-[0_16px_0_#065f46] hover:-translate-y-2
              active:shadow-[0_2px_0_#065f46] active:translate-y-1
              ${activeTab === 'accessories' ? 'ring-4 ring-offset-4 ring-emerald-500 scale-[1.02]' : 'opacity-95 hover:opacity-100'}
            `}
          >
            {/* Specular Light Reflection */}
            <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/30 to-transparent pointer-events-none rounded-t-3xl" />

            {/* Active Pill Indicator */}
            {activeTab === 'accessories' && (
              <div className="absolute top-4 right-4 bg-white text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>{t('category_cards.active_badge')}</span>
              </div>
            )}

            <div className="flex flex-col justify-between h-full space-y-6">
              
              {/* 3D Styled Icon Container */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-inner group-hover:rotate-3 transition-transform duration-300">
                <div className="relative">
                  <Headphones className="w-9 h-9 sm:w-11 sm:h-11 text-white drop-shadow-md" />
                  <Zap className="w-4 h-4 text-amber-300 absolute -top-1 -right-1" />
                </div>
              </div>

              {/* Title & Subtitle */}
              <div>
                <h3 className="text-2xl sm:text-3xl font-black font-hindi text-white tracking-tight drop-shadow-sm">
                  {t('category_cards.accessories_title')}
                </h3>
                <p className="text-emerald-100 font-semibold text-sm sm:text-base mt-1.5 font-hindi">
                  {t('category_cards.accessories_subtitle')}
                </p>
                <p className="text-xs text-emerald-200 mt-1">
                  {t('category_cards.accessories_items')}
                </p>
              </div>

              {/* Action Prompt */}
              <div className="pt-2 flex items-center justify-between text-xs font-bold text-white/90 border-t border-white/20">
                <span>{t('category_cards.accessories_action')}</span>
                <span className="p-1.5 rounded-full bg-white/20 group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4 text-white" />
                </span>
              </div>

            </div>
          </button>


          {/* CARD 3: Repairs */}
          <button
            type="button"
            onClick={() => handleTabChange('repairs')}
            className={`group relative text-left rounded-3xl p-6 sm:p-7 text-white transition-all duration-300 overflow-hidden cursor-pointer select-none
              bg-gradient-to-b from-amber-500 via-amber-600 to-amber-700
              border-t border-amber-400/50
              border-b-[8px] border-amber-900
              shadow-[0_12px_0_#92400e]
              hover:shadow-[0_16px_0_#92400e] hover:-translate-y-2
              active:shadow-[0_2px_0_#92400e] active:translate-y-1
              ${activeTab === 'repairs' ? 'ring-4 ring-offset-4 ring-amber-500 scale-[1.02]' : 'opacity-95 hover:opacity-100'}
            `}
          >
            {/* Specular Light Reflection */}
            <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/30 to-transparent pointer-events-none rounded-t-3xl" />

            {/* Active Pill Indicator */}
            {activeTab === 'repairs' && (
              <div className="absolute top-4 right-4 bg-white text-amber-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                <span>{t('category_cards.active_badge')}</span>
              </div>
            )}

            <div className="flex flex-col justify-between h-full space-y-6">
              
              {/* 3D Styled Icon Container */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-inner group-hover:rotate-3 transition-transform duration-300">
                <div className="relative">
                  <Wrench className="w-9 h-9 sm:w-11 sm:h-11 text-white drop-shadow-md" />
                  <Clock className="w-4 h-4 text-emerald-300 absolute -top-1 -right-1" />
                </div>
              </div>

              {/* Title & Subtitle */}
              <div>
                <h3 className="text-2xl sm:text-3xl font-black font-hindi text-white tracking-tight drop-shadow-sm">
                  {t('category_cards.repairs_title')}
                </h3>
                <p className="text-amber-100 font-semibold text-sm sm:text-base mt-1.5 font-hindi">
                  {t('category_cards.repairs_subtitle')}
                </p>
                <p className="text-xs text-amber-200 mt-1">
                  {t('category_cards.repairs_features')}
                </p>
              </div>

              {/* Action Prompt */}
              <div className="pt-2 flex items-center justify-between text-xs font-bold text-white/90 border-t border-white/20">
                <span>{t('category_cards.repairs_action')}</span>
                <span className="p-1.5 rounded-full bg-white/20 group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4 text-white" />
                </span>
              </div>

            </div>
          </button>

        </div>
      </section>


      {/* =========================================================================
          4. CONTENT DISPLAY PANELS (DYNAMIC TAB VIEWS):
          ========================================================================= */}
      <main id="storefront-tab-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 scroll-mt-24">
        
        {/* Dynamic Section Indicator Header */}
        <div className="mb-8 pb-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl text-white shadow-sm ${
              activeTab === 'mobiles' ? 'bg-blue-600' :
              activeTab === 'accessories' ? 'bg-emerald-600' : 'bg-amber-600'
            }`}>
              {activeTab === 'mobiles' && <Smartphone className="w-6 h-6" />}
              {activeTab === 'accessories' && <Headphones className="w-6 h-6" />}
              {activeTab === 'repairs' && <Wrench className="w-6 h-6" />}
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {t('section_tabs.active_section')}
              </span>
              <h3 className="text-xl sm:text-2xl font-black font-hindi text-slate-900">
                {activeTab === 'mobiles' && t('section_tabs.mobiles_section_title')}
                {activeTab === 'accessories' && t('section_tabs.accessories_section_title')}
                {activeTab === 'repairs' && t('section_tabs.repairs_section_title')}
              </h3>
            </div>
          </div>

          {/* Quick Tab Switcher Pills */}
          <div className="inline-flex p-1 rounded-xl bg-slate-200/80 border border-slate-300 text-xs font-bold w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleTabChange('mobiles')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition cursor-pointer ${
                activeTab === 'mobiles' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              {t('section_tabs.pill_mobiles')}
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('accessories')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition cursor-pointer ${
                activeTab === 'accessories' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              {t('section_tabs.pill_accessories')}
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('repairs')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition cursor-pointer ${
                activeTab === 'repairs' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              {t('section_tabs.pill_repairs')}
            </button>
          </div>
        </div>

        {/* Render Selected View */}
        {activeTab === 'mobiles' && (
          <div className="animate-fadeIn">
            <BuyingHub />
          </div>
        )}

        {activeTab === 'accessories' && (
          <div className="animate-fadeIn">
            <AccessoriesHub />
          </div>
        )}

        {activeTab === 'repairs' && (
          <div className="animate-fadeIn">
            <RepairingHub />
          </div>
        )}

      </main>


      {/* =========================================================================
          5. FOOTER & LIVE SHOP STATUS BAR:
          ========================================================================= */}
      
      {/* Mobile Sticky Live Action Bar (Always Available on Mobile) */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 shadow-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <div className="text-left leading-tight">
            <span className="text-xs font-black text-slate-900 block font-hindi">{t('common.open_status')}</span>
            <span className="text-[10px] text-slate-500 font-medium">9 AM - 8:30 PM</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${SHOP_INFO.phone1}`}
            className="p-2.5 rounded-xl bg-slate-100 text-slate-800 border border-slate-200"
            title={t('common.call_now')}
          >
            <Phone className="w-4 h-4 text-blue-700" />
          </a>

          <a
            href={`https://wa.me/${SHOP_INFO.whatsapp}?text=${encodeURIComponent(
              language === 'hi'
                ? 'नमस्ते Amit Mobile Shop, मुझे जानकारी चाहिए।'
                : 'Hello Amit Mobile Shop, I need information.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-black flex items-center gap-1.5 shadow-md font-hindi"
          >
            <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
            <span>{t('common.whatsapp_chat')}</span>
          </a>
        </div>
      </div>

      {/* Main Professional Store Footer */}
      <footer className="border-t border-slate-200 bg-slate-900 text-slate-300 pt-12 pb-16 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Status Bar for Tablet & Desktop */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 sm:p-5 mb-10 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
            
            {/* Left: Green pulse dot with store open status */}
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black text-white font-hindi">
                  {t('footer.store_open')}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {t('footer.hours_detailed')}
                </span>
              </div>
            </div>

            {/* Center: Social Links */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-semibold mr-1">{t('footer.social_media')}</span>
              
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-700 hover:bg-blue-600 text-white flex items-center justify-center transition shadow-xs"
                title="Facebook"
              >
                <span className="font-bold text-xs">f</span>
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-700 hover:bg-pink-600 text-white flex items-center justify-center transition shadow-xs"
                title="Instagram"
              >
                <span className="font-bold text-xs">📸</span>
              </a>

              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center transition shadow-xs"
                title="Twitter/X"
              >
                <span className="font-bold text-xs">𝕏</span>
              </a>

              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-700 hover:bg-red-600 text-white flex items-center justify-center transition shadow-xs"
                title="YouTube"
              >
                <span className="font-bold text-xs">▶</span>
              </a>
            </div>

            {/* Right: Bright WhatsApp CTA Button */}
            <a
              href={`https://wa.me/${SHOP_INFO.whatsapp}?text=${encodeURIComponent(
                language === 'hi'
                  ? 'नमस्ते Amit Mobile Shop, मुझे जानकारी चाहिए।'
                  : 'Hello Amit Mobile Shop, I need information.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm transition-all duration-200 shadow-lg hover:shadow-emerald-500/30 flex items-center justify-center gap-2 font-hindi"
            >
              <MessageCircle className="w-5 h-5 fill-white text-emerald-500" />
              <span>{t('footer.whatsapp_cta')}</span>
            </a>

          </div>

          {/* Footer Grid Information */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800 text-xs text-slate-400">
            
            {/* Col 1: Brand Information */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black">
                  <Smartphone className="w-4 h-4" />
                </div>
                <span className="text-base font-black text-white font-hindi">
                  {t('common.shop_name')}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                {t('footer.tagline')}
              </p>
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>{t('common.brand_warranty')}</span>
              </div>
            </div>

            {/* Col 2: Location & Address */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider text-xs">
                {t('footer.col_location_title')}
              </h4>
              <div className="flex items-start gap-2 text-slate-300">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Kuk Nagar Grint Rd, Khorare, Uttar Pradesh 271312</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{t('footer.hours_text')}</span>
              </div>
              <a
                href={SHOP_INFO.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-bold"
              >
                <span>{t('footer.maps_directions')}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Col 3: Contact Helpline */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider text-xs">
                {t('footer.col_contact_title')}
              </h4>
              <div className="space-y-2">
                <a
                  href={`tel:${SHOP_INFO.phone1}`}
                  className="flex items-center gap-2 text-slate-300 hover:text-white transition"
                >
                  <Phone className="w-4 h-4 text-blue-400" />
                  <span>{t('footer.phone_amit')}</span>
                </a>
                <a
                  href={`tel:${SHOP_INFO.phone2}`}
                  className="flex items-center gap-2 text-slate-300 hover:text-white transition"
                >
                  <Phone className="w-4 h-4 text-blue-400" />
                  <span>{t('footer.phone_helpline')}</span>
                </a>
                <a
                  href={`https://wa.me/${SHOP_INFO.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition font-bold"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp: +91 {SHOP_INFO.phone1}</span>
                </a>
              </div>
            </div>

            {/* Col 4: Services & EMI Partners */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider text-xs">
                {t('footer.col_services_title')}
              </h4>
              <ul className="space-y-1.5 text-slate-400">
                <li>• {t('footer.svc_bajaj')}</li>
                <li>• {t('footer.svc_tvs')}</li>
                <li>• {t('footer.svc_samsung')}</li>
                <li>• {t('footer.svc_repair')}</li>
                <li>• {t('footer.svc_chargers')}</li>
              </ul>
            </div>

          </div>

          {/* Bottom Copyright & Admin Link */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} {t('common.shop_name')} (Amit Mobile Shop). {t('footer.copyright')}</p>
            <div className="flex items-center gap-4">
              <span>{t('common.shop_location')}</span>
              <span>•</span>
              <Link
                to="/admin/login"
                className="text-slate-400 hover:text-white font-semibold transition"
              >
                {t('footer.owner_portal_link')}
              </Link>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
