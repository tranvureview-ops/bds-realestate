'use client';

import React, { useState } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { Link, useRouter } from '../router/RouterContext';
import { VIP_PACKAGES } from '../data/mockData';
import { getPropertyPermalink, formatSentenceCase, formatTitleCase, toVietnameseSlug, getBrokerPermalink } from '../utils/permalink';
import { normalizePhone, formatPhoneNumber } from '../utils/authValidation';
import { isPropertyTreasureActive } from '../services/treasureHuntService';
import SeoImage from './SeoImage';
import BrokerProfileModal from './BrokerProfileModal';
import { 
  IconHeart, 
  IconCamera, 
  IconClock, 
  IconArea, 
  IconLocation, 
  IconBed, 
  IconBath, 
  IconCompass, 
  IconVerified, 
  IconPhone, 
  IconZaloDots 
} from './common/Icons';

export default function ListingCard({ property, viewMode = 'grid', priority = false }) {
  const { navigate } = useRouter();
  const [isBrokerModalOpen, setIsBrokerModalOpen] = useState(false);
  const { 
    favorites, 
    toggleFavorite, 
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
  const rawAuthorName = authorUser?.name || property.author?.name || property.contactName || 'Người đăng tin';
  const authorName = formatTitleCase(rawAuthorName);
  const authorTitle = `${authorRolePrefix} ${authorName}`;

  const isVerifiedAuthor = authorUser
    ? Boolean(authorUser.isVerified || authorUser.kycStatus === 'verified')
    : Boolean(property.author?.isVerified || property.author?.kycStatus === 'verified');

  const rawAvatar = authorUser?.avatar || property.author?.avatar || '/avatars/user-tran-van-vu.jpg';
  const cleanAvatar = (typeof rawAvatar === 'string' && (rawAvatar.startsWith('data:image') || rawAvatar.includes('photo-1573496359142-b8d87734a5a2')))
    ? '/avatars/user-tran-van-vu.jpg'
    : (rawAvatar || '/avatars/user-tran-van-vu.jpg');

  const safeAuthorTitle = isBroker
    ? (isVerifiedAuthor ? 'Môi giới chuyên nghiệp' : 'Môi Giới')
    : (authorUser?.roleName || property.author?.title || 'Khách tìm mua');

  const safeAuthor = {
    id: authorUser?.id || property.author?.id || null,
    name: authorName,
    fullNameWithRole: authorTitle,
    rolePrefix: authorRolePrefix,
    isBroker,
    phone: displayAuthorPhone,
    zalo: (authorUser?.phone || property.author?.zalo || property.author?.phone || property.contactPhone || '0908123456').replace(/\s+/g, ''),
    avatar: cleanAvatar,
    title: safeAuthorTitle,
    isVerified: isVerifiedAuthor
  };

  const brokerUrl = getBrokerPermalink(safeAuthor, usersList);

  const handleOpenBrokerModal = (e) => {
    if (e) {
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
      if (typeof e.preventDefault === 'function') e.preventDefault();
    }
    setIsBrokerModalOpen(true);
  };

  const isFav = favorites.includes(property.id);

  // Kiểm tra bài viết có được gán nổi bật / có rương quà (còn thời hạn hợp lệ)
  const hasTreasure = Boolean(
    isPropertyTreasureActive(property, authorUser || property.author)
  );

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
        !priority ? 'content-visibility-card' : ''
      } ${
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
            priority={priority}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
          />
        </Link>

        {/* Gradient Overlay for photo contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5 z-[2]">
          {/* Demand Badge */}
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${property.demand === 'sale' ? 'bg-emerald-700 text-white' : 'bg-blue-600 text-white'}`}>
            {property.demand === 'sale' ? 'BÁN' : 'CHO THUÊ'}
          </span>

          {/* Tin đã xác thực: Dời lên sau nhãn Bán / Cho thuê */}
          {Boolean(property.is_verified || property.isVerified || property.verification_status === 'verified' || property.verificationStatus === 'verified') && (
            <span className="px-2 py-0.5 bg-emerald-600/95 text-white rounded-full text-[10px] font-bold shadow-sm backdrop-blur-xs flex items-center gap-1 border border-emerald-400/40">
              <IconVerified className="w-3 h-3 text-white" />
              <span>Xác thực</span>
            </span>
          )}
        </div>

        {/* Action Buttons Top Right: Featured Gift & Favorite */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-[2]">
          {/* Nổi bật / Hộp quà Săn Kho Báu */}
          {hasTreasure && (
            <div
              title="Tin nổi bật - Có hộp quà nhận thưởng!"
              aria-label="Tin nổi bật có hộp quà nhận thưởng"
              onClick={(e) => {
                if (e) {
                  if (typeof e.stopPropagation === 'function') e.stopPropagation();
                }
                navigate(getPropertyPermalink(property));
              }}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center text-xs shadow-md border border-amber-200/60 hover:scale-110 transition-transform duration-200 cursor-pointer group/gift"
            >
              <i className="fa-solid fa-gift text-sm text-slate-950 drop-shadow-xs group-hover/gift:rotate-12 transition-transform"></i>
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={() => toggleFavorite(property.id)}
            title={isFav ? 'Bỏ lưu tin' : 'Lưu tin yêu thích'}
            aria-label={isFav ? 'Bỏ lưu tin khỏi danh sách yêu thích' : 'Lưu tin vào danh sách yêu thích'}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition shadow-md ${
              isFav 
                ? 'bg-rose-600 text-white' 
                : 'bg-white/90 text-slate-700 hover:bg-white hover:text-rose-600'
            }`}
          >
            <IconHeart className={`w-4 h-4 ${isFav ? 'text-white' : 'text-slate-600'}`} filled={isFav} />
          </button>
        </div>

        {/* Bottom Image Stats (Image count, views) */}
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white text-xs pointer-events-none">
          <span className="bg-black/50 px-2 py-0.5 rounded-md text-[11px] backdrop-blur-sm flex items-center gap-1">
            <IconCamera className="w-3 h-3 text-white" />
            <span>{safeImages.length} ảnh</span>
          </span>
          <span className="bg-black/50 px-2 py-0.5 rounded-md text-[11px] backdrop-blur-sm flex items-center gap-1">
            <IconClock className="w-3 h-3 text-white" />
            <span>{timeAgo(property.publishedAt)}</span>
          </span>
        </div>
      </div>

      {/* Property Details Content */}
      <div className={`p-4 flex-1 flex flex-col justify-between min-w-0 ${viewMode === 'list' ? 'md:min-h-[220px]' : ''}`}>
        <div>
          {/* Price & Area Highlight Row */}
          <div className="flex items-baseline justify-between gap-2 mb-1.5">
            <div className="flex items-baseline gap-1.5">
              <span className={`text-xl font-extrabold ${isDiamond ? 'text-red-700' : isGold ? 'text-amber-800' : 'text-emerald-700'}`}>
                {property.priceDisplay ? property.priceDisplay.replace(/Tỷ/g, 'tỷ').replace(/Triệu\/tháng/gi, 'tr/tháng').replace(/triệu\/tháng/gi, 'tr/tháng') : ''}
              </span>
              <span className="text-xs text-slate-600 font-semibold">
                ({property.pricePerM2})
              </span>
            </div>

            <div className="text-sm font-bold text-slate-700 flex items-center gap-1">
              <IconArea className="w-3.5 h-3.5 text-slate-400" />
              <span>{property.area}m²</span>
            </div>
          </div>

          {/* Title with VIP typography */}
          <h3 className="mb-2">
            <Link 
              to={getPropertyPermalink(property)}
              className={`line-clamp-3 hover:underline transition property-title-sentence leading-snug font-bold ${(vipPkg.titleClass || '').replace(/\btext-amber-600\b/g, 'text-amber-800').replace(/\btext-lg\b/g, 'text-sm sm:text-base').replace(/\bfont-extrabold\b/g, 'font-bold')}`}
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {formatSentenceCase(property.title)}
            </Link>
          </h3>

          {/* Location Address */}
          <div className="text-xs text-slate-600 mb-3 flex items-center justify-between gap-1">
            <div className="flex items-center gap-1 line-clamp-1 truncate">
              <IconLocation className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
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
                <IconBed className="w-3.5 h-3.5 text-slate-400" />
                <span>{property.bedroom} PN</span>
              </span>
            )}
            {property.bathroom > 0 && (
              <span className="px-2 py-1 bg-slate-100 rounded-md flex items-center gap-1 font-medium">
                <IconBath className="w-3.5 h-3.5 text-slate-400" />
                <span>{property.bathroom} WC</span>
              </span>
            )}
            {property.direction && (
              <span className="px-2 py-1 bg-slate-100 rounded-md flex items-center gap-1 font-medium">
                <IconCompass className="w-3.5 h-3.5 text-slate-400" />
                <span>{property.direction}</span>
              </span>
            )}
          </div>
        </div>

        {/* Author / Broker Contact Box & Action Buttons */}
        <div className="pt-2.5 border-t border-slate-100 flex flex-col gap-2">
          {/* Row 1: Thông tin Môi giới / Người đăng (Đầy đủ họ tên & chức danh, không bị cắt cụt) */}
          <Link
            href={brokerUrl}
            rel="nofollow"
            onClick={handleOpenBrokerModal}
            className="flex items-center gap-2.5 min-w-0 cursor-pointer group/broker py-0.5"
            title={`Xem hồ sơ ${safeAuthor.fullNameWithRole}`}
            aria-label={`Xem hồ sơ môi giới ${safeAuthor.name}`}
          >
            <div className="relative shrink-0">
              <SeoImage
                src={safeAuthor.avatar}
                propertyTitle={property.title}
                type="agent"
                customContext={safeAuthor.name}
                className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0 group-hover/broker:border-emerald-500 group-hover/broker:scale-105 transition shadow-2xs"
              />
            </div>
            <div className="leading-tight min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 min-w-0 group-hover/broker:text-emerald-700 transition">
                <span className="truncate block" title={safeAuthor.fullNameWithRole}>{safeAuthor.name}</span>
                {safeAuthor.isVerified && (
                  <IconVerified className="w-3.5 h-3.5 text-blue-500 shrink-0" title={`${safeAuthor.fullNameWithRole} đã xác thực`} />
                )}
              </div>
              {safeAuthor.title ? (
                <div className="text-[11px] text-slate-500 truncate group-hover/broker:text-slate-700 mt-0.5" title={safeAuthor.title}>
                  {safeAuthor.title}
                </div>
              ) : null}
            </div>
          </Link>

          {/* Row 2: Nút Gọi điện & Chat Zalo bố cục gọn gàng, chia 2 cột đều đặn */}
          <div className="grid grid-cols-2 gap-2 shrink-0">
            <Link
              href={`tel:${safeAuthor.phone.replace(/\s+/g, '')}`}
              onClick={(e) => e.stopPropagation()}
              className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition whitespace-nowrap ${
                isDiamond 
                  ? 'bg-red-700 hover:bg-red-800 text-white' 
                  : isGold
                    ? 'bg-amber-700 hover:bg-amber-800 text-white'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white'
              }`}
              title={`Gọi ngay: ${safeAuthor.phone}`}
              aria-label={`Gọi ngay số ${safeAuthor.phone} cho tin ${formatSentenceCase(property.title).slice(0, 45)}`}
            >
              <IconPhone className="w-3 h-3 shrink-0" />
              <span className="truncate">{safeAuthor.phone}</span>
            </Link>

            <Link
              href={`https://zalo.me/${safeAuthor.zalo || safeAuthor.phone.replace(/\s+/g, '')}`}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition whitespace-nowrap"
              title={`Chat Zalo: ${safeAuthor.zalo || safeAuthor.phone}`}
              aria-label={`Chat Zalo số ${safeAuthor.zalo || safeAuthor.phone} cho tin ${formatSentenceCase(property.title).slice(0, 45)}`}
            >
              <IconZaloDots className="w-3.5 h-3.5" />
              <span>Chat Zalo</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Modal Hồ Sơ Môi Giới Popup */}
      {isBrokerModalOpen && (
        <BrokerProfileModal
          isOpen={isBrokerModalOpen}
          onClose={() => setIsBrokerModalOpen(false)}
          author={safeAuthor}
          property={property}
        />
      )}
    </div>
  );
}
