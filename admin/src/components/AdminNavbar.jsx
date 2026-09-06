import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiMenu,
  FiBell,
  FiSearch,
  FiExternalLink,
  FiLogOut,
  FiCheckCircle,
  FiAlertTriangle,
  FiPackage,
  FiShield,
  FiDollarSign,
  FiTrash2,
} from 'react-icons/fi';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useToast } from '../context/ToastContext';

export const AdminNavbar = ({ onToggleSidebar }) => {
  const { admin, logout, socket } = useAdminAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);

  // Load persisted notifications or default mock
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_admin_notifications');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved notifications');
    }
    return [
      {
        id: 1,
        title: 'System Initialized',
        message: 'Real-time telemetry and order dispatch monitor active.',
        time: 'Just now',
        unread: false,
        type: 'system',
        link: '/orders',
      },
    ];
  });

  const notifRef = useRef(null);
  const unreadCount = notifications.filter((n) => n.unread).length;

  // Persist notifications whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('nexus_admin_notifications', JSON.stringify(notifications.slice(0, 30)));
    } catch (e) {
      console.warn('Failed to save notifications');
    }
  }, [notifications]);

  // Real-time socket listener for incoming notifications
  useEffect(() => {
    if (!socket) return;

    const handleAdminNotification = (data) => {
      const newNotif = {
        id: data.id || Date.now(),
        title: data.title || 'System Alert',
        message: data.message || 'New event recorded',
        time: 'Just now',
        unread: true,
        type: data.type || 'order',
        link: data.link || '/orders',
      };

      setNotifications((prev) => [newNotif, ...prev.slice(0, 25)]);
      addToast(
        `🔔 ${data.title}: ${data.message}`,
        data.type === 'alert' ? 'error' : 'success'
      );
    };

    socket.on('admin_notification', handleAdminNotification);

    return () => {
      socket.off('admin_notification', handleAdminNotification);
    };
  }, [socket, addToast]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (link, id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
    setShowNotifications(false);
    navigate(link || '/orders');
  };

  const renderIcon = (type) => {
    switch (type) {
      case 'product':
        return <FiPackage className="w-4 h-4 text-orange-600" />;
      case 'alert':
        return <FiAlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'order':
        return <FiDollarSign className="w-4 h-4 text-emerald-600" />;
      default:
        return <FiCheckCircle className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 glass-nav px-4 sm:px-6 py-3 flex items-center justify-between text-slate-900 transition-all">

      {/* Left: Mobile Toggle & Brand */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-700 hover:bg-orange-100/60 rounded-xl transition-colors cursor-pointer"
        >
          <FiMenu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center border border-sky-300 shadow-sm">
            <FiShield className="w-5 h-5 text-[#78350f]" />
          </div>
          <div>
            <div className="text-base font-black tracking-tight flex items-center gap-2">
              <span className="text-[#78350f]">NEXUS</span>
              <span className="text-[10px] bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black px-2.5 py-0.5 rounded-full shadow-xs">
                ADMIN COMMAND
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="hidden md:flex items-center max-w-md w-full mx-8">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search orders, SKU, building supplies, customers..."
            className="w-full bg-white/80 backdrop-blur-md border border-orange-200/70 focus:border-orange-500 focus:bg-white text-xs rounded-xl py-2 pl-9 pr-4 text-slate-900 outline-none placeholder-slate-400 font-bold shadow-xs transition-all"
          />
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-orange-500" />
        </div>
      </div>

      {/* Right Controls: Blue Storefront Button, Notifications, Red Logout Button */}
      <div className="flex items-center gap-3 sm:gap-4">

        {/* BLUE BUTTON: Switch to Customer Store */}
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-glow-blue transition-all transform hover:-translate-y-0.5 cursor-pointer border border-blue-500 active:scale-98"
          title="Open Customer Storefront (Port 5173)"
        >
          <span>Live Store</span>
          <FiExternalLink className="w-3.5 h-3.5 text-white" />
        </a>

        {/* Real-time Interactive Notification Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 text-slate-700 hover:bg-orange-100/60 rounded-xl transition-colors cursor-pointer"
            title="System Notifications"
          >
            <FiBell className="w-4 h-4" />
            {unreadCount > 0 && (
              <>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </>
            )}
          </button>

          {/* Floating Dropdown Drawer */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white/95 backdrop-blur-2xl border border-orange-200/80 rounded-2xl shadow-2xl z-50 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-150">

              {/* Dropdown Header */}
              <div className="p-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black">System Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-black bg-white text-orange-600 px-2 py-0.5 rounded-full shadow-2xs">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] font-extrabold text-orange-100 hover:text-white transition-colors cursor-pointer"
                    >
                      Mark read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="text-[10px] font-extrabold text-orange-100 hover:text-white transition-colors cursor-pointer"
                      title="Clear notifications"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Alerts List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-orange-100/60">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 font-semibold">
                    No new system alerts
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif.link, notif.id)}
                      className={`p-3.5 hover:bg-orange-50/50 transition-colors cursor-pointer flex items-start gap-3 ${
                        notif.unread ? 'bg-orange-50/30' : 'bg-white/60'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs shrink-0 mt-0.5">
                        {notif.icon || renderIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4 className="text-xs font-black text-slate-900 truncate">{notif.title}</h4>
                          <span className="text-[10px] text-slate-400 font-medium shrink-0 ml-2">{notif.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium leading-tight line-clamp-2">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Dropdown Footer */}
              <div className="p-2.5 bg-orange-50/50 border-t border-orange-100 text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/orders');
                  }}
                  className="text-xs font-black text-orange-600 hover:text-orange-700 transition-colors cursor-pointer"
                >
                  View Full Orders & Analytics →
                </button>
              </div>

            </div>
          )}
        </div>

        {/* Admin Profile & RED Logout Button */}
        <div className="flex items-center gap-3 pl-2 border-l border-orange-200">
          <Link to="/profile" className="flex items-center gap-2.5 group">
            <img
              src={admin?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={admin?.name}
              className="w-8 h-8 rounded-full object-cover border-2 border-orange-500 group-hover:scale-105 transition-transform shadow-xs"
            />
            <div className="hidden lg:block text-left">
              <div className="text-xs font-black text-slate-900 group-hover:text-orange-600 transition-colors truncate max-w-[100px]">
                {admin?.name || 'Administrator'}
              </div>
              <div className="text-[10px] text-orange-600 font-black">Super Admin</div>
            </div>
          </Link>

          {/* Teal BUTTON: Sign Out with Glow Shadow */}
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="p-2 bg-[#0d9488] hover:bg-teal-700 text-white rounded-xl transition-all shadow-glow-teal cursor-pointer border border-teal-500 active:scale-95"
            title="Sign Out of Admin"
          >
            <FiLogOut className="w-4 h-4" />
          </button>
        </div>

      </div>

    </header>
  );
};
