'use client';

import React, { useState, useEffect } from 'react';
import { Link, useRouter } from '../router/RouterContext';
import { useRealEstate } from '../context/RealEstateContext';
import UserTransactionHistoryManager from '../components/UserTransactionHistoryManager';

export default function TransactionHistoryPage() {
  const { currentUser, isHydrated } = useRealEstate();
  const { navigate } = useRouter();
  const [countdown, setCountdown] = useState(3);

  const isGuest = !currentUser || currentUser.role === 'guest' || currentUser.id === 'guest';
  const isAdmin = currentUser?.role === 'admin';

  // Chuyển hướng đăng nhập nếu chưa đăng nhập
  useEffect(() => {
    if (!isHydrated || !isGuest) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/dang-nhap?redirect=/lich-su-giao-dich');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isHydrated, isGuest, navigate]);

  if (!isHydrated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-semibold text-slate-500">
          Đang tải lịch sử giao dịch...
        </p>
      </div>
    );
  }

  if (isGuest) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-2xl mx-auto mb-4 shadow-sm">
            <i className="fa-solid fa-receipt"></i>
          </div>

          <div className="inline-block text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mb-3">
            <i className="fa-solid fa-shield-halved mr-1 text-emerald-600"></i> YÊU CẦU ĐĂNG NHẬP
          </div>

          <h1 className="text-xl font-black text-slate-900 mb-2">
            Lịch Sử Giao Dịch & Ví Tiền
          </h1>
          
          <p className="text-xs text-slate-500 leading-relaxed mb-5">
            Bạn cần đăng nhập tài khoản để tra cứu toàn bộ lịch sử nạp tiền, tiền thưởng khuyến mãi, thu hồi quá hạn và chi tiêu dịch vụ.
          </p>

          <div className="text-[11px] text-slate-400 mb-5 flex items-center justify-center gap-1.5 bg-slate-50 py-2 rounded-xl border border-slate-100">
            <i className="fa-regular fa-clock text-emerald-600"></i>
            <span>Tự động chuyển đến trang Đăng nhập sau <strong className="text-emerald-700 font-bold">{countdown}s</strong>...</span>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() => navigate('/dang-nhap?redirect=/lich-su-giao-dich')}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-right-to-bracket"></i>
              <span>Đăng Nhập Ngay</span>
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full py-2 px-4 rounded-xl text-slate-400 hover:text-slate-600 font-medium text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <i className="fa-solid fa-house"></i>
              <span>Quay về trang chủ</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link to="/" className="hover:text-emerald-700 transition">Trang chủ</Link>
          <span>/</span>
          <Link to="/quan-ly-tin" className="hover:text-emerald-700 transition">Quản lý tài khoản</Link>
          <span>/</span>
          <span className="text-slate-800 font-bold">Lịch sử giao dịch & Ví</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center text-2xl shadow-md">
              <i className="fa-solid fa-receipt"></i>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <span>Lịch Sử Giao Dịch & Ví Tiền</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Theo dõi chi tiết các biến động số dư: Nạp ví, tiền thưởng khuyến mãi, tiền thu hồi 30 ngày và thanh toán dịch vụ.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/quan-ly-tin"
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-2"
            >
              <i className="fa-solid fa-list-check"></i>
              <span>Quản lý tin đăng</span>
            </Link>
            <Link
              to="/trung-tam-phan-thuong"
              className="px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition flex items-center gap-2"
            >
              <i className="fa-solid fa-gift"></i>
              <span>Nhận thưởng thêm</span>
            </Link>
          </div>
        </div>

        {/* Transaction History Main Component */}
        <UserTransactionHistoryManager />
      </div>
    </div>
  );
}
