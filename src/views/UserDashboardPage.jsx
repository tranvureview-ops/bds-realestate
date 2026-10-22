'use client';

import React, { useState, useEffect } from 'react';
import { Link, useRouter } from '../router/RouterContext';
import { useRealEstate } from '../context/RealEstateContext';
import UserDashboard from '../components/UserDashboard';

export default function UserDashboardPage() {
  const { currentUser, isHydrated } = useRealEstate();
  const { navigate } = useRouter();
  const [countdown, setCountdown] = useState(3);

  const isGuest = !currentUser || currentUser.role === 'guest' || currentUser.id === 'guest';

  // Tự động chuyển hướng đến trang đăng nhập sau 3 giây nếu là khách vãng lai
  useEffect(() => {
    if (!isHydrated || !isGuest) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/dang-nhap?redirect=/quan-ly-tin');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isHydrated, isGuest, navigate]);

  // 1. Trạng thái đang kiểm tra phiên làm việc (Hydration)
  if (!isHydrated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-semibold text-slate-500">Đang kiểm tra trạng thái tài khoản...</p>
      </div>
    );
  }

  // 2. Trạng thái chưa đăng nhập: Hiển thị màn hình khóa yêu cầu đăng nhập
  if (isGuest) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Vòng sáng nền trang trí */}
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>

          {/* Biểu tượng ổ khóa & quản lý tin */}
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-2xl mx-auto mb-4 shadow-sm">
            <i className="fa-solid fa-list-check"></i>
          </div>

          {/* Badge phân quyền */}
          <div className="inline-block text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mb-3">
            <i className="fa-solid fa-shield-halved mr-1 text-emerald-600"></i> BẢO MẬT HỆ THỐNG • YÊU CẦU ĐĂNG NHẬP
          </div>

          <h1 className="text-xl font-black text-slate-900 mb-2">
            Vui Lòng Đăng Nhập Tài Khoản
          </h1>
          
          <p className="text-xs text-slate-500 leading-relaxed mb-5">
            Khu vực <strong>Quản Lý Tin Đăng</strong> dành riêng cho thành viên sàn BĐS. Bạn cần đăng nhập để quản lý tin rao, nâng cấp gói VIP, quản lý số dư ví và khôi phục tin từ thùng rác.
          </p>

          {/* Countdown timer */}
          <div className="text-[11px] text-slate-400 mb-5 flex items-center justify-center gap-1.5 bg-slate-50 py-2 rounded-xl border border-slate-100">
            <i className="fa-regular fa-clock text-emerald-600"></i>
            <span>Tự động chuyển đến trang Đăng nhập sau <strong className="text-emerald-700 font-bold">{countdown}s</strong>...</span>
          </div>

          {/* Các nút hành động */}
          <div className="space-y-2.5">
            <button
              onClick={() => navigate('/dang-nhap?redirect=/quan-ly-tin')}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-right-to-bracket"></i>
              <span>Đăng Nhập Ngay</span>
            </button>

            <button
              onClick={() => navigate('/dang-ky')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-user-plus"></i>
              <span>Đăng Ký Tài Khoản Mới</span>
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

  // 3. Đã đăng nhập hợp lệ: Hiển thị bảng điều khiển quản lý tin đăng đầy đủ
  return (
    <div className="space-y-1 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <Link to="/" className="hover:text-emerald-600 font-medium">Trang chủ</Link>
          <i className="fa-solid fa-chevron-right text-[10px]"></i>
          <span className="text-slate-800 font-bold">Quản lý tin đăng</span>
        </div>
      </div>
      <UserDashboard />
    </div>
  );
}
