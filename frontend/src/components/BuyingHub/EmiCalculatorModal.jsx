import React, { useState, useEffect } from 'react';
import { X, Calculator, MessageCircle, Info, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SHOP_INFO } from '../../data/mockData';
import { fetchEmiPlans, getWhatsAppInquiryUrl } from '../../services/api';

export default function EmiCalculatorModal({ product, onClose }) {
  const { t, language } = useLanguage();
  if (!product) return null;

  const price = product.price || 25000;
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [downPayment, setDownPayment] = useState(Math.round(price * 0.2));
  const [tenure, setTenure] = useState(6);
  const [partner, setPartner] = useState(product.emi_samsung ? "Samsung Finance+" : "Bajaj Finserv");

  useEffect(() => {
    let mounted = true;
    fetchEmiPlans()
      .then(data => {
        if (mounted && Array.isArray(data)) {
          const activePlans = data.filter(p => p.is_active);
          setPlans(activePlans);
        }
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const handleSelectPlan = (p) => {
    setSelectedPlanId(p.id);
    setPartner(p.provider);
    setTenure(p.duration_months);
    const dp = p.down_payment !== undefined && p.down_payment !== null && p.down_payment >= 0
      ? p.down_payment
      : Math.round(price * 0.2);
    setDownPayment(Math.min(dp, price));
  };

  const loanAmount = Math.max(0, price - downPayment);
  const monthlyEmi = Math.round(loanAmount / tenure);

  const handleWhatsAppInquiry = () => {
    const text = language === 'hi'
      ? `नमस्ते Amit Mobile Shop, मुझे "${product.title}" आसान किश्तों (EMI) पर लेना है।
कीमत: ₹${price.toLocaleString()}
डाउन पेमेंट: ₹${downPayment.toLocaleString()}
किश्त अवधि: ${tenure} महीने (लगभग ₹${monthlyEmi.toLocaleString()}/महीना)
पसंदीदा फाइनेंस: ${partner}
कृपया जरूरी दस्तावेज व उपलब्धता कन्फर्म करें।`
      : `Hello Amit Mobile Shop, I want to purchase "${product.title}" on EMI.
Price: ₹${price.toLocaleString()}
Down Payment: ₹${downPayment.toLocaleString()}
Tenure: ${tenure} Months (Approx ₹${monthlyEmi.toLocaleString()}/month)
Financing: ${partner}
Please confirm document requirements and availability.`;

    const url = `https://wa.me/${SHOP_INFO.whatsapp}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border-2 border-slate-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-2xl bg-primary-100 text-primary-700">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 font-['Poppins']">
              {t('modal_calc_title')}
            </h3>
            <p className="text-xs text-slate-500 font-semibold truncate max-w-[280px]">
              {product.title}
            </p>
          </div>
        </div>

        {/* Price & Monthly EMI Summary Box */}
        <div className="p-4 rounded-2xl bg-primary-50 border-2 border-primary-200 mb-6">
          <div className="flex justify-between items-center text-xs text-slate-600 mb-1 font-bold">
            <span>{t('modal_device_price')}</span>
            <span>{t('modal_est_monthly')}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-lg font-bold text-slate-900">
              ₹{price.toLocaleString()}
            </span>
            <span className="text-2xl sm:text-3xl font-black text-primary-700 font-['Poppins']">
              ₹{monthlyEmi.toLocaleString()}<span className="text-xs text-slate-500 font-medium">/{language === 'hi' ? 'माह' : 'mo'}</span>
            </span>
          </div>
        </div>

        {/* Down Payment Slider */}
        <div className="space-y-2 mb-5">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-700">{t('modal_down_payment')}</span>
            <span className="text-primary-700 text-sm font-black">₹{downPayment.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min={0}
            max={price * 0.8}
            step={500}
            value={downPayment}
            onChange={(e) => setDownPayment(Number(e.target.value))}
            className="w-full accent-primary-600 bg-slate-200 h-2.5 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
            <span>{t('modal_zero_down')}</span>
            <span>{language === 'hi' ? 'अधिकतम' : 'Max'} ₹{(price * 0.8).toLocaleString()}</span>
          </div>
        </div>

        {/* Tenure Selection */}
        <div className="space-y-2 mb-5">
          <label className="text-xs font-bold text-slate-700 block">
            {t('modal_tenure')}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[3, 6, 9, 12].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setTenure(m)}
                className={`py-2.5 rounded-xl text-xs font-bold transition border-2 cursor-pointer ${
                  tenure === m
                    ? 'bg-primary-700 text-white border-primary-700 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {m} {t('modal_months')}
              </button>
            ))}
          </div>
        </div>

        {/* Available Store EMI Schemes */}
        {plans.length > 0 && (
          <div className="space-y-2 mb-5">
            <label className="text-xs font-bold text-slate-700 block flex items-center justify-between">
              <span>{t('emi_modal.store_plans')}</span>
              <span className="text-[10px] text-primary-600 font-normal">{t('emi_modal.store_plans_tip')}</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {plans.map((p) => {
                const isSelected = selectedPlanId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPlan(p)}
                    className={`p-2.5 text-left rounded-xl text-xs transition border-2 flex items-start justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-primary-50 border-primary-600 ring-2 ring-primary-100'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{p.name}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-primary-600 inline" />}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {p.provider} • {p.duration_months} mo • {p.interest_rate}% Int.
                      </div>
                    </div>
                    {p.down_payment === 0 && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                        {language === 'hi' ? 'शून्य जमा' : 'Zero DP'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Finance Partner Selection */}
        <div className="space-y-2 mb-6">
          <label className="text-xs font-bold text-slate-700 block">
            {t('modal_choose_partner')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['Bajaj Finserv', 'TVS Credit', 'Samsung Finance+'].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPartner(p)}
                className={`p-2 text-center rounded-xl text-xs font-bold transition border-2 ${
                  partner === p
                    ? 'bg-primary-50 text-primary-900 border-primary-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Document Tip Notice */}
        <div className="p-3.5 rounded-xl bg-gold-50 border border-gold-300 flex items-start gap-2.5 mb-6 text-xs text-gold-700 font-medium">
          <Info className="w-4 h-4 text-gold-700 shrink-0 mt-0.5" />
          <span>
            {t('modal_doc_tip')}
          </span>
        </div>

        {/* WhatsApp Apply Action Button */}
        <button
          onClick={handleWhatsAppInquiry}
          className="w-full py-4 rounded-2xl bg-whatsapp-600 hover:bg-whatsapp-700 text-white font-black text-sm shadow-md transition flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{t('modal_apply_whatsapp')}</span>
        </button>

      </div>
    </div>
  );
}
