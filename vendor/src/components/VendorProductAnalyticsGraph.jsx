import React, { useState } from 'react';
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
  Legend,
} from 'recharts';
import { FiBox, FiLayers, FiAlertTriangle, FiCheckCircle, FiStar, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const INVENTORY_COLORS = {
  inStock: '#10b981',
  lowStock: '#f59e0b',
  outOfStock: '#f43f5e',
};

const CATEGORY_COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#06b6d4', '#ec4899'];

export const VendorProductAnalyticsGraph = ({ stats }) => {
  const [productMetric, setProductMetric] = useState('units'); // 'units' | 'revenue'

  const topProducts = stats?.topSellingProducts?.length > 0 ? stats.topSellingProducts : [
    { name: 'Heavy Gas Bed Lift', unitsSold: 42, revenue: 205380, countInStock: 25 },
    { name: 'Soft-Close Concealed Hinges', unitsSold: 38, revenue: 55100, countInStock: 95 },
    { name: 'Biometric Smart Mortise Lock', unitsSold: 28, revenue: 475972, countInStock: 12 },
    { name: 'Astral CPVC Pipe SDR-11', unitsSold: 22, revenue: 63580, countInStock: 90 },
    { name: 'Modular Kitchen Magic Corner', unitsSold: 14, revenue: 207200, countInStock: 8 },
  ];

  // Prepare Bar Chart Data with Shortened Labels
  const barChartData = topProducts.map((p) => ({
    name: p.name.length > 18 ? p.name.substring(0, 16) + '...' : p.name,
    fullName: p.name,
    unitsSold: p.unitsSold || 0,
    revenue: p.revenue || 0,
    price: p.price || 0,
    stock: p.countInStock || 0,
  }));

  // Inventory Health Pie Data
  const inventoryData = [
    { name: 'In Stock (>5)', value: stats?.inStockCount || 4, color: INVENTORY_COLORS.inStock },
    { name: 'Low Stock (1-5)', value: stats?.lowStockCount || 1, color: INVENTORY_COLORS.lowStock },
    { name: 'Out of Stock (0)', value: stats?.outOfStockCount || 1, color: INVENTORY_COLORS.outOfStock },
  ].filter((item) => item.value > 0);

  const totalCatalogProducts = inventoryData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      {/* 2-Column Grid: Top Products Bar Chart (7 cols) + Inventory Health Donut (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top 5 Products Bar Chart (7 cols) */}
        <div className="lg:col-span-7 glass-card p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-orange-100">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-orange-600 flex items-center gap-1.5 mb-0.5">
                <FiBox className="w-3.5 h-3.5" />
                <span>Product Analytics Graph</span>
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
                Product Revenue (₹)
              </button>
            </div>
          </div>

          {/* Bar Chart Canvas */}
          <div className="h-72 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
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
                  formatter={(val, name, item) => [
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

        {/* Inventory Stock Health & Risk Telemetry Graph (5 cols) */}
        <div className="lg:col-span-5 glass-card p-6 space-y-4 flex flex-col justify-between">
          <div className="pb-3 border-b border-orange-100">
            <span className="text-xs font-black uppercase tracking-wider text-orange-600 block mb-0.5">
              Stock Telemetry
            </span>
            <h3 className="text-base font-black text-slate-900">
              Inventory Health Distribution
            </h3>
          </div>

          <div className="h-52 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={inventoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
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

            {/* Center Label inside Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-slate-900 font-mono">{stats?.productsCount || totalCatalogProducts}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total SKUs</span>
            </div>
          </div>

          {/* Legend and Stock Status breakdown */}
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

            {stats?.lowStockCount > 0 && (
              <Link
                to="/products"
                className="p-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl flex items-center justify-between text-xs text-amber-900 font-bold transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FiAlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>{stats.lowStockCount} items need stock replenishment</span>
                </div>
                <span className="underline text-[11px] font-black">Restock &rarr;</span>
              </Link>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
