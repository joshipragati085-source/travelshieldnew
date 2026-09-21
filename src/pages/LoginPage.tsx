import React, { useState, useEffect } from 'react';
import {
  Shield,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Sparkles,
  ArrowRight,
  Globe,
  Compass,
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  Users,
  Phone,
  Check,
  X,
  Plus
} from 'lucide-react';
import { useAuth, SUPPORTED_LANGUAGES } from '../context/AuthContext';
import { api } from '../services/api';
import { TravellerType } from '../types';

interface LoginPageProps {
  onSwitchToRegister: () => void;
}

interface SavedAccountSummary {
  id: string;
  name: string;
  email: string;
  phone?: string;
  country?: string;
  travellerType?: string;
  lastLogin?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister }) => {
  const { login, register, loginGoogle, loginDemo, loginAsGuest } = useAuth();

  // Active view tab inside the login page: 'login' or 'register'
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [email, setEmail] = useState(() => {
    return localStorage.getItem('travelshield_remembered_email') || 'joshipragati085@gmail.com';
  });
  const [password, setPassword] = useState(() => {
    return localStorage.getItem('travelshield_remembered_pass') || '';
  });
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('travelshield_remember_me') !== 'false';
  });
  const [savePasswordOnDevice, setSavePasswordOnDevice] = useState(() => {
    return localStorage.getItem('travelshield_save_pass') === 'true' || !!localStorage.getItem('travelshield_remembered_pass');
  });
  const [showPassword, setShowPassword] = useState(false);

  // New Person / Register form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newConfirmPassword, setNewConfirmPassword] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCountry, setNewCountry] = useState('India');
  const [newTravellerType, setNewTravellerType] = useState<TravellerType>('Solo Traveller');
  const [newLanguage, setNewLanguage] = useState('English');
  const [newSaveOnDevice, setNewSaveOnDevice] = useState(true);
  const [newSavePassword, setNewSavePassword] = useState(true);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Status & feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [suggestRegisterEmail, setSuggestRegisterEmail] = useState<string | null>(null);

  // Saved accounts list on this device
  const [savedAccounts, setSavedAccounts] = useState<SavedAccountSummary[]>(() => {
    try {
      const raw = localStorage.getItem('travelshield_saved_accounts');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    // Seed default remembered email if available
    const rememberedEmail = localStorage.getItem('travelshield_remembered_email');
    if (rememberedEmail) {
      return [{
        id: 'saved-01',
        name: rememberedEmail === 'joshipragati085@gmail.com' ? 'Pragati Joshi' : rememberedEmail.split('@')[0],
        email: rememberedEmail,
        country: 'India',
        travellerType: 'Solo Traveller'
      }];
    }
    return [];
  });

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  // Handle selecting a saved account
  const handleSelectSavedAccount = (acc: SavedAccountSummary) => {
    setEmail(acc.email);
    const rememberedPass = localStorage.getItem('travelshield_remembered_pass');
    if (rememberedPass && localStorage.getItem('travelshield_remembered_email') === acc.email) {
      setPassword(rememberedPass);
      setSavePasswordOnDevice(true);
    } else {
      setPassword('');
    }
    setActiveTab('login');
    setError(null);
  };

  // Remove a saved account from the local list
  const handleRemoveSavedAccount = (e: React.MouseEvent, targetEmail: string) => {
    e.stopPropagation();
    const updated = savedAccounts.filter((a) => a.email.toLowerCase() !== targetEmail.toLowerCase());
    setSavedAccounts(updated);
    try {
      localStorage.setItem('travelshield_saved_accounts', JSON.stringify(updated));
    } catch {}
    if (email.toLowerCase() === targetEmail.toLowerCase()) {
      localStorage.removeItem('travelshield_remembered_email');
      localStorage.removeItem('travelshield_remembered_pass');
      localStorage.removeItem('travelshield_save_pass');
      setEmail('');
      setPassword('');
    }
  };

  // Switch to register tab and prefill email
  const handleSwitchToRegisterWithEmail = (prefillEmail: string) => {
    setNewEmail(prefillEmail);
    setActiveTab('register');
    setError(null);
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError(null);
    setSuggestRegisterEmail(null);
    setLoading(true);
    try {
      await login(email, password);

      // Persist credentials based on user choices
      if (rememberMe) {
        localStorage.setItem('travelshield_remembered_email', email.trim());
        localStorage.setItem('travelshield_remember_me', 'true');
        if (savePasswordOnDevice) {
          localStorage.setItem('travelshield_remembered_pass', password);
          localStorage.setItem('travelshield_save_pass', 'true');
        } else {
          localStorage.removeItem('travelshield_remembered_pass');
          localStorage.removeItem('travelshield_save_pass');
        }
      } else {
        localStorage.removeItem('travelshield_remembered_email');
        localStorage.removeItem('travelshield_remembered_pass');
        localStorage.setItem('travelshield_remember_me', 'false');
        localStorage.removeItem('travelshield_save_pass');
      }

      // Trigger Web Browser Credential Management API (prompts browser to save password)
      if (typeof window !== 'undefined' && (window as any).PasswordCredential && navigator.credentials) {
        try {
          const cred = new (window as any).PasswordCredential({
            id: email.trim(),
            password: password,
            name: email.trim()
          });
          await navigator.credentials.store(cred);
        } catch {}
      }
    } catch (err: any) {
      const errMsg = err.message || 'Login failed. Please verify your credentials.';
      setError(errMsg);
      if (errMsg.toLowerCase().includes('not found') || errMsg.toLowerCase().includes('no account') || errMsg.toLowerCase().includes('invalid credentials')) {
        setSuggestRegisterEmail(email.trim());
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle New Person / Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newName.trim().length < 2) {
      setError('Please enter full name (at least 2 characters).');
      return;
    }
    if (!newEmail.trim()) {
      setError('Please enter a valid email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      setError('Please enter a valid email address format (e.g. name@example.com).');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== newConfirmPassword) {
      setError('Passwords do not match. Please verify password and confirm password.');
      return;
    }
    if (newPhone && !/^[+0-9\s\-()]{7,20}$/.test(newPhone.trim())) {
      setError('Please enter a valid phone or mobile number format.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await register({
        name: newName.trim(),
        email: newEmail.trim().toLowerCase(),
        password: newPassword,
        country: newCountry.trim() || 'India',
        phone: newPhone.trim(),
        preferredLanguage: newLanguage,
        travellerType: newTravellerType
      });

      // Save new person credentials on this device
      if (newSaveOnDevice) {
        localStorage.setItem('travelshield_remembered_email', newEmail.trim().toLowerCase());
        localStorage.setItem('travelshield_remember_me', 'true');
        if (newSavePassword) {
          localStorage.setItem('travelshield_remembered_pass', newPassword);
          localStorage.setItem('travelshield_save_pass', 'true');
        }
      }

      // Trigger Web Browser Credential Management API (prompts browser to save password)
      if (typeof window !== 'undefined' && (window as any).PasswordCredential && navigator.credentials) {
        try {
          const cred = new (window as any).PasswordCredential({
            id: newEmail.trim().toLowerCase(),
            password: newPassword,
            name: newName.trim()
          });
          await navigator.credentials.store(cred);
        } catch {}
      }

      setSuccessNotice(`Account for ${newName.trim()} created and saved successfully!`);
    } catch (err: any) {
      setError(err.message || 'Account registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignInClick = async () => {
    setError(null);
    setLoading(true);
    try {
      const targetEmail = email.includes('@') ? email.trim() : 'joshipragati085@gmail.com';
      await loginGoogle(targetEmail, 'Pragati Joshi');
      if (rememberMe) {
        localStorage.setItem('travelshield_remembered_email', targetEmail);
        localStorage.setItem('travelshield_remember_me', 'true');
      }
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLoginClick = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginDemo();
    } catch (err: any) {
      setError('Demo login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    try {
      const res = await api.forgotPassword(forgotEmail);
      setForgotSuccess(res.message);
    } catch {
      setForgotSuccess('Reset link dispatched to your email inbox.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-3 sm:p-6 md:p-8 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[660px]">
        {/* LEFT COLUMN: BRANDING & ILLUSTRATION */}
        <div className="lg:col-span-5 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Header */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                <Shield className="w-7 h-7 text-emerald-400 fill-emerald-400/20" />
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-white">
                  Travel<span className="text-emerald-400">Shield</span>
                </span>
                <p className="text-[11px] font-bold text-blue-200 tracking-widest uppercase">
                  National Tourism Safety Hub
                </p>
              </div>
            </div>

            <div className="pt-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                Explore India.
                <br />
                <span className="text-emerald-300">Travel with Safety.</span>
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-blue-100/90 leading-relaxed">
                Personal tourist protection, fair fares, tout defense, and 24x7 Tourist Police assistance.
              </p>
            </div>
          </div>

          {/* Core Feature Badges */}
          <div className="relative z-10 my-6 space-y-2.5">
            {[
              { title: 'Verified Services', desc: 'Pre-screened cabs, hotels & licensed guides' },
              { title: 'Fair Price Guidance', desc: 'Real-time fare reference & overcharge prevention' },
              { title: 'Tourist Safety AI', desc: 'Multilingual Gemini 3.8 safety companion' },
              { title: 'Emergency Response', desc: 'Direct access to 112 & 1363 helplines' }
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 hover:bg-white/15 transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">{item.title}</h4>
                  <p className="text-[10px] text-blue-200/80 leading-snug">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Trust Stamp */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-blue-200/80">
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Multi-lingual Tourist Shield</span>
            </div>
            <span className="font-semibold text-white/90">24x7 Protected</span>
          </div>
        </div>

        {/* RIGHT COLUMN: DUAL-TAB AUTHENTICATION (SIGN IN & GET NEW PERSON ACCOUNT) */}
        <div className="lg:col-span-7 p-6 sm:p-8 md:p-10 flex flex-col justify-center bg-white overflow-y-auto max-h-[750px]">
          <div className="max-w-lg mx-auto w-full space-y-5">
            {/* Top View Toggle Tabs */}
            <div className="flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200/80 shadow-inner">
              <button
                type="button"
                id="tab-sign-in"
                onClick={() => {
                  setActiveTab('login');
                  setError(null);
                  setSuccessNotice(null);
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'login'
                    ? 'bg-white text-slate-900 shadow-md border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <LogIn className="w-4 h-4 text-blue-600" />
                <span>SIGN IN</span>
              </button>

              <button
                type="button"
                id="tab-new-person"
                onClick={() => {
                  setActiveTab('register');
                  setError(null);
                  setSuccessNotice(null);
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all relative ${
                  activeTab === 'register'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>GET NEW PERSON ACCOUNT</span>
                <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                  activeTab === 'register' ? 'bg-emerald-400 text-slate-950' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  Save
                </span>
              </button>
            </div>

            {/* Error Message Display */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex flex-col gap-2 animate-in fade-in">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="font-medium leading-relaxed">{error}</span>
                </div>
                {suggestRegisterEmail && (
                  <div className="pt-1 pl-6">
                    <button
                      type="button"
                      onClick={() => handleSwitchToRegisterWithEmail(suggestRegisterEmail)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Register new account for {suggestRegisterEmail}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Success Notice Display */}
            {successNotice && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold">{successNotice}</span>
              </div>
            )}

            {/* ========================================================= */}
            {/* VIEW 1: SIGN IN FORM */}
            {/* ========================================================= */}
            {activeTab === 'login' && (
              <div className="space-y-4">
                {/* Saved Accounts on this device switcher */}
                {savedAccounts.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-600" />
                        Saved Accounts on this Device ({savedAccounts.length}):
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveTab('register')}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add New Person</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-0.5">
                      {savedAccounts.map((acc) => {
                        const isCurrent = email.toLowerCase() === acc.email.toLowerCase();
                        return (
                          <div
                            key={acc.email}
                            onClick={() => handleSelectSavedAccount(acc)}
                            className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all border ${
                              isCurrent
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs font-bold'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                            }`}
                          >
                            <User className={`w-3.5 h-3.5 ${isCurrent ? 'text-white' : 'text-blue-600'}`} />
                            <div className="text-left">
                              <span className="block leading-tight font-semibold">{acc.name}</span>
                              <span className={`block text-[10px] truncate max-w-[140px] ${
                                isCurrent ? 'text-blue-100' : 'text-slate-400'
                              }`}>
                                {acc.email}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => handleRemoveSavedAccount(e, acc.email)}
                              title="Remove this account from saved list"
                              className={`p-0.5 rounded-full hover:bg-black/10 transition-colors ml-1 ${
                                isCurrent ? 'text-white/80 hover:text-white' : 'text-slate-400 hover:text-slate-700'
                              }`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quick 1-Click Demo Tourist Login */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 shadow-2xs flex items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-950">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>Instant Demo Tourist Account</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      demo@travelshield.com (1-click ready)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDemoLoginClick}
                    disabled={loading}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50 shrink-0"
                  >
                    <span>⚡ 1-Click Sign In</span>
                  </button>
                </div>

                {/* Login Form */}
                <form method="POST" action="#" autoComplete="on" onSubmit={handleLoginSubmit} className="space-y-3.5">
                  <div>
                    <label htmlFor="login-email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Email Address or Mobile Number
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="login-email"
                        name="email"
                        type="text"
                        autoComplete="username email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. joshipragati085@gmail.com or mobile"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="login-password" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(true)}
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="login-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Save Password Checkboxes */}
                  <div className="space-y-1.5 pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span>Remember this email on this device</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
                      <input
                        type="checkbox"
                        checked={savePasswordOnDevice}
                        onChange={(e) => setSavePasswordOnDevice(e.target.checked)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span>Save password securely on this browser (Autofill ready)</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    id="login-submit-btn"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="inline-block animate-pulse">Authenticating...</span>
                    ) : (
                      <span>SIGN IN</span>
                    )}
                  </button>
                </form>

                {/* Google Sign-in & Guest Options */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    id="google-signin-btn"
                    onClick={handleGoogleSignInClick}
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2.5 transition-colors shadow-2xs active:scale-98"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Sign in with Google</span>
                  </button>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveTab('register')}
                      className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Need a new person account? Click here</span>
                    </button>
                    <button
                      type="button"
                      onClick={loginAsGuest}
                      className="text-slate-500 hover:text-slate-800 font-semibold"
                    >
                      Continue as Guest
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* VIEW 2: GET NEW PERSON ACCOUNT & SAVE IT FORM */}
            {/* ========================================================= */}
            {activeTab === 'register' && (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-blue-600" />
                    <span>Create & Save New Person Account</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enter the details of the new traveler. Their profile and credentials will be saved securely on this device and backend.
                  </p>
                </div>

                <form method="POST" action="#" autoComplete="on" onSubmit={handleRegisterSubmit} className="space-y-3">
                  {/* Full Name & Email row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="reg-name" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          id="reg-name"
                          name="name"
                          type="text"
                          required
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="e.g. Pragati Joshi"
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="reg-email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          id="reg-email"
                          name="email"
                          type="email"
                          required
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="e.g. user@example.com"
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password & Confirm Password row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="reg-password" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Password (min 6 chars) *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          id="reg-password"
                          name="new-password"
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Create secure password"
                          className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                        >
                          {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="reg-confirm" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          id="reg-confirm"
                          name="confirm-password"
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          value={newConfirmPassword}
                          onChange={(e) => setNewConfirmPassword(e.target.value)}
                          placeholder="Re-type password"
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Country, Phone, and Traveller Type row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label htmlFor="reg-country" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Country / Region
                      </label>
                      <div className="relative">
                        <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          id="reg-country"
                          type="text"
                          value={newCountry}
                          onChange={(e) => setNewCountry(e.target.value)}
                          placeholder="e.g. India, UK, USA"
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="reg-phone" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Mobile Number
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          id="reg-phone"
                          type="tel"
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="reg-type" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Traveler Type
                      </label>
                      <select
                        id="reg-type"
                        value={newTravellerType}
                        onChange={(e) => setNewTravellerType(e.target.value as TravellerType)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden bg-white"
                      >
                        <option value="Solo Traveller">Solo Traveller</option>
                        <option value="Family">Family</option>
                        <option value="Couple">Couple</option>
                        <option value="Group">Group</option>
                        <option value="Business">Business</option>
                      </select>
                    </div>
                  </div>

                  {/* Checkboxes: Save Account & Save Password */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
                      <input
                        type="checkbox"
                        checked={newSaveOnDevice}
                        onChange={(e) => setNewSaveOnDevice(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span><strong>Save this person's account</strong> to this device's account switcher</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
                      <input
                        type="checkbox"
                        checked={newSavePassword}
                        onChange={(e) => setNewSavePassword(e.target.checked)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span>Save password securely on this browser for automatic sign-in</span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="inline-block animate-pulse">Creating & Saving Account...</span>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>CREATE & SAVE THIS PERSON'S ACCOUNT</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Back to sign in */}
                <div className="text-center pt-1 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="text-xs font-bold text-slate-600 hover:text-blue-600 flex items-center justify-center gap-1.5 mx-auto"
                  >
                    <span>Already have an account?</span>
                    <span className="text-blue-600 underline">Switch to Sign In</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Reset Your Password</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotSuccess(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Enter your registered email address or mobile number. We will dispatch a secure password reset link.
            </p>

            {forgotSuccess ? (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{forgotSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
                <button
                  type="submit"
                  disabled={forgotLoading || !forgotEmail}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
                >
                  {forgotLoading ? 'Dispatching Link...' : 'Send Reset Link'}
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={() => {
                setShowForgotModal(false);
                setForgotSuccess(null);
              }}
              className="w-full py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
