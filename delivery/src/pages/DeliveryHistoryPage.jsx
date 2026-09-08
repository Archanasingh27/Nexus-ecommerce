import React, { useState, useEffect } from 'react';
import {
  FiClock,
  FiDollarSign,
  FiCheckCircle,
  FiMapPin,
  FiRefreshCw,
  FiCalendar,
  FiTrendingUp,
  FiPackage,
  FiAward,
} from 'react-icons/fi';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

export const DeliveryHistoryPage = () => {
  const { addToast } = useToast();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/delivery/history');
      setHistory(data.orders || []);
    } catch (err) {
      addToast('Failed to load delivery history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const totalEarned = history.reduce((acc, o) => acc + (o.deliveryFee || 40), 0);

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <FiDollarSign className="w-5 h-5 text-orange-500" />
            Earnings & Delivery History
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Track completed trips, earnings payouts, and verified delivery records.
          </p>
        </div>

        <button
          onClick={fetchHistory}
          className="p-2 bg-white hover:bg-slate-50 text-slate-600 rounded-xl border border-slate-200 transition-all shadow-2xs cursor-pointer self-start sm:self-auto"
          title="Refresh History"
        >
          <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-500' : ''}`} />
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Payouts Card */}
        <div className="glass-card p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Total Payouts</div>
            <div className="text-2xl font-bold text-slate-800 mt-0.5">₹{totalEarned}</div>
            <div className="text-[10px] text-orange-600 font-semibold mt-0.5">Direct wallet earnings</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-orange-100/90 text-orange-600 border border-orange-200 flex items-center justify-center font-bold shadow-xs">
            <FiDollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Completed Trips Card */}
        <div className="glass-card p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Completed Trips</div>
            <div className="text-2xl font-bold text-slate-800 mt-0.5">{history.length} Trips</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">100% completion rate</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-100/90 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold shadow-xs">
            <FiCheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Delivery On-Time Rate Card */}
        <div className="glass-card p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">On-Time Rate</div>
            <div className="text-2xl font-bold text-slate-800 mt-0.5">99.8%</div>
            <div className="text-[10px] text-purple-600 font-semibold mt-0.5">Top-tier fulfillment</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-100/90 text-purple-600 border border-purple-200 flex items-center justify-center font-bold shadow-xs">
            <FiAward className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Completed Orders Feed */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 space-y-3">
          <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-500">Loading payout records...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="glass-card p-10 text-center space-y-3 max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FiClock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">No Past Deliveries Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 font-medium leading-relaxed">
              When you complete deliveries and mark packages as handed over, your past trips and earnings will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {history.map((order) => (
            <div
              key={order._id}
              className="glass-card p-5 space-y-3 relative flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-orange-100">
                <div>
                  <span className="font-mono font-bold text-slate-800 text-xs">#{order.orderNumber}</span>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {order.deliveredAt ? new Date(order.deliveredAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Delivered'}
                  </div>
                </div>

                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-md shadow-2xs">
                  Delivered
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-start gap-2">
                  <FiMapPin className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-800">{order.shippingAddress?.fullName || 'Customer'}</div>
                    <div className="text-slate-500 text-[11px] leading-relaxed">
                      {order.shippingAddress?.street}, {order.shippingAddress?.city}
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-orange-50/40 rounded-xl border border-orange-100 text-[11px] text-slate-600 flex items-center justify-between font-medium">
                  <span>Value: ₹{order.totalPrice} ({order.paymentMethod})</span>
                  <span>{order.orderItems?.length || 1} items</span>
                </div>
              </div>

              <div className="pt-2 border-t border-orange-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Earned Payout</span>
                <span className="text-sm font-bold text-emerald-600">
                  + ₹{order.deliveryFee || 40}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
