import React, { useState, useEffect } from 'react';
import {
  FiShoppingBag,
  FiSearch,
  FiCheckCircle,
  FiAlertCircle,
  FiSlash,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiUserCheck,
  FiDollarSign,
  FiBox,
} from 'react-icons/fi';
import api from '../api/axios';
import { VendorDetailModal } from '../components/VendorDetailModal';
import { useToast } from '../context/ToastContext';

export const VendorsPage = () => {
  const { addToast } = useToast();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/vendors?status=${statusFilter}&search=${encodeURIComponent(search)}`);
      setVendors(res.data.vendors || []);
    } catch (err) {
      addToast('Failed to load vendors list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [statusFilter, search]);

  const handleApprove = async (vendorId, storeName) => {
    try {
      await api.put(`/admin/vendors/${vendorId}/status`, { status: 'approved' });
      addToast(`Vendor "${storeName}" approved and activated!`, 'success');
      fetchVendors();
    } catch (err) {
      addToast('Failed to approve vendor', 'error');
    }
  };

  const handleReject = async (vendorId, storeName) => {
    if (window.confirm(`Are you sure you want to suspend or reject vendor "${storeName}"?`)) {
      try {
        await api.put(`/admin/vendors/${vendorId}/status`, { status: 'rejected' });
        addToast(`Vendor "${storeName}" suspended.`, 'info');
        fetchVendors();
      } catch (err) {
        addToast('Failed to update vendor status', 'error');
      }
    }
  };

  const handleDelete = async (vendorId, storeName) => {
    if (window.confirm(`Are you sure you want to delete vendor "${storeName}"? This will remove their account and all listed products.`)) {
      try {
        await api.delete(`/admin/vendors/${vendorId}`);
        addToast(`Vendor "${storeName}" deleted successfully.`, 'success');
        fetchVendors();
      } catch (err) {
        addToast('Failed to delete vendor', 'error');
      }
    }
  };

  const handleInspect = (vendor) => {
    setSelectedVendor(vendor);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FiShoppingBag className="text-orange-500 w-6 h-6" />
            <span>Vendors & Marketplace Merchants</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Monitor registered merchant sellers, approve onboarding applications, and adjust platform commission rates.
          </p>
        </div>

        <button
          onClick={fetchVendors}
          className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 transition-all shadow-2xs self-start sm:self-auto cursor-pointer"
          title="Refresh Vendors List"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-500' : ''}`} />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by store name, owner, or email..."
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 text-xs rounded-xl py-2 pl-9 pr-4 text-slate-900 outline-none font-bold transition-all"
            />
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {[
              { id: 'ALL', label: 'All Vendors' },
              { id: 'pending', label: '⏳ Pending Approval' },
              { id: 'approved', label: '✅ Active' },
              { id: 'rejected', label: '🚫 Suspended' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-orange-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="glass-card overflow-hidden">
        {loading && vendors.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-xs font-bold">
            <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading vendors directory...
          </div>
        ) : vendors.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto border border-orange-200">
              <FiShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-800">No Vendors Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No merchant seller accounts match your search or filter selection.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-orange-100 bg-orange-50/40 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Store & Merchant</th>
                  <th className="py-3.5 px-4">Warehouse Location</th>
                  <th className="py-3.5 px-4">Commission</th>
                  <th className="py-3.5 px-4">Catalog / Orders</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-50/60 font-medium">
                {vendors.map((v) => (
                  <tr key={v._id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={v.storeLogo || 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=100'}
                          alt={v.storeName}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-200 bg-white shadow-2xs shrink-0"
                        />
                        <div className="min-w-0 max-w-xs">
                          <div className="font-extrabold text-slate-900 truncate">{v.storeName || v.name}</div>
                          <div className="text-[11px] text-slate-500">{v.name} &bull; <span className="font-mono">{v.email}</span></div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="truncate max-w-xs">{v.address?.street || 'No street listed'}</div>
                      <div className="text-[10px] text-slate-400 font-bold">{v.address?.city} ({v.address?.postalCode})</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-black text-orange-700 bg-orange-100/90 px-2 py-0.5 rounded-md border border-orange-200">
                        {v.commissionRate || 10}% Fee
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-900 font-bold">{v.productCount || 0} products</div>
                      <div className="text-[11px] text-slate-500">{v.ordersCount || 0} orders processed</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 border ${
                          v.vendorStatus === 'approved'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : v.vendorStatus === 'pending'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-rose-100 text-rose-800 border-rose-300'
                        }`}
                      >
                        {v.vendorStatus === 'approved' && <FiCheckCircle className="w-3 h-3 text-emerald-600" />}
                        {v.vendorStatus === 'pending' && <FiAlertCircle className="w-3 h-3 text-amber-600" />}
                        {v.vendorStatus === 'rejected' && <FiSlash className="w-3 h-3 text-rose-600" />}
                        <span>{v.vendorStatus}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {v.vendorStatus === 'pending' && (
                          <button
                            onClick={() => handleApprove(v._id, v.storeName || v.name)}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] shadow-2xs transition-colors cursor-pointer"
                            title="Approve Vendor"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => handleInspect(v)}
                          className="p-2 bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-600 rounded-xl border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                          title="Edit Settings & Commission"
                        >
                          <FiEdit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(v._id, v.storeName || v.name)}
                          className="p-2 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 rounded-xl border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                          title="Delete Vendor"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Vendor Settings Modal */}
      <VendorDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vendor={selectedVendor}
        onUpdated={fetchVendors}
      />
    </div>
  );
};
