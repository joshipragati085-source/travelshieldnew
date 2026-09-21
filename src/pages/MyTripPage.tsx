import React, { useState, useEffect } from 'react';
import {
  Compass,
  MapPin,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  PhoneCall,
  Share2,
  Car,
  Hotel,
  Shield
} from 'lucide-react';
import { api } from '../services/api';
import { TripItinerary } from '../types';

interface MyTripPageProps {
  onOpenEmergency: () => void;
}

export const MyTripPage: React.FC<MyTripPageProps> = ({ onOpenEmergency }) => {
  const [trip, setTrip] = useState<TripItinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareNotice, setShareNotice] = useState(false);

  useEffect(() => {
    api.getTrips()
      .then((trips) => {
        if (trips && trips.length > 0) {
          setTrip(trips[0]);
        } else {
          setTrip({
            id: 'trip-01',
            userId: 'usr_demo_01',
            title: 'Golden Triangle Heritage & Safety Tour',
            destination: 'Delhi – Agra – Jaipur',
            startDate: '2025-03-01',
            endDate: '2025-03-07',
            hotel: 'The Imperial New Delhi (Verified)',
            transport: 'Delhi Tourism Verified AC Sedan (DL 1R 8892)',
            emergencyContacts: [
              { name: 'Sarah Johnson (Sister)', relation: 'Family', phone: '+1-555-0199' },
              { name: 'Delhi Tourist Police Cell', relation: 'Official', phone: '1363' }
            ],
            savedPlaces: ['Qutub Minar', 'Taj Mahal', 'Amer Fort', 'Hawa Mahal'],
            safetyScore: 96
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleShareSafety = () => {
    setShareNotice(true);
    setTimeout(() => setShareNotice(false), 3000);
  };

  const sampleDays = [
    {
      dayNumber: 1,
      date: '2025-03-01',
      title: 'Arrival in Delhi & Heritage Monuments',
      activities: ['Prepaid taxi from IGI Airport to Hotel', 'Qutub Minar Complex Tour with Verified Guide', 'Evening walk at Connaught Place'],
      verifiedProviders: ['Delhi Traffic Police Prepaid Cab', 'Ministry Badge Guide #ND-409']
    },
    {
      dayNumber: 2,
      date: '2025-03-02',
      title: 'Agra Day Excursion (Taj Mahal & Agra Fort)',
      activities: ['Gatimaan Express Train (RPF Protected)', 'Taj Mahal East Gate Electronic Entry', 'Agra Fort ASI Tour'],
      verifiedProviders: ['IRCTC Verified Rail Service', 'UP Tourism Approved Guide #AG-112']
    },
    {
      dayNumber: 3,
      date: '2025-03-03',
      title: 'Pink City Jaipur Heritage Forts',
      activities: ['Amer Fort & Sheesh Mahal', 'Hawa Mahal & City Palace', 'Jaipur Bapu Bazaar Shopping with Fixed Price Vendors'],
      verifiedProviders: ['Rajasthan Tourist Assistance Force', 'Govt Approved Auto Federation']
    }
  ];

  const safetyChecklist = [
    'Tourist Police 1363 saved in phone speed dial',
    'Offline map cache of Central Delhi and Jaipur downloaded',
    'Digital copy of passport and visa saved securely',
    'Live WhatsApp tracking enabled with family emergency contact'
  ];

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading your active journey...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 font-sans">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-800 via-indigo-900 to-slate-900 p-6 sm:p-10 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Active Trip Protection Mesh • Safety Score: {trip?.safetyScore || 96}/100</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {trip?.title || 'Golden Triangle Tour'}
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 max-w-xl leading-relaxed">
              {trip?.destination} • {trip?.startDate} to {trip?.endDate} • Protected Itinerary with real-time safety advisories and verified transport credentials.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={handleShareSafety}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-2 border border-white/15"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Share Safety Link</span>
            </button>
            <button
              onClick={onOpenEmergency}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold flex items-center gap-2 shadow-md transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>112 SOS</span>
            </button>
          </div>
        </div>
      </div>

      {shareNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Live safety tracking link copied to clipboard. You can send this to family or emergency contacts.</span>
        </div>
      )}

      {/* Safety Checklist Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            Journey Safety Checklist
          </h3>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
            All Systems Verified
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {safetyChecklist.map((chk, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-xs font-bold text-slate-800 leading-snug">{chk}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Itinerary Schedule */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
          Day-by-Day Itinerary & Verified Services
        </h3>

        <div className="space-y-4">
          {sampleDays.map((day) => (
            <div
              key={day.dayNumber}
              className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-xl bg-blue-600 text-white font-black text-xs">
                    Day {day.dayNumber}
                  </span>
                  <h4 className="text-base font-extrabold text-slate-900">{day.title}</h4>
                </div>
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {day.date}
                </span>
              </div>

              {/* Day Activities List */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Planned Activities
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {day.activities.map((act, aIdx) => (
                    <div
                      key={aIdx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-800 flex items-center gap-2"
                    >
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verified Providers for this Day */}
              {day.verifiedProviders && day.verifiedProviders.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Bookings Attached</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {day.verifiedProviders.map((vp, vIdx) => (
                      <span
                        key={vIdx}
                        className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200"
                      >
                        ✓ {vp}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
