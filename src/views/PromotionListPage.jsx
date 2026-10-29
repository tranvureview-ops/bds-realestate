'use client';

import React, { useState } from 'react';
import { PROMOTIONS_DATA } from '../data/rewardData';
import { Link } from '../router/RouterContext';
import { useRealEstate } from '../context/RealEstateContext';

export default function PromotionListPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [copiedCode, setCopiedCode] = useState(null);
  const { showToast, rewardsConfig, systemConfig } = useRealEstate();
  const promoList = rewardsConfig?.promotions || PROMOTIONS_DATA;

  const categories = [
    { id: 'all', label: 'Tất cả khuyến mãi', icon: 'fa-solid fa-gift' },
    { id: 'nap-tien', label: 'Nạp tiền ví', icon: 'fa-solid fa-wallet' },
    { id: 'goi-vip', label: 'Gói tin VIP', icon: 'fa-solid fa-crown' },
    { id: 'hoi-vien', label: 'Hội viên Môi giới', icon: 'fa-solid fa-user-shield' }
  ];

  const filteredPromos = activeCategory === 'all' 
    ? promoList 
    : promoList.filter(p => p.category === activeCategory);

  const handleCopyCode = (code, e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    if (showToast) showToast(`Đã sao chép mã ưu đãi ${code}!`, 'success');
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Structured Data (JSON-LD) cho Google SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': 'Trung Tâm Khuyến Mãi Bất Động Sản',
    'description': `Tổng hợp các chương trình ưu đãi nạp tiền, chiết khấu tin VIP và gói hội viên môi giới trên ${systemConfig?.brandShortName || 'Sàn Bất Động Sản'}.`,
    'url': 'https://datbiendanang.vn/khuyen-mai/',
    'mainEntity': {
      '@type': 'OfferCatalog',
      'name': 'Danh mục ưu đãi dịch vụ BĐS',
      'itemListElement': PROMOTIONS_DATA.map((promo, idx) => ({
        '@type': 'Offer',
        'position': idx + 1,
        'name': promo.title,
        'description': promo.description,
        'url': `https://datbiendanang.vn/khuyen-mai/${promo.slug}/`
      }))
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link to="/" className="hover:text-emerald-700 transition">Trang chủ</Link>
          <span>/</span>
          <span className="text-slate-800 font-bold">Khuyến mãi</span>
        </nav>

        {/* Hero Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white p-6 sm:p-10 shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
              <i className="fa-solid fa-sparkles text-amber-300"></i>
              Ưu Đãi Độc Quyền 2026
            </span>
            <h1 className="text-2xl sm:text-4xl font-black leading-tight">
              Trung Tâm Khuyến Mãi & Voucher Bất Động Sản
            </h1>
            <p className="text-white/90 text-sm sm:text-base leading-relaxed">
              Nhận voucher nạp tiền, chiết khấu đẩy tin VIP và các đặc quyền hội viên dành riêng cho nhà môi giới và chính chủ.
            </p>
          </div>
          <div className="absolute right-[-20px] bottom-[-20px] opacity-20 pointer-events-none hidden md:block">
            <i className="fa-solid fa-tags text-[240px]"></i>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap shadow-xs ${
                activeCategory === cat.id
                  ? 'bg-red-600 text-white shadow-red-200'
                  : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <i className={`${cat.icon} text-xs`}></i>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Promo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPromos.map(promo => (
            <div
              key={promo.id}
              className="bg-white rounded-3xl border border-slate-200/80 hover:border-red-400 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={promo.thumbnail}
                  alt={promo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className={`absolute top-3 left-3 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md ${promo.badgeColor}`}>
                  {promo.badge}
                </span>
                <span className="absolute bottom-3 left-3 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-white">
                  Hạn dùng: {promo.validUntil}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-[11px] font-bold text-red-600 uppercase tracking-wider">
                    {promo.categoryLabel}
                  </div>
                  <h2 className="text-base font-bold text-slate-900 group-hover:text-red-600 transition line-clamp-2 mt-1">
                    {promo.title}
                  </h2>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                    {promo.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-3">
                  {/* Voucher code box */}
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Mã Voucher</div>
                      <div className="text-xs font-black text-slate-800 tracking-wider">{promo.discountCode}</div>
                    </div>
                    <button
                      onClick={(e) => handleCopyCode(promo.discountCode, e)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        copiedCode === promo.discountCode 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-white border border-slate-200 hover:border-red-500 text-slate-700 hover:text-red-600'
                      }`}
                    >
                      <i className={`fa-solid ${copiedCode === promo.discountCode ? 'fa-check' : 'fa-copy'} text-[11px]`}></i>
                      <span>{copiedCode === promo.discountCode ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>

                  <Link
                    to={`/khuyen-mai/${promo.slug}/`}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-red-600 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
                  >
                    <span>Xem chi tiết & Thể lệ</span>
                    <i className="fa-solid fa-arrow-right text-[10px]"></i>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
