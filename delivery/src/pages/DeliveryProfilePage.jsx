import React from 'react';
import {
  FiUser,
  FiPhone,
  FiMail,
  FiTruck,
  FiMapPin,
  FiShield,
  FiLogOut,
  FiCheckCircle,
  FiAward,
  FiActivity,
} from 'react-icons/fi';
import { useDeliveryAuth } from '../context/DeliveryAuthContext';

export const DeliveryProfilePage = () => {
  const { rider, logout, toggleDuty } = useDeliveryAuth();

  if (!rider) return null;

  const isOnline = rider.isAvailable !== false;

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
          <FiUser className="w-5 h-5 text-orange-500" />
          Rider Profile & Fleet Settings
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Manage verified partner credentials, assigned service territories, and vehicle details.
        </p>
      </div>

      {/* Main Glass Card Profile */}
      <div className="glass-card p-6 sm:p-8 space-y-6">
        
        {/* Avatar & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-5 border-b border-orange-100">
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={rider.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt=""
                className="w-16 h-16 rounded-2xl object-cover border-2 border-orange-500 bg-white shadow-xs"
              />
              <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                isOnline ? 'bg-orange-500 shadow-glow-orange' : 'bg-slate-400'
              }`} />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-800">{rider.name}</h2>
              <div className="text-xs text-slate-500 font-mono font-medium">{rider.email}</div>
              <div className="flex items-center gap-2 pt-0.5">
                <span className="text-[10px] font-semibold uppercase bg-orange-100/90 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-md shadow-2xs">
                  Verified Partner
                </span>
                <span className="text-[10px] font-semibold uppercase bg-blue-100/90 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md shadow-2xs">
                  Express Fleet
                </span>
              </div>
            </div>
          </div>

          {/* Quick Duty Toggle in Profile */}
          <div className="p-3 bg-orange-50/50 border border-orange-200/70 rounded-2xl flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-slate-800">Duty Status</div>
              <div className="text-[11px] text-slate-500 font-medium">
                {isOnline ? 'Online • Ready for dispatches' : 'Offline • Dispatches paused'}
              </div>
            </div>

            <button
              onClick={toggleDuty}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                isOnline
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-glow-orange border-orange-400'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              {isOnline ? 'Go Offline' : 'Go Online'}
            </button>
          </div>

        </div>

        {/* Detailed Grid Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
          
          <div className="p-4 bg-white/80 rounded-2xl border border-orange-200/60 space-y-1 shadow-2xs">
            <div className="flex items-center gap-1.5 font-semibold text-slate-500 text-[10px] uppercase">
              <FiPhone className="text-orange-500" />
              <span>Contact Number</span>
            </div>
            <div className="text-sm font-bold text-slate-800">{rider.phone || 'No phone set'}</div>
          </div>

          <div className="p-4 bg-white/80 rounded-2xl border border-orange-200/60 space-y-1 shadow-2xs">
            <div className="flex items-center gap-1.5 font-semibold text-slate-500 text-[10px] uppercase">
              <FiTruck className="text-blue-600" />
              <span>Vehicle Details</span>
            </div>
            <div className="text-sm font-bold text-slate-800">
              {rider.vehicleType || 'Bike'} {rider.vehicleNumber && `(${rider.vehicleNumber})`}
            </div>
          </div>

          <div className="p-4 bg-white/80 rounded-2xl border border-orange-200/60 space-y-1 shadow-2xs">
            <div className="flex items-center gap-1.5 font-semibold text-slate-500 text-[10px] uppercase">
              <FiMapPin className="text-emerald-600" />
              <span>Service Location</span>
            </div>
            <div className="text-sm font-bold text-slate-800">{rider.serviceCity || 'Indore'}</div>
          </div>

          <div className="p-4 bg-white/80 rounded-2xl border border-orange-200/60 space-y-1 shadow-2xs">
            <div className="flex items-center gap-1.5 font-semibold text-slate-500 text-[10px] uppercase">
              <FiCheckCircle className="text-purple-600" />
              <span>Assigned Pincodes</span>
            </div>
            <div className="text-sm font-bold text-slate-800 truncate">
              {rider.servicePincodes?.length > 0 ? rider.servicePincodes.join(', ') : 'Open Radius'}
            </div>
          </div>

        </div>

        {/* KYC Documents & Cloud Upload */}
        <div className="p-5 bg-orange-50/40 rounded-2xl border border-orange-200/70 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiShield className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-bold text-slate-900">KYC & Vehicle Documents Verification</span>
            </div>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Approved
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-white rounded-xl border border-orange-200/50 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">Driving License (DL)</div>
                <div className="text-[10px] text-slate-400">Verified & Active on Cloud</div>
              </div>
              <span className="text-[10px] font-bold text-emerald-600">✓ On File</span>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-orange-200/50 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">Vehicle RC Certificate</div>
                <div className="text-[10px] text-slate-400">Two-Wheeler Registered</div>
              </div>
              <span className="text-[10px] font-bold text-emerald-600">✓ Verified</span>
            </div>
          </div>
        </div>

        {/* Security & Sign Out Section */}
        <div className="pt-3 border-t border-orange-100 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-400 font-medium">
            Authenticated with secure end-to-end encrypted session.
          </div>

          <button
            onClick={logout}
            className="px-4 py-2 bg-[#0d9488] hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-glow-teal border border-teal-500 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <FiLogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>

    </div>
  );
};
