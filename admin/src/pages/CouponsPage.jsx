import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import {
  FiTag,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiCheckCircle,
  FiXCircle,
  FiPercent,
  FiDollarSign,
  FiCalendar,
  FiCopy,
  FiX,
  FiFilter,
} from 'react-icons/fi';

export const CouponsPage = () => {
  const { addToast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    expiryDate: '',
    usageLimit: '500',
    isActive: true,
  });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/coupons', {
        params: { search: searchTerm, status: statusFilter !== 'all' ? statusFilter : undefined },
      });
      setCoupons(data.coupons || []);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load coupons', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [statusFilter]);

  const handleOpenModal = (coupon = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        description: coupon.description || '',
        discountType: coupon.discountType,
        discountValue: coupon.discountValue.toString(),
        minOrderAmount: coupon.minOrderAmount?.toString() || '0',
        maxDiscountAmount: coupon.maxDiscountAmount?.toString() || '',
        expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
        usageLimit: coupon.usageLimit?.toString() || '500',
        isActive: coupon.isActive,
      });
    } else {
      setEditingCoupon(null);
      const nextMonth = new Date();
      nextMonth.setDate(nextMonth.getDate() + 30);
      setFormData({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: '20',
        minOrderAmount: '499',
        maxDiscountAmount: '500',
        expiryDate: nextMonth.toISOString().split('T')[0],
        usageLimit: '500',
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discountValue || !formData.expiryDate) {
      addToast('Please fill in required fields (Code, Value, Expiry)', 'error');
      return;
    }

    setSaving(true);
    try {
      if (editingCoupon) {
        await api.put(`/coupons/${editingCoupon._id}`, formData);
        addToast('Coupon updated successfully!', 'success');
      } else {
        await api.post('/coupons', formData);
        addToast('🎉 New Coupon created successfully!', 'success');
      }
      setShowModal(false);
      fetchCoupons();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save coupon', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (coupon) => {
    try {
      const { data } = await api.put(`/coupons/${coupon._id}/toggle`);
      addToast(data.message || 'Status updated', 'info');
      fetchCoupons();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to toggle status', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      addToast('Coupon deleted successfully', 'success');
      fetchCoupons();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete coupon', 'error');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    addToast(`Copied "${text}" to clipboard!`, 'info');
  };

  const activeCount = coupons.filter((c) => c.isActive && new Date(c.expiryDate) >= new Date()).length;

  return (
    <div className="space-y-6">
      {/* Top Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20">
              <FiTag className="w-6 h-6" />
            </span>
            <span>Coupons & Promo Codes</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create discount vouchers, manage city-wide promotional campaigns, and configure order savings.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/20 transition-all transform active:scale-95 cursor-pointer shrink-0"
        >
          <FiPlus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Total Coupons</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{coupons.length}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-black">
            <FiTag className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Active Campaigns</span>
            <div className="text-2xl font-black text-emerald-600 mt-0.5">{activeCount}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-black">
            <FiCheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Redemptions Made</span>
            <div className="text-2xl font-black text-purple-600 mt-0.5">
              {coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0)}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center font-black">
            <FiPercent className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="glass-card p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search coupon code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchCoupons()}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500/30 font-medium"
          />
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['all', 'active', 'inactive', 'expired'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Coupons Table */}
      <div className="glass-card overflow-hidden rounded-3xl border border-slate-200/80 shadow-lg">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500 font-bold mt-3">Loading coupon records...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-14 h-14 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <FiTag className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-sm">No coupons found</h3>
            <p className="text-xs text-slate-500 mt-1">Create your first promo code to boost platform sales.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-extrabold">
                <tr>
                  <th className="p-4 pl-6">Coupon Code</th>
                  <th className="p-4">Discount Value</th>
                  <th className="p-4">Min. Order</th>
                  <th className="p-4">Usage Limits</th>
                  <th className="p-4">Expiry Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coupons.map((c) => {
                  const isExpired = new Date(c.expiryDate) < new Date();

                  return (
                    <tr key={c._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyToClipboard(c.code)}
                            className="px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 text-indigo-900 rounded-xl font-mono font-black text-xs flex items-center gap-1.5 hover:bg-indigo-100 transition-colors cursor-pointer"
                            title="Click to copy code"
                          >
                            <span>{c.code}</span>
                            <FiCopy className="w-3 h-3 text-indigo-500" />
                          </button>
                        </div>
                        {c.description && (
                          <p className="text-[11px] text-slate-500 mt-1 max-w-xs truncate">{c.description}</p>
                        )}
                      </td>

                      <td className="p-4">
                        <span className="font-black text-sm text-slate-900">
                          {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT`}
                        </span>
                        {c.maxDiscountAmount && (
                          <span className="text-[10px] text-slate-400 block font-medium">
                            Max: ₹{c.maxDiscountAmount}
                          </span>
                        )}
                      </td>

                      <td className="p-4 font-bold text-slate-700">
                        ₹{c.minOrderAmount?.toLocaleString('en-IN') || 0}
                      </td>

                      <td className="p-4">
                        <div className="text-slate-900 font-bold">
                          {c.usedCount || 0} / {c.usageLimit || 500}
                        </div>
                        <div className="w-24 bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full"
                            style={{
                              width: `${Math.min(100, ((c.usedCount || 0) / (c.usageLimit || 500)) * 100)}%`,
                            }}
                          />
                        </div>
                      </td>

                      <td className="p-4">
                        <div className={`font-semibold ${isExpired ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                          {new Date(c.expiryDate).toLocaleDateString([], {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                        {isExpired && <span className="text-[10px] text-rose-500 font-bold">Expired</span>}
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => handleToggleStatus(c)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all ${
                            c.isActive && !isExpired
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {c.isActive && !isExpired ? (
                            <>
                              <FiCheckCircle className="w-3 h-3" /> Active
                            </>
                          ) : (
                            <>
                              <FiXCircle className="w-3 h-3" /> Inactive
                            </>
                          )}
                        </button>
                      </td>

                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenModal(c)}
                            className="p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                            title="Edit Coupon"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(c._id)}
                            className="p-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Coupon"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create or Edit Coupon */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                  <FiTag className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">
                  {editingCoupon ? 'Edit Coupon Code' : 'Create New Promo Coupon'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Coupon Code */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. INDORE50"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-black text-slate-900 focus:bg-white focus:border-indigo-500 uppercase"
                  />
                </div>

                {/* Discount Type */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Discount Type *</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Flat Amount (₹)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description / Campaign Note</label>
                <input
                  type="text"
                  placeholder="e.g. 50% savings on construction hardware supplies"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Value */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {formData.discountType === 'percentage' ? 'Percentage (%) *' : 'Flat Off (₹) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder={formData.discountType === 'percentage' ? '20' : '150'}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-900 focus:bg-white focus:border-indigo-500"
                  />
                </div>

                {/* Min Order */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="499"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-500"
                  />
                </div>

                {/* Max Cap */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Max Cap (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="500"
                    disabled={formData.discountType === 'fixed'}
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-500 disabled:opacity-40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Expiry Date */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-500"
                  />
                </div>

                {/* Usage Limit */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Total Usage Limit</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="500"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Is Active Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300 focus:ring-indigo-500"
                />
                <label htmlFor="isActive" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Activate coupon immediately upon creation
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-black shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
