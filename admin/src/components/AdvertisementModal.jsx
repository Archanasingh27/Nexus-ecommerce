import React, { useState, useEffect, useRef } from 'react';
import {
  FiX,
  FiImage,
  FiVideo,
  FiPercent,
  FiTag,
  FiLayers,
  FiLink,
  FiCheck,
  FiPlay,
  FiUploadCloud,
} from 'react-icons/fi';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

const colorThemes = [
  {
    id: 'sage-green',
    name: 'Light Sage Green',
    bg: 'bg-gradient-to-r from-[#ecfdf5] via-[#d1fae5] to-[#a7f3d0]',
    border: 'border-emerald-200',
    sample: 'from-emerald-100 to-green-200',
  },
  {
    id: 'caramel-brown',
    name: 'Light Warm Caramel',
    bg: 'bg-gradient-to-r from-[#fffbeb] via-[#fef3c7] to-[#fde68a]',
    border: 'border-amber-200',
    sample: 'from-amber-100 to-yellow-200',
  },
  {
    id: 'mint-olive',
    name: 'Light Mint Olive',
    bg: 'bg-gradient-to-r from-[#f0fdf4] via-[#dcfce7] to-[#bbf7d0]',
    border: 'border-green-200',
    sample: 'from-green-100 to-emerald-200',
  },
  {
    id: 'hazelnut-latte',
    name: 'Light Hazelnut Latte',
    bg: 'bg-gradient-to-r from-[#fff7ed] via-[#ffedd5] to-[#fed7aa]',
    border: 'border-orange-200',
    sample: 'from-orange-100 to-amber-200',
  },
  {
    id: 'spring-green',
    name: 'Light Spring Green',
    bg: 'bg-gradient-to-r from-[#f7fee7] via-[#ecfccb] to-[#d9f99d]',
    border: 'border-lime-200',
    sample: 'from-lime-100 to-lime-200',
  },
  {
    id: 'celadon-mint',
    name: 'Light Celadon Mint',
    bg: 'bg-gradient-to-r from-[#f0fdfa] via-[#ccfbf1] to-[#99f6e4]',
    border: 'border-teal-200',
    sample: 'from-teal-100 to-cyan-200',
  },
];

