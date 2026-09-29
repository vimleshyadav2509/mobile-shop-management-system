import React, { useState } from 'react';
import { 
  ShieldCheck, 
  MessageCircle, 
  ShoppingBag, 
  Check, 
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { SHOP_INFO } from '../../data/mockData';

export default function ProductCard({ product, onOpenCalculator }) {
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const isNew = product?.condition === 'new';
  const price = Number(product?.price) || 0;
  const originalPrice = Number(product?.original_price) || 0;
  const discount = originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const monthlyEmi = Math.round(price / 12);

  const isOutOfStock = product?.stock_status === 'OUT OF STOCK' || (product?.stock_count === 0 && product?.stock_status !== 'COMING SOON');
  const isComingSoon = product?.stock_status === 'COMING SOON';
  const isLowStock = product?.stock_status === 'LOW STOCK' || (product?.stock_count > 0 && product?.stock_count <= 5);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  const handleWhatsAppBuy = () => {
    const title = product?.title || 'Smartphone';
    const condition = product?.condition || 'new';
    const variantInfo = product?.variant ? ` (${product.variant})` : '';
    const text = isNew
      ? (language === 'hi'
          ? `नमस्ते Amit Mobile Shop, मुझे नया स्मार्टफोन *${title}${variantInfo}* (₹${price.toLocaleString()}) खरीदना है। क्या यह आज उपलब्ध है? क्या 0% EMI ऑफर है?`
          : `Hello Amit Mobile Shop, I want to purchase *${title}${variantInfo}* (Price: ₹${price.toLocaleString()}). Is it in stock at Khorare for same-day delivery / 0% EMI?`)
      : (language === 'hi'
          ? `नमस्ते Amit Mobile Shop, मुझे रिफर्बिश्ड फोन *${title}${variantInfo}* (कंडीशन: ${condition}, ₹${price.toLocaleString()}) खरीदना है। कृपया बिल और वारंटी कन्फर्म करें।`
          : `Hello Amit Mobile Shop, I am interested in the certified pre-owned *${title}${variantInfo}* (Condition: ${condition}, Price: ₹${price.toLocaleString()}). Please confirm shop warranty.`);

    const url = `https://wa.me/${SHOP_INFO.whatsapp}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const formatWarranty = (warranty) => {
    if (!warranty) return t('buying.official_warranty');
    if (language === 'hi') {
      return warranty
        .replace(/1 Year Official Samsung Warranty/i, '1 साल की ऑफिशियल सैमसंग वारंटी')
        .replace(/1 Year Official Brand Warranty/i, '1 साल की ऑफिशियल ब्रांड वारंटी')
        .replace(/6 Months Shop Warranty \+ Cash Bill/i, '6 महीने की दुकान वारंटी + पक्का बिल')
        .replace(/3 Months Shop Warranty \+ Cash Bill/i, '3 महीने की दुकान वारंटी + पक्का बिल')
        .replace(/6 Months Shop Warranty/i, '6 महीने की दुकान वारंटी')
        .replace(/3 Months Shop Warranty/i, '3 महीने की दुकान वारंटी')
        .replace(/Shop Warranty/i, 'दुकान वारंटी')
        .replace(/Brand Warranty/i, 'ब्रांड वारंटी');
    }
    return warranty;
  };

  return (
    <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      
      {/* Product Image Box */}
      <div className="aspect-[4/3] bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-center relative">
        <img
          src={product.image_url}
          alt={product.title}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
          loading="lazy"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80";
          }}
        />

        {/* Condition Tag */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {isNew ? (
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white shadow-xs">
              {t('buying.badge_brand_new')}
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-700 text-white shadow-xs">
              {t('buying.badge_pre_owned')}
            </span>
          )}

          {discount > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white w-fit">
              {discount}% {language === 'hi' ? 'छूट' : 'OFF'}
            </span>
          )}
        </div>

        {/* Stock Status Pill */}
        <div className="absolute top-3 right-3 text-[11px] font-semibold rounded shadow-xs px-2 py-0.5 border">
          {isComingSoon ? (
            <span className="text-purple-700 bg-purple-50 border-purple-200">{t('buying.coming_soon')}</span>
          ) : isOutOfStock ? (
            <span className="text-rose-700 bg-rose-50 border-rose-200">{t('buying.out_of_stock')}</span>
          ) : isLowStock ? (
            <span className="text-amber-700 bg-amber-50 border-amber-200">{t('buying.only_left', { count: product.stock_count || 1 })}</span>
          ) : (
            <span className="text-emerald-700 bg-white/90 border-slate-200">{t('buying.in_stock')}</span>
          )}
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Brand & RAM/Storage / Variant */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1 flex-wrap">
            <span className="font-bold text-slate-800">{product.brand}</span>
            <span>•</span>
            <span>{product.variant || product.ram_storage || (language === 'hi' ? 'मानक विवरण' : 'Standard Specs')}</span>
            {product.color && (
              <>
                <span>•</span>
                <span className="text-slate-500 truncate max-w-[100px]">{product.color}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-slate-900 line-clamp-1 font-['Poppins'] group-hover:text-primary-800 transition-colors">
            {product.title}
          </h3>

          <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Warranty Note */}
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className="truncate">{formatWarranty(product.warranty_info)}</span>
          </div>

          {/* 0% EMI Badge Pill */}
          <div className="mt-2.5 py-1.5 px-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded text-[11px]">
              <Sparkles className="w-3 h-3 text-amber-700" />
              <span>{t('buying.emi_zero')}</span>
            </span>
            <span className="font-bold text-slate-800">₹{monthlyEmi.toLocaleString()}{t('buying.per_month')}</span>
            {onOpenCalculator && (
              <button
                type="button"
                onClick={() => onOpenCalculator(product)}
                className="text-[11px] text-blue-700 hover:underline font-bold cursor-pointer"
              >
                {t('buying.calculator')}
              </button>
            )}
          </div>
        </div>

        {/* Pricing & CTAs */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium block">
                {t('buying.offer_price')}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-slate-950 font-['Poppins']">
                  ₹{price.toLocaleString()}
                </span>
                {originalPrice > 0 && (
                  <span className="text-xs text-slate-400 line-through">
                    ₹{originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Two Clean Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`py-2.5 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isOutOfStock
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300'
                  : justAdded
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
              }`}
            >
              {isOutOfStock ? (
                <span>{t('buying.out_of_stock')}</span>
              ) : justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{t('buying.added')}</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{t('buying.add_to_bag')}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleWhatsAppBuy}
              className="py-2.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 font-hindi cursor-pointer"
              title={t('buying.book_whatsapp_title')}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{t('buying.book_now')}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
