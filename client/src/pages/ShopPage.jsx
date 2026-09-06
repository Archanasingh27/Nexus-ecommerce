import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { ProductCard } from '../components/ProductCard';
import { QuickViewModal } from '../components/QuickViewModal';
import {
  FiFilter,
  FiX,
  FiSearch,
  FiStar,
  FiSliders,
  FiRotateCcw,
  FiLayers,
  FiGrid,
  FiZap,
  FiBox,
  FiShield,
  FiDroplet,
  FiToggleRight,
  FiCpu,
  FiSun,
  FiDatabase,
  FiPackage,
  FiTool,
  FiChevronDown,
  FiChevronRight,
  FiCheck,
} from 'react-icons/fi';
import {
  RiHome4Line,
  RiToolsLine,
  RiFlashlightLine,
  RiDropLine,
  RiPaintBrushLine,
  RiDoorLockLine,
  RiAppsLine,
  RiContrastDropLine,
} from 'react-icons/ri';
import { formatPrice } from '../utils/helpers';

// Category color and icon metadata (Admin-sidebar style)
const categoryMetaMap = {
  'civil-interiors': {
    icon: FiLayers,
    color: 'text-amber-800 bg-amber-100/90 border-amber-300',
    activeBg: 'bg-amber-50 border-amber-400 text-amber-900',
  },
  'furniture-architectural-hardware': {
    icon: FiSliders,
    color: 'text-teal-700 bg-teal-100/90 border-teal-300',
    activeBg: 'bg-teal-50 border-teal-400 text-teal-900',
  },
  'electrical': {
    icon: FiZap,
    color: 'text-orange-600 bg-orange-100/90 border-orange-300',
    activeBg: 'bg-orange-50 border-orange-400 text-orange-900',
  },
  'plumbing-sanitary-bath': {
    icon: FiDroplet,
    color: 'text-blue-600 bg-blue-100/90 border-blue-300',
    activeBg: 'bg-blue-50 border-blue-400 text-blue-900',
  },
};

const getCategoryMeta = (slug) => {
  return categoryMetaMap[slug] || {
    icon: FiBox,
    color: 'text-emerald-700 bg-emerald-100/90 border-emerald-300',
    activeBg: 'bg-emerald-50 border-emerald-400 text-emerald-900',
  };
};

const subcategoryIconMap = {
  // Civil & Interiors
  'cement': <FiLayers className="w-3.5 h-3.5 shrink-0" />,
  'tiling': <FiGrid className="w-3.5 h-3.5 shrink-0" />,
  'plywood-mdf-hdhmr': <FiBox className="w-3.5 h-3.5 shrink-0" />,
  'fevicol': <FiShield className="w-3.5 h-3.5 shrink-0" />,
  'waterproofing': <FiDroplet className="w-3.5 h-3.5 shrink-0" />,
  'painting': <RiPaintBrushLine className="w-3.5 h-3.5 shrink-0" />,

  // Furniture & Architectural Hardware
  'hinges-channels-handles': <FiSliders className="w-3.5 h-3.5 shrink-0" />,
  'kitchen-systems-accessories': <RiAppsLine className="w-3.5 h-3.5 shrink-0" />,
  'wardrobe-bed-fittings': <FiPackage className="w-3.5 h-3.5 shrink-0" />,
  'door-locks-hardware': <RiDoorLockLine className="w-3.5 h-3.5 shrink-0" />,

  // Electrical
  'wires-mcb-distribution-boards': <FiZap className="w-3.5 h-3.5 shrink-0" />,
  'switches-sockets': <FiToggleRight className="w-3.5 h-3.5 shrink-0" />,
  'electrical-conduits': <FiCpu className="w-3.5 h-3.5 shrink-0" />,
  'lighting': <FiSun className="w-3.5 h-3.5 shrink-0" />,

  // Plumbing, Sanitary & Bath
  'cpvc-pipes-overhead-tanks': <RiDropLine className="w-3.5 h-3.5 shrink-0" />,
  'sanitary-bath-fittings': <RiContrastDropLine className="w-3.5 h-3.5 shrink-0" />,
  'overhead-tanks': <FiDatabase className="w-3.5 h-3.5 shrink-0" />,
};

