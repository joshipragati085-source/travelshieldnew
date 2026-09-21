import React, { useState } from 'react';
import { PhoneCall, ShieldAlert, Share2, MapPin, X, Check, Copy, AlertTriangle, ExternalLink } from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [simulatedCall, setSimulatedCall] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState(false);

  if (!isOpen) return null;

  const hotlines = [
    {
      number: '112',
      name: 'National Emergency Helpline',
      desc: 'All-in-one Police, Fire & Ambulance response across India',
      badge: 'Immediate Priority',
      color: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
    },
    {
      number: '1363',
      name: '24x7 Multi-lingual Tourist Helpline',
      desc: 'Govt of India official helpline in 12 languages (including English, German, French, Spanish, Japanese, Russian)',
      badge: 'Tourist Support',
      color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
    },
    {
      number: '1091',
      name: 'Women Safety Helpline',
      desc: 'Direct rapid response for solo women travellers and distress assistance',
      badge: 'Women Safety',
      color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
    },
    {
      number: '100',
      name: 'Tourist Police Control Room',
      desc: 'City PCR patrol vans and local station immediate dispatch',
      badge: 'Police Desk',
      color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
    },
    {
      number: '108',
      name: 'National Medical Ambulance Service',
      desc: 'Emergency paramedics and government hospital transport',
      badge: 'Medical',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
    }
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSimulateCall = (name: string, num: string) => {
    setSimulatedCall(`Connecting to ${name} (${num})... In demo mode, live phone dial is simulated.`);
    setTimeout(() => setSimulatedCall(null), 4000);
  };

  const handleShareLocation = () => {
    const text = `TravelShield Emergency Broadcast: Tourist at Central Delhi (Lat: 28.6219, Lng: 77.2185) has shared location via TravelShield Protected Trip TS-TRIP-7729. View live telemetry: https://travelshield.org/track/TS-TRIP-7729`;
    navigator.clipboard.writeText(text);
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <ShieldAlert className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Emergency Safety Hub</h2>
              <p className="text-xs text-rose-100 font-medium">
                Verified Indian National Hotlines & Tourist Protection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {simulatedCall && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-sm flex items-center gap-2 animate-in slide-in-from-top-2">
              <PhoneCall className="w-4 h-4 text-blue-600 animate-spin" />
              <span>{simulatedCall}</span>
            </div>
          )}

          {/* Quick Action Broadcast */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleShareLocation}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900 text-white font-medium text-sm hover:bg-slate-800 transition-all shadow-xs active:scale-[0.98]"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>{shareSuccess ? 'Location Copied!' : 'Share Live Location'}</span>
            </button>
            <button
              onClick={() => handleSimulateCall('National Emergency', '112')}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-rose-600 text-white font-semibold text-sm hover:bg-rose-700 transition-all shadow-xs active:scale-[0.98]"
            >
              <PhoneCall className="w-4 h-4 animate-bounce" />
              <span>Quick SOS (112)</span>
            </button>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong>Prototype Note:</strong> Action buttons simulate emergency connections safely without placing real unwanted calls during product demonstrations.
            </p>
          </div>

          {/* Hotline List */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Official Verified Emergency Contacts
            </h3>
            {hotlines.map((hl) => (
              <div
                key={hl.number}
                className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${hl.color}`}
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-extrabold tracking-tight">{hl.number}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white/70 shadow-2xs">
                      {hl.badge}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 truncate">{hl.name}</h4>
                  <p className="text-[11px] text-slate-600 line-clamp-1">{hl.desc}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleCopy(hl.number, hl.number)}
                    title="Copy number"
                    className="p-2 rounded-lg bg-white hover:bg-slate-100 text-slate-600 shadow-2xs border border-slate-200 transition-colors"
                  >
                    {copied === hl.number ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleSimulateCall(hl.name, hl.number)}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 shadow-2xs transition-transform active:scale-95"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Current Safe Location */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-blue-600" />
              <div>
                <p className="font-bold text-slate-800">Current Position: Central Delhi</p>
                <p className="text-[11px] text-slate-500">Nearest Kiosk: Janpath Tourist Police (350m)</p>
              </div>
            </div>
            <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
              GPS Sync Active
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>TravelShield Rapid Incident Response</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 font-medium text-slate-700 hover:bg-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
