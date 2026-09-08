import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiPhone, FiMapPin, FiSave, FiLock, FiPackage } from 'react-icons/fi';

export const ProfilePage = () => {
  const { user, isAuthenticated, loading: authLoading, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate('/auth?redirect=profile');
      return;
    }
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAvatar(user.avatar || '');
      setStreet(user.address?.street || '');
      setCity(user.address?.city || 'Indore');
      setState(user.address?.state || 'Madhya Pradesh');
      setPostalCode(user.address?.postalCode || '452010');
    }
  }, [user, isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      name,
      email,
      phone,
      avatar,
      address: { street, city, state, postalCode },
    };
    if (password) {
      payload.password = password;
    }
    await updateProfile(payload);
    setLoading(false);
    setPassword('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Account Settings & Address Book
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your personal details and primary shipping destination.
        </p>
      </div>

      {/* Quick Link to My Orders */}
      <div className="p-4 bg-orange-50/90 rounded-3xl border border-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
            <FiPackage className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-black text-slate-900">My Orders</div>
            <div className="text-[11px] text-slate-600 font-medium">View your recent and past order history</div>
          </div>
        </div>
        <Link
          to="/orders"
          className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs rounded-xl shadow-xs transition-all self-start sm:self-auto"
        >
          View My Orders →
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        
        {/* User Card Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100 mb-6">
          <img
            src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
            alt={name}
            className="w-16 h-16 rounded-full object-cover border-2 border-brand-500/40 shadow-sm"
          />
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">{name}</h2>
            <p className="text-xs text-slate-500">{email}</p>
            <span className="inline-block mt-1 text-[10px] font-bold bg-brand-50 text-brand-700 px-2 py-0.5 rounded-md border border-brand-200">
              {user?.role === 'admin' ? 'Administrator' : 'Customer Account'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-brand-500 font-semibold"
                />
                <FiUser className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-brand-500 font-semibold"
                />
                <FiMail className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Phone Number</label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-brand-500 font-semibold"
                />
                <FiPhone className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Avatar Image URL</label>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-brand-500 font-semibold"
              />
            </div>
          </div>

          {/* Address Section */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
              <FiMapPin className="text-brand-600 w-4 h-4" />
              <span>Primary Shipping Address</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Street Address / Locality in Indore
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. Plot 24, Scheme 78, Vijay Nagar"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-brand-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">City (Indore Only)</label>
                  <input
                    type="text"
                    value={city || 'Indore'}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Indore"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-brand-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">State</label>
                  <input
                    type="text"
                    value={state || 'Madhya Pradesh'}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Madhya Pradesh"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-brand-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Indore Pincode</label>
                  <input
                    type="text"
                    value={postalCode || '452010'}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="452010"
                    maxLength={6}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-brand-500 font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="pt-4 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-600 block mb-1">
              Change Password (leave blank to keep current)
            </label>
            <div className="relative max-w-sm">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password (min 6 characters)"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-brand-500 font-semibold"
              />
              <FiLock className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all"
            >
              <FiSave className="w-4 h-4" />
              <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};
