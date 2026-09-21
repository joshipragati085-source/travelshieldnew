import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  MapPin,
  Star,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Phone,
  Compass,
  Car,
  Hotel,
  Utensils,
  BookOpen,
  Anchor,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Provider, ProviderCategory } from '../types';
import { TrustBadge } from '../components/TrustBadge';
import { api } from '../services/api';

interface ServicesPageProps {
  onSelectProvider: (providerId: string) => void;
  preselectedCategory?: string | null;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({
  onSelectProvider,
  preselectedCategory
}) => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(preselectedCategory || 'All');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(true);
  const [minTrust, setMinTrust] = useState<number>(75);
  const [directionsNotice, setDirectionsNotice] = useState<string | null>(null);

  const categories: { label: string; icon: any }[] = [
    { label: 'All', icon: ShieldCheck },
    { label: 'Transport', icon: Car },
    { label: 'Hotels', icon: Hotel },
    { label: 'Restaurants', icon: Utensils },
    { label: 'Tour Guides', icon: BookOpen },
    { label: 'Tour Operators', icon: Compass },
    { label: 'Activities', icon: Anchor },
  ];

  const cities = ['All', 'Delhi', 'Jaipur', 'Mumbai', 'Varanasi', 'Goa', 'Bengaluru'];

  useEffect(() => {
    fetchProviders();
  }, [selectedCategory, selectedCity, verifiedOnly, minTrust]);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const data = await api.getProviders({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        city: selectedCity === 'All' ? undefined : selectedCity,
        verified: verifiedOnly,
        minTrust: minTrust > 0 ? minTrust : undefined,
        search: search || undefined
      });
      setProviders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProviders();
  };

  const handleDirections = (providerName: string, location: string) => {
    setDirectionsNotice(`Navigating to ${providerName} (${location}). Opening Google Maps navigation route in demo mode.`);
    setTimeout(() => setDirectionsNotice(null), 4000);
  };

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 p-6 sm:p-10 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Ministry Verified Tourist Directory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Find Trusted Services
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl leading-relaxed">
              Discover accredited tourist transportation, hotels, badge-holding tour guides, and certified activity operators vetted with strict multi-factor trust scores.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/15 text-xs text-emerald-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Zero Unverified Touts Guarantee</span>
          </div>
        </div>
      </div>

      {directionsNotice && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-xs sm:text-sm flex items-center justify-between animate-in slide-in-from-top-2">
          <span>{directionsNotice}</span>
          <button
            onClick={() => setDirectionsNotice(null)}
            className="text-xs font-bold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.label;
          return (
            <button
              key={cat.label}
              onClick={() => setSelectedCategory(cat.label)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shadow-2xs ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-sm scale-102'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search & Refinement Filters */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search provider, tags, or airport..."
            className="w-full pl-10 pr-20 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
          >
            Search
          </button>
        </form>

        {/* Filter Selectors */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* City Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500">City:</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-hidden"
            >
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Min Trust Score */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Min Trust:</span>
            <select
              value={minTrust}
              onChange={(e) => setMinTrust(Number(e.target.value))}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-hidden"
            >
              <option value={0}>All Scores</option>
              <option value={75}>75+ (Trusted)</option>
              <option value={90}>90+ (Highly Trusted)</option>
            </select>
          </div>

          {/* Verified Only Checkbox */}
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>Verified Only</span>
          </label>
        </div>
      </div>

      {/* Providers Grid */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading verified providers...</p>
        </div>
      ) : providers.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Providers Match Your Criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your category filter, city location, or lowering the minimum trust threshold.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedCity('All');
              setMinTrust(0);
              setSearch('');
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
            >
              {/* Image & Header Tags */}
              <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-white/90 backdrop-blur-xs text-slate-800 shadow-xs">
                    {p.category}
                  </span>
                  <TrustBadge score={p.trustScore} size="sm" showBreakdownIcon={false} />
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                  <span className="text-xs font-bold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{p.city}</span>
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-md">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{p.rating}</span>
                    <span className="text-[10px] text-white/70">({p.reviewCount})</span>
                  </div>
                </div>
              </div>

              {/* Provider Info Body */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-extrabold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                      {p.name}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>

                  {/* Verification & Complaint Rate Info */}
                  <div className="pt-2 grid grid-cols-2 gap-2 text-[11px] border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 block">Verification</span>
                      <span className="font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Govt Verified
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Complaint Rate</span>
                      <span className="font-bold text-slate-800">{p.complaintRate}% (Ultra Low)</span>
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px]">
                    <span className="text-slate-500 font-medium">Standard Tariff: </span>
                    <span className="font-bold text-slate-900">{p.priceRange}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onSelectProvider(p.id)}
                    className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <span>VIEW DETAILS</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDirections(p.name, p.location)}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <Compass className="w-3.5 h-3.5 text-slate-500" />
                    <span>DIRECTIONS</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
