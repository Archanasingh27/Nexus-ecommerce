import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingBag, FiStar, FiEye } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatPrice } from '../utils/helpers';

export const ProductCard = ({ product, onQuickView, showDealBadge = false }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isSaved = isInWishlist(product._id);
  const isOutOfStock = product.countInStock <= 0;

  return (
    <div className="group relative rounded-3xl glass-card p-3.5 sm:p-4 flex flex-col justify-between transition-all duration-300">
      
      {/* Top Image Container (Wider Aspect Ratio 4:3) */}
      <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-white/80 backdrop-blur-md border border-yellow-200/80 mb-3 shadow-xs">
        
        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
          {product.discountPercentage > 0 && (
            <span className="bg-[#fae125] text-black border border-yellow-400 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
              {product.discountPercentage}% OFF
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-indigo-600 text-white border border-indigo-400 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md uppercase tracking-wider">
              NEW
            </span>
          )}
          {product.countInStock > 0 && product.countInStock <= 5 && (
            <span className="bg-amber-100 text-amber-950 border border-amber-300 text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs">
              Only {product.countInStock} Left
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-sm cursor-pointer ${
            isSaved
              ? 'bg-rose-500 text-white shadow-rose-500/30'
              : 'glass-pill bg-white/90 text-slate-700 hover:text-rose-500 hover:bg-white hover:scale-110 border border-yellow-300/50'
          }`}
          title={isSaved ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <FiHeart className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
        </button>

        {/* Product Image */}
        <Link to={`/product/${product.slug || product._id}`} className="block w-full h-full">
          <img
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Quick View Button (Visible on Desktop Hover and Touch-Friendly on Mobile) */}
        <div className="absolute inset-x-2.5 bottom-2.5 z-10 flex items-center gap-2 opacity-0 group-hover:opacity-100 sm:transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickView && onQuickView(product);
            }}
            className="flex-1 py-1.5 glass-pill bg-white/95 hover:bg-[#fae125] text-slate-950 text-xs font-black rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all border border-yellow-300/70 cursor-pointer hover:scale-[1.02]"
          >
            <FiEye className="w-3.5 h-3.5 text-slate-900" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="flex-1 flex flex-col justify-between">
        
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] mb-1 gap-1">
            <span className="text-[#0d9488] font-black uppercase tracking-wider truncate">{product.categoryName}</span>
            <span className="text-slate-400 font-semibold truncate shrink-0">{product.brand || 'Nexus'}</span>
          </div>

          {/* Product Name (Responsive line height & wrapping) */}
          <Link
            to={`/product/${product.slug || product._id}`}
            className="block text-xs sm:text-sm font-black text-slate-900 hover:text-[#0d9488] line-clamp-2 min-h-[2.25rem] sm:min-h-[2.5rem] leading-tight sm:leading-snug break-words mb-1.5 transition-colors"
          >
            {product.name}
          </Link>

          {/* Rating & Seller */}
          <div className="flex items-center justify-between gap-1 mb-2 text-xs">
            <div className="flex items-center gap-1">
              <FiStar className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-black text-slate-900 text-xs">{product.rating || 4.9}</span>
              <span className="text-slate-400 font-medium text-[10px] sm:text-[11px]">({product.numReviews || 2})</span>
            </div>
            {product.vendorStoreName && (
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded-md border border-amber-200/80 truncate max-w-[110px]" title={`Sold by ${product.vendorStoreName}`}>
                🏪 {product.vendorStoreName}
              </span>
            )}
          </div>
        </div>

        {/* Price & Add to Cart Button */}
        <div className="flex items-center justify-between pt-2.5 border-t border-yellow-300/60 mt-1.5 gap-2 flex-wrap sm:flex-nowrap">
          <div className="shrink-0">
            <div className="text-sm sm:text-base font-black text-slate-900">
              {formatPrice(product.price)}
            </div>
            {product.originalPrice > product.price && (
              <div className="text-[10px] sm:text-[11px] text-slate-400 line-through font-medium">
                {formatPrice(product.originalPrice)}
              </div>
            )}
          </div>

          <button
            onClick={() => addToCart(product, 1)}
            disabled={isOutOfStock}
            className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-black flex items-center justify-center gap-1 transition-all shrink-0 cursor-pointer ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-[#0d9488] hover:bg-teal-700 text-white shadow-md shadow-teal-700/20 active:scale-95'
            }`}
          >
            <span>{isOutOfStock ? 'Sold Out' : '+ Add'}</span>
          </button>
        </div>

      </div>

    </div>
  );
};
