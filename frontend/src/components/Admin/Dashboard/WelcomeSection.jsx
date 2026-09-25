import React from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function WelcomeSection({
  admin,
  onRefresh,
  loadingStats = false
}) {
  const greeting = getGreeting();
  const name = admin?.username ? admin.username.charAt(0).toUpperCase() + admin.username.slice(1) : 'Admin';

  return (
    <div className="admin-card p-4 sm:p-6 relative overflow-hidden transition-all">
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-500/10 text-teal-500 border border-teal-500/20 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            <span>Store Counter Active</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">
            {greeting}, {name}
          </h1>

          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1 max-w-xl">
            Here's what's happening with your store today.
          </p>
        </div>

        {onRefresh && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onRefresh}
              disabled={loadingStats}
              className="admin-btn-secondary text-xs"
              title="Refresh live metrics from server"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingStats ? 'animate-spin text-indigo-500' : ''}`} />
              <span>Refresh Metrics</span>
            </button>
          </div>
        )}
      </div>

      {/* Subtle background accent */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/[0.04] rounded-full pointer-events-none blur-2xl" />
    </div>
  );
}
