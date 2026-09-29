import React, { useState } from 'react';
import { 
  Calculator, 
  MessageCircle
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
    <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calculator className="w-5 h-5 text-primary-800" />
            <h3 className="text-xl font-bold text-slate-900 font-['Poppins']">
              {t('live_emi.title')}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('live_emi.subtitle')}
          </p>
        </div>

        {/* Partner Selection Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {PARTNERS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedPartner(p.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition border cursor-pointer ${
                selectedPartner === p.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 items-center">
        
        {/* Sliders Column */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Slider 1: Device Price */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                {t('live_emi.smartphone_value')}
              </label>
              <span className="font-mono font-bold text-base text-slate-900">
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
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>₹10,000</span>
              <span>₹85,000</span>
              <span>₹1,60,000</span>
            </div>
          </div>

          {/* Slider 2: Down Payment */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                {t('live_emi.down_payment')}
              </label>
              <span className="font-mono font-bold text-base text-slate-900">
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
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>{t('live_emi.zero_down')}</span>
              <span>₹{Math.round(devicePrice * 0.7).toLocaleString()} ({t('live_emi.max')})</span>
            </div>
          </div>

          {/* Tenure Buttons */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              {t('live_emi.tenure_label')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TENURES.map((tenure) => (
                <button
                  key={tenure}
                  type="button"
                  onClick={() => setSelectedTenure(tenure)}
                  className={`py-2.5 px-3 rounded-lg text-xs font-bold transition border cursor-pointer ${
                    selectedTenure === tenure
                      ? 'bg-primary-800 text-white border-primary-800 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {tenure} {t('live_emi.months_suffix')}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Payout Display Box */}
        <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>{t('live_emi.selected_finance')}</span>
              <span className="font-semibold text-slate-800">
                {PARTNERS.find(p => p.id === selectedPartner)?.name}
              </span>
            </div>

            <span className="text-xs text-slate-500 uppercase tracking-wider font-medium block">
              {t('live_emi.est_monthly')}
            </span>

            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-black text-slate-950 font-['Poppins']">
                ₹{monthlyPayout.toLocaleString()}
              </span>
              <span className="text-sm font-medium text-slate-500">{t('buying.per_month')}</span>
            </div>

            {/* Breakdown List */}
            <div className="mt-4 pt-3 border-t border-slate-200 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>{t('live_emi.loan_principal')}</span>
                <span className="font-mono font-bold text-slate-900">₹{principal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('live_emi.interest_rate')}</span>
                <span className="font-bold text-emerald-700">{t('live_emi.no_cost_emi')}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('live_emi.tenure_duration')}</span>
                <span className="font-bold text-slate-900">{selectedTenure} {t('live_emi.months_suffix')}</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleApplyWhatsApp}
            className="btn-whatsapp w-full py-3 text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{t('live_emi.apply_whatsapp')}</span>
          </button>

          <p className="text-[11px] text-slate-400 text-center">
            {t('live_emi.disclaimer')}
          </p>
        </div>

      </div>

    </div>
  );
}
