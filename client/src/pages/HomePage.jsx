import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { DeliveryBanner } from '../components/DeliveryBanner';
import { HeroBanner } from '../components/HeroBanner';
import { CategoriesSection } from '../components/CategoriesSection';
import { TrendingDeals } from '../components/TrendingDeals';
import { FeaturedProducts } from '../components/FeaturedProducts';
import { PromoBannerOne, PromoBannerTwo } from '../components/PromoBanners';
import { NewArrivals } from '../components/NewArrivals';
import { WhyChooseUs } from '../components/WhyChooseUs';
import { QuickViewModal } from '../components/QuickViewModal';
import { ProductCard } from '../components/ProductCard';
import { CategoryAdBanner } from '../components/CategoryAdBanner';
import { FiArrowLeft, FiArrowRight, FiGrid, FiLayers } from 'react-icons/fi';

const adBanners = [
  // 1. IMAGE BANNER: Light Sage Green (Audio)
  {
    isImageBanner: true,
    layout: 'split-image',
    tag: '⚡ LIMITED TIME AUDIO DROP',
    title: 'Noise-Canceling & Studio Sound — Flat 25% OFF',
    subtitle: 'Immerse yourself in 360° spatial acoustics, 40-hour playtime, and active ANC transparency.',
    perk: 'Official 2-Year Warranty',
    badgeText: 'Top Sound 2026',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800',
    buttonText: 'Claim Audio Offer',
    link: '/shop?category=audio-sound',
    bgGradient: 'bg-gradient-to-r from-[#ecfdf5] via-[#d1fae5] to-[#a7f3d0]',
    borderColor: 'border-emerald-200',
  },
  // 2. NON-IMAGE BANNER: Light Warm Brown / Caramel Sand (Smartphones)
  {
    isImageBanner: false,
    tag: '📱 5G FLAGSHIP UPGRADE',
    couponCode: 'TECH5G',
    title: 'Instant ₹15,000 Exchange Bonus + Zero-Cost EMI',
    subtitle: 'Upgrade to flagship 5G mobile devices with Snapdragon 8 Gen 3, AMOLED displays, and Warp Charge.',
    perks: ['Zero Downpayment', 'Free Screen Protection', 'Same-Day Dispatch'],
    highlightBadge: { label: 'Special Discount', value: 'Save Up To 35%' },
    buttonText: 'Explore Smartphones',
    link: '/shop?category=smartphones-tech',
    bgGradient: 'bg-gradient-to-r from-[#fffbeb] via-[#fef3c7] to-[#fde68a]',
    borderColor: 'border-amber-200',
  },
  // 3. IMAGE BANNER: Light Mint Olive Green (Fashion)
  {
    isImageBanner: true,
    layout: 'backdrop-glass',
    tag: '✨ NEXUS RUNWAY DROP 2026',
    title: 'Flat 40% OFF Designer Apparel & Streetwear',
    subtitle: 'Limited-run organic heavyweight hoodies, tailored outerwear, and modern minimalist fits.',
    badgeText: 'Runway Exclusive',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200',
    buttonText: 'Shop Fashion Sale',
    link: '/shop?category=fashion-apparel',
    bgGradient: 'bg-gradient-to-r from-[#f0fdf4]/95 via-[#dcfce7]/90 to-[#bbf7d0]/75',
    borderColor: 'border-green-200',
  },
  // 4. NON-IMAGE BANNER: Light Warm Hazelnut Brown / Latte (Gaming)
  {
    isImageBanner: false,
    tag: '🎮 ESPORTS ARENA PASS',
    couponCode: 'GAME240',
    title: '240Hz OLED Monitors & Hall-Effect Keyboards',
    subtitle: 'Rapid-trigger mechanical switches, ultra-lightweight optical sensors, and RGB Aura sync bundles.',
    perks: ['Sub-1ms Latency', 'Free RGB Desk Mat', 'Hot-Swap PCB'],
    highlightBadge: { label: 'Gamer Privilege', value: 'Extra 20% OFF' },
    buttonText: 'Gear Up Now',
    link: '/shop?category=gaming-gear',
    bgGradient: 'bg-gradient-to-r from-[#fff7ed] via-[#ffedd5] to-[#fed7aa]',
    borderColor: 'border-orange-200',
  },
  // 5. IMAGE BANNER: Light Spring Green (Smart Home)
  {
    isImageBanner: true,
    layout: 'split-image',
    tag: '🏠 SMART LIVING ECOSYSTEM',
    title: 'AI Smart Security & Ambient LED Sync Systems',
    subtitle: 'Automate your home with 4K HDR wireless security cameras, voice assistants, and climate control.',
    perk: 'Instant Setup Guaranteed',
    badgeText: 'Smart IoT',
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800',
    buttonText: 'Build Smart Home',
    link: '/shop?category=smart-home-iot',
    bgGradient: 'bg-gradient-to-r from-[#f7fee7] via-[#ecfccb] to-[#d9f99d]',
    borderColor: 'border-lime-200',
  },
  // 6. NON-IMAGE BANNER: Light Warm Ochre Sand Brown (Photography & Drones)
  {
    isImageBanner: false,
    tag: '📸 CREATOR PRO BUNDLE',
    couponCode: 'CINEMA4K',
    title: 'Cinema 4K Drone Bundles with Free Extra Batteries',
    subtitle: '3-Axis gimbal stabilization, 10km live video transmission, and optical obstacle avoidance.',
    perks: ['Free Hardcase Flight Bag', '2 Extra Batteries', '1-Yr Drone Care'],
    highlightBadge: { label: 'Bundle Savings', value: '₹12,499 Value Free' },
    buttonText: 'View Creator Gear',
    link: '/shop?category=photography-drones',
    bgGradient: 'bg-gradient-to-r from-[#fefce8] via-[#fef08a]/80 to-[#fed7aa]',
    borderColor: 'border-yellow-200',
  },
  // 7. IMAGE BANNER: Light Celadon Mint Green (Wearables)
  {
    isImageBanner: true,
    layout: 'split-image',
    tag: '⌚ WEARABLES & TELEMETRY',
    title: 'Titanium Smartwatches & Health Trackers',
    subtitle: 'Advanced optical heart-rate monitoring, sapphire glass, and 14-day continuous battery life.',
    perk: 'Includes Extra Sport Strap',
    badgeText: 'Titanium Edition',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
    buttonText: 'Discover Smartwatches',
    link: '/shop?category=wearables-fitness',
    bgGradient: 'bg-gradient-to-r from-[#f0fdfa] via-[#ccfbf1] to-[#99f6e4]',
    borderColor: 'border-teal-200',
  },
  // 8. NON-IMAGE BANNER: Light Toffee & Warm Cream Brown (Footwear & Sneakers)
  {
    isImageBanner: false,
    tag: '👟 SNEAKERHEADS DROP',
    couponCode: 'KICKS30',
    title: 'Ultra-Responsive Cloud Foam & Streetwear Kicks',
    subtitle: 'Breathable flyknit mesh with high-rebound cushioning for maximum daily comfort and street performance.',
    perks: ['30-Day Wear Test', 'Free Express Return', '100% Authentic'],
    highlightBadge: { label: 'Member Exclusive', value: 'Flat 30% OFF' },
    buttonText: 'Shop Sneakers Drop',
    link: '/shop?category=footwear-shoes',
    bgGradient: 'bg-gradient-to-r from-[#fffbeb] via-[#fed7aa]/60 to-[#fde68a]',
    borderColor: 'border-amber-200',
  },
];

