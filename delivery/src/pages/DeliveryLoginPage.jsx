import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTruck, FiMail, FiLock, FiArrowRight, FiShield } from 'react-icons/fi';
import { useDeliveryAuth } from '../context/DeliveryAuthContext';

export const DeliveryLoginPage = () => {
  const { login } = useDeliveryAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-white via-orange-50/30 to-amber-50/20 flex flex-col items-center justify-center p-4 text-slate-900 relative overflow-hidden">
      
      {/* Ambient glowing orbs matching Admin */}
      <div className="absolute top-10 right-1/4 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-sm glass-card p-6 sm:p-8 space-y-6 relative z-10">
        
        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-center mx-auto shadow-glow-orange font-black border border-orange-400">
            <FiTruck className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div className="flex items-center justify-center gap-2 pt-1">
            <span className="text-xl font-black tracking-tight text-[#78350f]">NEXUS</span>
            <span className="text-[10px] bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black px-2.5 py-0.5 rounded-full shadow-xs">
              RIDER PORTAL
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Sign in to accept deliveries, view GPS navigation, and track live payouts.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1">Rider Email</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rider@nexus.com"
                className="w-full bg-white/80 backdrop-blur-md border border-orange-200/70 focus:border-orange-500 focus:bg-white text-xs rounded-xl py-2.5 pl-10 pr-4 text-slate-900 placeholder-slate-400 font-bold shadow-xs outline-none transition-all"
              />
              <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-500 w-4 h-4" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/80 backdrop-blur-md border border-orange-200/70 focus:border-orange-500 focus:bg-white text-xs rounded-xl py-2.5 pl-10 pr-4 text-slate-900 placeholder-slate-400 font-bold shadow-xs outline-none transition-all"
              />
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-500 w-4 h-4" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-98 text-white text-xs font-black rounded-xl shadow-glow-orange transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50 border border-orange-400"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
            <FiArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Credentials Helper */}
        <div className="p-3.5 bg-orange-50/50 border border-orange-200/70 rounded-2xl text-[11px] text-slate-600 space-y-1">
          <div className="flex items-center gap-1.5 font-black text-slate-800">
            <FiShield className="w-3.5 h-3.5 text-orange-500" />
            <span>Demo Partner Credentials:</span>
          </div>
          <div className="text-slate-900 font-medium"><code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-orange-200 text-orange-800">rider@nexus.com</code> / <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-orange-200 text-orange-800">password123</code></div>
        </div>

      </div>
    </div>
  );
};
