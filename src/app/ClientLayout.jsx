'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { RouterProvider } from '../router/RouterContext';
import { RealEstateProvider, useRealEstate } from '../context/RealEstateContext';
import ErrorBoundary from '../components/ErrorBoundary';
import { getFontConfig, applyFontToDom } from '../utils/fontConfig';

import dynamic from 'next/dynamic';

// Navigation & Layout
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CompareDrawer from '../components/CompareDrawer';
import ToastNotification from '../components/ToastNotification';
import MobileBottomNav from '../components/MobileBottomNav';

// Lazy-loaded Widgets & Modals (On-demand Code Splitting to eliminate unused initial JS)
const LiveChatWidget = dynamic(() => import('../components/LiveChatWidget'), { ssr: false });
const AuthModal = dynamic(() => import('../components/AuthModal'), { ssr: false });
const ListingDetailModal = dynamic(() => import('../components/ListingDetailModal'), { ssr: false });
const PostListingModal = dynamic(() => import('../components/PostListingModal'), { ssr: false });
const MortgageCalculatorModal = dynamic(() => import('../components/MortgageCalculatorModal'), { ssr: false });
const CompareModal = dynamic(() => import('../components/CompareModal'), { ssr: false });
const WalletDepositModal = dynamic(() => import('../components/WalletDepositModal'), { ssr: false });
import MaintenanceScreen from '../components/MaintenanceScreen';

function AppContent({ children }) {
  const pathname = usePathname() || '/';
  const { 
    activeModal, 
    setActiveModal, 
    selectedPropertyDetail, 
    setSelectedPropertyDetail, 
    systemConfig,
    updateSystemConfig,
    currentUser,
    showToast
  } = useRealEstate();

  // Dynamic Font Family Real-time Synchronizer across all pages
  useEffect(() => {
    const fontName = systemConfig?.fontFamily || 'Plus Jakarta Sans';
    applyFontToDom(fontName);
  }, [systemConfig?.fontFamily]);

  // Dynamic Browser Tab Title Synchronizer with Brand Identity
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const brand = systemConfig?.brandShortName;
    if (brand && document.title && document.title.includes('Đất Biển Đà Nẵng') && brand !== 'Đất Biển Đà Nẵng') {
      document.title = document.title
        .replace(/Đất Biển Đà Nẵng/g, brand)
        .replace(/ĐẤT BIỂN ĐÀ NẴNG/g, brand);
    }
  }, [systemConfig?.brandShortName]);

  // If Admin CMS, render full-screen dark layout (always accessible for admins)
  if (pathname.startsWith('/admin')) {
    return (
      <div className="min-h-screen bg-slate-900 font-sans text-slate-100 antialiased">
        <ToastNotification />
        {children}
      </div>
    );
  }

  // Check Maintenance Mode
  const isMaintenance = systemConfig?.maintenanceMode === true;
  const isAdmin = currentUser?.role === 'admin' || currentUser?.email === 'tranvu.review@gmail.com' || currentUser?.email === 'admin@gmail.com';
  // Luôn cho phép truy cập trang đăng nhập để Quản trị viên có thể xác thực và tắt/bật bảo trì
  const isAuthRoute = pathname.startsWith('/dang-nhap') || pathname.startsWith('/api/auth');

  // If Maintenance Mode is active AND visitor is NOT an admin AND not on auth route: show Maintenance Screen
  if (isMaintenance && !isAdmin && !isAuthRoute) {
    return (
      <>
        <ToastNotification />
        <MaintenanceScreen />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-emerald-500 selection:text-white overflow-x-hidden w-full">
      {/* Sticky Top Warning Banner if Admin is viewing site while Maintenance Mode is active */}
      {isMaintenance && isAdmin && (
        <div className="bg-gradient-to-r from-rose-800 via-amber-800 to-rose-800 text-white px-4 py-2.5 text-xs font-bold shadow-lg flex items-center justify-between sticky top-0 z-50 border-b border-rose-500">
          <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0"></span>
              <i className="fa-solid fa-triangle-exclamation text-amber-300 text-sm"></i>
              <span>
                <strong>CHẾ ĐỘ BẢO TRÌ ĐANG BẬT:</strong> Khách vãng lai và thành viên đang thấy thông báo bảo trì nâng cấp. Bạn đang xem giao diện với quyền Quản Trị Viên (Admin).
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={async () => {
                  await updateSystemConfig({ ...systemConfig, maintenanceMode: false });
                  if (showToast) showToast('Đã tắt chế độ bảo trì hệ thống! Website đã mở lại bình thường cho toàn bộ người dùng.', 'success');
                }}
                className="px-3.5 py-1.5 bg-white hover:bg-emerald-50 text-slate-900 font-black rounded-lg text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fa-solid fa-power-off text-rose-600"></i>
                <span>Tắt bảo trì ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Alert Notifications */}
      <ToastNotification />

      {/* Persistent Multi-page Navigation Bar */}
      <Navbar />

      {/* Main Page Content */}
      <main className="flex-1 pb-16 md:pb-0">
        {children}
      </main>

      {/* Persistent Bottom Components */}
      <CompareDrawer />
      <LiveChatWidget />

      {/* Mobile App-like Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Multi-page Footer */}
      <Footer />

      {/* Modals Support */}
      {activeModal === 'auth' && (
        <AuthModal onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'listing-detail' && selectedPropertyDetail && (
        <ListingDetailModal 
          property={selectedPropertyDetail} 
          onClose={() => {
            setActiveModal(null);
            setSelectedPropertyDetail(null);
          }} 
        />
      )}

      {activeModal === 'post-listing' && (
        <PostListingModal onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'mortgage-calc' && (
        <MortgageCalculatorModal onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'compare' && (
        <CompareModal onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'wallet-deposit' && (
        <WalletDepositModal onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
}

export default function ClientLayout({ children, initialDb = null, initialUser = null }) {
  return (
    <ErrorBoundary>
      <RouterProvider>
        <RealEstateProvider initialData={initialDb} initialUser={initialUser}>
          <AppContent>{children}</AppContent>
        </RealEstateProvider>
      </RouterProvider>
    </ErrorBoundary>
  );
}
