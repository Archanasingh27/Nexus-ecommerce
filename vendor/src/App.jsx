import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { VendorAuthProvider, useVendorAuth } from './context/VendorAuthContext';

import { VendorNavbar } from './components/VendorNavbar';
import { VendorSidebar } from './components/VendorSidebar';

import { VendorDashboardPage } from './pages/VendorDashboardPage';
import { VendorOrderAnalyticsPage } from './pages/VendorOrderAnalyticsPage';
import { VendorProductAnalyticsPage } from './pages/VendorProductAnalyticsPage';
import { VendorProductsPage } from './pages/VendorProductsPage';
import { VendorProductEditorPage } from './pages/VendorProductEditorPage';
import { VendorOrdersPage } from './pages/VendorOrdersPage';
import { VendorProfilePage } from './pages/VendorProfilePage';
import { VendorLoginPage } from './pages/VendorLoginPage';
import { VendorRegisterPage } from './pages/VendorRegisterPage';

const ProtectedVendorLayout = ({ children }) => {
  const { isAuthenticated, loading } = useVendorAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const mainRef = useRef(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="h-screen w-screen bg-slate-50 text-slate-900 flex flex-col overflow-hidden relative">
      <VendorNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex overflow-hidden relative z-10">
        <VendorSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main ref={mainRef} className="flex-1 overflow-y-auto max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <ToastProvider>
      <VendorAuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<VendorLoginPage />} />
            <Route path="/register" element={<VendorRegisterPage />} />

            <Route
              path="/"
              element={
                <ProtectedVendorLayout>
                  <VendorDashboardPage />
                </ProtectedVendorLayout>
              }
            />
            <Route
              path="/order-analytics"
              element={
                <ProtectedVendorLayout>
                  <VendorOrderAnalyticsPage />
                </ProtectedVendorLayout>
              }
            />
            <Route
              path="/product-analytics"
              element={
                <ProtectedVendorLayout>
                  <VendorProductAnalyticsPage />
                </ProtectedVendorLayout>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedVendorLayout>
                  <VendorProductsPage />
                </ProtectedVendorLayout>
              }
            />
            <Route
              path="/products/new"
              element={
                <ProtectedVendorLayout>
                  <VendorProductEditorPage />
                </ProtectedVendorLayout>
              }
            />
            <Route
              path="/products/edit/:id"
              element={
                <ProtectedVendorLayout>
                  <VendorProductEditorPage />
                </ProtectedVendorLayout>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedVendorLayout>
                  <VendorOrdersPage />
                </ProtectedVendorLayout>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedVendorLayout>
                  <VendorProfilePage />
                </ProtectedVendorLayout>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </VendorAuthProvider>
    </ToastProvider>
  );
}

export default App;
