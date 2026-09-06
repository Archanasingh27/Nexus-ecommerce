import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiGrid,
  FiBarChart2,
  FiPieChart,
  FiBox,
  FiLayers,
  FiTag,
  FiPercent,
  FiShoppingBag,
  FiTruck,
  FiUsers,
  FiSettings,
  FiDatabase,
  FiX,
  FiChevronRight,
} from 'react-icons/fi';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

const navItems = [
  { path: '/', label: 'Overview & KPIs', icon: FiGrid, color: 'text-orange-600 bg-orange-100/90 border-orange-300' },
  { path: '/analytics', label: 'Sales Analytics', icon: FiBarChart2, color: 'text-blue-600 bg-blue-100/90 border-blue-300' },
  { path: '/order-analytics', label: 'Order Analytics', icon: FiShoppingBag, color: 'text-emerald-600 bg-emerald-100/90 border-emerald-300' },
  { path: '/product-analytics', label: 'Product Analytics', icon: FiPieChart, color: 'text-purple-600 bg-purple-100/90 border-purple-300' },
  { path: '/products', label: 'Products & Stock', icon: FiBox, color: 'text-amber-700 bg-amber-100/90 border-amber-300' },
  { path: '/categories', label: 'Categories', icon: FiLayers, color: 'text-teal-600 bg-teal-100/90 border-teal-300' },
  { path: '/coupons', label: 'Coupons & Discounts', icon: FiPercent, color: 'text-indigo-600 bg-indigo-100/90 border-indigo-300' },
  { path: '/advertisements', label: 'Advertisements', icon: FiTag, color: 'text-rose-600 bg-rose-100/90 border-rose-300' },
  { path: '/orders', label: 'Orders & Shipments', icon: FiShoppingBag, color: 'text-blue-700 bg-blue-100/90 border-blue-300' },
  { path: '/delivery-boys', label: 'Delivery Fleet', icon: FiTruck, color: 'text-emerald-700 bg-emerald-100/90 border-emerald-300' },
  { path: '/users', label: 'Customer Users', icon: FiUsers, color: 'text-indigo-600 bg-indigo-100/90 border-indigo-300' },
  { path: '/vendors', label: 'Vendors & Sellers', icon: FiShoppingBag, color: 'text-orange-600 bg-orange-100/90 border-orange-300' },
  { path: '/profile', label: 'Settings', icon: FiSettings, color: 'text-slate-700 bg-slate-100/90 border-slate-300' },
];

export const AdminSidebar = ({ isOpen, onClose }) => {
  const { addToast } = useToast();

  const handleResetData = async () => {
    if (window.confirm('Are you sure you want to reset the database and re-seed all collections?')) {
      try {
        await api.post('/seed/reset');
        addToast('Database reset and re-seeded with demo data!', 'success');
        setTimeout(() => window.location.reload(), 1000);
      } catch (err) {
        addToast('Failed to reset database', 'error');
      }
    }
  };

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
        className={`fixed lg:sticky top-0 h-full lg:h-full shrink-0 inset-y-0 left-0 z-40 w-64 glass-sidebar p-4 flex flex-col justify-between overflow-y-auto transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        <div className="space-y-6">
          {/* Mobile close button */}
          <div className="flex items-center justify-between lg:hidden pb-2 border-b border-orange-200/60">
            <span className="text-xs font-black text-orange-600">NAVIGATION MENU</span>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-800 cursor-pointer">
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 pb-2">
              Management Console
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
                    `group flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer border ${isActive
                      ? 'bg-orange-100/90 text-orange-600 border-2 border-orange-500 shadow-md shadow-orange-500/20 scale-[1.02]'
                      : 'bg-white/60 text-slate-800 hover:text-orange-600 hover:bg-orange-50 border-transparent hover:border-orange-200'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border transition-all ${isActive
                              ? 'bg-orange-500 text-amber-200 border-orange-600 shadow-sm'
                              : `${item.color} group-hover:scale-110`
                            }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className={`truncate font-extrabold ${isActive ? 'text-orange-600 font-black' : 'text-slate-800 group-hover:text-orange-600'}`}>
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

        {/* Bottom Sidebar Footer with RED Reset DB button */}
        <div className="pt-6 border-t border-orange-200/60 space-y-3">
          <div className="text-center text-[10px] text-slate-400 font-bold">
            Nexus Command v2.4
          </div>
          <button
            onClick={handleResetData}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 bg-[#0d9488] hover:bg-teal-700 text-white rounded-xl text-xs font-black shadow-glow-teal transition-all cursor-pointer border border-teal-500 transform hover:-translate-y-0.5 active:scale-98"
          >
            <FiDatabase className="w-3.5 h-3.5 text-white" />
            <span>Reset Demo DB</span>
          </button>
        </div>
      </aside>
    </>
  );
};
