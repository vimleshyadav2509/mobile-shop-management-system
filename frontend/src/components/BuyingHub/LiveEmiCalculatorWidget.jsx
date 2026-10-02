import React, { useState } from 'react';
import { 
  Calculator, 
  MessageCircle,
  Sparkles
} from 'lucide-react';
import { SHOP_INFO } from '../../data/mockData';
import { useLanguage } from '../../context/LanguageContext';

const PARTNERS = [
  { id: 'bajaj', name: 'Bajaj Finserv' },
  { id: 'tvs', name: 'TVS Credit' },
  { id: 'samsung', name: 'Samsung Finance+' }
];

const TENURES = [6, 12, 24];

export default function LiveEmiCalculatorWidget() {
  const { language, t } = useLanguage();
  const [devicePrice, setDevicePrice] = useState(45000);
  const [downPayment, setDownPayment] = useState(5000);
  const [selectedTenure, setSelectedTenure] = useState(12);
  const [selectedPartner, setSelectedPartner] = useState('bajaj');

  const principal = Math.max(0, devicePrice - downPayment);
  const monthlyPayout = Math.round(principal / selectedTenure);

  const handleApplyWhatsApp = () => {
    const partnerName = PARTNERS.find(p => p.id === selectedPartner)?.name || 'Bajaj Finserv';
    const text = language === 'hi'
      ? `नमस्ते Amit Mobile Shop, मुझे ₹${devicePrice.toLocaleString()} के फोन के लिए *${partnerName}* से ${selectedTenure} महीने की किश्त (₹${monthlyPayout.toLocaleString()}/माह) पर EMI करानी है। डाउन पेमेंट: ₹${downPayment.toLocaleString()}। क्या दस्तावेज लगेंगे?`
      : `Hello Amit Mobile Shop, I want to apply for 0% EMI with *${partnerName}* for a phone worth ₹${devicePrice.toLocaleString()}. Planned Down Payment: ₹${downPayment.toLocaleString()} and Tenure: ${selectedTenure} Months (₹${monthlyPayout.toLocaleString()}/mo). Please confirm required documents.`;

    const url = `https://wa.me/${SHOP_INFO.whatsapp}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-6 shadow-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#F1F5F9]">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-8 h-8 rounded-lg bg-[#EAF3FF] text-[#1264F5] flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[#102A43]">
              {t('live_emi.title') || '0% EMI Calculator'}
            </h3>
          </div>
          <p className="text-xs text-[#64748B]">
            {t('live_emi.subtitle') || 'Calculate easy monthly installments with authorized finance partners'}
          </p>
        </div>

        {/* Partner Selection Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {PARTNERS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedPartner(p.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                selectedPartner === p.id
                  ? 'bg-[#1264F5] text-white shadow-2xs'
                  : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#102A43] hover:bg-slate-200'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-4 items-center">
        
        {/* Sliders Column */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Slider 1: Device Price */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#102A43]">
                {t('live_emi.smartphone_value')}
              </label>
              <span className="font-bold text-sm text-[#1264F5]">
                ₹{devicePrice.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="10000"
              max="160000"
              step="1000"
              value={devicePrice}
              onChange={(e) => {
                const val = Number(e.target.value);
                setDevicePrice(val);
                if (downPayment > val * 0.7) {
                  setDownPayment(Math.round(val * 0.2));
                }
              }}
              className="slider-retail w-full cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#94A3B8] mt-1">
              <span>₹10,000</span>
              <span>₹85,000</span>
              <span>₹1,60,000</span>
            </div>
          </div>

          {/* Slider 2: Down Payment */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#102A43]">
                {t('live_emi.down_payment')}
              </label>
              <span className="font-bold text-sm text-[#1264F5]">
                ₹{downPayment.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={Math.round(devicePrice * 0.7)}
              step="500"
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              className="slider-retail w-full cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#94A3B8] mt-1">
              <span>{t('live_emi.zero_down')}</span>
              <span>₹{Math.round(devicePrice * 0.7).toLocaleString()} ({t('live_emi.max')})</span>
            </div>
          </div>

          {/* Tenure Buttons */}
          <div>
            <label className="block text-xs font-bold text-[#102A43] mb-1.5">
              {t('live_emi.tenure_label')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TENURES.map((tenure) => (
                <button
                  key={tenure}
                  type="button"
                  onClick={() => setSelectedTenure(tenure)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedTenure === tenure
                      ? 'bg-[#1264F5] text-white shadow-2xs'
                      : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#102A43] hover:bg-slate-200'
                  }`}
                >
                  {tenure} {t('live_emi.months_suffix')}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Payout Display Box */}
        <div className="lg:col-span-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs text-[#64748B] mb-1">
              <span>{t('live_emi.selected_finance')}</span>
              <span className="font-bold text-[#102A43]">
                {PARTNERS.find(p => p.id === selectedPartner)?.name}
              </span>
            </div>

            <span className="text-[11px] text-[#64748B] uppercase tracking-wider font-semibold block">
              {t('live_emi.est_monthly')}
            </span>

            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-[#102A43]">
                ₹{monthlyPayout.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-[#64748B]">{t('buying.per_month')}</span>
            </div>

            {/* Breakdown List */}
            <div className="mt-3 pt-3 border-t border-[#E2E8F0] space-y-1.5 text-xs text-[#64748B]">
              <div className="flex justify-between">
                <span>{t('live_emi.loan_principal')}</span>
                <span className="font-bold text-[#102A43]">₹{principal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('live_emi.interest_rate')}</span>
                <span className="font-bold text-[#20B26B]">{t('live_emi.no_cost_emi')}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('live_emi.tenure_duration')}</span>
                <span className="font-bold text-[#102A43]">{selectedTenure} {t('live_emi.months_suffix')}</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleApplyWhatsApp}
            className="w-full py-2.5 px-3 rounded-xl bg-[#20B26B] hover:bg-[#1A985B] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{t('live_emi.apply_whatsapp')}</span>
          </button>

          <p className="text-[10px] text-[#94A3B8] text-center">
            {t('live_emi.disclaimer')}
          </p>
        </div>

      </div>

    </div>
  );
}
