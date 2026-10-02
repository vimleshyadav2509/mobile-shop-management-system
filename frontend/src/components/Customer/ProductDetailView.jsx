import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Star, 
  ShieldCheck, 
  Sparkles, 
  ShoppingBag, 
  MessageCircle, 
  Check, 
  Smartphone, 
  Cpu, 
  Camera, 
  HardDrive 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { SHOP_INFO } from '../../data/mockData';
import { resolveProductImageUrl, handleImageError } from '../../utils/imageUtils';

export default function ProductDetailView({ product, onBack, onOpenCalculator }) {
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(product?.image_url);

  useEffect(() => {
    setSelectedImage(product?.image_url);
  }, [product?.image_url]);
  const [selectedColor, setSelectedColor] = useState(product?.color || 'Black');
  const [isFavorite, setIsFavorite] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  if (!product) return null;

  const price = Number(product.price) || 0;
  const originalPrice = Number(product.original_price) || 0;
  const discountAmount = originalPrice > price ? originalPrice - price : 0;
  const discountPercent = originalPrice > price ? Math.round((discountAmount / originalPrice) * 100) : 0;
  const isRefurbished = product.condition === 'refurbished' || product.condition === 'used';
  const monthlyEmi = Math.round(price / 12);
  const isOutOfStock = product.stock_status === 'OUT OF STOCK' || (product.stock_count === 0 && product.stock_status !== 'COMING SOON');

  // Multi-image gallery list
  const galleryImages = [
    product.image_url,
    ...(Array.isArray(product.gallery) ? product.gallery : [])
  ].filter(Boolean);

  // If only 1 image, duplicate with subtle view or keep single
  const activeImages = galleryImages.length > 0 ? galleryImages : [product.image_url];

  // Available colors list
  const availableColors = product.colors || (product.color ? [product.color, 'Midnight Blue', 'Starlight Silver'] : ['Black', 'Blue', 'Silver']);

  // Dynamic Specs based on product info
  const specItems = [
    {
      label: t('ref_ui.display_label') || 'Display',
      value: product.display || '6.1" OLED HDR',
      icon: Smartphone
    },
    {
      label: t('ref_ui.processor_label') || 'Processor',
      value: product.processor || (product.brand === 'Apple' ? 'A16 Bionic' : 'Snapdragon 5G'),
      icon: Cpu
    },
    {
      label: t('ref_ui.camera_label') || 'Camera',
      value: product.camera || '48MP + 12MP Dual',
      icon: Camera
    },
    {
      label: t('ref_ui.storage_label') || 'Storage',
      value: product.ram_storage || product.variant || '128GB ROM',
      icon: HardDrive
    }
  ];

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart({
      ...product,
      color: selectedColor
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.title} - Amit Mobile Shop`,
          text: `Check out ${product.title} at Amit Mobile Shop for ₹${price.toLocaleString()}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share canceled');
      }
    } else {
      navigator.clipboard?.writeText(window.location.href);
      alert(language === 'hi' ? 'लिंक कॉपी हो गया!' : 'Link copied to clipboard!');
    }
  };

  const handleWhatsAppBuy = () => {
    const title = product?.title || 'Smartphone';
    const condition = isRefurbished ? 'Refurbished' : 'New';
    const text = language === 'hi'
      ? `नमस्ते Amit Mobile Shop! मुझे *${title}* (${selectedColor}, ${product.ram_storage || 'Standard'}, ₹${price.toLocaleString()}) खरीदना है। क्या यह दुकान (खोड़ारे चौराहा) पर उपलब्ध है?`
      : `Hello Amit Mobile Shop! I want to purchase *${title}* (${selectedColor}, ${product.ram_storage || 'Standard'}, ₹${price.toLocaleString()}). Is this available at your Khorare Chowraha shop today?`;

    const url = `https://wa.me/${SHOP_INFO.whatsapp}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-[#E2E8F0] px-4 py-3 flex items-center justify-between shadow-xs">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="p-2 -ml-2 rounded-xl text-[#102A43] hover:bg-[#F5F9FF] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h2 className="text-sm font-bold text-[#102A43] line-clamp-1 max-w-[60%]">
          {product.title}
        </h2>

        <div className="flex items-center gap-1 -mr-2">
          <button
            type="button"
            onClick={() => setIsFavorite(!isFavorite)}
            aria-label="Favorite"
            className="p-2 rounded-xl text-[#64748B] hover:text-[#EF4444] transition-colors"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-[#EF4444] text-[#EF4444]' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share"
            className="p-2 rounded-xl text-[#64748B] hover:text-[#1264F5] transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        {/* Main Image Box */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 flex flex-col items-center justify-center relative shadow-xs">
          <div className="w-full h-56 sm:h-64 flex items-center justify-center">
            <img
              src={resolveProductImageUrl(selectedImage || product.image_url)}
              alt={product.title}
              className="max-h-full max-w-full object-contain transition-all duration-300"
              onError={handleImageError}
            />
          </div>

          {/* Thumbnail Rail */}
          {activeImages.length > 1 && (
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#F1F5F9] overflow-x-auto no-scrollbar">
              {activeImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`w-12 h-12 rounded-xl border p-1 bg-white flex items-center justify-center cursor-pointer transition-all ${
                    (selectedImage || product.image_url) === img
                      ? 'border-[#1264F5] ring-2 ring-[#1264F5]/20'
                      : 'border-[#E2E8F0] hover:border-slate-300'
                  }`}
                >
                  <img
                    src={resolveProductImageUrl(img)}
                    alt=""
                    className="w-full h-full object-contain"
                    onError={handleImageError}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info Card */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 space-y-3.5 shadow-xs">
          {/* Brand & Condition */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1264F5] bg-[#EAF3FF] px-2.5 py-0.5 rounded-full">
              {product.brand || 'Official'}
            </span>

            {isRefurbished ? (
              <span className="text-xs font-bold text-[#20B26B] bg-[#E6F8F0] px-2.5 py-0.5 rounded-full">
                {t('ref_ui.refurbished') || 'Certified Refurbished'}
              </span>
            ) : (
              <span className="text-xs font-bold text-[#102A43] bg-[#F1F5F9] px-2.5 py-0.5 rounded-full">
                {t('buying.badge_brand_new') || 'Brand New'}
              </span>
            )}
          </div>

          {/* Title & Rating */}
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-[#102A43] leading-tight">
              {product.title}
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex items-center gap-1 bg-[#FFF9E6] px-2 py-0.5 rounded-md text-[#D97706] text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-[#F4B400] text-[#F4B400]" />
                <span>4.8</span>
              </div>
              <span className="text-xs text-[#64748B]">
                (124 {t('ref_ui.reviews_count') || 'reviews'})
              </span>
            </div>
          </div>

          {/* Pricing Row */}
          <div className="pt-2 border-t border-[#F1F5F9]">
            <div className="flex items-baseline gap-2.5">
              <span className="text-2xl sm:text-3xl font-black text-[#102A43]">
                ₹{price.toLocaleString()}
              </span>
              {originalPrice > price && (
                <span className="text-sm text-[#64748B] line-through">
                  ₹{originalPrice.toLocaleString()}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="ref-badge-green text-xs px-2 py-0.5">
                  ₹{discountAmount.toLocaleString()} {t('ref_ui.off') || 'OFF'}
                </span>
              )}
            </div>

            {/* EMI Banner Strip */}
            <div className="mt-2.5 p-2.5 rounded-xl bg-[#F5F9FF] border border-[#EAF3FF] flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-[#1264F5] font-semibold">
                <Sparkles className="w-4 h-4 text-[#F4B400]" />
                <span>{t('ref_ui.emi_starts') || '0% EMI starts at'} ₹{monthlyEmi.toLocaleString()}/mo</span>
              </div>
              {onOpenCalculator && (
                <button
                  type="button"
                  onClick={() => onOpenCalculator(product)}
                  className="text-[#1264F5] font-bold hover:underline cursor-pointer"
                >
                  {t('buying.calculator') || 'Calculator'}
                </button>
              )}
            </div>
          </div>

          {/* 4 Key Specifications Grid */}
          <div className="pt-2 border-t border-[#F1F5F9]">
            <h3 className="text-xs font-bold text-[#102A43] uppercase tracking-wider mb-2.5">
              {t('ref_ui.key_specs') || 'Key Specifications'}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {specItems.map((spec, i) => {
                const Icon = spec.icon;
                return (
                  <div key={i} className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center text-[#1264F5] shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-[#64748B] font-medium leading-tight">
                        {spec.label}
                      </p>
                      <p className="text-xs font-bold text-[#102A43] truncate">
                        {spec.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Color Selection */}
          <div className="pt-2 border-t border-[#F1F5F9]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#102A43] uppercase tracking-wider">
                {t('ref_ui.colors') || 'Available Colors'}
              </span>
              <span className="text-xs font-semibold text-[#1264F5]">
                {selectedColor}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {availableColors.map((clr, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedColor(clr)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    selectedColor === clr
                      ? 'bg-[#1264F5] text-white shadow-xs'
                      : 'bg-[#F1F5F9] text-[#102A43] hover:bg-slate-200'
                  }`}
                >
                  {clr}
                </button>
              ))}
            </div>
          </div>

          {/* Description & Warranty */}
          <div className="pt-2 border-t border-[#F1F5F9] space-y-2">
            <p className="text-xs text-[#64748B] leading-relaxed">
              {product.description}
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#20B26B]">
              <ShieldCheck className="w-4 h-4 text-[#20B26B]" />
              <span>{product.warranty_info || (isRefurbished ? t('ref_ui.shop_warranty') : t('ref_ui.official_brand_warranty'))}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E2E8F0] p-3 shadow-lg">
        <div className="max-w-2xl mx-auto grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : justAdded
                ? 'bg-[#20B26B] text-white'
                : 'bg-white border border-[#102A43] text-[#102A43] hover:bg-slate-50'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>{t('ref_ui.added_to_cart') || 'Added to Cart!'}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>{t('ref_ui.add_to_cart') || 'Add to Cart'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleWhatsAppBuy}
            className="py-3 px-3 rounded-xl bg-[#1264F5] hover:bg-[#0E52C9] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{t('ref_ui.buy_now') || 'Buy Now (WhatsApp)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
