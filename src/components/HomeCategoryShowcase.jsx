'use client';

import React from 'react';
import { Link } from '../router/RouterContext';

// 2 Mục Trọng Tâm Hàng Đầu (Trục chính thị trường)
const PRIMARY_PILLARS = [
  {
    title: 'Nhà Đất Bán',
    path: '/nha-dat-ban',
    badge: 'Toàn Quốc',
    icon: 'fa-solid fa-house-chimney',
    desc: 'Mua bán nhà đất chính chủ, sổ hồng riêng, định giá minh bạch',
    bgGradient: 'from-rose-500/10 via-red-500/5 to-transparent',
    iconBg: 'bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md shadow-red-500/20',
    borderColor: 'border-red-200/80 hover:border-red-400',
    tagColor: 'bg-red-50 text-red-600 border border-red-200/60'
  },
  {
    title: 'Nhà Đất Cho Thuê',
    path: '/nha-dat-cho-thue',
    badge: 'Giá Tốt',
    icon: 'fa-solid fa-key',
    desc: 'Căn hộ, nhà nguyên căn, phòng trọ & mặt bằng kinh doanh',
    bgGradient: 'from-blue-500/10 via-sky-500/5 to-transparent',
    iconBg: 'bg-gradient-to-br from-blue-600 to-sky-600 text-white shadow-md shadow-blue-500/20',
    borderColor: 'border-blue-200/80 hover:border-blue-400',
    tagColor: 'bg-blue-50 text-blue-600 border border-blue-200/60'
  }
];

// 10 Phân Khúc Bất Động Sản Chi Tiết
const SUB_CATEGORIES = [
  { title: 'Căn hộ chung cư', path: '/ban-can-ho-chung-cu', icon: 'fa-regular fa-building', countLabel: 'Mua bán căn hộ, chung cư đa dạng diện tích' },
  { title: 'Chung cư mini', path: '/ban-chung-cu-mini', icon: 'fa-solid fa-city', countLabel: 'Căn hộ mini, studio và căn hộ dịch vụ' },
  { title: 'Nhà riêng, nhà phố', path: '/ban-nha-rieng', icon: 'fa-solid fa-house', countLabel: 'Nhà ở riêng lẻ, nhà phố tại nhiều khu vực' },
  { title: 'Biệt thự, liền kề', path: '/ban-nha-biet-thu-lien-ke', icon: 'fa-solid fa-landmark', countLabel: 'Biệt thự và nhà liền kề trong khu đô thị' },
  { title: 'Nhà mặt phố', path: '/ban-nha-mat-pho', icon: 'fa-solid fa-shop', countLabel: 'Nhà mặt tiền, nhà phố kinh doanh' },
  { title: 'Shophouse', path: '/ban-shophouse', icon: 'fa-solid fa-store', countLabel: 'Nhà phố thương mại, mặt bằng đa công năng' },
  { title: 'Đất nền dự án', path: '/ban-dat-nen-du-an', icon: 'fa-solid fa-mountain-sun', countLabel: 'Đất nền trong các khu đô thị, dự án' },
  { title: 'Đất thổ cư', path: '/ban-dat', icon: 'fa-solid fa-map', countLabel: 'Đất ở, đất thổ cư tại các tỉnh thành' },
  { title: 'Trang trại, nghỉ dưỡng', path: '/ban-trang-trai-khu-nghi-duong', icon: 'fa-solid fa-tree', countLabel: 'Nhà vườn, trang trại và đất nghỉ dưỡng' },
  { title: 'Kho, nhà xưởng', path: '/ban-kho-nha-xuong', icon: 'fa-solid fa-warehouse', countLabel: 'Kho bãi, nhà xưởng và mặt bằng sản xuất' }
];

export default function HomeCategoryShowcase() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-2">
      <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-7 shadow-xs">
        
        {/* Header Section */}
        <div className="text-center pb-4 border-b border-slate-100">
          <div className="inline-flex items-center justify-center gap-2.5 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight text-center">
              Khám Phá Danh Mục Bất Động Sản
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-4xl mx-auto text-center font-normal">
            Bạn đang tìm kiếm thông tin mua bán nhà đất hay cho thuê bất động sản? Kênh Nhà Đất 24H mang đến hệ thống danh mục phong phú và cập nhật liên tục trên toàn quốc. Các tin đăng được phân loại khoa học theo loại hình (căn hộ chung cư, nhà riêng, nhà phố, đất nền, biệt thự, văn phòng, mặt bằng kinh doanh) và mục đích giao dịch. Hãy lựa chọn ngay danh mục bên dưới để tìm được sản phẩm ưng ý với mức giá tốt nhất!
          </p>
        </div>

        {/* 1. HAI DANH MỤC TRỌNG TÂM: Nhà Đất Bán & Nhà Đất Cho Thuê */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 mt-4">
          {PRIMARY_PILLARS.map((pillar) => (
            <Link
              key={pillar.path}
              to={pillar.path}
              className={`group relative rounded-2xl border ${pillar.borderColor} bg-gradient-to-r ${pillar.bgGradient} p-4 sm:p-5 flex items-center gap-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 overflow-hidden`}
            >
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${pillar.iconBg} flex items-center justify-center text-xl sm:text-2xl shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                <i className={pillar.icon}></i>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-red-600 transition-colors">
                    {pillar.title}
                  </h3>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${pillar.tagColor}`}>
                    {pillar.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-1 leading-normal font-medium">
                  {pillar.desc}
                </p>
              </div>

              <div className="w-8 h-8 rounded-full bg-white/80 border border-slate-200/80 text-slate-400 flex items-center justify-center text-xs group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 group-hover:translate-x-1 transition-all shrink-0">
                <i className="fa-solid fa-arrow-right"></i>
              </div>
            </Link>
          ))}
        </div>

        {/* 2. LƯỚI PHÂN KHÚC BẤT ĐỘNG SẢN CHI TIẾT */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3 mt-4">
          {SUB_CATEGORIES.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/70 bg-slate-50/60 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all duration-200 flex flex-col items-center text-center group min-h-[148px]"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white border border-slate-200/80 text-slate-700 flex items-center justify-center text-base sm:text-lg mb-2.5 group-hover:scale-110 group-hover:bg-red-50 group-hover:text-red-600 group-hover:border-red-200 transition-all shrink-0 shadow-xs">
                <i className={item.icon}></i>
              </div>
              <span className="font-extrabold text-[13px] sm:text-sm text-slate-900 group-hover:text-red-600 transition-colors line-clamp-1 leading-snug">
                {item.title}
              </span>
              <span className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed font-normal">
                {item.countLabel}
              </span>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
