import React from 'react';
import { Smartphone, RefreshCw, Headphones, Wrench } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function QuickCategories({ onSelectCategory }) {
  const { t } = useLanguage();

  const categories = [
    {
      id: 'new-phones',
      label: t('ref_ui.new_phones') || 'New Phones',
      icon: Smartphone,
      iconBg: 'bg-[#EAF3FF] text-[#1264F5]',
      action: () => onSelectCategory('mobiles', 'new')
    },
    {
      id: 'second-hand',
      label: t('ref_ui.second_hand') || 'Second Hand',
      icon: RefreshCw,
      iconBg: 'bg-[#E6F8F0] text-[#20B26B]',
      action: () => onSelectCategory('second_hand')
    },
    {
      id: 'accessories',
      label: t('ref_ui.accessories') || 'Accessories',
      icon: Headphones,
      iconBg: 'bg-[#F2EDFF] text-[#7C3AED]',
      action: () => onSelectCategory('accessories')
    },
    {
      id: 'repair-service',
      label: t('ref_ui.repair_service') || 'Repair Service',
      icon: Wrench,
      iconBg: 'bg-[#FFF6E5] text-[#D97706]',
      action: () => onSelectCategory('repairs')
    }
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={cat.action}
              className="flex flex-col items-center text-center group cursor-pointer p-1.5 focus:outline-none"
            >
              {/* Circular Icon Container */}
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-transform duration-150 group-hover:scale-105 group-active:scale-95 shadow-2xs ${cat.iconBg}`}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>

              {/* Label */}
              <span className="mt-1.5 text-[11px] sm:text-xs font-semibold text-[#102A43] group-hover:text-[#1264F5] leading-tight line-clamp-1">
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
