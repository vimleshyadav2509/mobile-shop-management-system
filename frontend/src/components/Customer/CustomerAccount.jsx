import React, { useState } from 'react';
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
  ShieldCheck,
  LogIn
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { SHOP_INFO } from '../../data/mockData';
import { SHOP_LOCATION, openShopLocationInMaps } from '../../utils/shopLocation';
import AddressBookModal from './AddressBookModal';
import CustomerAuthModal from './CustomerAuthModal';

export default function CustomerAccount({ onNavigateTab }) {
  const { t, language, setLanguage } = useLanguage();
  const { customer, isAuthenticated, logout } = useCustomerAuth();
  const navigate = useNavigate();

  // Modal Visibility States
  const [isAddressBookOpen, setIsAddressBookOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('auth');

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

  const openLoginModal = () => {
    setAuthModalMode('auth');
    setIsAuthModalOpen(true);
  };

  const openProfileModal = () => {
    setAuthModalMode('profile');
    setIsAuthModalOpen(true);
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
          badge: language === 'hi' ? 'दुकान का नक्शा' : 'Shop Map',
          icon: MapPin,
          color: 'text-[#20B26B] bg-[#E6F8F0]',
          action: () => setIsAddressBookOpen(true)
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
          action: openShopLocationInMaps
        }
      ]
    },
    {
      items: [
        ...(isAuthenticated ? [
          {
            id: 'customer_logout',
            label: language === 'hi' ? 'ग्राहक लॉग आउट' : 'Customer Log Out',
            icon: LogOut,
            color: 'text-red-600 bg-red-50',
            action: async () => {
              if (window.confirm(language === 'hi' ? 'क्या आप लॉग आउट करना चाहते हैं?' : 'Are you sure you want to log out?')) {
                await logout();
              }
            }
          }
        ] : []),
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
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 flex items-center gap-3.5 shadow-xs transition hover:border-blue-200">
        <div 
          onClick={isAuthenticated ? openProfileModal : openLoginModal}
          className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl shadow-xs shrink-0 cursor-pointer ${
            isAuthenticated ? 'bg-[#20B26B] text-white' : 'bg-[#1264F5] text-white'
          }`}
        >
          {isAuthenticated && customer?.name ? (
            customer.name.charAt(0).toUpperCase()
          ) : (
            <User className="w-7 h-7" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#102A43] truncate">
              {isAuthenticated ? (customer?.name || 'Valued Customer') : (t('ref_ui.welcome_customer') || 'Welcome, Customer')}
            </h3>
            {isAuthenticated ? (
              <span className="p-0.5 rounded-full bg-[#20B26B]/15 text-[#20B26B]" title="Verified Customer">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            ) : null}
          </div>
          <p className="text-xs text-[#64748B] truncate mt-0.5">
            {isAuthenticated ? (
              <span className="font-medium text-emerald-700">
                {customer?.phone} • {customer?.city || 'Khorare'}
              </span>
            ) : (
              `+91 ${SHOP_INFO.phone1} • Khorare Chowraha`
            )}
          </p>

          {/* Action Trigger */}
          {isAuthenticated ? (
            <button
              type="button"
              onClick={openProfileModal}
              className="inline-block text-[11px] font-semibold text-[#1264F5] mt-1 hover:underline cursor-pointer"
            >
              {language === 'hi' ? 'प्रोफ़ाइल देखें एवं संपादित करें' : 'Edit Profile & Addresses'}
            </button>
          ) : (
            <button
              type="button"
              onClick={openLoginModal}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1264F5] bg-blue-50 hover:bg-blue-100 px-2.5 py-0.5 rounded-full mt-1.5 transition cursor-pointer"
            >
              <LogIn className="w-3 h-3" />
              <span>{language === 'hi' ? 'मोबाइल OTP से लॉगिन करें' : 'Login with Mobile OTP'}</span>
            </button>
          )}
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

      {/* Feature B: Address Book Modal (Shop Location Map + Saved Address) */}
      <AddressBookModal
        isOpen={isAddressBookOpen}
        onClose={() => setIsAddressBookOpen(false)}
        onOpenAuthModal={() => {
          setAuthModalMode('auth');
          setIsAuthModalOpen(true);
        }}
      />

      {/* Feature A: Customer Mobile OTP Authentication & Profile Modal */}
      <CustomerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </div>
  );
}
