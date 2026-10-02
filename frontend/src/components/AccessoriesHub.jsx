import React, { useState } from 'react';
import { 
  ArrowLeft,
  Headphones, 
  Zap, 
  ShieldCheck, 
  Search, 
  ShoppingBag, 
  Sparkles,
  Smartphone,
  Cable,
  Check,
  Star
} from 'lucide-react';
import { INITIAL_ACCESSORIES, SHOP_INFO } from '../data/mockData';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { resolveProductImageUrl, handleImageError } from '../utils/imageUtils';

const CATEGORIES = [
  { id: 'all', label_hi: 'सभी', label_en: 'All', icon: Sparkles },
  { id: 'covers', label_hi: 'कवर व केस', label_en: 'Cases', icon: Smartphone },
  { id: 'chargers', label_hi: 'फास्ट चार्जर', label_en: 'Chargers', icon: Zap },
  { id: 'earphones', label_hi: 'इयरफोन व बड्स', label_en: 'Earphones', icon: Headphones },
  { id: 'glass', label_hi: 'टेम्पर्ड ग्लास', label_en: 'Screen Protectors', icon: ShieldCheck },
  { id: 'cables', label_hi: 'डाटा केबल', label_en: 'Cables', icon: Cable },
];

export default function AccessoriesHub({ onBack }) {
  const { addToCart, cartCount, openCart } = useCart();
  const { language, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedId, setAddedId] = useState(null);

  const filteredItems = INITIAL_ACCESSORIES.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      item.title.toLowerCase().includes(q) || 
      (item.title_hi && item.title_hi.toLowerCase().includes(q)) || 
      item.brand.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      (item.description_en && item.description_en.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (item, e) => {
    e?.stopPropagation();
    addToCart({
      id: item.id,
      title: language === 'hi' ? (item.title_hi || item.title) : item.title,
      price: item.price,
      original_price: item.original_price,
      image_url: item.image_url,
      brand: item.brand,
      condition: 'new'
    });
    setAddedId(item.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <section className="space-y-3.5 pb-8 animate-in fade-in duration-150">
      
      {/* Top Header Bar */}
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
            {t('ref_ui.mobile_accessories') || 'Mobile Accessories'}
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

      {/* Category Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {CATEGORIES.map(cat => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-[#1264F5] text-white shadow-2xs'
                  : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#102A43] hover:bg-slate-200'
              }`}
            >
              <span>{language === 'hi' ? cat.label_hi : cat.label_en}</span>
            </button>
          );
        })}
      </div>

      {/* Accessories Promotional Banner matching Screen 4 */}
      <div className="rounded-2xl bg-gradient-to-r from-[#12315B] to-[#1264F5] text-white p-4 flex items-center justify-between text-xs relative overflow-hidden shadow-xs">
        <div className="z-10 max-w-[70%] space-y-1">
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
            100% Original
          </span>
          <h3 className="text-sm sm:text-base font-bold text-white">
            {t('ref_ui.premium_accessories') || 'Premium Accessories'}
          </h3>
          <p className="text-[11px] text-blue-100">
            {t('ref_ui.accessories_tagline') || 'Better Protection, Better Style'}
          </p>
        </div>
        <div className="z-10 shrink-0">
          <span className="px-3 py-1.5 rounded-xl bg-white text-[#12315B] font-bold text-xs shadow-xs">
            From ₹99
          </span>
        </div>
      </div>

      {/* 2-Column Accessories Product Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 text-center text-slate-500">
          <Headphones className="w-8 h-8 mx-auto text-slate-300 mb-2" />
          <p className="text-xs font-semibold">{t('accessories.no_items') || 'No accessories found'}</p>
          <button
            type="button"
            onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
            className="mt-2 text-xs text-[#1264F5] font-bold hover:underline cursor-pointer"
          >
            {t('accessories.view_all') || 'View All'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {filteredItems.map(item => {
            const itemPrice = Number(item?.price) || 0;
            const itemOrigPrice = Number(item?.original_price) || 0;
            const discount = itemOrigPrice > itemPrice ? Math.round(((itemOrigPrice - itemPrice) / itemOrigPrice) * 100) : 0;
            const isJustAdded = addedId === item.id;
            const itemTitle = language === 'hi' ? (item.title_hi || item.title) : item.title;

            return (
              <div
                key={item.id}
                className="ref-card flex flex-col justify-between p-2.5 sm:p-3 relative group"
              >
                {/* Discount Tag */}
                {discount > 0 && (
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FEF2F2] text-[#EF4444]">
                      {discount}% OFF
                    </span>
                  </div>
                )}

                {/* Controlled Product Image (120px, object-contain) */}
                <div className="w-full h-28 sm:h-32 flex items-center justify-center p-2 bg-white rounded-lg overflow-hidden">
                  <img
                    src={resolveProductImageUrl(item.image_url)}
                    alt={item.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                    onError={handleImageError}
                  />
                </div>

                {/* Content */}
                <div className="mt-2 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Brand */}
                    <div className="flex items-center justify-between text-[11px] text-[#64748B] mb-0.5">
                      <span className="font-semibold">{item.brand}</span>
                      <div className="flex items-center gap-0.5 text-[#F4B400]">
                        <Star className="w-3 h-3 fill-[#F4B400]" />
                        <span className="text-[10px] text-[#102A43] font-bold">4.7</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xs sm:text-sm font-bold text-[#102A43] line-clamp-1 leading-tight">
                      {itemTitle}
                    </h3>
                  </div>

                  {/* Price & Action */}
                  <div className="mt-2 pt-2 border-t border-[#F1F5F9]">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm sm:text-base font-extrabold text-[#102A43]">
                        ₹{itemPrice.toLocaleString()}
                      </span>
                      {itemOrigPrice > itemPrice && (
                        <span className="text-[11px] text-[#64748B] line-through">
                          ₹{itemOrigPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(item, e)}
                      className={`w-full mt-2 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isJustAdded
                          ? 'bg-[#20B26B] text-white'
                          : 'bg-[#F5F9FF] text-[#1264F5] hover:bg-[#1264F5] hover:text-white border border-[#EAF3FF]'
                      }`}
                    >
                      {isJustAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{t('ref_ui.added_to_cart') || 'Added'}</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{t('buying.add_to_bag') || 'Add to Bag'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
