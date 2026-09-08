import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';

import { AdminNavbar } from './components/AdminNavbar';
import { AdminSidebar } from './components/AdminSidebar';

import { DashboardPage } from './pages/DashboardPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { OrderAnalyticsPage } from './pages/OrderAnalyticsPage';
import { ProductAnalyticsPage } from './pages/ProductAnalyticsPage';
import { ProductsPage } from './pages/ProductsPage';
import { AdminProductEditorPage } from './pages/AdminProductEditorPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { AdminCategoryEditorPage } from './pages/AdminCategoryEditorPage';
import { CouponsPage } from './pages/CouponsPage';
import { AdvertisementsPage } from './pages/AdvertisementsPage';
import { OrdersPage } from './pages/OrdersPage';
import { DeliveryBoysPage } from './pages/DeliveryBoysPage';
import { DeliverySettingsPage } from './pages/DeliverySettingsPage';
import { UsersPage } from './pages/UsersPage';
import { VendorsPage } from './pages/VendorsPage';
import { AdminProfilePage } from './pages/AdminProfilePage';
import { AdminMessagesPage } from './pages/AdminMessagesPage';
import { AdminLoginPage } from './pages/AdminLoginPage';

const ProtectedAdminLayout = ({ children }) => {
  const { isAuthenticated, loading } = useAdminAuth();
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
        <div className="w-10 h-10 border-4 border-[#0d9488] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-white via-orange-50/30 to-amber-50/20 text-slate-900 flex flex-col overflow-hidden relative">
      {/* Subtle orange/yellow background ambient light orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl pointer-events-none -z-10" />

      <AdminNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex overflow-hidden relative z-10">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
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
      <AdminAuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<AdminLoginPage />} />

            <Route
              path="/"
              element={
                <ProtectedAdminLayout>
                  <DashboardPage />
                </ProtectedAdminLayout>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedAdminLayout>
                  <AnalyticsPage />
                </ProtectedAdminLayout>
              }
            />
            <Route
              path="/order-analytics"
              element={
                <ProtectedAdminLayout>
                  <OrderAnalyticsPage />
                </ProtectedAdminLayout>
              }
            />
            <Route
              path="/product-analytics"
              element={
                <ProtectedAdminLayout>
                  <ProductAnalyticsPage />
                </ProtectedAdminLayout>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedAdminLayout>
                  <ProductsPage />
                </ProtectedAdminLayout>
              }
            />
            <Route
              path="/products/new"
              element={
                <ProtectedAdminLayout>
                  <AdminProductEditorPage />
                </ProtectedAdminLayout>
              }
            />
            <Route
              path="/products/edit/:id"
              element={
                <ProtectedAdminLayout>
                  <AdminProductEditorPage />
                </ProtectedAdminLayout>
              }
            />
            <Route
              path="/categories"
              element={
                <ProtectedAdminLayout>
                  <CategoriesPage />
                </ProtectedAdminLayout>
              }
            />
            <Route
              path="/categories/new"
              element={
                <ProtectedAdminLayout>
                  <AdminCategoryEditorPage />
                </ProtectedAdminLayout>
              }
            />
            <Route
              path="/categories/edit/:id"
              element={
                <ProtectedAdminLayout>
                  <AdminCategoryEditorPage />
                </ProtectedAdminLayout>
              }
            />
            <Route
              path="/coupons"
              element={
                <ProtectedAdminLayout>
                  <CouponsPage />
                </ProtectedAdminLayout>
              }
            />
            <Route
              path="/advertisements"
              element={
                <ProtectedAdminLayout>
                  <AdvertisementsPage />
                </ProtectedAdminLayout>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedAdminLayout>
                  <OrdersPage />
                </ProtectedAdminLayout>
              }
            />
            <Route
              path="/delivery-boys"
              element={
                <ProtectedAdminLayout>
                  <DeliveryBoysPage />
                </ProtectedAdminLayout>
              }
            />
            <Route
              path="/delivery-settings"
              element={
                <ProtectedAdminLayout>
                  <DeliverySettingsPage />
                </ProtectedAdminLayout>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedAdminLayout>
                  <UsersPage />
                </ProtectedAdminLayout>
              }
            />
            <Route
              path="/vendors"
              element={
                <ProtectedAdminLayout>
                  <VendorsPage />
                </ProtectedAdminLayout>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedAdminLayout>
                  <AdminProfilePage />
                </ProtectedAdminLayout>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedAdminLayout>
                  <AdminMessagesPage />
                </ProtectedAdminLayout>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AdminAuthProvider>
    </ToastProvider>
  );
}

export default App;
