'use client';

import React from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { Link, useRouter } from '../router/RouterContext';
import { VIP_PACKAGES } from '../data/mockData';
import { getPropertyPermalink, formatSentenceCase } from '../utils/permalink';
import { normalizePhone, formatPhoneNumber } from '../utils/authValidation';
import SeoImage from './SeoImage';

export default function ListingCard({ property, viewMode = 'grid' }) {
  const { navigate } = useRouter();
  const { 
    favorites, 
    toggleFavorite, 
    compareList, 
    toggleCompare, 
    openPropertyDetail,
    usersList
  } = useRealEstate();

  if (!property) return null;

  const safeImages = Array.isArray(property.images) && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'];

  // Tra cứu tác giả mới nhất từ usersList để đảm bảo tên & avatar luôn cập nhật đồng bộ 100%
  const authorUser = property.author?.id 
    ? usersList?.find(u => String(u.id) === String(property.author.id))
    : (property.author?.phone ? usersList?.find(u => normalizePhone(u.phone) === normalizePhone(property.author.phone)) : null);

  const rawAuthorPhone = authorUser?.phone || property.author?.phone || property.contactPhone || '0908 123 456';
  const displayAuthorPhone = formatPhoneNumber(rawAuthorPhone);

  // Phân định chính xác vai trò: Môi giới vs Khách tìm mua
  const rawRole = (authorUser?.role || property.author?.role || '').toLowerCase();
  const rawRoleName = (authorUser?.roleName || property.author?.title || '').toLowerCase();
  const isExplicitCustomer = rawRole === 'user' || rawRole === 'customer' || rawRole === 'buyer' ||
                             rawRoleName.includes('khách') || Boolean(property.isGuest);

  const isBroker = !isExplicitCustomer && (
    rawRole === 'broker' ||
    rawRole === 'agent' ||
    rawRoleName.includes('môi giới') ||
    rawRoleName.includes('chuyên viên') ||
    Boolean(authorUser?.membership) ||
    (!authorUser?.role && !property.author?.role)
  );

  const authorRolePrefix = isBroker ? 'Môi Giới' : 'Khách tìm mua';
  const authorName = authorUser?.name || property.author?.name || property.contactName || 'Người đăng tin';
  const authorTitle = `${authorRolePrefix} ${authorName}`;

  const isVerifiedAuthor = Boolean(
    authorUser?.isVerified ?? 
    property.author?.isVerified ?? 
    authorUser?.kycStatus === 'verified' ?? 
    property.author?.kycStatus === 'verified' ?? 
    false
  );

  const safeAuthor = {
    id: authorUser?.id || property.author?.id || null,
    name: authorName,
    fullNameWithRole: authorTitle,
    rolePrefix: authorRolePrefix,
    isBroker,
    phone: displayAuthorPhone,
    zalo: (authorUser?.phone || property.author?.zalo || property.author?.phone || property.contactPhone || '0908123456').replace(/\s+/g, ''),
    avatar: authorUser?.avatar || property.author?.avatar || '/avatars/ai-preset-2.jpg',
    title: isVerifiedAuthor ? 'Môi giới chuyên nghiệp' : '',
    isVerified: isVerifiedAuthor
  };

  const isFav = favorites.includes(property.id);
  const isCompared = compareList.some(item => item.id === property.id);

  // Find VIP Package with robust fallback
  const defaultPkg = VIP_PACKAGES.find(p => p.id === 'normal') || VIP_PACKAGES[VIP_PACKAGES.length - 1];
  const vipPkg = VIP_PACKAGES.find(p => p.id === property.vipPackageId) || defaultPkg;
  const isDiamond = property.vipPackageId === 'vip-diamond';
  const isGold = property.vipPackageId === 'vip-gold';

  // Format date
  const timeAgo = (dateStr) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) return 'Vừa mới đăng';
      if (diffHours < 24) return `${diffHours} giờ trước`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} ngày trước`;
    } catch {
      return 'Gần đây';
    }
  };

  const handleCardClick = (e) => {
    // If clicked on an interactive button/link, don't trigger card navigation
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    navigate(getPropertyPermalink(property));
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`relative isolate bg-white rounded-2xl overflow-hidden transition-all duration-300 group cursor-pointer ${
        isDiamond 
          ? 'vip-diamond-border hover:shadow-2xl' 
          : isGold 
          ? 'vip-gold-border hover:shadow-xl' 
          : 'border border-slate-200 hover:border-slate-300 hover:shadow-lg'
      } ${viewMode === 'list' ? 'flex flex-col md:flex-row md:items-stretch' : 'flex flex-col'}`}
    >
      {/* Property Image Container */}
      <div className={`relative overflow-hidden shrink-0 ${viewMode === 'list' ? 'w-full md:w-72 lg:w-80 h-56 md:h-auto md:self-stretch min-h-[220px]' : 'h-52 w-full'}`}>
        <Link to={getPropertyPermalink(property)} className="block w-full h-full absolute inset-0">
          <SeoImage
            src={safeImages[0]}
            property={property}
            type="thumbnail"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
          />
        </Link>

        {/* Gradient Overlay for photo contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-[2]">
          {/* VIP Level Badge */}
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase shadow-sm tracking-wide ${vipPkg.badgeColor}`}>
            {vipPkg.shortName}
          </span>

          {/* Demand Badge */}
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${property.demand === 'sale' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'}`}>
            {property.demand === 'sale' ? 'BÁN' : 'CHO THUÊ'}
          </span>
        </div>

        {/* Action Buttons Top Right: Favorite & Compare */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-[2]">
          {/* Compare Button */}
          <button
            onClick={() => toggleCompare(property)}
            title={isCompared ? 'Xóa khỏi bảng so sánh' : 'Thêm vào so sánh'}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition shadow-md ${
              isCompared 
                ? 'bg-blue-600 text-white' 
                : 'bg-white/90 text-slate-700 hover:bg-white hover:text-blue-600'
            }`}
          >
            <i className="fa-solid fa-code-compare"></i>
          </button>

          {/* Favorite Button */}
          <button
            onClick={() => toggleFavorite(property.id)}
            title={isFav ? 'Bỏ lưu tin' : 'Lưu tin yêu thích'}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition shadow-md ${
              isFav 
                ? 'bg-rose-600 text-white' 
                : 'bg-white/90 text-slate-700 hover:bg-white hover:text-rose-600'
            }`}
          >
            <i className={`fa-solid fa-heart ${isFav ? 'text-white' : 'text-slate-600'}`}></i>
          </button>
        </div>

        {/* Bottom Image Stats (Image count, views) */}
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white text-xs pointer-events-none">
          <span className="bg-black/50 px-2 py-0.5 rounded-md text-[11px] backdrop-blur-sm">
            <i className="fa-solid fa-camera mr-1"></i> {safeImages.length} ảnh
          </span>
          <span className="bg-black/50 px-2 py-0.5 rounded-md text-[11px] backdrop-blur-sm">
            <i className="fa-regular fa-clock mr-1"></i> {timeAgo(property.publishedAt)}
          </span>
        </div>
      </div>

      {/* Property Details Content */}
      <div className={`p-4 flex-1 flex flex-col justify-between min-w-0 ${viewMode === 'list' ? 'md:min-h-[220px]' : ''}`}>
        <div>
          {/* Price & Area Highlight Row */}
          <div className="flex items-baseline justify-between gap-2 mb-1.5">
            <div className="flex items-baseline gap-1.5">
              <span className={`text-xl font-extrabold ${isDiamond ? 'text-red-600' : isGold ? 'text-amber-600' : 'text-emerald-700'}`}>
                {property.priceDisplay ? property.priceDisplay.replace(/Tỷ/g, 'tỷ') : ''}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                ({property.pricePerM2})
              </span>
            </div>

            <div className="text-sm font-bold text-slate-700">
              <i className="fa-solid fa-vector-square mr-1 text-slate-400"></i>
              {property.area} m²
            </div>
          </div>

          {/* Title with VIP typography */}
          <h3 className="mb-2">
            <Link 
              to={getPropertyPermalink(property)}
              className={`line-clamp-2 hover:underline transition block property-title-sentence ${vipPkg.titleClass}`}
            >
              {formatSentenceCase(property.title)}
            </Link>
          </h3>

          {/* Location Address */}
          <div className="text-xs text-slate-500 mb-3 flex items-center justify-between gap-1">
            <div className="flex items-center gap-1 line-clamp-1 truncate">
              <i className="fa-solid fa-location-dot text-emerald-600 shrink-0"></i>
              <span className="truncate">{property.district}, {property.city}</span>
            </div>
            {property.isAdministrativeMerged && (
              <span className="px-1.5 py-0.2 rounded bg-red-50 text-red-600 text-[10px] font-bold border border-red-200 shrink-0" title="Đã cập nhật theo đơn vị hành chính mới sau sáp nhập">
                Đ/c mới
              </span>
            )}
          </div>

          {/* Key Specs Pills (Bedrooms, Bathrooms, Direction, Legal) */}
          <div className="flex flex-wrap items-center gap-2 mb-3 text-xs text-slate-600">
            {property.bedroom > 0 && (
              <span className="px-2 py-1 bg-slate-100 rounded-md flex items-center gap-1 font-medium">
                <i className="fa-solid fa-bed text-slate-400"></i>
                {property.bedroom} PN
              </span>
            )}
            {property.bathroom > 0 && (
              <span className="px-2 py-1 bg-slate-100 rounded-md flex items-center gap-1 font-medium">
                <i className="fa-solid fa-bath text-slate-400"></i>
                {property.bathroom} WC
              </span>
            )}
            {property.direction && (
              <span className="px-2 py-1 bg-slate-100 rounded-md flex items-center gap-1 font-medium">
                <i className="fa-regular fa-compass text-slate-400"></i>
                {property.direction}
              </span>
            )}
            {/* Tin đã xác thực: Đặt tại hàng thông số thay thế vị trí pháp lý cũ (Chỉ hiển thị khi đã xác thực, ẩn khi chưa xác thực) */}
            {Boolean(property.is_verified || property.isVerified || property.verification_status === 'verified' || property.verificationStatus === 'verified') && (
              <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md flex items-center gap-1 font-bold border border-emerald-200 shadow-2xs">
                <i className="fa-solid fa-circle-check text-emerald-600"></i>
                <span>Tin xác thực</span>
              </span>
            )}
          </div>
        </div>

        {/* Author / Broker Contact Box & Action Buttons */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            {/* Broker Avatar & Name */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <SeoImage
                src={safeAuthor.avatar}
                propertyTitle={property.title}
                type="agent"
                customContext={safeAuthor.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
              />
              <div className="leading-tight min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1 min-w-0">
                  <span className="truncate block" title={safeAuthor.fullNameWithRole}>{safeAuthor.name}</span>
                  {safeAuthor.isVerified && (
                    <i className="fa-solid fa-circle-check text-blue-500 text-[11px] shrink-0" title={`${safeAuthor.fullNameWithRole} đã xác thực`}></i>
                  )}
                </div>
                {safeAuthor.title ? (
                  <div className="text-[10px] text-slate-400 truncate" title={safeAuthor.title}>
                    {safeAuthor.title}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Direct Call / Zalo Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Link
                href={`tel:${safeAuthor.phone.replace(/\s+/g, '')}`}
                onClick={(e) => e.stopPropagation()}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition shrink-0 whitespace-nowrap ${
                  isDiamond 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : isGold
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
                title={`Gọi ngay: ${safeAuthor.phone}`}
              >
                <i className="fa-solid fa-phone text-[11px] shrink-0"></i>
                <span className="hidden sm:inline whitespace-nowrap">{safeAuthor.phone}</span>
                <span className="sm:hidden whitespace-nowrap">Gọi</span>
              </Link>

              <Link
                href={`https://zalo.me/${safeAuthor.zalo}`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="px-2.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition shrink-0 whitespace-nowrap"
                title="Chat Zalo ngay"
              >
                <span>Zalo</span>
              </Link>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}
