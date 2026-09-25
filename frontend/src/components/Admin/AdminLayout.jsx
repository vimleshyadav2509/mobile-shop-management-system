import React, { useState } from 'react';
import AdminHeader from './AdminHeader';
import AdminSidebar, { ADMIN_NAV_ITEMS, NAV_ITEMS } from './AdminSidebar';
import { AdminThemeProvider } from '../../context/AdminThemeContext';
import './adminTheme.css';

function AdminLayoutInner({
  children,
  activeTab,
  setActiveTab,
  admin,
  logout,
  searchQuery = '',
  setSearchQuery = () => {},
  onRefresh,
  loadingStats = false
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentTab = ADMIN_NAV_ITEMS.find((item) => item.id === activeTab) || {
    id: 'dashboard',
    label: 'Dashboard'
  };

  return (
    <div className="ams-admin-root min-h-screen flex flex-col font-sans bg-slate-950 text-white selection:bg-primary-700 selection:text-white">
      {/* Top Header */}
      <AdminHeader
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        admin={admin}
        logout={logout}
        activeTabTitle={currentTab.label}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onRefresh={onRefresh}
        loadingStats={loadingStats}
      />

      {/* Main Body: Full width on desktop to prevent narrow empty margins */}
      <div className="flex-1 flex w-full relative">
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          admin={admin}
          logout={logout}
        />

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout(props) {
  return (
    <AdminThemeProvider>
      <AdminLayoutInner {...props} />
    </AdminThemeProvider>
  );
}
