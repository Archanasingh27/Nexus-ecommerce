import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiPlus, FiTrash2, FiSave, FiImage, FiUploadCloud, FiCheckCircle } from 'react-icons/fi';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

export const VendorProductModal = ({ isOpen, onClose, product, categories = [], onSaved }) => {
  const { addToast } = useToast();
  const fileInputRef = useRef(null);
  const isEdit = Boolean(product?._id);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    category: '',
    brand: '',
    countInStock: 15,
    description: '',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'],
    isFeatured: false,
    isTrending: true,
    isNewArrival: true,
    isFlashDeal: false,
    specifications: [
      { name: 'Color', value: 'Standard' },
      { name: 'Warranty', value: '1-Year Manufacturer Warranty' },
    ],
  });

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
        brand: product.brand || '',
        countInStock: product.countInStock !== undefined ? product.countInStock : 15,
        description: product.description || '',
        images: product.images?.length > 0 ? product.images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'],
        isFeatured: Boolean(product.isFeatured),
        isTrending: Boolean(product.isTrending),
        isNewArrival: Boolean(product.isNewArrival),
        isFlashDeal: Boolean(product.isFlashDeal),
        specifications: product.specifications?.length > 0 ? product.specifications : [{ name: 'Warranty', value: '1-Year Manufacturer Warranty' }],
      });
    } else {
      setFormData({
        name: '',
        price: '',
        originalPrice: '',
        category: categories[0]?._id || '',
        brand: '',
        countInStock: 20,
        description: '',
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'],
        isFeatured: false,
        isTrending: true,
        isNewArrival: true,
        isFlashDeal: false,
        specifications: [
          { name: 'Warranty', value: '1-Year Manufacturer' },
          { name: 'Condition', value: 'Brand New In Box' },
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
    if (!formData.name || !formData.price || !formData.category || !formData.description) {
      addToast('Please complete all required product fields', 'error');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/vendor/products/${product._id}`, formData);
        addToast('Product successfully updated!', 'success');
      } else {
        await api.post('/vendor/products', formData);
        addToast('Product created and listed in your store!', 'success');
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
        <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 z-10 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                {isEdit ? `Edit Product: ${product.name}` : 'List New Store Product'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">Add product images, pricing, stock count and specifications</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer">
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Bosch Heavy Rotary Hammer 800W"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Brand Name</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="e.g. Bosch / Apex Tools"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-bold"
                />
              </div>
            </div>

            {/* Category & Pricing */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-bold cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Sale Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="2499"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Original Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  placeholder="2999"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-bold"
                />
              </div>
            </div>

            {/* Stock & Description */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Available Stock Count *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.countInStock}
                  onChange={(e) => setFormData({ ...formData, countInStock: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">Description *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product highlights, specifications, material grade..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-medium"
                />
              </div>
            </div>

            {/* Images & Direct File Upload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Product Photo Gallery</label>
                <span className="text-[10px] text-slate-400 font-bold">{formData.images.length} Photos Added</span>
              </div>

              {/* Direct File Dropzone / Uploader */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`p-4 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  uploadingFiles
                    ? 'bg-orange-50/50 border-orange-300 animate-pulse'
                    : 'bg-slate-50 hover:bg-orange-50/40 border-slate-200 hover:border-orange-300'
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
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-xs">
                  <FiUploadCloud className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <div className="text-xs font-bold text-slate-800">
                    {uploadingFiles ? 'Uploading images to Cloud CDN...' : 'Click to Browse or Drag & Drop Product Photos'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    Supports JPEG, PNG, WebP up to 10MB per file (Select multiple)
                  </div>
                </div>
              </div>

              {/* Or paste URL */}
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Or paste an image web URL..."
                  className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-medium"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Add URL
                </button>
              </div>

              {/* Gallery Previews */}
              {formData.images.length > 0 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1 pt-1">
                  {formData.images.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-200 shrink-0 group shadow-xs"
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <div className="absolute top-1 left-1 bg-orange-500 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md shadow-xs">
                          Cover
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute inset-0 bg-rose-950/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Remove photo"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <FiSave className="w-4 h-4" />
                <span>{loading ? 'Saving...' : isEdit ? 'Update Product' : 'List in Store'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
