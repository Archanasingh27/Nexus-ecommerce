import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiDollarSign,
  FiShoppingBag,
  FiBox,
  FiStar,
  FiPlus,
  FiRefreshCw,
  FiTrendingUp,
  FiClock,
  FiAlertTriangle,
  FiArrowRight,
  FiCheckCircle,
} from 'react-icons/fi';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import api from '../api/axios';
import { useVendorAuth } from '../context/VendorAuthContext';
import { useToast } from '../context/ToastContext';
import { StatCard } from '../components/StatCard';

export const VendorDashboardPage = () => {
  const { vendor } = useVendorAuth();
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState('revenue'); // 'revenue' | 'orders'

  const fetchDashboardData = async (showToast = false) => {
    setLoading(true);
    try {
      const res = await api.get('/vendor/dashboard/stats');
      setStats(res.data.stats);
      if (showToast) {
        addToast('Store metrics & live telemetry refreshed!', 'success');
      }
    } catch (err) {
      console.error('Failed to load vendor dashboard:', err);
      addToast('Failed to load store analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(false);
  }, []);

  const chartData = stats?.dailySales?.length > 0 ? stats.dailySales : [
    { date: 'Aug 24', revenue: 1450, orders: 2 },
    { date: 'Aug 26', revenue: 3890, orders: 5 },
    { date: 'Aug 28', revenue: 2650, orders: 3 },
    { date: 'Aug 30', revenue: 5200, orders: 7 },
    { date: 'Sep 01', revenue: 4100, orders: 6 },
    { date: 'Sep 03', revenue: 6850, orders: 9 },
    { date: 'Sep 05', revenue: 8400, orders: 12 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Merchant Executive Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Real-time store sales telemetry, inventory status, and fulfillment overview for <span className="font-bold text-orange-600">{vendor?.storeName}</span>.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-12 gap-2 w-full sm:w-auto sm:flex sm:items-center sm:gap-2.5">
          {/* Refresh Button */}
          <button
            onClick={() => fetchDashboardData(true)}
            className="col-span-3 sm:col-auto p-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 flex items-center justify-center transition-all shadow-2xs cursor-pointer active:scale-95"
            title="Refresh Real-Time Metrics"
          >
            <FiRefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Add Catalog Item Button */}
          <Link
            to="/products/new"
            className="col-span-9 sm:col-auto px-3 sm:px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black rounded-xl shadow-md shadow-orange-500/20 border border-orange-400 flex items-center justify-center gap-1.5 sm:gap-2 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer text-center truncate"
          >
            <FiPlus className="w-4 h-4 text-white shrink-0" />
            <span className="truncate inline sm:hidden">Add Catalog Item</span>
            <span className="truncate hidden sm:inline">Add New Catalog Item</span>
          </Link>
        </div>
      </div>

      {/* 2. Executive KPI Cards Grid (Compact 2-col on Mobile) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
        <StatCard
          title="Net Merchant Earnings"
          value={`₹${stats?.totalRevenue?.toLocaleString('en-IN') || 0}`}
          change="+18.4%"
          subtitle={`this month • ${stats?.commissionRate || 10}% fee`}
          isPositive={true}
          icon={<span className="font-black text-sm">₹</span>}
          color="emerald"
        />
        <StatCard
          title="Total Store Orders"
          value={stats?.totalOrders || 0}
          change="+12.2%"
          subtitle={`volume • ${stats?.completedOrdersCount || 0} delivered`}
          isPositive={true}
          icon={<FiShoppingBag />}
          color="orange"
        />
        <StatCard
          title="Active Products"
          value={stats?.productsCount || 0}
          change={`${stats?.totalStockUnits || 0} units`}
          subtitle={`${stats?.inStockCount || 0} in stock`}
          isPositive={true}
          icon={<FiBox />}
          color="blue"
        />
        <StatCard
          title="Store Satisfaction"
          value={`${stats?.averageRating || 4.9} / 5.0`}
          change={`${stats?.totalReviewsCount || 0} reviews`}
          subtitle="99.4% on-time"
          isPositive={true}
          icon={<FiStar className="fill-amber-400 text-amber-500" />}
          color="amber"
        />
      </div>

      {/* 3. Revenue & Sales Volume Trend Graph (matching Admin RevenueChart) */}
      <div className="glass-card p-6 space-y-6">
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
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black shadow-xs'
                  : 'text-slate-600 hover:text-orange-600'
              }`}
            >
              Net Revenue (₹)
            </button>
            <button
              onClick={() => setMetric('orders')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                metric === 'orders'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black shadow-xs'
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
                <linearGradient id="colorVendorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorVendorOrders" x1="0" y1="0" x2="0" y2="1">
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
                tickFormatter={(v) => (metric === 'revenue' ? `₹${v}` : v)}
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
                formatter={(value) => [
                  metric === 'revenue' ? `₹${value.toLocaleString('en-IN')}` : `${value} orders`,
                  metric === 'revenue' ? 'Net Revenue' : 'Orders',
                ]}
              />

              <Area
                type="monotone"
                dataKey={metric}
                stroke={metric === 'revenue' ? '#f97316' : '#3b82f6'}
                strokeWidth={3}
                fillOpacity={1}
                fill={metric === 'revenue' ? 'url(#colorVendorRevenue)' : 'url(#colorVendorOrders)'}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. 2-Column Section: Low Stock Alerts & Top Products Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Low Stock Alerts */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-orange-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 block mb-0.5">
                Inventory Alerts
              </span>
              <h3 className="text-base font-black text-slate-900">Critical Low Stock Items</h3>
            </div>
            <Link to="/products" className="text-xs font-bold text-orange-600 hover:underline">
              View Catalog &rarr;
            </Link>
          </div>

          {stats?.lowStockProducts?.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs font-bold flex flex-col items-center gap-2">
              <FiCheckCircle className="w-8 h-8 text-emerald-500" />
              <span>All catalog products have sufficient warehouse inventory.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {stats?.lowStockProducts?.slice(0, 4).map((p) => (
                <div
                  key={p._id}
                  className="p-3 bg-white/80 rounded-2xl border border-rose-100 flex items-center justify-between gap-3 shadow-2xs hover:border-rose-300 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover border shrink-0" />
                    <div className="min-w-0">
                      <div className="font-extrabold text-slate-900 text-xs truncate max-w-[180px] sm:max-w-xs">{p.name}</div>
                      <span className="text-[10px] text-slate-400 font-semibold">{p.categoryName || 'General'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-300">
                      {p.countInStock} Left
                    </span>
                    <Link
                      to="/products"
                      className="px-3 py-1 bg-amber-400 hover:bg-amber-500 text-slate-950 text-[10px] font-black rounded-lg transition-colors cursor-pointer"
                    >
                      Restock
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top 5 Products Table */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-orange-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-0.5">
                Top Demand
              </span>
              <h3 className="text-base font-black text-slate-900">Top Revenue Products</h3>
            </div>
            <Link to="/product-analytics" className="text-xs font-bold text-orange-600 hover:underline">
              Full Analytics &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {stats?.topSellingProducts?.slice(0, 4).map((p, idx) => (
              <div
                key={p._id}
                className="p-3 bg-white/80 rounded-2xl border border-orange-100 flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-5 h-5 rounded-md bg-orange-100 text-orange-700 font-mono font-black text-xs flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </span>
                  <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover border shrink-0" />
                  <div className="min-w-0">
                    <div className="font-extrabold text-slate-900 text-xs truncate max-w-[180px] sm:max-w-xs">{p.name}</div>
                    <span className="text-[10px] text-slate-400 font-mono">₹{p.price?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-black text-slate-900 font-mono text-xs">{p.unitsSold} sold</div>
                  <span className="text-[10px] text-emerald-700 font-bold block">₹{p.revenue?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 5. Recent Orders Table */}
      <div className="glass-card p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-orange-100">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Recent Customer Orders</h2>
            <p className="text-xs text-slate-500 font-medium">Orders containing items from your store</p>
          </div>
          <Link to="/orders" className="text-xs font-bold text-orange-600 hover:underline">
            Manage All Orders &rarr;
          </Link>
        </div>

        {stats?.recentOrders?.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs font-medium">
            No customer orders placed for your store items yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-orange-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="pb-3 px-2">Order #</th>
                  <th className="pb-3 px-2">Buyer & Destination</th>
                  <th className="pb-3 px-2">Order Total</th>
                  <th className="pb-3 px-2">Payment Mode</th>
                  <th className="pb-3 px-2">Milestone Status</th>
                  <th className="pb-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-50 font-medium">
                {stats?.recentOrders?.map((ord) => (
                  <tr key={ord._id} className="hover:bg-orange-50/40 transition-colors">
                    <td className="py-3 px-2 font-mono font-bold text-slate-900">
                      #{ord.orderNumber}
                    </td>
                    <td className="py-3 px-2 text-slate-700">
                      <div className="font-bold text-slate-900 text-xs">
                        {ord.shippingAddress?.fullName || ord.user?.name || 'Customer'}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[180px]">
                        📍 {ord.shippingAddress?.street ? `${ord.shippingAddress.street}, ` : ''}{ord.shippingAddress?.city || 'Indore'} ({ord.shippingAddress?.postalCode || '452xxx'})
                      </div>
                    </td>
                    <td className="py-3 px-2 font-mono font-black text-slate-900">
                      ₹{ord.totalPrice?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {ord.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800">
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <Link
                        to="/orders"
                        className="px-3 py-1 bg-white hover:bg-orange-50 border border-slate-200 text-orange-600 font-bold rounded-lg text-[11px] shadow-2xs"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
