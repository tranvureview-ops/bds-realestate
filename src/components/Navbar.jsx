'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { useRouter, Link } from '../router/RouterContext';
import { getPremiumPackageSavePercent } from '../utils/membershipHelper';
import SocialIcon from './SocialIcon';

const cleanUserName = (name) => {
  if (!name) return 'Khách vãng lai';
  return name.replace(/\s*\([^)]*\)\s*$/, '').trim();
};

const formatSubMenuTitle = (parentItem, subItem) => {
  if (!subItem?.title) return '';
  const rawTitle = subItem.title.trim();
  const isSale = parentItem?.path?.includes('ban') || parentItem?.id === 'menu-sale' || parentItem?.title?.toLowerCase().includes('bán');
  const isRent = parentItem?.path?.includes('cho-thue') || parentItem?.id === 'menu-rent' || parentItem?.title?.toLowerCase().includes('thuê');

  if (isSale) {
    if (!rawTitle.toLowerCase().startsWith('bán')) {
      return `Bán ${rawTitle}`;
    }
    return rawTitle;
  }
  if (isRent) {
    if (!rawTitle.toLowerCase().startsWith('cho thuê')) {
      return `Cho Thuê ${rawTitle}`;
    }
    return rawTitle;
  }
  return rawTitle;
};

