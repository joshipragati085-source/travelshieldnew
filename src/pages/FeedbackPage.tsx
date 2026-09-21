import React, { useState } from 'react';
import {
  Star,
  ShieldCheck,
  Send,
  CheckCircle2,
  Heart,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

export const FeedbackPage: React.FC = () => {
  const [rating, setRating] = useState(5);
  const [wasPriceFair, setWasPriceFair] = useState(true);
  const [wasServiceTrustworthy, setWasServiceTrustworthy] = useState(true);
  const [didFeelSafe, setDidFeelSafe] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.submitFeedback({
        rating,
        wasPriceFair,
        wasServiceTrustworthy,
        didFeelSafe,
        comment
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12 font-sans">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-10 text-white shadow-xl text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
          <Heart className="w-3.5 h-3.5 fill-emerald-400" />
          <span>Continuous Tourism Quality Council</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Tourist Experience Feedback
        </h1>
        <p className="text-xs sm:text-sm text-blue-100/90 max-w-lg mx-auto leading-relaxed">
          Your feedback helps the Ministry of Tourism, Tourist Police cells, and certified transport unions enhance safety and service standards for all travellers.
        </p>
      </div>

      {submitted ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-md text-center space-y-4 animate-in zoom-in-95">
          <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Thank You for Your Feedback!</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Your honest rating and suggestions have been shared with the TravelShield Tourism Safety Council.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setComment('');
            }}
            className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
          >
            Submit Another Review
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Safety Rating */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
              1. Overall Experience & Safety Rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating ? 'text-emerald-500 fill-emerald-500' : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-slate-700 ml-2">
                {rating === 5 ? 'Exceptional (5/5)' : rating === 4 ? 'Very Good (4/5)' : `${rating}/5`}
              </span>
            </div>
          </div>

          {/* Experience Questions */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
              2. Key Verification Indicators
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-slate-800">Felt Safe Throughout</span>
                <input
                  type="checkbox"
                  checked={didFeelSafe}
                  onChange={(e) => setDidFeelSafe(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
              </label>

              <label className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-slate-800">Prices Were Fair</span>
                <input
                  type="checkbox"
                  checked={wasPriceFair}
                  onChange={(e) => setWasPriceFair(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
              </label>

              <label className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-slate-800">Services Were Trusted</span>
                <input
                  type="checkbox"
                  checked={wasServiceTrustworthy}
                  onChange={(e) => setWasServiceTrustworthy(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
              </label>
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
              3. Share your detailed experience or suggestions:
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Fair Price checker saved me ₹1,500 on airport taxi; polite verified driver; clear translation..."
              className="w-full p-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Submitting...' : 'SUBMIT FEEDBACK'}</span>
          </button>
        </form>
      )}
    </div>
  );
};
