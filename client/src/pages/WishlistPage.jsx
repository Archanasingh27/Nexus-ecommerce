import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingBag, FiShoppingCart, FiTrash2, FiArrowRight, FiLock } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/helpers';

export const WishlistPage = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-md">
          <FiLock />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Sign in to Access Your Wishlist</h1>
        <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
          Please log in or create an account to save products, view your wishlist, and sync items across your devices.
        </p>
        <Link
          to="/auth?redirect=wishlist"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-brand-500/20 transition-all"
        >
          <span>Sign In / Register</span>
          <FiArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto text-3xl shadow-md">
          <FiHeart />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Your Wishlist is Empty</h1>
        <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
          Save your favorite products while browsing and come back anytime to move them to your bag!
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-brand-500/20 transition-all"
        >
          <span>Discover Products</span>
          <FiArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Saved Wishlist ({wishlist.length} items)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Items in your wishlist will be saved automatically for your next visit.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map((product) => (
          <div
            key={product._id}
            className="rounded-3xl bg-white border border-slate-200/80 p-4 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all"
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 mb-4">
              <Link to={`/product/${product.slug || product._id}`}>
                <img
                  src={product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </Link>
              <button
                onClick={() => removeFromWishlist(product._id)}
                className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-rose-600 hover:bg-rose-50 shadow-md"
                title="Remove"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>

            <div>
              <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider block mb-1">
                {product.categoryName}
              </span>
              <Link
                to={`/product/${product.slug || product._id}`}
                className="text-sm font-bold text-slate-900 hover:text-brand-600 line-clamp-2 mb-2 transition-colors"
              >
                {product.name}
              </Link>
              <div className="text-base font-extrabold text-slate-900 mb-4">
                {formatPrice(product.price)}
              </div>
            </div>

            <button
              onClick={() => {
                addToCart(product, 1);
                removeFromWishlist(product._id || product.product, false);
              }}
              disabled={product.countInStock <= 0}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors"
            >
              <FiShoppingCart className="w-3.5 h-3.5" />
              <span>{product.countInStock > 0 ? 'Move to Cart' : 'Out of Stock'}</span>
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};
