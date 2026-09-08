import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiCompass,
  FiRefreshCw,
  FiMapPin,
  FiPackage,
  FiDollarSign,
  FiCheck,
  FiX,
  FiClock,
  FiPhone,
  FiAlertCircle,
  FiRadio,
  FiSearch,
  FiTrendingUp,
  FiShield,
  FiNavigation,
  FiExternalLink,
  FiShoppingBag,
  FiChevronRight,
  FiInfo,
} from 'react-icons/fi';
import api from '../api/axios';
import { useDeliveryAuth } from '../context/DeliveryAuthContext';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';

export const AvailableOrdersPage = () => {
  const { rider } = useDeliveryAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState(null);
  const [deliveryConfig, setDeliveryConfig] = useState({
    payoutPerTrip: 40,
    coverageRadiusKm: 5.0,
    serviceCity: rider?.serviceCity || 'Indore',
  });

  const fetchAvailableOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/delivery/available-orders');
      setOrders(data.orders || []);
      if (data.deliveryConfig) {
        setDeliveryConfig(data.deliveryConfig);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to fetch available orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableOrders();
    const interval = setInterval(fetchAvailableOrders, 8000);
    return () => clearInterval(interval);
  }, [rider?.isAvailable]);

  const handleAcceptOrder = async (orderId) => {
    setActionLoadingId(orderId);
    try {
      const { data } = await api.put(`/delivery/orders/${orderId}/accept`);
      addToast('Order Claimed! Route assigned to your active trips.', 'success');
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      setSelectedOrderForDetails(null);
      fetchAvailableOrders();
      navigate('/active');
    } catch (err) {
      addToast(err.response?.data?.message || 'Order already claimed or unavailable', 'error');
      fetchAvailableOrders();
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectOrder = async (orderId) => {
    try {
      await api.put(`/delivery/orders/${orderId}/reject`);
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
      if (selectedOrderForDetails?._id === orderId) {
        setSelectedOrderForDetails(null);
      }
      addToast('Order dismissed from queue', 'info');
    } catch (err) {
      addToast('Failed to decline order', 'error');
    }
  };

  const isOnline = rider?.isAvailable !== false;

  const filteredOrders = orders.filter((order) => {
    const isCOD = order.paymentMethod === 'Cash on Delivery';
    if (filterType === 'COD' && !isCOD) return false;
    if (filterType === 'PREPAID' && isCOD) return false;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const customerName = (order.shippingAddress?.fullName || order.user?.name || '').toLowerCase();
      const city = (order.shippingAddress?.city || '').toLowerCase();
      const street = (order.shippingAddress?.street || '').toLowerCase();
      const orderNum = (order.orderNumber || '').toLowerCase();
      return customerName.includes(query) || city.includes(query) || street.includes(query) || orderNum.includes(query);
    }
    return true;
  });

  const defaultPayout = deliveryConfig?.payoutPerTrip ?? 40;
  const totalAvailablePayout = orders.reduce((sum, o) => sum + (o.deliveryFee || defaultPayout), 0);
  const avgPayout = orders.length > 0 ? Math.round(totalAvailablePayout / orders.length) : defaultPayout;

  return (
    <div className="space-y-6 sm:space-y-8">

      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="p-3.5 bg-slate-100 text-slate-800 rounded-2xl border border-slate-300 flex items-center justify-between gap-3 font-bold text-xs">
          <div className="flex items-center gap-2.5">
            <FiAlertCircle className="w-4 h-4 text-orange-500 shrink-0" />
            <span>You are currently offline. Switch your duty status to Online to receive new delivery dispatches.</span>
          </div>
        </div>
      )}

      {/* Top Live Telemetry Banner */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-sm relative overflow-hidden">

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">

          {/* Header Title & Area Radar */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                Available Deliveries
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100/80 text-orange-700 border border-orange-200 shadow-2xs">
                {orders.length} Open
              </span>
            </div>

            <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <span>Live pickup requests in</span>
              <span className="font-semibold text-orange-700">
                📍 {rider?.serviceCity || deliveryConfig?.serviceCity || 'Indore'}
              </span>
            </p>
          </div>

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-white/70 rounded-2xl border border-orange-200/60 shadow-2xs">
              <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Queue Earnings</div>
              <div className="text-base font-bold text-slate-800 mt-0.5">₹{totalAvailablePayout}</div>
            </div>

            <div className="p-3 bg-white/70 rounded-2xl border border-orange-200/60 shadow-2xs">
              <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Avg. Payout</div>
              <div className="text-base font-bold text-slate-800 mt-0.5">₹{avgPayout} / trip</div>
            </div>

            <div className="p-3 bg-white/70 rounded-2xl border border-orange-200/60 shadow-2xs col-span-2 sm:col-span-1">
              <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Coverage Radius</div>
              <div className="text-base font-bold text-slate-800 mt-0.5">~{deliveryConfig?.coverageRadiusKm || 5.0} km</div>
            </div>
          </div>

        </div>

        {/* Filter & Search Bar */}
        <div className="mt-5 pt-4 border-t border-orange-100 flex flex-col sm:flex-row items-center justify-between gap-3">

          <div className="relative w-full sm:max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer, address, or order #..."
              className="w-full bg-white/80 backdrop-blur-md border border-orange-200/70 focus:border-orange-500 focus:bg-white text-xs rounded-xl py-2 pl-9 pr-4 text-slate-900 outline-none placeholder-slate-400 font-bold shadow-xs transition-all"
            />
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 w-3.5 h-3.5" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1 bg-orange-100/50 p-1 rounded-xl border border-orange-200/60">
              {[
                { id: 'ALL', label: 'All Orders' },
                { id: 'PREPAID', label: 'Prepaid' },
                { id: 'COD', label: 'COD' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterType(tab.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${filterType === tab.id
                      ? 'bg-white text-orange-600 shadow-2xs border border-orange-200'
                      : 'text-slate-600 hover:text-orange-600'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              onClick={fetchAvailableOrders}
              className="p-2 bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-600 rounded-xl border border-orange-200/70 shadow-2xs transition-all cursor-pointer"
              title="Refresh Live Feed"
            >
              <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-500' : ''}`} />
            </button>
          </div>

        </div>

      </div>

      {/* Orders Grid */}
      {loading && orders.length === 0 ? (
        <div className="p-16 text-center text-slate-400 space-y-3">
          <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-500">Scanning territory for open deliveries...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="glass-card p-10 text-center space-y-3 max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto border border-orange-300">
            <FiPackage className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">No Deliveries Available</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 font-medium leading-relaxed">
              New orders in {rider?.serviceCity || 'your delivery territory'} will appear here automatically in real time.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filteredOrders.map((order) => {
            const payout = order.deliveryFee || defaultPayout;
            const isCOD = order.paymentMethod === 'Cash on Delivery';
            const totalItems = order.orderItems?.reduce((acc, item) => acc + item.quantity, 0) || 1;

            const isMultiVendor = !order.vendorStoreName && order.vendors && order.vendors.length > 1;
            const primaryVendor = order.vendors?.[0] || {};
            const vendorStore = order.vendorStoreName || (isMultiVendor
              ? `${order.vendors.length} Stores (${order.vendors.map((v) => v.storeName || 'Store').join(', ')})`
              : primaryVendor.storeName || order.orderItems?.[0]?.vendorStoreName || 'Nexus Central Hub');
            const vAddr = order.vendorAddress || primaryVendor.vendorAddress || primaryVendor.vendor?.address || {
              street: 'Plot 18, Commercial Hub, Scheme 54',
              city: 'Indore',
            };
            const pickupCity = vAddr.city || 'Indore';
            const pickupArea = vAddr.street ? vAddr.street.split(',')[0] : 'Commercial Hub';

            const customerName = order.shippingAddress?.fullName || order.user?.name || 'Customer';
            const dropCity = order.shippingAddress?.city || 'Indore';
            const dropArea = order.shippingAddress?.street ? order.shippingAddress.street.split(',')[0] : 'Indore Area';

            return (
              <div
                key={order._id}
                className="glass-card p-4 sm:p-5 flex flex-col justify-between space-y-3.5 relative hover:shadow-md transition-all group"
              >
                {/* Header: Payout & Order Number */}
                <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-orange-100">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-100/90 px-2.5 py-0.5 rounded-md border border-orange-200">
                        Payout: ₹{payout}
                      </span>
                      {order.deliveryOption === 'instant' ? (
                        <span className="text-[10px] font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300 animate-pulse">
                          ⚡ Instant (30m)
                        </span>
                      ) : order.deliveryOption === 'nextday' ? (
                        <span className="text-[10px] font-black text-blue-900 bg-blue-100 px-2 py-0.5 rounded-md border border-blue-300">
                          🚚 Next Day
                        </span>
                      ) : (
                        <span className="text-[10px] font-black text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                          🕒 4-Hour Express
                        </span>
                      )}
                      {isMultiVendor && (
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md border border-purple-200">
                          🏢 {order.vendors.length} Stops
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-mono font-semibold text-slate-500 mt-1">
                      Order #{order.orderNumber}
                    </div>
                  </div>

                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-md border bg-slate-50 text-slate-700 border-slate-200">
                    {isCOD ? '💵 COD' : '💳 Prepaid'}
                  </span>
                </div>

                {/* Short Summary Route Preview Card (Clickable to view full details) */}
                <div
                  onClick={() => setSelectedOrderForDetails(order)}
                  className="bg-white/80 hover:bg-orange-50/40 p-3 rounded-2xl border border-orange-100 transition-all cursor-pointer space-y-2.5 shadow-2xs hover:border-orange-300"
                  title="Click to view full pickup and delivery details"
                >
                  {/* Short Pickup Preview */}
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 font-black text-[9px] border border-amber-300">
                      P
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center justify-between">
                        <span>{isMultiVendor ? `Pickups (${order.vendors.length} Stores)` : 'Pickup (Store)'}</span>
                      </div>
                      <div className="text-xs font-extrabold text-slate-900 truncate">
                        {vendorStore}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        📍 {pickupArea}, {pickupCity}
                      </div>
                    </div>
                  </div>

                  {/* Short Drop Preview */}
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-md bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 mt-0.5 font-black text-[9px] border border-teal-300">
                      D
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
                        Drop (Customer)
                      </div>
                      <div className="text-xs font-extrabold text-slate-900 truncate">
                        {customerName}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        📍 {dropArea}, {dropCity}
                      </div>
                    </div>
                  </div>

                  {/* Item Qty & Parcel Value */}
                  <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-semibold">
                    <span>📦 {totalItems} item(s)</span>
                    <span className="font-extrabold text-slate-800">₹{order.totalPrice?.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleRejectOrder(order._id)}
                    className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95 border border-slate-200"
                  >
                    <FiX className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </button>

                  <button
                    onClick={() => handleAcceptOrder(order._id)}
                    disabled={actionLoadingId === order._id || !isOnline}
                    className="py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-white text-xs font-bold rounded-xl shadow-glow-orange transition-all cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50 border border-orange-400"
                  >
                    <FiCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{actionLoadingId === order._id ? 'Claiming...' : 'Accept'}</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* DETAILED LOCATION & ROUTE MODAL (Shown on Card Click) */}
      {selectedOrderForDetails && (() => {
        const order = selectedOrderForDetails;
        const payout = order.deliveryFee || defaultPayout;
        const isCOD = order.paymentMethod === 'Cash on Delivery';
        const totalItems = order.orderItems?.reduce((acc, item) => acc + item.quantity, 0) || 1;
        const isMultiVendor = order.vendors && order.vendors.length > 1;

        const customerName = order.shippingAddress?.fullName || order.user?.name || 'Customer';
        const customerPhone = order.shippingAddress?.phone || order.user?.phone || '';
        const customerFullAddress = `${order.shippingAddress?.street || ''}, ${order.shippingAddress?.city || 'Indore'}, ${order.shippingAddress?.state || 'Madhya Pradesh'} ${order.shippingAddress?.postalCode || ''}`;
        const customerMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(customerFullAddress)}`;

        // Determine vendor pickup stops
        const pickupStops = order.vendorStoreName
          ? [{
              storeName: order.vendorStoreName,
              vendorPhone: order.vendor?.phone || '',
              vendorAddress: order.vendorAddress || {
                street: 'Plot 18, Commercial Hub, Scheme 54',
                city: 'Indore',
                state: 'Madhya Pradesh',
                postalCode: '452010',
              },
            }]
          : ((order.vendors && order.vendors.length > 0)
            ? order.vendors
            : [{
                storeName: order.orderItems?.[0]?.vendorStoreName || 'Nexus Central Hub',
                vendorPhone: '',
                vendorAddress: {
                  street: 'Plot 18, Commercial Hub, Scheme 54',
                  city: 'Indore',
                  state: 'Madhya Pradesh',
                  postalCode: '452010',
                },
              }]);

        return (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">

              {/* Modal Header */}
              <div className="flex items-start justify-between pb-3.5 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase text-orange-700 bg-orange-100 px-2.5 py-0.5 rounded-md border border-orange-200">
                      Order #{order.orderNumber}
                    </span>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-300">
                      Payout: ₹{payout}
                    </span>
                    {isMultiVendor && (
                      <span className="text-xs font-bold text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-md border border-purple-300">
                        Multi-Store ({pickupStops.length} Stops)
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1.5">
                    Delivery Route & Multi-Stop Details
                  </h3>
                </div>

                <button
                  onClick={() => setSelectedOrderForDetails(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* STAGE 1: PICKUP DETAILS (Supports Single or Multi-Vendor Stops) */}
              <div className="space-y-3">
                <div className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <FiShoppingBag className="text-amber-600" />
                  <span>Pickup Locations ({pickupStops.length} Store{pickupStops.length > 1 ? 's' : ''})</span>
                </div>

                {pickupStops.map((stop, sIdx) => {
                  const sAddr = stop.vendorAddress || stop.vendor?.address || {
                    street: 'Plot 18, Commercial Hub, Scheme 54',
                    city: 'Indore',
                    state: 'Madhya Pradesh',
                    postalCode: '452010',
                  };
                  const sFullAddr = `${sAddr.street || 'Plot 18, Scheme 54'}, ${sAddr.city || 'Indore'}, ${sAddr.state || 'Madhya Pradesh'} ${sAddr.postalCode || '452010'}`;
                  const sPhone = stop.vendorPhone || stop.vendor?.phone || '';
                  const sMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sFullAddr)}`;
                  const storeItems = order.orderItems?.filter(
                    (it) => it.vendor && stop.vendor && (it.vendor.toString() === (stop.vendor._id || stop.vendor).toString())
                  );

                  return (
                    <div key={sIdx} className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs uppercase tracking-wider">
                          <div className="w-5 h-5 rounded-md bg-amber-500 text-white flex items-center justify-center font-black text-[10px]">
                            {sIdx + 1}
                          </div>
                          <span>Stop #{sIdx + 1}: {stop.storeName || 'Vendor Merchant'}</span>
                        </div>
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                          {stop.status || 'Ready for Pickup'}
                        </span>
                      </div>

                      <div className="text-slate-700 text-xs font-medium pl-7">
                        📍 {sFullAddr}
                      </div>

                      {storeItems && storeItems.length > 0 && (
                        <div className="pl-7 text-[11px] text-slate-500 font-semibold">
                          📦 Pick: {storeItems.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-1 pl-7">
                        {sPhone && (
                          <a
                            href={`tel:${sPhone}`}
                            className="py-1 px-2.5 bg-white hover:bg-amber-100/50 text-slate-800 text-[11px] font-bold rounded-lg border border-amber-300 flex items-center gap-1 shadow-2xs transition-all"
                          >
                            <FiPhone className="w-3 h-3 text-amber-700" />
                            <span>Call ({sPhone})</span>
                          </a>
                        )}
                        <a
                          href={sMapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-1 px-2.5 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 shadow-xs transition-all"
                        >
                          <FiNavigation className="w-3 h-3" />
                          <span>Store GPS Map</span>
                          <FiExternalLink className="w-2.5 h-2.5 text-amber-200" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* STAGE 2: COMPLETE DELIVERY DROP DETAILS */}
              <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-teal-900 font-extrabold text-xs uppercase tracking-wider">
                    <div className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center font-black text-xs">
                      🏁
                    </div>
                    <span>Delivery Location (Customer Destination)</span>
                  </div>
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full border border-teal-300">
                    Final Destination
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="font-extrabold text-slate-900 text-sm">
                    👤 {customerName}
                  </div>
                  <div className="text-slate-700 font-medium leading-relaxed">
                    {customerFullAddress}
                  </div>
                </div>

                {/* Delivery Actions */}
                <div className="flex items-center gap-2 pt-1">
                  {customerPhone && (
                    <a
                      href={`tel:${customerPhone}`}
                      className="py-1.5 px-3 bg-white hover:bg-teal-100/50 text-slate-800 text-xs font-bold rounded-xl border border-teal-300 flex items-center gap-1.5 shadow-2xs transition-all"
                    >
                      <FiPhone className="w-3.5 h-3.5 text-teal-700" />
                      <span>Call Customer ({customerPhone})</span>
                    </a>
                  )}
                  <a
                    href={customerMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
                  >
                    <FiNavigation className="w-3.5 h-3.5" />
                    <span>Drop GPS Map</span>
                    <FiExternalLink className="w-3 h-3 text-teal-200" />
                  </a>
                </div>
              </div>

              {/* PARCEL ITEMS LIST WITH VENDOR BADGES */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Items to Pick & Deliver ({order.orderItems?.length})
                </div>
                <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-2xl">
                  {order.orderItems?.map((item, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        {item.image && (
                          <img src={item.image} alt="" className="w-9 h-9 rounded-lg object-cover border shrink-0" />
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">{item.name}</div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <span>Qty: {item.quantity} &bull; ₹{item.price} each</span>
                            {item.vendorStoreName && (
                              <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-semibold text-[10px]">
                                🏪 {item.vendorStoreName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-slate-800 shrink-0">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* PAYMENT COLLECTION INFO */}
              <div className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between ${
                isCOD ? 'bg-amber-50 text-amber-950 border-amber-300' : 'bg-emerald-50 text-emerald-950 border-emerald-300'
              }`}>
                <span>Payment Mode:</span>
                <span className="font-extrabold text-sm">
                  {isCOD ? `💵 Collect Cash: ₹${order.totalPrice?.toLocaleString('en-IN')}` : '💳 Paid Online (No Cash Collection)'}
                </span>
              </div>

              {/* MODAL ACTION BUTTONS */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleRejectOrder(order._id)}
                  className="py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Decline Order
                </button>
                <button
                  onClick={() => handleAcceptOrder(order._id)}
                  disabled={actionLoadingId === order._id || !isOnline}
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-white text-xs font-extrabold shadow-md shadow-orange-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 border border-orange-400"
                >
                  <FiCheck className="w-4 h-4 stroke-[2.5]" />
                  <span>{actionLoadingId === order._id ? 'Claiming Trip...' : 'Accept Delivery Trip'}</span>
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
};
