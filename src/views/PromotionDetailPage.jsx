'use client';

import React, { useState } from 'react';
import { PROMOTIONS_DATA } from '../data/rewardData';
import { Link, useRouter } from '../router/RouterContext';
import { useRealEstate } from '../context/RealEstateContext';

export default function PromotionDetailPage({ slug }) {
  const [copiedCode, setCopiedCode] = useState(false);
  const { showToast, rewardsConfig } = useRealEstate();
  const { navigate } = useRouter();

  const allPromos = rewardsConfig?.promotions || PROMOTIONS_DATA;
  const promo = allPromos.find(p => p.slug === slug);
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
    'url': `https://datbiendanang.vn/khuyen-mai/${promo.slug}/`
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link to="/" className="hover:text-emerald-700 transition">Trang chủ</Link>
          <span>/</span>
          <Link to="/khuyen-mai/" className="hover:text-emerald-700 transition">Khuyến mãi</Link>
          <span>/</span>
          <span className="text-slate-800 font-bold truncate max-w-[200px] sm:max-w-none">{promo.title}</span>
        </nav>

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="relative aspect-video sm:aspect-[21/9] overflow-hidden">
            <img src={promo.thumbnail} alt={promo.title} className="w-full h-full object-cover" />
            <span className={`absolute top-4 left-4 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md ${promo.badgeColor}`}>
              {promo.badge}
            </span>
          </div>

          <div className="p-6 sm:p-10 space-y-6">
            <div>
              <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
                {promo.categoryLabel}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 leading-snug">
                {promo.title}
              </h1>
              <div className="flex items-center gap-4 text-xs text-slate-500 font-medium mt-3">
                <span className="flex items-center gap-1.5">
                  <i className="fa-solid fa-calendar-check text-slate-400"></i>
                  Có hiệu lực đến: <strong className="text-slate-800">{promo.validUntil}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="fa-solid fa-shield-halved text-emerald-600"></i>
                  Chính thức từ Đất Biển Đà Nẵng
                </span>
              </div>
            </div>

            {/* Voucher Box CTA */}
            <div className="p-5 bg-gradient-to-r from-red-50 to-amber-50 rounded-2xl border-2 border-dashed border-red-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-red-700 uppercase tracking-wider">Mã Khuyến Mãi Áp Dụng</div>
                <div className="text-2xl font-black text-slate-900 tracking-wider mt-0.5">{promo.discountCode}</div>
                <div className="text-xs text-slate-500">Giảm giá: <strong className="text-emerald-700">{promo.discountValue}</strong></div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
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
                  onClick={() => navigate(promo.category === 'nap-tien' ? '/nap-tien' : promo.category === 'goi-vip' ? '/bang-gia-vip' : '/goi-hoi-vien')}
                  className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <span>Sử dụng ngay</span>
                  <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>

            {/* Content Details */}
            <div className="prose max-w-none text-slate-700 text-sm leading-relaxed space-y-4 pt-4 border-t border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Chi tiết & Thể lệ chương trình</h2>
              <div className="whitespace-pre-line bg-slate-50 p-6 rounded-2xl border border-slate-100">
                {promo.content.trim()}
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
