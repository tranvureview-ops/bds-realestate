'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { RouterProvider } from '../router/RouterContext';
import { RealEstateProvider, useRealEstate } from '../context/RealEstateContext';
import ErrorBoundary from '../components/ErrorBoundary';

// Navigation & Layout
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CompareDrawer from '../components/CompareDrawer';
import LiveChatWidget from '../components/LiveChatWidget';
import ToastNotification from '../components/ToastNotification';

// Global Modals
import ListingDetailModal from '../components/ListingDetailModal';
import PostListingModal from '../components/PostListingModal';
import MortgageCalculatorModal from '../components/MortgageCalculatorModal';
import CompareModal from '../components/CompareModal';
import WalletDepositModal from '../components/WalletDepositModal';
import AuthModal from '../components/AuthModal';

function AppContent({ children }) {
  const pathname = usePathname() || '/';
  const { activeModal, setActiveModal, selectedPropertyDetail, setSelectedPropertyDetail } = useRealEstate();

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
      <main className="flex-1">
        {children}
      </main>

      {/* Persistent Bottom Components */}
      <CompareDrawer />
      <LiveChatWidget />

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
