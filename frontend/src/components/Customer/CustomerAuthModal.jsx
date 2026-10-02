import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  User,
  Mail,
  Home,
  LogOut,
  ChevronLeft
} from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function CustomerAuthModal({ isOpen, onClose, initialMode = 'auth' }) {
  const { t, language } = useLanguage();
  const {
    customer,
    isAuthenticated,
    requestOtp,
    verifyOtp,
    updateProfile,
    requestPhoneChangeOtp,
    verifyPhoneChangeOtp,
    logout
  } = useCustomerAuth();

  // Mode: 'login' | 'profile' | 'change_phone'
  const [mode, setMode] = useState(isAuthenticated ? 'profile' : 'login');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'

  // Input states
  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [newPhoneInput, setNewPhoneInput] = useState('');
  const [newOtpInput, setNewOtpInput] = useState('');

  // Profile fields
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    address: '',
    city: 'Khorare',
    state: 'Uttar Pradesh',
    pincode: '271312'
  });

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // Sync mode and profile data when opening modal
  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      setSuccessMessage('');
      if (isAuthenticated && customer) {
        setMode(initialMode === 'change_phone' ? 'change_phone' : 'profile');
        setProfileData({
          name: customer.name || '',
          email: customer.email || '',
          address: customer.address || '',
          city: customer.city || 'Khorare',
          state: customer.state || 'Uttar Pradesh',
          pincode: customer.pincode || '271312'
        });
      } else {
        setMode('login');
        setStep('phone');
        setPhoneInput('');
        setOtpInput('');
      }
    }
  }, [isOpen, isAuthenticated, customer, initialMode]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  if (!isOpen) return null;

  // --- Step 1: Request OTP ---
  const handleRequestOtp = async (e) => {
    e?.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const clean = phoneInput.replace(/\D/g, '');
    if (clean.length < 10) {
      setErrorMessage(language === 'hi' ? 'कृपया 10 अंकों का मान्य भारतीय मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await requestOtp(phoneInput);
      setSuccessMessage(res.message || 'OTP sent successfully!');
      setStep('otp');
      setCooldown(60);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Step 2: Verify OTP ---
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (otpInput.trim().length !== 6) {
      setErrorMessage(language === 'hi' ? 'कृपया 6 अंकों का ओटीपी दर्ज करें।' : 'Please enter a 6-digit OTP code.');
      return;
    }

    setIsLoading(true);
    try {
      await verifyOtp(phoneInput, otpInput.trim());
      setSuccessMessage(language === 'hi' ? 'मोबाइल नंबर सत्यापित! लॉगिन सफल।' : 'Mobile number verified! Login successful.');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMessage(err.message || 'Invalid or expired OTP code.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Profile: Save Profile Changes ---
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);
    try {
      await updateProfile(profileData);
      setSuccessMessage(language === 'hi' ? 'प्रोफ़ाइल सफलतापूर्वक अपडेट की गई।' : 'Profile updated successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Change Mobile: Request OTP to New Number ---
  const handleRequestNewPhoneOtp = async (e) => {
    e?.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const clean = newPhoneInput.replace(/\D/g, '');
    if (clean.length < 10) {
      setErrorMessage(language === 'hi' ? 'कृपया नया 10 अंकों का मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit new mobile number.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await requestPhoneChangeOtp(newPhoneInput);
      setSuccessMessage(res.message || 'OTP sent to new mobile number!');
      setStep('otp');
      setCooldown(60);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send OTP to new number.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Change Mobile: Verify OTP on New Number ---
  const handleVerifyNewPhoneOtp = async (e) => {
    e?.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (newOtpInput.trim().length !== 6) {
      setErrorMessage(language === 'hi' ? 'कृपया 6 अंकों का ओटीपी दर्ज करें।' : 'Please enter the 6-digit OTP code.');
      return;
    }

    setIsLoading(true);
    try {
      await verifyPhoneChangeOtp(newPhoneInput, newOtpInput.trim());
      setSuccessMessage(language === 'hi' ? 'मोबाइल नंबर सफलतापूर्वक बदला गया!' : 'Mobile number updated successfully!');
      setStep('phone');
      setMode('profile');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(err.message || 'Invalid OTP for new mobile number.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Handle Logout ---
  const handleCustomerLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 flex flex-col overflow-hidden max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            {mode === 'change_phone' && (
              <button
                type="button"
                onClick={() => {
                  setMode('profile');
                  setStep('phone');
                  setErrorMessage('');
                }}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <div className="w-9 h-9 rounded-xl bg-[#1264F5]/10 text-[#1264F5] flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#102A43]">
                {mode === 'login'
                  ? (language === 'hi' ? 'मोबाइल OTP लॉगिन' : 'Customer Mobile OTP')
                  : mode === 'change_phone'
                  ? (language === 'hi' ? 'मोबाइल नंबर बदलें' : 'Change Mobile Number')
                  : (language === 'hi' ? 'मेरी प्रोफ़ाइल' : 'My Account Profile')}
              </h2>
              <p className="text-[11px] text-gray-500">
                {mode === 'login'
                  ? (language === 'hi' ? 'अपने मोबाइल नंबर से सुरक्षित लॉगिन' : 'Secure verification with instant SMS OTP')
                  : mode === 'change_phone'
                  ? (language === 'hi' ? 'नए नंबर का OTP सत्यापन आवश्यक है' : 'OTP verification required for new number')
                  : (language === 'hi' ? 'सत्यापित स्टोर ग्राहक' : 'Verified Amit Mobile Shop Customer')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 flex items-center justify-center transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Status Banners */}
          {errorMessage && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-start gap-2 border border-red-200 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span className="flex-1">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-start gap-2 border border-emerald-200 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="flex-1">{successMessage}</span>
            </div>
          )}

          {/* =========================================================================
              VIEW 1: CUSTOMER LOGIN / REGISTER WITH MOBILE OTP
              ========================================================================= */}
          {mode === 'login' && (
            <div>
              {step === 'phone' ? (
                /* Step 1: Enter Mobile Number */
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      {language === 'hi' ? 'मोबाइल नंबर दर्ज करें' : 'Enter 10-Digit Mobile Number'}
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-xs font-bold text-gray-500 select-none">
                        +91
                      </span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={10}
                        autoFocus
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="9876543210"
                        className="w-full pl-12 pr-4 py-3 text-sm font-semibold tracking-wider border border-gray-300 rounded-xl focus:outline-hidden focus:border-[#1264F5] focus:ring-2 focus:ring-blue-100 transition"
                        required
                      />
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1.5">
                      {language === 'hi'
                        ? 'हम आपके नंबर पर 6-अंकों का सत्यापन कोड (OTP) भेजेंगे।'
                        : 'We will send a 6-digit verification code to this mobile number.'}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || phoneInput.length < 10}
                    className="w-full py-3 px-4 rounded-xl bg-[#1264F5] hover:bg-[#0e52cc] text-white font-bold text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/20 active:scale-98 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{language === 'hi' ? 'ओटीपी भेजा जा रहा है...' : 'Sending OTP...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{language === 'hi' ? 'ओटीपी प्राप्त करें' : 'Send OTP'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Step 2: Enter 6-digit OTP */
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 flex items-center justify-between text-xs">
                    <span className="text-gray-600">
                      {language === 'hi' ? 'सत्यापन कोड भेजा गया:' : 'Code sent to:'}{' '}
                      <strong className="text-[#102A43]">+91 {phoneInput}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setStep('phone');
                        setErrorMessage('');
                      }}
                      className="text-[#1264F5] font-semibold hover:underline cursor-pointer"
                    >
                      {language === 'hi' ? 'बदलें' : 'Change'}
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      {language === 'hi' ? '6-अंकों का ओटीपी दर्ज करें' : 'Enter 6-Digit OTP'}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="one-time-code"
                      maxLength={6}
                      autoFocus
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••••"
                      className="w-full text-center tracking-[0.5em] text-xl font-bold py-3 border border-gray-300 rounded-xl focus:outline-hidden focus:border-[#1264F5] focus:ring-2 focus:ring-blue-100 transition"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otpInput.length !== 6}
                    className="w-full py-3 px-4 rounded-xl bg-[#20B26B] hover:bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-500/20 active:scale-98 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{language === 'hi' ? 'सत्यापन हो रहा है...' : 'Verifying...'}</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>{language === 'hi' ? 'सत्यापित एवं लॉगिन करें' : 'Verify & Log In'}</span>
                      </>
                    )}
                  </button>

                  {/* Resend Cooldown */}
                  <div className="text-center pt-1">
                    {cooldown > 0 ? (
                      <p className="text-xs text-gray-500">
                        {language === 'hi' ? `पुनः ओटीपी भेजें (${cooldown}s)` : `Resend OTP in ${cooldown} seconds`}
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRequestOtp}
                        disabled={isLoading}
                        className="text-xs font-semibold text-[#1264F5] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>{language === 'hi' ? 'ओटीपी पुनः भेजें' : 'Resend OTP'}</span>
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}

          {/* =========================================================================
              VIEW 2: EDIT PROFILE (FOR AUTHENTICATED CUSTOMER)
              ========================================================================= */}
          {mode === 'profile' && (
            <div className="space-y-5">
              {/* Verified Phone Card */}
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#20B26B]/15 text-[#20B26B] flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                      {language === 'hi' ? 'सत्यापित मोबाइल' : 'Verified Mobile'}
                    </span>
                    <span className="text-xs font-bold text-[#102A43]">
                      {customer?.phone}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMode('change_phone');
                    setStep('phone');
                    setNewPhoneInput('');
                    setNewOtpInput('');
                    setErrorMessage('');
                  }}
                  className="text-xs font-semibold text-[#1264F5] hover:underline cursor-pointer"
                >
                  {language === 'hi' ? 'नंबर बदलें' : 'Change'}
                </button>
              </div>

              {/* Profile Details Form */}
              <form onSubmit={handleSaveProfile} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gray-500" />
                    <span>{language === 'hi' ? 'पूरा नाम' : 'Full Name'}</span>
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    required
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-hidden focus:border-[#1264F5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-gray-500" />
                    <span>{language === 'hi' ? 'ईमेल (वैकल्पिक)' : 'Email Address (Optional)'}</span>
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    placeholder="e.g. rahul@example.com"
                    className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-hidden focus:border-[#1264F5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-gray-500" />
                    <span>{language === 'hi' ? 'डिलीवरी का पता' : 'Delivery Address'}</span>
                  </label>
                  <textarea
                    rows={2}
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    placeholder="House / Street / Landmark"
                    className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl focus:outline-hidden focus:border-[#1264F5]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      {language === 'hi' ? 'शहर / कस्बा' : 'City'}
                    </label>
                    <input
                      type="text"
                      value={profileData.city}
                      onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-hidden focus:border-[#1264F5]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      {language === 'hi' ? 'पिनकोड' : 'Pincode'}
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={profileData.pincode}
                      onChange={(e) => setProfileData({ ...profileData, pincode: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-hidden focus:border-[#1264F5]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#1264F5] hover:bg-[#0e52cc] text-white font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>{language === 'hi' ? 'परिवर्तन सहेजें' : 'Save Changes'}</span>
                </button>
              </form>

              {/* Logout Option */}
              <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
                <span className="text-[11px] text-gray-500">
                  {language === 'hi' ? 'सत्र समाप्त करें:' : 'Customer Session:'}
                </span>
                <button
                  type="button"
                  onClick={handleCustomerLogout}
                  className="px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'लॉग आउट' : 'Log Out'}</span>
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 3: CHANGE MOBILE NUMBER (REQUIRES NEW OTP VERIFICATION)
              ========================================================================= */}
          {mode === 'change_phone' && (
            <div className="space-y-4">
              <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 text-xs text-amber-800">
                {language === 'hi'
                  ? 'सुरक्षा कारणों से नया मोबाइल नंबर सत्यापित करने के बाद ही आपका खाता अपडेट होगा।'
                  : 'For security, your account will only be updated after verifying an OTP on the new mobile number.'}
              </div>

              {step === 'phone' ? (
                <form onSubmit={handleRequestNewPhoneOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      {language === 'hi' ? 'नया 10-अंकों का मोबाइल नंबर' : 'New 10-Digit Mobile Number'}
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-xs font-bold text-gray-500 select-none">
                        +91
                      </span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={10}
                        autoFocus
                        value={newPhoneInput}
                        onChange={(e) => setNewPhoneInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="9876543210"
                        className="w-full pl-12 pr-4 py-2.5 text-xs font-semibold border border-gray-300 rounded-xl focus:outline-hidden focus:border-[#1264F5]"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || newPhoneInput.length < 10}
                    className="w-full py-2.5 rounded-xl bg-[#1264F5] text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-blue-700 transition cursor-pointer"
                  >
                    {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{language === 'hi' ? 'नए नंबर पर ओटीपी भेजें' : 'Send OTP to New Number'}</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyNewPhoneOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      {language === 'hi' ? `नंबर +91 ${newPhoneInput} पर भेजा गया कोड` : `Code sent to +91 ${newPhoneInput}`}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="one-time-code"
                      maxLength={6}
                      autoFocus
                      value={newOtpInput}
                      onChange={(e) => setNewOtpInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••••"
                      className="w-full text-center tracking-[0.5em] text-lg font-bold py-2.5 border border-gray-300 rounded-xl focus:outline-hidden focus:border-[#1264F5]"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || newOtpInput.length !== 6}
                    className="w-full py-2.5 rounded-xl bg-[#20B26B] text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-600 transition cursor-pointer"
                  >
                    {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{language === 'hi' ? 'नया नंबर सत्यापित करें' : 'Verify & Update Number'}</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
