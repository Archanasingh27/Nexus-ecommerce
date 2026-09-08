import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowRight,
  FiShield,
  FiZap,
  FiChevronLeft,
  FiChevronRight,
  FiTag,
  FiPercent,
  FiPlay,
} from 'react-icons/fi';
import api from '../api/axios';

const defaultSlides = [
  {
    tag: '⚡ INDUSTRIAL GRADE MATERIALS',
    badgeText: 'ISO 9001 Certified Mega Warehouse',
    title: 'Next-Gen Building & Interior Architectural Materials',
    subtitle: 'Direct contractor supply for UltraTech Weather-Shield Cement, CenturyPly Marine Grade Plywood, and Italian Vitrified Tiles.',
    highlightBadge: { label: 'Contractor Rate', value: '₹435 / Bag' },
    buttonText: 'Explore Building Drops',
    link: '/shop?category=civil-interiors',
    mediaUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?w=1000&auto=format&fit=crop&q=80',
    bgGradient: 'from-[#0f766e] via-[#0d9488] to-[#115e59]',
    accentColor: 'from-[#fae125] via-yellow-200 to-teal-100',
  },
  {
    tag: '⚡ ADVANCED ELECTRICAL SYSTEMS',
    badgeText: 'IS 694 Fire Retardant Certified',
    title: 'Havells FR Pure Copper Wires & Schneider Glass Switch Plates',
    subtitle: 'Zero fire-risk wiring, 15W recessed COB architectural downlights, and smart distribution panel automation.',
    highlightBadge: { label: 'Project Wholesale', value: 'Flat 25% OFF' },
    buttonText: 'Shop Electrical Systems',
    link: '/shop?category=electrical',
    mediaUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=1000&auto=format&fit=crop&q=80',
    bgGradient: 'from-[#0d9488] via-[#14b8a6] to-[#0f766e]',
    accentColor: 'from-[#fae125] via-yellow-300 to-white',
  },
  {
    tag: '🚿 SANITARY & SMART SECURITY',
    badgeText: '10-Year Comprehensive Warranty',
    title: 'Astral CPVC Pro Pipes, Jaquar Faucets & Yale Biometric Locks',
    subtitle: 'High-pressure 93°C hot-cold plumbing, rimless wall-hung WC commodes, and 360° fingerprint smart mortise security.',
    highlightBadge: { label: 'Exclusive Drop', value: 'Save Up To 35%' },
    buttonText: 'Discover Plumbing & Bath',
    link: '/shop?category=plumbing-sanitary-bath',
    mediaUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1000&auto=format&fit=crop&q=80',
    bgGradient: 'from-[#115e59] via-[#0d9488] to-[#042f2e]',
    accentColor: 'from-[#fae125] via-amber-200 to-teal-100',
  },
];

