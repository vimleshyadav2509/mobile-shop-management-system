import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SHOP_INFO } from '../data/mockData';

export default function ContactBar() {
  const { t, language } = useLanguage();

  return (
    <aside aria-label="Quick Contact Bar" className="fixed bottom-0 left-0 right-0 z-40 p-2.5 sm:p-3 bg-white border-t border-slate-200 shadow-lg md:hidden">
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        
        {/* Direct Call */}
        <a
          href={`tel:${SHOP_INFO.phone1}`}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
        >
          <Phone className="w-4 h-4" />
          <span>{language === 'hi' ? 'कॉल करें' : 'Call Store'}</span>
        </a>

        {/* WhatsApp Chat */}
        <a
          href={`https://wa.me/${SHOP_INFO.whatsapp}?text=${encodeURIComponent(
            language === 'hi' 
              ? "नमस्ते Amit Mobile Shop, मुझे फोन और 0% EMI के बारे में जानकारी चाहिए।" 
              : "Hello Amit Mobile Shop, I want to inquire about smartphones and 0% EMI options."
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{t('whatsapp_chat')}</span>
        </a>

      </div>
    </aside>
  );
}
