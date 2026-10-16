import React from 'react';
import { RouterProvider, useRouter } from './router/RouterContext';
import { RealEstateProvider, useRealEstate } from './context/RealEstateContext';

// Navigation & Layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CompareDrawer from './components/CompareDrawer';
import LiveChatWidget from './components/LiveChatWidget';
import ToastNotification from './components/ToastNotification';
import ErrorBoundary from './components/ErrorBoundary';

// Dedicated Pages (Multi-page Architecture)
import HomePage from './views/HomePage';
import SaleListingsPage from './views/SaleListingsPage';
import RentListingsPage from './views/RentListingsPage';
import PropertyDetailPage from './views/PropertyDetailPage';
import PostListingPage from './views/PostListingPage';
import VipPricingPage from './views/VipPricingPage';
import MembershipPage from './views/MembershipPage';
import MortgageCalculatorPage from './views/MortgageCalculatorPage';
import ComparePage from './views/ComparePage';
import FavoritesPage from './views/FavoritesPage';
import UserDashboardPage from './views/UserDashboardPage';
import UserProfilePage from './views/UserProfilePage';
import LoginPage from './views/LoginPage';
import RegisterPage from './views/RegisterPage';
import WalletDepositPage from './views/WalletDepositPage';
import AdminPage from './views/AdminPage';

// Modals
import ListingDetailModal from './components/ListingDetailModal';
import PostListingModal from './components/PostListingModal';
import MortgageCalculatorModal from './components/MortgageCalculatorModal';
import CompareModal from './components/CompareModal';
import WalletDepositModal from './components/WalletDepositModal';
import AuthModal from './components/AuthModal';

import { parsePropertyUrl, parseTaxonomyUrl } from './utils/permalink';

function MainApp() {
  const { currentPath } = useRouter();
  const { activeModal, setActiveModal, selectedPropertyDetail, setSelectedPropertyDetail } = useRealEstate();

  // Route 1: Trang Quản Trị Backend CMS Admin (Full-screen)
  if (currentPath.startsWith('/admin')) {
    return (
      <div className="min-h-screen bg-slate-900 font-sans text-slate-100 antialiased">
        <ToastNotification />
        <AdminPage />
      </div>
    );
  }

  // Page Routing Switcher
  const renderCurrentPage = () => {
    // 1. Trang Single Sản Phẩm: Chuẩn Batdongsan (*-pr{id}) hoặc alias /bat-dong-san/:slugOrId
    const propUrlInfo = parsePropertyUrl(currentPath);
    if (propUrlInfo.isProperty) {
      return <PropertyDetailPage />;
    }

    // 2. Chuyên trang Phân cấp Danh mục / Địa phương theo chuẩn Batdongsan
    // (VD: /ban-can-ho-chung-cu, /cho-thue-van-phong, /nha-dat-ban-ha-noi, /nha-dat-ban, /nha-dat-cho-thue)
    const taxonomyInfo = parseTaxonomyUrl(currentPath);
    if (taxonomyInfo.isTaxonomy) {
      if (taxonomyInfo.demand === 'rent') {
        return <RentListingsPage taxonomyInfo={taxonomyInfo} />;
      }
      return <SaleListingsPage taxonomyInfo={taxonomyInfo} />;
    }

    // 2b. Backward compatibility cho các đường dẫn nhà đất cơ bản
    if (currentPath === '/nha-dat-ban') {
      return <SaleListingsPage />;
    }
    if (currentPath === '/nha-dat-cho-thue') {
      return <RentListingsPage />;
    }

    // 4. Trang Đăng Tin BĐS Riêng Biệt: /dang-tin
    if (currentPath === '/dang-tin') {
      return <PostListingPage />;
    }

    // 5. Trang Bảng Giá Gói Dịch Vụ Tin VIP: /bang-gia-vip
    if (currentPath === '/bang-gia-vip') {
      return <VipPricingPage />;
    }

    // 5b. Trang Gói Hội Viên Môi Giới: /goi-hoi-vien
    if (currentPath === '/goi-hoi-vien') {
      return <MembershipPage />;
    }

    // 6. Trang Công Cụ Tính Lãi Vay Ngân Hàng: /tinh-lai-vay
    if (currentPath === '/tinh-lai-vay') {
      return <MortgageCalculatorPage />;
    }

    // 7. Trang So Sánh Đối Đầu Bất Động Sản: /so-sanh
    if (currentPath === '/so-sanh') {
      return <ComparePage />;
    }

    // 8. Trang Bất Động Sản Đã Lưu Yêu Thích: /tin-da-luu
    if (currentPath === '/tin-da-luu') {
      return <FavoritesPage />;
    }

    // 9. Trang Quản Lý Tin Đăng Của Tôi: /quan-ly-tin
    if (currentPath === '/quan-ly-tin') {
      return <UserDashboardPage />;
    }

    // 10. Trang Hồ Sơ Cá Nhân & Xác Thực KYC: /ho-so-ca-nhan
    if (currentPath === '/ho-so-ca-nhan') {
      return <UserProfilePage />;
    }

    // 11. Trang Đăng Nhập Tài Khoản: /dang-nhap
    if (currentPath === '/dang-nhap') {
      return <LoginPage />;
    }

    // 12. Trang Đăng Ký Thành Viên: /dang-ky
    if (currentPath === '/dang-ky') {
      return <RegisterPage />;
    }

    // 13. Trang Nạp Tiền Ví Tài Khoản: /nap-tien
    if (currentPath === '/nap-tien') {
      return <WalletDepositPage />;
    }

    // Mặc định: Trang Chủ /
    return <HomePage />;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-emerald-500 selection:text-white">
      {/* Toast Alert Notifications */}
      <ToastNotification />

      {/* Persistent Multi-page Navigation Bar */}
      <Navbar />

      {/* Main Page Content */}
      <main className="flex-1">
        {renderCurrentPage()}
      </main>

      {/* Persistent Bottom Components */}
      <CompareDrawer />
      <LiveChatWidget />

      {/* Multi-page Footer */}
      <Footer />

      {/* Modals Support (For Quick Actions When Needed) */}
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

export default function App() {
  return (
    <ErrorBoundary>
      <RouterProvider>
        <RealEstateProvider>
          <MainApp />
        </RealEstateProvider>
      </RouterProvider>
    </ErrorBoundary>
  );
}
