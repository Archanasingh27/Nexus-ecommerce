import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  FiArrowLeft,
  FiBox,
  FiLayers,
  FiDollarSign,
  FiImage,
  FiList,
  FiTrash2,
  FiSave,
  FiCheckCircle,
  FiPlus,
  FiEye,
  FiTag,
  FiUserCheck,
} from 'react-icons/fi';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

export const AdminProductEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const isEdit = Boolean(id);

  const [activeTab, setActiveTab] = useState('basic'); // 'basic' | 'pricing' | 'media' | 'specs'
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [fetchingData, setFetchingData] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    category: '',
    vendor: '',
    brand: 'Nexus Labs',
    countInStock: 25,
    description: '',
    images: [],
    isFeatured: false,
    isTrending: true,
    isNewArrival: true,
    isFlashDeal: false,
    specifications: [
      { name: 'Model Year', value: '2026' },
      { name: 'Warranty', value: '2-Year Official Brand Protection' },
    ],
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [catRes, venRes] = await Promise.all([
          api.get('/categories'),
          api.get('/admin/vendors'),
        ]);

        const loadedCats = catRes.data.categories || [];
        const loadedVens = venRes.data.vendors || [];
        setCategories(loadedCats);
        setVendors(loadedVens);

        if (isEdit) {
          setFetchingData(true);
          const prodRes = await api.get(`/products/${id}`);
          const p = prodRes.data.product;
          if (p) {
            setFormData({
              name: p.name || '',
              price: p.price || '',
              originalPrice: p.originalPrice || '',
              category: p.category?._id || p.category || (loadedCats[0]?._id || ''),
              vendor: p.vendor?._id || p.vendor || (loadedVens[0]?._id || ''),
              brand: p.brand || 'Nexus Labs',
              countInStock: p.countInStock !== undefined ? p.countInStock : 20,
              description: p.description || '',
              images: p.images || [],
              isFeatured: Boolean(p.isFeatured),
              isTrending: Boolean(p.isTrending),
              isNewArrival: Boolean(p.isNewArrival),
              isFlashDeal: Boolean(p.isFlashDeal),
              specifications: p.specifications?.length > 0 ? p.specifications : [{ name: 'Warranty', value: '2-Year Official' }],
            });
          }
        } else {
          setFormData((prev) => ({
            ...prev,
            images: [],
            category: loadedCats[0]?._id || '',
            vendor: loadedVens[0]?._id || '',
          }));
        }
      } catch (err) {
        addToast(err.response?.data?.message || 'Failed to load editor data', 'error');
        if (isEdit) navigate('/products');
      } finally {
        setFetchingData(false);
      }
    };

    loadInitialData();
  }, [id, isEdit]);

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

  const handleRemoveImage = (index) => {
    if (formData.images.length <= 1) {
      addToast('At least one product image is required', 'info');
      return;
    }
    setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) });
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

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name.trim() || !formData.price || !formData.category || !formData.vendor || !formData.description.trim()) {
      addToast('Please complete all required fields (Name, Price, Category, Vendor, Description)', 'error');
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/products/${id}`, formData);
        addToast(`Product "${formData.name}" updated successfully!`, 'success');
      } else {
        await api.post('/products', formData);
        addToast(`New product "${formData.name}" created and published!`, 'success');
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
        <p className="text-xs font-bold text-slate-500">Loading catalog product...</p>
      </div>
    );
  }

  const selectedCategoryName = categories.find((c) => c._id === formData.category)?.name || 'General';
  const selectedVendor = vendors.find((v) => v._id === formData.vendor);
  const selectedVendorName = selectedVendor?.storeName || selectedVendor?.name || 'Authorized Merchant';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-300">

      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-orange-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Link to="/products" className="hover:text-orange-600 flex items-center gap-1 transition-colors">
              <FiArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Products</span>
            </Link>
            <span>/</span>
            <span className="text-orange-600 font-extrabold">
              {isEdit ? 'Edit Product' : 'Create Product'}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/25 shrink-0">
              <FiBox className="w-5 h-5" />
            </div>
            <span>{isEdit ? `Edit: ${formData.name || 'Product'}` : 'Create Platform Catalog Product'}</span>
          </h1>
        </div>

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
            <span>{saving ? 'Saving...' : isEdit ? 'Update Product' : 'Publish to Storefront'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Tabs & Form (8 cols) + Live Preview Card (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT FORM */}
        <div className="lg:col-span-8 space-y-6">

          {/* Stepper Tabs */}
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
              <span>2. Pricing & Vendor</span>
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
              <span>3. Images ({formData.images.length})</span>
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
              <span>4. Specs & Flags</span>
            </button>
          </div>

          {/* TAB 1: BASIC DETAILS */}
          {activeTab === 'basic' && (
            <div className="glass-card p-6 sm:p-7 space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-orange-100 pb-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
                  Step 1: Product Title, Category & Stock
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Set the item name, category taxonomy, brand, and warehouse inventory count.
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
                    placeholder="e.g. Apex Mechanical Pro Keyboard"
                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-bold transition-all shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-800 block mb-1">
                    Category <span className="text-rose-500">*</span>
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
                  <label className="text-xs font-extrabold text-slate-800 block mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Nexus Labs, Sony, Apple"
                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-bold transition-all shadow-2xs"
                  />
                </div>

                <div className="sm:col-span-2">
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
                    placeholder="Detailed description, specifications, box contents, warranty details..."
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
                  Next: Pricing & Vendor &rarr;
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: PRICING & VENDOR */}
          {activeTab === 'pricing' && (
            <div className="glass-card p-6 sm:p-7 space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-orange-100 pb-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
                  Step 2: Pricing & Authorized Vendor Store Assignment
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Assign this item to an authorized vendor merchant and set the selling / MRP price.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-extrabold text-slate-800 block mb-1">
                    Authorized Vendor Merchant <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-bold cursor-pointer transition-all shadow-2xs"
                  >
                    <option value="" disabled>Select Vendor Store...</option>
                    {vendors.map((v) => (
                      <option key={v._id} value={v._id}>
                        🏪 {v.storeName || v.name} ({v.vendorStatus === 'approved' ? 'Approved Partner' : v.vendorStatus})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Selling Price */}
                  <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-200 space-y-2">
                    <label className="text-xs font-black text-orange-950 flex items-center justify-between">
                      <span>Customer Selling Price (₹) *</span>
                      <span className="text-[10px] text-orange-600 uppercase font-black">Final Price</span>
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
                  Next: Images & Gallery &rarr;
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: IMAGES */}
          {activeTab === 'media' && (
            <div className="glass-card p-6 sm:p-7 space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-orange-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
                    Step 3: High-Resolution Product Images
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Add product image links. The first image is the primary store listing photo.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-orange-100 text-orange-800 text-xs font-black">
                  {formData.images.length} Photos
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 px-4 py-3 bg-white border border-slate-200 focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-medium shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0 shadow-sm"
                  >
                    Add Image URL
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                  {formData.images.map((url, idx) => (
                    <div
                      key={idx}
                      className={`relative aspect-square rounded-2xl overflow-hidden border-2 group shadow-2xs bg-slate-100 ${
                        idx === 0 ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-slate-200'
                      }`}
                    >
                      <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <div className="absolute top-2 left-2 bg-orange-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-lg shadow-sm">
                          ★ Main Cover
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-2 right-2 bg-rose-600 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm hover:bg-rose-700"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

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
                  Next: Specs & Flags &rarr;
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: SPECS & FLAGS */}
          {activeTab === 'specs' && (
            <div className="glass-card p-6 sm:p-7 space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-orange-100 pb-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
                  Step 4: Specifications & Storefront Promotion Flags
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Set technical attributes and select special collection placements.
                </p>
              </div>

              {/* Specs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-800">
                    Product Specifications
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAddSpec('', '')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl border border-orange-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    <FiPlus className="w-3.5 h-3.5" />
                    <span>Add Custom Row</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {formData.specifications.map((spec, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Key (e.g. Warranty)"
                        value={spec.name}
                        onChange={(e) => handleSpecChange(index, 'name', e.target.value)}
                        className="w-1/3 px-4 py-2.5 bg-white border border-slate-200 focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-bold shadow-2xs"
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g. 2-Year Official Protection)"
                        value={spec.value}
                        onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                        className="flex-1 px-4 py-2.5 bg-white border border-slate-200 focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-medium shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(index)}
                        className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Promotional Flags */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Storefront Badges & Placement
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
                    <span className="text-xs font-bold text-slate-800">⭐ Featured Hero</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('media')}
                  className="px-5 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
                >
                  &larr; Back to Images
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black rounded-xl shadow-md shadow-orange-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <FiCheckCircle className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create & Publish Product'}</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT PREVIEW CARD */}
        <div className="lg:col-span-4 space-y-4 sticky top-6">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FiEye className="text-orange-500" />
              <span>Live Storefront Preview</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Interactive
            </span>
          </div>

          <div className="glass-card p-4 rounded-3xl border border-slate-200/80 shadow-md space-y-3.5 bg-white">
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

            <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
              <span className="text-orange-600 font-bold uppercase tracking-wider">
                {selectedCategoryName}
              </span>
              <span>{formData.brand || 'Brand'}</span>
            </div>

            <h3 className="font-extrabold text-sm text-slate-900 line-clamp-2 leading-snug">
              {formData.name || 'Your Product Title'}
            </h3>

            <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] font-semibold text-amber-900 flex items-center gap-1.5">
              <span>🏪 Seller:</span>
              <span className="font-bold truncate">{selectedVendorName}</span>
            </div>

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

            <div className="text-[11px] font-bold text-slate-600 flex items-center justify-between pt-1">
              <span>Stock Status:</span>
              <span className={formData.countInStock > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                {formData.countInStock > 0 ? `In Stock (${formData.countInStock} units)` : 'Out of Stock'}
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminProductEditorPage;
