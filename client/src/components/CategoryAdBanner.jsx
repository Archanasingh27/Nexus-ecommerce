import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowRight,
  FiTag,
  FiZap,
  FiShield,
  FiPercent,
  FiCopy,
  FiPlay,
  FiPause,
  FiVolume2,
  FiVolumeX,
} from 'react-icons/fi';

const VideoBannerPlayer = ({ mediaUrl, posterUrl, badgeText, title }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.log('Autoplay was prevented, will play on interaction:', err);
          setIsPlaying(false);
        });
    }

    // Auto-play when visible in viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => { });
          setIsPlaying(true);
        } else {
          video.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [mediaUrl]);

  const togglePlay = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => { });
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  return (
    <div className="relative w-full max-w-xs sm:max-w-sm aspect-4/3 rounded-2xl overflow-hidden shadow-lg border-2 border-white bg-slate-900 group">
      <video
        ref={videoRef}
        src={mediaUrl}
        poster={posterUrl}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />

      {/* Top Badge */}
      <div className="absolute top-3 left-3 bg-slate-900/70 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-[10px] font-black flex items-center gap-1 border border-white/20 shadow-md">
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
        <span>{badgeText || '4K Video'}</span>
      </div>

      {/* Interactive Controls Overlay */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 z-10">
        <button
          type="button"
          onClick={toggleMute}
          className="w-7 h-7 rounded-lg bg-slate-900/75 hover:bg-slate-900 text-white backdrop-blur-md flex items-center justify-center transition-all border border-white/20 shadow-md cursor-pointer"
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? <FiVolumeX className="w-3.5 h-3.5" /> : <FiVolume2 className="w-3.5 h-3.5 text-[#fae125]" />}
        </button>

        <button
          type="button"
          onClick={togglePlay}
          className="w-7 h-7 rounded-lg bg-slate-900/75 hover:bg-slate-900 text-white backdrop-blur-md flex items-center justify-center transition-all border border-white/20 shadow-md cursor-pointer"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <FiPause className="w-3.5 h-3.5" /> : <FiPlay className="w-3.5 h-3.5 text-[#fae125] fill-[#fae125]" />}
        </button>
      </div>
    </div>
  );
};

