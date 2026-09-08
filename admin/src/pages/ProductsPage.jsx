import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
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
  FiCheck,
  FiX,
  FiCheckCircle,
  FiAlertTriangle,
  FiXCircle,
  FiZap,
} from 'react-icons/fi';

export const ProductsPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Flash Sale Modal State
  const [isFlashSaleModalOpen, setIsFlashSaleModalOpen] = useState(false);

  const fetchProductsAndCategories = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, venRes] = await Promise.all([
        api.get('/products?limit=200&approvalStatus=all'),
        api.get('/categories'),
        api.get('/admin/vendors'),
      ]);
      setProducts(prodRes.data.products || []);
      setCategories(catRes.data.categories || []);
      setVendors(venRes.data.vendors || []);
    } catch (err) {
      console.error('Failed to load products:', err);
      addToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndCategories();
  }, []);

  const handleApproval = async (id, name, status) => {
    setUpdatingId(id);
    try {
      await api.put(`/admin/products/${id}/approval`, { status });
      addToast(
        `Product "${name}" has been ${status === 'approved' ? 'approved and is now live!' : 'marked as ' + status}.`,
        status === 'approved' ? 'success' : 'info'
      );
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, approvalStatus: status } : p))
      );
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update approval status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete product "${name}"?`)) {
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
    navigate(`/products/edit/${product._id}`);
  };

  const handleCreate = () => {
    navigate('/products/new');
  };

  // Counts for tabs
  const pendingCount = products.filter((p) => p.approvalStatus === 'pending').length;
  const approvedCount = products.filter((p) => (p.approvalStatus || 'approved') === 'approved').length;
  const rejectedCount = products.filter((p) => p.approvalStatus === 'rejected').length;

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
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'approved' && (p.approvalStatus || 'approved') === 'approved') ||
      p.approvalStatus === statusFilter;

    return matchesSearch && matchesCategory && matchesVendor && matchesStock && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <span>Vendor Products & Approvals</span>
            {pendingCount > 0 && (
              <span className="px-2.5 py-1 text-xs bg-amber-500 text-white font-extrabold rounded-full animate-pulse">
                {pendingCount} Pending
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Review vendor-submitted catalog listings, approve or reject items, monitor stock, and set pricing.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* BLUE BUTTON: Refresh Catalog */}
          <button
            onClick={fetchProductsAndCategories}
            className="p-2.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl border border-blue-200 hover:border-blue-600 transition-all shadow-2xs cursor-pointer"
            title="Refresh Catalog"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* YELLOW BUTTON: Flash Deals & Promo Bar */}
          <button
            onClick={() => setIsFlashSaleModalOpen(true)}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black rounded-xl border border-amber-300 flex items-center gap-2 transition-all shadow-md shadow-amber-400/20 active:scale-95 cursor-pointer"
          >
            <FiZap className="w-4 h-4 text-slate-950 fill-slate-950" />
            <span>Flash Sale & Promo Bar</span>
          </button>

          {/* GREEN BUTTON: Create New Product */}
          <button
            onClick={handleCreate}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md shadow-emerald-500/25 border border-emerald-500 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <FiPlus className="w-4 h-4 text-white" />
            <span>Create Product</span>
          </button>
        </div>
      </div>

      {/* Approval Status Tab Bar */}
      <div className="flex items-center gap-2 border-b border-orange-200/60 pb-3 overflow-x-auto">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white/80 text-slate-600 hover:bg-white hover:text-slate-900 border border-slate-200'
          }`}
        >
          <span>All Products</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            statusFilter === 'all' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
          }`}>
            {products.length}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            statusFilter === 'pending'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
              : 'bg-amber-50/80 text-amber-900 hover:bg-amber-100 border border-amber-200'
          }`}
        >
          <FiClock className="w-3.5 h-3.5" />
          <span>Pending Approval</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            statusFilter === 'pending' ? 'bg-amber-600 text-white' : 'bg-amber-200 text-amber-900'
          }`}>
            {pendingCount}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('approved')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            statusFilter === 'approved'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
              : 'bg-emerald-50/80 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
          }`}
        >
          <FiCheckCircle className="w-3.5 h-3.5" />
          <span>Approved & Live</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            statusFilter === 'approved' ? 'bg-emerald-700 text-white' : 'bg-emerald-200 text-emerald-900'
          }`}>
            {approvedCount}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('rejected')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            statusFilter === 'rejected'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
              : 'bg-rose-50/80 text-rose-900 hover:bg-rose-100 border border-rose-200'
          }`}
        >
          <FiXCircle className="w-3.5 h-3.5" />
          <span>Rejected</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            statusFilter === 'rejected' ? 'bg-rose-700 text-white' : 'bg-rose-200 text-rose-900'
          }`}>
            {rejectedCount}
          </span>
        </button>
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
                <th className="py-3.5 px-4">Approval Status</th>
                <th className="py-3.5 px-4">Stock Status (No.)</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap min-w-[200px]">Moderation & Actions</th>
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
                filteredProducts.map((product) => {
                  const status = product.approvalStatus || 'approved';
                  const isUpdating = updatingId === product._id;

                  return (
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

                      {/* Approval Status Badge */}
                      <td className="py-3.5 px-4">
                        {status === 'pending' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold animate-pulse">
                            <FiClock className="w-3 h-3 text-amber-600" />
                            <span>Pending Approval</span>
                          </span>
                        ) : status === 'approved' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-extrabold">
                            <FiCheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>Live & Approved</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 text-rose-900 border border-rose-300 text-[10px] font-extrabold">
                            <FiXCircle className="w-3 h-3 text-rose-600" />
                            <span>Rejected</span>
                          </span>
                        )}
                      </td>

                      {/* Stock Status (No.) */}
                      <td className="py-3.5 px-4">
                        {product.countInStock === 0 ? (
                          <span className="inline-flex items-center justify-center min-w-8 px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-black" title="0 units in stock (Out of Stock)">
                            0
                          </span>
                        ) : product.countInStock <= 5 ? (
                          <span className="inline-flex items-center justify-center min-w-8 px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded-lg text-xs font-black" title={`${product.countInStock} units remaining (Low Stock)`}>
                            {product.countInStock}
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center min-w-8 px-2.5 py-1 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-black" title={`${product.countInStock} units in stock`}>
                            {product.countInStock}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5 flex-nowrap">

                          {/* Quick Moderation: APPROVE */}
                          {status !== 'approved' && (
                            <button
                              onClick={() => handleApproval(product._id, product.name, 'approved')}
                              disabled={isUpdating}
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-lg border border-emerald-200 hover:border-emerald-600 transition-all cursor-pointer active:scale-95 disabled:opacity-50 shrink-0 flex items-center justify-center shadow-2xs"
                              title="Approve Product"
                            >
                              <FiCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          )}

                          {/* Quick Moderation: REJECT */}
                          {status !== 'rejected' && (
                            <button
                              onClick={() => handleApproval(product._id, product.name, 'rejected')}
                              disabled={isUpdating}
                              className="p-1.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-lg border border-rose-200 hover:border-rose-600 transition-all cursor-pointer active:scale-95 disabled:opacity-50 shrink-0 flex items-center justify-center shadow-2xs"
                              title="Reject Product"
                            >
                              <FiX className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          )}

                          {/* View on Live Store (Only if Approved) */}
                          {status === 'approved' && (
                            <a
                              href={`http://localhost:5173/product/${product.slug || product._id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-lg border border-blue-200 hover:border-blue-600 transition-all cursor-pointer shadow-2xs shrink-0 flex items-center justify-center"
                              title="View on Customer Storefront"
                            >
                              <FiExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {/* Edit Product */}
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-1.5 bg-amber-50 hover:bg-amber-400 text-amber-800 hover:text-slate-950 rounded-lg border border-amber-200 hover:border-amber-300 transition-all cursor-pointer shadow-2xs shrink-0 flex items-center justify-center"
                            title="Edit Product"
                          >
                            <FiEdit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Product */}
                          <button
                            onClick={() => handleDeleteProduct(product._id, product.name)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-lg border border-rose-200 hover:border-rose-600 transition-all cursor-pointer shadow-2xs shrink-0 flex items-center justify-center"
                            title="Delete Product"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>



      <FlashSaleModal
        isOpen={isFlashSaleModalOpen}
        onClose={() => setIsFlashSaleModalOpen(false)}
        onSaved={fetchProductsAndCategories}
      />

    </div>
  );
};

