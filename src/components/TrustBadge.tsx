import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface TrustBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showLabel?: boolean;
  tier?: string;
  showBreakdownIcon?: boolean;
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({
  score,
  size = 'md',
  showLabel = true,
  tier,
  showBreakdownIcon = true
}) => {
  const getTier = (s: number) => {
    if (tier) return tier;
    if (s >= 90) return 'Highly Trusted';
    if (s >= 75) return 'Trusted';
    if (s >= 50) return 'Moderate';
    return 'Needs Caution';
  };

  const getColors = (s: number) => {
    if (s >= 90) {
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
        circleStroke: '#059669',
        circleBg: '#ecfdf5',
        badgeBg: 'bg-emerald-600 text-white',
        text: 'text-emerald-700',
        ring: 'ring-emerald-500'
      };
    }
    if (s >= 75) {
      return {
        bg: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20',
        circleStroke: '#2563eb',
        circleBg: '#eff6ff',
        badgeBg: 'bg-blue-600 text-white',
        text: 'text-blue-700',
        ring: 'ring-blue-500'
      };
    }
    if (s >= 50) {
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
        circleStroke: '#d97706',
        circleBg: '#fffbeb',
        badgeBg: 'bg-amber-600 text-white',
        text: 'text-amber-700',
        ring: 'ring-amber-500'
      };
    }
    return {
      bg: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',
      circleStroke: '#e11d48',
      circleBg: '#fff1f2',
      badgeBg: 'bg-rose-600 text-white',
      text: 'text-rose-700',
      ring: 'ring-rose-500'
    };
  };

  const tierLabel = getTier(score);
  const colors = getColors(score);

  if (size === 'hero' || size === 'lg') {
    const radius = size === 'hero' ? 48 : 34;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const svgSize = size === 'hero' ? 120 : 84;

    return (
      <div className="flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
          <svg width={svgSize} height={svgSize} className="transform -rotate-90">
            <circle
              cx={svgSize / 2}
              cy={svgSize / 2}
              r={radius}
              stroke="#e2e8f0"
              strokeWidth={size === 'hero' ? '8' : '6'}
              fill="transparent"
            />
            <circle
              cx={svgSize / 2}
              cy={svgSize / 2}
              r={radius}
              stroke={colors.circleStroke}
              strokeWidth={size === 'hero' ? '8' : '6'}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className={`font-bold ${size === 'hero' ? 'text-3xl' : 'text-xl'} text-slate-800 tracking-tight`}>
              {score}
            </span>
            <span className="text-[11px] font-semibold text-slate-400">/ 100</span>
          </div>
        </div>
        {showLabel && (
          <div className="mt-2.5 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border shadow-xs"
               style={{ borderColor: `${colors.circleStroke}33`, color: colors.circleStroke, backgroundColor: colors.circleBg }}>
            {score >= 75 ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5" />
            )}
            <span>{tierLabel}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border shadow-xs text-xs font-semibold ${colors.bg}`}
    >
      {showBreakdownIcon && (
        score >= 75 ? (
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
        ) : (
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
        )
      )}
      <span className="font-bold">{score}/100</span>
      {showLabel && <span className="opacity-90">• {tierLabel}</span>}
    </div>
  );
};
