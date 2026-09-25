import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Smartphone, Check, Globe } from 'lucide-react';

export default function LanguageModal() {
  const { hasChosenLanguage, setLanguage } = useLanguage();

  if (hasChosenLanguage) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/85 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-primary-600 text-center animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Icon & Store Title */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700">
          <Smartphone className="w-9 h-9" />
        </div>

        <h2 className="text-2xl font-black text-slate-900 mb-1 font-['Poppins']">
          Amit Mobile Shop
        </h2>
        <p className="text-xs font-semibold text-primary-700 mb-6">
          Kuk Nagar Grint Rd, Khorare, Uttar Pradesh 271312
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 text-left">
          <p className="text-sm font-bold text-slate-800 text-center">
            कृपया अपनी पसंदीदा भाषा चुनें
          </p>
          <p className="text-xs text-slate-500 text-center mt-0.5">
            Please choose your preferred language
          </p>
        </div>

        {/* The Two Main Options */}
        <div className="space-y-3.5">
          
          {/* Hindi Option */}
          <button
            type="button"
            onClick={() => setLanguage('hi')}
            className="w-full p-4 rounded-2xl bg-primary-900 hover:bg-primary-800 text-white transition-all shadow-md flex items-center justify-between group border-2 border-primary-900"
          >
            <div className="flex items-center gap-3.5 text-left">
              <span className="text-3xl" role="img" aria-label="India Flag">
                🇮🇳
              </span>
              <div>
                <span className="text-lg font-black block tracking-wide font-hindi">
                  हिंदी में इस्तेमाल करें
                </span>
                <span className="text-xs text-primary-200 block">
                  सरल भाषा, आसान खरीदारी और रिपेयरिंग
                </span>
              </div>
            </div>
            <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <Check className="w-4 h-4" />
            </span>
          </button>

          {/* English Option */}
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className="w-full p-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 transition-all border-2 border-slate-300 flex items-center justify-between group hover:border-primary-600"
          >
            <div className="flex items-center gap-3.5 text-left">
              <span className="text-3xl" role="img" aria-label="Globe">
                🌐
              </span>
              <div>
                <span className="text-lg font-bold block tracking-wide font-['Poppins']">
                  Continue in English
                </span>
                <span className="text-xs text-slate-500 block">
                  English language version
                </span>
              </div>
            </div>
            <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary-100 group-hover:text-primary-700 transition-colors">
              <Check className="w-4 h-4" />
            </span>
          </button>

        </div>

        <p className="text-[11px] text-slate-400 mt-6">
          आप बाद में भी ऊपर दिए गए बटन से भाषा बदल सकते हैं। <br />
          You can also switch language anytime from the top bar.
        </p>

      </div>
    </div>
  );
}
