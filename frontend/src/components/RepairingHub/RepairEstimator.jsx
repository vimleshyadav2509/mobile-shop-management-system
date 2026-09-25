import React, { useState } from 'react';
import { Wrench, Clock, ShieldCheck, CheckCircle, ChevronDown, ChevronUp, MessageCircle, AlertCircle } from 'lucide-react';
import { calculateEstimate } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { SHOP_INFO } from '../../data/mockData';

const COMMON_BRANDS = [
  'Samsung', 'Apple', 'Vivo', 'Realme', 'Xiaomi / Redmi', 'OnePlus', 'Oppo'
];

export default function RepairEstimator() {
  const { t, language } = useLanguage();
  const [brand, setBrand] = useState('Samsung');
  const [model, setModel] = useState('Galaxy M31');
  const [issue, setIssue] = useState('Display / Touch Screen Replacement');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [error, setError] = useState(null);

  const COMMON_ISSUES = [
    {
      label: language === 'hi' ? 'स्क्रीन / कॉम्बो फूटा हुआ' : 'Broken Screen / Display Combo',
      issue: 'Display / Touch Screen Replacement'
    },
    {
      label: language === 'hi' ? 'बैटरी बैकअप कम / जल्दी खत्म' : 'Battery Draining Fast / Low Backup',
      issue: 'Battery Replacement & Health Check'
    },
    {
      label: language === 'hi' ? 'चार्जिंग पिन / सॉकेट ढीला' : 'Charging Port / Pin Loose',
      issue: 'Type-C / Lightning Port Replacement'
    },
    {
      label: language === 'hi' ? 'कैमरा धुंधला / ग्लास टूटा' : 'Camera Blurry / Broken Glass',
      issue: 'Camera Lens / Sensor Replacement'
    },
    {
      label: language === 'hi' ? 'पानी में गिरा फोन / लिक्विड' : 'Water Dropped / Liquid Damage',
      issue: 'Water Damage Ultrasonic Service'
    },
    {
      label: language === 'hi' ? 'स्पीकर / माइक में आवाज नहीं' : 'Speaker / Mic Not Working',
      issue: 'Speaker / Earpiece / Mic Replacement'
    },
    {
      label: language === 'hi' ? 'फोन ऑन नहीं हो रहा / मदरबोर्ड' : 'Dead Phone / Motherboard Issue',
      issue: 'Chip-level Motherboard Diagnostic'
    },
  ];

  const handleEstimate = async (e) => {
    if (e) e.preventDefault();
    if (!model.trim()) {
      setError(language === 'hi' ? 'कृपया मोबाइल का मॉडल नाम लिखें' : 'Please enter your phone model');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await calculateEstimate(brand, model, issue, notes);
      setEstimate(res);
    } catch (err) {
      console.error(err);
      setError(language === 'hi' ? 'अनुमान लगाने में समस्या आई। कृपया व्हाट्सएप पर संपर्क करें।' : 'Could not calculate estimate. Please message on WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white border-2 border-slate-200 p-6 sm:p-8 shadow-sm">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-800 text-xs font-bold mb-2">
            <Wrench className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'दुकान का प्रमाणित रेट चार्ट' : 'Standard Store Price Guide'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-['Poppins']">
            {language === 'hi' ? 'मोबाइल रिपेयरिंग खर्चे और समय का अनुमान' : 'Mobile Repair Cost & Turnaround Estimator'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            {language === 'hi' ? 'दुकान आने से पहले घर बैठे सही खर्चे का पता लगाएं।' : 'Get transparent cost estimates before visiting Amit Mobile Shop.'}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-700 bg-slate-100 px-4 py-2.5 rounded-xl border border-slate-200 font-medium">
          <Clock className="w-4 h-4 text-whatsapp-600" />
          <span>{language === 'hi' ? 'औसत रिपेयर समय:' : 'Avg Repair Time:'} <strong>45 मिनट</strong></span>
        </div>
      </div>

      {/* Estimator Input Form */}
      <form onSubmit={handleEstimate} className="space-y-6">
        
        {/* Brand Selector */}
        <div>
          <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2.5">
            {t('step_1_brand')}
          </label>
          <div className="flex flex-wrap gap-2">
            {COMMON_BRANDS.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBrand(b)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition border-2 ${
                  brand === b
                    ? 'bg-primary-700 text-white border-primary-700 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Model Input */}
        <div>
          <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
            {t('step_2_model')}
          </label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="उदा. Galaxy M31, iPhone 12, Redmi Note 11, Narzo 50..."
            className="w-full px-4 py-3 rounded-xl retail-input text-sm font-semibold"
            required
          />
        </div>

        {/* Issue Selector Chips */}
        <div>
          <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2.5">
            {t('step_3_issue')}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {COMMON_ISSUES.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setIssue(item.issue)}
                className={`p-3.5 rounded-xl text-left text-xs font-bold transition border-2 flex items-center justify-between ${
                  issue === item.issue
                    ? 'bg-primary-50 text-primary-900 border-primary-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{item.label}</span>
                {issue === item.issue && <CheckCircle className="w-4 h-4 text-primary-700 shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            {t('step_4_notes')}
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={language === 'hi' ? "उदा. टच काम नहीं कर रहा, हाथ से गिर गया था..." : "e.g. touch not responding, fell on floor..."}
            className="w-full px-4 py-2.5 rounded-xl retail-input text-xs font-medium"
          />
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-primary-700 hover:bg-primary-800 text-white font-black text-sm sm:text-base shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{t('calculating')}</span>
            </>
          ) : (
            <>
              <Wrench className="w-5 h-5 text-gold-400" />
              <span>{t('calc_estimate_btn')}</span>
            </>
          )}
        </button>
      </form>

      {/* Estimation Results Card */}
      {estimate && (
        <div className="mt-8 p-6 rounded-2xl bg-slate-50 border-2 border-primary-200 animate-in fade-in duration-200">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <span className="text-xs font-black text-primary-800 uppercase tracking-wider">
                {estimate.brand} • {estimate.model}
              </span>
              <h4 className="text-lg font-black text-slate-900 mt-1 font-['Poppins']">
                {estimate.issue}
              </h4>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-slate-500 font-bold block">{t('est_cost_label')}</span>
              <span className="text-2xl sm:text-3xl font-black text-primary-700 font-['Poppins']">
                ₹{Math.round(estimate.estimated_min_cost).toLocaleString()} – ₹{Math.round(estimate.estimated_max_cost).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Quick Metrics (Time, Quality, Warranty) */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[11px] text-slate-500 font-bold block">{t('est_time_label')}</span>
              <span className="text-sm font-black text-slate-900 flex items-center gap-1.5 mt-0.5">
                <Clock className="w-4 h-4 text-primary-600" />
                {estimate.turnaround_time}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[11px] text-slate-500 font-bold block">{t('est_quality_label')}</span>
              <span className="text-sm font-black text-slate-900 flex items-center gap-1.5 mt-0.5">
                <CheckCircle className="w-4 h-4 text-whatsapp-600" />
                {t('tested_grade')}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[11px] text-slate-500 font-bold block">{t('est_warranty_label')}</span>
              <span className="text-sm font-black text-slate-900 flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-gold-600" />
                3 से 6 महीने
              </span>
            </div>
          </div>

          {/* Summary & Technician Tip */}
          <p className="mt-4 text-xs text-slate-700 leading-relaxed font-medium">
            {estimate.summary}
          </p>

          <div className="mt-3 p-3.5 rounded-xl bg-gold-50 border border-gold-300 text-xs text-gold-900 flex items-start gap-2">
            <span className="font-bold shrink-0">{t('tech_tip_label')}</span>
            <span className="font-medium">{estimate.technician_tip}</span>
          </div>

          {/* Cost Breakdown Toggle */}
          <div className="mt-4 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="text-xs font-bold text-primary-700 hover:text-primary-800 flex items-center gap-1"
            >
              <span>{showBreakdown ? t('hide_breakdown') : t('show_breakdown')}</span>
              {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showBreakdown && estimate.breakdown && (
              <div className="mt-3 p-3.5 rounded-xl bg-white border border-slate-200 text-xs space-y-2 font-medium">
                <div className="flex justify-between text-slate-600">
                  <span>{t('part_cost_label')}</span>
                  <span className="text-slate-900 font-bold">
                    ₹{estimate.breakdown.part_cost_min} – ₹{estimate.breakdown.part_cost_max}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{t('labor_cost_label')}</span>
                  <span className="text-slate-900 font-bold">₹{estimate.breakdown.service_charge}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>दुकान वारंटी:</span>
                  <span className="text-whatsapp-700 font-bold">{estimate.breakdown.warranty_provided}</span>
                </div>
              </div>
            )}
          </div>

          {/* Direct WhatsApp Booking Button */}
          <div className="mt-5">
            <a
              href={estimate.whatsapp_link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 rounded-2xl bg-whatsapp-600 hover:bg-whatsapp-700 text-white font-black text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t('book_repair_wa')}</span>
            </a>
          </div>

        </div>
      )}

    </div>
  );
}
