import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FiSearch,
  FiShoppingBag,
  FiShoppingCart,
  FiHeart,
  FiUser,
  FiMapPin,
  FiChevronDown,
  FiLogOut,
  FiPackage,
  FiSettings,
  FiExternalLink,
  FiMenu,
  FiX,
  FiZap,
  FiArrowRight,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { LocationModal } from './LocationModal';
import api from '../api/axios';
import { formatPrice } from '../utils/helpers';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemsCount, setIsDrawerOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navCategories, setNavCategories] = useState([]);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(() => {
    return localStorage.getItem('nexus_delivery_zip') || 'Indore';
  });

  const [announcementConfig, setAnnouncementConfig] = useState({
    announcementBadge: 'FLASH SALE',
    announcementText: 'Use code NEXUS20 for 20% OFF on all orders over ₹999!',
    couponCode: 'NEXUS20',
    discountPercent: 20,
    minOrderAmount: 999,
    showAnnouncementBar: true,
  });

  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  // Fetch categories and live announcement config from backend
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [catRes, dealsRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products/deals').catch(() => ({ data: {} })),
        ]);
        setNavCategories(catRes.data.categories || []);
        if (dealsRes.data?.flashSaleConfig) {
          setAnnouncementConfig((prev) => ({
            ...prev,
            ...dealsRes.data.flashSaleConfig,
          }));
        }
      } catch (err) {
        console.error('Navbar data fetch error:', err);
      }
    };
    fetchInitialData();
  }, []);

  // Live autocomplete search
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data } = await api.get(`/products?keyword=${encodeURIComponent(searchTerm)}&limit=5`);
        setSearchResults(data.products || []);
        setShowSearchDropdown(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setShowSearchDropdown(false);
      navigate(`/shop?keyword=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleSelectProduct = (slug) => {
    setShowSearchDropdown(false);
    setSearchTerm('');
    navigate(`/product/${slug}`);
  };

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Top Announcement Bar (Dynamic from Backend & Admin) */}
      {announcementConfig.showAnnouncementBar !== false && (
        <div className="bg-[#0d9488] text-white text-xs py-2 px-4 shadow-xs font-medium transition-all">
          <div className="w-full max-w-[1620px] mx-auto px-2 sm:px-4 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="bg-[#fae125] text-black font-black px-2.5 py-0.5 rounded-full text-[11px] border border-yellow-300 flex items-center gap-1 shadow-sm shrink-0">
                <FiZap className="w-3 h-3 text-black fill-black animate-pulse" /> {announcementConfig.announcementBadge || 'FLASH SALE'}
              </span>
              <span className="hidden sm:inline text-teal-50 font-bold">
                {announcementConfig.announcementText || (
                  <>
                    Use code <strong className="bg-[#fae125] text-black px-2 py-0.5 rounded-md font-black">{announcementConfig.couponCode || 'NEXUS20'}</strong> for {announcementConfig.discountPercent || 20}% OFF on all orders over ₹{announcementConfig.minOrderAmount || 999}!
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs font-bold">
              {/* Clean Single Indore Location Chip */}
              <button
                type="button"
                onClick={() => setLocationModalOpen(true)}
                className="flex items-center gap-1.5 bg-teal-900/60 hover:bg-teal-900 text-teal-100 px-3 py-1 rounded-full text-[11px] font-bold border border-teal-500/80 transition-all cursor-pointer shadow-xs"
                title="Deliver to Indore"
              >
                <FiMapPin className="w-3.5 h-3.5 text-[#fae125] shrink-0" />
                <span className="text-white font-extrabold tracking-wide">Indore</span>
              </button>

              <Link to="/orders" className="hover:text-[#fae125] transition-colors flex items-center gap-1 text-teal-50">
                <FiPackage className="w-3.5 h-3.5 text-[#fae125]" />
                <span>My Orders</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Navbar (Glassmorphism Frosted Nav) */}
      <nav className="glass-nav sticky top-0 transition-all shadow-sm">
        <div className="w-full max-w-[1620px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-4">

            {/* Brand Logo & Name */}
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-[#fae125] border-2 border-yellow-400 flex items-center justify-center text-black shadow-md shadow-yellow-400/30 group-hover:scale-105 transition-transform">
                  <FiShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                    NEXUS
                  </span>
                  <span className="text-[9px] sm:text-[10px] tracking-widest uppercase font-black text-[#0d9488] -mt-1">
                    COMMERCE
                  </span>
                </div>
              </Link>
            </div>

            {/* Live Search Bar (Desktop) */}
            <div className="flex-1 max-w-xl relative hidden md:block" ref={searchRef}>
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => searchResults.length > 0 && setShowSearchDropdown(true)}
                    placeholder="Search 1,000+ premium tech, audio, apparel..."
                    className="w-full glass-input text-slate-900 text-sm rounded-full py-2.5 pl-11 pr-24 outline-none transition-all font-medium"
                  />
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-600" />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-[#fae125] hover:bg-yellow-300 text-black text-xs font-black rounded-full shadow-sm transition-colors cursor-pointer border border-yellow-400"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Autocomplete Dropdown */}
              {showSearchDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 glass-dropdown overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-2 border-b border-teal-100/70 text-xs font-semibold text-slate-500 px-4">
                    Products matching "{searchTerm}"
                  </div>
                  <div className="divide-y divide-teal-50 max-h-80 overflow-y-auto">
                    {searchResults.map((item) => (
                      <div
                        key={item._id}
                        onClick={() => handleSelectProduct(item.slug || item._id)}
                        className="flex items-center gap-3.5 p-3 hover:bg-[#e5f3f3]/70 cursor-pointer transition-colors"
                      >
                        <img
                          src={item.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover bg-teal-50 border border-teal-100 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 truncate">{item.name}</h4>
                          <span className="text-xs text-[#0d9488] font-black">{item.categoryName}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-slate-900">{formatPrice(item.price)}</span>
                          {item.originalPrice > item.price && (
                            <div className="text-[11px] text-slate-400 line-through">
                              {formatPrice(item.originalPrice)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    onClick={handleSearchSubmit}
                    className="p-3 bg-[#e5f3f3] hover:bg-teal-100 text-center text-xs font-black text-teal-900 cursor-pointer border-t border-teal-200"
                  >
                    View all search results →
                  </div>
                </div>
              )}
            </div>

            {/* Right Action Icons & User */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Desktop Only: My Orders Button */}
              <Link
                to="/orders"
                className="relative hidden md:flex items-center gap-2 px-3.5 py-2 text-slate-800 hover:text-[#0d9488] bg-white/90 hover:bg-yellow-50 rounded-xl font-black text-xs transition-all border border-teal-200 hover:border-yellow-400 shadow-2xs group"
                title="My Orders"
              >
                <FiPackage className="w-4 h-4 text-[#0d9488] group-hover:scale-110 transition-transform" />
                <span>My Orders</span>
              </Link>

              {/* Desktop Only: Wishlist Button */}
              <Link
                to="/wishlist"
                className="relative hidden md:flex p-2.5 text-slate-700 hover:text-[#0d9488] rounded-xl hover:bg-[#e5f3f3] transition-colors"
                title="Saved Wishlist"
              >
                <FiHeart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#0d9488] text-white text-[11px] font-black rounded-full flex items-center justify-center shadow-md animate-scale border border-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Desktop Only: Cart Button */}
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="relative hidden md:flex items-center gap-2 px-4 py-2.5 bg-[#0d9488] hover:bg-teal-700 text-white rounded-xl font-black text-sm transition-all shadow-md shadow-teal-600/25 border border-teal-600 group cursor-pointer"
                title="View Shopping Cart"
              >
                <div className="relative">
                  <FiShoppingCart className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                  {itemsCount > 0 && (
                    <span className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-[#fae125] text-black text-[11px] font-black rounded-full flex items-center justify-center shadow-md border-2 border-white">
                      {itemsCount}
                    </span>
                  )}
                </div>
                <span>Cart</span>
              </button>

              {/* User Account Dropdown */}
              <div className="relative" ref={userMenuRef}>
                {isAuthenticated ? (
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-1.5 sm:gap-2.5 p-1 sm:p-1.5 pr-2 sm:pr-3 rounded-full hover:bg-[#e5f3f3] border border-teal-200 transition-colors cursor-pointer"
                  >
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={user.name}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-[#fae125]"
                    />
                    <span className="text-xs font-bold text-slate-800 hidden md:inline max-w-[90px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                    <FiChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ) : (
                  <Link
                    to="/auth"
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#fae125] hover:bg-yellow-300 text-black text-xs font-black rounded-xl transition-all shadow-md border border-yellow-400"
                  >
                    <FiUser className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
                    <span>Sign In</span>
                  </Link>
                )}

                {/* Authenticated User Menu (Desktop: Clean My Profile + Sign Out) */}
                {showUserMenu && isAuthenticated && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl p-1.5 z-50 animate-in fade-in duration-150 shadow-2xl border-2 border-yellow-300 space-y-1">
                    {/* 1. My Profile */}
                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-yellow-50 text-slate-800 transition-colors font-black text-xs group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#0d9488] border border-teal-200 flex items-center justify-center group-hover:bg-[#0d9488] group-hover:text-white transition-colors">
                          <FiUser className="w-3.5 h-3.5" />
                        </div>
                        <span>My Profile</span>
                      </div>
                      <FiArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-x-0.5" />
                    </Link>

                    {/* 2. Sign Out Button */}
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center justify-center gap-2 p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-black text-xs transition-colors cursor-pointer border border-rose-200 shadow-2xs"
                    >
                      <FiLogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Hamburger Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="relative md:hidden p-2 text-slate-800 hover:bg-yellow-100/60 rounded-xl transition-colors cursor-pointer border border-yellow-300/60 bg-white/80"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <FiX className="w-5 h-5 text-slate-900" /> : <FiMenu className="w-5 h-5 text-slate-900" />}
                {/* Notification dot if user has wishlist or cart items */}
                {(wishlistCount > 0 || itemsCount > 0) && !mobileMenuOpen && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
                )}
              </button>
            </div>
          </div>

          {/* Always-Visible Main Page Search Bar on Mobile */}
          <div className="block md:hidden pb-3 pt-0 relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => searchResults.length > 0 && setShowSearchDropdown(true)}
                  placeholder="Search 1,000+ products..."
                  className="w-full bg-white/95 border border-yellow-300/80 text-slate-900 text-xs rounded-full py-2 pl-9 pr-20 outline-none font-medium shadow-xs focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/30"
                />
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-600" />
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 bg-[#fae125] hover:bg-yellow-300 text-black text-[11px] font-black rounded-full border border-yellow-400 cursor-pointer shadow-xs"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Mobile Autocomplete Search Dropdown */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 glass-dropdown overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 shadow-xl border border-yellow-300">
                <div className="p-2 border-b border-teal-100/70 text-xs font-semibold text-slate-500 px-3">
                  Products matching "{searchTerm}"
                </div>
                <div className="divide-y divide-teal-50 max-h-72 overflow-y-auto">
                  {searchResults.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => handleSelectProduct(item.slug || item._id)}
                      className="flex items-center gap-3 p-2.5 hover:bg-[#e5f3f3]/70 cursor-pointer transition-colors"
                    >
                      <img
                        src={item.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover bg-teal-50 border border-teal-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{item.name}</h4>
                        <span className="text-[10px] text-[#0d9488] font-black">{item.categoryName}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-slate-900">{formatPrice(item.price)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  onClick={handleSearchSubmit}
                  className="p-2.5 bg-[#e5f3f3] hover:bg-teal-100 text-center text-xs font-black text-teal-900 cursor-pointer border-t border-teal-200"
                >
                  View all results →
                </div>
              </div>
            )}
          </div>

        </div>

        {/* ============================================================ */}
        {/* MOBILE MENU DRAWER - 3 SIMPLE OPTIONS: MY PROFILE, WISHLIST, BAG */}
        {/* ============================================================ */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[99999] md:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Slide-In Drawer (Compact 290px, 100% Solid Opaque Background) */}
            <div className="fixed inset-y-0 right-0 w-[290px] max-w-[85vw] h-full bg-white shadow-2xl flex flex-col justify-between border-l-2 border-yellow-300 animate-in slide-in-from-right duration-200 z-10">
              
              {/* Header */}
              <div className="p-4 border-b border-slate-100 bg-[#fffdf5] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#fae125] border-2 border-yellow-400 flex items-center justify-center text-black font-black text-sm shrink-0 shadow-xs">
                    {isAuthenticated && user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : isAuthenticated ? (
                      user?.name?.charAt(0).toUpperCase() || 'U'
                    ) : (
                      <FiUser className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-black text-slate-900 truncate">
                      {isAuthenticated ? `Hi, ${user?.name?.split(' ')[0]}` : 'Welcome Guest'}
                    </div>
                    <div className="text-[10px] font-bold text-[#0d9488] truncate">
                      {isAuthenticated ? (isAdmin ? 'Admin Account' : 'Verified Member') : 'NEXUS Member'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-yellow-200 text-slate-600 hover:text-black flex items-center justify-center transition-colors cursor-pointer border border-slate-200 shrink-0"
                  aria-label="Close menu"
                >
                  <FiX className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              {/* Body: Exactly 3 Simple Options (My Profile, Wishlist, Bag) */}
              <div className="flex-1 p-3.5 space-y-2.5 overflow-y-auto min-h-0 bg-white">
                
                {/* 1. My Profile Option */}
                <Link
                  to={isAuthenticated ? '/profile' : '/auth'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[#fffdf5] hover:bg-yellow-50 border-2 border-yellow-200 transition-all active:scale-[0.98] shadow-xs group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0d9488] border border-teal-200 flex items-center justify-center shrink-0 group-hover:bg-[#0d9488] group-hover:text-white transition-colors">
                      <FiUser className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-black text-slate-900">My Profile</div>
                      <div className="text-[10px] font-medium text-slate-500 truncate">
                        {isAuthenticated ? 'Manage Account' : 'Sign In / Register'}
                      </div>
                    </div>
                  </div>
                  <FiArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-x-0.5 shrink-0" />
                </Link>

                {/* 2. My Orders Option */}
                <Link
                  to={isAuthenticated ? '/orders' : '/auth?redirect=orders'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[#fffdf5] hover:bg-orange-50 border-2 border-orange-200 transition-all active:scale-[0.98] shadow-xs group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                      <FiPackage className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-black text-slate-900">My Orders</div>
                      <div className="text-[10px] font-medium text-orange-700 font-bold truncate">
                        View your order history
                      </div>
                    </div>
                  </div>
                  <FiArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-x-0.5 shrink-0" />
                </Link>

                {/* 3. Wishlist Option */}
                <Link
                  to="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[#fffdf5] hover:bg-yellow-50 border-2 border-yellow-200 transition-all active:scale-[0.98] shadow-xs group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 border border-rose-200 flex items-center justify-center shrink-0 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                      <FiHeart className="w-5 h-5 fill-rose-500 group-hover:fill-white transition-colors" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-black text-slate-900">Wishlist</div>
                      <div className="text-[10px] font-medium text-slate-500 truncate">
                        Saved favorite items
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {wishlistCount > 0 ? (
                      <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-full shadow-xs">
                        {wishlistCount}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold">0</span>
                    )}
                    <FiArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>

                {/* 3. Cart Option */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsDrawerOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#fffdf5] hover:bg-yellow-50 border-2 border-yellow-200 transition-all active:scale-[0.98] shadow-xs group cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0 group-hover:bg-[#fae125] group-hover:text-black transition-colors">
                      <FiShoppingCart className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-black text-slate-900">My Cart</div>
                      <div className="text-[10px] font-medium text-slate-500 truncate">
                        View cart items & checkout
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {itemsCount > 0 ? (
                      <span className="px-2.5 py-0.5 bg-[#0d9488] text-white text-[10px] font-black rounded-full shadow-xs">
                        {itemsCount}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold">0</span>
                    )}
                    <FiArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </button>

                {/* 4. Indore Location Option */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setLocationModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#fffdf5] hover:bg-yellow-50 border-2 border-yellow-200 transition-all active:scale-[0.98] shadow-xs group cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0d9488] border border-teal-200 flex items-center justify-center shrink-0 group-hover:bg-[#0d9488] group-hover:text-white transition-colors">
                      <FiMapPin className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-black text-slate-900">Delivery Location</div>
                      <div className="text-[10px] font-bold text-[#0d9488] truncate">
                        Indore, Madhya Pradesh
                      </div>
                    </div>
                  </div>
                  <FiArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-x-0.5" />
                </button>

              </div>

              {/* Footer: Sign Out button if logged in */}
              {isAuthenticated && (
                <div className="p-3.5 border-t border-slate-100 bg-[#fffdf5] shrink-0">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                      navigate('/');
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-black text-xs flex items-center justify-center gap-1.5 transition-colors border border-rose-200 cursor-pointer shadow-xs"
                  >
                    <FiLogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}

            </div>
          </div>
        )}
      </nav>

      {/* Indore Location Selection Modal */}
      <LocationModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        onSelectLocation={(loc) => setSelectedLocation(loc)}
      />
    </header>
  );
};
