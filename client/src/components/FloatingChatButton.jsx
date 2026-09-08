import React, { useState } from 'react';
import { FiMessageSquare, FiX, FiPhone, FiHeadphones, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export const FloatingChatButton = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);

  // If on auth or support page, don't overlap
  if (location.pathname.startsWith('/auth') || location.pathname.startsWith('/support')) {
    return null;
  }

  return (
    <>
      {/* Floating Bottom-Right Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
        {/* Quick Popover Menu */}
        {isOpen && (
          <div className="bg-white rounded-3xl p-4 shadow-2xl border-2 border-yellow-300 w-72 space-y-3 animate-in zoom-in-95 duration-150 mb-1">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0d9488] border border-teal-200 flex items-center justify-center font-bold">
                  <FiHeadphones className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">Admin Support & Chat</div>
                  <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Online (Central Desk)
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {/* Option 1: Live In-App Chat with Admin Support */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/support');
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#fffdf5] hover:bg-yellow-50 border border-yellow-300 transition-all text-left group cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold">
                    <FiMessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">Nexus Support Desk</div>
                    <div className="text-[10px] text-slate-500">Instant Help & Chat</div>
                  </div>
                </div>
                <FiArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-700" />
              </button>

              {/* Option 2: Phone Calling (Admin) */}
              <a
                href="tel:18004196398"
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all text-left group shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold">
                    <FiPhone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">Toll-Free Helpline</div>
                    <div className="text-[10px] text-slate-500">1800-419-6398</div>
                  </div>
                </div>
              </a>
            </div>
          </div>
        )}

        {/* Floating Bubble Icon */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-3 bg-[#0d9488] hover:bg-teal-700 text-white rounded-full font-black text-xs shadow-xl shadow-teal-600/30 border-2 border-white transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          title="Customer Chat & Support"
        >
          <FiMessageSquare className="w-5 h-5 text-[#fae125]" />
          <span className="hidden sm:inline">Help & Chat</span>
        </button>
      </div>
    </>
  );
};
