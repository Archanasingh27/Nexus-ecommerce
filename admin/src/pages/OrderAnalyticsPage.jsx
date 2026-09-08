import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import {
  FiShoppingBag,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiRotateCcw,
  FiDollarSign,
  FiRefreshCw,
  FiFilter,
  FiCalendar,
  FiTrendingUp,
  FiPackage,
  FiPieChart,
} from 'react-icons/fi';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const STATUS_COLORS = {
  Delivered: '#10b981',  // Emerald
  Processing: '#0284c7', // Sky Blue
  Pending: '#fae125',    // Yellow
  Shipped: '#8b5cf6',    // Violet
  Cancelled: '#f43f5e',  // Rose
  Returned: '#f97316',   // Orange
};

export const OrderAnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  // Filters
  const [dateRange, setDateRange] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, analyticsRes] = await Promise.all([
        api.get('/orders'),
        api.get('/admin/analytics'),
      ]);
      setOrders(ordersRes.data.orders || []);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error('Failed to load order analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Orders according to Date Range & Status
  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter((order) => {
      // Status Filter
      if (statusFilter !== 'ALL' && order.status !== statusFilter) {
        return false;
      }

      // Date Range Filter
      if (dateRange === 'ALL') return true;
      const orderDate = new Date(order.createdAt);
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
  }, [orders, dateRange, statusFilter]);

  // KPI Metrics Calculation based on filtered orders
  const totalOrdersCount = filteredOrders.length;

  const deliveredCount = useMemo(
    () => filteredOrders.filter((o) => o.status === 'Delivered').length,
    [filteredOrders]
  );

  const pendingCount = useMemo(
    () => filteredOrders.filter((o) => o.status === 'Pending' || o.status === 'Processing').length,
    [filteredOrders]
  );

  const cancelledCount = useMemo(
    () => filteredOrders.filter((o) => o.status === 'Cancelled').length,
    [filteredOrders]
  );

  const returnedCount = useMemo(
    () => filteredOrders.filter((o) => o.status === 'Returned').length,
    [filteredOrders]
  );

  const totalOrderValue = useMemo(
    () => filteredOrders.reduce((acc, o) => acc + (Number(o.totalPrice) || 0), 0),
    [filteredOrders]
  );

  // Line Graph: Orders Over Time Data
  const ordersOverTimeData = useMemo(() => {
    const dateMap = {};

    // Group filtered orders by date string
    filteredOrders.forEach((o) => {
      const d = new Date(o.createdAt);
      const dateKey = `${d.getMonth() + 1}/${d.getDate()}`;
      if (!dateMap[dateKey]) {
        dateMap[dateKey] = { date: dateKey, count: 0, revenue: 0 };
      }
      dateMap[dateKey].count += 1;
      dateMap[dateKey].revenue += Number(o.totalPrice) || 0;
    });

    const result = Object.values(dateMap);
    if (result.length > 0) return result;

    return (analytics?.chartData || []).map((item) => ({
      date: item.date,
      count: item.orders,
      revenue: item.revenue,
    }));
  }, [filteredOrders, analytics]);

  // Pie Graph: Order Status Distribution
  const statusPieData = useMemo(() => {
    const counts = filteredOrders.reduce((acc, order) => {
      const status = order.status || 'Pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(counts).map((status) => ({
      name: status,
      value: counts[status],
      color: STATUS_COLORS[status] || '#94a3b8',
    }));
  }, [filteredOrders]);

  if (loading) {
    return (
      <div className="p-8 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#0d9488] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-bold text-slate-500">Loading Order Telemetry & Analytics...</p>
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
              <FiShoppingBag className="w-4 h-4 text-black" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Order Telemetry & Analytics
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Fulfillment velocity, status distribution pie graphs, and real-time order summaries.
          </p>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Order Status Filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs shadow-2xs">
            <FiFilter className="text-teal-700 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-900 font-bold outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Delivered">Delivered</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Returned">Returned</option>
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
            title="Refresh Order Data"
          >
            <FiRefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 6 KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
        
        {/* Total Orders */}
        <div className="bg-white border border-slate-200/90 p-3 sm:p-4 rounded-2xl sm:rounded-3xl space-y-1 sm:space-y-1.5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex justify-between items-center text-slate-500 gap-1">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider truncate">Total Orders</span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center font-bold shrink-0">
              <FiShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>
          <div className="text-base sm:text-xl font-black text-slate-900 truncate">{totalOrdersCount}</div>
          <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 truncate block">Recorded orders</span>
        </div>

        {/* Delivered */}
        <div className="bg-white border border-slate-200/90 p-3 sm:p-4 rounded-2xl sm:rounded-3xl space-y-1 sm:space-y-1.5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex justify-between items-center text-slate-500 gap-1">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider truncate">Delivered</span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold shrink-0">
              <FiCheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>
          <div className="text-base sm:text-xl font-black text-slate-900 truncate">{deliveredCount}</div>
          <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 truncate block">Handed over</span>
        </div>

        {/* Pending */}
        <div className="bg-white border border-slate-200/90 p-3 sm:p-4 rounded-2xl sm:rounded-3xl space-y-1 sm:space-y-1.5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex justify-between items-center text-slate-500 gap-1">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider truncate">Pending</span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold shrink-0">
              <FiClock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>
          <div className="text-base sm:text-xl font-black text-slate-900 truncate">{pendingCount}</div>
          <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 truncate block">In process</span>
        </div>

        {/* Cancelled */}
        <div className="bg-white border border-slate-200/90 p-3 sm:p-4 rounded-2xl sm:rounded-3xl space-y-1 sm:space-y-1.5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex justify-between items-center text-slate-500 gap-1">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider truncate">Cancelled</span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center font-bold shrink-0">
              <FiXCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>
          <div className="text-base sm:text-xl font-black text-slate-900 truncate">{cancelledCount}</div>
          <span className="text-[9px] sm:text-[10px] font-bold text-rose-700 truncate block">Voided</span>
        </div>

        {/* Returned */}
        <div className="bg-white border border-slate-200/90 p-3 sm:p-4 rounded-2xl sm:rounded-3xl space-y-1 sm:space-y-1.5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex justify-between items-center text-slate-500 gap-1">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider truncate">Returned</span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-orange-50 text-orange-700 border border-orange-200 flex items-center justify-center font-bold shrink-0">
              <FiRotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>
          <div className="text-base sm:text-xl font-black text-slate-900 truncate">{returnedCount}</div>
          <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 truncate block">Refunded</span>
        </div>

        {/* Total Order Value */}
        <div className="bg-white border border-slate-200/90 p-3 sm:p-4 rounded-2xl sm:rounded-3xl space-y-1 sm:space-y-1.5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex justify-between items-center text-slate-500 gap-1">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider truncate">Total Value</span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-[#fae125] text-slate-950 border border-yellow-400 flex items-center justify-center font-black shrink-0">
              <FiDollarSign className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>
          <div className="text-base sm:text-xl font-black text-slate-900 truncate">₹{totalOrderValue.toLocaleString('en-IN')}</div>
          <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 truncate block">Order sum</span>
        </div>

      </div>

      {/* 2 CHARTS: Line Graph (Orders Over Time) & Pie Graph (Order Status Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. ORDERS OVER TIME (LINE GRAPH) */}
        <div className="bg-white border border-slate-200/90 p-6 rounded-3xl space-y-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FiTrendingUp className="w-5 h-5 text-teal-600" />
                <span>Orders Over Time (Line Graph)</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">Daily order volume trajectory over the selected period.</p>
            </div>
            <span className="text-[11px] font-black text-slate-950 bg-[#fae125] border border-yellow-400 px-2.5 py-1 rounded-full shadow-2xs">
              Volume Curve
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ordersOverTimeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
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
                  formatter={(val) => [`${val} orders`, 'Volume']}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Orders Count"
                  stroke="#0d9488"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#0d9488' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. ORDER STATUS DISTRIBUTION (PIE GRAPH) */}
        <div className="bg-white border border-slate-200/90 p-6 rounded-3xl space-y-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FiPieChart className="w-5 h-5 text-teal-600" />
                <span>Order Status Distribution (Pie Graph)</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">Breakdown of orders by fulfillment lifecycle status.</p>
            </div>
            <span className="text-[11px] font-black text-slate-950 bg-[#fae125] border border-yellow-400 px-2.5 py-1 rounded-full shadow-2xs">
              Status Ratio
            </span>
          </div>

          {statusPieData.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-slate-400 text-xs font-semibold">
              No orders status data available for the selected filters.
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
                      outerRadius={95}
                      paddingAngle={5}
                      dataKey="value"
                      label={false}
                    >
                      {statusPieData.map((entry, index) => (
                        <Cell key={`cell-st-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
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
                      formatter={(val, name) => [`${val} orders`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Custom Legend Pills */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 max-h-36 overflow-y-auto pr-1">
                {statusPieData.map((st) => {
                  const percent = totalOrdersCount > 0 ? Math.round((st.value / totalOrdersCount) * 100) : 0;
                  return (
                    <div key={st.name} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: st.color }} />
                        <span className="font-bold text-slate-900 truncate">{st.name}</span>
                      </div>
                      <span className="font-bold text-slate-700 ml-2 shrink-0">{st.value} ({percent}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ORDER SUMMARY TABLE BELOW CHARTS */}
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <FiPackage className="text-teal-600" />
              <span>Order Summary Table</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">Detailed list of orders with customer info, items count, amount, payment status, and order status.</p>
          </div>
          <span className="text-xs font-black text-slate-950 bg-[#fae125] border border-yellow-400 px-3 py-1 rounded-full w-fit shadow-2xs">
            {filteredOrders.length} Orders Listed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] font-bold bg-slate-50/70">
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-center">Items</th>
                <th className="py-3.5 px-4 text-right">Amount (₹)</th>
                <th className="py-3.5 px-4 text-center">Payment Status</th>
                <th className="py-3.5 px-4 text-center">Order Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-900">
              {filteredOrders.map((ord) => {
                const totalItemsCount = (ord.orderItems || []).reduce((acc, i) => acc + (i.quantity || 1), 0);
                const orderDateFormatted = new Date(ord.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });

                return (
                  <tr key={ord._id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Order ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-800">
                      #{ord._id?.substring(ord._id.length - 8).toUpperCase()}
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 font-bold text-[10px]">
                          {ord.user?.name ? ord.user.name[0].toUpperCase() : 'C'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{ord.user?.name || 'Customer'}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{ord.user?.email || 'Guest'}</div>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      {orderDateFormatted}
                    </td>

                    {/* Items */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 text-[11px] font-bold">
                        {totalItemsCount} items
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 text-right font-black text-slate-900 text-sm">
                      ₹{ord.totalPrice?.toLocaleString('en-IN')}
                    </td>

                    {/* Payment Status */}
                    <td className="py-3.5 px-4 text-center">
                      {ord.isPaid ? (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                          Paid ({ord.paymentMethod || 'Card'})
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                          Pending ({ord.paymentMethod || 'COD'})
                        </span>
                      )}
                    </td>

                    {/* Order Status */}
                    <td className="py-3.5 px-4 text-center">
                      {ord.status === 'Delivered' ? (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                          Delivered
                        </span>
                      ) : ord.status === 'Processing' ? (
                        <span className="text-[10px] font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-full">
                          Processing
                        </span>
                      ) : ord.status === 'Shipped' ? (
                        <span className="text-[10px] font-bold text-purple-800 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full">
                          Shipped
                        </span>
                      ) : ord.status === 'Cancelled' ? (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                          Cancelled
                        </span>
                      ) : ord.status === 'Returned' ? (
                        <span className="text-[10px] font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full">
                          Returned
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                          Pending
                        </span>
                      )}
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
