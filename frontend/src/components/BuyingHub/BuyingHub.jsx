import React, { useState, useEffect } from 'react';
import { Smartphone, Sparkles, Search, RefreshCw, Layers, ShieldCheck } from 'lucide-react';
import ProductCard from './ProductCard';
import EmiCalculatorModal from './EmiCalculatorModal';
import LiveEmiCalculatorWidget from './LiveEmiCalculatorWidget';
import EMIBadges from '../EMIBadges';
import { fetchProducts } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { INITIAL_PRODUCTS } from '../../data/mockData';

const BRANDS = ['All Brands', 'Samsung', 'Apple', 'OnePlus', 'Vivo', 'Realme', 'Xiaomi'];

export default function BuyingHub() {
  const { t, language } = useLanguage();
  const [buyingTab, setBuyingTab] = useState('new'); // 'new' or 'refurbished'
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('All Brands');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedForEmi, setSelectedForEmi] = useState(null);

  useEffect(() => {
    loadProducts();
  }, [buyingTab, selectedBrand]);

  const loadProducts = async () => {
    try {
      const brandParam = selectedBrand === 'All Brands' ? null : selectedBrand;
      const data = await fetchProducts(buyingTab, brandParam);
      if (Array.isArray(data) && data.length > 0) {
        setProducts(data);
      } else if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setProducts(INITIAL_PRODUCTS);
      }
    } catch (err) {
      console.warn('[BuyingHub] Failed to load products from API, retaining fallback:', err);
    }
  };

  const filteredProducts = (products || []).filter((p) => {
    if (!p) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const title = (p.title || '').toLowerCase();
    const brand = (p.brand || '').toLowerCase();
    const desc = (p.description || '').toLowerCase();
    return title.includes(q) || brand.includes(q) || desc.includes(q);
  });

  return (
    <section className="space-y-8">
      
      {/* Product Section Header & Sub-Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Smartphone className="w-5 h-5 text-primary-800" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Poppins']">
              {t('buying_title')}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            {t('buying_desc')}
          </p>
        </div>

        {/* Primary Sub-Tabs: Brand New vs Certified Pre-Owned */}
        <div className="inline-flex p-1 rounded-lg bg-slate-100 border border-slate-200 w-full md:w-auto">
          <button
            onClick={() => setBuyingTab('new')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-md font-semibold text-xs sm:text-sm transition-all ${
              buyingTab === 'new'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{t('tab_new')}</span>
          </button>

          <button
            onClick={() => setBuyingTab('refurbished')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-md font-semibold text-xs sm:text-sm transition-all ${
              buyingTab === 'refurbished'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>{t('tab_refurb')}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar: Brand Pills & Quick Search with ⌘K */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* Brand Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {BRANDS.map((brand) => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(brand)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
                selectedBrand === brand
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {brand === 'All Brands' && language === 'hi' ? 'सभी ब्रांड' : brand}
            </button>
          ))}
        </div>

        {/* Search Input with ⌘K Shortcut */}
        <div className="relative min-w-[260px] sm:min-w-[320px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="storefront-search-input"
            type="text"
            placeholder={buyingTab === 'new' ? t('search_new_placeholder') : t('search_refurb_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="retail-input pl-9 pr-14 text-xs"
          />
          <span className="hidden sm:flex absolute right-2.5 top-1/2 -translate-y-1/2 items-center text-[10px] text-slate-500 font-mono px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 pointer-events-none">
            ⌘K
          </span>
        </div>
      </div>

      {/* Product Catalog Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="rounded-xl bg-white border border-slate-200 h-96 p-4 animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-white border border-slate-200">
          <Smartphone className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-900">{t('no_phones_found')}</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {language === 'hi'
              ? 'कृपया दूसरे ब्रांड पर क्लिक करें या सर्च बदलकर देखें।'
              : 'Try clearing your search query or selecting a different brand.'}
          </p>
          <button
            onClick={() => { setSelectedBrand('All Brands'); setSearchQuery(''); }}
            className="mt-4 btn-primary text-xs"
          >
            {t('reset_filters')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(filteredProducts || []).map((product) => (
            <ProductCard
              key={product?.id || Math.random()}
              product={product}
              onOpenCalculator={(prod) => setSelectedForEmi(prod)}
            />
          ))}
        </div>
      )}

      {/* Live EMI Calculator Section */}
      <div id="live-emi-calculator" className="pt-4">
        <LiveEmiCalculatorWidget />
      </div>

      {/* EMI Partnership Badges */}
      <EMIBadges onOpenCalculator={(prod) => setSelectedForEmi(prod)} />

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
