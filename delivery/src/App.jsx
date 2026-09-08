import React, { useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { DeliveryAuthProvider, useDeliveryAuth } from './context/DeliveryAuthContext';
import { SocketProvider } from './context/SocketContext';
import { DeliverySidebar } from './components/DeliverySidebar';
import { DeliveryHeader } from './components/DeliveryHeader';
import { IncomingOrderModal } from './components/IncomingOrderModal';

import { DeliveryLoginPage } from './pages/DeliveryLoginPage';
import { AvailableOrdersPage } from './pages/AvailableOrdersPage';
import { ActiveDeliveriesPage } from './pages/ActiveDeliveriesPage';
import { DeliveryHistoryPage } from './pages/DeliveryHistoryPage';
import { DeliveryProfilePage } from './pages/DeliveryProfilePage';

const ProtectedRiderLayout = ({ children }) => {
  const { isAuthenticated, loading } = useDeliveryAuth();
  const location = useLocation();
  const mainRef = useRef(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="h-screen w-screen bg-linear-to-br from-white via-orange-50/30 to-amber-50/20 text-slate-900 flex flex-col overflow-hidden relative">
      {/* Subtle orange/yellow background ambient light orbs matching Admin */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl pointer-events-none -z-10" />

      <DeliveryHeader />
      <IncomingOrderModal />

      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Permanent Clean Desktop Sidebar */}
        <DeliverySidebar />
        
        {/* Main Scrollable Content Panel */}
        <main ref={mainRef} className="flex-1 overflow-y-auto max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <ToastProvider>
      <DeliveryAuthProvider>
        <SocketProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<DeliveryLoginPage />} />
              
              <Route
                path="/"
                element={
                  <ProtectedRiderLayout>
                    <AvailableOrdersPage />
                  </ProtectedRiderLayout>
                }
              />

              <Route
                path="/active"
                element={
                  <ProtectedRiderLayout>
                    <ActiveDeliveriesPage />
                  </ProtectedRiderLayout>
                }
              />

              <Route
                path="/history"
                element={
                  <ProtectedRiderLayout>
                    <DeliveryHistoryPage />
                  </ProtectedRiderLayout>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRiderLayout>
                    <DeliveryProfilePage />
                  </ProtectedRiderLayout>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </SocketProvider>
      </DeliveryAuthProvider>
    </ToastProvider>
  );
}

export default App;
