import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('nexus_wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  const { addToast } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('nexus_wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setWishlist([]);
      localStorage.removeItem('nexus_wishlist');
    }
  }, [isAuthenticated]);

  const toggleWishlist = (product) => {
    if (!isAuthenticated) {
      addToast('Please sign in to save items to your wishlist', 'error');
      return;
    }

    const productId = product._id || product.product;
    const exists = wishlist.some((item) => (item._id || item.product) === productId);

    if (exists) {
      setWishlist((prev) => prev.filter((item) => (item._id || item.product) !== productId));
      addToast(`Removed ${product.name} from wishlist`, 'info');
    } else {
      setWishlist((prev) => [...prev, product]);
      addToast(`Added ${product.name} to wishlist`, 'success');
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => (item._id || item.product) === productId);
  };

  const removeFromWishlist = (productId, showNotification = true) => {
    setWishlist((prev) => prev.filter((item) => (item._id || item.product) !== productId));
    if (showNotification) {
      addToast('Item removed from wishlist', 'info');
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        wishlistCount: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
