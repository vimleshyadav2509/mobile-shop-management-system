import React from 'react';
import { Plus, Package, Wrench, RefreshCw } from 'lucide-react';

export default function QuickActions({
  onOpenAddProduct,
  onNavigateTab,
  onOpenStatusModal
}) {
  const actions = [
    {
      id: 'add-product',
      title: 'Add Product',
      description: 'New or certified pre-owned',
      icon: Plus,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
      action: onOpenAddProduct
    },
    {
      id: 'update-stock',
      title: 'Update Stock',
      description: 'Manage shelf availability',
      icon: Package,
      color: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
      action: () => onNavigateTab && onNavigateTab('inventory')
    },
    {
      id: 'view-repairs',
      title: 'View Repairs',
      description: 'Counter job sheets',
      icon: Wrench,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      action: () => onNavigateTab && onNavigateTab('repairs')
    },
    {
      id: 'update-status',
      title: 'Update Status',
      description: 'Advance repair step',
      icon: RefreshCw,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      action: onOpenStatusModal
    }
  ];

  return (
    <div className="admin-card p-4 sm:p-5">
      <div className="mb-3.5">
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
          Quick Counter Actions
        </h3>
        <p className="text-[11px] text-[var(--muted-foreground)]">
          Immediate shortcuts for daily mobile shop counter tasks
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {actions.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={item.action}
              className="p-3 sm:p-3.5 rounded-xl bg-[var(--card-elevated)] hover:bg-[var(--card-hover)] border border-[var(--border)] hover:border-[var(--border-strong)] flex flex-col items-center sm:items-start text-center sm:text-left transition-all group min-h-[44px]"
            >
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center mb-2 group-hover:scale-105 transition-transform ${item.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-[var(--foreground)] group-hover:text-indigo-500 transition-colors">
                {item.title}
              </span>
              <span className="text-[10px] text-[var(--muted-foreground)] hidden sm:inline mt-0.5">
                {item.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
