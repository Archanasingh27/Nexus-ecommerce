import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { StatCard } from '../components/StatCard';
import { RevenueChart } from '../components/RevenueChart';
import { RecentOrdersTable } from '../components/RecentOrdersTable';
import { TopProductsTable } from '../components/TopProductsTable';
import { LowStockAlert } from '../components/LowStockAlert';
import { OrderStatusModal } from '../components/OrderStatusModal';
import { ProductModal } from '../components/ProductModal';
import { FlashSaleModal } from '../components/FlashSaleModal';
import {
  FiDollarSign,
  FiShoppingBag,
  FiBox,
  FiUsers,
  FiPlus,
  FiRefreshCw,
  FiClock,
} from 'react-icons/fi';

export const DashboardPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isFlashSaleModalOpen, setIsFlashSaleModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, catRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/categories'),
      ]);
      setAnalytics(analyticsRes.data);
      setCategories(catRes.data.categories || []);
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-10 h-10 border-4 border-[#0d9488] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs font-bold text-slate-500">Loading Real-Time Admin Metrics...</p>
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Executive Command Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Real-time sales telemetry, inventory tracking, and fulfillment overview.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* BLUE BUTTON: Refresh Metrics */}
          <button
            onClick={fetchDashboardData}
            className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl border border-blue-500 transition-all shadow-glow-blue cursor-pointer active:scale-95"
            title="Refresh Real-Time Metrics"
          >
            <FiRefreshCw className="w-4 h-4 text-white" />
          </button>

          {/* YELLOW BUTTON: Flash Sale Deal Timer Manager */}
          <button
            onClick={() => setIsFlashSaleModalOpen(true)}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black rounded-xl border border-amber-300 flex items-center gap-2 transition-all shadow-glow-yellow active:scale-95 cursor-pointer transform hover:-translate-y-0.5"
          >
            <FiClock className="w-4 h-4 text-slate-950" />
            <span>⚡ Set Deals Timer</span>
          </button>

          {/* GREEN BUTTON: Add New Product */}
          <button
            onClick={() => setIsProductModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-glow-green border border-emerald-500 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
          >
            <FiPlus className="w-4 h-4 text-white" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid with Green, Orange, Blue, Yellow Themes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Gross Revenue"
          value={`₹${stats.totalRevenue?.toLocaleString('en-IN') || '0'}`}
          change="+18.4%"
          isPositive={true}
          icon={<FiDollarSign className="w-5 h-5 text-emerald-600" />}
          color="green"
        />
        <StatCard
          title="Total Orders Processed"
          value={stats.totalOrders || '0'}
          change="+12.2%"
          isPositive={true}
          icon={<FiShoppingBag className="w-5 h-5 text-orange-600" />}
          color="orange"
        />
        <StatCard
          title="Active Catalog Items"
          value={stats.totalProducts || '0'}
          change="+4 drops"
          isPositive={true}
          icon={<FiBox className="w-5 h-5 text-blue-600" />}
          color="blue"
        />
        <StatCard
          title="Registered Customers"
          value={stats.totalUsers || '0'}
          change="+24.8%"
          isPositive={true}
          icon={<FiUsers className="w-5 h-5 text-amber-700" />}
          color="yellow"
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

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        categories={categories}
        onSaved={fetchDashboardData}
      />

      <FlashSaleModal
        isOpen={isFlashSaleModalOpen}
        onClose={() => setIsFlashSaleModalOpen(false)}
        onSaved={fetchDashboardData}
      />

    </div>
  );
};
