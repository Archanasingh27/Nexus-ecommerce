import React from 'react';
import { FiTruck, FiShield, FiArrowRight } from 'react-icons/fi';

export const DeliveryBanner = () => {
  return (
    <section className="bg-gradient-to-r from-[#fae125] via-yellow-400 to-[#0d9488] text-slate-950 py-2.5 px-4 border-y border-yellow-400/50 shadow-xs font-semibold">
      <div className="w-full max-w-[1620px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3 text-xs sm:text-sm">

        {/* Left: Fast Delivery Guarantee */}
        <div className="flex items-center gap-3 flex-wrap justify-center md:justify-start">
          <div className="flex items-center gap-2 bg-[#0d9488] text-white px-3 py-1.5 rounded-full border border-teal-700 shadow-xs">
            <FiTruck className="text-[#fae125] w-4 h-4 shrink-0" />
            <span className="text-xs">Fast Express Dispatch within <strong className="text-[#fae125] font-black">24 Hours</strong></span>
          </div>
        </div>

        {/* Right: Perks & Guarantees */}
        <div className="flex items-center gap-6 text-xs text-slate-950 font-black">
          <div className="flex items-center gap-1.5">
            <FiTruck className="text-slate-950 w-4 h-4" />
            <span>Free Express over ₹1,499</span>
          </div>
          <div className="hidden lg:flex items-center gap-1.5">
            <FiShield className="text-[#0d9488] w-4 h-4" />
            <span>100% Genuine Certified</span>
          </div>
          <a
            href="#why-choose-us"
            className="flex items-center gap-1 text-slate-950 hover:text-white font-black transition-colors cursor-pointer"
          >
            <span>Learn More</span>
            <FiArrowRight className="w-3 h-3 text-slate-950" />
          </a>
        </div>

      </div>
    </section>
  );
};
