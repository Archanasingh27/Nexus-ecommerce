import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiShoppingBag,
  FiPhone,
  FiMapPin,
  FiInstagram,
  FiFacebook,
} from 'react-icons/fi';
import { RiVisaLine, RiMastercardLine, RiPaypalLine, RiAppleLine } from 'react-icons/ri';

export const Footer = () => {
  return (
    <footer className="bg-[#115e59] text-teal-100 text-xs border-t-2 border-[#0d9488] relative">
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
              Your trusted partner for high-grade building materials, architectural hardware, electrical systems, and modern sanitary & plumbing solutions.
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
              <li><Link to="/shop?category=civil-interiors" className="hover:text-[#fae125] transition-colors font-medium">Civil & Interiors</Link></li>
              <li><Link to="/shop?category=furniture-architectural-hardware" className="hover:text-[#fae125] transition-colors font-medium">Furniture & Hardware</Link></li>
              <li><Link to="/shop?category=electrical" className="hover:text-[#fae125] transition-colors font-medium">Electrical & Lighting</Link></li>
              <li><Link to="/shop?category=plumbing-sanitary-bath" className="hover:text-[#fae125] transition-colors font-medium">Plumbing, Sanitary & Bath</Link></li>
              <li><Link to="/shop" className="hover:text-[#fae125] transition-colors font-medium">View All Catalog</Link></li>
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-white">Customer Support</h4>
            <ul className="space-y-2">
              <li><Link to="/orders" className="hover:text-[#fae125] transition-colors font-medium">Track Order Status</Link></li>
              <li><Link to="/profile" className="hover:text-[#fae125] transition-colors font-medium">Shipping & Delivery</Link></li>
              <li><Link to="/orders" className="hover:text-[#fae125] transition-colors font-medium">Returns & Refunds</Link></li>
              <li><Link to="/support" className="hover:text-[#fae125] transition-colors font-medium">Nexus Support Desk</Link></li>
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
