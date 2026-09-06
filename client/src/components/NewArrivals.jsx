import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowRight,
  FiShoppingBag,
  FiHeart,
  FiStar,
  FiEye,
  FiZap,
  FiShield,
  FiTruck,
} from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatPrice } from '../utils/helpers';

export const NewArrivals = ({ newArrivals = [], onQuickView }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  if (!newArrivals || newArrivals.length === 0) return null;

  const items = [...newArrivals];
  while (items.length < 3) {
    items.push(newArrivals[items.length % newArrivals.length]);
  }

  const bigHorizontalProduct = items[0];
  const columnProduct1 = items[1];
  const columnProduct2 = items[2];

  return (
    <section className="w-full max-w-[1620px] mx-auto px-6 sm:px-8 lg:px-12 my-10 sm:my-14 lg:my-16">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-[#e5f3f3] to-white border border-teal-200/80 shadow-xl p-8 sm:p-12">

        {/* Soft Ambient Glows */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-teal-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#fae125]/25 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-teal-200/60">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fae125] text-black border border-yellow-300 text-xs font-black uppercase tracking-widest mb-2 shadow-2xs">
              <FiZap className="w-3.5 h-3.5 text-black fill-black" />
              <span>The Runway • 2026 Collection</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              New Arrivals & Latest Releases
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-1">
              Curated freshly added arrivals, breakthrough tech, and seasonal signature styles.
            </p>
          </div>

          <Link
            to="/shop?isNewArrival=true"
            className="self-start md:self-auto px-5 py-2.5 rounded-2xl bg-[#0d9488] hover:bg-teal-700 text-white text-xs font-black flex items-center gap-2 transition-all shadow-md shadow-teal-600/20 hover:scale-105 shrink-0 cursor-pointer"
          >
            <span>Explore All Releases</span>
            <FiArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 3-Card Grid */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

          {/* 1. BIG HORIZONTAL FEATURE CARD */}
          <div className="lg:col-span-7 bg-[#fffdf0] rounded-3xl border border-yellow-300/80 p-6 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group hover:border-[#0d9488]">
            <div>
              {/* Header Badges & Wishlist */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-[#fae125] text-black text-xs font-black rounded-full uppercase tracking-wider shadow-2xs border border-yellow-300">
                    Featured Drop #01
                  </span>
                  <span className="px-2.5 py-0.5 bg-white text-teal-900 text-[11px] font-extrabold rounded-full border border-yellow-200">
                    {bigHorizontalProduct.categoryName}
                  </span>
                  {bigHorizontalProduct.discountPercentage > 0 && (
                    <span className="px-2.5 py-0.5 bg-[#0d9488] text-white text-[11px] font-extrabold rounded-full">
                      Save {bigHorizontalProduct.discountPercentage}%
                    </span>
                  )}
                </div>

                <button
                  onClick={() => toggleWishlist(bigHorizontalProduct)}
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${isInWishlist(bigHorizontalProduct._id)
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-white text-slate-700 hover:bg-yellow-50 border border-yellow-200'
                    }`}
                  title="Save to Wishlist"
                >
                  <FiHeart className={`w-4 h-4 ${isInWishlist(bigHorizontalProduct._id) ? 'fill-white' : ''}`} />
                </button>
              </div>

              {/* Horizontal Layout */}
              <div className="flex flex-col sm:flex-row gap-5 items-stretch mb-4">

                {/* Image */}
                <div className="relative w-full sm:w-1/2 aspect-square rounded-2xl overflow-hidden bg-white/90 border border-yellow-200/80 shrink-0">
                  <Link to={`/product/${bigHorizontalProduct.slug || bigHorizontalProduct._id}`} className="block w-full h-full">
                    <img
                      src={bigHorizontalProduct.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'}
                      alt={bigHorizontalProduct.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </Link>

                  <button
                    onClick={() => onQuickView && onQuickView(bigHorizontalProduct)}
                    className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-white/95 hover:bg-white text-slate-900 text-xs font-black backdrop-blur-md border border-yellow-200 shadow-md flex items-center gap-1.5 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    <FiEye className="w-3.5 h-3.5 text-[#0d9488]" />
                    <span>Quick View</span>
                  </button>
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-teal-800 font-extrabold">
                      <div className="flex items-center text-[#eab308]">
                        <FiStar className="w-3.5 h-3.5 fill-[#eab308]" />
                      </div>
                      <span>{bigHorizontalProduct.rating || 4.9} Rating</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500">{bigHorizontalProduct.numReviews || 28} Reviews</span>
                    </div>

                    <Link
                      to={`/product/${bigHorizontalProduct.slug || bigHorizontalProduct._id}`}
                      className="block text-base sm:text-lg md:text-xl font-black text-slate-900 hover:text-[#0d9488] transition-colors leading-snug line-clamp-2 break-words"
                    >
                      {bigHorizontalProduct.name}
                    </Link>

                    <p className="text-xs text-slate-600 line-clamp-2 sm:line-clamp-3 leading-relaxed font-semibold break-words">
                      {bigHorizontalProduct.description || 'Mastercrafted design built with supreme precision, luxury materials, and guaranteed performance.'}
                    </p>
                  </div>

                  {/* Micro Perks */}
                  <div className="grid grid-cols-2 gap-2 py-2.5 border-y border-yellow-200/80 my-3 text-[11px] text-slate-700 font-bold">
                    <div className="flex items-center gap-1.5">
                      <FiTruck className="w-3.5 h-3.5 text-[#0d9488] shrink-0" />
                      <span className="truncate">Same-Day Dispatch</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FiShield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">Official Warranty</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Price & CTA */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-yellow-200/80 mt-2 flex-wrap sm:flex-nowrap">
              <div>
                <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Launch Price</div>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900">
                    {formatPrice(bigHorizontalProduct.price)}
                  </span>
                  {bigHorizontalProduct.originalPrice > bigHorizontalProduct.price && (
                    <span className="text-xs text-slate-400 line-through font-semibold">
                      {formatPrice(bigHorizontalProduct.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => addToCart(bigHorizontalProduct, 1)}
                disabled={bigHorizontalProduct.countInStock <= 0}
                className={`px-5 sm:px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer ${bigHorizontalProduct.countInStock <= 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-[#0d9488] hover:bg-teal-700 text-white border border-teal-700 shadow-teal-600/30'
                  }`}
              >
                <FiShoppingBag className="w-4 h-4 text-white" />
                <span>{bigHorizontalProduct.countInStock <= 0 ? 'Sold Out' : 'Claim Drop'}</span>
              </button>
            </div>
          </div>

          {/* 2. TWO ROW-WISE STACKED CARDS */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-5">

            {/* Row Card 1 */}
            <div className="bg-[#fffdf0] rounded-3xl border border-yellow-300/80 p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:border-[#0d9488] flex flex-col justify-between flex-1 group">
              <div className="flex gap-4">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-white/90 shrink-0 border border-yellow-200/80">
                  <Link to={`/product/${columnProduct1.slug || columnProduct1._id}`} className="block w-full h-full">
                    <img
                      src={columnProduct1.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'}
                      alt={columnProduct1.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  {columnProduct1.discountPercentage > 0 && (
                    <span className="absolute top-1.5 left-1.5 bg-[#fae125] text-black text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-2xs border border-yellow-400">
                      -{columnProduct1.discountPercentage}%
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-black text-[#0d9488] uppercase tracking-wider truncate">
                        {columnProduct1.categoryName || 'New Drop'}
                      </span>
                      <button
                        onClick={() => toggleWishlist(columnProduct1)}
                        className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title="Wishlist"
                      >
                        <FiHeart className={`w-3.5 h-3.5 ${isInWishlist(columnProduct1._id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>
                    </div>

                    <Link
                      to={`/product/${columnProduct1.slug || columnProduct1._id}`}
                      className="text-sm font-black text-slate-900 hover:text-[#0d9488] line-clamp-2 leading-snug transition-colors"
                    >
                      {columnProduct1.name}
                    </Link>

                    <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold mt-1">
                      <FiStar className="w-3 h-3 fill-[#eab308] text-[#eab308]" />
                      <span className="text-slate-900">{columnProduct1.rating || 4.8}</span>
                      <span className="text-slate-400">({columnProduct1.numReviews || 14})</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-yellow-200/80">
                    <div>
                      <div className="text-sm font-black text-slate-900">
                        {formatPrice(columnProduct1.price)}
                      </div>
                      {columnProduct1.originalPrice > columnProduct1.price && (
                        <div className="text-[10px] text-slate-400 line-through font-semibold">
                          {formatPrice(columnProduct1.originalPrice)}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => addToCart(columnProduct1, 1)}
                      disabled={columnProduct1.countInStock <= 0}
                      className="px-3.5 py-1.5 rounded-xl bg-[#0d9488] hover:bg-teal-700 text-white text-xs font-black transition-all border border-teal-700 shadow-2xs active:scale-95 cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Row Card 2 */}
            <div className="bg-[#fffdf0] rounded-3xl border border-yellow-300/80 p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:border-[#0d9488] flex flex-col justify-between flex-1 group">
              <div className="flex gap-4">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-white/90 shrink-0 border border-yellow-200/80">
                  <Link to={`/product/${columnProduct2.slug || columnProduct2._id}`} className="block w-full h-full">
                    <img
                      src={columnProduct2.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'}
                      alt={columnProduct2.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  {columnProduct2.discountPercentage > 0 && (
                    <span className="absolute top-1.5 left-1.5 bg-[#fae125] text-black text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-2xs border border-yellow-400">
                      -{columnProduct2.discountPercentage}%
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-black text-[#0d9488] uppercase tracking-wider truncate">
                        {columnProduct2.categoryName || 'New Drop'}
                      </span>
                      <button
                        onClick={() => toggleWishlist(columnProduct2)}
                        className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title="Wishlist"
                      >
                        <FiHeart className={`w-3.5 h-3.5 ${isInWishlist(columnProduct2._id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>
                    </div>

                    <Link
                      to={`/product/${columnProduct2.slug || columnProduct2._id}`}
                      className="text-sm font-black text-slate-900 hover:text-[#0d9488] line-clamp-2 leading-snug transition-colors"
                    >
                      {columnProduct2.name}
                    </Link>

                    <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold mt-1">
                      <FiStar className="w-3 h-3 fill-[#eab308] text-[#eab308]" />
                      <span className="text-slate-900">{columnProduct2.rating || 4.9}</span>
                      <span className="text-slate-400">({columnProduct2.numReviews || 19})</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-yellow-200/80">
                    <div>
                      <div className="text-sm font-black text-slate-900">
                        {formatPrice(columnProduct2.price)}
                      </div>
                      {columnProduct2.originalPrice > columnProduct2.price && (
                        <div className="text-[10px] text-slate-400 line-through font-semibold">
                          {formatPrice(columnProduct2.originalPrice)}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => addToCart(columnProduct2, 1)}
                      disabled={columnProduct2.countInStock <= 0}
                      className="px-3.5 py-1.5 rounded-xl bg-[#0d9488] hover:bg-teal-700 text-white text-xs font-black transition-all border border-teal-700 shadow-2xs active:scale-95 cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
