import React, { useState } from 'react';
import { Heart, ShoppingBag, Sparkles, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';

export default function ProductCard({ product, onSelectProduct, onOpenCalculator }) {
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  if (!product) return null;

  const price = Number(product.price) || 0;
  const originalPrice = Number(product.original_price) || 0;
  const discountAmount = originalPrice > price ? originalPrice - price : 0;
  const discountPercent = originalPrice > price ? Math.round((discountAmount / originalPrice) * 100) : 0;
  const isRefurbished = product.condition === 'refurbished' || product.condition === 'used';
  const isOutOfStock = product.stock_status === 'OUT OF STOCK' || (product.stock_count === 0 && product.stock_status !== 'COMING SOON');

  // Specs subtitle: e.g. "128GB | Black"
  const specsText = [
    product.ram_storage || product.variant,
    product.color
  ].filter(Boolean).join(' | ') || (isRefurbished ? (t('ref_ui.good_condition') || 'Good Condition') : (product.brand || 'Official Spec'));

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div
      onClick={() => onSelectProduct && onSelectProduct(product)}
      className="ref-card flex flex-col justify-between p-2.5 sm:p-3 relative cursor-pointer group select-none hover:shadow-md transition-all duration-200"
    >
      {/* Top Bar: Condition/Discount Pill & Wishlist Heart */}
      <div className="flex items-center justify-between w-full mb-1">
        <div className="flex items-center gap-1">
          {isRefurbished && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E6F8F0] text-[#20B26B]">
              {t('ref_ui.refurbished') || 'Refurbished'}
            </span>
          )}
          {discountPercent > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FEF2F2] text-[#EF4444]">
              {discountPercent}% {t('ref_ui.off') || 'OFF'}
            </span>
          )}
        </div>

        {/* Favorite Heart Icon */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          aria-label="Add to Wishlist"
          className="p-1 rounded-full text-[#64748B] hover:text-[#EF4444] transition-colors"
        >
          <Heart
            className={`w-4 h-4 ${
              isFavorite ? 'fill-[#EF4444] text-[#EF4444]' : 'text-[#94A3B8]'
            }`}
          />
        </button>
      </div>

      {/* Controlled Product Image (120px-140px, object-contain, white background) */}
      <div className="w-full h-28 sm:h-36 flex items-center justify-center p-2 bg-white rounded-lg overflow-hidden relative">
        <img
          src={product.image_url}
          alt={product.title}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
          loading="lazy"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80";
          }}
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-2xs flex items-center justify-center">
            <span className="text-[10px] font-bold text-[#EF4444] bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
              {t('buying.out_of_stock') || 'Out of Stock'}
            </span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="mt-2 flex-1 flex flex-col justify-between">
        <div>
          {/* Product Title */}
          <h3 className="text-xs sm:text-sm font-bold text-[#102A43] group-hover:text-[#1264F5] line-clamp-1 transition-colors leading-tight">
            {product.title}
          </h3>

          {/* Specification Subtitle */}
          <p className="text-[11px] text-[#64748B] line-clamp-1 mt-0.5 font-normal">
            {specsText}
          </p>
        </div>

        {/* Pricing & Badges Row */}
        <div className="mt-2 pt-2 border-t border-[#F1F5F9]">
          {/* Price Numbers */}
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-sm sm:text-base font-extrabold text-[#102A43]">
              ₹{price.toLocaleString()}
            </span>
            {originalPrice > price && (
              <span className="text-[11px] text-[#64748B] line-through font-normal">
                ₹{originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Badges: Discount Amount & 0% EMI */}
          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
            {discountAmount > 0 && (
              <span className="ref-badge-green">
                ₹{discountAmount.toLocaleString()} {t('ref_ui.off') || 'OFF'}
              </span>
            )}
            <span className="ref-badge-blue">
              {t('ref_ui.emi_badge') || 'EMI Available'}
            </span>
          </div>

          {/* Quick Add to Bag Action Button */}
          <div className="mt-2">
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={isOutOfStock}
              className={`w-full py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer ${
                isOutOfStock
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : isAdded
                  ? 'bg-[#20B26B] text-white'
                  : 'bg-[#F5F9FF] text-[#1264F5] hover:bg-[#1264F5] hover:text-white border border-[#EAF3FF]'
              }`}
            >
              {isAdded ? (
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
    </div>
  );
}
