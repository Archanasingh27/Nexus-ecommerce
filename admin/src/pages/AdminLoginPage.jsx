import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { FiShield, FiLock, FiMail, FiArrowRight, FiKey } from 'react-icons/fi';

export const AdminLoginPage = () => {
  const [email, setEmail] = useState('admin@nexus.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate('/');
    }
  };

  const handle1ClickAdmin = async () => {
    setEmail('admin@nexus.com');
    setPassword('password123');
    setLoading(true);
    const result = await login('admin@nexus.com', 'password123');
    setLoading(false);
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-white via-orange-50/40 to-amber-50/30 px-4 py-12 relative overflow-hidden">
      
      {/* Ambient glass glows */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-md glass-card p-8 sm:p-10 shadow-2xl space-y-6 relative z-10 border border-orange-200/80">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-sky-100 flex items-center justify-center border border-sky-300 shadow-md mx-auto">
            <FiShield className="w-7 h-7 text-[#78350f]" />
          </div>
          <h1 className="text-2xl font-black text-[#78350f] tracking-tight">NEXUS COMMAND CENTER</h1>
          <p className="text-xs text-slate-500 font-medium">
            Administrative access for catalog management, orders, and telemetry.
          </p>
        </div>

        {/* YELLOW BUTTON: 1-Click Quick Admin Button */}
        <button
          type="button"
          onClick={handle1ClickAdmin}
          className="w-full p-3.5 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-amber-400/20 active:scale-98 border border-amber-300"
        >
          <FiKey className="w-4 h-4 text-slate-950" />
          <span>⚡ 1-Click Admin Access (admin@nexus.com)</span>
        </button>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-orange-200/80"></div>
          <span className="flex-shrink mx-4 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            Or Enter Credentials
          </span>
          <div className="flex-grow border-t border-orange-200/80"></div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Admin Email</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nexus.com"
                className="w-full px-4 py-2.5 bg-white/80 border border-orange-200 focus:bg-white focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-medium transition-colors shadow-2xs"
              />
              <FiMail className="absolute right-3.5 top-1/2 -translate-y-1/2 text-orange-400 w-4 h-4" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-white/80 border border-orange-200 focus:bg-white focus:border-orange-500 rounded-xl text-xs text-slate-900 outline-none font-medium transition-colors shadow-2xs"
              />
              <FiLock className="absolute right-3.5 top-1/2 -translate-y-1/2 text-orange-400 w-4 h-4" />
            </div>
          </div>

          {/* GREEN/ORANGE ACTION BUTTON: Sign In */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer border border-orange-400"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            <FiArrowRight className="w-4 h-4 text-white" />
          </button>
        </form>

        <div className="text-center pt-3 border-t border-orange-100">
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-700 font-bold transition-colors inline-flex items-center gap-1"
          >
            ← Return to Customer Storefront
          </a>
        </div>

      </div>
    </div>
  );
};
