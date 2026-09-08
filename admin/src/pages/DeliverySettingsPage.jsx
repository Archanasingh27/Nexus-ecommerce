import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import {
  FiTruck,
  FiDollarSign,
  FiMapPin,
  FiArrowLeft,
  FiSave,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiCheck,
  FiZap,
  FiClock,
  FiPackage,
  FiStar,
  FiX,
  FiRefreshCw,
  FiEye,
} from 'react-icons/fi';

const DEFAULT_OPTIONS_FALLBACK = [
  {
    id: 'instant',
    name: 'Instant Delivery',
    time: '30 - 45 Mins',
    icon: '⚡',
    description: 'Direct hyper-local courier from nearest merchant hub',
    badge: 'Fastest Delivery',
    price: 49,
    discountedPrice: 49,
    freeAbove: 0,
    isActive: true,
    isDefault: false,
  },
  {
    id: '4hour',
    name: '4-Hour Express',
    time: 'Within 4 Hours',
    icon: '🕒',
    description: 'Standard same-day fast fulfillment across Indore',
    badge: 'Most Popular',
    price: 39,
    discountedPrice: 0,
    freeAbove: 999,
    isActive: true,
    isDefault: true,
  },
  {
    id: 'nextday',
    name: 'Next Day Delivery',
    time: 'Tomorrow by 2:00 PM',
    icon: '🚚',
    description: 'Scheduled next-day eco delivery slot',
    badge: 'Free Delivery',
    price: 0,
    discountedPrice: 0,
    freeAbove: 0,
    isActive: true,
    isDefault: false,
  },
];

