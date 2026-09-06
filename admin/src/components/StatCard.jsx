import React from 'react';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

export const StatCard = ({ title, value, change, isPositive = true, icon, color = 'orange' }) => {
  const colorMap = {
    orange: 'bg-orange-100/80 text-orange-600 border border-orange-200 shadow-sm shadow-orange-500/15',
    blue: 'bg-blue-100/80 text-blue-600 border border-blue-200 shadow-sm shadow-blue-500/15',
    green: 'bg-emerald-100/80 text-emerald-600 border border-emerald-200 shadow-sm shadow-emerald-500/15',
    yellow: 'bg-amber-100/80 text-amber-700 border border-amber-300 shadow-sm shadow-amber-400/20',
    red: 'bg-red-100/80 text-red-600 border border-red-200 shadow-sm shadow-red-500/15',
  };

  return (
    <div className="glass-card p-6 relative overflow-hidden group">
      {/* Top subtle light glare */}
      <div className="absolute top-0 right-0 w-28 h-28 bg-orange-100/30 rounded-full blur-2xl pointer-events-none -z-10" />

      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
            {title}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {value}
          </div>
        </div>

        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg transition-transform group-hover:scale-110 ${colorMap[color] || colorMap.orange}`}>
          {icon}
        </div>
      </div>

      {change && (
        <div className="flex items-center gap-1.5 mt-4 text-xs font-semibold">
          <span className={`inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full ${
            isPositive
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold'
              : 'bg-red-50 text-red-700 border border-red-200 font-bold'
          }`}>
            {isPositive ? <FiTrendingUp className="w-3 h-3 text-emerald-600" /> : <FiTrendingDown className="w-3 h-3 text-red-600" />}
            <span>{change}</span>
          </span>
          <span className="text-slate-400 font-medium">vs last month</span>
        </div>
      )}
    </div>
  );
};
