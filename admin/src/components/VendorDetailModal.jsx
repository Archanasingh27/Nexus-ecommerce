import React, { useState } from 'react';
import {
  FiX,
  FiCheck,
  FiSlash,
  FiShoppingBag,
  FiDollarSign,
  FiMapPin,
  FiPhone,
  FiMail,
  FiPercent,
  FiSave,
} from 'react-icons/fi';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

export const VendorDetailModal = ({ isOpen, onClose, vendor, onUpdated }) => {
  const { addToast } = useToast();
  const [commissionRate, setCommissionRate] = useState(vendor?.commissionRate || 10);
  const [vendorStatus, setVendorStatus] = useState(vendor?.vendorStatus || 'pending');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !vendor) return null;

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/admin/vendors/${vendor._id}`, {
        commissionRate: Number(commissionRate),
        vendorStatus,
      });
      addToast(`Vendor ${vendor.storeName || vendor.name} updated successfully!`, 'success');
      onUpdated();
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update vendor settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStatus = async (newStatus) => {
    setLoading(true);
    try {
      await api.put(`/admin/vendors/${vendor._id}/status`, { status: newStatus });
      addToast(`Vendor status updated to ${newStatus}!`, 'success');
      onUpdated();
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div onClick={onClose} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 z-10 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <img
                src={vendor.storeLogo || 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=100'}
                alt={vendor.storeName}
                className="w-12 h-12 rounded-2xl object-cover border border-slate-200 bg-white shadow-2xs"
              />
              <div>
                <h2 className="text-lg font-black text-slate-900">{vendor.storeName || vendor.name}</h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <span>Owner: {vendor.name}</span>
                  <span>&bull;</span>
                  <span className="font-mono text-slate-600">{vendor.email}</span>
                </div>
              </div>
            </div>

            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer">
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Business & Settlement Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-700 block mb-1">Warehouse Address</span>
              <div className="text-slate-900 font-medium leading-relaxed">
                {vendor.address?.street || 'Not provided'}, {vendor.address?.city} ({vendor.address?.postalCode})
              </div>
              <div className="text-slate-500 font-medium">Phone: {vendor.phone || vendor.businessPhone || 'N/A'}</div>
              <div className="text-slate-500 font-medium">GSTIN: {vendor.taxId || 'N/A'}</div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-700 block mb-1">Bank Settlement Details</span>
              <div className="text-slate-900 font-medium">Account: {vendor.bankDetails?.accountHolderName || 'N/A'}</div>
              <div className="text-slate-500 font-mono text-[11px]">{vendor.bankDetails?.accountNumber || 'No Account Linked'}</div>
              <div className="text-slate-500 text-[11px]">{vendor.bankDetails?.bankName} ({vendor.bankDetails?.routingOrIfsc})</div>
            </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleUpdate} className="space-y-4 pt-2 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Platform Commission Fee (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.5"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    className="w-full px-4 py-2 pl-9 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold outline-none focus:bg-white focus:border-orange-500"
                  />
                  <FiPercent className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Vendor Authorization Status
                </label>
                <select
                  value={vendorStatus}
                  onChange={(e) => setVendorStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold outline-none focus:bg-white focus:border-orange-500 cursor-pointer"
                >
                  <option value="approved">Approved & Active</option>
                  <option value="pending">Pending Approval</option>
                  <option value="rejected">Suspended / Rejected</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex gap-2">
                {vendor.vendorStatus === 'pending' && (
                  <button
                    type="button"
                    onClick={() => handleQuickStatus('approved')}
                    disabled={loading}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <FiCheck className="w-4 h-4" />
                    <span>Approve Vendor</span>
                  </button>
                )}
                {vendor.vendorStatus !== 'rejected' && (
                  <button
                    type="button"
                    onClick={() => handleQuickStatus('rejected')}
                    disabled={loading}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <FiSlash className="w-3.5 h-3.5" />
                    <span>Suspend</span>
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <FiSave className="w-4 h-4" />
                <span>Save Settings</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
