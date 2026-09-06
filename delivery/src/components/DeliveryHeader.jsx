import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  FiTruck,
  FiMapPin,
  FiLogOut,
  FiUser,
  FiCompass,
  FiPackage,
  FiClock,
} from 'react-icons/fi';
import { useDeliveryAuth } from '../context/DeliveryAuthContext';

export const DeliveryHeader = () => {
  const { rider, toggleDuty, logout } = useDeliveryAuth();

  const isOnline = rider?.isAvailable !== false;

  const mobileNavItems = [
    { path: '/', label: 'Available', icon: FiCompass },
    { path: '/active', label: 'Active', icon: FiPackage },
    { path: '/history', label: 'Earnings', icon: FiClock },
    { path: '/profile', label: 'Profile', icon: FiUser },
  ];

  return (
    <>
      {/* Top Header Bar matching Admin Navbar */}
      <header className="sticky top-0 z-30 glass-nav px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between text-slate-900 transition-all">
        <div className="w-full flex items-center justify-between gap-4">
          
          {/* Left: Brand Logo & Territory Telemetry */}
          <div className="flex items-center gap-3.5">
            {/* Brand */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-100/90 flex items-center justify-center border border-orange-300 shadow-sm">
                <FiTruck className="w-5 h-5 text-orange-600 stroke-[2.2]" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-[#78350f]">NEXUS</span>
                <span className="text-[10px] bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold px-2.5 py-0.5 rounded-full shadow-xs">
                  RIDER PORTAL
                </span>
              </div>
            </div>

            {/* Desktop Location Telemetry Breadcrumb */}
            <div className="hidden xl:flex items-center gap-2 text-xs pl-3 border-l border-orange-200">
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Location:</span>
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

          {/* Right: Duty Toggle Pill, Rider Profile Card & Sign Out */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Duty Status Switch Button Pill matching exact requested design */}
            <button
              onClick={toggleDuty}
              className={`px-3.5 py-1.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer border shadow-2xs ${
                isOnline
                  ? 'bg-orange-100/90 hover:bg-orange-200/90 text-orange-950 border-orange-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-orange-500 shadow-glow-orange' : 'bg-slate-400'}`} />
                <span className="text-[11px] font-bold">{isOnline ? 'ON DUTY' : 'OFFLINE'}</span>
              </div>
              <span className="text-[10px] font-medium text-slate-500 pl-1 border-l border-orange-200/80">
                {isOnline ? 'Active' : 'Paused'}
              </span>
            </button>

            {/* Rider Profile Chip */}
            <Link
              to="/profile"
              className="flex items-center gap-2.5 pl-3 border-l border-orange-200 group"
              title="View Rider Profile"
            >
              <div className="relative">
                <img
                  src={rider?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt=""
                  className="w-9 h-9 rounded-xl object-cover border-2 border-orange-500 bg-white shadow-xs group-hover:scale-105 transition-transform"
                />
                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                  isOnline ? 'bg-orange-500 shadow-glow-orange' : 'bg-slate-400'
                }`} />
              </div>

              <div className="hidden sm:block text-left min-w-0 max-w-[140px]">
                <div className="text-xs font-bold text-slate-800 group-hover:text-orange-600 transition-colors truncate">
                  {rider?.name || 'Delivery Partner'}
                </div>
                <div className="text-[10px] text-orange-700 font-medium flex items-center gap-0.5 truncate">
                  <FiMapPin className="w-2.5 h-2.5 shrink-0 text-orange-500" />
                  <span className="truncate">{rider?.serviceCity || 'Indore'}</span>
                </div>
              </div>
            </Link>

            {/* Sign Out Button with #0d9488 (Teal) Glow Shadow */}
            <button
              onClick={logout}
              className="p-2 bg-[#0d9488] hover:bg-teal-700 text-white rounded-xl transition-all shadow-glow-teal cursor-pointer border border-teal-500 active:scale-95"
              title="Sign Out"
            >
              <FiLogOut className="w-4 h-4" />
            </button>

          </div>

        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (< md screens) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 border-t border-slate-200 p-2 shadow-xl backdrop-blur-md">
        <div className="grid grid-cols-4 gap-1 max-w-md mx-auto">
          {mobileNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-[10px] font-bold transition-all ${
                  isActive
                    ? 'text-orange-600 bg-orange-50 font-black'
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
