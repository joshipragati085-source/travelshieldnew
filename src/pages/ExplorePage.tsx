import React, { useState } from 'react';
import {
  Compass,
  MapPin,
  ShieldCheck,
  PhoneCall,
  Search,
  CheckCircle2,
  AlertTriangle,
  Building,
  Car,
  HeartPulse,
  Navigation,
  ExternalLink,
  Shield,
  Layers
} from 'lucide-react';

interface ExplorePageProps {
  onOpenEmergency: () => void;
  onSelectService: (category: string) => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  onOpenEmergency,
  onSelectService
}) => {
  const [selectedCity, setSelectedCity] = useState('Delhi');
  const [activeLayer, setActiveLayer] = useState<'all' | 'police' | 'attractions' | 'medical' | 'transport'>('all');
  const [selectedSpot, setSelectedSpot] = useState<any | null>(null);

  const cityHighlights: Record<string, { desc: string; safetyRating: string; policeKiosks: number; places: any[] }> = {
    Delhi: {
      desc: 'National Capital Region featuring historic monuments, extensive high-security metro network, and 24x7 Tourist Police cells.',
      safetyRating: 'Safe in Central/South zones with dedicated tourist kiosks',
      policeKiosks: 14,
      places: [
        {
          id: 'delhi-1',
          name: 'Connaught Place Tourist Police Kiosk',
          type: 'police',
          tag: 'Tourist Police Kiosk',
          rating: '24x7 Manned',
          desc: 'Specialized tourist police assistance center with foreign language translation support.',
          address: 'Inner Circle, Block B, Connaught Place, New Delhi',
          phone: '011-23361100',
          coordinates: { lat: 28.6315, lng: 77.2167 },
          safetyStatus: 'High Security Zone'
        },
        {
          id: 'delhi-2',
          name: 'Qutub Minar Complex',
          type: 'attractions',
          tag: 'UNESCO Heritage Monument',
          rating: 'Govt Regulated',
          desc: 'World heritage site with regulated ASI electronic ticketing and audio guides.',
          address: 'Mehrauli, New Delhi',
          phone: '011-26643856',
          coordinates: { lat: 28.5244, lng: 77.1855 },
          safetyStatus: 'Verified Safe'
        },
        {
          id: 'delhi-3',
          name: 'IGI Airport T3 Prepaid Taxi & Assistance Booth',
          type: 'transport',
          tag: 'Prepaid Taxi Stand',
          rating: 'Delhi Traffic Police Certified',
          desc: 'Official government prepaid cab counter with voucher receipts and vehicle tracking.',
          address: 'Terminal 3 Arrivals, New Delhi',
          phone: '011-25652011',
          coordinates: { lat: 28.5562, lng: 77.1000 },
          safetyStatus: '100% Regulated'
        },
        {
          id: 'delhi-4',
          name: 'AIIMS Emergency & Trauma Center',
          type: 'medical',
          tag: 'Premier Medical Hub',
          rating: '24x7 Emergency',
          desc: 'National apex medical institute with international patient care and trauma unit.',
          address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi',
          phone: '011-26588500',
          coordinates: { lat: 28.5672, lng: 77.2100 },
          safetyStatus: 'Active Emergency'
        }
      ]
    },
    Jaipur: {
      desc: 'The Pink City of Rajasthan with UNESCO heritage forts, dedicated tourist police patrol vehicles, and certified guides.',
      safetyRating: 'High Tourist Protection Index',
      policeKiosks: 8,
      places: [
        {
          id: 'jpr-1',
          name: 'Amer Fort Tourist Police Post',
          type: 'police',
          tag: 'Tourist Police Station',
          rating: '24x7 Active',
          desc: 'Stationed right at fort entrance to verify licensed guides and resolve fee disputes.',
          address: 'Amer, Jaipur, Rajasthan',
          phone: '0141-2530264',
          safetyStatus: 'High Security Zone'
        },
        {
          id: 'jpr-2',
          name: 'Hawa Mahal & City Palace Quarter',
          type: 'attractions',
          tag: 'Heritage Monument',
          rating: 'Govt Regulated',
          desc: 'Iconic pink sandstone palace with strict vendor guidelines and official ticket gates.',
          address: 'Badi Choupad, J.D.A. Market, Jaipur',
          phone: '0141-2618039',
          safetyStatus: 'Verified Safe'
        },
        {
          id: 'jpr-3',
          name: 'Jaipur Railway Station Prepaid Auto Stand',
          type: 'transport',
          tag: 'Prepaid Transport',
          rating: 'Jaipur Police Approved',
          desc: 'Official booth preventing unmetered overcharging for tourists arriving by Shatabdi/Vande Bharat.',
          address: 'Platform 1 Exit, Jaipur Junction',
          phone: '0141-2204567',
          safetyStatus: '100% Regulated'
        }
      ]
    },
    Mumbai: {
      desc: 'Financial capital known for high street safety, reliable meter taxis (Kall-pe-pili), and active coastal policing.',
      safetyRating: 'Exceptional Night Safety & Transit Security',
      policeKiosks: 11,
      places: [
        {
          id: 'mum-1',
          name: 'Gateway of India Tourist Police Kiosk',
          type: 'police',
          tag: 'Coastal Police Post',
          rating: '24x7 Watch',
          desc: 'Patrols boat jetties, Elephanta ferry lines, and Colaba heritage precinct.',
          address: 'Apollo Bandar, Colaba, Mumbai',
          phone: '022-22851234',
          safetyStatus: 'High Security Zone'
        },
        {
          id: 'mum-2',
          name: 'Chhatrapati Shivaji Maharaj Terminus (CSMT)',
          type: 'attractions',
          tag: 'UNESCO Railway Terminal',
          rating: 'High Security',
          desc: 'Victorian Gothic marvel with dedicated RPF tourist assistance desk.',
          address: 'Fort, Mumbai',
          phone: '022-22620173',
          safetyStatus: 'Verified Safe'
        }
      ]
    },
    Varanasi: {
      desc: 'Spiritual capital with dedicated tourist police at Dashashwamedh Ghat and boat fare regulation.',
      safetyRating: 'Protected Ghat Corridors with River Police',
      policeKiosks: 6,
      places: [
        {
          id: 'vns-1',
          name: 'Dashashwamedh Ghat Tourist Police Booth',
          type: 'police',
          tag: 'Riverfront Police Center',
          rating: '24x7 Ghat Guard',
          desc: 'Regulates evening Ganga Aarti boat tariffs and resolves unauthorized touting.',
          address: 'Dashashwamedh Ghat, Varanasi',
          phone: '0542-2501234',
          safetyStatus: 'High Security Zone'
        }
      ]
    }
  };

  const currentCityData = cityHighlights[selectedCity] || cityHighlights['Delhi'];

  const filteredPlaces = currentCityData.places.filter((p) => {
    if (activeLayer === 'all') return true;
    return p.type === activeLayer;
  });

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-10 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
              <Compass className="w-3.5 h-3.5" />
              <span>Interactive Tourism Safety Navigator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Explore India Safely
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 max-w-xl leading-relaxed">
              Locate verified heritage monuments, 24x7 Tourist Police kiosks, regulated prepaid transport booths, and emergency medical hubs across Indian cities.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenEmergency}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold flex items-center gap-2 shadow-md transition-colors"
            >
              <PhoneCall className="w-4 h-4" />
              <span>112 Emergency Route</span>
            </button>
          </div>
        </div>
      </div>

      {/* City Switcher Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {Object.keys(cityHighlights).map((city) => (
          <button
            key={city}
            onClick={() => {
              setSelectedCity(city);
              setSelectedSpot(null);
            }}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shadow-2xs ${
              selectedCity === city
                ? 'bg-blue-600 text-white shadow-md scale-102'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {city}
          </button>
        ))}
      </div>

      {/* City Overview Ribbon */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900">{selectedCity} Safety Profile</h2>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
              ✓ {currentCityData.safetyRating}
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">{currentCityData.desc}</p>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold text-slate-700 shrink-0">
          <span className="p-2 rounded-xl bg-blue-50 text-blue-700 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>{currentCityData.policeKiosks} Police Kiosks</span>
          </span>
        </div>
      </div>

      {/* Map Radar & Location Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Interactive Simulated Map / Radar Canvas */}
        <div className="lg:col-span-7 bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[440px]">
          {/* Simulated Map Grid Lines & Radar concentric circles */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="w-full h-full border border-blue-500/20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]" />
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-extrabold tracking-wider text-emerald-300 uppercase">
                Active GPS Safety Mesh: {selectedCity}
              </span>
            </div>

            <span className="text-[10px] font-mono px-2 py-1 rounded bg-white/10 text-white/80">
              Live Verified Zone
            </span>
          </div>

          {/* Interactive Spot Pins on Radar */}
          <div className="relative z-10 my-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredPlaces.map((spot) => {
              const isSelected = selectedSpot?.id === spot.id;
              return (
                <button
                  key={spot.id}
                  onClick={() => setSelectedSpot(spot)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-blue-600/90 border-blue-400 shadow-lg scale-102'
                      : 'bg-white/10 hover:bg-white/15 border-white/15 backdrop-blur-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                        spot.type === 'police'
                          ? 'bg-emerald-500 text-white'
                          : spot.type === 'attractions'
                          ? 'bg-amber-500 text-white'
                          : spot.type === 'medical'
                          ? 'bg-rose-500 text-white'
                          : 'bg-blue-500 text-white'
                      }`}
                    >
                      {spot.tag}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{spot.name}</h4>
                  <p className="text-[10px] text-blue-200/80 line-clamp-1 mt-0.5">{spot.safetyStatus}</p>
                </button>
              );
            })}
          </div>

          {/* Map Controls / Layer Filters */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 mr-2 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Layers:</span>
            </span>

            {[
              { id: 'all', label: 'All Markers' },
              { id: 'police', label: 'Tourist Police' },
              { id: 'attractions', label: 'Heritage Sites' },
              { id: 'transport', label: 'Prepaid Stands' },
              { id: 'medical', label: 'Trauma Centers' }
            ].map((layer) => (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id as any)}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                  activeLayer === layer.id
                    ? 'bg-emerald-500 text-slate-950 font-black'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                {layer.label}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Spot Details & List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">
                {selectedSpot ? 'Verified Location Detail' : 'Select a Marker on Map'}
              </h3>
              {selectedSpot && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  {selectedSpot.rating}
                </span>
              )}
            </div>

            {selectedSpot ? (
              <div className="space-y-3 animate-in fade-in">
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-600 block">
                    {selectedSpot.tag}
                  </span>
                  <h4 className="text-base font-black text-slate-900 mt-0.5">
                    {selectedSpot.name}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {selectedSpot.desc}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 text-slate-700">
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{selectedSpot.address}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <PhoneCall className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Direct Desk: <strong>{selectedSpot.phone}</strong></span>
                  </p>
                </div>

                <div className="pt-2 flex gap-2">
                  <a
                    href={`tel:${selectedSpot.phone.replace(/[^0-9]/g, '')}`}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Post</span>
                  </a>
                  <button
                    onClick={() =>
                      alert(`Opening navigation route to ${selectedSpot.name} from current location.`)
                    }
                    className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <Navigation className="w-3.5 h-3.5 text-slate-500" />
                    <span>Get Directions</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center space-y-2">
                <Navigation className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">
                  Click any verified station, heritage site, or police post on the radar map to view details.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
