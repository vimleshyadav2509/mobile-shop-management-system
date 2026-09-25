import React from 'react';

const colorMap = {
  blue: {
    iconBg: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
    badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20'
  },
  emerald: {
    iconBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  },
  amber: {
    iconBg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  },
  purple: {
    iconBg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
    badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
  },
  rose: {
    iconBg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
    badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  }
};

export default function AdminKPI({
  title,
  value,
  icon: Icon,
  badge = 'Live',
  badgeColor = 'blue',
  subtitle,
  loading = false,
  onClick
}) {
  const scheme = colorMap[badgeColor] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`admin-card p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-sky-500/40 hover:-translate-y-0.5' : ''
      }`}
    >
      {/* Top row: Icon & Tag */}
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

      {/* Metric details */}
      <div>
        <h4 className="text-xs font-medium text-zinc-400 tracking-wide uppercase">
          {title}
        </h4>
        
        <div className="mt-1 flex items-baseline gap-2">
          {loading ? (
            <div className="h-8 w-20 bg-zinc-800 animate-pulse rounded-lg mt-1" />
          ) : (
            <span className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
              {value}
            </span>
          )}
        </div>

        {subtitle && (
          <p className="text-[11px] sm:text-xs text-zinc-500 mt-1.5 line-clamp-1">
            {subtitle}
          </p>
        )}
      </div>

      {/* Subtle top-right accent glow */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/[0.02] rounded-full pointer-events-none blur-xl" />
    </div>
  );
}