export const DeliverySettingsPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingTier, setSavingTier] = useState(false);

  const [settings, setSettings] = useState({
    payoutPerTrip: 40,
    coverageRadiusKm: 5.0,
    customerDeliveryFee: 40,
    freeDeliveryThreshold: 999,
    serviceCity: 'Indore',
    deliveryOptions: DEFAULT_OPTIONS_FALLBACK,
  });

  // Modal State for Adding/Editing a Delivery Tier
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [tierForm, setTierForm] = useState({
    id: '',
    name: '',
    time: '',
    icon: '⚡',
    description: '',
    badge: '',
    price: 49,
    discountedPrice: 49,
    freeAbove: 0,
    isActive: true,
    isDefault: false,
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/delivery-settings');
      if (data?.settings) {
        setSettings({
          payoutPerTrip: data.settings.payoutPerTrip ?? 40,
          coverageRadiusKm: data.settings.coverageRadiusKm ?? 5.0,
          customerDeliveryFee: data.settings.customerDeliveryFee ?? 40,
          freeDeliveryThreshold: data.settings.freeDeliveryThreshold ?? 999,
          serviceCity: data.settings.serviceCity || 'Indore',
          deliveryOptions:
            Array.isArray(data.settings.deliveryOptions) && data.settings.deliveryOptions.length > 0
              ? data.settings.deliveryOptions
              : DEFAULT_OPTIONS_FALLBACK,
        });
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load delivery settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/admin/delivery-settings', settings);
      addToast(data.message || 'Delivery & tier settings saved successfully!', 'success');
      if (data.settings) {
        setSettings((prev) => ({
          ...prev,
          ...data.settings,
          deliveryOptions: data.settings.deliveryOptions || prev.deliveryOptions,
        }));
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save delivery settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingIndex(null);
    setTierForm({
      id: '',
      name: '',
      time: '',
      icon: '⚡',
      description: '',
      badge: '',
      price: 49,
      discountedPrice: 49,
      freeAbove: 0,
      isActive: true,
      isDefault: false,
    });
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (index) => {
    setEditingIndex(index);
    setTierForm({ ...settings.deliveryOptions[index] });
    setModalOpen(true);
  };

  // Save Tier from Modal and persist directly to DB
  const handleSaveTier = async (e) => {
    e.preventDefault();
    if (!tierForm.name.trim() || !tierForm.time.trim()) {
      addToast('Please provide a name and delivery time', 'error');
      return;
    }

    const autoId =
      tierForm.id.trim() ||
      tierForm.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .slice(0, 20);

    const updatedTier = {
      ...tierForm,
      id: autoId,
      price: Number(tierForm.price) || 0,
      discountedPrice: Number(tierForm.discountedPrice) || 0,
      freeAbove: Number(tierForm.freeAbove) || 0,
    };

    let updatedList = [...settings.deliveryOptions];

    // If marked as default, unset others
    if (updatedTier.isDefault) {
      updatedList = updatedList.map((opt) => ({ ...opt, isDefault: false }));
    }

    if (editingIndex !== null) {
      updatedList[editingIndex] = updatedTier;
    } else {
      updatedList.push(updatedTier);
    }

    const newSettings = { ...settings, deliveryOptions: updatedList };
    setSavingTier(true);
    try {
      const { data } = await api.put('/admin/delivery-settings', newSettings);
      setSettings((prev) => ({
        ...prev,
        ...data.settings,
        deliveryOptions: data.settings?.deliveryOptions || updatedList,
      }));
      setModalOpen(false);
      addToast(
        editingIndex !== null ? 'Delivery option updated and saved to DB!' : 'New delivery option added and saved to DB!',
        'success'
      );
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save delivery option to DB', 'error');
    } finally {
      setSavingTier(false);
    }
  };

  // Delete Tier and persist directly to DB
  const handleDeleteTier = async (index) => {
    if (settings.deliveryOptions.length <= 1) {
      addToast('At least one delivery option must remain active.', 'error');
      return;
    }
    const updatedList = settings.deliveryOptions.filter((_, idx) => idx !== index);
    const newSettings = { ...settings, deliveryOptions: updatedList };
    try {
      const { data } = await api.put('/admin/delivery-settings', newSettings);
      setSettings((prev) => ({
        ...prev,
        ...data.settings,
        deliveryOptions: data.settings?.deliveryOptions || updatedList,
      }));
      addToast('Delivery option removed and updated in DB.', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete delivery option', 'error');
    }
  };

  // Toggle Active Status and persist directly to DB
  const handleToggleActive = async (index) => {
    const updatedList = [...settings.deliveryOptions];
    updatedList[index].isActive = !updatedList[index].isActive;
    const newSettings = { ...settings, deliveryOptions: updatedList };
    setSettings(newSettings);
    try {
      const { data } = await api.put('/admin/delivery-settings', newSettings);
      if (data?.settings) {
        setSettings((prev) => ({ ...prev, ...data.settings }));
      }
      addToast('Status updated in DB.', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  // Set as Default and persist directly to DB
  const handleSetDefault = async (index) => {
    const updatedList = settings.deliveryOptions.map((opt, idx) => ({
      ...opt,
      isDefault: idx === index,
    }));
    const newSettings = { ...settings, deliveryOptions: updatedList };
    setSettings(newSettings);
    try {
      const { data } = await api.put('/admin/delivery-settings', newSettings);
      if (data?.settings) {
        setSettings((prev) => ({ ...prev, ...data.settings }));
      }
      addToast('Default delivery option updated in DB.', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update default option', 'error');
    }
  };

  // Reset to Defaults and persist directly to DB
  const handleResetDefaults = async () => {
    if (window.confirm('Reset delivery options to standard platform defaults (Instant, 4-Hour, Next-Day)?')) {
      const newSettings = { ...settings, deliveryOptions: DEFAULT_OPTIONS_FALLBACK };
      try {
        const { data } = await api.put('/admin/delivery-settings', newSettings);
        setSettings((prev) => ({
          ...prev,
          ...data.settings,
          deliveryOptions: data.settings?.deliveryOptions || DEFAULT_OPTIONS_FALLBACK,
        }));
        addToast('Reset to platform defaults and saved to DB.', 'success');
      } catch (err) {
        addToast(err.response?.data?.message || 'Failed to reset defaults', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-500">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <button
            type="button"
            onClick={() => navigate('/delivery-boys')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-orange-600 transition-colors mb-1 cursor-pointer"
          >
            <FiArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Delivery Fleet</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="p-2 bg-orange-100 text-orange-600 rounded-xl">
              <FiDollarSign className="w-5 h-5" />
            </span>
            Delivery Tiers & Logistics Settings
          </h1>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-black rounded-xl shadow-md shadow-orange-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          <FiSave className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
        </button>
      </div>

      {/* Main Form */}
      <div className="space-y-6">
        
        {/* CARD 1: DELIVERY TIERS & SPEED OPTIONS (MANAGED BY ADMIN) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 text-orange-600">
                <FiZap className="w-4 h-4" />
                <span>Customer Delivery Options & Speed Tiers (Checkout)</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Manage all delivery tiers shown to customers on the Cart and Checkout pages.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                title="Reset to default tiers"
              >
                <FiRefreshCw className="w-3.5 h-3.5 inline mr-1" /> Reset Defaults
              </button>
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-orange-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <FiPlus className="w-4 h-4" />
                <span>Add Delivery Tier</span>
              </button>
            </div>
          </div>

          {/* Delivery Tiers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {settings.deliveryOptions.map((opt, idx) => (
              <div
                key={opt.id || idx}
                className={`relative rounded-2xl border-2 p-4 flex flex-col justify-between transition-all ${
                  opt.isActive
                    ? opt.isDefault
                      ? 'border-orange-500 bg-orange-50/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                    : 'border-dashed border-slate-200 bg-slate-50/60 opacity-60'
                }`}
              >
                {/* Top Badge & Status Toggle */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    {opt.badge ? (
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-slate-900 text-white shadow-2xs">
                        {opt.badge}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400">Standard Tier</span>
                    )}

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(idx)}
                        className={`text-[10px] font-black px-2 py-0.5 rounded-md cursor-pointer transition-all ${
                          opt.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                        title="Toggle Active/Inactive"
                      >
                        {opt.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </div>
                  </div>

                  {/* Title & Icon */}
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="text-2xl">{opt.icon || '🚚'}</span>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 leading-tight flex items-center gap-1.5">
                        {opt.name}
                        {opt.isDefault && (
                          <span className="text-[9px] bg-orange-100 text-orange-800 font-bold px-1.5 py-0.2 rounded-md">
                            Default
                          </span>
                        )}
                      </h3>
                      <div className="text-xs font-black text-orange-600">{opt.time}</div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {opt.description || 'Fulfillment option for customer orders.'}
                  </p>
                </div>

                {/* Price & Actions */}
                <div className="pt-4 mt-3 border-t border-slate-100/90 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-extrabold text-slate-400">Delivery Fee</div>
                    <div className="text-sm font-black text-slate-900">
                      {opt.price === 0 ? (
                        <span className="text-emerald-700 font-black">FREE</span>
                      ) : (
                        <span>₹{opt.price}</span>
                      )}
                      {opt.freeAbove > 0 && (
                        <span className="text-[10px] text-slate-500 font-medium block">
                          Free over ₹{opt.freeAbove}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSetDefault(idx)}
                      className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                        opt.isDefault
                          ? 'bg-orange-100 text-orange-700 border-orange-300'
                          : 'bg-white text-slate-400 hover:text-slate-700 border-slate-200'
                      }`}
                      title="Set as Default Selected Tier"
                    >
                      <FiStar className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(idx)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                      title="Edit Tier"
                    >
                      <FiEdit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTier(idx)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-all cursor-pointer"
                      title="Delete Tier"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CARD 2: DELIVERY BOY FLEET PAYOUT & SERVICE ZONE */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-5 shadow-xs">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 text-slate-800">
            <FiTruck className="w-4 h-4 text-orange-600" />
            <span>Delivery Fleet Payout & Service Zone</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* Payout per Trip */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Trip Payout for Delivery Partner (₹ / Order)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-orange-600 text-sm">₹</span>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={settings.payoutPerTrip}
                  onChange={(e) => setSettings({ ...settings, payoutPerTrip: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-2xl pl-8 pr-4 py-2.5 text-sm text-slate-900 font-black outline-none transition-all"
                  required
                />
              </div>

              {/* Quick Preset Chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {[30, 40, 50, 60, 80].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setSettings({ ...settings, payoutPerTrip: amt })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      settings.payoutPerTrip === amt
                        ? 'bg-orange-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-orange-50'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Coverage Radius */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Coverage Radius (KM)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="50"
                  value={settings.coverageRadiusKm}
                  onChange={(e) => setSettings({ ...settings, coverageRadiusKm: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-2xl px-4 py-2.5 text-sm text-slate-900 font-black outline-none transition-all"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">KM</span>
              </div>

              {/* Radius Preset Chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {[3, 5, 8, 10, 15].map((km) => (
                  <button
                    key={km}
                    type="button"
                    onClick={() => setSettings({ ...settings, coverageRadiusKm: km })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      settings.coverageRadiusKm === km
                        ? 'bg-orange-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-orange-50'
                    }`}
                  >
                    {km} km
                  </button>
                ))}
              </div>
            </div>

            {/* Hub City */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Primary Delivery Hub City
              </label>
              <div className="relative">
                <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  value={settings.serviceCity}
                  onChange={(e) => setSettings({ ...settings, serviceCity: e.target.value })}
                  placeholder="e.g. Indore"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-2xl pl-9 pr-4 py-2.5 text-xs text-slate-900 font-bold outline-none transition-all"
                  required
                />
              </div>
            </div>

          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/delivery-boys')}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-7 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-black rounded-xl shadow-md shadow-orange-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <FiSave className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
          </button>
        </div>

      </div>

      {/* MODAL: ADD / EDIT DELIVERY TIER */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-5 animate-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                  <FiZap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {editingIndex !== null ? 'Edit Delivery Tier' : 'Add New Delivery Tier'}
                  </h3>
                  <p className="text-xs text-slate-500">Configure speed, price, and customer labels</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTier} className="space-y-4">
              
              {/* Name & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Tier Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={tierForm.name}
                    onChange={(e) => setTierForm({ ...tierForm, name: e.target.value })}
                    placeholder="e.g. Instant Delivery, 2-Hour Express"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-orange-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Delivery Time Label <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={tierForm.time}
                    onChange={(e) => setTierForm({ ...tierForm, time: e.target.value })}
                    placeholder="e.g. 30 - 45 Mins, Within 4 Hours"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-orange-500"
                    required
                  />
                </div>
              </div>

              {/* Icon & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">Icon / Emoji</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tierForm.icon}
                      onChange={(e) => setTierForm({ ...tierForm, icon: e.target.value })}
                      placeholder="⚡"
                      className="w-14 text-center bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-base font-bold text-slate-900 outline-none focus:bg-white focus:border-orange-500"
                    />
                    {/* Quick Icon Chips */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {['⚡', '🕒', '🚚', '🚀', '📦', '🏎️'].map((em) => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => setTierForm({ ...tierForm, icon: em })}
                          className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                            tierForm.icon === em ? 'border-orange-500 bg-orange-50' : 'border-slate-200 bg-white'
                          }`}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">Badge / Tag (Optional)</label>
                  <input
                    type="text"
                    value={tierForm.badge}
                    onChange={(e) => setTierForm({ ...tierForm, badge: e.target.value })}
                    placeholder="e.g. Fastest Delivery, Most Popular"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">Description</label>
                <textarea
                  rows={2}
                  value={tierForm.description}
                  onChange={(e) => setTierForm({ ...tierForm, description: e.target.value })}
                  placeholder="e.g. Direct hyper-local courier from nearest merchant hub"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:bg-white focus:border-orange-500 resize-none"
                />
              </div>

              {/* Pricing & Free Delivery Rules */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Standard Delivery Fee (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={tierForm.price}
                      onChange={(e) => setTierForm({ ...tierForm, price: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-7 pr-3 py-1.5 text-xs font-bold text-slate-900 outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Free on Orders Above (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={tierForm.freeAbove}
                      onChange={(e) => setTierForm({ ...tierForm, freeAbove: e.target.value })}
                      placeholder="0 = No free rule"
                      className="w-full bg-white border border-slate-200 rounded-xl pl-7 pr-3 py-1.5 text-xs font-bold text-slate-900 outline-none focus:border-orange-500"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">Set 0 if fee is always applied</span>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={tierForm.isActive}
                    onChange={(e) => setTierForm({ ...tierForm, isActive: e.target.checked })}
                    className="w-4 h-4 text-orange-600 rounded-sm border-slate-300 focus:ring-orange-500 cursor-pointer"
                  />
                  <span>Active & visible to customers</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={tierForm.isDefault}
                    onChange={(e) => setTierForm({ ...tierForm, isDefault: e.target.checked })}
                    className="w-4 h-4 text-orange-600 rounded-sm border-slate-300 focus:ring-orange-500 cursor-pointer"
                  />
                  <span>Set as Default Selection</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTier}
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <FiCheck className="w-4 h-4" />
                  <span>{savingTier ? 'Updating...' : editingIndex !== null ? 'Update' : 'Add'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DeliverySettingsPage;