export const CategoryAdBanner = ({ ad, index = 0 }) => {
  if (!ad) return null;

  // Determine type: 'video' | 'image' | 'simple'
  const adType = ad.type || (ad.isImageBanner ? 'image' : index % 2 === 0 ? 'image' : 'simple');

  // 1. VIDEO AD BANNER VARIANT (Autoplay Looped Video with Autoplay Hook & Controls)
  if (adType === 'video') {
    return (
      <div className="w-full max-w-[1620px] mx-auto px-6 sm:px-8 lg:px-12 my-10 sm:my-14 lg:my-16">
        <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 text-slate-900 shadow-md border ${ad.borderColor || 'border-green-200'} ${ad.bgGradient || 'bg-gradient-to-r from-[#f0fdf4] via-[#dcfce7] to-[#bbf7d0]'}`}>
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">

            {/* Left Content (7 cols) */}
            <div className="md:col-span-7 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#fae125] text-slate-900 font-black text-[11px] uppercase tracking-wider rounded-full shadow-2xs border border-yellow-400">
                  <span>{ad.tag || 'VIDEO SHOWCASE'}</span>
                </span>
                {ad.perk && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/90 text-slate-800 font-bold text-[11px] rounded-full border border-slate-200 shadow-2xs">
                    <FiShield className="w-3 h-3 text-[#0d9488]" />
                    {ad.perk}
                  </span>
                )}
              </div>

              <h4 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 leading-snug">
                {ad.title}
              </h4>

              <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed max-w-xl">
                {ad.subtitle}
              </p>

              <div className="pt-2">
                <Link
                  to={ad.link || '/shop'}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#0d9488] hover:bg-teal-700 text-white font-black text-xs rounded-2xl shadow-md border border-teal-700 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span>{ad.buttonText || 'Explore Drop'}</span>
                  <FiArrowRight className="w-4 h-4 text-white" />
                </Link>
              </div>
            </div>

            {/* Right Video Showcase (5 cols) with Guaranteed Autoplay */}
            <div className="md:col-span-5 flex justify-center md:justify-end">
              <VideoBannerPlayer
                mediaUrl={ad.mediaUrl || ad.videoUrl}
                posterUrl={ad.posterUrl || ad.image}
                badgeText={ad.badgeText}
                title={ad.title}
              />
            </div>

          </div>

          {/* Ambient Warm Glow */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/60 rounded-full blur-3xl pointer-events-none"></div>
        </div>
      </div>
    );
  }

  // 2. IMAGE BANNER VARIANT
  if (adType === 'image') {
    if (ad.layout === 'backdrop-glass') {
      return (
        <div className="w-full max-w-[1620px] mx-auto px-6 sm:px-8 lg:px-12 my-10 sm:my-14 lg:my-16">
          <div className="relative overflow-hidden rounded-3xl min-h-[250px] sm:min-h-[270px] flex items-center p-6 sm:p-10 shadow-lg border border-amber-200/80">
            {/* Background Photo */}
            <img
              src={ad.mediaUrl || ad.image}
              alt={ad.title}
              className="absolute inset-0 w-full h-full object-cover object-center scale-100 hover:scale-105 transition-transform duration-1000"
            />
            {/* Light 2-tone overlay with soft warm gradient */}
            <div className={`absolute inset-0 ${ad.bgGradient || 'bg-gradient-to-r from-[#fffbeb]/95 via-[#fef3c7]/85 to-[#fefce8]/60'}`}></div>

            {/* Content Box */}
            <div className="relative z-10 max-w-xl space-y-3 glass-card p-5 sm:p-7 shadow-lg">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="glass-pill inline-flex items-center gap-1 px-3 py-1 bg-[#fae125]/90 text-slate-950 font-black text-[11px] uppercase tracking-wider rounded-full shadow-xs border border-yellow-300">
                  <span>{ad.tag}</span>
                </span>
                {ad.badgeText && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#e5f3f3] text-teal-900 font-bold text-[11px] rounded-full border border-teal-200">
                    {ad.badgeText}
                  </span>
                )}
              </div>

              <h4 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 leading-tight">
                {ad.title}
              </h4>

              <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                {ad.subtitle}
              </p>

              <div className="pt-2">
                <Link
                  to={ad.link || '/shop'}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#0d9488] hover:bg-teal-700 text-white font-black text-xs rounded-2xl shadow-md border border-teal-700 transition-all hover:scale-105 active:scale-95"
                >
                  <span>{ad.buttonText || 'Explore Offer'}</span>
                  <FiArrowRight className="w-4 h-4 text-white" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Default Split-Image Banner
    return (
      <div className="w-full max-w-[1620px] mx-auto px-6 sm:px-8 lg:px-12 my-10 sm:my-14 lg:my-16">
        <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 text-slate-900 shadow-md border ${ad.borderColor || 'border-green-200'} ${ad.bgGradient || 'bg-gradient-to-r from-[#ecfdf5] via-[#d1fae5] to-[#a7f3d0]'}`}>
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">

            {/* Left Content (7 cols) */}
            <div className="md:col-span-7 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#fae125] text-slate-900 font-black text-[11px] uppercase tracking-wider rounded-full shadow-2xs border border-yellow-400">
                  <span>{ad.tag}</span>
                </span>
                {ad.perk && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/90 text-slate-800 font-bold text-[11px] rounded-full border border-slate-200 shadow-2xs">
                    <FiShield className="w-3 h-3 text-[#0d9488]" />
                    {ad.perk}
                  </span>
                )}
              </div>

              <h4 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 leading-snug">
                {ad.title}
              </h4>

              <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed max-w-xl">
                {ad.subtitle}
              </p>

              <div className="pt-2">
                <Link
                  to={ad.link || '/shop'}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#0d9488] hover:bg-teal-700 text-white font-black text-xs rounded-2xl shadow-md border border-teal-700 transition-all hover:scale-105 active:scale-95"
                >
                  <span>{ad.buttonText || 'Explore Offer'}</span>
                  <FiArrowRight className="w-4 h-4 text-white" />
                </Link>
              </div>
            </div>

            {/* Right Product Image (5 cols) */}
            <div className="md:col-span-5 flex justify-center md:justify-end">
              <div className="relative w-full max-w-xs sm:max-w-sm aspect-4/3 rounded-2xl overflow-hidden shadow-md border-2 border-white bg-white group">
                <img
                  src={ad.mediaUrl || ad.image}
                  alt={ad.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {ad.badgeText && (
                  <span className="absolute bottom-3 left-3 bg-[#fae125] text-slate-900 font-black text-[11px] px-3 py-1 rounded-xl shadow-sm border border-yellow-400">
                    {ad.badgeText}
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Ambient Warm Glow */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/60 rounded-full blur-3xl pointer-events-none"></div>
        </div>
      </div>
    );
  }

  // 3. SIMPLE PROMOTIONAL / COUPON CODE BANNER VARIANT
  return (
    <div className="w-full max-w-[1620px] mx-auto px-6 sm:px-8 lg:px-12 my-10 sm:my-14 lg:my-16">
      <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-9 text-slate-900 shadow-md border ${ad.borderColor || 'border-amber-200'} ${ad.bgGradient || 'bg-gradient-to-r from-[#fffbeb] via-[#fef3c7] to-[#fde68a]'}`}>

        {/* Background Geometric Accent Rings */}
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full border-8 border-white/40 pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-white/50 blur-xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">

          {/* Main Info */}
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#fae125] text-slate-900 font-black text-[11px] uppercase tracking-wider rounded-full shadow-2xs border border-yellow-400">
                <span>{ad.tag}</span>
              </span>
              {ad.couponCode && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/95 text-slate-900 font-mono font-black text-xs rounded-full border border-dashed border-amber-300 shadow-2xs">
                  <FiCopy className="w-3.5 h-3.5 text-[#0d9488]" />
                  <span>CODE: {ad.couponCode}</span>
                </div>
              )}
            </div>

            <h4 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 leading-tight">
              {ad.title}
            </h4>

            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
              {ad.subtitle}
            </p>

            {/* Quick Benefits Pill List */}
            {ad.perks && ad.perks.length > 0 && (
              <div className="flex items-center gap-2.5 pt-1 flex-wrap text-xs font-bold text-slate-800">
                {ad.perks.map((p, idx) => (
                  <span key={idx} className="flex items-center gap-1.5 bg-white/90 px-3 py-1 rounded-xl border border-amber-200/90 shadow-2xs">
                    <FiZap className="w-3 h-3 text-[#0d9488] fill-[#0d9488]" />
                    {p}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Button & Offer Summary Box */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-3 shrink-0">
            {ad.highlightBadge?.value && (
              <div className="text-right hidden md:block">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">{ad.highlightBadge.label || 'Special Value'}</span>
                <span className="text-xl font-black text-[#0d9488]">{ad.highlightBadge.value}</span>
              </div>
            )}

            <Link
              to={ad.link || '/shop'}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#0d9488] hover:bg-teal-700 text-white font-black text-xs rounded-2xl shadow-md border border-teal-700 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>{ad.buttonText || 'Claim Offer'}</span>
              <FiArrowRight className="w-4 h-4 text-white" />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};
