'use client';

import React from 'react';
import { Link } from '../router/RouterContext';
import { useRealEstate } from '../context/RealEstateContext';

export default function RewardCenterPage() {
  const { currentUser } = useRealEstate();

  const features = [
    {
      id: 'diem-danh',
      title: 'Điểm Danh 7 Ngày',
      description: 'Đăng nhập mỗi ngày nhận vòng quay may mắn, rương quà VIP và xu thưởng liên tiếp.',
      icon: 'fa-solid fa-calendar-check',
      color: 'from-amber-500 to-orange-500',
      badge: 'Hàng ngày',
      link: '/trung-tam-phan-thuong/diem-danh-7-ngay/'
    },
    {
      id: 'kho-bau',
      title: 'Săn Kho Báu BĐS',
      description: 'Mở rương kho báu ẩn tại các khu đô thị & dự án hot tại Đà Nẵng, Hội An, TP.HCM.',
      icon: 'fa-solid fa-gem',
      color: 'from-emerald-500 to-teal-600',
      badge: 'Hot Mini-game',
      link: '/trung-tam-phan-thuong/san-kho-bau-bds/'
    },
    {
      id: 'du-doan',
      title: 'Dự Đoán Giá BĐS',
      description: 'Trổ tài thẩm định giá thị trường các căn hộ, biệt thự để chia quỹ thưởng hàng triệu Xu.',
      icon: 'fa-solid fa-chart-line',
      color: 'from-blue-600 to-indigo-600',
      badge: 'Quỹ 10 Triệu Xu',
      link: '/trung-tam-phan-thuong/du-doan-gia-bds/'
    },
    {
      id: 'doi-qua',
      title: 'Cửa Hàng Đổi Quà',
      description: 'Quy đổi xu tích lũy lấy Voucher nạp tiền, lượt đẩy tin TOP 1 và mã giảm giá VIP.',
      icon: 'fa-solid fa-gift',
      color: 'from-rose-500 to-pink-600',
      badge: 'Đổi ngay',
      link: '/trung-tam-phan-thuong/doi-qua/'
    }
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    'name': 'Trung Tâm Phần Thưởng & Gamification Bất Động Sản',
    'description': 'Tham gia điểm danh 7 ngày, săn kho báu dự án và dự đoán giá BĐS để nhận hàng ngàn phần quà giá trị.',
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
              Khu Vực Tương Tác & Gamification
            </span>
            <h1 className="text-2xl sm:text-4xl font-black leading-tight">
              Trung Tâm Phần Thưởng Đất Biển Đà Nẵng
            </h1>
            <p className="text-white/80 text-sm leading-relaxed">
              Trải nghiệm các tính năng tương tác mới lạ: Điểm danh tích lũy, săn rương dự án, dự đoán giá nhà đất và đổi quà thả ga.
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-lg">
                <i className="fa-solid fa-coins"></i>
              </div>
              <div>
                <div className="text-[11px] text-white/70">Số dư xu của bạn</div>
                <div className="text-xl font-black text-amber-300">
                  {(currentUser ? 85000 : 0).toLocaleString('vi-VN')} <span className="text-xs text-white">Xu</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/nhiem-vu/"
                className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition flex items-center gap-2"
              >
                <i className="fa-solid fa-list-check"></i>
                <span>Làm nhiệm vụ kiếm Xu</span>
              </Link>
              <Link
                to="/trung-tam-phan-thuong/doi-qua/"
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition flex items-center gap-2 shadow-md"
              >
                <i className="fa-solid fa-gift"></i>
                <span>Đổi quà ngay</span>
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
                <span>Tham gia ngay</span>
                <i className="fa-solid fa-arrow-right"></i>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
