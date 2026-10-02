import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Smartphone, 
  Sparkles, 
  Wrench, 
  ShieldCheck, 
  Headphones, 
  Phone, 
  MapPin, 
  ExternalLink 
} from 'lucide-react';
import CustomerHeader from './Customer/CustomerHeader';
import CustomerBottomNav from './Customer/CustomerBottomNav';
import HomePromoBanner from './Customer/HomePromoBanner';
import QuickCategories from './Customer/QuickCategories';
import ProductCard from './Customer/ProductCard';
import ProductDetailView from './Customer/ProductDetailView';
import CustomerAccount from './Customer/CustomerAccount';
import SecondHandHub from './Customer/SecondHandHub';
import BuyingHub from './BuyingHub/BuyingHub';
import AccessoriesHub from './AccessoriesHub';
import RepairingHub from './RepairingHub/RepairingHub';
import CartDrawer from './CartDrawer';
import LanguageModal from './LanguageModal';
import LiveEmiCalculatorWidget from './BuyingHub/LiveEmiCalculatorWidget';
import EMIBadges from './EMIBadges';
import EmiCalculatorModal from './BuyingHub/EmiCalculatorModal';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { SHOP_INFO, INITIAL_PRODUCTS, INITIAL_ACCESSORIES } from '../data/mockData';
import { fetchProducts } from '../services/api';
import { resolveProductImageUrl, handleImageError } from '../utils/imageUtils';

