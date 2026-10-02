import React from 'react';
import { CreditCard, Check, Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function EMIBadges({ onOpenCalculator }) {
  const { t } = useLanguage();

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-6 shadow-xs relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#F1F5F9]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF3FF] text-[#1264F5] text-[11px] font-bold mb-1">
            <CreditCard className="w-3.5 h-3.5 text-[#1264F5]" />
            <span>{t('emi_badges.authorized_partners') || 'Authorized Finance Partners'}</span>
          </div>
          <h3 className="text-base font-bold text-[#102A43]">
            0% Interest Easy Finance Schemes
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Instant counter approvals with Aadhaar, PAN card, and bank passbook
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpenCalculator({ price: 30000, title: "Custom Smartphone" })}
          className="px-3.5 py-1.5 rounded-xl bg-[#1264F5] hover:bg-[#0E52C9] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs shrink-0 cursor-pointer"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{t('emi_badges.open_calculator') || 'Open Calculator'}</span>
        </button>
      </div>

      {/* 3 Partner Cards: Bajaj, TVS, Samsung */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        
        {/* Bajaj Finserv */}
        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs sm:text-sm font-bold text-[#102A43]">
                {t('emi_badges.bajaj_title')}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF3FF] text-[#1264F5]">
                {t('emi_badges.bajaj_badge')}
              </span>
            </div>
            <p className="text-xs text-[#64748B] mb-2.5">
              {t('emi_badges.bajaj_desc')}
            </p>
            <ul className="space-y-1.5 text-xs text-[#102A43]">
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#20B26B] shrink-0" />
                <span>{t('emi_badges.bajaj_bullet1')}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#20B26B] shrink-0" />
                <span>{t('emi_badges.bajaj_bullet2')}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#20B26B] shrink-0" />
                <span>{t('emi_badges.bajaj_bullet3')}</span>
              </li>
            </ul>
          </div>
          <p className="mt-3 pt-2 border-t border-[#E2E8F0] text-[10px] text-[#64748B]">
            {t('emi_badges.bajaj_footer')}
          </p>
        </div>

        {/* TVS Credit */}
        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs sm:text-sm font-bold text-[#102A43]">
                {t('emi_badges.tvs_title')}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6F8F0] text-[#20B26B]">
                {t('emi_badges.tvs_badge')}
              </span>
            </div>
            <p className="text-xs text-[#64748B] mb-2.5">
              {t('emi_badges.tvs_desc')}
            </p>
            <ul className="space-y-1.5 text-xs text-[#102A43]">
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#20B26B] shrink-0" />
                <span>{t('emi_badges.tvs_bullet1')}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#20B26B] shrink-0" />
                <span>{t('emi_badges.tvs_bullet2')}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#20B26B] shrink-0" />
                <span>{t('emi_badges.tvs_bullet3')}</span>
              </li>
            </ul>
          </div>
          <p className="mt-3 pt-2 border-t border-[#E2E8F0] text-[10px] text-[#64748B]">
            {t('emi_badges.tvs_footer')}
          </p>
        </div>

        {/* Samsung Finance+ */}
        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs sm:text-sm font-bold text-[#102A43]">
                Samsung Finance+
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F2EDFF] text-[#7C3AED]">
                Instant DKYC
              </span>
            </div>
            <p className="text-xs text-[#64748B] mb-2.5">
              Zero paper approval on all Galaxy A, M, F & S series phones.
            </p>
            <ul className="space-y-1.5 text-xs text-[#102A43]">
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#20B26B] shrink-0" />
                <span>Digital KYC with PAN/Aadhaar</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#20B26B] shrink-0" />
                <span>Approved in 5 minutes at counter</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#20B26B] shrink-0" />
                <span>Special 0% interest on Galaxy series</span>
              </li>
            </ul>
          </div>
          <p className="mt-3 pt-2 border-t border-[#E2E8F0] text-[10px] text-[#64748B]">
            Applicable on all Samsung smartphones
          </p>
        </div>

      </div>

    </div>
  );
}
