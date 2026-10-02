import React, { useState } from 'react';
import {
  X,
  MapPin,
  Navigation,
  ExternalLink,
  Phone,
  Clock,
  Home,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Compass
} from 'lucide-react';
import { SHOP_LOCATION, openShopLocationInMaps, openShopDirections } from '../../utils/shopLocation';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function AddressBookModal({ isOpen, onClose, onOpenAuthModal }) {
  const { t, language } = useLanguage();
  const { customer, isAuthenticated, updateProfile } = useCustomerAuth();

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressData, setAddressData] = useState({
    name: customer?.name || '',
    address: customer?.address || '',
    city: customer?.city || 'Khorare',
    state: customer?.state || 'Uttar Pradesh',
    pincode: customer?.pincode || '271312'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  if (!isOpen) return null;

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError('');
    try {
      await updateProfile(addressData);
      setSaveSuccess(true);
      setIsEditingAddress(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err.message || 'Failed to save address');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="address-book-title"
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#20B26B]/15 text-[#20B26B] flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 id="address-book-title" className="text-base font-bold text-[#102A43]">
                {language === 'hi' ? 'पता पुस्तिका' : 'Address Book'}
              </h2>
              <p className="text-[11px] text-gray-500">
                {language === 'hi' ? 'अमित मोबाइल शॉप स्थान एवं पता' : 'Amit Mobile Shop location & delivery address'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close address book"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Section 1: Official Store Location */}
          <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/40 rounded-2xl p-5 border border-blue-100/80 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1264F5] text-white uppercase tracking-wider">
                  <Compass className="w-3 h-3" />
                  {language === 'hi' ? 'आधिकारिक दुकान' : 'Official Store'}
                </span>
                <h3 className="text-base font-extrabold text-[#102A43] mt-1.5">
                  {SHOP_LOCATION.name}
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  {SHOP_LOCATION.address}
                </p>
              </div>
            </div>

            {/* Shop Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs text-gray-700">
              <div className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-blue-50">
                <Clock className="w-4 h-4 text-[#1264F5] shrink-0" />
                <span>{SHOP_LOCATION.timing}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-blue-50">
                <Phone className="w-4 h-4 text-[#20B26B] shrink-0" />
                <span>+91 {SHOP_LOCATION.phone1}</span>
              </div>
            </div>

            {/* Coordinates Badge */}
            <div className="flex items-center justify-between text-[11px] text-gray-500 bg-white/90 px-3 py-1.5 rounded-lg border border-gray-200">
              <span className="font-medium text-gray-700">
                {language === 'hi' ? 'सटीक निर्देशांक:' : 'Exact Coordinates:'}
              </span>
              <span className="font-mono text-blue-700 font-semibold">
                {SHOP_LOCATION.latitude}, {SHOP_LOCATION.longitude}
              </span>
            </div>

            {/* Interactive Embedded Google Map */}
            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-xs h-48 w-full bg-gray-100 relative">
              <iframe
                title="Amit Mobile Shop Google Map"
                src={SHOP_LOCATION.embedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            </div>

            {/* Primary Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={openShopLocationInMaps}
                className="w-full py-2.5 px-4 rounded-xl bg-[#1264F5] hover:bg-[#0e52cc] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm shadow-blue-500/20 active:scale-98 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>{language === 'hi' ? 'गूगल मैप में खोलें' : 'Open in Google Maps'}</span>
              </button>

              <button
                type="button"
                onClick={openShopDirections}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-gray-50 text-[#102A43] font-semibold text-xs border border-gray-200 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
              >
                <Navigation className="w-4 h-4 text-[#1264F5]" />
                <span>{language === 'hi' ? 'रास्ता देखें' : 'Get Directions'}</span>
              </button>
            </div>
          </div>

          {/* Section 2: Customer Delivery Address */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-[#1264F5]" />
                <h3 className="text-sm font-bold text-[#102A43]">
                  {language === 'hi' ? 'मेरा डिलीवरी पता' : 'My Delivery Address'}
                </h3>
              </div>
              {isAuthenticated && !isEditingAddress && (
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(true)}
                  className="text-xs font-semibold text-[#1264F5] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  {language === 'hi' ? 'बदलें' : 'Edit'}
                </button>
              )}
            </div>

            {saveSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center gap-2 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{language === 'hi' ? 'डिलीवरी पता सफलतापूर्वक सहेजा गया।' : 'Delivery address updated successfully.'}</span>
              </div>
            )}

            {saveError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            {isAuthenticated ? (
              isEditingAddress ? (
                /* Inline Address Edit Form */
                <form onSubmit={handleSaveAddress} className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      {language === 'hi' ? 'प्राप्तकर्ता का नाम' : 'Recipient Name'}
                    </label>
                    <input
                      type="text"
                      value={addressData.name}
                      onChange={(e) => setAddressData({ ...addressData, name: e.target.value })}
                      required
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-hidden focus:border-[#1264F5]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      {language === 'hi' ? 'सड़क / गांव / मकान नं.' : 'Street / Village / House No.'}
                    </label>
                    <input
                      type="text"
                      value={addressData.address}
                      onChange={(e) => setAddressData({ ...addressData, address: e.target.value })}
                      required
                      placeholder="e.g. Near Khorare Chowraha"
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-hidden focus:border-[#1264F5]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        {language === 'hi' ? 'शहर / कस्बा' : 'City / Town'}
                      </label>
                      <input
                        type="text"
                        value={addressData.city}
                        onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                        required
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-hidden focus:border-[#1264F5]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        {language === 'hi' ? 'पिनकोड' : 'Pincode'}
                      </label>
                      <input
                        type="text"
                        value={addressData.pincode}
                        onChange={(e) => setAddressData({ ...addressData, pincode: e.target.value })}
                        maxLength={6}
                        required
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-hidden focus:border-[#1264F5]"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 py-2 rounded-xl bg-[#1264F5] text-white font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-blue-700 transition cursor-pointer"
                    >
                      {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>{language === 'hi' ? 'पता सुरक्षित करें' : 'Save Address'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingAddress(false)}
                      className="py-2 px-3 rounded-xl bg-gray-100 text-gray-700 font-semibold text-xs hover:bg-gray-200 transition cursor-pointer"
                    >
                      {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                    </button>
                  </div>
                </form>
              ) : (
                /* Saved Address Display */
                <div className="text-xs text-gray-600 space-y-1 bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                  <p className="font-bold text-[#102A43]">{customer.name || 'Valued Customer'}</p>
                  <p>{customer.address || (language === 'hi' ? 'कोई पता दर्ज नहीं है' : 'No street address saved yet')}</p>
                  <p>{customer.city || 'Khorare'}, {customer.state || 'Uttar Pradesh'} - {customer.pincode || '271312'}</p>
                  <p className="text-[11px] text-gray-500 pt-1">
                    {language === 'hi' ? 'सत्यापित मोबाइल:' : 'Verified Mobile:'} {customer.phone}
                  </p>
                </div>
              )
            ) : (
              /* Guest Prompt to Login with Mobile OTP */
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 text-xs space-y-2.5">
                <p className="text-amber-800">
                  {language === 'hi' 
                    ? 'होम डिलीवरी एवं त्वरित ऑर्डर के लिए अपना मोबाइल नंबर सत्यापित करें।' 
                    : 'Log in with Mobile OTP to save your doorstep delivery address for instant ordering.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenAuthModal) onOpenAuthModal();
                  }}
                  className="py-2 px-3.5 rounded-lg bg-[#1264F5] hover:bg-blue-700 text-white font-semibold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'मोबाइल OTP से लॉगिन करें' : 'Login with Mobile OTP'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
