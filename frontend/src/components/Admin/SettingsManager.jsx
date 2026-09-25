import React, { useState, useEffect } from 'react';
import {
  Settings,
  Store,
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  Server,
  Database,
  Sun,
  Moon,
  Laptop,
  Lock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Save,
  RefreshCw,
  Mail,
  ExternalLink
} from 'lucide-react';
import { SHOP_INFO } from '../../data/mockData';
import { useAdminTheme } from '../../context/AdminThemeContext';
import { changeAdminPassword, fetchShopSettings, updateShopSettings } from '../../services/api';

export default function SettingsManager({ admin }) {
  const { theme, setTheme } = useAdminTheme();

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPwd, setIsUpdatingPwd] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  // Shop Settings State (Phase 4.4)
  const [shopName, setShopName] = useState('Amit Mobile Shop');
  const [tagline, setTagline] = useState('Smartphones, Certified Pre-Owned & Expert Repairs');
  const [phone1, setPhone1] = useState('+91 98765 43210');
  const [phone2, setPhone2] = useState('+91 91234 56789');
  const [whatsapp, setWhatsapp] = useState('919876543210');
  const [email, setEmail] = useState('contact@amitmobileshop.com');
  const [address, setAddress] = useState('Main Market, Station Road, Opp. City Mall, Mirzapur, UP 231001');
  const [openingTime, setOpeningTime] = useState('10:00 AM');
  const [closingTime, setClosingTime] = useState('09:00 PM');
  const [weeklyOff, setWeeklyOff] = useState('None (Open All 7 Days)');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('https://maps.google.com');

  const [loadingSettings, setLoadingSettings] = useState(true);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');

  useEffect(() => {
    async function loadSettings() {
      setLoadingSettings(true);
      try {
        const data = await fetchShopSettings();
        if (data) {
          setShopName(data.shop_name || 'Amit Mobile Shop');
          setTagline(data.tagline || '');
          setPhone1(data.phone1 || '');
          setPhone2(data.phone2 || '');
          setWhatsapp(data.whatsapp || '');
          setEmail(data.email || '');
          setAddress(data.address || '');
          setOpeningTime(data.opening_time || '10:00 AM');
          setClosingTime(data.closing_time || '09:00 PM');
          setWeeklyOff(data.weekly_off || 'None (Open All 7 Days)');
          setGoogleMapsUrl(data.google_maps_url || '');
        }
      } catch (err) {
        console.warn('Failed to load store settings:', err);
      } finally {
        setLoadingSettings(false);
      }
    }
    loadSettings();
  }, []);

  const handleSaveStoreSettings = async (e) => {
    e.preventDefault();
    setIsUpdatingSettings(true);
    setSettingsSuccess('');
    setSettingsError('');
    try {
      await updateShopSettings({
        shop_name: shopName.trim(),
        tagline: tagline.trim(),
        phone1: phone1.trim(),
        phone2: phone2.trim(),
        whatsapp: whatsapp.trim(),
        email: email.trim(),
        address: address.trim(),
        opening_time: openingTime.trim(),
        closing_time: closingTime.trim(),
        weekly_off: weeklyOff.trim(),
        google_maps_url: googleMapsUrl.trim()
      });
      setSettingsSuccess('Store parameters saved and applied successfully across storefront!');
      setTimeout(() => setSettingsSuccess(''), 4000);
    } catch (err) {
      setSettingsError(err.message || 'Failed to update shop parameters.');
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (newPassword.length < 8) {
      setPwdError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdError('New password and confirmation do not match.');
      return;
    }

    if (newPassword === currentPassword) {
      setPwdError('New password cannot be the same as your current password.');
      return;
    }

    setIsUpdatingPwd(true);
    try {
      const res = await changeAdminPassword(currentPassword, newPassword);
      setPwdSuccess(res.message || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwdError(err.message || 'Failed to change password. Please check your current password.');
    } finally {
      setIsUpdatingPwd(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-card-fade">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--border)]">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[var(--foreground)] tracking-tight font-['Poppins']">
            Store & System Settings
          </h2>
          <p className="text-xs text-[var(--muted-foreground)]">
            Counter credentials, physical store parameters, dynamic customer display, and appearance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        
        {/* Dynamic Physical Store Profile (Phase 4.4) */}
        <div className="admin-card p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
            <div className="flex items-center gap-2.5">
              <Store className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-[var(--foreground)]">Store Profile & Operating Hours</h3>
            </div>
            <span className="text-[10px] text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded font-semibold border border-teal-500/20">
              Live Database
            </span>
          </div>

          <form onSubmit={handleSaveStoreSettings} className="space-y-3 text-xs">
            {settingsSuccess && (
              <div className="p-2.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{settingsSuccess}</span>
              </div>
            )}
            {settingsError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{settingsError}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-[var(--foreground)] mb-1">
                Shop Display Name *
              </label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="admin-input"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--foreground)] mb-1">
                Shop Tagline / Slogan
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Certified Pre-Owned Phones & Fast Repairs"
                className="admin-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--foreground)] mb-1">
                  Primary Counter Phone *
                </label>
                <input
                  type="text"
                  required
                  value={phone1}
                  onChange={(e) => setPhone1(e.target.value)}
                  className="admin-input"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--foreground)] mb-1">
                  Secondary Phone
                </label>
                <input
                  type="text"
                  value={phone2}
                  onChange={(e) => setPhone2(e.target.value)}
                  className="admin-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--foreground)] mb-1">
                  WhatsApp Inquiry Number *
                </label>
                <input
                  type="text"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="e.g. 919876543210"
                  className="admin-input"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--foreground)] mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="admin-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--foreground)] mb-1">
                Full Physical Address
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="admin-input resize-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--foreground)] mb-1">
                  Opening Time
                </label>
                <input
                  type="text"
                  value={openingTime}
                  onChange={(e) => setOpeningTime(e.target.value)}
                  placeholder="10:00 AM"
                  className="admin-input"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--foreground)] mb-1">
                  Closing Time
                </label>
                <input
                  type="text"
                  value={closingTime}
                  onChange={(e) => setClosingTime(e.target.value)}
                  placeholder="09:00 PM"
                  className="admin-input"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--foreground)] mb-1">
                  Weekly Off
                </label>
                <input
                  type="text"
                  value={weeklyOff}
                  onChange={(e) => setWeeklyOff(e.target.value)}
                  placeholder="None (7 Days)"
                  className="admin-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdatingSettings}
              className="mt-2 w-full admin-btn-primary flex items-center justify-center gap-1.5 py-2"
            >
              {isUpdatingSettings ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Parameters...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Store Parameters</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Appearance & Theme Preference */}
        <div className="admin-card p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--border)]">
            <Settings className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-[var(--foreground)]">Interface Appearance</h3>
          </div>

          <p className="text-xs text-[var(--muted-foreground)]">
            Choose your preferred dashboard display theme. The setting is saved locally to your device.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-3.5 rounded-xl border flex flex-col items-center text-center transition-all ${
                theme === 'dark'
                  ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 font-bold shadow-sm'
                  : 'bg-[var(--card-elevated)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              <Moon className="w-5 h-5 mb-2" />
              <span className="text-xs">Dark Theme</span>
              <span className="text-[10px] opacity-70 mt-0.5">Slate #0F172A</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-3.5 rounded-xl border flex flex-col items-center text-center transition-all ${
                theme === 'light'
                  ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 font-bold shadow-sm'
                  : 'bg-[var(--card-elevated)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              <Sun className="w-5 h-5 mb-2" />
              <span className="text-xs">Light Theme</span>
              <span className="text-[10px] opacity-70 mt-0.5">Clean White / Slate</span>
            </button>
          </div>

          <div className="pt-3 border-t border-[var(--border)] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted-foreground)]">Primary Accent</span>
              <span className="font-semibold text-indigo-500">Indigo (#6366F1)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted-foreground)]">Operational Accent</span>
              <span className="font-semibold text-teal-500">Teal (#14B8A6)</span>
            </div>
          </div>
        </div>

        {/* Security & System Infrastructure */}
        <div className="admin-card p-4 sm:p-5 space-y-4 lg:col-span-2">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--border)]">
            <ShieldCheck className="w-4 h-4 text-teal-500" />
            <h3 className="text-sm font-bold text-[var(--foreground)]">Security & Session Status</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[var(--card-elevated)] border border-[var(--border)]">
              <span className="text-[var(--muted-foreground)] block text-[11px]">Authenticated User</span>
              <span className="font-bold text-[var(--foreground)] capitalize mt-0.5 block">{admin?.username || 'Owner'}</span>
            </div>

            <div className="p-3 rounded-xl bg-[var(--card-elevated)] border border-[var(--border)]">
              <span className="text-[var(--muted-foreground)] block text-[11px]">Administrative Role</span>
              <span className="font-bold text-teal-500 uppercase mt-0.5 block">{admin?.role || 'Owner'}</span>
            </div>

            <div className="p-3 rounded-xl bg-[var(--card-elevated)] border border-[var(--border)]">
              <span className="text-[var(--muted-foreground)] block text-[11px]">Token Format</span>
              <span className="font-mono text-[11px] text-indigo-500 mt-0.5 block">JWT (HS256 Bearer)</span>
            </div>

            <div className="p-3 rounded-xl bg-[var(--card-elevated)] border border-[var(--border)]">
              <span className="text-[var(--muted-foreground)] block text-[11px]">Database Engine</span>
              <span className="font-bold text-[var(--foreground)] mt-0.5 block">SQLite 3 (Phase 4 Verified)</span>
            </div>
          </div>
        </div>

        {/* Change Admin Password */}
        <div className="admin-card p-4 sm:p-5 space-y-4 lg:col-span-2">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--border)]">
            <Lock className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-[var(--foreground)]">Change Administrator Password</h3>
          </div>

          <p className="text-xs text-[var(--muted-foreground)]">
            Update your administrative password. Changing your password securely invalidates active sessions on other devices.
          </p>

          <form onSubmit={handlePasswordChange} className="max-w-xl space-y-3.5 text-xs">
            {pwdError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pwdError}</span>
              </div>
            )}

            {pwdSuccess && (
              <div className="p-3 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{pwdSuccess}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-[var(--muted-foreground)] mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-3 py-2 rounded-lg bg-[var(--card-elevated)] border border-[var(--border)] text-[var(--foreground)] focus:outline-hidden focus:border-indigo-500 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[var(--muted-foreground)] mb-1">
                  New Password (min 8 characters)
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--card-elevated)] border border-[var(--border)] text-[var(--foreground)] focus:outline-hidden focus:border-indigo-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[var(--muted-foreground)] mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--card-elevated)] border border-[var(--border)] text-[var(--foreground)] focus:outline-hidden focus:border-indigo-500 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdatingPwd}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition flex items-center gap-2 text-xs disabled:opacity-50"
            >
              {isUpdatingPwd ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
