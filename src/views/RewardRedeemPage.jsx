'use client';

import React, { useMemo } from 'react';
import { PROMO_WALLET_SERVICES } from '../data/rewardData';
import { Link, useRouter } from '../router/RouterContext';
import { useRealEstate } from '../context/RealEstateContext';
import { SITE_URL } from '../utils/permalink';

export default function RewardRedeemPage() {
  const { currentUser } = useRealEstate();
  const { navigate } = useRouter();

  const bonusBal = Number(currentUser?.bonusWalletBalance || 0);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    'name': 'Dịch Vụ Sử Dụng Ví Khuyến Mãi Bất Động Sản',
    'description': 'Sử dụng tiền trong Ví Khuyến Mãi để đăng tin, mua lượt đẩy tin TOP 1 và nâng cấp tin VIP.',
    'url': `${(process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '')}/trung-tam-phan-thuong/doi-qua/`
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link to="/" className="hover:text-emerald-700 transition">Trang chủ</Link>
          <span>/</span>
          <Link to="/trung-tam-phan-thuong/" className="hover:text-emerald-700 transition">Trung tâm phần thưởng</Link>
          <span>/</span>
          <span className="text-slate-800 font-bold">Sử dụng Ví Khuyến Mãi</span>
        </nav>

        {/* Header with Real Bonus Wallet Balance */}
        <div className="rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-900 text-white p-6 sm:p-10 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 min-h-[160px]">
          <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
              <i className="fa-solid fa-wallet text-amber-300"></i>
              Sử Dụng Tiền Thưởng Trực Tiếp
            </span>
            <h1 className="text-2xl sm:text-3xl font-black leading-tight">
              Đặc Quyền Sử Dụng Ví Khuyến Mãi
            </h1>
            <p className="text-white/80 text-xs sm:text-sm max-w-xl">
              Toàn bộ tiền thưởng từ Săn kho báu và Nhiệm vụ nằm sẵn trong <strong>Ví Khuyến Mãi</strong> của bạn. Bạn có thể sử dụng ngay để thanh toán các dịch vụ dưới đây:
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl flex items-center gap-4 shrink-0 shadow-lg min-h-[96px]">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center text-2xl font-bold shrink-0">
              <i className="fa-solid fa-money-bill-wave"></i>
            </div>
            <div>
              <div className="text-[10px] text-white/70 uppercase tracking-wider font-bold">Số dư Ví Khuyến Mãi</div>
              <div className="text-2xl font-black text-amber-300 font-mono tracking-tight tabular-nums">
                +{bonusBal.toLocaleString('vi-VN')} <span className="text-xs text-white">VNĐ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid where bonus wallet can be spent */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {PROMO_WALLET_SERVICES.map(srv => (
            <div
              key={srv.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between space-y-5"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                  <i className={srv.icon}></i>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{srv.title}</h3>
                  <div className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                    {srv.cost}
                  </div>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{srv.description}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <i className="fa-solid fa-circle-check text-emerald-600"></i>
                  <span>Trừ tự động từ Ví KM</span>
                </div>

                <button
                  onClick={() => navigate(srv.link)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <span>{srv.actionText}</span>
                  <i className="fa-solid fa-arrow-right text-[10px]"></i>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Info card */}
        <div className="p-6 bg-amber-50/70 border border-amber-200 rounded-3xl flex items-start gap-3.5 text-xs text-amber-900">
          <i className="fa-solid fa-lightbulb text-amber-600 text-base shrink-0 mt-0.5"></i>
          <div className="space-y-1">
            <div className="font-bold">Mẹo tối ưu chi phí quảng cáo tin rao:</div>
            <p className="text-amber-800/90 leading-relaxed">
              Bạn có thể làm nhiệm vụ hàng ngày và săn kho báu bài viết đều đặn để tích lũy tiền vào Ví Khuyến Mãi. Khi đăng tin mới hoặc mua gói đẩy tin TOP 1, hệ thống sẽ tự động ưu tiên khấu trừ từ <strong>Ví Khuyến Mãi trước</strong> rồi mới đến Ví Chính của bạn!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
