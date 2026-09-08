import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiGrid,
  FiBox,
  FiShoppingBag,
  FiSettings,
  FiX,
  FiChevronRight,
  FiDollarSign,
  FiTrendingUp,
} from 'react-icons/fi';
import { useVendorAuth } from '../context/VendorAuthContext';

const navItems = [
  { path: '/', label: 'Overview & KPIs', icon: FiGrid, color: 'text-orange-600 bg-orange-100/90 border-orange-300' },
  { path: '/order-analytics', label: 'Order Analytics', icon: FiTrendingUp, color: 'text-blue-700 bg-blue-100/90 border-blue-300' },
  { path: '/product-analytics', label: 'Product Analytics', icon: FiBox, color: 'text-purple-700 bg-purple-100/90 border-purple-300' },
  { path: '/products', label: 'Store Products', icon: FiBox, color: 'text-amber-700 bg-amber-100/90 border-amber-300' },
  { path: '/orders', label: 'Order Fulfillment', icon: FiShoppingBag, color: 'text-emerald-700 bg-emerald-100/90 border-emerald-300' },
  { path: '/profile', label: 'Store Settings', icon: FiSettings, color: 'text-slate-700 bg-slate-100/90 border-slate-300' },
];

export const VendorSidebar = ({ isOpen, onClose }) => {
  const { vendor, logout } = useVendorAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-md lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 h-full lg:h-full shrink-0 inset-y-0 left-0 z-40 w-64 glass-sidebar p-4 flex flex-col justify-between overflow-y-auto transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Mobile close header */}
          <div className="flex items-center justify-between lg:hidden pb-2 border-b border-orange-200/60">
            <span className="text-xs font-black text-orange-600">MERCHANT MENU</span>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-800 cursor-pointer">
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 pb-2">
              Merchant Management
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `group flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-orange-100/90 text-orange-600 border-2 border-orange-500 shadow-md shadow-orange-500/20 scale-[1.02]'
                        : 'bg-white/60 text-slate-800 hover:text-orange-600 hover:bg-orange-50 border-transparent hover:border-orange-200'
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
                        <span className="truncate">{item.label}</span>
                      </div>
                      <FiChevronRight
                        className={`w-4 h-4 transition-transform ${
                          isActive ? 'text-orange-600 translate-x-0.5' : 'text-slate-300 group-hover:text-slate-500'
                        }`}
                      />
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Store Profile Card */}
        <div className="pt-4 border-t border-orange-100/80 space-y-3">
          <div className="p-3.5 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-200/80 space-y-2">
            <div className="flex items-center gap-2.5">
              <img
                src={vendor?.storeLogo || 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=100'}
                alt={vendor?.storeName}
                className="w-9 h-9 rounded-xl object-cover border border-orange-300 bg-white shadow-xs"
              />
              <div className="min-w-0 flex-1">
                <div className="font-extrabold text-xs text-slate-900 truncate">
                  {vendor?.storeName || 'My Store'}
                </div>
                <div className="text-[10px] text-orange-700 font-bold flex items-center gap-1">
                  <FiTrendingUp className="w-3 h-3" />
                  <span>Platform Rate: {100 - (vendor?.commissionRate || 10)}% Payout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
