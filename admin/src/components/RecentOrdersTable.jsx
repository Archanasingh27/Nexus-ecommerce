import React from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiCheckCircle, FiClock, FiTruck, FiXCircle, FiChevronRight } from 'react-icons/fi';

export const RecentOrdersTable = ({ orders = [], onInspectOrder }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 shadow-2xs">
            <FiCheckCircle className="w-3 h-3 text-emerald-600" /> Delivered
          </span>
        );
      case 'Shipped':
      case 'Out for Delivery':
        return (
          <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 shadow-2xs">
            <FiTruck className="w-3 h-3 text-blue-600" /> In Transit
          </span>
        );
      case 'Processing':
      case 'Assigned':
        return (
          <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-extrabold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 shadow-2xs">
            <FiClock className="w-3 h-3 text-amber-600" /> Processing
          </span>
        );
      case 'Cancelled':
        return (
          <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-extrabold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 shadow-2xs">
            <FiXCircle className="w-3 h-3 text-rose-600" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs">
            {status || 'Pending'}
          </span>
        );
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-black text-slate-900">Recent Customer Orders</h3>
          <p className="text-xs text-slate-500 font-medium">Real-time checkout feed across stores and merchant vendors</p>
        </div>
        <Link
          to="/orders"
          className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1 transition-colors"
        >
          <span>View All Orders</span>
          <FiChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px] bg-slate-50/50">
              <th className="py-3 px-3.5 rounded-l-xl">Order Ref</th>
              <th className="py-3 px-3.5">Customer Profile</th>
              <th className="py-3 px-3.5">Items</th>
              <th className="py-3 px-3.5">Fulfillment Status</th>
              <th className="py-3 px-3.5 text-right">Amount</th>
              <th className="py-3 px-3.5 text-center rounded-r-xl">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-400 font-bold">
                  No orders recorded yet.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id} className="hover:bg-orange-50/20 transition-colors">
                  <td className="py-3.5 px-3.5 font-mono font-bold text-slate-900">{order.orderNumber}</td>
                  <td className="py-3.5 px-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {(order.shippingAddress?.fullName || order.user?.name || 'C').charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-900 truncate max-w-[140px]">
                        {order.shippingAddress?.fullName || order.user?.name || 'Customer'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3.5 text-slate-500 font-semibold">{order.orderItems?.length || 1} items</td>
                  <td className="py-3.5 px-3.5">{getStatusBadge(order.status)}</td>
                  <td className="py-3.5 px-3.5 text-right font-black text-slate-900 text-sm">
                    ₹{order.totalPrice?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-3.5 text-center">
                    <button
                      onClick={() => onInspectOrder(order)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-orange-600 hover:text-white text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-all cursor-pointer shadow-2xs inline-flex items-center gap-1.5 active:scale-95"
                    >
                      <FiEye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
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

export default RecentOrdersTable;
