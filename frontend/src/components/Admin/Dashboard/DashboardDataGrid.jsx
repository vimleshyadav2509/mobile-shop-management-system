import React from 'react';
import RecentProducts from './RecentProducts';
import RecentRepairs from './RecentRepairs';

export default function DashboardDataGrid({
  products = [],
  repairs = [],
  onNavigateTab
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
      <RecentProducts
        products={products}
        onNavigateTab={onNavigateTab}
      />

      <RecentRepairs
        repairs={repairs}
        onNavigateTab={onNavigateTab}
      />
    </div>
  );
}
