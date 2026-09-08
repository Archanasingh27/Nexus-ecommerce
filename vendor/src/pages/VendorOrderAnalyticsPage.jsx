import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiShoppingBag,
  FiTrendingUp,
  FiCheckCircle,
  FiClock,
  FiTruck,
  FiDollarSign,
  FiRefreshCw,
  FiCreditCard,
  FiActivity,
  FiArrowRight,
  FiCalendar,
} from 'react-icons/fi';
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
} from 'recharts';
import api from '../api/axios';
import { useVendorAuth } from '../context/VendorAuthContext';
import { StatCard } from '../components/StatCard';
import { useToast } from '../context/ToastContext';

const STATUS_COLORS = {
  Pending: '#f59e0b',
  Confirmed: '#3b82f6',
  Packed: '#8b5cf6',
  'Ready for Pickup': '#ec4899',
  'In Transit': '#06b6d4',
  Delivered: '#10b981',
  Cancelled: '#ef4444',
};

export const VendorOrderAnalyticsPage = () => {
  const { vendor } = useVendorAuth();
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState('revenue'); // 'revenue' | 'orders' | 'units'

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vendor/dashboard/stats');
      setStats(res.data.stats);
    } catch (err) {
      console.error('Failed to load order analytics:', err);
      addToast('Failed to load order analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const chartData = stats?.dailySales?.length > 0 ? stats.dailySales : [
    { date: 'Aug 24', revenue: 1450, orders: 2, units: 3 },
    { date: 'Aug 26', revenue: 3890, orders: 5, units: 8 },
    { date: 'Aug 28', revenue: 2650, orders: 3, units: 5 },
    { date: 'Aug 30', revenue: 5200, orders: 7, units: 11 },
    { date: 'Sep 01', revenue: 4100, orders: 6, units: 9 },
    { date: 'Sep 03', revenue: 6850, orders: 9, units: 14 },
    { date: 'Sep 05', revenue: 8400, orders: 12, units: 19 },
  ];

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
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <FiShoppingBag className="text-orange-500 w-7 h-7" />
              <span>Order Analytics & Velocity</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Daily order volume trajectory, revenue generation, payment methods split, and stage-by-stage fulfillment telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl border border-blue-500 transition-all shadow-glow-blue cursor-pointer active:scale-95"
            title="Refresh Metrics"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/orders"
            className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black rounded-xl shadow-md shadow-orange-500/20 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            <FiTruck className="w-4 h-4" />
            <span>Go to Order Fulfillment</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Strip (Compact 2-col on Mobile) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
        <StatCard
          title="Total Store Orders"
          value={stats?.totalOrders || 0}
          change={`✓ ${stats?.completedOrdersCount || 0} Delivered`}
          isPositive={true}
          icon={<FiShoppingBag />}
          color="orange"
        />
        <StatCard
          title="Net Merchant Earnings"
          value={`₹${stats?.totalRevenue?.toLocaleString('en-IN') || 0}`}
          subtitle={`${stats?.commissionRate || 10}% fee deducted`}
          icon={<span className="font-black text-sm">₹</span>}
          color="emerald"
        />
        <StatCard
          title="Avg. Order Value (AOV)"
          value={`₹${stats?.averageOrderValue?.toLocaleString('en-IN') || 0}`}
          subtitle="Per customer transaction"
          icon={<FiCreditCard />}
          color="blue"
        />
        <StatCard
          title="Orders Awaiting Action"
          value={(stats?.pendingOrdersCount || 0) + (stats?.confirmedOrdersCount || 0)}
          subtitle="Confirm or pack now"
          icon={<FiClock />}
          color="amber"
        />
      </div>

      {/* 2-Column Graph Section: Main 14-Day Trajectory (8 cols) + Pipeline Share Donut (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main 14-Day Sales & Order Velocity Graph (8 cols) */}
        <div className="lg:col-span-8 glass-card p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-orange-100">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-orange-600 flex items-center gap-1.5 mb-0.5">
                <FiTrendingUp className="w-3.5 h-3.5" />
                <span>Sales & Order Graph</span>
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                14-Day Revenue & Volume Trajectory
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
          <div className="h-80 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              {metric === 'revenue' ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="orderRevGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" strokeOpacity={0.6} vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
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
                  <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#orderRevGrad)" />
                </AreaChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" strokeOpacity={0.6} vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.98)',
                      borderRadius: '16px',
                      border: '1px solid #fed7aa',
                      boxShadow: '0 10px 25px -5px rgba(249, 115, 22, 0.15)',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                    formatter={(val) => [`${val} ${metric === 'orders' ? 'Orders' : 'Units'}`, metric === 'orders' ? 'Orders Count' : 'Units Sold']}
                  />
                  <Bar dataKey={metric} fill={metric === 'orders' ? '#3b82f6' : '#10b981'} radius={[6, 6, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Distribution Donut Chart (4 cols) */}
        <div className="lg:col-span-4 glass-card p-6 space-y-4 flex flex-col justify-between">
          <div className="pb-3 border-b border-orange-100">
            <span className="text-xs font-black uppercase tracking-wider text-orange-600 block mb-0.5">
              Pipeline Distribution
            </span>
            <h3 className="text-base font-black text-slate-900">
              Orders by Fulfillment Stage
            </h3>
          </div>

          <div className="h-56 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fallbackStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={88}
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

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900 font-mono">{totalStatusCount}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Orders</span>
            </div>
          </div>

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

      {/* Payment Modes & Settlement Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats?.paymentMethodsBreakdown?.map((pm, idx) => {
          const totalRev = stats?.totalRevenue || 1;
          const pct = Math.round((pm.revenue / totalRev) * 100) || 0;
          return (
            <div key={idx} className="glass-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800">{pm.name}</span>
                <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 text-[10px] font-bold">
                  {pct}% of Sales
                </span>
              </div>
              <div className="text-xl font-black text-slate-900 font-mono">
                ₹{pm.revenue?.toLocaleString('en-IN')}
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    pm.name === 'Cash on Delivery' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {pm.count} total customer orders
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
