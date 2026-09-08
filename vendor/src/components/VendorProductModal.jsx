import React, { useState, useEffect, useRef } from 'react';
import {
  FiX,
  FiPlus,
  FiTrash2,
  FiSave,
  FiImage,
  FiUploadCloud,
  FiCheckCircle,
  FiInfo,
  FiShield,
  FiDollarSign,
  FiBox,
  FiLayers,
  FiList,
  FiTag,
  FiEye,
  FiZap,
  FiStar,
} from 'react-icons/fi';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

export const VendorProductModal = ({ isOpen, onClose, product, categories = [], onSaved }) => {
  const { addToast } = useToast();
  const fileInputRef = useRef(null);
  const isEdit = Boolean(product?._id);

  const [activeTab, setActiveTab] = useState('basic'); // 'basic' | 'pricing' | 'media' | 'specs'
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    category: '',
    subcategory: '',
    brand: '',
    countInStock: 20,
    description: '',
    images: [],
    isFeatured: false,
    isTrending: true,
    isNewArrival: true,
    isFlashDeal: false,
    tags: [],
    specifications: [
      { name: 'Warranty', value: '1-Year Manufacturer' },
      { name: 'Condition', value: 'Brand New' },
    ],
  });

  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price || '',
        originalPrice: product.originalPrice || '',
        category: product.category?._id || product.category || (categories[0]?._id || ''),
        subcategory: product.subcategory || '',
        brand: product.brand || '',
        countInStock: product.countInStock !== undefined ? product.countInStock : 20,
        description: product.description || '',
        images: product.images?.length > 0 ? product.images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'],
        isFeatured: Boolean(product.isFeatured),
        isTrending: Boolean(product.isTrending),
        isNewArrival: Boolean(product.isNewArrival),
        isFlashDeal: Boolean(product.isFlashDeal),
        tags: product.tags || [],
        specifications: product.specifications?.length > 0 ? product.specifications : [{ name: 'Warranty', value: '1-Year Manufacturer' }],
      });
    } else {
      setFormData({
        name: '',
        price: '',
        originalPrice: '',
        category: categories[0]?._id || '',
        subcategory: '',
        brand: '',
        countInStock: 25,
        description: '',
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'],
        isFeatured: false,
        isTrending: true,
        isNewArrival: true,
        isFlashDeal: false,
        tags: ['New', 'Quality'],
        specifications: [
          { name: 'Warranty', value: '1-Year Manufacturer Warranty' },
          { name: 'Condition', value: 'Brand New In Box' },
        ],
      });
    }
    setActiveTab('basic');
  }, [product, categories, isOpen]);

  if (!isOpen) return null;

  // Calculate live discount percentage
  const discountPercent =
    formData.originalPrice && Number(formData.originalPrice) > Number(formData.price)
      ? Math.round(((Number(formData.originalPrice) - Number(formData.price)) / Number(formData.originalPrice)) * 100)
      : 0;

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setFormData({ ...formData, images: [...formData.images, newImageUrl.trim()] });
      setNewImageUrl('');
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingFiles(true);
    const uploadData = new FormData();
    files.forEach((f) => uploadData.append('images', f));
    uploadData.append('folder', 'nexus-commerce/vendor-products');

    try {
      const { data } = await api.post('/upload/multiple', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (data.urls && data.urls.length > 0) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...data.urls],
        }));
        addToast(`${data.urls.length} images uploaded successfully!`, 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to upload images', 'error');
    } finally {
      setUploadingFiles(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index) => {
    if (formData.images.length <= 1) {
      addToast('At least one product image is required', 'info');
      return;
    }
    setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) });
  };

  const handleSetCoverImage = (index) => {
    if (index === 0) return;
    const selected = formData.images[index];
    const remaining = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: [selected, ...remaining] });
    addToast('Cover image updated!', 'success');
  };

  const handleAddSpec = (presetName = '', presetValue = '') => {
    setFormData({
      ...formData,
      specifications: [...formData.specifications, { name: presetName, value: presetValue }],
    });
  };

  const handleSpecChange = (index, field, value) => {
    const updated = [...formData.specifications];
    updated[index][field] = value;
    setFormData({ ...formData, specifications: updated });
  };

  const handleRemoveSpec = (index) => {
    setFormData({
      ...formData,
      specifications: formData.specifications.filter((_, i) => i !== index),
    });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tagToRemove) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price || !formData.category || !formData.description.trim()) {
      addToast('Please complete all required fields (Name, Price, Category, Description)', 'error');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/vendor/products/${product._id}`, formData);
        addToast('Product updated successfully!', 'success');
      } else {
        await api.post('/vendor/products', formData);
        addToast('Product submitted! It is under review by Admin before going live.', 'success');
      }
      onSaved();
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save product', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity" />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-6">
        <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-5 sm:p-8 z-10 space-y-6 overflow-hidden">

          {/* Modal Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/25">
                <FiBox className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  {isEdit ? `Edit Product: ${product.name}` : 'List New Store Product'}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Fill in your product specifications, pricing, inventory stock, and high-res photos.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2.5 rounded-2xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Admin Moderation Notice Alert Banner */}
          {!isEdit && (
            <div className="p-3.5 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-2xl border border-amber-200/80 flex items-start gap-3 shadow-xs">
              <div className="p-1.5 rounded-xl bg-amber-500 text-white shrink-0 mt-0.5 shadow-xs">
                <FiShield className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-extrabold text-amber-950 block">Admin Approval Workflow Active</span>
                <span className="text-amber-800 font-medium">
                  Once submitted, this product will be reviewed by the platform administrator and will appear live on the customer marketplace upon approval.
                </span>
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('basic')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'basic'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FiLayers className="w-4 h-4" />
              <span>1. Basic Details</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pricing')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'pricing'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FiDollarSign className="w-4 h-4" />
              <span>2. Pricing & Stock</span>
              {discountPercent > 0 && (
                <span className="px-1.5 py-0.2 bg-emerald-500 text-white text-[9px] font-black rounded-md">
                  {discountPercent}% OFF
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('media')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'media'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FiImage className="w-4 h-4" />
              <span>3. Photo Gallery ({formData.images.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('specs')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'specs'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FiList className="w-4 h-4" />
              <span>4. Specs & Features ({formData.specifications.length})</span>
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* TAB 1: BASIC DETAILS */}
            {activeTab === 'basic' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-extrabold text-slate-800 block mb-1">
                      Product Title / Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Wireless Noise-Cancelling Headphones Pro Max"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-bold transition-all shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-slate-800 block mb-1">
                      Primary Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-bold cursor-pointer transition-all shadow-2xs"
                    >
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-slate-800 block mb-1">Subcategory (Optional)</label>
                    <input
                      type="text"
                      value={formData.subcategory}
                      onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                      placeholder="e.g. Over-Ear, Smart Wearable, Hand Tools"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-bold transition-all shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-slate-800 block mb-1">Brand / Manufacturer</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="e.g. Nexus Sonic, Sony, Bosch"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-bold transition-all shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-slate-800 block mb-1">
                      Initial Inventory Count <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.countInStock}
                      onChange={(e) => setFormData({ ...formData, countInStock: e.target.value })}
                      placeholder="e.g. 25"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-bold transition-all shadow-2xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-extrabold text-slate-800 block mb-1">
                      Product Description & Highlights <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe materials, key features, dimensions, usage instructions, packaging contents..."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-medium transition-all shadow-2xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveTab('pricing')}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
                  >
                    Next: Pricing & Stock &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: PRICING & DEALS */}
            {activeTab === 'pricing' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Selling Price */}
                  <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-200/80 space-y-2">
                    <label className="text-xs font-black text-orange-950 flex items-center justify-between">
                      <span>Selling / Final Price (₹) *</span>
                      <span className="text-[10px] text-orange-600 uppercase font-black">Customer Pays</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="2499"
                        className="w-full pl-8 pr-4 py-2.5 bg-white border border-orange-200 focus:border-orange-500 rounded-xl text-sm text-slate-900 outline-none font-black shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Original / MRP Price */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                      <span>Original MRP Price (₹)</span>
                      {discountPercent > 0 && (
                        <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-black rounded-full shadow-2xs">
                          {discountPercent}% DISCOUNT
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={formData.originalPrice}
                        onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                        placeholder="2999"
                        className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-200 focus:border-orange-500 rounded-xl text-sm text-slate-900 outline-none font-bold shadow-2xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Promo Badges & Visibility Flags */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Promotional Tags & Collection Placement
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 hover:border-orange-300 cursor-pointer transition-all">
                      <input
                        type="checkbox"
                        checked={formData.isNewArrival}
                        onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                        className="w-4 h-4 text-orange-500 rounded focus:ring-0 accent-orange-500"
                      />
                      <span className="text-xs font-bold text-slate-800">✨ New Arrival</span>
                    </label>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 hover:border-orange-300 cursor-pointer transition-all">
                      <input
                        type="checkbox"
                        checked={formData.isTrending}
                        onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                        className="w-4 h-4 text-orange-500 rounded focus:ring-0 accent-orange-500"
                      />
                      <span className="text-xs font-bold text-slate-800">🔥 Trending Item</span>
                    </label>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 hover:border-orange-300 cursor-pointer transition-all">
                      <input
                        type="checkbox"
                        checked={formData.isFlashDeal}
                        onChange={(e) => setFormData({ ...formData, isFlashDeal: e.target.checked })}
                        className="w-4 h-4 text-orange-500 rounded focus:ring-0 accent-orange-500"
                      />
                      <span className="text-xs font-bold text-slate-800">⚡ Flash Deal</span>
                    </label>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 hover:border-orange-300 cursor-pointer transition-all">
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                        className="w-4 h-4 text-orange-500 rounded focus:ring-0 accent-orange-500"
                      />
                      <span className="text-xs font-bold text-slate-800">⭐ Featured</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('basic')}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    &larr; Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('media')}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
                  >
                    Next: Photo Gallery &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: PHOTO GALLERY */}
            {activeTab === 'media' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase">Product Image Gallery</h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Add crisp product images from multiple angles. First image is the main display cover.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-orange-100 text-orange-800 text-[11px] font-extrabold">
                    {formData.images.length} Photos
                  </span>
                </div>

                {/* Cloud Upload Dropzone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-6 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                    uploadingFiles
                      ? 'bg-orange-50 border-orange-400 animate-pulse'
                      : 'bg-slate-50 hover:bg-orange-50/50 border-slate-200 hover:border-orange-400'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-xs">
                    <FiUploadCloud className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-black text-slate-900">
                      {uploadingFiles ? 'Uploading images to Cloud CDN...' : 'Click to Upload Photos from Computer'}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">
                      Select multiple JPG, PNG, WebP photos (Max 10MB each)
                    </div>
                  </div>
                </div>

                {/* Or Paste Direct Image URL */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Or paste an image web URL (e.g. https://images.unsplash.com/...)"
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-medium shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0 shadow-sm"
                  >
                    Add URL
                  </button>
                </div>

                {/* Gallery Previews Grid */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
                    {formData.images.map((url, idx) => (
                      <div
                        key={idx}
                        className={`relative aspect-square rounded-2xl overflow-hidden border-2 group shadow-2xs bg-slate-100 ${
                          idx === 0 ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-slate-200'
                        }`}
                      >
                        <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />

                        {idx === 0 ? (
                          <div className="absolute top-1.5 left-1.5 bg-orange-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-lg shadow-sm">
                            ★ Main Cover
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetCoverImage(idx)}
                            className="absolute top-1.5 left-1.5 bg-slate-900/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            Set Cover
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1.5 right-1.5 bg-rose-600 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm hover:bg-rose-700"
                          title="Delete photo"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('pricing')}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    &larr; Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('specs')}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
                  >
                    Next: Specs & Highlights &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: SPECS & TAGS */}
            {activeTab === 'specs' && (
              <div className="space-y-5 animate-in fade-in duration-200">

                {/* Quick Add Presets */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-slate-800">
                      Technical Specifications & Attributes
                    </label>
                    <button
                      type="button"
                      onClick={() => handleAddSpec('', '')}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl border border-orange-200 text-xs font-bold transition-all cursor-pointer"
                    >
                      <FiPlus className="w-3.5 h-3.5" />
                      <span>Add Custom Row</span>
                    </button>
                  </div>

                  {/* Preset chips */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-400 font-bold">Quick Presets:</span>
                    {['Color', 'Material', 'Warranty', 'Dimensions', 'Weight', 'Package Contents'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleAddSpec(preset, '')}
                        className="px-2.5 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer transition-colors"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Specs Rows */}
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {formData.specifications.map((spec, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Feature Name (e.g. Battery Life)"
                        value={spec.name}
                        onChange={(e) => handleSpecChange(index, 'name', e.target.value)}
                        className="w-1/3 px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-bold"
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g. Up to 40 Hours)"
                        value={spec.value}
                        onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(index)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Remove specification"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Product Search Tags */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <label className="text-xs font-extrabold text-slate-800 block">
                    Product Search Tags & Keywords
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="e.g. cordless, bluetooth, heavy-duty (Press Enter)"
                      className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-medium"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Add Tag
                    </button>
                  </div>

                  {formData.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {formData.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-50 text-orange-800 border border-orange-200 text-xs font-bold"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-rose-600 cursor-pointer ml-1"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('media')}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    &larr; Back to Photos
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 border-t border-slate-100">
              <div className="text-[11px] text-slate-400 font-medium">
                {isEdit
                  ? 'All changes will update your store catalog immediately.'
                  : 'Product will be submitted for Admin moderation review.'}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/2 sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 sm:w-auto px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <FiSave className="w-4 h-4" />
                  <span>
                    {loading
                      ? 'Submitting...'
                      : isEdit
                      ? 'Save Changes'
                      : 'Submit for Admin Review'}
                  </span>
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};
