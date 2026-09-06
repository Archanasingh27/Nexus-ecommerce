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

  return (
    <div className="glass-card p-6 space-y-6">
      
      {/* Header & Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600 block mb-1">
            Financial Performance
          </span>
          <h2 className="text-lg font-black text-slate-900">
            Revenue & Sales Volume Trend
          </h2>
        </div>

        <div className="flex items-center gap-1.5 bg-orange-50/70 p-1 rounded-xl border border-orange-200/80">
          <button
            onClick={() => setMetric('revenue')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              metric === 'revenue'
                ? 'bg-linear-to-r from-orange-500 to-amber-500 text-white font-black shadow-xs'
                : 'text-slate-600 hover:text-orange-600'
            }`}
          >
            Gross Revenue (₹)
          </button>
          <button
            onClick={() => setMetric('orders')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              metric === 'orders'
                ? 'bg-linear-to-r from-orange-500 to-amber-500 text-white font-black shadow-xs'
                : 'text-slate-600 hover:text-orange-600'
            }`}
          >
            Orders Count
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#ffedd5" vertical={false} />
            
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => metric === 'revenue' ? `₹${v}` : v}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: '#fed7aa',
                borderRadius: '0.75rem',
                fontSize: '12px',
                color: '#0f172a',
                fontWeight: 'bold',
                boxShadow: '0 10px 25px -5px rgba(249, 115, 22, 0.15)',
              }}
              formatter={(value) => [metric === 'revenue' ? `₹${value.toLocaleString('en-IN')}` : `${value} orders`, metric === 'revenue' ? 'Revenue' : 'Orders']}
            />

            <Area
              type="monotone"
              dataKey={metric}
              stroke={metric === 'revenue' ? '#f97316' : '#3b82f6'}
              strokeWidth={3}
              fillOpacity={1}
              fill={metric === 'revenue' ? 'url(#colorRevenue)' : 'url(#colorOrders)'}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};
