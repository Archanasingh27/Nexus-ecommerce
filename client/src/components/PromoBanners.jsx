import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiHeadphones, FiZap } from 'react-icons/fi';

// Banner 1: Audio & Tech (Light Sage Green with #fae125 Badge & #0d9488 Button)
export const PromoBannerOne = () => {
  return (
    <div className="w-full max-w-[1620px] mx-auto px-6 sm:px-8 lg:px-12 my-10 sm:my-14 lg:my-16">
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-slate-900 shadow-md border border-emerald-200 bg-gradient-to-r from-[#ecfdf5] via-[#d1fae5] to-[#a7f3d0]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#fae125] text-slate-950 font-black text-[11px] sm:text-xs uppercase tracking-wider rounded-full shadow-2xs border border-yellow-400 flex-wrap">
              <span>🎧 HIGH-RES AUDIO FLASH DROP • 35% OFF</span>
            </span>
            <h3 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight text-slate-900 leading-snug break-words">
              Immersive Spatial Audio & ANC Headphones
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 font-medium break-words leading-relaxed">
              Experience audiophile-grade titanium drivers, 60h battery life, and studio-grade active noise cancellation.
            </p>
          </div>

          <Link
            to="/shop?category=audio-sound"
            className="self-start md:self-auto inline-flex items-center justify-center px-6 py-3 bg-[#0d9488] hover:bg-teal-700 text-white font-black text-xs rounded-2xl shadow-md transition-all shrink-0 border border-teal-700 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>Explore Audio Deals</span>
            <FiArrowRight className="w-4 h-4 ml-1.5 text-white" />
          </Link>
        </div>

        {/* Ambient Warm Light Accent */}
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/60 rounded-full blur-2xl pointer-events-none"></div>
      </div>
    </div>
  );
};

// Banner 2: Flagship Tech & Wearables (Light Warm Brown / Caramel Sand with #0d9488 Button)
export const PromoBannerTwo = () => {
  return (
    <div className="w-full max-w-[1620px] mx-auto px-6 sm:px-8 lg:px-12 my-10 sm:my-14 lg:my-16">
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-slate-900 shadow-md border border-amber-200 bg-gradient-to-r from-[#fffbeb] via-[#fef3c7] to-[#fde68a]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#fae125] text-slate-950 font-black text-[11px] sm:text-xs uppercase tracking-wider rounded-full shadow-2xs border border-yellow-400 flex-wrap">
              <span>⚡ ULTRA TECH SHOWCASE • NEXT-GEN DROPS</span>
            </span>
            <h3 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight text-slate-900 leading-snug break-words">
              Flagship 5G Smartphones & Smart Wearables
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 font-medium break-words leading-relaxed">
              Get up to ₹15,000 instant trade-in value, Snapdragon compute engines, and 4K optical camera hardware.
            </p>
          </div>

          <Link
            to="/shop?category=smartphones-tech"
            className="self-start md:self-auto inline-flex items-center justify-center px-6 py-3 bg-[#0d9488] hover:bg-teal-700 text-white font-black text-xs rounded-2xl shadow-md transition-all shrink-0 border border-teal-700 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>Shop Smart Tech</span>
            <FiArrowRight className="w-4 h-4 ml-1.5 text-white" />
          </Link>
        </div>

        {/* Ambient Warm Accent */}
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/60 rounded-full blur-2xl pointer-events-none"></div>
      </div>
    </div>
  );
};

export const PromoBanners = PromoBannerOne;
export default PromoBannerOne;
