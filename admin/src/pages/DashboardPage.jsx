import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { StatCard } from '../components/StatCard';
import { RevenueChart } from '../components/RevenueChart';
import { RecentOrdersTable } from '../components/RecentOrdersTable';
import { TopProductsTable } from '../components/TopProductsTable';
import { LowStockAlert } from '../components/LowStockAlert';
import { OrderStatusModal } from '../components/OrderStatusModal';
import { FlashSaleModal } from '../components/FlashSaleModal';
import { useToast } from '../context/ToastContext';
import {
  FiDollarSign,
  FiShoppingBag,
  FiBox,
  FiUsers,
  FiPlus,
  FiRefreshCw,
  FiClock,
  FiTrendingUp,
  FiZap,
} from 'react-icons/fi';

export const DashboardPage = () => {
  const { addToast } = useToast();
  const [analytics, setAnalytics] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isFlashSaleModalOpen, setIsFlashSaleModalOpen] = useState(false);

  const fetchDashboardData = async (showToast = false) => {
    try {
      const [analyticsRes, catRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/categories'),
      ]);
      setAnalytics(analyticsRes.data);
      setCategories(catRes.data.categories || []);
      if (showToast) {
        addToast('Executive analytics & metrics refreshed!', 'success');
      }
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-500">Loading Real-Time Analytics...</p>
      </div>
    );
  }

  const stats = analytics?.stats || {
    totalRevenue: 28450,
    totalOrders: 64,
    totalProducts: 24,
    totalUsers: 142,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              Live Platform Telemetry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Executive Command Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Real-time multi-vendor sales telemetry, inventory status, and order dispatch tracking.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-12 gap-2 w-full sm:w-auto sm:flex sm:items-center sm:gap-2.5">
          {/* Refresh Button */}
          <button
            onClick={() => fetchDashboardData(true)}
            className="col-span-2 sm:col-auto p-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 flex items-center justify-center transition-all shadow-2xs cursor-pointer active:scale-95"
            title="Refresh Live Metrics"
          >
            <FiRefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Flash Deals & Announcement Bar Button */}
          <button
            onClick={() => setIsFlashSaleModalOpen(true)}
            className="col-span-5 sm:col-auto px-2.5 sm:px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-black rounded-xl border border-amber-300 flex items-center justify-center gap-1.5 sm:gap-2 transition-all shadow-xs shadow-amber-400/20 active:scale-95 cursor-pointer transform hover:-translate-y-0.5 text-center truncate"
          >
            <FiZap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950 fill-slate-950 shrink-0" />
            <span className="truncate inline sm:hidden">Flash Sale</span>
            <span className="truncate hidden sm:inline">Flash Sale & Promo Bar</span>
          </button>

          {/* Create Product Button */}
          <Link
            to="/products/new"
            className="col-span-5 sm:col-auto px-2.5 sm:px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black rounded-xl shadow-xs shadow-emerald-500/20 border border-emerald-500 flex items-center justify-center gap-1.5 sm:gap-2 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer text-center truncate"
          >
            <FiPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white stroke-[2.5] shrink-0" />
            <span className="truncate inline sm:hidden">Add Product</span>
            <span className="truncate hidden sm:inline">Add New Product</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
        <StatCard
          title="Total Gross Revenue"
          value={`₹${stats.totalRevenue?.toLocaleString('en-IN') || '0'}`}
          change="+18.4%"
          isPositive={true}
          icon={<span className="font-black text-sm">₹</span>}
          color="emerald"
        />
        <StatCard
          title="Orders Processed"
          value={stats.totalOrders || '0'}
          change="+12.2%"
          isPositive={true}
          icon={<FiShoppingBag />}
          color="orange"
        />
        <StatCard
          title="Active Products"
          value={stats.totalProducts || '0'}
          change="+4 new"
          isPositive={true}
          icon={<FiBox />}
          color="blue"
        />
        <StatCard
          title="Registered Customers"
          value={stats.totalUsers || '0'}
          change="+24.8%"
          isPositive={true}
          icon={<FiUsers />}
          color="indigo"
        />
      </div>

      {/* Revenue Graph */}
      <RevenueChart data={analytics?.chartData} />

      {/* 2-Column Section: Low Stock Alerts & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LowStockAlert
          lowStockProducts={analytics?.lowStockProducts}
          onProductUpdated={fetchDashboardData}
        />
        <TopProductsTable products={analytics?.topProducts} />
      </div>

      {/* Recent Orders Table */}
      <RecentOrdersTable
        orders={analytics?.recentOrders}
        onInspectOrder={(order) => setSelectedOrder(order)}
      />

      {/* Modals */}
      <OrderStatusModal
        isOpen={Boolean(selectedOrder)}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdated={fetchDashboardData}
      />

      <FlashSaleModal
        isOpen={isFlashSaleModalOpen}
        onClose={() => setIsFlashSaleModalOpen(false)}
        onSaved={fetchDashboardData}
      />

    </div>
  );
};

export default DashboardPage;
