import React, { useState, useEffect } from 'react';
import { FiX, FiSave, FiClock, FiZap, FiCalendar, FiTag, FiPercent, FiCheck } from 'react-icons/fi';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

export const FlashSaleModal = ({ isOpen, onClose, onUpdated }) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    isActive: true,
    title: 'Flash Sales & Hot Deals',
    tag: 'Limited-Time Deals',
    endTime: '',
    couponCode: 'NEXUS20',
    discountPercent: 20,
    minOrderAmount: 999,
    showAnnouncementBar: true,
    announcementText: 'Use code NEXUS20 for 20% OFF on all orders over ₹999!',
    announcementBadge: 'FLASH SALE',
  });

  useEffect(() => {
    if (!isOpen) return;

    const fetchConfig = async () => {
      setFetching(true);
      try {
        const { data } = await api.get('/settings/flash-sale');
        if (data.config) {
          const cfg = data.config;
          let formattedTime = '';
          if (cfg.endTime) {
            const date = new Date(cfg.endTime);
            const offset = date.getTimezoneOffset() * 60000;
            formattedTime = new Date(date.getTime() - offset).toISOString().slice(0, 16);
          } else {
            const defaultEnd = new Date(Date.now() + 24 * 3600 * 1000);
            const offset = defaultEnd.getTimezoneOffset() * 60000;
            formattedTime = new Date(defaultEnd.getTime() - offset).toISOString().slice(0, 16);
          }

          setFormData({
            isActive: cfg.isActive !== undefined ? cfg.isActive : true,
            title: cfg.title || 'Flash Sales & Hot Deals',
            tag: cfg.tag || 'Limited-Time Deals',
            endTime: formattedTime,
            couponCode: cfg.couponCode || 'NEXUS20',
            discountPercent: cfg.discountPercent || 20,
            minOrderAmount: cfg.minOrderAmount || 999,
            showAnnouncementBar: cfg.showAnnouncementBar !== undefined ? cfg.showAnnouncementBar : true,
            announcementText: cfg.announcementText || 'Use code NEXUS20 for 20% OFF on all orders over ₹999!',
            announcementBadge: cfg.announcementBadge || 'FLASH SALE',
          });
        }
      } catch (err) {
        console.error('Failed to load flash sale config:', err);
      } finally {
        setFetching(false);
      }
    };

    fetchConfig();
  }, [isOpen]);

  const setPresetHours = (hours) => {
    const targetDate = new Date(Date.now() + hours * 3600 * 1000);
    const offset = targetDate.getTimezoneOffset() * 60000;
    const localIso = new Date(targetDate.getTime() - offset).toISOString().slice(0, 16);
    setFormData((prev) => ({ ...prev, endTime: localIso, isActive: true }));
    addToast(`Timer set to ${hours} hours from now!`, 'info');
  };

  const handleApplyQuickCoupon = (code, discount, minSpend) => {
    setFormData((prev) => ({
      ...prev,
      couponCode: code,
      discountPercent: discount,
      minOrderAmount: minSpend,
      announcementText: `Use code ${code} for ${discount}% OFF on all orders over ₹${minSpend}!`,
    }));
    addToast(`Applied coupon preset: ${code}`, 'success');
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        isActive: formData.isActive,
        title: formData.title,
        tag: formData.tag,
        endTime: new Date(formData.endTime).toISOString(),
        couponCode: formData.couponCode.trim().toUpperCase(),
        discountPercent: Number(formData.discountPercent),
        minOrderAmount: Number(formData.minOrderAmount),
        showAnnouncementBar: formData.showAnnouncementBar,
        announcementText: formData.announcementText,
        announcementBadge: formData.announcementBadge,
      };

      const { data } = await api.put('/settings/flash-sale', payload);
      if (data.success) {
        addToast('⚡ Flash Sale & Announcement Bar updated live on store!', 'success');
        if (onUpdated) onUpdated();
        onClose();
      }
    } catch (err) {
      console.error('Failed to update flash sale:', err);
      addToast(err.response?.data?.message || 'Failed to update settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculatePreviewHours = () => {
    if (!formData.endTime) return '00:00:00';
    const diff = new Date(formData.endTime) - new Date();
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s remaining`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150 max-h-[88vh] flex flex-col my-auto">
        
        {/* Header - Compact */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#fae125] text-slate-950 border border-yellow-400 flex items-center justify-center shadow-xs shrink-0">
              <FiZap className="w-4 h-4 text-black" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 leading-tight">Flash Sale & Top Announcement Bar</h3>
              <p className="text-[11px] text-slate-500 font-medium">Control live promo codes & countdown timer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <FiX className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Form Body */}
        {fetching ? (
          <div className="py-10 text-center">
            <div className="w-6 h-6 border-2 border-[#0d9488] border-t-transparent rounded-full animate-spin mx-auto mb-1.5" />
            <p className="text-xs text-slate-400 font-bold">Loading settings...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto text-xs">
            
            {/* Live Storefront Announcement Preview */}
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                Storefront Announcement Bar Preview:
              </span>
              <div className="bg-[#0d9488] text-white py-1.5 px-3 rounded-xl shadow-xs flex items-center justify-between gap-2 border border-teal-600">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="bg-[#fae125] text-black font-black px-2 py-0.5 rounded-full text-[9px] border border-yellow-300 flex items-center gap-0.5 shrink-0">
                    <FiZap className="w-2.5 h-2.5 text-black fill-black" /> {formData.announcementBadge || 'FLASH SALE'}
                  </span>
                  <span className="text-teal-50 font-bold text-[11px] truncate">
                    {formData.announcementText || `Use code ${formData.couponCode} for ${formData.discountPercent}% OFF!`}
                  </span>
                </div>
                <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-teal-900/60 text-teal-200 shrink-0">
                  {formData.showAnnouncementBar ? '🟢 Live' : '🔴 Off'}
                </span>
              </div>
            </div>

            {/* 1. Top Announcement Bar Configuration */}
            <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-200/80 space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-teal-200/60">
                <div className="flex items-center gap-1.5">
                  <FiTag className="w-3.5 h-3.5 text-teal-800" />
                  <span className="text-[11px] font-black text-teal-950 uppercase tracking-wide">Top Bar Coupon & Promo</span>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <span className="text-[11px] font-bold text-teal-900">Show Top Bar</span>
                  <input
                    type="checkbox"
                    checked={formData.showAnnouncementBar}
                    onChange={(e) => setFormData({ ...formData, showAnnouncementBar: e.target.checked })}
                    className="w-3.5 h-3.5 accent-teal-600 rounded cursor-pointer"
                  />
                </label>
              </div>

              {/* Quick Coupon Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-teal-900">Presets:</span>
                {[
                  { code: 'NEXUS20', discount: 20, minSpend: 999, label: 'NEXUS20 (20% OFF ₹999+)' },
                  { code: 'FLASHSALE30', discount: 30, minSpend: 1499, label: 'FLASHSALE30 (30% OFF ₹1499+)' },
                  { code: 'WELCOME10', discount: 10, minSpend: 499, label: 'WELCOME10 (10% OFF)' },
                ].map((preset) => (
                  <button
                    key={preset.code}
                    type="button"
                    onClick={() => handleApplyQuickCoupon(preset.code, preset.discount, preset.minSpend)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                      formData.couponCode === preset.code
                        ? 'bg-teal-700 text-white border-teal-800 shadow-2xs'
                        : 'bg-white text-teal-900 border-teal-200 hover:bg-teal-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Announcement Inputs Grid */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Badge Text:</label>
                  <input
                    type="text"
                    value={formData.announcementBadge}
                    onChange={(e) => setFormData({ ...formData, announcementBadge: e.target.value })}
                    placeholder="FLASH SALE"
                    className="w-full px-2.5 py-1.5 bg-white border border-teal-200 focus:border-teal-600 rounded-lg text-xs font-bold text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Coupon Code:</label>
                  <input
                    type="text"
                    value={formData.couponCode}
                    onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                    placeholder="NEXUS20"
                    className="w-full px-2.5 py-1.5 bg-white border border-teal-200 focus:border-teal-600 rounded-lg text-xs font-black text-slate-900 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Discount %:</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={formData.discountPercent}
                    onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                    placeholder="20"
                    className="w-full px-2.5 py-1.5 bg-white border border-teal-200 focus:border-teal-600 rounded-lg text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Announcement Message:</label>
                  <input
                    type="text"
                    value={formData.announcementText}
                    onChange={(e) => setFormData({ ...formData, announcementText: e.target.value })}
                    placeholder="Use code NEXUS20 for 20% OFF..."
                    className="w-full px-2.5 py-1.5 bg-white border border-teal-200 focus:border-teal-600 rounded-lg text-xs font-medium text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Min Spend (₹):</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    placeholder="999"
                    className="w-full px-2.5 py-1.5 bg-white border border-teal-200 focus:border-teal-600 rounded-lg text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 2. Flash Deals Timer Section */}
            <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-amber-200/60">
                <div className="flex items-center gap-1.5">
                  <FiClock className="w-3.5 h-3.5 text-amber-800" />
                  <span className="text-[11px] font-black text-amber-950 uppercase tracking-wide">Deals Countdown Timer</span>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <span className="text-[11px] font-bold text-amber-900">Enable Countdown</span>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-3.5 h-3.5 accent-amber-600 rounded cursor-pointer"
                  />
                </label>
              </div>

              {/* Live Clock Preview Box */}
              <div className="p-2 rounded-lg bg-slate-900 text-white flex items-center justify-between shadow-2xs">
                <div>
                  <span className="text-[9px] font-bold uppercase text-[#fae125] tracking-wider">Live Customer Timer</span>
                  <div className="text-xs font-black">{calculatePreviewHours()}</div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {formData.endTime ? new Date(formData.endTime).toLocaleDateString() : ''}
                </span>
              </div>

              {/* Quick Duration Presets */}
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[10px] font-bold text-amber-900 mr-1">Presets:</span>
                {[
                  { label: '+2h', hours: 2 },
                  { label: '+6h', hours: 6 },
                  { label: '+12h', hours: 12 },
                  { label: '+24h', hours: 24 },
                  { label: '+3 Days', hours: 72 },
                  { label: '+7 Days', hours: 168 },
                ].map((preset) => (
                  <button
                    key={preset.hours}
                    type="button"
                    onClick={() => setPresetHours(preset.hours)}
                    className="py-1 px-2 bg-white hover:bg-[#fae125] hover:text-slate-950 text-slate-700 text-[10px] font-bold rounded-lg border border-amber-200 transition-all active:scale-95 cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* DateTime Picker */}
              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-0.5 flex items-center gap-1">
                  <FiCalendar className="w-3 h-3 text-amber-700" />
                  <span>Deal End Date & Time:</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                  className="w-full px-2.5 py-1.5 bg-white border border-amber-200 focus:border-amber-600 rounded-lg text-xs font-bold text-slate-900 outline-none"
                />
              </div>

              {/* Title & Tag */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Section Title:</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Flash Sales & Hot Deals"
                    className="w-full px-2.5 py-1.5 bg-white border border-amber-200 focus:border-amber-600 rounded-lg text-xs font-medium text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Badge Tag:</label>
                  <input
                    type="text"
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    placeholder="Limited-Time Deals"
                    className="w-full px-2.5 py-1.5 bg-white border border-amber-200 focus:border-amber-600 rounded-lg text-xs font-medium text-slate-900 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-[#fae125] hover:bg-yellow-300 text-slate-950 text-xs font-black flex items-center gap-1.5 border border-yellow-400 shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <FiSave className="w-3.5 h-3.5 text-black" />
                <span>{loading ? 'Publishing...' : 'Save & Publish'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};

export default FlashSaleModal;
