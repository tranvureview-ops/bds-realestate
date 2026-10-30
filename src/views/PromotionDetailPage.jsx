'use client';

import React, { useState } from 'react';
import { PROMOTIONS_DATA, isPromotionExpired, formatPromoDate } from '../data/rewardData';
import { Link, useRouter } from '../router/RouterContext';
import { useRealEstate } from '../context/RealEstateContext';
import { SITE_URL } from '../utils/permalink';

// Helper render nội dung Thể lệ Markdown đẹp mắt, chuẩn giao diện sàn BĐS
function renderMarkdownContent(text) {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let currentList = [];

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="space-y-2 my-3 pl-1">
          {currentList.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0"></span>
              <span dangerouslySetInnerHTML={{ __html: item }} />
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  const formatBold = (str) => {
    return str.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }

    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={idx} className="text-base font-black text-slate-900 pt-5 pb-1.5 border-b border-slate-200/80 flex items-center gap-2">
          <i className="fa-solid fa-circle-check text-red-600 text-xs"></i>
          <span>{trimmed.replace(/^###\s+/, '')}</span>
        </h3>
      );
    } else if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={idx} className="text-lg font-black text-slate-900 pt-6 pb-2 border-b border-slate-300 flex items-center gap-2">
          <i className="fa-solid fa-gift text-red-600 text-sm"></i>
          <span>{trimmed.replace(/^##\s+/, '')}</span>
        </h2>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      currentList.push(formatBold(trimmed.replace(/^[-*]\s+/, '')));
    } else if (/^\d+\.\s+/.test(trimmed)) {
      flushList();
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      const num = numMatch ? numMatch[1] : '1';
      const rest = numMatch ? numMatch[2] : trimmed;
      elements.push(
        <div key={idx} className="flex items-start gap-3 my-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
          <span className="w-6 h-6 rounded-lg bg-red-600 text-white font-black text-xs flex items-center justify-center shrink-0">
            {num}
          </span>
          <span className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium pt-0.5" dangerouslySetInnerHTML={{ __html: formatBold(rest) }} />
        </div>
      );
    } else {
      flushList();
      elements.push(
        <p key={idx} className="text-xs sm:text-sm text-slate-700 leading-relaxed my-2" dangerouslySetInnerHTML={{ __html: formatBold(trimmed) }} />
      );
    }
  });

  flushList();
  return elements;
}

