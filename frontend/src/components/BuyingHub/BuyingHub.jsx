import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Search, 
  ShoppingBag, 
  SlidersHorizontal, 
  ChevronDown, 
  Smartphone, 
  Sparkles,
  RefreshCw 
} from 'lucide-react';
import ProductCard from './ProductCard';
import EmiCalculatorModal from './EmiCalculatorModal';
import LiveEmiCalculatorWidget from './LiveEmiCalculatorWidget';
import EMIBadges from '../EMIBadges';
import { fetchProducts } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { INITIAL_PRODUCTS, SUPPORTED_MOBILE_BRANDS } from '../../data/mockData';

const BRANDS = ['All Brands', ...SUPPORTED_MOBILE_BRANDS];

export default function BuyingHub({ onBack, onSelectProduct, initialTab = 'all' }) {
  const { t, language } = useLanguage();
  const { cartCount, openCart } = useCart();

  // Primary Tabs matching Screen 2: All | New | Refurbished | Top Deals
  const [activeTab, setActiveTab] = useState(initialTab); // 'all' | 'new' | 'refurbished' | 'top_deals'
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('All Brands');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [selectedRam, setSelectedRam] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedForEmi, setSelectedForEmi] = useState(null);

  // Sync initial tab when changed from props
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    loadProducts();
  }, [activeTab, selectedBrand]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const brandParam = selectedBrand === 'All Brands' ? null : selectedBrand;
      let conditionParam = null;
      if (activeTab === 'new') conditionParam = 'new';
      if (activeTab === 'refurbished') conditionParam = 'refurbished';
      
      const data = await fetchProducts(conditionParam, brandParam);
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (err) {
      console.warn('[BuyingHub] Failed to load products from API, retaining fallback:', err);
      setProducts(INITIAL_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  // Filter products by tab, search, brand, price range, and RAM
  const filteredProducts = (products || []).filter((p) => {
    if (!p) return false;

    // Tab condition filter
    if (activeTab === 'new' && p.condition !== 'new') return false;
    if (activeTab === 'refurbished' && p.condition !== 'refurbished' && p.condition !== 'used') return false;
    if (activeTab === 'top_deals') {
      const orig = Number(p.original_price) || 0;
      const cur = Number(p.price) || 0;
      if (orig <= cur || (orig - cur) < 2000) return false;
    }

    // Brand filter
    if (selectedBrand !== 'All Brands' && p.brand !== selectedBrand) return false;

    // Price filter
    const price = Number(p.price) || 0;
    if (selectedPriceRange === 'under15k' && price > 15000) return false;
    if (selectedPriceRange === '15to30k' && (price < 15000 || price > 30000)) return false;
    if (selectedPriceRange === '30to60k' && (price < 30000 || price > 60000)) return false;
    if (selectedPriceRange === 'above60k' && price < 60000) return false;

    // RAM filter
    if (selectedRam !== 'all') {
      const specs = ((p.ram_storage || '') + ' ' + (p.variant || '')).toLowerCase();
      if (!specs.includes(selectedRam.toLowerCase())) return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const title = (p.title || '').toLowerCase();
      const brand = (p.brand || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      return title.includes(q) || brand.includes(q) || desc.includes(q);
    }

    return true;
  });

  return (
    <section className="space-y-3.5 pb-8 animate-in fade-in duration-150">
      
      {/* Top Header Bar for Mobile Phones Screen */}
      <div className="flex items-center justify-between gap-2 pb-1">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to home"
              className="p-1.5 -ml-1.5 rounded-xl hover:bg-slate-100 text-[#102A43] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h2 className="text-base sm:text-lg font-bold text-[#102A43]">
            {t('ref_ui.mobile_phones') || 'Mobile Phones'}
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={openCart}
            aria-label="Cart"
            className="p-2 rounded-xl text-[#102A43] hover:bg-[#F5F9FF] border border-[#E2E8F0] relative cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#EF4444] text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tabs Row matching Reference UI: [All] [New] [Refurbished] [Top Deals] */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {[
          { id: 'all', label: t('ref_ui.all') || 'All' },
          { id: 'new', label: t('ref_ui.new') || 'New' },
          { id: 'refurbished', label: t('ref_ui.refurbished') || 'Refurbished' },
          { id: 'top_deals', label: t('ref_ui.top_deals') || 'Top Deals' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-[#1264F5] text-white shadow-2xs'
                  : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#102A43] hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Mini Banner Strip for Mobile Phones */}
      {activeTab === 'refurbished' ? (
        <div className="rounded-xl bg-gradient-to-r from-[#0F3923] to-[#20B26B] text-white p-3 flex items-center justify-between text-xs">
          <div>
            <p className="font-bold">{t('ref_ui.certified_check') || '32-Point Quality Checked'}</p>
            <p className="text-[11px] text-emerald-100">{t('ref_ui.shop_warranty') || 'Shop Warranty + Cash Bill'}</p>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-white/20 text-white font-bold text-[11px]">
            100% Tested
          </span>
        </div>
      ) : activeTab === 'top_deals' ? (
        <div className="rounded-xl bg-gradient-to-r from-[#991B1B] to-[#EF4444] text-white p-3 flex items-center justify-between text-xs">
          <div>
            <p className="font-bold">Mega Festival Discounts</p>
            <p className="text-[11px] text-red-100">Save up to ₹10,000 on Brand Mobiles</p>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-white/20 text-white font-bold text-[11px]">
            Limited Stock
          </span>
        </div>
      ) : null}

      {/* Filter Row: Brand ▾, Price ▾, RAM ▾ */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {/* Brand Dropdown */}
        <div className="relative shrink-0">
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="appearance-none bg-white border border-[#E2E8F0] hover:border-slate-300 rounded-lg px-2.5 py-1.5 pr-7 text-xs font-semibold text-[#102A43] outline-none cursor-pointer"
          >
            {BRANDS.map((b) => (
              <option key={b} value={b}>
                {b === 'All Brands' ? (t('ref_ui.brand') || 'Brand') : b}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Price Dropdown */}
        <div className="relative shrink-0">
          <select
            value={selectedPriceRange}
            onChange={(e) => setSelectedPriceRange(e.target.value)}
            className="appearance-none bg-white border border-[#E2E8F0] hover:border-slate-300 rounded-lg px-2.5 py-1.5 pr-7 text-xs font-semibold text-[#102A43] outline-none cursor-pointer"
          >
            <option value="all">{t('ref_ui.price') || 'Price'} ▾</option>
            <option value="under15k">Under ₹15,000</option>
            <option value="15to30k">₹15,000 - ₹30,000</option>
            <option value="30to60k">₹30,000 - ₹60,000</option>
            <option value="above60k">Above ₹60,000</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* RAM / Storage Dropdown */}
        <div className="relative shrink-0">
          <select
            value={selectedRam}
            onChange={(e) => setSelectedRam(e.target.value)}
            className="appearance-none bg-white border border-[#E2E8F0] hover:border-slate-300 rounded-lg px-2.5 py-1.5 pr-7 text-xs font-semibold text-[#102A43] outline-none cursor-pointer"
          >
            <option value="all">{t('ref_ui.ram_storage') || 'RAM'} ▾</option>
            <option value="4GB">4GB RAM</option>
            <option value="6GB">6GB RAM</option>
            <option value="8GB">8GB RAM</option>
            <option value="12GB">12GB RAM</option>
            <option value="128GB">128GB ROM</option>
            <option value="256GB">256GB ROM</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Reset filter button */}
        {(selectedBrand !== 'All Brands' || selectedPriceRange !== 'all' || selectedRam !== 'all') && (
          <button
            type="button"
            onClick={() => {
              setSelectedBrand('All Brands');
              setSelectedPriceRange('all');
              setSelectedRam('all');
            }}
            className="text-[11px] text-[#1264F5] font-semibold whitespace-nowrap hover:underline cursor-pointer shrink-0 px-1"
          >
            Reset
          </button>
        )}
      </div>

      {/* 2-Column Product Grid (Mobile) / 3-4 Column (Desktop) */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="rounded-2xl bg-white border border-slate-200 h-64 p-3 animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-white border border-slate-200">
          <Smartphone className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-800">{t('buying.no_phones_found')}</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            {t('buying.no_phones_desc')}
          </p>
          <button
            type="button"
            onClick={() => { 
              setActiveTab('all'); 
              setSelectedBrand('All Brands'); 
              setSelectedPriceRange('all'); 
              setSelectedRam('all'); 
              setSearchQuery(''); 
            }}
            className="mt-3 px-4 py-1.5 rounded-xl bg-[#1264F5] text-white text-xs font-bold cursor-pointer"
          >
            {t('common.reset_filters')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id || Math.random()}
              product={product}
              onSelectProduct={onSelectProduct}
              onOpenCalculator={(prod) => setSelectedForEmi(prod)}
            />
          ))}
        </div>
      )}

      {/* EMI Partnership & Calculator Section */}
      <div className="pt-4 space-y-4">
        <LiveEmiCalculatorWidget />
        <EMIBadges onOpenCalculator={(prod) => setSelectedForEmi(prod)} />
      </div>

      {/* Interactive EMI Calculator Modal */}
      {selectedForEmi && (
        <EmiCalculatorModal
          product={selectedForEmi}
          onClose={() => setSelectedForEmi(null)}
        />
      )}

    </section>
  );
}
