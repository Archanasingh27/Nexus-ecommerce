import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiZap, FiClock, FiArrowRight } from 'react-icons/fi';
import { ProductCard } from './ProductCard';

export const TrendingDeals = ({ deals = [], flashSaleConfig, onQuickView }) => {
  const calculateRemaining = () => {
    if (!flashSaleConfig?.endTime) {
      return { days: 0, hours: 8, minutes: 42, seconds: 19, expired: false };
    }
    const diff = new Date(flashSaleConfig.endTime) - new Date();
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return { days, hours, minutes, seconds, expired: false };
  };

  const [timeLeft, setTimeLeft] = useState(calculateRemaining);

  useEffect(() => {
    setTimeLeft(calculateRemaining());
    const timer = setInterval(() => {
      setTimeLeft(calculateRemaining());
    }, 1000);
    return () => clearInterval(timer);
  }, [flashSaleConfig?.endTime]);

  if (!deals || deals.length === 0) return null;

  const sectionTitle = flashSaleConfig?.title || 'Flash Sales & Hot Deals';
  const sectionTag = flashSaleConfig?.tag || 'Limited-Time Deals';
  const isClockActive = flashSaleConfig?.isActive !== false;

  return (
    <section className="glass-panel py-10 sm:py-14 my-10 sm:my-14 lg:my-16 relative overflow-hidden">
      <div className="w-full max-w-[1620px] mx-auto px-6 sm:px-8 lg:px-12">

        {/* Section Header with Countdown Timer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fae125] text-black border border-yellow-300 text-xs font-black uppercase tracking-wider mb-2 shadow-xs">
              <FiZap className="w-3.5 h-3.5 text-black fill-black animate-pulse" />
              <span>{sectionTag}</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight break-words">
              {sectionTitle}
            </h2>
          </div>

          {/* Countdown Clock (Glassmorphism Pill) */}
          {isClockActive && (
            <div className="flex items-center gap-2 sm:gap-3 glass-pill px-3.5 sm:px-5 py-2 sm:py-3 rounded-2xl shadow-sm flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-700">
                <FiClock className="w-4 h-4 text-[#0d9488]" />
                <span>{timeLeft.expired ? 'Deals Ended' : 'Deals End In:'}</span>
              </div>
              <div className="flex items-center gap-1 font-mono text-xs font-black">
                {timeLeft.days > 0 && (
                  <>
                    <span className="w-7 h-7 bg-[#fae125] text-black border border-yellow-300 rounded-lg flex items-center justify-center shadow-xs">
                      {String(timeLeft.days).padStart(2, '0')}d
                    </span>
                    <span className="text-slate-700 font-bold">:</span>
                  </>
                )}
                <span className="w-7 h-7 bg-[#fae125] text-black border border-yellow-300 rounded-lg flex items-center justify-center shadow-xs">
                  {String(timeLeft.hours).padStart(2, '0')}h
                </span>
                <span className="text-slate-700 font-bold">:</span>
                <span className="w-7 h-7 bg-[#fae125] text-black border border-yellow-300 rounded-lg flex items-center justify-center shadow-xs">
                  {String(timeLeft.minutes).padStart(2, '0')}m
                </span>
                <span className="text-slate-700 font-bold">:</span>
                <span className="w-7 h-7 bg-[#0d9488] text-white rounded-lg flex items-center justify-center shadow-xs">
                  {String(timeLeft.seconds).padStart(2, '0')}s
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Product Cards Grid with Wide Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {deals.slice(0, 4).map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onQuickView={onQuickView}
              showDealBadge={true}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