export const HeroBanner = ({ heroSlides = [] }) => {
  const [slides, setSlides] = useState(heroSlides.length > 0 ? heroSlides : defaultSlides);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch dynamic hero slides from backend if not passed via props
  useEffect(() => {
    if (heroSlides && heroSlides.length > 0) {
      setSlides(heroSlides);
      return;
    }

    const fetchHeroAds = async () => {
      try {
        const { data } = await api.get('/advertisements?placement=hero_slide');
        if (data.advertisements && data.advertisements.length > 0) {
          setSlides(data.advertisements);
        }
      } catch (err) {
        console.error('Failed to load backend hero ads:', err);
      }
    };

    fetchHeroAds();
  }, [heroSlides]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[currentSlide] || slides[0] || defaultSlides[0];

  const handlePrev = (e) => {
    e.preventDefault();
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.preventDefault();
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const bgGradient = slide.bgGradient?.includes('from-')
    ? slide.bgGradient
    : 'from-[#0f766e] via-[#0d9488] to-[#115e59]';

  return (
    <section className="relative overflow-hidden rounded-3xl mt-2 sm:mt-3 mb-10 sm:mb-14 w-full max-w-[1620px] mx-auto px-4 sm:px-8 lg:px-12">
      <div className={`relative rounded-3xl bg-gradient-to-r ${bgGradient} p-4 sm:p-10 lg:p-14 text-white shadow-xl border border-teal-300/40 transition-all duration-700`}>

        {/* Yellow #fae125 & Teal ambient glow background */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-[#fae125]/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-teal-300/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">

          {/* Left Text & CTA (7 cols) */}
          <div className="lg:col-span-7 space-y-3 sm:space-y-5">

            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fae125] text-slate-950 border border-yellow-300 text-[10px] sm:text-xs font-black tracking-wide uppercase shadow-sm">
                <span>{slide.tag || '⚡ SPECIAL FEATURE'}</span>
              </span>

              {slide.badgeText && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 text-[10px] sm:text-xs font-bold shadow-2xs">
                  <FiShield className="w-3.5 h-3.5 text-[#fae125]" />
                  <span>{slide.badgeText}</span>
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight break-words">
              {slide.title}
            </h1>

            {slide.subtitle && (
              <p className="text-teal-50 text-xs sm:text-sm md:text-base max-w-xl leading-relaxed font-medium break-words">
                {slide.subtitle}
              </p>
            )}

            {/* Offer / Highlight Badge */}
            {slide.highlightBadge?.value && (
              <div className="flex items-center gap-2.5 pt-1 flex-wrap">
                <span className="bg-[#fae125] text-slate-950 font-black text-xs sm:text-sm px-3.5 sm:px-4 py-1.5 rounded-2xl border border-yellow-300 shadow-md">
                  {slide.highlightBadge.label ? `${slide.highlightBadge.label}: ` : ''}{slide.highlightBadge.value}
                </span>
                {slide.couponCode && (
                  <span className="bg-white/20 backdrop-blur-md text-white font-mono font-bold text-xs px-3 py-1.5 rounded-xl border border-white/30">
                    CODE: {slide.couponCode}
                  </span>
                )}
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-3">
              <Link
                to={slide.link || '/shop'}
                className="px-7 py-3.5 bg-[#fae125] hover:bg-yellow-300 text-slate-950 font-black rounded-2xl shadow-lg shadow-yellow-400/30 flex items-center gap-2 hover:gap-3 transition-all transform hover:-translate-y-0.5 cursor-pointer border border-yellow-400"
              >
                <span>{slide.buttonText || 'Shop This Deal'}</span>
                <FiArrowRight className="w-4 h-4 text-slate-950" />
              </Link>
            </div>

          </div>

          {/* Right Product Media Showcase (5 cols) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm sm:max-w-md aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/30 bg-slate-900 group">
              {slide.type === 'video' && slide.mediaUrl ? (
                <video
                  src={slide.mediaUrl}
                  poster={slide.posterUrl || slide.image}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <img
                  src={slide.mediaUrl || slide.image || 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?w=800'}
                  alt={slide.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
              )}

              {/* Media floating label */}
              {slide.badgeText && (
                <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md text-white text-xs font-black px-3.5 py-1.5 rounded-xl border border-white/20 shadow-md">
                  {slide.badgeText}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Carousel Prev / Next Controls */}
        {slides.length > 1 && (
          <div className="absolute bottom-4 right-6 sm:bottom-6 sm:right-8 flex items-center gap-2 z-20">
            <button
              type="button"
              onClick={handlePrev}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-[#fae125] hover:text-slate-950 text-white backdrop-blur-md flex items-center justify-center transition-all border border-white/30 shadow-md cursor-pointer"
              title="Previous Slide"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-[#fae125] hover:text-slate-950 text-white backdrop-blur-md flex items-center justify-center transition-all border border-white/30 shadow-md cursor-pointer"
              title="Next Slide"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Slide Indicator Dots */}
        {slides.length > 1 && (
          <div className="absolute bottom-6 left-8 sm:left-12 flex items-center gap-2 z-20">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${currentSlide === idx
                    ? 'w-8 bg-[#fae125]'
                    : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
