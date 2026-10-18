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

function AppContent({ children }) {
  const pathname = usePathname() || '/';
  const { activeModal, setActiveModal, selectedPropertyDetail, setSelectedPropertyDetail, systemConfig } = useRealEstate();

  // Dynamic Font Family Real-time Synchronizer across all pages
  useEffect(() => {
    const fontName = systemConfig?.fontFamily || 'Plus Jakarta Sans';
    applyFontToDom(fontName);
  }, [systemConfig?.fontFamily]);

  // If Admin CMS, render full-screen dark layout
  if (pathname.startsWith('/admin')) {
    return (
      <div className="min-h-screen bg-slate-900 font-sans text-slate-100 antialiased">
        <ToastNotification />
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-emerald-500 selection:text-white overflow-x-hidden w-full">
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
