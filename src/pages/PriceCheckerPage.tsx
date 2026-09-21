import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  FileText,
  Navigation,
  Info,
  RotateCcw,
  MapPin,
  Clock,
  Car,
  Bookmark,
  ChevronDown,
  ChevronUp,
  BookmarkCheck,
  ExternalLink,
  BookOpen,
  Scale,
  Train,
  Smartphone,
  Check,
  HelpCircle,
  History,
  Trash2
} from 'lucide-react';
import { api } from '../services/api';
import { PriceCheckResult, CityFareRule, SavedFareCheck, TransportType, VehicleCategory } from '../types';

interface PriceCheckerPageProps {
  onFindAlternative: (category: string) => void;
  onAskAIWhy: (prompt: string) => void;
  onReportIssue: (prefillData: { providerName: string; category: string; location: string; amount: number }) => void;
}

const SUPPORTED_CITIES = [
  'Delhi',
  'Mumbai',
  'Jaipur',
  'Bengaluru',
  'Agra',
  'Goa',
  'Varanasi',
  'General / Other'
];

const TRANSPORT_TYPES: { id: TransportType; label: string; icon: string }[] = [
  { id: 'Taxi', label: 'Taxi / Cab', icon: '🚖' },
  { id: 'Auto-Rickshaw', label: 'Auto-Rickshaw (3W)', icon: '🛺' },
  { id: 'Metro', label: 'Metro Rail', icon: '🚇' },
  { id: 'Tour Guide', label: 'Tour Guide', icon: '🏛️' },
  { id: 'Boat / Safari', label: 'Boat / Safari', icon: '⛵' }
];

const VEHICLE_CATEGORIES: Record<string, string[]> = {
  Taxi: ['Sedan (AC)', 'Hatchback (Non-AC)', 'SUV / Prime'],
  'Auto-Rickshaw': ['Auto-Rickshaw (3W)', 'Electric Auto'],
  'Tour Guide': ['Standard Coach', 'Sedan (AC)'],
  'Boat / Safari': ['Hand-rowed Ghat Boat', 'Motorized Safari']
};

