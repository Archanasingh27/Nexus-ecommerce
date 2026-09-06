import React from 'react';
import { FiTruck, FiShield, FiRefreshCw, FiLock } from 'react-icons/fi';

const features = [
  {
    icon: <FiTruck className="w-5 h-5 text-white" />,
    title: 'Free Express Shipping',
    desc: 'On all orders above $150. Tracked live with same-day dispatch available.',
  },
  {
    icon: <FiShield className="w-5 h-5 text-white" />,
    title: '100% Authentic Guarantee',
    desc: 'Every item is brand certified with minimum 2-year warranty protection.',
  },
  {
    icon: <FiRefreshCw className="w-5 h-5 text-white" />,
    title: '30-Day Easy Returns',
    desc: 'Hassle-free instant returns and exchanges with zero restocking fees.',
  },
  {
    icon: <FiLock className="w-5 h-5 text-white" />,
    title: '256-Bit Encrypted Payments',
    desc: 'Bank-grade SSL checkout supporting Cards, PayPal, and Apple Pay.',
  },
];

export const WhyChooseUs = () => {
  return (
    <section id="why-choose-us" className="glass-panel text-slate-900 py-12 sm:py-16 my-12 sm:my-16 lg:my-20 relative overflow-hidden">
      {/* Soft ambient glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#fae125]/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-[1620px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10">

        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-1.5">
          <span className="text-xs font-black uppercase tracking-widest glass-pill bg-[#fae125]/90 text-black px-3.5 py-1 rounded-full shadow-xs border border-yellow-300 inline-block mb-1">
            The Nexus Promise
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Why Discerning Shoppers Choose Us
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm font-semibold mt-1">
            Engineered for speed, built on trust, and committed to high standard product excellence.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl glass-card flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#0d9488] text-white border border-teal-700 flex items-center justify-center mb-4 font-black shadow-md shadow-teal-600/20 group-hover:scale-105 transition-transform">
                  {feat.icon}
                </div>
                <h3 className="text-base font-black text-slate-900 mb-1.5">{feat.title}</h3>
                <p className="text-xs text-slate-600 font-semibold leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
