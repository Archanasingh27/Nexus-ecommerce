import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import api from '../api/axios';
import confetti from 'canvas-confetti';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('nexus_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [coupon, setCoupon] = useState(null); // e.g. { code: 'INDORE50', discountAmount: 250, ... }
  const { addToast } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('nexus_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setCartItems([]);
      setCoupon(null);
      localStorage.removeItem('nexus_cart');
    }
  }, [isAuthenticated]);

  const addToCart = (product, quantity = 1) => {
    if (!isAuthenticated) {
      addToast('Please sign in to add items to your cart', 'error');
      return;
    }

    const existing = cartItems.find((item) => item.product === (product._id || product.product));

    if (existing) {
      const newQty = existing.quantity + quantity;
      if (newQty > product.countInStock) {
        addToast(`Only ${product.countInStock} items available in stock`, 'error');
        return;
      }
      setCartItems((prev) =>
        prev.map((item) =>
          item.product === existing.product ? { ...item, quantity: newQty } : item
        )
      );
      addToast(`Added ${product.name} to cart (Qty: ${newQty})`, 'success');
    } else {
      if (quantity > product.countInStock) {
        addToast(`Only ${product.countInStock} items available in stock`, 'error');
        return;
      }
      const newItem = {
        product: product._id || product.product,
        name: product.name,
        image: Array.isArray(product.images) ? product.images[0] : product.image,
        price: product.price,
        countInStock: product.countInStock,
        categoryName: product.categoryName,
        quantity,
      };
      setCartItems((prev) => [...prev, newItem]);
      addToast(`Added ${product.name} to cart`, 'success');
    }
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.product === productId) {
          if (quantity > item.countInStock) {
            addToast(`Max available quantity reached (${item.countInStock})`, 'error');
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.product !== productId));
    addToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
  };

  const applyCoupon = async (code) => {
    const clean = (code || '').trim().toUpperCase();
    if (!clean) {
      addToast('Please enter a coupon code', 'error');
      return false;
    }

    try {
      const { data } = await api.post('/coupons/validate', {
        code: clean,
        orderAmount: itemsPrice,
      });

      if (data.success && data.coupon) {
        setCoupon(data.coupon);
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        addToast(data.message || `🎉 Coupon "${clean}" applied!`, 'success');
        return true;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired coupon code';
      addToast(msg, 'error');
      return false;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    addToast('Coupon removed', 'info');
  };

  // Calculations
  const itemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
  let discountPrice = 0;
  if (coupon?.discountAmount !== undefined) {
    discountPrice = coupon.discountAmount;
  } else if (coupon?.discountPercent) {
    discountPrice = (itemsPrice * coupon.discountPercent) / 100;
  }

  const shippingThreshold = 1499;
  const isFreeShipping = itemsPrice >= shippingThreshold || coupon?.freeShipping;
  const shippingPrice = itemsCount === 0 ? 0 : (isFreeShipping ? 0 : 99);
  const taxPrice = Math.round((itemsPrice - discountPrice) * 0.08 * 100) / 100;
  const totalPrice = Math.max(0, Math.round((itemsPrice - discountPrice + shippingPrice + taxPrice) * 100) / 100);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isDrawerOpen,
        setIsDrawerOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        coupon,
        applyCoupon,
        removeCoupon,
        itemsCount,
        itemsPrice,
        discountPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        shippingThreshold,
        freeShippingRemaining: Math.max(0, shippingThreshold - itemsPrice),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
