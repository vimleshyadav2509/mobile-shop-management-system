import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Smartphone, Check, Globe } from 'lucide-react';

export default function LanguageModal() {
  const { hasChosenLanguage, isModalOpen, setLanguage } = useLanguage();

  // Show only if user hasn't chosen language on first visit, or manually triggered modal
  if (hasChosenLanguage && !isModalOpen) {
    return null;
  }

  const handleSelect = (lang) => {
    setLanguage(lang);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lang-modal-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-primary-600 text-center animate-in zoom-in-95 duration-200">
        
        {/* Header Icon & Store Branding */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 shadow-inner">
          <Smartphone className="w-9 h-9 text-primary-700" />
        </div>

        <h2 className="text-2xl font-black text-slate-900 mb-1 font-['Poppins'] tracking-tight">
          Amit Mobile Shop
        </h2>
        <p className="text-xs font-semibold text-primary-700 mb-5">
          Kuk Nagar Grint Rd, Khorare, Uttar Pradesh 271312
        </p>

        {/* Bilingual Prompt Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 text-center">
          <h3 id="lang-modal-title" className="text-base sm:text-lg font-black text-slate-900 font-hindi">
            अपनी भाषा चुनें / Choose Your Language
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            कृपया जारी रखने के लिए अपनी भाषा चुनें • Please choose your preferred language
          </p>
        </div>

        {/* Language Selection Buttons */}
        <div className="space-y-3.5">
          
          {/* 1. English Option */}
          <button
            type="button"
            id="lang-select-en-btn"
            onClick={() => handleSelect('en')}
            className="w-full p-4 rounded-2xl bg-white hover:bg-blue-50/50 text-slate-800 transition-all border-2 border-slate-300 hover:border-primary-600 shadow-sm hover:shadow-md flex items-center justify-between group active:scale-[0.99] cursor-pointer"
          >
            <div className="flex items-center gap-3.5 text-left">
              <span className="text-3xl select-none" role="img" aria-label="UK Flag">
                🇬🇧
              </span>
              <div>
                <span className="text-base sm:text-lg font-bold block text-slate-900 group-hover:text-primary-800 font-['Poppins']">
                  English
                </span>
                <span className="text-xs text-slate-500 block">
                  Browse smartphones, accessories & repairs in English
                </span>
              </div>
            </div>
            <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary-600 group-hover:text-white transition-colors shrink-0">
              <Check className="w-4 h-4" />
            </span>
          </button>

          {/* 2. Hindi Option */}
          <button
            type="button"
            id="lang-select-hi-btn"
            onClick={() => handleSelect('hi')}
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-primary-900 to-primary-800 hover:from-primary-800 hover:to-primary-700 text-white transition-all shadow-md hover:shadow-lg flex items-center justify-between group border-2 border-primary-900 active:scale-[0.99] cursor-pointer"
          >
            <div className="flex items-center gap-3.5 text-left">
              <span className="text-3xl select-none" role="img" aria-label="India Flag">
                🇮🇳
              </span>
              <div>
                <span className="text-base sm:text-lg font-black block tracking-wide font-hindi">
                  हिंदी (Hindi)
                </span>
                <span className="text-xs text-primary-200 block">
                  सरल भाषा, आसान खरीदारी और एक्सप्रेस रिपेयरिंग
                </span>
              </div>
            </div>
            <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform shrink-0">
              <Check className="w-4 h-4" />
            </span>
          </button>

        </div>

        {/* Informative Footer */}
        <p className="text-[11px] text-slate-500 mt-6 leading-relaxed">
          🌐 आप बाद में भी ऊपर दिए गए बटन से भाषा बदल सकते हैं। <br />
          You can switch language anytime from the top bar.
        </p>

      </div>
    </div>
  );
}
