import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { VendorAuthProvider, useVendorAuth } from './context/VendorAuthContext';

import { VendorNavbar } from './components/VendorNavbar';
import { VendorSidebar } from './components/VendorSidebar';

import { VendorDashboardPage } from './pages/VendorDashboardPage';
import { VendorMessagesPage } from './pages/VendorMessagesPage';
import { VendorOrderAnalyticsPage } from './pages/VendorOrderAnalyticsPage';
import { VendorProductAnalyticsPage } from './pages/VendorProductAnalyticsPage';
import { VendorProductsPage } from './pages/VendorProductsPage';
import { VendorOrdersPage } from './pages/VendorOrdersPage';
import { VendorProfilePage } from './pages/VendorProfilePage';
import { VendorLoginPage } from './pages/VendorLoginPage';
import { VendorRegisterPage } from './pages/VendorRegisterPage';

const ProtectedVendorLayout = ({ children }) => {
  const { isAuthenticated, loading } = useVendorAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <div className="h-screen w-screen bg-gradient-to-br from-white via-orange-50/30 to-amber-50/20 text-slate-900 flex flex-col overflow-hidden relative">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl pointer-events-none -z-10" />

      <VendorNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex overflow-hidden relative z-10">
        <VendorSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
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
              path="/messages"
              element={
                <ProtectedVendorLayout>
                  <VendorMessagesPage />
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
