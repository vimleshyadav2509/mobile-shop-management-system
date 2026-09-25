import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Loader2 } from 'lucide-react';

export default function ProtectedAdminRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white">
        <div className="flex items-center gap-3 bg-slate-800/80 px-6 py-4 rounded-2xl border border-slate-700 shadow-xl backdrop-blur">
          <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
          <span className="text-sm font-medium tracking-wide text-slate-300">
            Verifying Admin Session...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to admin login preserving the attempted destination
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
