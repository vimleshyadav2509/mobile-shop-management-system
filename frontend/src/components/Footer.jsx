import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, MapPin, Phone, MessageCircle, Clock, ShieldCheck } from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';
import { SHOP_INFO } from '../data/mockData';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="mt-16 border-t border-slate-800 bg-slate-950 pb-24 md:pb-12 pt-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          
          {/* Col 1: Store Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-800 flex items-center justify-center text-white shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-white font-['Poppins']">
                Amit Mobile Shop
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              {t('footer_tagline')} Brand-new flagships, certified refurbished devices, 0% EMI financing, and express 1-hour repairs.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Genuine Spares & Cash Bill</span>
            </div>
          </div>

          {/* Col 2: Location & Timing */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-['Poppins']">
              {t('footer_address_title')}
            </h4>
            <div className="flex items-start gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>Kuk Nagar Grint Rd, Khorare, Uttar Pradesh 271312</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{t('timing')}</span>
            </div>
            <a
              href="https://maps.app.goo.gl/Cumott8vek7HA85K9"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-400 hover:text-primary-300 hover:underline pt-0.5"
            >
              <span>{t('footer_directions')}</span>
            </a>
          </div>

          {/* Col 3: Phone & WhatsApp */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-['Poppins']">
              {t('footer_contacts_title')}
            </h4>
            <div className="space-y-2">
              <a
                href={`tel:${SHOP_INFO.phone1}`}
                className="flex items-center gap-2 text-slate-300 hover:text-white transition"
              >
                <Phone className="w-4 h-4 text-primary-400" />
                <span>+91 {SHOP_INFO.phone1} (Amit Mobile Shop)</span>
              </a>
              <a
                href={`tel:${SHOP_INFO.phone2}`}
                className="flex items-center gap-2 text-slate-300 hover:text-white transition"
              >
                <Phone className="w-4 h-4 text-primary-400" />
                <span>+91 {SHOP_INFO.phone2} (Store Helpline)</span>
              </a>
              <a
                href={`https://wa.me/${SHOP_INFO.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition font-semibold"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp: +91 {SHOP_INFO.phone1}</span>
              </a>
            </div>
          </div>

          {/* Col 4: Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-['Poppins']">
              Services & EMI
            </h4>
            <ul className="space-y-1.5 text-slate-400 text-xs">
              <li>• Bajaj Finserv 0% No Cost EMI</li>
              <li>• TVS Credit Rural Finance</li>
              <li>• Samsung Finance+ Digital Loans</li>
              <li>• 1-Hour Folder / Display Replacement</li>
              <li>• Live Job Sheet Tracking</li>
              <li>• 32-Point Inspected Used Phones</li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright & Owner Link */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Amit Mobile Shop. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Kuk Nagar Grint Rd, Khorare, UP 271312</span>
            <span>|</span>
            <Link to="/admin/login" className="text-slate-400 hover:text-white transition-colors">
              Owner Portal
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
