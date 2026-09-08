import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  FiArrowLeft,
  FiBox,
  FiLayers,
  FiDollarSign,
  FiImage,
  FiList,
  FiUploadCloud,
  FiTrash2,
  FiSave,
  FiCheckCircle,
  FiShield,
  FiPlus,
  FiEye,
  FiTrendingUp,
  FiTag,
  FiAlertCircle,
  FiRefreshCw,
} from 'react-icons/fi';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

export const VendorProductEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  const isEdit = Boolean(id);

  const [activeTab, setActiveTab] = useState('basic'); // 'basic' | 'pricing' | 'media' | 'specs'
  const [categories, setCategories] = useState([]);
  const [fetchingData, setFetchingData] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [tagInput, setTagInput] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    category: '',
    subcategory: '',
    brand: '',
    countInStock: 25,
    description: '',
    images: [],
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

  // Fetch categories & existing product (if edit mode)
  useEffect(() => {
    const initPage = async () => {
      try {
        const catRes = await api.get('/categories');
        const loadedCategories = catRes.data.categories || [];
        setCategories(loadedCategories);

        if (isEdit) {
          setFetchingData(true);
          const prodRes = await api.get(`/products/${id}`);
          const p = prodRes.data.product;
          if (p) {
            setFormData({
              name: p.name || '',
              price: p.price || '',
              originalPrice: p.originalPrice || '',
              category: p.category?._id || p.category || (loadedCategories[0]?._id || ''),
              subcategory: p.subcategory || '',
              brand: p.brand || '',
              countInStock: p.countInStock !== undefined ? p.countInStock : 20,
              description: p.description || '',
              images: p.images || [],
              isFeatured: Boolean(p.isFeatured),
              isTrending: Boolean(p.isTrending),
              isNewArrival: Boolean(p.isNewArrival),
              isFlashDeal: Boolean(p.isFlashDeal),
              tags: p.tags || [],
              specifications: p.specifications?.length > 0 ? p.specifications : [{ name: 'Warranty', value: '1-Year Manufacturer' }],
            });
          }
        } else {
          setFormData((prev) => ({
            ...prev,
            images: [],
            category: loadedCategories[0]?._id || '',
          }));
        }
      } catch (err) {
        addToast(err.response?.data?.message || 'Failed to load product details', 'error');
        if (isEdit) navigate('/products');
      } finally {
        setFetchingData(false);
      }
    };

    initPage();
  }, [id, isEdit]);

  // Discount percentage calculation
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
    if (e) e.preventDefault();
    if (!formData.name.trim() || !formData.price || !formData.category || !formData.description.trim()) {
      addToast('Please complete all required fields (Name, Price, Category, Description)', 'error');
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/vendor/products/${id}`, formData);
        addToast('Product updated successfully!', 'success');
      } else {
        await api.post('/vendor/products', formData);
        addToast('Product submitted! It is under review by Admin before going live.', 'success');
      }
      navigate('/products');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save product', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-bold text-slate-500">Loading product information...</p>
      </div>
    );
  }

  const selectedCategoryName = categories.find((c) => c._id === formData.category)?.name || 'General';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-300">

      {/* Top Breadcrumb & Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-orange-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Link to="/products" className="hover:text-orange-600 flex items-center gap-1 transition-colors">
              <FiArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Products</span>
            </Link>
            <span>/</span>
            <span className="text-orange-600 font-extrabold">
              {isEdit ? 'Edit Product' : 'New Listing'}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/25 shrink-0">
              <FiBox className="w-5 h-5" />
            </div>
            <span>{isEdit ? `Edit: ${formData.name || 'Product'}` : 'List New Store Product'}</span>
          </h1>
        </div>

        {/* Top Save & Cancel Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all cursor-pointer shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black rounded-xl shadow-md shadow-orange-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <FiSave className="w-4 h-4" />
            <span>{saving ? 'Saving...' : isEdit ? 'Update Product' : 'Publish & Submit for Approval'}</span>
          </button>
        </div>
      </div>

      {/* Admin Approval Notice Banner */}
      {!isEdit && (
        <div className="p-4 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-2xl border border-amber-200/80 flex items-start gap-3 shadow-xs">
          <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 mt-0.5 shadow-xs">
            <FiShield className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <span className="font-extrabold text-amber-950 text-sm block">Admin Moderation & Approval Workflow</span>
            <span className="text-amber-800 font-medium leading-relaxed">
              Once submitted, this product will be reviewed by the platform administrator and will appear live on the customer marketplace upon approval.
            </span>
          </div>
        </div>
      )}

      {/* Main Grid: Form Sections (Left 8 Cols) + Live Product Preview (Right 4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT: 4-Step Form Tabs (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">

          {/* Navigation Stepper Tabs */}
          <div className="glass-card p-1.5 flex items-center gap-1.5 overflow-x-auto shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab('basic')}
              className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'basic'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FiLayers className="w-4 h-4" />
              <span>1. Basic Details</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pricing')}
              className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'pricing'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                  : 'text-slate-600 hover:bg-slate-100'
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
              className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'media'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FiImage className="w-4 h-4" />
              <span>3. Photo Gallery ({formData.images.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('specs')}
              className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'specs'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FiList className="w-4 h-4" />
              <span>4. Specs & Tags</span>
            </button>
          </div>

          {/* TAB 1: BASIC DETAILS */}
          {activeTab === 'basic' && (
            <div className="glass-card p-6 sm:p-7 space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-orange-100 pb-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
                  Step 1: Core Product Information
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Give your product a clear, descriptive title and assign it to the appropriate store category.
                </p>
              </div>

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
                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-bold transition-all shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-800 block mb-1">
                    Primary Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-3 bg-white border border-slate-200 focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-bold cursor-pointer transition-all shadow-2xs"
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
                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-bold transition-all shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-800 block mb-1">Brand / Manufacturer</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Nexus Sonic, Sony, Bosch"
                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-bold transition-all shadow-2xs"
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
                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-bold transition-all shadow-2xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-extrabold text-slate-800 block mb-1">
                    Product Description & Highlights <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe materials, key features, dimensions, usage instructions, packaging contents..."
                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-medium transition-all shadow-2xs leading-relaxed"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('pricing')}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
                >
                  Next: Pricing & Deals &rarr;
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: PRICING & STOCK */}
          {activeTab === 'pricing' && (
            <div className="glass-card p-6 sm:p-7 space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-orange-100 pb-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
                  Step 2: Pricing, MRP & Promotional Flags
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Set customer selling price, original MRP, and boost visibility across storefront collections.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Selling Price */}
                <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-200 space-y-2">
                  <label className="text-xs font-black text-orange-950 flex items-center justify-between">
                    <span>Final Selling Price (₹) *</span>
                    <span className="text-[10px] text-orange-600 uppercase font-black">Customer Pays</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-slate-400">₹</span>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="2499"
                      className="w-full pl-8 pr-4 py-3 bg-white border border-orange-200 focus:border-orange-500 rounded-xl text-base text-slate-900 outline-none font-black shadow-2xs"
                    />
                  </div>
                </div>

                {/* Original MRP Price */}
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
                      className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 focus:border-orange-500 rounded-xl text-base text-slate-900 outline-none font-bold shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Promotional Placement Flags */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Storefront Badges & Collection Flags
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 hover:border-orange-300 cursor-pointer transition-all shadow-2xs">
                    <input
                      type="checkbox"
                      checked={formData.isNewArrival}
                      onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                      className="w-4 h-4 text-orange-500 rounded focus:ring-0 accent-orange-500"
                    />
                    <span className="text-xs font-bold text-slate-800">✨ New Arrival</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 hover:border-orange-300 cursor-pointer transition-all shadow-2xs">
                    <input
                      type="checkbox"
                      checked={formData.isTrending}
                      onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                      className="w-4 h-4 text-orange-500 rounded focus:ring-0 accent-orange-500"
                    />
                    <span className="text-xs font-bold text-slate-800">🔥 Trending Item</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 hover:border-orange-300 cursor-pointer transition-all shadow-2xs">
                    <input
                      type="checkbox"
                      checked={formData.isFlashDeal}
                      onChange={(e) => setFormData({ ...formData, isFlashDeal: e.target.checked })}
                      className="w-4 h-4 text-orange-500 rounded focus:ring-0 accent-orange-500"
                    />
                    <span className="text-xs font-bold text-slate-800">⚡ Flash Deal</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 hover:border-orange-300 cursor-pointer transition-all shadow-2xs">
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

              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('basic')}
                  className="px-5 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
                >
                  &larr; Back to Details
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('media')}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
                >
                  Next: Photo Gallery &rarr;
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: PHOTO GALLERY */}
          {activeTab === 'media' && (
            <div className="glass-card p-6 sm:p-7 space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-orange-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
                    Step 3: High-Resolution Photo Gallery
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Upload images from your computer or paste direct URLs. The first image serves as the main catalog cover.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-orange-100 text-orange-800 text-xs font-black">
                  {formData.images.length} Photos
                </span>
              </div>

              {/* Cloud Drag and Drop Upload Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`p-8 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                  uploadingFiles
                    ? 'bg-orange-50 border-orange-400 animate-pulse'
                    : 'bg-white hover:bg-orange-50/40 border-slate-300 hover:border-orange-500 shadow-2xs'
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
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-100 to-amber-100 text-orange-600 flex items-center justify-center shadow-xs border border-orange-200">
                  <FiUploadCloud className="w-7 h-7" />
                </div>
                <div className="text-center space-y-1">
                  <div className="text-sm font-black text-slate-900">
                    {uploadingFiles ? 'Uploading images to Cloud CDN...' : 'Click or Drag & Drop Photos Here'}
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    Supports JPG, PNG, and WebP images (Up to 10MB each)
                  </div>
                </div>
              </div>

              {/* Direct Image URL Option */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Or Add Image via Web URL:</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 px-4 py-2.5 bg-white border border-slate-200 focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-medium shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0 shadow-sm"
                  >
                    Add URL
                  </button>
                </div>
              </div>

              {/* Photos Previews Grid */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                  {formData.images.map((url, idx) => (
                    <div
                      key={idx}
                      className={`relative aspect-square rounded-2xl overflow-hidden border-2 group shadow-2xs bg-slate-100 ${
                        idx === 0 ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-slate-200'
                      }`}
                    >
                      <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />

                      {idx === 0 ? (
                        <div className="absolute top-2 left-2 bg-orange-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-lg shadow-sm">
                          ★ Main Cover
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetCoverImage(idx)}
                          className="absolute top-2 left-2 bg-slate-900/85 text-white text-[9px] font-bold px-2 py-0.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                        >
                          Set Cover
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-2 right-2 bg-rose-600 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm hover:bg-rose-700"
                        title="Delete photo"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('pricing')}
                  className="px-5 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
                >
                  &larr; Back to Pricing
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('specs')}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
                >
                  Next: Specs & Tags &rarr;
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: SPECS & TAGS */}
          {activeTab === 'specs' && (
            <div className="glass-card p-6 sm:p-7 space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-orange-100 pb-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
                  Step 4: Specifications & Search Keywords
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Highlight key technical specs and add searchable hashtags to improve discoverability.
                </p>
              </div>

              {/* Technical Specifications */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-800">
                    Technical Specifications & Highlights
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAddSpec('', '')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl border border-orange-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    <FiPlus className="w-3.5 h-3.5" />
                    <span>Add Custom Row</span>
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] text-slate-400 font-bold">Quick Presets:</span>
                  {['Color', 'Material', 'Warranty', 'Dimensions', 'Weight', 'Package Contents'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleAddSpec(preset, '')}
                      className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>

                {/* Specs List */}
                <div className="space-y-3 pt-2">
                  {formData.specifications.map((spec, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Feature Name (e.g. Battery Life)"
                        value={spec.name}
                        onChange={(e) => handleSpecChange(index, 'name', e.target.value)}
                        className="w-1/3 px-4 py-2.5 bg-white border border-slate-200 focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-bold shadow-2xs"
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g. Up to 40 Hours)"
                        value={spec.value}
                        onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                        className="flex-1 px-4 py-2.5 bg-white border border-slate-200 focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-medium shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(index)}
                        className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Remove row"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Search Hashtag Tags */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <label className="text-xs font-extrabold text-slate-800 block">
                  Search Hashtags & Keywords
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
                    className="flex-1 px-4 py-2.5 bg-white border border-slate-200 focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-medium shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Add Tag
                  </button>
                </div>

                {formData.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {formData.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-50 text-orange-800 border border-orange-200 text-xs font-bold"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-rose-600 cursor-pointer font-black"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('media')}
                  className="px-5 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
                >
                  &larr; Back to Photos
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black rounded-xl shadow-md shadow-orange-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <FiCheckCircle className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Submit Product for Review'}</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT: Live Storefront Card Preview (4 Cols) */}
        <div className="lg:col-span-4 space-y-4 sticky top-6">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FiEye className="text-orange-500" />
              <span>Live Customer Store Preview</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Interactive
            </span>
          </div>

          <div className="glass-card p-4 rounded-3xl border border-slate-200/80 shadow-md space-y-3.5 bg-white">
            {/* Image Preview Container */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              {formData.images && formData.images.length > 0 ? (
                <img
                  src={formData.images[0]}
                  alt="Product Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400 gap-2 p-4 text-center">
                  <FiImage className="w-10 h-10 text-slate-300" />
                  <span className="text-xs font-bold text-slate-500">No Photo Uploaded</span>
                  <span className="text-[10px] text-slate-400">Add product images in Step 3</span>
                </div>
              )}

              {/* Promo Badges */}
              <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                {formData.isNewArrival && (
                  <span className="px-2.5 py-0.5 bg-emerald-600 text-white text-[10px] font-extrabold rounded-md shadow-xs">
                    NEW
                  </span>
                )}
                {formData.isFlashDeal && (
                  <span className="px-2.5 py-0.5 bg-rose-600 text-white text-[10px] font-extrabold rounded-md shadow-xs">
                    ⚡ FLASH DEAL
                  </span>
                )}
                {formData.isTrending && (
                  <span className="px-2.5 py-0.5 bg-amber-500 text-white text-[10px] font-extrabold rounded-md shadow-xs">
                    🔥 HOT
                  </span>
                )}
              </div>

              {discountPercent > 0 && (
                <div className="absolute top-2.5 right-2.5 bg-rose-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-lg shadow-sm">
                  {discountPercent}% OFF
                </div>
              )}
            </div>

            {/* Category & Brand */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
              <span className="text-orange-600 font-bold uppercase tracking-wider">
                {selectedCategoryName}
              </span>
              <span>{formData.brand || 'Brand Name'}</span>
            </div>

            {/* Title */}
            <h3 className="font-extrabold text-sm text-slate-900 line-clamp-2 leading-snug">
              {formData.name || 'Your Product Title Will Appear Here'}
            </h3>

            {/* Price section */}
            <div className="pt-2 border-t border-slate-100 flex items-baseline gap-2">
              <span className="text-lg font-black text-slate-900 font-mono">
                ₹{formData.price ? Number(formData.price).toLocaleString('en-IN') : '0'}
              </span>
              {formData.originalPrice && Number(formData.originalPrice) > Number(formData.price) && (
                <span className="text-xs text-slate-400 line-through font-mono">
                  ₹{Number(formData.originalPrice).toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Stock status */}
            <div className="text-[11px] font-bold text-slate-600 flex items-center justify-between pt-1">
              <span>Stock Status:</span>
              <span className={formData.countInStock > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                {formData.countInStock > 0 ? `In Stock (${formData.countInStock} units)` : 'Out of Stock'}
              </span>
            </div>

            {/* Search Tags Preview */}
            {formData.tags?.length > 0 && (
              <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                {formData.tags.map((t, idx) => (
                  <span key={idx} className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default VendorProductEditorPage;
