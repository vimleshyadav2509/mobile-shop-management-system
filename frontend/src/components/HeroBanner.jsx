import React, { useState } from 'react';
import { 
  ArrowRight, 
  CreditCard, 
  ShieldCheck, 
  Zap, 
  PhoneCall, 
  CheckCircle2, 
  Wrench,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SHOP_INFO } from '../data/mockData';

const FEATURED_MODELS = [
  {
    id: 'iphone-16-pro',
    name: 'iPhone 16 Pro Max',
    brand: 'Apple',
    tagline: 'Titanium design with A18 Pro chip',
    price: '₹1,34,900',
    emi: '₹7,999/mo',
    imgUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 's24-ultra',
    name: 'Galaxy S24 Ultra 5G',
    brand: 'Samsung',
    tagline: 'Built with Galaxy AI & 200MP Quad Camera',
    price: '₹1,29,999',
    emi: '₹6,499/mo',
    imgUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80',
  }
];

export default function HeroBanner({ activeHub, setActiveHub }) {
  const { t, language } = useLanguage();
  const [selectedModelIdx, setSelectedModelIdx] = useState(0);
  const currentModel = FEATURED_MODELS[selectedModelIdx];

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        
        {/* Split Screen Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* LEFT COLUMN: Clean Business Copy & Actions */}
          <div className="lg:col-span-7 text-left space-y-5">
            
            {/* Small Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>Authorized Retail & Service Center • Khorare, UP</span>
            </div>

            {/* Strong but Reasonably Sized Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight font-['Poppins']">
              Latest Smartphones & Certified Pre-Owned on 0% EMI
            </h1>

            {/* Concise Business Message */}
            <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed font-normal">
              {language === 'hi'
                ? 'अमित मोबाइल शॉप पर नए ऐप्पल, सैमसंग, वनप्लस व विवो मोबाइल्स उपलब्ध हैं। बजाज फिनसर्व, टीवीएस क्रेडिट और सैमसंग फाइनेंस+ पर आसान 0% किश्तों और दुकान की पक्की वारंटी के साथ।'
                : 'Explore flagship Apple, Samsung, OnePlus & Vivo smartphones with instant 0% EMI from Bajaj Finserv, TVS Credit, and Samsung Finance+. Genuine bills and local in-shop support at Khorare.'}
            </p>

            {/* Model Selector Tabs */}
            <div className="pt-1 flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Featured:</span>
              <div className="inline-flex p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold">
                {FEATURED_MODELS.map((model, idx) => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModelIdx(idx)}
                    className={`px-3 py-1 rounded-md transition ${
                      selectedModelIdx === idx
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {model.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Primary & Secondary CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => {
                  setActiveHub('buying');
                  scrollToSection('hub-content-section');
                }}
                className="btn-primary py-3 px-6 text-sm flex items-center justify-center gap-2"
              >
                <span>{language === 'hi' ? 'स्मार्टफोन्स देखें' : 'Explore Smartphones'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => scrollToSection('live-emi-calculator')}
                className="btn-secondary py-3 px-6 text-sm flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4 text-slate-600" />
                <span>{language === 'hi' ? 'ईएमआई कैलकुलेटर' : 'Calculate EMI'}</span>
              </button>

              <button
                onClick={() => {
                  setActiveHub('repairing');
                  scrollToSection('hub-content-section');
                }}
                className="inline-flex items-center justify-center gap-2 py-3 px-4 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:underline transition"
              >
                <Wrench className="w-4 h-4 text-slate-500" />
                <span>Book Mobile Repair</span>
              </button>
            </div>

            {/* Subtle Financing Trust Note */}
            <div className="pt-2 flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Instant In-Shop Approval</span>
              </span>
              <span>•</span>
              <span>Aadhaar & PAN Accepted</span>
              <span>•</span>
              <span>Official Brand Bill</span>
            </div>

          </div>

          {/* RIGHT COLUMN: Grounded High-Quality Ecommerce Product Display */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              
              {/* Product Header */}
              <div className="flex items-start justify-between gap-2 mb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {currentModel.brand} Flagship
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 font-['Poppins']">
                    {currentModel.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {currentModel.tagline}
                  </p>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  In Stock
                </span>
              </div>

              {/* High-Resolution Grounded Product Visual */}
              <div className="aspect-[4/3] bg-white border border-slate-200 rounded-xl p-4 overflow-hidden flex items-center justify-center mb-4">
                <img
                  src={currentModel.imgUrl}
                  alt={currentModel.name}
                  className="w-full h-full object-contain"
                  loading="eager"
                />
              </div>

              {/* Price & EMI Breakdown */}
              <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 font-medium block">Starting Price</span>
                  <div className="text-xl font-black text-slate-900 font-['Poppins']">
                    {currentModel.price}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-amber-700 font-medium block">0% EMI Available</span>
                  <div className="text-base font-bold text-amber-800">
                    {currentModel.emi}
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* 4 Grounded Trust Guarantee Chips */}
        <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-800 shrink-0 border border-amber-200">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">{t('trust_emi')}</h4>
              <p className="text-[11px] text-slate-500 font-normal">{t('trust_emi_desc')}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-800 shrink-0 border border-blue-200">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">{t('trust_repair')}</h4>
              <p className="text-[11px] text-slate-500 font-normal">{t('trust_repair_desc')}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 shrink-0 border border-emerald-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">{t('trust_warranty')}</h4>
              <p className="text-[11px] text-slate-500 font-normal">{t('trust_warranty_desc')}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-200 text-slate-800 shrink-0 border border-slate-300">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">{t('trust_support')}</h4>
              <p className="text-[11px] text-slate-500 font-normal">{SHOP_INFO.phone1}</p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
