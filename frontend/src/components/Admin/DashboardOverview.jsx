import React, { useState } from 'react';
import MetricGrid from './Dashboard/MetricGrid';
import TodayAttentionCard from './Dashboard/TodayAttentionCard';
import SalesAnalyticsChart from './Dashboard/SalesAnalyticsChart';
import InventoryOrdersTable from './Dashboard/InventoryOrdersTable';
import QuickStockModal from './Dashboard/QuickStockModal';
import { Plus, RefreshCw } from 'lucide-react';

export default function DashboardOverview({
  admin,
  stats,
  loadingStats,
  onRefresh,
  products = [],
  repairs = [],
  onNavigateTab,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct
}) {
  const [showStockModal, setShowStockModal] = useState(false);

  return (
    <div className="space-y-6">
      
      {/* 1. Header: Clean Software Title & Useful Description */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Poppins']">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Good morning, {admin?.username || 'Admin'}. Here is your store summary and priority tasks for today.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loadingStats}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingStats ? 'animate-spin text-primary-400' : ''}`} />
              <span>Sync</span>
            </button>
          )}

          <button
            onClick={() => setShowStockModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary-700 hover:bg-primary-600 text-white font-semibold text-xs shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Stock Entry</span>
          </button>
        </div>
      </div>

      {/* 2. Restrained KPI Row (4 simple cards) */}
      <MetricGrid
        stats={stats}
        loadingStats={loadingStats}
        onNavigateTab={onNavigateTab}
      />

      {/* 3. Two-Column Operational Layout: Today's Attention + Real Operations Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Attention (5 cols on large screens) */}
        <div className="lg:col-span-5">
          <TodayAttentionCard 
            products={products}
            repairs={repairs}
            onNavigateTab={onNavigateTab} 
          />
        </div>

        {/* Real Operational Lifecycle Distribution & Stock Health (7 cols on large screens) */}
        <div className="lg:col-span-7">
          <SalesAnalyticsChart 
            stats={stats}
            repairs={repairs}
            products={products}
          />
        </div>
      </div>

      {/* 4. Smartphone Inventory & Orders Table */}
      <InventoryOrdersTable
        products={products}
        onUpdateProduct={onUpdateProduct}
        onDeleteProduct={onDeleteProduct}
        onOpenAddModal={() => setShowStockModal(true)}
      />

      {/* 5. Quick Stock Entry Modal */}
      <QuickStockModal
        isOpen={showStockModal}
        onClose={() => setShowStockModal(false)}
        onAddProduct={onAddProduct}
      />

    </div>
  );
}
