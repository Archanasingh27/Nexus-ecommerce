import React, { useState, useEffect } from 'react';
import {
  FiPlus,
  FiSearch,
  FiImage,
  FiVideo,
  FiPercent,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiExternalLink,
  FiTag,
  FiLayers,
  FiCheck,
  FiPlay,
} from 'react-icons/fi';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { AdvertisementModal } from '../components/AdvertisementModal';

export const AdvertisementsPage = () => {
  const { addToast } = useToast();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState('all');
  const [placementFilter, setPlacementFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState(null);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (placementFilter !== 'all') params.append('placement', placementFilter);
      if (searchQuery) params.append('search', searchQuery);

      const { data } = await api.get(`/advertisements/admin?${params.toString()}`);
      setAds(data.advertisements || []);
    } catch (err) {
      console.error('Failed to load advertisements:', err);
      addToast('Failed to load advertisements', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, [typeFilter, placementFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAds();
  };

  const handleToggleStatus = async (ad) => {
    try {
      const { data } = await api.patch(`/advertisements/${ad._id}/toggle`);
      addToast(data.message || 'Ad status updated', 'success');
      setAds((prev) =>
        prev.map((item) => (item._id === ad._id ? { ...item, isActive: !item.isActive } : item))
      );
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  const handleDeleteAd = async (id) => {
    if (window.confirm('Are you sure you want to delete this advertisement?')) {
      try {
        await api.delete(`/advertisements/${id}`);
        addToast('Advertisement deleted', 'success');
        setAds((prev) => prev.filter((item) => item._id !== id));
      } catch (err) {
        addToast('Failed to delete advertisement', 'error');
      }
    }
  };

  const openCreateModal = () => {
    setEditingAd(null);
    setIsModalOpen(true);
  };

  const openEditModal = (ad) => {
    setEditingAd(ad);
    setIsModalOpen(true);
  };

  const totalAds = ads.length;
  const videoAds = ads.filter((a) => a.type === 'video').length;
  const imageAds = ads.filter((a) => a.type === 'image').length;
  const simpleAds = ads.filter((a) => a.type === 'simple').length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-orange-200/60">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-linear-to-r from-orange-500 to-amber-500 text-white text-xs font-black uppercase tracking-wider mb-2 shadow-xs">
            <FiTag className="w-3.5 h-3.5" />
            <span>Storefront Marketing Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Advertisements & Banners
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Manage Video, Image, and Simple promotion banners across all storefront locations
          </p>
        </div>

        {/* GREEN BUTTON: Create New Advertisement */}
        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-500/25 border border-emerald-500 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer self-start sm:self-auto"
        >
          <FiPlus className="w-4 h-4 text-white" />
          <span>Create New Advertisement</span>
        </button>
      </div>

      {/* Quick Summary Glass Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Banners</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalAds}</div>
        </div>
        <div className="glass-card p-4 border-emerald-200/60 bg-emerald-50/40">
          <div className="text-[10px] font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1">
            <FiVideo className="w-3 h-3" /> Video Ads
          </div>
          <div className="text-2xl font-black text-emerald-950 mt-1">{videoAds}</div>
        </div>
        <div className="glass-card p-4 border-amber-200/60 bg-amber-50/40">
          <div className="text-[10px] font-black uppercase tracking-wider text-amber-700 flex items-center gap-1">
            <FiImage className="w-3 h-3" /> Image Ads
          </div>
          <div className="text-2xl font-black text-amber-950 mt-1">{imageAds}</div>
        </div>
        <div className="glass-card p-4 border-blue-200/60 bg-blue-50/40">
          <div className="text-[10px] font-black uppercase tracking-wider text-blue-700 flex items-center gap-1">
            <FiPercent className="w-3 h-3" /> Simple / Codes
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{simpleAds}</div>
        </div>
      </div>

      {/* Filter Controls in Glass Panel */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Type selector chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Formats' },
            { id: 'image', label: '🖼️ Image Ads' },
            { id: 'video', label: '🎥 Video Ads' },
            { id: 'simple', label: '🏷️ Simple Codes' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTypeFilter(t.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                typeFilter === t.id
                  ? 'bg-linear-to-r from-orange-500 to-amber-500 text-white shadow-xs'
                  : 'bg-white/80 text-slate-700 hover:bg-orange-50/60 border border-slate-200/80'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search and Placement */}
        <div className="flex items-center gap-3">
          <select
            value={placementFilter}
            onChange={(e) => setPlacementFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl outline-none focus:border-[#0d9488] cursor-pointer"
          >
            <option value="all">All Placements</option>
            <option value="category_feed">Category Feed</option>
            <option value="promo_banner">Promo Banner</option>
            <option value="hero_slide">Hero Slide</option>
          </select>

          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ads..."
              className="w-40 sm:w-52 bg-slate-50 border border-slate-200 text-xs rounded-xl py-1.5 pl-8 pr-3 outline-none focus:border-[#0d9488]"
            />
            <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          </form>
        </div>

      </div>

      {/* Ads Card Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-[#0d9488] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-bold text-slate-500">Loading advertisements...</p>
        </div>
      ) : ads.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-2xl">
            📢
          </div>
          <h3 className="text-base font-black text-slate-900">No advertisements found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create a new advertisement banner to showcase promotions, video teasers, or coupon codes.
          </p>
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-[#fae125] text-slate-950 font-black text-xs rounded-xl shadow-md border border-yellow-400"
          >
            Create Advertisement
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ads.map((ad) => (
            <div
              key={ad._id}
              className={`relative overflow-hidden rounded-3xl p-6 shadow-md border transition-all ${ad.borderColor || 'border-slate-200'} ${ad.bgGradient || 'bg-white'} ${
                !ad.isActive ? 'opacity-60 grayscale-[40%]' : ''
              }`}
            >
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#fae125] text-slate-950 text-[10px] font-black uppercase tracking-wider border border-yellow-400 shadow-2xs">
                    {ad.tag || 'PROMO'}
                  </span>

                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    ad.type === 'video'
                      ? 'bg-purple-100 text-purple-900 border border-purple-200'
                      : ad.type === 'image'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                      : 'bg-amber-100 text-amber-900 border border-amber-200'
                  }`}>
                    {ad.type === 'video' && <FiVideo className="w-3 h-3" />}
                    {ad.type === 'image' && <FiImage className="w-3 h-3" />}
                    {ad.type === 'simple' && <FiPercent className="w-3 h-3" />}
                    <span>{ad.type} Ad</span>
                  </span>

                  {ad.category?.name && (
                    <span className="text-[10px] font-bold text-slate-600 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">
                      {ad.category.name}
                    </span>
                  )}
                </div>

                {/* Active Toggle Switch */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ad.isActive}
                    onChange={() => handleToggleStatus(ad)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0d9488]"></div>
                </label>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1.5 mb-4">
                <h3 className="text-lg font-black text-slate-900 leading-snug">
                  {ad.title}
                </h3>
                {ad.subtitle && (
                  <p className="text-xs text-slate-700 font-medium line-clamp-2">
                    {ad.subtitle}
                  </p>
                )}
              </div>

              {/* Media Preview or Coupon Box */}
              <div className="mb-4">
                {ad.type === 'video' && ad.mediaUrl && (
                  <div className="relative aspect-16/9 w-full rounded-2xl overflow-hidden bg-black shadow-inner border border-slate-300">
                    <video
                      src={ad.mediaUrl}
                      poster={ad.posterUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-md text-[10px] font-black flex items-center gap-1">
                      <FiPlay className="w-3 h-3 text-[#fae125]" /> Video
                    </div>
                  </div>
                )}

                {ad.type === 'image' && ad.mediaUrl && (
                  <div className="relative aspect-16/9 w-full rounded-2xl overflow-hidden bg-white shadow-inner border border-slate-200">
                    <img
                      src={ad.mediaUrl}
                      alt={ad.title}
                      className="w-full h-full object-cover"
                    />
                    {ad.badgeText && (
                      <span className="absolute bottom-2 left-2 bg-[#fae125] text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-lg border border-yellow-400">
                        {ad.badgeText}
                      </span>
                    )}
                  </div>
                )}

                {ad.type === 'simple' && (
                  <div className="p-3 rounded-2xl bg-white/90 border border-amber-200 space-y-2">
                    {ad.couponCode && (
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-slate-500">Discount Code:</span>
                        <span className="font-mono font-black text-xs bg-[#fae125] px-2.5 py-0.5 rounded-md border border-yellow-400">
                          {ad.couponCode}
                        </span>
                      </div>
                    )}
                    {ad.perks && ad.perks.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {ad.perks.map((p, idx) => (
                          <span key={idx} className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                            ✓ {p}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
                <div className="text-[11px] font-bold text-slate-500">
                  Target Link: <code className="text-slate-800 font-mono text-[10px]">{ad.link}</code>
                </div>

                <div className="flex items-center gap-2">
                  {/* YELLOW BUTTON: Edit */}
                  <button
                    onClick={() => openEditModal(ad)}
                    className="p-2 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl border border-amber-300 transition-all cursor-pointer shadow-2xs"
                    title="Edit Advertisement"
                  >
                    <FiEdit2 className="w-3.5 h-3.5" />
                  </button>

                  {/* RED BUTTON: Delete */}
                  <button
                    onClick={() => handleDeleteAd(ad._id)}
                    className="p-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-xl border border-red-200 hover:border-red-600 transition-all cursor-pointer shadow-2xs"
                    title="Delete Advertisement"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Modal */}
      <AdvertisementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchAds}
        adToEdit={editingAd}
      />

    </div>
  );
};
