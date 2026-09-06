import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { ProductModal } from '../components/ProductModal';
import { FlashSaleModal } from '../components/FlashSaleModal';
import { useToast } from '../context/ToastContext';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiStar,
  FiRefreshCw,
  FiExternalLink,
  FiClock,
} from 'react-icons/fi';

export const ProductsPage = () => {
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  // Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFlashSaleModalOpen, setIsFlashSaleModalOpen] = useState(false);

  const fetchProductsAndCategories = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, venRes] = await Promise.all([
        api.get('/products?limit=100'),
        api.get('/categories'),
        api.get('/admin/vendors'),
      ]);
      setProducts(prodRes.data.products || []);
      setCategories(catRes.data.categories || []);
      setVendors(venRes.data.vendors || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndCategories();
  }, []);

  const handleDeleteProduct = async (id, name) => {
    if (window.confirm(`Are you sure you want to permanently delete "${name}"?`)) {
      try {
        await api.delete(`/products/${id}`);
        addToast(`Product "${name}" deleted successfully`, 'info');
        fetchProductsAndCategories();
      } catch (err) {
        addToast(err.response?.data?.message || 'Failed to delete product', 'error');
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase()) ||
      p.vendorStoreName?.toLowerCase().includes(search.toLowerCase()) ||
      p.vendorName?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCat === 'all' ||
      p.category?._id === selectedCat ||
      p.category === selectedCat ||
      p.categoryName?.toLowerCase() === selectedCat.toLowerCase();
    const matchesVendor =
      selectedVendor === 'all' ||
      p.vendor?._id === selectedVendor ||
      p.vendor === selectedVendor;
    const matchesStock =
      stockFilter === 'all' ||
      (stockFilter === 'low' && p.countInStock <= 5) ||
      (stockFilter === 'out' && p.countInStock === 0);

    return matchesSearch && matchesCategory && matchesVendor && matchesStock;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Vendor Products Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Manage multi-vendor catalog listings, stock counts, seller assignments, pricing, and specs.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* BLUE BUTTON: Refresh Catalog */}
          <button
            onClick={fetchProductsAndCategories}
            className="p-2.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl border border-blue-200 hover:border-blue-600 transition-all shadow-2xs cursor-pointer"
            title="Refresh Catalog"
          >
            <FiRefreshCw className="w-4 h-4" />
          </button>

          {/* YELLOW BUTTON: Flash Deals Timer */}
          <button
            onClick={() => setIsFlashSaleModalOpen(true)}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black rounded-xl border border-amber-300 flex items-center gap-2 transition-all shadow-md shadow-amber-400/20 active:scale-95 cursor-pointer"
          >
            <FiClock className="w-4 h-4 text-slate-950" />
            <span>⚡ Set Deals Timer</span>
          </button>

          {/* GREEN BUTTON: Create New Product */}
          <button
            onClick={handleCreate}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md shadow-emerald-500/25 border border-emerald-500 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <FiPlus className="w-4 h-4 text-white" />
            <span>Create Vendor Product</span>
          </button>
        </div>
      </div>

      {/* Filters Bar in Glass Style */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between flex-wrap">

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product, brand, or vendor..."
            className="w-full bg-white/80 border border-orange-200/80 focus:bg-white focus:border-orange-500 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-900 outline-none font-medium transition-colors"
          />
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 w-3.5 h-3.5" />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="px-3 py-2 bg-white/80 border border-orange-200/80 rounded-xl text-xs text-slate-800 outline-none focus:border-orange-500 font-semibold cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value)}
            className="px-3 py-2 bg-white/80 border border-orange-200/80 rounded-xl text-xs text-slate-800 outline-none focus:border-orange-500 font-semibold cursor-pointer"
          >
            <option value="all">All Merchant Vendors</option>
            {vendors.map((v) => (
              <option key={v._id} value={v._id}>
                🏪 {v.storeName || v.name}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-3 py-2 bg-white/80 border border-orange-200/80 rounded-xl text-xs text-slate-800 outline-none focus:border-orange-500 font-semibold cursor-pointer"
          >
            <option value="all">All Stock</option>
            <option value="low">Low Stock (&lt;= 5)</option>
            <option value="out">Out of Stock (0)</option>
          </select>
        </div>

      </div>

      {/* Products Table in Glass Panel */}
      <div className="glass-panel rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-orange-50/50 text-slate-500 text-[10px] uppercase font-bold border-b border-orange-100">
              <tr>
                <th className="py-3.5 px-4">Product Details</th>
                <th className="py-3.5 px-4">Merchant Vendor</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Stock Status</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-100/40">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500 font-bold">
                    No matching products found in catalog.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-orange-50/30 transition-colors">

                    {/* Title & Thumbnail */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image || product.images?.[0] || 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?w=100'}
                          alt={product.name}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0"
                        />
                        <div>
                          <h4 className="font-bold text-slate-900 line-clamp-1 max-w-[180px] sm:max-w-xs">{product.name}</h4>
                          <span className="text-[10px] text-orange-600 font-bold uppercase">{product.brand || 'Nexus Supply'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Vendor Store */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-bold">
                        🏪 {product.vendorStoreName || product.vendor?.storeName || 'Vendor Merchant'}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 font-bold text-slate-700">
                      {product.category?.name || product.categoryName || 'General'}
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      ₹{product.price?.toLocaleString('en-IN') || product.price}
                    </td>

                    {/* Stock Status */}
                    <td className="py-3.5 px-4">
                      {product.countInStock === 0 ? (
                        <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                          Out of Stock (0)
                        </span>
                      ) : product.countInStock <= 5 ? (
                        <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                          Low Stock ({product.countInStock})
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                          In Stock ({product.countInStock})
                        </span>
                      )}
                    </td>

                    {/* Rating */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <FiStar className="w-3.5 h-3.5 fill-amber-400" />
                        <span className="text-slate-800">{product.rating || 0}</span>
                        <span className="text-slate-400 text-[10px]">({product.numReviews || 0})</span>
                      </div>
                    </td>

                    {/* Colorful Action Buttons: Blue View, Yellow Edit, Red Delete */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* BLUE BUTTON: View on Live Customer Store */}
                        <a
                          href={`http://localhost:5173/product/${product.slug || product._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl border border-blue-500 transition-all shadow-glow-blue active:scale-95"
                          title="View on Customer Storefront"
                        >
                          <FiExternalLink className="w-3.5 h-3.5 text-white" />
                        </a>

                        {/* YELLOW BUTTON: Edit Product */}
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl border border-amber-300 transition-all cursor-pointer shadow-glow-yellow active:scale-95"
                          title="Edit Product"
                        >
                          <FiEdit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* RED BUTTON: Delete Product */}
                        <button
                          onClick={() => handleDeleteProduct(product._id, product.name)}
                          className="p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl border border-rose-400 transition-all cursor-pointer shadow-glow-red active:scale-95"
                          title="Delete Product"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={editingProduct}
        categories={categories}
        onSaved={fetchProductsAndCategories}
      />

      <FlashSaleModal
        isOpen={isFlashSaleModalOpen}
        onClose={() => setIsFlashSaleModalOpen(false)}
        onSaved={fetchProductsAndCategories}
      />

    </div>
  );
};
