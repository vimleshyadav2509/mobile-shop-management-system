import React, { useState } from 'react';
import { Wrench, Clock, ShieldCheck, Cpu, PhoneCall, MessageCircle, MapPin, Search } from 'lucide-react';
import RepairEstimator from './RepairEstimator';
import JobSheetTracker from './JobSheetTracker';
import { useLanguage } from '../../context/LanguageContext';
import { SHOP_INFO } from '../../data/mockData';

export default function RepairingHub() {
  const { t, language } = useLanguage();
  const [subTab, setSubTab] = useState('estimator'); // 'estimator' or 'tracker'

  return (
    <section className="space-y-8">
      
      {/* 3-Step Simple Repair Process Banner (Specially designed for rural/suburban junction audience) */}
      <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-amber-600/20 border-b-[6px] border-amber-800">
        <div className="max-w-3xl mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold uppercase tracking-wider text-amber-100 mb-2 border border-white/20">
            <Wrench className="w-3.5 h-3.5 text-amber-200" />
            <span>सरल व पारदर्शी 3-स्टेप रिपेयरिंग</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-hindi tracking-tight">
            मोबाइल स्क्रीन, फोल्डर या बैटरी 1 घंटे में बदलवाएं
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-amber-100 leading-relaxed">
            खोड़ारे चौराहे की विश्वसनीय शॉप — कोई छुपा हुआ चार्ज नहीं, टेस्टिंग के बाद असली बिल व दुकान की पक्की वारंटी।
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          
          {/* Step 1 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="w-8 h-8 rounded-xl bg-white text-amber-700 font-black text-sm flex items-center justify-center shadow-sm">
                1
              </span>
              <MapPin className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="text-base font-bold font-hindi text-white">दुकान पर लाएं</h3>
              <p className="text-xs text-amber-100 mt-1">
                खोड़ारे चौराहा, कुक नगर ग्रिंट रोड पर अपना फोन लाएं या फोन पर समस्या बताएं।
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="w-8 h-8 rounded-xl bg-white text-amber-700 font-black text-sm flex items-center justify-center shadow-sm">
                2
              </span>
              <Search className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="text-base font-bold font-hindi text-white">तुरंत मुफ्त जांच व रेट</h3>
              <p className="text-xs text-amber-100 mt-1">
                माइक्रोस्कोप व टेस्टिंग से सही फॉल्ट पहचानें और काम शुरू होने से पहले फिक्स रेट जानें।
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="w-8 h-8 rounded-xl bg-white text-amber-700 font-black text-sm flex items-center justify-center shadow-sm">
                3
              </span>
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base font-bold font-hindi text-white">1 घंटे में पक्की वारंटी</h3>
              <p className="text-xs text-amber-100 mt-1">
                ओरिजिनल फोल्डर व बैटरी फिटिंग, काउंटर पर पूरी टेस्टिंग और शॉप गारंटी रसीद।
              </p>
            </div>
          </div>

        </div>

        {/* Direct Action Booking Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <a
            href={`tel:${SHOP_INFO.phone1}`}
            className="px-5 py-3 rounded-2xl bg-white text-amber-800 hover:bg-amber-50 font-bold text-xs sm:text-sm transition-all duration-200 shadow-md flex items-center gap-2"
          >
            <PhoneCall className="w-4 h-4 text-amber-600" />
            <span>सीधे कॉल करें (+91 {SHOP_INFO.phone1})</span>
          </a>

          <a
            href={`https://wa.me/${SHOP_INFO.whatsapp}?text=${encodeURIComponent(
              'नमस्ते Amit Mobile Shop, मुझे अपना मोबाइल रिपेयर करवाना है (स्क्रीन / बैटरी / चार्जिंग)। कृपया रेट व समय बताएं।'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all duration-200 shadow-md flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp पर रिपेयर बुक करें</span>
          </a>

          <span className="text-xs text-amber-100 font-medium ml-auto hidden sm:inline">
            ⚡ स्क्रीन और बैटरी तुरंत बदलें
          </span>
        </div>
      </div>

      {/* Repairing Hub Header & Sub-tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wrench className="w-5 h-5 text-amber-700" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-hindi">
              रिपेयरिंग रेट कैलकुलेटर एवं लाइव स्टेटस ट्रैकिंग
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            घर बैठे अपनी स्क्रीन, बैटरी या चार्जिंग का अनुमानित खर्च चेक करें या अपनी जॉब शीट (रसीद) ट्रैक करें।
          </p>
        </div>

        {/* Sub-Tabs: Estimator vs Job Sheet Tracker */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 w-full md:w-auto">
          <button
            onClick={() => setSubTab('estimator')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all ${
              subTab === 'estimator'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{t('subtab_estimator')} (खर्च जानें)</span>
          </button>

          <button
            onClick={() => setSubTab('tracker')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all ${
              subTab === 'tracker'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{t('subtab_tracker')} (स्थिति जांचें)</span>
          </button>
        </div>
      </div>

      {/* 3 Grounded Service Guarantees */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center gap-3.5 shadow-xs">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
              {t('express_guarantee_1')}
            </h4>
            <p className="text-[11px] text-slate-500 font-normal">Express 1-hour screen & battery fitting</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center gap-3.5 shadow-xs">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
              {t('express_guarantee_2')}
            </h4>
            <p className="text-[11px] text-slate-500 font-normal">Microscope diagnosis for charging & IC issues</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center gap-3.5 shadow-xs">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
              {t('express_guarantee_3')}
            </h4>
            <p className="text-[11px] text-slate-500 font-normal">Tested on counter with transparent printed receipt</p>
          </div>
        </div>
      </div>

      {/* Sub-tab Views */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        {subTab === 'estimator' ? (
          <RepairEstimator />
        ) : (
          <JobSheetTracker />
        )}
      </div>

    </section>
  );
}
