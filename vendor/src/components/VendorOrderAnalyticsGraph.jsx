import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { FiShoppingBag, FiTrendingUp, FiCheckCircle, FiClock, FiTruck, FiDollarSign } from 'react-icons/fi';

const STATUS_COLORS = {
  Pending: '#f59e0b',
  Confirmed: '#3b82f6',
  Packed: '#8b5cf6',
  'Ready for Pickup': '#ec4899',
  'In Transit': '#06b6d4',
  Delivered: '#10b981',
  Cancelled: '#ef4444',
};

export const VendorOrderAnalyticsGraph = ({ stats }) => {
  const [metric, setMetric] = useState('revenue'); // 'revenue' | 'orders' | 'units'

  const rawDaily = stats?.dailySales || [];
  const chartData = rawDaily.length > 0 ? rawDaily : [
    { date: 'Aug 24', revenue: 1450, orders: 2, units: 3 },
    { date: 'Aug 26', revenue: 3890, orders: 5, units: 8 },
    { date: 'Aug 28', revenue: 2650, orders: 3, units: 5 },
    { date: 'Aug 30', revenue: 5200, orders: 7, units: 11 },
    { date: 'Sep 01', revenue: 4100, orders: 6, units: 9 },
    { date: 'Sep 03', revenue: 6850, orders: 9, units: 14 },
    { date: 'Sep 05', revenue: 8400, orders: 12, units: 19 },
  ];

  // Pipeline Status Distribution Data for Pie Chart
  const statusData = [
    { name: 'Pending', value: stats?.pendingOrdersCount || 0, color: STATUS_COLORS.Pending },
    { name: 'Confirmed', value: stats?.confirmedOrdersCount || 0, color: STATUS_COLORS.Confirmed },
    { name: 'Packed', value: stats?.packedOrdersCount || 0, color: STATUS_COLORS.Packed },
    { name: 'Ready for Pickup', value: stats?.readyForPickupOrdersCount || 0, color: STATUS_COLORS['Ready for Pickup'] },
    { name: 'In Transit', value: stats?.inTransitOrdersCount || 0, color: STATUS_COLORS['In Transit'] },
    { name: 'Delivered', value: stats?.completedOrdersCount || 0, color: STATUS_COLORS.Delivered },
  ].filter((item) => item.value > 0);

  const fallbackStatusData = statusData.length > 0 ? statusData : [
    { name: 'Confirmed', value: 3, color: STATUS_COLORS.Confirmed },
    { name: 'Packed', value: 2, color: STATUS_COLORS.Packed },
    { name: 'Ready for Pickup', value: 4, color: STATUS_COLORS['Ready for Pickup'] },
    { name: 'Delivered', value: 8, color: STATUS_COLORS.Delivered },
  ];

  const totalStatusCount = fallbackStatusData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      {/* 2-Column Grid: 14-Day Trajectory (Large) + Pipeline Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main 14-Day Sales & Order Velocity Graph (8 cols) */}
        <div className="lg:col-span-8 glass-card p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-orange-100">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-orange-600 flex items-center gap-1.5 mb-0.5">
                <FiTrendingUp className="w-3.5 h-3.5" />
                <span>Order Analytics Graph</span>
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Revenue & Order Volume Trajectory
              </h2>
            </div>

            {/* Metric Switcher */}
            <div className="flex items-center gap-1 bg-orange-50/80 p-1 rounded-xl border border-orange-200/80 self-start">
              <button
                onClick={() => setMetric('revenue')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  metric === 'revenue'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black shadow-xs'
                    : 'text-slate-600 hover:text-orange-600'
                }`}
              >
                Net Revenue (₹)
              </button>
              <button
                onClick={() => setMetric('orders')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  metric === 'orders'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black shadow-xs'
                    : 'text-slate-600 hover:text-orange-600'
                }`}
              >
                Orders Count
              </button>
              <button
                onClick={() => setMetric('units')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  metric === 'units'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black shadow-xs'
                    : 'text-slate-600 hover:text-orange-600'
                }`}
              >
                Units Sold
              </button>
            </div>
          </div>

          {/* Graph Canvas */}
          <div className="h-72 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              {metric === 'revenue' ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="vendorRevGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" strokeOpacity={0.6} vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    fontSize={11}
                    fontWeight={600}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    fontWeight={600}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.98)',
                      borderRadius: '16px',
                      border: '1px solid #fed7aa',
                      boxShadow: '0 10px 25px -5px rgba(249, 115, 22, 0.15)',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                    formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Net Earnings']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#f97316"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#vendorRevGrad)"
                  />
                </AreaChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" strokeOpacity={0.6} vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    fontSize={11}
                    fontWeight={600}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    fontWeight={600}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.98)',
                      borderRadius: '16px',
                      border: '1px solid #fed7aa',
                      boxShadow: '0 10px 25px -5px rgba(249, 115, 22, 0.15)',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                    formatter={(val) => [`${val} ${metric === 'orders' ? 'Orders' : 'Units'}`, metric === 'orders' ? 'Orders Count' : 'Units']}
                  />
                  <Bar
                    dataKey={metric}
                    fill={metric === 'orders' ? '#3b82f6' : '#10b981'}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Distribution Donut Chart (4 cols) */}
        <div className="lg:col-span-4 glass-card p-6 space-y-4 flex flex-col justify-between">
          <div className="pb-3 border-b border-orange-100">
            <span className="text-xs font-black uppercase tracking-wider text-orange-600 block mb-0.5">
              Pipeline Share
            </span>
            <h3 className="text-base font-black text-slate-900">
              Orders by Fulfillment Stage
            </h3>
          </div>

          <div className="h-52 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fallbackStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {fallbackStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #fed7aa',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                  formatter={(val, name) => [`${val} orders (${Math.round((val / totalStatusCount) * 100)}%)`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Label inside Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-slate-900 font-mono">{totalStatusCount}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Orders</span>
            </div>
          </div>

          {/* Color Legend Tags */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-orange-100/70 text-[11px] font-bold text-slate-700">
            {fallbackStatusData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="truncate">{item.name}:</span>
                <span className="font-mono text-slate-900 font-extrabold">{item.value}</span>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};
