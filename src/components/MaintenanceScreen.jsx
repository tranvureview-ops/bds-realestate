'use client';

import React, { useState } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { Link } from '../router/RouterContext';

export default function MaintenanceScreen() {
  const { systemConfig, showToast } = useRealEstate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const brandName = systemConfig?.brandShortName || 'ĐẤT BIỂN ĐÀ NẴNG';
  const hotline = systemConfig?.hotline || '0904 084 888';
  const zalo = systemConfig?.zalo || '0904 084 888';
  const email = systemConfig?.email || 'tranvanvu.dev@gmail.com';
  const address = systemConfig?.address || 'Lô A38 Trần Văn Trứ, Phường Hải Châu, Thành Phố Đà Nẵng';

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (showToast) showToast('Đang kiểm tra trạng thái máy chủ...', 'info');
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-rose-500 selection:text-white">
      {/* Background Decorative Ambient Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-rose-600/15 via-amber-500/10 to-transparent blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Brand Bar */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white font-black shadow-lg shadow-rose-500/20">
            <i className="fa-solid fa-building-wheat text-lg"></i>
          </div>
          <div>
            <h1 className="text-base font-black tracking-wider text-white uppercase">{brandName}</h1>
            <p className="text-[10px] text-slate-400 font-medium">Hệ Thống Sàn Thương Mại Điện Tử Bất Động Sản</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-950/80 text-rose-400 border border-rose-800/80 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Chế độ bảo trì hệ thống
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-3xl mx-auto px-6 py-12 flex flex-col items-center text-center my-auto">
        {/* Animated Construction & Tech Icon */}
        <div className="relative mb-8">
          <div className="w-28 h-28 rounded-3xl bg-slate-900 border-2 border-rose-500/40 shadow-2xl shadow-rose-900/30 flex items-center justify-center relative">
            <i className="fa-solid fa-screwdriver-wrench text-4xl text-rose-400 animate-bounce"></i>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black shadow-md">
              <i className="fa-solid fa-gear fa-spin"></i>
            </div>
          </div>
        </div>

        <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-amber-950/60 text-amber-300 border border-amber-800/60 mb-4 inline-flex items-center gap-2">
          <i className="fa-solid fa-clock-rotate-left"></i>
          Đang Nâng Cấp Kỹ Thuật Định Kỳ
        </span>

        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight max-w-2xl">
          Hệ Thống Đang Trong Quá Trình <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-300 to-amber-500">Nâng Cấp & Bảo Trì</span>
        </h2>

        <p className="text-slate-300 text-sm sm:text-base mt-4 max-w-xl leading-relaxed">
          Chúng tôi đang tiến hành tối ưu hóa hạ tầng cơ sở dữ liệu và bổ sung các tính năng mới để mang lại trải nghiệm giao dịch bất động sản nhanh chóng, an toàn và tối ưu nhất cho quý khách.
        </p>

        {/* Contact Support Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mt-8 max-w-2xl text-left">
          {/* Hotline */}
          <a 
            href={`tel:${hotline.replace(/\s+/g, '')}`} 
            className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Hotline 24/7</span>
              <i className="fa-solid fa-phone text-emerald-400 group-hover:scale-110 transition"></i>
            </div>
            <div className="text-sm font-bold text-white font-mono group-hover:text-emerald-400 transition">{hotline}</div>
          </a>

          {/* Zalo */}
          <a 
            href={`https://zalo.me/${zalo.replace(/\s+/g, '')}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 transition group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Zalo Hỗ Trợ</span>
              <i className="fa-solid fa-comment-dots text-blue-400 group-hover:scale-110 transition"></i>
            </div>
            <div className="text-sm font-bold text-white font-mono group-hover:text-blue-400 transition">{zalo}</div>
          </a>

          {/* Email */}
          <a 
            href={`mailto:${email}`} 
            className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 transition group flex flex-col justify-between truncate"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Email Ban Quản Trị</span>
              <i className="fa-solid fa-envelope text-amber-400 group-hover:scale-110 transition"></i>
            </div>
            <div className="text-xs font-bold text-white truncate group-hover:text-amber-400 transition font-mono">{email}</div>
          </a>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/40 transition flex items-center gap-2 disabled:opacity-60"
          >
            <i className={`fa-solid fa-rotate-right ${isRefreshing ? 'fa-spin' : ''}`}></i>
            <span>{isRefreshing ? 'Đang kiểm tra...' : 'Kiểm tra & Tải lại trang'}</span>
          </button>

          <Link
            to="/dang-nhap?redirect=/admin"
            className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-sm border border-slate-800 transition flex items-center gap-2"
          >
            <i className="fa-solid fa-shield-halved text-rose-400"></i>
            <span>Đăng nhập Ban Quản Trị (Admin)</span>
          </Link>
        </div>

        {/* Address note */}
        <p className="text-[11px] text-slate-400 mt-6 flex items-center gap-1.5">
          <i className="fa-solid fa-location-dot text-rose-500"></i>
          <span>{address}</span>
        </p>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-slate-800/80 text-[11px] text-slate-400 gap-2">
        <div>
          © {new Date().getFullYear()} {brandName}. Tất cả các quyền được bảo lưu.
        </div>
        <div className="flex items-center gap-4">
          <Link to="/dang-nhap?redirect=/admin" className="hover:text-slate-300 transition underline underline-offset-4">
            Cổng Đăng Nhập Quản Trị Viên (CMS Portal)
          </Link>
        </div>
      </footer>
    </div>
  );
}
