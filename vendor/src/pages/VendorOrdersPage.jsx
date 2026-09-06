import React, { useState, useEffect } from 'react';
import {
  FiShoppingBag,
  FiSearch,
  FiClock,
  FiCheckCircle,
  FiPackage,
  FiSend,
  FiRefreshCw,
  FiEye,
  FiTruck,
} from 'react-icons/fi';
import api from '../api/axios';
import { VendorOrderDetailModal } from '../components/VendorOrderDetailModal';
import { useToast } from '../context/ToastContext';
import { useVendorAuth } from '../context/VendorAuthContext';

export const VendorOrdersPage = () => {
  const { addToast } = useToast();
  const { socket, vendor } = useVendorAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/vendor/orders?status=${statusFilter}`);
      setOrders(res.data.orders || []);
    } catch (err) {
      addToast('Failed to load store orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  // Real-Time Socket.IO Refresh when delivery boy updates order milestones
  useEffect(() => {
    if (!socket || !vendor?._id) return;

    const handleOrderMilestone = (data) => {
      fetchOrders();
    };

    socket.on('vendor_new_order', handleOrderMilestone);
    socket.on('vendor_order_status', handleOrderMilestone);
    socket.on('order_status_updated', handleOrderMilestone);

    return () => {
      socket.off('vendor_new_order', handleOrderMilestone);
      socket.off('vendor_order_status', handleOrderMilestone);
      socket.off('order_status_updated', handleOrderMilestone);
    };
  }, [socket, vendor?._id, statusFilter]);

  const filteredOrders = orders.filter((order) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    const orderNum = (order.orderNumber || '').toLowerCase();
    const customer = (order.shippingAddress?.fullName || order.user?.name || '').toLowerCase();
    return orderNum.includes(query) || customer.includes(query);
  });

  const handleInspect = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FiShoppingBag className="text-orange-500 w-6 h-6" />
            <span>Order Fulfillment Pipeline</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Process customer orders, prepare packaging, and track live courier pickup and delivery status.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 transition-all shadow-2xs self-start sm:self-auto cursor-pointer"
          title="Refresh Queue"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-500' : ''}`} />
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full sm:max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order # or customer name..."
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 text-xs rounded-xl py-2 pl-9 pr-4 text-slate-900 outline-none font-bold transition-all"
            />
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: 'All Orders' },
              { id: 'Pending', label: '⏳ Pending' },
              { id: 'Confirmed', label: '✅ Confirmed' },
              { id: 'Packed', label: '📦 Packed' },
              { id: 'Ready for Pickup', label: '🚀 Ready for Pickup' },
              { id: 'Out for Delivery', label: '🚚 Out for Delivery' },
              { id: 'Delivered', label: '🎉 Delivered' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-orange-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-card overflow-hidden">
        {loading && orders.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-xs font-bold">
            <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading order pipeline...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto border border-orange-200">
              <FiShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-800">No Orders in Queue</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Orders matching this filter status will appear here as customers place purchases.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-orange-100 bg-orange-50/40 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Order # & Date</th>
                  <th className="py-3.5 px-4">Customer & City</th>
                  <th className="py-3.5 px-4">Your Items</th>
                  <th className="py-3.5 px-4">Subtotal</th>
                  <th className="py-3.5 px-4">Stage Status</th>
                  <th className="py-3.5 px-4">Delivery Partner</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-50/60 font-medium">
                {filteredOrders.map((ord) => {
                  const status = ord.vendorSubStatus || ord.status;
                  return (
                    <tr key={ord._id} className="hover:bg-orange-50/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-extrabold text-slate-900 text-sm">
                          #{ord.orderNumber}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(ord.createdAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-800">
                          {ord.shippingAddress?.fullName || ord.user?.name || 'Customer'}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          📍 {ord.shippingAddress?.city} ({ord.shippingAddress?.postalCode})
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1 max-w-xs">
                          {ord.orderItems?.map((it, idx) => (
                            <div key={idx} className="text-[11px] text-slate-700 truncate">
                              &bull; {it.name} <span className="text-slate-400 font-bold">(&times;{it.quantity})</span>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-black text-slate-900 font-mono text-sm">
                          ₹{ord.vendorItemsTotal?.toLocaleString('en-IN') || ord.totalPrice?.toLocaleString('en-IN')}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {ord.isPaid ? '💳 Prepaid' : '💵 COD'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 border ${
                            status === 'Ready for Pickup'
                              ? 'bg-blue-100 text-blue-800 border-blue-300'
                              : status === 'Picked Up'
                              ? 'bg-purple-100 text-purple-800 border-purple-300'
                              : status === 'Out for Delivery'
                              ? 'bg-sky-100 text-sky-800 border-sky-300'
                              : status === 'Packed'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : status === 'Confirmed'
                              ? 'bg-orange-100 text-orange-800 border-orange-300'
                              : status === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {ord.deliveryPartner ? (
                          <div>
                            <div className="font-bold text-slate-800 text-xs flex items-center gap-1">
                              <FiTruck className="text-orange-500" />
                              <span>{ord.deliveryPartner.name}</span>
                            </div>
                            <div className="text-[10px] text-slate-500">{ord.deliveryPartner.phone}</div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleInspect(ord)}
                          className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold rounded-xl text-xs shadow-xs flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <FiEye className="w-3.5 h-3.5" />
                          <span>Fulfill</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <VendorOrderDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder}
        onUpdated={fetchOrders}
      />
    </div>
  );
};
