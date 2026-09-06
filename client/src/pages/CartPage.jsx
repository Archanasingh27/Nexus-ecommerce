import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiTrash2,
  FiPlus,
  FiMinus,
  FiShoppingBag,
  FiArrowRight,
  FiTag,
  FiShield,
  FiTruck,
  FiX,
} from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/helpers';

export const CartPage = () => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    coupon,
    applyCoupon,
    removeCoupon,
    itemsPrice,
    discountPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    freeShippingRemaining,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const navigate = useNavigate();

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.trim()) {
      applyCoupon(couponCode);
      setCouponCode('');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-md">
          <FiShoppingBag />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Your Cart is Empty</h1>
        <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
          Explore our trending audio gear, flagship smartphones, and esports monitors to start building your cart.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-brand-500/20 transition-all"
        >
          <span>Explore Products</span>
          <FiArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Shopping Cart ({cartItems.length} items)
          </h1>
          <p className="text-xs text-slate-500 mt-1">Review your items before secure checkout.</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
        >
          <FiTrash2 className="w-3.5 h-3.5" />
          <span>Clear All</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 pt-8 items-start">

        {/* Cart Items Table (8 cols) */}
        <div className="lg:col-span-8 space-y-4">

          {/* Free Shipping Tracker */}
          {freeShippingRemaining > 0 ? (
            <div className="p-4 bg-[#fffdf0] rounded-2xl border border-yellow-300/80 flex items-center gap-3 shadow-xs">
              <FiTruck className="w-5 h-5 text-[#0d9488] shrink-0" />
              <span className="text-xs font-bold text-slate-800">
                Add <strong className="text-[#0d9488]">{formatPrice(freeShippingRemaining)}</strong> more to unlock Free Express Shipping!
              </span>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-3 shadow-xs">
              <FiTruck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="text-xs font-bold text-emerald-800">
                You've unlocked <strong>FREE Express Shipping</strong> for this order!
              </span>
            </div>
          )}

          {/* Items List */}
          <div className="glass-card rounded-3xl border-2 border-yellow-300/80 divide-y divide-yellow-100 shadow-sm overflow-hidden">
            {cartItems.map((item) => (
              <div key={item.product} className="p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover bg-white border border-yellow-200 shrink-0 shadow-xs"
                />

                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <span className="text-[11px] font-black text-[#0d9488] uppercase tracking-wider block">
                    {item.categoryName}
                  </span>
                  <Link
                    to={`/product/${item.product}`}
                    className="text-sm font-black text-slate-900 hover:text-[#0d9488] transition-colors line-clamp-2 break-words"
                  >
                    {item.name}
                  </Link>
                  <span className="text-xs font-black text-slate-900 block mt-1">
                    {formatPrice(item.price)} each
                  </span>
                </div>

                {/* Quantity Control */}
                <div className="flex items-center border border-yellow-300/80 rounded-xl bg-white shadow-xs p-1">
                  <button
                    onClick={() => updateQuantity(item.product, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-black font-black cursor-pointer rounded-lg hover:bg-yellow-100 transition-colors"
                  >
                    <FiMinus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-black text-slate-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-black font-black cursor-pointer rounded-lg hover:bg-yellow-100 transition-colors"
                  >
                    <FiPlus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Subtotal & Delete */}
                <div className="text-right min-w-[100px] flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                  <span className="text-sm font-black text-slate-900">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.product)}
                    className="text-slate-400 hover:text-rose-600 text-xs flex items-center gap-1 mt-1 transition-colors cursor-pointer"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Remove</span>
                  </button>
                </div>

              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link
              to="/shop"
              className="text-xs font-black text-[#0d9488] hover:underline flex items-center gap-1"
            >
              ← Continue Shopping
            </Link>
          </div>

        </div>

        {/* Order Summary (4 cols) */}
        <div className="lg:col-span-4 glass-card p-6 rounded-3xl border-2 border-yellow-300/80 shadow-md space-y-6 sticky top-28">

          <h2 className="text-base font-black text-slate-900 pb-3 border-b border-yellow-200/80">
            Order Summary
          </h2>

          {/* Promo Code Input */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-2">
              Have a Promo Code?
            </label>
            {coupon ? (
              <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-300 rounded-xl">
                <div className="flex items-center gap-2">
                  <FiTag className="w-4 h-4 text-[#0d9488]" />
                  <span className="text-xs font-black text-slate-900">{coupon.code} Applied</span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="e.g. NEXUS20"
                  className="flex-1 px-3 py-2 bg-white border border-yellow-300/80 rounded-xl text-xs outline-none focus:border-[#0d9488] uppercase font-semibold"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#fae125] hover:bg-yellow-300 text-black font-black text-xs rounded-xl transition-all shadow-xs border border-yellow-400 cursor-pointer"
                >
                  Apply
                </button>
              </form>
            )}
          </div>

          {/* Breakdown */}
          <div className="space-y-3 text-xs border-t border-yellow-200/80 pt-4">
            <div className="flex items-center justify-between text-slate-600">
              <span>Items Subtotal</span>
              <span className="font-bold text-slate-900">{formatPrice(itemsPrice)}</span>
            </div>

            {discountPrice > 0 && (
              <div className="flex items-center justify-between text-emerald-600 font-semibold">
                <span>Coupon Discount ({coupon?.discountPercent}%)</span>
                <span>-{formatPrice(discountPrice)}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-slate-600">
              <span>Estimated Shipping</span>
              <span className="font-bold text-slate-900">
                {shippingPrice === 0 ? 'FREE' : formatPrice(shippingPrice)}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span>Estimated Sales Tax (8%)</span>
              <span className="font-bold text-slate-900">{formatPrice(taxPrice)}</span>
            </div>

            <div className="border-t border-yellow-300/80 pt-3 flex items-center justify-between text-sm font-black text-slate-900">
              <span>Total Amount</span>
              <span className="text-xl font-black text-slate-950">{formatPrice(totalPrice)}</span>
            </div>
          </div>

          {/* Checkout CTA */}
          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-3.5 px-4 bg-[#0d9488] hover:bg-teal-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-teal-700/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            <span>Proceed to Secure Checkout</span>
            <FiArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-2">
            <FiShield className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit SSL Encrypted & Protected</span>
          </div>

        </div>

      </div>

    </div>
  );
};
