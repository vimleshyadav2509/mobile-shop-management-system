import React, { useState } from 'react';
import {
  Boxes,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Package,
  Layers,
  ArrowUpDown,
  Plus,
  Minus,
  Sparkles,
  HelpCircle
} from 'lucide-react';

export default function InventoryManager({
  products = [],
  onUpdateProduct
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState(null);

  // Compute counts
  const inStockCount = products.filter(
    (p) => p.in_stock && (p.stock_count > 5 || (p.stock_status === 'IN STOCK' && p.stock_count > 5))
  ).length;
  
  const lowStockCount = products.filter(
    (p) => (p.stock_count > 0 && p.stock_count <= 5) || p.stock_status === 'LOW STOCK'
  ).length;
  
  const outOfStockCount = products.filter(
    (p) => (!p.in_stock || p.stock_count === 0 || p.stock_status === 'OUT OF STOCK') && p.stock_status !== 'COMING SOON'
  ).length;

  const comingSoonCount = products.filter(
    (p) => p.stock_status === 'COMING SOON'
  ).length;

  const handleStockCountChange = async (product, newCount) => {
    const val = Math.max(0, parseInt(newCount, 10) || 0);
    setUpdatingId(product.id);
    try {
      let nextStatus = product.stock_status;
      if (nextStatus !== 'COMING SOON') {
        if (val === 0) nextStatus = 'OUT OF STOCK';
        else if (val <= 5) nextStatus = 'LOW STOCK';
        else nextStatus = 'IN STOCK';
      }
      await onUpdateProduct({
        ...product,
        stock_count: val,
        stock_status: nextStatus,
        in_stock: val > 0 && nextStatus !== 'OUT OF STOCK'
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSetComingSoon = async (product) => {
    setUpdatingId(product.id);
    try {
      const isCurrentlyComing = product.stock_status === 'COMING SOON';
      await onUpdateProduct({
        ...product,
        stock_status: isCurrentlyComing ? (product.stock_count > 5 ? 'IN STOCK' : product.stock_count > 0 ? 'LOW STOCK' : 'OUT OF STOCK') : 'COMING SOON',
        in_stock: !isCurrentlyComing ? false : (product.stock_count > 0)
      });
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtered list
  const filteredProducts = products.filter((p) => {
    const matchesSearch = 
      (p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.brand || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.model || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'IN_STOCK') {
      return p.in_stock && p.stock_count > 5 && p.stock_status !== 'COMING SOON';
    }
    if (statusFilter === 'LOW_STOCK') {
      return (p.stock_count > 0 && p.stock_count <= 5) || p.stock_status === 'LOW STOCK';
    }
    if (statusFilter === 'OUT_OF_STOCK') {
      return (!p.in_stock || p.stock_count === 0 || p.stock_status === 'OUT OF STOCK') && p.stock_status !== 'COMING SOON';
    }
    if (statusFilter === 'COMING_SOON') {
      return p.stock_status === 'COMING SOON';
    }
    return true;
  });

  const getStatusBadge = (p) => {
    if (p.stock_status === 'COMING SOON') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-purple-500/10 text-purple-400 border-purple-500/30">
          <Sparkles className="w-3 h-3" /> Coming Soon
        </span>
      );
    }
    if (!p.in_stock || p.stock_count === 0 || p.stock_status === 'OUT OF STOCK') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-rose-500/10 text-rose-400 border-rose-500/30">
          ● Out of Stock (0)
        </span>
      );
    }
    if ((p.stock_count > 0 && p.stock_count <= 5) || p.stock_status === 'LOW STOCK') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-amber-500/10 text-amber-400 border-amber-500/30">
          <AlertTriangle className="w-3 h-3" /> Low Stock ({p.stock_count})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
        <CheckCircle2 className="w-3 h-3" /> In Stock ({p.stock_count})
      </span>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-card-fade">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--border)]">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[var(--foreground)] tracking-tight font-['Poppins']">
            Live Inventory & Shelf Stock Control
          </h2>
          <p className="text-xs text-[var(--muted-foreground)]">
            Automated stock calculations: In Stock (&gt;5), Low Stock Warning (1-5), Out of Stock (0), Coming Soon.
          </p>
        </div>
      </div>

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div 
          onClick={() => setStatusFilter('ALL')}
          className={`admin-card p-4 cursor-pointer transition border ${statusFilter === 'ALL' ? 'border-primary-500 bg-slate-800/80' : 'hover:border-slate-700'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Total Catalog</span>
            <Package className="w-4 h-4 text-primary-400" />
          </div>
          <p className="text-2xl font-black text-[var(--foreground)] mt-2">{products.length}</p>
          <p className="text-[10px] text-[var(--muted-foreground)] mt-1">All catalog devices</p>
        </div>

        <div 
          onClick={() => setStatusFilter('IN_STOCK')}
          className={`admin-card p-4 cursor-pointer transition border ${statusFilter === 'IN_STOCK' ? 'border-emerald-500 bg-emerald-950/20' : 'hover:border-slate-700'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">In Stock (&gt;5)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">{inStockCount}</p>
          <p className="text-[10px] text-[var(--muted-foreground)] mt-1">Ample inventory on display</p>
        </div>

        <div 
          onClick={() => setStatusFilter('LOW_STOCK')}
          className={`admin-card p-4 cursor-pointer transition border ${statusFilter === 'LOW_STOCK' ? 'border-amber-500 bg-amber-950/20' : 'hover:border-slate-700'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">Low Stock (1-5)</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 mt-2">{lowStockCount}</p>
          <p className="text-[10px] text-amber-300/70 mt-1">Reorder soon from distributor</p>
        </div>

        <div 
          onClick={() => setStatusFilter('OUT_OF_STOCK')}
          className={`admin-card p-4 cursor-pointer transition border ${statusFilter === 'OUT_OF_STOCK' ? 'border-rose-500 bg-rose-950/20' : 'hover:border-slate-700'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">Out of Stock (0)</span>
            <Boxes className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-400 mt-2">{outOfStockCount}</p>
          <p className="text-[10px] text-[var(--muted-foreground)] mt-1">{comingSoonCount} Coming Soon models</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search devices by name, brand, or model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
          {['ALL', 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'COMING_SOON'].map((filterKey) => (
            <button
              key={filterKey}
              type="button"
              onClick={() => setStatusFilter(filterKey)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 ${
                statusFilter === filterKey
                  ? 'bg-primary-700 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {filterKey.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Stock Table */}
      <div className="admin-card p-4 sm:p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 pb-2">
                <th className="pb-2 font-semibold">Device & Specs</th>
                <th className="pb-2 font-semibold">Brand / Category</th>
                <th className="pb-2 font-semibold">Price</th>
                <th className="pb-2 font-semibold text-center">Stock Count</th>
                <th className="pb-2 font-semibold">Calculated Status</th>
                <th className="pb-2 font-semibold text-right">Quick Mode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredProducts.map((p) => {
                const isUpdating = updatingId === p.id;
                const currentCount = p.stock_count ?? (p.in_stock ? 1 : 0);
                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 pr-2">
                      <div className="font-semibold text-white">{p.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {p.variant ? <span className="text-primary-300 font-medium">{p.variant} • </span> : null}
                        {p.ram_storage || 'Standard Specs'}
                        {p.condition && p.condition !== 'new' && (
                          <span className="ml-1.5 px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px]">
                            {p.condition.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 text-slate-300">
                      <div>{p.brand}</div>
                      <div className="text-[11px] text-slate-500">{p.category || 'Smartphones'}</div>
                    </td>

                    <td className="py-3 font-mono font-bold text-white">
                      ₹{p.price?.toLocaleString('en-IN')}
                    </td>

                    {/* Stock Count Quick Adjuster */}
                    <td className="py-3 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-slate-950 border border-slate-700 rounded-lg p-1">
                        <button
                          type="button"
                          disabled={isUpdating || currentCount <= 0}
                          onClick={() => handleStockCountChange(p, currentCount - 1)}
                          className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 flex items-center justify-center transition"
                          title="Decrease Stock"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        
                        <input
                          type="number"
                          min="0"
                          value={currentCount}
                          disabled={isUpdating}
                          onChange={(e) => handleStockCountChange(p, e.target.value)}
                          className="w-12 text-center bg-transparent font-mono font-bold text-white text-xs outline-none"
                        />

                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleStockCountChange(p, currentCount + 1)}
                          className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 flex items-center justify-center transition"
                          title="Increase Stock"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* Calculated Status Badge */}
                    <td className="py-3">
                      {getStatusBadge(p)}
                    </td>

                    {/* Coming Soon Toggle */}
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleSetComingSoon(p)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border ${
                          p.stock_status === 'COMING SOON'
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        {p.stock_status === 'COMING SOON' ? '✓ Coming Soon' : 'Mark Coming Soon'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No products matched your search or stock filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
