import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import {
  FiBox,
  FiPieChart,
  FiBarChart2,
  FiLayers,
  FiShoppingBag,
  FiDollarSign,
  FiRefreshCw,
  FiFilter,
  FiCalendar,
} from 'react-icons/fi';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const PASTEL_PIE_COLORS = [
  '#0d9488', // Deep Teal
  '#fae125', // Warm Sun Yellow
  '#0284c7', // Sky Blue
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#64748b', // Slate
];

export const ProductAnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [dateRange, setDateRange] = useState('ALL');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, orderRes, analyticsRes] = await Promise.all([
        api.get('/products?limit=100'),
        api.get('/categories'),
        api.get('/orders'),
        api.get('/admin/analytics'),
      ]);
      setProducts(prodRes.data.products || []);
      setCategories(catRes.data.categories || []);
      setOrders(orderRes.data.orders || []);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error('Failed to load product sales analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Orders according to dateRange
  const filteredOrders = useMemo(() => {
    if (dateRange === 'ALL') return orders;
    const now = new Date();
    return orders.filter((o) => {
      const orderDate = new Date(o.createdAt);
      if (dateRange === 'TODAY') {
        return orderDate.toDateString() === now.toDateString();
      }
      if (dateRange === '7DAYS') {
        const diffDays = (now - orderDate) / (1000 * 60 * 60 * 24);
        return diffDays <= 7;
      }
      if (dateRange === '30DAYS') {
        const diffDays = (now - orderDate) / (1000 * 60 * 60 * 24);
        return diffDays <= 30;
      }
      if (dateRange === 'THIS_MONTH') {
        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [orders, dateRange]);

  // Aggregate Product Performance based on filtered orders & category
  const productPerformanceMap = useMemo(() => {
    const map = {};

    // Initialize from catalog products
    products.forEach((p) => {
      const catId = p.category?._id || p.category || 'uncategorized';
      const catName = p.categoryName || p.category?.name || 'General';

      map[p._id] = {
        id: p._id,
        name: p.name,
        category: catName,
        categoryId: catId,
        image: p.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100',
        price: p.price || 0,
        unitsSold: 0,
        ordersCount: 0,
        revenue: 0,
        countInStock: p.countInStock || 0,
      };
    });

    // Populate actual order item telemetry
    filteredOrders.forEach((ord) => {
      if (ord.status === 'Cancelled') return;
      const orderItems = ord.orderItems || [];
      const seenInThisOrder = new Set();

      orderItems.forEach((item) => {
        const pId = item.product || item._id;
        if (!map[pId]) {
          map[pId] = {
            id: pId,
            name: item.name || 'Product Item',
            category: 'General',
            categoryId: 'uncategorized',
            image: item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100',
            price: item.price || 0,
            unitsSold: 0,
            ordersCount: 0,
            revenue: 0,
            countInStock: 10,
          };
        }

        const qty = Number(item.quantity || item.qty || 1);
        const itemRev = qty * (Number(item.price) || map[pId].price || 0);

        map[pId].unitsSold += qty;
        map[pId].revenue += itemRev;

        if (!seenInThisOrder.has(pId)) {
          map[pId].ordersCount += 1;
          seenInThisOrder.add(pId);
        }
      });
    });

    return map;
  }, [products, filteredOrders]);

  // Filtered Product List by Category Filter
  const filteredProductsList = useMemo(() => {
    let list = Object.values(productPerformanceMap);
    if (selectedCategory !== 'ALL') {
      list = list.filter(
        (p) =>
          p.categoryId === selectedCategory ||
          p.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    return list;
  }, [productPerformanceMap, selectedCategory]);

  // Overall KPI Metrics
  const totalProductsCount = products.length;
  
  const totalUnitsSold = useMemo(() => {
    return filteredProductsList.reduce((acc, p) => acc + p.unitsSold, 0);
  }, [filteredProductsList]);

  const totalSalesRevenue = useMemo(() => {
    return filteredProductsList.reduce((acc, p) => acc + p.revenue, 0);
  }, [filteredProductsList]);

  const totalOrdersCount = useMemo(() => {
    return filteredOrders.filter((o) => o.status !== 'Cancelled').length;
  }, [filteredOrders]);

  // Top 10 Best Selling Products Based on Units Sold (for Bar Graph)
  const top10BestSellingBarData = useMemo(() => {
    return [...filteredProductsList]
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 10)
      .map((p) => ({
        name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
        fullName: p.name,
        unitsSold: p.unitsSold,
        revenue: p.revenue,
      }));
  }, [filteredProductsList]);

  // Product Revenue Contribution Pie Graph Data (% Share)
  const salesContributionPieData = useMemo(() => {
    const sorted = [...filteredProductsList]
      .filter((p) => p.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue);

    const top6 = sorted.slice(0, 6);
    const others = sorted.slice(6);

    const result = top6.map((p, idx) => ({
      name: p.name.length > 16 ? p.name.substring(0, 16) + '...' : p.name,
      value: p.revenue,
      units: p.unitsSold,
      color: PASTEL_PIE_COLORS[idx % PASTEL_PIE_COLORS.length],
    }));

    if (others.length > 0) {
      const othersRev = others.reduce((acc, p) => acc + p.revenue, 0);
      const othersUnits = others.reduce((acc, p) => acc + p.unitsSold, 0);
      result.push({
        name: 'Other Products',
        value: othersRev,
        units: othersUnits,
        color: '#94a3b8',
      });
    }

    return result;
  }, [filteredProductsList]);

  if (loading) {
    return (
      <div className="p-8 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#0d9488] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-bold text-slate-500">Loading Product Sales Analytics...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      
      {/* Header & Filter Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200/90 p-5 rounded-3xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8.5 h-8.5 rounded-2xl bg-[#fae125] text-slate-950 border border-yellow-400 flex items-center justify-center font-black shadow-2xs">
              <FiBarChart2 className="w-4 h-4 text-black" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Product Sales Analytics
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Selling-wise performance telemetry, top 10 bestsellers, and category sales ratio.
          </p>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs shadow-2xs">
            <FiFilter className="text-teal-700 w-4 h-4" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-slate-900 font-bold outline-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs shadow-2xs">
            <FiCalendar className="text-teal-700 w-4 h-4" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent text-slate-900 font-bold outline-none cursor-pointer"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="7DAYS">Last 7 Days</option>
              <option value="30DAYS">Last 30 Days</option>
              <option value="THIS_MONTH">This Month</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchData}
            className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 transition-colors shadow-2xs cursor-pointer"
            title="Refresh Telemetry Data"
          >
            <FiRefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Products */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-3xl space-y-2 relative overflow-hidden shadow-xs hover:border-slate-300 transition-all">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Products</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center font-bold">
              <FiBox className="w-4 h-4 text-sky-700" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalProductsCount}</div>
          <span className="text-[11px] font-bold text-slate-500">Active catalog items</span>
        </div>

        {/* Total Sold Products */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-3xl space-y-2 relative overflow-hidden shadow-xs hover:border-slate-300 transition-all">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Sold Products</span>
            <div className="w-8 h-8 rounded-xl bg-[#fae125] text-slate-950 border border-yellow-400 flex items-center justify-center font-black">
              <FiShoppingBag className="w-4 h-4 text-black" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalUnitsSold} <span className="text-xs text-slate-400 font-semibold">units</span></div>
          <span className="text-[11px] font-bold text-slate-500">Total units dispatched</span>
        </div>

        {/* Total Orders */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-3xl space-y-2 relative overflow-hidden shadow-xs hover:border-slate-300 transition-all">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center font-bold">
              <FiLayers className="w-4 h-4 text-teal-700" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalOrdersCount}</div>
          <span className="text-[11px] font-bold text-slate-500">Valid customer checkouts</span>
        </div>

        {/* Total Sales Revenue */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-3xl space-y-2 relative overflow-hidden shadow-xs hover:border-slate-300 transition-all">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Sales Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
              <FiDollarSign className="w-4 h-4 text-emerald-700" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">₹{totalSalesRevenue.toLocaleString('en-IN')}</div>
          <span className="text-[11px] font-bold text-slate-500">Gross revenue generated</span>
        </div>

      </div>

      {/* 2 GRAPHS: Top 10 Best Selling Bar Graph & Product Sales Contribution Pie Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. TOP 10 BEST SELLING PRODUCTS (BAR GRAPH BASED ON UNITS SOLD) */}
        <div className="bg-white border border-slate-200/90 p-6 rounded-3xl space-y-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FiBarChart2 className="w-5 h-5 text-teal-600" />
                <span>Top 10 Best Selling Products (Bar Graph)</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">Ranked strictly based on units sold volume.</p>
            </div>
            <span className="text-[11px] font-black text-slate-950 bg-[#fae125] border border-yellow-400 px-2.5 py-1 rounded-full shadow-2xs">
              Units Sold
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            {top10BestSellingBarData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                No sales data available for the selected filters.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top10BestSellingBarData} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} angle={-15} textAnchor="end" />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '16px',
                      color: '#0f172a',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
                    }}
                    formatter={(val) => [`${val} units sold`, 'Sales Volume']}
                  />
                  <Bar dataKey="unitsSold" fill="#0d9488" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 2. PRODUCT PERCENTAGE CONTRIBUTION TO TOTAL SALES (PIE GRAPH) */}
        <div className="bg-white border border-slate-200/90 p-6 rounded-3xl space-y-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FiPieChart className="w-5 h-5 text-teal-600" />
                <span>Sales Contribution Share (Pie Graph)</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">Each product's percentage contribution to total sales revenue.</p>
            </div>
            <span className="text-[11px] font-black text-slate-950 bg-[#fae125] border border-yellow-400 px-2.5 py-1 rounded-full shadow-2xs">
              Revenue % Share
            </span>
          </div>

          {salesContributionPieData.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-slate-400 text-xs font-semibold">
              No revenue data available for the selected filters.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={salesContributionPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                      label={false}
                    >
                      {salesContributionPieData.map((entry, index) => (
                        <Cell key={`cell-pie-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '16px',
                        color: '#0f172a',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
                      }}
                      formatter={(val) => [`₹${val?.toLocaleString('en-IN')} Revenue`, 'Contribution']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Custom Legend Pills */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 max-h-36 overflow-y-auto pr-1">
                {salesContributionPieData.map((prod) => {
                  const percent = totalSalesRevenue > 0 ? Math.round((prod.value / totalSalesRevenue) * 100) : 0;
                  return (
                    <div key={prod.name} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: prod.color }} />
                        <span className="font-bold text-slate-900 truncate">{prod.name}</span>
                      </div>
                      <span className="font-bold text-slate-700 ml-2 shrink-0">₹{prod.value?.toLocaleString('en-IN')} ({percent}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* DETAILED PRODUCTS SALES TABLE BELOW GRAPHS */}
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <FiShoppingBag className="text-teal-600" />
              <span>Detailed Product Sales Telemetry Table</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">Complete breakdown showing product name, category, units sold, orders, revenue, and sales percentage.</p>
          </div>
          <span className="text-xs font-black text-slate-950 bg-[#fae125] border border-yellow-400 px-3 py-1 rounded-full w-fit shadow-2xs">
            {filteredProductsList.length} Catalog Items
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] font-bold bg-slate-50/70">
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-center">Unit Sold</th>
                <th className="py-3.5 px-4 text-center">Orders</th>
                <th className="py-3.5 px-4 text-right">Revenue (₹)</th>
                <th className="py-3.5 px-4 text-right">Sales Percentage (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-900">
              {[...filteredProductsList]
                .sort((a, b) => b.unitsSold - a.unitsSold || b.revenue - a.revenue)
                .map((prod) => {
                  const salesPercentage = totalSalesRevenue > 0 ? ((prod.revenue / totalSalesRevenue) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.image}
                            alt=""
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200 bg-slate-50"
                          />
                          <div>
                            <div className="font-bold text-slate-900 max-w-xs truncate">{prod.name}</div>
                            <div className="text-[10px] text-slate-400 font-medium">₹{prod.price?.toLocaleString('en-IN')} per unit</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-bold">
                          {prod.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 rounded-full">
                          {prod.unitsSold} units
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                        {prod.ordersCount} orders
                      </td>

                      <td className="py-3.5 px-4 text-right font-black text-slate-900 text-sm">
                        ₹{prod.revenue?.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                            <div
                              className="bg-[#0d9488] h-full rounded-full"
                              style={{ width: `${Math.min(Number(salesPercentage), 100)}%` }}
                            />
                          </div>
                          <span className="font-black text-slate-900">{salesPercentage}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
