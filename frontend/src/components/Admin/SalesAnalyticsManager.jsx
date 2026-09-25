import React from 'react';
import SalesAnalyticsChart from './Dashboard/SalesAnalyticsChart';
import { 
  TrendingUp, 
  IndianRupee, 
  ShoppingBag, 
  CreditCard, 
  Smartphone,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

export default function SalesAnalyticsManager() {
  return (
    <div className="space-y-6 animate-panel-in">
      
      {/* Header */}
      <div className="p-5 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary-400 font-mono">
              Revenue Intelligence
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-['Poppins']">
            Store Sales & Demand Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Deep-dive into multichannel conversions across in-store walk-ins and digital WhatsApp orders
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Current Quarter:</span>
          <span className="text-xs font-black text-white px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700">
            Q3 FY26
          </span>
        </div>
      </div>

      {/* Main Dual-Line Area Chart */}
      <SalesAnalyticsChart />

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-5 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Top Selling Brand
            </h4>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/20">
              42% Share
            </span>
          </div>
          <div className="text-2xl font-black text-white font-['Poppins']">
            Samsung Electronics
          </div>
          <p className="text-xs text-slate-400">
            Driven by Galaxy S24 Ultra & A35 5G festive demand in Khorare.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Average Ticket Size
            </h4>
            <span className="text-[11px] font-bold text-blue-400 bg-blue-500/15 px-2 py-0.5 rounded-full border border-blue-500/20">
              +12.6%
            </span>
          </div>
          <div className="text-2xl font-black text-white font-['Poppins']">
            ₹34,850
          </div>
          <p className="text-xs text-slate-400">
            Customer preference shifted upwards due to 0% Bajaj EMI affordability.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Financing Adoption
            </h4>
            <span className="text-[11px] font-bold text-gold-400 bg-gold-500/15 px-2 py-0.5 rounded-full border border-gold-500/20">
              68% Ratio
            </span>
          </div>
          <div className="text-2xl font-black text-gold-400 font-['Poppins']">
            Bajaj & TVS Credit
          </div>
          <p className="text-xs text-slate-400">
            Over 2 out of 3 smartphones purchased utilize in-shop financing.
          </p>
        </div>

      </div>

    </div>
  );
}
