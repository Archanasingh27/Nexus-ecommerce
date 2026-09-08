import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiX, FiStar, FiShoppingBag, FiShoppingCart, FiHeart, FiShield, FiTruck } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatPrice } from '../utils/helpers';

export const QuickViewModal = ({ product, isOpen, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    if (isOpen) {
      setSelectedImage(0);
      setQuantity(1);
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const isSaved = isInWishlist(product._id);
  const images = product.images && product.images.length > 0 ? product.images : [product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'];

  const handleAddToCart = () => {
    addToCart(product, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3.5 sm:p-6 overflow-y-auto">
      {/* High-z-index Dark Glass Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
      />

      {/* Small, Compact Floating Quick View Card (Centered on all screen sizes) */}
      <div className="relative w-full max-w-[340px] sm:max-w-lg md:max-w-xl glass-modal rounded-3xl overflow-hidden z-10 animate-in zoom-in-95 duration-200 border-2 border-yellow-300 shadow-2xl m-auto max-h-[90vh] overflow-y-auto">

        {/* Close button with high contrast & compact size */}
        <button
          onClick={onClose}
          className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-30 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 text-slate-900 hover:text-black hover:bg-[#fae125] transition-all cursor-pointer shadow-md flex items-center justify-center border border-yellow-400 hover:scale-105 active:scale-95"
          aria-label="Close modal"
        >
          <FiX className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
        </button>

        <div className="p-3.5 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-5 items-center">

            {/* Gallery Column */}
            <div className="space-y-2">
              <div className="relative aspect-[16/10] sm:aspect-square max-h-[140px] sm:max-h-[190px] rounded-xl overflow-hidden bg-white border border-yellow-200 shadow-2xs">
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.discountPercentage > 0 && (
                  <span className="absolute top-2 left-2 bg-[#fae125] text-black font-black text-[9px] px-2 py-0.5 rounded-full border border-yellow-400 shadow-xs">
                    {product.discountPercentage}% OFF
                  </span>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden border transition-all shrink-0 cursor-pointer ${
                        selectedImage === idx ? 'border-[#0d9488] ring-2 ring-teal-500/30 scale-95' : 'border-yellow-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Micro Benefits Strip */}
              <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-700 font-bold">
                <div className="flex items-center gap-1 bg-white/80 p-1.5 rounded-lg border border-yellow-200/60">
                  <FiTruck className="w-3 h-3 text-[#0d9488] shrink-0" />
                  <span className="truncate">Fast Track</span>
                </div>
                <div className="flex items-center gap-1 bg-white/80 p-1.5 rounded-lg border border-yellow-200/60">
                  <FiShield className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="truncate">100% Genuine</span>
                </div>
              </div>
            </div>

            {/* Info Column */}
            <div className="flex flex-col justify-between space-y-2.5">
              <div>
                {/* Category & Brand Header */}
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-[#0d9488] mb-1 pr-8 flex-wrap gap-1">
                  <span className="bg-teal-50 text-[#0d9488] px-2 py-0.5 rounded-full border border-teal-200">
                    {product.categoryName}
                  </span>
                  <span className="text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded-full text-[9px] border border-slate-200">
                    {product.brand || 'Nexus'}
                  </span>
                </div>

                <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-snug break-words line-clamp-2 pr-7">
                  {product.name}
                </h3>

                {/* Rating & Stock */}
                <div className="flex items-center gap-2 my-1.5 text-xs flex-wrap">
                  <div className="flex items-center text-amber-500">
                    <FiStar className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="ml-1 font-black text-slate-900 text-xs">{product.rating || 4.9}</span>
                  </div>
                  <span className="text-slate-400 text-[10px]">({product.numReviews || 2})</span>
                  <span className="text-slate-300">•</span>
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                    product.countInStock > 0 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {product.countInStock > 0 ? `In Stock` : 'Sold Out'}
                  </span>
                </div>

                {/* Price Box */}
                <div className="glass-card-brand p-2 sm:p-2.5 my-1.5 flex items-baseline justify-between rounded-xl border border-yellow-300/80 shadow-2xs flex-wrap gap-1.5">
                  <div>
                    <div className="text-base sm:text-lg font-black text-slate-950">
                      {formatPrice(product.price)}
                    </div>
                    {product.originalPrice > product.price && (
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="text-[11px] text-slate-400 line-through font-medium">
                          {formatPrice(product.originalPrice)}
                        </span>
                        <span className="text-[9px] font-black text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                          Save {formatPrice(product.originalPrice - product.price)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quantity & Actions */}
              <div className="space-y-2 pt-2 border-t border-yellow-200/80">
                <div className="flex items-center gap-2">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-yellow-300/80 rounded-lg bg-white p-0.5 shadow-2xs shrink-0">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-6 h-6 flex items-center justify-center text-slate-700 hover:text-black font-black cursor-pointer rounded hover:bg-yellow-100 transition-colors text-xs"
                    >
                      -
                    </button>
                    <span className="px-2 text-xs font-black text-slate-900">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(product.countInStock || 99, quantity + 1))}
                      className="w-6 h-6 flex items-center justify-center text-slate-700 hover:text-black font-black cursor-pointer rounded hover:bg-yellow-100 transition-colors text-xs"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={product.countInStock <= 0}
                    className="flex-1 py-2 px-3 bg-[#0d9488] hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  >
                    <FiShoppingCart className="w-3.5 h-3.5" />
                    <span>{product.countInStock <= 0 ? 'Out of Stock' : '+ Add to Cart'}</span>
                  </button>

                  {/* Wishlist Button */}
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product)}
                    className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                      isSaved ? 'bg-rose-500 text-white border-rose-500 shadow-xs' : 'border-yellow-300 bg-white text-slate-600 hover:text-rose-500 hover:bg-yellow-50'
                    }`}
                    title={isSaved ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    <FiHeart className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
                  </button>
                </div>

                <Link
                  to={`/product/${product.slug || product._id}`}
                  onClick={onClose}
                  className="block text-center text-[11px] font-black text-[#0d9488] hover:text-teal-800 hover:underline transition-colors"
                >
                  View Full Details →
                </Link>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
