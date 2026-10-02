import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Wrench, 
  Search, 
  ShoppingBag, 
  Smartphone, 
  Zap, 
  Droplets, 
  HelpCircle, 
  ShieldCheck, 
  Clock, 
  Cpu, 
  Award,
  ChevronRight,
  ArrowRight,
  MessageCircle
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { SHOP_INFO } from '../../data/mockData';

export default function RepairServiceView({ onBack, onTrackJob, onOpenEstimator }) {
  const { t, language } = useLanguage();
  const { cartCount, openCart } = useCart();
  const [jobSheetInput, setJobSheetInput] = useState('AMS-101');

  const handleBookShortcut = (issueName) => {
    const text = language === 'hi'
      ? `नमस्ते Amit Mobile Shop, मुझे अपना फोन रिपेयर करवाना है (*${issueName}*)। कृपया दुकान (खोड़ारे चौराहा) पर अनुमानित खर्च व समय बताएं।`
      : `Hello Amit Mobile Shop, I need repair service for (*${issueName}*). Please provide estimated cost and turnaround at your Khorare Chowraha shop.`;
    window.open(`https://wa.me/${SHOP_INFO.whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const quickServices = [
    {
      id: 'screen',
      name: t('ref_ui.screen_repair') || 'Screen Repair',
      icon: Smartphone,
      color: 'bg-[#EAF3FF] text-[#1264F5]',
      action: () => handleBookShortcut('Screen / Display Combo')
    },
    {
      id: 'battery',
      name: t('ref_ui.battery_change') || 'Battery Change',
      icon: Zap,
      color: 'bg-[#FFF6E5] text-[#D97706]',
      action: () => handleBookShortcut('Battery Replacement')
    },
    {
      id: 'water',
      name: t('ref_ui.water_damage') || 'Water Damage',
      icon: Droplets,
      color: 'bg-[#E0F2FE] text-[#0284C7]',
      action: () => handleBookShortcut('Water Damage Clean & Fix')
    },
    {
      id: 'other',
      name: t('ref_ui.other_issues') || 'Other Issues',
      icon: HelpCircle,
      color: 'bg-[#F2EDFF] text-[#7C3AED]',
      action: () => (onOpenEstimator ? onOpenEstimator() : handleBookShortcut('General Repair Diagnosis'))
    }
  ];

  const whyChooseUs = [
    {
      title: t('ref_ui.genuine_parts') || (language === 'hi' ? '100% असली पार्ट्स' : '100% Genuine Parts'),
      desc: language === 'hi' ? 'ओरिजिनल टेस्टेड ग्रेड स्पेयर पार्ट्स' : 'Original tested grade spare parts',
      icon: ShieldCheck,
      color: 'text-[#20B26B] bg-[#E6F8F0]'
    },
    {
      title: t('ref_ui.expert_technicians') || (language === 'hi' ? 'अनुभवी कारीगर' : 'Expert Technicians'),
      desc: language === 'hi' ? 'माइक्रोस्कोप चिप-लेवल रिपेयरिंग' : 'Chip-level microscope repair',
      icon: Cpu,
      color: 'text-[#1264F5] bg-[#EAF3FF]'
    },
    {
      title: t('ref_ui.fast_service') || (language === 'hi' ? '1 घंटे में सर्विस' : 'Fast 1-Hour Service'),
      desc: language === 'hi' ? 'एक्सप्रेस कॉम्बो व बैटरी रिप्लेसमेंट' : 'Express combo & battery turnaround',
      icon: Clock,
      color: 'text-[#D97706] bg-[#FFF6E5]'
    },
    {
      title: t('ref_ui.warranty_guarantee') || (language === 'hi' ? 'पक्की वारंटी व बिल' : 'Warranty Guarantee'),
      desc: language === 'hi' ? '6 महीने तक दुकान वारंटी व पक्का बिल' : 'Up to 6 months store warranty + bill',
      icon: Award,
      color: 'text-[#7C3AED] bg-[#F2EDFF]'
    }
  ];

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (jobSheetInput.trim() && onTrackJob) {
      onTrackJob(jobSheetInput.trim());
    }
  };

  return (
    <section className="space-y-4 pb-8 animate-in fade-in duration-150">
      
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-2 pb-1">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back"
              className="p-1.5 -ml-1.5 rounded-xl hover:bg-slate-100 text-[#102A43] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h2 className="text-base sm:text-lg font-bold text-[#102A43]">
            {t('ref_ui.repair_service_title') || 'Repair Service'}
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={openCart}
            aria-label="Cart"
            className="p-2 rounded-xl text-[#102A43] hover:bg-[#F5F9FF] border border-[#E2E8F0] relative cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#EF4444] text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Promotional Banner matching Screen 6 */}
      <div className="rounded-2xl bg-gradient-to-r from-[#12315B] via-[#124DB8] to-[#1264F5] text-white p-4 sm:p-5 flex items-center justify-between relative overflow-hidden shadow-xs">
        <div className="z-10 max-w-[70%] space-y-1 sm:space-y-1.5">
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
            1-Hour Express
          </span>
          <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
            {t('ref_ui.repair_banner_title') || 'Mobile Repair Service'}
          </h3>
          <p className="text-[11px] sm:text-xs text-blue-100">
            {t('ref_ui.repair_banner_sub') || 'Fast | Genuine Parts | Expert Technicians'}
          </p>
          <div className="pt-1">
            <button
              type="button"
              onClick={() => handleBookShortcut('Express Mobile Repair')}
              className="px-3.5 py-1.5 rounded-xl bg-white text-[#12315B] font-bold text-xs shadow-xs hover:bg-[#F5F9FF] transition-all cursor-pointer"
            >
              {t('ref_ui.book_now') || 'Book Now'}
            </button>
          </div>
        </div>

        <div className="z-10 w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center shrink-0">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center text-white">
            <Wrench className="w-8 h-8 text-amber-300" />
          </div>
        </div>
      </div>

      {/* Quick Book Repair (4 Compact Shortcuts) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-[#102A43] uppercase tracking-wider">
            {t('ref_ui.quick_book_title') || 'Quick Book Repair'}
          </h3>
          {onOpenEstimator && (
            <button
              type="button"
              onClick={onOpenEstimator}
              className="text-xs text-[#1264F5] font-semibold hover:underline cursor-pointer"
            >
              {t('buying.calculator') || 'Price Estimator'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {quickServices.map((svc) => {
            const Icon = svc.icon;
            return (
              <button
                key={svc.id}
                type="button"
                onClick={svc.action}
                className="ref-card p-3 flex flex-col items-center text-center cursor-pointer group hover:border-[#1264F5]"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-2 transition-transform duration-150 group-hover:scale-105 ${svc.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-[#102A43] group-hover:text-[#1264F5] leading-tight">
                  {svc.name}
                </span>
                <span className="text-[10px] text-[#20B26B] font-semibold mt-1">
                  100% Genuine
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Track Your Repair Box matching Screen 6 */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 shadow-xs space-y-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-[#1264F5]" />
            <h3 className="text-sm sm:text-base font-bold text-[#102A43]">
              {t('ref_ui.track_repair_title') || 'Track Your Repair'}
            </h3>
          </div>
          <p className="text-xs text-[#64748B]">
            {t('repairs.tracker_subheading') || 'Enter Job Sheet ID on your deposit receipt'}
          </p>
        </div>

        <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={jobSheetInput}
            onChange={(e) => setJobSheetInput(e.target.value)}
            placeholder={t('ref_ui.enter_job_sheet') || 'Enter Job Sheet No. (e.g. AMS-101)'}
            className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#1264F5] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#102A43] outline-none font-mono uppercase"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#1264F5] hover:bg-[#0E52C9] text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer whitespace-nowrap"
          >
            {t('ref_ui.track_status') || 'Track Status'}
          </button>
        </form>

        {/* Quick Demo Chips */}
        <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
          <span className="text-[11px] font-medium">{t('repairs.quick_test_chips') || 'Demo:'}</span>
          {['AMS-101', 'AMS-102', 'AMS-103'].map((demo) => (
            <button
              key={demo}
              type="button"
              onClick={() => {
                setJobSheetInput(demo);
                if (onTrackJob) onTrackJob(demo);
              }}
              className="px-2 py-0.5 rounded-md bg-[#F1F5F9] hover:bg-[#EAF3FF] hover:text-[#1264F5] text-[11px] font-mono font-semibold cursor-pointer"
            >
              {demo}
            </button>
          ))}
        </div>
      </div>

      {/* Why Choose Us (4 Compact Cards) */}
      <div className="space-y-2 pt-1">
        <h3 className="text-xs sm:text-sm font-bold text-[#102A43] uppercase tracking-wider">
          {t('ref_ui.why_choose_us') || 'Why Choose Us'}
        </h3>

        <div className="grid grid-cols-2 gap-2.5">
          {whyChooseUs.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-[#E2E8F0] p-3 flex items-start gap-2.5 shadow-2xs"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[#102A43] leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-[#64748B] mt-0.5 leading-tight">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
}
