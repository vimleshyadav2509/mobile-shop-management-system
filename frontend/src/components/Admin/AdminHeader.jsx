import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  X,
  Search,
  ExternalLink,
  RefreshCw,
  LogOut,
  User
} from 'lucide-react';

export default function AdminHeader({
  sidebarOpen,
  setSidebarOpen,
  admin,
  logout,
  activeTabTitle = 'Dashboard',
  searchQuery = '',
  setSearchQuery = () => {},
  onRefresh,
  loadingStats = false
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-900 border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Mobile Menu Toggle & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div>
            <div className="text-sm font-bold text-white capitalize leading-tight">
              {activeTabTitle}
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Amit Mobile Shop • Khorare Store
            </p>
          </div>
        </div>

        {/* Center: Search with ⌘K */}
        <div className="hidden md:flex items-center flex-1 max-w-sm mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, job sheets..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-12 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-500 transition"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded pointer-events-none">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Section: Sync, View Store, Profile */}
        <div className="flex items-center gap-2.5">
          
          {/* Sync Button */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loadingStats}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition"
              title="Sync metrics with database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingStats ? 'animate-spin text-primary-400' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>
          )}

          {/* View Storefront */}
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">View Store</span>
          </Link>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              <div className="w-7 h-7 rounded-md bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center">
                {admin?.username ? admin.username.charAt(0).toUpperCase() : 'A'}
              </div>
              <span className="hidden sm:inline text-xs font-medium text-slate-300">
                {admin?.username || 'Admin'}
              </span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-1 z-50">
                <div className="px-3 py-2 border-b border-slate-800 text-xs">
                  <div className="font-bold text-white capitalize">{admin?.username || 'Admin'}</div>
                  <div className="text-[11px] text-slate-400">Store Administrator</div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold text-rose-400 hover:bg-rose-500/10 text-left transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
