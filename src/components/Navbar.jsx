'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { useRouter, Link } from '../router/RouterContext';

const cleanUserName = (name) => {
  if (!name) return 'Khách vãng lai';
  return name.replace(/\s*\([^)]*\)\s*$/, '').trim();
};

export default function Navbar() {
  const { 
    currentUser, 
    switchUserRole, 
    favorites, 
    compareList, 
    resetToMockData,
    logoutUser,
    navMenuItems,
    headerConfig,
    systemConfig
  } = useRealEstate();

  const { currentPath, pathname: routerPathname, navigate } = useRouter();
  const currentRoute = routerPathname || currentPath || '/';

  // Dropdown states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileExpanded, setMobileExpanded] = useState({});

  const userMenuRef = useRef(null);
  const roleDropdownRef = useRef(null);
  const isGuest = !currentUser || currentUser.role === 'guest';

  // Chuẩn hóa chiều rộng container đồng nhất với toàn bộ trang (Boxed: max-w-7xl | Full: w-full)
  const containerWidthClass = useMemo(() => {
    const widthType = headerConfig?.containerWidth || 'boxed';
    if (widthType === 'full') return 'w-full px-4 sm:px-6 lg:px-8';
    return 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';
  }, [headerConfig?.containerWidth]);

  // Lấy toàn bộ các mục menu trực tiếp từ Cấu Hình Thanh Menu trong Trang Quản Trị
  const menuItems = useMemo(() => {
    return (navMenuItems || [])
      .filter(item => {
        if (!item.isVisible) return false;
        if (item.id === 'menu-admin' && currentUser?.role !== 'admin') return false;
        return true;
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [navMenuItems, currentUser?.role]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
        setRoleDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Đóng mobile menu khi chuyển trang
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [currentRoute]);

  const toggleMobileSubmenu = (id) => {
    setMobileExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <header className="relative w-full z-30 bg-white border-b border-slate-200/80 shadow-xs">
      {/* 1. TOP UTILITY BAR (Hotline, Demo Switcher, Reset) */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 border-b border-slate-800">
        <div suppressHydrationWarning className={`${containerWidthClass} flex items-center justify-between gap-3`}>
          {/* Left: Hotline & Slogan */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-400 border border-emerald-800/80 font-semibold text-[10px] sm:text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="hidden xs:inline sm:inline">Sàn BĐS Đất Biển Đà Nẵng</span>
              <span className="xs:hidden sm:hidden">Đất Biển Đà Nẵng</span>
            </span>
            <span suppressHydrationWarning className="hidden md:inline-flex items-center gap-1.5 text-slate-400">
              <span className="text-slate-600">|</span>
              <span>Hotline 24/7:</span>
              <a
                suppressHydrationWarning
                href={`tel:${(systemConfig?.hotline || '0904 084 888').replace(/\s+/g, '')}`}
                className="text-white hover:text-emerald-400 font-bold font-mono transition inline-flex items-center gap-1"
                title="Gọi Hotline 24/7"
              >
                <i className="fa-solid fa-phone text-[10px] text-emerald-400"></i>
                <span suppressHydrationWarning>{systemConfig?.hotline || '0904 084 888'}</span>
              </a>
            </span>
          </div>

          {/* Right: Demo Role Switcher & Reset Button */}
          <div suppressHydrationWarning className="flex items-center gap-2 sm:gap-3">
            {/* Quick Demo Role Switcher */}
            <div className="relative" ref={roleDropdownRef}>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 text-[11px] font-medium transition min-w-[130px] sm:min-w-[150px] justify-between"
                title="Chuyển đổi tài khoản demo nhanh"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <i className="fa-solid fa-user-gear text-amber-400 text-[11px] shrink-0"></i>
                  <span suppressHydrationWarning className="hidden md:inline text-slate-400">Tài khoản:</span>
                  <strong suppressHydrationWarning className="text-amber-400 font-semibold truncate">
                    {cleanUserName(currentUser?.name)}
                  </strong>
                  <span suppressHydrationWarning className="hidden lg:inline text-slate-400 text-[10px]">
                    ({currentUser?.role === 'admin' ? 'Admin' : currentUser?.role === 'broker' ? 'Môi giới Pro' : currentUser?.role === 'user' ? 'Khách mua' : 'Chưa đăng nhập'})
                  </span>
                </div>
                <i className={`fa-solid fa-chevron-down text-[9px] text-slate-400 transition-transform shrink-0 ${roleDropdownOpen ? 'rotate-180' : ''}`}></i>
              </button>

              {roleDropdownOpen && (
                <div 
                  className="absolute right-0 mt-1 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 text-slate-800 z-50 text-xs animate-in fade-in slide-in-from-top-1 duration-150"
                  onClick={() => setRoleDropdownOpen(false)}
                >
                  <div className="px-3 py-1.5 border-b border-slate-100 font-bold text-slate-400 text-[10px] uppercase tracking-wider">
                    Chuyển tài khoản demo:
                  </div>
                  <button 
                    onClick={() => switchUserRole('broker')}
                    className={`w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between transition ${currentUser.role === 'broker' ? 'bg-amber-50 text-amber-800 font-semibold' : ''}`}
                  >
                    <span className="flex items-center gap-2">
                      <i className="fa-solid fa-crown text-amber-500 w-4 text-center"></i>
                      <span>Môi giới Pro (Nguyễn Văn Tuấn)</span>
                    </span>
                    {currentUser.role === 'broker' && <i className="fa-solid fa-check text-amber-600"></i>}
                  </button>
                  <button 
                    onClick={() => switchUserRole('user')}
                    className={`w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between transition ${currentUser.role === 'user' ? 'bg-blue-50 text-blue-800 font-semibold' : ''}`}
                  >
                    <span className="flex items-center gap-2">
                      <i className="fa-solid fa-user text-blue-500 w-4 text-center"></i>
                      <span>Khách mua (Trần Thị Mai)</span>
                    </span>
                    {currentUser.role === 'user' && <i className="fa-solid fa-check text-blue-600"></i>}
                  </button>
                  <button 
                    onClick={() => switchUserRole('admin')}
                    className={`w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between transition ${currentUser.role === 'admin' ? 'bg-red-50 text-red-800 font-semibold' : ''}`}
                  >
                    <span className="flex items-center gap-2">
                      <i className="fa-solid fa-shield-halved text-red-500 w-4 text-center"></i>
                      <span>Admin Quản trị (Admin BDS)</span>
                    </span>
                    {currentUser.role === 'admin' && <i className="fa-solid fa-check text-red-600"></i>}
                  </button>
                </div>
              )}
            </div>

            {/* Reset Demo Data Button */}
            <button
              onClick={resetToMockData}
              className="text-slate-400 hover:text-white transition flex items-center gap-1 text-[11px] px-2 py-1 rounded hover:bg-slate-800"
              title="Khôi phục dữ liệu mẫu ban đầu"
            >
              <i className="fa-solid fa-rotate-left text-[10px]"></i>
              <span className="hidden sm:inline">Khôi phục mẫu</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVBAR BAR */}
      <div className="bg-white">
        <div suppressHydrationWarning className={`${containerWidthClass} h-18 py-2 flex items-center justify-between gap-4`}>
          {/* Left: Brand Logo */}
          <Link 
            to="/" 
            suppressHydrationWarning
            className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
          >
            {headerConfig?.logoType === 'image' && headerConfig?.logoImageUrl ? (
              <img 
                src={headerConfig.logoImageUrl} 
                alt={headerConfig.logoAlt || 'Logo'} 
                style={{ height: `${headerConfig.logoHeight || 38}px` }}
                className="object-contain max-h-12 max-w-[200px] transition-transform group-hover:scale-102"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center text-white text-lg font-black shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform shrink-0">
                  <i className={headerConfig?.brandIcon || 'fa-solid fa-water'}></i>
                </div>
                <div className="leading-tight">
                  <div className="flex items-center gap-1 font-black text-slate-900 tracking-tight text-lg">
                    <span>{headerConfig?.brandName || 'ĐẤT BIỂN'}</span>
                    <span className="text-emerald-600">{headerConfig?.brandHighlight || 'ĐÀ NẴNG'}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">
                    Bất Động Sản Biển
                  </div>
                </div>
              </div>
            )}
          </Link>

          {/* Center: Desktop Navigation Links (Khớp 100% Cấu Hình Thanh Menu từ Admin) */}
          <nav suppressHydrationWarning className="hidden lg:flex items-center gap-1 xl:gap-1.5 font-semibold text-[13.5px] text-slate-700 shrink-0">
            {menuItems.map(item => {
              const hasChildren = item.children && item.children.length > 0;
              const isChildActive = hasChildren && item.children.some(c => c.path === currentRoute);
              const isActive = currentRoute === item.path || isChildActive;
              const isDropdownOpen = activeDropdown === item.id;
              const isBlank = item.target === '_blank';

              if (hasChildren) {
                return (
                  <div 
                    key={item.id} 
                    className="relative shrink-0"
                    onMouseEnter={() => setActiveDropdown(item.id)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <Link
                      to={item.path}
                      target={item.target || '_self'}
                      rel={isBlank ? 'noopener noreferrer' : undefined}
                      onClick={() => setActiveDropdown(null)}
                      className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                        isActive 
                          ? 'bg-emerald-50 text-emerald-700 font-bold' 
                          : 'hover:bg-slate-50 text-slate-700 hover:text-emerald-600'
                      }`}
                    >
                      {item.icon && <i className={`${item.icon} text-xs ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}></i>}
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${item.badgeColor || 'bg-red-500 text-white'}`}>
                          {item.badge}
                        </span>
                      )}
                      <i className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}></i>
                    </Link>

                    {/* Category Dropdown Menu */}
                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 pt-1.5 w-60 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-2 text-xs space-y-1">
                          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                            Danh mục {item.title}
                          </div>
                          {item.children.map(sub => (
                            <Link
                              key={sub.id}
                              to={sub.path}
                              onClick={() => setActiveDropdown(null)}
                              className={`w-full px-3 py-2 rounded-xl flex items-center gap-2.5 transition font-medium whitespace-nowrap ${
                                currentRoute === sub.path 
                                  ? 'bg-emerald-50 text-emerald-700 font-bold' 
                                  : 'hover:bg-slate-50 text-slate-700 hover:text-emerald-600'
                              }`}
                            >
                              {sub.icon && <i className={`${sub.icon} text-slate-400 w-4 text-center text-xs`}></i>}
                              <span>{sub.title}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              // Standard Link
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  target={item.target || '_self'}
                  rel={isBlank ? 'noopener noreferrer' : undefined}
                  className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                    isActive 
                      ? 'bg-emerald-50 text-emerald-700 font-bold' 
                      : 'hover:bg-slate-50 text-slate-700 hover:text-emerald-600'
                  }`}
                >
                  {item.icon && <i className={`${item.icon} text-xs ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}></i>}
                  <span>{item.title}</span>
                  {item.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${item.badgeColor || 'bg-red-500 text-white'}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions, User Menu, Post Listing CTA */}
          <div suppressHydrationWarning className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* So sánh BĐS Badge Link */}
            <Link
              to="/so-sanh"
              suppressHydrationWarning
              className={`relative p-2 rounded-xl border transition ${
                currentRoute === '/so-sanh' 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-600'
              }`}
              title="So sánh bất động sản đối đầu"
            >
              <i className="fa-solid fa-code-compare text-sm"></i>
              {compareList.length > 0 && (
                <span suppressHydrationWarning className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {compareList.length}
                </span>
              )}
            </Link>

            {/* Yêu thích (Tin đã lưu) Link */}
            <Link
              to="/tin-da-luu"
              suppressHydrationWarning
              className={`relative p-2 rounded-xl border transition ${
                currentRoute === '/tin-da-luu' 
                  ? 'bg-rose-50 border-rose-200 text-rose-600' 
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-rose-600'
              }`}
              title="Danh sách tin đã lưu yêu thích"
            >
              <i className="fa-solid fa-heart text-sm"></i>
              {favorites.length > 0 && (
                <span suppressHydrationWarning className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>

            {/* User Account Dropdown / Login Links */}
            <div suppressHydrationWarning>
              {isGuest ? (
                <div suppressHydrationWarning className="flex items-center gap-2">
                  <Link
                    to="/dang-nhap"
                    className="px-3 py-2 rounded-xl text-slate-700 hover:text-emerald-700 hover:bg-slate-100 font-bold text-xs sm:text-sm transition flex items-center gap-1.5"
                  >
                    <i className="fa-solid fa-arrow-right-to-bracket text-emerald-600"></i>
                    <span>Đăng Nhập</span>
                  </Link>
                  <Link
                    to="/dang-ky"
                    className="hidden sm:flex px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition items-center gap-1.5 shadow-sm"
                  >
                    <span>Đăng Ký</span>
                  </Link>
                </div>
              ) : (
                <div className="relative" ref={userMenuRef}>
                  <button
                    suppressHydrationWarning
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 pl-2 pr-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition"
                    title="Tài khoản cá nhân"
                  >
                    <div className="relative">
                      <img
                        src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                        alt={currentUser.name}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-slate-200"
                      />
                      {currentUser.isVerified && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-blue-600 text-white text-[8px] flex items-center justify-center border border-white">
                          <i className="fa-solid fa-check"></i>
                        </span>
                      )}
                    </div>
                    <div suppressHydrationWarning className="hidden md:block text-left">
                      <div suppressHydrationWarning className="text-xs font-bold text-slate-800 flex items-center gap-1.5 max-w-[140px] truncate">
                        <span>{cleanUserName(currentUser.name)}</span>
                        {currentUser.role === 'admin' && <span className="text-[9px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded font-bold shrink-0">Admin</span>}
                      </div>
                      <div suppressHydrationWarning className="text-[10px] text-slate-500 font-medium">
                        {currentUser.walletBalance?.toLocaleString('vi-VN')} đ
                      </div>
                    </div>
                    <i className="fa-solid fa-chevron-down text-[9px] text-slate-400"></i>
                  </button>

                  {/* User Profile Dropdown Panel */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 text-slate-800 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                      {/* Header Profile Info */}
                      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                        <img 
                          src={currentUser.avatar} 
                          alt={currentUser.name} 
                          className="w-10 h-10 rounded-full object-cover border border-slate-200" 
                        />
                        <div className="overflow-hidden">
                          <div className="font-bold text-sm text-slate-900 truncate flex items-center gap-1">
                            <span>{cleanUserName(currentUser.name)}</span>
                            {currentUser.isVerified && (
                              <i className="fa-solid fa-circle-check text-blue-600 text-xs" title="Đã xác thực KYC"></i>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 truncate">{currentUser.email || currentUser.phone}</div>
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              {currentUser.roleName}
                            </span>
                            {currentUser.kycStatus === 'verified' ? (
                              <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-0.5">
                                <i className="fa-solid fa-shield-check"></i> Đã KYC
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-0.5">
                                <i className="fa-solid fa-shield"></i> Chưa KYC
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Wallet Quick Balance */}
                      <div className="px-4 py-2.5 bg-slate-50 mx-2 my-2 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-500 font-semibold uppercase">Số dư ví khả dụng</div>
                          <div className="text-sm font-black text-emerald-600">
                            {currentUser.walletBalance?.toLocaleString('vi-VN')} đ
                          </div>
                        </div>
                        <Link
                          to="/nap-tien"
                          onClick={() => setUserMenuOpen(false)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                        >
                          + Nạp Tiền
                        </Link>
                      </div>

                      {/* Menu Navigation Links */}
                      <div className="px-2 space-y-0.5 text-xs font-medium">
                        <Link
                          to="/ho-so-ca-nhan"
                          onClick={() => setUserMenuOpen(false)}
                          className={`w-full px-3 py-2 rounded-xl text-left transition flex items-center gap-2.5 ${currentRoute === '/ho-so-ca-nhan' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                        >
                          <i className="fa-solid fa-user-pen text-emerald-600 w-4 text-center"></i>
                          <span>Hồ sơ cá nhân & Xác thực KYC</span>
                        </Link>

                        <Link
                          to="/quan-ly-tin"
                          onClick={() => setUserMenuOpen(false)}
                          className={`w-full px-3 py-2 rounded-xl text-left transition flex items-center gap-2.5 ${currentRoute === '/quan-ly-tin' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                        >
                          <i className="fa-solid fa-newspaper text-blue-600 w-4 text-center"></i>
                          <span>Quản lý tin đăng của tôi</span>
                        </Link>

                        <Link
                          to="/goi-hoi-vien"
                          onClick={() => setUserMenuOpen(false)}
                          className={`w-full px-3 py-2 rounded-xl text-left transition flex items-center justify-between ${currentRoute === '/goi-hoi-vien' ? 'bg-amber-50 text-amber-900 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <i className="fa-solid fa-crown text-amber-500 w-4 text-center"></i>
                            <span>Gói hội viên</span>
                          </div>
                          {currentUser?.membership ? (
                            <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded-full">
                              {currentUser.membership.packageName}
                            </span>
                          ) : (
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full">
                              Tiết kiệm 39%
                            </span>
                          )}
                        </Link>

                        {currentUser.role === 'admin' && (
                          <Link
                            to="/admin"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setUserMenuOpen(false)}
                            className="w-full px-3 py-2 rounded-xl text-left font-bold transition flex items-center justify-between bg-red-50 text-red-700 hover:bg-red-100"
                          >
                            <div className="flex items-center gap-2.5">
                              <i className="fa-solid fa-shield-halved text-red-600 w-4 text-center"></i>
                              <span>Trang CMS Quản Trị</span>
                            </div>
                            <i className="fa-solid fa-arrow-up-right-from-square text-[10px] text-red-400"></i>
                          </Link>
                        )}
                      </div>

                      {/* Logout Action */}
                      <div className="border-t border-slate-100 mt-2 pt-1 px-2">
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            logoutUser();
                            navigate('/');
                          }}
                          className="w-full px-3 py-2 rounded-xl text-left font-semibold text-xs text-rose-600 hover:bg-rose-50 transition flex items-center gap-2.5"
                        >
                          <i className="fa-solid fa-arrow-right-from-bracket text-rose-500 w-4 text-center"></i>
                          <span>Đăng xuất tài khoản</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Button: ĐĂNG TIN MỚI (High-impact CTA) */}
            <Link
              to="/dang-tin"
              className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs sm:text-sm px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-md shadow-red-500/20 hover:shadow-lg transition transform active:scale-95 whitespace-nowrap shrink-0"
            >
              <i className="fa-solid fa-circle-plus text-sm sm:text-base"></i>
              <span className="hidden sm:inline">Đăng Tin Ngay</span>
              <span className="sm:hidden">Đăng Tin</span>
            </Link>

            {/* Mobile Menu Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition shrink-0"
              aria-label="Toggle mobile menu"
            >
              <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-base w-4 text-center`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* 3. MOBILE SLIDE-OVER NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          {/* Drawer Content */}
          <div className="relative ml-auto w-full max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-250">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
                  <i className="fa-solid fa-water"></i>
                </div>
                <div className="font-black text-slate-900 text-base">
                  ĐẤT BIỂN <span className="text-emerald-600">ĐÀ NẴNG</span>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center"
              >
                <i className="fa-solid fa-xmark text-sm"></i>
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* User Profile Card (if logged in) */}
              {!isGuest && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full object-cover border" />
                    <div>
                      <div className="font-bold text-sm text-slate-900">{cleanUserName(currentUser.name)}</div>
                      <div className="text-xs text-emerald-600 font-bold">{currentUser.walletBalance?.toLocaleString('vi-VN')} đ</div>
                    </div>
                  </div>
                  <Link
                    to="/nap-tien"
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                  >
                    + Nạp
                  </Link>
                </div>
              )}

              {/* Dynamic Navigation Menu Items (Khớp 100% Admin) */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Danh Mục Menu
                </div>
                {menuItems.map(item => {
                  const hasChildren = item.children && item.children.length > 0;
                  const isExpanded = mobileExpanded[item.id];
                  const isActive = currentRoute === item.path;
                  const isBlank = item.target === '_blank';

                  if (hasChildren) {
                    return (
                      <div key={item.id} className="space-y-1">
                        <button
                          onClick={() => toggleMobileSubmenu(item.id)}
                          className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-left font-semibold text-sm transition ${
                            isActive ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {item.icon && <i className={`${item.icon} text-emerald-600 w-4 text-center`}></i>}
                            <span>{item.title}</span>
                          </div>
                          <i className={`fa-solid fa-chevron-down text-xs text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}></i>
                        </button>

                        {isExpanded && (
                          <div className="pl-6 pr-2 space-y-1 border-l-2 border-emerald-100 ml-4">
                            {item.children.map(sub => (
                              <Link
                                key={sub.id}
                                to={sub.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`w-full px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-medium transition ${
                                  currentRoute === sub.path ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                {sub.icon && <i className={`${sub.icon} text-slate-400 w-3 text-center`}></i>}
                                <span>{sub.title}</span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      target={item.target || '_self'}
                      rel={isBlank ? 'noopener noreferrer' : undefined}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between font-semibold text-sm transition ${
                        isActive ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {item.icon && <i className={`${item.icon} text-emerald-600 w-4 text-center`}></i>}
                        <span>{item.title}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${item.badgeColor || 'bg-red-500 text-white'}`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-2">
              <Link
                to="/dang-tin"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-circle-plus"></i>
                <span>Đăng Tin Bất Động Sản</span>
              </Link>

              <a
                href={`tel:${(systemConfig?.hotline || '0904 084 888').replace(/\s+/g, '')}`}
                className="w-full py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-100"
              >
                <i className="fa-solid fa-phone text-emerald-600"></i>
                <span>Hotline: {systemConfig?.hotline || '0904 084 888'}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
