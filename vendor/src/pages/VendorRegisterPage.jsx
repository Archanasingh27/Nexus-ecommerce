import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiArrowRight, FiCheck, FiClock, FiCheckCircle, FiShield } from 'react-icons/fi';
import { useVendorAuth } from '../context/VendorAuthContext';
import { useToast } from '../context/ToastContext';

export const VendorRegisterPage = () => {
  const { register } = useVendorAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    storeName: '',
    storeDescription: '',
    taxId: '',
    street: 'Plot 18, Commercial Hub, Scheme 54',
    city: 'Indore',
    state: 'Madhya Pradesh',
    postalCode: '452010',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [registeredStore, setRegisteredStore] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.storeName) {
      addToast('Please complete all required registration fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        storeName: formData.storeName,
        storeDescription: formData.storeDescription,
        taxId: formData.taxId,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: 'India',
        },
      });

      setRegisteredStore(formData.storeName);
      setSubmitted(true);
      addToast('Merchant application submitted for Admin approval!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-white via-orange-50/40 to-amber-50/30">
        <div className="w-full max-w-lg space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="glass-card p-6 sm:p-8 text-center space-y-5 shadow-2xl border border-orange-200">
            {/* Status Icon */}
            <div className="relative inline-block">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-amber-50 border-2 border-amber-400 text-amber-600 flex items-center justify-center mx-auto shadow-md shadow-amber-500/10">
                <FiClock className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shadow-xs">
                <FiCheck className="w-3.5 h-3.5 stroke-[3]" />
              </span>
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                Application Received
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Pending Admin Approval
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                Your merchant application for <span className="font-extrabold text-orange-600">{registeredStore}</span> has been forwarded to the <span className="font-bold text-slate-800">NEXUS Central Admin</span> for verification.
              </p>
            </div>

            {/* Summary Highlights */}
            <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-200/80 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-semibold text-slate-500">Status:</span>
                <span className="font-black text-amber-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  Under Admin Review
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-semibold text-slate-500">Store Name:</span>
                <span className="font-bold text-slate-900">{registeredStore}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-semibold text-slate-500">Next Steps:</span>
                <span className="font-bold text-slate-900">Sign in after Admin approval</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <Link
                to="/login"
                className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs rounded-xl shadow-md transition-all text-center"
              >
                Go to Vendor Login
              </Link>
              <a
                href="http://localhost:5173"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl transition-all text-center"
              >
                Visit Storefront
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-white via-orange-50/40 to-amber-50/30">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-orange-500/25">
            <FiShoppingBag className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Merchant Partner Registration</h1>
          <p className="text-xs text-slate-500 font-medium">Join NEXUS Commerce and start selling your catalog items today</p>
        </div>

        {/* Card */}
        <div className="glass-card p-6 sm:p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Owner Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Rajesh Agrawal"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Store / Business Name *</label>
                <input
                  type="text"
                  required
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  placeholder="Apex Hardware & Tools"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Business Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="sales@apexhardware.com"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Account Password *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Contact Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98260 55443"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">GSTIN / Tax ID Number</label>
                <input
                  type="text"
                  value={formData.taxId}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                  placeholder="23AABCA1234F1Z8"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-medium uppercase"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Store Description</label>
              <textarea
                rows={2}
                value={formData.storeDescription}
                onChange={(e) => setFormData({ ...formData, storeDescription: e.target.value })}
                placeholder="Distributor of premium hardware, electrical supplies and industrial fittings..."
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-medium"
              />
            </div>

            {/* Warehouse Pickup Address */}
            <div className="p-3.5 bg-orange-50/60 rounded-2xl border border-orange-200/80 space-y-3">
              <span className="text-xs font-extrabold text-orange-950 block">Warehouse & Pickup Location</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Street Address</label>
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Pincode</label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none font-medium"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Creating Account...' : 'Complete Merchant Onboarding'}</span>
              <FiArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500 font-medium">
              Already a registered merchant?{' '}
              <Link to="/login" className="text-orange-600 font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
