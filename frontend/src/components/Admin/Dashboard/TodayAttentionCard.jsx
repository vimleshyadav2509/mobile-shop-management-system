import React from 'react';
import { 
  AlertTriangle, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  Boxes,
  Wrench,
  HelpCircle
} from 'lucide-react';

export default function TodayAttentionCard({ products = [], repairs = [], onNavigateTab }) {
  // Dynamically derive priority items from real data
  const lowStockItems = products.filter(
    (p) => (p.stock_count > 0 && p.stock_count <= 5) || p.stock_status === 'LOW STOCK'
  );
  
  const approvalRepairs = repairs.filter(
    (r) => (r.status || '').toLowerCase() === 'waiting for approval'
  );

  const readyRepairs = repairs.filter(
    (r) => (r.status || '').toLowerCase() === 'ready for pickup'
  );

  const outOfStockItems = products.filter(
    (p) => !p.in_stock || p.stock_count === 0 || p.stock_status === 'OUT OF STOCK'
  );

  const dynamicItems = [];

  if (approvalRepairs.length > 0) {
    dynamicItems.push({
      id: 'att-approval',
      icon: HelpCircle,
      iconColor: 'text-amber-400 bg-amber-400/10',
      title: `${approvalRepairs.length} Repair${approvalRepairs.length > 1 ? 's' : ''} Waiting for Customer Approval`,
      detail: approvalRepairs.map(r => `${r.job_sheet_id} (${r.device_brand} ${r.device_model})`).slice(0, 2).join(', '),
      actionTab: 'repairs',
      actionLabel: 'Review Jobs'
    });
  }

  if (readyRepairs.length > 0) {
    dynamicItems.push({
      id: 'att-ready',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400 bg-emerald-400/10',
      title: `${readyRepairs.length} Device${readyRepairs.length > 1 ? 's' : ''} Ready for Customer Pickup`,
      detail: readyRepairs.map(r => `${r.job_sheet_id} (${r.customer_name})`).slice(0, 2).join(', '),
      actionTab: 'repairs',
      actionLabel: 'Deliver'
    });
  }

  if (lowStockItems.length > 0) {
    dynamicItems.push({
      id: 'att-low-stock',
      icon: AlertTriangle,
      iconColor: 'text-amber-400 bg-amber-400/10',
      title: `Low Stock Warning: ${lowStockItems.length} Model${lowStockItems.length > 1 ? 's' : ''}`,
      detail: lowStockItems.map(p => `${p.title || p.model} (${p.stock_count ?? 1} left)`).slice(0, 2).join(', '),
      actionTab: 'inventory',
      actionLabel: 'Reorder'
    });
  }

  if (outOfStockItems.length > 0 && dynamicItems.length < 3) {
    dynamicItems.push({
      id: 'att-out-stock',
      icon: Boxes,
      iconColor: 'text-rose-400 bg-rose-400/10',
      title: `${outOfStockItems.length} Out of Stock Product${outOfStockItems.length > 1 ? 's' : ''}`,
      detail: outOfStockItems.map(p => p.title || p.model).slice(0, 2).join(', '),
      actionTab: 'inventory',
      actionLabel: 'Restock'
    });
  }

  // Fallback if everything is in tip-top shape
  if (dynamicItems.length === 0) {
    dynamicItems.push({
      id: 'att-healthy',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400 bg-emerald-400/10',
      title: 'Store Operations Running Smoothly',
      detail: 'All inventory is adequately stocked and repair tickets are proceeding normally.',
      actionTab: 'products',
      actionLabel: 'Catalog'
    });
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-['Poppins']">
            Today's Operational Attention
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {dynamicItems.length} Real Item{dynamicItems.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Dynamic Actionable List */}
      <div className="space-y-2.5">
        {dynamicItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => onNavigateTab && onNavigateTab(item.actionTab)}
              className="p-3 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className={`p-2 rounded-md ${item.iconColor} shrink-0 mt-0.5`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white group-hover:text-primary-400 transition-colors truncate">
                    {item.title}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {item.detail}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-white shrink-0">
                <span className="hidden sm:inline text-[11px]">{item.actionLabel}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition" />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
