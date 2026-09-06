import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { OrderStatusModal } from '../components/OrderStatusModal';
import { useToast } from '../context/ToastContext';
import {
  FiCheckCircle,
  FiTruck,
  FiClock,
  FiAlertCircle,
  FiEye,
  FiSearch,
  FiRefreshCw,
} from 'react-icons/fi';

export const OrdersPage = () => {
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders?limit=100');
      setOrders(data.orders || []);
    } catch (err) {
      addToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1"><FiCheckCircle className="w-3 h-3" /> Delivered</span>;
      case 'Shipped':
        return <span className="bg-sky-50 text-sky-700 border border-sky-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1"><FiTruck className="w-3 h-3" /> In Transit</span>;
      case 'Processing':
        return <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1"><FiClock className="w-3 h-3" /> Processing</span>;
      case 'Cancelled':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1"><FiAlertCircle className="w-3 h-3" /> Cancelled</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-slate-200">{status}</span>;
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesTab = activeTab === 'All' || o.status === activeTab;
    const matchesSearch =
      o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.shippingAddress?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      o.trackingNumber?.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const tabs = ['All', 'Processing', 'Shipped', 'Delivered', 'Pending', 'Cancelled'];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Order Fulfillment & Logistics
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Track package delivery pipelines, update airway tracking IDs, and manage customer shipments.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <FiRefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs & Search Filter in Glass Style */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${activeTab === tab
                  ? 'bg-linear-to-r from-orange-500 to-amber-500 text-white font-black shadow-xs'
                  : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50/60'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order ID or customer..."
            className="w-full bg-white/80 border border-orange-200/80 focus:bg-white focus:border-orange-500 rounded-xl py-1.5 pl-8 pr-3 text-xs text-slate-900 outline-none font-medium transition-colors"
          />
          <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-orange-500 w-3.5 h-3.5" />
        </div>

      </div>

      {/* Orders Table in Glass Panel */}
      <div className="glass-panel rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-orange-50/50 text-slate-500 text-[10px] uppercase font-bold border-b border-orange-100">
              <tr>
                <th className="py-3.5 px-4">Order Ref</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Tracking Code</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Fulfillment Status</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-100/40">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-[#0d9488] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading customer orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500 font-bold">
                    No orders matching this filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-orange-50/30 transition-colors">

                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900 text-xs">
                        {order.orderNumber}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-900 font-bold">{order.shippingAddress?.fullName}</div>
                      <div className="text-[11px] text-slate-500">
                        {order.shippingAddress?.city}, {order.shippingAddress?.state}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-orange-600">
                      {order.trackingNumber || 'Pending'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${order.isPaid ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                        {order.isPaid ? 'PAID' : 'COD'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusBadge(order.status)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-black text-slate-900 text-sm">
                      ₹{order.totalPrice?.toLocaleString('en-IN')}
                    </td>

                    {/* BLUE BUTTON: Inspect Order (Icon Only) */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl transition-all border border-blue-200 hover:border-blue-600 cursor-pointer shadow-2xs inline-flex items-center justify-center"
                        title="Inspect & Update Order"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OrderStatusModal
        isOpen={Boolean(selectedOrder)}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdated={fetchOrders}
      />

    </div>
  );
};