export const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [deals, setDeals] = useState([]);
  const [flashSaleConfig, setFlashSaleConfig] = useState(null);
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categoryBlocks, setCategoryBlocks] = useState([]);
  const [backendAds, setBackendAds] = useState([]);
  const [loading, setLoading] = useState(true);

  // In-page Category & Subcategory filter state
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [loadingCategoryProducts, setLoadingCategoryProducts] = useState(false);

  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, dealsRes, featRes, allProdsRes, adsRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products/deals'),
          api.get('/products/featured'),
          api.get('/products?limit=100'),
          api.get('/advertisements').catch(() => ({ data: { advertisements: [] } })),
        ]);

        const loadedCats = catRes.data.categories || [];
        const allProds = allProdsRes.data.products || [];
        const loadedAds = adsRes.data?.advertisements || [];

        setCategories(loadedCats);
        setDeals(dealsRes.data.flashDeals || []);
        setFlashSaleConfig(dealsRes.data.flashSaleConfig || null);
        setNewArrivals(dealsRes.data.newArrivals || []);
        setFeatured(featRes.data.products || []);
        setBackendAds(loadedAds);

        const blocks = loadedCats.map((cat) => {
          const matching = allProds.filter(
            (p) =>
              (p.categoryName && p.categoryName.toLowerCase() === cat.name.toLowerCase()) ||
              p.category?.slug === cat.slug ||
              p.category === cat._id ||
              p.category?.name === cat.name
          );
          const displayProds = matching.length >= 2 ? matching : allProds.slice(0, 4);
          return {
            ...cat,
            products: displayProds,
          };
        });

        setCategoryBlocks(blocks);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSelectCategory = async (categorySlug) => {
    setSelectedCategory(categorySlug);
    setSelectedSubcategory('all');
    if (categorySlug !== 'all') {
      setLoadingCategoryProducts(true);
      try {
        const { data } = await api.get(`/products?category=${categorySlug}&limit=16`);
        setCategoryProducts(data.products || []);
      } catch (err) {
        console.error('Failed to load category products:', err);
      } finally {
        setLoadingCategoryProducts(false);
      }
    }
  };

  const handleSelectSubcategory = async (subcategorySlug) => {
    setSelectedSubcategory(subcategorySlug);
    setLoadingCategoryProducts(true);
    try {
      const url =
        subcategorySlug === 'all'
          ? `/products?category=${selectedCategory}&limit=16`
          : `/products?category=${selectedCategory}&subcategory=${subcategorySlug}&limit=16`;
      const { data } = await api.get(url);
      setCategoryProducts(data.products || []);
    } catch (err) {
      console.error('Failed to load subcategory products:', err);
    } finally {
      setLoadingCategoryProducts(false);
    }
  };

  const selectedCategoryObj = categories.find((c) => c.slug === selectedCategory);

  return (
    <div className="min-h-screen">
      {/* 1. Delivery Guarantee Bar */}
      <DeliveryBanner />

      {/* 2. Explore Categories Section (Centered Navigation + Instant Subcategories Row Just Below) */}
      <CategoriesSection
        categories={categories}
        selectedCategory={selectedCategory}
        selectedSubcategory={selectedSubcategory}
        onSelectCategory={handleSelectCategory}
        onSelectSubcategory={handleSelectSubcategory}
      />

      {/* Dynamic In-Page Category & Subcategory View */}
      {selectedCategory !== 'all' ? (
        <section className="w-full max-w-[1620px] mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-10 animate-in fade-in duration-300">

          {/* Category Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-teal-200">
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fae125] text-black border border-yellow-300 text-[10px] font-black uppercase tracking-wider mb-2 shadow-2xs">
                <span>Selected Category</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 capitalize flex items-center gap-2 sm:gap-3 flex-wrap break-words">
                <span>{selectedCategoryObj?.name || selectedCategory}</span>
                <span className="text-xs font-black text-teal-900 bg-[#e5f3f3] px-3 py-1 rounded-full border border-teal-300 shrink-0">
                  {categoryProducts.length} Products Found
                </span>
              </h2>
            </div>

            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedSubcategory('all');
              }}
              className="self-start sm:self-auto px-4 py-2 bg-[#e5f3f3] hover:bg-[#fae125] text-teal-950 hover:text-black text-xs font-black rounded-xl flex items-center gap-1.5 transition-all border border-teal-300 cursor-pointer shadow-2xs shrink-0"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
          </div>

          {/* Product Grid / Loading State */}
          {loadingCategoryProducts ? (
            <div className="py-16 text-center">
              <div className="w-10 h-10 border-4 border-[#0d9488] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs font-bold text-slate-600">Loading products...</p>
            </div>
          ) : categoryProducts.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-teal-200 p-8 space-y-4 shadow-sm">
              <h3 className="text-base font-black text-slate-900">No products found in this subcategory</h3>
              <p className="text-xs text-slate-500 font-semibold">Try selecting another subcategory or view all products.</p>
              <button
                onClick={() => handleSelectSubcategory('all')}
                className="inline-block px-5 py-2.5 bg-[#fae125] hover:bg-yellow-300 text-black font-black text-xs rounded-xl shadow-md border border-yellow-400 cursor-pointer"
              >
                View All {selectedCategoryObj?.name}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-6 sm:gap-7">
              {categoryProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
          {/* 3. Dynamic Backend Hero Banner with CTA */}
          <HeroBanner
            heroSlides={backendAds.filter((a) => a.placement === 'hero_slide')}
          />

          {/* 4. Trending Deals / Flash Sale Section */}
          <TrendingDeals
            deals={deals}
            flashSaleConfig={flashSaleConfig}
            onQuickView={(p) => setQuickViewProduct(p)}
          />

          {/* Promotional Banner 1: High-Res Audio Deal */}
          <PromoBannerOne />

          {/* New Arrivals Section */}
          <NewArrivals
            newArrivals={newArrivals}
            onQuickView={(p) => setQuickViewProduct(p)}
          />

          {/* Promotional Banner 2: Ultra Tech Showcase */}
          <PromoBannerTwo />

          {/* 5. Products Grouped by Every Category with Light Green & Light Brown Alternating Ad Banners */}
          {categoryBlocks.map((block, index) => {
            const matchingBackendAd = backendAds.find(
              (ad) =>
                ad.categorySlug === block.slug ||
                ad.category?._id === block._id ||
                ad.category === block._id
            );
            const ad = matchingBackendAd || backendAds[index % (backendAds.length || 1)] || adBanners[index % adBanners.length];
            return (
              <React.Fragment key={block._id || index}>
                {/* Category Section Block */}
                <section className="w-full max-w-[1620px] mx-auto px-6 sm:px-8 lg:px-12 my-10 sm:my-14 lg:my-16">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 pb-3.5 border-b border-teal-200/80">
                    <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#fae125] text-black border border-yellow-400 flex items-center justify-center font-black shadow-2xs shrink-0 mt-0.5 sm:mt-0">
                        <FiGrid className="w-4 h-4 text-black" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-snug break-words">
                          {block.name}
                        </h3>
                        <p className="text-xs font-bold text-slate-500 break-words leading-relaxed">
                          Handpicked top {block.name.toLowerCase()} for you
                        </p>
                      </div>
                    </div>

                    <Link
                      to={`/shop?category=${block.slug}`}
                      className="self-start sm:self-auto px-4 py-2 bg-[#e5f3f3] hover:bg-[#fae125] text-teal-950 hover:text-black font-black text-xs rounded-xl border border-teal-300 transition-all shadow-2xs flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <span className="hidden md:inline">Explore All {block.name}</span>
                      <span className="md:hidden">View All</span>
                      <FiArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                  {/* Product Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-6 sm:gap-7">
                    {block.products.slice(0, 5).map((product) => (
                      <ProductCard
                        key={product._id}
                        product={product}
                        onQuickView={(p) => setQuickViewProduct(p)}
                      />
                    ))}
                  </div>
                </section>

                {/* Dynamic Backend Ad Banner (Supports Video, Image & Simple) */}
                <CategoryAdBanner ad={ad} index={index} />
              </React.Fragment>
            );
          })}
        </>
      )}

      {/* Why Choose Us Section */}
      <WhyChooseUs />

      {/* Modals */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