export default function PromotionDetailPage({ slug }) {
  const [copiedCode, setCopiedCode] = useState(false);
  const { showToast, rewardsConfig, systemConfig } = useRealEstate();
  const { navigate } = useRouter();

  const allPromos = rewardsConfig?.promotions || PROMOTIONS_DATA;
  const promo = allPromos.find(p => p.slug === slug);
  const isExpired = promo ? isPromotionExpired(promo) : false;
  const relatedPromos = allPromos.filter(p => p.slug !== slug).slice(0, 3);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    if (showToast) showToast(`Đã sao chép mã ${code}!`, 'success');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  if (!promo) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-2xl">
            <i className="fa-solid fa-clock-rotate-left"></i>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Chương trình ưu đãi này đã kết thúc
          </h1>
          <p className="text-slate-600 text-sm max-w-md mx-auto">
            Ưu đãi bạn đang tìm kiếm có thể đã hết thời gian áp dụng hoặc số lượng voucher có hạn. Mời bạn tham khảo các chương trình đang diễn ra khác dưới đây.
          </p>
          <Link
            to="/khuyen-mai/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition"
          >
            <i className="fa-solid fa-arrow-left"></i>
            <span>Về Trung tâm Khuyến mãi</span>
          </Link>

          {/* Related Promos Carousel */}
          <div className="pt-10 text-left">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Các khuyến mãi đang diễn ra</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedPromos.map(rp => (
                <Link
                  key={rp.id}
                  to={`/khuyen-mai/${rp.slug}/`}
                  className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-red-400 transition block"
                >
                  <img src={rp.thumbnail} alt={rp.title} className="w-full aspect-video rounded-xl object-cover mb-2" />
                  <div className="text-xs font-bold text-slate-900 line-clamp-2">{rp.title}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Schema Offer/Event
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    'name': promo.title,
    'description': promo.description,
    'priceCurrency': 'VND',
    'validThrough': promo.validUntil,
    'availability': 'https://schema.org/InStock',
    'url': `${(process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '')}/khuyen-mai/${promo.slug}/`
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link to="/" className="hover:text-emerald-700 transition">Trang chủ</Link>
          <span>/</span>
          <Link to="/khuyen-mai/" className="hover:text-emerald-700 transition">Khuyến mãi</Link>
          <span>/</span>
          <span className="text-slate-800 font-bold truncate max-w-[200px] sm:max-w-none">{promo.title}</span>
        </nav>

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Expired Warning Banner if expired */}
          {isExpired && (
            <div className="bg-rose-50 border-b-2 border-rose-200 p-4 sm:p-5 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 text-base shadow-xs">
                <i className="fa-solid fa-clock-rotate-left"></i>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-black text-rose-900">
                    Chương trình khuyến mãi này đã kết thúc
                  </h3>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-600 text-white">
                    Hết hiệu lực
                  </span>
                </div>
                <p className="text-xs text-rose-700 leading-relaxed">
                  Thời hạn áp dụng của ưu đãi này đã hết vào ngày <strong>{formatPromoDate(promo.validUntil)}</strong>. Mã voucher <strong>{promo.discountCode}</strong> hiện không còn kích hoạt được. Bạn vẫn có thể xem lại thể lệ chi tiết bên dưới.
                </p>
              </div>
            </div>
          )}

          <div className="relative aspect-video sm:aspect-[21/9] overflow-hidden">
            <img 
              src={promo.thumbnail} 
              alt={promo.title} 
              className={`w-full h-full object-cover ${isExpired ? 'grayscale contrast-75' : ''}`} 
            />

            {/* Original badge */}
            <span className={`absolute top-4 left-4 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md ${
              isExpired ? 'bg-slate-700 text-slate-200 opacity-90' : (promo.badgeColor || 'bg-red-500 text-white')
            }`}>
              {promo.badge}
            </span>

            {/* Expired sticker & stamp */}
            {isExpired && (
              <>
                <span className="absolute top-4 right-4 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full bg-rose-600 text-white shadow-lg flex items-center gap-1.5 animate-pulse">
                  <i className="fa-solid fa-ban"></i>
                  <span>ĐÃ HẾT HẠN</span>
                </span>

                <div className="absolute inset-0 bg-slate-950/35 flex items-center justify-center pointer-events-none">
                  <div className="border-2 border-dashed border-rose-500 bg-rose-950/90 text-rose-300 px-5 py-2 rounded-2xl font-black text-sm uppercase tracking-widest rotate-[-8deg] shadow-2xl flex items-center gap-2">
                    <i className="fa-solid fa-clock-rotate-left text-rose-400"></i>
                    <span>HẾT THỜI GIAN ÁP DỤNG</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="p-6 sm:p-10 space-y-6">
            <div>
              <span className={`text-xs font-bold uppercase tracking-wider ${isExpired ? 'text-slate-400' : 'text-red-600'}`}>
                {promo.categoryLabel}
              </span>
              <h1 className={`text-2xl sm:text-3xl font-black mt-1 leading-snug ${isExpired ? 'text-slate-700' : 'text-slate-900'}`}>
                {promo.title}
              </h1>
              <div className="flex items-center gap-4 text-xs font-medium mt-3 flex-wrap">
                <span className={`flex items-center gap-1.5 ${isExpired ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                  <i className={`fa-solid ${isExpired ? 'fa-calendar-xmark text-rose-500' : 'fa-calendar-check text-slate-400'}`}></i>
                  {isExpired ? 'Đã hết hạn vào ngày:' : 'Có hiệu lực đến:'} <strong>{formatPromoDate(promo.validUntil)}</strong>
                </span>
                <span className="flex items-center gap-1.5 text-slate-500">
                  <i className="fa-solid fa-shield-halved text-emerald-600"></i>
                  Chính thức từ {systemConfig?.brandShortName || 'Ban Quản Trị'}
                </span>
              </div>
            </div>

            {/* Voucher Box CTA */}
            <div className={`p-5 rounded-2xl border-2 border-dashed flex flex-col sm:flex-row items-center justify-between gap-4 ${
              isExpired 
                ? 'bg-slate-100 border-slate-300 text-slate-500' 
                : 'bg-gradient-to-r from-red-50 to-amber-50 border-red-200'
            }`}>
              <div>
                <div className={`text-xs font-bold uppercase tracking-wider ${isExpired ? 'text-slate-400' : 'text-red-700'}`}>
                  Mã Khuyến Mãi Áp Dụng
                </div>
                <div className={`text-2xl font-black tracking-wider mt-0.5 font-mono ${
                  isExpired ? 'line-through text-slate-400' : 'text-slate-900'
                }`}>
                  {promo.discountCode}
                </div>
                <div className="text-xs text-slate-500">
                  Giảm giá: <strong className={isExpired ? 'text-slate-500' : 'text-emerald-700'}>{promo.discountValue}</strong>
                  {isExpired && <span className="ml-2 text-rose-600 font-bold">(Đã ngừng kích hoạt)</span>}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {isExpired ? (
                  <>
                    <button
                      disabled
                      className="flex-1 sm:flex-none px-5 py-3 rounded-xl text-xs font-bold bg-slate-200 text-slate-400 flex items-center justify-center gap-2 cursor-not-allowed border border-slate-300"
                    >
                      <i className="fa-solid fa-ban"></i>
                      <span>Mã đã hết hạn</span>
                    </button>
                    <Link
                      to="/khuyen-mai/"
                      className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span>Khám phá ưu đãi khác</span>
                      <i className="fa-solid fa-arrow-right"></i>
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleCopy(promo.discountCode)}
                      className={`flex-1 sm:flex-none px-5 py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                        copiedCode 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-white border border-red-300 hover:border-red-500 text-red-600'
                      }`}
                    >
                      <i className={`fa-solid ${copiedCode ? 'fa-check' : 'fa-copy'}`}></i>
                      <span>{copiedCode ? 'Đã sao chép' : 'Sao chép mã'}</span>
                    </button>

                    <button
                      onClick={() => navigate(promo.category === 'nap-tien' ? '/nap-tien' : promo.category === 'goi-vip' ? '/bang-gia-tin-dang' : '/goi-hoi-vien')}
                      className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                      <span>Sử dụng ngay</span>
                      <i className="fa-solid fa-arrow-right"></i>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Content Details: Hiển thị Thể Lệ Chương Trình */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <i className="fa-solid fa-file-contract text-red-600"></i>
                  <span>Chi Tiết & Thể Lệ Chương Trình</span>
                </h2>
                {isExpired && (
                  <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                    Chương trình lưu trữ (Đã kết thúc)
                  </span>
                )}
              </div>

              <div className="bg-slate-50/70 p-6 sm:p-8 rounded-3xl border border-slate-200/80">
                {promo.content ? (
                  <div className="space-y-1">
                    {renderMarkdownContent(promo.content)}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Chưa có thông tin thể lệ chi tiết cho chương trình này. Vui lòng liên hệ bộ phận CSKH để được giải đáp.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Other Promos */}
        <div className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Các chương trình ưu đãi khác</h2>
            <Link to="/khuyen-mai/" className="text-xs font-bold text-red-600 hover:underline">
              Xem tất cả &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedPromos.map(rp => (
              <Link
                key={rp.id}
                to={`/khuyen-mai/${rp.slug}/`}
                className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-red-400 hover:shadow-md transition block group"
              >
                <img src={rp.thumbnail} alt={rp.title} className="w-full aspect-video rounded-xl object-cover mb-2.5 group-hover:scale-102 transition" />
                <div className="text-[10px] font-bold text-red-600 uppercase">{rp.categoryLabel}</div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-red-600 transition line-clamp-2 mt-1">{rp.title}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
