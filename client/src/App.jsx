import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

import { Navbar } from './components/Navbar';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { FloatingChatButton } from './components/FloatingChatButton';

import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { WishlistPage } from './pages/WishlistPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrdersPage } from './pages/OrdersPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthPage } from './pages/AuthPage';

export function App() {
  return (
    <ToastProvider>
      <Router>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <div className="min-h-screen flex flex-col justify-between relative overflow-x-clip">
                {/* Ambient Decorative Luminous Glow Orbs for Glassmorphism Depth */}
                <div className="fixed top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-teal-300/30 to-teal-500/10 blur-[120px] pointer-events-none -z-10 animate-pulse-slow" />
                <div className="fixed top-[30%] right-[-10%] w-[650px] h-[650px] rounded-full bg-gradient-to-bl from-yellow-300/30 to-brand-400/15 blur-[140px] pointer-events-none -z-10" />
                <div className="fixed bottom-[-10%] left-[20%] w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-teal-400/20 via-emerald-200/25 to-yellow-200/15 blur-[150px] pointer-events-none -z-10" />

                <Navbar />
                <main className="flex-grow z-10">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/product/:id" element={<ProductDetailPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/auth" element={<AuthPage />} />
                  </Routes>
                </main>
                <FloatingChatButton />
                <CartDrawer />
                <Footer />
              </div>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </Router>
    </ToastProvider>
  );
}

export default App;
