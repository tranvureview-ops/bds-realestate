'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Link } from '../router/RouterContext';
import { useRealEstate } from '../context/RealEstateContext';

export default function MobileBottomNav() {
  const pathname = usePathname() || '/';
  const { currentUser, favorites } = useRealEstate();
  const isGuest = !currentUser || currentUser.role === 'guest';

  // Do not render on single property detail page (which has its own mobile sticky contact action bar)
  // or on admin CMS pages
  if (pathname.match(/-pr[a-z0-9_.-]+$/i) || pathname.startsWith('/admin')) {
    return null;
  }

  const isHome = pathname === '/';
  const isSale = pathname === '/nha-dat-ban';
  const isRent = pathname === '/nha-dat-cho-thue';
  const isPost = pathname === '/dang-tin';
  const isAccount = pathname === '/ho-so-ca-nhan' || pathname === '/dang-nhap' || pathname === '/dang-ky' || pathname === '/quan-ly-tin';

  return (
    <nav 
      aria-label="Thanh điều hướng dưới cùng di động"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] pb-safe transition-transform duration-200"
    >
      <div className="h-14 max-w-md mx-auto px-2 flex items-center justify-around relative">
        {/* 1. Khám Phá (Trang chủ) */}
        <Link
          to="/"
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
            isHome ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <i className={`fa-solid fa-compass text-lg ${isHome ? 'scale-110' : ''} transition-transform`}></i>
            {isHome && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Khám Phá</span>
        </Link>

        {/* 2. Mua Bán */}
        <Link
          to="/nha-dat-ban"
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
            isSale ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <i className={`fa-solid fa-house-chimney text-lg ${isSale ? 'scale-110' : ''} transition-transform`}></i>
            {isSale && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Mua Bán</span>
        </Link>

        {/* 3. Center CTA: ĐĂNG TIN (Nổi bật vượt trội) */}
        <div className="flex-1 flex flex-col items-center justify-center relative -top-3">
          <Link
            to="/dang-tin"
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-red-600 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-red-500/40 border-2 border-white hover:scale-105 active:scale-95 transition-transform"
            title="Đăng tin bất động sản mới"
            aria-label="Đăng tin bất động sản mới"
          >
            <i className="fa-solid fa-plus text-lg"></i>
          </Link>
          <span className="text-[10px] font-bold text-red-600 mt-0.5 tracking-tight">Đăng Tin</span>
        </div>

        {/* 4. Cho Thuê */}
        <Link
          to="/nha-dat-cho-thue"
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
            isRent ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <i className={`fa-solid fa-key text-lg ${isRent ? 'scale-110' : ''} transition-transform`}></i>
            {isRent && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Cho Thuê</span>
        </Link>

        {/* 5. Tài Khoản Cá Nhân / Đăng Nhập / CMS Admin */}
        <Link
          to={isGuest ? "/dang-nhap" : currentUser.role === 'admin' ? "/admin" : "/ho-so-ca-nhan"}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
            isAccount ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            {isGuest ? (
              <i className={`fa-solid fa-user text-lg ${isAccount ? 'scale-110' : ''} transition-transform`}></i>
            ) : (
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-5 h-5 rounded-full object-cover border border-slate-300" 
              />
            )}
            {isAccount && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight truncate max-w-[55px]">
            {isGuest ? 'Tài Khoản' : currentUser.role === 'admin' ? 'CMS Admin' : 'Cá Nhân'}
          </span>
        </Link>
      </div>
    </nav>
  );
}
