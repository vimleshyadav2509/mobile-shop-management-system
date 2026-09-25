import React from 'react';

const ACCENT_SCHEMES = {
  indigo: {
    iconBg: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    badge: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
  },
  teal: {
    iconBg: 'bg-teal-500/10 text-teal-500 border-teal-500/20',
    badge: 'bg-teal-500/10 text-teal-500 border-teal-500/20'
  },
  amber: {
    iconBg: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
  },
  purple: {
    iconBg: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    badge: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
  }
};

export default function MetricCard({
  title,
  value,
  icon: Icon,
  badge = 'Live Catalog',
  color = 'indigo',
  subtitle,
  loading = false,
  onClick
}) {
  const scheme = ACCENT_SCHEMES[color] || ACCENT_SCHEMES.indigo;

  return (
    <div
      onClick={onClick}
      className={`admin-card p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden transition-all duration-200 hover:scale-[1.01] ${
        onClick ? 'cursor-pointer hover:border-[var(--border-strong)]' : ''
      }`}
    >
      {/* Top Row: Icon + Badge */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${scheme.iconBg}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
        {badge && (
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border tracking-wide uppercase ${scheme.badge}`}>
            {badge}
          </span>
        )}
      </div>

      {/* Main Metric Value */}
      <div>
        <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
          {title}
        </h4>

        <div className="mt-1 flex items-baseline gap-2">
          {loading ? (
            <div className="h-8 w-16 bg-[var(--muted)] animate-pulse rounded-lg mt-1" />
          ) : (
            <span className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
              {value}
            </span>
          )}
        </div>

        {subtitle && (
          <p className="text-[11px] sm:text-xs text-[var(--muted-foreground)] mt-1.5 line-clamp-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
