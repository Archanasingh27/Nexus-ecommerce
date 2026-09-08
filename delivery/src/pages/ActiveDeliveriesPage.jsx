import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import {
  FiPackage,
  FiPhone,
  FiNavigation,
  FiCheckCircle,
  FiTruck,
  FiMapPin,
  FiClock,
  FiDollarSign,
  FiRefreshCw,
  FiShield,
  FiAlertCircle,
  FiExternalLink,
  FiKey,
  FiX,
  FiShoppingBag,
} from 'react-icons/fi';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { useDeliveryAuth } from '../context/DeliveryAuthContext';
import { LiveRouteMap } from '../components/LiveRouteMap';
import confetti from 'canvas-confetti';

export const ActiveDeliveriesPage = () => {
  const { addToast } = useToast();
  const { rider } = useDeliveryAuth();
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const socketRef = useRef(null);

  // OTP Verification Modal State
  const [otpModalOrder, setOtpModalOrder] = useState(null);
  const [inputOtp, setInputOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
      : 'http://localhost:5000';

    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    if (rider?._id) {
      socket.emit('join_rider_room', rider._id);
    }

    return () => {
      socket.disconnect();
    };
  }, [rider?._id]);

  const fetchActiveDeliveries = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/delivery/active-orders');
      setActiveOrders(data.orders || []);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load active deliveries', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveDeliveries();
    const interval = setInterval(fetchActiveDeliveries, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId, nextStatus, otpValue = null) => {
    setUpdatingId(orderId);
    setOtpError('');
    try {
      const payload = { status: nextStatus };
      if (otpValue) payload.otp = otpValue;

      const { data } = await api.put(`/delivery/orders/${orderId}/status`, payload);

      if (nextStatus === 'DELIVERED') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        addToast('🎉 Handover verified! Payout credited to your wallet.', 'success');
        setOtpModalOrder(null);
        setInputOtp('');
      } else {
        addToast(`Milestone updated: ${nextStatus.replace('_', ' ')}`, 'info');
      }

      fetchActiveDeliveries();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update delivery status';
      if (nextStatus === 'DELIVERED') {
        setOtpError(errorMsg);
      }
      addToast(errorMsg, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const openDeliveryOtpModal = (order) => {
    setOtpModalOrder(order);
    setInputOtp('');
    setOtpError('');
  };

  const getStepNumber = (deliveryStatus) => {
    switch (deliveryStatus) {
      case 'ASSIGNED': return 1;
      case 'OUT_FOR_DELIVERY': return 2;
      case 'DELIVERED': return 3;
      default: return 1;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <FiTruck className="w-5 h-5 text-orange-500" />
            Active Deliveries
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage live orders in transit, access turn-by-turn navigation, and update delivery milestones in real time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200">
            {activeOrders.length} Active {activeOrders.length === 1 ? 'Trip' : 'Trips'}
          </span>

          <button
            onClick={fetchActiveDeliveries}
            className="p-2 bg-white hover:bg-slate-50 text-slate-600 rounded-xl border border-slate-200 transition-all shadow-2xs cursor-pointer"
            title="Refresh Deliveries"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      {loading && activeOrders.length === 0 ? (
        <div className="p-16 text-center text-slate-400 space-y-3">
          <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-500">Loading active routes...</p>
        </div>
      ) : activeOrders.length === 0 ? (
        <div className="glass-card p-10 text-center space-y-3 max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-300">
            <FiCheckCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">No Active Deliveries</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 font-medium leading-relaxed">
              You have no ongoing trips right now. Head over to Available Deliveries to accept new orders.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {activeOrders.map((order) => {
            const currentStep = getStepNumber(order.deliveryStatus);
            const isCOD = order.paymentMethod === 'Cash on Delivery';
            const customerPhone = order.shippingAddress?.phone || order.user?.phone || '';
            const destinationQuery = encodeURIComponent(
              `${order.shippingAddress?.street}, ${order.shippingAddress?.city} ${order.shippingAddress?.postalCode}`
            );
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${destinationQuery}`;

            return (
              <div
                key={order._id}
                className="glass-card p-5 space-y-5 relative overflow-hidden"
              >
                {/* Top Trip Header */}
                <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-orange-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase text-orange-700 bg-orange-100/90 border border-orange-200 px-2.5 py-0.5 rounded-md">
                        In Transit
                      </span>
                      <span className="text-xs font-mono font-semibold text-slate-500">
                        #{order.orderNumber}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 font-medium">
                      Claimed {order.assignedAt ? new Date(order.assignedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'recently'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Payout: ₹{order.deliveryFee || 40}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-md border bg-slate-50 text-slate-700 border-slate-200">
                      {isCOD ? `💵 Collect ₹${order.totalPrice}` : '💳 Prepaid'}
                    </span>
                  </div>
                </div>

                {/* Milestone Stepper */}
                <div className="p-3.5 bg-orange-50/40 rounded-2xl border border-orange-100 space-y-2.5">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Delivery Milestones
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-semibold">
                    <div className={`py-1.5 px-1 rounded-xl border transition-all ${currentStep >= 1 ? 'bg-orange-500 text-white border-orange-600 shadow-sm' : 'bg-white text-slate-400 border-slate-200'
                      }`}>
                      1. Assigned
                    </div>
                    <div className={`py-1.5 px-1 rounded-xl border transition-all ${currentStep >= 2 ? 'bg-orange-500 text-white border-orange-600 shadow-sm' : 'bg-white text-slate-400 border-slate-200'
                      }`}>
                      2. Out for Delivery
                    </div>
                    <div className={`py-1.5 px-1 rounded-xl border transition-all ${currentStep >= 3 ? 'bg-orange-500 text-white border-orange-600 shadow-sm' : 'bg-white text-slate-400 border-slate-200'
                      }`}>
                      3. Delivered
                    </div>
                  </div>
                </div>

                {/* Store Pickup Stop(s) */}
                <div className="space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1">
                    <FiShoppingBag className="text-amber-600" />
                    <span>Store Pickups ({(order.vendors && order.vendors.length > 0) ? order.vendors.length : 1} Stop{(order.vendors && order.vendors.length > 1) ? 's' : ''})</span>
                  </div>

                  {(
                    order.vendorStoreName
                      ? [{
                          storeName: order.vendorStoreName,
                          vendorPhone: order.vendor?.phone || '',
                          vendorAddress: order.vendorAddress || { street: 'Plot 18, Commercial Hub, Scheme 54', city: 'Indore' },
                        }]
                      : order.vendors && order.vendors.length > 0
                      ? order.vendors
                      : [{
                          storeName: order.orderItems?.[0]?.vendorStoreName || 'Nexus Central Hub',
                          vendorPhone: '',
                          vendorAddress: { street: 'Plot 18, Commercial Hub, Scheme 54', city: 'Indore' },
                        }]
                  ).map((vStop, vIdx) => {
                    const vAddr = vStop.vendorAddress || vStop.vendor?.address || { street: 'Plot 18, Commercial Hub, Scheme 54', city: 'Indore' };
                    const vFullAddr = `${vAddr.street || 'Plot 18, Scheme 54'}, ${vAddr.city || 'Indore'}`;
                    const vPhone = vStop.vendorPhone || vStop.vendor?.phone || '';
                    const vMap = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(vFullAddr)}`;
                    const storeItems = order.orderItems?.filter(
                      (it) => it.vendor && vStop.vendor && (it.vendor.toString() === (vStop.vendor._id || vStop.vendor).toString())
                    );

                    return (
                      <div key={vIdx} className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-md bg-amber-500 text-white flex items-center justify-center text-[9px] font-black">{vIdx + 1}</span>
                            {vStop.storeName || 'Vendor Merchant'}
                          </span>
                          <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                            {vStop.status || 'Ready for Pickup'}
                          </span>
                        </div>
                        <div className="text-slate-600 text-[11px] pl-5.5">
                          📍 {vFullAddr}
                        </div>
                        {storeItems && storeItems.length > 0 && (
                          <div className="text-slate-500 text-[10px] pl-5.5 font-semibold">
                            📦 Items: {storeItems.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                          </div>
                        )}
                        <div className="flex items-center gap-2 pt-1 pl-5.5">
                          {vPhone && (
                            <a
                              href={`tel:${vPhone}`}
                              className="py-1 px-2.5 bg-white text-slate-800 text-[10px] font-bold rounded-lg border border-amber-300 flex items-center gap-1 shadow-2xs hover:bg-amber-100/50 transition-all"
                            >
                              <FiPhone className="w-3 h-3 text-amber-700" />
                              <span>Call Store</span>
                            </a>
                          )}
                          <a
                            href={vMap}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-1 px-2.5 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold rounded-lg flex items-center gap-1 shadow-xs transition-all"
                          >
                            <FiNavigation className="w-3 h-3" />
                            <span>Store Map</span>
                            <FiExternalLink className="w-2.5 h-2.5 text-amber-200" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Destination & Action Buttons */}
                <div className="p-3.5 bg-white/80 rounded-2xl border border-orange-100 space-y-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                      <FiMapPin className="text-orange-500 w-3.5 h-3.5 shrink-0" />
                      <span>{order.shippingAddress?.fullName || 'Customer'}</span>
                    </div>
                    <div className="text-slate-500 text-xs font-medium pl-5 leading-relaxed">
                      {order.shippingAddress?.street}, {order.shippingAddress?.city} ({order.shippingAddress?.postalCode})
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    {customerPhone ? (
                      <a
                        href={`tel:${customerPhone}`}
                        className="py-2 px-3 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-2xs"
                      >
                        <FiPhone className="w-3.5 h-3.5 text-slate-600" />
                        <span>Call Customer</span>
                      </a>
                    ) : (
                      <div className="py-2 px-3 bg-slate-100 text-slate-400 text-xs font-semibold rounded-xl text-center">
                        No Phone Provided
                      </div>
                    )}

                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-glow-blue border border-blue-500 active:scale-95"
                    >
                      <FiNavigation className="w-3.5 h-3.5 text-white" />
                      <span>Directions</span>
                      <FiExternalLink className="w-3 h-3 text-blue-200" />
                    </a>
                  </div>
                </div>

                {/* Real-time Interactive Leaflet Map & GPS Broadcaster */}
                <LiveRouteMap
                  order={order}
                  socket={socketRef.current}
                  riderId={rider?._id}
                />

                {/* Milestone Progression Action Button */}
                <div className="pt-1">
                  {order.deliveryStatus === 'ASSIGNED' && (
                    <button
                      onClick={() => handleUpdateStatus(order._id, 'OUT_FOR_DELIVERY')}
                      disabled={updatingId === order._id}
                      className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-98 text-white text-xs font-bold rounded-xl shadow-glow-orange transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-orange-400"
                    >
                      <FiTruck className="w-4 h-4 stroke-[2]" />
                      <span>{updatingId === order._id ? 'Updating...' : 'Start Delivery / Mark Out for Delivery'}</span>
                    </button>
                  )}

                  {order.deliveryStatus === 'OUT_FOR_DELIVERY' && (
                    <button
                      onClick={() => openDeliveryOtpModal(order)}
                      disabled={updatingId === order._id}
                      className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 active:scale-98 text-white text-xs font-bold rounded-xl shadow-glow-green transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-emerald-400"
                    >
                      <FiKey className="w-4 h-4 stroke-[2]" />
                      <span>
                        {updatingId === order._id
                          ? 'Processing...'
                          : 'Verify OTP & Handover'}
                      </span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* RIDER OTP VERIFICATION MODAL */}
      {otpModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <FiKey className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Enter Delivery OTP</h3>
                  <div className="text-[10px] text-slate-400">Order #{otpModalOrder.orderNumber}</div>
                </div>
              </div>
              <button
                onClick={() => setOtpModalOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-all"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {/* Customer & Cash info */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Recipient:</span>
                <span className="font-extrabold text-slate-900">
                  {otpModalOrder.shippingAddress?.fullName || 'Customer'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Address:</span>
                <span className="font-semibold text-slate-700 text-right truncate max-w-[200px]">
                  {otpModalOrder.shippingAddress?.street}, {otpModalOrder.shippingAddress?.city}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500 font-bold">Collection Mode:</span>
                <span className={`font-black ${otpModalOrder.paymentMethod === 'Cash on Delivery' ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {otpModalOrder.paymentMethod === 'Cash on Delivery' ? `💵 Collect Cash: ₹${otpModalOrder.totalPrice}` : '✓ Prepaid Online'}
                </span>
              </div>
            </div>

            {/* OTP Input Form */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block text-center">
                Ask customer for their 4-digit Delivery PIN
              </label>

              <div className="flex justify-center">
                <input
                  type="text"
                  maxLength={4}
                  autoFocus
                  value={inputOtp}
                  onChange={(e) => setInputOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • •"
                  className="w-48 text-center py-3 text-2xl font-mono font-black tracking-widest bg-orange-50/60 border-2 border-orange-300 focus:border-orange-500 rounded-2xl outline-none shadow-inner text-slate-900"
                />
              </div>

              {otpError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-[11px] font-bold text-center animate-shake">
                  {otpError}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setOtpModalOrder(null)}
                className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus(otpModalOrder._id, 'DELIVERED', inputOtp)}
                disabled={inputOtp.length !== 4 || updatingId === otpModalOrder._id}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {updatingId === otpModalOrder._id ? 'Verifying...' : 'Verify & Handover'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
