import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  PhoneCall,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Clock,
  HelpCircle,
  Users,
  Compass,
  AlertCircle,
  FileCheck,
  Shield,
  HeartHandshake
} from 'lucide-react';
import { SafetyAlert } from '../types';
import { api } from '../services/api';

interface SafetyPageProps {
  onOpenEmergency: () => void;
}

export const SafetyPage: React.FC<SafetyPageProps> = ({ onOpenEmergency }) => {
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'scams' | 'solo' | 'helplines'>('all');

  useEffect(() => {
    api.getSafetyAlerts().then(setAlerts).catch(() => {});
  }, []);

  const emergencyContacts = [
    { title: 'National Emergency', number: '112', desc: 'Police, Fire, Medical Services Nationwide', badge: 'National Universal' },
    { title: 'Ministry 24x7 Tourist Helpline', number: '1363', desc: 'Multi-lingual Support in 12 Foreign Languages', badge: 'Tourism Official' },
    { title: 'Women in Distress Helpline', number: '1091', desc: 'National Commission for Women 24/7 Response', badge: 'Women Safety' },
    { title: 'Railway Security (RPF)', number: '139', desc: 'On-train Security, Medical & Passenger Safety', badge: 'Railways 24/7' },
    { title: 'Ambulance & Trauma Care', number: '108', desc: 'Emergency Medical & Paramedic Transport', badge: 'Medical' },
    { title: 'Tourist Police Delhi Control', number: '011-23361100', desc: 'Direct Central Delhi Tourist Assistance Cell', badge: 'Delhi Police' }
  ];

  const commonScams = [
    {
      title: 'The "Closed Hotel / Road Blocked" Taxi Scam',
      badge: 'High Frequency',
      desc: 'Driver claims your booked hotel is burnt down, closed, or inaccessible due to VIP movements/festivals, and offers to take you to a "Government Approved" alternative agency.',
      prevention: 'Call your hotel directly before believing any driver. Never allow a driver to choose your hotel.'
    },
    {
      title: 'The Fake "Government Tourist Office" (Connaught Place / Stations)',
      badge: 'Touts / Impersonation',
      desc: 'Touts dress formally and claim the official railway booking counter is closed, directing you to private travel agencies with names resembling govt departments (e.g., "India Tourism Center").',
      prevention: 'The only official Ministry office is 88 Janpath (Delhi) or certified IRCTC counters inside railway stations.'
    },
    {
      title: 'Gemstone / Saffron Duty-Free Resale Scheme',
      badge: 'Financial Fraud',
      desc: 'Friendly locals or gem dealers offer you packages of gems or saffron to carry home to sell at 3x profit, claiming they will wire you money or reimburse you.',
      prevention: 'Never participate in export or resale schemes. It is always a complete financial scam.'
    },
    {
      title: 'Forced Temple/Ghat "Blessing" (Donation Scam)',
      badge: 'Religious Aggression',
      desc: 'Self-proclaimed priests tie holy threads (kalava) on your wrist or perform prayers without asking, then demand thousands of rupees as "donation".',
      prevention: 'Firmly say "No thank you" (Nahi chahiye) before anyone places threads or offerings in your hand.'
    }
  ];

  const safetyGuidelines = [
    {
      title: 'Solo & Female Travellers',
      tips: [
        'Share your live WhatsApp location or ride tracker with trusted contacts.',
        'Use verified app-based rides (Uber, Ola) or official prepaid airport taxi booths.',
        'Carry emergency helpline cards (112, 1363) in your physical wallet.',
        'Avoid isolated alleys after 10 PM in unfamiliar areas.'
      ]
    },
    {
      title: 'Food, Water & Health Protection',
      tips: [
        'Drink only sealed bottled water (ensure the cap seal is intact) or filtered hotel water.',
        'Eat at busy street food stalls with high local turnover where food is cooked fresh and piping hot.',
        'Carry basic rehydration salts (ORS) and activated charcoal during long transit days.',
        'Use mosquito repellent when visiting coastal or river ghat areas.'
      ]
    },
    {
      title: 'Transport & Luggage Rules',
      tips: [
        'Always demand the meter or check the TravelShield Fair Price benchmark before boarding.',
        'Keep your passport, visa copy, and money belt secure under clothing during train journeys.',
        'In sleeper trains, lock your luggage beneath the lower berth using a chain-padlock.',
        'Never accept unsealed food or beverages from strangers on long-distance coaches.'
      ]
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 font-sans">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 sm:p-10 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-400/30">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>National Tourist Protection Directive</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Safety Center & Advisory Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              "Your protection is our priority." Access verified emergency hotlines, official police advisories, anti-scam countermeasures, and solo traveler safety protocols.
            </p>
          </div>

          <button
            onClick={onOpenEmergency}
            className="px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs sm:text-sm shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 animate-pulse"
          >
            <PhoneCall className="w-5 h-5" />
            <span>TRIGGER EMERGENCY SOS</span>
          </button>
        </div>
      </div>

      {/* Emergency Hotlines Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            Official 24x7 Emergency Helplines
          </h2>
          <span className="text-xs text-slate-500">Toll-free & Multi-lingual</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {emergencyContacts.map((contact, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                    {contact.badge}
                  </span>
                  <span className="text-xs font-bold text-emerald-600">Active 24/7</span>
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">{contact.title}</h3>
                <p className="text-xs text-slate-500 leading-snug">{contact.desc}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-lg font-black text-slate-900 font-mono">
                  {contact.number}
                </span>
                <a
                  href={`tel:${contact.number.replace(/[^0-9]/g, '')}`}
                  className="py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Now</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Safety Advisories Feed */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Live Tourist Police Advisories
            </h3>
            <p className="text-xs text-slate-500">
              Verified regional alerts and active safety warnings across major tourist circuits.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Live Feed
          </span>
        </div>

        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl border transition-all ${
                alert.severity === 'High'
                  ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                  : alert.severity === 'Medium'
                  ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                  : 'bg-blue-50/70 border-blue-200 text-blue-950'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                    alert.severity === 'High'
                      ? 'bg-rose-600 text-white'
                      : alert.severity === 'Medium'
                      ? 'bg-amber-600 text-white'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {alert.severity} Priority Alert
                </span>
                <span className="text-[11px] font-medium opacity-70 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {alert.date}
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-extrabold">{alert.title}</h4>
              <p className="mt-1 text-xs opacity-90 leading-relaxed">{alert.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Common Scams to Avoid Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            Recognized Tourist Scams & Countermeasures
          </h3>
          <p className="text-xs text-slate-500">
            Learn the standard tactics used by unauthorized touts and how to effortlessly bypass them.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {commonScams.map((scam, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                    {scam.badge}
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">{scam.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{scam.desc}</p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                <span className="font-bold block text-[10px] uppercase text-emerald-800">
                  🛡️ How to Protect Yourself:
                </span>
                <p className="mt-0.5 text-[11px] leading-snug">{scam.prevention}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Solo & General Safety Guidelines */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-base font-extrabold tracking-tight">
            Comprehensive India Travel Safety Protocol
          </h3>
          <p className="text-xs text-slate-400">
            Curated best practices for independent, solo, and international explorers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {safetyGuidelines.map((guide, idx) => (
            <div key={idx} className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-1">
                {guide.title}
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {guide.tips.map((tip, tIdx) => (
                  <li key={tIdx} className="flex items-start gap-2 leading-relaxed">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
