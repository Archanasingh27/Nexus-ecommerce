import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { CategoryModal } from '../components/CategoryModal';
import { useToast } from '../context/ToastContext';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiGrid,
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

const iconMap = {
  headphones: <RiHeadphoneLine className="w-5 h-5" />,
  smartphone: <RiSmartphoneLine className="w-5 h-5" />,
  home: <RiHome4Line className="w-5 h-5" />,
  gamepad: <RiGamepadLine className="w-5 h-5" />,
  shirt: <RiTShirtLine className="w-5 h-5" />,
  footprints: <RiFootprintLine className="w-5 h-5" />,
  watch: <RiTimeLine className="w-5 h-5" />,
  camera: <RiCameraLine className="w-5 h-5" />,
};

export const CategoriesPage = () => {
  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingCategory, setEditingCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/categories');
      setCategories(data.categories || []);
    } catch (err) {
      addToast('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDeleteCategory = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete category "${name}"?`)) {
      try {
        await api.delete(`/categories/${id}`);
        addToast(`Category "${name}" removed successfully`, 'info');
        fetchCategories();
      } catch (err) {
        addToast(err.response?.data?.message || 'Failed to delete category', 'error');
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Store Taxonomy & Categories
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Organize catalog classifications, visual hero imagery, and subcategory routing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* BLUE BUTTON: Refresh */}
          <button
            onClick={fetchCategories}
            className="p-2.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl border border-blue-200 hover:border-blue-600 transition-all shadow-2xs cursor-pointer"
            title="Refresh Categories"
          >
            <FiRefreshCw className="w-4 h-4" />
          </button>

          {/* GREEN BUTTON: Create New Category */}
          <button
            onClick={() => {
              setEditingCategory(null);
              setIsModalOpen(true);
            }}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md shadow-emerald-500/25 border border-emerald-500 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <FiPlus className="w-4 h-4 text-white" />
            <span>Create New Category</span>
          </button>
        </div>
      </div>

      {/* Grid of Categories in Glass Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 glass-panel rounded-3xl animate-pulse" />
          ))
        ) : categories.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 font-semibold glass-panel rounded-3xl">
            No categories defined yet.
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat._id}
              className="glass-card overflow-hidden flex flex-col justify-between group"
            >
              {/* Category Image Preview */}
              <div className="relative h-36 w-full overflow-hidden bg-orange-50/50">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
                <div className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-orange-500/90 text-white border border-orange-400 flex items-center justify-center backdrop-blur-md shadow-md">
                  {iconMap[cat.icon] || <FiGrid className="w-4 h-4" />}
                </div>
              </div>

              {/* Details & Actions */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900">{cat.name}</h3>
                  <span className="text-[11px] font-mono text-orange-600 font-bold block mb-1">
                    /{cat.slug}
                  </span>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                    {cat.description || 'No description provided.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-orange-100 text-xs">
                  <span className="font-bold text-slate-700">
                    {cat.itemCount || 0} Products
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* YELLOW BUTTON: Edit */}
                    <button
                      onClick={() => {
                        setEditingCategory(cat);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-lg transition-all border border-amber-300 cursor-pointer shadow-2xs"
                      title="Edit Category"
                    >
                      <FiEdit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* RED BUTTON: Delete */}
                    <button
                      onClick={() => handleDeleteCategory(cat._id, cat.name)}
                      className="p-1.5 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 rounded-lg transition-all border border-red-200 hover:border-red-600 cursor-pointer shadow-2xs"
                      title="Delete Category"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={editingCategory}
        onSaved={fetchCategories}
      />

    </div>
  );
};
