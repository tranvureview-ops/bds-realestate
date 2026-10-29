'use client';

import React from 'react';
import { Link } from '../router/RouterContext';
import { useRealEstate } from '../context/RealEstateContext';

export default function RewardCenterPage() {
  const { currentUser, systemConfig } = useRealEstate();

  const features = [
    {
      id: 'diem-danh',
      title: 'Điểm Danh 7 Ngày',
      description: 'Đăng nhập mỗi ngày nhận tiền thưởng trực tiếp vào Ví Khuyến Mãi lên đến 50.000đ/tuần.',
      icon: 'fa-solid fa-calendar-check',
      color: 'from-amber-500 to-orange-500',
      badge: 'Thưởng tiền mỗi ngày',
      link: '/trung-tam-phan-thuong/diem-danh-7-ngay/'
    },
    {
      id: 'kho-bau',
      title: 'Săn Kho Báu BĐS',
      description: 'Mở rương kho báu ẩn tại các dự án hot nhận ngay 50.000đ - 100.000đ vào Ví Khuyến Mãi.',
      icon: 'fa-solid fa-gem',
      color: 'from-emerald-500 to-teal-600',
      badge: 'Rương tiền tươi',
      link: '/trung-tam-phan-thuong/san-kho-bau-bds/'
    },
    {
      id: 'du-doan',
      title: 'Dự Đoán Giá BĐS',
      description: 'Trổ tài thẩm định giá thị trường các căn hộ, biệt thự để chia quỹ thưởng tiền mặt 8 triệu đồng.',
      icon: 'fa-solid fa-chart-line',
      color: 'from-blue-600 to-indigo-600',
      badge: 'Quỹ 8.000.000đ',
      link: '/trung-tam-phan-thuong/du-doan-gia-bds/'
    },
    {
      id: 'doi-qua',
      title: 'Đặc Quyền Ví Khuyến Mãi',
      description: 'Sử dụng tiền trong Ví Khuyến Mãi để đăng tin miễn phí, đẩy tin TOP 1 và nâng cấp VIP.',
      icon: 'fa-solid fa-wallet',
      color: 'from-rose-500 to-pink-600',
      badge: 'Dùng ngay',
      link: '/trung-tam-phan-thuong/doi-qua/'
    }
  ];

  const bonusBal = Number(currentUser?.bonusWalletBalance || 0);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    'name': 'Trung Tâm Phần Thưởng Tiền Mặt Ví Khuyến Mãi BĐS',
    'description': 'Tham gia điểm danh 7 ngày, săn kho báu dự án và dự đoán giá BĐS nhận tiền trực tiếp vào Ví Khuyến Mãi.',
    'url': 'https://datbiendanang.vn/trung-tam-phan-thuong/'
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
          <span className="text-slate-800 font-bold">Trung tâm phần thưởng</span>
        </nav>

        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-800 via-indigo-800 to-blue-900 text-white p-6 sm:p-10 shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-amber-300">
              <i className="fa-solid fa-trophy"></i>
              Khu Vực Tương Tác & Tiền Thưởng Ví KM
            </span>
            <h1 className="text-2xl sm:text-4xl font-black leading-tight">
              Trung Tâm Phần Thưởng {systemConfig?.brandShortName || 'Bất Động Sản'}
            </h1>
            <p className="text-white/80 text-sm leading-relaxed">
              Nhận tiền thưởng <strong>cộng trực tiếp vào Ví Khuyến Mãi</strong> qua Điểm danh mỗi ngày, Săn rương dự án và Dự đoán giá thị trường. Sử dụng để đăng tin và đẩy tin VIP hoàn toàn miễn phí.
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-lg">
                <i className="fa-solid fa-wallet"></i>
              </div>
              <div>
                <div className="text-[11px] text-white/70">Số dư Ví Khuyến Mãi của bạn</div>
                <div className="text-xl font-black text-amber-300 font-mono">
                  +{bonusBal.toLocaleString('vi-VN')} <span className="text-xs text-white">VNĐ</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/nhiem-vu/"
                className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition flex items-center gap-2"
              >
                <i className="fa-solid fa-list-check"></i>
                <span>Nhiệm vụ nhận tiền vào ví</span>
              </Link>
              <Link
                to="/dang-tin"
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition flex items-center gap-2 shadow-md"
              >
                <i className="fa-solid fa-circle-plus"></i>
                <span>Đăng tin bằng Ví KM</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map(f => (
            <Link
              key={f.id}
              to={f.link}
              className="bg-white rounded-3xl border border-slate-200/80 hover:border-indigo-400 p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} text-white flex items-center justify-center text-2xl shadow-lg group-hover:scale-105 transition-transform`}>
                    <i className={f.icon}></i>
                  </div>
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 uppercase tracking-wider">
                    {f.badge}
                  </span>
                </div>

                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition">
                    {f.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                <span>Tham gia nhận thưởng</span>
                <i className="fa-solid fa-arrow-right"></i>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
