import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiMenu,
  FiBell,
  FiExternalLink,
  FiLogOut,
  FiUser,
  FiShoppingBag,
  FiCheckCircle,
  FiAlertTriangle,
  FiMessageSquare,
} from 'react-icons/fi';
import { useVendorAuth } from '../context/VendorAuthContext';
import { useToast } from '../context/ToastContext';

export const VendorNavbar = ({ onToggleSidebar }) => {
  const { vendor, logout, socket } = useVendorAuth();
  const { addToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!socket || !vendor?._id) return;

    const handleNewOrder = (data) => {
      const orderNum = data.order?.orderNumber || data.orderNumber || 'New Order';
      const notifKey = `new_order_${orderNum}`;

      setNotifications((prev) => {
        if (prev.some((n) => n.key === notifKey)) return prev;
        const notif = {
          id: Date.now() + Math.random(),
          key: notifKey,
          title: 'New Customer Order Received!',
          desc: `Order #${orderNum} has line items for your store.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'order',
        };
        addToast(`🎉 New Order #${orderNum} placed with your products!`, 'success');
        return [notif, ...prev.slice(0, 9)];
      });
    };

    const handleCancelOrder = (data) => {
      const orderNum = data.orderNumber || 'Order';
      const notifKey = `cancel_${orderNum}`;

      setNotifications((prev) => {
        if (prev.some((n) => n.key === notifKey)) return prev;
        const notif = {
          id: Date.now() + Math.random(),
          key: notifKey,
          title: 'Order Cancelled by Customer',
          desc: `Order #${orderNum} containing your products was cancelled.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'cancel',
        };
        addToast(`⚠️ Order #${orderNum} was cancelled by customer.`, 'warning');
        return [notif, ...prev.slice(0, 9)];
      });
    };

    const handleStatusUpdate = (data) => {
      const orderNum = data.orderNumber || 'Order';
      const notifKey = `status_${orderNum}_${data.status}`;

      setNotifications((prev) => {
        if (prev.some((n) => n.key === notifKey)) return prev;
        const notif = {
          id: Date.now() + Math.random(),
          key: notifKey,
          title: data.title || `Order #${orderNum} Status Updated`,
          desc: data.message || `Order #${orderNum} is now ${data.status}.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: data.type || 'status',
        };
        addToast(
          data.status === 'Delivered'
            ? `🎉 Order #${orderNum} has been delivered to customer!`
            : `🚚 Order #${orderNum}: ${data.status}`,
          'success'
        );
        return [notif, ...prev.slice(0, 9)];
      });
    };

    // Listen to targeted vendor events
    socket.on('vendor_new_order', handleNewOrder);
    socket.on('vendor_order_cancelled', handleCancelOrder);
    socket.on('vendor_order_status', handleStatusUpdate);

    return () => {
      socket.off('vendor_new_order', handleNewOrder);
      socket.off('vendor_order_cancelled', handleCancelOrder);
      socket.off('vendor_order_status', handleStatusUpdate);
    };
  }, [socket, vendor?._id, addToast]);

  return (
    <header className="glass-navbar sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-colors cursor-pointer"
        >
          <FiMenu className="w-5 h-5" />
        </button>

        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center font-black shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <FiShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                {vendor?.storeName || 'Merchant Portal'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-700 border border-orange-200">
                Vendor Hub
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium truncate max-w-xs">
              {vendor?.name} &bull; Commission: {vendor?.commissionRate || 10}%
            </p>
          </div>
        </Link>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Customer Store Link */}
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/70 hover:bg-white text-slate-700 hover:text-orange-600 border border-slate-200 text-xs font-bold transition-all shadow-2xs"
        >
          <span>Live Storefront</span>
          <FiExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>

        {/* Customer Inquiries / Chat Shortcut */}
        <Link
          to="/messages"
          className="p-2.5 rounded-xl bg-white/80 hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200 transition-all relative cursor-pointer shadow-2xs flex items-center gap-1.5"
          title="Customer Inquiries & Live Chat"
        >
          <FiMessageSquare className="w-4 h-4 text-teal-600" />
          <span className="text-xs font-bold text-slate-800 hidden sm:inline">Messages</span>
        </Link>

        {/* Real-Time Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl bg-white/80 hover:bg-orange-50 text-slate-700 hover:text-orange-600 border border-slate-200 transition-all relative cursor-pointer shadow-2xs"
            title="Real-Time Order Notifications"
          >
            <FiBell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                {notifications.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-card p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-orange-100">
                <span className="text-xs font-extrabold text-slate-900">Live Order Alerts</span>
                {notifications.length > 0 && (
                  <button
                    onClick={() => setNotifications([])}
                    className="text-[10px] text-orange-600 hover:underline font-bold"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs font-medium">
                  No new order notifications yet.
                </div>
              ) : (
                <div className="divide-y divide-orange-50 max-h-64 overflow-y-auto space-y-1">
                  {notifications.map((n) => (
                    <div key={n.id} className="pt-2 pb-1 text-xs space-y-0.5">
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{n.time}</span>
                      </div>
                      <p className="text-slate-500 text-[11px] leading-relaxed">{n.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Vendor Status Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border bg-emerald-50 text-emerald-800 border-emerald-200">
          <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>Active Merchant</span>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="p-2.5 rounded-xl bg-white/80 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 transition-all cursor-pointer shadow-2xs"
          title="Sign Out"
        >
          <FiLogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
