import React, { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import {
  FiSettings,
  FiHome,
  FiCreditCard,
  FiUser,
  FiShield,
  FiSave,
  FiDatabase,
  FiRefreshCw,
  FiLock,
} from 'react-icons/fi';

export const AdminProfilePage = () => {
  const { admin } = useAdminAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('general');

  // Store General Settings state
  const [storeSettings, setStoreSettings] = useState(() => {
    const saved = localStorage.getItem('nexus_admin_store_settings');
    return saved
      ? JSON.parse(saved)
      : {
          storeName: 'Nexus Store',
          supportEmail: 'support@nexuscommerce.com',
          supportPhone: '+91 98765 43210',
          currency: 'INR (₹)',
          taxRate: 18,
          freeShippingMin: 999,
          codEnabled: true,
          onlinePaymentEnabled: true,
        };
  });

  // Admin Account Settings state
  const [adminName, setAdminName] = useState(admin?.name || 'Root Admin');
  const [adminEmail, setAdminEmail] = useState(admin?.email || 'admin@nexus.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [resetting, setResetting] = useState(false);

  const handleSaveStoreSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('nexus_admin_store_settings', JSON.stringify(storeSettings));
    addToast('Store settings updated successfully!', 'success');
  };

  const handleUpdateAccount = (e) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      addToast('New passwords do not match', 'error');
      return;
    }
    addToast('Admin account details updated successfully!', 'success');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleResetDatabase = async () => {
    if (window.confirm('WARNING: This will wipe and rebuild all sample products, categories, orders, and seed users. Proceed?')) {
      setResetting(true);
      try {
        await api.post('/seed/reset');
        addToast('Database successfully reset and refreshed!', 'success');
        setTimeout(() => window.location.reload(), 1000);
      } catch (err) {
        addToast('Failed to reset database', 'error');
      } finally {
        setResetting(false);
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#fae125] text-slate-950 border border-yellow-400 flex items-center justify-center font-black shadow-2xs">
            <FiSettings className="w-4 h-4 text-black" />
          </div>
          <span>Settings</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Configure your e-commerce store preferences, payment rules, shipping thresholds, and admin security.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'general', label: 'Store General', icon: <FiHome className="w-4 h-4" /> },
          { id: 'payments', label: 'Payment & Shipping', icon: <FiCreditCard className="w-4 h-4" /> },
          { id: 'account', label: 'Admin Account', icon: <FiUser className="w-4 h-4" /> },
          { id: 'system', label: 'System & Data', icon: <FiDatabase className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#fae125] text-slate-950 border border-yellow-400 shadow-2xs font-black'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-2xs'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: STORE GENERAL */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveStoreSettings} className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <FiHome className="w-5 h-5 text-teal-600" />
              <span>General Store Profile</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">Basic details displayed across customer receipts and support header.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Store Display Name</label>
              <input
                type="text"
                value={storeSettings.storeName}
                onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Support Email</label>
              <input
                type="email"
                value={storeSettings.supportEmail}
                onChange={(e) => setStoreSettings({ ...storeSettings, supportEmail: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Support Helpline</label>
              <input
                type="text"
                value={storeSettings.supportPhone}
                onChange={(e) => setStoreSettings({ ...storeSettings, supportPhone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Primary Currency</label>
              <select
                value={storeSettings.currency}
                onChange={(e) => setStoreSettings({ ...storeSettings, currency: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium outline-none cursor-pointer transition-colors"
              >
                <option value="INR (₹)">INR (₹ - Indian Rupee)</option>
                <option value="USD ($)">USD ($ - US Dollar)</option>
                <option value="EUR (€)">EUR (€ - Euro)</option>
                <option value="GBP (£)">GBP (£ - British Pound)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-[#fae125] hover:bg-yellow-300 text-slate-950 text-xs font-black rounded-xl shadow-xs border border-yellow-400 flex items-center gap-2 transition-all cursor-pointer"
            >
              <FiSave className="w-4 h-4" />
              <span>Save General Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: PAYMENT & SHIPPING */}
      {activeTab === 'payments' && (
        <form onSubmit={handleSaveStoreSettings} className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <FiCreditCard className="w-5 h-5 text-teal-600" />
              <span>Payment Gateways & Shipping Rules</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">Control accepted checkout payment methods and free delivery thresholds.</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Cash on Delivery (COD)</h4>
                <p className="text-[11px] text-slate-500 font-medium">Allow buyers to pay cash upon doorstep delivery.</p>
              </div>
              <input
                type="checkbox"
                checked={storeSettings.codEnabled}
                onChange={(e) => setStoreSettings({ ...storeSettings, codEnabled: e.target.checked })}
                className="w-5 h-5 accent-[#fae125] rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Online Payment Gateways (UPI, Cards, NetBanking)</h4>
                <p className="text-[11px] text-slate-500 font-medium">Accept instant online payments during checkout.</p>
              </div>
              <input
                type="checkbox"
                checked={storeSettings.onlinePaymentEnabled}
                onChange={(e) => setStoreSettings({ ...storeSettings, onlinePaymentEnabled: e.target.checked })}
                className="w-5 h-5 accent-[#fae125] rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">GST / Standard Tax Rate (%)</label>
              <input
                type="number"
                value={storeSettings.taxRate}
                onChange={(e) => setStoreSettings({ ...storeSettings, taxRate: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Free Shipping Minimum Order (₹)</label>
              <input
                type="number"
                value={storeSettings.freeShippingMin}
                onChange={(e) => setStoreSettings({ ...storeSettings, freeShippingMin: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium outline-none transition-colors"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-[#fae125] hover:bg-yellow-300 text-slate-950 text-xs font-black rounded-xl shadow-xs border border-yellow-400 flex items-center gap-2 transition-all cursor-pointer"
            >
              <FiSave className="w-4 h-4" />
              <span>Save Payment Rules</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: ADMIN ACCOUNT */}
      {activeTab === 'account' && (
        <form onSubmit={handleUpdateAccount} className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <FiUser className="w-5 h-5 text-teal-600" />
                <span>Admin Profile & Password</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">Update root admin credentials and authentication security.</p>
            </div>
            <span className="bg-[#fae125] text-slate-950 border border-yellow-400 text-[10px] font-black px-3 py-1 rounded-lg flex items-center gap-1 shadow-2xs">
              <FiShield className="w-3.5 h-3.5 text-black" /> Super Admin
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Admin Full Name</label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Admin Email</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium outline-none transition-colors"
                required
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <FiLock className="w-3.5 h-3.5 text-teal-600" /> Change Password
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-xl px-4 py-2 text-xs text-slate-900 font-medium outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-xl px-4 py-2 text-xs text-slate-900 font-medium outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-xl px-4 py-2 text-xs text-slate-900 font-medium outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-[#fae125] hover:bg-yellow-300 text-slate-950 text-xs font-black rounded-xl shadow-xs border border-yellow-400 flex items-center gap-2 transition-all cursor-pointer"
            >
              <FiSave className="w-4 h-4" />
              <span>Update Admin Credentials</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: SYSTEM & DATA */}
      {activeTab === 'system' && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <FiDatabase className="w-5 h-5 text-teal-600" />
              <span>Database & System Controls</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">Re-seed sample products, reset collections, and manage catalog data.</p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-slate-900 text-xs font-bold">
              <FiRefreshCw className="w-4 h-4 text-teal-600" />
              <span>Demo Catalog Reset Tool</span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              This action will reset all products, categories, orders, and customer accounts to their fresh demo seed state.
            </p>
            <button
              onClick={handleResetDatabase}
              disabled={resetting}
              className="px-5 py-2.5 bg-[#fae125] hover:bg-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow-xs border border-yellow-400 flex items-center gap-2 transition-all cursor-pointer"
            >
              <FiRefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
              <span>{resetting ? 'Resetting Collections...' : 'Reset & Re-Seed Catalog'}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
