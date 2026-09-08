import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  FiPackage,
  FiClock,
  FiCheckCircle,
  FiTruck,
  FiAlertCircle,
  FiChevronRight,
  FiExternalLink,
  FiXCircle,
  FiSlash,
  FiX,
  FiKey,
  FiRotateCcw,
  FiCornerUpLeft,
  FiPhone,
  FiMessageSquare,
  FiShoppingBag,
} from 'react-icons/fi';
import { formatPrice, formatDate } from '../utils/helpers';

export const OrdersPage = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItemKey, setSelectedItemKey] = useState(null);

  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'DELIVERED' | 'CANCELLED'
  const [searchQuery, setSearchQuery] = useState('');

  // Cancellation Modal States
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Ordered by mistake');
  const [customReason, setCustomReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Return & Replacement Modal States
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnType, setReturnType] = useState('Refund'); // 'Refund' | 'Replacement'
  const [returnReason, setReturnReason] = useState('Item damaged or defective upon arrival');
  const [returnComments, setReturnComments] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate('/auth?redirect=orders');
      return;
    }

    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/myorders');
        const fetchedOrders = data.orders || [];
        setOrders(fetchedOrders);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, navigate]);

  // Flatten orders into individual purchased items
  const allOrderedItems = useMemo(() => {
    return orders.flatMap((order) => {
      return (order.orderItems || []).map((item, idx) => {
        const vId = (item.vendor?._id || item.vendor)?.toString();
        const vendorSubOrder = order.vendors?.find(
          (v) => (v.vendor?._id || v.vendor)?.toString() === vId
        ) || null;

        // Individual item status priority: item.itemStatus -> vendorSubOrder.status -> order.status
        const itemStatus = item.itemStatus || vendorSubOrder?.status || order.status;

        return {
          key: `${order._id}_${item._id || item.product || idx}`,
          orderId: order._id,
          order,
          item,
          vendorSubOrder,
          itemStatus,
          vendorStoreName: item.vendorStoreName || vendorSubOrder?.storeName || item.vendorName || 'Nexus Store',
          vendorPhone: vendorSubOrder?.vendorPhone || '9876543210',
          vendorId: item.vendor,
          createdAt: order.createdAt,
        };
      });
    });
  }, [orders]);

  // Set default selected item
  useEffect(() => {
    if (allOrderedItems.length > 0 && !selectedItemKey) {
      setSelectedItemKey(allOrderedItems[0].key);
    }
  }, [allOrderedItems, selectedItemKey]);

  // Tab and Search Filtering
  const filteredItems = useMemo(() => {
    return allOrderedItems.filter((entry) => {
      const st = entry.itemStatus || entry.order.status;

      // 1. Tab filter
      if (activeTab === 'ACTIVE') {
        if (!['Pending', 'Confirmed', 'Packed', 'Partially Ready', 'Ready for Pickup', 'Assigned', 'Picked Up', 'Out for Delivery'].includes(st)) {
          return false;
        }
      } else if (activeTab === 'DELIVERED') {
        if (st !== 'Delivered') return false;
      } else if (activeTab === 'CANCELLED') {
        if (!['Cancelled', 'Returned', 'Return Requested'].includes(st) && entry.order.status !== 'Cancelled') {
          return false;
        }
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const orderNum = (entry.order.orderNumber || '').toLowerCase();
        const tracking = (entry.order.trackingNumber || '').toLowerCase();
        const productName = (entry.item.name || '').toLowerCase();
        const storeName = (entry.vendorStoreName || '').toLowerCase();
        return orderNum.includes(q) || tracking.includes(q) || productName.includes(q) || storeName.includes(q);
      }

      return true;
    });
  }, [allOrderedItems, activeTab, searchQuery]);

  const selectedItem = allOrderedItems.find((it) => it.key === selectedItemKey) || filteredItems[0] || allOrderedItems[0] || null;
  const selectedOrder = selectedItem?.order || null;

  const activeCount = allOrderedItems.filter((it) =>
    ['Pending', 'Confirmed', 'Packed', 'Partially Ready', 'Ready for Pickup', 'Assigned', 'Picked Up', 'Out for Delivery'].includes(it.itemStatus)
  ).length;
  const deliveredCount = allOrderedItems.filter((it) => it.itemStatus === 'Delivered').length;
  const cancelledCount = allOrderedItems.filter((it) => ['Cancelled', 'Returned', 'Return Requested'].includes(it.itemStatus) || it.order.status === 'Cancelled').length;
  const totalSpent = orders.reduce((sum, o) => o.status !== 'Cancelled' ? sum + (o.totalPrice || 0) : sum, 0);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1"><FiCheckCircle className="w-3.5 h-3.5" /> Delivered</span>;
      case 'Out for Delivery':
      case 'Shipped':
      case 'Picked Up':
      case 'Assigned':
        return <span className="bg-blue-100 text-blue-800 text-[11px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 animate-pulse"><FiTruck className="w-3.5 h-3.5" /> Live In Transit</span>;
      case 'Ready for Pickup':
        return <span className="bg-purple-100 text-purple-800 text-[11px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1"><FiPackage className="w-3.5 h-3.5" /> Ready for Pickup</span>;
      case 'Partially Ready':
      case 'Processing':
      case 'Confirmed':
      case 'Packed':
        return <span className="bg-amber-100 text-amber-800 text-[11px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1"><FiClock className="w-3.5 h-3.5" /> {status}</span>;
      case 'Cancelled':
        return <span className="bg-rose-100 text-rose-800 text-[11px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1"><FiSlash className="w-3.5 h-3.5" /> Cancelled</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 text-[11px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1"><FiClock className="w-3.5 h-3.5" /> {status}</span>;
    }
  };

  const handleConfirmCancel = async () => {
    if (!selectedOrder) return;
    setCancelling(true);
    const finalReason = cancelReason === 'Other' ? (customReason.trim() || 'Other reason') : cancelReason;

    try {
      const { data } = await api.put(`/orders/${selectedOrder._id}/cancel`, {
        reason: finalReason,
      });

      if (data.success) {
        addToast(`Order #${selectedOrder.orderNumber} has been cancelled.`, 'info');
        const updated = data.order || { ...selectedOrder, status: 'Cancelled', deliveryStatus: 'CANCELLED' };
        setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
        setShowCancelModal(false);
        setCustomReason('');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel order. Please try again.';
      addToast(msg, 'error');
    } finally {
      setCancelling(false);
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setSubmittingReturn(true);
    try {
      const { data } = await api.post(`/orders/${selectedOrder._id}/return`, {
        reason: returnReason,
        comments: returnComments,
        returnType,
      });

      if (data.success) {
        addToast('Return request submitted successfully!', 'success');
        const updated = data.order || {
          ...selectedOrder,
          returnRequest: {
            isRequested: true,
            reason: returnReason,
            comments: returnComments,
            returnType,
            status: 'REQUESTED',
          },
        };
        setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
        setShowReturnModal(false);
        setReturnComments('');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit return request', 'error');
    } finally {
      setSubmittingReturn(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-bold text-slate-600">Loading your purchase history...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-md">
          <FiPackage />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">No Orders Placed Yet</h1>
        <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
          When you purchase products, their live tracking and shipment statuses will appear here for each product individually.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-600 text-white font-bold text-xs rounded-2xl shadow-lg"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6 sm:space-y-8">

      {/* Page Title Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 shadow-2xs">
          <FiPackage className="w-4 h-4" />
        </div>
        <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
          My Orders
        </h1>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-2xl overflow-x-auto shadow-2xs">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Items ({allOrderedItems.length})
          </button>

          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'ACTIVE'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-blue-700 hover:bg-blue-50'
            }`}
          >
            <span>⚡ Active Orders</span>
            <span className="px-1.5 py-0.2 text-[10px] bg-blue-100 text-blue-900 rounded-full font-bold">
              {activeCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('DELIVERED')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'DELIVERED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <span>✅ Delivered</span>
            <span className="px-1.5 py-0.2 text-[10px] bg-emerald-100 text-emerald-900 rounded-full font-bold">
              {deliveredCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('CANCELLED')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'CANCELLED'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            Cancelled ({cancelledCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Product, Order # or Store..."
            className="w-full bg-white border border-slate-200 rounded-2xl py-2 pl-9 pr-4 text-xs font-semibold text-slate-800 outline-none focus:border-brand-500 shadow-2xs"
          />
          <FiShoppingBag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Individual Products List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider px-1">
            Ordered Items ({filteredItems.length}) &bull; Click to View Status
          </div>

          {filteredItems.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center space-y-2">
              <FiPackage className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="font-bold text-slate-700 text-sm">No items found</div>
              <div className="text-xs text-slate-400">Try changing your search query or tab filter.</div>
            </div>
          ) : (
            filteredItems.map((entry) => {
              const isSelected = selectedItem?.key === entry.key;

              return (
                <div
                  key={entry.key}
                  onClick={() => setSelectedItemKey(entry.key)}
                  className={`p-4 rounded-3xl border cursor-pointer transition-all space-y-3 ${
                    isSelected
                      ? 'bg-brand-50/70 border-brand-500 shadow-md ring-2 ring-brand-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-sm'
                  }`}
                >
                  {/* Item Image + Title + Price Header */}
                  <div className="flex items-start gap-3">
                    <img
                      src={entry.item.image}
                      alt={entry.item.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 line-clamp-2 leading-snug">
                        {entry.item.name}
                      </h4>

                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                          🏪 {entry.vendorStoreName}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Qty: <strong className="text-slate-800">{entry.item.quantity}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Number, Date & Status Bar */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <div>
                      <div className="font-mono font-bold text-[11px] text-slate-500">
                        {entry.order.orderNumber}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {formatDate(entry.createdAt)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-xs text-slate-900">
                        {formatPrice(entry.item.price * entry.item.quantity)}
                      </span>
                      {getStatusBadge(entry.itemStatus)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Product Dedicated Status Details & Timeline (7 cols) */}
        {selectedItem && selectedOrder ? (
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 lg:sticky lg:top-28">

            {/* Selected Product Banner Header */}
            <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={selectedItem.item.image}
                    alt={selectedItem.item.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-white/20 shrink-0 shadow-md"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                      Order Details
                    </span>
                    <h2 className="text-sm sm:text-base font-extrabold text-white line-clamp-1">
                      {selectedItem.item.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-300">
                      <span>Order #{selectedOrder.orderNumber}</span>
                      <span>&bull;</span>
                      <span className="text-amber-300 font-mono font-bold">
                        {formatPrice(selectedItem.item.price * selectedItem.item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Badges and Order Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Product Status:</span>
                {getStatusBadge(selectedItem.itemStatus)}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Cancel Button */}
                {selectedItem.itemStatus !== 'Delivered' && selectedItem.itemStatus !== 'Cancelled' && selectedOrder.status !== 'Cancelled' && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <FiSlash className="w-3.5 h-3.5" />
                    <span>Cancel Order</span>
                  </button>
                )}

                {/* Return / Replacement Button */}
                {(selectedItem.itemStatus === 'Delivered' || selectedOrder.status === 'Delivered') && !selectedOrder.returnRequest?.isRequested && (
                  <button
                    onClick={() => setShowReturnModal(true)}
                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <FiRotateCcw className="w-3.5 h-3.5" />
                    <span>Request Return / Replacement</span>
                  </button>
                )}

                {/* Return in progress badge */}
                {selectedOrder.returnRequest?.isRequested && (
                  <span className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold rounded-xl flex items-center gap-1.5">
                    <FiRotateCcw className="w-3.5 h-3.5 animate-spin" />
                    <span>Return: {selectedOrder.returnRequest.status}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Product Fulfilled By Merchant Card */}
            <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-base shadow-2xs">
                  🏪
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span>Seller: {selectedItem.vendorStoreName}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full">
                      Verified
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    This item is packed and dispatched directly from this merchant's local store.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="tel:18004196398"
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs"
                >
                  <FiPhone className="w-3 h-3 text-slate-500" />
                  <span>Call Office</span>
                </a>
                <button
                  onClick={() => {
                    navigate(`/support?orderId=${selectedOrder._id}`, {
                      state: { order: selectedOrder, product: selectedItem?.item },
                    });
                  }}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <FiMessageSquare className="w-3 h-3" />
                  <span>Chat Support</span>
                </button>
              </div>
            </div>

            {/* Customer Tracking Timeline Stepper or Cancelled Box */}
            {selectedItem.itemStatus === 'Cancelled' || selectedOrder.status === 'Cancelled' ? (
              <div className="p-5 bg-rose-50/80 rounded-2xl border border-rose-200 text-rose-950 space-y-2">
                <div className="flex items-center gap-2 text-rose-800 font-extrabold text-sm">
                  <FiAlertCircle className="w-5 h-5 text-rose-600" />
                  <span>This Product Has Been Cancelled</span>
                </div>
                <p className="text-xs text-rose-700 leading-relaxed font-medium">
                  {selectedOrder.notes && selectedOrder.notes.includes('Cancel Reason:')
                    ? selectedOrder.notes
                    : 'The item was cancelled before delivery. Any payment and inventory have been released.'}
                </p>
                <div className="pt-2 text-[11px] text-rose-600 font-semibold">
                  Status: <span className="uppercase font-mono font-bold">CANCELLED</span> &bull; Products returned to warehouse inventory
                </div>
              </div>
            ) : (() => {
              const st = selectedItem.itemStatus || selectedOrder.status || 'Pending';
              const isDelivered = st === 'Delivered';
              const isOutForDelivery = st === 'Out for Delivery' || st === 'Picked Up' || st === 'Shipped' || isDelivered;
              const isReady = st === 'Ready for Pickup' || isOutForDelivery;
              const isPacked = st === 'Packed' || isReady;
              const isConfirmed = st === 'Confirmed' || isPacked;
              const isPlaced = true;

              const stages = [
                {
                  label: '1. Placed',
                  desc: 'Order received',
                  isDone: isPlaced,
                  time: selectedOrder.createdAt ? formatDate(selectedOrder.createdAt) : null,
                },
                {
                  label: '2. Confirmed',
                  desc: 'Accepted by Seller',
                  isDone: isConfirmed,
                  time: selectedOrder.confirmedAt ? formatDate(selectedOrder.confirmedAt) : (isConfirmed ? 'Confirmed' : null),
                },
                {
                  label: '3. Packed',
                  desc: 'Box sealed & ready',
                  isDone: isPacked,
                  time: selectedOrder.packedAt ? formatDate(selectedOrder.packedAt) : (isPacked ? 'Packed' : null),
                },
                {
                  label: '4. In Transit',
                  desc: 'Courier on the way',
                  isDone: isOutForDelivery,
                  time: selectedOrder.outForDeliveryAt ? formatDate(selectedOrder.outForDeliveryAt) : (isOutForDelivery ? 'In Transit' : null),
                },
                {
                  label: '5. Delivered',
                  desc: 'Handed over to you',
                  isDone: isDelivered,
                  time: selectedOrder.deliveredAt ? formatDate(selectedOrder.deliveredAt) : (isDelivered ? 'Delivered' : null),
                },
              ];

              return (
                <div className="p-4 sm:p-5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                      Product Delivery Progress
                    </span>
                    <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                      Product Status: {selectedItem.itemStatus}
                    </span>
                  </div>

                  {/* 5-Stage Stepper */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                    {stages.map((stage, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          stage.isDone
                            ? 'bg-emerald-50 text-emerald-950 border-emerald-300 shadow-2xs'
                            : 'bg-white text-slate-400 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-center mb-1">
                          {stage.isDone ? (
                            <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">
                              ✓
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-slate-300 text-slate-400 flex items-center justify-center text-[9px] font-bold">
                              {idx + 1}
                            </div>
                          )}
                        </div>
                        <div className="font-extrabold text-[11px] truncate">{stage.label}</div>
                        <div className="text-[9px] text-slate-500 mt-0.5 leading-tight">{stage.time || 'Pending'}</div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Handover OTP Badge */}
                  {selectedOrder.status !== 'Delivered' && selectedOrder.status !== 'Cancelled' && selectedOrder.deliveryOtp && (
                    <div className="p-3.5 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between shadow-2xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-sm shadow-xs">
                          <FiKey className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-[11px] font-black uppercase text-amber-950 tracking-wider">
                            Delivery Handover Security PIN
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">
                            Share this 4-digit OTP with your rider upon parcel arrival
                          </div>
                        </div>
                      </div>
                      <div className="px-3.5 py-1.5 bg-white border-2 border-amber-400 rounded-xl font-mono font-black text-base text-amber-800 tracking-widest shadow-xs">
                        {selectedOrder.deliveryOtp}
                      </div>
                    </div>
                  )}

                  {selectedOrder.deliveryPartner && (
                    <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <FiTruck className="text-teal-600 w-4 h-4" />
                        <div>
                          <span className="font-bold text-slate-800">Assigned Courier: </span>
                          <span className="font-semibold text-slate-700">{selectedOrder.deliveryPartner.name}</span>
                        </div>
                      </div>
                      <span className="text-slate-500 text-[11px] font-medium">{selectedOrder.deliveryPartner.phone}</span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Tracking Bar */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-bold">Delivery Speed:</span>
                <span className="inline-flex items-center gap-1 font-bold text-orange-700 bg-orange-100/90 px-2 py-0.5 rounded-lg border border-orange-200 text-[11px]">
                  {selectedOrder.deliveryOptionName ||
                    (selectedOrder.deliveryOption === 'instant'
                      ? '⚡ Instant Delivery (30-45 mins)'
                      : selectedOrder.deliveryOption === 'nextday'
                      ? '🚚 Next Day Delivery'
                      : '🕒 4-Hour Express')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-bold">Airway Tracking Number:</span>
                <span className="font-mono font-bold text-brand-600">{selectedOrder.trackingNumber || 'TRK-ASSIGNING'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-bold">Payment Status:</span>
                <span className={`font-bold ${selectedOrder.isPaid ? 'text-emerald-600' : (selectedOrder.status === 'Cancelled' ? 'text-slate-500 line-through' : 'text-amber-600')}`}>
                  {selectedOrder.status === 'Cancelled' ? 'Cancelled (No charge)' : (selectedOrder.isPaid ? `Paid with ${selectedOrder.paymentMethod}` : 'Pending Payment (Cash on Delivery)')}
                </span>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <span className="font-bold text-slate-700 block mb-1">Destination Address:</span>
              <div className="text-slate-900 font-semibold">{selectedOrder.shippingAddress?.fullName} ({selectedOrder.shippingAddress?.phone})</div>
              <div className="text-slate-600">{selectedOrder.shippingAddress?.street}</div>
              <div className="text-slate-600">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.postalCode}</div>
            </div>

            {/* Financial Summary */}
            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600 font-semibold">
                <span>Selected Item ({selectedItem.item.name} × {selectedItem.item.quantity})</span>
                <span className="font-mono">{formatPrice(selectedItem.item.price * selectedItem.item.quantity)}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Total Order Subtotal ({selectedOrder.orderNumber})</span>
                <span>{formatPrice(selectedOrder.totalPrice)}</span>
              </div>
            </div>

          </div>
        ) : null}

      </div>

      {/* Cancellation Confirmation Modal */}
      {showCancelModal && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-black">
                  <FiAlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Cancel Order #{selectedOrder.orderNumber}</h3>
                  <p className="text-xs text-slate-500">Are you sure you want to cancel this order?</p>
                </div>
              </div>
              <button
                onClick={() => setShowCancelModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">
                Please select a reason for cancellation:
              </label>
              <div className="space-y-2">
                {[
                  'Ordered by mistake',
                  'Found a lower price elsewhere',
                  'Delivery is taking longer than expected',
                  'Need to change shipping address or contact info',
                  'Ordered wrong product or quantity',
                  'Other',
                ].map((reasonOption) => (
                  <label
                    key={reasonOption}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      cancelReason === reasonOption
                        ? 'bg-rose-50/70 border-rose-300 text-rose-950 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancelReason"
                      value={reasonOption}
                      checked={cancelReason === reasonOption}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span>{reasonOption}</span>
                  </label>
                ))}
              </div>

              {cancelReason === 'Other' && (
                <div className="mt-2">
                  <textarea
                    rows="2"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Provide specific feedback (optional)..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none"
                  />
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
              ℹ️ Once cancelled, reserved product units will be immediately released back to stock. Any prepaid transactions will be automatically reversed.
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                className="py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Keep My Order
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-extrabold shadow-md shadow-rose-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return & Replacement Modal */}
      {showReturnModal && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                  <FiRotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Return / Replace Order #{selectedOrder.orderNumber}
                  </h3>
                  <p className="text-xs text-slate-500">Initiate return request or replacement for delivered items</p>
                </div>
              </div>
              <button
                onClick={() => setShowReturnModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReturnSubmit} className="space-y-4">
              {/* Return Type: Refund vs Replacement */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Preferred Resolution:</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'Refund', label: '💸 Full Refund to Original Payment', desc: 'Credit back to account' },
                    { id: 'Replacement', label: '🔄 Free Replacement Parcel', desc: 'Send new fresh unit' },
                  ].map((type) => (
                    <label
                      key={type.id}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                        returnType === type.id
                          ? 'bg-amber-50/80 border-amber-400 shadow-sm'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="returnType"
                        value={type.id}
                        checked={returnType === type.id}
                        onChange={(e) => setReturnType(e.target.value)}
                        className="hidden"
                      />
                      <div className="text-xs font-bold text-slate-900">{type.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{type.desc}</div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Reason Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Reason for Return:</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-amber-500 focus:bg-white"
                >
                  <option value="Item damaged or defective upon arrival">Item damaged or defective upon arrival</option>
                  <option value="Received incorrect product or variant">Received incorrect product or variant</option>
                  <option value="Item quality did not match description">Item quality did not match description</option>
                  <option value="Missing parts or accessories in parcel">Missing parts or accessories in parcel</option>
                  <option value="Size / Dimension mismatch">Size / Dimension mismatch</option>
                  <option value="Other product issue">Other product issue</option>
                </select>
              </div>

              {/* Comments */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Additional Details / Feedback:</label>
                <textarea
                  rows="2"
                  value={returnComments}
                  onChange={(e) => setReturnComments(e.target.value)}
                  placeholder="Describe the issue with the delivered product (e.g. cracked packaging, wrong size)..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 rounded-xl outline-none"
                />
              </div>

              <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200 text-[11px] text-amber-950 leading-relaxed">
                📍 Reverse pickup will be arranged from your delivery address upon seller review.
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={submittingReturn}
                  className="py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-extrabold shadow-md shadow-amber-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {submittingReturn ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

