import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import {
  FiShoppingBag,
  FiMail,
  FiPhone,
  FiMapPin,
  FiInstagram,
  FiFacebook,
  FiArrowRight,
  FiCheckCircle,
} from 'react-icons/fi';
import { RiVisaLine, RiMastercardLine, RiPaypalLine, RiAppleLine } from 'react-icons/ri';

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
      const res = await api.post('/newsletter/subscribe', { email });
      setStatus({
        type: res.data.alreadySubscribed ? 'info' : 'success',
        message: res.data.message || 'Thank you for subscribing to Nexus updates!',
      });
      setEmail('');
    } catch (err) {
      console.error('Newsletter error:', err);
      setStatus({
        type: 'error',
        message: err.response?.data?.message || 'Subscription failed. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-[#115e59] text-teal-100 text-xs border-t-2 border-[#0d9488] relative">
      
      {/* Newsletter Bar */}
      <div className="border-b border-teal-800/80 py-8 sm:py-12">
        <div className="w-full max-w-[1620px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 bg-[#0d9488] p-5 sm:p-8 md:p-10 rounded-3xl border border-[#fae125]/40 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#fae125]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-xl">
              <h3 className="text-xl sm:text-2xl font-black text-white mb-1.5 break-words leading-snug">
                Stay Ahead of Exclusive Product Drops
              </h3>
              <p className="text-teal-50 text-xs sm:text-sm font-medium break-words leading-relaxed">
                Subscribe to receive early-bird flash deals, tech release alerts, and <span className="text-[#fae125] font-black">20% off</span> your first purchase.
              </p>
            </div>
            
            <div className="flex flex-col w-full lg:w-auto lg:min-w-[360px] max-w-md gap-2 relative z-10">
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row w-full gap-2 sm:gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status) setStatus(null);
                  }}
                  placeholder="Enter your email address..."
                  className="bg-[#134e4a] border border-teal-300/40 text-white placeholder-teal-200/60 text-xs px-4 py-3 rounded-xl focus:outline-none focus:border-[#fae125] flex-1 min-w-0 w-full font-medium"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-[#fae125] hover:bg-yellow-300 text-black font-black text-xs rounded-xl transition-all shrink-0 flex items-center justify-center gap-1.5 shadow-md shadow-yellow-400/30 cursor-pointer disabled:opacity-50 border border-yellow-300 w-full sm:w-auto"
                >
                  <span>{loading ? 'Joining...' : 'Subscribe'}</span>
                  {!loading && <FiArrowRight className="w-3.5 h-3.5 text-black" />}
                </button>
              </form>

              {/* Feedback Message */}
              {status && (
                <div
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all animate-in fade-in ${
                    status.type === 'success'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : status.type === 'info'
                      ? 'bg-[#fae125]/20 text-[#fae125] border border-[#fae125]/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  <FiCheckCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{status.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="w-full max-w-[1620px] mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          
          {/* Col 1: Brand Info */}
          <div className="col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#fae125] border border-yellow-300 flex items-center justify-center text-black shadow-md">
                <FiShoppingBag className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">NEXUS <span className="text-[#fae125]">COMMERCE</span></span>
            </Link>
            <p className="text-teal-100 leading-relaxed max-w-sm font-medium">
              The premier destination for cutting-edge electronics, audiophile sound gear, and performance lifestyle equipment.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Instagram"
                className="p-2.5 bg-[#0f766e] hover:bg-[#fae125] hover:text-black text-white rounded-xl transition-all border border-teal-400/30 shadow-sm hover:scale-105"
              >
                <FiInstagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Facebook"
                className="p-2.5 bg-[#0f766e] hover:bg-[#fae125] hover:text-black text-white rounded-xl transition-all border border-teal-400/30 shadow-sm hover:scale-105"
              >
                <FiFacebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-white">Shop Categories</h4>
            <ul className="space-y-2">
              <li><Link to="/shop?category=audio-sound" className="hover:text-[#fae125] transition-colors font-medium">Audio & Sound</Link></li>
              <li><Link to="/shop?category=smartphones-tech" className="hover:text-[#fae125] transition-colors font-medium">Smartphones & Tech</Link></li>
              <li><Link to="/shop?category=gaming-gear" className="hover:text-[#fae125] transition-colors font-medium">Gaming Gear</Link></li>
              <li><Link to="/shop?category=smart-home" className="hover:text-[#fae125] transition-colors font-medium">Smart Home & IoT</Link></li>
              <li><Link to="/shop?category=wearables-fitness" className="hover:text-[#fae125] transition-colors font-medium">Wearables</Link></li>
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-white">Customer Support</h4>
            <ul className="space-y-2">
              <li><Link to="/orders" className="hover:text-[#fae125] transition-colors font-medium">Track Order Status</Link></li>
              <li><Link to="/profile" className="hover:text-[#fae125] transition-colors font-medium">Shipping & Delivery</Link></li>
              <li><Link to="/orders" className="hover:text-[#fae125] transition-colors font-medium">Returns & Refunds</Link></li>
              <li><Link to="/wishlist" className="hover:text-[#fae125] transition-colors font-medium">Saved Wishlist</Link></li>
              <li><a href="mailto:support@nexus.com" className="hover:text-[#fae125] transition-colors font-medium">Contact Support</a></li>
            </ul>
          </div>

          {/* Col 4: Company & Legal */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-white">Company & Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-[#fae125] transition-colors font-medium">About Nexus</Link></li>
              <li><Link to="/privacy" className="hover:text-[#fae125] transition-colors font-medium">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-[#fae125] transition-colors font-medium">Terms of Service</Link></li>
              <li><Link to="/security" className="hover:text-[#fae125] transition-colors font-medium">Security & Trust</Link></li>
              <li><Link to="/faq" className="hover:text-[#fae125] transition-colors font-medium">Help & FAQs</Link></li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Copyright & Payment Methods */}
      <div className="border-t border-teal-800/80 py-6 bg-[#134e4a]">
        <div className="w-full max-w-[1620px] mx-auto px-6 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-teal-200 text-[11px] font-medium">
            © {new Date().getFullYear()} NEXUS Commerce Inc. All rights reserved. Built with modern MERN Architecture.
          </p>
          <div className="flex items-center gap-3 text-teal-300 text-lg">
            <span className="text-[11px] text-teal-200 mr-1 font-semibold">Secured By:</span>
            <RiVisaLine className="w-7 h-7 text-[#fae125]" />
            <RiMastercardLine className="w-7 h-7 text-[#fae125]" />
            <RiPaypalLine className="w-6 h-6 text-[#fae125]" />
            <RiAppleLine className="w-6 h-6 text-[#fae125]" />
          </div>
        </div>
      </div>

    </footer>
  );
};
