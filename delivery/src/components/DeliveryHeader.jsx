import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  FiTruck,
  FiMapPin,
  FiLogOut,
  FiUser,
  FiCompass,
  FiPackage,
  FiClock,
  FiChevronDown,
  FiShield,
  FiActivity,
} from 'react-icons/fi';
import { useDeliveryAuth } from '../context/DeliveryAuthContext';

export const DeliveryHeader = () => {
  const { rider, toggleDuty, logout } = useDeliveryAuth();
  const navigate = useNavigate();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);

  const isOnline = rider?.isAvailable !== false;

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  const mobileNavItems = [
    { path: '/', label: 'Available', icon: FiCompass },
    { path: '/active', label: 'Active', icon: FiPackage },
    { path: '/history', label: 'Earnings', icon: FiClock },
    { path: '/profile', label: 'Profile', icon: FiUser },
  ];

  const handleLogout = () => {
    setShowProfileMenu(false);
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 glass-nav px-3 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between text-slate-900 transition-all">
        <div className="w-full flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Brand Logo & Territory Telemetry */}
          <div className="flex items-center gap-2 sm:gap-3.5">
            <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/25 shrink-0 border border-orange-400/40 group-hover:scale-105 transition-transform">
                <FiTruck className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[2.2]" />
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-sm sm:text-base font-black tracking-tight text-slate-900 group-hover:text-orange-600 transition-colors">
                  NEXUS
                </span>
                <span className="text-[9px] sm:text-[10px] bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold sm:font-black px-2 sm:px-2.5 py-0.5 rounded-full shadow-2xs uppercase tracking-wider whitespace-nowrap">
                  <span className="inline sm:hidden">RIDER</span>
                  <span className="hidden sm:inline">RIDER PORTAL</span>
                </span>
              </div>
            </Link>

            {/* Desktop Location Telemetry Breadcrumb */}
            <div className="hidden xl:flex items-center gap-2 text-xs pl-3 border-l border-orange-200">
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">City:</span>
              <span className="flex items-center gap-1.5 font-semibold text-slate-800 bg-white/80 px-2.5 py-1 rounded-xl border border-orange-200/70 shadow-2xs">
                <FiMapPin className="text-orange-500 w-3 h-3" />
                <span>{rider?.serviceCity || 'Indore'}</span>
              </span>

              <span className="text-orange-300">•</span>

              <span className="flex items-center gap-1.5 font-medium text-slate-600 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <span>Live Dispatches</span>
              </span>
            </div>
          </div>

          {/* Right: Duty Toggle Pill & Profile Dropdown Trigger */}
          <div className="flex items-center gap-2 sm:gap-3.5">
            
            {/* Duty Status Switch Button Pill */}
            <button
              onClick={toggleDuty}
              className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl sm:rounded-2xl text-xs font-semibold flex items-center gap-1.5 sm:gap-2.5 transition-all cursor-pointer border shadow-2xs active:scale-95 ${
                isOnline
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
              title="Click to toggle Online/Offline duty"
            >
              <span className={`w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full ${isOnline ? 'bg-emerald-500 shadow-glow-emerald animate-pulse' : 'bg-slate-400'}`} />
              <span className="text-[10px] sm:text-[11px] font-black">{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
              <span className="hidden sm:inline text-[10px] font-medium text-slate-500 pl-1 border-l border-slate-200">
                {isOnline ? 'Active' : 'Paused'}
              </span>
            </button>

            {/* Rider Profile Card & Dropdown Popover */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-1.5 sm:gap-2.5 p-0.5 sm:pl-2.5 sm:py-1 rounded-xl sm:rounded-2xl sm:border sm:border-orange-200/80 hover:bg-orange-50/60 transition-all cursor-pointer group"
                title="Rider Account & Options"
              >
                <div className="relative">
                  <img
                    src={rider?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={rider?.name}
                    className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-xl object-cover border-2 border-orange-500 bg-white shadow-xs group-hover:scale-105 transition-transform"
                  />
                  <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                    isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                  }`} />
                </div>

                <div className="hidden sm:block text-left min-w-0 max-w-[110px] lg:max-w-[140px]">
                  <div className="text-xs font-black text-slate-800 group-hover:text-orange-600 transition-colors truncate">
                    {rider?.name || 'Rider Partner'}
                  </div>
                  <div className="text-[10px] text-orange-600 font-bold flex items-center gap-0.5 truncate">
                    <FiMapPin className="w-2.5 h-2.5 shrink-0 text-orange-500" />
                    <span className="truncate">{rider?.serviceCity || 'Indore'}</span>
                  </div>
                </div>

                <FiChevronDown className={`hidden sm:block w-3.5 h-3.5 text-slate-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-white/95 backdrop-blur-2xl border border-orange-200/80 rounded-2xl shadow-2xl z-50 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-150">
                  
                  {/* Rider Info Header */}
                  <div className="p-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center gap-3">
                    <img
                      src={rider?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt=""
                      className="w-10 h-10 rounded-xl object-cover border-2 border-white/80 shadow-xs"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-black truncate">{rider?.name || 'Delivery Partner'}</h4>
                      <p className="text-[10px] text-orange-100 font-mono truncate">{rider?.email}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="text-[9px] font-black bg-white/20 px-1.5 py-0.2 rounded text-white">
                          {rider?.vehicleType || 'Bike'} • {rider?.serviceCity || 'Indore'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Duty Status Switch in Menu */}
                  <div className="p-3 bg-orange-50/50 border-b border-orange-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-800">Duty Status</div>
                      <div className="text-[10px] text-slate-500">{isOnline ? 'Online • Ready for orders' : 'Offline • Paused'}</div>
                    </div>
                    <button
                      onClick={toggleDuty}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                        isOnline
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isOnline ? 'Go Offline' : 'Go Online'}
                    </button>
                  </div>

                  {/* Menu Nav Links */}
                  <div className="p-2 space-y-1 text-xs">
                    <Link
                      to="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 hover:text-orange-700 font-bold transition-colors"
                    >
                      <FiUser className="w-4 h-4 text-orange-500" />
                      <span>Rider Fleet Profile</span>
                    </Link>

                    <Link
                      to="/active"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 hover:text-orange-700 font-bold transition-colors"
                    >
                      <FiPackage className="w-4 h-4 text-blue-500" />
                      <span>Active Deliveries</span>
                    </Link>

                    <Link
                      to="/history"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-orange-50 hover:text-orange-700 font-bold transition-colors"
                    >
                      <FiClock className="w-4 h-4 text-emerald-500" />
                      <span>Earnings & Past Trips</span>
                    </Link>
                  </div>

                  {/* Sign Out Action Button */}
                  <div className="p-2.5 bg-slate-50 border-t border-slate-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-200 rounded-xl text-xs font-black transition-all cursor-pointer"
                    >
                      <FiLogOut className="w-4 h-4 text-rose-600" />
                      <span>Sign Out from Delivery</span>
                    </button>
                  </div>

                </div>
              )}
            </div>

            {/* Desktop Direct Sign Out Button */}
            <button
              onClick={handleLogout}
              className="hidden sm:flex p-2 bg-[#0d9488] hover:bg-teal-700 text-white rounded-xl transition-all shadow-glow-teal cursor-pointer border border-teal-500 active:scale-95"
              title="Sign Out"
            >
              <FiLogOut className="w-4 h-4" />
            </button>

          </div>

        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (< md screens) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 border-t border-slate-200 p-1.5 shadow-xl backdrop-blur-md">
        <div className="grid grid-cols-4 gap-1 max-w-md mx-auto">
          {mobileNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-1 rounded-xl text-[10px] font-bold transition-all ${
                  isActive
                    ? 'text-orange-600 bg-orange-50 font-black scale-102'
                    : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <item.icon className="w-4 h-4 mb-0.5" />
              <span className="truncate max-w-full font-bold">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
};
