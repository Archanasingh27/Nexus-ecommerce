import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiX, FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/helpers';

export const CartDrawer = () => {
  const {
    cartItems,
    isDrawerOpen,
    setIsDrawerOpen,
    updateQuantity,
    removeFromCart,
    itemsPrice,
    totalPrice,
    freeShippingRemaining,
    shippingThreshold,
  } = useCart();

  const navigate = useNavigate();

  if (!isDrawerOpen) return null;

  const progressPercent = Math.min(100, Math.round(((shippingThreshold - freeShippingRemaining) / shippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsDrawerOpen(false)}
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md glass bg-[#fffdf0]/95 backdrop-blur-2xl shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 border-l-2 border-yellow-300/80">

          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-yellow-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#fae125] border border-yellow-400 flex items-center justify-center text-black shadow-xs">
                <FiShoppingBag className="w-4 h-4 text-black" />
              </div>
              <h2 className="text-base font-black text-slate-900">
                Your Shopping Bag ({cartItems.length})
              </h2>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-950 hover:bg-[#fae125] transition-colors cursor-pointer border border-transparent hover:border-yellow-300"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="glass-card mx-3 sm:mx-4 my-2 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl border border-yellow-300/70">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
              {freeShippingRemaining > 0 ? (
                <span>
                  Add <strong className="text-[#0d9488]">{formatPrice(freeShippingRemaining)}</strong> more for <strong>FREE Express Shipping</strong>
                </span>
              ) : (
                <span className="text-emerald-700 flex items-center gap-1 font-bold">
                  <FiCheckCircle className="w-4 h-4 text-emerald-600" />
                  Unlocked <strong>FREE Express Shipping!</strong>
                </span>
              )}
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#0d9488] h-full transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-yellow-100">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-yellow-100/60 border border-yellow-300/60 flex items-center justify-center text-[#0d9488]">
                  <FiShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Your bag is empty</h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Explore our latest drops and deals!</p>
                </div>
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    navigate('/shop');
                  }}
                  className="px-6 py-2.5 bg-[#0d9488] hover:bg-teal-700 text-white font-black text-xs rounded-xl shadow-md shadow-teal-700/20 transition-all cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.product} className="py-3 sm:py-4 flex gap-3 sm:gap-4 items-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover bg-white border border-yellow-200 shrink-0 shadow-xs"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-black text-slate-900 truncate">{item.name}</h4>
                    <span className="text-xs font-extrabold text-[#0d9488] block mt-0.5">
                      {formatPrice(item.price)}
                    </span>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-yellow-300/80 rounded-lg bg-white shadow-xs">
                        <button
                          onClick={() => updateQuantity(item.product, item.quantity - 1)}
                          className="p-1 text-slate-600 hover:text-black cursor-pointer"
                        >
                          <FiMinus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-black text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product, item.quantity + 1)}
                          className="p-1 text-slate-600 hover:text-black cursor-pointer"
                        >
                          <FiPlus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                        title="Remove item"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-black text-slate-900">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-yellow-200/80 bg-white/60 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">{formatPrice(itemsPrice)}</span>
              </div>
              <div className="flex items-center justify-between text-sm font-black text-slate-900">
                <span>Estimated Total</span>
                <span className="text-xl font-black text-slate-900">{formatPrice(totalPrice)}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    navigate('/cart');
                  }}
                  className="py-3 px-3 rounded-xl border border-yellow-300 bg-white hover:bg-yellow-50 text-slate-900 font-black text-xs transition-colors text-center cursor-pointer shadow-xs"
                >
                  View Cart
                </button>
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    navigate('/checkout');
                  }}
                  className="py-3 px-3 rounded-xl bg-[#0d9488] hover:bg-teal-700 text-white font-black text-xs shadow-md shadow-teal-700/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span>Checkout</span>
                  <FiArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