export default function CustomerStorefront() {
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'mobiles' | 'accessories' | 'repairs' | 'account'
  const [mobilesCondition, setMobilesCondition] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [selectedForEmi, setSelectedForEmi] = useState(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const { language = 'hi', t = (k) => k } = useLanguage();

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

  useEffect(() => {
    // Load products for home preview
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    try {
      const data = await fetchProducts();
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (err) {
      console.warn('[CustomerStorefront] Using fallback catalog:', err);
    }
  };

  const handleQuickCategorySelect = (tab, condition = 'all') => {
    setMobilesCondition(condition);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Best selling products (top 4-6 products)
  const bestSellingProducts = (products || []).slice(0, 6);

  // Refurbished products preview
  const refurbishedPreview = (products || []).filter(p => p.condition === 'refurbished' || p.condition === 'used').slice(0, 2);

  // Accessories preview
  const accessoriesPreview = (INITIAL_ACCESSORIES || []).slice(0, 2);

  // Filtered products when searching from Home
  const searchResults = searchQuery.trim()
    ? (products || []).filter(p => {
        const q = searchQuery.toLowerCase();
        return (p.title || '').toLowerCase().includes(q) || 
               (p.brand || '').toLowerCase().includes(q) ||
               (p.description || '').toLowerCase().includes(q);
      })
    : null;

  // Render Product Detail View as an overlay if selected
  if (selectedProduct) {
    return (
      <ProductDetailView
        product={selectedProduct}
        onBack={() => setSelectedProduct(null)}
        onOpenCalculator={(p) => setSelectedForEmi(p)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#102A43] flex flex-col font-sans antialiased pb-20 md:pb-6">
      
      {/* Language Modal (First visit) */}
      <LanguageModal />

      {/* Slide-out Cart Drawer */}
      <CartDrawer />

      {/* Non-blocking Offline Badge */}
      {!isOnline && (
        <div className="fixed bottom-20 left-4 z-40 bg-slate-900/90 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 backdrop-blur-xs">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>{t('common.offline_mode')}</span>
        </div>
      )}

      {/* Customer Header matching Reference UI */}
      <CustomerHeader
        searchQuery={searchQuery}
        onSearchChange={(q) => setSearchQuery(q)}
        onLogoClick={() => {
          setActiveTab('home');
          setSearchQuery('');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        showSearch={activeTab === 'home' || activeTab === 'mobiles'}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 w-full pt-3.5 flex-1">
        
        {/* Search Results Mode if user is actively searching */}
        {searchResults !== null ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#102A43]">
                Search Results for "{searchQuery}" ({searchResults.length})
              </h2>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-[#1264F5] font-semibold hover:underline"
              >
                Clear
              </button>
            </div>

            {searchResults.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 text-center text-slate-500">
                <Smartphone className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold">{t('buying.no_phones_found')}</p>
                <p className="text-xs text-slate-400 mt-1">{t('buying.no_phones_desc')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
                {searchResults.map((product) => (
                  <ProductCard
                    key={product.id || Math.random()}
                    product={product}
                    onSelectProduct={(p) => setSelectedProduct(p)}
                    onOpenCalculator={(p) => setSelectedForEmi(p)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'home' ? (
          /* =========================================================================
             HOME SCREEN (Screen 1 in Reference UI)
             ========================================================================= */
          <div className="space-y-4">
            
            {/* 1. Promotional Hero Banner */}
            <HomePromoBanner
              onShopNow={() => {
                setMobilesCondition('all');
                setActiveTab('mobiles');
              }}
            />

            {/* 2. Four Quick Circular Category Shortcuts */}
            <QuickCategories
              onSelectCategory={handleQuickCategorySelect}
            />

            {/* 3. "Best Selling Mobiles" Section Header & 2-Col Grid */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-sm sm:text-base font-bold text-[#102A43]">
                  {t('ref_ui.best_selling') || 'Best Selling Mobiles'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setMobilesCondition('all');
                    setActiveTab('mobiles');
                  }}
                  className="text-xs text-[#1264F5] font-semibold flex items-center gap-0.5 hover:underline cursor-pointer"
                >
                  <span>{t('ref_ui.view_all') || 'View All'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 2-Column Product Grid on Mobile */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
                {bestSellingProducts.map((product) => (
                  <ProductCard
                    key={product.id || Math.random()}
                    product={product}
                    onSelectProduct={(p) => setSelectedProduct(p)}
                    onOpenCalculator={(p) => setSelectedForEmi(p)}
                  />
                ))}
              </div>
            </div>

            {/* 4. Second-Hand / Refurbished Section Preview */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#20B26B]" />
                  <h3 className="text-sm sm:text-base font-bold text-[#102A43]">
                    {t('ref_ui.second_hand') || 'Certified Second Hand Mobiles'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('second_hand');
                  }}
                  className="text-xs text-[#20B26B] font-semibold flex items-center gap-0.5 hover:underline cursor-pointer"
                >
                  <span>{t('ref_ui.view_all') || 'View All'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                {refurbishedPreview.map((product) => (
                  <ProductCard
                    key={product.id || Math.random()}
                    product={product}
                    onSelectProduct={(p) => setSelectedProduct(p)}
                    onOpenCalculator={(p) => setSelectedForEmi(p)}
                  />
                ))}
              </div>
            </div>

            {/* 5. Express Repair Banner Promo */}
            <div 
              onClick={() => setActiveTab('repairs')}
              className="rounded-2xl bg-gradient-to-r from-[#1E293B] to-[#0F172A] text-white p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-all shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D97706]/20 border border-[#D97706]/30 flex items-center justify-center text-[#F4B400] shrink-0">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    {t('category_cards.repairs_title') || 'Express Phone Repairing'}
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    1-Hour Combo & Battery Replacement • Live Job Tracker
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-white/70 shrink-0" />
            </div>

            {/* 6. Accessories Quick Preview */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <Headphones className="w-4 h-4 text-[#7C3AED]" />
                  <h3 className="text-sm sm:text-base font-bold text-[#102A43]">
                    {t('ref_ui.accessories') || 'Popular Accessories'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('accessories')}
                  className="text-xs text-[#7C3AED] font-semibold flex items-center gap-0.5 hover:underline cursor-pointer"
                >
                  <span>{t('ref_ui.view_all') || 'View All'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Compact Accessories Row */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                {accessoriesPreview.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setActiveTab('accessories')}
                    className="ref-card p-3 flex flex-col justify-between cursor-pointer"
                  >
                    <div className="w-full h-24 flex items-center justify-center">
                      <img
                        src={resolveProductImageUrl(item.image_url)}
                        alt={item.title}
                        className="max-h-full max-w-full object-contain"
                        onError={handleImageError}
                      />
                    </div>
                    <div className="mt-2">
                      <p className="text-[10px] text-[#64748B] font-semibold">{item.brand}</p>
                      <h4 className="text-xs font-bold text-[#102A43] truncate">{item.title}</h4>
                      <p className="text-xs font-black text-[#102A43] mt-1">₹{Number(item.price).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 7. Live EMI Section */}
            <div className="pt-2 space-y-3">
              <LiveEmiCalculatorWidget />
              <EMIBadges onOpenCalculator={(prod) => setSelectedForEmi(prod)} />
            </div>

            {/* 8. Compact Professional Footer */}
            <footer className="pt-6 pb-4 border-t border-[#E2E8F0] space-y-3 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#1264F5] shrink-0" />
                  <span>{SHOP_INFO.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <a href={`tel:${SHOP_INFO.phone1}`} className="hover:text-[#1264F5] font-semibold">
                    📞 +91 {SHOP_INFO.phone1}
                  </a>
                  <span>•</span>
                  <a href={SHOP_INFO.mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#1264F5] font-semibold flex items-center gap-1">
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <p className="text-[11px] text-[#94A3B8]">
                © {new Date().getFullYear()} Amit Mobile Shop. All rights reserved.
              </p>
            </footer>

          </div>
        ) : activeTab === 'mobiles' ? (
          /* =========================================================================
             MOBILE PHONES SCREEN (Screen 2 in Reference UI)
             ========================================================================= */
          <BuyingHub
            initialTab={mobilesCondition}
            onBack={() => setActiveTab('home')}
            onSelectProduct={(p) => setSelectedProduct(p)}
          />
        ) : activeTab === 'second_hand' ? (
          /* =========================================================================
             SECOND HAND PHONES SCREEN (Screen 5 in Reference UI)
             ========================================================================= */
          <SecondHandHub
            onBack={() => setActiveTab('home')}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onOpenCalculator={(p) => setSelectedForEmi(p)}
          />
        ) : activeTab === 'accessories' ? (
          /* =========================================================================
             ACCESSORIES SCREEN (Screen 4 in Reference UI)
             ========================================================================= */
          <AccessoriesHub
            onBack={() => setActiveTab('home')}
          />
        ) : activeTab === 'repairs' ? (
          /* =========================================================================
             REPAIRING SCREEN (Screen 6 & 7 in Reference UI)
             ========================================================================= */
          <RepairingHub 
            onBackToHome={() => setActiveTab('home')}
          />
        ) : activeTab === 'account' ? (
          /* =========================================================================
             ACCOUNT SCREEN (Screen 8 in Reference UI)
             ========================================================================= */
          <CustomerAccount
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        ) : null}

      </main>

      {/* Mobile Fixed Bottom Navigation (Home | Categories | Repair | Account) */}
      <CustomerBottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSearchQuery('');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Interactive EMI Calculator Modal */}
      {selectedForEmi && (
        <EmiCalculatorModal
          product={selectedForEmi}
          onClose={() => setSelectedForEmi(null)}
        />
      )}

    </div>
  );
}
