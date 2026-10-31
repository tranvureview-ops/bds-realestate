'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRealEstate } from '../context/RealEstateContext';
import { Link, useRouter } from '../router/RouterContext';
import { getPropertyPermalink, formatTitleCase } from '../utils/permalink';
import { normalizePhone } from '../utils/authValidation';

export default function BrokerProfileModal({
  isOpen,
  onClose,
  author,
  property,
  properties: propList,
  onSelectProperty
}) {
  const { properties: contextProperties, usersList } = useRealEstate();
  const { navigate } = useRouter();
  const [brokerFilterTab, setBrokerFilterTab] = useState('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Đóng bằng phím ESC và khóa scroll body khi mở modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (onClose) onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Lưu lại overflow cũ và khóa cuộn body
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  const allProperties = propList || contextProperties || [];

  // Chuẩn hóa thông tin tác giả
  const safeAuthor = author || {};
  const rawAuthorName = safeAuthor.name || 'Người đăng tin';
  const authorName = formatTitleCase(rawAuthorName);
  const authorTitle = safeAuthor.fullNameWithRole || (safeAuthor.rolePrefix ? `${safeAuthor.rolePrefix} ${authorName}` : authorName);
  const isBroker = safeAuthor.isBroker !== false;
  const isVerified = Boolean(safeAuthor.isVerified);
  const rating = safeAuthor.rating || '5.0';
  const avatar = (typeof safeAuthor.avatar === 'string' && (safeAuthor.avatar.startsWith('data:image') || safeAuthor.avatar.includes('photo-1573496359142-b8d87734a5a2')))
    ? '/avatars/user-tran-van-vu.jpg'
    : (safeAuthor.avatar || '/avatars/user-tran-van-vu.jpg');
  const phone = safeAuthor.phone || '0908 123 456';
  const cleanPhone = phone.replace(/\s+/g, '');
  const zalo = safeAuthor.zalo || cleanPhone;
  const authorTitleRole = isBroker ? (isVerified ? 'Môi giới chuyên nghiệp' : 'Môi Giới') : 'Khách tìm mua';

  // Lấy toàn bộ danh sách tin đăng thực tế của chuyên viên / môi giới này trên sàn
  const authorProperties = useMemo(() => {
    if (!allProperties || !Array.isArray(allProperties)) return [];
    const authorId = safeAuthor.id ? String(safeAuthor.id) : null;
    const authorPhone = normalizePhone(phone);
    const authorNameLower = authorName?.trim().toLowerCase();

    const hasMultipleWithSameName = (usersList || []).filter(u => (u.name || '').trim().toLowerCase() === authorNameLower).length > 1;

    return allProperties.filter(p => {
      if (p.isDeleted || p.status === 'trash' || p.status === 'rejected') return false;
      const pAuthorId = p.author?.id ? String(p.author.id) : (p.userId ? String(p.userId) : null);
      const pPhone = normalizePhone(p.author?.phone || p.contactPhone);
      const pName = (p.author?.name || p.contactName || '').trim().toLowerCase();

      // Tiêu chí 1: Khớp chính xác ID tác giả
      if (authorId && pAuthorId && authorId === pAuthorId) return true;

      // Tiêu chí 2: Khớp chính xác số điện thoại (duy nhất)
      if (authorPhone && pPhone && authorPhone.length >= 9 && authorPhone === pPhone) return true;

      // Tiêu chí 3: Chỉ khớp theo tên nếu hệ thống KHÔNG có ai trùng tên
      if (!hasMultipleWithSameName && authorNameLower && pName && authorNameLower === pName) return true;

      return false;
    });
  }, [allProperties, safeAuthor.id, phone, authorName, usersList]);

  // Helper nhận diện chuẩn BĐS Bán vs Cho Thuê
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

  // Danh sách tin đăng hiển thị theo bộ lọc tab trong Modal hồ sơ môi giới
  const filteredAuthorProperties = useMemo(() => {
    if (brokerFilterTab === 'sale') {
      return authorProperties.filter(isSaleProperty);
    }
    if (brokerFilterTab === 'rent') {
      return authorProperties.filter(isRentProperty);
    }
    return authorProperties;
  }, [authorProperties, brokerFilterTab]);

  if (!isOpen || !mounted) return null;

  const handlePropertyNavigate = (p) => {
    if (onClose) onClose();
    if (onSelectProperty) {
      onSelectProperty(p);
    } else {
      navigate(getPropertyPermalink(p));
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        e.stopPropagation();
        if (onClose) onClose();
      }}
    >
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-100 overflow-hidden my-4 sm:my-6 max-h-[92vh] flex flex-col relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onClose) onClose();
          }}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center transition cursor-pointer backdrop-blur-md"
          title="Đóng cửa sổ"
        >
          <i className="fa-solid fa-xmark text-sm"></i>
        </button>

        {/* Header Hero Cover của Môi Giới */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 text-white p-5 sm:p-7 relative shrink-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
            <div className="relative shrink-0">
              <img
                src={avatar}
                alt={authorName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-white shadow-xl bg-white"
              />
              {isVerified && (
                <span className="absolute -bottom-2 -right-2 bg-blue-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs shadow-lg border-2 border-white" title="Môi giới đã xác thực uy tín">
                  <i className="fa-solid fa-check"></i>
                </span>
              )}
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-black uppercase text-emerald-300 bg-white/10 px-2.5 py-0.5 rounded-full backdrop-blur-md">
                  {isBroker ? 'Hồ Sơ Chuyên Viên Môi Giới' : 'Hồ Sơ Khách Tìm Mua'}
                </span>
                {isVerified && (
                  <span className="text-[11px] font-bold text-sky-200 bg-sky-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <i className="fa-solid fa-circle-check text-sky-300"></i>
                    Đã xác thực CCCD/eKYC
                  </span>
                )}
              </div>

              <h3 className="text-2xl sm:text-3xl font-black truncate" title={authorTitle}>
                {authorTitle}
              </h3>

              <div className="flex items-center gap-2.5 text-xs text-white/80 flex-wrap">
                {authorTitleRole ? (
                  <>
                    <span>{authorTitleRole}</span>
                    <span>•</span>
                  </>
                ) : null}
                <span className="flex items-center gap-1 text-amber-300 font-bold">
                  <i className="fa-solid fa-star"></i>
                  <span>{rating} / 5.0</span>
                </span>
                <span>•</span>
                <span className="font-semibold text-emerald-200">
                  {authorProperties.length} tin đăng đang phụ trách
                </span>
              </div>

              {/* Badges / Thông tin hoạt động */}
              <div className="flex items-center gap-3 pt-1 text-[11px] text-white/70 flex-wrap">
                <span className="flex items-center gap-1">
                  <i className="fa-solid fa-map-location-dot text-emerald-400"></i>
                  <span>Khu vực: {property?.city || 'Đà Nẵng'}</span>
                </span>
                <span className="flex items-center gap-1">
                  <i className="fa-solid fa-bolt text-amber-400"></i>
                  <span>Phản hồi trong 5 phút</span>
                </span>
                <span className="flex items-center gap-1">
                  <i className="fa-solid fa-shield-halved text-sky-300"></i>
                  <span>Pháp lý minh bạch</span>
                </span>
              </div>
            </div>

            {/* Direct Action Buttons on Header */}
            <div className="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
              <a
                href={`tel:${cleanPhone}`}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95 cursor-pointer"
              >
                <i className="fa-solid fa-phone"></i>
                <span>Gọi {phone}</span>
              </a>

              <a
                href={`https://zalo.me/${zalo}`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95 cursor-pointer"
              >
                <i className="fa-solid fa-comment-dots"></i>
                <span>Chat Zalo</span>
              </a>
            </div>
          </div>
        </div>

        {/* Filter Tabs & Title */}
        <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <h4 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <i className="fa-solid fa-house-chimney text-emerald-600"></i>
              <span>Bất Động Sản Của {authorTitle}</span>
            </h4>
            <span className="text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
              {authorProperties.length} tin
            </span>
          </div>

          {/* Tabs Lọc */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setBrokerFilterTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                brokerFilterTab === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Tất cả ({authorProperties.length})
            </button>
            <button
              type="button"
              onClick={() => setBrokerFilterTab('sale')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                brokerFilterTab === 'sale'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Bán ({authorProperties.filter(isSaleProperty).length})
            </button>
            <button
              type="button"
              onClick={() => setBrokerFilterTab('rent')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                brokerFilterTab === 'rent'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Cho thuê ({authorProperties.filter(isRentProperty).length})
            </button>
          </div>
        </div>

        {/* Danh sách BĐS của Môi Giới */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1 space-y-3.5">
          {filteredAuthorProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAuthorProperties.map(p => {
                const isCurrent = property?.id && String(p.id) === String(property.id);
                const permalink = getPropertyPermalink(p);
                const isRent = isRentProperty(p);
                const imgUrl = Array.isArray(p.images) && p.images.length > 0 
                  ? p.images[0] 
                  : 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80';

                return (
                  <div
                    key={p.id}
                    className={`rounded-2xl border p-3 flex gap-3 transition hover:shadow-md relative bg-white ${
                      isCurrent 
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20' 
                        : 'border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    {/* Ảnh thu nhỏ */}
                    <Link
                      to={permalink}
                      prefetch={true}
                      onClick={() => handlePropertyNavigate(p)}
                      className="w-28 h-24 sm:w-32 sm:h-28 rounded-xl overflow-hidden shrink-0 relative bg-slate-100 block group/thumb cursor-pointer"
                      title={`Xem chi tiết: ${p.title}`}
                    >
                      <img
                        src={imgUrl}
                        alt={p.title}
                        className="w-full h-full object-cover transition group-hover/thumb:scale-105 duration-300"
                        loading="lazy"
                      />
                      {p.vipPackageId && p.vipPackageId !== 'normal' && (
                        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-black uppercase text-white bg-red-600 shadow-xs">
                          VIP
                        </span>
                      )}
                      <span className={`absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-black uppercase text-white shadow-xs ${
                        isRent ? 'bg-sky-600' : 'bg-emerald-600'
                      }`}>
                        {isRent ? 'Cho thuê' : 'Bán'}
                      </span>
                    </Link>

                    {/* Thông tin BĐS */}
                    <div className="min-w-0 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="text-sm font-black text-red-600 font-mono">
                          {p.priceDisplay || (p.price ? `${p.price} Tỷ` : 'Thỏa thuận')}
                        </div>

                        <Link
                          to={permalink}
                          prefetch={true}
                          onClick={() => handlePropertyNavigate(p)}
                          className="font-bold text-xs text-slate-800 hover:text-emerald-700 transition line-clamp-2 mt-0.5 leading-snug block cursor-pointer"
                          title={p.title}
                        >
                          {p.title}
                        </Link>
                      </div>

                      <div className="space-y-1 pt-1.5 border-t border-slate-100">
                        <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                          <i className="fa-solid fa-location-dot text-slate-400 text-[10px]"></i>
                          <span>{p.district ? `${p.district}, ` : ''}{p.city || 'Đà Nẵng'}</span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-600">
                          <span className="font-semibold">{p.area || 100} m²</span>
                          {isCurrent ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                              Đang xem tin này
                            </span>
                          ) : (
                            <Link
                              to={permalink}
                              prefetch={true}
                              onClick={() => handlePropertyNavigate(p)}
                              className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                            >
                              <span>Xem tin</span>
                              <i className="fa-solid fa-arrow-right text-[9px]"></i>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <i className="fa-solid fa-box-open text-3xl"></i>
              <p className="text-xs">Không có tin đăng nào phù hợp với bộ lọc này.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="truncate">
            Chuyên viên: <strong className="text-slate-800">{authorName}</strong> • SĐT: <strong className="text-slate-800">{phone}</strong>
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onClose) onClose();
            }}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
