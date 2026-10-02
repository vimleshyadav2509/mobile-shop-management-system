import React from 'react';
import { Home, Grid2X2, Wrench, User } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function CustomerBottomNav({ activeTab, onTabChange }) {
  const { t } = useLanguage();

  const navItems = [
    {
      id: 'home',
      label: t('ref_ui.bottom_home') || 'Home',
      icon: Home
    },
    {
      id: 'mobiles',
      label: t('ref_ui.bottom_categories') || 'Categories',
      icon: Grid2X2
    },
    {
      id: 'repairs',
      label: t('ref_ui.bottom_repair') || 'Repair',
      icon: Wrench
    },
    {
      id: 'account',
      label: t('ref_ui.bottom_account') || 'Account',
      icon: User
    }
  ];

  return (
    <nav 
      aria-label="Customer Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E2E8F0] shadow-[0_-2px_10px_rgba(0,0,0,0.04)] h-16 flex items-center justify-around px-2 md:hidden"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id || (item.id === 'mobiles' && (activeTab === 'accessories' || activeTab === 'mobiles'));

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] cursor-pointer transition-colors duration-150 relative ${
              isActive ? 'text-[#1264F5]' : 'text-[#64748B] hover:text-[#102A43]'
            }`}
          >
            {isActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.75 bg-[#1264F5] rounded-full" />
            )}
            <Icon className={`w-5 h-5 mb-1 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
            <span className={`text-[11px] leading-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
