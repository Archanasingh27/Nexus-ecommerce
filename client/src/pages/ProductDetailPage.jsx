import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ProductCard } from '../components/ProductCard';
import {
  FiStar,
  FiShoppingBag,
  FiHeart,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiCheck,
  FiChevronRight,
  FiSend,
  FiZap,
  FiPhone,
  FiMessageSquare,
} from 'react-icons/fi';
import { VendorContactModal } from '../components/VendorContactModal';
import { formatPrice, formatDate } from '../utils/helpers';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('specs'); // 'specs' | 'reviews'
  const [contactModalOpen, setContactModalOpen] = useState(false);

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data.product);
        setRelatedProducts(data.relatedProducts || []);
        setSelectedImage(0);
        setQuantity(1);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      addToast('Please sign in to submit a review', 'error');
      navigate('/auth');
      return;
    }
    if (!reviewComment.trim()) {
      addToast('Please write a comment', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      await api.post(`/products/${product._id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment,
      });
      addToast('Review submitted successfully!', 'success');
      setReviewComment('');

      // Refresh product details to show new review
      const { data } = await api.get(`/products/${product._id}`);
      setProduct(data.product);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-[#0d9488] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-bold text-slate-700">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-black text-slate-900">Product Not Found</h2>
        <Link to="/shop" className="px-6 py-2.5 bg-[#0d9488] text-white rounded-xl font-bold text-xs">
          Return to Shop
        </Link>
      </div>
    );
  }

  const isSaved = isInWishlist(product._id);
  const images = product.images || ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-6 flex-wrap">
        <Link to="/" className="text-slate-600 hover:text-[#0d9488] transition-colors">Home</Link>
        <FiChevronRight className="w-3 h-3 text-slate-400" />
        <Link to="/shop" className="text-slate-600 hover:text-[#0d9488] transition-colors">Shop</Link>
        <FiChevronRight className="w-3 h-3 text-slate-400" />
        <Link to={`/shop?category=${product.category?.slug || 'all'}`} className="text-[#0d9488] hover:underline font-black">
          {product.categoryName}
        </Link>
        <FiChevronRight className="w-3 h-3 text-slate-400" />
        <span className="text-slate-950 font-black truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* Left Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white border border-teal-200/90 shadow-sm">
            {product.discountPercentage > 0 && (
              <span className="absolute top-4 left-4 z-10 bg-[#fae125] text-slate-950 border border-yellow-400 text-xs font-black px-3 py-1 rounded-full shadow-md">
                {product.discountPercentage}% OFF
              </span>
            )}
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-white cursor-pointer ${selectedImage === idx
                      ? 'border-[#0d9488] scale-95 shadow-md'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Info Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-[#0d9488] mb-2">
              <span>{product.brand}</span>
              <span className="text-slate-500 font-bold">SKU: {product._id.slice(-6).toUpperCase()}</span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-950 leading-snug break-words">
              {product.name}
            </h1>

            {/* Rating Bar */}
            <div className="flex items-center gap-2 sm:gap-3 my-3 flex-wrap">
              <div className="flex items-center text-[#fae125]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FiStar
                    key={i}
                    className={`w-4 h-4 ${i < Math.round(product.rating || 5) ? 'fill-[#fae125] text-[#fae125]' : 'text-slate-300'}`}
                  />
                ))}
              </div>
              <span className="text-xs font-black text-slate-900">{product.rating || 4.8}</span>
              <span className="text-xs text-slate-500 font-medium">({product.numReviews || 0} reviews)</span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {product.soldCount ? `${product.soldCount}+ bought this month` : 'Popular choice'}
              </span>
            </div>

            {/* Pricing Box (Glass Card) */}
            <div className="glass-card-brand p-4 sm:p-5 my-4 flex items-baseline justify-between shadow-md flex-wrap gap-3">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-950">
                  {formatPrice(product.price)}
                </div>
                {product.originalPrice > product.price && (
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs sm:text-sm text-slate-400 line-through font-medium">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <span className="text-xs font-black text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                      Save {formatPrice(product.originalPrice - product.price)}
                    </span>
                  </div>
                )}
              </div>

              <div className="text-right">
                <span className={`text-xs font-black px-3 py-1 rounded-full ${product.countInStock > 0 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                  {product.countInStock > 0 ? `In Stock (${product.countInStock})` : 'Out of Stock'}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed break-words">
              {product.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 pt-4 border-t border-teal-100/70">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-teal-100/80 rounded-2xl glass p-1 shadow-xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-slate-700 hover:text-slate-950 font-black cursor-pointer"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm font-black text-slate-950">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.countInStock, quantity + 1))}
                  className="w-10 h-10 flex items-center justify-center text-slate-700 hover:text-slate-950 font-black cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Add to Shopping Bag - Yellow Primary Button */}
              <button
                onClick={() => addToCart(product, quantity)}
                disabled={product.countInStock <= 0}
                className="flex-1 py-3.5 bg-[#fae125] hover:bg-yellow-300 disabled:bg-slate-200 text-slate-950 font-black text-sm rounded-2xl shadow-md shadow-yellow-400/20 border border-yellow-400 flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer"
              >
                <FiShoppingBag className="w-5 h-5 text-slate-950" />
                <span>Add to Shopping Bag</span>
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`p-3.5 rounded-2xl border transition-all shadow-xs cursor-pointer ${isSaved ? 'bg-rose-500 text-white border-rose-500' : 'glass-pill text-slate-600 hover:text-rose-500'
                  }`}
                title={isSaved ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <FiHeart className={`w-5 h-5 ${isSaved ? 'fill-white' : ''}`} />
              </button>
            </div>

            {/* Quick Buy Now - Custom Color #328616 Button */}
            <button
              onClick={() => {
                addToCart(product, quantity);
                navigate('/checkout');
              }}
              disabled={product.countInStock <= 0}
              className="w-full py-3.5 bg-[#328616] hover:bg-[#286f12] disabled:bg-slate-200 text-white font-black text-sm rounded-2xl shadow-md border border-[#266810] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <FiZap className="w-4 h-4 fill-white" />
              <span>Buy Now</span>
            </button>
          </div>

          {/* Seller / Merchant Store Info Box */}
          <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center font-black text-sm shrink-0 shadow-2xs">
                  🏪
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-slate-900 text-xs sm:text-sm">
                      {product.vendorStoreName || product.vendor?.storeName || 'Nexus Direct'}
                    </span>
                    <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full border border-emerald-200">
                      ✓ Verified Merchant
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Fulfilled & dispatched from Indore Warehouse • 100% Genuine Certified
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0 hidden sm:block">
                <div className="text-[11px] font-black text-emerald-800">4.9 ★ Rating</div>
                <div className="text-[10px] text-slate-400">99.4% On-Time</div>
              </div>
            </div>

            {/* Quick Contact & Chat with Seller button */}
            <button
              onClick={() => setContactModalOpen(true)}
              className="w-full py-2.5 px-4 bg-white hover:bg-amber-100/60 text-amber-900 border border-amber-300 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer"
            >
              <FiMessageSquare className="w-3.5 h-3.5 text-amber-700" />
              <span>Ask Seller a Question / Call Support</span>
            </button>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-teal-100/70 text-center">
            <div className="p-3.5 glass-card rounded-2xl">
              <FiTruck className="w-4 h-4 text-[#0d9488] mx-auto mb-1" />
              <span className="text-[11px] font-black text-slate-900 block">Free Shipping</span>
              <span className="text-[10px] text-slate-500 font-medium">Over ₹1,499</span>
            </div>
            <div className="p-3.5 glass-card rounded-2xl">
              <FiShield className="w-4 h-4 text-[#0d9488] mx-auto mb-1" />
              <span className="text-[11px] font-black text-slate-900 block">2-Yr Warranty</span>
              <span className="text-[10px] text-slate-500 font-medium">Official Brand</span>
            </div>
            <div className="p-3.5 glass-card rounded-2xl">
              <FiRefreshCw className="w-4 h-4 text-[#0d9488] mx-auto mb-1" />
              <span className="text-[11px] font-black text-slate-900 block">30 Days Return</span>
              <span className="text-[10px] text-slate-500 font-medium">Easy Refund</span>
            </div>
          </div>

        </div>

      </div>

      {/* Tabs: Specifications & Customer Reviews (Glass Panel) */}
      <div className="mt-16 glass-panel p-6 sm:p-8">
        <div className="flex border-b border-teal-100/70 gap-8 mb-6">
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-4 text-sm font-black transition-all relative cursor-pointer ${activeTab === 'specs'
                ? 'text-[#0d9488] border-b-2 border-[#0d9488]'
                : 'text-slate-400 hover:text-slate-700'
              }`}
          >
            Technical Specifications
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 text-sm font-black transition-all relative cursor-pointer ${activeTab === 'reviews'
                ? 'text-[#0d9488] border-b-2 border-[#0d9488]'
                : 'text-slate-400 hover:text-slate-700'
              }`}
          >
            Customer Reviews ({product.reviews?.length || 0})
          </button>
        </div>

        {/* Tab 1: Specs */}
        {activeTab === 'specs' && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-950">Technical Details & Specifications</h3>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden max-w-2xl">
              <div className="flex py-3 px-4 bg-slate-50 text-xs font-semibold">
                <span className="w-1/3 text-slate-500 font-medium">Brand Manufacturer</span>
                <span className="w-2/3 text-slate-950 font-black">{product.brand}</span>
              </div>
              <div className="flex py-3 px-4 text-xs font-semibold">
                <span className="w-1/3 text-slate-500 font-medium">Category</span>
                <span className="w-2/3 text-slate-950 font-black">{product.categoryName}</span>
              </div>
              {product.specifications?.map((spec, i) => (
                <div key={i} className={`flex py-3 px-4 text-xs font-semibold ${i % 2 === 0 ? 'bg-slate-50' : ''}`}>
                  <span className="w-1/3 text-slate-500 font-medium">{spec.name}</span>
                  <span className="w-2/3 text-slate-950 font-black">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-8">

            {/* Submit Review Form */}
            <div className="bg-[#fffdf0] p-6 rounded-2xl border border-yellow-200/90 max-w-2xl shadow-2xs">
              <h3 className="text-sm font-black text-slate-950 mb-2">Write a Verified Customer Review</h3>
              {isAuthenticated ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Your Rating</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setReviewRating(star)}
                          className="text-[#fae125] focus:outline-none cursor-pointer"
                        >
                          <FiStar className={`w-6 h-6 ${star <= reviewRating ? 'fill-[#fae125]' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Your Experience & Feedback</label>
                    <textarea
                      rows={3}
                      required
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share what you like about the product performance, quality, delivery..."
                      className="w-full bg-white border border-yellow-200 rounded-xl p-3 text-xs text-slate-900 font-medium outline-none focus:border-[#0d9488]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-5 py-2.5 bg-[#0d9488] hover:bg-teal-700 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FiSend className="w-3.5 h-3.5" />
                    <span>{submittingReview ? 'Submitting...' : 'Post Review'}</span>
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-600 font-medium">Please sign in to leave your product review.</p>
                  <Link to="/auth" className="px-4 py-2 bg-[#0d9488] text-white font-black text-xs rounded-xl hover:bg-teal-700">
                    Sign In
                  </Link>
                </div>
              )}
            </div>

            {/* Reviews List */}
            <div className="space-y-4 max-w-3xl">
              {(!product.reviews || product.reviews.length === 0) ? (
                <p className="text-xs text-slate-500 font-medium">No reviews yet for this product. Be the first to review!</p>
              ) : (
                product.reviews.map((rev, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#fffdf0] border border-yellow-200/90 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={rev.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={rev.userName}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="text-xs font-black text-slate-900">{rev.userName}</div>
                          <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                            <FiCheck className="w-3 h-3" /> Verified Buyer
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center text-[#fae125] text-xs">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <FiStar key={i} className="w-3.5 h-3.5 fill-[#fae125]" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-800 font-medium leading-relaxed pt-1">{rev.comment}</p>
                    <span className="text-[10px] text-slate-400 block">{formatDate(rev.createdAt)}</span>
                  </div>
                ))
              )}
            </div>

          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-6">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Vendor Contact & Live Chat Modal */}
      {product && (
        <VendorContactModal
          isOpen={contactModalOpen}
          onClose={() => setContactModalOpen(false)}
          vendor={
            product.vendor || {
              storeName: product.vendorStoreName || 'Nexus Merchant',
              phone: '9876543210',
            }
          }
          product={product}
        />
      )}

    </div>
  );
};
