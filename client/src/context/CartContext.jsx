import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { io } from 'socket.io-client';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import api from '../api/axios';
import confetti from 'canvas-confetti';

const CartContext = createContext();

export const DEFAULT_DELIVERY_OPTIONS = [
  {
    id: 'instant',
    name: 'Instant Delivery',
    time: '30 - 45 Mins',
    icon: '⚡',
    description: 'Direct hyper-local courier from nearest merchant hub',
    badge: 'Fastest Delivery',
    price: 49,
    discountedPrice: 49,
    freeAbove: 0,
    isActive: true,
    isDefault: false,
  },
  {
    id: '4hour',
    name: '4-Hour Express',
    time: 'Within 4 Hours',
    icon: '🕒',
    description: 'Standard same-day fast fulfillment across Indore',
    badge: 'Most Popular',
    price: 39,
    discountedPrice: 0,
    freeAbove: 999,
    isActive: true,
    isDefault: true,
  },
  {
    id: 'nextday',
    name: 'Next Day Delivery',
    time: 'Tomorrow by 2:00 PM',
    icon: '🚚',
    description: 'Scheduled next-day eco delivery slot',
    badge: 'Free Delivery',
    price: 0,
    discountedPrice: 0,
    freeAbove: 0,
    isActive: true,
    isDefault: false,
  },
];

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('nexus_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [coupon, setCoupon] = useState(null);
  const [deliveryOptions, setDeliveryOptions] = useState(DEFAULT_DELIVERY_OPTIONS);
  const [deliveryOption, setDeliveryOption] = useState('4hour');
  const { addToast } = useToast();
  const { isAuthenticated } = useAuth();

  // 1. Fetch Dynamic Delivery Options from Admin Config
  const fetchDeliveryConfig = async () => {
    try {
      const { data } = await api.get('/delivery/config');
      if (data?.config?.deliveryOptions && Array.isArray(data.config.deliveryOptions)) {
        const activeOpts = data.config.deliveryOptions.filter((opt) => opt.isActive !== false);
        if (activeOpts.length > 0) {
          setDeliveryOptions(activeOpts);
          // If current deliveryOption is not in activeOpts, set default
          const defaultOpt = activeOpts.find((o) => o.isDefault) || activeOpts[0];
          setDeliveryOption((prev) => {
            const exists = activeOpts.some((o) => o.id === prev);
            return exists ? prev : defaultOpt.id;
          });
        }
      }
    } catch (err) {
      console.warn('Using default delivery options fallback:', err.message);
    }
  };

  useEffect(() => {
    fetchDeliveryConfig();
  }, []);

  // 2. Real-Time Socket listener for live Admin Delivery Options updates
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
      : 'http://localhost:5000';

    const socket = io(socketUrl, {
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 2,
      timeout: 4000,
    });

    socket.on('delivery_config_updated', (newConfig) => {
      if (newConfig?.deliveryOptions && Array.isArray(newConfig.deliveryOptions)) {
        const activeOpts = newConfig.deliveryOptions.filter((opt) => opt.isActive !== false);
        if (activeOpts.length > 0) {
          setDeliveryOptions(activeOpts);
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

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

  const selectedDeliveryOptionObj = useMemo(() => {
    return (
      deliveryOptions.find((opt) => opt.id === deliveryOption) ||
      deliveryOptions.find((opt) => opt.isDefault) ||
      deliveryOptions[0] ||
      DEFAULT_DELIVERY_OPTIONS[0]
    );
  }, [deliveryOptions, deliveryOption]);

  // Dynamic Shipping Price Calculation based on Admin configuration
  const shippingPrice = useMemo(() => {
    if (itemsCount === 0) return 0;
    if (coupon?.freeShipping) return 0;
    if (!selectedDeliveryOptionObj) return 0;

    const { price = 0, freeAbove = 0, discountedPrice } = selectedDeliveryOptionObj;
    if (freeAbove > 0 && itemsPrice >= freeAbove) {
      return discountedPrice !== undefined ? discountedPrice : 0;
    }
    return price;
  }, [itemsCount, coupon, selectedDeliveryOptionObj, itemsPrice]);

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
        deliveryOption,
        setDeliveryOption,
        selectedDeliveryOptionObj,
        deliveryOptions,
        shippingPrice,
        taxPrice,
        totalPrice,
        shippingThreshold: selectedDeliveryOptionObj?.freeAbove || 999,
        freeShippingRemaining: selectedDeliveryOptionObj?.freeAbove
          ? Math.max(0, selectedDeliveryOptionObj.freeAbove - itemsPrice)
          : 0,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
