import React, { useState, useEffect } from 'react';
import {
  FiSettings,
  FiSave,
  FiUser,
  FiShoppingBag,
  FiMapPin,
  FiDollarSign,
  FiImage,
} from 'react-icons/fi';
import api from '../api/axios';
import { useVendorAuth } from '../context/VendorAuthContext';
import { useToast } from '../context/ToastContext';

export const VendorProfilePage = () => {
  const { vendor, updateProfile } = useVendorAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    storeName: '',
    storeDescription: '',
    storeLogo: '',
    storeBanner: '',
    businessEmail: '',
    businessPhone: '',
    taxId: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    accountHolderName: '',
    accountNumber: '',
    bankName: '',
    routingOrIfsc: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vendor) {
      setFormData({
        name: vendor.name || '',
        phone: vendor.phone || '',
        storeName: vendor.storeName || '',
        storeDescription: vendor.storeDescription || '',
        storeLogo: vendor.storeLogo || '',
        storeBanner: vendor.storeBanner || '',
        businessEmail: vendor.businessEmail || vendor.email || '',
        businessPhone: vendor.businessPhone || vendor.phone || '',
        taxId: vendor.taxId || '',
        street: vendor.address?.street || '',
        city: vendor.address?.city || 'Indore',
        state: vendor.address?.state || 'Madhya Pradesh',
        postalCode: vendor.address?.postalCode || '',
        accountHolderName: vendor.bankDetails?.accountHolderName || '',
        accountNumber: vendor.bankDetails?.accountNumber || '',
        bankName: vendor.bankDetails?.bankName || '',
        routingOrIfsc: vendor.bankDetails?.routingOrIfsc || '',
      });
    }
  }, [vendor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/vendor/profile', {
        name: formData.name,
        phone: formData.phone,
        storeName: formData.storeName,
        storeDescription: formData.storeDescription,
        storeLogo: formData.storeLogo,
        storeBanner: formData.storeBanner,
        businessEmail: formData.businessEmail,
        businessPhone: formData.businessPhone,
        taxId: formData.taxId,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: 'India',
        },
        bankDetails: {
          accountHolderName: formData.accountHolderName,
          accountNumber: formData.accountNumber,
          bankName: formData.bankName,
          routingOrIfsc: formData.routingOrIfsc,
        },
      });

      updateProfile(res.data.vendor);
      addToast('Store settings and profile saved successfully!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update store settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <FiSettings className="text-orange-500 w-6 h-6" />
          <span>Merchant Store Settings</span>
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Configure store identity, warehouse pickup address, and settlement bank credentials.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store Branding Card */}
        <div className="glass-card p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2 font-extrabold text-sm text-slate-900 pb-2 border-b border-orange-100">
            <FiShoppingBag className="text-orange-500" />
            <span>Storefront Brand & Presentation</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Store Name *</label>
              <input
                type="text"
                required
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold outline-none focus:bg-white focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">GSTIN / Tax ID</label>
              <input
                type="text"
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold outline-none focus:bg-white focus:border-orange-500 uppercase"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Store Description</label>
            <textarea
              rows={2}
              value={formData.storeDescription}
              onChange={(e) => setFormData({ ...formData, storeDescription: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium outline-none focus:bg-white focus:border-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Store Logo URL</label>
              <input
                type="url"
                value={formData.storeLogo}
                onChange={(e) => setFormData({ ...formData, storeLogo: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium outline-none focus:bg-white focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Store Banner URL</label>
              <input
                type="url"
                value={formData.storeBanner}
                onChange={(e) => setFormData({ ...formData, storeBanner: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium outline-none focus:bg-white focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Warehouse Pickup Address */}
        <div className="glass-card p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2 font-extrabold text-sm text-slate-900 pb-2 border-b border-orange-100">
            <FiMapPin className="text-orange-500" />
            <span>Warehouse Pickup Location (For Delivery Riders)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">Street Address</label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium outline-none focus:bg-white focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Pincode</label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold outline-none focus:bg-white focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Bank & Settlement Details */}
        <div className="glass-card p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2 font-extrabold text-sm text-slate-900 pb-2 border-b border-orange-100">
            <FiDollarSign className="text-orange-500" />
            <span>Bank Settlement Details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Account Holder Name</label>
              <input
                type="text"
                value={formData.accountHolderName}
                onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium outline-none focus:bg-white focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Account Number</label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono outline-none focus:bg-white focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Bank Name</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium outline-none focus:bg-white focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">IFSC / Routing Code</label>
              <input
                type="text"
                value={formData.routingOrIfsc}
                onChange={(e) => setFormData({ ...formData, routingOrIfsc: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono outline-none focus:bg-white focus:border-orange-500 uppercase"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs rounded-xl shadow-lg shadow-orange-500/25 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <FiSave className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save Store Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