export default function Navbar() {
  const { 
    currentUser, 
    favorites, 
    logoutUser,
    navMenuItems,
    headerConfig,
    systemConfig,
    isMembershipActive,
    membershipPackages
  } = useRealEstate();

  const premiumSavePercent = useMemo(() => {
    return getPremiumPackageSavePercent(membershipPackages);
  }, [membershipPackages]);

  const isMemberActive = isMembershipActive ? isMembershipActive(currentUser) : Boolean(
    currentUser?.membership && 
    currentUser.membership.status === 'active' && 
    (!currentUser.membership.expiresAt || new Date(currentUser.membership.expiresAt).getTime() > Date.now())
  );
  const isMemberExpired = Boolean(currentUser?.membership && !isMemberActive);

  const { currentPath, pathname: routerPathname, navigate } = useRouter();
  const currentRoute = routerPathname || currentPath || '/';

  // Dropdown states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileExpanded, setMobileExpanded] = useState({});

  const userMenuRef = useRef(null);
  const isGuest = !currentUser || currentUser.role === 'guest';

  // Quản lý fallback ảnh logo và định dạng hiển thị thương hiệu
  const [logoImgError, setLogoImgError] = useState(false);
  useEffect(() => {
    setLogoImgError(false);
  }, [headerConfig?.logoImageUrl, headerConfig?.logoType]);

  const { brandNameDisplay, brandHighlightDisplay } = useMemo(() => {
    const hasHeaderBrand = Boolean(headerConfig?.brandName?.trim() || headerConfig?.brandHighlight?.trim());
    if (hasHeaderBrand) {
      return {
        brandNameDisplay: headerConfig?.brandName?.trim() || '',
        brandHighlightDisplay: headerConfig?.brandHighlight?.trim() || ''
      };
    }
    const fullText = systemConfig?.brandShortName?.trim() || 'ĐẤT BIỂN ĐÀ NẴNG';
    const words = fullText.split(/\s+/).filter(Boolean);
    if (words.length <= 1) {
      return {
        brandNameDisplay: words[0] || 'BẤT ĐỘNG SẢN',
        brandHighlightDisplay: ''
      };
    }
    return {
      brandNameDisplay: words.slice(0, -1).join(' '),
      brandHighlightDisplay: words[words.length - 1]
    };
  }, [headerConfig?.brandName, headerConfig?.brandHighlight, systemConfig?.brandShortName]);

  const isImageLogo = headerConfig?.logoType === 'image' && Boolean(headerConfig?.logoImageUrl) && !logoImgError;

  // Chuẩn hóa chiều rộng container đồng nhất với toàn bộ trang:
  // - Boxed: 1152px (max-w-6xl) trên laptop, 1280px (xl:max-w-7xl) trên màn lớn (canh giữa)
  // - Wide: 94% chiều rộng màn hình (max-w-[94vw]) đến 1536px (2xl:max-w-[1536px])
  // - Full: 100% toàn màn hình (w-full) tràn viền Edge-to-Edge
  const containerWidthClass = useMemo(() => {
    const widthType = headerConfig?.containerWidth || 'boxed';
    if (widthType === 'full') return 'w-full px-4 sm:px-6 lg:px-8 transition-all duration-300';
    if (widthType === 'wide') return 'w-full max-w-[94vw] 2xl:max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300';
    return 'w-full max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300';
  }, [headerConfig?.containerWidth]);

  // Lấy toàn bộ các mục menu trực tiếp từ Cấu Hình Menu trong Trang Quản Trị
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
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Đóng mobile menu khi chuyển trang
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [currentRoute]);

  // Khóa scroll nền khi mở menu drawer trên mobile
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const toggleMobileSubmenu = (id) => {
    setMobileExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Danh sách mạng xã hội đã kích hoạt (đồng bộ từ headerConfig hoặc systemConfig)
  const activeSocialList = useMemo(() => {
    const socialConfig = headerConfig?.socialLinks || systemConfig?.socialLinks || {};
    return Object.entries(socialConfig)
      .filter(([_, item]) => item && item.enabled && item.url)
      .map(([key, item]) => ({
        key,
        ...item
      }));
  }, [headerConfig?.socialLinks, systemConfig?.socialLinks]);

  return (
    <header className="relative w-full z-50 bg-white border-b border-slate-200/80 shadow-xs">
      {/* 1. TOP UTILITY BAR (Hotline, Demo Switcher, Reset) */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 border-b border-slate-800">
        <div suppressHydrationWarning className={`${containerWidthClass} flex items-center justify-between gap-2 sm:gap-3`}>
          {/* Left: Hotline & Slogan */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-900 text-emerald-100 border border-emerald-700 font-bold text-[10px] sm:text-[11px] truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse shrink-0"></span>
              <span className="hidden sm:inline truncate text-emerald-100 font-bold">Sàn BĐS {[brandNameDisplay, brandHighlightDisplay].filter(Boolean).join(' ') || 'Bất Động Sản'}</span>
              <span className="sm:hidden truncate text-emerald-100 font-bold">{brandNameDisplay || 'Sàn BĐS'}</span>
            </span>
            <span suppressHydrationWarning className="hidden md:inline-flex items-center gap-1.5 text-slate-300 shrink-0">
              <span className="text-slate-500">|</span>
              <span>Hotline 24/7:</span>
              <Link
                suppressHydrationWarning
                href={`tel:${(systemConfig?.hotline || '0904 084 888').replace(/\s+/g, '')}`}
                className="text-white hover:text-emerald-300 font-bold font-mono transition inline-flex items-center gap-1"
                title={`Gọi ngay Hotline 24/7: ${systemConfig?.hotline || '0904 084 888'}`}
                aria-label={`Gọi ngay Hotline 24/7: ${systemConfig?.hotline || '0904 084 888'}`}
              >
                <i className="fa-solid fa-phone text-[10px] text-emerald-300" aria-hidden="true"></i>
                <span suppressHydrationWarning>{systemConfig?.hotline || '0904 084 888'}</span>
              </Link>
            </span>
          </div>

          {/* Right: Giờ làm việc & Mạng xã hội */}
          <div suppressHydrationWarning className="flex items-center gap-2 sm:gap-3 text-slate-300 text-[11px] shrink-0">
            <span className="inline-flex items-center gap-1.5">
              <i className="fa-regular fa-clock text-emerald-300 text-[10px]"></i>
              <span className="hidden sm:inline">Giờ làm việc:</span>
              <span className="text-slate-200 font-semibold">8:00 - 21:00</span>
            </span>

            {/* Social Media Channels */}
            {activeSocialList.length > 0 && (
              <>
                <span className="text-slate-700 hidden sm:inline select-none">|</span>
                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0" style={{ contain: 'layout' }}>
                  <span className="hidden lg:inline text-slate-400 text-[10px] font-medium mr-0.5 shrink-0">Mạng xã hội:</span>
                  {activeSocialList.map(item => (
                    <Link
                      key={item.key}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:scale-110 border border-slate-700/80 flex items-center justify-center transition shadow-xs shrink-0 aspect-square ${item.hoverColor || 'hover:text-white'}`}
                      title={item.label || item.key}
                      style={{ contain: 'layout paint' }}
                    >
                      <SocialIcon item={item} className="w-2.5 h-2.5" />
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVBAR BAR */}
      <div className="bg-white">
        <div suppressHydrationWarning className={`${containerWidthClass} min-h-[60px] sm:min-h-[72px] py-2 flex items-center justify-between gap-2 sm:gap-4`}>
          {/* Left: Brand Logo */}
          <Link 
            to="/" 
            suppressHydrationWarning
            className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none group min-w-0 shrink"
          >
            {isImageLogo ? (
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <img 
                  src={headerConfig.logoImageUrl} 
                  alt={headerConfig.logoAlt || 'Logo'} 
                  style={{ height: `${headerConfig.logoHeight || 38}px` }}
                  className="object-contain max-h-10 sm:max-h-14 max-w-[130px] sm:max-w-[240px] transition-transform group-hover:scale-102"
                  onError={() => setLogoImgError(true)}
                />
                {headerConfig.showTaglineWithImage && (headerConfig.brandTagline || systemConfig?.tagline) && (
                  <span className="text-[10px] text-slate-600 font-bold tracking-wider uppercase hidden md:inline-block truncate">
                    {headerConfig.brandTagline || systemConfig?.tagline}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center text-white text-base sm:text-lg font-black shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform shrink-0">
                  <i className={headerConfig?.brandIcon || 'fa-solid fa-water'}></i>
                </div>
                <div className="leading-tight min-w-0 truncate">
                  <div className="flex items-center font-black text-slate-900 tracking-tight text-base sm:text-lg truncate">
                    <span className="truncate">{brandNameDisplay}</span>
                    {brandHighlightDisplay ? (
                      <span className="text-emerald-700 shrink-0">{brandHighlightDisplay}</span>
                    ) : null}
                    {headerConfig?.badgeText && (
                      <span className={`hidden sm:inline-block ml-1.5 text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${headerConfig?.badgeColor || 'bg-red-100 text-red-700 border border-red-300'}`}>
                        {headerConfig.badgeText}
                      </span>
                    )}
                  </div>
                  {(headerConfig?.brandTagline || systemConfig?.tagline) && (
                    <div className="hidden sm:block text-[10px] text-slate-600 font-bold tracking-wider uppercase truncate max-w-[220px]">
                      {headerConfig?.brandTagline || systemConfig?.tagline}
                    </div>
                  )}
                </div>
              </div>
            )}
          </Link>

          {/* Center: Desktop Navigation Links (Khớp 100% Cấu Hình Menu từ Admin) */}
          <nav aria-label="Thanh điều hướng chính" suppressHydrationWarning className="hidden lg:flex items-center gap-1 xl:gap-1.5 font-semibold text-[13.5px] text-slate-700 shrink-0">
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
                          : 'hover:bg-slate-50 text-slate-700 hover:text-emerald-700'
                      }`}
                    >
                      {item.icon && <i className={`${item.icon} text-xs ${isActive ? 'text-emerald-700' : 'text-slate-400'}`}></i>}
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${item.badgeColor || 'bg-red-600 text-white'}`}>
                          {item.badge}
                        </span>
                      )}
                      <i className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}></i>
                    </Link>

                    {/* Category Dropdown Menu */}
                    {isDropdownOpen && (
                      <div className={`absolute top-full ${item.children.length > 6 ? 'left-0 sm:-left-12 w-[520px]' : 'left-0 w-64'} pt-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150`}>
                        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-3 text-xs">
                          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-2 flex items-center justify-between">
                            <span>Danh mục {item.title}</span>
                            <span className="text-emerald-700 font-bold lowercase">({item.children.length} loại hình)</span>
                          </div>
                          <div className={item.children.length > 6 ? "grid grid-cols-2 gap-1" : "space-y-1"}>
                            {item.children.map(sub => (
                              <Link
                                key={sub.id}
                                to={sub.path}
                                onClick={() => setActiveDropdown(null)}
                                className={`px-2.5 py-2 rounded-xl flex items-center gap-2 transition font-medium ${
                                  currentRoute === sub.path 
                                    ? 'bg-emerald-50 text-emerald-700 font-bold' 
                                    : 'hover:bg-slate-50 text-slate-700 hover:text-emerald-700'
                                }`}
                              >
                                {sub.icon && <i className={`${sub.icon} text-slate-400 w-4 text-center text-xs shrink-0`}></i>}
                                <span className="truncate">{formatSubMenuTitle(item, sub)}</span>
                              </Link>
                            ))}
                          </div>
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
                      : 'hover:bg-slate-50 text-slate-700 hover:text-emerald-700'
                  }`}
                >
                  {item.icon && <i className={`${item.icon} text-xs ${isActive ? 'text-emerald-700' : 'text-slate-400'}`}></i>}
                  <span>{item.title}</span>
                  {item.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${item.badgeColor || 'bg-red-600 text-white'}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions, User Menu, Post Listing CTA */}
          <div suppressHydrationWarning className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Yêu thích (Tin đã lưu) Link - Thu gọn padding trên mobile */}
            <Link
              to="/tin-da-luu"
              suppressHydrationWarning
              className={`relative p-1.5 sm:p-2 rounded-xl border transition ${
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

            {/* Trung tâm phần thưởng Quick Link */}
            <Link
              to="/trung-tam-phan-thuong"
              suppressHydrationWarning
              className={`hidden sm:flex relative p-2 rounded-xl border transition ${
                currentRoute.startsWith('/trung-tam-phan-thuong')
                  ? 'bg-purple-50 border-purple-200 text-purple-700'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-purple-600'
              }`}
              title="Trung tâm phần thưởng & Minigame"
            >
              <i className="fa-solid fa-gift text-sm text-purple-600"></i>
              <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-950 text-[8px] font-black px-1 rounded-full flex items-center justify-center shadow-xs">
                HOT
              </span>
            </Link>

            {/* User Account Dropdown / Login Links */}
            <div suppressHydrationWarning>
              {isGuest ? (
                <div suppressHydrationWarning className="hidden sm:flex items-center gap-2">
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
                    aria-label="Tài khoản cá nhân"
                    className="flex items-center gap-1 sm:gap-2 p-1 sm:p-1.5 sm:pl-2 sm:pr-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition"
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
                      <div suppressHydrationWarning className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5 flex-wrap">
                        <span>{currentUser.walletBalance?.toLocaleString('vi-VN')} đ</span>
                        {Number(currentUser.bonusWalletBalance) > 0 && (
                          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded font-bold text-[9px] flex items-center gap-0.5">
                            <i className="fa-solid fa-gift text-emerald-600 text-[8px]"></i>
                            +{Number(currentUser.bonusWalletBalance).toLocaleString('vi-VN')}đ KM
                          </span>
                        )}
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
                          <div className="text-[10px] text-slate-500 font-semibold uppercase">Số dư ví chính</div>
                          <div className="text-sm font-black text-emerald-700">
                            {currentUser.walletBalance?.toLocaleString('vi-VN')} đ
                          </div>
                          <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 pt-0.5">
                            <i className="fa-solid fa-gift text-emerald-600"></i>
                            <span>Ví KM: +{(Number(currentUser.bonusWalletBalance) || 0).toLocaleString('vi-VN')} đ</span>
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
                        {/* Mục Quản trị CMS nổi bật dành riêng cho tài khoản Quản trị viên (Admin) */}
                        {currentUser.role === 'admin' && (
                          <Link
                            to="/admin"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setUserMenuOpen(false)}
                            className="w-full px-3 py-2.5 rounded-xl text-left font-bold transition flex items-center justify-between bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 shadow-xs mb-1.5"
                          >
                            <div className="flex items-center gap-2.5">
                              <i className="fa-solid fa-shield-halved text-red-600 w-4 text-center"></i>
                              <span>Trang CMS Quản Trị</span>
                            </div>
                            <i className="fa-solid fa-arrow-up-right-from-square text-[10px] text-red-400"></i>
                          </Link>
                        )}

                        {/* Hồ sơ cá nhân - luôn truy cập được cho mọi vai trò (Admin / Môi giới / Thành viên) */}
                        <Link
                          to="/ho-so-ca-nhan"
                          onClick={() => setUserMenuOpen(false)}
                          className={`w-full px-3 py-2 rounded-xl text-left transition flex items-center gap-2.5 ${currentRoute === '/ho-so-ca-nhan' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                        >
                          <i className="fa-solid fa-user-pen text-emerald-600 w-4 text-center"></i>
                          <span>Hồ sơ cá nhân</span>
                        </Link>

                        <Link
                          to="/quan-ly-tin"
                          onClick={() => setUserMenuOpen(false)}
                          className={`w-full px-3 py-2 rounded-xl text-left transition flex items-center gap-2.5 ${currentRoute === '/quan-ly-tin' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                        >
                          <i className="fa-solid fa-newspaper text-blue-600 w-4 text-center"></i>
                          <span>Quản lý tin đăng</span>
                        </Link>

                        <Link
                          to="/lich-su-giao-dich"
                          onClick={() => setUserMenuOpen(false)}
                          className={`w-full px-3 py-2 rounded-xl text-left transition flex items-center gap-2.5 ${currentRoute === '/lich-su-giao-dich' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                        >
                          <i className="fa-solid fa-receipt text-indigo-600 w-4 text-center"></i>
                          <span>Lịch sử giao dịch & Ví</span>
                        </Link>

                        {/* Các mục đặc quyền dịch vụ hội viên */}
                        {currentUser.role !== 'admin' && (
                          <>
                            <Link
                              to="/goi-hoi-vien"
                              onClick={() => setUserMenuOpen(false)}
                              className={`w-full px-3 py-2 rounded-xl text-left transition flex items-center justify-between ${currentRoute === '/goi-hoi-vien' ? 'bg-amber-50 text-amber-900 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                            >
                              <div className="flex items-center gap-2.5">
                                <i className="fa-solid fa-crown text-amber-500 w-4 text-center"></i>
                                <span>Gói hội viên</span>
                              </div>
                              {isMemberActive ? (
                                <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded-full">
                                  {currentUser.membership?.packageName}
                                </span>
                              ) : isMemberExpired ? (
                                <span className="text-[9px] bg-rose-500 text-white font-black px-1.5 py-0.5 rounded-full">
                                  Đã hết hạn
                                </span>
                              ) : (
                                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full">
                                  Tiết kiệm {premiumSavePercent}%
                                </span>
                              )}
                            </Link>

                            <Link
                              to="/trung-tam-phan-thuong"
                              onClick={() => setUserMenuOpen(false)}
                              className={`w-full px-3 py-2 rounded-xl text-left transition flex items-center gap-2.5 ${currentRoute.startsWith('/trung-tam-phan-thuong') ? 'bg-purple-50 text-purple-700 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                            >
                              <i className="fa-solid fa-gift text-purple-600 w-4 text-center"></i>
                              <span>Trung tâm phần thưởng</span>
                            </Link>

                            <Link
                              to="/khuyen-mai"
                              onClick={() => setUserMenuOpen(false)}
                              className={`w-full px-3 py-2 rounded-xl text-left transition flex items-center gap-2.5 ${currentRoute.startsWith('/khuyen-mai') ? 'bg-rose-50 text-rose-700 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                            >
                              <i className="fa-solid fa-tags text-rose-500 w-4 text-center"></i>
                              <span>Khuyến mãi & Voucher</span>
                            </Link>

                            <Link
                              to="/nhiem-vu"
                              onClick={() => setUserMenuOpen(false)}
                              className={`w-full px-3 py-2 rounded-xl text-left transition flex items-center gap-2.5 ${currentRoute.startsWith('/nhiem-vu') ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                            >
                              <i className="fa-solid fa-list-check text-blue-600 w-4 text-center"></i>
                              <span>Nhiệm vụ nhận tiền ví</span>
                            </Link>
                          </>
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
              className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs sm:text-sm px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl shadow-md shadow-red-500/20 hover:shadow-lg transition transform active:scale-95 whitespace-nowrap shrink-0"
            >
              <i className="fa-solid fa-circle-plus text-xs sm:text-base"></i>
              <span className="hidden sm:inline">Đăng Tin Ngay</span>
              <span className="sm:hidden text-[11px]">Đăng tin</span>
            </Link>

            {/* Mobile Menu Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center p-0 rounded-lg sm:rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition shrink-0"
              aria-label="Toggle mobile menu"
            >
              <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-sm sm:text-base`}></i>
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
              {isImageLogo ? (
                <img 
                  src={headerConfig.logoImageUrl} 
                  alt={headerConfig.logoAlt || 'Logo'} 
                  className="h-8 max-w-[180px] object-contain"
                  onError={() => setLogoImgError(true)}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                    <i className={headerConfig?.brandIcon || 'fa-solid fa-water'}></i>
                  </div>
                  <div className="font-black text-slate-900 text-base flex items-center">
                    <span>{brandNameDisplay}</span>
                    {brandHighlightDisplay ? <span className="text-emerald-700">{brandHighlightDisplay}</span> : null}
                  </div>
                </div>
              )}
              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Đóng menu điều hướng di động"
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-sm"></i>
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* User Profile Card (if logged in) or Login Banner (if guest) */}
              {!isGuest ? (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full object-cover border" />
                    <div>
                      <div className="font-bold text-sm text-slate-900">{cleanUserName(currentUser.name)}</div>
                      <div className="text-xs text-emerald-700 font-bold flex items-center gap-1.5 flex-wrap">
                        <span>{currentUser.walletBalance?.toLocaleString('vi-VN')} đ</span>
                        {Number(currentUser.bonusWalletBalance) > 0 && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 rounded font-bold">
                            +{Number(currentUser.bonusWalletBalance).toLocaleString('vi-VN')}đ KM
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/nap-tien"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                  >
                    + Nạp
                  </Link>
                </div>
              ) : (
                <div className="p-3.5 bg-gradient-to-r from-slate-50 to-emerald-50/40 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <i className="fa-solid fa-user text-sm"></i>
                    </div>
                    <div className="min-w-0 truncate">
                      <div className="font-bold text-xs text-slate-900 truncate">Tài khoản thành viên</div>
                      <div className="text-[10px] text-slate-500 truncate">Đăng nhập để quản lý tin</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Link
                      to="/dang-nhap"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                    >
                      Đăng Nhập
                    </Link>
                    <Link
                      to="/dang-ky"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold text-xs"
                    >
                      Đăng Ký
                    </Link>
                  </div>
                </div>
              )}

              {/* Quick Links in Drawer (Yêu Thích) */}
              <div>
                <Link
                  to="/tin-da-luu"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold transition ${
                    currentRoute === '/tin-da-luu' ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-heart text-rose-600"></i>
                    <span>Tin đã lưu</span>
                  </div>
                  {favorites.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center">
                      {favorites.length}
                    </span>
                  )}
                </Link>
              </div>

              {/* Dynamic Navigation Menu Items (Khớp 100% Admin) */}
              <nav aria-label="Menu danh mục di động" className="space-y-1">
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
                                <span>{formatSubMenuTitle(item, sub)}</span>
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
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${item.badgeColor || 'bg-red-600 text-white'}`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Tiện ích Phần thưởng & Khuyến mãi (Mobile) */}
              <div className="space-y-1 pt-2 border-t border-slate-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Phần Thưởng & Ưu Đãi
                </div>
                <Link
                  to="/trung-tam-phan-thuong"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between font-semibold text-sm transition ${
                    currentRoute.startsWith('/trung-tam-phan-thuong') ? 'bg-purple-50 text-purple-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <i className="fa-solid fa-gift text-purple-600 w-4 text-center"></i>
                    <span>Trung tâm phần thưởng</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-amber-400 text-slate-950">
                    HOT
                  </span>
                </Link>

                <Link
                  to="/khuyen-mai"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between font-semibold text-sm transition ${
                    currentRoute.startsWith('/khuyen-mai') ? 'bg-rose-50 text-rose-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <i className="fa-solid fa-tags text-rose-500 w-4 text-center"></i>
                    <span>Khuyến mãi & Voucher</span>
                  </div>
                </Link>

                <Link
                  to="/nhiem-vu"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between font-semibold text-sm transition ${
                    currentRoute.startsWith('/nhiem-vu') ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <i className="fa-solid fa-list-check text-blue-600 w-4 text-center"></i>
                    <span>Nhiệm vụ nhận tiền ví</span>
                  </div>
                </Link>
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

              <Link
                href={`tel:${(systemConfig?.hotline || '0904 084 888').replace(/\s+/g, '')}`}
                className="w-full py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-100"
                title={`Gọi Hotline tư vấn 24/7: ${systemConfig?.hotline || '0904 084 888'}`}
                aria-label={`Gọi Hotline tư vấn 24/7: ${systemConfig?.hotline || '0904 084 888'}`}
              >
                <i className="fa-solid fa-phone text-emerald-600" aria-hidden="true"></i>
                <span>Hotline 24/7: {systemConfig?.hotline || '0904 084 888'}</span>
              </Link>

              {/* Mobile Social Media Links */}
              {activeSocialList.length > 0 && (
                <div className="pt-2 flex flex-col items-center justify-center gap-1.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Mạng xã hội kết nối:</span>
                  <div className="flex items-center gap-2">
                    {activeSocialList.map(item => (
                      <Link
                        key={item.key}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-emerald-600 hover:border-emerald-500 flex items-center justify-center transition shadow-xs text-xs"
                        title={item.label || item.key}
                      >
                        {item.key === 'zalo' ? (
                          <span className="font-black text-[11px] text-sky-600 leading-none">Z</span>
                        ) : (
                          <i className={`${item.icon} text-xs`}></i>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
