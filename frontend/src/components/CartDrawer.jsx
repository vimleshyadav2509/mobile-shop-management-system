import React from 'react';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  MessageCircle,
  CreditCard,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { SHOP_INFO } from '../data/mockData';

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
  const { language } = useLanguage();

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
    <div className="fixed inset-0 z-50 overflow-hidden animate-card-fade">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#060A13]/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl text-white flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-600/20 text-primary-400 flex items-center justify-center border border-primary-500/30 shadow-glow-primary">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black tracking-tight font-['Poppins']">
                  {language === 'hi' ? 'आपका मोबाइल बैग' : 'Your Device Bag'}
                </h3>
                <p className="text-xs text-slate-400">
                  {cartCount} {cartCount === 1 ? 'item' : 'items'} • Amit Mobile Shop
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeCart}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-3.5">
            {cart.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-3">
                <ShoppingBag className="w-14 h-14 mx-auto opacity-25 text-primary-400" />
                <h4 className="text-base font-bold text-white">
                  {language === 'hi' ? 'बैग अभी खाली है' : 'Your bag is empty'}
                </h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  {language === 'hi'
                    ? 'शोरूम से फोन चुनें और "Buy Now" या "Bag" में जोड़ें।'
                    : 'Browse our flagship collection and add devices to start your order.'}
                </p>
                <button
                  type="button"
                  onClick={closeCart}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/15 transition"
                >
                  {language === 'hi' ? 'फोन देखना जारी रखें' : 'Explore Smartphones'}
                </button>
              </div>
            ) : (
              safeCart.map((item) => (
                <div
                  key={item.cartItemId || item.id || Math.random()}
                  className="p-3.5 rounded-2xl bg-white/[0.06] border border-white/10 flex items-start gap-3.5 relative group hover:border-white/20 transition-colors"
                >
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-16 h-16 rounded-xl object-contain bg-white/5 border border-white/10 p-1 shrink-0"
                    onError={(e) => {
                      e.target.src =
                        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80';
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-black text-primary-400 tracking-wider">
                      {item.brand || 'Original'}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                      {item.title}
                    </h4>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      {item.color && (
                        <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                          {item.color}
                        </span>
                      )}
                      {item.ram_storage && (
                        <>
                          <span>•</span>
                          <span>{item.ram_storage}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                      <span className="text-sm font-black text-white font-['Poppins']">
                        ₹{((Number(item?.price) || 0) * (item?.quantity || 1)).toLocaleString()}
                      </span>

                      {/* Quantity Selector */}
                      <div className="flex items-center gap-2 bg-white/5 rounded-lg border border-white/10 p-0.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.cartItemId, -1)}
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.cartItemId, 1)}
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.cartItemId)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition absolute top-2 right-2"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {cart.length > 0 && (
            <div className="p-5 sm:p-6 border-t border-white/10 bg-black/40 space-y-4">
              
              {/* 0% EMI Banner in Cart */}
              <div className="p-3 rounded-xl bg-gold-500/10 border border-gold-500/25 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-gold-400 font-bold">
                  <CreditCard className="w-4 h-4" />
                  <span>0% EMI Available:</span>
                </div>
                <span className="text-gold-300 font-extrabold font-['Poppins']">
                  ₹{cartMonthlyEmi.toLocaleString()} / mo (12M)
                </span>
              </div>

              {/* Total Row */}
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-slate-400 font-medium">
                  {language === 'hi' ? 'कुल राशि (Total Value):' : 'Cart Total Value:'}
                </span>
                <span className="text-2xl font-black text-white font-['Poppins']">
                  ₹{cartTotal.toLocaleString()}
                </span>
              </div>

              {/* Direct WhatsApp Order CTA */}
              <button
                type="button"
                onClick={handleWhatsAppCheckout}
                className="w-full py-3.5 px-4 rounded-xl bg-whatsapp-600 hover:bg-whatsapp-700 text-white font-bold text-sm transition-all shadow-glow-whatsapp flex items-center justify-center gap-2 min-h-[44px]"
              >
                <MessageCircle className="w-5 h-5" />
                <span>
                  {language === 'hi'
                    ? 'व्हाट्सएप पर पूरा बैग ऑर्डर करें'
                    : 'Order Complete Bag on WhatsApp'}
                </span>
              </button>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>दुकान काउंटर पिकअप व तत्काल 0% EMI</span>
                <button
                  type="button"
                  onClick={clearCart}
                  className="hover:text-rose-400 transition"
                >
                  Clear Bag
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
