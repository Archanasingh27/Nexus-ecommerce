import React, { useState } from 'react';
import { FiX, FiCheckCircle, FiTruck, FiClock, FiSave, FiUser, FiMapPin, FiPackage, FiShield, FiDollarSign } from 'react-icons/fi';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

export const OrderStatusModal = ({ isOpen, onClose, order, onUpdated }) => {
  const { addToast } = useToast();

  const [status, setStatus] = useState(order?.status || 'Pending');
  const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber || '');
  const [notes, setNotes] = useState(order?.notes || '');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !order) return null;

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/orders/${order._id}/status`, {
        status,
        trackingNumber,
        notes,
      });
      addToast(`Order ${order.orderNumber} status updated to ${status}!`, 'success');
      onUpdated();
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update order status', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Blurred Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity animate-in fade-in duration-200" />

      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div className="relative w-full max-w-3xl bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-2xl p-6 sm:p-8 z-10 space-y-6 animate-in zoom-in-95 duration-200">

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/70">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-linear-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
                <FiPackage className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Order Inspector</div>
                <h2 className="text-xl font-black text-slate-900 font-mono tracking-tight">
                  {order.orderNumber}
                </h2>
              </div>
            </div>

            <button onClick={onClose} className="p-2.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-2xl transition-colors cursor-pointer border border-transparent hover:border-slate-200">
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Customer, Address & Delivery Partner Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">

            {/* Customer Profile */}
            <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 font-black text-slate-900 mb-1">
                <FiUser className="text-teal-600 w-4 h-4" />
                <span>Customer Profile</span>
              </div>
              <div className="text-slate-900 font-bold truncate">{order.shippingAddress?.fullName || order.user?.name}</div>
              <div className="text-slate-500 font-medium truncate">{order.user?.email || 'Guest checkout'}</div>
              <div className="text-slate-600 font-semibold">{order.shippingAddress?.phone || 'No phone'}</div>
            </div>

            {/* Destination Address */}
            <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 font-black text-slate-900 mb-1">
                <FiMapPin className="text-[#0d9488] w-4 h-4" />
                <span>Delivery Address</span>
              </div>
              <div className="text-slate-900 font-bold truncate">{order.shippingAddress?.street}</div>
              <div className="text-slate-500 font-medium text-[11px] leading-relaxed">
                {order.shippingAddress?.city}, {order.shippingAddress?.state} ({order.shippingAddress?.postalCode})
              </div>
              <div className="text-[10px] text-slate-400 font-bold">{order.shippingAddress?.country || 'India'}</div>
            </div>

            {/* Assigned Delivery Partner */}
            <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 font-black text-emerald-950 mb-1">
                <FiTruck className="text-emerald-600 w-4 h-4" />
                <span>Delivery Rider</span>
              </div>
              {order.deliveryPartner ? (
                <>
                  <div className="text-emerald-950 font-bold truncate">{order.deliveryPartner.name}</div>
                  <div className="text-emerald-700 font-medium">{order.deliveryPartner.phone || 'In transit'}</div>
                  <div className="text-[10px] text-emerald-700 font-black uppercase bg-emerald-100/90 px-2 py-0.5 rounded-md inline-block border border-emerald-300">
                    {order.deliveryStatus || 'ASSIGNED'}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-amber-900 font-bold">Unassigned</div>
                  <div className="text-[11px] text-amber-700 font-medium">Broadcasted to zone fleet</div>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-black px-2 py-0.5 rounded-md inline-block border border-amber-300">
                    Awaiting Rider
                  </span>
                </>
              )}
            </div>

          </div>

          {/* Purchased Line Items */}
          <div className="space-y-2">
            <div className="text-xs font-black uppercase tracking-wider text-slate-400">
              Package Contents ({order.orderItems?.length || 0})
            </div>
            <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden max-h-48 overflow-y-auto bg-slate-50/60">
              {order.orderItems?.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-white transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={item.image} alt="" className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-white shadow-2xs shrink-0" />
                    <div className="truncate">
                      <div className="font-bold text-slate-900 truncate max-w-sm">{item.name}</div>
                      <div className="flex items-center gap-2 text-[11px] mt-0.5">
                        <span className="text-slate-500 font-medium">Qty: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}</span>
                        {item.vendorStoreName && (
                          <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded font-bold text-[10px]">
                            🏪 {item.vendorStoreName}
                          </span>
                        )}
                        {item.itemStatus && (
                          <span className="px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded font-bold text-[10px]">
                            {item.itemStatus}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="font-black text-slate-900 shrink-0">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status Update Form */}
          <form onSubmit={handleUpdateStatus} className="space-y-4 pt-2 border-t border-slate-200/70">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Change Fulfillment Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl text-xs text-slate-900 outline-none font-bold cursor-pointer transition-all shadow-2xs"
                >
                  <option value="Pending">⏳ Pending Verification</option>
                  <option value="Processing">📦 Processing in Warehouse</option>
                  <option value="Assigned">🚴 Assigned to Rider</option>
                  <option value="Picked Up">📦 Picked Up by Rider</option>
                  <option value="Out for Delivery">🚚 Out for Delivery</option>
                  <option value="Delivered">✅ Delivered to Customer</option>
                  <option value="Cancelled">❌ Cancelled / Refunded</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Airway Tracking Number
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. TRK94821034"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl text-xs text-slate-900 outline-none font-mono font-bold placeholder-slate-400 transition-all shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Administrative Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Log notes about packaging, special instructions, carrier etc."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl text-xs text-slate-900 outline-none font-medium placeholder-slate-400 transition-all shadow-2xs"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200/70">
              <div className="text-xs">
                <span className="text-slate-400 font-medium">Order Total: </span>
                <span className="font-black text-slate-900 text-base">₹{order.totalPrice?.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-500/25 border border-emerald-500 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
                >
                  <FiSave className="w-4 h-4 text-white" />
                  <span>{loading ? 'Updating...' : 'Save Order Status'}</span>
                </button>
              </div>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};
