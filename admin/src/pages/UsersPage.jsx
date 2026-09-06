import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { EditUserModal } from '../components/EditUserModal';
import {
  FiUsers,
  FiShield,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiRefreshCw,
} from 'react-icons/fi';

export const UsersPage = () => {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data.users || []);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load user records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId, name) => {
    if (window.confirm(`Are you sure you want to delete user account "${name}"?`)) {
      try {
        await api.delete(`/users/${userId}`);
        addToast(`User "${name}" removed successfully`, 'info');
        fetchUsers();
      } catch (err) {
        addToast(err.response?.data?.message || 'Failed to delete user', 'error');
      }
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Customer & User Management
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            View registered customer accounts, manage details, and administer account records.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="p-2.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl border border-blue-200 hover:border-blue-600 transition-all shadow-2xs self-start sm:self-auto cursor-pointer"
          title="Refresh user list"
        >
          <FiRefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Search in Glass Style */}
      <div className="glass-panel rounded-2xl p-4 flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer name or email..."
            className="w-full bg-white/80 border border-orange-200/80 focus:bg-white focus:border-orange-500 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-900 outline-none font-medium transition-colors"
          />
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-bold text-slate-500 hidden sm:inline">
          Total Users: {users.length}
        </span>
      </div>

      {/* Users Table in Glass Panel */}
      <div className="glass-panel rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-orange-50/50 text-slate-500 text-[10px] uppercase font-bold border-b border-orange-100">
              <tr>
                <th className="py-3.5 px-4">User Details</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Role Access</th>
                <th className="py-3.5 px-4">Orders Placed</th>
                <th className="py-3.5 px-4">Registered Date</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-100/40">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading users database...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-bold">
                    No users matching search query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-orange-50/30 transition-colors">
                    
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 bg-slate-50 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{u.name}</div>
                          <div className="text-[10px] text-slate-400">{u.phone || 'No phone set'}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      {u.email}
                    </td>

                    <td className="py-3.5 px-4">
                      {u.role === 'admin' ? (
                        <span className="bg-amber-400 text-slate-950 border border-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs">
                          <FiShield className="w-3 h-3 text-slate-950" /> Admin
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                          Customer
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-black text-slate-900">
                      {u.orderCount || 0} orders
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* EDIT ICON BUTTON */}
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setIsEditModalOpen(true);
                          }}
                          className="p-2 rounded-xl bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 border border-blue-200 hover:border-blue-600 transition-all cursor-pointer shadow-2xs"
                          title="Edit User"
                        >
                          <FiEdit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* DELETE ICON BUTTON (Protected for Master Admin) */}
                        {u.email !== 'admin@nexus.com' && (
                          <button
                            onClick={() => handleDeleteUser(u._id, u.name)}
                            className="p-2 rounded-xl bg-red-50 hover:bg-red-600 hover:text-white text-red-600 border border-red-200 hover:border-red-600 transition-all cursor-pointer shadow-2xs"
                            title="Delete User"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSaved={fetchUsers}
      />

    </div>
  );
};
