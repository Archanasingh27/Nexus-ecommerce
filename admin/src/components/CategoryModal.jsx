import React, { useState, useEffect } from 'react';
import { FiX, FiSave } from 'react-icons/fi';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

export const CategoryModal = ({ isOpen, onClose, category, onSaved }) => {
  const { addToast } = useToast();
  const isEdit = Boolean(category?._id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600',
    icon: 'grid',
    isFeatured: true,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        image: category.image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600',
        icon: category.icon || 'grid',
        isFeatured: category.isFeatured !== undefined ? category.isFeatured : true,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600',
        icon: 'grid',
        isFeatured: true,
      });
    }
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      addToast('Category name is required', 'error');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/categories/${category._id}`, formData);
        addToast('Category updated successfully!', 'success');
      } else {
        await api.post('/categories', formData);
        addToast('Category created successfully!', 'success');
      }
      onSaved();
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save category', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div onClick={onClose} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 z-10 space-y-6">
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-lg font-black text-slate-900">
              {isEdit ? `Edit Category: ${category.name}` : 'Create New Category'}
            </h2>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Category Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Smart Wearables"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-xl text-xs text-slate-900 outline-none font-bold placeholder-slate-400 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief category summary..."
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-xl text-xs text-slate-900 outline-none font-medium placeholder-slate-400 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Header Image URL</label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-xl text-xs text-slate-900 outline-none font-medium placeholder-slate-400 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Icon Identifier</label>
              <select
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-xl text-xs text-slate-900 outline-none font-bold cursor-pointer transition-all"
              >
                <option value="headphones">Headphones & Audio</option>
                <option value="smartphone">Smartphones & Tech</option>
                <option value="home">Smart Home & IoT</option>
                <option value="gamepad">Gaming Gear</option>
                <option value="shirt">Fashion & Apparel</option>
                <option value="footprints">Footwear & Shoes</option>
                <option value="watch">Smartwatches</option>
                <option value="camera">Photography & Drones</option>
                <option value="grid">Default Grid</option>
              </select>
            </div>

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
                <FiSave className="w-4 h-4 text-black" />
                <span>{loading ? 'Saving...' : isEdit ? 'Update Category' : 'Create Category'}</span>
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};