export const AdvertisementModal = ({ isOpen, onClose, onSaved, adToEdit = null }) => {
  const { addToast } = useToast();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [categories, setCategories] = useState([]);

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [tag, setTag] = useState('⚡ EXCLUSIVE OFFER');
  const [type, setType] = useState('image'); // 'image' | 'video' | 'simple'
  const [placement, setPlacement] = useState('category_feed');
  const [layout, setLayout] = useState('split-media');
  const [category, setCategory] = useState('');
  
  // Media & Badges
  const [mediaUrl, setMediaUrl] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [badgeText, setBadgeText] = useState('');
  const [perk, setPerk] = useState('');

  const handleMediaUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMedia(true);
    const uploadData = new FormData();
    uploadData.append('image', file);
    uploadData.append('folder', 'nexus-commerce/advertisements');

    try {
      const { data } = await api.post('/upload/single', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (data.url) {
        setMediaUrl(data.url);
        addToast('Banner image uploaded successfully!', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to upload image', 'error');
    } finally {
      setUploadingMedia(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  
  // Simple Type specifics
  const [couponCode, setCouponCode] = useState('');
  const [perksText, setPerksText] = useState('');
  const [highlightLabel, setHighlightLabel] = useState('Special Discount');
  const [highlightValue, setHighlightValue] = useState('Save Up To 30%');
  
  // Actions & Theme
  const [buttonText, setButtonText] = useState('Explore Offer');
  const [link, setLink] = useState('/shop');
  const [selectedTheme, setSelectedTheme] = useState(colorThemes[0]);
  const [order, setOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data.categories || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Populate edit data
  useEffect(() => {
    if (adToEdit) {
      setTitle(adToEdit.title || '');
      setSubtitle(adToEdit.subtitle || '');
      setTag(adToEdit.tag || '⚡ EXCLUSIVE OFFER');
      setType(adToEdit.type || 'image');
      setPlacement(adToEdit.placement || 'category_feed');
      setLayout(adToEdit.layout || 'split-media');
      setCategory(adToEdit.category?._id || adToEdit.category || '');
      setMediaUrl(adToEdit.mediaUrl || '');
      setPosterUrl(adToEdit.posterUrl || '');
      setBadgeText(adToEdit.badgeText || '');
      setPerk(adToEdit.perk || '');
      setCouponCode(adToEdit.couponCode || '');
      setPerksText(Array.isArray(adToEdit.perks) ? adToEdit.perks.join(', ') : '');
      setHighlightLabel(adToEdit.highlightBadge?.label || 'Special Discount');
      setHighlightValue(adToEdit.highlightBadge?.value || 'Save Up To 30%');
      setButtonText(adToEdit.buttonText || 'Explore Offer');
      setLink(adToEdit.link || '/shop');
      setOrder(adToEdit.order !== undefined ? adToEdit.order : 1);
      setIsActive(adToEdit.isActive !== undefined ? adToEdit.isActive : true);

      const foundTheme = colorThemes.find((t) => t.bg === adToEdit.bgGradient);
      if (foundTheme) setSelectedTheme(foundTheme);
    } else {
      // Reset Form
      setTitle('');
      setSubtitle('');
      setTag('⚡ EXCLUSIVE OFFER');
      setType('image');
      setPlacement('category_feed');
      setLayout('split-media');
      setCategory('');
      setMediaUrl('');
      setPosterUrl('');
      setBadgeText('');
      setPerk('');
      setCouponCode('');
      setPerksText('');
      setHighlightLabel('Special Discount');
      setHighlightValue('Save Up To 30%');
      setButtonText('Explore Offer');
      setLink('/shop');
      setSelectedTheme(colorThemes[0]);
      setOrder(1);
      setIsActive(true);
    }
  }, [adToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast('Please enter an ad title', 'error');
      return;
    }

    setLoading(true);
    try {
      const perksArray = perksText
        ? perksText.split(',').map((p) => p.trim()).filter(Boolean)
        : [];

      const payload = {
        title,
        subtitle,
        tag,
        type,
        placement,
        layout,
        category: category || null,
        mediaUrl,
        posterUrl,
        badgeText,
        perk,
        couponCode,
        perks: perksArray,
        highlightBadge: {
          label: highlightLabel,
          value: highlightValue,
        },
        buttonText,
        link,
        bgGradient: selectedTheme.bg,
        borderColor: selectedTheme.border,
        order: Number(order) || 0,
        isActive,
      };

      if (adToEdit) {
        await api.put(`/advertisements/${adToEdit._id}`, payload);
        addToast('Advertisement updated successfully!', 'success');
      } else {
        await api.post('/advertisements', payload);
        addToast('New advertisement banner created!', 'success');
      }

      onSaved && onSaved();
      onClose();
    } catch (err) {
      console.error('Failed to save advertisement:', err);
      addToast(err.response?.data?.message || 'Failed to save advertisement', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-[#fffdf0]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#fae125] text-slate-950 text-[10px] font-black uppercase tracking-wider mb-1 border border-yellow-400">
              <FiTag className="w-3 h-3" />
              <span>Banner & Ad Studio</span>
            </div>
            <h2 className="text-xl font-black text-slate-900">
              {adToEdit ? 'Edit Advertisement' : 'Create New Advertisement Banner'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Ad Type Selector Tabs */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
              Select Ad Format / Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'image', label: 'Image Ad', icon: <FiImage className="w-4 h-4" />, desc: 'High-Res Photo Showcase' },
                { id: 'video', label: 'Video Ad', icon: <FiVideo className="w-4 h-4" />, desc: 'Autoplay Looped Video' },
                { id: 'simple', label: 'Simple / Code Ad', icon: <FiPercent className="w-4 h-4" />, desc: 'Coupon & Highlight Perks' },
              ].map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    type === t.id
                      ? 'bg-[#fae125] text-slate-950 border-2 border-yellow-400 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 font-black text-xs mb-1">
                    {t.icon}
                    <span>{t.label}</span>
                  </div>
                  <p className="text-[10px] text-slate-600 font-semibold">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                Headline / Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Noise-Canceling & Studio Sound — Flat 25% OFF"
                className="w-full bg-[#fffdf0] border border-yellow-300 text-xs text-slate-900 font-bold rounded-xl py-2.5 px-3.5 outline-none focus:border-[#0d9488]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                Subtitle Description
              </label>
              <textarea
                rows={2}
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Detailed offer summary or tech specs..."
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl py-2 px-3.5 outline-none focus:border-[#0d9488]"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                Top Tag Pill
              </label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="e.g. ⚡ LIMITED TIME AUDIO DROP"
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl py-2.5 px-3.5 outline-none focus:border-[#0d9488]"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                Banner Placement Position
              </label>
              <select
                value={placement}
                onChange={(e) => setPlacement(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 font-bold rounded-xl py-2.5 px-3 outline-none focus:border-[#0d9488] cursor-pointer"
              >
                <option value="hero_slide">⭐ Hero Slider / Carousel (Top of Home Page)</option>
                <option value="category_feed">📦 Category Feed (After Every Category)</option>
                <option value="promo_banner">⚡ Promotional Banner (Mid-Page Showcase)</option>
                <option value="global_bar">📢 Global Announcement Bar</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                Target Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 font-bold rounded-xl py-2.5 px-3 outline-none focus:border-[#0d9488] cursor-pointer"
              >
                <option value="">All Categories / General</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                min="0"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl py-2.5 px-3.5 outline-none focus:border-[#0d9488]"
              />
            </div>
          </div>

          {/* Type Specific Fields */}
          {type === 'image' && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 text-xs font-black text-slate-900">
                <FiImage className="w-4 h-4 text-[#0d9488]" />
                <span>Banner Image Upload & Media</span>
              </div>

              {/* Direct File Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`p-4 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  uploadingMedia
                    ? 'bg-teal-50/50 border-teal-300 animate-pulse'
                    : 'bg-white hover:bg-teal-50/40 border-slate-200 hover:border-teal-300'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleMediaUpload}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                />
                <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shadow-xs">
                  <FiUploadCloud className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <div className="text-xs font-bold text-slate-800">
                    {uploadingMedia ? 'Uploading banner image to Cloud CDN...' : 'Click to Upload Banner Image'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    Supports JPEG, PNG, WebP up to 10MB
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Or Paste Image URL
                  </label>
                  <input
                    type="text"
                    required={type === 'image'}
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-white border border-slate-200 text-xs rounded-xl py-2 px-3 outline-none focus:border-[#0d9488]"
                  />
                  {mediaUrl && (
                    <div className="mt-2 flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-200">
                      <img src={mediaUrl} alt="Preview" className="w-16 h-10 object-cover rounded-lg border border-slate-100" />
                      <div className="text-[10px] text-slate-500 font-semibold truncate flex-1">{mediaUrl}</div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Badge Text</label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="e.g. Top Sound 2026"
                    className="w-full bg-white border border-slate-200 text-xs rounded-xl py-2 px-3 outline-none focus:border-[#0d9488]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Perk / Guarantee</label>
                  <input
                    type="text"
                    value={perk}
                    onChange={(e) => setPerk(e.target.value)}
                    placeholder="e.g. Official 2-Year Warranty"
                    className="w-full bg-white border border-slate-200 text-xs rounded-xl py-2 px-3 outline-none focus:border-[#0d9488]"
                  />
                </div>
              </div>
            </div>
          )}

          {type === 'video' && (
            <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200 space-y-4">
              <div className="flex items-center gap-2 text-xs font-black text-teal-950">
                <FiVideo className="w-4 h-4 text-[#0d9488]" />
                <span>Video Ad Details (Autoplay Looped Video)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Video MP4/WebM URL *
                  </label>
                  <input
                    type="text"
                    required={type === 'video'}
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://assets.mixkit.co/videos/preview/..."
                    className="w-full bg-white border border-teal-300 text-xs rounded-xl py-2 px-3 outline-none focus:border-[#0d9488]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Video Poster Image URL</label>
                  <input
                    type="text"
                    value={posterUrl}
                    onChange={(e) => setPosterUrl(e.target.value)}
                    placeholder="Fallback thumbnail image"
                    className="w-full bg-white border border-slate-200 text-xs rounded-xl py-2 px-3 outline-none focus:border-[#0d9488]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Live Badge Text</label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="e.g. 4K Video Demo"
                    className="w-full bg-white border border-slate-200 text-xs rounded-xl py-2 px-3 outline-none focus:border-[#0d9488]"
                  />
                </div>
              </div>

              {/* Video Preview */}
              {mediaUrl && (
                <div className="pt-2">
                  <div className="text-[11px] font-bold text-slate-600 mb-1">Live Video Preview:</div>
                  <div className="w-full max-w-xs aspect-video rounded-xl overflow-hidden bg-black shadow-md border border-slate-300">
                    <video
                      src={mediaUrl}
                      poster={posterUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {type === 'simple' && (
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-4">
              <div className="flex items-center gap-2 text-xs font-black text-amber-950">
                <FiPercent className="w-4 h-4 text-amber-700" />
                <span>Simple / Coupon Code Ad Details</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Coupon Code</label>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. TECH5G or KICKS30"
                    className="w-full bg-white border border-amber-300 font-mono font-bold text-xs rounded-xl py-2 px-3 outline-none focus:border-[#0d9488]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Highlight Value</label>
                  <input
                    type="text"
                    value={highlightValue}
                    onChange={(e) => setHighlightValue(e.target.value)}
                    placeholder="e.g. Save Up To 35%"
                    className="w-full bg-white border border-slate-200 text-xs rounded-xl py-2 px-3 outline-none focus:border-[#0d9488]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Perks & Guarantees (comma separated)
                  </label>
                  <input
                    type="text"
                    value={perksText}
                    onChange={(e) => setPerksText(e.target.value)}
                    placeholder="e.g. Zero Downpayment, Free Screen Protection, Same-Day Dispatch"
                    className="w-full bg-white border border-slate-200 text-xs rounded-xl py-2 px-3 outline-none focus:border-[#0d9488]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Color Palette Theme Selector */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
              Color Palette Theme (Light Green / Light Brown Palette)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {colorThemes.map((theme) => (
                <button
                  type="button"
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme)}
                  className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                    selectedTheme.id === theme.id
                      ? 'border-[#0d9488] ring-2 ring-[#0d9488]/30 bg-white shadow-xs'
                      : 'border-slate-200 bg-slate-50 hover:bg-white'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${theme.sample} border border-slate-300 shrink-0`} />
                  <span className="text-xs font-black text-slate-800 truncate">{theme.name}</span>
                  {selectedTheme.id === theme.id && <FiCheck className="w-3.5 h-3.5 text-[#0d9488] ml-auto" />}
                </button>
              ))}
            </div>
          </div>

          {/* CTA Button & Target Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                Button Text
              </label>
              <input
                type="text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="e.g. Claim Audio Offer"
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 font-bold rounded-xl py-2 px-3 outline-none focus:border-[#0d9488]"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                Target Link URL
              </label>
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="/shop?category=..."
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl py-2 px-3 outline-none focus:border-[#0d9488]"
              />
            </div>
          </div>

          {/* Active Status */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-black text-slate-900 block">Active Status</span>
              <span className="text-[11px] text-slate-500">Show this advertisement across storefront banners</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0d9488]"></div>
            </label>
          </div>

        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 bg-[#fae125] hover:bg-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow-md border border-yellow-400 transition-all cursor-pointer flex items-center gap-2"
          >
            {loading && <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>}
            <span>{adToEdit ? 'Save Changes' : 'Publish Advertisement'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
