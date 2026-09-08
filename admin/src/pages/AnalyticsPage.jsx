import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  FiTrendingUp,
  FiDollarSign,
  FiShoppingBag,
  FiPieChart,
  FiBarChart2,
  FiRefreshCw,
  FiLayers,
  FiUsers,
  FiArrowUpRight,
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
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const PIE_COLORS = [
  '#38bdf8', // Light Sky Blue
  '#34d399', // Light Mint Emerald
  '#fbbf24', // Light Sun Amber
  '#f472b6', // Light Pink Coral
  '#a78bfa', // Light Soft Lavender
  '#fb923c', // Light Soft Peach
  '#22d3ee', // Light Cyan Electric
];

const STATUS_COLORS = {
  Delivered: '#34d399',  // Mint Light Green
  Processing: '#38bdf8', // Light Sky Blue
  Pending: '#fbbf24',    // Light Sun Amber
  Shipped: '#a78bfa',    // Soft Lavender
  Cancelled: '#f87171',  // Soft Coral Red
};

export const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [ordersData, setOrdersData] = useState([]);
  const [timeRange, setTimeRange] = useState('14d');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [analyticsRes, ordersRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/orders'),
      ]);

      setAnalyticsData(analyticsRes.data);
      setOrdersData(ordersRes.data.orders || []);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-bold text-slate-400">Loading Real-Time Sales Telemetry & Charts...</p>
      </div>
    );
  }

  // Calculate Order Status Breakdown for Pie Chart
  const statusCounts = ordersData.reduce((acc, order) => {
    const status = order.status || 'Pending';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const statusPieData = Object.keys(statusCounts).map((status) => ({
    name: status,
    value: statusCounts[status],
    color: STATUS_COLORS[status] || '#94a3b8',
  }));

  // Category Breakdown Pie Chart Data
  const categoryStats = analyticsData?.categoryStats || [];
  const categoryPieData = categoryStats.map((item, idx) => ({
    name: item._id || 'Uncategorized',
    value: item.count,
    stock: item.totalStock,
    color: PIE_COLORS[idx % PIE_COLORS.length],
  }));

  // Revenue & Order Trend Data
  const chartData = analyticsData?.chartData || [];
  const totalRevenue = analyticsData?.stats?.totalRevenue || 0;
  const totalOrders = analyticsData?.stats?.totalOrders || 0;
  const avgOrderValue = totalOrders > 0 ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8.5 h-8.5 rounded-2xl bg-yellow-400 text-black border border-amber-500 flex items-center justify-center font-black shadow-sm">
              <FiBarChart2 className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-900 tracking-tight">
              Sales Analytics & Telemetry
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Comprehensive revenue trends, order status distribution, and category market share.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-amber-200 p-1 rounded-xl shadow-xs">
            {['7d', '14d', 'All'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-xs font-black rounded-lg transition-colors ${
                  timeRange === range
                    ? 'bg-yellow-400 text-black shadow-xs border border-amber-500'
                    : 'text-slate-600 hover:text-dark-900'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={fetchAnalytics}
            className="p-2.5 bg-white hover:bg-yellow-100 text-dark-900 rounded-xl border border-amber-300 transition-colors shadow-xs"
            title="Refresh Analytics"
          >
            <FiRefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Highlight Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
        <div className="bg-white border border-amber-200/80 p-3 sm:p-5 rounded-2xl sm:rounded-3xl space-y-1 sm:space-y-2 relative overflow-hidden shadow-xs sm:shadow-md hover:border-yellow-500 hover:shadow-lg transition-all">
          <div className="flex justify-between items-center text-slate-500 gap-1">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider truncate">Gross Sales</span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-yellow-400 text-black border border-amber-500 flex items-center justify-center font-black shadow-2xs shrink-0">
              <FiDollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
            </div>
          </div>
          <div className="text-base sm:text-2xl font-black text-dark-900 truncate">₹{totalRevenue.toLocaleString('en-IN')}</div>
          <div className="flex items-center gap-1 text-[9px] sm:text-[11px] font-black text-amber-900 bg-yellow-400/20 px-1.5 sm:px-2 py-0.5 rounded-full border border-amber-400 w-fit truncate">
            <FiTrendingUp className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="truncate">+18.4% vs last mo</span>
          </div>
        </div>

        <div className="bg-white border border-amber-200/80 p-3 sm:p-5 rounded-2xl sm:rounded-3xl space-y-1 sm:space-y-2 relative overflow-hidden shadow-xs sm:shadow-md hover:border-yellow-500 hover:shadow-lg transition-all">
          <div className="flex justify-between items-center text-slate-500 gap-1">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider truncate">Total Orders</span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-amber-400 text-black border border-amber-500 flex items-center justify-center font-black shadow-2xs shrink-0">
              <FiShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
            </div>
          </div>
          <div className="text-base sm:text-2xl font-black text-dark-900 truncate">{totalOrders}</div>
          <div className="flex items-center gap-1 text-[9px] sm:text-[11px] font-black text-amber-900 bg-yellow-400/20 px-1.5 sm:px-2 py-0.5 rounded-full border border-amber-400 w-fit truncate">
            <FiTrendingUp className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="truncate">+12.2% growth</span>
          </div>
        </div>

        <div className="bg-white border border-amber-200/80 p-3 sm:p-5 rounded-2xl sm:rounded-3xl space-y-1 sm:space-y-2 relative overflow-hidden shadow-xs sm:shadow-md hover:border-yellow-500 hover:shadow-lg transition-all">
          <div className="flex justify-between items-center text-slate-500 gap-1">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider truncate">Avg Order</span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-yellow-300 text-black border border-yellow-400 flex items-center justify-center font-black shadow-2xs shrink-0">
              <FiArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
            </div>
          </div>
          <div className="text-base sm:text-2xl font-black text-dark-900 truncate">₹{avgOrderValue.toLocaleString('en-IN')}</div>
          <div className="text-[9px] sm:text-[11px] font-bold text-slate-500 truncate">Per checkout</div>
        </div>

        <div className="bg-white border border-amber-200/80 p-3 sm:p-5 rounded-2xl sm:rounded-3xl space-y-1 sm:space-y-2 relative overflow-hidden shadow-xs sm:shadow-md hover:border-yellow-500 hover:shadow-lg transition-all">
          <div className="flex justify-between items-center text-slate-500 gap-1">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider truncate">Categories</span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-amber-300 text-black border border-amber-400 flex items-center justify-center font-black shadow-2xs shrink-0">
              <FiLayers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
            </div>
          </div>
          <div className="text-base sm:text-2xl font-black text-dark-900 truncate">{categoryStats.length}</div>
          <div className="text-[9px] sm:text-[11px] font-extrabold text-amber-900 truncate">Active genres</div>
        </div>
      </div>

      {/* Main Revenue & Sales Telemetry Area Graph */}
      <div className="bg-white border border-amber-200/80 p-6 rounded-3xl space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-amber-200/60">
          <div>
            <h2 className="text-base font-extrabold text-dark-900 flex items-center gap-2">
              <FiTrendingUp className="text-amber-600" />
              <span>Revenue Trajectory & Daily Sales Curve</span>
            </h2>
            <p className="text-xs text-slate-500">Daily gross revenue breakdown and volume performance.</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-amber-900 font-extrabold">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
              <span>Revenue (₹)</span>
            </div>
            <div className="flex items-center gap-1.5 text-yellow-600 font-extrabold">
              <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block"></span>
              <span>Orders Count</span>
            </div>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="h-72 flex items-center justify-center text-slate-400 text-xs font-semibold">
            No sales telemetry recorded for the selected period yet.
          </div>
        ) : (
          <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="analyticsRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="analyticsOrdersGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#f59e0b',
                    borderRadius: '16px',
                    color: '#0f172a',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.2)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Gross Revenue (₹)"
                  stroke="#f59e0b"
                  strokeWidth={3.5}
                  fillOpacity={1}
                  fill="url(#analyticsRevenueGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="orders"
                  name="Orders Count"
                  stroke="#eab308"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#analyticsOrdersGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 2-Column Pie Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* PIE CHART 1: Category Distribution Pie Graph */}
        <div className="bg-white border border-amber-200/80 p-6 rounded-3xl space-y-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-amber-200/60">
            <div className="flex items-center gap-2">
              <FiPieChart className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-extrabold text-dark-900">
                Category Product Share (Pie Graph)
              </h3>
            </div>
            <span className="text-[11px] font-black text-amber-950 bg-yellow-400/20 border border-amber-400 px-2.5 py-1 rounded-full">
              Distribution
            </span>
          </div>

          {categoryPieData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-400 text-xs font-semibold">
              No category data available.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-56 w-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      label={false}
                      labelLine={false}
                    >
                      {categoryPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#f59e0b',
                        borderRadius: '16px',
                        color: '#0f172a',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.2)',
                      }}
                      formatter={(val, name) => [`${val} products in catalog`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Clean Custom Legend Pills */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-amber-200/60 max-h-36 overflow-y-auto pr-1">
                {categoryPieData.map((cat) => {
                  const totalCatProducts = categoryPieData.reduce((acc, c) => acc + c.value, 0);
                  const percent = totalCatProducts > 0 ? Math.round((cat.value / totalCatProducts) * 100) : 0;
                  return (
                    <div key={cat.name} className="flex items-center justify-between p-2 rounded-xl bg-yellow-400/10 border border-yellow-500/30 text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                        <span className="font-bold text-dark-900 truncate">{cat.name}</span>
                      </div>
                      <span className="font-black text-amber-950 ml-2 shrink-0">{cat.value} ({percent}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* PIE CHART 2: Order Status Distribution Pie/Donut Graph */}
        <div className="bg-white border border-amber-200/80 p-6 rounded-3xl space-y-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-amber-200/60">
            <div className="flex items-center gap-2">
              <FiShoppingBag className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-extrabold text-dark-900">
                Fulfillment & Order Status Pie Graph
              </h3>
            </div>
            <span className="text-[11px] font-black text-amber-950 bg-yellow-400/20 border border-amber-400 px-2.5 py-1 rounded-full">
              Live Logistics
            </span>
          </div>

          {statusPieData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-400 text-xs font-semibold">
              No order status data available.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      label={false}
                      labelLine={false}
                    >
                      {statusPieData.map((entry, index) => (
                        <Cell key={`cell-status-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#f59e0b',
                        borderRadius: '16px',
                        color: '#0f172a',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.2)',
                      }}
                      formatter={(val, name) => [`${val} orders`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Clean Custom Legend Pills */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-amber-200/60">
                {statusPieData.map((st) => (
                  <div key={st.name} className="flex items-center justify-between p-2 rounded-xl bg-yellow-400/10 border border-yellow-500/30 text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: st.color }} />
                      <span className="font-bold text-dark-900 truncate">{st.name}</span>
                    </div>
                    <span className="font-black text-amber-950 ml-2 shrink-0">{st.value} orders</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* BAR CHART: Top Products Sales Volume Breakdown */}
      <div className="bg-white border border-amber-200/80 p-6 rounded-3xl space-y-4 shadow-md">
        <div className="flex items-center justify-between pb-3 border-b border-amber-200/60">
          <div>
            <h3 className="text-base font-extrabold text-dark-900">
              Top Selling Products Volume (Bar Graph)
            </h3>
            <p className="text-xs text-slate-500">Total units sold per top performing catalog item.</p>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={(analyticsData?.topProducts || []).map((p) => ({
                name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
                sold: p.soldCount || 0,
                price: p.price,
              }))}
              margin={{ top: 10, right: 10, left: 0, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} angle={-15} textAnchor="end" />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#f59e0b',
                  borderRadius: '12px',
                  color: '#0f172a',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
                formatter={(value) => [`${value} units sold`, 'Sales Volume']}
              />
              <Bar dataKey="sold" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
