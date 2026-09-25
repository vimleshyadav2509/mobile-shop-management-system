import React, { useState } from 'react';
import {
  Wrench,
  Package,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  TrendingUp
} from 'lucide-react';

export default function SalesAnalyticsChart({ stats, repairs = [], products = [] }) {
  const [viewMode, setViewMode] = useState('repairs'); // 'repairs' | 'inventory'

  // Extract status breakdown from stats or fallback to live repairs list
  const rawBreakdown = stats?.status_breakdown || {};
  
  const repairStages = [
    {
      key: 'Received',
      label: 'Received / Diagnosing',
      count: (rawBreakdown['Received'] || 0) + (rawBreakdown['Diagnosing'] || 0),
      color: 'bg-blue-500',
      badge: 'border-blue-500/30 text-blue-400 bg-blue-500/10'
    },
    {
      key: 'In Repair',
      label: 'In Active Repair',
      count: rawBreakdown['In Repair'] || 0,
      color: 'bg-cyan-500',
      badge: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10'
    },
    {
      key: 'Waiting for Approval',
      label: 'Waiting for Customer Approval',
      count: rawBreakdown['Waiting for Approval'] || 0,
      color: 'bg-amber-500',
      badge: 'border-amber-500/30 text-amber-400 bg-amber-500/10'
    },
    {
      key: 'Waiting for Parts',
      label: 'Waiting for Parts / Folders',
      count: rawBreakdown['Waiting for Parts'] || 0,
      color: 'bg-purple-500',
      badge: 'border-purple-500/30 text-purple-400 bg-purple-500/10'
    },
    {
      key: 'Ready for Pickup',
      label: 'Ready for Customer Pickup',
      count: rawBreakdown['Ready for Pickup'] || 0,
      color: 'bg-emerald-500',
      badge: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
    },
    {
      key: 'Delivered',
      label: 'Completed & Delivered',
      count: rawBreakdown['Delivered'] || 0,
      color: 'bg-slate-500',
      badge: 'border-slate-500/30 text-slate-400 bg-slate-500/10'
    }
  ];

  const totalRepairs = stats?.total_repairs || repairs.length || 1;

  // Inventory distribution
  const inStockCount = stats?.in_stock_products ?? products.filter(p => p.in_stock && (p.stock_count > 5 || p.stock_count === null)).length;
  const lowStockCount = stats?.low_stock_products ?? products.filter(p => p.stock_count > 0 && p.stock_count <= 5).length;
  const outOfStockCount = stats?.out_of_stock_products ?? products.filter(p => !p.in_stock || p.stock_count === 0).length;
  const totalCatalog = stats?.total_products || products.length || 1;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
      
      {/* Header with Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-white font-['Poppins'] flex items-center gap-2">
            {viewMode === 'repairs' ? (
              <>
                <Wrench className="w-4 h-4 text-cyan-400" />
                <span>Service Center Lifecycle Distribution</span>
              </>
            ) : (
              <>
                <Package className="w-4 h-4 text-emerald-400" />
                <span>Inventory Stock Distribution</span>
              </>
            )}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time status tracking loaded directly from SQLite database
          </p>
        </div>

        {/* View Toggle */}
        <div className="inline-flex p-0.5 rounded-lg bg-slate-800 border border-slate-700 text-xs">
          <button
            type="button"
            onClick={() => setViewMode('repairs')}
            className={`px-3 py-1 rounded-md font-semibold transition ${
              viewMode === 'repairs' ? 'bg-slate-700 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Repairs Pipeline
          </button>
          <button
            type="button"
            onClick={() => setViewMode('inventory')}
            className={`px-3 py-1 rounded-md font-semibold transition ${
              viewMode === 'inventory' ? 'bg-slate-700 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Stock Health
          </button>
        </div>
      </div>

      {/* Repairs Pipeline Mode */}
      {viewMode === 'repairs' ? (
        <div className="space-y-3.5">
          {repairStages.map((stage) => {
            const percentage = Math.round((stage.count / (totalRepairs || 1)) * 100);
            return (
              <div key={stage.key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-300">{stage.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${stage.badge}`}>
                      {stage.count} jobs
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">{percentage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${stage.color}`}
                    style={{ width: `${Math.max(percentage, stage.count > 0 ? 5 : 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Inventory Health Mode */
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
              <span className="text-[11px] font-semibold text-emerald-400 block uppercase">{'In Stock (>5)'}</span>
              <span className="text-2xl font-bold text-white mt-1 block">{inStockCount}</span>
              <span className="text-[10px] text-emerald-300/70">Ready for Counter Sale</span>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
              <span className="text-[11px] font-semibold text-amber-400 block uppercase">Low Stock (1-5)</span>
              <span className="text-2xl font-bold text-white mt-1 block">{lowStockCount}</span>
              <span className="text-[10px] text-amber-300/70">Reorder Required</span>
            </div>
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-center">
              <span className="text-[11px] font-semibold text-rose-400 block uppercase">Out of Stock (0)</span>
              <span className="text-2xl font-bold text-white mt-1 block">{outOfStockCount}</span>
              <span className="text-[10px] text-rose-300/70">Empty Racks</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Overall Catalog Available Ratio</span>
              <span className="font-semibold text-white">
                {Math.round(((inStockCount + lowStockCount) / (totalCatalog || 1)) * 100)}% Available
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-800 flex overflow-hidden">
              <div
                className="bg-emerald-500 h-full"
                style={{ width: `${(inStockCount / totalCatalog) * 100}%` }}
                title="In Stock"
              />
              <div
                className="bg-amber-500 h-full"
                style={{ width: `${(lowStockCount / totalCatalog) * 100}%` }}
                title="Low Stock"
              />
              <div
                className="bg-rose-500 h-full"
                style={{ width: `${(outOfStockCount / totalCatalog) * 100}%` }}
                title="Out of Stock"
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span>Verified SQLite Operational Pipeline</span>
        <span className="font-mono text-slate-300">Phase 4 Active</span>
      </div>

    </div>
  );
}
