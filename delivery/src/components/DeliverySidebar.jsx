import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiTruck,
  FiCompass,
  FiPackage,
  FiClock,
  FiUser,
  FiLogOut,
  FiMapPin,
  FiAward,
  FiChevronRight,
  FiShield,
} from 'react-icons/fi';
import { useDeliveryAuth } from '../context/DeliveryAuthContext';

export const DeliverySidebar = () => {
  const { rider, toggleDuty, logout } = useDeliveryAuth();

  const isOnline = rider?.isAvailable !== false;

  const navItems = [
    {
      path: '/',
      label: 'Available Orders',
      icon: FiCompass,
      color: 'text-orange-600 bg-orange-100/90 border-orange-300',
    },
    {
      path: '/active',
      label: 'Active Trips',
      icon: FiPackage,
      color: 'text-blue-600 bg-blue-100/90 border-blue-300',
    },
    {
      path: '/history',
      label: 'Earnings & History',
      icon: FiClock,
      color: 'text-emerald-600 bg-emerald-100/90 border-emerald-300',
    },
    {
      path: '/profile',
      label: 'Rider Profile',
      icon: FiUser,
      color: 'text-purple-600 bg-purple-100/90 border-purple-300',
    },
  ];

  return (
    <aside className="w-64 xl:w-68 shrink-0 hidden md:flex flex-col h-full sticky top-0 glass-sidebar p-4 justify-between overflow-y-auto z-20">
      
      {/* Navigation Menu */}
      <div className="space-y-4">
        
        {/* Sidebar Nav Links matching Admin's exact Active & Inactive states */}
        <nav className="space-y-1.5">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-3 pb-1">
            Dispatch Queue
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-orange-100/90 text-orange-600 border-2 border-orange-500 shadow-md shadow-orange-500/20 scale-[1.02]'
                      : 'bg-white/60 text-slate-700 hover:text-orange-600 hover:bg-orange-50 border-transparent hover:border-orange-200'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                          isActive
                            ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
                            : `${item.color} group-hover:scale-110`
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className={`truncate ${isActive ? 'text-orange-600 font-bold' : 'text-slate-700 font-semibold group-hover:text-orange-600'}`}>
                        {item.label}
                      </span>
                    </div>

                    {isActive && (
                      <FiChevronRight className="w-4 h-4 text-orange-600 shrink-0" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

      </div>

      {/* Bottom Sidebar Footer with Driver Status & Territory Telemetry */}
      <div className="pt-4 border-t border-orange-200/60 space-y-3">
        {/* Driver Status Card shifted to bottom */}
        <div className="p-3 bg-white/70 rounded-2xl border border-orange-200/60 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <FiAward className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase text-slate-500">Driver Status</div>
              <div className="text-xs font-bold text-slate-800">Top Rated Partner</div>
            </div>
          </div>
          <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md">
            Verified
          </span>
        </div>

        <div className="space-y-1.5 text-center">
          <div className="text-[10px] text-slate-400 font-semibold">
            Nexus Rider Fleet v2.4
          </div>
          <div className="text-[11px] font-semibold text-orange-700 bg-orange-50/60 py-1.5 px-2 rounded-xl border border-orange-200/70 truncate">
            📍 {rider?.serviceCity || 'Indore'}
          </div>
        </div>
      </div>

    </aside>
  );
};
