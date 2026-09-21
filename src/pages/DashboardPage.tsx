import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  DollarSign,
  Search,
  Sparkles,
  Languages,
  AlertCircle,
  FileText,
  Compass,
  MapPin,
  ArrowRight,
  Shield,
  PhoneCall,
  Clock,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Navigation,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TrustBadge } from '../components/TrustBadge';
import { Provider, SafetyAlert } from '../types';
import { api } from '../services/api';

interface DashboardPageProps {
  setActiveTab: (tab: string) => void;
  onOpenEmergency: () => void;
  onSelectProvider: (providerId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  setActiveTab,
  onOpenEmergency,
  onSelectProvider
}) => {
  const { user } = useAuth();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [quickService, setQuickService] = useState('Taxi');
  const [quickFrom, setQuickFrom] = useState('Delhi Airport');
  const [quickTo, setQuickTo] = useState('Connaught Place');
  const [quickPrice, setQuickPrice] = useState('2500');

  useEffect(() => {
    api.getProviders({ verified: true }).then(data => setProviders(data.slice(0, 3))).catch(() => {});
    api.getSafetyAlerts().then(setAlerts).catch(() => {});
  }, []);

  const handleQuickCheck = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to price checker with state
    localStorage.setItem(
      'travelshield_prefill_price',
      JSON.stringify({
        serviceType: quickService,
        source: quickFrom,
        destination: quickTo,
        quotedPrice: quickPrice
      })
    );
    setActiveTab('price-checker');
  };

  const actionCards = [
    {
      id: 'price-checker',
      title: 'CHECK FAIR PRICE',
      subtitle: 'Is this price reasonable? Check taxi, auto & guide rates.',
      icon: DollarSign,
      color: 'from-blue-600 to-indigo-600',
      badge: 'Smart Fare Check',
      badgeColor: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'services',
      title: 'FIND TRUSTED SERVICE',
      subtitle: 'Find verified local providers with certified trust scores.',
      icon: ShieldCheck,
      color: 'from-emerald-600 to-teal-700',
      badge: 'Certified Trust',
      badgeColor: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'ai-assistant',
      title: 'ASK TRAVELSHIELD AI',
      subtitle: 'Ask anything about your journey, safety, or scams.',
      icon: Sparkles,
      color: 'from-indigo-600 to-violet-700',
      badge: '24/7 AI Guide',
      badgeColor: 'bg-indigo-100 text-indigo-800'
    },
    {
      id: 'translate',
      title: 'TRANSLATE & EXPLAIN',
      subtitle: 'Understand local language and slang with cultural context.',
      icon: Languages,
      color: 'from-amber-600 to-orange-700',
      badge: 'Instant Translation',
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'safety',
      title: 'SAFETY CENTER',
      subtitle: 'Get real-time safety guidance and solo traveller tips.',
      icon: AlertCircle,
      color: 'from-sky-600 to-blue-700',
      badge: 'Active Protection',
      badgeColor: 'bg-sky-100 text-sky-800'
    },
    {
      id: 'complaints',
      title: 'REPORT A PROBLEM',
      subtitle: 'Report overcharging, fraud or safety incidents instantly.',
      icon: FileText,
      color: 'from-rose-600 to-red-700',
      badge: 'Fast Incident Resolution',
      badgeColor: 'bg-rose-100 text-rose-800'
    }
  ];

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* Top Banner / Welcome Ribbon */}
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-950 p-6 sm:p-8 md:p-10 text-white shadow-xl overflow-hidden border border-blue-800/40">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-16 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>🟢 YOU ARE PROTECTED</span>
              <span className="text-white/60">• Active Zone: Central Delhi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
              Welcome back 👋 {user?.name || 'Explorer'}
            </h1>
            <p className="text-sm sm:text-base text-blue-100 font-normal leading-relaxed">
              How can we help you stay safe, verify prices, and navigate India today?
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('profile')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
            >
              <User className="w-4 h-4 text-blue-300" />
              <span>Tourist Profile</span>
            </button>
            <button
              onClick={() => setActiveTab('explore')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
            >
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span>Explore Safety Map</span>
            </button>
            <button
              onClick={onOpenEmergency}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold transition-all flex items-center gap-2 shadow-md active:scale-98 animate-pulse"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Emergency 112 / 1363</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Main Action Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Core Safety & Trust Tools
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Select a service to begin
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {actionCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => setActiveTab(card.id)}
                className="group relative text-left p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400/60 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${card.badgeColor}`}
                  >
                    {card.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center justify-between">
                    <span>{card.title}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    {card.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Fair Price Checker Bar */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-blue-500/20 text-blue-400">
                <DollarSign className="w-4 h-4" />
              </span>
              <h3 className="text-base font-extrabold tracking-tight">Quick Fair Price Checker</h3>
            </div>
            <p className="text-xs text-slate-300">
              Instant verification against official Delhi & Indian benchmark rates.
            </p>
          </div>

          <form onSubmit={handleQuickCheck} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 flex-1 max-w-3xl">
            <select
              value={quickService}
              onChange={(e) => setQuickService(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-hidden focus:ring-1 focus:ring-blue-400"
            >
              <option value="Taxi">Taxi (AC Sedan)</option>
              <option value="Auto-Rickshaw">Auto-Rickshaw</option>
              <option value="Tour Guide">Tour Guide (Half Day)</option>
              <option value="Boat / Safari">Boat / Activity</option>
            </select>

            <input
              type="text"
              value={quickFrom}
              onChange={(e) => setQuickFrom(e.target.value)}
              placeholder="From (e.g. Delhi Airport)"
              className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-blue-400"
            />

            <input
              type="text"
              value={quickTo}
              onChange={(e) => setQuickTo(e.target.value)}
              placeholder="To (e.g. Connaught Place)"
              className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-blue-400"
            />

            <div className="flex gap-2">
              <input
                type="number"
                value={quickPrice}
                onChange={(e) => setQuickPrice(e.target.value)}
                placeholder="₹ Quoted"
                className="w-24 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-blue-400"
              />
              <button
                type="submit"
                className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1 active:scale-95"
              >
                <span>Check</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Two Column Section: Top Verified Providers & Live Safety Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Featured Verified Providers */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Top Verified Providers
              </h3>
              <p className="text-xs text-slate-500">
                Ministry licensed with verified trust scores
              </p>
            </div>
            <button
              onClick={() => setActiveTab('services')}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {providers.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200"
                  />
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                        {p.category}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {p.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                      <span>{p.location}</span>
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <TrustBadge score={p.trustScore} size="sm" />
                  <button
                    onClick={() => onSelectProvider(p.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live Safety Alerts */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Live Tourist Advisories
              </h3>
              <p className="text-xs text-slate-500">
                Official Tourist Police & Community Safety Feed
              </p>
            </div>
            <button
              onClick={() => setActiveTab('safety')}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Safety Hub
            </button>
          </div>

          <div className="space-y-3">
            {alerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                      alert.severity === 'High'
                        ? 'bg-rose-100 text-rose-800'
                        : alert.severity === 'Medium'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {alert.severity} Advisory
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {alert.date}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 leading-snug">
                  {alert.title}
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                  {alert.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
