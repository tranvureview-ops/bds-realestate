'use client';

import React, { useState, useEffect } from 'react';
import { Link } from '../router/RouterContext';
import { useRealEstate } from '../context/RealEstateContext';
import { getDailyQuotaStatus, getDailyClaims } from '../services/treasureHuntService';
import { getPropertyPermalink } from '../utils/permalink';

export default function TreasureHuntPage() {
  const { currentUser, properties } = useRealEstate();
  const [quota, setQuota] = useState({ count: 0, limit: 3, remaining: 3, isLimitReached: false });
  const [claimsToday, setClaimsToday] = useState([]);

  const userId = currentUser && currentUser.role !== 'guest' ? currentUser.id : null;
  const bonusBal = Number(currentUser?.bonusWalletBalance || 0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (userId) {
      setQuota(getDailyQuotaStatus(userId));
      setClaimsToday(getDailyClaims(userId));
    }
  }, [userId]);

  const totalEarnedToday = claimsToday.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

  // Lọc ra các bài viết tin đăng BĐS nổi bật để người dùng khám phá săn rương
  const sampleArticles = (properties || []).slice(0, 6);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Game',
    'name': 'Săn Hộp Quà Kho Báu Trong Bài Viết BĐS',
    'description': 'Khám phá các bài viết tin rao nhà đất để tìm rương kho báu, nhận tiền thưởng ngẫu nhiên từ 2.000đ đến 20.000đ cộng trực tiếp vào Ví Khuyến Mãi (Tối đa 3 hộp/ngày).',
    'url': 'https://datbiendanang.vn/trung-tam-phan-thuong/san-kho-bau-bds/'
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link to="/" className="hover:text-emerald-700 transition">Trang chủ</Link>
          <span>/</span>
          <Link to="/trung-tam-phan-thuong/" className="hover:text-emerald-700 transition">Trung tâm phần thưởng</Link>
          <span>/</span>
          <span className="text-slate-800 font-bold">Săn kho báu bài viết</span>
        </nav>

        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-rose-700 text-white p-6 sm:p-10 shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-amber-200">
              <i className="fa-solid fa-gift"></i>
              Săn Hộp Quà Trong Bài Viết BĐS
            </span>
            <h1 className="text-2xl sm:text-4xl font-black">
              Đọc Tin Rao - Mở Rương Tiền Thưởng Vào Ví
            </h1>
            <p className="text-white/90 text-xs sm:text-sm leading-relaxed">
              Các rương kho báu đang ẩn giấu ngẫu nhiên bên trong các bài viết tin đăng nhà đất. Hãy khám phá tin rao để săn hộp quà, tiền thưởng được <strong>cộng trực tiếp vào Ví Khuyến Mãi</strong>!
            </p>
          </div>

          <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-lg">
                <i className="fa-solid fa-wallet"></i>
              </div>
              <div>
                <div className="text-[11px] text-white/70 font-semibold">Ví Khuyến Mãi hiện có</div>
                <div className="text-xl font-black text-amber-300 font-mono">
                  +{bonusBal.toLocaleString('vi-VN')} đ
                </div>
              </div>
            </div>

            <Link
              to="/nha-dat-ban"
              className="px-5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs transition flex items-center gap-2 shadow-lg hover:bg-amber-50"
            >
              <span>Xem bài viết săn rương ngay</span>
              <i className="fa-solid fa-arrow-right text-[10px]"></i>
            </Link>
          </div>
        </div>

        {/* Progress & Quota Tracker */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Daily Limit */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl">
                <i className="fa-solid fa-box-open"></i>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800">
                1 Ngày 3 Hộp
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tiến độ hôm nay</div>
              <div className="text-2xl font-black text-slate-900 mt-0.5">
                {quota.count} / 3 <span className="text-sm font-semibold text-slate-500">hộp</span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${(quota.count / 3) * 100}%` }}
              ></div>
            </div>
            <div className="text-[11px] text-slate-500">
              {quota.isLimitReached ? '🎉 Bạn đã săn đủ 3 hộp quà hôm nay!' : `Còn lại ${quota.remaining} hộp quà có thể mở hôm nay.`}
            </div>
          </div>

          {/* Card 2: Earned Today */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl">
                <i className="fa-solid fa-hand-holding-dollar"></i>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800">
                Tiền tươi vào ví
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tiền thưởng hôm nay</div>
              <div className="text-2xl font-black text-emerald-600 font-mono mt-0.5">
                +{totalEarnedToday.toLocaleString('vi-VN')} đ
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Cộng thẳng vào Ví Khuyến Mãi sử dụng đăng tin hoặc đẩy tin TOP 1 ngay lập tức.
            </p>
          </div>

          {/* Card 3: Anti-Spam & Fair Play */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800">
                Chống Spam 100%
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cơ chế công bằng</div>
              <div className="text-sm font-black text-slate-800 mt-0.5">
                1 Hộp / 1 Bài Viết
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Mỗi tin đăng chỉ nhận 1 lần/ngày. Thời gian đọc tin tối thiểu 4s và giãn cách 20s để bảo vệ hệ thống.
            </p>
          </div>
        </div>

        {/* Probability Table (Bảng tỷ lệ người dùng yêu cầu) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <i className="fa-solid fa-chart-pie text-orange-500"></i>
                Bảng Tỷ Lệ Phân Bổ Tiền Thưởng Ngẫu Nhiên
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Tỷ lệ minh bạch 100%, tiền thưởng cộng trực tiếp vào Ví Khuyến Mãi ngay khi bấm mở hộp:
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-900 rounded-full shrink-0">
              Tối đa 20.000đ / hộp
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Tỷ Lệ 50%</div>
              <div className="text-xl font-black text-slate-900">2.000đ - 4.000đ</div>
              <div className="text-[11px] text-slate-500">Hạng May Mắn Đồng</div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Tỷ Lệ 25%</div>
              <div className="text-xl font-black text-slate-900">5.000đ - 10.000đ</div>
              <div className="text-[11px] text-slate-500">Hạng Bạc Rực Rỡ</div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Tỷ Lệ 15%</div>
              <div className="text-xl font-black text-slate-900">11.000đ - 15.000đ</div>
              <div className="text-[11px] text-slate-500">Hạng Vàng Phú Quý</div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Tỷ Lệ 10%</div>
              <div className="text-xl font-black text-slate-900">15.000đ - 20.000đ</div>
              <div className="text-[11px] text-slate-500">Hạng Kim Cương Đỉnh Cao</div>
            </div>
          </div>
        </div>

        {/* Claims History Today */}
        {claimsToday.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <i className="fa-solid fa-clock-rotate-left text-slate-500"></i>
              Lịch sử các rương đã mở hôm nay ({claimsToday.length}/3)
            </h3>
            <div className="divide-y divide-slate-100">
              {claimsToday.map((c, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold shrink-0">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-800 line-clamp-1">{c.propertyTitle}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(c.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-black text-emerald-600 font-mono shrink-0">
                    +{Number(c.amount).toLocaleString('vi-VN')} đ vào Ví KM
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Articles containing Gift Boxes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <i className="fa-solid fa-fire text-red-500"></i>
                Bài Viết Đang Chứa Hộp Quà Hôm Nay
              </h3>
              <p className="text-xs text-slate-500">
                Bấm vào bài viết bên dưới, cuộn xuống phần mô tả để mở rương kho báu:
              </p>
            </div>
            <Link to="/nha-dat-ban" className="text-xs font-bold text-emerald-600 hover:underline">
              Xem tất cả tin rao &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sampleArticles.map(p => {
              const link = getPropertyPermalink(p);
              return (
                <Link
                  key={p.id}
                  to={link}
                  className="bg-white rounded-2xl border border-slate-200/80 hover:border-amber-400 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={p.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=500&q=80'}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-2.5 left-2.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500 text-white shadow-sm flex items-center gap-1">
                      <i className="fa-solid fa-gift"></i> Có Rương Ẩn
                    </span>
                    <span className="absolute bottom-2.5 right-2.5 text-[11px] font-bold px-2 py-0.5 rounded bg-black/60 text-white">
                      {p.price}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition line-clamp-2">
                      {p.title}
                    </h4>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <i className="fa-solid fa-location-dot text-rose-500 text-[10px]"></i>
                      <span className="truncate">{p.district || p.location || 'Đà Nẵng'}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-amber-600">
                      <span>Khám phá & Săn rương</span>
                      <i className="fa-solid fa-arrow-right text-[10px] group-hover:translate-x-1 transition-transform"></i>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
