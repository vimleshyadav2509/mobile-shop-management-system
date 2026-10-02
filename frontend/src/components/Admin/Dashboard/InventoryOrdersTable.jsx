import React, { useState } from 'react';
import { 
  Plus, 
  Minus, 
  Search, 
  Smartphone,
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { resolveProductImageUrl, handleImageError } from '../../../utils/imageUtils';

export default function InventoryOrdersTable({ 
  products = [], 
  onUpdateProduct, 
  onDeleteProduct,
  onOpenAddModal 
}) {
  const [filterStock, setFilterStock] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter((p) => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());

    const count = p.stock_count ?? (p.in_stock ? 4 : 0);

    if (filterStock === 'in_stock') return matchesSearch && count > 2;
    if (filterStock === 'low_stock') return matchesSearch && count > 0 && count <= 2;
    if (filterStock === 'out_of_stock') return matchesSearch && count === 0;
    return matchesSearch;
  });

  const handleStockAdjust = (product, delta) => {
    const current = product.stock_count ?? (product.in_stock ? 4 : 0);
    const updatedCount = Math.max(0, current + delta);
    if (onUpdateProduct) {
      onUpdateProduct({
        ...product,
        stock_count: updatedCount,
        in_stock: updatedCount > 0
      });
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
      
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white font-['Poppins']">
            Smartphone Inventory & Orders
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Active retail stock, variant breakdown, and customer order statuses
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-stretch sm:self-auto flex-wrap">
          {/* Search */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="inline-flex p-0.5 rounded-lg bg-slate-800 border border-slate-700 text-xs">
            <button
              onClick={() => setFilterStock('all')}
              className={`px-3 py-1 rounded-md font-semibold transition ${
                filterStock === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStock('low_stock')}
              className={`px-3 py-1 rounded-md font-semibold transition ${
                filterStock === 'low_stock' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              Low Stock
            </button>
          </div>

          {/* Add Stock Action */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-700 hover:bg-primary-600 text-white font-semibold text-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Stock</span>
          </button>
        </div>
      </div>

      {/* Clean Software Data Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Product</th>
              <th className="py-3 px-4">Variant / Specs</th>
              <th className="py-3 px-4">Price (₹)</th>
              <th className="py-3 px-4">Stock Status</th>
              <th className="py-3 px-4">Order / EMI Status</th>
              <th className="py-3 px-4 text-right">Stock Adjust</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredProducts.slice(0, 8).map((product, idx) => {
              const stockCount = product.stock_count ?? (product.in_stock ? (idx % 3 === 1 ? 2 : 5) : 0);
              const isLowStock = stockCount > 0 && stockCount <= 2;
              const isOutOfStock = stockCount === 0;
              const isPendingEmi = idx % 2 === 1;

              return (
                <tr 
                  key={product.id || idx}
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  {/* Product */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-md bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                        <img 
                          src={resolveProductImageUrl(product.image_url)} 
                          alt={product.title} 
                          className="w-full h-full object-contain p-1"
                          onError={handleImageError}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-white line-clamp-1">
                          {product.title}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {product.brand} • {product.condition === 'new' ? 'New' : 'Used'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Variant */}
                  <td className="py-3 px-4 text-slate-300 font-medium">
                    {product.ram_storage || '8GB / 128GB'}
                    {product.color && <span className="block text-[11px] text-slate-500">{product.color}</span>}
                  </td>

                  {/* Price */}
                  <td className="py-3 px-4 font-mono font-bold text-white text-sm">
                    ₹{product.price.toLocaleString()}
                  </td>

                  {/* Stock Status (Semantic Colors: green, amber, red) */}
                  <td className="py-3 px-4">
                    {isOutOfStock ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold text-rose-400 bg-rose-950/40 border border-rose-800/40">
                        Out of Stock
                      </span>
                    ) : isLowStock ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold text-amber-300 bg-amber-950/40 border border-amber-800/40">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        <span>Low Stock ({stockCount})</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>In Stock ({stockCount})</span>
                      </span>
                    )}
                  </td>

                  {/* Order / EMI Status */}
                  <td className="py-3 px-4">
                    {isPendingEmi ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold text-amber-300 bg-amber-950/40 border border-amber-800/40">
                        <Clock className="w-3 h-3" />
                        <span>Pending EMI</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-300 bg-slate-800 border border-slate-700">
                        <span>Counter Order</span>
                      </span>
                    )}
                  </td>

                  {/* Stock Adjust Controls */}
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => handleStockAdjust(product, -1)}
                        title="Reduce 1"
                        className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-mono font-bold text-xs text-white">
                        {stockCount}
                      </span>
                      <button
                        onClick={() => handleStockAdjust(product, 1)}
                        title="Add 1"
                        className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
