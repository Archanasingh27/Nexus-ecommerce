import React, { useState, useEffect } from 'react';
import { FiX, FiPlus, FiTrash2, FiSave, FiImage } from 'react-icons/fi';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

export const ProductModal = ({ isOpen, onClose, product, categories = [], onSaved }) => {
  const { addToast } = useToast();
  const isEdit = Boolean(product?._id);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    category: '',
    vendor: '',
    brand: 'Nexus Labs',
    countInStock: 20,
    description: '',
    images: [],
    isFeatured: false,
    isTrending: false,
    isNewArrival: true,
    isFlashDeal: false,
    specifications: [
      { name: 'Color', value: 'Space Gray' },
      { name: 'Warranty', value: '2-Year Brand Protection' },
    ],
  });

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await api.get('/admin/vendors');
        setVendors(res.data.vendors || []);
      } catch (err) {
        console.error('Failed to load vendors', err);
      }
    };
    if (isOpen) {
      fetchVendors();
    }
  }, [isOpen]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price || '',
        originalPrice: product.originalPrice || '',
        category: product.category?._id || product.category || (categories[0]?._id || ''),
        vendor: product.vendor?._id || product.vendor || '',
        brand: product.brand || 'Nexus Labs',
        countInStock: product.countInStock !== undefined ? product.countInStock : 20,
        description: product.description || '',
        images: product.images?.length > 0 ? product.images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'],
        isFeatured: Boolean(product.isFeatured),
        isTrending: Boolean(product.isTrending),
        isNewArrival: Boolean(product.isNewArrival),
        isFlashDeal: Boolean(product.isFlashDeal),
        specifications: product.specifications?.length > 0 ? product.specifications : [{ name: 'Warranty', value: '2-Year Official' }],
      });
    } else {
      setFormData({
        name: '',
        price: '',
        originalPrice: '',
        category: categories[0]?._id || '',
        vendor: '',
        brand: 'Nexus Labs',
        countInStock: 25,
        description: '',
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'],
        isFeatured: false,
        isTrending: true,
        isNewArrival: true,
        isFlashDeal: false,
        specifications: [
          { name: 'Model Year', value: '2026' },
          { name: 'Warranty', value: '2-Year Official' },
        ],
      });
    }
  }, [product, categories, isOpen]);

  if (!isOpen) return null;

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setFormData({ ...formData, images: [...formData.images, newImageUrl.trim()] });
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index) => {
    setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) });
  };

  const handleAddSpec = () => {
    setFormData({
      ...formData,
      specifications: [...formData.specifications, { name: '', value: '' }],
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
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category || !formData.vendor || !formData.description) {
      addToast('Please complete all required product fields, including merchant vendor', 'error');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/products/${product._id}`, formData);
        addToast('Product successfully updated!', 'success');
      } else {
        await api.post('/products', formData);
        addToast('New product created and listed in store!', 'success');
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
      <div onClick={onClose} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 z-10 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                {isEdit ? `Edit Product: ${product.name}` : 'Create New Catalog Product'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">Manage catalog metadata, stock, pricing, and specs</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer">
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Apex Mechanical Keyboard"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-xl text-xs text-slate-900 outline-none font-medium transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Brand Name</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="e.g. Nexus Sound"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-xl text-xs text-slate-900 outline-none font-medium transition-colors"
                />
              </div>
            </div>

            {/* Category, Vendor & Pricing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-xl text-xs text-slate-900 outline-none font-bold cursor-pointer transition-colors"
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Merchant Seller / Vendor *</label>
                <select
                  required
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-xl text-xs text-slate-900 outline-none font-bold cursor-pointer transition-colors"
                >
                  <option value="" disabled>Select Authorized Vendor Store...</option>
                  {vendors.map((v) => (
                    <option key={v._id} value={v._id}>
                      🏪 {v.storeName || v.name} ({v.vendorStatus === 'approved' ? 'Approved' : v.vendorStatus})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Sale Price (₹) *</label>
                <input
                  type="number"
                  step="1"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="2499"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-xl text-xs text-slate-900 outline-none font-medium transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Original Price (₹)</label>
                <input
                  type="number"
                  step="1"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  placeholder="2999"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-xl text-xs text-slate-900 outline-none font-medium transition-colors"
                />
              </div>
            </div>

            {/* Stock & Description */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Initial Stock Count *</label>
                <input
                  type="number"
                  required
                  value={formData.countInStock}
                  onChange={(e) => setFormData({ ...formData, countInStock: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-xl text-xs text-slate-900 outline-none font-medium transition-colors"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">Description *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product highlights, specifications and features..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-xl text-xs text-slate-900 outline-none font-medium transition-colors"
                />
              </div>
            </div>

            {/* Image Gallery URLs */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Product Images (URLs)</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Paste Unsplash image URL..."
                  className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-xl text-xs text-slate-900 outline-none font-medium transition-colors"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="px-4 py-2 bg-[#fae125] hover:bg-yellow-300 text-slate-950 font-bold text-xs rounded-xl shadow-2xs border border-yellow-400 transition-all cursor-pointer"
                >
                  Add Image
                </button>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2">
                {formData.images.map((url, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0 group shadow-2xs">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute inset-0 bg-rose-900/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Flags */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="accent-[#fae125] rounded w-4 h-4 cursor-pointer"
                />
                <span>Featured Hero</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={formData.isTrending}
                  onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                  className="accent-[#fae125] rounded w-4 h-4 cursor-pointer"
                />
                <span>Trending Drops</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={formData.isNewArrival}
                  onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                  className="accent-[#fae125] rounded w-4 h-4 cursor-pointer"
                />
                <span>New Arrival</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={formData.isFlashDeal}
                  onChange={(e) => setFormData({ ...formData, isFlashDeal: e.target.checked })}
                  className="accent-[#fae125] rounded w-4 h-4 cursor-pointer"
                />
                <span>Flash Deal</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-[#fae125] hover:bg-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow-xs border border-yellow-400 flex items-center gap-2 transition-all cursor-pointer"
              >
                <FiSave className="w-4 h-4" />
                <span>{loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}</span>
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
};
