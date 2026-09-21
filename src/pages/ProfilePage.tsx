import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Globe,
  Languages,
  Shield,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  Save,
  LogOut,
  Sparkles,
  PhoneCall,
  Clock,
  Compass,
  MessageSquare
} from 'lucide-react';
import { useAuth, SUPPORTED_LANGUAGES } from '../context/AuthContext';
import { TravellerType } from '../types';

interface ProfilePageProps {
  onOpenEmergency?: () => void;
  onNavigateHome?: () => void;
}

const TRAVELLER_TYPES: TravellerType[] = [
  'Solo Traveller',
  'Family',
  'Couple',
  'Group',
  'Business'
];

const EMERGENCY_RELATIONSHIPS = [
  'Family / Next of Kin',
  'Spouse / Partner',
  'Parent / Guardian',
  'Sibling',
  'Close Friend',
  'Tour Guide / Local Host',
  'Embassy / Consular Liaison',
  'Colleague / Travelling Companion'
];

export const ProfilePage: React.FC<ProfilePageProps> = ({ onOpenEmergency, onNavigateHome }) => {
  const { user, updateProfile, logout } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    country: user?.country || '',
    preferredLanguage: user?.preferredLanguage || 'English',
    travellerType: (user?.travellerType as TravellerType) || 'Solo Traveller',
    emergencyContactName: user?.emergencyContactName || '',
    emergencyContactPhone: user?.emergencyContactPhone || '',
    emergencyContactRelation: user?.emergencyContactRelation || 'Family / Next of Kin'
  });

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  // Synchronize when auth user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        country: user.country || '',
        preferredLanguage: user.preferredLanguage || 'English',
        travellerType: (user.travellerType as TravellerType) || 'Solo Traveller',
        emergencyContactName: user.emergencyContactName || '',
        emergencyContactPhone: user.emergencyContactPhone || '',
        emergencyContactRelation: user.emergencyContactRelation || 'Family / Next of Kin'
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    setIsSessionExpired(false);

    // Validation
    const trimmedName = formData.name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage('Full name must be at least 2 characters long.');
      return;
    }

    const trimmedPhone = formData.phone.trim();
    if (trimmedPhone && !/^[+0-9\s\-()]{7,20}$/.test(trimmedPhone)) {
      setErrorMessage('Please enter a valid mobile number format (digits and optional country code).');
      return;
    }

    const trimmedCountry = formData.country.trim();
    if (!trimmedCountry) {
      setErrorMessage('Please specify your Country / State of origin.');
      return;
    }

    const trimmedEPhone = formData.emergencyContactPhone.trim();
    if (trimmedEPhone && !/^[+0-9\s\-()]{7,20}$/.test(trimmedEPhone)) {
      setErrorMessage('Emergency contact number must be a valid phone number (digits and optional country code).');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        name: trimmedName,
        phone: trimmedPhone,
        country: trimmedCountry,
        preferredLanguage: formData.preferredLanguage,
        travellerType: formData.travellerType,
        emergencyContactName: formData.emergencyContactName.trim(),
        emergencyContactPhone: trimmedEPhone,
        emergencyContactRelation: formData.emergencyContactRelation.trim()
      });
      setSuccessMessage('Tourist profile updated successfully! All safety credentials saved.');
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err: any) {
      const msg = err.message || 'Failed to update profile.';
      setErrorMessage(msg);
      if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('session') || msg.toLowerCase().includes('unauthorized')) {
        setIsSessionExpired(true);
      }
    } finally {
      setSaving(false);
    }
  };

  const cleanEmergencyPhone = formData.emergencyContactPhone.replace(/[^0-9+]/g, '');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-8 translate-y-8">
          <Shield className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-2xl font-black shadow-inner">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'T'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{user?.name || 'Tourist Profile'}</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified Tourist
                </span>
              </div>
              <p className="text-xs sm:text-sm text-blue-200 mt-1">
                {user?.email} • Account ID: <span className="font-mono">{user?.id}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenEmergency && (
              <button
                type="button"
                onClick={onOpenEmergency}
                className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-200 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Quick SOS</span>
              </button>
            )}
            <button
              type="button"
              onClick={logout}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Session Expired Notice */}
      {isSessionExpired && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Your session has expired. Please sign in again to protect your account.</span>
          </div>
          <button
            type="button"
            onClick={logout}
            className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors"
          >
            Sign In Again
          </button>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && !isSessionExpired && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Main Profile Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Personal & Travel Details */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              Personal & Travel Credentials
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              These details are used by tourist police, emergency responders, and verified booking desks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Alex Johnson"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden transition-all"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Mobile Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +1 (555) 019-2834 or +91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Can also be used as your login credential.</p>
            </div>

            {/* Country / State */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Country / State of Origin *
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="e.g. United Kingdom, California US, Maharashtra IN"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden transition-all"
                />
              </div>
            </div>

            {/* Preferred Language */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Preferred Language
              </label>
              <div className="relative">
                <Languages className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={formData.preferredLanguage}
                  onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden transition-all bg-white"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Audio guidance and AI translations adapt to this language.</p>
            </div>

            {/* Traveller Type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Traveller Type
              </label>
              <div className="relative">
                <Compass className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={formData.travellerType}
                  onChange={(e) => setFormData({ ...formData, travellerType: e.target.value as TravellerType })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden transition-all bg-white"
                >
                  {TRAVELLER_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Account Email (Read Only) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Registered Email (Verified)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 text-sm cursor-not-allowed"
              />
              <p className="text-[11px] text-slate-400 mt-1">Secured via bcrypt &amp; signed JWT authentication.</p>
            </div>
          </div>
        </div>

        {/* Section 2: Emergency Contact & Safety Network */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-rose-600" />
                Emergency Contact &amp; Next of Kin
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically notified if you activate emergency SOS or during safety alerts.
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
              National Helpline: 1363 / 112
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {/* Emergency Contact Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Contact Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  placeholder="e.g. Sarah Johnson"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-hidden transition-all"
                />
              </div>
            </div>

            {/* Emergency Contact Phone */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Emergency Phone / WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                  placeholder="e.g. +1 (555) 234-5678"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-hidden transition-all"
                />
              </div>
            </div>

            {/* Relationship */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Relationship
              </label>
              <select
                value={formData.emergencyContactRelation}
                onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-hidden transition-all bg-white"
              >
                {EMERGENCY_RELATIONSHIPS.map((rel) => (
                  <option key={rel} value={rel}>
                    {rel}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Emergency Quick Test Card if phone is available */}
          {cleanEmergencyPhone && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">
                    Active Emergency Link: {formData.emergencyContactName || 'Designated Contact'} ({formData.emergencyContactRelation})
                  </p>
                  <p className="text-slate-500">{formData.emergencyContactPhone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${cleanEmergencyPhone}`}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Test Call</span>
                </a>
                <a
                  href={`https://wa.me/${cleanEmergencyPhone.replace('+', '')}?text=Hello,%20this%20is%20a%20test%20message%20from%20my%20TravelShield%20India%20Tourist%20Safety%20profile.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Link</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>
              Profile registered: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active session'}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {onNavigateHome && (
              <button
                type="button"
                onClick={onNavigateHome}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all"
              >
                Back to Home
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'SAVE TOURIST PROFILE'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