export const PriceCheckerPage: React.FC<PriceCheckerPageProps> = ({
  onFindAlternative,
  onAskAIWhy,
  onReportIssue
}) => {
  // Input State
  const [city, setCity] = useState('Delhi');
  const [serviceType, setServiceType] = useState<string>('Taxi');
  const [vehicleType, setVehicleType] = useState<string>('Sedan (AC)');
  const [source, setSource] = useState('Delhi Airport (Terminal 3)');
  const [destination, setDestination] = useState('Connaught Place');
  const [quotedPrice, setQuotedPrice] = useState<number | string>(2500);
  const [distanceKm, setDistanceKm] = useState<number | string>('');
  const [travelTime, setTravelTime] = useState<string>('14:30');

  // UI Flow States
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PriceCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'checker' | 'rules' | 'saved'>('checker');

  // Rules & Saved History
  const [fareRules, setFareRules] = useState<CityFareRule[]>([]);
  const [savedChecks, setSavedChecks] = useState<SavedFareCheck[]>([]);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);
  const [showMathDetails, setShowMathDetails] = useState(true);

  // Load initial fare rules and saved history
  useEffect(() => {
    loadFareRules();
    loadSavedHistory();
  }, []);

  const loadFareRules = async () => {
    try {
      const rules = await api.getFareRules();
      setFareRules(rules);
    } catch {
      // offline fallback handled in api.ts
    }
  };

  const loadSavedHistory = async () => {
    try {
      const history = await api.getSavedFareChecks();
      setSavedChecks(history);
    } catch {}
  };

  // Check if prefill was stored from Dashboard quick bar
  useEffect(() => {
    const saved = localStorage.getItem('travelshield_prefill_price');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.city) setCity(parsed.city);
        if (parsed.serviceType) setServiceType(parsed.serviceType);
        if (parsed.source) setSource(parsed.source);
        if (parsed.destination) setDestination(parsed.destination);
        if (parsed.quotedPrice) setQuotedPrice(Number(parsed.quotedPrice));
        localStorage.removeItem('travelshield_prefill_price');
        
        handleRunCheck({
          city: parsed.city || 'Delhi',
          serviceType: parsed.serviceType || 'Taxi',
          vehicleType: 'Sedan (AC)',
          source: parsed.source || 'Delhi Airport',
          destination: parsed.destination || 'Connaught Place',
          quotedPrice: Number(parsed.quotedPrice) || 2500
        });
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Update vehicle options when serviceType changes
  useEffect(() => {
    const availableVehicles = VEHICLE_CATEGORIES[serviceType] || ['Standard'];
    if (availableVehicles.length > 0 && !availableVehicles.includes(vehicleType as any)) {
      setVehicleType(availableVehicles[0]);
    }
  }, [serviceType]);

  const handleRunCheck = async (overrideParams?: {
    city?: string;
    serviceType?: string;
    vehicleType?: string;
    source?: string;
    destination?: string;
    quotedPrice?: number;
    distanceKm?: number;
    travelTime?: string;
  }) => {
    const c = overrideParams?.city || city;
    const sT = overrideParams?.serviceType || serviceType;
    const vT = overrideParams?.vehicleType || vehicleType;
    const src = overrideParams?.source || source;
    const dst = overrideParams?.destination || destination;
    const qP = overrideParams?.quotedPrice !== undefined ? overrideParams.quotedPrice : Number(quotedPrice);
    const dKm = overrideParams?.distanceKm !== undefined ? overrideParams.distanceKm : (distanceKm ? Number(distanceKm) : undefined);
    const tTime = overrideParams?.travelTime || travelTime;

    if (!src || !dst || !qP || isNaN(qP)) {
      setError('Please provide pickup location, destination, and a valid quoted price.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const data = await api.checkPrice(sT, src, dst, qP, {
        city: c,
        vehicleType: vT,
        distanceKm: dKm,
        travelTime: tTime
      });
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Unable to complete fare benchmark calculation. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRunCheck();
  };

  const handleSaveCheck = async () => {
    if (!result) return;
    try {
      const saved = await api.saveFareCheck({
        city,
        transportType: serviceType,
        pickup: source,
        destination,
        quotedPrice: Number(result.quotedPrice),
        estimatedMin: result.referenceMin,
        estimatedMax: result.referenceMax,
        status: result.status,
        distanceKm: result.distanceKm || (result.detailed?.computedDistanceKm || 0),
        notes: `Checked on ${new Date().toLocaleDateString()}`
      });
      setSavedChecks(prev => [saved, ...prev]);
      setSavedSuccessMsg('Fare check saved to your personal history.');
      setTimeout(() => setSavedSuccessMsg(null), 3500);
    } catch {
      setSavedSuccessMsg('Saved locally.');
      setTimeout(() => setSavedSuccessMsg(null), 3000);
    }
  };

  const handleDeleteSaved = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await api.deleteSavedFareCheck(id);
    setSavedChecks(prev => prev.filter(c => c.id !== id));
  };

  const presetDemos = [
    {
      label: 'Delhi Airport → Connaught Place (₹2,500 Taxi)',
      city: 'Delhi',
      serviceType: 'Taxi',
      vehicleType: 'Sedan (AC)',
      source: 'Delhi Airport (Terminal 3)',
      destination: 'Connaught Place',
      price: 2500,
      time: '15:00',
      badge: 'Overcharge Demo'
    },
    {
      label: 'Jaipur Station → Amer Fort (₹350 Auto)',
      city: 'Jaipur',
      serviceType: 'Auto-Rickshaw',
      vehicleType: 'Auto-Rickshaw (3W)',
      source: 'Jaipur Railway Station',
      destination: 'Amer Fort',
      price: 350,
      time: '11:00',
      badge: 'Fair Rate Demo'
    },
    {
      label: 'Mumbai Airport → Colaba Night (₹1,450 Cool Cab)',
      city: 'Mumbai',
      serviceType: 'Taxi',
      vehicleType: 'Sedan (AC)',
      source: 'Mumbai Airport (T2)',
      destination: 'Colaba / Gateway',
      price: 1450,
      time: '01:30',
      badge: 'Night Rate Demo'
    },
    {
      label: 'Bengaluru Airport → MG Road (₹2,800 Taxi)',
      city: 'Bengaluru',
      serviceType: 'Taxi',
      vehicleType: 'Sedan (AC)',
      source: 'Bengaluru Airport (KIA)',
      destination: 'MG Road / Brigade Road',
      price: 2800,
      time: '18:30',
      badge: 'High Quote Demo'
    }
  ];

  const applyPreset = (p: typeof presetDemos[0]) => {
    setCity(p.city);
    setServiceType(p.serviceType);
    setVehicleType(p.vehicleType);
    setSource(p.source);
    setDestination(p.destination);
    setQuotedPrice(p.price);
    setTravelTime(p.time);
    setDistanceKm('');
    handleRunCheck({
      city: p.city,
      serviceType: p.serviceType,
      vehicleType: p.vehicleType,
      source: p.source,
      destination: p.destination,
      quotedPrice: p.price,
      travelTime: p.time
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 font-sans">
      {/* Top Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30 backdrop-blur-xs">
              <Scale className="w-3.5 h-3.5" />
              <span>Independent Transport Fare Evaluation Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              TravelShield Fair Price Checker
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 max-w-2xl leading-relaxed">
              Transparently evaluate whether a quoted taxi, auto-rickshaw, or tourist transit fare is reasonable, elevated, or potentially overcharging. Grounded in state gazette tariffs and regional distance models.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 text-xs text-blue-100 max-w-xs space-y-1">
              <p className="font-bold text-amber-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                Ethical Advisory Notice
              </p>
              <p className="text-[11px] text-white/80 leading-snug">
                This engine provides an advisory benchmark. Higher fares are not claimed to be illegal by default; estimates help tourists negotiate with confidence.
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="relative z-10 flex items-center gap-2 mt-6 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('checker')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'checker'
                ? 'bg-white text-slate-900 shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Fare Evaluator</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'rules'
                ? 'bg-white text-slate-900 shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>City Fare Rules Library</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/40 text-blue-200">
              {fareRules.length || 8}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'saved'
                ? 'bg-white text-slate-900 shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit History</span>
            {savedChecks.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/40 text-emerald-200">
                {savedChecks.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {savedSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            {savedSuccessMsg}
          </span>
          <button
            onClick={() => setSavedSuccessMsg(null)}
            className="text-xs text-emerald-600 hover:text-emerald-800 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* VIEW: 1. Main Fare Evaluator */}
      {activeTab === 'checker' && (
        <div className="space-y-8">
          {/* Quick Demo Routes Preset Bar */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Quick Benchmark Presets
              </span>
              <span className="text-[11px] text-slate-400">Click any card to auto-simulate</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {presetDemos.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 text-left transition-all shadow-2xs group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-800">
                        {p.badge}
                      </span>
                      <span className="text-xs font-black text-slate-900">₹{p.price}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-blue-700">
                      {p.label}
                    </p>
                  </div>
                  <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>{p.city} • {p.serviceType}</span>
                    <span className="text-blue-600 font-bold group-hover:translate-x-0.5 transition-transform">Run →</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Core Interactive Layout: Form on Left, Output on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Input Form Column */}
            <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-5">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  Enter Journey Quotation
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure trip parameters to evaluate against official and calibrated benchmarks.
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* City Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    City / State
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden bg-white"
                  >
                    {SUPPORTED_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c} {c === 'Delhi' || c === 'Mumbai' || c === 'Bengaluru' || c === 'Jaipur' ? '(Official Gazette Tariffs)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Transport Type */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Transport Type
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {TRANSPORT_TYPES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setServiceType(t.id)}
                        className={`p-2.5 rounded-xl text-xs font-bold text-left transition-all border flex items-center gap-2 ${
                          serviceType === t.id
                            ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-base">{t.icon}</span>
                        <span className="truncate">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vehicle Category / Comfort Tier */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Vehicle Category / Comfort Tier
                  </label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden bg-white"
                  >
                    {(VEHICLE_CATEGORIES[serviceType] || ['Standard']).map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pickup Location */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Pickup Location
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      placeholder="e.g. Delhi Airport (Terminal 3)"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Destination */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Destination Location
                  </label>
                  <div className="relative">
                    <Navigation className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="e.g. Connaught Place"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Quoted Price */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Quoted Fare in Indian Rupees (₹)
                  </label>
                  <div className="relative">
                    <span className="text-slate-500 font-black absolute left-3.5 top-1/2 -translate-y-1/2">
                      ₹
                    </span>
                    <input
                      type="number"
                      required
                      min="1"
                      value={quotedPrice}
                      onChange={(e) => setQuotedPrice(e.target.value)}
                      placeholder="e.g. 2500"
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 text-base font-black text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Advanced Optional Details: Distance & Travel Time */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Distance (Optional km)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      value={distanceKm}
                      onChange={(e) => setDistanceKm(e.target.value)}
                      placeholder="Auto / enter km"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Travel Time
                    </label>
                    <input
                      type="time"
                      value={travelTime}
                      onChange={(e) => setTravelTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 mt-2 cursor-pointer"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>{loading ? 'Evaluating Tariff Calculation...' : 'EVALUATE FARE BENCHMARK'}</span>
                </button>
              </form>
            </div>

            {/* Results Column */}
            <div className="lg:col-span-7 flex flex-col justify-start">
              {result ? (
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md space-y-6 animate-in fade-in-50">
                  {/* Status Header Badge with Clear Color Logic */}
                  <div
                    className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      result.status === 'POSSIBLE OVERCHARGING'
                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                        : result.status === 'HIGH'
                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : result.status === 'LOW'
                        ? 'bg-sky-50 border-sky-200 text-sky-900'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      {result.status === 'POSSIBLE OVERCHARGING' ? (
                        <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-xs shrink-0">
                          <AlertTriangle className="w-7 h-7 animate-pulse" />
                        </div>
                      ) : result.status === 'HIGH' ? (
                        <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-xs shrink-0">
                          <AlertCircle className="w-7 h-7" />
                        </div>
                      ) : result.status === 'LOW' ? (
                        <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-xs shrink-0">
                          <Info className="w-7 h-7" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                          <CheckCircle2 className="w-7 h-7" />
                        </div>
                      )}

                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider opacity-75 block">
                          Tariff Classification
                        </span>
                        <h3 className="text-lg sm:text-xl font-black tracking-tight">
                          {result.status === 'POSSIBLE OVERCHARGING'
                            ? 'Possible Overcharging'
                            : result.status === 'HIGH'
                            ? 'Higher Than Expected'
                            : result.status === 'LOW'
                            ? 'Unusually Low Quote'
                            : 'Fair Rate Benchmark'}
                        </h3>
                        <p className="text-xs opacity-80 mt-0.5">
                          {result.status === 'FAIR'
                            ? 'Quote matches prevailing standard tariff limits.'
                            : result.status === 'HIGH'
                            ? 'Higher than average; examine waiting, luggage, or tolls.'
                            : result.status === 'POSSIBLE OVERCHARGING'
                            ? 'Substantially above estimated regulated parameters.'
                            : 'Check for unplanned detours or hidden mid-route fees.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                      <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-white shadow-2xs border border-current">
                        {result.detailed?.officialData.hasOfficialTariff ? '🏛️ Official Gazette Data' : '📐 Calibrated Benchmark'}
                      </span>
                      <button
                        type="button"
                        onClick={handleSaveCheck}
                        className="text-xs font-bold text-slate-700 hover:text-blue-700 bg-white/80 hover:bg-white px-2.5 py-1 rounded-lg border border-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>Save Audit</span>
                      </button>
                    </div>
                  </div>

                  {/* Financial Comparison Numbers */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Quoted Price
                      </span>
                      <div className="text-2xl sm:text-3xl font-black text-slate-900">
                        ₹{result.quotedPrice.toLocaleString()}
                      </div>
                      <p className="text-[10px] text-slate-400">Demand by driver / vendor</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
                      <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                        Reasonable Range
                      </span>
                      <div className="text-xl sm:text-2xl font-black text-blue-900">
                        ₹{result.referenceMin.toLocaleString()} – ₹{result.referenceMax.toLocaleString()}
                      </div>
                      <p className="text-[10px] text-blue-600/80">
                        Median: ₹{result.detailed?.travelShieldEstimate.medianEstimatedFare || Math.round((result.referenceMin + result.referenceMax) / 2)}
                      </p>
                    </div>

                    <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Route Distance
                      </span>
                      <div className="text-2xl sm:text-2xl font-black text-slate-800">
                        {result.distanceKm || result.detailed?.computedDistanceKm || 12} km
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Est. {result.estimatedTime || '30 mins'} {result.detailed?.isNightTime ? '(Night Surcharge applied)' : '(Daytime)'}
                      </p>
                    </div>
                  </div>

                  {/* Clear separation: Official Tariff vs TravelShield Estimate vs AI Guidance */}
                  <div className="space-y-4 pt-1">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                        Three-Tier Calculation Transparency
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowMathDetails(!showMathDetails)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>{showMathDetails ? 'Hide Calculation' : 'Show Calculation'}</span>
                        {showMathDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {showMathDetails && (
                      <div className="space-y-3 animate-in fade-in-50">
                        {/* 1. Official Regulatory Data Layer */}
                        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                              <Scale className="w-4 h-4 text-amber-700" />
                              1. Official Regulatory Tariff Data
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200/70 text-amber-900">
                              {result.detailed?.officialData.hasOfficialTariff ? 'Gazette Verified' : 'Regional Baseline'}
                            </span>
                          </div>
                          <p className="text-xs text-amber-900 leading-relaxed font-medium">
                            Authority: <strong>{result.detailed?.officialData.regulatoryAuthority || 'State Transport Authority'}</strong>
                          </p>
                          {result.detailed?.officialData.officialGazetteNote && (
                            <p className="text-[11px] text-amber-800/90 leading-snug">
                              Note: {result.detailed.officialData.officialGazetteNote}
                            </p>
                          )}
                        </div>

                        {/* 2. TravelShield Estimated Fare Breakdown */}
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-blue-600" />
                            2. TravelShield Mathematical Formula Breakdown
                          </span>

                          <div className="space-y-2">
                            {result.detailed?.travelShieldEstimate.factors.map((factor, idx) => (
                              <div
                                key={idx}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2.5 rounded-xl bg-white border border-slate-200/80 text-xs"
                              >
                                <div>
                                  <span className="font-bold text-slate-800">{factor.label}</span>
                                  <p className="text-[11px] text-slate-500">{factor.formulaDescription}</p>
                                </div>
                                <span className="font-black text-slate-900 shrink-0 sm:text-right">
                                  ₹{factor.amount}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Step-by-step text explanation */}
                          <div className="p-3 rounded-xl bg-slate-100/80 text-[11px] text-slate-700 space-y-1">
                            <span className="font-bold text-slate-900 block mb-1">Step-by-step verification:</span>
                            {result.detailed?.travelShieldEstimate.calculationSteps.map((step, sIdx) => (
                              <p key={sIdx} className="leading-tight text-slate-600">
                                • {step}
                              </p>
                            ))}
                          </div>
                        </div>

                        {/* 3. AI-Generated Guidance & Context Advice */}
                        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2.5">
                          <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                            3. AI Contextual Advice & Tourist Negotiation Tip
                          </span>
                          <p className="text-xs text-indigo-950 font-medium leading-relaxed">
                            {result.detailed?.aiGuidance.summary}
                          </p>
                          <div className="p-3 rounded-xl bg-white/80 border border-indigo-200/80 text-xs space-y-1.5">
                            <p className="font-bold text-indigo-900">
                              🗣️ Recommended Negotiation Sentence:
                            </p>
                            <p className="italic text-indigo-800 font-medium">
                              "{result.detailed?.aiGuidance.negotiationTip}"
                            </p>
                          </div>
                          <p className="text-[11px] text-indigo-900/80 leading-snug">
                            💡 <strong>Local Context:</strong> {result.detailed?.aiGuidance.localContextAdvice}
                          </p>
                          <p className="text-[10px] text-slate-500 pt-1 border-t border-indigo-200/60">
                            ⚖️ {result.detailed?.aiGuidance.safetyWatchout}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Safer Alternative Options (Prepaid Booth, Public Transit, Verified Apps) */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Safer Alternative Transport Options
                      </span>
                      <span className="text-[11px] text-slate-400">Verified & Regulated</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {result.detailed?.saferAlternatives.map((alt) => (
                        <div
                          key={alt.id}
                          className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-2.5"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                                {alt.type}
                              </span>
                            </div>
                            <h4 className="text-xs font-black text-slate-900 line-clamp-1">
                              {alt.name}
                            </h4>
                            <p className="text-[11px] text-slate-600 leading-snug mt-1 line-clamp-2">
                              {alt.description}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-200/80">
                            <div className="text-xs font-black text-emerald-700">
                              {alt.estimatedFareRange}
                            </div>
                            <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                              {alt.locationTip}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Next Action Buttons */}
                  <div className="pt-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      Immediate Tourist Actions
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <button
                        type="button"
                        onClick={() => onFindAlternative('Transport')}
                        className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>FIND TRUSTED RIDE</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onAskAIWhy(
                            `Why is ₹${result.quotedPrice} considered ${result.status} for a ${serviceType} from ${source} to ${destination} in ${city}? Detail the official meter tariff and negotiation method.`
                          )
                        }
                        className="py-3 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>ASK AI WHY?</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onReportIssue({
                            providerName: `Unverified ${serviceType} Operator`,
                            category: 'Overcharging',
                            location: `${source} to ${destination}, ${city}`,
                            amount: Number(result.quotedPrice)
                          })
                        }
                        className="py-3 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="w-4 h-4" />
                        <span>REPORT ISSUE</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[420px] bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
                    <DollarSign className="w-8 h-8" />
                  </div>
                  <div className="space-y-1 max-w-sm">
                    <h3 className="text-base font-black text-slate-800">
                      Ready to Benchmark Your Fare
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Enter the quotation received from your driver or tour operator on the left. The engine will transparently calculate base fare, distance, night surcharge, and tolls.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 pt-2">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600">
                      🏛️ Delhi STA Meter Tariff
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600">
                      🏛️ Mumbai MMRTA Cool Cab
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600">
                      🏛️ Jaipur RTO Prepaid
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: 2. Configurable Fare Rules Library */}
      {activeTab === 'rules' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Configurable City Fare Rules Database
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Transparent statutory tariffs, gazette notifications, and calibrated regional guidelines. Admin-updatable backend rules.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Filter City:</span>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-800"
              >
                <option value="">All Cities</option>
                {SUPPORTED_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fareRules
              .filter(r => !city || r.city.toLowerCase() === city.toLowerCase() || city === 'General / Other')
              .map((rule) => (
                <div
                  key={rule.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition-all space-y-3 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">{rule.city}</span>
                        <span className="text-[11px] text-slate-500">• {rule.state}</span>
                      </div>
                      <h4 className="text-sm font-black text-blue-700 mt-0.5">
                        {rule.transportType} ({rule.vehicleCategory || 'Standard'})
                      </h4>
                    </div>

                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        rule.isOfficialTariff
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {rule.isOfficialTariff ? 'Official Gazette Tariff' : 'Calibrated Benchmark'}
                    </span>
                  </div>

                  {/* Pricing Matrix */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-white border border-slate-200 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Base Flag-Down</span>
                      <span className="text-xs sm:text-sm font-black text-slate-900">₹{rule.baseFare}</span>
                      <span className="text-[10px] text-slate-500 block">(first {rule.baseKm} km)</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Per-Km Rate</span>
                      <span className="text-xs sm:text-sm font-black text-blue-700">₹{rule.perKmRate}/km</span>
                      <span className="text-[10px] text-slate-500 block">Meter standard</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Night Surcharge</span>
                      <span className="text-xs sm:text-sm font-black text-amber-700">+{rule.nightSurchargePercentage}%</span>
                      <span className="text-[10px] text-slate-500 block">{rule.nightWindowStart}-{rule.nightWindowEnd}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 space-y-1">
                    <p className="font-semibold text-slate-800">
                      Authority: <span className="font-normal text-slate-600">{rule.regulatoryAuthority}</span>
                    </p>
                    {rule.officialNotes && (
                      <p className="text-slate-500 italic">
                        "{rule.officialNotes}"
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Gazette ref: {rule.gazetteRefUrlOrDate || 'Standard statutory index'}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCity(rule.city);
                        setServiceType(rule.transportType);
                        if (rule.vehicleCategory) setVehicleType(rule.vehicleCategory);
                        setActiveTab('checker');
                      }}
                      className="text-blue-600 font-bold hover:underline cursor-pointer"
                    >
                      Use in Calculator →
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* VIEW: 3. Saved Fare Checks (Audit Trail) */}
      {activeTab === 'saved' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                Your Fare Evaluation Audit History
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Saved fare calculations for tourist expense verification and complaint filing evidence.
              </p>
            </div>

            <span className="text-xs font-bold text-slate-500">
              {savedChecks.length} Records
            </span>
          </div>

          {savedChecks.length === 0 ? (
            <div className="p-10 rounded-2xl bg-slate-50 text-center space-y-3 border border-slate-200">
              <History className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-600 font-medium">
                No saved fare evaluations yet. Run a fare check and click "Save Audit" to retain records here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedChecks.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">{item.city}</span>
                      <span className="text-[11px] text-slate-400">• {item.transportType}</span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          item.status === 'POSSIBLE OVERCHARGING'
                            ? 'bg-rose-100 text-rose-800'
                            : item.status === 'HIGH'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-800">
                      {item.pickup} → {item.destination}
                    </p>

                    <p className="text-[11px] text-slate-500">
                      Distance: {item.distanceKm} km • Saved: {new Date(item.timestamp).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Quoted vs Range</span>
                      <span className="text-sm font-black text-slate-900">₹{item.quotedPrice}</span>
                      <span className="text-xs text-slate-500 ml-1.5">(Ref: ₹{item.estimatedMin}–₹{item.estimatedMax})</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setCity(item.city);
                          setServiceType(item.transportType);
                          setSource(item.pickup);
                          setDestination(item.destination);
                          setQuotedPrice(item.quotedPrice);
                          setDistanceKm(item.distanceKm);
                          setActiveTab('checker');
                          handleRunCheck({
                            city: item.city,
                            serviceType: item.transportType,
                            source: item.pickup,
                            destination: item.destination,
                            quotedPrice: item.quotedPrice,
                            distanceKm: item.distanceKm
                          });
                        }}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Re-check
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteSaved(item.id, e)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete check"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
