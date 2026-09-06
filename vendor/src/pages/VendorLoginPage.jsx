import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiArrowRight, FiShoppingBag, FiCheckCircle } from 'react-icons/fi';
import { useVendorAuth } from '../context/VendorAuthContext';
import { useToast } from '../context/ToastContext';

export const VendorLoginPage = () => {
  const { login } = useVendorAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      addToast('Welcome back to your Vendor Command Center!', 'success');
      navigate('/');
    } catch (err) {
      addToast(err.response?.data?.message || 'Invalid vendor credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);
    try {
      await login(demoEmail, demoPass);
      addToast('Logged in as Demo Vendor Merchant!', 'success');
      navigate('/');
    } catch (err) {
      addToast('Failed to login with demo account', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-white via-orange-50/40 to-amber-50/30">
      {/* Background Ambience Orbs */}
      <div className="absolute top-10 right-1/4 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-md space-y-6">
        {/* Branding Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-orange-500/25 border-2 border-white">
            <FiShoppingBag className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">NEXUS Merchant Hub</h1>
          <p className="text-xs text-slate-500 font-medium">Vendor Order Fulfillment & Catalog Management</p>
        </div>

        {/* Form Card */}
        <div className="glass-card p-6 sm:p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Registered Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vendor@nexus.com"
                  className="w-full px-4 py-2.5 pl-10 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-bold transition-all"
                />
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Account Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pl-10 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-bold transition-all"
                />
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Vendor Hub'}</span>
              <FiArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick 1-Click Demo Logins */}
          <div className="pt-4 border-t border-orange-100 space-y-2.5">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 text-center">
              Quick 1-Click Demo Logins
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('vendor@nexus.com', 'password123')}
                className="p-2.5 bg-orange-50 hover:bg-orange-100/80 border border-orange-200 rounded-xl text-left transition-colors cursor-pointer"
              >
                <div className="text-[11px] font-bold text-slate-800 truncate">Apex Hardware</div>
                <div className="text-[9px] text-orange-600 font-semibold">Tools & Fasteners</div>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('decor@nexus.com', 'password123')}
                className="p-2.5 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 rounded-xl text-left transition-colors cursor-pointer"
              >
                <div className="text-[11px] font-bold text-slate-800 truncate">Prime Interiors</div>
                <div className="text-[9px] text-amber-700 font-semibold">Lighting & Decor</div>
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-500 font-medium">
              Want to sell on NEXUS?{' '}
              <Link to="/register" className="text-orange-600 font-bold hover:underline">
                Register as Merchant
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
