import React from 'react';
import { 
  Package, 
  Smartphone, 
  AlertTriangle, 
  Wrench,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function MetricGrid({
  stats,
  loadingStats = false,
  onNavigateTab
}) {
  const totalProducts = stats?.total_products ?? 0;
  const inStockProducts = stats?.in_stock_products ?? 0;
  const lowStockProducts = stats?.low_stock_products ?? 0;
  const outOfStockProducts = stats?.out_of_stock_products ?? 0;
  const totalRepairs = stats?.total_repairs ?? 0;
  const pendingRepairs = stats?.pending_repairs ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* 1. Total Catalog Inventory */}
      <div 
        onClick={() => onNavigateTab && onNavigateTab('products')}
        className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs hover:border-slate-700 transition cursor-pointer flex flex-col justify-between"
      >
        <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
          <span>Catalog Inventory</span>
          <Package className="w-4 h-4 text-primary-400" />
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-white font-['Poppins']">
            {loadingStats ? '...' : `${totalProducts} Devices`}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{inStockProducts} in stock & available</span>
          </div>
        </div>
      </div>

      {/* 2. Low Stock Alerts */}
      <div 
        onClick={() => onNavigateTab && onNavigateTab('inventory')}
        className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs hover:border-slate-700 transition cursor-pointer flex flex-col justify-between"
      >
        <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
          <span>Low Stock Warning</span>
          <AlertTriangle className="w-4 h-4 text-amber-500" />
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-amber-400 font-['Poppins']">
            {loadingStats ? '...' : `${lowStockProducts} Models`}
          </div>
          <div className="mt-1 text-xs text-amber-300/80 font-normal">
            Inventory count 1 to 5 units
          </div>
        </div>
      </div>

      {/* 3. Out of Stock / Coming Soon */}
      <div 
        onClick={() => onNavigateTab && onNavigateTab('inventory')}
        className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs hover:border-slate-700 transition cursor-pointer flex flex-col justify-between"
      >
        <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
          <span>Out of Stock</span>
          <Smartphone className="w-4 h-4 text-rose-400" />
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-rose-400 font-['Poppins']">
            {loadingStats ? '...' : `${outOfStockProducts} Models`}
          </div>
          <div className="mt-1 text-xs text-slate-400 font-normal">
            Replenish stock or mark Coming Soon
          </div>
        </div>
      </div>

      {/* 4. Active Repairs */}
      <div 
        onClick={() => onNavigateTab && onNavigateTab('repairs')}
        className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs hover:border-slate-700 transition cursor-pointer flex flex-col justify-between"
      >
        <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
          <span>Active Repair Jobs</span>
          <Wrench className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-white font-['Poppins']">
            {loadingStats ? '...' : `${pendingRepairs} In Progress`}
          </div>
          <div className="mt-1 text-xs text-slate-400 font-normal">
            Total Logged: {totalRepairs} job sheets
          </div>
        </div>
      </div>

    </div>
  );
}
