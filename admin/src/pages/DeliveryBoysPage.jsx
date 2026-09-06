import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import {
  FiTruck,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiPhone,
  FiMapPin,
  FiUser,
  FiMail,
  FiLock,
  FiX,
  FiSave,
  FiShield,
  FiPackage,
  FiDollarSign,
} from 'react-icons/fi';

export const DeliveryBoysPage = () => {
  const { addToast } = useToast();
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRider, setEditingRider] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    vehicleType: 'Bike',
    vehicleNumber: '',
    serviceCity: '',
    servicePincodes: '',
    isAvailable: true,
  });

  const fetchRiders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/delivery/admin/riders');
      setRiders(data.riders || []);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load delivery fleet', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiders();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingRider(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      vehicleType: 'Bike',
      vehicleNumber: '',
      serviceCity: '',
      servicePincodes: '',
      isAvailable: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rider) => {
    setEditingRider(rider);
    setFormData({
      name: rider.name || '',
      email: rider.email || '',
      password: '',
      phone: rider.phone || '',
      vehicleType: rider.vehicleType || 'Bike',
      vehicleNumber: rider.vehicleNumber || '',
      serviceCity: rider.serviceCity || '',
      servicePincodes: Array.isArray(rider.servicePincodes) ? rider.servicePincodes.join(', ') : (rider.servicePincodes || ''),
      isAvailable: rider.isAvailable !== false,
    });
    setIsModalOpen(true);
  };

  const handleSaveRider = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      addToast('Name and Email are required', 'error');
      return;
    }
    if (!editingRider && !formData.password) {
      addToast('Password is required for new rider account', 'error');
      return;
    }

    setModalLoading(true);
    try {
      if (editingRider) {
        await api.put(`/delivery/admin/riders/${editingRider._id}`, formData);
        addToast('Delivery partner updated successfully!', 'success');
      } else {
        await api.post('/delivery/admin/riders', formData);
        addToast('New delivery partner registered successfully!', 'success');
      }
      setIsModalOpen(false);
      fetchRiders();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save delivery partner', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleAvailability = async (rider) => {
    try {
      const updatedStatus = !rider.isAvailable;
      await api.put(`/delivery/admin/riders/${rider._id}`, { isAvailable: updatedStatus });
      addToast(`${rider.name} marked ${updatedStatus ? 'ONLINE' : 'OFFLINE'}`, 'info');
      fetchRiders();
    } catch (err) {
      addToast('Failed to toggle availability', 'error');
    }
  };

  const handleDeleteRider = async (riderId, name) => {
    if (window.confirm(`Are you sure you want to remove delivery partner "${name}"?`)) {
      try {
        await api.delete(`/delivery/admin/riders/${riderId}`);
        addToast(`Rider "${name}" removed from fleet`, 'info');
        fetchRiders();
      } catch (err) {
        addToast(err.response?.data?.message || 'Failed to delete rider', 'error');
      }
    }
  };

  // Filtered Riders List
  const filteredRiders = riders.filter((r) => {
    const matchSearch =
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase()) ||
      r.phone?.includes(search) ||
      r.serviceCity?.toLowerCase().includes(search.toLowerCase());

    if (statusFilter === 'ONLINE') return matchSearch && r.isAvailable;
    if (statusFilter === 'OFFLINE') return matchSearch && !r.isAvailable;
    return matchSearch;
  });

  const onlineCount = riders.filter((r) => r.isAvailable).length;
  const totalActiveOrders = riders.reduce((acc, r) => acc + (r.activeOrders || 0), 0);
  const totalCompletedOrders = riders.reduce((acc, r) => acc + (r.completedOrders || 0), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-2xl border border-emerald-300">
              <FiTruck className="w-6 h-6" />
            </span>
            Delivery Fleet Management
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Manage delivery personnel, monitor real-time availability, assign geographic zones, and track fulfillment performance.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={fetchRiders}
            className="p-2.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl border border-blue-200 hover:border-blue-600 transition-all shadow-2xs cursor-pointer"
            title="Refresh Fleet Status"
          >
            <FiRefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md shadow-emerald-500/25 border border-emerald-500 flex items-center gap-2 transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            <FiPlus className="w-4 h-4 stroke-[3]" />
            <span>Add Delivery Partner</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-panel p-4 rounded-2xl flex items-center gap-3.5 border-l-4 border-l-blue-500">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
            <FiTruck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Fleet</div>
            <div className="text-xl font-black text-slate-900">{riders.length} Riders</div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex items-center gap-3.5 border-l-4 border-l-emerald-500">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
            <FiCheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Online On-Duty</div>
            <div className="text-xl font-black text-emerald-600">{onlineCount} Active</div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex items-center gap-3.5 border-l-4 border-l-amber-500">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
            <FiPackage className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">In-Transit Orders</div>
            <div className="text-xl font-black text-amber-700">{totalActiveOrders} Live</div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex items-center gap-3.5 border-l-4 border-l-purple-500">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black">
            <FiDollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Completed</div>
            <div className="text-xl font-black text-purple-700">{totalCompletedOrders} Done</div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rider name, phone, city..."
            className="w-full bg-white/90 border border-slate-200 focus:border-emerald-500 rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-slate-900 outline-none transition-colors shadow-2xs"
          />
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto self-end">
          {['ALL', 'ONLINE', 'OFFLINE'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                statusFilter === status
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Fleet Table */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-emerald-50/50 text-slate-500 text-[10px] uppercase font-bold border-b border-emerald-100">
              <tr>
                <th className="py-3.5 px-4">Rider Info</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Vehicle & Zone</th>
                <th className="py-3.5 px-4">Availability</th>
                <th className="py-3.5 px-4 text-center">Active Trips</th>
                <th className="py-3.5 px-4 text-center">Deliveries Done</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading fleet database...
                  </td>
                </tr>
              ) : filteredRiders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-bold">
                    No delivery partners matching search filter.
                  </td>
                </tr>
              ) : (
                filteredRiders.map((rider) => (
                  <tr key={rider._id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Rider Avatar & Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={rider.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover border-2 border-emerald-300 bg-slate-50 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{rider.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{rider.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Contact Phone */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                        <FiPhone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{rider.phone || 'No phone'}</span>
                      </div>
                    </td>

                    {/* Vehicle & Zone */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">
                        {rider.vehicleType} {rider.vehicleNumber && `(${rider.vehicleNumber})`}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <FiMapPin className="w-3 h-3 text-orange-500" />
                        <span>{rider.serviceCity || 'Any City'}</span>
                        {rider.servicePincodes?.length > 0 && (
                          <span className="text-[9px] bg-slate-100 px-1 py-0.2 rounded text-slate-600">
                            {rider.servicePincodes.length} pins
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Duty Availability Toggle */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleAvailability(rider)}
                        className={`px-3 py-1 rounded-full text-[10px] font-black inline-flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all ${
                          rider.isAvailable
                            ? 'bg-emerald-500 text-white border border-emerald-600'
                            : 'bg-slate-200 text-slate-600 border border-slate-300'
                        }`}
                        title="Click to toggle Online/Offline"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${rider.isAvailable ? 'bg-white animate-pulse' : 'bg-slate-400'}`} />
                        <span>{rider.isAvailable ? 'ONLINE (On Duty)' : 'OFFLINE'}</span>
                      </button>
                    </td>

                    {/* Active Trips */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                        rider.activeOrders > 0
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {rider.activeOrders || 0}
                      </span>
                    </td>

                    {/* Completed */}
                    <td className="py-3.5 px-4 text-center font-black text-slate-900">
                      {rider.completedOrders || 0}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEditModal(rider)}
                          className="p-2 rounded-xl bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 border border-blue-200 hover:border-blue-600 transition-all cursor-pointer shadow-2xs"
                          title="Edit Delivery Partner"
                        >
                          <FiEdit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteRider(rider._id, rider.name)}
                          className="p-2 rounded-xl bg-red-50 hover:bg-red-600 hover:text-white text-red-600 border border-red-200 hover:border-red-600 transition-all cursor-pointer shadow-2xs"
                          title="Delete Delivery Partner"
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

      {/* Add / Edit Delivery Boy Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150" />

          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 z-10 space-y-6 animate-in zoom-in-95 duration-150">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <FiTruck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      {editingRider ? `Edit: ${editingRider.name}` : 'Add New Delivery Partner'}
                    </h2>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Fill in rider credentials, vehicle details, and service territory.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveRider} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Rider Full Name *</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl py-2 pl-9 pr-3 text-xs font-medium text-slate-900 outline-none"
                      />
                      <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g. 9876543210"
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl py-2 pl-9 pr-3 text-xs font-medium text-slate-900 outline-none"
                      />
                      <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Login Email *</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. rider1@nexus.com"
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl py-2 pl-9 pr-3 text-xs font-medium text-slate-900 outline-none"
                    />
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Password (Required for create, optional for edit) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {editingRider ? 'New Password (leave blank to keep current)' : 'Login Password *'}
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required={!editingRider}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Min 6 characters"
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl py-2 pl-9 pr-3 text-xs font-medium text-slate-900 outline-none"
                    />
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Vehicle Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Type</label>
                    <select
                      value={formData.vehicleType}
                      onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 outline-none"
                    >
                      <option value="Bike">Motorcycle / Bike</option>
                      <option value="Scooter">Scooter / EV</option>
                      <option value="Bicycle">Bicycle</option>
                      <option value="Van">Delivery Van</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Vehicle Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Registration #</label>
                    <input
                      type="text"
                      value={formData.vehicleNumber}
                      onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                      placeholder="e.g. MH 02 AB 1234"
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Service City */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Service City / Zone</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.serviceCity}
                        onChange={(e) => setFormData({ ...formData, serviceCity: e.target.value })}
                        placeholder="e.g. Indore (Vijay Nagar Zone)"
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl py-2 pl-9 pr-3 text-xs font-medium text-slate-900 outline-none"
                      />
                      <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Pincodes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Pincodes</label>
                    <input
                      type="text"
                      value={formData.servicePincodes}
                      onChange={(e) => setFormData({ ...formData, servicePincodes: e.target.value })}
                      placeholder="e.g. 452010, 452001, 452020"
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 outline-none"
                    />
                  </div>
                </div>

                {/* Initial Availability Toggle */}
                <div className="flex items-center gap-3 p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                  />
                  <label htmlFor="isAvailable" className="text-xs font-bold text-slate-800 cursor-pointer">
                    Set Rider Online (Active for immediate order assignment)
                  </label>
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md shadow-emerald-500/25 border border-emerald-500 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <FiSave className="w-3.5 h-3.5" />
                    <span>{modalLoading ? 'Saving...' : editingRider ? 'Save Changes' : 'Register Rider'}</span>
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
