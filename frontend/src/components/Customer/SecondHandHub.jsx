import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ShoppingBag, 
  ChevronDown, 
  Smartphone, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw 
} from 'lucide-react';
import ProductCard from './ProductCard';
import { fetchProducts } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { INITIAL_PRODUCTS, SUPPORTED_MOBILE_BRANDS } from '../../data/mockData';

const BRANDS = ['All Brands', ...SUPPORTED_MOBILE_BRANDS];

export default function SecondHandHub({ onBack, onSelectProduct, onOpenCalculator }) {
  const { t, language } = useLanguage();
  const { cartCount, openCart } = useCart();

  // Chips matching Screen 5: [All] [Good Condition] [Like New] [Fair Condition]
  const [conditionFilter, setConditionFilter] = useState('all'); // 'all' | 'good' | 'like_new' | 'fair'
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('All Brands');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');

  useEffect(() => {
    loadRefurbishedProducts();
  }, [selectedBrand]);

  const loadRefurbishedProducts = async () => {
    setLoading(true);
    try {
      const brandParam = selectedBrand === 'All Brands' ? null : selectedBrand;
      const data = await fetchProducts('refurbished', brandParam);
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (err) {
      console.warn('[SecondHandHub] Fetch error, using fallback:', err);
      const fallback = INITIAL_PRODUCTS.filter(p => p.condition === 'refurbished' || p.condition === 'used');
      setProducts(fallback.length > 0 ? fallback : INITIAL_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = (products || []).filter((p) => {
    if (!p) return false;

    // Filter by condition grade if selected
    if (conditionFilter !== 'all') {
      const cond = (p.condition_grade || p.condition || '').toLowerCase();
      if (conditionFilter === 'like_new' && !cond.includes('like') && !cond.includes('mint')) return false;
      if (conditionFilter === 'good' && !cond.includes('good') && cond.includes('like')) return false;
      if (conditionFilter === 'fair' && !cond.includes('fair')) return false;
    }

    // Filter by Brand
    if (selectedBrand !== 'All Brands' && p.brand !== selectedBrand) return false;

    // Filter by Price
    const price = Number(p.price) || 0;
    if (selectedPriceRange === 'under15k' && price > 15000) return false;
    if (selectedPriceRange === '15to30k' && (price < 15000 || price > 30000)) return false;
    if (selectedPriceRange === 'above30k' && price < 30000) return false;

    return true;
  });

  return (
    <section className="space-y-3.5 pb-8 animate-in fade-in duration-150">
      
      {/* Top Header Bar for Screen 5 */}
      <div className="flex items-center justify-between gap-2 pb-1">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back"
              className="p-1.5 -ml-1.5 rounded-xl hover:bg-slate-100 text-[#102A43] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h2 className="text-base sm:text-lg font-bold text-[#102A43]">
            {t('ref_ui.second_hand_title') || 'Second Hand Phones'}
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

      {/* Tabs / Chips matching Screen 5: [All] [Good Condition] [Like New] [Fair Condition] */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {[
          { id: 'all', label: t('ref_ui.cond_all') || 'All' },
          { id: 'good', label: t('ref_ui.cond_good') || 'Good Condition' },
          { id: 'like_new', label: t('ref_ui.cond_like_new') || 'Like New' },
          { id: 'fair', label: t('ref_ui.cond_fair') || 'Fair Condition' }
        ].map((tab) => {
          const isActive = conditionFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setConditionFilter(tab.id)}
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

      {/* Banner matching Screen 5: "Pre-Owned, Great Value" */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0F3923] via-[#155D38] to-[#20B26B] text-white p-4 flex items-center justify-between text-xs relative overflow-hidden shadow-xs">
        <div className="z-10 max-w-[70%] space-y-1">
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
            100% Tested
          </span>
          <h3 className="text-sm sm:text-base font-bold text-white">
            {t('ref_ui.sh_banner_title') || 'Pre-Owned, Great Value'}
          </h3>
          <p className="text-[11px] text-emerald-100">
            {t('ref_ui.sh_banner_sub') || 'Quality Checked • Warranty • Trusted'}
          </p>
        </div>
        <div className="z-10 shrink-0">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
            <RefreshCw className="w-6 h-6 text-emerald-200" />
          </div>
        </div>
      </div>

      {/* Filter Row: Brand ▾, Price ▾ */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
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

        <div className="relative shrink-0">
          <select
            value={selectedPriceRange}
            onChange={(e) => setSelectedPriceRange(e.target.value)}
            className="appearance-none bg-white border border-[#E2E8F0] hover:border-slate-300 rounded-lg px-2.5 py-1.5 pr-7 text-xs font-semibold text-[#102A43] outline-none cursor-pointer"
          >
            <option value="all">{t('ref_ui.price') || 'Price'} ▾</option>
            <option value="under15k">Under ₹15,000</option>
            <option value="15to30k">₹15,000 - ₹30,000</option>
            <option value="above30k">Above ₹30,000</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {(selectedBrand !== 'All Brands' || selectedPriceRange !== 'all') && (
          <button
            type="button"
            onClick={() => {
              setSelectedBrand('All Brands');
              setSelectedPriceRange('all');
            }}
            className="text-[11px] text-[#1264F5] font-semibold hover:underline px-1 cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>

      {/* 2-Column Product Grid on Mobile */}
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
              setConditionFilter('all');
              setSelectedBrand('All Brands');
              setSelectedPriceRange('all');
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
              onOpenCalculator={onOpenCalculator}
            />
          ))}
        </div>
      )}

    </section>
  );
}
