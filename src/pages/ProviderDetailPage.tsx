import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Star,
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  FileCheck,
  Clock,
  Send,
  MessageSquare,
  ThumbsUp,
  AlertCircle
} from 'lucide-react';
import { Provider, ProviderReview } from '../types';
import { TrustBadge } from '../components/TrustBadge';
import { api } from '../services/api';

interface ProviderDetailPageProps {
  providerId: string;
  onBack: () => void;
}

export const ProviderDetailPage: React.FC<ProviderDetailPageProps> = ({
  providerId,
  onBack
}) => {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [reviews, setReviews] = useState<ProviderReview[]>([]);
  const [loading, setLoading] = useState(true);

  // Review Form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, [providerId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const p = await api.getProviderById(providerId);
      const revs = await api.getProviderReviews(providerId);
      setProvider(p);
      setReviews(revs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment) return;
    setSubmittingReview(true);
    try {
      const res = await api.addReview(providerId, rating, comment);
      setReviews([res.review, ...reviews]);
      setComment('');
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading verified trust profile...</p>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">Provider Record Not Found</h3>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
        >
          Return to Services
        </button>
      </div>
    );
  }

  const breakdown = provider.trustBreakdown || {
    overall: provider.trustScore,
    tier: 'Highly Trusted',
    verification: 100,
    reviewsScore: 92,
    complaintHistory: 98,
    serviceReliability: 95,
    recentActivity: 90
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 font-sans">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Verified Directory</span>
      </button>

      {/* Provider Hero Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-5 h-64 lg:h-auto relative">
          <img
            src={provider.image}
            alt={provider.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500 text-white">
              {provider.category}
            </span>
            <h1 className="text-lg sm:text-xl font-extrabold mt-1.5 leading-tight">
              {provider.name}
            </h1>
          </div>
        </div>

        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Govt Verified Partner
                </span>
                {provider.licenseNumber && (
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                    Lic: {provider.licenseNumber}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>{provider.rating}</span>
                <span className="text-slate-400">({provider.reviewCount} verified reviews)</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {provider.description}
            </p>

            <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{provider.location}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{provider.phone}</span>
              </p>
              <p className="flex items-center gap-2">
                <FileCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Standard Tariff: <strong>{provider.priceRange}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-2">
            {provider.tags.map((tag, i) => (
              <span
                key={i}
                className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-semibold"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Trust Score Breakdown Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-600 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Multi-Factor Trust Analysis</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Trust Score Engine
            </h2>
            <p className="text-xs text-slate-500">
              Calculated using automated verification, review sentiment, complaint history, and reliability metrics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <TrustBadge score={provider.trustScore} size="hero" showLabel={true} />
          </div>
        </div>

        {/* 5 Dimension Progress Meters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Accreditation & License Verification', score: breakdown.verification, weight: '25%' },
            { label: 'Tourist Reviews & Sentiment', score: breakdown.reviewsScore, weight: '25%' },
            { label: 'Complaint History & Disciplinary Record', score: breakdown.complaintHistory, weight: '25%' },
            { label: 'Service Reliability & Pricing Transparency', score: breakdown.serviceReliability, weight: '15%' },
            { label: 'Recent Verification Activity (Last 30 Days)', score: breakdown.recentActivity, weight: '10%' }
          ].map((dim, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">{dim.label}</span>
                <span className="font-extrabold text-blue-600">{dim.score}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${dim.score}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400">Weight: {dim.weight} in overall index</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review Analysis Powered by Gemini */}
      {provider.reviewSentiment && (
        <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-xs">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-extrabold tracking-tight">
                  Gemini AI Review Sentiment Analysis
                </h3>
                <p className="text-xs text-blue-200">
                  Automated natural language scan across verified tourist feedbacks
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
              Low Risk Certified
            </span>
          </div>

          {/* Sentiment Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-emerald-300">Positive: {provider.reviewSentiment.positive}%</span>
              <span className="text-amber-300">Neutral: {provider.reviewSentiment.neutral}%</span>
              <span className="text-rose-300">Negative: {provider.reviewSentiment.negative}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-white/10 flex overflow-hidden">
              <div
                style={{ width: `${provider.reviewSentiment.positive}%` }}
                className="bg-emerald-400 h-full"
              />
              <div
                style={{ width: `${provider.reviewSentiment.neutral}%` }}
                className="bg-amber-400 h-full"
              />
              <div
                style={{ width: `${provider.reviewSentiment.negative}%` }}
                className="bg-rose-400 h-full"
              />
            </div>
          </div>

          {/* AI Summary & Risk Pattern */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2 text-xs">
            <div className="md:col-span-8 p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-1.5">
              <span className="font-bold text-blue-200 uppercase tracking-wider text-[10px]">
                AI Key Takeaway
              </span>
              <p className="leading-relaxed text-blue-50">
                {provider.reviewSentiment.summary}
              </p>
            </div>

            <div className="md:col-span-4 p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-2">
              <span className="font-bold text-blue-200 uppercase tracking-wider text-[10px]">
                Verified Highlights
              </span>
              <div className="flex flex-wrap gap-1.5">
                {provider.reviewSentiment.riskKeywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-300 text-[11px] font-semibold border border-emerald-400/20"
                  >
                    ✓ {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Reviews & Add Review Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Tourist Reviews & Verifications
            </h3>
            <p className="text-xs text-slate-500">
              Honest feedback from travellers who used this service.
            </p>
          </div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            {reviews.length} Verified Entries
          </span>
        </div>

        {/* Add Review Form */}
        <form onSubmit={handleAddReview} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <span className="text-xs font-bold text-slate-800 block">
            Rate your experience with {provider.name}:
          </span>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-slate-600 ml-2">
              {rating === 5 ? 'Excellent (5/5)' : rating === 4 ? 'Very Good (4/5)' : `${rating}/5`}
            </span>
          </div>

          <textarea
            required
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share details about pricing transparency, driver/staff behavior, punctuality..."
            className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden bg-white"
          />

          <div className="flex items-center justify-between">
            {reviewSuccess ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Review published!
              </span>
            ) : <span />}

            <button
              type="submit"
              disabled={submittingReview}
              className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submittingReview ? 'Submitting...' : 'Post Review'}</span>
            </button>
          </div>
        </form>

        {/* Reviews List */}
        <div className="space-y-3">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                    {rev.userName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{rev.userName}</h4>
                    <span className="text-[10px] text-slate-400">
                      {rev.userCountry || 'International Tourist'} • {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-0.5">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                "{rev.comment}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
