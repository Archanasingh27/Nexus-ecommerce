import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiTruck,
  FiPackage,
  FiClock,
  FiUser,
  FiLogOut,
  FiCompass,
  FiMapPin,
  FiDollarSign,
  FiShield,
  FiActivity,
} from 'react-icons/fi';
import { useDeliveryAuth } from '../context/DeliveryAuthContext';

export const DeliveryNavbar = () => {
  const { rider, toggleDuty, logout } = useDeliveryAuth();

  const isOnline = rider?.isAvailable !== false;

  const navItems = [
    { path: '/', label: 'Available Orders', icon: FiCompass, desc: 'Live Open Feed' },
    { path: '/active', label: 'Active Trips', icon: FiPackage, desc: 'In-Transit' },
    { path: '/history', label: 'Earnings & History', icon: FiClock, desc: 'Payout Log' },
    { path: '/profile', label: 'Rider Profile', icon: FiUser, desc: 'Zone & Vehicle' },
  ];

  return (
    <>
      {/* Top Glass Header Bar */}
      <header className="sticky top-0 z-40 glass-header border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          
          <div className="flex items-center justify-between gap-4">
            
            {/* Brand / Rider Details */}
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-linear-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/25 border border-white/40">
                  <FiTruck className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                  isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-slate-900 tracking-tight">NEXUS RIDER</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {rider?.vehicleType || 'Bike'}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                  <span className="font-bold text-slate-700">{rider?.name || 'Fulfillment Partner'}</span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 text-slate-500">
                    <FiMapPin className="w-3 h-3 text-rose-500" />
                    <span>{rider?.serviceCity || 'Indore'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Center Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5 p-1 bg-slate-100/70 rounded-2xl border border-slate-200/80 shadow-xs">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4 stroke-[2.2]" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Right Controls: Duty Switch & Profile/Logout */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              
              {/* Online/Offline Glowing Duty Button */}
              <button
                onClick={toggleDuty}
                className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2.5 shadow-sm transition-all cursor-pointer transform active:scale-95 ${
                  isOnline
                    ? 'bg-linear-to-r from-emerald-500 to-teal-600 text-white border border-emerald-400 shadow-emerald-500/20 hover:brightness-105'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-700 border border-slate-300'
                }`}
                title="Toggle Duty Status"
              >
                <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-white shadow-xs animate-ping' : 'bg-slate-500'}`} />
                <span className="tracking-wide">{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
              </button>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all cursor-pointer border border-transparent hover:border-rose-200"
                title="Sign Out"
              >
                <FiLogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* Mobile Bottom Glass Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-header border-t border-slate-200/80 p-2 shadow-2xl">
        <div className="grid grid-cols-4 gap-1 max-w-md mx-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-2 px-1 rounded-2xl text-[10px] font-black transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                    : 'text-slate-500 hover:text-slate-800'
                }`
              }
            >
              <item.icon className="w-5 h-5 mb-0.5" />
              <span className="truncate max-w-full">{item.label.split(' ')[0]}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
};
