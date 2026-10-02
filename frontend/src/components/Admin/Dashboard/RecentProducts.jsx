import React from 'react';
import { ChevronRight, Smartphone } from 'lucide-react';
import { resolveProductImageUrl, handleImageError } from '../../../utils/imageUtils';

export default function RecentProducts({
  products = [],
  onNavigateTab
}) {
  const recentProducts = products.slice(0, 5);

  return (
    <div className="admin-card p-4 sm:p-5 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-[var(--border)]">
          <div>
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
              Recent Products
            </h3>
            <p className="text-[11px] text-[var(--muted-foreground)]">
              Live catalogue items on store inventory
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('products')}
            className="text-xs text-indigo-500 hover:text-indigo-400 font-semibold inline-flex items-center gap-1"
          >
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentProducts.length === 0 ? (
          <div className="py-8 text-center text-[var(--muted-foreground)] text-xs">
            <Smartphone className="w-6 h-6 mx-auto mb-2 opacity-40" />
            <p>No recent products found.</p>
          </div>
        ) : (
          <>
            {/* Desktop Compact Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[var(--muted-foreground)] border-b border-[var(--border)]">
                    <th className="pb-2 font-semibold">Product</th>
                    <th className="pb-2 font-semibold">Brand</th>
                    <th className="pb-2 font-semibold">Price</th>
                    <th className="pb-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {recentProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-[var(--card-hover)] transition-colors">
                      <td className="py-2.5 pr-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={resolveProductImageUrl(p.image_url)}
                            alt={p.title}
                            className="w-8 h-8 rounded-lg object-cover bg-[var(--muted)] border border-[var(--border)] shrink-0"
                            onError={handleImageError}
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-[var(--foreground)] truncate max-w-[150px]">
                              {p.title}
                            </p>
                            <p className="text-[10px] text-[var(--muted-foreground)]">
                              {p.ram_storage || (p.condition === 'new' ? 'Brand New' : 'Refurbished')}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 text-[var(--foreground)] font-medium">{p.brand}</td>
                      <td className="py-2.5 text-[var(--foreground)] font-bold">
                        ₹{p.price?.toLocaleString()}
                      </td>
                      <td className="py-2.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          p.in_stock
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                        }`}>
                          ● {p.in_stock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Transformation: Spec-exact structure */}
            <div className="md:hidden space-y-2.5">
              {recentProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onNavigateTab && onNavigateTab('products')}
                  className="p-3 rounded-xl bg-[var(--card-elevated)] border border-[var(--border)] flex items-center justify-between gap-3 active:scale-[0.99] transition-transform cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={resolveProductImageUrl(p.image_url)}
                      alt={p.title}
                      className="w-11 h-11 rounded-xl object-cover bg-[var(--muted)] border border-[var(--border)] shrink-0"
                      onError={handleImageError}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[var(--foreground)] truncate">
                        {p.title}
                      </p>
                      <p className="text-[11px] text-[var(--muted-foreground)] font-medium">
                        {p.brand}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-[var(--foreground)]">
                          ₹{p.price?.toLocaleString()}
                        </span>
                        <span className={`text-[10px] font-semibold ${p.in_stock ? 'text-emerald-500' : 'text-rose-500'}`}>
                          ● {p.in_stock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)] shrink-0" />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
