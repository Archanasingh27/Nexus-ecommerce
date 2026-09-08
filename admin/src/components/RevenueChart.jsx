import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { FiTrendingUp, FiDollarSign, FiShoppingBag } from 'react-icons/fi';

export const RevenueChart = ({ data = [] }) => {
  const [metric, setMetric] = useState('revenue');

  const chartData = data.length > 0 ? data : [
    { date: 'Aug 14', revenue: 1200, orders: 4 },
    { date: 'Aug 16', revenue: 2450, orders: 8 },
    { date: 'Aug 18', revenue: 1980, orders: 6 },
    { date: 'Aug 20', revenue: 3800, orders: 12 },
    { date: 'Aug 22', revenue: 3100, orders: 10 },
    { date: 'Aug 24', revenue: 4650, orders: 15 },
    { date: 'Aug 26', revenue: 5400, orders: 18 },
  ];

  const totalPeriodRevenue = chartData.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
  const totalPeriodOrders = chartData.reduce((acc, curr) => acc + (curr.orders || 0), 0);

  return (
    <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 space-y-6 shadow-xs">
      
      {/* Header & Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-md">
              Performance Trends
            </span>
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <FiTrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>Real-time platform activity</span>
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">
            {metric === 'revenue' ? 'Gross Revenue Trajectory' : 'Order Volume Growth'}
          </h2>
        </div>

        {/* Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
          <button
            onClick={() => setMetric('revenue')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              metric === 'revenue'
                ? 'bg-white text-orange-600 shadow-sm border border-slate-200/60 font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FiDollarSign className="w-3.5 h-3.5 text-orange-500" />
            <span>Revenue (₹)</span>
          </button>

          <button
            onClick={() => setMetric('orders')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              metric === 'orders'
                ? 'bg-white text-orange-600 shadow-sm border border-slate-200/60 font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FiShoppingBag className="w-3.5 h-3.5 text-orange-500" />
            <span>Orders Count</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ea580c" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#ea580c" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
              dy={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
              tickFormatter={(val) => (metric === 'revenue' ? `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}` : val)}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl border border-slate-800 space-y-1">
                      <div className="text-[11px] font-bold text-slate-400">{label}</div>
                      <div className="text-base font-black text-orange-400">
                        {metric === 'revenue'
                          ? `₹${Number(payload[0].value).toLocaleString('en-IN')}`
                          : `${payload[0].value} orders`}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              type="monotone"
              dataKey={metric}
              stroke={metric === 'revenue' ? '#ea580c' : '#2563eb'}
              strokeWidth={3}
              fillOpacity={1}
              fill={metric === 'revenue' ? 'url(#revenueGrad)' : 'url(#ordersGrad)'}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default RevenueChart;
