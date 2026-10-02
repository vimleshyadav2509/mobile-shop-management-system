import React from 'react';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  MessageCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { SHOP_INFO } from '../data/mockData';
import { resolveProductImageUrl, handleImageError } from '../utils/imageUtils';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartMonthlyEmi,
    cartCount
  } = useCart();
  const { language, t } = useLanguage();

  if (!isCartOpen) return null;

  const safeCart = Array.isArray(cart) ? cart : [];

  const handleWhatsAppCheckout = () => {
    if (safeCart.length === 0) return;

    const itemList = safeCart
      .map(
        (item, idx) =>
          `${idx + 1}. *${item?.title || 'Item'}* - Qty: ${item?.quantity || 1} × ₹${(Number(item?.price) || 0).toLocaleString()}`
      )
      .join('\n');

    const totalVal = Number(cartTotal) || 0;
    const emiVal = Number(cartMonthlyEmi) || 0;

    const messageText =
      language === 'hi'
        ? `नमस्ते Amit Mobile Shop (Kuk Nagar Grint Rd, Khorare)!\n\nमैं काउंटर से निम्नलिखित सामान ऑर्डर/बुक करना चाहता हूँ:\n\n${itemList}\n\n*कुल राशि (Total):* ₹${totalVal.toLocaleString()}\n*अनुमानित 0% EMI:* ₹${emiVal.toLocaleString()}/माह (12 महीने)\n\nकृपया काउंटर पर उपलब्धता और स्कीम की पुष्टि करें।`
        : `Hello Amit Mobile Shop (Kuk Nagar Grint Rd, Khorare)!\n\nI want to book the following order for shop counter pickup:\n\n${itemList}\n\n*Total Cart Value:* ₹${totalVal.toLocaleString()}\n*Est. 0% EMI:* ₹${emiVal.toLocaleString()}/month (12M)\n\nPlease confirm availability and finance approval documents.`;

    const url = `https://wa.me/${SHOP_INFO.whatsapp}?text=${encodeURIComponent(messageText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-2xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-white border-l border-[#E2E8F0] shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#E2E8F0] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#EAF3FF] text-[#1264F5] flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#102A43]">
                  {t('cart.title') || 'Shopping Bag'}
                </h3>
                <p className="text-[11px] text-[#64748B]">
                  {cartCount} {cartCount === 1 ? (t('ref_ui.items_count') || 'item') : (t('ref_ui.items_count') || 'items')}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeCart}
              aria-label="Close cart"
              className="p-2 rounded-xl text-[#64748B] hover:text-[#102A43] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-3">
            {safeCart.length === 0 ? (
              <div className="py-16 text-center text-[#64748B] space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#F1F5F9] text-slate-400 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-bold text-[#102A43]">
                  {t('ref_ui.cart_empty') || 'Your cart is empty'}
                </h4>
                <p className="text-xs text-[#64748B] max-w-xs mx-auto">
                  {t('cart.empty_desc') || 'Explore our collection of latest phones and accessories.'}
                </p>
                <button
                  type="button"
                  onClick={closeCart}
                  className="mt-3 px-4 py-2 rounded-xl bg-[#1264F5] hover:bg-[#0E52C9] text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                >
                  {t('ref_ui.continue_shopping') || 'Continue Shopping'}
                </button>
              </div>
            ) : (
              safeCart.map((item) => (
                <div
                  key={item.cartItemId || item.id || Math.random()}
                  className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-3 relative group"
                >
                  {/* Small Controlled Image */}
                  <div className="w-14 h-14 rounded-xl bg-white border border-[#E2E8F0] p-1 flex items-center justify-center shrink-0">
                    <img
                      src={resolveProductImageUrl(item.image_url)}
                      alt={item.title}
                      className="max-h-full max-w-full object-contain"
                      onError={handleImageError}
                    />
                  </div>

                  {/* Title & Price */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#102A43] truncate leading-tight">
                      {item.title}
                    </h4>

                    <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-[#64748B]">
                      {item.color && (
                        <span className="font-medium text-[#1264F5]">
                          {item.color}
                        </span>
                      )}
                      {item.variant && (
                        <>
                          <span>•</span>
                          <span>{item.variant}</span>
                        </>
                      )}
                    </div>

                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-xs sm:text-sm font-extrabold text-[#102A43]">
                        ₹{Number(item.price || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Quantity & Delete Controls */}
                  <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.cartItemId || item.id)}
                      className="p-1 text-[#94A3B8] hover:text-[#EF4444] transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center border border-[#E2E8F0] bg-white rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartItemId || item.id, (item.quantity || 1) - 1)}
                        className="px-2 py-0.5 text-[#102A43] hover:bg-slate-100 transition text-xs font-bold cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold text-[#102A43]">
                        {item.quantity || 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartItemId || item.id, (item.quantity || 1) + 1)}
                        className="px-2 py-0.5 text-[#102A43] hover:bg-slate-100 transition text-xs font-bold cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary */}
          {safeCart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[#E2E8F0] bg-[#F8FAFC] space-y-3">
              {/* 0% EMI Note */}
              <div className="p-2.5 rounded-xl bg-[#EAF3FF] border border-[#BFDBFE] flex items-center justify-between text-xs text-[#1264F5]">
                <div className="flex items-center gap-1.5 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-[#F4B400]" />
                  <span>0% EMI Available</span>
                </div>
                <span className="font-bold">
                  ₹{Number(cartMonthlyEmi || 0).toLocaleString()}/mo
                </span>
              </div>

              {/* Subtotal */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#64748B] font-medium">
                  {t('ref_ui.cart_subtotal') || 'Subtotal'}
                </span>
                <span className="text-lg font-black text-[#102A43]">
                  ₹{Number(cartTotal || 0).toLocaleString()}
                </span>
              </div>

              {/* Action Buttons */}
              <button
                type="button"
                onClick={handleWhatsAppCheckout}
                className="w-full py-3 px-4 rounded-xl bg-[#20B26B] hover:bg-[#1A985B] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{t('ref_ui.checkout_whatsapp') || 'Order via WhatsApp'}</span>
              </button>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-[11px] text-[#64748B] hover:text-[#EF4444] transition-colors"
                >
                  Clear Bag
                </button>
                <span className="text-[10px] text-[#64748B]">
                  Pickup at Khorare Chowraha
                </span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
