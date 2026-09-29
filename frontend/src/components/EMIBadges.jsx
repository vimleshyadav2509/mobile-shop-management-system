import React from 'react';
import { CreditCard, Check, Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function EMIBadges({ onOpenCalculator }) {
  const { t } = useLanguage();

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 shadow-sm relative">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold mb-2">
            <CreditCard className="w-3.5 h-3.5 text-amber-700" />
            <span>{t('emi_badges.authorized_partners')}</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 font-['Poppins']">
            {t('emi_banner_title')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            {t('emi_banner_desc')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpenCalculator({ price: 30000, title: "Custom Smartphone" })}
          className="btn-primary text-xs shrink-0 cursor-pointer"
        >
          <Clock className="w-4 h-4" />
          <span>{t('emi_badges.open_calculator')}</span>
        </button>
      </div>

      {/* 3 Partner Cards: Bajaj, TVS, Samsung */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Bajaj Finserv */}
        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-slate-900">
                {t('emi_badges.bajaj_title')}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                {t('emi_badges.bajaj_badge')}
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-3 font-normal">
              {t('emi_badges.bajaj_desc')}
            </p>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{t('emi_badges.bajaj_bullet1')}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{t('emi_badges.bajaj_bullet2')}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{t('emi_badges.bajaj_bullet3')}</span>
              </li>
            </ul>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500">
            {t('emi_badges.bajaj_footer')}
          </div>
        </div>

        {/* TVS Credit */}
        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-slate-900">
                {t('emi_badges.tvs_title')}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                {t('emi_badges.tvs_badge')}
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-3 font-normal">
              {t('emi_badges.tvs_desc')}
            </p>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{t('emi_badges.tvs_bullet1')}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{t('emi_badges.tvs_bullet2')}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{t('emi_badges.tvs_bullet3')}</span>
              </li>
            </ul>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500">
            {t('emi_badges.tvs_footer')}
          </div>
        </div>

        {/* Samsung Finance+ */}
        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-slate-900">
                {t('emi_badges.samsung_title')}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
                {t('emi_badges.samsung_badge')}
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-3 font-normal">
              {t('emi_badges.samsung_desc')}
            </p>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{t('emi_badges.samsung_bullet1')}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{t('emi_badges.samsung_bullet2')}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{t('emi_badges.samsung_bullet3')}</span>
              </li>
            </ul>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500">
            {t('emi_badges.samsung_footer')}
          </div>
        </div>

      </div>

    </div>
  );
}
