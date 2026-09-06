import React from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiCheckCircle, FiClock, FiTruck, FiAlertCircle } from 'react-icons/fi';

export const RecentOrdersTable = ({ orders = [], onInspectOrder }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1"><FiCheckCircle className="w-3 h-3" /> Delivered</span>;
      case 'Shipped':
        return <span className="bg-sky-50 text-sky-700 border border-sky-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1"><FiTruck className="w-3 h-3" /> Shipped</span>;
      case 'Processing':
        return <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1"><FiClock className="w-3 h-3" /> Processing</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-slate-900">Recent Customer Orders</h3>
          <p className="text-xs text-slate-500 font-medium">Latest transactions received across all channels</p>
        </div>
        <Link to="/orders" className="text-xs font-black text-orange-600 hover:text-orange-700 transition-colors">
          View All Orders →
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-orange-100/70 text-slate-400 font-bold uppercase tracking-wider text-[10px] bg-orange-50/30">
              <th className="py-2.5 px-3">Order ID</th>
              <th className="py-2.5 px-3">Customer</th>
              <th className="py-2.5 px-3">Items</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Amount</th>
              <th className="py-2.5 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-orange-100/40 font-medium text-slate-700">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-400">
                  No orders recorded yet.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id} className="hover:bg-orange-50/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">{order.orderNumber}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={order.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt=""
                        className="w-6 h-6 rounded-full object-cover border border-slate-200"
                      />
                      <span className="font-bold text-slate-900 truncate max-w-[120px]">
                        {order.shippingAddress?.fullName || order.user?.name || 'Customer'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-500">{order.orderItems?.length} items</td>
                  <td className="py-3 px-3">{getStatusBadge(order.status)}</td>
                  <td className="py-3 px-3 text-right font-black text-slate-900">
                    ₹{order.totalPrice?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {/* BLUE BUTTON: Inspect */}
                    <button
                      onClick={() => onInspectOrder(order)}
                      className="p-1.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-lg transition-all border border-blue-200 hover:border-blue-600 cursor-pointer shadow-2xs"
                      title="Inspect & Update Order"
                    >
                      <FiEye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
