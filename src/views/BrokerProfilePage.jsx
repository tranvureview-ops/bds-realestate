'use client';

import React, { useState, useMemo } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { Link } from '../router/RouterContext';
import ListingCard from '../components/ListingCard';
import { toVietnameseSlug } from '../utils/permalink';
import { normalizePhone, formatPhoneNumber } from '../utils/authValidation';

export default function BrokerProfilePage({ slug = '', initialProperties = [] }) {
  const { properties: contextProperties, usersList } = useRealEstate();
  const [activeTab, setActiveTab] = useState('all');

  const allProperties = (contextProperties && contextProperties.length > 0) 
    ? contextProperties 
    : initialProperties;

  // Tra cứu môi giới từ usersList hoặc từ danh sách tin đăng
  const matchedUser = useMemo(() => {
    if (!usersList || !Array.isArray(usersList)) return null;
    return usersList.find(u => {
      const uSlug = toVietnameseSlug(u.name || '');
      const uUsernameSlug = toVietnameseSlug(u.username || '');
      return uSlug === slug || uUsernameSlug === slug || String(u.id) === slug;
    });
  }, [usersList, slug]);

  // Nếu chưa có trong usersList, tra cứu tác giả đại diện từ tin đăng có slug tương ứng
  const matchedPropertyAuthor = useMemo(() => {
    if (!allProperties || !Array.isArray(allProperties)) return null;
    const prop = allProperties.find(p => {
      const pAuthorSlug = toVietnameseSlug(p.author?.name || p.contactName || '');
      return pAuthorSlug === slug;
    });
    return prop ? (prop.author || { name: prop.contactName, phone: prop.contactPhone }) : null;
  }, [allProperties, slug]);

  // Tái tạo họ tên dự phòng từ slug nếu không khớp dữ liệu tĩnh
  const fallbackName = useMemo(() => {
    if (!slug) return 'Chuyên Viên Môi Giới';
    return slug
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }, [slug]);

  const authorName = matchedUser?.name || matchedPropertyAuthor?.name || fallbackName;
  const rawRole = (matchedUser?.role || matchedPropertyAuthor?.role || '').toLowerCase();
  const rawRoleName = (matchedUser?.roleName || matchedPropertyAuthor?.title || '').toLowerCase();
  const isExplicitCustomer = rawRole === 'user' || rawRole === 'customer' || rawRole === 'buyer' ||
                             rawRoleName.includes('khách');

  const isBroker = !isExplicitCustomer;
  const authorRolePrefix = isBroker ? 'Môi Giới' : 'Khách tìm mua';
  const authorTitle = `${authorRolePrefix} ${authorName}`;

  const isVerified = Boolean(
    matchedUser?.isVerified ?? 
    matchedPropertyAuthor?.isVerified ?? 
    matchedUser?.kycStatus === 'verified' ?? 
    matchedPropertyAuthor?.kycStatus === 'verified' ?? 
    false
  );

  const rawPhone = matchedUser?.phone || matchedPropertyAuthor?.phone || '0908 123 456';
  const displayPhone = formatPhoneNumber(rawPhone);
  const cleanPhone = rawPhone.replace(/\s+/g, '');
  const zaloNumber = matchedUser?.phone || matchedPropertyAuthor?.zalo || matchedPropertyAuthor?.phone || cleanPhone;
  const avatarUrl = matchedUser?.avatar || matchedPropertyAuthor?.avatar || '/avatars/ai-preset-2.jpg';
  const brokerTitle = isVerified ? 'Môi giới chuyên nghiệp' : '';
  const rating = matchedPropertyAuthor?.rating || matchedUser?.rating || '5.0';

  // Lọc toàn bộ danh sách bất động sản của môi giới này
  const authorProperties = useMemo(() => {
    if (!allProperties || !Array.isArray(allProperties)) return [];
    const authorId = matchedUser?.id ? String(matchedUser.id) : (matchedPropertyAuthor?.id ? String(matchedPropertyAuthor.id) : null);
    const authorPhoneNorm = normalizePhone(rawPhone);
    const authorNameNorm = authorName.trim().toLowerCase();

    return allProperties.filter(p => {
      if (p.isDeleted || p.status === 'trash' || p.status === 'rejected') return false;
      const pAuthorId = p.author?.id ? String(p.author.id) : (p.userId ? String(p.userId) : null);
      const pPhone = normalizePhone(p.author?.phone || p.contactPhone);
      const pName = (p.author?.name || p.contactName || '').trim().toLowerCase();
      const pSlug = toVietnameseSlug(pName);

      return (authorId && pAuthorId && authorId === pAuthorId) ||
             (authorPhoneNorm && pPhone && authorPhoneNorm.length >= 9 && authorPhoneNorm === pPhone) ||
             (authorNameNorm && pName && authorNameNorm === pName) ||
             (pSlug && pSlug === slug);
    });
  }, [allProperties, matchedUser?.id, matchedPropertyAuthor?.id, rawPhone, authorName, slug]);

  const isRentProperty = (p) => {
    if (!p) return false;
    const d = String(p.demand || p.type || p.listingType || '').toLowerCase();
    if (d === 'rent' || d === 'cho-thue' || d === 'chothue' || d === 'thue') return true;
    const title = String(p.title || '').toLowerCase();
    if (title.startsWith('cho thuê') || title.includes('cho thuê') || title.includes('cho thue')) return true;
    const price = String(p.priceDisplay || '').toLowerCase();
    if (price.includes('/tháng') || price.includes('tháng') || price.includes('/thang')) return true;
    return false;
  };

  const isSaleProperty = (p) => !isRentProperty(p);

  const saleProperties = useMemo(() => authorProperties.filter(isSaleProperty), [authorProperties]);
  const rentProperties = useMemo(() => authorProperties.filter(isRentProperty), [authorProperties]);

  const displayedProperties = useMemo(() => {
    if (activeTab === 'sale') return saleProperties;
    if (activeTab === 'rent') return rentProperties;
    return authorProperties;
  }, [activeTab, saleProperties, rentProperties, authorProperties]);

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs sm:text-sm text-slate-500 flex-wrap">
          <Link to="/" className="hover:text-emerald-700 transition flex items-center gap-1 font-medium">
            <i className="fa-solid fa-house text-xs"></i>
            <span>Trang chủ</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-600 font-medium">Chuyên viên & Môi giới</span>
          <span className="text-slate-300">/</span>
          <span className="text-emerald-700 font-bold truncate max-w-[200px] sm:max-w-none">{authorName}</span>
        </nav>

        {/* Hero Profile Card */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden mb-10 border border-slate-800">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Avatar & Main Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative shrink-0">
                <img
                  src={avatarUrl}
                  alt={authorName}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white/90 shadow-2xl bg-white"
                />
                {isVerified && (
                  <span 
                    className="absolute -bottom-2 -right-2 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm shadow-xl border-2 border-white"
                    title="Môi giới đã xác thực CCCD/eKYC uy tín"
                  >
                    <i className="fa-solid fa-check"></i>
                  </span>
                )}
              </div>

              <div className="space-y-2 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-black uppercase text-emerald-300 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">
                    {isBroker ? 'Hồ Sơ Chuyên Viên Môi Giới' : 'Hồ Sơ Khách Tìm Mua'}
                  </span>
                  {isVerified && (
                    <span className="text-[11px] font-bold text-sky-200 bg-sky-500/20 px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-md">
                      <i className="fa-solid fa-circle-check text-sky-300"></i>
                      Đã xác thực CCCD/eKYC
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight truncate" title={authorTitle}>
                  {authorTitle}
                </h1>

                <div className="flex items-center gap-3 text-sm text-white/80 flex-wrap">
                  {brokerTitle ? (
                    <>
                      <span className="text-emerald-300 font-bold">{brokerTitle}</span>
                      <span className="text-white/40">•</span>
                    </>
                  ) : null}
                  <span className="flex items-center gap-1.5 text-amber-300 font-bold">
                    <i className="fa-solid fa-star"></i>
                    <span>{rating} / 5.0</span>
                  </span>
                  <span className="text-white/40">•</span>
                  <span className="font-semibold text-emerald-200">
                    {authorProperties.length} bất động sản đang quản lý
                  </span>
                </div>

                {/* Trust Badges */}
                <div className="flex items-center gap-4 pt-2 text-xs text-white/70 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <i className="fa-solid fa-map-location-dot text-emerald-400"></i>
                    <span>Khu vực: Đà Nẵng & Quảng Nam</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <i className="fa-solid fa-bolt text-amber-400"></i>
                    <span>Phản hồi trong 5 phút</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <i className="fa-solid fa-shield-halved text-sky-300"></i>
                    <span>Pháp lý minh bạch</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Contact Buttons */}
            <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto shrink-0 pt-3 md:pt-0">
              <a
                href={`tel:${cleanPhone}`}
                className="flex-1 md:flex-none px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-sm rounded-xl shadow-xl transition flex items-center justify-center gap-2 whitespace-nowrap active:scale-95"
                title={`Gọi ngay: ${displayPhone}`}
              >
                <i className="fa-solid fa-phone text-xs"></i>
                <span>Gọi {displayPhone}</span>
              </a>

              <a
                href={`https://zalo.me/${zaloNumber}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 md:flex-none px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 whitespace-nowrap active:scale-95"
                title="Chat Zalo trực tiếp"
              >
                <i className="fa-solid fa-comment-dots text-xs"></i>
                <span>Chat Zalo</span>
              </a>
            </div>

          </div>
        </div>

        {/* Listings Section */}
        <div className="space-y-6">
          
          {/* Header & Filter Tabs */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-house-chimney text-base"></i>
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Danh Sách Bất Động Sản Của {authorName}
                </h2>
                <p className="text-xs text-slate-500">
                  Tổng hợp {authorProperties.length} tin đăng chính chủ và ký gửi đang phụ trách
                </p>
              </div>
            </div>

            {/* Tabs Controller */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tất cả ({authorProperties.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('sale')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === 'sale'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bán ({saleProperties.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('rent')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === 'rent'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cho thuê ({rentProperties.length})
              </button>
            </div>
          </div>

          {/* Properties Grid */}
          {displayedProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedProperties.map(property => (
                <ListingCard 
                  key={property.id} 
                  property={property} 
                  viewMode="grid"
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center text-2xl">
                <i className="fa-solid fa-folder-open"></i>
              </div>
              <h3 className="text-base font-bold text-slate-700">
                Chưa có bất động sản nào trong danh mục này
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Chuyên viên hiện chưa đăng tải tin thuộc bộ lọc này hoặc tin đăng đã được giao dịch thành công.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Xem tất cả ({authorProperties.length}) tin đăng
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
