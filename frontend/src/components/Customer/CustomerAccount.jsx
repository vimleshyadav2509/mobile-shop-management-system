import React from 'react';
import { 
  User, 
  ShoppingBag, 
  Wrench, 
  Heart, 
  Bell, 
  MapPin, 
  Globe, 
  HelpCircle, 
  Info, 
  LogOut, 
  ChevronRight,
  Phone,
  ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { SHOP_INFO } from '../../data/mockData';

export default function CustomerAccount({ onNavigateTab }) {
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const handleLanguageToggle = () => {
    setLanguage(language === 'hi' ? 'en' : 'hi');
  };

  const handleCallShop = () => {
    window.location.href = `tel:${SHOP_INFO.phone1}`;
  };

  const handleWhatsAppHelp = () => {
    const text = language === 'hi'
      ? 'नमस्ते Amit Mobile Shop, मुझे सहायता चाहिए।'
      : 'Hello Amit Mobile Shop, I need assistance.';
    window.open(`https://wa.me/${SHOP_INFO.whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const menuSections = [
    {
      items: [
        {
          id: 'orders',
          label: t('ref_ui.my_orders') || 'My Orders',
          icon: ShoppingBag,
          color: 'text-[#1264F5] bg-[#EAF3FF]',
          action: () => alert(language === 'hi' ? 'दुकान काउंटर पर रसीद उपलब्ध है।' : 'Receipts available at shop counter.')
        },
        {
          id: 'repairs',
          label: t('ref_ui.my_repairs') || 'My Repair Bookings',
          icon: Wrench,
          color: 'text-[#D97706] bg-[#FFF6E5]',
          action: () => onNavigateTab && onNavigateTab('repairs')
        },
        {
          id: 'wishlist',
          label: t('ref_ui.my_wishlist') || 'My Wishlist',
          icon: Heart,
          color: 'text-[#EF4444] bg-[#FEF2F2]',
          action: () => alert(language === 'hi' ? 'विशलिस्ट सुरक्षित है।' : 'Wishlist saved.')
        },
        {
          id: 'notifications',
          label: t('ref_ui.notifications') || 'Notifications',
          icon: Bell,
          color: 'text-[#7C3AED] bg-[#F2EDFF]',
          action: () => alert(language === 'hi' ? 'कोई नया नोटिफिकेशन नहीं है।' : 'No new notifications.')
        }
      ]
    },
    {
      items: [
        {
          id: 'address',
          label: t('ref_ui.address_book') || 'Address Book',
          icon: MapPin,
          color: 'text-[#20B26B] bg-[#E6F8F0]',
          action: () => window.open(SHOP_INFO.mapsUrl, '_blank')
        },
        {
          id: 'language',
          label: t('ref_ui.language_select') || 'Language / भाषा',
          badge: language === 'hi' ? 'हिंदी' : 'English',
          icon: Globe,
          color: 'text-[#1264F5] bg-[#EAF3FF]',
          action: handleLanguageToggle
        },
        {
          id: 'support',
          label: t('ref_ui.help_support') || 'Help & Support',
          icon: HelpCircle,
          color: 'text-[#0284C7] bg-[#E0F2FE]',
          action: handleWhatsAppHelp
        },
        {
          id: 'about',
          label: t('ref_ui.about_us') || 'About Us',
          icon: Info,
          color: 'text-[#64748B] bg-[#F1F5F9]',
          action: () => window.open(SHOP_INFO.mapsUrl, '_blank')
        }
      ]
    },
    {
      items: [
        {
          id: 'admin',
          label: t('ref_ui.owner_login') || 'Shop Owner Login',
          icon: LogOut,
          color: 'text-[#102A43] bg-[#F1F5F9]',
          action: () => navigate('/admin/login')
        }
      ]
    }
  ];

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <h2 className="text-lg font-bold text-[#102A43]">
          {t('ref_ui.account_title') || 'My Account'}
        </h2>
      </div>

      {/* User Profile Card */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 flex items-center gap-3.5 shadow-xs">
        <div className="w-14 h-14 rounded-full bg-[#1264F5] text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
          <User className="w-7 h-7" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#102A43] truncate">
              {t('ref_ui.welcome_customer') || 'Welcome, Customer'}
            </h3>
            <span className="p-0.5 rounded-full bg-[#20B26B]/15 text-[#20B26B]">
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-xs text-[#64748B] truncate mt-0.5">
            +91 {SHOP_INFO.phone1} • Khorare Chowraha
          </p>
          <span className="inline-block text-[11px] font-semibold text-[#1264F5] mt-1 hover:underline cursor-pointer">
            {t('ref_ui.edit_profile') || 'Verified Store Customer'}
          </span>
        </div>
      </div>

      {/* Menu Sections */}
      {menuSections.map((section, sIdx) => (
        <div 
          key={sIdx}
          className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-xs divide-y divide-[#F1F5F9]"
        >
          {section.items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.action}
                className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F8FAFC] transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-[#102A43]">
                    {item.label}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF3FF] text-[#1264F5]">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
                </div>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
