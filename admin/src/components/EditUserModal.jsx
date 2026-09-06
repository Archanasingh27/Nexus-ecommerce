import React, { useState, useEffect } from 'react';
import { FiX, FiSave, FiUser, FiMail, FiPhone, FiShield } from 'react-icons/fi';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

export const EditUserModal = ({ isOpen, onClose, user, onSaved }) => {
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'user',
      });
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast('User name is required', 'error');
      return;
    }
    if (!formData.email.trim()) {
      addToast('User email is required', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.put(`/users/${user._id}`, formData);
      addToast('User details updated successfully!', 'success');
      onSaved();
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update user', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isMasterAdmin = user.email === 'admin@nexus.com';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div onClick={onClose} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150" />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 z-10 space-y-6 animate-in zoom-in-95 duration-150">
          
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt=""
                className="w-10 h-10 rounded-full object-cover border-2 border-orange-400 bg-slate-50 shrink-0"
              />
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  Edit User Account
                </h2>
                <p className="text-[11px] text-slate-400 font-medium">
                  Modify profile details and access permissions
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 outline-none transition-colors"
                />
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  disabled={isMasterAdmin}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. user@example.com"
                  className={`w-full border rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium outline-none transition-colors ${
                    isMasterAdmin
                      ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                      : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-orange-500 text-slate-900'
                  }`}
                />
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +91 9876543210"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 outline-none transition-colors"
                />
                <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              </div>
            </div>

            {/* Role Access */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Role Access
              </label>
              <div className="relative">
                <select
                  disabled={isMasterAdmin}
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className={`w-full border rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold outline-none transition-colors ${
                    isMasterAdmin
                      ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                      : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-orange-500 text-slate-900 cursor-pointer'
                  }`}
                >
                  <option value="user">Customer (Standard User)</option>
                  <option value="admin">Administrator (Admin Privileges)</option>
                </select>
                <FiShield className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              </div>
              {isMasterAdmin && (
                <p className="text-[10px] text-amber-600 mt-1 font-medium">
                  * Primary master admin account role cannot be changed.
                </p>
              )}
            </div>

            {/* Meta Info */}
            <div className="p-3 bg-orange-50/60 rounded-2xl border border-orange-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
              <div>
                Orders Placed: <strong className="text-slate-900 font-black">{user.orderCount || 0}</strong>
              </div>
              <div>
                Joined: <strong className="text-slate-900">{new Date(user.createdAt).toLocaleDateString()}</strong>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-black rounded-xl shadow-md shadow-orange-500/25 border border-orange-500 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <FiSave className="w-3.5 h-3.5" />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
};