const subcategoryImageMap = {
  // Civil & Interiors
  'cement': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=200&auto=format&fit=crop&q=80',
  'tiling': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200&auto=format&fit=crop&q=80',
  'plywood-mdf-hdhmr': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=200&auto=format&fit=crop&q=80',
  'fevicol': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200&auto=format&fit=crop&q=80',
  'waterproofing': 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=200&auto=format&fit=crop&q=80',
  'painting': 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=200&auto=format&fit=crop&q=80',

  // Furniture & Architectural Hardware
  'hinges-channels-handles': 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=200&auto=format&fit=crop&q=80',
  'kitchen-systems-accessories': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=200&auto=format&fit=crop&q=80',
  'wardrobe-bed-fittings': 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=200&auto=format&fit=crop&q=80',
  'door-locks-hardware': 'https://images.unsplash.com/photo-1558002038-1055907df827?w=200&auto=format&fit=crop&q=80',

  // Electrical
  'wires-mcb-distribution-boards': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=80',
  'switches-sockets': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=200&auto=format&fit=crop&q=80',
  'electrical-conduits': 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?w=200&auto=format&fit=crop&q=80',
  'lighting': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=200&auto=format&fit=crop&q=80',

  // Plumbing, Sanitary & Bath
  'cpvc-pipes-overhead-tanks': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=200&auto=format&fit=crop&q=80',
  'sanitary-bath-fittings': 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=200&auto=format&fit=crop&q=80',
  'overhead-tanks': 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?w=200&auto=format&fit=crop&q=80',
};

const getSubcategoryIcon = (slug) => {
  return subcategoryIconMap[slug] || <FiTool className="w-3.5 h-3.5 shrink-0" />;
};

const pricePresets = [
  { label: 'All', value: 150000 },
  { label: '< ₹1k', value: 1000 },
  { label: '< ₹5k', value: 5000 },
  { label: '< ₹25k', value: 25000 },
  { label: '< ₹50k', value: 50000 },
];

