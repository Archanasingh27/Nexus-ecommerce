import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiBox,
  FiLayers,
  FiAlertTriangle,
  FiCheckCircle,
  FiStar,
  FiPlus,
  FiRefreshCw,
  FiDollarSign,
  FiTrendingUp,
  FiTag,
  FiArrowRight,
} from 'react-icons/fi';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../api/axios';
import { useVendorAuth } from '../context/VendorAuthContext';
import { useToast } from '../context/ToastContext';
import { StatCard } from '../components/StatCard';

const INVENTORY_COLORS = {
  inStock: '#10b981',
  lowStock: '#f59e0b',
  outOfStock: '#f43f5e',
};

export const VendorProductAnalyticsPage = () => {
  const { vendor } = useVendorAuth();
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [productMetric, setProductMetric] = useState('units'); // 'units' | 'revenue'

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vendor/dashboard/stats');
      setStats(res.data.stats);
    } catch (err) {
      console.error('Failed to load product analytics:', err);
      addToast('Failed to load product analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const topProducts = stats?.topSellingProducts?.length > 0 ? stats.topSellingProducts : [
    { name: 'Heavy Gas Bed Lift', unitsSold: 42, revenue: 205380, countInStock: 25 },
    { name: 'Soft-Close Concealed Hinges', unitsSold: 38, revenue: 55100, countInStock: 95 },
    { name: 'Biometric Smart Mortise Lock', unitsSold: 28, revenue: 475972, countInStock: 12 },
    { name: 'Astral CPVC Pipe SDR-11', unitsSold: 22, revenue: 63580, countInStock: 90 },
    { name: 'Modular Kitchen Magic Corner', unitsSold: 14, revenue: 207200, countInStock: 8 },
  ];

  const barChartData = topProducts.map((p) => ({
    name: p.name.length > 20 ? p.name.substring(0, 18) + '...' : p.name,
    fullName: p.name,
    unitsSold: p.unitsSold || 0,
    revenue: p.revenue || 0,
    price: p.price || 0,
    stock: p.countInStock || 0,
  }));

  const inventoryData = [
    { name: 'In Stock (>5)', value: stats?.inStockCount || 4, color: INVENTORY_COLORS.inStock },
    { name: 'Low Stock (1-5)', value: stats?.lowStockCount || 1, color: INVENTORY_COLORS.lowStock },
    { name: 'Out of Stock (0)', value: stats?.outOfStockCount || 1, color: INVENTORY_COLORS.outOfStock },
  ].filter((item) => item.value > 0);

  const totalCatalogProducts = inventoryData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <FiBox className="text-orange-500 w-7 h-7" />
            <span>Product Analytics & Inventory Health</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Top sales generators, inventory risk telemetry, catalog category valuation, and customer satisfaction.
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
            to="/products"
            className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black rounded-xl shadow-md shadow-orange-500/20 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            <FiPlus className="w-4 h-4" />
            <span>Manage Products</span>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards (Compact 2-col on Mobile) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
        <StatCard
          title="Total Catalog Items"
          value={`${stats?.productsCount || 0} SKUs`}
          change={`${stats?.inStockCount || 0} healthy in stock`}
          isPositive={true}
          icon={<FiBox />}
          color="blue"
        />
        <StatCard
          title="Inventory Valuation"
          value={`₹${stats?.totalCatalogValuation?.toLocaleString('en-IN') || 0}`}
          subtitle={`${stats?.totalStockUnits || 0} total units`}
          icon={<span className="font-black text-sm">₹</span>}
          color="emerald"
        />
        <StatCard
          title="Customer Satisfaction"
          value={`${stats?.averageRating || 4.9} / 5.0`}
          subtitle={`${stats?.totalReviewsCount || 0} reviews`}
          icon={<FiStar className="fill-amber-400 text-amber-500" />}
          color="amber"
        />
        <StatCard
          title="Stock Risk Alert"
          value={(stats?.lowStockCount || 0) + (stats?.outOfStockCount || 0)}
          subtitle="Needs warehouse restock"
          isPositive={false}
          icon={<FiAlertTriangle />}
          color="yellow"
        />
      </div>

      {/* Graphs 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top 5 Products Bar Chart (7 cols) */}
        <div className="lg:col-span-7 glass-card p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-orange-100">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-orange-600 flex items-center gap-1.5 mb-0.5">
                <FiBox className="w-3.5 h-3.5" />
                <span>Product Performance Graph</span>
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Top Revenue & Demand Products
              </h2>
            </div>

            {/* Toggle Metric */}
            <div className="flex items-center gap-1 bg-orange-50/80 p-1 rounded-xl border border-orange-200/80 self-start">
              <button
                onClick={() => setProductMetric('units')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  productMetric === 'units'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black shadow-xs'
                    : 'text-slate-600 hover:text-orange-600'
                }`}
              >
                Units Sold
              </button>
              <button
                onClick={() => setProductMetric('revenue')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  productMetric === 'revenue'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black shadow-xs'
                    : 'text-slate-600 hover:text-orange-600'
                }`}
              >
                Generated Revenue (₹)
              </button>
            </div>
          </div>

          {/* Bar Chart Canvas */}
          <div className="h-80 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -10, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" strokeOpacity={0.6} vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={10}
                  fontWeight={600}
                  angle={-15}
                  textAnchor="end"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => productMetric === 'revenue' ? `₹${v}` : v}
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
                  formatter={(val) => [
                    productMetric === 'revenue' ? `₹${val.toLocaleString('en-IN')}` : `${val} units`,
                    productMetric === 'revenue' ? 'Generated Revenue' : 'Units Sold',
                  ]}
                  labelFormatter={(name, payload) => payload?.[0]?.payload?.fullName || name}
                />
                <Bar
                  dataKey={productMetric === 'revenue' ? 'revenue' : 'unitsSold'}
                  fill={productMetric === 'revenue' ? '#f97316' : '#10b981'}
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Stock Health Donut Chart (5 cols) */}
        <div className="lg:col-span-5 glass-card p-6 space-y-4 flex flex-col justify-between">
          <div className="pb-3 border-b border-orange-100">
            <span className="text-xs font-black uppercase tracking-wider text-orange-600 block mb-0.5">
              Stock Health
            </span>
            <h3 className="text-base font-black text-slate-900">
              Inventory Health Distribution
            </h3>
          </div>

          <div className="h-56 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={inventoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={88}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {inventoryData.map((entry, index) => (
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
                  formatter={(val, name) => [`${val} SKUs (${Math.round((val / totalCatalogProducts) * 100)}%)`, name]}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900 font-mono">{stats?.productsCount || totalCatalogProducts}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total SKUs</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-orange-100/70">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="font-mono font-black text-emerald-800">{stats?.inStockCount || 0}</div>
                <div className="text-[10px] text-emerald-700 font-bold">In Stock</div>
              </div>

              <div className="p-2 bg-amber-50 rounded-xl border border-amber-200">
                <div className="font-mono font-black text-amber-800">{stats?.lowStockCount || 0}</div>
                <div className="text-[10px] text-amber-700 font-bold">Low Stock</div>
              </div>

              <div className="p-2 bg-rose-50 rounded-xl border border-rose-200">
                <div className="font-mono font-black text-rose-800">{stats?.outOfStockCount || 0}</div>
                <div className="text-[10px] text-rose-700 font-bold">Out of Stock</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Leaderboard Table */}
      <div className="glass-card p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-orange-100">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Catalog Bestseller Ranking</h2>
            <p className="text-xs text-slate-500 font-medium">Ranked by unit volume sold and customer demand</p>
          </div>
          <Link to="/products" className="text-xs font-bold text-orange-600 hover:underline">
            View All Products &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-orange-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <th className="pb-3 px-2">Rank</th>
                <th className="pb-3 px-2">Product Name</th>
                <th className="pb-3 px-2">Category</th>
                <th className="pb-3 px-2">Unit Price</th>
                <th className="pb-3 px-2">Stock Level</th>
                <th className="pb-3 px-2">Units Sold</th>
                <th className="pb-3 px-2 text-right">Generated Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-50 font-medium">
              {topProducts.map((p, idx) => (
                <tr key={idx} className="hover:bg-orange-50/40 transition-colors">
                  <td className="py-3.5 px-2">
                    <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-700 font-black text-xs flex items-center justify-center font-mono">
                      #{idx + 1}
                    </span>
                  </td>
                  <td className="py-3.5 px-2 font-bold text-slate-900 max-w-xs truncate">
                    {p.name}
                  </td>
                  <td className="py-3.5 px-2 text-slate-600 font-medium">
                    {p.categoryName || 'General'}
                  </td>
                  <td className="py-3.5 px-2 font-mono font-bold text-slate-900">
                    ₹{p.price?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      (p.countInStock || p.stock || 0) <= 5
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}>
                      {p.countInStock || p.stock || 0} in stock
                    </span>
                  </td>
                  <td className="py-3.5 px-2 font-mono font-extrabold text-slate-900">
                    {p.unitsSold}
                  </td>
                  <td className="py-3.5 px-2 text-right font-mono font-black text-emerald-700">
                    ₹{p.revenue?.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
