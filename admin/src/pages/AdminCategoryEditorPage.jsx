import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  FiArrowLeft,
  FiGrid,
  FiSave,
  FiImage,
  FiCheckCircle,
  FiLayers,
  FiTag,
  FiInfo,
  FiEye,
} from 'react-icons/fi';
import {
  RiHeadphoneLine,
  RiSmartphoneLine,
  RiHome4Line,
  RiGamepadLine,
  RiTShirtLine,
  RiFootprintLine,
  RiTimeLine,
  RiCameraLine,
} from 'react-icons/ri';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

const iconMap = {
  headphones: <RiHeadphoneLine className="w-5 h-5" />,
  smartphone: <RiSmartphoneLine className="w-5 h-5" />,
  home: <RiHome4Line className="w-5 h-5" />,
  gamepad: <RiGamepadLine className="w-5 h-5" />,
  shirt: <RiTShirtLine className="w-5 h-5" />,
  footprints: <RiFootprintLine className="w-5 h-5" />,
  watch: <RiTimeLine className="w-5 h-5" />,
  camera: <RiCameraLine className="w-5 h-5" />,
  grid: <FiGrid className="w-5 h-5" />,
};

export const AdminCategoryEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    icon: 'grid',
    isFeatured: true,
  });

  const [fetchingData, setFetchingData] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const fetchCategory = async () => {
        setFetchingData(true);
        try {
          const { data } = await api.get('/categories');
          const found = (data.categories || []).find((c) => c._id === id);
          if (found) {
            setFormData({
              name: found.name || '',
              description: found.description || '',
              image: found.image || '',
              icon: found.icon || 'grid',
              isFeatured: found.isFeatured !== undefined ? found.isFeatured : true,
            });
          } else {
            addToast('Category not found', 'error');
            navigate('/categories');
          }
        } catch (err) {
          addToast('Failed to load category data', 'error');
          navigate('/categories');
        } finally {
          setFetchingData(false);
        }
      };
      fetchCategory();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast('Category name is required', 'error');
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/categories/${id}`, formData);
        addToast(`Category "${formData.name}" updated successfully!`, 'success');
      } else {
        await api.post('/categories', formData);
        addToast(`Category "${formData.name}" created successfully!`, 'success');
      }
      navigate('/categories');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save category', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-bold text-slate-500">Loading category details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-300">

      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Link to="/categories" className="hover:text-emerald-600 flex items-center gap-1 transition-colors">
              <FiArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Categories</span>
            </Link>
            <span>/</span>
            <span className="text-emerald-600 font-extrabold">
              {isEdit ? 'Edit Category' : 'New Category'}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 shrink-0">
              <FiGrid className="w-5 h-5" />
            </div>
            <span>{isEdit ? `Edit: ${formData.name || 'Category'}` : 'Create New Store Category'}</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/categories')}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all cursor-pointer shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md shadow-emerald-500/25 border border-emerald-500 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <FiSave className="w-4 h-4" />
            <span>{saving ? 'Saving...' : isEdit ? 'Update Category' : 'Publish Category'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Form (7 cols) + Live Preview Card (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT FORM */}
        <div className="lg:col-span-7 glass-card p-6 sm:p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-extrabold text-slate-800 block mb-1">
                Category Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Smart Wearables, Consumer Electronics"
                className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-xs text-slate-900 outline-none font-bold transition-all shadow-2xs"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-800 block mb-1">
                Description & Taxonomy Overview
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief summary of products categorized under this department..."
                className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-xs text-slate-900 outline-none font-medium transition-all shadow-2xs leading-relaxed"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-800 block mb-1">
                Hero Banner Image URL
              </label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-xs text-slate-900 outline-none font-medium transition-all shadow-2xs"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-800 block mb-1">
                Icon Representation
              </label>
              <select
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-xs text-slate-900 outline-none font-bold cursor-pointer transition-all shadow-2xs"
              >
                <option value="headphones">🎧 Headphones & Audio</option>
                <option value="smartphone">📱 Smartphones & Tech</option>
                <option value="home">🏠 Smart Home & Appliances</option>
                <option value="gamepad">🎮 Gaming Gear & Consoles</option>
                <option value="shirt">👕 Fashion & Apparel</option>
                <option value="footprints">👟 Footwear & Sneakers</option>
                <option value="watch">⌚ Smartwatches & Fitness</option>
                <option value="camera">📷 Photography & Cameras</option>
                <option value="grid">🔲 Default Grid Matrix</option>
              </select>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-0 accent-emerald-600 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800">
                  Showcase on Home Page Navigation Bar & Department Carousel
                </span>
              </label>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md shadow-emerald-500/25 border border-emerald-500 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <FiSave className="w-4 h-4" />
                <span>{saving ? 'Saving...' : isEdit ? 'Update Category' : 'Create Category'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT LIVE PREVIEW */}
        <div className="lg:col-span-5 space-y-4 sticky top-6">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FiEye className="text-emerald-500" />
              <span>Live Card Preview</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Interactive
            </span>
          </div>

          <div className="glass-card overflow-hidden flex flex-col justify-between group shadow-md border border-slate-200 bg-white">
            <div className="relative h-44 w-full overflow-hidden bg-slate-100 flex items-center justify-center">
              {formData.image ? (
                <>
                  <img
                    src={formData.image}
                    alt={formData.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center gap-1.5 text-slate-400">
                  <FiImage className="w-8 h-8 text-slate-300" />
                  <span className="text-[11px] font-bold text-slate-400">No Banner Image Set</span>
                </div>
              )}
              <div className="absolute top-3 left-3 w-10 h-10 rounded-xl bg-orange-500 text-white border border-orange-400 flex items-center justify-center shadow-md">
                {iconMap[formData.icon] || <FiGrid className="w-5 h-5" />}
              </div>
              {formData.isFeatured && (
                <div className="absolute top-3 right-3 px-2.5 py-0.5 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-md shadow-xs">
                  Featured
                </div>
              )}
            </div>

            <div className="p-5 space-y-2">
              <h3 className="text-base font-black text-slate-900">
                {formData.name || 'Category Name'}
              </h3>
              <span className="text-[11px] font-mono text-orange-600 font-bold block">
                /{formData.name ? formData.name.toLowerCase().replace(/\s+/g, '-') : 'category-slug'}
              </span>
              <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed font-medium">
                {formData.description || 'Category summary description will be displayed here for customers browsing department taxonomy.'}
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminCategoryEditorPage;
