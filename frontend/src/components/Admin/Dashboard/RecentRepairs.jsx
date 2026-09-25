import React from 'react';
import { ChevronRight, Wrench, Phone } from 'lucide-react';

function getRepairStatusBadge(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('ready')) {
    return {
      label: 'Ready for Pickup',
      badge: 'bg-teal-500/10 text-teal-500 border-teal-500/20'
    };
  }
  if (s.includes('repair')) {
    return {
      label: 'In Repair',
      badge: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
    };
  }
  if (s.includes('diagnos')) {
    return {
      label: 'Diagnosing',
      badge: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    };
  }
  if (s.includes('deliver')) {
    return {
      label: 'Delivered',
      badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    };
  }
  return {
    label: 'Received',
    badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  };
}

export default function RecentRepairs({
  repairs = [],
  onNavigateTab
}) {
  const recentRepairs = repairs.slice(0, 4);

  return (
    <div className="admin-card p-4 sm:p-5 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-[var(--border)]">
          <div>
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
              Recent Job Sheets
            </h3>
            <p className="text-[11px] text-[var(--muted-foreground)]">
              Live mobile repair counter tracking
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('repairs')}
            className="text-xs text-indigo-500 hover:text-indigo-400 font-semibold inline-flex items-center gap-1"
          >
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentRepairs.length === 0 ? (
          <div className="py-8 text-center text-[var(--muted-foreground)] text-xs">
            <Wrench className="w-6 h-6 mx-auto mb-2 opacity-40" />
            <p>No recent repair jobs.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[var(--muted-foreground)] border-b border-[var(--border)]">
                    <th className="pb-2 font-semibold">Job ID</th>
                    <th className="pb-2 font-semibold">Customer</th>
                    <th className="pb-2 font-semibold">Device</th>
                    <th className="pb-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {recentRepairs.map((r) => {
                    const badge = getRepairStatusBadge(r.status);
                    return (
                      <tr key={r.job_sheet_id} className="hover:bg-[var(--card-hover)] transition-colors">
                        <td className="py-2.5 font-bold text-indigo-400">
                          {r.job_sheet_id}
                        </td>
                        <td className="py-2.5">
                          <p className="font-semibold text-[var(--foreground)]">{r.customer_name}</p>
                          <p className="text-[10px] text-[var(--muted-foreground)]">{r.customer_phone}</p>
                        </td>
                        <td className="py-2.5 text-[var(--foreground)] font-medium">
                          {r.device_brand} {r.device_model}
                        </td>
                        <td className="py-2.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.badge}`}>
                            ● {badge.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Transformation: Spec-exact structure */}
            <div className="md:hidden space-y-2.5">
              {recentRepairs.map((r) => {
                const badge = getRepairStatusBadge(r.status);
                return (
                  <div
                    key={r.job_sheet_id}
                    onClick={() => onNavigateTab && onNavigateTab('repairs')}
                    className="p-3.5 rounded-xl bg-[var(--card-elevated)] border border-[var(--border)] flex flex-col gap-1.5 active:scale-[0.99] transition-transform cursor-pointer"
                  >
                    {/* Top Row: Job ID + Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-400">
                        {r.job_sheet_id}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.badge}`}>
                        ● {badge.label}
                      </span>
                    </div>

                    {/* Customer & Phone */}
                    <div className="mt-1">
                      <p className="text-xs font-bold text-[var(--foreground)]">
                        {r.customer_name}
                      </p>
                      <p className="text-[11px] text-[var(--muted-foreground)]">
                        +91 {r.customer_phone}
                      </p>
                    </div>

                    {/* Device */}
                    <p className="text-xs text-[var(--foreground)] font-medium pt-1 border-t border-[var(--border)] mt-0.5">
                      {r.device_brand} {r.device_model}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
