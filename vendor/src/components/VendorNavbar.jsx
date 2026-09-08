import React, { useState, useEffect, useRef } from 'react';
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
  FiChevronDown,
  FiPercent,
  FiGrid,
  FiSettings,
} from 'react-icons/fi';
import { useVendorAuth } from '../context/VendorAuthContext';
import { useToast } from '../context/ToastContext';

export const VendorNavbar = ({ onToggleSidebar }) => {
  const { vendor, logout, socket } = useVendorAuth();
  const { addToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    <header className="glass-navbar sticky top-0 z-30 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4">
      {/* Left: Mobile Toggle & Brand */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-700 bg-white/80 hover:bg-orange-50 hover:text-orange-600 border border-slate-200/80 transition-all cursor-pointer shadow-2xs shrink-0"
          aria-label="Toggle navigation menu"
        >
          <FiMenu className="w-5 h-5" />
        </button>

        <Link to="/" className="flex items-center gap-2 sm:gap-3 group min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center font-black shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform shrink-0">
            <FiShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-black text-xs sm:text-base text-slate-900 tracking-tight truncate max-w-[130px] xs:max-w-[170px] sm:max-w-xs">
                {vendor?.storeName || 'Merchant Portal'}
              </span>
              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-orange-100 text-orange-700 border border-orange-200 shrink-0">
                Vendor
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-semibold truncate hidden xs:block max-w-[180px] sm:max-w-xs">
              {vendor?.name} &bull; Commission: {vendor?.commissionRate || 10}%
            </p>
          </div>
        </Link>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Customer Store Link */}
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white text-slate-700 hover:text-orange-600 border border-slate-200 text-xs font-bold transition-all shadow-2xs"
        >
          <span>Live Storefront</span>
          <FiExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>

        {/* Real-Time Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="p-2 sm:p-2.5 rounded-xl bg-white/80 hover:bg-orange-50 text-slate-700 hover:text-orange-600 border border-slate-200/80 transition-all relative cursor-pointer shadow-2xs"
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
            <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-xs sm:max-w-sm bg-white/95 backdrop-blur-md rounded-2xl border border-orange-200 p-3.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-orange-100">
                <span className="text-xs font-black text-slate-900">Live Order Alerts</span>
                {notifications.length > 0 && (
                  <button
                    onClick={() => setNotifications([])}
                    className="text-[10px] text-orange-600 hover:underline font-bold cursor-pointer"
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

        {/* Vendor Status Pill (Desktop) */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border bg-emerald-50 text-emerald-800 border-emerald-200">
          <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>Active Merchant</span>
        </div>

        {/* Vendor Profile Dropdown (Mobile & Desktop) */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-1.5 sm:gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/80 hover:bg-orange-50 border border-slate-200/80 transition-all cursor-pointer shadow-2xs"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orange-100 border border-orange-300 flex items-center justify-center text-orange-800 font-black text-xs shrink-0 overflow-hidden">
              {vendor?.storeLogo ? (
                <img src={vendor.storeLogo} alt={vendor.storeName} className="w-full h-full object-cover" />
              ) : (
                (vendor?.storeName?.[0] || 'V').toUpperCase()
              )}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-black text-slate-900 leading-tight truncate max-w-[100px]">
                {vendor?.name || 'Vendor'}
              </div>
              <div className="text-[9px] font-bold text-slate-400 leading-tight">
                {vendor?.storeName || 'Portal'}
              </div>
            </div>
            <FiChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                showProfileMenu ? 'rotate-180 text-orange-600' : ''
              }`}
            />
          </button>

          {/* Profile Menu Popover */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-md rounded-2xl border border-orange-200 p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 space-y-3">
              {/* Profile Card Header */}
              <div className="p-2.5 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                    {(vendor?.storeName?.[0] || 'V').toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-black text-slate-900 truncate">
                      {vendor?.storeName || 'My Store'}
                    </div>
                    <div className="text-[10px] text-slate-500 font-semibold truncate">
                      {vendor?.email}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-orange-200/60 text-slate-600 font-bold">
                  <span>Commission Rate:</span>
                  <span className="text-orange-700 font-black">{vendor?.commissionRate || 10}%</span>
                </div>
              </div>

              {/* Quick Links */}
              <div className="space-y-1">
                <Link
                  to="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                >
                  <FiSettings className="w-3.5 h-3.5 text-slate-400" />
                  <span>Store Settings</span>
                </Link>

                <a
                  href="http://localhost:5173"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FiShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                    <span>View Storefront</span>
                  </div>
                  <FiExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>

              {/* Sign Out Button */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition-all cursor-pointer active:scale-95"
                >
                  <FiLogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
