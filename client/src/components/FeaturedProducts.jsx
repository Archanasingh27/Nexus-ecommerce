import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiAward, FiStar, FiShoppingBag, FiHeart, FiZap, FiEye } from 'react-icons/fi';
import { ProductCard } from './ProductCard';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatPrice } from '../utils/helpers';

export const FeaturedProducts = ({ products = [], onQuickView }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [filterMode, setFilterMode] = useState('all');

  if (!products || products.length === 0) return null;

  const spotlightProduct = products[0];
  const remainingProducts = products.slice(1);

  const isSpotlightSaved = spotlightProduct ? isInWishlist(spotlightProduct._id) : false;

  const filteredList = remainingProducts.filter((p) => {
    if (filterMode === 'topRated') return (p.rating || 0) >= 4.5;
    if (filterMode === 'bestDeals') return (p.discountPercentage || 0) > 0;
    return true;
  });

  return (
    <section className="w-full max-w-[1750px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#fae125] text-slate-950 text-xs font-black border border-yellow-400 mb-2 shadow-2xs">
            <FiAward className="w-4 h-4 text-slate-950" />
            <span>EDITOR'S CHOICE 2026</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Handpicked Featured Products
          </h2>
          <p className="text-xs text-slate-600 font-semibold mt-1 max-w-lg">
            Curated selection of top-performing gadgets and premium essentials recommended by our tech specialists.
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: '🔥 All Featured' },
            { id: 'topRated', label: '⭐ Top Rated (4.5+)' },
            { id: 'bestDeals', label: '🏷️ Best Savings' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilterMode(btn.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                filterMode === btn.id
                  ? 'bg-[#fae125] text-black border border-yellow-400 shadow-md scale-105'
                  : 'glass-pill text-slate-700 hover:text-slate-950 hover:bg-white/90'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Showcase Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Spotlight Hero Card (Glassmorphic Warm Card) */}
        {spotlightProduct && (
          <div className="lg:col-span-5 rounded-3xl glass-card-brand text-slate-900 p-6 sm:p-8 shadow-xl flex flex-col justify-between relative overflow-hidden group">
            
            {/* Background Glow Effect */}
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-white/70 rounded-full blur-3xl pointer-events-none"></div>

            {/* Top Badges */}
            <div className="flex items-center justify-between z-10 mb-4">
              <span className="glass-pill bg-[#fae125]/90 text-slate-950 text-[11px] font-black px-3 py-1 rounded-full shadow-xs uppercase tracking-wider flex items-center gap-1 border border-yellow-300">
                <FiZap className="w-3.5 h-3.5 text-slate-950 fill-slate-950" /> #1 Top Pick
              </span>

              <button
                onClick={() => toggleWishlist(spotlightProduct)}
                className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all cursor-pointer ${
                  isSpotlightSaved ? 'bg-rose-500 text-white shadow-md' : 'glass-pill text-slate-700 hover:text-rose-500 hover:bg-white'
                }`}
                title={isSpotlightSaved ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <FiHeart className={`w-4 h-4 ${isSpotlightSaved ? 'fill-white' : ''}`} />
              </button>
            </div>

            {/* Product Image Showcase */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white/90 border border-amber-200 my-2 group-hover:scale-105 transition-transform duration-500 shadow-sm">
              <img
                src={spotlightProduct.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700'}
                alt={spotlightProduct.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => onQuickView && onQuickView(spotlightProduct)}
                className="absolute inset-x-4 bottom-4 py-2.5 bg-white/95 hover:bg-white text-slate-900 text-xs font-black rounded-xl shadow-lg backdrop-blur-md flex items-center justify-center gap-1.5 transition-colors border border-amber-200 cursor-pointer"
              >
                <FiEye className="w-4 h-4 text-[#0d9488]" />
                <span>Quick View Details</span>
              </button>
            </div>

            {/* Product Info & Action */}
            <div className="z-10 space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-700 font-bold">
                <span className="text-[#0d9488] font-black">{spotlightProduct.categoryName}</span>
                <span>{spotlightProduct.brand}</span>
              </div>

              <Link
                to={`/product/${spotlightProduct.slug || spotlightProduct._id}`}
                className="block text-base sm:text-lg md:text-xl font-black text-slate-900 hover:text-[#0d9488] transition-colors line-clamp-2 break-words leading-snug"
              >
                {spotlightProduct.name}
              </Link>

              {/* Rating */}
              <div className="flex items-center gap-2 text-xs flex-wrap">
                <div className="flex items-center text-[#fae125]">
                  <FiStar className="w-4 h-4 fill-[#fae125]" />
                </div>
                <span className="font-extrabold text-slate-900">{spotlightProduct.rating || 4.9}</span>
                <span className="text-slate-500">({spotlightProduct.numReviews || 18} reviews)</span>
              </div>

              {/* Price & Add Button */}
              <div className="flex items-center justify-between pt-3 border-t border-amber-200/90 gap-3 flex-wrap sm:flex-nowrap">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900">
                    {formatPrice(spotlightProduct.price)}
                  </div>
                  {spotlightProduct.originalPrice > spotlightProduct.price && (
                    <div className="text-xs text-slate-500 line-through">
                      {formatPrice(spotlightProduct.originalPrice)}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => addToCart(spotlightProduct, 1)}
                  className="px-5 py-2.5 bg-[#0d9488] hover:bg-teal-700 text-white text-xs font-black rounded-xl shadow-md border border-teal-700 flex items-center gap-2 transition-all shrink-0 cursor-pointer"
                >
                  <FiShoppingBag className="w-4 h-4 text-white" />
                  <span>Add to Bag</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Right Grid Showcase */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {filteredList.slice(0, 4).map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onQuickView={onQuickView}
            />
          ))}
        </div>

      </div>

    </section>
  );
};
