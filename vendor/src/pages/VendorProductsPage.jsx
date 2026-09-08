import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiBox,
  FiRefreshCw,
  FiTag,
  FiAlertCircle,
  FiClock,
  FiCheckCircle,
  FiXCircle,
} from 'react-icons/fi';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

export const VendorProductsPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get(`/vendor/products?search=${encodeURIComponent(search)}`),
        api.get('/categories'),
      ]);
      setProducts(prodRes.data.products || []);
      setCategories(catRes.data.categories || []);
    } catch (err) {
      addToast('Failed to load store products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const handleDelete = async (productId, productName) => {
    if (window.confirm(`Are you sure you want to delete "${productName}" from your store catalog?`)) {
      try {
        await api.delete(`/vendor/products/${productId}`);
        addToast(`"${productName}" deleted successfully.`, 'success');
        fetchProducts();
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
    if (statusFilter === 'all') return true;
    if (statusFilter === 'approved') return (p.approvalStatus || 'approved') === 'approved';
    return p.approvalStatus === statusFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FiBox className="text-orange-500 w-6 h-6" />
            <span>Store Catalog & Products</span>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 text-xs bg-amber-500 text-white font-extrabold rounded-full">
                {pendingCount} Under Review
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage your store's inventory, pricing, stock levels, and review moderation status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchProducts}
            className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 transition-all shadow-2xs cursor-pointer"
            title="Refresh List"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-500' : ''}`} />
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black rounded-xl shadow-md shadow-orange-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <span>All Items</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            statusFilter === 'all' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
          }`}>
            {products.length}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('approved')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            statusFilter === 'approved'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
          }`}
        >
          <FiCheckCircle className="w-3.5 h-3.5" />
          <span>Live & Approved</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            statusFilter === 'approved' ? 'bg-emerald-700 text-white' : 'bg-emerald-200 text-emerald-900'
          }`}>
            {approvedCount}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            statusFilter === 'pending'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
          }`}
        >
          <FiClock className="w-3.5 h-3.5" />
          <span>Under Admin Review</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            statusFilter === 'pending' ? 'bg-amber-600 text-white' : 'bg-amber-200 text-amber-900'
          }`}>
            {pendingCount}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('rejected')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            statusFilter === 'rejected'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-rose-50 text-rose-900 hover:bg-rose-100 border border-rose-200'
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

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your products by name or brand..."
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 text-xs rounded-xl py-2 pl-9 pr-4 text-slate-900 outline-none font-bold transition-all"
          />
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
        </div>

        <span className="text-xs font-bold text-slate-500">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'Item' : 'Items'} Showing
        </span>
      </div>

      {/* Products Table */}
      <div className="glass-card overflow-hidden">
        {loading && products.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-xs font-bold">
            <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading catalog items...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto border border-orange-200">
              <FiBox className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-800">No Products Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {statusFilter !== 'all'
                ? `No products currently marked as "${statusFilter}".`
                : 'Start building your store catalog by adding your first product listing.'}
            </p>
            {statusFilter === 'all' && (
              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-2 px-5 py-2 bg-orange-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
              >
                <FiPlus className="w-4 h-4" />
                <span>Add First Product</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-orange-100 bg-orange-50/40 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Item & Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Approval Status</th>
                  <th className="py-3.5 px-4">Stock Status (No.)</th>
                  <th className="py-3.5 px-4">Units Sold</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-50/60 font-medium">
                {filteredProducts.map((p) => {
                  const status = p.approvalStatus || 'approved';

                  return (
                    <tr key={p._id} className="hover:bg-orange-50/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-white shrink-0 shadow-2xs"
                          />
                          <div className="min-w-0 max-w-xs sm:max-w-sm">
                            <div className="font-extrabold text-slate-900 truncate">{p.name}</div>
                            <div className="text-[11px] text-slate-500 font-medium">Brand: {p.brand || 'Store Brand'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold">
                          {p.categoryName || p.category?.name || 'General'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 font-mono text-sm">
                          ₹{p.price?.toLocaleString('en-IN')}
                        </div>
                        {p.originalPrice > p.price && (
                          <div className="text-[10px] text-slate-400 line-through">
                            ₹{p.originalPrice?.toLocaleString('en-IN')}
                          </div>
                        )}
                      </td>

                      {/* Approval Status */}
                      <td className="py-3.5 px-4">
                        {status === 'pending' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-300 text-[10px] font-extrabold">
                            <FiClock className="w-3 h-3 text-amber-600" />
                            <span>Pending Review</span>
                          </span>
                        ) : status === 'approved' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-300 text-[10px] font-extrabold">
                            <FiCheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>Live in Store</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-900 border border-rose-300 text-[10px] font-extrabold">
                            <FiXCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Rejected</span>
                          </span>
                        )}
                      </td>

                      {/* Stock Status (No.) */}
                      <td className="py-3.5 px-4">
                        {p.countInStock === 0 ? (
                          <span className="inline-flex items-center justify-center min-w-8 px-2.5 py-1 rounded-lg text-xs font-black bg-rose-50 text-rose-700 border border-rose-200" title="Out of Stock (0 units)">
                            0
                          </span>
                        ) : p.countInStock <= 5 ? (
                          <span className="inline-flex items-center justify-center min-w-8 px-2.5 py-1 rounded-lg text-xs font-black bg-amber-50 text-amber-900 border border-amber-300" title={`Low Stock (${p.countInStock} units remaining)`}>
                            {p.countInStock}
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center min-w-8 px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-50 text-emerald-900 border border-emerald-300" title={`${p.countInStock} units in stock`}>
                            {p.countInStock}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {p.soldCount || 0}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(p)}
                            className="p-2 bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-600 rounded-xl border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                            title="Edit Product"
                          >
                            <FiEdit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p._id, p.name)}
                            className="p-2 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 rounded-xl border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                            title="Delete Product"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

