import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function HomePromoBanner({ onShopNow }) {
  const { t } = useLanguage();

  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#12315B] via-[#124DB8] to-[#1264F5] text-white p-4 sm:p-5 shadow-sm min-h-[120px] max-h-[155px] flex items-center justify-between">
        {/* Subtle background glow effect */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        {/* Left: Text & CTA */}
        <div className="z-10 max-w-[65%] sm:max-w-[70%] space-y-1.5 sm:space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15 text-white text-[10px] font-semibold backdrop-blur-xs">
            <Sparkles className="w-3 h-3 text-[#F4B400]" />
            <span>0% EMI Available</span>
          </div>

          <h2 className="text-base sm:text-xl font-bold tracking-tight text-white leading-tight">
            {t('ref_ui.latest_smartphones') || 'Latest Smartphones'}
          </h2>

          <p className="text-[11px] sm:text-xs text-blue-100 font-normal line-clamp-1">
            {t('ref_ui.banner_sub') || 'Best Price | 0% EMI Available'}
          </p>

          <button
            type="button"
            onClick={onShopNow}
            className="inline-flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white text-[#12315B] hover:bg-[#F5F9FF] text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <span>{t('ref_ui.shop_now') || 'Shop Now'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#1264F5]" />
          </button>
        </div>

        {/* Right: Phone Visual Mockup / Image */}
        <div className="z-10 w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center relative shrink-0">
          <img
            src="https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&auto=format&fit=crop&q=80"
            alt="Latest Smartphone"
            className="w-full h-full object-contain drop-shadow-lg transform rotate-6 hover:rotate-0 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
