import React, { useState, useEffect } from 'react';
import {
  FileText,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Send,
  Clock,
  ShieldCheck,
  Building,
  DollarSign,
  MapPin,
  HelpCircle,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { ComplaintCategory, Complaint } from '../types';

interface ComplaintsPageProps {
  prefillData?: {
    providerName?: string;
    category?: string;
    location?: string;
    amount?: number;
  } | null;
}

export const ComplaintsPage: React.FC<ComplaintsPageProps> = ({ prefillData }) => {
  const [category, setCategory] = useState<ComplaintCategory>('Overcharging');
  const [providerName, setProviderName] = useState('');
  const [location, setLocation] = useState('');
  const [amount, setAmount] = useState<string | number>('');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  const [aiEnhanceLoading, setAiEnhanceLoading] = useState(false);
  const [aiDraft, setAiDraft] = useState<{
    formalReport: string;
    shortExplanation: string;
    severityLevel: string;
    actionSteps: string[];
  } | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (prefillData) {
      if (prefillData.category) setCategory(prefillData.category as ComplaintCategory);
      if (prefillData.providerName) setProviderName(prefillData.providerName);
      if (prefillData.location) setLocation(prefillData.location);
      if (prefillData.amount) setAmount(prefillData.amount);
      if (prefillData.amount) {
        setDescription(`I was quoted/charged ₹${prefillData.amount} for ${prefillData.providerName || 'service'} at ${prefillData.location || 'location'}, which is significantly higher than the standard tariff.`);
      }
    }
  }, [prefillData]);

  const handleEnhanceWithAI = async () => {
    if (!description.trim()) {
      setError('Please provide at least a brief summary of what happened first.');
      return;
    }
    setError(null);
    setAiEnhanceLoading(true);
    try {
      const res = await api.assistComplaint(
        description,
        category,
        amount ? Number(amount) : undefined
      );
      setAiDraft({
        formalReport: res.suggestedComplaintText,
        shortExplanation: res.shortExplanation,
        severityLevel: 'High',
        actionSteps: res.usefulEvidence || ['Keep payment receipt/UPI ref', 'Present ID at Tourist Police Desk']
      });
      setDescription(res.suggestedComplaintText);
    } catch (e: any) {
      setError('AI structuring currently using standard template.');
      setAiDraft({
        formalReport: `FORMAL INCIDENT NOTICE\nCategory: ${category}\nRespondent: ${providerName || 'Unregistered Provider'}\nLocation: ${location}\nSummary: ${description}`,
        shortExplanation: 'Overcharging and tariff violation report',
        severityLevel: 'High',
        actionSteps: [
          'Incident registered in TravelShield national log',
          'Present reference ID at nearest Tourist Police kiosk',
          'Notify pre-paid booth supervisors'
        ]
      });
    } finally {
      setAiEnhanceLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!providerName || !location || !description) {
      setError('Please fill in provider name, location, and description.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await api.submitComplaint({
        providerName,
        category,
        location,
        amount: amount ? Number(amount) : undefined,
        description
      });
      setSubmittedComplaint(res.complaint);
    } catch (err: any) {
      setError(err.message || 'Failed to submit complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 font-sans">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-rose-800 via-red-900 to-slate-900 p-6 sm:p-10 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-400/30">
              <FileText className="w-3.5 h-3.5" />
              <span>Consumer Protection & Incident Escalation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Report a Problem
            </h1>
            <p className="text-xs sm:text-sm text-rose-100/90 max-w-xl leading-relaxed">
              "We help you report issues quickly and clearly." Report overcharging, taxi meter refusals, tout scams, or harassment. Our AI formats official legal complaints for immediate redressal.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 text-xs text-rose-100 max-w-xs space-y-1">
            <p className="font-bold text-emerald-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              Direct Police Escalation
            </p>
            <p className="text-[11px] text-white/80">
              Official reference IDs can be presented directly at Tourist Police kiosks (1363 / 112).
            </p>
          </div>
        </div>
      </div>

      {submittedComplaint ? (
        /* Confirmation State */
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xl text-center space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              Incident Case Filed Successfully
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Complaint Reference: {submittedComplaint.id}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Your grievance has been logged into the National Tourism Disciplinary Mesh.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto flex items-center justify-between text-xs font-mono font-bold text-slate-800">
            <span>Tracking ID: {submittedComplaint.id}</span>
            <button
              onClick={() => handleCopyId(submittedComplaint.id)}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-sans text-xs font-bold"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-left max-w-lg mx-auto text-xs text-blue-900 space-y-2">
            <p className="font-bold">Next Steps for Immediate Resolution:</p>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-blue-800">
              <li>Keep this Tracking ID handy if speaking with Tourist Police (Helpline 1363).</li>
              <li>A case officer has been assigned to verify provider license credentials.</li>
              <li>Provider trust rating has received a provisional scrutiny hold.</li>
            </ul>
          </div>

          <button
            onClick={() => {
              setSubmittedComplaint(null);
              setDescription('');
              setAiDraft(null);
            }}
            className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors"
          >
            File Another Report
          </button>
        </div>
      ) : (
        /* Form Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Incident Details
              </h2>
              <p className="text-xs text-slate-500">
                Provide as much information as possible to expedite investigation.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Complaint Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-rose-600 focus:outline-hidden"
                >
                  <option value="Overcharging">Overcharging / Excessive Fare</option>
                  <option value="Fake Service">Fake Service / Fraud / Tout Scam</option>
                  <option value="Misleading Information">Misleading Tour / Substandard Service</option>
                  <option value="Safety Issue">Safety Hazard / Bad Behavior</option>
                  <option value="Transport Problem">Transport Problem / Meter Refusal</option>
                  <option value="Hotel Problem">Hotel Problem / Reservation Fraud</option>
                </select>
              </div>

              {/* Provider Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Provider / Driver / Agency Name *
                </label>
                <input
                  type="text"
                  required
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  placeholder="e.g. Auto Driver (DL 1R 5542) or Agency Name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-rose-600 focus:outline-hidden"
                />
              </div>

              {/* Location & Amount Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Location / Route *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Airport to Connaught Place"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-rose-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Disputed Amount in ₹ (Optional)
                  </label>
                  <div className="relative">
                    <span className="text-slate-400 font-bold absolute left-3.5 top-1/2 -translate-y-1/2">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g. 2500"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-rose-600 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Incident Date */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Date of Incident
                </label>
                <input
                  type="date"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-rose-600 focus:outline-hidden"
                />
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Detailed Description *
                  </label>
                  <button
                    type="button"
                    onClick={handleEnhanceWithAI}
                    disabled={aiEnhanceLoading || !description.trim()}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{aiEnhanceLoading ? 'Structuring...' : '✨ Enhance with AI'}</span>
                  </button>
                </div>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what happened: what was demanded, driver behavior, meter tampering, ticket booth claims..."
                  className="w-full p-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-rose-600 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Registering Official Incident...' : 'SUBMIT OFFICIAL COMPLAINT'}</span>
              </button>
            </form>
          </div>

          {/* AI Complaint Drafting / Right Panel */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-indigo-700">
                <Sparkles className="w-4 h-4" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider">
                  AI Legal Assistant Preview
                </h3>
              </div>

              {aiDraft ? (
                <div className="space-y-3 text-xs animate-in fade-in">
                  <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-1">
                    <span className="text-[10px] font-bold text-indigo-900 uppercase">
                      Analysis Summary
                    </span>
                    <p className="font-bold text-indigo-950">{aiDraft.shortExplanation}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-extrabold">
                      Severity: {aiDraft.severityLevel}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      Structured Legal Statement
                    </span>
                    <p className="text-slate-800 leading-relaxed font-mono text-[11px] whitespace-pre-wrap">
                      {aiDraft.formalReport}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1 text-emerald-900">
                    <span className="text-[10px] font-bold uppercase text-emerald-800">
                      Useful Evidence to Provide:
                    </span>
                    <ul className="list-disc list-inside text-[11px] space-y-0.5">
                      {aiDraft.actionSteps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center space-y-2">
                  <Sparkles className="w-10 h-10 text-indigo-300 mx-auto" />
                  <h4 className="text-xs font-bold text-slate-700">Need AI Legal Structuring?</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                    Type your rough notes in the description box and click <strong>"✨ Enhance with AI"</strong> to automatically convert them into a formal legal submission.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
