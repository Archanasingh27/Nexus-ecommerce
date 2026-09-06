import React, { useState, useEffect } from 'react';
import { FiX, FiSave, FiClock, FiZap, FiCalendar } from 'react-icons/fi';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

export const FlashSaleModal = ({ isOpen, onClose, onSaved }) => {
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    title: 'Flash Sales & Hot Deals',
    tag: 'Limited-Time Deals',
    endTime: '',
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const toDateTimeLocal = (date) => {
    const d = new Date(date);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  useEffect(() => {
    if (!isOpen) return;

    const fetchConfig = async () => {
      setFetching(true);
      try {
        const res = await api.get('/admin/flash-sale');
        if (res.data?.flashSale) {
          const cfg = res.data.flashSale;
          setFormData({
            title: cfg.title || 'Flash Sales & Hot Deals',
            tag: cfg.tag || 'Limited-Time Deals',
            endTime: cfg.endTime ? toDateTimeLocal(cfg.endTime) : toDateTimeLocal(new Date(Date.now() + 12 * 3600000)),
            isActive: cfg.isActive !== undefined ? cfg.isActive : true,
          });
        }
      } catch (err) {
        console.error('Failed to load flash sale config:', err);
        setFormData((prev) => ({
          ...prev,
          endTime: toDateTimeLocal(new Date(Date.now() + 12 * 3600000)),
        }));
      } finally {
        setFetching(false);
      }
    };

    fetchConfig();
  }, [isOpen]);

  if (!isOpen) return null;

  const setPresetHours = (hours) => {
    const targetDate = new Date(Date.now() + hours * 3600000);
    setFormData((prev) => ({
      ...prev,
      endTime: toDateTimeLocal(targetDate),
    }));
    addToast(`Timer set to +${hours} hours from now`, 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.endTime) {
      addToast('Please select a deal end date & time', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        tag: formData.tag,
        endTime: new Date(formData.endTime).toISOString(),
        isActive: formData.isActive,
      };

      await api.put('/admin/flash-sale', payload);
      addToast('Flash Sale timer & settings updated successfully!', 'success');
      if (onSaved) onSaved(payload);
      onClose();
    } catch (err) {
      console.error('Failed to update flash sale:', err);
      addToast(err.response?.data?.message || 'Failed to update deal timer', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculatePreviewHours = () => {
    if (!formData.endTime) return '00:00:00';
    const diff = new Date(formData.endTime) - new Date();
    if (diff <= 0) return 'Expired / Ended';
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s remaining`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#fae125] text-slate-950 border border-yellow-400 flex items-center justify-center shadow-xs">
              <FiClock className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Manage Flash Sale & Deals Timer</h3>
              <p className="text-xs text-slate-500 font-medium">Set real-time countdown deadlines for the storefront</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        {fetching ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-3 border-[#0d9488] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-bold">Loading deal settings...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            
            {/* Live Clock Preview Box */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#fae125] tracking-wider">Live Customer Preview</span>
                <div className="text-base font-black mt-0.5">{calculatePreviewHours()}</div>
              </div>
              <div className="px-3 py-1 bg-white/10 rounded-xl text-xs font-bold text-slate-300 border border-white/10">
                {formData.isActive ? '🟢 Active on Storefront' : '🔴 Inactive / Hidden'}
              </div>
            </div>

            {/* Quick Duration Presets */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Quick Duration Presets (From Now):
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[
                  { label: '+2 Hrs', hours: 2 },
                  { label: '+6 Hrs', hours: 6 },
                  { label: '+12 Hrs', hours: 12 },
                  { label: '+24 Hrs', hours: 24 },
                  { label: '+3 Days', hours: 72 },
                  { label: '+7 Days', hours: 168 },
                ].map((preset) => (
                  <button
                    key={preset.hours}
                    type="button"
                    onClick={() => setPresetHours(preset.hours)}
                    className="py-1.5 px-2 bg-slate-50 hover:bg-[#fae125] hover:text-slate-950 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all active:scale-95 text-center cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* DateTime Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <FiCalendar className="w-3.5 h-3.5 text-teal-600" />
                <span>Exact Deal End Date & Time:</span>
              </label>
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-xl text-xs font-bold text-slate-900 transition-all shadow-2xs"
              />
            </div>

            {/* Title & Tag */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Section Title:</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Flash Sales & Trending Drops"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Badge Tag:</label>
                <input
                  type="text"
                  value={formData.tag}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  placeholder="e.g. Limited-Time Deals"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <div className="text-xs font-bold text-slate-900">Enable Flash Deals Clock</div>
                <div className="text-[11px] text-slate-500">Show countdown clock and limited time badge on home page</div>
              </div>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 accent-[#fae125] rounded cursor-pointer"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-[#fae125] hover:bg-yellow-300 text-slate-950 text-xs font-black flex items-center gap-2 border border-yellow-400 shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <FiSave className="w-4 h-4 text-black" />
                <span>{loading ? 'Saving Deadline...' : 'Save & Publish Deals Timer'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};

export default FlashSaleModal;