export const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialSubcategory = searchParams.get('subcategory') || 'all';
  const initialKeyword = searchParams.get('keyword') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [expandedCategory, setExpandedCategory] = useState(initialCategory !== 'all' ? initialCategory : null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(initialSubcategory);
  const [searchKeyword, setSearchKeyword] = useState(initialKeyword);
  const [priceRange, setPriceRange] = useState(150000);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('popular');
  const [page, setPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Active filter count
  const activeFilterCount = [
    selectedCategory !== 'all',
    selectedSubcategory !== 'all',
    searchKeyword.trim() !== '',
    priceRange < 150000,
    minRating > 0,
    inStockOnly === true,
  ].filter(Boolean).length;

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, selectedSubcategory, searchKeyword, priceRange, minRating, inStockOnly, sortBy]);

  // Fetch Categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data.categories || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);

  // Update filter when query params change
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
      setExpandedCategory(cat);
    }
    const subcat = searchParams.get('subcategory');
    if (subcat) setSelectedSubcategory(subcat);
    const kw = searchParams.get('keyword');
    if (kw !== null) setSearchKeyword(kw);
  }, [searchParams]);

  // Fetch Products with 18 products per page for multiple rich rows
  useEffect(() => {
    const fetchProducts = async () => {
      setIsFetching(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
        if (selectedSubcategory && selectedSubcategory !== 'all') params.append('subcategory', selectedSubcategory);
        if (searchKeyword) params.append('keyword', searchKeyword);
        if (priceRange) params.append('maxPrice', priceRange);
        if (minRating > 0) params.append('minRating', minRating);
        if (inStockOnly) params.append('inStock', 'true');
        if (sortBy) params.append('sortBy', sortBy);
        params.append('page', page);
        params.append('limit', 18); // 18 products gives 5 to 6 full rows of products

        const { data } = await api.get(`/products?${params.toString()}`);
        setProducts(data.products || []);
        setTotalProducts(data.totalProducts || 0);
        setTotalPages(data.pages || 1);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setIsFetching(false);
        setInitialLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, selectedSubcategory, searchKeyword, priceRange, minRating, inStockOnly, sortBy, page]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setExpandedCategory(null);
    setSelectedSubcategory('all');
    setSearchKeyword('');
    setPriceRange(150000);
    setMinRating(0);
    setInStockOnly(false);
    setSortBy('popular');
    setPage(1);
    setSearchParams({});
  };

  const handleCategoryChange = (catSlug) => {
    if (catSlug === 'all') {
      setSelectedCategory('all');
      setExpandedCategory(null);
      setSelectedSubcategory('all');
      const params = new URLSearchParams(searchParams);
      params.delete('category');
      params.delete('subcategory');
      setSearchParams(params);
      return;
    }

    if (selectedCategory === catSlug) {
      setExpandedCategory((prev) => (prev === catSlug ? null : catSlug));
      return;
    }

    setSelectedCategory(catSlug);
    setExpandedCategory(catSlug);
    setSelectedSubcategory('all');
    const params = new URLSearchParams(searchParams);
    params.set('category', catSlug);
    params.delete('subcategory');
    setSearchParams(params);
  };

  const handleSubcategoryChange = (subSlug) => {
    setSelectedSubcategory(subSlug);
    const params = new URLSearchParams(searchParams);
    if (subSlug === 'all') {
      params.delete('subcategory');
    } else {
      params.set('subcategory', subSlug);
    }
    setSearchParams(params);
  };

  const currentCategoryObj = categories.find((c) => c.slug === selectedCategory);

  return (
    <div className="w-full max-w-[1620px] mx-auto px-4 sm:px-8 lg:px-12 pt-1 pb-8">
      
      {/* 2-Column Main View with Guaranteed Minimum Height so Sidebar Never Collapses */}
      <div className="flex flex-col lg:flex-row gap-7 items-start relative min-h-[calc(100vh-5rem)]">
        
        {/* ============================================================ */}
        {/* FIXED ADMIN-STYLE GLASSMORPHISM FILTER SIDEBAR               */}
        {/* Starts flush from top with 0 dead space, sticks below navbar */}
        {/* ============================================================ */}
        <aside className="hidden lg:flex flex-col justify-between w-80 lg:w-[320px] shrink-0 sticky top-20 self-start max-h-[calc(100vh-5.5rem)] overflow-y-auto no-scrollbar glass-sidebar p-3.5 lg:p-4 shadow-xl space-y-3.5 z-20 transition-all">
          
          <div className="space-y-3.5">
            {/* Sidebar Header Console */}
            <div className="flex items-center justify-between pb-2.5 border-b border-yellow-300/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#fae125] text-black border border-yellow-400 flex items-center justify-center shadow-xs">
                  <FiSliders className="w-3.5 h-3.5 text-black" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Filter Console
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400">
                    {totalProducts} products
                  </span>
                </div>
              </div>

              {activeFilterCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#0d9488] text-white text-[10px] font-black shadow-xs">
                  {activeFilterCount} active
                </span>
              )}
            </div>

            {/* 1. Keyword Search Bar */}
            <div className="space-y-1">
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">
                Keyword Search
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Search catalog..."
                  className="w-full bg-white/90 border border-yellow-300/80 text-xs text-slate-900 rounded-xl py-1.5 pl-7 pr-6 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/30 transition-all font-semibold"
                />
                <FiSearch className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                {searchKeyword && (
                  <button
                    onClick={() => setSearchKeyword('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black cursor-pointer"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* 2. Categories Navigation (Admin NavItem Style) */}
            <div className="space-y-1">
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">
                Categories
              </div>

              <div className="space-y-1">
                {/* All Categories Pill */}
                <button
                  onClick={() => handleCategoryChange('all')}
                  className={`w-full group flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                    selectedCategory === 'all'
                      ? 'bg-[#fae125] text-black border-2 border-yellow-400 shadow-xs scale-[1.01]'
                      : 'bg-white/60 text-slate-800 hover:text-black hover:bg-yellow-50 border-yellow-200/50 hover:border-yellow-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                        selectedCategory === 'all'
                          ? 'bg-black text-[#fae125] border-black shadow-xs'
                          : 'text-slate-700 bg-slate-100 border-slate-300 group-hover:scale-105'
                      }`}
                    >
                      <FiGrid className="w-3 h-3" />
                    </div>
                    <span className="truncate">All Categories</span>
                  </div>
                  {selectedCategory === 'all' && (
                    <FiCheck className="w-3.5 h-3.5 text-black shrink-0" />
                  )}
                </button>

                {/* Individual Categories with Icons */}
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.slug;
                  const isExpanded = expandedCategory === cat.slug;
                  const meta = getCategoryMeta(cat.slug);
                  const Icon = meta.icon;

                  return (
                    <div key={cat._id} className="space-y-1">
                      <button
                        onClick={() => handleCategoryChange(cat.slug)}
                        className={`w-full group flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-[#fae125] text-black border-2 border-yellow-400 shadow-xs scale-[1.01]'
                            : 'bg-white/60 text-slate-800 hover:text-black hover:bg-yellow-50 border-yellow-200/50 hover:border-yellow-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                              isSelected
                                ? 'bg-black text-[#fae125] border-black shadow-xs'
                                : `${meta.color} group-hover:scale-105`
                            }`}
                          >
                            <Icon className="w-3 h-3" />
                          </div>
                          <span className="truncate">{cat.name}</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {cat.itemCount > 0 && (
                            <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${
                              isSelected ? 'bg-black text-[#fae125]' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {cat.itemCount}
                            </span>
                          )}
                          <FiChevronDown
                            className={`w-3 h-3 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180 text-black' : isSelected ? 'text-black' : 'text-slate-400'
                            }`}
                          />
                        </div>
                      </button>

                      {/* Subcategories Tree */}
                      {cat.subcategories && cat.subcategories.length > 0 && (
                        <div
                          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                            isExpanded
                              ? 'grid-rows-[1fr] opacity-100'
                              : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className="relative pl-2.5 my-1 ml-2.5 border-l-2 border-yellow-400 space-y-1">
                              <button
                                onClick={() => handleSubcategoryChange('all')}
                                className={`w-full text-left px-2 py-1 rounded-lg text-[10px] font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                                  selectedSubcategory === 'all'
                                    ? 'bg-[#0d9488] text-white shadow-xs'
                                    : 'text-slate-600 hover:text-black hover:bg-yellow-400/20'
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${selectedSubcategory === 'all' ? 'bg-white' : 'bg-slate-400'}`} />
                                <span>All {cat.name}</span>
                              </button>

                              {cat.subcategories.map((sub) => {
                                const isSubActive = selectedSubcategory === sub.slug;
                                return (
                                  <button
                                    key={sub.slug}
                                    onClick={() => handleSubcategoryChange(sub.slug)}
                                    className={`w-full text-left px-2 py-1 rounded-lg text-[10px] font-extrabold transition-all flex items-center justify-between cursor-pointer ${
                                      isSubActive
                                        ? 'bg-[#0d9488] text-white shadow-xs'
                                        : 'text-slate-600 hover:text-black hover:bg-yellow-400/20'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 truncate">
                                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSubActive ? 'bg-white' : 'bg-yellow-400'}`} />
                                      <span className="truncate">{sub.name}</span>
                                    </div>
                                    {sub.count > 0 && (
                                      <span className={`text-[9px] ml-1 shrink-0 ${isSubActive ? 'text-teal-100' : 'text-slate-400'}`}>
                                        ({sub.count})
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Price Range Slider */}
            <div className="space-y-1.5 pt-2.5 border-t border-yellow-300/40">
              <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">
                <span>Max Budget</span>
                <span className="text-[#0d9488] font-bold font-mono text-[11px]">
                  {formatPrice(priceRange)}
                </span>
              </div>

              <input
                type="range"
                min="500"
                max="150000"
                step="1000"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-[#0d9488] cursor-pointer h-1.5 bg-yellow-200 rounded-lg"
              />

              <div className="flex flex-wrap gap-1">
                {pricePresets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => setPriceRange(preset.value)}
                    className={`px-1.5 py-0.5 rounded-md text-[9px] font-extrabold transition-all cursor-pointer ${
                      priceRange === preset.value
                        ? 'bg-[#fae125] text-black border border-yellow-400 font-black shadow-2xs'
                        : 'bg-white/80 text-slate-600 hover:bg-yellow-100 border border-yellow-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Customer Rating (Compact 3-column Grid) */}
            <div className="space-y-1 pt-2.5 border-t border-yellow-300/40">
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">
                Minimum Rating
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {[4, 3, 2].map((stars) => (
                  <button
                    key={stars}
                    onClick={() => setMinRating(minRating === stars ? 0 : stars)}
                    className={`flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg text-[10px] font-black border transition-all cursor-pointer ${
                      minRating === stars
                        ? 'bg-amber-100 border border-amber-400 text-slate-950 shadow-2xs ring-1 ring-amber-300'
                        : 'bg-white/60 border-yellow-200 text-slate-700 hover:bg-yellow-100/60'
                    }`}
                  >
                    <span className="text-amber-500 font-black">{stars}★</span>
                    <span className="text-[9px] text-slate-500 font-bold">& Up</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 5. In-Stock Switch */}
            <div className="pt-2 border-t border-yellow-300/40">
              <label className="flex items-center justify-between p-2 rounded-xl bg-white/60 border border-yellow-200/80 cursor-pointer hover:bg-yellow-50 transition-colors">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-black text-slate-800">
                    In-Stock Items Only
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-[#0d9488] accent-[#0d9488] cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Sidebar Footer: Reset All Filters Button */}
          <div className="pt-2.5 border-t border-yellow-300/50">
            <button
              onClick={handleResetFilters}
              disabled={activeFilterCount === 0}
              className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                activeFilterCount > 0
                  ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-400 shadow-sm transform hover:-translate-y-0.5 active:scale-98'
                  : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
              }`}
            >
              <FiRotateCcw className="w-3 h-3" />
              <span>Reset All Filters</span>
            </button>
          </div>

        </aside>

        {/* ============================================================ */}
        {/* RIGHT SCROLLABLE PRODUCTS COLUMN                             */}
        {/* Contains Header, Active Filters, and Product Catalog         */}
        {/* Guaranteed Minimum Height so Sidebar never gets squeezed    */}
        {/* ============================================================ */}
        <div className="flex-1 min-w-0 space-y-5 min-h-[calc(100vh-8rem)] flex flex-col justify-between">
          
          <div className="space-y-5">
            {/* Header Bar inside Right Column */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-yellow-300/40">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-bold mb-1">
                  <span>Storefront</span>
                  <span>/</span>
                  <span className="text-[#0d9488]">Product Catalog</span>
                  {selectedCategory !== 'all' && (
                    <>
                      <span>/</span>
                      <span className="text-slate-900 capitalize font-extrabold">{currentCategoryObj?.name || selectedCategory}</span>
                    </>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Explore Product Catalog
                </h1>
              </div>

              {/* Top Controls: Mobile filter trigger & Sort */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden px-4 py-2.5 glass-pill bg-white text-xs font-black text-slate-900 flex items-center gap-2 shadow-xs cursor-pointer rounded-2xl border border-yellow-300"
                >
                  <FiFilter className="w-4 h-4 text-black" />
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[#fae125] text-black font-black text-[10px] flex items-center justify-center border border-yellow-400">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 hidden sm:inline">Sort By:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3.5 py-2.5 glass-input rounded-2xl text-xs font-black text-slate-900 outline-none focus:border-yellow-400 shadow-xs cursor-pointer"
                  >
                    <option value="popular">🔥 Most Popular</option>
                    <option value="rating">⭐ Highest Rated</option>
                    <option value="price-low">📉 Price: Low to High</option>
                    <option value="price-high">📈 Price: High to Low</option>
                    <option value="newest">✨ Newest Drops</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filter Chips Bar */}
            {activeFilterCount > 0 && (
              <div className="flex items-center gap-2 flex-wrap bg-white/70 p-3 rounded-2xl border border-yellow-300/60 shadow-2xs">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1">
                  <FiFilter className="w-3 h-3 text-[#0d9488]" /> Active Filters:
                </span>

                {selectedCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-black text-xs font-bold rounded-lg border border-yellow-300">
                    Category: {currentCategoryObj?.name || selectedCategory}
                    <button onClick={() => handleCategoryChange('all')} className="hover:text-rose-600 cursor-pointer">
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedSubcategory !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-100 text-teal-900 text-xs font-bold rounded-lg border border-teal-300">
                    Sub: {selectedSubcategory}
                    <button onClick={() => handleSubcategoryChange('all')} className="hover:text-rose-600 cursor-pointer">
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {searchKeyword && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-900 text-xs font-bold rounded-lg border border-slate-300">
                    "{searchKeyword}"
                    <button onClick={() => setSearchKeyword('')} className="hover:text-rose-600 cursor-pointer">
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {priceRange < 150000 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-lg border border-amber-300">
                    ≤ {formatPrice(priceRange)}
                    <button onClick={() => setPriceRange(150000)} className="hover:text-rose-600 cursor-pointer">
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {minRating > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-lg border border-amber-300">
                    {minRating}★ & Up
                    <button onClick={() => setMinRating(0)} className="hover:text-rose-600 cursor-pointer">
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {inStockOnly && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-900 text-xs font-bold rounded-lg border border-emerald-300">
                    In Stock Only
                    <button onClick={() => setInStockOnly(false)} className="hover:text-rose-600 cursor-pointer">
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                )}

                <button
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-rose-600 hover:underline ml-auto cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Top Subcategory Chips Bar (When a Category is Selected) */}
            {currentCategoryObj?.subcategories && currentCategoryObj.subcategories.length > 0 && (
              <div className="py-1">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  <button
                    onClick={() => handleSubcategoryChange('all')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                      selectedSubcategory === 'all'
                        ? 'bg-[#fae125] text-black border-2 border-yellow-400 shadow-sm'
                        : 'bg-white text-slate-700 hover:bg-[#fae125] hover:text-black border border-yellow-200'
                    }`}
                  >
                    <FiGrid className="w-3.5 h-3.5 shrink-0" />
                    <span>All {currentCategoryObj.name}</span>
                  </button>

                  {currentCategoryObj.subcategories.map((sub) => {
                    const isSubActive = selectedSubcategory === sub.slug;
                    const subImgUrl = sub.image || subcategoryImageMap[sub.slug];
                    return (
                      <button
                        key={sub.slug}
                        onClick={() => handleSubcategoryChange(sub.slug)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                          isSubActive
                            ? 'bg-[#fae125] text-black border-2 border-yellow-400 shadow-md ring-2 ring-yellow-300/40'
                            : 'bg-white text-slate-700 hover:bg-[#fae125] hover:text-black border border-yellow-200'
                        }`}
                      >
                        {subImgUrl ? (
                          <img
                            src={subImgUrl}
                            alt={sub.name}
                            className="w-5 h-5 rounded-md object-cover border border-white/60 shrink-0"
                          />
                        ) : (
                          getSubcategoryIcon(sub.slug)
                        )}
                        <span>{sub.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Products Grid Container with Multiple Rows (limit=18) */}
            <div className="relative">
              {initialLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 sm:gap-6">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="h-72 bg-white/70 rounded-3xl border border-yellow-200 animate-pulse p-4 flex flex-col justify-between">
                      <div className="h-36 bg-yellow-100/50 rounded-2xl"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-yellow-100/50 rounded w-3/4"></div>
                        <div className="h-4 bg-yellow-100/50 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="glass-panel p-12 text-center space-y-4 shadow-sm">
                  <div className="w-16 h-16 rounded-full bg-[#fffdf0] text-amber-600 border border-yellow-300 flex items-center justify-center mx-auto text-2xl">
                    🔍
                  </div>
                  <h3 className="text-lg font-black text-slate-800">No matching products found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try choosing another subcategory or resetting filters to explore all available products.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="px-6 py-2.5 bg-[#fae125] hover:bg-yellow-300 text-black font-black text-xs rounded-xl shadow-md border border-yellow-400 cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 sm:gap-6 transition-opacity duration-300 ${isFetching ? 'opacity-50' : 'opacity-100'}`}>
                  {products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      onQuickView={(p) => setQuickViewProduct(p)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8 pb-4">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setPage(idx + 1)}
                  className={`w-9 h-9 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    page === idx + 1
                      ? 'bg-[#fae125] text-black border border-yellow-400 shadow-md'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-[9999] overflow-hidden lg:hidden">
          <div
            onClick={() => setMobileFilterOpen(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-sm glass-sidebar p-6 overflow-y-auto space-y-6 animate-in slide-in-from-right duration-300 border-l-2 border-yellow-300">
              <div className="flex items-center justify-between pb-4 border-b border-yellow-300/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#fae125] text-slate-950 border border-yellow-400 flex items-center justify-center shadow-2xs font-black">
                    <FiSliders className="w-4 h-4 text-black" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900">Filter Console</h3>
                </div>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1.5 rounded-xl glass-pill text-slate-700 hover:text-black cursor-pointer"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Search keyword */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                  Keyword Search
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="Search catalog..."
                    className="w-full bg-white/90 border border-yellow-300/80 text-xs text-slate-900 rounded-xl py-2 pl-8 pr-3 outline-none focus:border-yellow-400 font-semibold"
                  />
                  <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                  Categories
                </div>
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1 no-scrollbar">
                  <button
                    onClick={() => {
                      handleCategoryChange('all');
                      setMobileFilterOpen(false);
                    }}
                    className={`w-full group flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer border ${
                      selectedCategory === 'all'
                        ? 'bg-[#fae125] text-black border-2 border-yellow-400 shadow-xs'
                        : 'bg-white/60 text-slate-800 hover:bg-yellow-400/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FiGrid className="w-3.5 h-3.5" />
                      <span>All Categories</span>
                    </div>
                  </button>
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat.slug;
                    const isExpanded = expandedCategory === cat.slug;
                    const meta = getCategoryMeta(cat.slug);
                    const Icon = meta.icon;

                    return (
                      <div key={cat._id} className="space-y-1">
                        <button
                          onClick={() => handleCategoryChange(cat.slug)}
                          className={`w-full group flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-[#fae125] text-black border-2 border-yellow-400 shadow-xs'
                              : 'bg-white/60 text-slate-800 hover:bg-yellow-400/10'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border ${meta.color}`}>
                              <Icon className="w-3 h-3" />
                            </div>
                            <span className="truncate">{cat.name}</span>
                          </div>
                          <FiChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-black' : isSelected ? 'text-black' : 'text-slate-400'}`} />
                        </button>

                        {cat.subcategories && cat.subcategories.length > 0 && (
                          <div
                            className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                              isExpanded
                                ? 'grid-rows-[1fr] opacity-100'
                                : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                            }`}
                          >
                            <div className="overflow-hidden">
                              <div className="relative pl-3.5 my-1.5 ml-3 border-l-2 border-yellow-400 space-y-1">
                                <button
                                  onClick={() => {
                                    handleSubcategoryChange('all');
                                    setMobileFilterOpen(false);
                                  }}
                                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-2 cursor-pointer ${
                                    selectedSubcategory === 'all'
                                      ? 'bg-yellow-400/30 text-slate-950 font-black'
                                      : 'text-slate-600 hover:text-slate-950'
                                  }`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${selectedSubcategory === 'all' ? 'bg-[#fae125] ring-2 ring-yellow-400' : 'bg-slate-300'}`} />
                                  <span>All {cat.name}</span>
                                </button>
                                {cat.subcategories.map((sub) => {
                                  const isSubActive = selectedSubcategory === sub.slug;
                                  return (
                                    <button
                                      key={sub.slug}
                                      onClick={() => {
                                        handleSubcategoryChange(sub.slug);
                                        setMobileFilterOpen(false);
                                      }}
                                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-2 cursor-pointer ${
                                        isSubActive
                                          ? 'bg-yellow-400/30 text-slate-950 font-black'
                                          : 'text-slate-600 hover:text-slate-950'
                                      }`}
                                    >
                                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSubActive ? 'bg-black ring-2 ring-yellow-400' : 'bg-yellow-400/60'}`} />
                                      <span className="truncate">{sub.name}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                  <span>Max Price</span>
                  <span className="text-[#0d9488] text-sm font-black font-mono">{formatPrice(priceRange)}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="150000"
                  step="1000"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-[#0d9488] cursor-pointer"
                />
              </div>

              {/* In Stock Only */}
              <div className="pt-2 border-t border-yellow-200/50">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0d9488] accent-[#0d9488] cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-800">In-Stock Items Only</span>
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => {
                    handleResetFilters();
                    setMobileFilterOpen(false);
                  }}
                  className="flex-1 py-2.5 glass-pill text-slate-700 font-bold text-xs rounded-xl"
                >
                  Reset
                </button>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="flex-1 py-2.5 bg-[#fae125] hover:bg-yellow-300 text-black font-black text-xs rounded-xl shadow-md border border-yellow-400"
                >
                  Show Results
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
