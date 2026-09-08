import React from 'react';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

export const StatCard = ({
  title,
  value,
  change,
  isPositive = true,
  icon,
  color = 'orange',
  subtitle = '',
}) => {
  const iconThemeMap = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    yellow: 'bg-amber-50 text-amber-600 border-amber-100',
  };

  const iconStyle = iconThemeMap[color] || iconThemeMap.orange;

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3 sm:p-5 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
      {/* Card Header: Title & Icon */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2">
        <span className="text-[10px] sm:text-xs font-bold text-slate-500 tracking-wide truncate">
          {title}
        </span>
        <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center border shrink-0 transition-transform ${iconStyle}`}>
          {React.isValidElement(icon)
            ? React.cloneElement(icon, {
                className: `${icon.props.className || ''} ${typeof icon.type === 'string' ? '' : 'w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]'}`,
              })
            : icon}
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="mt-1.5 sm:mt-3">
        <div className="text-base sm:text-2xl font-bold text-slate-800 tracking-tight leading-none font-sans truncate">
          {value}
        </div>
      </div>

      {/* Footer: Trend Percentage / Subtext */}
      {(change || subtitle) && (
        <div className="flex items-center gap-1 sm:gap-1.5 mt-2 sm:mt-3.5 pt-2 sm:pt-3 border-t border-slate-100 text-[10px] sm:text-xs flex-wrap">
          {change && (
            <span
              className={`inline-flex items-center gap-0.5 px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[11px] font-bold ${
                isPositive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {isPositive ? (
                <FiTrendingUp className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
              ) : (
                <FiTrendingDown className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
              )}
              <span>{change}</span>
            </span>
          )}
          {subtitle && (
            <span className="text-slate-400 font-medium text-[9px] sm:text-[11px] hidden xs:inline truncate">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
